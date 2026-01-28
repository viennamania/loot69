import { NextResponse, type NextRequest } from 'next/server';

import { getActiveNotices } from '@lib/api/notice';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Number(body?.limit ?? 6);
    const sortBy = body?.sortBy as 'publishedAt' | 'createdAt' | 'order' | undefined;
    const pinnedFirst = body?.pinnedFirst !== false;

    const result = await getActiveNotices({
      limit: Number.isFinite(limit) ? limit : 6,
      sortBy: sortBy ?? 'publishedAt',
      pinnedFirst,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ result: [], error: 'FAILED_TO_LOAD_NOTICES' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const sortByParam = searchParams.get('sortBy') as
      | 'publishedAt'
      | 'createdAt'
      | 'order'
      | null;
    const pinnedFirstParam = searchParams.get('pinnedFirst');

    const limit = limitParam ? Number(limitParam) : 6;
    const pinnedFirst = pinnedFirstParam ? pinnedFirstParam !== 'false' : true;

    const result = await getActiveNotices({
      limit: Number.isFinite(limit) ? limit : 6,
      sortBy: sortByParam ?? 'publishedAt',
      pinnedFirst,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ result: [], error: 'FAILED_TO_LOAD_NOTICES' }, { status: 500 });
  }
}
