import { NextResponse, type NextRequest } from 'next/server';

import { upsertPolicy } from '@lib/api/policy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body?.slug as string | undefined;
    if (!slug) {
      return NextResponse.json({ error: 'MISSING_SLUG' }, { status: 400 });
    }
    const result = await upsertPolicy(body);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_SAVE_POLICY' }, { status: 500 });
  }
}
