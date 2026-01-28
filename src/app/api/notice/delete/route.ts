import { NextResponse, type NextRequest } from 'next/server';

import { deleteNotice } from '@lib/api/notice';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) {
      return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
    }
    const result = await deleteNotice(id);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_DELETE_NOTICE' }, { status: 500 });
  }
}
