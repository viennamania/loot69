import { NextResponse, type NextRequest } from "next/server";

import {
    acceptBuyOrderPrivateSale,
    getOneBuyOrder,
    getOneBuyOrderByOrderId,
} from '@lib/api/order';

import {
  getPayactionKeys,
} from '@lib/api/store';

import {
    getSellerBySellerWalletAddress,
} from '@lib/api/user';

export async function POST(request: NextRequest) {

    const body = await request.json();

    const {
        buyerWalletAddress,
        sellerWalletAddress,
        usdtAmount,
        krwAmount,
    } = body;

    //console.log('acceptBuyOrderPrivateSale body', body);

    /*
    // get buy order details
    const resultBuyOrder = await getOneBuyOrder({
      orderId: body.orderId,
      limit: 1,
      page: 1,  
    });
    
    
    const buyOrder = resultBuyOrder?.orders[0];



  const payactionKeys = await getPayactionKeys({
    storecode: buyOrder.storecode,
  });
    */

    const payactionKeys = {
        payactionApiKey: "F5KOO82L7NNS",
        payactionWebhookKey: "FGW7804WV239",
        payactionShopId: "1756207579182x337939017385639940",
    };


    let createdBuyOrder = false;

    if (payactionKeys?.payactionApiKey && payactionKeys?.payactionShopId) {


        const payactionApiKey = payactionKeys.payactionApiKey;
        const payactionWebhookKey = payactionKeys.payactionWebhookKey;
        const payactionShopId = payactionKeys.payactionShopId;

        //console.log("payactionApiKey", payactionApiKey);
        //console.log("payactionWebhookKey", payactionWebhookKey);
        //console.log("payactionShopId", payactionShopId);





        /*

        if (!payactionApiKey || !payactionShopId) {
        console.error("Payaction API key or Shop ID is not defined for storecode:", buyOrder.storecode);
        return NextResponse.json({
            error: "Payaction API key or Shop ID is not defined",
            storecode: buyOrder.storecode,
        }, { status: 400 });
        }
        */

        // getSellerBySellerWalletAddress
        let seller = await getSellerBySellerWalletAddress(sellerWalletAddress);

        if (!seller) {
            console.error("Seller not found for wallet address:", sellerWalletAddress);
            return NextResponse.json({
                error: "Seller not found for wallet address",
                sellerWalletAddress: sellerWalletAddress,
            }, { status: 404 });
        }

        if (!seller?.seller?.buyOrder?._id) {
            const created = await acceptBuyOrderPrivateSale({
                buyerWalletAddress,
                sellerWalletAddress,
                usdtAmount,
                krwAmount,
            });
            if (!created) {
                return NextResponse.json(
                    { error: "Buy order creation failed" },
                    { status: 400 },
                );
            }
            createdBuyOrder = true;
            seller = await getSellerBySellerWalletAddress(sellerWalletAddress);
        }

        const orderIdRaw = seller?.seller?.buyOrder?._id;
        if (!orderIdRaw) {
            return NextResponse.json(
                { error: "Buy order not found on seller" },
                { status: 404 },
            );
        }
        const orderId = typeof orderIdRaw === 'string' ? orderIdRaw : orderIdRaw?.toString?.();
        if (!orderId) {
            return NextResponse.json(
                { error: "Invalid buy order id" },
                { status: 400 },
            );
        }


        // getOneBuyOrderByOrderId
        const buyOrder = await getOneBuyOrderByOrderId(orderId);

        if (!buyOrder) {
        console.error("Buy order not found for order ID:", orderId);
        return NextResponse.json({
            error: "Buy order not found for order ID",
            orderId: orderId,
        }, { status: 404 });
        }


        /*
        if buyOrder?.mobile has 국가번호, then remove 국가번호
        if buyOrder?.mobile has - then remove -
        */
        const mobile = buyOrder?.mobile?.replace(/^\+82/, "0").replace(/-/g, "");



        const tradeId = buyOrder.tradeId;
        
        const payactionUrl = "https://api.payaction.app/order";
        const payactionBody = {
            order_number: tradeId,
            order_amount: buyOrder.krwAmount,
            order_date: new Date().toISOString(),
            billing_name: buyOrder.buyer.depositName,
            orderer_name: buyOrder.buyer.depositName,
            orderer_phone_number: mobile,
            orderer_email: buyOrder.buyer?.email,
            trade_usage: "USDT구매",
            identity_number: buyOrder.walletAddress,
        };

        
        const payactionHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            "x-api-key": payactionApiKey,
            "x-mall-id": payactionShopId,
        };
        const payactionOptions = {
            method: "POST",
            headers: payactionHeaders,
            body: JSON.stringify(payactionBody),
        };

        try {
            const payactionResponse = await fetch(payactionUrl, payactionOptions);

            const payactionResult = await payactionResponse.json();
            console.log("buyOrderRequestPayment payactionResult", payactionResult);
    
            /* { status: 'success', response: {} } */

            if (payactionResponse.status !== 200) {
            console.error("Payaction API error", payactionResult);
            throw new Error("Payaction API error");
            }


            if (payactionResult.status !== "success") {
            console.error("Payaction API error", payactionResult);
            throw new Error("Payaction API error");
            }

            
        
        } catch (error) {
            // Error calling Payaction API
            console.error("Error calling Payaction API", error);
            
            /*
            return NextResponse.json({
            error: "Error calling Payaction API",
            details: error instanceof Error ? error.message : "Unknown error",
            }, { status: 500 });
            */

        }
    


    }



    const result = createdBuyOrder
        ? true
        : await acceptBuyOrderPrivateSale({
            buyerWalletAddress,
            sellerWalletAddress,
            usdtAmount,
            krwAmount,
        });

    return NextResponse.json({ result });


}
