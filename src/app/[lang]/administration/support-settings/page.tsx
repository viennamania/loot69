'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { AutoConnect, useActiveAccount } from 'thirdweb/react';
import { toast } from 'react-hot-toast';
import { useClientWallets } from '@/lib/useClientWallets';
import { client } from '@/app/client';

const ADMIN_CHAT_ID = 'lootManager';
const STORAGE_KEY = 'adminSupportProfile';
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_AVATAR_MB = 5;

const readStoredProfile = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as { nickname?: string; avatarUrl?: string };
  } catch {
    return null;
  }
};

export default function SupportSettingsPage() {
  const params = useParams<{ lang: string }>();
  const router = useRouter();
  const { wallet } = useClientWallets({ authOptions: ['google', 'email'] });
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = readStoredProfile();
    if (stored?.nickname) {
      setNickname(stored.nickname);
    }
    if (stored?.avatarUrl) {
      setAvatarUrl(stored.avatarUrl);
      setAvatarPreview(stored.avatarUrl);
    }
  }, []);

  useEffect(() => {
    if (!address) {
      setIsAdmin(false);
      setLoadingAdmin(false);
      return;
    }
    let active = true;
    const fetchUser = async () => {
      setLoadingAdmin(true);
      try {
        const response = await fetch('/api/user/getUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storecode: 'admin', walletAddress: address }),
        });
        const data = await response.json();
        if (active) {
          setIsAdmin(data?.result?.role === 'admin');
        }
      } catch {
        if (active) {
          setIsAdmin(false);
        }
      } finally {
        if (active) {
          setLoadingAdmin(false);
        }
      }
    };
    fetchUser();
    return () => {
      active = false;
    };
  }, [address]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const syncSendbirdProfile = async () => {
      try {
        const response = await fetch('/api/sendbird/get-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: ADMIN_CHAT_ID }),
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { user?: { nickname?: string; profile_url?: string } };
        if (!active) {
          return;
        }
        const nextNickname = data?.user?.nickname || '';
        const nextAvatar = data?.user?.profile_url || '';
        if (nextNickname) {
          setNickname((prev) => (prev ? prev : nextNickname));
        }
        if (nextAvatar) {
          setAvatarUrl((prev) => (prev ? prev : nextAvatar));
          setAvatarPreview((prev) => (prev ? prev : nextAvatar));
        }
      } catch (error) {
        console.error('Failed to fetch Sendbird profile', error);
      }
    };

    syncSendbirdProfile();
    intervalId = setInterval(syncSendbirdProfile, 30000);

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAdmin]);

  const prepareAvatarFile = async (file: File) => {
    const sourceUrl = URL.createObjectURL(file);
    try {
      const image = new window.Image();
      image.src = sourceUrl;
      await image.decode();
      const size = Math.min(image.width, image.height);
      const sx = (image.width - size) / 2;
      const sy = (image.height - size) / 2;
      const canvas = document.createElement('canvas');
      const targetSize = 512;
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context missing');
      }
      ctx.drawImage(image, sx, sy, size, size, 0, 0, targetSize, targetSize);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Canvas export failed'));
          }
        }, 'image/jpeg', 0.9);
      });
      const processedFile = new File([blob], `support-avatar-${Date.now()}.jpg`, {
        type: blob.type,
      });
      const previewUrl = URL.createObjectURL(blob);
      return { processedFile, previewUrl };
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (uploadingAvatar) {
      return;
    }
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error('PNG, JPG, WEBP 형식만 업로드할 수 있습니다.');
      return;
    }
    if (file.size / 1024 / 1024 > MAX_AVATAR_MB) {
      toast.error(`파일 용량은 ${MAX_AVATAR_MB}MB 이하만 가능합니다.`);
      return;
    }
    setUploadingAvatar(true);
    let localPreview: string | null = null;
    const previousAvatar = avatarUrl;
    try {
      const { processedFile, previewUrl } = await prepareAvatarFile(file);
      localPreview = previewUrl;
      setAvatarPreview(previewUrl);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'content-type': processedFile.type || 'application/octet-stream' },
        body: processedFile,
      });
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed (${uploadResponse.status}): ${errorText || uploadResponse.statusText}`);
      }
      const { url } = (await uploadResponse.json()) as { url: string };
      setAvatarUrl(url);
      setAvatarPreview(url);
      if (previousAvatar && previousAvatar !== url) {
        await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: previousAvatar }),
        });
      }
    } catch (error) {
      console.error('Support avatar upload failed', error);
      toast.error('이미지 업로드에 실패했습니다.');
      setAvatarPreview(previousAvatar || null);
    } finally {
      setUploadingAvatar(false);
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      toast.error('상담원 닉네임을 입력해 주세요.');
      return;
    }
    setSavingProfile(true);
    try {
      const response = await fetch('/api/sendbird/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: ADMIN_CHAT_ID,
          nickname: nickname.trim(),
          ...(avatarUrl ? { profileUrl: avatarUrl } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || '상담원 정보 저장에 실패했습니다.');
      }
      const nextNickname = data?.user?.nickname || nickname.trim();
      const nextAvatar = data?.user?.profile_url || avatarUrl;
      setNickname(nextNickname);
      if (nextAvatar) {
        setAvatarUrl(nextAvatar);
        setAvatarPreview(nextAvatar);
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ nickname: nextNickname, avatarUrl: nextAvatar }),
        );
      }
      toast.success('상담원 정보가 저장되었습니다.');
    } catch (error) {
      console.error('Support profile save failed', error);
      toast.error('상담원 정보 저장에 실패했습니다.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm">
          불러오는 중...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
        <AutoConnect client={client} wallets={[wallet]} />
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white/95 p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold">관리자 권한이 필요합니다</h1>
          <p className="text-sm text-slate-500">상담원 설정은 관리자만 변경할 수 있습니다.</p>
          <button
            type="button"
            onClick={() => router.push(`/${params.lang}/administration`)}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            관리자 홈으로
          </button>
        </div>
      </main>
    );
  }

  const initials = nickname.trim() ? nickname.trim().slice(0, 2).toUpperCase() : 'CS';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <AutoConnect client={client} wallets={[wallet]} />
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/${params.lang}/administration`)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"
          >
            뒤로가기
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            SUPPORT SETTINGS
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.5)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Support Avatar" fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="text-base font-semibold tracking-[0.2em]">{initials}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">상담원 프로필</p>
                <p className="text-xs text-slate-500">Sendbird 상담관리 계정</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                uploadingAvatar
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {uploadingAvatar ? '업로드 중...' : '프로필 이미지 변경'}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleAvatarUpload(file);
                  event.currentTarget.value = '';
                }
              }}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="text-xs font-semibold text-slate-500">상담원 닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="상담원 닉네임을 입력하세요"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className={`rounded-full px-5 py-3 text-xs font-semibold shadow-sm ${
                savingProfile
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {savingProfile ? '저장 중...' : '저장하기'}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            변경 내용은 Sendbird 상담관리 계정({ADMIN_CHAT_ID})에 반영됩니다.
          </div>
        </div>
      </div>
    </main>
  );
}
