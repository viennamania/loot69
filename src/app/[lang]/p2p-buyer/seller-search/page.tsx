'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

const USER_STORECODE = 'admin';
const DEFAULT_AVATAR = '/profile-default.png';
const SELLER_SEARCH_BY =
  (process.env.NEXT_PUBLIC_P2P_BUYER_SELLER_SEARCH_BY as 'accountHolder' | 'nickname') ||
  'accountHolder';

type SellerResult = {
  id?: string | number;
  nickname?: string;
  avatar?: string;
  walletAddress?: string;
  currentUsdtBalance?: number;
  seller?: {
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    };
    usdtToKrwRate?: number;
  };
};

const formatAddress = (address?: string) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

const formatNumber = (value: number | undefined, digits = 2) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
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

export default function SellerSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SellerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adSeller, setAdSeller] = useState<SellerResult | null>(null);

  const resultCountLabel = useMemo(() => {
    if (!searched) {
      return '';
    }
    return `${results.length}건`;
  }, [results.length, searched]);

  const searchByParam = searchParams?.get('searchBy');
  const searchBy =
    searchByParam === 'nickname' || searchByParam === 'accountHolder'
      ? searchByParam
      : SELLER_SEARCH_BY;
  const isNicknameSearch = searchBy === 'nickname';

  const sanitizeQuery = (value: string) => {
    if (isNicknameSearch) {
      return value.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    return value.replace(/[^a-zA-Z가-힣]/g, '');
  };

  const executeSearch = async (value: string) => {
    const trimmed = sanitizeQuery(value).trim();
    if (!trimmed) {
      setErrorMessage(
        searchBy === 'nickname'
          ? '판매자 회원 아이디를 입력해 주세요.'
          : '판매자 예금주 이름을 입력해 주세요.',
      );
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSearched(true);
    try {
      const response = await fetch('/api/user/searchSellersByBankAccountHolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: USER_STORECODE,
          query: trimmed,
          searchBy,
          limit: 20,
          page: 1,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || '판매자 조회에 실패했습니다.');
      }
      setResults((data?.result?.users as SellerResult[]) || []);
    } catch (error) {
      setResults([]);
      setErrorMessage(
        error instanceof Error ? error.message : '판매자 조회에 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await executeSearch(query);
  };

  useEffect(() => {
    const initialQuery = searchParams?.get('query');
    if (initialQuery) {
      const normalized = sanitizeQuery(initialQuery);
      setQuery(normalized);
      executeSearch(normalized);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!results.length) {
      setAdSeller(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * results.length);
    setAdSeller(results[randomIndex]);
  }, [results]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black sm:bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#f0f0f3_45%,#dadce1_100%)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-0 pt-6 pb-0 sm:px-5 sm:py-10">
        <main className="flex flex-1 flex-col overflow-hidden bg-white sm:rounded-[32px] sm:border sm:border-black/10 sm:shadow-[0_34px_90px_-50px_rgba(15,15,18,0.45)] sm:ring-1 sm:ring-black/10">
          <div className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
            <header className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">판매자 찾기</h1>
                <button
                  type="button"
                  onClick={() => router.push(`/${lang}/p2p-buyer`)}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/60"
                >
                  뒤로
                </button>
              </div>
              <p className="text-sm text-black/60">
                {searchBy === 'nickname'
                  ? '판매자 회원 아이디로 판매자를 조회합니다.'
                  : '판매자 은행계좌의 예금주 이름으로 판매자를 조회합니다.'}
              </p>
            </header>

            <section className="py-4 text-black pb-14">
              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSearch();
                }}
              >
                <div className="relative flex h-16 flex-1 items-center border-b-2 border-black/80 bg-transparent px-0">
                  <span className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 -mt-2 items-center justify-center rounded-full bg-white text-black/70">
                    🔎
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(sanitizeQuery(event.target.value))}
                    placeholder={
                      searchBy === 'nickname'
                        ? '판매자 회원 아이디를 입력하세요'
                        : '판매자 계좌 예금주 이름을 입력하세요'
                    }
                    inputMode={isNicknameSearch ? ('latin' as any) : 'text'}
                    pattern={isNicknameSearch ? '[a-z0-9]*' : '[A-Za-z가-힣]*'}
                    lang={isNicknameSearch ? 'en' : 'ko'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="h-full w-full bg-transparent pl-12 pr-2 pt-1 pb-4 text-center text-lg font-extrabold leading-relaxed text-black placeholder:font-extrabold placeholder:text-black focus:outline-none sm:text-lg sm:text-left"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="flex h-16 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-lg font-extrabold leading-none text-black shadow-[0_12px_28px_-22px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-base">👤</span>
                  판매자 찾기
                </button>
              </form>
              <p className="mt-4 text-xs text-black/60">
                {searchBy === 'nickname'
                  ? '판매자 회원 아이디로 판매자를 조회합니다.'
                  : '은행 계좌 예금주 이름으로 판매자를 조회합니다.'}
              </p>
              {errorMessage && (
                <p className="mt-2 text-xs text-rose-500">{errorMessage}</p>
              )}
            </section>

            <section className="border-y border-black/10 bg-transparent px-0 py-6 text-black">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                  Results
                </p>
                {searched && (
                  <span className="text-xs text-black/60">{resultCountLabel}</span>
                )}
              </div>
              {loading && (
                <p className="mt-3 text-xs text-black/60">검색 중입니다...</p>
              )}
              {!loading && searched && results.length === 0 && (
                <p className="mt-3 text-xs text-black/60">
                  검색 결과가 없습니다.
                </p>
              )}
              {searched && !loading && adSeller && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-orange-600">
                    광고
                  </p>
                  <div className="mt-3 rounded-3xl border border-black/10 bg-white px-4 py-4 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.22)]">
                    {(() => {
                      const bankInfo = adSeller?.seller?.bankInfo || {};
                      const usdtRate = adSeller?.seller?.usdtToKrwRate;
                      const escrowBalance = adSeller?.currentUsdtBalance;
                      const usdtRateLabel =
                        typeof usdtRate === 'number'
                          ? `${formatNumber(usdtRate, 0)} KRW`
                          : '-';
                      const escrowBalanceLabel =
                        typeof escrowBalance === 'number'
                          ? `${formatNumber(escrowBalance, 6)} USDT`
                          : '-';
                      const displayName =
                        adSeller?.nickname ||
                        formatAddress(adSeller?.walletAddress) ||
                        '판매자';
                      const adChatHref = adSeller?.walletAddress
                        ? `/${lang}/p2p-buyer/seller-chat?sellerId=${encodeURIComponent(
                            adSeller.walletAddress,
                          )}&sellerName=${encodeURIComponent(displayName)}`
                        : null;
                      return (
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-[#f2f2f3] shadow-[0_8px_18px_-12px_rgba(0,0,0,0.35)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={adSeller?.avatar || DEFAULT_AVATAR}
                                  alt={displayName}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-black/50">
                                  Seller
                                </span>
                                <p className="mt-1 text-base font-semibold text-black">
                                  {displayName}
                                </p>
                              </div>
                            </div>
                            <span className="rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-700 shadow-[0_8px_18px_-12px_rgba(249,115,22,0.55)]">
                              광고
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 text-sm text-black/80">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                                  은행
                                </p>
                                <p className="mt-1 text-sm font-semibold text-black">
                                  {bankInfo.bankName || '-'}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                                  계좌번호
                                </p>
                                <p className="mt-1 text-sm font-semibold text-black">
                                  {maskAccountNumber(bankInfo.accountNumber)}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                                  예금주
                                </p>
                                <p className="mt-1 text-sm font-semibold text-black">
                                  {bankInfo.accountHolder || '-'}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                                  에스크로 수량
                                </p>
                                <p className="mt-1 text-sm font-semibold text-black">
                                  {escrowBalanceLabel}
                                </p>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-orange-200 bg-orange-50/80 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600">
                                USDT 판매금액
                              </p>
                              <p className="mt-1 text-sm font-semibold text-orange-900">
                                {usdtRateLabel}
                              </p>
                            </div>
                            <div className="pt-1">
                              {adChatHref ? (
                                <Link
                                  href={adChatHref}
                                  className="inline-flex w-full items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-[0_10px_24px_-16px_rgba(249,115,22,0.35)]"
                                >
                                  판매자에게 문의하기
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/40"
                                >
                                  판매자에게 문의하기
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              {adSeller && (
                <div className="mt-10 flex items-center gap-4">
                  <span className="h-px flex-1 bg-black/10"></span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-black/40">
                    Results
                  </span>
                  <span className="h-px flex-1 bg-black/10"></span>
                </div>
              )}
              <div className={adSeller ? 'mt-6 grid gap-4' : 'mt-4 grid gap-4'}>
                {results
                  .filter((seller) => {
                    if (!adSeller) {
                      return true;
                    }
                    const sellerKey = seller.walletAddress || String(seller.id ?? '');
                    const adKey = adSeller.walletAddress || String(adSeller.id ?? '');
                    return !sellerKey || sellerKey !== adKey;
                  })
                  .map((seller, index) => {
                  const bankInfo = seller?.seller?.bankInfo || {};
                  const usdtRate = seller?.seller?.usdtToKrwRate;
                  const escrowBalance = seller?.currentUsdtBalance;
                  const usdtRateLabel =
                    typeof usdtRate === 'number'
                      ? `${formatNumber(usdtRate, 0)} KRW`
                      : '-';
                  const escrowBalanceLabel =
                    typeof escrowBalance === 'number'
                      ? `${formatNumber(escrowBalance, 6)} USDT`
                      : '-';
                  const displayName =
                    seller?.nickname || formatAddress(seller?.walletAddress) || '판매자';
                  const chatHref = seller?.walletAddress
                    ? `/${lang}/p2p-buyer/seller-chat?sellerId=${encodeURIComponent(
                        seller.walletAddress,
                      )}&sellerName=${encodeURIComponent(displayName)}`
                    : null;
                  return (
                    <div
                      key={`${seller?.walletAddress || 'seller'}-${index}`}
                      className="rounded-3xl border border-black/10 bg-white px-4 py-4 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.22)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-[#f2f2f3] shadow-[0_8px_18px_-12px_rgba(0,0,0,0.35)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={seller?.avatar || DEFAULT_AVATAR}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                          <div>
                            <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-black/50">
                              Seller
                            </span>
                            <p className="mt-1 text-base font-semibold text-black">{displayName}</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/60">
                          Verified
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-black/80">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                              은행
                            </p>
                            <p className="mt-1 text-sm font-semibold text-black">
                              {bankInfo.bankName || '-'}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                              계좌번호
                            </p>
                            <p className="mt-1 text-sm font-semibold text-black">
                              {maskAccountNumber(bankInfo.accountNumber)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                              예금주
                            </p>
                            <p className="mt-1 text-sm font-semibold text-black">
                              {bankInfo.accountHolder || '-'}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                              에스크로 수량
                            </p>
                            <p className="mt-1 text-sm font-semibold text-black">
                              {escrowBalanceLabel}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-orange-200 bg-orange-50/80 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600">
                            USDT 판매금액
                          </p>
                          <p className="mt-1 text-sm font-semibold text-orange-900">
                            {usdtRateLabel}
                          </p>
                        </div>
                        <div className="pt-1">
                          {chatHref ? (
                            <Link
                              href={chatHref}
                              className="inline-flex w-full items-center justify-center rounded-full border border-black bg-black px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.35)]"
                            >
                              판매자에게 문의하기
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/40"
                            >
                              판매자에게 문의하기
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
