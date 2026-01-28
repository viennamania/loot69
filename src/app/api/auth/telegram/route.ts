import { privateKeyToAccount } from "thirdweb/wallets";
import { verifySignature } from "thirdweb/auth";
import { NextRequest, NextResponse } from "next/server";

//import { client } from "../../../constants";
import { client } from "../../../client";

// Remove the 'export' keyword from this function
async function verifyTelegram(signature: string, message: string) {
    const metadata = JSON.parse(message);
    

    /*
    if (!metadata.expiration || metadata.expiration < Date.now()) {
        return false;
    }
    */



    
    if (!metadata.username) {
        return false;
    }

    // Initialize admin account at runtime, not at module level
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;
    if (!adminSecretKey) {
        throw new Error("ADMIN_SECRET_KEY environment variable is not set");
    }

    const adminAccount = privateKeyToAccount({
        privateKey: adminSecretKey,
        client,
    });

    const isValid = await verifySignature({
        client,
        address: adminAccount.address,
        message: message,
        signature,
    });

    if (!isValid) {
        return false;
    }

    return metadata.username;
}



export async function POST(req: NextRequest) {
    
    const { payload } = await req.json();
    
    //console.log('payload', payload);

    const { signature, message } = JSON.parse(payload);

    const userId = await verifyTelegram(signature, message);

    console.log('/api/auth/telegram POST userId', userId);

    if (!userId) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ userId });
}



export async function GET(req: NextRequest) {
    // Logic for GET method

    //console.log('/api/auth/telegram GET');
    
}



