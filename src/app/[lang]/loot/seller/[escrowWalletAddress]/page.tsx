'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ConnectButton, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { balanceOf } from 'thirdweb/extensions/erc20';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';

import { client } from '@/app/client';
import { useClientWallets } from '@/lib/useClientWallets';
import {
  chain as chainId,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,
} from '@/app/config/contractAddresses';

const STORECODE = 'admin';
const activeChainId = chainId || 'bsc';

const getChainObject = () => {
  switch (activeChainId) {
    case 'ethereum':
      return ethereum;
    case 'polygon':
      return polygon;
    case 'arbitrum':
      return arbitrum;
    case 'bsc':
    default:
      return bsc;
  }
};

const getUsdtAddress = () => {
  switch (activeChainId) {
    case 'ethereum':
      return ethereumContractAddressUSDT;
    case 'polygon':
      return polygonContractAddressUSDT;
    case 'arbitrum':
      return arbitrumContractAddressUSDT;
    case 'bsc':
    default:
      return bscContractAddressUSDT;
  }
};

type SellerUser = {
  walletAddress?: string;
  nickname?: string;
  avatar?: string;
  seller?: {
    escrowWalletAddress?: string;
    usdtToKrwRate?: number;
    status?: string;
    promotionText?: string;
  };
  store?: {
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    };
  };
};

