'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AutoConnect, ConnectButton, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { client } from '../../client';
import { useClientWallets } from '@/lib/useClientWallets';

type NetworkKey = 'ethereum' | 'polygon' | 'arbitrum' | 'bsc';

const resolveChain = (value: NetworkKey) => {
  switch (value) {
    case 'ethereum':
      return ethereum;
    case 'arbitrum':
      return arbitrum;
    case 'bsc':
      return bsc;
    case 'polygon':
    default:
      return polygon;
  }
};

const walletAuthOptions = ['google', 'email', 'phone'];

export default function Web3LoginPage() {
  const { wallet, wallets, smartAccountEnabled, chain } = useClientWallets({
    authOptions: walletAuthOptions,
  });
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const address = activeAccount?.address;
  const activeChain = resolveChain(chain as NetworkKey);
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';
  const storecode = searchParams.get('storecode') || 'admin';
  const [nickname, setNickname] = useState('');
  const [editedNickname, setEditedNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [autoAvatarLoading, setAutoAvatarLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarErrorLog, setAvatarErrorLog] = useState('');
  const [autoAvatarUrlLog, setAutoAvatarUrlLog] = useState('');
  const MAX_AVATAR_MB = 5;
  const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const [loadingUser, setLoadingUser] = useState(false);
  const [savingNickname, setSavingNickname] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  const nicknameStatusLabel = useMemo(() => {
    if (loadingUser) {
      return '불러오는 중...';
    }
    if (!address) {
      return '로그인 필요';
    }
    return nickname ? nickname : '미등록';
  }, [address, loadingUser, nickname]);

  const isNicknameUnchanged = useMemo(() => {
    return editedNickname.trim() === (nickname || '');
  }, [editedNickname, nickname]);

  useEffect(() => {
    let active = true;
    if (!address) {
      setNickname('');
      setEditedNickname('');
      setHasUser(false);
      setNicknameError('');
      return;
    }

    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const response = await fetch('/api/user/getUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode,
            walletAddress: address,
          }),
        });
        const data = await response.json();
        if (!active) {
          return;
        }
        if (data.result) {
          const nextNickname = data.result.nickname || '';
          const nextAvatar = data.result.avatar || '';
          setNickname(nextNickname);
          setEditedNickname(nextNickname);
          setAvatarUrl(nextAvatar);
          setAvatarPreview(nextAvatar || null);
          setHasUser(true);
          if (!nextAvatar) {
            setAutoAvatarLoading(true);
            try {
              const ensureResponse = await fetch('/api/user/ensureAvatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  storecode,
                  walletAddress: address,
                }),
              });
              const ensureData = await ensureResponse.json().catch(() => ({}));
              if (active && ensureResponse.ok && ensureData?.avatar) {
                setAvatarUrl(ensureData.avatar);
                setAvatarPreview(ensureData.avatar);
                setAutoAvatarUrlLog(ensureData.avatar);
                if (nextNickname) {
                  await updateSendbirdUser(nextNickname, ensureData.avatar);
                }
              }
            } catch (error) {
              console.error('Auto avatar generation failed', error);
            } finally {
              if (active) {
                setAutoAvatarLoading(false);
              }
            }
          } else {
            setAutoAvatarLoading(false);
          }
        } else {
          setNickname('');
          setEditedNickname('');
          setAvatarUrl('');
          setAvatarPreview(null);
          setHasUser(false);
          setAutoAvatarLoading(false);
        }
        setNicknameError('');
      } catch (error) {
        if (active) {
          setNickname('');
          setEditedNickname('');
          setAvatarUrl('');
          setAvatarPreview(null);
          setHasUser(false);
          setNicknameError('');
          setAutoAvatarLoading(false);
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, [address, storecode]);

  const validateNickname = (value: string) => {
    if (value.length < 5 || value.length > 10) {
      return '닉네임은 5~10자의 영문 소문자/숫자만 가능합니다.';
    }
    if (!/^[a-z0-9]*$/.test(value)) {
      return '닉네임은 영문 소문자와 숫자만 입력할 수 있습니다.';
    }
    return '';
  };

  const handleSaveNickname = async () => {
    if (!address) {
      toast.error('로그인 후 닉네임을 등록할 수 있습니다.');
      return;
    }

    const trimmed = editedNickname.trim();
    const errorMessage = validateNickname(trimmed);
    if (errorMessage) {
      setNicknameError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setNicknameError('');
    setSavingNickname(true);

    try {
      const endpoint = hasUser ? '/api/user/updateUser' : '/api/user/setUserVerified';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode,
          walletAddress: address,
          nickname: trimmed,
        }),
      });
      const data = await response.json();

      if (data.result) {
        const nextNickname = data.result.nickname || trimmed;
        const nextAvatar = data.result.avatar || avatarUrl;
        setNickname(nextNickname);
        setEditedNickname(nextNickname);
        setHasUser(true);
        if (nextAvatar) {
          setAvatarUrl(nextAvatar);
          setAvatarPreview(nextAvatar);
        }
        await updateSendbirdUser(nextNickname, nextAvatar || avatarUrl);
        toast.success('채팅 닉네임도 변경됨');
      } else {
        toast.error('닉네임 저장에 실패했습니다.');
      }
    } catch (error) {
      toast.error('닉네임 저장에 실패했습니다.');
    } finally {
      setSavingNickname(false);
    }
  };

  const updateSendbirdUser = async (nextNickname: string, profileUrl?: string) => {
    if (!address || !nextNickname) {
      return;
    }
    try {
      const response = await fetch('/api/sendbird/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          nickname: nextNickname,
          ...(profileUrl ? { profileUrl } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Sendbird nickname update failed');
      }
    } catch (error) {
      console.error('Sendbird nickname update failed', error);
      toast.error('채팅 닉네임 변경에 실패했습니다.');
    }
  };

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
      const processedFile = new File([blob], `avatar-${Date.now()}.jpg`, {
        type: blob.type,
      });
      const previewUrl = URL.createObjectURL(blob);
      return { processedFile, previewUrl };
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!address) {
      toast.error('로그인 후 이미지를 업로드할 수 있습니다.');
      return;
    }
    if (avatarUploading) {
      return;
    }
    setAvatarErrorLog('');
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error('PNG, JPG, WEBP 형식만 업로드할 수 있습니다.');
      return;
    }
    if (file.size / 1024 / 1024 > MAX_AVATAR_MB) {
      toast.error(`파일 용량은 ${MAX_AVATAR_MB}MB 이하만 가능합니다.`);
      return;
    }
    setAvatarUploading(true);
    let previewUrl: string | null = null;
    let localPreviewUrl: string | null = null;
    const previousAvatarUrl = avatarPreview || avatarUrl;
    try {
      const { processedFile, previewUrl: processedPreviewUrl } = await prepareAvatarFile(file);
      previewUrl = processedPreviewUrl;
      localPreviewUrl = processedPreviewUrl;
      setAvatarPreview(processedPreviewUrl);
      const previousAvatar = avatarUrl;
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

      const updateResponse = await fetch('/api/user/updateAvatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode,
          walletAddress: address,
          avatar: url,
        }),
      });
      const updateData = await updateResponse.json();
      if (!updateResponse.ok || !updateData?.result) {
        throw new Error(
          `Avatar update failed (${updateResponse.status}): ${updateData?.error || updateResponse.statusText}`,
        );
      }
      setAvatarUrl(url);
      setAvatarPreview(url);
      if (nickname) {
        await updateSendbirdUser(nickname, url);
      } else {
        setNicknameError('닉네임을 먼저 등록해 주세요.');
      }
      if (previousAvatar && previousAvatar !== url) {
        await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: previousAvatar }),
        });
      }
      toast.success('프로필 이미지가 변경되었습니다.');
    } catch (error) {
      console.error('Avatar upload failed', error);
      toast.error('이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      const message = error instanceof Error ? error.message : 'Unknown error';
      setAvatarErrorLog(message);
      setAvatarPreview(previousAvatarUrl || null);
      if (address) {
        try {
          const fallbackResponse = await fetch('/api/user/getUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storecode,
              walletAddress: address,
            }),
          });
          const fallbackData = await fallbackResponse.json();
          if (fallbackData?.result?.avatar) {
            setAvatarUrl(fallbackData.result.avatar);
            setAvatarPreview(fallbackData.result.avatar);
          }
        } catch (fallbackError) {
          console.error('Failed to refresh avatar after upload error', fallbackError);
        }
      }
    } finally {
      setAvatarUploading(false);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    }
  };

  const handleAutoAvatarGenerate = async () => {
    if (!address || avatarUploading || autoAvatarLoading) {
      return;
    }
    setAvatarErrorLog('');
    setAutoAvatarLoading(true);
    try {
      const response = await fetch('/api/user/ensureAvatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode,
          walletAddress: address,
          force: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.avatar) {
        throw new Error(data?.error || '자동 생성에 실패했습니다.');
      }
      setAvatarUrl(data.avatar);
      setAvatarPreview(data.avatar);
      setAutoAvatarUrlLog(data.avatar);
      if (nickname) {
        await updateSendbirdUser(nickname, data.avatar);
      }
      toast.success('자동 생성 아바타로 변경되었습니다.');
    } catch (error) {
      console.error('Auto avatar generation failed', error);
      toast.error('자동 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      const message = error instanceof Error ? error.message : 'Unknown error';
      setAvatarErrorLog(message);
    } finally {
      setAutoAvatarLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-[100vh] overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,#f8fafc_0%,#eff6ff_36%,#ecfdf3_70%,#ffffff_100%)] px-4 py-10"
      style={{ fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif' }}
    >
      <AutoConnect client={client} wallets={[wallet]} />

      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)] blur-3xl" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            <Image src="/icon-back.png" alt="Back" width={16} height={16} className="h-4 w-4" />
            돌아가기
          </button>
        </div>
        <header className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 shadow-sm">
            Web3 Secure Access
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            신뢰 가능한 웹3 로그인
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            금융 앱 수준의 보안 UX로 지갑을 연결하고, 거래 내역을 안전하게 확인하세요.
            사용자의 지갑은 직접 보관되며, 플랫폼은 서명만 요청합니다.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-6">
            <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_32px_80px_-55px_rgba(15,23,42,0.6)] backdrop-blur">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
                    <Image src="/icon-smart-wallet.png" alt="Wallet" width={26} height={26} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Login
                    </span>
                    <span className="text-xl font-semibold text-slate-900">웹3 로그인</span>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${
                  address
                    ? 'border-emerald-200/80 bg-emerald-50/80'
                    : 'border-amber-200/80 bg-amber-50/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${
                      address
                        ? 'border-emerald-200 bg-white'
                        : 'border-amber-200 bg-white'
                    }`}>
                      <Image
                        src={address ? '/icon-approved.png' : '/icon-warning.png'}
                        alt="Login status"
                        width={22}
                        height={22}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        로그인 상태
                      </span>
                      <span className={`text-lg font-semibold ${
                        address ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {address ? '로그인 완료' : '로그인이 필요합니다'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {address
                          ? `지갑: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                          : '웹3 로그인 후 서비스 이용이 가능합니다.'}
                      </span>
                    </div>
                  </div>
                </div>

                {smartAccountEnabled && (
                  <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 p-4">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.6),transparent_70%)] blur-2xl" />
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                      Smart Account ON
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      스마트 어카운트는 출금 시 가스비용이 필요 없어 더 편리합니다.
                    </p>
                  </div>
                )}

                {!address && (
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={activeChain}
                    theme="light"
                    connectButton={{
                      style: {
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                        color: '#f8fafc',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        fontSize: '16px',
                        height: '52px',
                        width: '100%',
                        boxShadow: '0 18px 45px -25px rgba(15,23,42,0.7)',
                      },
                      label: '웹3 로그인',
                    }}
                    connectModal={{
                      size: 'wide',
                      titleIcon: 'https://crypto-ex-vienna.vercel.app/logo.png',
                      showThirdwebBranding: false,
                    }}
                    locale="ko_KR"
                  />
                )}

                {address && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!activeWallet) {
                        return;
                      }
                      if (!confirm('지갑 연결을 해제하시겠습니까?')) {
                        return;
                      }
                      try {
                        await activeWallet.disconnect();
                        toast.success('로그아웃 되었습니다');
                      } catch (error) {
                        console.error('Disconnect wallet failed', error);
                        toast.error('지갑 연결 해제에 실패했습니다.');
                      }
                    }}
                    className="w-full rounded-2xl border border-rose-200/80 bg-white px-4 py-3 text-base font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
                  >
                    지갑 연결 해제
                  </button>
                )}

                <div className="flex flex-wrap gap-2">
                  {['비수탁', '서명 확인', '보안 로그', '실시간 모니터링'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.55)] backdrop-blur">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                    <Image src="/icon-user.png" alt="Nickname" width={20} height={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Profile
                    </span>
                    <span className="text-lg font-semibold text-slate-900">회원 정보 등록</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    현재 닉네임
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {nicknameStatusLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    닉네임은 거래 화면과 프로필에 표시됩니다.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={editedNickname}
                    disabled={!address || savingNickname}
                    onChange={(event) => {
                      const nextValue = event.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                      setEditedNickname(nextValue);
                      setNicknameError('');
                    }}
                    onPaste={(event) => {
                      const pasteText = event.clipboardData.getData('text');
                      if (!/^[a-z0-9]*$/i.test(pasteText)) {
                        event.preventDefault();
                        const message = '붙여넣기는 영문 소문자와 숫자만 가능합니다.';
                        setNicknameError(message);
                        toast.error(message);
                      }
                    }}
                    placeholder="5~10자 영문 소문자/숫자"
                    className={`w-full rounded-2xl border px-4 py-3 text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      !address || savingNickname
                        ? 'border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-900'
                    }`}
                  />
                  {nicknameError && (
                    <span className="text-xs font-semibold text-rose-500">{nicknameError}</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!address || savingNickname || isNicknameUnchanged}
                  onClick={handleSaveNickname}
                  className={`w-full rounded-2xl px-4 py-3 text-base font-semibold transition ${
                    !address || savingNickname || isNicknameUnchanged
                      ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                      : 'bg-emerald-600 text-white shadow-[0_16px_35px_-20px_rgba(16,185,129,0.7)] hover:bg-emerald-500'
                  }`}
                >
                  {savingNickname ? '저장 중...' : '닉네임 저장'}
                </button>
                {isNicknameUnchanged && address && !savingNickname && !nicknameError && (
                  <span className="text-xs font-semibold text-slate-400">변경 사항 없음</span>
                )}

                <div className="pt-4 border-t border-slate-200/70">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        <Image
                          key={avatarPreview || avatarUrl || '/profile-default.png'}
                          src={avatarPreview || avatarUrl || '/profile-default.png'}
                          alt="Avatar"
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                        {(autoAvatarLoading || avatarUploading) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Avatar
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          프로필 이미지
                        </span>
                        {autoAvatarLoading && (
                          <span className="mt-1 text-[11px] font-semibold text-amber-600">
                            자동 생성 중...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            handleAvatarUpload(file);
                            event.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={!address || loadingUser || avatarUploading || autoAvatarLoading}
                        onClick={handleAutoAvatarGenerate}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition ${
                          !address || loadingUser || avatarUploading || autoAvatarLoading
                            ? 'border-slate-200 bg-slate-200 text-slate-400'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {loadingUser ? '불러오는 중...' : autoAvatarLoading ? '생성 중...' : '자동 생성'}
                      </button>
                      <button
                        type="button"
                        disabled={!address || loadingUser || avatarUploading || autoAvatarLoading}
                        onClick={() => avatarInputRef.current?.click()}
                        className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                          !address || loadingUser || avatarUploading || autoAvatarLoading
                            ? 'bg-slate-200 text-slate-400'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {loadingUser ? '불러오는 중...' : avatarUploading ? '업로드 중...' : '이미지 업로드'}
                      </button>
                    </div>
                  </div>
                  {avatarErrorLog && (
                    <div className="mt-3 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-[11px] font-semibold text-rose-600">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-rose-600">업로드 오류 로그</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(avatarErrorLog);
                              toast.success('로그가 복사되었습니다.');
                            } catch (error) {
                              toast.error('로그 복사에 실패했습니다.');
                            }
                          }}
                          className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-rose-600 shadow-sm transition hover:border-rose-300"
                        >
                          복사하기
                        </button>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{avatarErrorLog}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.55)] backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                  <Image src="/icon-shield.png" alt="Shield" width={20} height={20} />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Security
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900">안심 로그인 가이드</h2>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                  <p className="font-semibold text-slate-800">지갑은 고객이 직접 보관합니다.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    플랫폼은 지갑 비밀번호나 시드 구문을 저장하지 않습니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                  <p className="font-semibold text-slate-800">서명 요청은 투명하게 안내됩니다.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    모든 요청은 화면에 목적이 표시되며, 동의 없이 실행되지 않습니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                  <p className="font-semibold text-slate-800">실시간 보안 모니터링</p>
                  <p className="mt-1 text-xs text-slate-500">
                    이상 거래 탐지 및 자동 알림으로 안전한 자산 관리를 지원합니다.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
