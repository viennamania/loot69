import { NextResponse, type NextRequest } from "next/server";

import {
  cancelBuyOrderByAdmin,
} from '@lib/api/order';

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    walletAddress,
    orderId,
  } = body;

  //console.log("orderId", orderId);
  //console.log("walletAddress", walletAddress);
  

  const result = await cancelBuyOrderByAdmin({
    orderId: orderId,
  });

  ////console.log("result", result);


 
  return NextResponse.json({

    result,
    
  });
  
}
