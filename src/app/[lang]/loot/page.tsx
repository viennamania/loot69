'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Rajdhani, Space_Grotesk } from 'next/font/google';
import SendbirdProvider from '@sendbird/uikit-react/SendbirdProvider';
import GroupChannel from '@sendbird/uikit-react/GroupChannel';
import { AutoConnect, useActiveAccount } from 'thirdweb/react';
import { useClientWallets } from '@/lib/useClientWallets';
import { client } from '@/app/client';


const displayFont = Rajdhani({
    subsets: ['latin'],
    weight: ['600', '700'],
    variable: '--font-display',
});

const bodyFont = Space_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-body',
});

const SENDBIRD_APP_ID = process.env.NEXT_PUBLIC_SENDBIRD_API_TOKEN || process.env.SENDBIRD_API_TOKEN || '';
const SUPPORT_ADMIN_ID = 'lootManager';
const SUPPORT_REQUEST_TIMEOUT_MS = 12000;

const STAT_ITEMS = [
    {
        label: '누적 정산량',
        value: 12876432,
        suffix: 'USDT',
    },
    {
        label: '누적 결제금액',
        value: 51298412000,
        suffix: 'KRW',
    },
];

const SCROLL_BANNER_ADS = [
    { id: 1, title: 'Binance Pay', image: '/images/crypto-1218x350-1.gif', link: 'https://pay.binance.com' },
    { id: 2, title: 'CoinPayments', image: '/images/ad-2.gif', link: 'https://www.coinpayments.net' },
    { id: 3, title: 'NOWPayments', image: '/images/ad-3.gif', link: 'https://nowpayments.io' },
    { id: 4, title: 'Crypto.com Pay', image: '/images/ad-4.gif', link: 'https://pay.crypto.com' },
];

type StablecoinNewsItem = {
    id: string;
    title: string;
    source: string;
    publishedAt: string;
    tag: string;
    url: string;
    image: string;
};

type BannerAd = {
    id: string;
    title: string;
    image: string;
    link: string;
};

type NoticeSummary = {
    id: string;
    title: string;
    summary: string;
    date: string;
};

type SupportDebugEntry = {
    phase: 'session' | 'channel' | 'find';
    endpoint: string;
    status?: number;
    ok?: boolean;
    durationMs?: number;
    error?: string;
    timestamp: string;
};

const STABLECOIN_NEWS: StablecoinNewsItem[] = [
    {
        id: 'stable-news-01',
        title: 'USDC 투명성 보고서: 준비금 구성 최신 업데이트',
        source: 'Circle',
        publishedAt: '2024-02-14T02:00:00.000Z',
        tag: '리포트',
        url: 'https://www.circle.com/en/transparency',
        image: '/icon-vault.png',
    },
    {
        id: 'stable-news-02',
        title: 'Tether 분기 준비금 인증 보고서 공개',
        source: 'Tether',
        publishedAt: '2024-02-13T23:00:00.000Z',
        tag: '어테스테이션',
        url: 'https://tether.to/en/transparency/',
        image: '/logo-tether.png',
    },
    {
        id: 'stable-news-03',
        title: '미국 스테이블코인 규제 프레임워크 논의 확대',
        source: 'CoinDesk',
        publishedAt: '2024-02-13T10:00:00.000Z',
        tag: '규제',
        url: 'https://www.coindesk.com/tag/stablecoins/',
        image: '/icon-shield.png',
    },
    {
        id: 'stable-news-04',
        title: '유럽 MiCA 시행 이후 스테이블코인 시장 영향 분석',
        source: 'The Block',
        publishedAt: '2024-02-13T03:00:00.000Z',
        tag: '시장',
        url: 'https://www.theblock.co/search?query=stablecoin',
        image: '/icon-market.png',
    },
    {
        id: 'stable-news-05',
        title: 'PayPal USD 확장: 파트너 지갑과 결제 인프라 확대',
        source: 'PayPal',
        publishedAt: '2024-02-12T12:00:00.000Z',
        tag: '확장',
        url: 'https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd',
        image: '/icon-wallet.png',
    },
    {
        id: 'stable-news-06',
        title: '신규 체인에서의 스테이블코인 결제 속도 개선 사례',
        source: 'Messari',
        publishedAt: '2024-02-12T06:00:00.000Z',
        tag: '테크',
        url: 'https://messari.io/report',
        image: '/icon-blockchain.png',
    },
    {
        id: 'stable-news-07',
        title: '아시아 결제 네트워크에서의 스테이블코인 활용 증가',
        source: 'Bloomberg',
        publishedAt: '2024-02-11T04:00:00.000Z',
        tag: '결제',
        url: 'https://www.bloomberg.com/search?query=stablecoin',
        image: '/icon-payment.png',
    },
    {
        id: 'stable-news-08',
        title: '스테이블코인 리스크 관리와 준비금 운영 가이드',
        source: 'IMF',
        publishedAt: '2024-02-11T01:00:00.000Z',
        tag: '리스크',
        url: 'https://www.imf.org/en/Topics/Fintech',
        image: '/icon-stability.png',
    },
];

const STAT_CARD_STYLES = [
    {
        base: 'bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] border border-slate-800/70',
        orb: 'bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25)_0%,transparent_70%)]',
        value: 'text-emerald-200',
    },
    {
        base: 'bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] border border-slate-800/70',
        orb: 'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22)_0%,transparent_70%)]',
        value: 'text-cyan-200',
    },
];

type MarketId = 'upbit' | 'bithumb' | 'korbit';
type MarketTicker = {
    id: MarketId;
    name: string;
    price: number | null;
    error?: string;
};

const MARKET_SOURCES: MarketTicker[] = [
    { id: 'upbit', name: '업비트', price: null },
];

type TradeTone = 'buy' | 'sell' | 'pending';
type RecentTrade = {
    id: string;
    tone: TradeTone;
    user: string;
    amount: string;
    price: string;
    time: string;
    statusLabel: string;
};

const STATUS_LABELS: Record<string, string> = {
    paymentConfirmed: '완료',
    cancelled: '취소',
    paymentRequested: '입금요청',
    accepted: '수락',
    ordered: '대기',
};

const TRADE_STYLES: Record<
    TradeTone,
    { label: string; badge: string; accent: string; glow: string }
> = {
    buy: {
        label: '구매',
        badge: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
        accent: 'bg-[linear-gradient(180deg,#10b981,#14b8a6)]',
        glow: 'bg-emerald-400/20',
    },
    sell: {
        label: '취소',
        badge: 'border-orange-400/40 bg-orange-500/10 text-orange-200',
        accent: 'bg-[linear-gradient(180deg,#f97316,#f59e0b)]',
        glow: 'bg-orange-400/20',
    },
    pending: {
        label: '진행',
        badge: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
        accent: 'bg-[linear-gradient(180deg,#38bdf8,#0ea5e9)]',
        glow: 'bg-sky-400/20',
    },
};

const numberFormatter = new Intl.NumberFormat('ko-KR');
const formatKrw = (value: number | null) =>
    value === null ? '--' : `₩${numberFormatter.format(value)}`;

const getBalanceTone = (balance: number, totalBalance: number) => {
    const ratio = totalBalance > 0 ? balance / totalBalance : 0;
    if (ratio >= 0.15) {
        return {
            card: 'border-amber-400/40 bg-amber-500/10 shadow-[0_22px_60px_-38px_rgba(251,191,36,0.35)]',
            glow: 'bg-amber-400/30',
            amount: 'text-amber-200',
            pill: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
        };
    }
    if (ratio >= 0.07) {
        return {
            card: 'border-sky-400/40 bg-sky-500/10 shadow-[0_22px_60px_-38px_rgba(56,189,248,0.35)]',
            glow: 'bg-sky-400/30',
            amount: 'text-sky-200',
            pill: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
        };
    }
    if (ratio >= 0.03) {
        return {
            card: 'border-emerald-400/40 bg-emerald-500/10 shadow-[0_22px_60px_-38px_rgba(16,185,129,0.35)]',
            glow: 'bg-emerald-400/30',
            amount: 'text-emerald-200',
            pill: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
        };
    }
    return {
        card: 'border-slate-700/70 bg-slate-950/70 shadow-[0_18px_45px_-34px_rgba(2,6,23,0.7)]',
        glow: 'bg-slate-400/20',
        amount: 'text-slate-100',
        pill: 'border-slate-700/70 bg-slate-900/70 text-slate-300',
    };
};

const maskName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
        return '익명';
    }
    const visible = trimmed.slice(0, Math.min(3, trimmed.length));
    return `${visible}***`;
};

