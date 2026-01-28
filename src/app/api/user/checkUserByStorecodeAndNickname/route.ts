import { NextResponse, type NextRequest } from "next/server";

import {
	checkOneByStorecodeAndNickname,
} from '@lib/api/user';

import {
  createThirdwebClient,
  getUser
} from "thirdweb";

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    nickname,
    password,
  } = body;


  //console.log("walletAddress", walletAddress);

  console.log("storecode", storecode);
  console.log("nickname", nickname);
  console.log("password", password);


  /*
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY || "",
  });
 
  const user = await getUser({
    client,
    walletAddress: walletAddress,
    //walletAddress: "0xF1b051dceb3Aab2f8e35805F134e373b709382aA", // For testing purposes
  });

  console.log("user", user);
  */


  const result = await checkOneByStorecodeAndNickname(
    storecode,
    nickname,
    password,
  );


 
  return NextResponse.json({

    result,
    
  });
  
}
