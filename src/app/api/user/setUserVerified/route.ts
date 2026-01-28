import { NextResponse, type NextRequest } from "next/server";
import { put } from '@vercel/blob';
import { customAlphabet } from 'nanoid';
import { readFile } from 'fs/promises';
import path from 'path';

import {
	insertOneVerified,
} from '@lib/api/user';

export const runtime = 'nodejs';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const OPENAI_IMAGE_FALLBACK_MODELS = process.env.OPENAI_IMAGE_FALLBACK_MODELS || 'dall-e-3,dall-e-2';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
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


export async function POST(request: NextRequest) {

  const body = await request.json();

  const { storecode, walletAddress, nickname, mobile, email, telegramId, avatar } = body;

  const avatarUrl =
    typeof avatar === 'string' && avatar.trim()
      ? avatar.trim()
      : await generateAvatarUrl();
  const finalAvatarUrl = avatarUrl || (await getDefaultAvatarUrl());

  const result = await insertOneVerified({
    storecode: storecode,
    walletAddress: walletAddress,
    nickname: nickname,
    mobile: mobile,
    email: email,
    telegramId: telegramId,
    avatar: finalAvatarUrl,
  });


 
  return NextResponse.json({
    
    result,
    
  });
  
}
