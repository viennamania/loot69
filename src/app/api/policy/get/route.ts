import { NextResponse, type NextRequest } from 'next/server';

import { getPolicyBySlug } from '@lib/api/policy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body?.slug as string | undefined;
    if (!slug) {
      return NextResponse.json({ error: 'MISSING_SLUG' }, { status: 400 });
    }
    const result = await getPolicyBySlug(slug);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_LOAD_POLICY' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'MISSING_SLUG' }, { status: 400 });
    }
    const result = await getPolicyBySlug(slug);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_LOAD_POLICY' }, { status: 500 });
  }
}
