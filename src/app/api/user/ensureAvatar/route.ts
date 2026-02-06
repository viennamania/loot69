import { NextResponse, type NextRequest } from "next/server";
import { put } from '@vercel/blob';
import { customAlphabet } from 'nanoid';
import { readFile } from 'fs/promises';
import path from 'path';

import { getOneByWalletAddress, updateAvatar } from '@lib/api/user';

export const runtime = 'nodejs';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const OPENAI_IMAGE_FALLBACK_MODELS = process.env.OPENAI_IMAGE_FALLBACK_MODELS || 'dall-e-3,dall-e-2';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const SENDBIRD_APP_ID = process.env.NEXT_PUBLIC_SENDBIRD_APP_ID || process.env.SENDBIRD_APP_ID || '';
const SENDBIRD_API_BASE = `https://api-${SENDBIRD_APP_ID}.sendbird.com/v3`;
const DEFAULT_AVATAR_SOURCE = '/profile-default.png';
const DEFAULT_AVATAR_BLOB_URL = process.env.DEFAULT_AVATAR_BLOB_URL || '';
let cachedDefaultAvatarUrl: string | null = DEFAULT_AVATAR_BLOB_URL || null;

const generateAvatarUrl = async () => {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is missing; skip avatar generation.');
    return null;
  }

  try {
    const seed = nanoid();
    const prompt =
      `Minimal abstract avatar icon, geometric shape, black and white base with subtle orange accent,` +
      ` centered, high contrast, clean vector style, no text, no letters, no watermark,` +
      ` unique variation ${seed}.`;

    const fallbackList = OPENAI_IMAGE_FALLBACK_MODELS.split(',')
      .map((model) => model.trim())
      .filter(Boolean);
    const candidates = [OPENAI_IMAGE_MODEL, ...fallbackList].filter(Boolean);

    for (const model of candidates) {
      const isGptImage = model.startsWith('gpt-image');
      const requestBody: Record<string, unknown> = {
        model,
        prompt,
        size: '1024x1024',
      };
      if (!isGptImage) {
        requestBody.response_format = 'b64_json';
      }

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`OpenAI image generation failed (${model})`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      const imageBase64 = data?.data?.[0]?.b64_json;
      const imageUrl = data?.data?.[0]?.url;

      if (imageBase64) {
        const buffer = Buffer.from(imageBase64, 'base64');
        const filename = `avatar-${nanoid()}.png`;
        const blob = await put(filename, buffer, {
          contentType: 'image/png',
          access: 'public',
        });
        return blob.url || null;
      }

      if (typeof imageUrl === 'string' && imageUrl) {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          console.warn(`Failed to download generated image (${model})`, imageResponse.status);
          continue;
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        const filename = `avatar-${nanoid()}.png`;
        const blob = await put(filename, Buffer.from(arrayBuffer), {
          contentType: imageResponse.headers.get('content-type') || 'image/png',
          access: 'public',
        });
        return blob.url || null;
      }

      console.warn(`OpenAI image generation returned empty data (${model})`);
    }

    return null;
  } catch (error) {
    console.warn('OpenAI avatar generation error', error);
    return null;
  }
};

const getDefaultAvatarUrl = async () => {
  if (cachedDefaultAvatarUrl) {
    return cachedDefaultAvatarUrl;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', DEFAULT_AVATAR_SOURCE);
    const fileBuffer = await readFile(filePath);
    const filename = `avatar-default-${nanoid()}.png`;
    const blob = await put(filename, fileBuffer, {
      contentType: 'image/png',
      access: 'public',
    });
    cachedDefaultAvatarUrl = blob.url || null;
    return cachedDefaultAvatarUrl || DEFAULT_AVATAR_SOURCE;
  } catch (error) {
    console.warn('Default avatar upload failed', error);
    return DEFAULT_AVATAR_SOURCE;
  }
};

const syncSendbirdUser = async (userId: string, nickname: string, profileUrl: string) => {
  const apiToken = process.env.SENDBIRD_API_TOKEN;
  if (!apiToken) {
    console.warn('SENDBIRD_API_TOKEN is missing; skip Sendbird sync.');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Api-Token': apiToken,
  };

  try {
    const updateResponse = await fetch(
      `${SENDBIRD_API_BASE}/users/${encodeURIComponent(userId)}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nickname,
          ...(profileUrl ? { profile_url: profileUrl } : {}),
        }),
      },
    );

    if (updateResponse.ok) {
      return;
    }

    const error = await updateResponse.json().catch(() => null);
    const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';

    if (updateResponse.status === 404 || message.includes('not found') || message.includes('not exist')) {
      const createResponse = await fetch(`${SENDBIRD_API_BASE}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          nickname,
          profile_url: profileUrl,
        }),
      });
      if (!createResponse.ok) {
        const createError = await createResponse.json().catch(() => null);
        console.warn('Sendbird create user failed', createError?.message || createError);
      }
      return;
    }

    console.warn('Sendbird update user failed', error?.message || error);
  } catch (error) {
    console.warn('Sendbird sync error', error);
  }
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { storecode, walletAddress, force } = body as {
    storecode?: string;
    walletAddress?: string;
    force?: boolean;
  };

  if (!storecode || !walletAddress) {
    return NextResponse.json({ error: 'Missing storecode or walletAddress' }, { status: 400 });
  }

  const user = await getOneByWalletAddress(storecode, walletAddress);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const shouldForce = Boolean(force);
  if (user.avatar && !shouldForce) {
    return NextResponse.json({ avatar: user.avatar, updated: false });
  }

  const avatarUrl = await generateAvatarUrl();
  const finalAvatarUrl = avatarUrl || (await getDefaultAvatarUrl());

  await updateAvatar({
    storecode,
    walletAddress,
    avatar: finalAvatarUrl,
  });

  if (user.nickname) {
    await syncSendbirdUser(walletAddress, user.nickname, finalAvatarUrl);
  }

  return NextResponse.json({ avatar: finalAvatarUrl, updated: true });
}
