import { NextResponse, type NextRequest } from 'next/server';
import clientPromise, { dbName } from '@lib/mongodb';
import { getOneByWalletAddress } from '@lib/api/user';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const storecode = body.storecode || 'admin';
  const walletAddress: string = (body.walletAddress || '').trim();
  const bankName: string = (body.bankName || '').trim();
  const accountNumber: string = (body.accountNumber || '').trim();
  const accountHolder: string = (body.accountHolder || '').trim();

  if (!walletAddress || !accountHolder) {
    return NextResponse.json(
      { error: 'walletAddress and accountHolder are required.' },
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
      bankInfo: {
        ...(existing.buyer?.bankInfo || {}),
        bankName,
        accountNumber,
        accountHolder,
      },
    };

    await users.updateOne(
      { storecode, walletAddress },
      { $set: { buyer: nextBuyer } },
    );

    await client.db(dbName).collection('buyerBankInfoHistory').insertOne({
      storecode,
      walletAddress,
      bankInfo: nextBuyer.bankInfo,
      updatedAt: new Date(),
    });

    return NextResponse.json({ result: nextBuyer });
  } catch (error) {
    console.error('buyer updateBankInfo error', error);
    return NextResponse.json({ error: 'Failed to update buyer bank info.' }, { status: 500 });
  }
}
