

import { NextResponse, type NextRequest } from "next/server";



export async function GET(request: NextRequest) {

  // get my ip address by fetching from an external service

  // my ip address url
  const myIpAddressUrl = "https://api.ipify.org?format=json";
  
  const response = await fetch(myIpAddressUrl);
  const data = await response.json();

  const ipAddress = data.ip;


  return NextResponse.json({

    ipAddress,
    
  });

}
