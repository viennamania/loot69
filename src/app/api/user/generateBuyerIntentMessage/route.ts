import { NextResponse, type NextRequest } from "next/server";

export const runtime = 'nodejs';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
const OPENAI_TEXT_FALLBACK_MODELS = process.env.OPENAI_TEXT_FALLBACK_MODELS || 'gpt-4o';

type BuyerIntentContext = {
  buyerWalletAddress?: string;
  sellerWalletAddress?: string;
  priceSettingMethod?: string;
  market?: string;
  price?: number | string;
  escrowBalance?: number | string;
};

const sanitizeText = (value: string) => {
  const flattened = value.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  return flattened.length > 80 ? `${flattened.slice(0, 80).trim()}` : flattened;
};

const buildPrompt = (data: BuyerIntentContext) => {
  const market = data.market || 'upbit';
  const priceMode = data.priceSettingMethod || 'market';
  const price = data.price ? `${data.price}` : '';
  const escrow = data.escrowBalance !== undefined ? `${data.escrowBalance}` : '';

  return [
    '구매자가 판매자에게 보내는 한국어 채팅 메시지를 1문장으로 작성하세요.',
    '조건:',
    '- 자연스럽고 공손한 톤',
    '- 구매 의사를 명확히 밝히고 다음 단계(거래 진행)를 묻기',
    '- 1문장, 80자 이내',
    '- 이모지, 따옴표, 줄바꿈 금지',
    '- 사람처럼 대화하듯이 작성',
    price ? '- 판매가격 숫자를 반드시 포함' : '- 판매가격 정보가 없으면 가격 언급 없이 작성',
    '참고 정보:',
    `- 가격방식: ${priceMode}`,
    `- 마켓: ${market}`,
    price ? `- 판매가: ${price}` : '',
    escrow ? `- 에스크로 잔고(USDT): ${escrow}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as BuyerIntentContext | null;
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
                'You write short Korean buyer intent messages for a USDT trade chat. Follow the constraints strictly.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.75,
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
    { error: lastError || 'Failed to generate buyer message' },
    { status: 500 },
  );
}
