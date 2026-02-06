import { NextResponse, type NextRequest } from 'next/server';
import clientPromise from '@lib/mongodb';
import { dbName } from '@lib/mongodb';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const {
    escrowWalletAddress,
    limit = 300,
    page = 1,
    includeCancelled = true,
    includeCompleted = true,
  } = body || {};

  if (!escrowWalletAddress) {
    return NextResponse.json({ error: 'escrowWalletAddress is required' }, { status: 400 });
  }

  const safeLimit = Math.min(Number(limit) || 0, 500) || 100;
  const skip = Math.max((Number(page) || 1) - 1, 0) * safeLimit;

  const client = await clientPromise;
  const collection = client.db(dbName).collection('buyorders');

  const statusFilter =
    includeCancelled && includeCompleted
      ? {}
      : includeCancelled
      ? { status: { $ne: 'paymentConfirmed' } }
      : includeCompleted
      ? { status: { $ne: 'cancelled' } }
      : { status: { $nin: ['cancelled', 'paymentConfirmed'] } };

  const regexMatch = { $regex: `^${escrowWalletAddress}$`, $options: 'i' };

  const match = {
    privateSale: { $ne: true },
    ...statusFilter,
    $or: [
      { 'seller.escrowWalletAddress': regexMatch },
      { 'seller.walletAddress': regexMatch },
    ],
  };

  const cursor = collection.find(match).sort({ createdAt: -1 }).skip(skip).limit(safeLimit);
  const [orders, totalCount] = await Promise.all([
    cursor.toArray(),
    collection.countDocuments(match),
  ]);

  return NextResponse.json({ result: { orders, totalCount } });
}
