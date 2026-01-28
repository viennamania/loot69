import { NextResponse, type NextRequest } from "next/server";

import {
	getUserByNickname,
} from '@lib/api/user';



export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    nickname,
  } = body;


  //console.log("walletAddress", walletAddress);


  const result = await getUserByNickname(
    storecode,
    nickname,
  );

  //console.log("getUserByNickname result", result);

 
  return NextResponse.json({

    result,
    
  });
  
}
