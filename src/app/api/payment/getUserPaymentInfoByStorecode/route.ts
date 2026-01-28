import { NextResponse, type NextRequest } from "next/server";

import {
    getUserPaymentInfoByStorecode
} from '@lib/api/user';

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    nickname,
  } = body;

 
  const result = await getUserPaymentInfoByStorecode({
    storecode,
    nickname,
  }); 

  return NextResponse.json({

    result,
    
  });
  
}
