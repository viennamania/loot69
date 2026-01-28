'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AutoConnect, ConnectButton, useActiveAccount, useActiveWallet } from 'thirdweb/react';

import { useClientWallets } from '@/lib/useClientWallets';
import { client } from '@/app/client';

const PRICE_POLL_MS = 8000;
const BANNER_PLACEMENT = 'p2p-home';
const USER_STORECODE = 'admin';
const USDT_DECIMALS = 2;
const KRW_ROUNDING: 'round' | 'floor' | 'ceil' = 'round';
const SELLER_SEARCH_BY =
  (process.env.NEXT_PUBLIC_P2P_BUYER_SELLER_SEARCH_BY as 'accountHolder' | 'nickname') ||
  'accountHolder';
const DEFAULT_BANNERS = [
  { id: 'default-1', title: 'orangex banner 1', image: '/ads/orangex-banner-01.svg' },
  { id: 'default-2', title: 'orangex banner 2', image: '/ads/orangex-banner-02.svg' },
  { id: 'default-3', title: 'orangex banner 3', image: '/ads/orangex-banner-03.svg' },
  { id: 'default-4', title: 'orangex banner 4', image: '/ads/orangex-banner-04.svg' },
  { id: 'default-5', title: 'orangex banner 5', image: '/ads/orangex-banner-05.svg' },
  { id: 'default-6', title: 'orangex banner 6', image: '/ads/orangex-banner-06.svg' },
];

type BannerAd = {
  id: string;
  title: string;
  image: string;
  link?: string;
};

type NoticeItem = {
  title?: string;
  summary?: string;
  publishedAt?: string;
  createdAt?: string;
};

const formatPrice = (value: number | null) => {
  if (value === null) {
    return '--';
  }
  return `${value.toLocaleString('ko-KR')} KRW`;
};

