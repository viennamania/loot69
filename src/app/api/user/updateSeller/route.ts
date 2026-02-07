import { NextResponse, type NextRequest } from "next/server";

import {
  
	updateSellerStatus,
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




export async function POST(request: NextRequest) {

  const body = await request.json();

  const { storecode, walletAddress, nickname, sellerStatus, bankName, accountNumber, accountHolder } = body;

  //console.log("walletAddress", walletAddress);
  //console.log("sellerStatus", sellerStatus);



  // check vault wallet address, if not exist, create new smart wallet
  /*
  const vaultWalletExists = await checkVaultWalletAddressExists(storecode, walletAddress);

  if (!vaultWalletExists) {
    // create new smart wallet
    console.log("Creating new smart wallet for seller...");


    const userWalletPrivateKey = ethers.Wallet.createRandom().privateKey;

    if (!userWalletPrivateKey) {

      console.log("No userWalletPrivateKey");

      return NextResponse.json({
        result: null,
      });
    }


    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY || "",
    });

    if (!client) {

      console.log("No client");

      return NextResponse.json({
        result: null,
      });
    }


    const personalAccount = privateKeyToAccount({
      client,
      privateKey: userWalletPrivateKey,
    });


    if (!personalAccount) {

      console.log("No personalAccount");

      return NextResponse.json({
        result: null,
      });
    }

    const wallet = smartWallet({
      chain:  polygon ,
      sponsorGas: true,
    });


    // Connect the smart wallet
    const account = await wallet.connect({
      client: client,
      personalAccount: personalAccount,
    });

    if (!account) {

      console.log("No account");
      return NextResponse.json({
        result: null,
      });
    }
    


    const userWalletAddress = account.address;

    console.log("userWalletAddress", userWalletAddress);

    if (!userWalletAddress) {

      console.log("No userWalletAddress");

      return NextResponse.json({
        result: null,
      });
    }

    const vaultWallet = {
      address: userWalletAddress,
      privateKey: userWalletPrivateKey,
    }


    const result = await updateSellerVaultWallet({
      storecode: storecode,
      walletAddress: walletAddress,
      nickname: nickname,
      sellerStatus: sellerStatus,
      bankName: bankName,
      accountNumber: accountNumber,
      accountHolder: accountHolder,
      vaultWallet: vaultWallet,
    });

    console.log("Vault wallet created and updated for seller.");

    return NextResponse.json({

      result,
      
    });


  } else {


    const result = await updateSellerStatus({
      storecode: storecode,
      walletAddress: walletAddress,
      nickname: nickname,
      sellerStatus: sellerStatus,
      bankName: bankName,
      accountNumber: accountNumber,
      accountHolder: accountHolder,
    });


  
    return NextResponse.json({

      result,
      
    });

  }
  */

  try {
    // fetch previous status for history
    const client = await clientPromise;
    const users = client.db(dbName).collection('users');
    const existing = await users.findOne({ storecode, walletAddress });
    const prevStatus = existing?.seller?.status || null;

    const result = await updateSellerStatus({
      storecode: storecode,
      walletAddress: walletAddress,
      nickname: nickname,
      sellerStatus: sellerStatus,
      bankName: bankName,
      accountNumber: accountNumber,
      accountHolder: accountHolder,
    });

    if (!result) {
      return NextResponse.json({ result: null, error: 'Failed to update seller status' }, { status: 500 });
    }

    // write history
    await client.db(dbName).collection('sellerStatusHistory').insertOne({
      storecode,
      walletAddress,
      prevStatus,
      nextStatus: sellerStatus,
      changedAt: new Date(),
    });

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('updateSeller error', error);
    return NextResponse.json({ result: null, error: 'Server error updating seller status' }, { status: 500 });
  }
}
