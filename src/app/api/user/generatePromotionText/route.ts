import { NextResponse, type NextRequest } from "next/server";

export const runtime = 'nodejs';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
const OPENAI_TEXT_FALLBACK_MODELS = process.env.OPENAI_TEXT_FALLBACK_MODELS || 'gpt-4o';

type GenerateBody = {
  storecode?: string;
  walletAddress?: string;
  market?: string;
  priceSettingMethod?: string;
  price?: number | string;
};

const sanitizeText = (value: string) => {
  const flattened = value.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  return flattened.length > 80 ? `${flattened.slice(0, 80).trim()}` : flattened;
};

const buildPrompt = (data: GenerateBody) => {
  const market = data.market ? `${data.market}` : 'upbit';
  const priceMode = data.priceSettingMethod ? `${data.priceSettingMethod}` : 'market';
  const price = data.price ? `${data.price}` : '';

  return [
    'USDT 판매자용 한국어 홍보 문구를 1줄로 작성하세요.',
    '조건:',
    '- 1문장, 80자 이내',
    '- 이모지, 따옴표, 줄바꿈 금지',
    '- 과장 광고/수익 보장 표현 금지',
    `참고 정보: 마켓=${market}, 가격방식=${priceMode}${price ? `, 판매가=${price}` : ''}`,
  ].join('\n');
};

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
  }

  const body = (await request.json()) as GenerateBody;
  const prompt = buildPrompt(body);
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
          temperature: 0.8,
          max_completion_tokens: 120,
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
