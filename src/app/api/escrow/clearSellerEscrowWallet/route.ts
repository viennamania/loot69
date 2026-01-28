import { NextResponse, type NextRequest } from "next/server";


import {
  getSellerBySellerWalletAddress,
} from '@lib/api/user';



import {
  createThirdwebClient,
  Engine,
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



// clear seller escrow wallet balance
// This endpoint clears the escrow balance for a seller

export async function POST(request: NextRequest) {

    // sellerWalletAddress, storecode
    const body = await request.json();
    
    const {
        selectedChain,
        walletAddress,
    } = body;

    if (!walletAddress) {
        return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    if (!selectedChain) {
        return NextResponse.json({ error: 'selectedChain is required' }, { status: 400 });
    }

    // get  info
    const seller = await getSellerBySellerWalletAddress(walletAddress);
    if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }



    if (!seller?.seller?.escrowWalletAddress) {
        return NextResponse.json({ error: 'Seller escrow wallet address not found' }, { status: 400 });
    }

    // transfer all balance from escrow wallet to seller main wallet
    const escrowWalletAddress = seller.seller.escrowWalletAddress;
    const sellerMainWalletAddress = seller.walletAddress;

    try {


        const client = createThirdwebClient({
            secretKey: process.env.THIRDWEB_SECRET_KEY || "",
        });

        if (!client) {
            return NextResponse.json({ error: 'Thirdweb client not created' }, { status: 500 });
        }
        
        const contract = getContract({
            client: client,
            chain: selectedChain === 'ethereum' ? ethereum :
                   selectedChain === 'polygon' ? polygon :
                   selectedChain === 'arbitrum' ? arbitrum :
                   selectedChain === 'bsc' ? bsc :
                   polygon, // default to polygon
            address: selectedChain === 'ethereum' ? ethereumContractAddressUSDT :
                     selectedChain === 'polygon' ? polygonContractAddressUSDT :
                     selectedChain === 'arbitrum' ? arbitrumContractAddressUSDT :
                     selectedChain === 'bsc' ? bscContractAddressUSDT :
                     polygonContractAddressUSDT, // default to polygon
        });

        // get balance of escrow wallet
        const escrowBalance = await balanceOf({
            contract,
            address: escrowWalletAddress,
        });

        // Number(result) / 10 ** 6 )
        let escrowBalanceFormatted = Number(escrowBalance) / (10 ** 6);
        if (selectedChain === 'bsc') {
            escrowBalanceFormatted = Number(escrowBalance) / (10 ** 18);
        }

        if (escrowBalanceFormatted <= 0) {
            return NextResponse.json({ error: 'Escrow wallet balance is zero' }, { status: 400 });
        }

        // create server wallet for escrow wallet

        const wallet = Engine.serverWallet({
            client: client,
            address: escrowWalletAddress, // your server wallet signer (EOA) address
        });

        const transaction = transfer({
            contract,
            to: sellerMainWalletAddress,
            amount: escrowBalanceFormatted,
        });

        // enqueue the transaction
        const { transactionId } = await wallet.enqueueTransaction({
            transaction,
        });


        return NextResponse.json({
            result: {
                transactionId,
                transferredAmount: escrowBalanceFormatted,
            },
            error: null,
        }, { status: 200 });

    } catch (error) {
        console.error("Error clearing escrow wallet:", error);
        return NextResponse.json({ error: 'Error clearing escrow wallet' }, { status: 500 });
    }

}

