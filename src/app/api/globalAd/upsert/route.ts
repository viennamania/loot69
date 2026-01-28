import { NextResponse, type NextRequest } from 'next/server';

import { upsertGlobalAd } from '@lib/api/globalAd';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await upsertGlobalAd(body || {});

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_UPSERT_GLOBAL_AD' }, { status: 500 });
  }
}
