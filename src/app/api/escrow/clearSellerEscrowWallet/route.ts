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
        withdrawAmount,
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

        const activeTradeStatus = seller?.seller?.buyOrder?.status;
        const activeTradeUsdtAmount = ['accepted', 'paymentRequested', 'paymentConfirmed'].includes(activeTradeStatus)
            ? Number(seller?.seller?.buyOrder?.usdtAmount || 0)
            : 0;
        const reservedAmount = Number.isFinite(activeTradeUsdtAmount) ? activeTradeUsdtAmount : 0;
        const availableAmount = escrowBalanceFormatted - reservedAmount;

        if (!Number.isFinite(availableAmount) || availableAmount <= 0) {
            return NextResponse.json({ error: 'No withdrawable balance (reserved for active trade)' }, { status: 400 });
        }

        const requestedAmount = Number(withdrawAmount);
        const finalWithdrawAmount =
            Number.isFinite(requestedAmount) && requestedAmount > 0
                ? Math.min(requestedAmount, availableAmount)
                : availableAmount;

        console.log(`Clearing escrow wallet. Escrow balance: ${escrowBalanceFormatted} USDT, Reserved amount: ${reservedAmount} USDT, Available amount: ${availableAmount} USDT, Final withdraw amount: ${finalWithdrawAmount} USDT`);

        // escrow wallet address
        console.log(`Escrow Wallet Address: ${escrowWalletAddress}`);
        console.log(`Seller Main Wallet Address: ${sellerMainWalletAddress}`);


        // create server wallet for escrow wallet
        
        const vaultAccessToken =
            process.env.THIRDWEB_ENGINE_VAULT_ACCESS_TOKEN ||
            process.env.THIRDWEB_VAULT_ACCESS_TOKEN ||
            process.env.VAULT_TOKEN ||
            "";

        if (!vaultAccessToken) {
            return NextResponse.json(
                { error: 'Engine vault access token is required to sign escrow transactions.' },
                { status: 500 },
            );
        }
        

        const wallet = Engine.serverWallet({
            client: client,
            address: escrowWalletAddress, // your server wallet signer (EOA) address
            vaultAccessToken,
        });

        const transaction = transfer({
            contract,
            to: sellerMainWalletAddress,
            amount: finalWithdrawAmount,
        });

        // enqueue the transaction
        const { transactionId } = await wallet.enqueueTransaction({
            transaction,
        });

        console.log(`Escrow wallet cleared: ${finalWithdrawAmount} USDT transferred from ${escrowWalletAddress} to ${sellerMainWalletAddress}. Transaction ID: ${transactionId}`);


        return NextResponse.json({
            result: {
                transactionId,
                transferredAmount: finalWithdrawAmount,
                reservedAmount,
                availableAmount,
            },
            error: null,
        }, { status: 200 });

    } catch (error) {
        console.error("Error clearing escrow wallet:", error);
        return NextResponse.json({ error: 'Error clearing escrow wallet' }, { status: 500 });
    }

}
