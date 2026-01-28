'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import SendbirdProvider from '@sendbird/uikit-react/SendbirdProvider';
import GroupChannel from '@sendbird/uikit-react/GroupChannel';
import { ConnectButton } from 'thirdweb/react';

import { useClientWallets } from '@/lib/useClientWallets';
import { client } from '@/app/client';

const SENDBIRD_APP_ID = process.env.NEXT_PUBLIC_SENDBIRD_API_TOKEN || process.env.SENDBIRD_API_TOKEN || '';
const USER_STORECODE = 'admin';

const formatNumber = (value: number | undefined, digits = 2) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
};

const formatUpdatedTime = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const maskAccountNumber = (accountNumber?: string) => {
  if (!accountNumber) {
    return '-';
  }
  const digits = accountNumber.replace(/\s+/g, '');
  if (digits.length <= 4) {
    return digits.replace(/./g, '*');
  }
  const visible = digits.slice(-4);
  const masked = '*'.repeat(Math.max(0, digits.length - 4));
  return `${masked}${visible}`;
};

export default function SellerChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';

  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const address =
    activeAccount?.address ?? activeWallet?.getAccount?.()?.address ?? '';
  const isLoggedIn = Boolean(address);
  const { wallets } = useClientWallets();

  const sellerId = searchParams?.get('sellerId') || '';
  const sellerName = searchParams?.get('sellerName') || sellerId || '판매자';

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [channelUrl, setChannelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [buyerNickname, setBuyerNickname] = useState('');
  const [buyerAvatar, setBuyerAvatar] = useState('');
  const connectingRef = useRef(false);
  const [sellerProfile, setSellerProfile] = useState<any | null>(null);
  const [sellerEscrow, setSellerEscrow] = useState<number | null>(null);
  const [sellerUsdtRate, setSellerUsdtRate] = useState<number | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [marketUpdatedAt, setMarketUpdatedAt] = useState<string | null>(null);
  const promoSentRef = useRef(new Set<string>());

  const displaySellerName = sellerProfile?.nickname || sellerName;
  const isMarketPrice = sellerProfile?.seller?.priceSettingMethod === 'market';
  const marketId = sellerProfile?.seller?.market || 'upbit';
  const marketIdForPrice = isMarketPrice ? marketId : 'upbit';
  const marketLabelMap: Record<string, string> = {
    upbit: '업비트',
    bithumb: '빗썸',
    korbit: '코빗',
  };
  const marketIconMap: Record<string, string> = {
    upbit: '/icon-market-upbit.png',
    bithumb: '/icon-market-bithumb.png',
    korbit: '/icon-market-korbit.png',
  };
  const marketLabel = marketLabelMap[marketId] || '업비트';
  const marketLabelForPrice = marketLabelMap[marketIdForPrice] || '업비트';
  const marketIconForPrice = marketIconMap[marketIdForPrice] || '/icon-market-upbit.png';
  const priceTypeLabel =
    sellerProfile?.seller?.priceSettingMethod === 'market'
      ? `시장가(${marketLabel})`
      : '고정가';

  useEffect(() => {
    if (!isLoggedIn) {
      setSessionToken(null);
      setChannelUrl(null);
      setErrorMessage(null);
      setLoading(false);
      setBuyerNickname('');
      setBuyerAvatar('');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    let active = true;

    const fetchUserProfile = async () => {
      if (!address) {
        return;
      }
      try {
        const response = await fetch('/api/user/getUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storecode: USER_STORECODE,
            walletAddress: address,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || '회원 정보를 불러오지 못했습니다.');
        }
        if (active) {
          setBuyerNickname(data?.result?.nickname || '');
          setBuyerAvatar(data?.result?.avatar || '');
        }
      } catch {
        if (active) {
          setBuyerNickname('');
          setBuyerAvatar('');
        }
      }
    };

    fetchUserProfile();

    return () => {
      active = false;
    };
  }, [address]);

  useEffect(() => {
    let active = true;

    const fetchMarketPrice = async () => {
      try {
        const response = await fetch('/api/markets/usdt-krw');
        const data = await response.json().catch(() => ({}));
        const items = Array.isArray(data?.items)
          ? (data.items as Array<{ id?: string; price?: number }>)
          : [];
        const market = items.find((item) => item?.id === marketIdForPrice);
        if (active) {
          setMarketPrice(typeof market?.price === 'number' ? market.price : null);
          setMarketUpdatedAt(typeof data?.updatedAt === 'string' ? data.updatedAt : null);
        }
      } catch {
        if (active) {
          setMarketPrice(null);
          setMarketUpdatedAt(null);
        }
      }
    };

    fetchMarketPrice();

    return () => {
      active = false;
    };
  }, [marketIdForPrice]);

  useEffect(() => {
    let active = true;

    const fetchSellerProfile = async () => {
      if (!sellerId) {
        setSellerProfile(null);
        setSellerEscrow(null);
        setSellerError(null);
        return;
      }
      setSellerLoading(true);
      setSellerError(null);
      try {
        const response = await fetch('/api/user/getSellerSummary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storecode: USER_STORECODE,
            walletAddress: sellerId,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || '판매자 정보를 불러오지 못했습니다.');
        }
        if (active) {
          setSellerProfile(data?.result?.user || null);
          setSellerEscrow(
            typeof data?.result?.currentUsdtBalance === 'number'
              ? data.result.currentUsdtBalance
              : null,
          );
          setSellerUsdtRate(
            typeof data?.result?.user?.seller?.usdtToKrwRate === 'number'
              ? data.result.user.seller.usdtToKrwRate
              : null,
          );
        }
      } catch (error) {
        if (active) {
          setSellerProfile(null);
          setSellerEscrow(null);
          setSellerUsdtRate(null);
          setSellerError(
            error instanceof Error ? error.message : '판매자 정보를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (active) {
          setSellerLoading(false);
        }
      }
    };

    fetchSellerProfile();

    return () => {
      active = false;
    };
  }, [sellerId]);

  useEffect(() => {
    let active = true;

    const syncSendbirdProfile = async () => {
      if (!address || !buyerNickname) {
        return;
      }
      try {
        await fetch('/api/sendbird/update-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: address,
            nickname: buyerNickname,
            ...(buyerAvatar ? { profileUrl: buyerAvatar } : {}),
          }),
        });
      } catch {
        // ignore sendbird sync errors here
      }
    };

    if (active) {
      syncSendbirdProfile();
    }

    return () => {
      active = false;
    };
  }, [address, buyerAvatar, buyerNickname]);

  useEffect(() => {
    let active = true;

    const sendPromotionMessage = async () => {
      const promotionText = sellerProfile?.seller?.promotionText?.trim?.() || '';
      if (!channelUrl || !sellerId || !promotionText) {
        return;
      }
      if (promoSentRef.current.has(channelUrl)) {
        return;
      }
      try {
        const response = await fetch('/api/sendbird/welcome-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelUrl,
            senderId: sellerId,
            message: promotionText,
          }),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || '프로모션 메시지를 전송하지 못했습니다.');
        }
        if (active) {
          promoSentRef.current.add(channelUrl);
        }
      } catch (error) {
        if (active) {
          console.warn('Failed to send promotion message', error);
        }
      }
    };

    sendPromotionMessage();

    return () => {
      active = false;
    };
  }, [channelUrl, sellerId, sellerProfile?.seller?.promotionText]);

  useEffect(() => {
    let active = true;

    const connectChat = async () => {
      if (!isLoggedIn || !sellerId) {
        return;
      }
      if (sessionToken && channelUrl) {
        return;
      }
      if (connectingRef.current) {
        return;
      }
      if (!buyerNickname) {
        setLoading(false);
        return;
      }
      connectingRef.current = true;
      setLoading(true);
      setErrorMessage(null);

      try {
        const sessionUrl =
          typeof window !== 'undefined'
            ? new URL('/api/sendbird/session-token', window.location.origin)
            : null;
        if (!sessionUrl) {
          throw new Error('세션 요청 URL을 만들지 못했습니다.');
        }
        sessionUrl.searchParams.set('userId', address);
        sessionUrl.searchParams.set('nickname', buyerNickname.trim());
        if (buyerAvatar) {
          sessionUrl.searchParams.set('profileUrl', buyerAvatar);
        }

        const sessionResponse = await fetch(sessionUrl.toString(), {
          method: 'GET',
        });
        if (!sessionResponse.ok) {
          const error = await sessionResponse.json().catch(() => null);
          throw new Error(error?.error || '세션 토큰을 발급하지 못했습니다.');
        }
        const sessionData = (await sessionResponse.json()) as { sessionToken?: string };
        if (!sessionData.sessionToken) {
          throw new Error('세션 토큰이 비어 있습니다.');
        }

        const channelResponse = await fetch('/api/sendbird/group-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerId: address,
            sellerId,
          }),
        });
        if (!channelResponse.ok) {
          const error = await channelResponse.json().catch(() => null);
          throw new Error(error?.error || '채팅 채널을 생성하지 못했습니다.');
        }
        const channelData = (await channelResponse.json()) as { channelUrl?: string };

        if (active) {
          setSessionToken(sessionData.sessionToken);
          setChannelUrl(channelData.channelUrl || null);
        }
      } catch (error) {
        if (active) {
          const message =
            error instanceof Error ? error.message : '채팅을 불러오지 못했습니다.';
          setErrorMessage(message);
        }
      } finally {
        connectingRef.current = false;
        if (active) {
          setLoading(false);
        }
      }
    };

    connectChat();

    return () => {
      active = false;
    };
  }, [address, buyerAvatar, buyerNickname, channelUrl, isLoggedIn, sellerId, sessionToken]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black sm:bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#f0f0f3_45%,#dadce1_100%)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-0 pt-6 pb-0 sm:px-5 sm:py-10">
        <main className="flex flex-1 flex-col overflow-hidden bg-white sm:rounded-[32px] sm:border sm:border-black/10 sm:shadow-[0_34px_90px_-50px_rgba(15,15,18,0.45)] sm:ring-1 sm:ring-black/10">
          <div className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
            <header className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">판매자에게 문의하기</h1>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/60"
                >
                  뒤로
                </button>
              </div>
              <p className="text-sm text-black/60">
                {displaySellerName
                  ? `${displaySellerName} 판매자와 채팅을 시작합니다.`
                  : '판매자와 채팅을 시작합니다.'}
              </p>
            </header>

            <section className="rounded-3xl bg-white/95 p-5 text-black shadow-[0_18px_40px_-24px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                    Seller Profile
                  </p>
                  <p className="text-lg font-semibold tracking-tight">판매자 정보</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-black/5 px-3 py-2 text-xs font-semibold text-black/70">
                  정보 확인
                </div>
              </div>
              {!sellerId ? (
                <p className="mt-3 text-sm text-black/60">판매자 정보를 찾을 수 없습니다.</p>
              ) : sellerLoading ? (
                <p className="mt-3 text-sm text-black/60">판매자 정보를 불러오는 중입니다.</p>
              ) : sellerError ? (
                <p className="mt-3 text-sm text-rose-500">{sellerError}</p>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-[#f2f2f3] shadow-[0_8px_18px_-12px_rgba(0,0,0,0.35)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sellerProfile?.avatar || '/profile-default.png'}
                        alt={displaySellerName || '판매자'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-black/50">
                        Seller
                      </span>
                      <p className="mt-1 text-base font-semibold text-black">
                        {displaySellerName || '판매자'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-black/80">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                        은행
                      </span>
                      <span className="text-sm font-semibold text-black">
                        {sellerProfile?.seller?.bankInfo?.bankName || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                        계좌번호
                      </span>
                      <span className="text-sm font-semibold text-black">
                        {maskAccountNumber(sellerProfile?.seller?.bankInfo?.accountNumber)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                        예금주
                      </span>
                      <span className="text-sm font-semibold text-black">
                        {sellerProfile?.seller?.bankInfo?.accountHolder || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                        에스크로 수량
                      </span>
                      <span className="text-sm font-semibold text-black">
                        {typeof sellerEscrow === 'number'
                          ? `${formatNumber(sellerEscrow, 6)} USDT`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={marketIconForPrice}
                          alt={marketLabelForPrice}
                          className="h-5 w-5 rounded-full"
                        />
                        {marketLabelForPrice} 시세
                      </span>
                      <span className="text-right text-sm font-semibold text-black">
                        {typeof marketPrice === 'number'
                          ? `${formatNumber(marketPrice, 0)} KRW`
                          : '-'}
                        {marketUpdatedAt && (
                          <span className="mt-1 block text-xs font-medium text-black/50">
                            업데이트 {formatUpdatedTime(marketUpdatedAt)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                        USDT 판매금액
                      </span>
                      <span className="text-right text-sm font-semibold text-black">
                        {typeof sellerUsdtRate === 'number'
                          ? `${formatNumber(sellerUsdtRate, 0)} KRW`
                          : '-'}
                        <span className="mt-1 block text-xs font-medium text-black/50">
                          {priceTypeLabel}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-transparent py-5 text-black">
              <div className="flex items-start justify-between gap-3 px-0">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                    Live Chat
                  </p>
                  <p className="text-lg font-semibold tracking-tight">판매자 채팅</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-black/5 px-3 py-2 text-xs font-semibold text-black/70">
                  상담 진행
                </div>
              </div>
              {!sellerId ? (
                <p className="mt-3 px-5 text-sm text-black/60">판매자 정보를 찾을 수 없습니다.</p>
              ) : !isLoggedIn ? (
                <div className="mt-3 flex flex-col gap-3 px-5">
                  <p className="text-sm text-black/60">
                    지갑 연결 후 판매자와 상담할 수 있습니다.
                  </p>
                    <ConnectButton
                      client={client}
                      wallets={wallets}
                      theme="light"
                      connectButton={{
                        label: '웹3 로그인',
                        style: {
                        background: '#ff7a1a',
                        color: '#ffffff',
                        border: '1px solid rgba(255,177,116,0.7)',
                        boxShadow: '0 14px 32px -18px rgba(249,115,22,0.9)',
                        width: '100%',
                        height: '48px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        fontSize: '15px',
                        },
                      }}
                    connectModal={{
                      size: 'wide',
                      showThirdwebBranding: false,
                    }}
                    locale="ko_KR"
                  />
                </div>
              ) : errorMessage ? (
                <p className="mt-3 px-5 text-sm text-rose-500">{errorMessage}</p>
              ) : !buyerNickname ? (
                <p className="mt-3 px-5 text-sm text-black/60">회원 정보를 불러오는 중입니다.</p>
              ) : !sessionToken || !channelUrl ? (
                <p className="mt-3 px-5 text-sm text-black/60">
                  {loading ? '채팅을 준비 중입니다.' : '채팅을 불러오는 중입니다.'}
                </p>
              ) : (
                <div className="mt-4 h-[520px]">
                  <SendbirdProvider
                    appId={SENDBIRD_APP_ID}
                    userId={address}
                    accessToken={sessionToken}
                    theme="light"
                  >
                    <GroupChannel channelUrl={channelUrl} />
                  </SendbirdProvider>
                </div>
              )}
            </section>
          </div>
          <div className="mt-auto px-0 sm:px-5">
            <footer className="mx-0 rounded-none bg-[#1f1f1f] px-0 py-6 pb-0 text-center text-xs text-[#9aa3b2] sm:-mx-5 sm:rounded-b-[32px] sm:px-5 sm:pb-8">
              <div className="px-5 sm:px-0">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-2xl font-semibold tracking-tight text-[#ff8a1f]">
                    Loot69™
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#b6beca]">
                    <Link href={`/${lang}/p2p-buyer/terms-of-service`} className="px-2 hover:text-white">
                      이용약관
                    </Link>
                    <span className="text-[#566072]">|</span>
                    <Link href={`/${lang}/p2p-buyer/privacy-policy`} className="px-2 hover:text-white">
                      개인정보처리방침
                    </Link>
                    <span className="text-[#566072]">|</span>
                    <Link href={`/${lang}/p2p-buyer/refund-policy`} className="px-2 hover:text-white">
                      환불 분쟁 정책
                    </Link>
                  </div>
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-[#8a93a6]">
                  리스크 고지: 가상자산 결제에는 가격 변동 및 네트워크 지연 등 위험이
                  수반될 수 있습니다. 결제 전에 수수료·환율·정산 조건을 확인해 주세요.
                </p>

                <div className="mt-4 space-y-1 text-[11px] text-[#b6beca]">
                  <p>이메일: help@loot.menu</p>
                  <p>주소: 14F, Corner St. Paul &amp; Tombs of the Kings, 8046 Pafos, Cyprus</p>
                </div>

                <p className="mt-4 text-[11px] text-[#6c7688]">
                  Copyright © Loot69 All Rights Reserved
                </p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
