import { NextResponse, type NextRequest } from "next/server";

import {
  getStoreByStorecode,
} from '@lib/api/store';

import {
	insertBuyOrder,
} from '@lib/api/order';

/*
import {
  getAgentByStorecode,
} from '@lib/api/agent';
*/


import {
  createThirdwebClient,
  eth_getTransactionByHash,
  getContract,
  sendAndConfirmTransaction,
  
  sendBatchTransaction,


} from "thirdweb";

import { ethers } from "ethers";


//import { polygonAmoy } from "thirdweb/chains";
import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
 } from "thirdweb/chains";

import {
  privateKeyToAccount,
  smartWallet,
  getWalletBalance,
  
 } from "thirdweb/wallets";


import {
  chain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,

  bscContractAddressMKRW,
} from "@/app/config/contractAddresses";


const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID || "";

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    walletAddress,
    nickname,
    usdtAmount,
    krwAmount,
    rate,
    privateSale,
    buyer,
    paymentMethod
  } = body;

  ////console.log("setBuyOrder =====  body", body);

  /*
  {
    lang: 'ko',
    storecode: 'agvdldan',
    walletAddress: '0x98773aF65AE660Be4751ddd09C4350906e9D88F3',
    nickname: 'mcmcmo',
    usdtAmount: 0.68,
    krwAmount: 1000,
    rate: 1480,
    privateSale: true,
    buyer: { depositBankName: '', depositName: '' }
  }
  */


  //getAgentByStorecode
  /*
  const agent = await getAgentByStorecode({
    storecode: storecode,
  });
  

  const agentcode = agent?.agentcode || null;
  */



  // api call
  /*
  try {

    const stableUrl = 'https://api.loot.menu';

    const apiUrl = `${stableUrl}/api/order/setBuyOrder`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
        walletAddress,
        nickname,
        usdtAmount,
        krwAmount,
        rate,
        privateSale,
        buyer
      }),
    });



    if (!response.ok) {
      
      console.error("Failed to insert buy order:", response.status, response.statusText);
      console.error("Response body:", await response.text());
    }

    const result = await response.json();
    console.log("setBuyOrder =====  result", result);

  } catch (error) {
    console.error("Error in setBuyOrder:", error);
  }

  */








  // check storecode exists and valid
  const store = await getStoreByStorecode({
    storecode: storecode,
  });

  if (!store) {
    return NextResponse.json({
      result: null,
      error: "Invalid storecode",
    }, { status: 400 });
  }

  // sellerWalletAddress, settlementWalletAddress, settlementFeeWalletAddress
  const sellerWalletAddress = store.sellerWalletAddress || null;
  const settlementWalletAddress = store.settlementWalletAddress || null;
  const settlementFeeWalletAddress = store.settlementFeeWalletAddress || null;
  const bankInfo = store.bankInfo || null;

  if (!sellerWalletAddress || !settlementWalletAddress || !settlementFeeWalletAddress) {
    return NextResponse.json({
      result: null,
      error: "Store wallet addresses not configured",
    }, { status: 500 });
  }

  // check walletAddress is valid, sellerWalletAddress, settlementWalletAddress is valid
  if (!ethers.utils.isAddress(walletAddress)) {
    return NextResponse.json({
      result: null,
      error: "Invalid wallet address",
    }, { status: 400 });
  }

  if (!ethers.utils.isAddress(sellerWalletAddress)) {
    return NextResponse.json({
      result: null,
      error: "Invalid seller wallet address",
    }, { status: 500 });
  }

  if (!ethers.utils.isAddress(settlementWalletAddress)) {
    return NextResponse.json({
      result: null,
      error: "Invalid settlement wallet address",
    }, { status: 500 });
  }

  if (!ethers.utils.isAddress(settlementFeeWalletAddress)) {
    return NextResponse.json({
      result: null,
      error: "Invalid settlement fee wallet address",
    }, { status: 500 });
  }


  // check usdtAmount is valid
  if (typeof usdtAmount !== "number" || usdtAmount <= 0) {
    return NextResponse.json({
      result: null,
      error: "Invalid USDT amount",
    }, { status: 400 });
  }

  // check bankInfo is exists
  if (!bankInfo) {
    return NextResponse.json({
      result: null,
      error: "Bank information not configured for the store",
    }, { status: 500 });
  }



  // check krwAmount is valid
  if (typeof krwAmount !== "number" || krwAmount <= 0) {
    return NextResponse.json({
      result: null,
      error: "Invalid KRW amount",
    }, { status: 400 });
  }

  // check rate is valid
  if (typeof rate !== "number" || rate <= 0) {
    return NextResponse.json({
      result: null,
      error: "Invalid rate",
    }, { status: 400 });
  }


  

  // generate escrow wallet

  const escrowWalletPrivateKey = ethers.Wallet.createRandom().privateKey;

  if (!escrowWalletPrivateKey) {
    return NextResponse.json({
      result: null,
      error: "Failed to generate escrow wallet private key",
    }, { status: 500 });
  }

  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY || "",
  });

  if (!client) {
    return NextResponse.json({
      result: null,
      error: "Failed to create Thirdweb client",
    }, { status: 500 });
  }

  const personalAccount = privateKeyToAccount({
    client,
    privateKey: escrowWalletPrivateKey,
  });


  if (!personalAccount) {
    return NextResponse.json({
      result: null,
      error: "Failed to create personal account",
    }, { status: 500 });
  }

  const wallet = smartWallet({
    chain: chain === 'ethereum' ? ethereum : chain === 'polygon' ? polygon : chain === 'arbitrum' ? arbitrum : chain === 'bsc' ? bsc : ethereum,
    sponsorGas: false,
  });


  // Connect the smart wallet
  const account = await wallet.connect({
    client: client,
    personalAccount: personalAccount,
  });

  if (!account) {
    return NextResponse.json({
      result: null,
      error: "Failed to connect smart wallet",
    }, { status: 500 });
  }

  const escrowWalletAddress = account.address;



  /*
  NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=0.1
NEXT_PUBLIC_PLATFORM_FEE_ADDRESS=0x77D98480b04404a3852ccaa31f2272CC94F35093
  */

  const platformFeePercentage = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || "0");
  const platformFeeAddress = process.env.NEXT_PUBLIC_PLATFORM_FEE_ADDRESS || "";

  const result = await insertBuyOrder({
    chain: chain,

    clientId: clientId,
    
    //agentcode: agentcode,
    storecode: storecode,
    
    walletAddress: walletAddress,


    nickname: nickname,
    usdtAmount: usdtAmount,
    krwAmount: krwAmount,
    rate: rate,
    privateSale: privateSale,
    buyer: buyer,
    paymentMethod: paymentMethod,

    escrowWallet: {
      address: escrowWalletAddress,
      privateKey: escrowWalletPrivateKey,
    },

    platformFee: {
      percentage: platformFeePercentage,
      address: platformFeeAddress,
    },
    
  });

  ///console.log("setBuyOrder =====  result", result);

  if (!result) {

    return NextResponse.json({
      result: null,
      error: "Failed to insert buy order",
    }
    , { status: 500 });

  }

 
  return NextResponse.json({

    result,
    
  });
  
}
