import { NextResponse, type NextRequest } from 'next/server';
import { del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === 'string' ? body.url : '';

    if (!url) {
      return NextResponse.json({ error: 'MISSING_URL' }, { status: 400 });
    }

    if (url.includes('blob.vercel-storage.com')) {
      await del(url);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_DELETE_BLOB' }, { status: 500 });
  }
}
