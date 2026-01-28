import { NextResponse, type NextRequest } from "next/server";

import { updateSeller } from '@lib/api/user';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    storecode,
    walletAddress,
    sellerStatus,
    bankName,
    accountNumber,
    accountHolder,
  } = body;

  const result = await updateSeller({
    storecode: storecode,
    walletAddress: walletAddress,
    seller: {
      ...body.seller,
      status: sellerStatus,
      bankInfo: {
        ...body.seller?.bankInfo,
        bankName: bankName,
        accountNumber: accountNumber,
        accountHolder: accountHolder,
      },
    },
  });

  return NextResponse.json({
    result,
  });
}
