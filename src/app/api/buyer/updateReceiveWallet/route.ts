import { NextResponse, type NextRequest } from 'next/server';
import clientPromise, { dbName } from '@lib/mongodb';
import { getOneByWalletAddress } from '@lib/api/user';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const storecode = body.storecode || 'admin';
  const walletAddress: string = (body.walletAddress || '').trim();
  const receiveWalletAddress: string = (body.receiveWalletAddress || '').trim();

  if (!walletAddress || !receiveWalletAddress) {
    return NextResponse.json(
      { error: 'walletAddress and receiveWalletAddress are required.' },
      { status: 400 },
    );
  }

  try {
    const client = await clientPromise;
    const users = client.db(dbName).collection('users');

    const existing = await getOneByWalletAddress(storecode, walletAddress);
    if (!existing) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const nextBuyer = {
      ...(existing.buyer || {}),
      receiveWalletAddress,
    };

    await users.updateOne(
      { storecode, walletAddress },
      { $set: { buyer: nextBuyer } },
    );

    await client.db(dbName).collection('buyerReceiveWalletHistory').insertOne({
      storecode,
      walletAddress,
      receiveWalletAddress,
      updatedAt: new Date(),
    });

    return NextResponse.json({ result: nextBuyer });
  } catch (error) {
    console.error('buyer updateReceiveWallet error', error);
    return NextResponse.json({ error: 'Failed to update receive wallet.' }, { status: 500 });
  }
}
