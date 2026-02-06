'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConnectButton, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { toast } from 'react-hot-toast';
import { client } from '@/app/client';
import { chain as chainId } from '@/app/config/contractAddresses';
import { useClientWallets } from '@/lib/useClientWallets';

type BuyOrder = {
  _id?: string;
  tradeId?: string;
  status?: string;
  usdtAmount?: number;
  krwAmount?: number;
  rate?: number;
  createdAt?: string;
  walletAddress?: string;
  nickname?: string;
  avatar?: string;
  seller?: {
    walletAddress?: string;
    escrowWalletAddress?: string;
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    };
  };
  store?: {
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    };
  };
  buyer?: {
    nickname?: string;
    avatar?: string;
    walletAddress?: string;
    depositName?: string;
    depositBankName?: string;
    depositBankAccountNumber?: string;
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    };
  };
  escrowBalance?: number;
  paymentConfirmedAt?: string;
  escrowTransactionHash?: string;
  chain?: string;
};

type SellerUser = {
  escrowWalletAddress?: string;
  vaultWallet?: { address?: string | null } | null;
  seller?: {
    escrowWalletAddress?: string;
  };
};

const STORECODE = 'admin';
const explorerByChain: Record<string, string> = {
  bsc: 'https://bscscan.com/tx/',
  polygon: 'https://polygonscan.com/tx/',
  arbitrum: 'https://arbiscan.io/tx/',
  ethereum: 'https://etherscan.io/tx/',
};

function chainMeta(chain?: string) {
  const c = (chain || chainId || 'bsc').toLowerCase();
  switch (c) {
    case 'polygon':
      return { key: 'polygon', label: 'Polygon', color: 'bg-[#8247e5]' };
    case 'arbitrum':
      return { key: 'arbitrum', label: 'Arbitrum', color: 'bg-[#28a0f0]' };
    case 'ethereum':
      return { key: 'ethereum', label: 'Ethereum', color: 'bg-[#627eea]' };
    default:
      return { key: 'bsc', label: 'BSC', color: 'bg-[#f0b90b]' };
  }
}

function chainBadge(chain?: string) {
  const meta = chainMeta(chain);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-semibold text-emerald-50">
      <span className={`h-2 w-2 rounded-full ${meta.color}`} />
      {meta.label}
    </span>
  );
}

function formatNumber(value?: number) {
  if (!Number.isFinite(value)) return '-';
  return Number(value).toLocaleString('ko-KR');
}

function shortAddr(addr?: string) {
  if (!addr) return '-';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function normalizeId(value: any) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.$oid || value.oid || value._id || '';
  }
  return String(value);
}

function statusBadge(status?: string) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border';
  switch (status) {
    case 'paymentConfirmed':
      return `${base} bg-emerald-900/40 text-emerald-100 border-emerald-400/70 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]`;
    case 'paymentRequested':
      return `${base} bg-amber-900/40 text-amber-100 border-amber-300/70 shadow-[0_0_0_1px_rgba(251,191,36,0.5)]`;
    case 'accepted':
      return `${base} bg-sky-900/40 text-sky-100 border-sky-300/70 shadow-[0_0_0_1px_rgba(56,189,248,0.4)]`;
    case 'cancelled':
      return `${base} bg-rose-900/40 text-rose-100 border-rose-300/70 shadow-[0_0_0_1px_rgba(248,113,113,0.4)]`;
    default:
      return `${base} bg-slate-900/40 text-slate-100 border-slate-500/50`;
  }
}

