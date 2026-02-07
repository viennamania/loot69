import { NextResponse, type NextRequest } from "next/server";

import {
  
	updateSellerUsdtToKrwRate,
  checkVaultWalletAddressExists,
  updateSellerVaultWallet,
} from '@lib/api/user';
import clientPromise, { dbName } from '@lib/mongodb';


import {
  createThirdwebClient,
} from "thirdweb";

import {
  polygon,
 } from "thirdweb/chains";

import {
  privateKeyToAccount,
  smartWallet,
 } from "thirdweb/wallets";

 import { ethers } from "ethers";

export const runtime = 'nodejs';



export async function POST(request: NextRequest) {

  const body = await request.json();

  const { storecode = 'admin', walletAddress, usdtToKrwRate } = body;

  //console.log('updateSellerUsdtToKrwRate body:', body);

  if (!walletAddress || typeof usdtToKrwRate !== 'number' || usdtToKrwRate <= 0) {
    return NextResponse.json({ result: null, error: 'walletAddress and valid usdtToKrwRate required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const users = client.db(dbName).collection('users');
    const existing = await users.findOne({ storecode, walletAddress });
    const prevRate = existing?.seller?.usdtToKrwRate ?? null;

    const result = await updateSellerUsdtToKrwRate({
      storecode: storecode,
      walletAddress: walletAddress,
      usdtToKrwRate: usdtToKrwRate,
    });

    if (!result || result.modifiedCount === 0) {
      return NextResponse.json({ result: null, error: 'Failed to update rate' }, { status: 500 });
    }

    await client.db(dbName).collection('sellerRateHistory').insertOne({
      storecode,
      walletAddress,
      prevRate,
      nextRate: usdtToKrwRate,
      changedAt: new Date(),
    });

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error('updateSellerUsdtToKrwRate error', error);
    return NextResponse.json({ result: null, error: 'Server error updating rate' }, { status: 500 });
  }
}
