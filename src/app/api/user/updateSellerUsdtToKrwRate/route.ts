import { NextResponse, type NextRequest } from "next/server";

import {
  
	updateSellerUsdtToKrwRate,
  checkVaultWalletAddressExists,
  updateSellerVaultWallet,
} from '@lib/api/user';


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




export async function POST(request: NextRequest) {

  const body = await request.json();

  const { storecode, walletAddress, usdtToKrwRate } = body;

  //console.log('updateSellerUsdtToKrwRate body:', body);


  const result = await updateSellerUsdtToKrwRate({
    storecode: storecode,
    walletAddress: walletAddress,
    usdtToKrwRate: usdtToKrwRate,
  });


  return NextResponse.json({
    result,
  });
}
