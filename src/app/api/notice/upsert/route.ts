import { NextResponse, type NextRequest } from 'next/server';

import { upsertNotice } from '@lib/api/notice';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await upsertNotice(body);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_SAVE_NOTICE' }, { status: 500 });
  }
}
