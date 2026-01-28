import { NextResponse, type NextRequest } from 'next/server';

import { getOneByWalletAddress } from '@lib/api/user';

import { createThirdwebClient, getContract } from 'thirdweb';
import { balanceOf } from 'thirdweb/extensions/erc20';

import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';

import {
  chain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,
  bscContractAddressMKRW,
} from '@/app/config/contractAddresses';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { storecode, walletAddress } = body || {};

  if (!storecode || !walletAddress) {
    return NextResponse.json(
      { error: 'storecode and walletAddress are required.' },
      { status: 400 },
    );
  }

  const user = await getOneByWalletAddress(storecode, walletAddress);
  if (!user) {
    return NextResponse.json({ error: 'Seller not found.' }, { status: 404 });
  }

  let currentUsdtBalance = 0;
  try {
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY || '',
    });

    const contract = getContract({
      client,
      chain:
        chain === 'ethereum'
          ? ethereum
          : chain === 'polygon'
            ? polygon
            : chain === 'arbitrum'
              ? arbitrum
              : chain === 'bsc'
                ? bsc
                : bsc,
      address:
        chain === 'ethereum'
          ? ethereumContractAddressUSDT
          : chain === 'polygon'
            ? polygonContractAddressUSDT
            : chain === 'arbitrum'
              ? arbitrumContractAddressUSDT
              : chain === 'bsc'
                ? bscContractAddressUSDT
                : bscContractAddressMKRW,
    });

    const escrowWalletAddress = (user as any)?.seller?.escrowWalletAddress;
    if (escrowWalletAddress) {
      const balance = await balanceOf({
        contract,
        address: escrowWalletAddress,
      });
      currentUsdtBalance =
        chain === 'bsc' ? Number(balance) / 10 ** 18 : Number(balance) / 10 ** 6;
    }
  } catch (error) {
    console.error('Error in getSellerSummary:', JSON.stringify(error));
  }

  return NextResponse.json({
    result: {
      user,
      currentUsdtBalance,
    },
  });
}
