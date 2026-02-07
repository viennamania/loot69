import { NextResponse, type NextRequest } from 'next/server';
import clientPromise, { dbName } from '@lib/mongodb';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const storecode = body.storecode || 'admin';
  const walletAddress: string = (body.walletAddress || '').trim();
  const limit = Math.min(Number(body.limit) || 3, 50);

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const rows = await client
      .db(dbName)
      .collection('sellerBankInfoHistory')
      .find({ storecode, walletAddress })
      .sort({ changedAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ result: rows });
  } catch (error) {
    console.error('getSellerBankInfoHistory error', error);
    return NextResponse.json({ error: 'Failed to fetch bank history' }, { status: 500 });
  }
}
