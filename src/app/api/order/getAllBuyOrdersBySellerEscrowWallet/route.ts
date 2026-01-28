import { NextResponse, type NextRequest } from "next/server";

import { getAllBuyOrdersBySellerEscrowWallet } from '@lib/api/order';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    limit,
    page,
    startDate,
    endDate,
    walletAddress,
  } = body;

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
  }

  const result = await getAllBuyOrdersBySellerEscrowWallet({
    limit: limit || 10,
    page: page || 1,
    startDate,
    endDate,
    walletAddress,
  });

  return NextResponse.json({ result });
}
