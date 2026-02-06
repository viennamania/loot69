import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  try {
    const filename = `seller-profile/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, { access: 'public' });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('blob upload error', error);
    return NextResponse.json({ error: 'upload failed' }, { status: 500 });
  }
}
