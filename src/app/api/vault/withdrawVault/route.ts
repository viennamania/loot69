import { NextResponse, type NextRequest } from "next/server";


import {
  getOneByWalletAddress,
} from '@lib/api/user';



import {
  createThirdwebClient,
  //Engine,
  getContract,
  sendAndConfirmTransaction,
  sendTransaction,
} from "thirdweb";

import {
  privateKeyToAccount,
  smartWallet,
} from "thirdweb/wallets";

import { balanceOf, transfer } from "thirdweb/extensions/erc20";
 

import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
} from "thirdweb/chains";

import {
  chain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,

  bscContractAddressMKRW,
} from "@/app/config/contractAddresses";
import { access } from "fs";


export async function POST(request: NextRequest) {

  const body = await request.json();
  
  const {
    storecode,
    walletAddress,
    withdrawAmount,
  } = body;


  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY || "",
  });

  if (!client) {
    return NextResponse.json({
      result: null,
      error: "Thirdweb client is not initialized",
    }, { status: 500 });
  }



  // getOneByWalletAddress
  const userData = await getOneByWalletAddress(storecode, walletAddress);


  if (!userData) {
      console.log("userData not found");
      return NextResponse.json({
        result: null,
        error: "User data not found",
      }, { status: 500 });
  }

  if (!userData.vaultWallet || !userData.vaultWallet.address) {
      console.log("userData.vaultWallet.address not found");
      return NextResponse.json({
        result: null,
        error: "User vault wallet address not found",
      }, { status: 500 });
  }

  console.log("userData.vaultWallet.address", userData.vaultWallet.address);



  const personalAccount = privateKeyToAccount({
      client: client,
      privateKey: userData.vaultWallet.privateKey,
  });

  if (!personalAccount) {
      console.log("personalAccount not found");
      return NextResponse.json({
        result: null,
        error: "Personal account not found",
      }, { status: 500 });
  }

  // cryptopay service polygon network
  const wallet = smartWallet({

      chain: chain === "ethereum" ? ethereum :
              chain === "polygon" ? polygon :
              chain === "arbitrum" ? arbitrum :
              chain === "bsc" ? bsc : arbitrum,

      ///factoryAddress: "0x655934C0B4bD79f52A2f7e6E60714175D5dd319b", // your own deployed account factory address
      sponsorGas: true,
  });


  // Connect the smart wallet
  const account = await wallet.connect({
      client: client,
      personalAccount: personalAccount,
  });
  if (!account) {
      console.log("account not found");
      return NextResponse.json({
        result: null,
        error: "Smart wallet account not found",
      }, { status: 500 });
  }



  const contract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    
    
    //chain: arbitrum,
    chain:  chain === "ethereum" ? ethereum :
            chain === "polygon" ? polygon :
            chain === "arbitrum" ? arbitrum :
            chain === "bsc" ? bsc : arbitrum,
  
  
  
    // the contract's address
    ///address: contractAddressArbitrum,

    address: chain === "ethereum" ? ethereumContractAddressUSDT :
            chain === "polygon" ? polygonContractAddressUSDT :
            chain === "arbitrum" ? arbitrumContractAddressUSDT :
            chain === "bsc" ? bscContractAddressUSDT : arbitrumContractAddressUSDT,


    // OPTIONAL: the contract's abi
    //abi: [...],
  });



  
  try {
    const transaction = transfer({
      contract,
      to: walletAddress,
      amount: withdrawAmount,
    });

    const transferResult = await sendTransaction({
      account: account,
      transaction: transaction,
    });

    const transactionHash = transferResult.transactionHash;

    console.log("Transaction sent:", transactionHash);


  
    return NextResponse.json({
      result: "Transfer successful",
      transactionHash,
    });

  } catch (error) {
    console.error("Error during transfer:", error);
    return NextResponse.json({
      result: null,
      error: "Transfer failed",
    }, { status: 500 });
  }

  /*
  Error during transfer: Error: Error sending transaction: {"kind":"thirdweb_engine","code":"engine_bad_request","error":"Missing vaultAccessToken or walletAccessToken or awsKms credentials","correlationId":"ab2a76e2-da4b-480b-a74c-157750512875"}
  */


}
