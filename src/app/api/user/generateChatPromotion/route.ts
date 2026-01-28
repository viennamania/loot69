import { NextResponse, type NextRequest } from "next/server";

export const runtime = 'nodejs';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
const OPENAI_TEXT_FALLBACK_MODELS = process.env.OPENAI_TEXT_FALLBACK_MODELS || 'gpt-4o';

type PromotionContext = {
  storecode?: string;
  walletAddress?: string;
  priceSettingMethod?: string;
  market?: string;
  price?: number | string;
  escrowBalance?: number | string;
  promotionText?: string;
};

const sanitizeText = (value: string) => {
  const flattened = value.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  return flattened.length > 90 ? `${flattened.slice(0, 90).trim()}` : flattened;
};

const buildPrompt = (data: PromotionContext) => {
  const market = data.market || 'upbit';
  const priceMode = data.priceSettingMethod || 'market';
  const price = data.price ? `${data.price}` : '';
  const escrow = data.escrowBalance !== undefined ? `${data.escrowBalance}` : '';
  const seedText = data.promotionText ? data.promotionText.trim() : '';

  return [
    'USDT 판매자용 한국어 홍보 문구를 1줄로 작성하세요.',
    '조건:',
    '- 1문장, 90자 이내',
    '- 이모지, 따옴표, 줄바꿈 금지',
    '- 과장 광고/수익 보장 표현 금지',
    '- 사람처럼 자연스럽게 대화하듯이 작성',
    price ? '- 판매가격 숫자를 반드시 포함 (원 단위)' : '- 가격이 없으면 "시장가"로 표현',
    '참고 정보:',
    `- 가격방식: ${priceMode}`,
    `- 마켓: ${market}`,
    price ? `- 판매가: ${price}원` : '- 판매가: (없음)',
    escrow ? `- 에스크로 잔고(USDT): ${escrow}` : '',
    seedText ? `- 기존 홍보 문구: ${seedText}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as PromotionContext | null;
  const prompt = buildPrompt(body || {});
  const models = [OPENAI_TEXT_MODEL, ...OPENAI_TEXT_FALLBACK_MODELS.split(',')]
    .map((model) => model.trim())
    .filter(Boolean);

  let lastError: string | null = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You write short Korean promotional copy for a USDT seller. Follow the user constraints strictly.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.85,
          max_completion_tokens: 140,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        lastError = `OpenAI request failed (${model}): ${errorText || response.statusText}`;
        continue;
      }

      const data = await response.json();
      const text = sanitizeText(data?.choices?.[0]?.message?.content || '');
      if (!text) {
        lastError = `OpenAI returned empty content (${model})`;
        continue;
      }

      return NextResponse.json({ text });
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  return NextResponse.json(
    { error: lastError || 'Failed to generate promotion text' },
    { status: 500 },
  );
}
