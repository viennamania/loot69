/*
get walletAddress by seller.escrowWalletAddress
*/
import { NextResponse, type NextRequest } from "next/server";

import {
    getWalletAddressesByStorecodeAndSellerEscrowWalletAddress,
} from "@/lib/api/user";

export async function POST(request: NextRequest) {

  const body = await request.json();

    const {
        storecode,
        escrowWalletAddress,
        limit,
        page,
    } = body;

    const response = await getWalletAddressesByStorecodeAndSellerEscrowWalletAddress({
        storecode,
        escrowWalletAddress,
        limit,
        page,
    });

    //console.log("response:", response);

    if (response?.users && response.users.length > 0) {
        //return first
        return NextResponse.json({ walletAddress: response.users[0].walletAddress });

    } else {
        return NextResponse.json({ walletAddress: null });
    }

}

