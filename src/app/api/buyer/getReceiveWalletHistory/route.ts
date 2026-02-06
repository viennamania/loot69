import { NextResponse, type NextRequest } from 'next/server';
import clientPromise, { dbName } from '@lib/mongodb';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const storecode = body.storecode || 'admin';
  const walletAddress: string = (body.walletAddress || '').trim();

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const list = await client
      .db(dbName)
      .collection('buyerReceiveWalletHistory')
      .find({ storecode, walletAddress })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ result: list });
  } catch (error) {
    console.error('buyer getReceiveWalletHistory error', error);
    return NextResponse.json({ error: 'Failed to load receive wallet history.' }, { status: 500 });
  }
}
