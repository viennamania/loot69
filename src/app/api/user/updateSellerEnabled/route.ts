import { NextResponse, type NextRequest } from "next/server";

import {
    updateSellerEnabled,
} from '@lib/api/user';

export async function POST(request: NextRequest) {

    const body = await request.json();

    const {
        storecode,
        walletAddress,
        sellerEnabled,
    } = body;

    //console.log("updateSellerEnabled request body", body);
    
    const result = await updateSellerEnabled({
        storecode,
        walletAddress,
        sellerEnabled,
    });

    //console.log("updateSellerEnabled result", result);
    
    return NextResponse.json({
        result,
    });
    
}