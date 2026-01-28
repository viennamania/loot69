import { NextResponse, type NextRequest } from "next/server";

import {
    getBithumbInfo,
} from '@lib/api/client';



export async function POST(request: NextRequest) {

    
    // getUpbitInfo by clientId
    const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID || "";
    const bithumbInfo = await getBithumbInfo(clientId);

    ///console.log("upbitInfo:", upbitInfo);

    return NextResponse.json({
        
        result: bithumbInfo,
        
    });
}


