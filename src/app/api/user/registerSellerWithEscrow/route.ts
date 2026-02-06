export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { createThirdwebClient, Engine } from 'thirdweb';

import {
  getOneByWalletAddress,
  updateOne,
  updateUserForSeller,
  insertOneVerified,
} from '@lib/api/user';
import clientPromise, { dbName } from '@lib/mongodb';

const STORECODE = 'admin';

const SENDBIRD_APP_ID =
  process.env.NEXT_PUBLIC_SENDBIRD_APP_ID ||
  process.env.SENDBIRD_APP_ID ||
  '';
const SENDBIRD_API_BASE = `https://api-${SENDBIRD_APP_ID}.sendbird.com/v3`;

const syncSendbirdUser = async (userId: string, nickname: string, profileUrl?: string | null) => {
  const apiToken = process.env.SENDBIRD_API_TOKEN;
  if (!apiToken || !SENDBIRD_APP_ID) {
    console.warn('Sendbird credentials missing; skip chat sync.');
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

    if (updateResponse.ok) return;

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
  const body = await request.json().catch(() => ({}));
  const storecode = body.storecode || STORECODE;
  const walletAddress: string = (body.walletAddress || '').trim();
  const nickname: string = (body.nickname || '').trim().toLowerCase();

  if (!walletAddress || !nickname) {
    return NextResponse.json(
      { error: 'walletAddress and nickname are required.' },
      { status: 400 },
    );
  }

  if (!/^[a-z0-9]{3,20}$/.test(nickname)) {
    return NextResponse.json(
      { error: 'nickname must be 3-20 chars, lowercase letters and numbers only.' },
      { status: 400 },
    );
  }

  // ensure user exists (create minimal verified user if missing)
  let existingUser = await getOneByWalletAddress(storecode, walletAddress);
  if (!existingUser) {
    await insertOneVerified({
      storecode,
      walletAddress,
      nickname,
      mobile: '',
      avatar: '',
      email: '',
    });
    existingUser = await getOneByWalletAddress(storecode, walletAddress);
  }

  if (!existingUser) {
    return NextResponse.json(
      { error: 'User not found or could not be created for the given wallet.' },
      { status: 404 },
    );
  }

  // If the stored walletAddress is empty, attach the provided address
  if (!existingUser.walletAddress) {
    const client = await clientPromise;
    await client
      .db(dbName)
      .collection('users')
      .updateOne(
        { storecode, _id: (existingUser as any)._id },
        { $set: { walletAddress } },
      );
  } else if (
    existingUser.walletAddress &&
    existingUser.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
  ) {
    return NextResponse.json(
      { error: 'Wallet address does not match existing user record.' },
      { status: 400 },
    );
  }

  // update user nickname (allow same nickname for same user, block duplicates across users)
  const currentNick = (existingUser.nickname || '').trim().toLowerCase();
  let updatedUser = existingUser;

  if (currentNick !== nickname) {
    const updated = await updateOne({
      storecode,
      walletAddress,
      nickname,
    });
    if (!updated) {
      return NextResponse.json(
        { error: 'Nickname already in use. Please choose another.' },
        { status: 400 },
      );
    }
    updatedUser = updated;
  }

  // refresh user to get latest seller state / avatar
  const refreshedUser = await getOneByWalletAddress(storecode, walletAddress);

  // Create server wallet (escrow) via thirdweb Engine if not already present
  const existingEscrow = refreshedUser?.seller?.escrowWalletAddress;
  let escrowWalletAddress: string | null = existingEscrow || null;

  if (!escrowWalletAddress) {
    const secretKey = process.env.THIRDWEB_SECRET_KEY || '';
    if (!secretKey) {
      return NextResponse.json({ error: 'THIRDWEB_SECRET_KEY is missing.' }, { status: 500 });
    }

    try {
      const client = createThirdwebClient({ secretKey });
      const serverWallet = await Engine.createServerWallet({
        client,
        label: `seller-${walletAddress}`,
      });
      escrowWalletAddress = serverWallet.address;
    } catch (error) {
      console.error('Engine createServerWallet failed', error);
      return NextResponse.json(
        { error: 'Failed to create escrow server wallet via thirdweb Engine.' },
        { status: 500 },
      );
    }
  }

  // persist seller escrow wallet
  if (escrowWalletAddress) {
    await updateUserForSeller({
      storecode,
      walletAddress,
      escrowWalletAddress,
    });
  }

  // sync Sendbird nickname/profile
  await syncSendbirdUser(walletAddress, nickname, refreshedUser?.avatar || '');

  return NextResponse.json({
    result: {
      walletAddress,
      nickname,
      escrowWalletAddress,
    },
  });
}
