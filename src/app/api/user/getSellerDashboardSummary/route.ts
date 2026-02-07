import { NextResponse, type NextRequest } from 'next/server';
import clientPromise, { dbName } from '@lib/mongodb';

// Returns aggregated seller / 거래 요약:
// - totalSellers: 에스크로 지갑이 있는 판매자 수
// - totalOrders: 결제 완료된 주문 수
// - totalUsdt: 누적 판매량 (USDT)
// - totalKrw: 누적 판매금액 (KRW)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const storecode = body?.storecode || 'admin';

  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // 판매자 수 집계 (에스크로 지갑이 있는 판매자 기준)
    const totalSellers = await db.collection('users').countDocuments({
      storecode: { $regex: String(storecode), $options: 'i' },
      seller: { $exists: true, $ne: null },
      'seller.escrowWalletAddress': { $exists: true, $ne: null },
    });

    // 누적 거래 집계 (결제 완료 기준)
    const agg = await db
      .collection('buyorders')
      .aggregate([
        {
          $match: {
            storecode: { $regex: String(storecode), $options: 'i' },
            status: { $in: ['paymentConfirmed', 'released', 'completed', 'payment_confirmed'] },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalUsdt: { $sum: { $toDouble: { $ifNull: ['$usdtAmount', 0] } } },
            totalKrw: { $sum: { $toDouble: { $ifNull: ['$krwAmount', 0] } } },
          },
        },
      ])
      .toArray();

    const summary = agg[0] || { totalOrders: 0, totalUsdt: 0, totalKrw: 0 };

    return NextResponse.json({
      result: {
        totalSellers,
        totalOrders: summary.totalOrders,
        totalUsdt: summary.totalUsdt,
        totalKrw: summary.totalKrw,
      },
    });
  } catch (error) {
    console.error('getSellerDashboardSummary error', error);
    return NextResponse.json({ error: 'Failed to load seller summary' }, { status: 500 });
  }
}