export default function SellerBuyOrderListPage() {
  const params = useParams<{ lang?: string; escrowWalletAddress?: string }>();
  const router = useRouter();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';
  const escrowParam = params?.escrowWalletAddress;
  const escrowWalletAddress = (Array.isArray(escrowParam) ? escrowParam[0] : escrowParam || '').toLowerCase();

  const { wallets } = useClientWallets();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const rawAddress = activeAccount?.address ?? activeWallet?.getAccount?.()?.address ?? '';
  const address = rawAddress.toLowerCase();
  const isLoggedIn = Boolean(rawAddress);

  const [sellerUser, setSellerUser] = useState<SellerUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const [orders, setOrders] = useState<BuyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<BuyOrder | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmTx, setConfirmTx] = useState<string | null>(null);
  const [confirmDone, setConfirmDone] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'progress' | 'done' | 'cancelled'>('all');
  const [minUsdt, setMinUsdt] = useState('');
  const [maxUsdt, setMaxUsdt] = useState('');
  const [minKrw, setMinKrw] = useState('');
  const [maxKrw, setMaxKrw] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const candidateEscrows = useMemo(() => {
    const list = [
      sellerUser?.seller?.escrowWalletAddress,
      sellerUser?.escrowWalletAddress,
      sellerUser?.vaultWallet?.address,
    ].filter((v): v is string => Boolean(v));
    return list;
  }, [sellerUser]);

  const filteredOrders = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const minU = Number(minUsdt);
    const maxU = Number(maxUsdt);
    const minK = Number(minKrw);
    const maxK = Number(maxKrw);
    const from = fromDate ? new Date(fromDate).getTime() : null;
    const to = toDate ? new Date(toDate).getTime() : null;

    return orders
      .filter(
        (order) =>
          (order?.seller?.escrowWalletAddress || order?.seller?.walletAddress || '').toLowerCase() ===
          escrowWalletAddress,
      )
      .filter((order) => {
        if (kw) {
          const bag = [
            order.tradeId,
            order.walletAddress,
            order.buyer?.walletAddress,
            order.buyer?.nickname,
            order.nickname,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!bag.includes(kw)) return false;
        }
        const u = Number(order.usdtAmount || 0);
        const k = Number(order.krwAmount || 0);
        if (minUsdt && Number.isFinite(minU) && u < minU) return false;
        if (maxUsdt && Number.isFinite(maxU) && u > maxU) return false;
        if (minKrw && Number.isFinite(minK) && k < minK) return false;
        if (maxKrw && Number.isFinite(maxK) && k > maxK) return false;
        if (from && order.createdAt && new Date(order.createdAt).getTime() < from) return false;
        if (to && order.createdAt && new Date(order.createdAt).getTime() > to) return false;
        if (statusFilter === 'progress' && ['paymentConfirmed', 'cancelled'].includes(order.status || '')) return false;
        if (statusFilter === 'done' && order.status !== 'paymentConfirmed') return false;
        if (statusFilter === 'cancelled' && order.status !== 'cancelled') return false;
        return true;
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [orders, escrowWalletAddress, keyword, minUsdt, maxUsdt, minKrw, maxKrw, fromDate, toDate, statusFilter]);

  const loadOrders = async () => {
    if (!escrowWalletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/order/getBuyOrdersByEscrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 300,
          page: 1,
          escrowWalletAddress,
          includeCancelled: true,
          includeCompleted: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'failed');
      const fetched: BuyOrder[] = data?.result?.orders || [];
      setOrders(fetched);
    } catch (err) {
      setError('구매 신청 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    if (!rawAddress) return;
    setAuthChecked(false);
    setUnauthorized(false);
    try {
      const res = await fetch('/api/user/getUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storecode: STORECODE, walletAddress: rawAddress }),
      });
      const data = await res.json().catch(() => ({}));
      const user: SellerUser | null = data?.result || null;
      setSellerUser(user);

      const candidateEscrows = [
        user?.seller?.escrowWalletAddress,
        (user as any)?.escrowWalletAddress,
        (user as any)?.vaultWallet?.address,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      const isAuthorized = candidateEscrows.includes(escrowWalletAddress);

      if (isAuthorized) {
        await loadOrders();
      } else {
        setUnauthorized(true);
      }
    } catch (err) {
      setUnauthorized(true);
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    if (!rawAddress) return;
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawAddress, escrowWalletAddress]);

  const statusLabel = (status?: string) => {
    switch (status) {
      case 'paymentRequested':
        return '결제 요청중';
      case 'paymentConfirmed':
        return '결제완료';
      case 'accepted':
        return '판매자 승인';
      case 'cancelled':
        return '취소됨';
      default:
        return '접수됨';
    }
  };

  const remainingMinutes = (createdAt?: string) => {
    if (!createdAt) return null;
    const minutes = Math.max(0, 30 - Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    return minutes;
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1226] to-[#050915] px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-300">판매자 대시보드</p>
              <h1 className="text-2xl font-bold text-white">지갑을 연결해주세요</h1>
              <p className="mt-2 text-sm text-slate-400">구매자가 신청한 주문을 확인하려면 로그인하세요.</p>
              <button
                type="button"
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                ← 돌아가기
              </button>
            </div>
            <ConnectButton
              client={client}
              wallets={wallets}
              theme="dark"
              connectButton={{
                label: '웹3 로그인',
                style: {
                  height: 48,
                  borderRadius: 9999,
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontWeight: 700,
                  border: '1px solid rgba(94,234,212,0.4)',
                },
              }}
              connectModal={{ size: 'wide', showThirdwebBranding: false }}
              locale="ko_KR"
            />
          </div>
        </div>
      </main>
    );
  }

  if (authChecked && unauthorized) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1226] to-[#050915] px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-300/40 bg-rose-900/20 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold text-white">접근 권한이 없습니다.</h1>
          <p className="mt-2 text-sm text-rose-100/80">
            연결된 지갑의 에스크로 주소와 경로의 주소가 일치하지 않습니다.
          </p>
          <p className="mt-4 text-sm text-slate-200">
            경로 주소: <span className="font-mono text-emerald-200">{escrowParam}</span>
          </p>
          <p className="text-sm text-slate-200">
            내 에스크로:{' '}
            <span className="font-mono text-emerald-200">
              {candidateEscrows.length > 0 ? candidateEscrows.join(', ') : '없음'}
            </span>
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            ← 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1226] to-[#050915] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Seller</p>
            <h1 className="text-2xl font-bold text-white">구매 신청 내역</h1>
            <p className="mt-2 text-sm text-slate-300">
              구매자가 신청한 주문을 확인하고 상태를 한눈에 살펴보세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              ← 돌아가기
            </button>
            <button
              type="button"
              onClick={loadOrders}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/30"
            >
              새로고침
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-inner space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="지갑주소 / 주문번호 / 닉네임 검색"
              className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="all">전체 상태</option>
              <option value="progress">진행 중 (요청/승인)</option>
              <option value="done">결제 완료</option>
              <option value="cancelled">취소</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={minUsdt}
                onChange={(e) => setMinUsdt(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                placeholder="USDT 최소"
                inputMode="decimal"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <input
                value={maxUsdt}
                onChange={(e) => setMaxUsdt(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                placeholder="USDT 최대"
                inputMode="decimal"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={minKrw}
                onChange={(e) => setMinKrw(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="KRW 최소"
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <input
                value={maxKrw}
                onChange={(e) => setMaxKrw(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="KRW 최대"
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <button
                type="button"
                onClick={loadOrders}
                className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-900 shadow hover:bg-emerald-400"
              >
                목록 다시 불러오기
              </button>
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  setStatusFilter('all');
                  setMinUsdt('');
                  setMaxUsdt('');
                  setMinKrw('');
                  setMaxKrw('');
                  setFromDate('');
                  setToDate('');
                }}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </section>
        <section className="space-y-3">
          {loading && (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-sm text-slate-300">
              구매 신청 내역을 불러오는 중입니다...
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          )}
          {!loading && !error && filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-sm text-slate-300">
              현재 접수된 구매 신청이 없습니다.
            </div>
          )}

          {!loading &&
            !error &&
            filteredOrders.map((order) => {
              const remain = order.status === 'paymentRequested' ? remainingMinutes(order.createdAt) : null;
              const buyerNick = order.buyer?.nickname || order.nickname || '구매자';
              const buyerAvatar = order.buyer?.avatar || order.avatar || '/profile-default.png';
              const buyerWallet = order.buyer?.walletAddress || order.walletAddress;
              const sellerBank = order.seller?.bankInfo || order.store?.bankInfo;
              const escrowTx =
                (order as any)?.escrowTransactionHash ||
                (order as any)?.transactionHash ||
                (order as any)?.escrowWallet?.transactionHash;
              return (
                <div
                  key={order._id || order.tradeId}
                  className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 shadow-[0_18px_40px_-24px_rgba(16,185,129,0.45)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full border border-emerald-400/40 bg-emerald-500/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={buyerAvatar} alt={buyerNick} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-white leading-tight">
                            {buyerNick}
                            <span className="ml-2 font-mono text-[11px] text-emerald-100">{shortAddr(buyerWallet)}</span>
                          </div>
                          {order.buyer?.depositName && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-50 border border-emerald-300/50">
                              입금자명
                              <span className="text-white">{order.buyer.depositName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-extrabold text-white leading-tight">
                        {order.usdtAmount} USDT / {formatNumber(order.krwAmount)}원
                      </p>
                      <p className="text-[11px] text-emerald-100/80">
                        환율 {formatNumber(order.rate)} 원 · 주문번호 {order.tradeId || '-'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        신청 시각: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                      </p>
                      {order.buyer?.depositName && (
                        <p className="text-[11px] text-slate-200">
                          입금자명: <span className="font-bold text-white">{order.buyer.depositName}</span>
                        </p>
                      )}
                      {(order.buyer?.depositBankName || order.buyer?.depositBankAccountNumber) && (
                        <p className="text-[11px] text-slate-300">
                          입금계좌: {order.buyer?.depositBankName || '-'} / {order.buyer?.depositBankAccountNumber || '-'}
                        </p>
                      )}
                      {remain !== null && (
                        <p className="text-[11px] font-semibold text-amber-100">남은 시간: {remain}분</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={statusBadge(order.status)}>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {statusLabel(order.status)}
                      </span>
                      {order.status === 'paymentRequested' && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmError(null);
                            setConfirmTx(null);
                            setConfirmDone(false);
                            setConfirmingOrder(order);
                          }}
                          className="rounded-full bg-emerald-400 px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow hover:bg-emerald-300 transition"
                        >
                          결제 확인하기
                        </button>
                      )}
                      {order.buyer?.bankInfo && (
                        <div className="w-64 rounded-xl border border-sky-300/40 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-50">
                          <div className="font-semibold">구매자 입금 정보</div>
                          <div className="mt-1 space-y-0.5">
                            <div>은행: {order.buyer.bankInfo.bankName || order.buyer.depositBankName || '-'}</div>
                            <div>계좌: {order.buyer.bankInfo.accountNumber || order.buyer.depositBankAccountNumber || '-'}</div>
                            <div>예금주: {order.buyer.bankInfo.accountHolder || order.buyer.depositName || '-'}</div>
                          </div>
                        </div>
                      )}
                      {sellerBank && (
                        <div className="w-64 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-[11px] text-emerald-50">
                          <div className="font-semibold">판매자 정산 계좌</div>
                          <div className="mt-1 space-y-0.5">
                            <div>은행: {sellerBank.bankName || '-'}</div>
                            <div>계좌: {sellerBank.accountNumber || '-'}</div>
                            <div>예금주: {sellerBank.accountHolder || '-'}</div>
                          </div>
                        </div>
                      )}
                      {order.status === 'paymentConfirmed' && escrowTx && (
                        <div className="w-64 rounded-xl border border-emerald-200/40 bg-emerald-400/10 px-3 py-2 text-[11px] text-emerald-50">
                          <div className="font-semibold">에스크로 전송 기록</div>
                          <div className="mt-1 break-all font-mono text-[11px] text-emerald-100">
                            {escrowTx}
                          </div>
                          {order.paymentConfirmedAt && (
                            <div className="mt-1 text-[10px] text-emerald-100/80">
                              전송 시각: {new Date(order.paymentConfirmedAt).toLocaleString()}
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            {chainBadge(order.chain as string)}
                            {explorerByChain[(order.chain as string)?.toLowerCase?.() || (chainId || 'bsc')] && (
                              <a
                                href={`${explorerByChain[(order.chain as string)?.toLowerCase?.() || (chainId || 'bsc')]}${escrowTx}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold text-emerald-50 hover:bg-emerald-500/30"
                              >
                                스캔에서 확인하기
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </section>
      </div>

      {confirmingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => (!confirming ? setConfirmingOrder(null) : null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">결제 정보 확인</h3>
            <p className="mt-2 text-sm text-slate-300">
              입금이 실제로 확인되었는지 반드시 확인 후 진행하세요. 확인 시 판매자 에스크로에서 구매자 지갑으로 USDT가 전송되고, 주문 상태가 결제완료로 변경됩니다.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>주문번호</span>
                <span className="font-mono text-emerald-100">{confirmingOrder.tradeId || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>구매 수량</span>
                <span className="text-xl font-extrabold text-white">{confirmingOrder.usdtAmount} USDT</span>
              </div>
              <div className="flex justify-between">
                <span>결제 금액</span>
                <span className="text-xl font-extrabold text-white">
                  {formatNumber(confirmingOrder.krwAmount)} 원
                </span>
              </div>
              <div className="flex justify-between">
                <span>에스크로 지갑</span>
                <span className="font-mono text-emerald-100">
                  {shortAddr(confirmingOrder.seller?.escrowWalletAddress || confirmingOrder.seller?.walletAddress)}
                </span>
              </div>
              {typeof confirmingOrder?.escrowBalance === 'number' && (
                <div className="flex justify-between">
                  <span>에스크로 잔고</span>
                  <span className="font-semibold text-white">
                    {confirmingOrder.escrowBalance.toLocaleString('ko-KR')} USDT
                  </span>
                </div>
              )}
              <div className="rounded-xl border border-sky-300/30 bg-sky-500/10 p-3 text-[12px] text-sky-50">
                <div className="font-semibold">구매자 입금 정보</div>
                <div className="mt-1 space-y-0.5">
                  <div>은행: {confirmingOrder.buyer?.bankInfo?.bankName || confirmingOrder.buyer?.depositBankName || '-'}</div>
                  <div>계좌: {confirmingOrder.buyer?.bankInfo?.accountNumber || confirmingOrder.buyer?.depositBankAccountNumber || '-'}</div>
                  <div>예금주: {confirmingOrder.buyer?.bankInfo?.accountHolder || confirmingOrder.buyer?.depositName || '-'}</div>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-[12px] text-emerald-50">
                <div className="font-semibold">USDT 수령 지갑</div>
                <div className="mt-1 font-mono text-[11px] text-emerald-100">
                  {shortAddr(confirmingOrder.buyer?.walletAddress || confirmingOrder.walletAddress)}
                </div>
              </div>
              {(confirmingOrder.seller?.bankInfo || confirmingOrder.store?.bankInfo) && (
                <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-[12px] text-emerald-50">
                  <div className="font-semibold">판매자 정산 계좌</div>
                  <div className="mt-1 space-y-0.5">
                    <div>은행: {(confirmingOrder.seller?.bankInfo || confirmingOrder.store?.bankInfo)?.bankName || '-'}</div>
                    <div>계좌: {(confirmingOrder.seller?.bankInfo || confirmingOrder.store?.bankInfo)?.accountNumber || '-'}</div>
                    <div>예금주: {(confirmingOrder.seller?.bankInfo || confirmingOrder.store?.bankInfo)?.accountHolder || '-'}</div>
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-3 text-[12px] text-amber-50">
                <div className="font-semibold">주의</div>
                <p className="mt-1 leading-relaxed">
                  실제 입금 내역을 확인했습니다. 결제 완료 처리 후에는 취소가 어렵습니다.
                </p>
              </div>
              {confirmTx && (
                <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-[12px] text-emerald-50">
                  <div className="font-semibold">트랜잭션 해시</div>
                  <div className="mt-1 break-all font-mono text-[11px] text-emerald-100">{confirmTx}</div>
                </div>
              )}
              {confirmDone && (
                <div className="rounded-xl border border-emerald-200/50 bg-emerald-400/10 p-3 text-[12px] text-emerald-50">
                  결제 완료 및 전송이 성공했습니다.
                </div>
              )}
              {confirmError && <p className="text-[12px] text-rose-300">{confirmError}</p>}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmingOrder(null)}
                disabled={confirming}
                className="w-full rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
              >
                닫기
              </button>
              <button
                type="button"
                disabled={confirming || confirmDone}
                onClick={async () => {
                  if (!confirmingOrder) return;
                  setConfirmError(null);
                  setConfirmTx(null);
                  setConfirmDone(false);
                  setConfirming(true);
                  try {
                    const orderId = normalizeId(confirmingOrder._id || confirmingOrder.tradeId);
                    if (!orderId) throw new Error('주문 ID를 찾을 수 없습니다.');
                    const res = await fetch('/api/order/buyOrderConfirmPaymentEngine', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        lang,
                        storecode: STORECODE,
                        orderId,
                        paymentAmount: confirmingOrder.usdtAmount || 0,
                        transactionHash: '',
                        isSmartAccount: false,
                      }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data?.result) {
                      throw new Error(data?.error || '결제 확인에 실패했습니다.');
                    }
                    setConfirmTx(data?.transactionHash || '');
                    setConfirmDone(true);
                    toast.success('결제 완료 처리 및 전송이 완료되었습니다.');
                    setOrders((prev) =>
                      prev.map((o) =>
                        normalizeId(o._id || o.tradeId) === orderId
                          ? { ...o, status: 'paymentConfirmed', paymentConfirmedAt: new Date().toISOString() }
                          : o,
                      ),
                    );
                    await loadOrders();
                  } catch (err) {
                    setConfirmError(err instanceof Error ? err.message : '결제 확인 중 오류가 발생했습니다.');
                  } finally {
                    setConfirming(false);
                  }
                }}
                className="w-full rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60 sm:w-auto"
              >
                {confirming ? '처리 중...' : confirmDone ? '완료됨' : '입금 확인 완료'}
              </button>
            </div>
            {confirming && (
              <p className="mt-3 text-center text-[12px] font-semibold text-amber-100">
                결제 진행 중입니다. 창을 닫거나 새로고침하지 마세요.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
