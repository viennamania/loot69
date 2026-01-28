import { NextResponse } from 'next/server';

const APPLICATION_ID = 'CCD67D05-55A6-4CA2-A6B1-187A5B62EC9D';
const API_BASE = `https://api-${APPLICATION_ID}.sendbird.com/v3`;
const REQUEST_TIMEOUT_MS = Number(process.env.SENDBIRD_REQUEST_TIMEOUT_MS ?? 8000);
const DEFAULT_WELCOME_MESSAGE = '고객님 안녕하세요. 무엇을 도와드릴까요?';

const fetchWithTimeout = async (url: string, init: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export async function POST(request: Request) {
  const apiToken = process.env.SENDBIRD_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json({ error: 'Sendbird API token is missing.' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as {
    channelUrl?: string;
    senderId?: string;
    message?: string;
  } | null;

  if (!body?.channelUrl || !body?.senderId) {
    return NextResponse.json({ error: 'channelUrl and senderId are required.' }, { status: 400 });
  }

  const message = body.message || DEFAULT_WELCOME_MESSAGE;

  try {
    const response = await fetchWithTimeout(
      `${API_BASE}/group_channels/${encodeURIComponent(body.channelUrl)}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Token': apiToken,
        },
        body: JSON.stringify({
          message_type: 'MESG',
          user_id: body.senderId,
          message,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return NextResponse.json(
        { error: error?.message || 'Failed to send welcome message' },
        { status: response.status },
      );
    }

    const data = await response.json().catch(() => null);
    return NextResponse.json({ ok: true, result: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send welcome message';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