export default function SellerDashboardPage() {
  const params = useParams<{ lang?: string; escrowWalletAddress?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';
  const escrowParam = params?.escrowWalletAddress;
  const escrowWalletAddress = Array.isArray(escrowParam) ? escrowParam[0] : escrowParam || '';

  const { wallets } = useClientWallets();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const address = activeAccount?.address ?? activeWallet?.getAccount?.()?.address ?? '';
  const isLoggedIn = Boolean(address);

  const [sellerUser, setSellerUser] = useState<SellerUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [onchainBalance, setOnchainBalance] = useState<string>('-');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingRate, setUpdatingRate] = useState(false);
  const [rateInput, setRateInput] = useState('');

  const chainObj = useMemo(() => getChainObject(), []);
  const usdtAddress = useMemo(() => getUsdtAddress(), []);

  const fetchUser = async () => {
    if (!address) return;
    setLoading(true);
    setUnauthorized(false);
    try {
      const res = await fetch('/api/user/getUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storecode: STORECODE, walletAddress: address }),
      });
      const data = await res.json().catch(() => ({}));
      const user: SellerUser | null = data?.result || null;
      setSellerUser(user);
      const userEscrow = user?.seller?.escrowWalletAddress || '';
      if (!userEscrow || userEscrow.toLowerCase() !== escrowWalletAddress.toLowerCase()) {
        setUnauthorized(true);
      }
      if (user?.seller?.usdtToKrwRate) {
        setRateInput(String(user.seller.usdtToKrwRate));
      }
    } catch (error) {
      setSellerUser(null);
      setUnauthorized(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnchainBalance = async () => {
    if (!escrowWalletAddress) return;
    const usdtDecimalsMap: Record<string, number> = {
      ethereum: 6,
      polygon: 6,
      arbitrum: 6,
      bsc: 18,
    };
    const dec = usdtDecimalsMap[activeChainId] ?? 6;
    try {
      const contract = getContract({ client, chain: chainObj, address: usdtAddress });
      const bal = await balanceOf({
        contract,
        address: escrowWalletAddress as `0x${string}`,
      });
      const raw = (bal as any)?.value ?? bal;
      const formatted =
        typeof raw === 'bigint'
          ? (Number(raw) / 10 ** dec).toFixed(6)
          : Number(raw || 0).toFixed(6);
      setOnchainBalance(formatted);
    } catch (error) {
      console.error('fetchOnchainBalance error (thirdweb)', error);
      // Fallback: direct RPC eth_call to balanceOf
      try {
        const rpcByChain: Record<string, string> = {
          bsc: 'https://bsc.blockpi.network/v1/rpc/public',
          polygon: 'https://polygon-rpc.com',
          ethereum: 'https://ethereum.publicnode.com',
          arbitrum: 'https://arb1.arbitrum.io/rpc',
        };
        const rpc = rpcByChain[activeChainId] || rpcByChain.bsc;
        const data =
          '0x70a08231' +
          escrowWalletAddress.replace(/^0x/, '').padStart(64, '0');
        const res = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: usdtAddress, data }, 'latest'],
          }),
        });
        const json = await res.json();
        const hex = json?.result || '0x0';
        const raw = BigInt(hex);
        const formatted = (Number(raw) / 10 ** dec).toFixed(6);
        setOnchainBalance(formatted);
      } catch (fallbackError) {
        console.error('fetchOnchainBalance fallback error', fallbackError);
        setOnchainBalance('-');
      }
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, escrowWalletAddress]);

  useEffect(() => {
    fetchOnchainBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escrowWalletAddress]);

  const handleStatusToggle = async () => {
    if (!sellerUser || !sellerUser.seller) return;
    const nextStatus =
      sellerUser.seller.status === 'confirmed' || sellerUser.seller.status === 'enabled'
        ? 'pending'
        : 'confirmed';
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/user/updateSeller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: STORECODE,
          walletAddress: address,
          sellerStatus: nextStatus,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.result) throw new Error('상태 변경에 실패했습니다.');
      setSellerUser((prev) =>
        prev
          ? { ...prev, seller: { ...prev.seller, status: nextStatus } }
          : prev,
      );
      toast.success(`판매 상태가 ${nextStatus === 'confirmed' ? '활성' : '대기'}로 변경되었습니다.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRateUpdate = async () => {
    if (!rateInput || Number(rateInput) <= 0) {
      toast.error('유효한 환율을 입력하세요.');
      return;
    }
    setUpdatingRate(true);
    try {
      const res = await fetch('/api/user/updateSellerUsdtToKrwRate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: STORECODE,
          walletAddress: address,
          usdtToKrwRate: Number(rateInput),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.result) throw new Error('환율 업데이트에 실패했습니다.');
      toast.success('환율이 업데이트되었습니다.');
      setSellerUser((prev) =>
        prev ? { ...prev, seller: { ...prev.seller, usdtToKrwRate: Number(rateInput) } } : prev,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '환율 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdatingRate(false);
    }
  };

  const statusBadge = (status?: string) => {
    const isOn = status === 'confirmed' || status === 'enabled';
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
          isOn
            ? 'bg-emerald-500/15 text-emerald-100 border border-emerald-300/60'
            : 'bg-amber-500/15 text-amber-100 border border-amber-300/60'
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {isOn ? '판매 가능' : '대기/중지'}
      </span>
    );
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">판매자 대시보드</p>
              <h1 className="text-2xl font-bold text-white">지갑을 연결해주세요</h1>
              <p className="mt-2 text-sm text-slate-400">
                판매자 지갑을 연결하면 에스크로 관리 및 판매 정보를 볼 수 있습니다.
              </p>
              <button
                type="button"
                onClick={() => history.back()}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                ← 돌아가기
              </button>
            </div>
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

  if (unauthorized) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-300/40 bg-rose-900/20 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold text-white">이 페이지에 접근할 수 없습니다.</h1>
          <p className="mt-2 text-sm text-rose-100/80">
            연결된 지갑의 에스크로 주소가 경로의 주소와 일치하지 않습니다.
          </p>
          <p className="mt-4 text-sm text-slate-200">
            경로 주소: <span className="font-mono text-emerald-200">{escrowWalletAddress}</span>
          </p>
          <p className="text-sm text-slate-200">
            내 에스크로: <span className="font-mono text-emerald-200">{sellerUser?.seller?.escrowWalletAddress || '없음'}</span>
          </p>
          <button
            type="button"
            onClick={() => history.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            ← 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-slate-900/70 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-emerald-100/80">판매자 대시보드</p>
            <h1 className="text-2xl font-bold text-white">나의 에스크로 관리</h1>
            <p className="mt-2 text-sm text-slate-200">
              에스크로 잔액, 판매 상태, 환율을 한 눈에 확인하고 변경할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {statusBadge(sellerUser?.seller?.status)}
            <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-emerald-100">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <button
              type="button"
              onClick={() => history.back()}
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              ← 돌아가기
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <p className="text-xs text-slate-400">에스크로 지갑</p>
            <p className="mt-1 font-mono text-sm text-emerald-100 break-all">{escrowWalletAddress}</p>
            <p className="mt-3 text-xs text-slate-400">체인</p>
            <p className="text-lg font-semibold text-white uppercase">{activeChainId}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <p className="text-xs text-slate-400">USDT 잔액 (온체인)</p>
            <p className="mt-2 text-2xl font-bold text-emerald-200">{onchainBalance} USDT</p>
            <p className="mt-1 text-[11px] text-slate-500">계좌에 입금된 에스크로 토큰 잔액</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <p className="text-xs text-slate-400">판매 환율 (원/USDT)</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value.replace(/[^0-9.]/g, ''))}
                className="flex-1 rounded-xl border border-emerald-300/40 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                inputMode="decimal"
                placeholder="예: 1450"
              />
              <button
                type="button"
                onClick={handleRateUpdate}
                disabled={updatingRate}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60"
              >
                {updatingRate ? '저장중...' : '저장'}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              환율을 조정하면 새로운 구매 요청에 즉시 반영됩니다.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">판매 상태</p>
                <h3 className="text-lg font-bold text-white">판매 활성화/중지</h3>
              </div>
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={updatingStatus}
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow ${
                  sellerUser?.seller?.status === 'confirmed'
                    ? 'bg-rose-500 text-white hover:bg-rose-400'
                    : 'bg-emerald-400 text-slate-900 hover:bg-emerald-300'
                } disabled:opacity-60`}
              >
                {updatingStatus
                  ? '변경중...'
                  : sellerUser?.seller?.status === 'confirmed'
                  ? '판매 중지'
                  : '판매 시작'}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              판매 중지 시 신규 구매 요청이 접수되지 않습니다. 기존 요청은 정상적으로 처리됩니다.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <p className="text-xs text-slate-400">정산 계좌</p>
            <p className="mt-2 text-sm text-white">
              {sellerUser?.store?.bankInfo?.bankName || '-'} /{' '}
              {sellerUser?.store?.bankInfo?.accountHolder || '-'}
            </p>
            <p className="font-mono text-sm text-emerald-200">
              {sellerUser?.store?.bankInfo?.accountNumber || '-'}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              입금 정보는 고객 화면의 “판매자 입금 계좌”에 표시됩니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
