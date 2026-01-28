import { NextResponse, type NextRequest } from "next/server";

import {
    setMarket,
} from '@lib/api/user';



export async function POST(request: NextRequest) {

    const body = await request.json();

    const {
        storecode,
        walletAddress,
        market
    } = body;

    console.log("setMarket body:", body);

    const result = await setMarket({
        storecode: storecode,
        walletAddress: walletAddress,
        market: market,
    });

    return NextResponse.json({

        result,
        
    });
    
}