export default function P2PBuyerPage() {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const address =
    activeAccount?.address ?? activeWallet?.getAccount?.()?.address ?? '';
  const isLoggedIn = Boolean(address);
  const { wallets } = useClientWallets();

  const [price, setPrice] = useState<number | null>(null);
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [krwAmount, setKrwAmount] = useState('');
  const [sellerSearchInput, setSellerSearchInput] = useState('');
  const [latestNotice, setLatestNotice] = useState<NoticeItem | null>(null);
  const [isUsdtFirst, setIsUsdtFirst] = useState(true);

  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const isNicknameSearch = SELLER_SEARCH_BY === 'nickname';

  const formatIntegerWithCommas = (value: string) =>
    value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const parseNumericInput = (value: string) => {
    const normalized = value.replace(/,/g, '').trim();
    if (!normalized) {
      return null;
    }
    const numberValue = Number(normalized);
    if (Number.isNaN(numberValue)) {
      return null;
    }
    return numberValue;
  };

  const sanitizeUsdtInput = (value: string) => {
    const raw = value.replace(/,/g, '').replace(/[^0-9.]/g, '');
    if (!raw) {
      return '';
    }
    const dotIndex = raw.indexOf('.');
    const hasDot = dotIndex >= 0;
    const intPartRaw = hasDot ? raw.slice(0, dotIndex) : raw;
    const decimalRaw = hasDot ? raw.slice(dotIndex + 1) : '';
    const intPart = intPartRaw === '' ? '0' : intPartRaw.replace(/^0+(?=\d)/, '');
    const decimal = decimalRaw.replace(/\./g, '').slice(0, USDT_DECIMALS);
    const formattedInt = formatIntegerWithCommas(intPart);
    return hasDot ? `${formattedInt}.${decimal}` : formattedInt;
  };

  const sanitizeKrwInput = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) {
      return '';
    }
    const trimmed = digits.replace(/^0+(?=\d)/, '');
    return formatIntegerWithCommas(trimmed || '0');
  };

  const formatUsdtValue = (value: number) => {
    const fixed = value.toFixed(USDT_DECIMALS);
    const [intPart, decimalPart] = fixed.split('.');
    const formattedInt = formatIntegerWithCommas(intPart);
    return USDT_DECIMALS > 0 ? `${formattedInt}.${decimalPart}` : formattedInt;
  };

  const applyKrwRounding = (value: number) => {
    if (KRW_ROUNDING === 'floor') {
      return Math.floor(value);
    }
    if (KRW_ROUNDING === 'ceil') {
      return Math.ceil(value);
    }
    return Math.round(value);
  };

  const handleUsdtChange = (value: string) => {
    let sanitized = sanitizeUsdtInput(value);
    let numeric = parseNumericInput(sanitized);
    if (numeric !== null && numeric > 1000000) {
      numeric = 1000000;
      sanitized = formatUsdtValue(numeric);
    }
    setUsdtAmount(sanitized);
    if (!price || numeric === null) {
      setKrwAmount('');
      return;
    }
    const next = applyKrwRounding(numeric * price);
    setKrwAmount(formatIntegerWithCommas(String(next)));
  };

  const handleKrwChange = (value: string) => {
    const sanitized = sanitizeKrwInput(value);
    let numeric = parseNumericInput(sanitized);
    if (numeric !== null && numeric > 100000000) {
      numeric = 100000000;
    }
    const capped = numeric !== null ? formatIntegerWithCommas(String(numeric)) : sanitized;
    setKrwAmount(capped);
    if (!price || numeric === null) {
      setUsdtAmount('');
      return;
    }
    const next = numeric / price;
    setUsdtAmount(formatUsdtValue(next));
  };

  const handleSwapInputs = () => {
    if (!price) {
      setIsUsdtFirst((prev) => !prev);
      setUsdtAmount(krwAmount);
      setKrwAmount(usdtAmount);
      return;
    }

    if (isUsdtFirst) {
      const movedNumeric = parseNumericInput(usdtAmount);
      const nextKrwNumeric =
        movedNumeric === null
          ? null
          : Math.min(applyKrwRounding(movedNumeric), 100000000);
      const nextKrwValue =
        nextKrwNumeric === null ? '' : formatIntegerWithCommas(String(nextKrwNumeric));
      const nextUsdtNumeric =
        nextKrwNumeric === null ? null : Math.min(nextKrwNumeric / price, 1000000);
      const nextUsdtValue =
        nextUsdtNumeric === null ? '' : formatUsdtValue(nextUsdtNumeric);
      setKrwAmount(nextKrwValue);
      setUsdtAmount(nextUsdtValue);
    } else {
      const movedNumeric = parseNumericInput(krwAmount);
      const nextUsdtNumeric =
        movedNumeric === null ? null : Math.min(movedNumeric, 1000000);
      const nextUsdtValue =
        nextUsdtNumeric === null ? '' : sanitizeUsdtInput(String(nextUsdtNumeric));
      const nextKrwNumeric =
        nextUsdtNumeric === null
          ? null
          : Math.min(applyKrwRounding(nextUsdtNumeric * price), 100000000);
      const nextKrwValue =
        nextKrwNumeric === null ? '' : formatIntegerWithCommas(String(nextKrwNumeric));
      setUsdtAmount(nextUsdtValue);
      setKrwAmount(nextKrwValue);
    }

    setIsUsdtFirst((prev) => !prev);
  };

  const usdtInput = (
    <div className="relative">
      <input
        value={usdtAmount}
        onChange={(event) => handleUsdtChange(event.target.value)}
        placeholder="0"
        inputMode="decimal"
        disabled={!price}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-16 text-right text-5xl font-extrabold text-black outline-none focus:border-black/30 disabled:bg-gray-100 disabled:text-black/40 sm:text-4xl"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-black/50">
        USDT
      </span>
    </div>
  );

  const krwInput = (
    <div className="relative">
      <input
        value={krwAmount}
        onChange={(event) => handleKrwChange(event.target.value)}
        placeholder="0"
        inputMode="numeric"
        disabled={!price}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-16 text-right text-3xl font-extrabold text-black outline-none focus:border-black/30 disabled:bg-gray-100 disabled:text-black/40 sm:text-2xl"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-black/50">
        KRW
      </span>
    </div>
  );

  const renderBannerImage = (banner: BannerAd) => {
    const content = banner.image.startsWith('http') ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={banner.image}
        alt={banner.title}
        className="h-full w-full object-cover"
      />
    ) : (
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        sizes="204px"
        className="object-cover"
      />
    );

    const frame = (
      <div className="relative h-[120px] w-full overflow-hidden rounded-xl bg-white/80">
        {content}
      </div>
    );

    return banner.link ? (
      <a href={banner.link} target="_blank" rel="noreferrer" className="block">
        {frame}
      </a>
    ) : (
      frame
    );
  };

  const priceUpdatedLabel = useMemo(() => {
    if (!priceUpdatedAt) {
      return '업데이트 대기 중';
    }
    const date = new Date(priceUpdatedAt);
    if (Number.isNaN(date.getTime())) {
      return '업데이트 대기 중';
    }
    return `업데이트 ${date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;
  }, [priceUpdatedAt]);

  useEffect(() => {
    let isMounted = true;
    let intervalId: number | null = null;

    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/market/upbit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error('업비트 시세를 불러오지 못했습니다.');
        }
        const data = (await response.json()) as {
          result?: { trade_price?: number };
        };
        const tradePrice =
          typeof data?.result?.trade_price === 'number' ? data.result.trade_price : null;
        if (isMounted) {
          setPrice(tradePrice);
          setPriceUpdatedAt(new Date().toISOString());
          setPriceError(null);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : '시세를 불러오지 못했습니다.';
          setPriceError(message);
        }
      }
    };

    fetchPrice();
    intervalId = window.setInterval(fetchPrice, PRICE_POLL_MS);

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchLatestNotice = async () => {
      try {
        const response = await fetch('/api/notice/getActive?limit=1');
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || '공지사항을 불러오지 못했습니다.');
        }
        const item = Array.isArray(data?.result) ? data.result[0] : null;
        if (active) {
          setLatestNotice(item || null);
        }
      } catch {
        if (active) {
          setLatestNotice(null);
        }
      }
    };
    fetchLatestNotice();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const generateNickname = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let result = '';
      const randomValues =
        typeof window !== 'undefined' && window.crypto?.getRandomValues
          ? window.crypto.getRandomValues(new Uint8Array(8))
          : null;

      for (let i = 0; i < 8; i += 1) {
        const index = randomValues
          ? randomValues[i] % chars.length
          : Math.floor(Math.random() * chars.length);
        result += chars[index];
      }
      return result;
    };

    const fetchUserProfile = async () => {
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
        setUserProfile(data?.result || null);
      }
      return data?.result || null;
    };

    const ensureUserProfile = async () => {
      if (!address) {
        if (active) {
          setUserProfile(null);
          setProfileLoading(false);
        }
        return;
      }

      try {
        if (active) {
          setProfileLoading(true);
        }
        const existingUser = await fetchUserProfile();
        if (existingUser) {
          if (active) {
            setProfileLoading(false);
          }
          return;
        }

        for (let attempt = 0; attempt < 3; attempt += 1) {
          const nickname = generateNickname();
          const createResponse = await fetch('/api/user/setUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storecode: USER_STORECODE,
              walletAddress: address,
              nickname,
            }),
          });
          const created = await createResponse.json().catch(() => ({}));
          if (createResponse.ok && !created?.result?.error) {
            break;
          }
        }
        await fetchUserProfile();
      } catch (error) {
        console.warn('Failed to ensure user profile', error);
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    ensureUserProfile();

    return () => {
      active = false;
    };
  }, [address]);

  useEffect(() => {
    let active = true;

    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/globalAd/getActive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placement: BANNER_PLACEMENT,
            limit: 5,
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const ads = Array.isArray(data?.result) ? data.result : [];
          const normalized = ads
            .map((ad: any, index: number) => {
            const image =
              ad?.image ||
              ad?.imageUrl ||
              ad?.banner ||
              ad?.bannerImage ||
              ad?.bannerUrl;
            const link =
              ad?.link ||
              ad?.linkUrl ||
              ad?.url ||
              ad?.redirectUrl ||
              ad?.targetUrl;

            if (!image) {
              return null;
            }

            return {
              id: String(ad?._id ?? ad?.id ?? index),
              title: ad?.title || ad?.name || '제휴 배너',
              image,
              link,
            } as BannerAd;
          })
          .filter(Boolean) as BannerAd[];

        if (active) {
          if (normalized.length > 0) {
            const merged = [...normalized];
            if (merged.length < 6) {
              DEFAULT_BANNERS.forEach((fallback) => {
                if (merged.length < 6) {
                  merged.push({ ...fallback, link: '' });
                }
              });
            }
            setBannerAds(merged.slice(0, 6));
          } else {
            setBannerAds(DEFAULT_BANNERS.map((banner) => ({ ...banner, link: '' })));
          }
        }
      } catch (error) {
        if (active) {
          setBannerAds(DEFAULT_BANNERS.map((banner) => ({ ...banner, link: '' })));
        }
      } finally {
        if (active) {
          setBannerLoading(false);
        }
      }
    };

    fetchBanner();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black sm:bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#f0f0f3_45%,#dadce1_100%)]">
      <AutoConnect client={client} wallets={wallets} />
      {!bannerLoading && bannerAds.length > 0 && (
        <div className="fixed left-6 top-1/2 hidden -translate-y-1/2 lg:flex">
        <div className="flex w-[220px] flex-col gap-3">
          {bannerAds.slice(0, 3).map((banner) => (
            <div
              key={`left-${banner.id}`}
              className="rounded-2xl border border-black/10 bg-white/90 p-2 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.35)] backdrop-blur"
            >
              {renderBannerImage(banner)}
            </div>
          ))}
        </div>
      </div>
      )}
      {!bannerLoading && bannerAds.length > 0 && (
        <div className="fixed right-6 top-1/2 hidden -translate-y-1/2 lg:flex">
        <div className="flex w-[220px] flex-col gap-3">
          {bannerAds.slice(3, 6).map((banner) => (
            <div
              key={`right-${banner.id}`}
              className="rounded-2xl border border-black/10 bg-white/90 p-2 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.35)] backdrop-blur"
            >
              {renderBannerImage(banner)}
            </div>
          ))}
        </div>
      </div>
      )}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-0 pt-6 pb-0 sm:px-5 sm:py-10">
        <main className="flex flex-1 flex-col overflow-hidden bg-white sm:rounded-[32px] sm:border sm:border-black/10 sm:shadow-[0_34px_90px_-50px_rgba(15,15,18,0.45)] sm:ring-1 sm:ring-black/10">
          <div className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
            <section className="flex items-center justify-between gap-4 px-1">
              <div className="min-w-0">
                <p className="truncate text-xl font-extrabold text-black">
                  {latestNotice?.title || latestNotice?.summary || '공지사항'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${lang}/p2p-buyer/notice`}
                  className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/60"
                >
                  공지사항 보러가기
                  <span className="text-base text-black/60">›</span>
                </Link>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-70"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                </span>
              </div>
            </section>

            <header className="flex flex-col gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">구매자 전용</h1>
              <p className="text-sm text-black/60">
                테더(USDT) 구매를 빠르고 안전하게.
              </p>
            </header>

            <section className="py-4 text-black pb-14">
              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const trimmed = sellerSearchInput.trim();
                  const destination = trimmed
                    ? `/${lang}/p2p-buyer/seller-search?query=${encodeURIComponent(trimmed)}&searchBy=${SELLER_SEARCH_BY}`
                    : `/${lang}/p2p-buyer/seller-search`;
                  router.push(destination);
                }}
              >
                <div className="relative flex h-16 flex-1 items-center border-b-2 border-black/80 bg-transparent px-0">
                  <span className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 -mt-2 items-center justify-center rounded-full bg-white text-black/70">
                    🔎
                  </span>
                  <input
                    value={sellerSearchInput}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      if (isNicknameSearch) {
                        const sanitized = nextValue
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '');
                        setSellerSearchInput(sanitized);
                        return;
                      }
                      const sanitized = nextValue.replace(/[^a-zA-Z가-힣]/g, '');
                      setSellerSearchInput(sanitized);
                    }}
                    placeholder={
                      SELLER_SEARCH_BY === 'nickname'
                        ? '판매자 회원 아이디를 입력하세요'
                        : '판매자 계좌 예금주 이름을 입력하세요'
                    }
                    inputMode={isNicknameSearch ? ('latin' as any) : 'text'}
                    lang={isNicknameSearch ? 'en' : 'ko'}
                    pattern={isNicknameSearch ? '[a-z0-9]*' : '[A-Za-z가-힣]*'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="h-full w-full bg-transparent pl-12 pr-2 pt-1 pb-4 text-center text-lg font-extrabold leading-relaxed text-black placeholder:font-extrabold placeholder:text-black focus:outline-none sm:text-lg sm:text-left"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!sellerSearchInput.trim()}
                  className="flex h-16 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-lg font-extrabold leading-none text-black shadow-[0_12px_28px_-22px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-base">👤</span>
                  판매자 찾기
                </button>
              </form>
              <p className="mt-4 text-xs text-black/60">
                {SELLER_SEARCH_BY === 'nickname'
                  ? '판매자 회원 아이디로 판매자를 조회합니다.'
                  : '은행 계좌 예금주 이름으로 판매자를 조회합니다.'}
              </p>
            </section>

            <section className="rounded-3xl border border-black/10 bg-[#0f0f12] p-5 text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <Image src="/logo-upbit.jpg" alt="Upbit" width={40} height={40} className="rounded-full" />
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  업비트 USDT
                </p>
              </div>
              <div className="mt-3 text-right text-3xl font-semibold">{formatPrice(price)}</div>
              <div className="mt-2 text-right text-xs text-white/60">{priceUpdatedLabel}</div>
              {priceError && (
                <p className="mt-3 text-xs text-rose-300">{priceError}</p>
              )}
            </section>

            <section className="border-y border-black/15 bg-transparent px-0 py-6 text-black">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                    USDT Calculator
                  </p>
                  <p className="text-lg font-semibold tracking-tight">USDT 계산기</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-black/5 px-3 py-2 text-xs font-semibold text-black/70">
                  1 USDT = {price ? price.toLocaleString('ko-KR') : '--'} KRW
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {isUsdtFirst ? usdtInput : krwInput}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleSwapInputs}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-base text-black/50"
                  >
                    ⇄
                  </button>
                </div>
                {isUsdtFirst ? krwInput : usdtInput}
              </div>
              <p className="mt-3 text-xs text-black/60">
                업비트 시세 기준으로 자동 계산됩니다.
              </p>
            </section>

            <section className="rounded-3xl border border-black/10 bg-[#0f0f12] p-5 text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Web3 Login
              </p>
              <div className="mt-3">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141416] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={userProfile?.avatar || '/profile-default.png'}
                          alt="회원 프로필"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                          Member ID
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {profileLoading ? '불러오는 중...' : userProfile?.nickname || 'guest'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/${lang}/p2p-buyer/buyer-settings`)}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      회원정보
                    </button>
                  </div>
                ) : (
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
                        borderRadius: '16px',
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
                )}
              </div>
              <p className="mt-3 text-xs text-white/60">
                {isLoggedIn
                  ? '로그인 완료. 지금 바로 상담이 가능합니다.'
                  : '로그인 후 상담을 바로 시작할 수 있습니다.'}
              </p>
            </section>
            <section className="rounded-3xl border border-black/10 bg-white/90 p-4 text-black shadow-[0_18px_40px_-28px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-200/80 bg-orange-100 text-xl font-semibold text-orange-600 shadow-[0_8px_20px_-12px_rgba(249,115,22,0.55)]">
                    ⚡
                  </div>
                  <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-black/40">
                    Advanced
                  </p>
                  <p className="text-base font-semibold tracking-tight">전문가용 바로가기</p>
                  <p className="text-xs text-black/60">
                    고급 기능과 상세 매매 화면으로 이동합니다.
                  </p>
                  </div>
                </div>
                <a
                  href="https://www.loot.menu/ko/p2p"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff7a1a] px-4 text-xs font-semibold text-white shadow-[0_10px_24px_-16px_rgba(249,115,22,0.9)]"
                >
                  이동
                </a>
              </div>
            </section>

            {!bannerLoading && bannerAds.length > 0 && (
              <div className="-mx-5 mt-6 border-t border-black/5 px-5 pb-8 lg:hidden">
                <p className="pt-4 text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
                  Banner Ads
                </p>
                <div className="mt-4 grid gap-4">
                  {bannerAds.map((banner) => (
                    <div
                      key={`mobile-${banner.id}`}
                      className="rounded-2xl border border-black/10 bg-white/90 p-2 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.35)]"
                    >
                      {renderBannerImage(banner)}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
