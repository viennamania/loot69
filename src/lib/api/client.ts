import clientPromise from '../mongodb';

import { dbName } from '../mongodb';



// getOne by clientId
export async function getOne(clientId: string) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('clients');
  return collection.findOne({ clientId: clientId });
}


// upsertOne by clientId
export async function upsertOne(clientId: string, data: any) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('clients');
  const result = await collection.updateOne(
    { clientId: clientId },
    { $set: data },
    { upsert: true }
  );
  return result;
}




/*
{
  "_id": {
    "$oid": "6960b8f31f96e4639ff1c686"
  },
  "clientId": "b2de5e005e24eb5d4957e2b1a155ee02",
  "description": "",
  "exchangeRateUSDT": {
    "USD": 1,
    "KRW": 1470,
    "JPY": 0,
    "CNY": 0,
    "EUR": 0
  },
  "name": "",
  "upbit": {
    "market": "KRW-USDT",
    "trade_date": "20260111",
    "trade_time": "015126",
    "trade_date_kst": "20260111",
    "trade_time_kst": "105126",
    "trade_timestamp": 1768096286289,
    "opening_price": 1475,
    "high_price": 1477,
    "low_price": 1473,
    "trade_price": 1476,
    "prev_closing_price": 1474,
    "change": "RISE",
    "change_price": 2,
    "change_rate": 0.0013568521,
    "signed_change_price": 2,
    "signed_change_rate": 0.0013568521,
    "trade_volume": 2000,
    "acc_trade_price": 6214172568.170747,
    "acc_trade_price_24h": 46839402208.57913,
    "acc_trade_volume": 4211073.51407246,
    "acc_trade_volume_24h": 31780781.93390585,
    "highest_52_week_price": 1655,
    "highest_52_week_date": "2025-10-10",
    "lowest_52_week_price": 1339.5,
    "lowest_52_week_date": "2025-07-11",
    "timestamp": 1768096286350
  }
}
*/

// get upbit info by clientId
export async function getUpbitInfo(clientId: string) {
  const client = await getOne(clientId);
  return client?.upbit || null;
}

// get bithumb info by clientId
export async function getBithumbInfo(clientId: string) {
  const client = await getOne(clientId);
  return client?.bithumb || null;
}