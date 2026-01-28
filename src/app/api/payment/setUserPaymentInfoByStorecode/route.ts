import { NextResponse, type NextRequest } from "next/server";

import {
    updateUserPaymentInfoByStorecode
} from '@lib/api/user';

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    nickname,
    paymentInfo,
  } = body;

 
  const result = await updateUserPaymentInfoByStorecode({
    storecode,
    nickname,
    paymentInfo,
  }); 

  return NextResponse.json({

    result,
    
  });
  
}
