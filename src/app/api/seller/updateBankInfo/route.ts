import { NextResponse, type NextRequest } from 'next/server';
import clientPromise, { dbName } from '@lib/mongodb';
import { getOneByWalletAddress, updateSeller } from '@lib/api/user';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const storecode = body.storecode || 'admin';
  const walletAddress: string = (body.walletAddress || '').trim();
  const bankName: string = (body.bankName || '').trim();
  const accountNumber: string = (body.accountNumber || '').trim();
  const accountHolder: string = (body.accountHolder || '').trim();

  if (!walletAddress || !bankName || !accountNumber || !accountHolder) {
    return NextResponse.json(
      { error: 'walletAddress, bankName, accountNumber, accountHolder are required.' },
      { status: 400 },
    );
  }

  try {
    const existing = await getOneByWalletAddress(storecode, walletAddress);
    if (!existing) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const nextSeller = {
      ...(existing.seller || {}),
      bankInfo: {
        bankName,
        accountNumber,
        accountHolder,
      },
    };

    await updateSeller({
      storecode,
      walletAddress,
      seller: nextSeller,
    });

    // save history
    const client = await clientPromise;
    await client.db(dbName).collection('sellerBankInfoHistory').insertOne({
      storecode,
      walletAddress,
      bankInfo: {
        bankName,
        accountNumber,
        accountHolder,
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({ result: nextSeller });
  } catch (error) {
    console.error('updateBankInfo error', error);
    return NextResponse.json({ error: 'Failed to update bank info.' }, { status: 500 });
  }
}
