import { NextResponse, type NextRequest } from 'next/server';
import clientPromise, { dbName } from '@lib/mongodb';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const storecode = body.storecode || 'admin';
  const walletAddress: string = (body.walletAddress || '').trim();
  const limit = Math.min(Number(body.limit) || 3, 100);

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const history = await client
      .db(dbName)
      .collection('sellerStatusHistory')
      .find({ storecode, walletAddress })
      .sort({ changedAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ result: history });
  } catch (error) {
    console.error('getSellerStatusHistory error', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
