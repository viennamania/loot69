import { NextResponse, type NextRequest } from 'next/server';
import { del } from '@vercel/blob';

import { deleteGlobalAd, getGlobalAdById } from '@lib/api/globalAd';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) {
      return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
    }

    const record = body?.image ? { image: body.image } : await getGlobalAdById(id);
    const imageUrl = record?.image as string | undefined;

    await deleteGlobalAd(id);

    if (imageUrl && imageUrl.includes('blob.vercel-storage.com')) {
      try {
        await del(imageUrl);
      } catch (error) {
        // ignore blob delete errors
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_DELETE_GLOBAL_AD' }, { status: 500 });
  }
}
