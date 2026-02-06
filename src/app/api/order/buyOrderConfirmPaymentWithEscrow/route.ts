import { NextResponse, type NextRequest } from "next/server";

import {
  UserProps,
	buyOrderConfirmPayment,
  buyOrderGetOrderById,

  //buyOrderWebhook,

} from '@lib/api/order';


import {
  getOneByWalletAddress 
} from '@lib/api/user';

// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio";
import { webhook } from "twilio/lib/webhooks/webhooks";
import { create } from "domain";




import {
  createThirdwebClient,
  getContract,
  sendTransaction,
} from "thirdweb";

//import { polygonAmoy } from "thirdweb/chains";
import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
 } from "thirdweb/chains";

import { serverWallet, waitForTransactionHash } from "thirdweb/engine";
import { transfer } from "thirdweb/extensions/erc20";




// NEXT_PUBLIC_CHAIN
const chain = process.env.NEXT_PUBLIC_CHAIN || "arbitrum";

// USDT addresses are inlined per chain below

export const maxDuration = 60; // This function can run for a maximum of 60 seconds


export async function POST(request: NextRequest) {

  console.log("buyOrderConfirmPaymentWithEscrow route.ts called");


  const body = await request.json();

  const {
    lang,
    storecode,
    orderId,
    paymentAmount,
    transactionHash,
    isSmartAccount
  } = body;


  console.log("lang", lang);
  console.log("storecode", storecode);

  console.log("orderId", orderId);

  console.log("paymentAmount", paymentAmount);






  
  try {



    // get buyer wallet address


    const order = await buyOrderGetOrderById( orderId );

    if (!order) {

      console.log("order not found");
      console.log("orderId", orderId);
      
      return NextResponse.json({
        result: null,
      });
    }
    

    const {
      nickname: orderNickname,
      storecode: orderStorecode,
      seller: seller,
      walletAddress: walletAddress,
      usdtAmount: usdtAmount,
      buyer: buyer,
    } = order as UserProps;



    const sellerWalletAddress = seller.walletAddress;

    if (!sellerWalletAddress) {
      return NextResponse.json({
        result: null,
      });
    }

    const user = await getOneByWalletAddress(
      storecode,
      sellerWalletAddress
    );

    ///console.log("user", user);

    if (!user) {
      return NextResponse.json({
        result: null,
      });
    }







    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY || "",
    });

    if (!client) {
      return NextResponse.json({
        result: null,
        error: 'thirdweb_client_missing',
      });
    }

    const chainObj = chain === "bsc" ? bsc : chain === "arbitrum" ? arbitrum : polygon;


    //const escrowWalletAddress = account.address;



    // send USDT from seller escrow (engine server wallet) to buyer wallet
    const contract = getContract({
      client,
      chain: chainObj,
      address:
        chain === "bsc"
          ? "0x55d398326f99059fF775485246999027B3197955"
          : chain === "arbitrum"
          ? "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
          : chain === "polygon"
          ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
          : "0xdAC17F958D2ee523a2206206994597C13D831ec7", // ethereum USDT
    });

    const vaultAccessToken = process.env.THIRDWEB_ENGINE_VAULT_TOKEN;
    if (!vaultAccessToken) {
      return NextResponse.json({
        result: null,
        error: 'engine_vault_token_missing',
      });
    }

    const account = serverWallet({
      client,
      address: seller?.escrowWalletAddress || sellerWalletAddress,
      chain: chainObj,
      vaultAccessToken,
      executionOptions: { type: "auto", from: seller?.escrowWalletAddress || sellerWalletAddress },
    });

    const transaction = transfer({
      contract,
      to: buyer?.receiveWalletAddress || buyer?.walletAddress || walletAddress,
      amount: usdtAmount,
    });

    const { transactionId } = await account.enqueueTransaction({ transaction });
    const { transactionHash: escrowTransactionHash } = await waitForTransactionHash({
      client,
      transactionId,
    });


    console.log("escrowTransactionHash", escrowTransactionHash);


    const queueId = null; // no queueId for with escrow payment

    const result = await buyOrderConfirmPayment({
      lang: lang,
      storecode: storecode,
      orderId: orderId,
      paymentAmount: paymentAmount,
      
      queueId: queueId,

      transactionHash: transactionHash || escrowTransactionHash,

      escrowTransactionHash: escrowTransactionHash,

    });
  
  
    //console.log("result", JSON.stringify(result));
  
    /*
    const {
      nickname: nickname,
      tradeId: tradeId,
    } = result as UserProps;
  
  
  
    const amount = usdtAmount;
    */
  
  
      // send sms
    /*

    if (!buyer?.mobile) {
      return NextResponse.json({
        result,
      });
    }


    // check buyer.mobile is prefixed with +
    if (!buyer?.mobile.startsWith("+")) {
      return NextResponse.json({
        result,
      });
    }



    const to = buyer.mobile;


    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);



    let message = null;


    try {

      const msgBody = `[GTETHER] TID[${tradeId}] You received ${amount} USDT from ${nickname}! https://gold.goodtether.com/${lang}/${chain}/sell-usdt/${orderId}`;
  
      message = await client.messages.create({
        ///body: "This is the ship that made the Kessel Run in fourteen parsecs?",
        body: msgBody,
        from: "+17622254217",
        to: to,
      });
  
      console.log(message.sid);

    } catch (error) {
        
      console.log("error", error);
  
    }

    */
  
  
    /*
    // order storecode가 매니의 storecode인 경우에만 webhook을 보냄
    if (orderStorecode === "dtwuzgst") { // 가맹점 이름 매니


      // http://3.112.81.28/?userid=test1234&amount=10000

      const userid = orderNickname; // 매니의 userid는 orderNickname
      const amount = paymentAmount;

      // https://my-9999.com/api/deposit?userid=test1234&amount=10000
      const webhookUrl = "http://3.112.81.28"; // 매니의 웹훅 URL

      const fetchUrl = `${webhookUrl}/?userid=${userid}&amount=${amount}`;

      try {

        
        //const response = await fetch(fetchUrl, {
        //  method: "GET",
        //  headers: {
        //    "Content-Type": "application/json",
        //  },
        //});

        // GET 요청
        const response = await fetch(fetchUrl);

        console.log("fetchUrl", fetchUrl);
        console.log("response", response);



        if (!response.ok) {
          console.error("Failed to send webhook for user:", userid, "with status:", response.status);
        } else {


          
          //성공: {result: success), 실패: {result: fail}
          

          try {
            const data = await response.json();
            console.log("Webhook sent for user:", userid, "with response:", data);

            await buyOrderWebhook({
              orderId: orderId,
              webhookData: {
                createdAt: new Date().toISOString(),
                url: webhookUrl,
                userid: userid,
                amount: amount,
                response: data,
              }
            });


          } catch (jsonError) {


            await buyOrderWebhook({
              orderId: orderId,
              webhookData: {
                createdAt: new Date().toISOString(),
                url: webhookUrl,
                userid: userid,
                amount: amount,
                response: response.text(), // response를 JSON으로 파싱하지 못한 경우
              }
            });

          }

        }

      } catch (error) {
        console.error("Error sending webhook:", error);
      }

    }
    */


  
    
    return NextResponse.json({
  
      result,
      
    });









  } catch (error) {
      
    console.log(" error=====>" + error);



  }

  


 
  return NextResponse.json({

    result: null,
    
  });
  
}
