import { NextResponse } from 'next/server';

const APPLICATION_ID = 'CCD67D05-55A6-4CA2-A6B1-187A5B62EC9D';
const API_BASE = `https://api-${APPLICATION_ID}.sendbird.com/v3`;
const DEFAULT_PROFILE_URL = 'https://crypto-ex-vienna.vercel.app/logo.png';

const getHeaders = () => {
  const apiToken = process.env.SENDBIRD_API_TOKEN;
  if (!apiToken) {
    return null;
  }
  return {
    'Content-Type': 'application/json',
    'Api-Token': apiToken,
  };
};

const createUser = async (
  headers: Record<string, string>,
  userId: string,
  nickname: string,
  profileUrl?: string,
) => {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user_id: userId,
      nickname,
      profile_url: profileUrl || DEFAULT_PROFILE_URL,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to create Sendbird user');
  }

  return response.json().catch(() => null);
};

export async function POST(request: Request) {
  const headers = getHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Sendbird API token is missing.' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as
    | { userId?: string; nickname?: string; profileUrl?: string }
    | null;

  if (!body?.userId || !body?.nickname) {
    return NextResponse.json({ error: 'userId and nickname are required.' }, { status: 400 });
  }

  const userId = String(body.userId).trim();
  const nickname = String(body.nickname).trim();
  const profileUrl = body.profileUrl;

  if (!userId || !nickname) {
    return NextResponse.json({ error: 'userId and nickname are required.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        nickname,
        ...(profileUrl ? { profile_url: profileUrl } : {}),
      }),
    });

    if (response.ok) {
      const data = await response.json().catch(() => null);
      return NextResponse.json({ ok: true, user: data });
    }

    const error = await response.json().catch(() => null);
    const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';

    if (response.status === 404 || message.includes('not found') || message.includes('not exist')) {
      const created = await createUser(headers, userId, nickname, profileUrl);
      return NextResponse.json({ ok: true, user: created, created: true });
    }

    return NextResponse.json({ error: error?.message || 'Failed to update Sendbird user.' }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update Sendbird user.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
