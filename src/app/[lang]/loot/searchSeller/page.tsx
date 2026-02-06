'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client } from '@/app/client';
import { useClientWallets } from '@/lib/useClientWallets';
import { chain as chainId } from '@/app/config/contractAddresses';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';

type SellerRecord = {
    id?: number;
    nickname?: string;
    walletAddress?: string;
    avatar?: string;
    seller?: {
        usdtToKrwRate?: number;
        status?: string;
        enabled?: boolean;
        escrowWalletAddress?: string;
        promotionText?: string;
    };
    currentUsdtBalance?: number;
};

const storecode = 'admin';
const activeChainId = chainId || 'bsc';
const chainObj = (() => {
    switch (activeChainId) {
        case 'ethereum':
            return ethereum;
        case 'polygon':
            return polygon;
        case 'arbitrum':
            return arbitrum;
        default:
            return bsc;
    }
})();

function formatNumber(value?: number) {
    if (!Number.isFinite(value)) return '-';
    return Number(value).toLocaleString('ko-KR');
}

function formatWallet(address?: string) {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SearchSellerPage() {
    const params = useParams<{ lang: string }>();
    const lang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang ?? 'ko';
    const router = useRouter();
    const { wallets } = useClientWallets();
    const activeAccount = useActiveAccount();
    const address = activeAccount?.address;

    const [sellers, setSellers] = useState<SellerRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [refreshIndex, setRefreshIndex] = useState(0);
    const [buyerInfo, setBuyerInfo] = useState<{ nickname?: string; depositName?: string; receiveWallet?: string }>({});
    const [userLoading, setUserLoading] = useState(false);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        async function loadSellers() {
            setLoading(true);
            setError(null);
            try {
                const PAGE_SIZE = 200;
                let page = 1;
                let totalCount = Number.POSITIVE_INFINITY;
                const aggregated: SellerRecord[] = [];

                while (!ignore && aggregated.length < totalCount && page <= 50) {
                    const response = await fetch('/api/user/getAllSellersForBalance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ storecode, limit: PAGE_SIZE, page }),
                        signal: controller.signal,
                    });
                    const payload = await response.json();
                    if (!response.ok) {
                        throw new Error(payload?.error || '판매자 정보를 불러오지 못했습니다.');
                    }

                    const batch: SellerRecord[] = payload?.result?.users ?? [];
                    totalCount = payload?.result?.totalCount ?? batch.length ?? 0;

                    // dedupe by walletAddress to be safe
                    for (const item of batch) {
                        const key = item.walletAddress || item.nickname || String(item.id);
                        if (!aggregated.some((s) => (s.walletAddress || s.nickname || String(s.id)) === key)) {
                            aggregated.push(item);
                        }
                    }

                    if (batch.length < PAGE_SIZE) break;
                    page += 1;
                }

                if (!ignore) {
                    setSellers(aggregated);
                }
            } catch (err) {
                if (!ignore && !(err instanceof DOMException)) {
                    setError('판매자 정보를 불러오는 중 문제가 발생했습니다.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadSellers();
        return () => {
            ignore = true;
            controller.abort();
        };
    }, [refreshIndex]);

    useEffect(() => {
        let cancelled = false;
        const loadUser = async () => {
            if (!address) return;
            setUserLoading(true);
            try {
                const res = await fetch('/api/user/getUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storecode, walletAddress: address }),
                });
                const data = await res.json().catch(() => ({}));
                if (!cancelled && data?.result) {
                    setBuyerInfo({
                        nickname: data.result.nickname || '',
                        depositName: data.result.buyer?.bankInfo?.accountHolder || data.result.buyer?.depositName || '',
                        receiveWallet: data.result.buyer?.receiveWalletAddress || '',
                    });
                }
            } finally {
                if (!cancelled) setUserLoading(false);
            }
        };
        loadUser();
        return () => {
            cancelled = true;
        };
    }, [address]);

    const filteredSellers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const minValue = Number(minRate);
        const maxValue = Number(maxRate);

        return sellers.filter((seller) => {
            const nickname = seller.nickname?.toLowerCase() ?? '';
            const rate = Number(seller.seller?.usdtToKrwRate || 0);

            if (normalizedQuery && !nickname.includes(normalizedQuery)) {
                return false;
            }
            if (Number.isFinite(minValue) && minRate !== '' && rate < minValue) {
                return false;
            }
            if (Number.isFinite(maxValue) && maxRate !== '' && rate > maxValue) {
                return false;
            }
            return true;
        });
    }, [sellers, query, minRate, maxRate]);

    return (
        <main className="min-h-[100vh] bg-[#05070f] px-4 pb-16 pt-10 text-slate-100">
            <div className="mx-auto w-full max-w-[780px]">
                <div className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-900/20 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1 break-words">
                            <p className="text-xs text-emerald-100/80">내 구매자 정보</p>
                            <h2 className="text-lg font-bold text-white">
                                {buyerInfo.nickname || (userLoading ? '불러오는 중...' : '닉네임 없음')}
                            </h2>
                            <p className="text-sm text-emerald-100/80">
                                입금자명: {buyerInfo.depositName || (userLoading ? '...' : '미설정')}
                            </p>
                            <div className="text-sm text-emerald-100/80 space-y-1">
                                <p>USDT 받을 지갑주소:</p>
                                <p className="font-mono text-[13px] break-all text-emerald-50">
                                    {buyerInfo.receiveWallet
                                        ? buyerInfo.receiveWallet
                                        : userLoading
                                        ? '...'
                                        : '미설정'}
                                </p>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[180px]">
                            {!address ? (
                                <ConnectButton
                                    client={client}
                                    wallets={wallets}
                                    chain={chainObj}
                                    theme="dark"
                                    connectButton={{
                                        label: '웹3 로그인',
                                        style: {
                                            height: 44,
                                            borderRadius: 12,
                                            background: '#0f172a',
                                            color: '#e2e8f0',
                                            fontWeight: 700,
                                            border: '1px solid rgba(94,234,212,0.4)',
                                            width: '100%',
                                        },
                                    }}
                                    locale={lang === 'ko' ? 'ko_KR' : 'en_US'}
                                />
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/${lang}/loot/buyer-bankinfo-settings`)}
                                        className="w-full rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/30"
                                    >
                                        구매자 입금은행 정보 설정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/${lang}/loot/buyer-receive-wallet-settings`)}
                                        className="w-full rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/30"
                                    >
                                        USDT 받을 지갑주소 설정
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search</p>
                        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                            판매자 검색
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            판매자 아이디와 판매금액(USDT당 KRW)을 기준으로 빠르게 찾을 수 있습니다.
                        </p>
                    </div>
                    <Link
                        href={`/${lang}/loot`}
                        className="rounded-full border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200"
                    >
                        홈으로
                    </Link>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                    <div className="grid gap-3 sm:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="판매자 아이디"
                            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                        <input
                            value={minRate}
                            onChange={(event) => setMinRate(event.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="최소 금액"
                            inputMode="numeric"
                            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                        <input
                            value={maxRate}
                            onChange={(event) => setMaxRate(event.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="최대 금액"
                            inputMode="numeric"
                            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setMinRate('');
                                setMaxRate('');
                            }}
                            className="rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200"
                        >
                            초기화
                        </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <span>검색 결과: {filteredSellers.length.toLocaleString('ko-KR')}명</span>
                        <button
                            type="button"
                            onClick={() => setRefreshIndex((prev) => prev + 1)}
                            className="text-xs font-semibold text-slate-300 underline underline-offset-4 decoration-slate-600/70"
                        >
                            새로고침
                        </button>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {loading && (
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 text-sm text-slate-400">
                            판매자 정보를 불러오는 중입니다.
                        </div>
                    )}
                    {error && (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200">
                            {error}
                        </div>
                    )}
                    {!loading && !error && filteredSellers.length === 0 && (
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 text-sm text-slate-400">
                            조건에 맞는 판매자가 없습니다.
                        </div>
                    )}
                    {!loading &&
                        !error &&
                        filteredSellers.map((seller) => (
                            <div
                                key={seller.walletAddress ?? seller.nickname ?? String(seller.id)}
                                className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-800/70 bg-slate-900/60">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={seller.avatar || '/profile-default.png'}
                                                alt={`${seller.nickname || '판매자'} avatar`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-white">
                                                {seller.nickname || '판매자'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatWallet(seller.walletAddress)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-slate-500">판매금액(원)</p>
                                        <p className="text-lg font-semibold text-emerald-200">
                                            {formatNumber(seller.seller?.usdtToKrwRate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                    <span className="rounded-full border border-slate-700/70 bg-slate-900/60 px-2.5 py-1">
                                        에스크로 잔액 {formatNumber(seller.currentUsdtBalance)} USDT
                                    </span>
                                    <span className="rounded-full border border-slate-700/70 bg-slate-900/60 px-2.5 py-1">
                                        상태 {seller.seller?.enabled ? '활성' : '비활성'}
                                    </span>
                                    {seller.seller?.escrowWalletAddress && (
                                      <Link
                                        href={`/${lang}/loot/escrow/${seller.seller.escrowWalletAddress}`}
                                        className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100 underline decoration-emerald-300/60 underline-offset-4"
                                      >
                                        판매자에게 문의하기
                                      </Link>
                                    )}
                                </div>
                                {seller.seller?.promotionText && (
                                    <p className="mt-3 text-xs text-slate-400">
                                        {seller.seller.promotionText}
                                    </p>
                                )}
                            </div>
                        ))}
                </div>

                <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
                    <span>필터 조건은 입력 즉시 적용됩니다.</span>
                    <Link
                        href={`/${lang}/loot/buy`}
                        className="text-xs font-semibold text-slate-300 underline underline-offset-4 decoration-slate-600/70"
                    >
                        전체 구매로 이동 →
                    </Link>
                </div>
            </div>
        </main>
    );
}
