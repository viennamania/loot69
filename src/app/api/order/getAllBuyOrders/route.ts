import { NextResponse, type NextRequest } from "next/server";

import {
	getBuyOrders,
} from '@lib/api/order';



export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    agentcode,
    storecode,
    limit,
    page,
    walletAddress,
    searchMyOrders,
    searchOrderStatusCancelled,
    searchOrderStatusCompleted,

    searchStoreName,

    privateSale,

    searchBuyer,
    searchDepositName,

    searchStoreBankAccountNumber,

    fromDate,
    toDate,


  } = body;


  //console.log("getAllBuyOrders fromDate", fromDate);
  //console.log("getAllBuyOrders toDate", toDate);



  

  //console.log("getAllBuyOrders body", body);


  // Error fetching buy orders: SyntaxError: Unexpected token 'A', "A server e"... is not valid JSON

  try {

    /*
    // when fromDate is "" or undefined, set it to 30 days ago
    if (!fromDate || fromDate === "") {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      body.fromDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
    }

    // when toDate is "" or undefined, set it to today
    if (!toDate || toDate === "") {
      const date = new Date();
      body.toDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
    }
    */


    const result = await getBuyOrders({
      limit: limit || 100,
      page: page || 1,
      agentcode: agentcode || "",
      storecode: storecode || "",
      walletAddress:  walletAddress || "",
      searchMyOrders:  searchMyOrders || false,
      searchOrderStatusCancelled,
      searchOrderStatusCompleted,

      searchStoreName: searchStoreName || "",

      privateSale: privateSale || false,

      searchBuyer: searchBuyer || "",
      searchDepositName: searchDepositName || "",

      searchStoreBankAccountNumber: searchStoreBankAccountNumber || "",


      fromDate: fromDate || "",

      toDate: toDate || "",

    });

    //console.log("Fetched buy orders:", result);

  
    return NextResponse.json({

      result,
      
    });

  } catch (error) {

    console.error("Error fetching buy orders:", error);

    return NextResponse.json(
      {
        error: "Error fetching buy orders",
      },
      { status: 500 }
    );

  }

  
}
