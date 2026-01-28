import { NextResponse, type NextRequest } from "next/server";

import {
  updatePromotionText,
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

  const { storecode, walletAddress, promotionText } = body;

  //console.log('updateSellerUsdtToKrwRate body:', body);


  const result = await updatePromotionText({
    storecode: storecode,
    walletAddress: walletAddress,
    promotionText: promotionText,
  });


  return NextResponse.json({
    result,
  });
}
