import { NextResponse, type NextRequest } from 'next/server';

import { searchSellersByBankAccountHolder } from '@lib/api/user';

import {
  createThirdwebClient,
  getContract,
} from 'thirdweb';

import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
} from 'thirdweb/chains';

import { balanceOf } from 'thirdweb/extensions/erc20';

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
  const { storecode, accountHolder, query, searchBy, limit, page } = body || {};

  const keyword = query || accountHolder;
  if (!storecode || !keyword) {
    return NextResponse.json(
      { error: 'storecode and query are required.' },
      { status: 400 },
    );
  }

  const result = await searchSellersByBankAccountHolder({
    storecode,
    accountHolder: keyword,
    searchBy: searchBy === 'nickname' ? 'nickname' : 'accountHolder',
    limit: limit || 20,
    page: page || 1,
  });

  try {
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY || '',
    });

    const contract = getContract({
      client,
      chain: chain === 'ethereum' ? ethereum
        : chain === 'polygon' ? polygon
          : chain === 'arbitrum' ? arbitrum
            : chain === 'bsc' ? bsc
              : bsc,
      address: chain === 'ethereum' ? ethereumContractAddressUSDT
        : chain === 'polygon' ? polygonContractAddressUSDT
          : chain === 'arbitrum' ? arbitrumContractAddressUSDT
            : chain === 'bsc' ? bscContractAddressUSDT
              : bscContractAddressMKRW,
    });

    for (let i = 0; i < result.users.length; i += 1) {
      const user = result.users[i] as any;
      const escrowWalletAddress = user?.seller?.escrowWalletAddress;
      if (!escrowWalletAddress) {
        user.currentUsdtBalance = 0;
        continue;
      }
      try {
        const balance = await balanceOf({
          contract,
          address: escrowWalletAddress,
        });
        user.currentUsdtBalance =
          chain === 'bsc'
            ? Number(balance) / 10 ** 18
            : Number(balance) / 10 ** 6;
      } catch (error) {
        console.error(
          `Error getting balance for user ${user?.nickname || ''} (${escrowWalletAddress}):`,
          JSON.stringify(error),
        );
        user.currentUsdtBalance = 0;
      }
    }
  } catch (error) {
    console.error('Error in searchSellersByBankAccountHolder:', JSON.stringify(error));
  }

  return NextResponse.json({ result });
}
