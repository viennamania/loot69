import { NextResponse, type NextRequest } from "next/server";


import {
    updateUserForSeller,
} from '@lib/api/user';


import {
    createThirdwebClient,
    Engine
} from "thirdweb";
 


export async function POST(request: NextRequest) {

    const body = await request.json();

    const {
        storecode,
        walletAddress,
        //contactEmail,
        //businessRegistrationNumber,
    } = body;

    //console.log("applySeller request body", body);

    const client = createThirdwebClient({
        secretKey: process.env.THIRDWEB_SECRET_KEY || "",
    });

    if (!client) {
        return NextResponse.json({
            error: "Thirdweb client not initialized",
        }, { status: 500 });
    }

    try {
        const wallet = Engine.createServerWallet({
            client,
            label: `escrow-${walletAddress}`,
        });

        //const escrowWalletAddress = (await wallet).smartAccountAddress;
        
        const escrowWalletAddress = (await wallet).smartAccountAddress;

        if (!escrowWalletAddress) {
            return NextResponse.json({
                error: "Failed to create escrow wallet",
            }, { status: 500 });
        }

        const result = await updateUserForSeller({
            storecode,
            walletAddress,
            escrowWalletAddress,
        });

        if (!result) {
            return NextResponse.json({
                error: "Failed to update user for seller",
            }, { status: 500 });
        }

        //console.log("applySeller result", result);
        
        return NextResponse.json({
            result,
        });

    } catch (error) {
        console.error("Error in applySeller:", error);
        return NextResponse.json({
            error: "Internal server error",
        }, { status: 500 });
    }
    
}