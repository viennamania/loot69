import { NextResponse, type NextRequest } from 'next/server';

import { getActiveGlobalAds } from '@lib/api/globalAd';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const placement = body?.placement as string | undefined;
    const limit = Number(body?.limit ?? 12);

    const result = await getActiveGlobalAds({
      placement,
      limit: Number.isFinite(limit) ? limit : 12,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ result: [], error: 'FAILED_TO_LOAD_GLOBAL_ADS' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') ?? undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : 12;

    const result = await getActiveGlobalAds({
      placement,
      limit: Number.isFinite(limit) ? limit : 12,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ result: [], error: 'FAILED_TO_LOAD_GLOBAL_ADS' }, { status: 500 });
  }
}