const formatRelativeTime = (value?: string) => {
    if (!value) {
        return '--';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--';
    }
    const diffMs = Date.now() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSeconds < 60) {
        return '방금';
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours}시간 전`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
};

export default function Loot69Page() {
    const params = useParams<{ lang: string }>();
    const lang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang ?? 'ko';
    const searchParams = useSearchParams();
    const debugSupport =
        searchParams?.get('supportDebug') === '1' ||
        process.env.NODE_ENV === 'development';
    const activeAccount = useActiveAccount();
    const walletAddress = activeAccount?.address ?? '';
    const { smartAccountEnabled, wallet } = useClientWallets();
    const hasWallet = Boolean(walletAddress);
    const buyPageHref = `/${lang}/loot/buy`;
    const searchSellerHref = `/${lang}/loot/searchSeller`;
    const [sellerEscrowWalletAddress, setSellerEscrowWalletAddress] = useState<string | null>(null);
    const [sellerEscrowLoading, setSellerEscrowLoading] = useState(false);
    const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
    const [profileInitial, setProfileInitial] = useState('');
    const [profileNickname, setProfileNickname] = useState('');
    const sellerPageHref =
        hasWallet && sellerEscrowWalletAddress
            ? `/${lang}/escrow/${sellerEscrowWalletAddress}`
            : '';
    const sellerSetupHref = `/${lang}/loot/seller-settings`;
    const canStartSeller = Boolean(hasWallet && sellerEscrowWalletAddress);
    const sellerCtaLabel = !hasWallet
        ? '로그인 후 판매 시작'
        : sellerEscrowLoading
        ? '판매자 정보 확인 중'
        : sellerEscrowWalletAddress
        ? '보호 판매 시작'
        : '판매자 설정';
    const needsSellerSetup = Boolean(hasWallet && !sellerEscrowLoading && !sellerEscrowWalletAddress);
    const sellerCtaTone = !hasWallet
        ? 'border-orange-400/40 bg-orange-500/10 text-orange-200 ring-1 ring-orange-400/30 shadow-[0_18px_40px_-24px_rgba(249,115,22,0.35)]'
        : 'border-slate-700/70 bg-slate-900/70 text-slate-200 shadow-[0_14px_30px_-24px_rgba(2,6,23,0.6)]';
    const isSupportEligible = Boolean(walletAddress);
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [animatedStats, setAnimatedStats] = useState(() => STAT_ITEMS.map(() => 0));
    const [chatOpen, setChatOpen] = useState(false);
    const [supportUserId, setSupportUserId] = useState<string | null>(null);
    const [supportSessionToken, setSupportSessionToken] = useState<string | null>(null);
    const [supportChannelUrl, setSupportChannelUrl] = useState<string | null>(null);
    const [supportPhase, setSupportPhase] = useState<'idle' | 'session' | 'channel' | 'ready'>(
        'idle'
    );
    const [supportLoading, setSupportLoading] = useState(false);
    const [supportError, setSupportError] = useState<string | null>(null);
    const [supportDiagnostics, setSupportDiagnostics] = useState<SupportDebugEntry[]>([]);
    const [supportCopied, setSupportCopied] = useState(false);
    const [marketTickers, setMarketTickers] = useState<MarketTicker[]>(() => MARKET_SOURCES);
    const [tickerUpdatedAt, setTickerUpdatedAt] = useState<string | null>(null);
    const [tickerError, setTickerError] = useState<string | null>(null);
    const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
    const [recentTradesUpdatedAt, setRecentTradesUpdatedAt] = useState<string | null>(null);
    const [recentTradesError, setRecentTradesError] = useState<string | null>(null);
    const [newsItems, setNewsItems] = useState<StablecoinNewsItem[]>(() => STABLECOIN_NEWS);
    const [newsUpdatedAt, setNewsUpdatedAt] = useState<string | null>(null);
    const [newsError, setNewsError] = useState<string | null>(null);
    const [noticeItems, setNoticeItems] = useState<NoticeSummary[]>([]);
    const [noticeLoading, setNoticeLoading] = useState(false);
    const [noticeError, setNoticeError] = useState<string | null>(null);
    const newsTickerRef = useRef<HTMLDivElement | null>(null);
    const newsTickerPauseUntilRef = useRef(0);
    const newsTickerOffsetRef = useRef(0);
    const sellerTickerRef = useRef<HTMLDivElement | null>(null);
    const sellerTickerPauseUntilRef = useRef(0);
    const sellerTickerOffsetRef = useRef(0);
    const sellerTickerDraggingRef = useRef(false);
    const sellerTickerLastUserScrollRef = useRef(0);
    const sellerTickerAutoScrollRef = useRef(false);
    const supportConnectingRef = useRef(false);
    const pageRef = useRef<HTMLDivElement | null>(null);

    const supportStatusMessage = !isSupportEligible
        ? '익명은 문의할 수 없습니다. 지갑을 연결해 주세요.'
        : supportPhase === 'session'
        ? '세션 연결 중입니다.'
        : supportPhase === 'channel'
        ? '관리자 채널을 만드는 중입니다.'
        : supportLoading
        ? '관리자 채팅을 여는 중입니다.'
        : '채팅을 준비 중입니다.';
    const supportNickname = supportUserId
        ? `지갑-${supportUserId.slice(0, 6)}...${supportUserId.slice(-4)}`
        : '회원';
    const supportUserLabel = supportUserId
        ? `${supportUserId.slice(0, 6)}...${supportUserId.slice(-4)}`
        : 'n/a';

    const pushSupportDiagnostic = (entry: SupportDebugEntry) => {
        if (!debugSupport) {
            return;
        }
        setSupportDiagnostics((prev) => {
            const next = [entry, ...prev];
            return next.slice(0, 6);
        });
    };

    const handleCopySupportUserId = async () => {
        if (!supportUserId || typeof window === 'undefined') {
            return;
        }
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(supportUserId);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = supportUserId;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setSupportCopied(true);
            window.setTimeout(() => setSupportCopied(false), 1500);
        } catch {
            setSupportCopied(false);
        }
    };

    useEffect(() => {
        if (!walletAddress) {
            setSupportUserId(null);
            setSupportSessionToken(null);
            setSupportChannelUrl(null);
            setSupportPhase('idle');
            setSupportError(null);
            setSupportLoading(false);
            return;
        }
        if (supportUserId !== walletAddress) {
            setSupportUserId(walletAddress);
            setSupportSessionToken(null);
            setSupportChannelUrl(null);
            setSupportPhase('idle');
            setSupportError(null);
        }
    }, [walletAddress, supportUserId]);

    useEffect(() => {
        let isMounted = true;

        if (!walletAddress) {
            setSellerEscrowWalletAddress(null);
            setSellerEscrowLoading(false);
            setProfileAvatarUrl('');
            setProfileInitial('');
            setProfileNickname('');
            return () => {
                isMounted = false;
            };
        }

        const fetchSellerEscrowWallet = async () => {
            setSellerEscrowWalletAddress(null);
            setSellerEscrowLoading(true);
            try {
                const response = await fetch('/api/user/getUserByWalletAddress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        storecode: 'admin',
                        walletAddress,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch seller info');
                }

                const data = (await response.json()) as {
                    result?: { 
                        seller?: { escrowWalletAddress?: string }; 
                        escrowWalletAddress?: string;
                        avatar?: string;
                        nickname?: string;
                        user?: { nickname?: string };
                    };
                };

                const nextEscrowWallet =
                    data?.result?.seller?.escrowWalletAddress ||
                    data?.result?.escrowWalletAddress ||
                    null;

                if (isMounted) {
                    setSellerEscrowWalletAddress(nextEscrowWallet);
                    const nextAvatar = data?.result?.avatar || '';
                    const nicknameSeed =
                        (data?.result?.nickname || data?.result?.user?.nickname || '').trim();
                    const walletSeed = walletAddress.replace(/^0x/i, '').slice(0, 2);
                    setProfileAvatarUrl(nextAvatar);
                    setProfileInitial(
                        nicknameSeed ? nicknameSeed.slice(0, 2).toUpperCase() : walletSeed.toUpperCase()
                    );
                    setProfileNickname(nicknameSeed);
                }
            } catch {
                if (isMounted) {
                    setSellerEscrowWalletAddress(null);
                    setProfileAvatarUrl('');
                    setProfileInitial(walletAddress.replace(/^0x/i, '').slice(0, 2).toUpperCase());
                    setProfileNickname('');
                }
            } finally {
                if (isMounted) {
                    setSellerEscrowLoading(false);
                }
            }
        };

        fetchSellerEscrowWallet();

        return () => {
            isMounted = false;
        };
    }, [walletAddress]);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: number | null = null;
        let activeController: AbortController | null = null;

        const clearTimeoutId = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        const startTimeout = () => {
            clearTimeoutId();
            if (activeController) {
                timeoutId = window.setTimeout(() => {
                    activeController?.abort();
                }, SUPPORT_REQUEST_TIMEOUT_MS);
            }
        };

        const connectSupportChat = async () => {
            if (!chatOpen) {
                if (isMounted) {
                    setSupportLoading(false);
                    if (!supportSessionToken || !supportChannelUrl) {
                        setSupportPhase('idle');
                    }
                }
                return;
            }
            if (!isSupportEligible || !supportUserId) {
                if (isMounted) {
                    setSupportLoading(false);
                    setSupportPhase('idle');
                    setSupportError(null);
                }
                return;
            }
            if (supportSessionToken && supportChannelUrl) {
                if (isMounted) {
                    setSupportPhase('ready');
                    setSupportLoading(false);
                    setSupportError(null);
                }
                return;
            }
            if (supportConnectingRef.current) {
                return;
            }

            supportConnectingRef.current = true;
            setSupportLoading(true);
            setSupportError(null);
            let currentPhase: 'session' | 'channel' = 'session';

            const findExistingSupportChannel = async () => {
                const startedAt = performance.now();
                const endpoint = '/api/sendbird/user-channels';
                try {
                    const response = await fetch('/api/sendbird/user-channels', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: supportUserId, limit: 20 }),
                        signal: activeController?.signal,
                    });
                    if (!response.ok) {
                        const error = await response.json().catch(() => null);
                        pushSupportDiagnostic({
                            phase: 'find',
                            endpoint,
                            status: response.status,
                            ok: false,
                            durationMs: Math.round(performance.now() - startedAt),
                            error: error?.error || error?.message || 'Failed to load user channels',
                            timestamp: new Date().toISOString(),
                        });
                        return null;
                    }
                    const data = (await response.json()) as {
                        items?: { channelUrl?: string; members?: { userId?: string }[] }[];
                    };
                    pushSupportDiagnostic({
                        phase: 'find',
                        endpoint,
                        status: response.status,
                        ok: true,
                        durationMs: Math.round(performance.now() - startedAt),
                        timestamp: new Date().toISOString(),
                    });
                    const match = data.items?.find((channel) =>
                        channel.members?.some((member) => member.userId === SUPPORT_ADMIN_ID),
                    );
                    return match?.channelUrl || null;
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : 'Failed to fetch user channels';
                    pushSupportDiagnostic({
                        phase: 'find',
                        endpoint,
                        durationMs: Math.round(performance.now() - startedAt),
                        error: message,
                        timestamp: new Date().toISOString(),
                    });
                    return null;
                }
            };

            try {
                activeController = new AbortController();
                setSupportPhase('session');
                startTimeout();
                const sessionStartedAt = performance.now();
                const sessionUrl =
                    typeof window !== 'undefined'
                        ? new URL('/api/sendbird/session-token', window.location.origin)
                        : null;
                if (!sessionUrl) {
                    throw new Error('세션 요청 URL을 만들지 못했습니다.');
                }
                sessionUrl.searchParams.set('userId', supportUserId);
                sessionUrl.searchParams.set('nickname', supportNickname);
                const sessionResponse = await fetch(sessionUrl.toString(), {
                    method: 'GET',
                    signal: activeController.signal,
                });

                if (!sessionResponse.ok) {
                    const error = await sessionResponse.json().catch(() => null);
                    pushSupportDiagnostic({
                        phase: 'session',
                        endpoint: '/api/sendbird/session-token?userId=...',
                        status: sessionResponse.status,
                        ok: false,
                        durationMs: Math.round(performance.now() - sessionStartedAt),
                        error: error?.error || error?.message || 'Failed to issue session token',
                        timestamp: new Date().toISOString(),
                    });
                    throw new Error(error?.error || '세션 토큰을 발급하지 못했습니다.');
                }
                pushSupportDiagnostic({
                    phase: 'session',
                    endpoint: '/api/sendbird/session-token?userId=...',
                    status: sessionResponse.status,
                    ok: true,
                    durationMs: Math.round(performance.now() - sessionStartedAt),
                    timestamp: new Date().toISOString(),
                });

                const sessionData = (await sessionResponse.json()) as { sessionToken?: string };
                if (!sessionData.sessionToken) {
                    throw new Error('세션 토큰이 비어 있습니다.');
                }

                if (isMounted) {
                    setSupportSessionToken(sessionData.sessionToken);
                }

                clearTimeoutId();
                currentPhase = 'channel';
                setSupportPhase('channel');
                startTimeout();
                const existingChannel = await findExistingSupportChannel();
                if (existingChannel && isMounted) {
                    setSupportChannelUrl(existingChannel);
                    setSupportPhase('ready');
                    return;
                }
                const channelStartedAt = performance.now();
                const channelResponse = await fetch('/api/sendbird/group-channel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        buyerId: supportUserId,
                        sellerId: SUPPORT_ADMIN_ID,
                    }),
                    signal: activeController.signal,
                });

                if (!channelResponse.ok) {
                    const error = await channelResponse.json().catch(() => null);
                    pushSupportDiagnostic({
                        phase: 'channel',
                        endpoint: '/api/sendbird/group-channel',
                        status: channelResponse.status,
                        ok: false,
                        durationMs: Math.round(performance.now() - channelStartedAt),
                        error: error?.error || error?.message || 'Failed to create group channel',
                        timestamp: new Date().toISOString(),
                    });
                    throw new Error(error?.error || '관리자 채팅을 생성하지 못했습니다.');
                }
                pushSupportDiagnostic({
                    phase: 'channel',
                    endpoint: '/api/sendbird/group-channel',
                    status: channelResponse.status,
                    ok: true,
                    durationMs: Math.round(performance.now() - channelStartedAt),
                    timestamp: new Date().toISOString(),
                });

                const channelData = (await channelResponse.json()) as { channelUrl?: string };
                if (isMounted) {
                    setSupportChannelUrl(channelData.channelUrl || null);
                    setSupportPhase('ready');
                }
            } catch (error) {
                const isTimeout =
                    error instanceof DOMException && error.name === 'AbortError';
                if (isMounted) {
                    const fallbackChannel = await findExistingSupportChannel();
                    if (fallbackChannel) {
                        setSupportChannelUrl(fallbackChannel);
                        setSupportPhase('ready');
                        setSupportError(null);
                        return;
                    }
                    const message =
                        isTimeout && currentPhase === 'channel'
                            ? '관리자 채널 생성 요청이 시간 초과되었습니다.'
                            : isTimeout
                            ? '세션 연결 요청이 시간 초과되었습니다.'
                            : error instanceof Error
                            ? error.message
                            : '채팅을 불러오지 못했습니다.';
                    pushSupportDiagnostic({
                        phase: currentPhase,
                        endpoint:
                            currentPhase === 'channel'
                                ? '/api/sendbird/group-channel'
                                : '/api/sendbird/session-token',
                        error: message,
                        timestamp: new Date().toISOString(),
                    });
                    setSupportError(message);
                    setSupportPhase('idle');
                }
            } finally {
                supportConnectingRef.current = false;
                clearTimeoutId();
                activeController = null;
                if (isMounted) {
                    setSupportLoading(false);
                }
            }
        };

        connectSupportChat();

        return () => {
            isMounted = false;
            clearTimeoutId();
            activeController?.abort();
        };
    }, [chatOpen, isSupportEligible, supportUserId, supportSessionToken, supportChannelUrl, supportNickname]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const root = pageRef.current;
        if (!root) {
            return;
        }

        let frame = 0;
        const update = () => {
            const scrollTop = window.scrollY || window.pageYOffset || 0;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
            root.style.setProperty('--scroll-progress', progress.toString());
            root.style.setProperty('--scroll-y', `${scrollTop}px`);
            frame = 0;
        };

        const onScroll = () => {
            if (frame) {
                return;
            }
            frame = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const elements = Array.from(document.querySelectorAll('[data-reveal]'));
        if (elements.length === 0) {
            return;
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
            elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }
        if (typeof IntersectionObserver === 'undefined') {
            elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -12% 0px' }
        );

        elements.forEach((element) => observer.observe(element));

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (shouldReduceMotion) {
            setAnimatedStats(STAT_ITEMS.map((item) => item.value));
            return;
        }

        let frame = 0;
        const start = performance.now();
        const durationMs = 1600;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedStats(STAT_ITEMS.map((item) => Math.floor(item.value * eased)));

            if (progress < 1) {
                frame = window.requestAnimationFrame(tick);
            }
        };

        frame = window.requestAnimationFrame(tick);

        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchNews = async () => {
            try {
                const response = await fetch('/api/news/stablecoin', {
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error('Failed to load stablecoin news');
                }

                const payload = (await response.json()) as {
                    items: StablecoinNewsItem[];
                    updatedAt?: string;
                };

                if (!isMounted) {
                    return;
                }

                if (payload.items && payload.items.length > 0) {
                    setNewsItems(payload.items);
                    setNewsUpdatedAt(payload.updatedAt ?? null);
                    setNewsError(null);
                } else {
                    setNewsError('뉴스를 불러오지 못했습니다');
                }
            } catch (error) {
                if (isMounted) {
                    setNewsError('뉴스를 불러오지 못했습니다');
                }
            }
        };

        fetchNews();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const fetchNotices = async () => {
            setNoticeLoading(true);
            setNoticeError(null);
            try {
                const response = await fetch('/api/notice/getActive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        limit: 4,
                        sortBy: 'publishedAt',
                        pinnedFirst: true,
                    }),
                });

                if (!response.ok) {
                    throw new Error('FAILED');
                }

                const data = await response.json();
                const items = Array.isArray(data?.result) ? data.result : [];
                const normalized = items
                    .map((notice: any, index: number) => {
                        const id = String(notice?._id ?? notice?.id ?? index);
                        const title = notice?.title || '공지사항';
                        const summary =
                            notice?.summary ||
                            (Array.isArray(notice?.content)
                                ? notice.content.find((line: string) => line?.trim()) || ''
                                : typeof notice?.content === 'string'
                                ? notice.content.split('\n')[0]
                                : '');
                        const dateSource = notice?.publishedAt || notice?.createdAt;
                        const date = dateSource ? String(dateSource).slice(0, 10) : '--';

                        return {
                            id,
                            title,
                            summary,
                            date,
                        } as NoticeSummary;
                    })
                    .filter((item: NoticeSummary) => item.title);

                if (active) {
                    setNoticeItems(normalized);
                }
            } catch (error) {
                if (active) {
                    setNoticeItems([]);
                    setNoticeError('공지사항을 불러오지 못했습니다.');
                }
            } finally {
                if (active) {
                    setNoticeLoading(false);
                }
            }
        };

        fetchNotices();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const ticker = newsTickerRef.current;
        if (!ticker) {
            return;
        }

        const pauseFor = (ms: number) => {
            newsTickerPauseUntilRef.current = Date.now() + ms;
        };

        const handlePointerEnter = () => pauseFor(1500);
        const handlePointerDown = () => pauseFor(2500);
        const handleTouchStart = () => pauseFor(3000);
        const handleWheel = () => pauseFor(2000);
        const handleScroll = () => {
            pauseFor(1200);
            newsTickerOffsetRef.current = ticker.scrollLeft;
        };

        ticker.addEventListener('pointerenter', handlePointerEnter);
        ticker.addEventListener('pointerdown', handlePointerDown);
        ticker.addEventListener('touchstart', handleTouchStart, { passive: true });
        ticker.addEventListener('wheel', handleWheel, { passive: true });
        ticker.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            ticker.removeEventListener('pointerenter', handlePointerEnter);
            ticker.removeEventListener('pointerdown', handlePointerDown);
            ticker.removeEventListener('touchstart', handleTouchStart);
            ticker.removeEventListener('wheel', handleWheel);
            ticker.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const ticker = sellerTickerRef.current;
        if (!ticker) {
            return;
        }

        const pauseFor = (ms: number) => {
            sellerTickerPauseUntilRef.current = Date.now() + ms;
        };

        const markUserScroll = () => {
            sellerTickerLastUserScrollRef.current = Date.now();
        };

        const handlePointerEnter = () => pauseFor(1500);
        const handlePointerDown = () => {
            sellerTickerDraggingRef.current = true;
            markUserScroll();
            pauseFor(3000);
        };
        const handlePointerUp = () => {
            sellerTickerDraggingRef.current = false;
            markUserScroll();
            pauseFor(1800);
        };
        const handleTouchStart = () => {
            sellerTickerDraggingRef.current = true;
            markUserScroll();
            pauseFor(3000);
        };
        const handleTouchEnd = () => {
            sellerTickerDraggingRef.current = false;
            markUserScroll();
            pauseFor(2000);
        };
        const handleWheel = () => pauseFor(2000);
        const handleScroll = () => {
            if (sellerTickerAutoScrollRef.current) {
                sellerTickerAutoScrollRef.current = false;
                return;
            }
            markUserScroll();
            pauseFor(1200);
            sellerTickerOffsetRef.current = ticker.scrollLeft;
        };

        ticker.addEventListener('pointerenter', handlePointerEnter);
        ticker.addEventListener('pointerdown', handlePointerDown);
        ticker.addEventListener('pointerup', handlePointerUp);
        ticker.addEventListener('pointercancel', handlePointerUp);
        ticker.addEventListener('pointerleave', handlePointerUp);
        ticker.addEventListener('touchstart', handleTouchStart, { passive: true });
        ticker.addEventListener('touchend', handleTouchEnd, { passive: true });
        ticker.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        ticker.addEventListener('wheel', handleWheel, { passive: true });
        ticker.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            ticker.removeEventListener('pointerenter', handlePointerEnter);
            ticker.removeEventListener('pointerdown', handlePointerDown);
            ticker.removeEventListener('pointerup', handlePointerUp);
            ticker.removeEventListener('pointercancel', handlePointerUp);
            ticker.removeEventListener('pointerleave', handlePointerUp);
            ticker.removeEventListener('touchstart', handleTouchStart);
            ticker.removeEventListener('touchend', handleTouchEnd);
            ticker.removeEventListener('touchcancel', handleTouchEnd);
            ticker.removeEventListener('wheel', handleWheel);
            ticker.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const ticker = newsTickerRef.current;
        if (!ticker || typeof window === 'undefined') {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let frame = 0;
        const speed = 0.8;
        newsTickerOffsetRef.current = ticker.scrollLeft;

        const tick = () => {
            const maxScroll = ticker.scrollWidth / 2;
            if (
                Date.now() >= newsTickerPauseUntilRef.current &&
                maxScroll > 0 &&
                ticker.scrollWidth > ticker.clientWidth
            ) {
                newsTickerOffsetRef.current += speed;
                if (newsTickerOffsetRef.current >= maxScroll) {
                    newsTickerOffsetRef.current -= maxScroll;
                }
                ticker.scrollLeft = Math.floor(newsTickerOffsetRef.current);
            }
            frame = window.requestAnimationFrame(tick);
        };

        frame = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [newsItems]);

    useEffect(() => {
        let active = true;

        const fetchTickers = async () => {
            try {
                const response = await fetch('/api/markets/usdt-krw', { cache: 'no-store' });

                if (!response.ok) {
                    throw new Error('Failed to load tickers');
                }

                const data = await response.json();
                const items = Array.isArray(data?.items) ? data.items : [];
                const nextTickers = MARKET_SOURCES.map((source) => {
                    const match = items.find((item: MarketTicker) => item.id === source.id);
                    return match
                        ? { ...source, price: match.price, error: match.error }
                        : source;
                });

                if (active) {
                    setMarketTickers(nextTickers);
                    setTickerUpdatedAt(data?.updatedAt ?? new Date().toISOString());
                    setTickerError(null);
                }
            } catch (error) {
                if (active) {
                    setMarketTickers(MARKET_SOURCES);
                    setTickerUpdatedAt(null);
                    setTickerError('시세를 불러오지 못했습니다');
                }
            }
        };

        fetchTickers();
        const intervalId = window.setInterval(fetchTickers, 15000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        let active = true;

        const fetchRecentTrades = async () => {
            try {
                const response = await fetch('/api/order/getAllBuyOrders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        storecode: '',
                        limit: 10,
                        page: 1,
                        walletAddress: '',
                        searchMyOrders: false,
                        searchOrderStatusCancelled: false,
                        searchOrderStatusCompleted: true,
                        searchStoreName: '',
                        fromDate: '',
                        toDate: '',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to load trades');
                }

                const data = await response.json();
                const orders = Array.isArray(data?.result?.orders) ? data.result.orders : [];
                const nextTrades = orders.map((order: any) => {
                    const status = order?.status ?? 'ordered';
                    const tone: TradeTone =
                        status === 'paymentConfirmed'
                            ? 'buy'
                            : status === 'cancelled'
                            ? 'sell'
                            : 'pending';
                    const displayName = maskName(
                        order?.nickname ||
                            order?.buyer?.nickname ||
                            order?.buyer?.depositName ||
                            order?.buyer?.name ||
                            order?.store?.storeName ||
                            ''
                    );
                    const amount =
                        typeof order?.usdtAmount === 'number'
                            ? `${numberFormatter.format(order.usdtAmount)} USDT`
                            : '--';
                    const price =
                        typeof order?.rate === 'number'
                            ? `${numberFormatter.format(order.rate)} KRW`
                            : typeof order?.krwAmount === 'number'
                            ? `${numberFormatter.format(order.krwAmount)} KRW`
                            : '--';
                    const time = formatRelativeTime(
                        order?.paymentConfirmedAt || order?.createdAt || order?.acceptedAt
                    );

                    return {
                        id: String(order?._id ?? `${order?.createdAt ?? Date.now()}-${order?.nickname ?? ''}`),
                        tone,
                        user: displayName,
                        amount,
                        price,
                        time,
                        statusLabel: STATUS_LABELS[status] ?? '진행',
                    } as RecentTrade;
                });

                if (active) {
                    setRecentTrades(nextTrades);
                    setRecentTradesUpdatedAt(new Date().toISOString());
                    setRecentTradesError(null);
                }
            } catch (error) {
                if (active) {
                    setRecentTrades([]);
                    setRecentTradesUpdatedAt(null);
                    setRecentTradesError('정산 내역을 불러오지 못했습니다');
                }
            }
        };

        fetchRecentTrades();
        const intervalId = window.setInterval(fetchRecentTrades, 20000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const [globalAds, setGlobalAds] = useState<BannerAd[]>([]);
    const bannerAds = globalAds;

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        if (bannerAds.length === 0) {
            return;
        }
        const elements = Array.from(document.querySelectorAll('[data-reveal]:not(.is-visible)'));
        if (elements.length === 0) {
            return;
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion || typeof IntersectionObserver === 'undefined') {
            elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -12% 0px' }
        );

        elements.forEach((element) => observer.observe(element));

        return () => {
            observer.disconnect();
        };
    }, [bannerAds.length]);

    useEffect(() => {
        let active = true;

        const fetchGlobalAds = async () => {
            try {
                const response = await fetch('/api/globalAd/getActive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        placement: 'p2p-home',
                        limit: 12,
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

                        if (!image || !link) {
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

                if (active && normalized.length > 0) {
                    setGlobalAds(normalized);
                }
            } catch (error) {
                // fallback to static banners
            }
        };

        fetchGlobalAds();

        return () => {
            active = false;
        };
    }, []);





  // /api/user/getAllSellersForBalance
  const [sellersBalance, setSellersBalance] = useState([] as any[]);
  const [sellersBalanceUpdatedAt, setSellersBalanceUpdatedAt] = useState<string | null>(null);
  const fetchSellersBalance = async () => {
    const response = await fetch('/api/user/getAllSellersForBalance', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          storecode: "admin",
          limit: 100,
          page: 1,
        }
      )
    });

    const data = await response.json();

    ///console.log('getAllSellersForBalance data', data);

    if (data.result) {
      setSellersBalance(data.result.users || []);
      setSellersBalanceUpdatedAt(new Date().toISOString());
    } else {
      console.error('Error fetching sellers balance');
      setSellersBalanceUpdatedAt(null);
    }
  };
  useEffect(() => {

    fetchSellersBalance();
    // interval to fetch every 10 seconds
    const interval = setInterval(() => {
      fetchSellersBalance();
    }, 100000);
    return () => clearInterval(interval);
  }, []);




    const totalSellerBalance = sellersBalance.reduce(
        (acc, seller) => acc + (Number(seller?.currentUsdtBalance) || 0),
        0
    );
    const bestSellers = [...sellersBalance]
        .filter((seller) => seller?.walletAddress || seller?.nickname)
        .sort(
            (a, b) =>
                (b?.seller?.totalPaymentConfirmedUsdtAmount || 0) -
                (a?.seller?.totalPaymentConfirmedUsdtAmount || 0)
        )
        .slice(0, 12);

    useEffect(() => {
        const ticker = sellerTickerRef.current;
        if (!ticker || typeof window === 'undefined') {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let frame = 0;
        const speed = 0.6;
        sellerTickerOffsetRef.current = ticker.scrollLeft;

        const tick = () => {
            const maxScroll = Math.max(0, ticker.scrollWidth - ticker.clientWidth);
            const idleMs = Date.now() - sellerTickerLastUserScrollRef.current;
            if (
                Date.now() >= sellerTickerPauseUntilRef.current &&
                maxScroll > 0 &&
                !sellerTickerDraggingRef.current &&
                idleMs > 900
            ) {
                sellerTickerOffsetRef.current += speed;
                if (sellerTickerOffsetRef.current >= maxScroll) {
                    sellerTickerOffsetRef.current = 0;
                }
                sellerTickerAutoScrollRef.current = true;
                ticker.scrollLeft = Math.floor(sellerTickerOffsetRef.current);
            }
            frame = window.requestAnimationFrame(tick);
        };

        frame = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [bestSellers.length]);

    return (
        <div
            ref={pageRef}
            className={`${bodyFont.variable} ${displayFont.variable} loot-shell relative min-h-screen overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,var(--paper)_0%,#0b1020_45%,#04070d_100%)] text-[color:var(--ink)] font-[var(--font-body)]`}
            style={{
                '--paper': '#0b1220',
                '--ink': '#e2e8f0',
                '--accent': '#22d3ee',
                '--accent-deep': '#0891b2',
                '--sea': '#10b981',
                '--mist': '#0b1020',
                '--rose': '#f97316',
                '--sun': '#38bdf8',
                '--scroll-progress': '0',
                '--scroll-y': '0px',
            } as React.CSSProperties}
        >
            <div className="pointer-events-none absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-20 blur-3xl float-slow" />
            <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,var(--sea)_0%,transparent_70%)] opacity-18 blur-3xl float-slower" />
            <div className="pointer-events-none absolute left-[10%] top-[18%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.25),transparent_70%)] opacity-20 blur-3xl float-slow" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0))]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:22px_22px] opacity-25" />
            <div className="pointer-events-none absolute inset-0 scanline" />
            {bannerAds.length > 0 && (
                <>
                    {/* PC 좌측 광고 배너 */}
                    <aside className="hidden lg:block fixed left-6 top-20 z-10 w-56 h-[calc(100vh-5rem)] overflow-y-auto p-4 space-y-4">
                        {bannerAds.map((ad) => (
                            <a key={`left-${ad.id}`} href={ad.link} className="block" target="_blank" rel="noreferrer">
                                <div className="overflow-hidden rounded-2xl shadow-[0_16px_45px_-32px_rgba(15,23,42,0.6)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_26px_60px_-36px_rgba(15,23,42,0.6)]">
                                    <div className="relative aspect-[2/1] overflow-hidden bg-[#f1eee7]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={ad.image}
                                            alt={ad.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </aside>

                    {/* PC 우측 광고 배너 */}
                    <aside className="hidden lg:block fixed right-6 top-20 z-10 w-56 h-[calc(100vh-5rem)] overflow-y-auto p-4 space-y-4">
                        {bannerAds.map((ad) => (
                            <a key={`right-${ad.id}`} href={ad.link} className="block" target="_blank" rel="noreferrer">
                                <div className="overflow-hidden rounded-2xl shadow-[0_16px_45px_-32px_rgba(15,23,42,0.6)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_26px_60px_-36px_rgba(15,23,42,0.6)]">
                                    <div className="relative aspect-[2/1] overflow-hidden bg-[#f1eee7]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={ad.image}
                                            alt={ad.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </aside>
                </>
            )}

            <AutoConnect client={client} wallets={[wallet]} />
            {/* 메인 컨텐츠 */}
            <main className="container relative z-10 mx-auto max-w-[780px] overflow-x-hidden px-4 pb-16 lg:px-6 lg:pb-12">
                {/* 히어로 섹션 */}
                <div className="hero-fade relative mt-10 mb-12 overflow-hidden rounded-[24px] border border-slate-800/70 bg-slate-950/70 shadow-[0_30px_90px_-60px_rgba(2,6,23,0.9)] backdrop-blur-sm">
                    <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-25" />
                    <div className="absolute -bottom-24 left-[-10%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--sea)_0%,transparent_70%)] opacity-20" />
                    <div className="relative flex flex-col gap-10 p-7 md:p-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                                USDT · P2P · Escrow
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative inline-flex items-center justify-center rounded-3xl border border-white/15 bg-white/10 px-6 py-5 shadow-[0_20px_50px_-24px_rgba(2,6,23,0.9)]">
                                    <span className="pointer-events-none absolute -inset-3 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),transparent_70%)] blur-2xl" />
                                    <Image
                                        src="/logo-loot.png"
                                        alt="Loot69"
                                        width={320}
                                        height={96}
                                        className="h-20 w-auto drop-shadow-[0_8px_24px_rgba(255,255,255,0.2)] brightness-125 sm:h-24 md:h-28"
                                        priority
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-[0_10px_25px_-15px_rgba(15,23,42,0.6)] md:h-10 md:w-10">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="h-6 w-6 text-slate-900 md:h-7 md:w-7"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 3.5l7 2.5v6.2c0 4.2-2.9 7.9-7 8.8-4.1-.9-7-4.6-7-8.8V6l7-2.5Z"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M9.2 12.6l1.9 1.9 3.8-3.8"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <h1 className="font-[var(--font-display)] text-2xl leading-tight text-[color:var(--ink)] whitespace-nowrap sm:text-4xl md:text-5xl">
                                    신뢰로 완성된 USDT 마켓
                                </h1>
                            </div>
                            <p className="text-lg text-slate-300 md:text-xl">
                                KYC·에스크로·분쟁조정까지 한 번에, 안전한 거래만 남깁니다.
                            </p>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Link
                                    href={searchSellerHref}
                                    className="accent-cta inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-[color:var(--accent)] px-8 py-4 text-base font-semibold text-slate-900 shadow-[0_18px_45px_-22px_rgba(34,211,238,0.6)] transition hover:bg-[color:var(--accent-deep)] sm:w-auto sm:min-w-[220px]"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="inline-block">
                                        <path d="M6 6h15l-1.5 9h-13L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 22a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor"/>
                                        <path d="M18 22a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor"/>
                                    </svg>
                                    안전 구매 시작
                                </Link>
                                {canStartSeller ? (
                                    <Link
                                        href={sellerPageHref}
                                        className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-full border border-slate-700/70 bg-slate-900/70 px-8 py-4 text-base font-semibold text-slate-200 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.6)] transition hover:border-emerald-400/40 sm:w-auto sm:min-w-[240px]"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="inline-block">
                                            <path d="M12 2l7 7-7 7-7-7 7-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        보호 판매 시작
                                    </Link>
                                ) : (
                                    <div className="flex w-full items-center justify-center sm:w-auto">
                                        {needsSellerSetup ? (
                                            <Link
                                                href={sellerSetupHref}
                                                className="accent-cta inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[color:var(--accent)] px-8 py-4 text-base font-semibold text-slate-900 shadow-[0_18px_45px_-22px_rgba(34,211,238,0.6)] transition hover:brightness-110 sm:w-auto sm:min-w-[240px]"
                                            >
                                                판매자 설정
                                            </Link>
                                        ) : (
                                            <span
                                                className={`relative inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border px-8 py-4 text-base font-semibold tracking-tight sm:w-auto sm:min-w-[240px] ${sellerCtaTone}`}
                                            >
                                                {!hasWallet && (
                                                    <span className="pointer-events-none absolute -right-6 -top-4 h-10 w-10 rounded-full bg-orange-300/40 blur-2xl" />
                                                )}
                                                <span className="relative">{sellerCtaLabel}</span>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path
                                                        d="M5 5h9a2 2 0 0 1 2 2v12H7a2 2 0 0 0-2 2V5Z"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M16 7h3a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2h-3"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path d="M8 9h6M8 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Buyer Guide</p>
                                                <p className="text-base font-semibold text-slate-100 sm:text-lg">구매 시작 전에 확인하세요</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/${lang}/buyerGuide`}
                                            className="text-xs font-semibold text-slate-300 underline underline-offset-4 decoration-slate-500/70 hover:text-white whitespace-nowrap"
                                        >
                                            구매자 가이드 보기 →
                                        </Link>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                        구매자 메뉴얼에서 안전한 구매 흐름과 주의사항을 확인해 보세요.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path
                                                        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                    />
                                                    <path
                                                        d="M5 20a7 7 0 0 1 14 0"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                    />
                                                    <path
                                                        d="M16 5h4v4"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Seller Guide</p>
                                                <p className="text-base font-semibold text-slate-100 sm:text-lg">판매 시작 전에 확인하세요</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/${lang}/sellerGuide`}
                                            className="text-xs font-semibold text-slate-300 underline underline-offset-4 decoration-slate-500/70 hover:text-white whitespace-nowrap"
                                        >
                                            판매자 가이드 보기 →
                                        </Link>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                        판매자 메뉴얼에서 에스크로 운영과 입금 확인 절차를 확인해 보세요.
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* 신뢰 강조 섹션 */}
                {/*
                <div className="relative mb-12 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 p-8 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.7)] backdrop-blur">
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,var(--sea)_0%,transparent_70%)] opacity-25" />
                    <div className="absolute -bottom-10 left-[-6%] h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-20" />
                    <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-[576px] space-y-4">
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                VASP 등록 에스크로
                            </span>
                            <h2 className="font-[var(--font-display)] text-2xl text-slate-900 sm:text-3xl md:text-4xl">
                                국내 VASP 등록 사업자 에스크로로 신뢰를 더한 P2P
                            </h2>
                            <p className="text-sm text-slate-600 md:text-base">
                                Loot69 P2P는 대한민국에 등록된 VASP(가상자산사업자)가 제공하는 에스크로 서비스를 사용합니다.
                                거래 흐름이 투명하게 관리되어 신뢰할 수 있는 거래 경험을 제공합니다.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 lg:w-[520px]">
                            <div className="flex min-w-[160px] flex-1 items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.6)]">
                                <Image
                                    src="/icon-approved.png"
                                    alt="등록"
                                    width={36}
                                    height={36}
                                    className="h-9 w-9"
                                />
                                <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">국내 VASP 등록</span>
                            </div>
                            <div className="flex min-w-[160px] flex-1 items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.6)]">
                                <Image
                                    src="/icon-escrow-wallet.png"
                                    alt="에스크로"
                                    width={36}
                                    height={36}
                                    className="h-9 w-9"
                                />
                                <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">에스크로 기반</span>
                            </div>
                            <div className="flex min-w-[160px] flex-1 items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.6)]">
                                <Image
                                    src="/icon-shield.png"
                                    alt="신뢰"
                                    width={36}
                                    height={36}
                                    className="h-9 w-9"
                                />
                                <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">신뢰 강화</span>
                            </div>
                        </div>
                    </div>
                </div>
                */}
                

                



                {/* 마켓 시세 섹션 */}
                <div className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div
                        data-reveal
                        className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-5 h-full flex flex-col"
                    >
                        <div className="flex min-h-[80px] flex-col gap-3 sm:min-h-[88px] sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="font-[var(--font-display)] text-lg text-white whitespace-nowrap tracking-tight sm:text-2xl">
                                USDT/KRW 실시간 시세
                            </h2>
                            <p className="text-xs text-slate-400">업비트 기준</p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
                            <span className="rounded-full border border-slate-600/40 bg-slate-900/70 px-2.5 py-1">
                                업데이트{' '}
                                {tickerUpdatedAt
                                    ? new Date(tickerUpdatedAt).toLocaleTimeString('ko-KR', { hour12: false })
                                    : '--:--:--'}
                            </span>
                        </div>
                    </div>

                    {tickerError && <p className="mb-4 text-xs font-semibold text-rose-300">{tickerError}</p>}

                        <div className="mt-auto grid gap-3 pt-5">
                            {marketTickers.map((ticker, index) => {
                                return (
                                <div
                                    key={ticker.id}
                                    data-reveal
                                    style={{ '--reveal-delay': `${index * 0.06}s` } as React.CSSProperties}
                                    className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-4"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={`/icon-market-${ticker.id}.png`}
                                                alt={`${ticker.name} 로고`}
                                                width={40}
                                                height={40}
                                                className="h-8 w-8 rounded-full border border-slate-700/60 bg-slate-900/70 object-contain p-1"
                                            />
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                    {ticker.id.toUpperCase()}
                                                </p>
                                                <p className="text-base font-semibold text-white">{ticker.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
                                            <span className="font-[var(--font-display)] text-2xl text-white tabular-nums sm:text-3xl whitespace-nowrap">
                                                {formatKrw(ticker.price)}
                                            </span>
                                            {ticker.price === null && (
                                                <span className="text-[11px] text-slate-400 whitespace-nowrap">불러오는 중</span>
                                            )}
                                            <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-2.5 py-1 text-[11px] font-semibold text-slate-200 whitespace-nowrap">
                                                USDT/KRW
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500 md:text-right">공개 API 기준</p>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                    <section
                        data-reveal
                        className="rounded-[22px] border border-slate-800/50 bg-slate-950/60 p-6 shadow-[0_18px_40px_-34px_rgba(2,6,23,0.7)] h-full flex flex-col"
                    >
                    <div className="flex min-h-[80px] flex-col gap-4 sm:min-h-[88px] sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/70 text-slate-300">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path
                                        d="M7 3h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                                    Updates
                                </p>
                                <h2 className="font-[var(--font-display)] text-2xl text-slate-100">
                                    공지
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    중요한 변경만 빠르게 안내합니다.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/${lang}/notice`}
                            className="inline-flex items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/70 px-5 py-2 text-xs font-semibold text-slate-300 sm:text-sm"
                        >
                            전체 보기
                        </Link>
                    </div>

                    <div className="mt-auto grid gap-3 pt-5 md:grid-cols-3">
                        {noticeLoading ? (
                            <div className="rounded-xl border border-dashed border-slate-800/60 bg-slate-950/50 px-4 py-6 text-sm text-slate-500">
                                공지 로딩 중.
                            </div>
                        ) : noticeError ? (
                            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-6 text-sm text-slate-400">
                                {noticeError}
                            </div>
                        ) : noticeItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-800/60 bg-slate-950/50 px-4 py-6 text-sm text-slate-500">
                                등록된 공지 없음.
                            </div>
                        ) : (
                            noticeItems.map((notice) => (
                                <Link
                                    key={notice.id}
                                    href={`/${lang}/notice/${notice.id}`}
                                    className="group rounded-xl border border-slate-800/60 bg-slate-950/60 p-4"
                                >
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
                                        {notice.date}
                                    </div>
                                    <p className="mt-2 text-base font-semibold text-slate-100">
                                        {notice.title}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-400">{notice.summary}</p>
                                </Link>
                            ))
                        )}
                    </div>
                    </section>
                </div>

                {bannerAds.length > 0 && (
                    <div
                        data-reveal
                        className="glam-card rounded-[28px] border border-slate-200/70 bg-white/80 p-6 mb-12 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.7)] backdrop-blur overflow-x-hidden"
                    >
                        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                                    {/* partner icon */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block">
                                        <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M19 10h2a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>

                                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
                                        <h2 className="font-[var(--font-display)] text-2xl text-slate-900">제휴 배너</h2>
                                        <a
                                            href="mailto:support@loot.menu"
                                            className="group inline-flex w-full flex-wrap items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 ring-1 ring-rose-400/30 transition hover:-translate-y-0.5 hover:text-rose-100 sm:w-auto sm:flex-nowrap sm:py-1 sm:text-sm"
                                            aria-label="제휴 신청 이메일 보내기"
                                        >
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-200/70 bg-rose-100 text-rose-600">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path
                                                        d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="m4 8 8 5 8-5"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </span>
                                            <span className="tracking-tight">제휴 신청을 받습니다</span>
                                            <span className="break-all rounded-full border border-rose-200/70 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-rose-600 shadow-sm transition group-hover:border-rose-300 group-hover:text-rose-700 sm:text-[11px]">
                                                support@loot.menu
                                            </span>
                                        </a>
                                    </div>
                                </div>

                                <p className="mt-1 text-xs text-slate-600 leading-relaxed sm:text-sm">좌우로 스와이프하여 확인하세요</p>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">USDT 파트너</span>
                        </div>
                        {/* 스크롤 배너 컨테이너 */}

                        <div
                            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-2 scrollbar-hide relative"
                            aria-label="제휴 배너 스크롤"
                        >
                            <div className="absolute left-0 top-0 h-full w-16 bg-[linear-gradient(90deg,rgba(15,23,42,1),rgba(15,23,42,0))]" />
                            <div className="absolute right-0 top-0 h-full w-16 bg-[linear-gradient(270deg,rgba(15,23,42,1),rgba(15,23,42,0))]" />

                            {bannerAds.map((ad) => (
                                <a
                                    key={ad.id}
                                    href={ad.link}
                                    className="banner-card shrink-0 snap-start"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={ad.title}
                                >
                                    <div className="relative w-[78vw] max-w-[260px] aspect-[2/1] overflow-hidden rounded-2xl shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)] sm:w-64 md:max-w-none md:w-72">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={ad.image}
                                            alt={ad.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </a>
                            ))}
                            
                        </div>
                    </div>
                )}

                {/* 통계 섹션 */}
                <div className="grid gap-6 mb-12 md:grid-cols-2">
                    {STAT_ITEMS.map((item, index) => {
                        const style = STAT_CARD_STYLES[index % STAT_CARD_STYLES.length];
                        return (
                            <div
                                key={item.label}
                                data-reveal
                                style={{ '--reveal-delay': `${index * 0.08}s` } as React.CSSProperties}
                                className={`glam-card relative overflow-hidden rounded-2xl border border-slate-200/70 p-6 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.7)] backdrop-blur ${style.base}`}
                            >
                                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${style.orb} opacity-40`} />
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-emerald-600">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                {item.label}
                            </p>
                            <div className="mt-4 grid grid-cols-[1fr_auto] items-baseline gap-3">
                                <span className={`text-right font-[var(--font-display)] text-3xl font-bold tracking-tight tabular-nums sm:text-4xl md:text-5xl ${style.value}`}>
                                    {numberFormatter.format(animatedStats[index])}
                                </span>
                                <span className="w-14 text-sm font-semibold text-slate-500">{item.suffix}</span>
                            </div>
                            <p className="mt-3 text-right text-sm text-slate-600">실시간 누적 지표를 반영합니다.</p>
                            </div>
                        );
                    })}
                </div>

                {/* 뉴스 피드 섹션 */}
                
                <div
                    data-reveal
                    className="glam-card rounded-[24px] border border-slate-800/60 bg-slate-950/70 p-6 mb-12 shadow-[0_24px_60px_-45px_rgba(2,6,23,0.8)] overflow-x-hidden"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                        <div>
                            <h2 className="font-[var(--font-display)] text-2xl text-slate-100 sm:text-3xl">뉴스</h2>
                            <p className="text-sm text-slate-400">핵심 업데이트만 모았습니다.</p>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500">
                            업데이트{' '}
                            {newsUpdatedAt
                                ? new Date(newsUpdatedAt).toLocaleTimeString('ko-KR', { hour12: false })
                                : '--:--:--'}
                        </div>
                    </div>

                    {newsError && <p className="mb-4 text-xs font-semibold text-orange-300">{newsError}</p>}

                    <div
                        ref={newsTickerRef}
                        className="news-ticker relative overflow-x-auto min-w-0 snap-x snap-mandatory"
                        aria-label="스테이블코인 뉴스 피드"
                    >
                        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#0b1220] to-transparent" />
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#0b1220] to-transparent" />
                        <div className="news-ticker-track">
                            {[0, 1].map((loopIndex) => (
                                <div
                                    key={`news-loop-${loopIndex}`}
                                    className="news-ticker-group"
                                    aria-hidden={loopIndex === 1}
                                >
                                    {newsItems.map((news) => {
                                        const imageSrc = news.image || '/icon-market.png';
                                        const isLocalImage = imageSrc.startsWith('/');
                                        return (
                                            <a
                                                key={`${news.id}-${loopIndex}`}
                                                href={news.url}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                tabIndex={loopIndex === 1 ? -1 : undefined}
                                                className="news-card group flex flex-col gap-2 rounded-lg border border-slate-800/60 bg-slate-950/60 p-3 transition duration-300 hover:-translate-y-1 snap-start"
                                            >
                                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                    <span className="inline-flex items-center rounded-full border border-slate-800/60 bg-slate-900/70 px-2 py-1 font-semibold text-slate-300">
                                                        {news.tag}
                                                    </span>
                                                    <span>{formatRelativeTime(news.publishedAt)}</span>
                                                </div>
                                                <p className="text-sm font-semibold leading-snug text-slate-100">
                                                    {news.title}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="font-semibold text-slate-300">{news.source}</span>
                                                    <span className="text-slate-500">•</span>
                                                    <span className="font-semibold text-slate-400 group-hover:text-slate-200">
                                                        보기
                                                    </span>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                


                <div
                    data-reveal
                    className="glam-card rounded-[24px] border border-slate-800/60 bg-slate-950/70 p-7 mb-12 shadow-[0_24px_60px_-45px_rgba(2,6,23,0.8)]"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="font-[var(--font-display)] text-2xl text-slate-100 sm:text-3xl">최근 정산</h2>
                            </div>
                            <p className="text-sm text-slate-400">최근 10건이 순환 표시됩니다.</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] font-semibold text-slate-400">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                구매
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-sky-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                                진행
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-500/10 px-2 py-0.5 text-orange-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                취소
                            </span>
                            <span className="text-slate-500">
                                업데이트{' '}
                                {recentTradesUpdatedAt
                                    ? new Date(recentTradesUpdatedAt).toLocaleTimeString('ko-KR', {
                                          hour12: false,
                                      })
                                    : '--:--:--'}
                            </span>
                        </div>
                    </div>

                    {recentTradesError && (
                        <p className="mb-4 text-xs font-semibold text-orange-300">{recentTradesError}</p>
                    )}

                    {recentTrades.length === 0 ? (
                        <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 px-5 py-6 text-sm text-slate-400">
                            정산 내역을 불러오는 중입니다.
                        </div>
                    ) : (
                        <div className="ticker relative overflow-hidden">
                            <div className="ticker-track">
                                {[0, 1].map((loopIndex) => (
                                    <div key={`trade-loop-${loopIndex}`} className="ticker-group">
                                        {recentTrades.map((trade) => {
                                            const style = TRADE_STYLES[trade.tone];
                                            return (
                                                <div
                                                    key={`${loopIndex}-${trade.id}`}
                                                    className="relative flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800/60 bg-slate-950/60 px-5 py-4"
                                                >
                                                    <span className={`absolute left-0 top-0 h-full w-1.5 ${style.accent}`} />
                                                    <span className={`pointer-events-none absolute right-4 top-3 h-12 w-12 rounded-full ${style.glow} blur-2xl`} />
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-slate-100">
                                                            {style.label}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-100">{trade.user}</p>
                                                            <p className="text-xs text-slate-500">{trade.time}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-semibold text-slate-100">{trade.amount}</p>
                                                        <p className="text-xs text-slate-500">{trade.price}</p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}
                                                    >
                                                        {trade.statusLabel}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#0b1220] to-transparent" />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0b1220] to-transparent" />
                        </div>
                    )}
                </div>

                {/* 주요 기능 소개 */}
                <div className="grid gap-6 mb-12 md:grid-cols-3">
                <div
                    data-reveal
                    style={{ '--reveal-delay': '0s' } as React.CSSProperties}
                    className="glam-card group relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-[linear-gradient(145deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))] p-6 text-slate-100 shadow-[0_30px_70px_-50px_rgba(2,6,23,0.9)] transition hover:-translate-y-1 hover:border-emerald-300/50"
                >
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30 shadow-[0_12px_30px_-18px_rgba(16,185,129,0.45)]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="mb-3 text-center font-[var(--font-display)] text-xl text-emerald-100">즉시 잠금</h3>
                        <p className="text-center text-sm text-emerald-100/70">
                            요청 즉시 자금 잠금.
                        </p>
                    </div>

                <div
                    data-reveal
                    style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}
                    className="glam-card group relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-[linear-gradient(145deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))] p-6 text-slate-100 shadow-[0_30px_70px_-50px_rgba(2,6,23,0.9)] transition hover:-translate-y-1 hover:border-cyan-300/50"
                >
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/30 shadow-[0_12px_30px_-18px_rgba(34,211,238,0.45)]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="mb-3 text-center font-[var(--font-display)] text-xl text-cyan-100">즉시 정산</h3>
                        <p className="text-center text-sm text-cyan-100/70">
                            확인 끝나면 즉시 전송.
                        </p>
                    </div>

                <div
                    data-reveal
                    style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}
                    className="glam-card group relative overflow-hidden rounded-2xl border border-indigo-400/30 bg-[linear-gradient(145deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))] p-6 text-slate-100 shadow-[0_30px_70px_-50px_rgba(2,6,23,0.9)] transition hover:-translate-y-1 hover:border-indigo-300/50"
                >
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/30 shadow-[0_12px_30px_-18px_rgba(99,102,241,0.45)]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="mb-3 text-center font-[var(--font-display)] text-xl text-indigo-100">직거래 체결</h3>
                        <p className="text-center text-sm text-indigo-100/70">
                            가격 선택, 즉시 체결.
                        </p>
                    </div>
                </div>

                {/* 에스크로 시스템 설명 */}
                <div
                    data-reveal="pop"
                    className="glam-card relative overflow-hidden rounded-[26px] border border-emerald-400/30 bg-[radial-gradient(120%_120%_at_0%_0%,#0b1220_0%,#0b1c22_55%,#071018_100%)] p-8 md:p-10 mb-12 text-slate-100 shadow-[0_36px_100px_-60px_rgba(2,6,23,0.9)]"
                >
                    <div className="pointer-events-none absolute right-[-10%] top-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),transparent_70%)] opacity-50 blur-3xl" />
                    <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
                            Escrow Flow
                        </span>
                        <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl">
                            에스크로 보호 플로우
                        </h2>
                        <p className="text-sm text-emerald-100/70">
                            결제부터 정산까지, 보호된 순서로 처리됩니다.
                        </p>
                    </div>

                    <div className="max-w-[768px] mx-auto mt-8">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/70 p-5">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
                                    STEP 01
                                </span>
                                <h3 className="mt-3 text-lg font-semibold text-emerald-100">요청 생성</h3>
                                <p className="mt-2 text-sm text-emerald-100/70">
                                    거래 조건이 확정되면 보호가 시작됩니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/70 p-5">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
                                    STEP 02
                                </span>
                                <h3 className="mt-3 text-lg font-semibold text-emerald-100">테더 보관</h3>
                                <p className="mt-2 text-sm text-emerald-100/70">
                                    판매자가 테더를 에스크로 지갑에 잠급니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/70 p-5">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
                                    STEP 03
                                </span>
                                <h3 className="mt-3 text-lg font-semibold text-emerald-100">입금 알림</h3>
                                <p className="mt-2 text-sm text-emerald-100/70">
                                    구매자가 입금 완료 알림을 전달합니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-400/25 bg-slate-950/70 p-5">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
                                    STEP 04
                                </span>
                                <h3 className="mt-3 text-lg font-semibold text-emerald-100">자동 정산</h3>
                                <p className="mt-2 text-sm text-emerald-100/70">
                                    확인 후 테더가 자동으로 전송됩니다.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-5 text-center">
                            <p className="text-sm text-cyan-100">
                                에스크로가 결제 리스크를 줄이고 안전한 정산을 보장합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 정산 절차 */}
                <div id="settlement-guide" className="grid gap-8 mb-12 md:grid-cols-2">
                    {/* 구매 방법 */}
                    <div
                        data-reveal
                        style={{ '--reveal-delay': '0s' } as React.CSSProperties}
                        className="glam-card rounded-2xl border border-emerald-400/30 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-8 text-slate-100 shadow-[0_30px_70px_-50px_rgba(2,6,23,0.9)]"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200 font-bold text-lg ring-1 ring-emerald-400/30">
                                구매
                            </div>
                            <h3 className="font-[var(--font-display)] text-2xl text-emerald-100">구매 플로우</h3>
                        </div>
                        
                        <ol className="space-y-4 text-emerald-100/80">
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-300">1.</span>
                                <span>조건 선택 → 거래 시작.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-300">2.</span>
                                <span>판매자 에스크로 잠금.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-300">3.</span>
                                <span>계좌 입금 완료.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-300">4.</span>
                                <span>입금 알림 전송.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-300">5.</span>
                                <span>확인 즉시 정산.</span>
                            </li>
                        </ol>

                        <Link 
                            href={buyPageHref}
                            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-6 py-4 text-base font-semibold text-slate-900 shadow-[0_18px_40px_-20px_rgba(16,185,129,0.6)] transition hover:brightness-110"
                        >
                            구매 시작 →
                        </Link>
                    </div>

                    {/* 판매 방법 */}
                    <div
                        data-reveal
                        style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}
                        className="glam-card rounded-2xl border border-cyan-400/30 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-8 text-slate-100 shadow-[0_30px_70px_-50px_rgba(2,6,23,0.9)]"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200 font-bold text-lg ring-1 ring-cyan-400/30">
                                판매
                            </div>
                            <h3 className="font-[var(--font-display)] text-2xl text-cyan-100">판매 플로우</h3>
                        </div>
                        
                        <ol className="space-y-4 text-cyan-100/80">
                            <li className="flex gap-3">
                                <span className="font-bold text-cyan-300">1.</span>
                                <span>판매 조건 등록.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-cyan-300">2.</span>
                                <span>구매 요청 수락.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-cyan-300">3.</span>
                                <span>에스크로 지갑 전송.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-cyan-300">4.</span>
                                <span>입금 확인.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-cyan-300">5.</span>
                                <span>확인 즉시 정산.</span>
                            </li>
                        </ol>

                        {canStartSeller ? (
                            <Link 
                                href={sellerPageHref}
                                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-900 shadow-[0_18px_40px_-20px_rgba(34,211,238,0.55)] transition hover:brightness-110"
                            >
                                판매 시작 →
                            </Link>
                        ) : (
                            <div className="mt-8 flex items-center justify-center">
                                {needsSellerSetup ? (
                                    <Link
                                        href={sellerSetupHref}
                                        className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_16px_40px_-24px_rgba(34,211,238,0.6)] transition hover:brightness-110 sm:w-auto"
                                    >
                                        판매 설정 →
                                    </Link>
                                ) : (
                                    <span
                                        className={`relative inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border px-6 py-3 text-sm font-semibold tracking-tight sm:w-auto ${sellerCtaTone}`}
                                    >
                                        {!hasWallet && (
                                            <span className="pointer-events-none absolute -right-5 -top-3 h-8 w-8 rounded-full bg-orange-300/40 blur-2xl" />
                                        )}
                                        <span className="relative">{sellerCtaLabel}</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* FAQ */}
                <div
                    data-reveal
                    className="glam-card rounded-2xl border border-slate-800/60 bg-slate-950/70 p-8 mb-12 shadow-[0_30px_70px_-50px_rgba(2,6,23,0.85)]"
                >
                    <h2 className="font-[var(--font-display)] text-2xl text-center mb-8 text-slate-100 sm:text-3xl">FAQ</h2>
                    
                    <ul className="space-y-3 max-w-[672px] mx-auto text-sm text-slate-300">
                        <li className="flex items-center justify-between gap-4 border-b border-slate-800/70 pb-3">
                            <span className="font-semibold text-slate-100">안전성</span>
                            <span className="text-slate-300">에스크로 보호 + 확인 후 정산</span>
                        </li>
                        <li className="flex items-center justify-between gap-4 border-b border-slate-800/70 pb-3">
                            <span className="font-semibold text-slate-100">수수료</span>
                            <span className="text-slate-300">거래 시작 전 투명 고지</span>
                        </li>
                        <li className="flex items-center justify-between gap-4 border-b border-slate-800/70 pb-3">
                            <span className="font-semibold text-slate-100">정산 시간</span>
                            <span className="text-slate-300">평균 10–30분 내 확인</span>
                        </li>
                        <li className="flex items-center justify-between gap-4">
                            <span className="font-semibold text-slate-100">분쟁</span>
                            <span className="text-slate-300">고객센터 즉시 대응</span>
                        </li>
                    </ul>
                </div>

                {/* 최종 CTA */}
                <div
                    data-reveal="pop"
                    className="glam-card relative overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#0b1220_0%,#0f172a_55%,#1f2937_100%)] p-8 text-center text-white shadow-[0_40px_120px_-60px_rgba(2,6,23,0.9)]"
                >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
                    <h2 className="font-[var(--font-display)] text-2xl mb-4 sm:text-3xl text-white">
                        안심 거래, 지금 시작하세요.
                    </h2>
                    <p className="text-lg text-slate-300 mb-8">
                        KYC·에스크로·분쟁조정으로 결제를 보호합니다.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link 
                            href={buyPageHref}
                            className="w-full sm:w-auto rounded-full bg-emerald-400/90 px-8 py-5 text-lg font-bold text-slate-900 shadow-[0_18px_45px_-25px_rgba(2,6,23,0.8)] transition hover:bg-emerald-300"
                        >
                            지금 구매 시작 →
                        </Link>
                        <a 
                            href="#settlement-guide"
                            className="w-full sm:w-auto rounded-full border border-slate-600/70 bg-slate-900/60 px-8 py-5 text-lg font-bold text-slate-100 transition hover:bg-slate-800/70"
                        >
                            정산 절차 보기 →
                        </a>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 border-t border-white/10 bg-[#1f1f1f] px-6 py-14 text-center text-slate-200">
                <div className="mx-auto flex max-w-[672px] flex-col items-center gap-6">
                    <div className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_16px_40px_-28px_rgba(2,6,23,0.9)]">
                        <Image
                            src="/logo-loot.png"
                            alt="Loot69"
                            width={260}
                            height={80}
                            className="h-12 w-auto drop-shadow-lg brightness-110 sm:h-14"
                        />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300">
                        <Link href={`/${lang}/terms-of-service`} className="hover:text-white">
                            이용약관
                        </Link>
                        <span className="text-slate-500">|</span>
                        <Link href={`/${lang}/privacy-policy`} className="hover:text-white">
                            개인정보처리방침
                        </Link>
                        <span className="text-slate-500">|</span>
                        <Link href={`/${lang}/refund-policy`} className="hover:text-white">
                            환불·분쟁 정책
                        </Link>
                    </div>
                    <div className="mt-2 w-full max-w-[640px] rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-left text-xs leading-relaxed text-amber-100 shadow-[0_12px_35px_-28px_rgba(245,158,11,0.7)]">
                        <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                            경고
                        </span>
                        가상자산 결제는 가격 변동·네트워크 지연 등으로 손실 위험이 있습니다.
                        결제 전에 수수료·환율·정산 조건을 반드시 확인하세요.
                    </div>
                    <div className="text-sm text-slate-400">
                        <p>이메일 : help@loot.menu</p>
                        <p>주소 : 14F, Corner of St. Paul &amp; Tombs of the Kings, 8046 Paphos, Cyprus</p>
                    </div>
                    <p className="text-sm text-slate-500">Copyright © Loot69 All Rights Reserved</p>
                </div>
            </footer>

            {bannerAds.length > 0 && (
                <div className="lg:hidden border-t border-slate-200/70 bg-white/85 shadow-[0_-18px_60px_-50px_rgba(15,23,42,0.6)] backdrop-blur">
                    <div className="flex flex-col gap-3 p-3">
                        {bannerAds.map((ad) => (
                            <a
                                key={`mobile-${ad.id}`}
                                href={ad.link}
                                className="w-full"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <div className="overflow-hidden rounded-2xl shadow-[0_16px_45px_-32px_rgba(15,23,42,0.6)] transition hover:shadow-[0_26px_60px_-36px_rgba(15,23,42,0.6)]">
                                    <div className="relative aspect-[2/1] overflow-hidden bg-[#f1eee7]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={ad.image}
                                            alt={ad.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .hero-fade {
                    animation: heroFade 0.9s ease-out both;
                }

                .loot-shell {
                    color: var(--ink);
                }

                .scanline {
                    background: linear-gradient(
                        180deg,
                        transparent 0%,
                        rgba(56, 189, 248, 0.08) 50%,
                        transparent 100%
                    );
                    animation: scanlineMove 10s linear infinite;
                    opacity: 0.6;
                }

                .float-slow {
                    animation: floatSlow 12s ease-in-out infinite;
                }

                .float-slower {
                    animation: floatSlow 16s ease-in-out infinite;
                }

                [data-reveal] {
                    opacity: 0;
                    transform: translateY(28px) scale(0.985);
                    filter: saturate(0.95);
                    transition:
                        opacity 0.7s ease,
                        transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1),
                        filter 0.7s ease;
                    transition-delay: var(--reveal-delay, 0s);
                    will-change: transform, opacity;
                }

                [data-reveal='left'] {
                    transform: translateX(-32px) scale(0.985);
                }

                [data-reveal='right'] {
                    transform: translateX(32px) scale(0.985);
                }

                [data-reveal='pop'] {
                    transform: translateY(18px) scale(0.96);
                }

                [data-reveal].is-visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    filter: saturate(1.08);
                }

                .glam-card {
                    position: relative;
                    overflow: hidden;
                }

                .glam-card::before {
                    content: '';
                    position: absolute;
                    inset: -1px;
                    border-radius: inherit;
                    background: linear-gradient(
                        135deg,
                        rgba(56, 189, 248, 0.28),
                        rgba(16, 185, 129, 0.22),
                        rgba(249, 115, 22, 0.18),
                        rgba(15, 23, 42, 0.12)
                    );
                    opacity: 0;
                    mix-blend-mode: screen;
                    transition: opacity 0.6s ease;
                    pointer-events: none;
                }

                .glam-card::after {
                    content: '';
                    position: absolute;
                    top: -40%;
                    left: -20%;
                    width: 140%;
                    height: 60%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(226, 232, 240, 0.25),
                        transparent
                    );
                    opacity: 0;
                    transform: translateX(-60%) rotate(2deg);
                    pointer-events: none;
                }

                [data-reveal].is-visible.glam-card::before {
                    opacity: 0.45;
                }

                [data-reveal].is-visible.glam-card::after {
                    opacity: 1;
                    animation: sheenMove 1.6s ease 0.2s both;
                }

                .scroll-aurora {
                    transform: translateY(calc(var(--scroll-progress, 0) * 120px));
                    transition: transform 0.25s ease-out;
                }

                .scroll-aurora-alt {
                    transform: translateY(calc(var(--scroll-progress, 0) * -160px));
                    transition: transform 0.3s ease-out;
                }

                .ticker {
                    height: 320px;
                }

                .ticker-track {
                    display: flex;
                    flex-direction: column;
                    animation: tickerMove 20s linear infinite;
                    will-change: transform;
                }

                .ticker-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .ticker:hover .ticker-track {
                    animation-play-state: paused;
                }

                .seller-ticker {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                    -webkit-overflow-scrolling: touch;
                }

                .seller-ticker-track {
                    display: flex;
                    gap: 16px;
                    max-width: 100%;
                    min-width: 0;
                }

                .seller-ticker-group {
                    display: flex;
                    gap: 16px;
                    width: max-content;
                }

                .seller-card {
                    flex: 0 0 320px;
                    width: 320px;
                    max-width: 320px;
                }

                .seller-ticker:hover .seller-ticker-track {
                    animation-play-state: paused;
                }

                .news-ticker {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                    -webkit-overflow-scrolling: touch;
                }

                .news-ticker-track {
                    display: flex;
                    gap: 18px;
                    max-width: 100%;
                    min-width: 0;
                }

                .news-ticker-group {
                    display: flex;
                    gap: 18px;
                    width: max-content;
                }

                .news-card {
                    flex: 0 0 280px;
                    width: 280px;
                    max-width: 280px;
                }

                .news-ticker:hover .news-ticker-track {
                    animation-play-state: paused;
                }

                .chat-preview-list {
                    max-height: 220px;
                    overflow-y: auto;
                }

                .chat-preview-list::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-preview-list::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.4);
                    border-radius: 999px;
                }

                .chat-preview-list::-webkit-scrollbar-track {
                    background: transparent;
                }

                .banner-scroll {
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }

                .promo-text {
                    position: relative;
                    display: inline-block;
                    max-width: 100%;
                    margin-top: 6px;
                    padding: 6px 10px;
                    border-radius: 12px;
                    background: rgba(15, 23, 42, 0.85);
                    border: 1px solid rgba(51, 65, 85, 0.6);
                    box-shadow: 0 10px 24px -18px rgba(2, 6, 23, 0.6);
                }

                .promo-text::before {
                    content: '';
                    position: absolute;
                    left: -8px;
                    top: 6px;
                    border-width: 8px 8px 8px 0;
                    border-style: solid;
                    border-color: transparent rgba(51, 65, 85, 0.6) transparent transparent;
                }

                .promo-text::after {
                    content: '';
                    position: absolute;
                    left: -6px;
                    top: 7px;
                    border-width: 6px 6px 6px 0;
                    border-style: solid;
                    border-color: transparent rgba(15, 23, 42, 0.85) transparent transparent;
                }

                .promo-text-content {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    word-break: break-word;
                }

                .promo-text-label {
                    font-weight: 600;
                    color: #94a3b8;
                }

                .promo-text-message {
                    font-weight: 600;
                    color: #e2e8f0;
                }

                .banner-scroll::-webkit-scrollbar {
                    height: 8px;
                }

                .banner-scroll::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.35);
                    border-radius: 999px;
                }

                .banner-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .banner-card {
                    scroll-snap-align: center;
                    flex: 0 0 auto;
                }

                @keyframes heroFade {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes sheenMove {
                    from {
                        transform: translateX(-60%) rotate(2deg);
                    }
                    to {
                        transform: translateX(60%) rotate(2deg);
                    }
                }

                @keyframes floatSlow {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(16px);
                    }
                }

                @keyframes scanlineMove {
                    0% {
                        transform: translateY(-35%);
                    }
                    100% {
                        transform: translateY(35%);
                    }
                }

                @keyframes tickerMove {
                    from {
                        transform: translateY(0);
                    }
                    to {
                        transform: translateY(-50%);
                    }
                }

                @keyframes sellerTickerMove {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }

                @keyframes newsTickerMove {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }

                .web3-cta {
                    position: relative;
                    overflow: hidden;
                    animation: web3CtaPulse 1.4s ease-in-out infinite;
                    will-change: transform, box-shadow;
                }

                .web3-cta::before {
                    content: '';
                    position: absolute;
                    inset: -18px;
                    border-radius: inherit;
                    background: radial-gradient(circle, rgba(249, 115, 22, 0.45), transparent 65%);
                    opacity: 0.7;
                    filter: blur(14px);
                    z-index: 0;
                }

                .web3-cta::after {
                    content: '';
                    position: absolute;
                    top: -60%;
                    left: -40%;
                    width: 45%;
                    height: 220%;
                    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.75), transparent);
                    transform: translateX(-120%);
                    animation: web3CtaSheen 1.6s ease-in-out infinite;
                    z-index: 0;
                }

                .web3-cta > * {
                    position: relative;
                    z-index: 1;
                }

                @keyframes web3CtaPulse {
                    0%,
                    100% {
                        transform: translateY(0) scale(1);
                        box-shadow: 0 22px 50px -22px rgba(249, 115, 22, 0.85);
                    }
                    50% {
                        transform: translateY(-1px) scale(1.03);
                        box-shadow: 0 30px 60px -24px rgba(249, 115, 22, 0.95);
                    }
                }

                @keyframes web3CtaSheen {
                    0% {
                        transform: translateX(-120%);
                        opacity: 0;
                    }
                    20% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateX(240%);
                        opacity: 0;
                    }
                }

                @media (max-width: 640px) {
                    .ticker {
                        height: 280px;
                    }

                    .seller-card {
                        flex: 0 0 260px;
                        width: 260px;
                        max-width: 260px;
                    }

                    .news-card {
                        flex: 0 0 220px;
                        width: 220px;
                        max-width: 220px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ticker-track {
                        animation: none;
                    }
                    .seller-ticker-track {
                        animation: none;
                    }
                    .news-ticker-track {
                        animation: none;
                    }
                    .float-slow,
                    .float-slower,
                    .hero-fade {
                        animation: none;
                    }
                    .scanline {
                        animation: none;
                    }
                    .web3-cta,
                    .web3-cta::before,
                    .web3-cta::after {
                        animation: none;
                    }
                    [data-reveal] {
                        opacity: 1;
                        transform: none;
                        filter: none;
                        transition: none;
                    }
                    .glam-card::before,
                    .glam-card::after {
                        animation: none;
                        opacity: 0;
                    }
                    .scroll-aurora,
                    .scroll-aurora-alt {
                        transform: none;
                        transition: none;
                    }
                }
            `}</style>
            <style jsx global>{`
                .loot-shell .bg-white,
                .loot-shell .bg-white\\/70,
                .loot-shell .bg-white\\/80,
                .loot-shell .bg-white\\/85,
                .loot-shell .bg-white\\/90,
                .loot-shell .bg-white\\/95,
                .loot-shell .bg-slate-50,
                .loot-shell .bg-slate-100 {
                    background-color: rgba(15, 23, 42, 0.75) !important;
                }

                .loot-shell .border-slate-200,
                .loot-shell .border-slate-200\\/70,
                .loot-shell .border-slate-200\\/80,
                .loot-shell .border-slate-200\\/90,
                .loot-shell .border-slate-300\\/70,
                .loot-shell .border-slate-300\\/80,
                .loot-shell .border-slate-300\\/90 {
                    border-color: rgba(51, 65, 85, 0.7) !important;
                }

                .loot-shell .text-slate-900,
                .loot-shell .text-slate-800 {
                    color: #e2e8f0 !important;
                }

                .loot-shell .accent-cta {
                    color: #0f172a !important;
                }

                .loot-shell .text-slate-700 {
                    color: #cbd5e1 !important;
                }

                .loot-shell .text-slate-600,
                .loot-shell .text-slate-500 {
                    color: #94a3b8 !important;
                }
            `}</style>
        </div>
    );
}
