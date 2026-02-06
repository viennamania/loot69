'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type BuyOrder = {
  _id?: string;
  tradeId?: string;
  status?: string;
  walletAddress?: string;
  nickname?: string;
  buyer?: { walletAddress?: string; nickname?: string; bankInfo?: { bankName?: string; accountNumber?: string; accountHolder?: string } };
  seller?: { walletAddress?: string; nickname?: string };
  usdtAmount?: number;
  krwAmount?: number;
  rate?: number;
  createdAt?: string;
  paymentConfirmedAt?: string;
};

const STORECODE = 'admin';

function shortAddr(addr?: string) {
  if (!addr) return '-';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function BuyOrderManagementPage() {
  const params = useParams<{ lang?: string }>();
  const lang = Array.isArray(params?.lang) ? params?.lang[0] : params?.lang || 'ko';
  const router = useRouter();

  const [orders, setOrders] = useState<BuyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'all' | 'paymentRequested' | 'paymentConfirmed' | 'cancelled' | 'accepted'>('all');
  const [pageSize] = useState(20);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false;
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const bag = [
          o.tradeId,
          o.walletAddress,
          o.nickname,
          o.buyer?.walletAddress,
          o.buyer?.nickname,
          o.seller?.walletAddress,
          o.seller?.nickname,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!bag.includes(kw)) return false;
      }
      return true;
    });
  }, [orders, keyword, status]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/order/getAllBuyOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storecode: STORECODE, limit: pageSize, page }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '구매 주문을 불러오지 못했습니다.');
      setOrders(data?.result?.orders || []);
      setTotal(data?.result?.totalCount || 0);
    } catch (e: any) {
      setError(e?.message || '구매 주문을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/70">Administration</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">구매 주문 관리</h1>
            <p className="text-sm text-slate-400">최신순 목록, 상태/키워드 검색, 페이징</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/${lang}/administration`)}
            className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            ← 관리자 홈
          </button>
        </header>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px_140px_auto]">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="주문번호/지갑/닉네임 검색"
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="all">전체 상태</option>
              <option value="paymentRequested">결제요청</option>
              <option value="paymentConfirmed">결제완료</option>
              <option value="accepted">판매자 승인</option>
              <option value="cancelled">취소됨</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>페이지</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => setPage(Math.max(1, Math.min(totalPages, Number(e.target.value) || 1)))}
                className="w-16 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 py-1 text-center text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <span className="text-xs text-slate-500">/ {totalPages}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  setStatus('all');
                }}
                className="rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={load}
                className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-900 shadow hover:bg-emerald-300"
              >
                새로고침
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/40">
            <div className="grid grid-cols-12 gap-2 border-b border-white/5 px-3 py-2 text-[11px] font-semibold text-slate-300">
              <span className="col-span-3">주문/구매자</span>
              <span className="col-span-2 text-right">금액</span>
              <span className="col-span-2 text-right">환율</span>
              <span className="col-span-2">상태</span>
              <span className="col-span-3 text-right">시간</span>
            </div>
            {loading ? (
              <div className="px-4 py-3 text-sm text-slate-300">불러오는 중...</div>
            ) : error ? (
              <div className="px-4 py-3 text-sm text-rose-300">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">표시할 주문이 없습니다.</div>
            ) : (
              filtered.map((o) => (
                <div
                  key={o._id || o.tradeId}
                  className="grid grid-cols-12 gap-2 border-b border-white/5 px-3 py-2 text-[12px] text-slate-100 last:border-b-0"
                >
                  <div className="col-span-3 space-y-0.5">
                    <div className="font-semibold text-white">
                      #{o.tradeId || '-'} <span className="text-[11px] text-slate-400">{shortAddr(o.walletAddress)}</span>
                    </div>
                    <div className="text-slate-300">
                      구매자: {o.buyer?.nickname || shortAddr(o.buyer?.walletAddress) || '익명'}
                    </div>
                    <div className="text-slate-400">
                      판매자: {o.seller?.nickname || shortAddr(o.seller?.walletAddress) || '-'}
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-semibold text-emerald-200">
                    {Number(o.usdtAmount || 0).toLocaleString('ko-KR')} USDT
                    <div className="text-[11px] text-slate-400">
                      {Number(o.krwAmount || 0).toLocaleString('ko-KR')} 원
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-slate-200">
                    {Number(o.rate || 0).toLocaleString('ko-KR')} 원/USDT
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                        o.status === 'paymentConfirmed'
                          ? 'bg-emerald-500/15 text-emerald-100 border border-emerald-300/60'
                          : o.status === 'paymentRequested'
                          ? 'bg-amber-500/15 text-amber-100 border border-amber-300/60'
                          : o.status === 'cancelled'
                          ? 'bg-rose-500/15 text-rose-100 border border-rose-300/60'
                          : 'bg-sky-500/15 text-sky-100 border border-sky-300/60'
                      }`}
                    >
                      {o.status || '-'}
                    </span>
                  </div>
                  <div className="col-span-3 text-right text-slate-300">
                    <div>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</div>
                    {o.paymentConfirmedAt && (
                      <div className="text-[11px] text-emerald-200">
                        완료: {new Date(o.paymentConfirmedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              총 {total.toLocaleString('ko-KR')}건 · 페이지 {page}/{totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 font-semibold text-slate-200 disabled:opacity-50"
              >
                이전
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 font-semibold text-slate-200 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
