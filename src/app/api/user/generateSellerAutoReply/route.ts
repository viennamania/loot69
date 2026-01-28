import { NextResponse, type NextRequest } from "next/server";

export const runtime = 'nodejs';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
const OPENAI_TEXT_FALLBACK_MODELS = process.env.OPENAI_TEXT_FALLBACK_MODELS || 'gpt-4o';

type SellerReplyContext = {
  message?: string;
  priceSettingMethod?: string;
  market?: string;
  price?: number | string;
  escrowBalance?: number | string;
};

const sanitizeText = (value: string) => {
  const flattened = value.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  return flattened.length > 140 ? `${flattened.slice(0, 140).trim()}` : flattened;
};

const buildPrompt = (data: SellerReplyContext) => {
  const price = data.price ? `${data.price}` : '';
  const buyerMessage = data.message ? data.message.trim() : '';

  return [
    '당신은 USDT 판매자입니다. 구매자의 메시지에 친절하게 답변하세요.',
    '조건:',
    '- 한국어, 존댓말',
    '- 1~2문장, 140자 이내',
    '- 이모지, 따옴표, 줄바꿈 금지',
    '- 구매 진행을 도와주고 결제 의사를 자연스럽게 유도',
    price ? '- 판매가격 숫자를 반드시 포함 (원 단위)' : '- 가격이 없으면 "시장가"로 표현',
    buyerMessage ? `구매자 질문: ${buyerMessage}` : '',
    price ? `판매가격: ${price}원` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as SellerReplyContext | null;
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
                'You are a polite Korean USDT seller. Answer buyer questions and encourage purchase.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_completion_tokens: 180,
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
    { error: lastError || 'Failed to generate seller reply' },
    { status: 500 },
  );
}
