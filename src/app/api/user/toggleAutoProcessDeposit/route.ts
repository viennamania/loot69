import { NextResponse, type NextRequest } from "next/server";

import {
    toggleAutoProcessDeposit,
} from '@lib/api/user';



export async function POST(request: NextRequest) {

    const body = await request.json();

    const {
        storecode,
        walletAddress,
        autoProcessDeposit,
    } = body;

    //console.log("toggleAutoProcessDeposit body:", body);

    const result = await toggleAutoProcessDeposit({
        storecode: storecode,
        walletAddress: walletAddress,
        autoProcessDeposit: autoProcessDeposit,
    });

    return NextResponse.json({

        result,
        
    });
    
}