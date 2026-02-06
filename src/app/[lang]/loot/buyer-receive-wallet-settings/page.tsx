'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client } from '@/app/client';
import { useClientWallets } from '@/lib/useClientWallets';
import { chain as chainId } from '@/app/config/contractAddresses';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';

const STORECODE = 'admin';
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

export default function BuyerReceiveWalletSettingsPage() {
  const params = useParams<{ lang?: string }>();
  const lang = Array.isArray(params?.lang) ? params?.lang?.[0] : params?.lang || 'ko';
  const router = useRouter();
  const { wallets } = useClientWallets();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const [receiveWallet, setReceiveWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadData = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/getUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storecode: STORECODE, walletAddress: address }),
      });
      const data = await res.json().catch(() => ({}));
      setReceiveWallet(data?.result?.buyer?.receiveWalletAddress || '');

      const hRes = await fetch('/api/buyer/getReceiveWalletHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storecode: STORECODE, walletAddress: address }),
      });
      const hData = await hRes.json().catch(() => ({}));
      setHistory(hData?.result || []);
    } catch (e) {
      setError('불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleSave = async () => {
    if (!address) return;
    const trimmed = receiveWallet.trim();
    if (!trimmed) {
      setError('USDT 받을 지갑주소를 입력해주세요.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/buyer/updateReceiveWallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: STORECODE,
          walletAddress: address,
          receiveWalletAddress: trimmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        throw new Error(data?.error || '저장에 실패했습니다.');
      }
      setSuccess('USDT 받을 지갑주소가 저장되었습니다.');
      await loadData();
    } catch (e: any) {
      setError(e?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!address) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold text-white">USDT 받을 지갑주소</h1>
          <p className="mt-2 text-sm text-slate-300">지갑을 연결한 후 주소를 설정할 수 있습니다.</p>
          <div className="mt-4">
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={chainObj}
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
                  width: '100%',
                },
              }}
              locale={lang === 'ko' ? 'ko_KR' : 'en_US'}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-100/80">구매자 수취 지갑</p>
            <h1 className="text-2xl font-bold text-white">USDT 받을 지갑주소 설정</h1>
            <p className="text-sm text-slate-300">입금 확인 후 이 주소로 전송됩니다.</p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            ← 돌아가기
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div className="space-y-2">
            <label className="text-xs text-emerald-100/80">USDT 받을 지갑주소</label>
            <input
              value={receiveWallet}
              onChange={(e) => setReceiveWallet(e.target.value)}
              className="w-full rounded-xl border border-emerald-300/40 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-emerald-50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              placeholder="0x 로 시작하는 주소"
            />
          </div>
          {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
          {success && <p className="mt-3 text-sm text-emerald-200">{success}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-5 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-center text-sm font-bold text-emerald-950 shadow-lg hover:bg-emerald-300 disabled:opacity-60"
          >
            {saving ? '저장중...' : '지갑주소 저장'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg">
          <p className="text-xs text-slate-400">변경 이력</p>
          {loading ? (
            <p className="mt-3 text-sm text-slate-300">불러오는 중...</p>
          ) : history.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">변경 이력이 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {history.map((h) => (
                <div
                  key={h._id?.toString?.() || Math.random()}
                  className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-xs text-emerald-50"
                >
                  <div className="font-mono text-emerald-100">{h.receiveWalletAddress || '-'}</div>
                  <div className="mt-1 text-[11px] text-emerald-200/80">
                    {h.updatedAt ? new Date(h.updatedAt).toLocaleString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
