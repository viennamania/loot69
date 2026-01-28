import { NextResponse, type NextRequest } from "next/server";

import {
    setPriceSettingMethod,
} from '@lib/api/user';



export async function POST(request: NextRequest) {

    const body = await request.json();

    const {
        storecode,
        walletAddress,
        priceSettingMethod
    } = body;

    console.log("setPriceSettingMethod body:", body);

    const result = await setPriceSettingMethod({
        storecode: storecode,
        walletAddress: walletAddress,
        priceSettingMethod: priceSettingMethod,
    });

    return NextResponse.json({

        result,
        
    });
    
}