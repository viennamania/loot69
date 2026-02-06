import { NextResponse, type NextRequest } from "next/server";

import {
  updateOne,
  getOneByWalletAddress,
} from '@lib/api/user';

const SENDBIRD_APP_ID = process.env.NEXT_PUBLIC_SENDBIRD_API_TOKEN || process.env.SENDBIRD_API_TOKEN || '';
const SENDBIRD_API_BASE = `https://api-${SENDBIRD_APP_ID}.sendbird.com/v3`;

const syncSendbirdUser = async (userId: string, nickname: string, profileUrl?: string | null) => {
  const apiToken = process.env.SENDBIRD_API_TOKEN;
  if (!apiToken) {
    console.warn('SENDBIRD_API_TOKEN is missing; skip Sendbird sync.');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Api-Token': apiToken,
  };

  try {
    const updateResponse = await fetch(
      `${SENDBIRD_API_BASE}/users/${encodeURIComponent(userId)}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nickname,
          ...(profileUrl ? { profile_url: profileUrl } : {}),
        }),
      },
    );

    if (updateResponse.ok) {
      return;
    }

    const error = await updateResponse.json().catch(() => null);
    const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';

    if (updateResponse.status === 404 || message.includes('not found') || message.includes('not exist')) {
      const createResponse = await fetch(`${SENDBIRD_API_BASE}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          nickname,
          profile_url: profileUrl,
        }),
      });
      if (!createResponse.ok) {
        const createError = await createResponse.json().catch(() => null);
        console.warn('Sendbird create user failed', createError?.message || createError);
      }
      return;
    }

    console.warn('Sendbird update user failed', error?.message || error);
  } catch (error) {
    console.warn('Sendbird sync error', error);
  }
};

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { storecode, walletAddress, nickname } = body;

  console.log("walletAddress", walletAddress);
  console.log("nickname", nickname);

  const result = await updateOne({
    storecode: storecode,
    walletAddress: walletAddress,
    nickname: nickname,
  });

  // Also update Sendbird nickname/profile for chat consistency
  if (result && nickname) {
    const existing = await getOneByWalletAddress(storecode, walletAddress);
    const profileUrl = existing?.avatar || '';
    await syncSendbirdUser(walletAddress, nickname, profileUrl);
  }

  return NextResponse.json({
    result,
  });
}
