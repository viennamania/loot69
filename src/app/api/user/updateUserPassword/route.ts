import { NextResponse, type NextRequest } from "next/server";

import {
	updatePasswordByStorecodeAndNickname,
} from '@lib/api/user';



export async function POST(request: NextRequest) {

  const body = await request.json();

  /*
    storecode: userStorecode,
  walletAddress: userWalletAddress,
    depositBankName: bankName,
    depositBankAccountNumber: accountNumber,
    depositName: accountHolder,
  */

  const {
    storecode,
    nickname,
    password,
  } = body;


  const result = await updatePasswordByStorecodeAndNickname({
    storecode: storecode,
    nickname: nickname,
    password: password,
  });


 
  return NextResponse.json({

    result,
    
  });
  
}
