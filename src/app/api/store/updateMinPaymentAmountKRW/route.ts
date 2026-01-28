import { NextResponse, type NextRequest } from "next/server";

import {
	updateMinPaymentAmountKRW,
} from '@lib/api/store';


export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    walletAddress,
    storecode,
    minPaymentAmountKRW,
  } = body;







  const result = await updateMinPaymentAmountKRW({
    walletAddress,
    storecode,
    minPaymentAmountKRW,
  });

 
  return NextResponse.json({

    result,
    
  });
  
}
