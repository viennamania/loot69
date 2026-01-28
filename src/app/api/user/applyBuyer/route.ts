import { NextResponse, type NextRequest } from "next/server";


import {
    updateUserForBuyer,
} from '@lib/api/user';


export async function POST(request: NextRequest) {

    const body = await request.json();

    const {
        storecode,
        walletAddress,
        //contactEmail,
        //businessRegistrationNumber,
    } = body;

    //console.log("applyBuyer request body", body);



    try {


        const result = await updateUserForBuyer({
            storecode,
            walletAddress,
        });

        if (!result) {
            return NextResponse.json({
                error: "Failed to update user for buyer",
            }, { status: 500 });
        }

        //console.log("applyBuyer result", result);
        
        return NextResponse.json({
            result,
        });

    } catch (error) {
        console.error("Error in applyBuyer:", error);
        return NextResponse.json({
            error: "Internal server error",
        }, { status: 500 });
    }
    
}