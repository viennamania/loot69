import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Source = {
    id: 'upbit' | 'bithumb' | 'korbit';
    name: string;
    url: string;
    parse: (data: unknown) => number | null;
};

const toNumber = (value: unknown) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const SOURCES: Source[] = [
    {
        id: 'upbit',
        name: 'Upbit',
        url: 'https://api.upbit.com/v1/ticker?markets=KRW-USDT',
        parse: (data: any) => toNumber(data?.[0]?.trade_price),
    },
    {
        id: 'bithumb',
        name: 'Bithumb',
        url: 'https://api.bithumb.com/public/ticker/USDT_KRW',
        parse: (data: any) => toNumber(data?.data?.closing_price),
    },
    {
        id: 'korbit',
        name: 'Korbit',
        url: 'https://api.korbit.co.kr/v1/ticker?currency_pair=usdt_krw',
        parse: (data: any) => toNumber(data?.last),
    },
];

export async function GET() {
    const results = await Promise.all(
        SOURCES.map(async (source) => {
            try {
                const response = await fetch(source.url, { cache: 'no-store' });

                if (!response.ok) {
                    throw new Error(`Request failed: ${response.status}`);
                }

                const data = await response.json();
                const price = source.parse(data);

                if (price === null) {
                    throw new Error('Invalid price');
                }

                return { id: source.id, name: source.name, price };
            } catch (error) {
                return { id: source.id, name: source.name, price: null, error: 'unavailable' };
            }
        })
    );

    return NextResponse.json({
        updatedAt: new Date().toISOString(),
        items: results,
    });
}
