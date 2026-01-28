import { NextResponse } from 'next/server';

type StablecoinNewsItem = {
    id: string;
    title: string;
    source: string;
    publishedAt: string;
    tag: string;
    url: string;
    image: string;
};

type ParsedNewsItem = StablecoinNewsItem & {
    searchText: string;
};

type RssSource = {
    id: string;
    name: string;
    url: string;
};

const RSS_SOURCES: RssSource[] = [
    {
        id: 'coindesk',
        name: 'CoinDesk',
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml',
    },
];

const MAX_ITEMS = 10;
const REVALIDATE_SECONDS = 60 * 10;
const KOREAN_RE = /[가-힣]/;
const STABLECOIN_KEYWORDS = [
    'stablecoin',
    'stable coin',
    'usdt',
    'tether',
    'usdc',
    'circle',
    'dai',
    'pyusd',
    'fdusd',
    'usdd',
    'reserve',
    'backed',
    'peg',
    '스테이블',
    '테더',
    '서클',
];

const decodeEntities = (value: string) =>
    value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

const stripTags = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const unwrapCdata = (value: string) => {
    const match = value.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
    return match ? match[1] : value;
};

const extractTagRaw = (input: string, tag: string) => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const match = input.match(regex);
    if (!match) {
        return null;
    }
    return unwrapCdata(match[1].trim());
};

const extractTagText = (input: string, tag: string) => {
    const raw = extractTagRaw(input, tag);
    if (!raw) {
        return null;
    }
    return decodeEntities(stripTags(raw));
};

const extractAttribute = (input: string, tag: string, attribute: string) => {
    const regex = new RegExp(`<${tag}[^>]*\\s${attribute}=["']([^"']+)["'][^>]*>`, 'i');
    const match = input.match(regex);
    return match ? match[1] : null;
};

const extractImage = (itemXml: string, descriptionRaw: string | null) => {
    const mediaContent = extractAttribute(itemXml, 'media:content', 'url');
    if (mediaContent) {
        return mediaContent;
    }

    const mediaThumb = extractAttribute(itemXml, 'media:thumbnail', 'url');
    if (mediaThumb) {
        return mediaThumb;
    }

    const enclosureUrl = extractAttribute(itemXml, 'enclosure', 'url');
    const enclosureType = extractAttribute(itemXml, 'enclosure', 'type');
    if (enclosureUrl && (!enclosureType || enclosureType.startsWith('image/'))) {
        return enclosureUrl;
    }

    if (descriptionRaw) {
        const imgMatch = descriptionRaw.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
            return imgMatch[1];
        }
    }

    return null;
};

const parseDate = (value: string | null) => {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString();
};

const hasStablecoinKeyword = (value: string) => {
    const lowered = value.toLowerCase();
    return STABLECOIN_KEYWORDS.some((keyword) => lowered.includes(keyword));
};

const parseRss = (xml: string, source: RssSource): ParsedNewsItem[] => {
    const items: ParsedNewsItem[] = [];
    const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
    const itemMatches = xml.match(itemRegex) ?? [];

    itemMatches.forEach((itemXml, index) => {
        const title = extractTagText(itemXml, 'title') ?? '';
        const link = extractTagText(itemXml, 'link') ?? '';
        const guid = extractTagText(itemXml, 'guid');
        const pubDate = extractTagText(itemXml, 'pubDate') ?? extractTagText(itemXml, 'dc:date');
        const descriptionRaw =
            extractTagRaw(itemXml, 'description') ?? extractTagRaw(itemXml, 'content:encoded');
        const descriptionText = descriptionRaw ? decodeEntities(stripTags(descriptionRaw)) : '';
        const category = extractTagText(itemXml, 'category') ?? '스테이블코인';
        const image = extractImage(itemXml, descriptionRaw) ?? '/icon-market.png';
        const publishedAt = parseDate(pubDate) ?? new Date().toISOString();

        if (!title || !link) {
            return;
        }

        items.push({
            id: guid ?? `${link}-${index}`,
            title,
            source: source.name,
            publishedAt,
            tag: category,
            url: link,
            image,
            searchText: `${title} ${category} ${descriptionText}`.trim(),
        });
    });

    return items;
};

const prioritizeStablecoin = (items: ParsedNewsItem[]) => {
    const filtered = items.filter((item) => hasStablecoinKeyword(item.searchText));

    return filtered.length > 0 ? filtered : items;
};

const sortItems = (items: StablecoinNewsItem[]) =>
    items.sort((a, b) => {
        const aScore = KOREAN_RE.test(a.title) ? 1 : 0;
        const bScore = KOREAN_RE.test(b.title) ? 1 : 0;
        if (aScore !== bScore) {
            return bScore - aScore;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

export const revalidate = REVALIDATE_SECONDS;

export async function GET() {
    const results = await Promise.all(
        RSS_SOURCES.map(async (source) => {
            try {
                const response = await fetch(source.url, {
                    next: { revalidate: REVALIDATE_SECONDS },
                });

                if (!response.ok) {
                    return [];
                }

                const xml = await response.text();
                return parseRss(xml, source);
            } catch (error) {
                return [];
            }
        }),
    );

    const merged = results.flat();
    const stableItems = prioritizeStablecoin(merged);
    const uniqueByUrl = new Map<string, StablecoinNewsItem>();

    stableItems.forEach((item) => {
        if (!uniqueByUrl.has(item.url)) {
            const { searchText, ...trimmedItem } = item;
            uniqueByUrl.set(item.url, trimmedItem);
        }
    });

    const sorted = sortItems(Array.from(uniqueByUrl.values()));
    const trimmed = sorted.slice(0, MAX_ITEMS);

    return NextResponse.json(
        {
            items: trimmed,
            updatedAt: new Date().toISOString(),
        },
        {
            headers: {
                'Cache-Control': `s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=60`,
            },
        },
    );
}
