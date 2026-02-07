'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ConnectButton, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { getContract, sendTransaction } from 'thirdweb';
import { balanceOf, transfer } from 'thirdweb/extensions/erc20';
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
    kyc?: {
      status?: string;
    };
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
};

export default function SellerDashboardPage() {
  const params = useParams<{ lang?: string; escrowWalletAddress?: string }>();
  const router = useRouter();
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
  const [txPanelOpen, setTxPanelOpen] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txList, setTxList] = useState<any[]>([]);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTab, setTransferTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [walletUsdtBalance, setWalletUsdtBalance] = useState<number | null>(null);
  const [escrowUsdtBalance, setEscrowUsdtBalance] = useState<number | null>(null);
  const [recentDone, setRecentDone] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [totalSummary, setTotalSummary] = useState({ count: 0, usdt: 0, krw: 0 });
  const [forceProfileSetup, setForceProfileSetup] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileNickname, setProfileNickname] = useState('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState('/profile-default.png');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [rateHistory, setRateHistory] = useState<any[]>([]);

  const chainObj = useMemo(() => getChainObject(), []);
  const usdtAddress = useMemo(() => getUsdtAddress(), []);
  const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition whitespace-nowrap';
  const btnSecondary =
    'inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-50 hover:bg-emerald-400/20 disabled:opacity-50 transition whitespace-nowrap';
  const btnGhost =
    'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition';

  const statusLabelKr = (v?: string) => {
    switch ((v || '').toLowerCase()) {
      case 'confirmed':
      case 'enabled':
        return '활성';
      case 'pending':
      case 'disabled':
        return '대기';
      default:
        return v || '-';
    }
  };

  const statusColorClass = (v?: string) => {
    switch ((v || '').toLowerCase()) {
      case 'confirmed':
      case 'enabled':
        return 'text-emerald-200';
      case 'pending':
      case 'disabled':
        return 'text-amber-200';
      default:
        return 'text-slate-300';
    }
  };

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
      if (user?.nickname) {
        setProfileNickname(user.nickname);
      }
      if (user?.avatar) {
        setProfilePreview(user.avatar);
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
      setEscrowUsdtBalance(Number(formatted));
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
    loadRecentCompleted();
    fetchStatusHistory();
    fetchRateHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escrowWalletAddress]);

  useEffect(() => {
    if (address) {
      fetchStatusHistory();
      fetchRateHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    if (sellerUser) {
      setProfileNickname(sellerUser.nickname || '');
      setProfilePreview(sellerUser.avatar || '/profile-default.png');
    }
  }, [sellerUser]);

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
      fetchStatusHistory();
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
      fetchRateHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '환율 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdatingRate(false);
    }
  };

  const loadEscrowTx = async () => {
    if (!escrowWalletAddress) return;
    setTxLoading(true);
    setTxError(null);
    try {
      const res = await fetch('/api/escrow/listTransactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: escrowWalletAddress, limit: 25 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '거래 내역을 불러오지 못했습니다.');
      setTxList(data?.result || []);
    } catch (error) {
      setTxError(error instanceof Error ? error.message : '거래 내역을 불러오지 못했습니다.');
    } finally {
      setTxLoading(false);
    }
  };

  const fetchWalletUsdtBalance = async () => {
    if (!address) {
      setWalletUsdtBalance(null);
      return;
    }
    try {
      const contract = getContract({ client, chain: chainObj, address: usdtAddress });
      const bal = await balanceOf({ contract, address: address as `0x${string}` });
      const dec = activeChainId === 'bsc' ? 18 : 6;
      const val =
        typeof bal === 'bigint'
          ? Number(bal) / 10 ** dec
          : Number(bal || 0);
      setWalletUsdtBalance(val);
    } catch {
      setWalletUsdtBalance(null);
    }
  };

  const submitTransfer = async () => {
    if (!transferAmount || Number(transferAmount) <= 0) {
      setTransferError('올바른 수량을 입력하세요.');
      return;
    }
    setTransferLoading(true);
    setTransferError(null);
    try {
      const amount = Number(transferAmount);

      if (transferTab === 'deposit') {
        if (!activeAccount) {
          throw new Error('지갑을 연결해주세요.');
        }
        if (walletUsdtBalance !== null && amount > walletUsdtBalance) {
          throw new Error('지갑 잔액을 초과할 수 없습니다.');
        }
        const contract = getContract({ client, chain: chainObj, address: usdtAddress });
        const tx = transfer({
          contract,
          to: sellerUser?.seller?.escrowWalletAddress || escrowWalletAddress,
          amount,
        });
        await sendTransaction({
          account: activeAccount as any,
          transaction: tx,
          // 스마트어카운트의 프리펀드 부족 오류(AA21)를 막기 위해 가스 스폰서 요청
          sponsorGas: true,
        } as any);
        toast.success('충전이 완료되었습니다.');
      } else {
        const from = sellerUser?.seller?.escrowWalletAddress || escrowWalletAddress;
        const to = sellerUser?.walletAddress || address;

        const res = await fetch('/api/escrow/selfTransfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, amount }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.result) {
          throw new Error(data?.error || '전송에 실패했습니다.');
        }
        toast.success('환전(출금)이 완료되었습니다.');
      }
      setTransferModalOpen(false);
      setTransferAmount('');
      loadEscrowTx();
      fetchOnchainBalance();
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : '전송 중 오류가 발생했습니다.');
    } finally {
      setTransferLoading(false);
    }
  };

  const loadRecentCompleted = async () => {
    if (!escrowWalletAddress) return;
    setRecentLoading(true);
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/order/getBuyOrdersByEscrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 1000,
          page: 1,
          escrowWalletAddress,
          includeCancelled: false,
          includeCompleted: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const orders: any[] = data?.result?.orders || [];
        const confirmed = orders.filter((o) => o?.status === 'paymentConfirmed');
        setRecentDone(confirmed.slice(0, 5));
        const totals = confirmed.reduce(
          (acc, o) => {
            const u = Number(o?.usdtAmount || 0);
            const k = Number(o?.krwAmount || 0);
            acc.count += 1;
            acc.usdt += Number.isFinite(u) ? u : 0;
            acc.krw += Number.isFinite(k) ? k : 0;
            return acc;
          },
          { count: 0, usdt: 0, krw: 0 },
        );
        setTotalSummary(totals);
      } else {
        setRecentDone([]);
        setTotalSummary({ count: 0, usdt: 0, krw: 0 });
      }
    } catch {
      setRecentDone([]);
      setTotalSummary({ count: 0, usdt: 0, krw: 0 });
    } finally {
      setRecentLoading(false);
      setSummaryLoading(false);
    }
  };

  const fetchStatusHistory = async () => {
    if (!address) return;
    try {
      const res = await fetch('/api/user/getSellerStatusHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: STORECODE,
          walletAddress: address,
          limit: 3,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatusHistory(data?.result || []);
      }
    } catch {
      // silently ignore
    }
  };

  const fetchRateHistory = async () => {
    if (!address) return;
    try {
      const res = await fetch('/api/user/getSellerRateHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: STORECODE,
          walletAddress: address,
          limit: 3,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setRateHistory(data?.result || []);
      }
    } catch {
      // ignore
    }
  };

  const openProfileModal = () => {
    // 입력창은 비워두고 현재값은 별도 표기
    setProfileNickname('');
    setProfilePreview(sellerUser?.avatar || '/profile-default.png');
    setProfileFile(null);
    setProfileError(null);
    setProfileModalOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    if (!address) {
      setProfileError('지갑을 연결해주세요.');
      return;
    }
    const nicknameValue = profileNickname.trim();
    const currentNickname = sellerUser?.nickname?.trim() || '';
    if (!nicknameValue && !profileFile) {
      setProfileError('변경할 내용을 입력하거나 이미지를 선택하세요.');
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    try {
      let avatarUrl = sellerUser?.avatar || '';
      if (profileFile) {
        const formData = new FormData();
        formData.append('file', profileFile);
        const uploadRes = await fetch('/api/blob/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok || !uploadData?.url) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
        avatarUrl = uploadData.url;
      }

      if (nicknameValue && nicknameValue !== currentNickname) {
        const nickRes = await fetch('/api/user/updateUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storecode: STORECODE, walletAddress: address, nickname: nicknameValue }),
        });
        const nickData = await nickRes.json().catch(() => ({}));
        if (!nickRes.ok || !nickData?.result) {
          throw new Error('이미 사용 중인 닉네임이거나 저장에 실패했습니다.');
        }
      }

      if (avatarUrl && avatarUrl !== sellerUser?.avatar) {
        const avatarRes = await fetch('/api/user/updateAvatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storecode: STORECODE, walletAddress: address, avatar: avatarUrl }),
        });
        const avatarData = await avatarRes.json().catch(() => ({}));
        if (!avatarRes.ok || avatarData?.error) {
          throw new Error('프로필 이미지 저장에 실패했습니다.');
        }
      }

      await fetchUser();
      toast.success('프로필이 업데이트되었습니다.');
      setProfileModalOpen(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setProfileSaving(false);
    }
  };

  const statusBadge = (status?: string) => {
    const isOn = status === 'confirmed' || status === 'enabled';
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
          isOn
            ? 'border border-emerald-300/60 bg-slate-900/60 text-emerald-200'
            : 'border border-amber-300/60 bg-slate-900/60 text-amber-200'
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

  if (unauthorized && !forceProfileSetup) {
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
          <button
            type="button"
            onClick={() => {
              setForceProfileSetup(true);
              setUnauthorized(false);
              setProfileNickname('');
              setProfilePreview(sellerUser?.avatar || '/profile-default.png');
            }}
            className="ml-3 mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/30"
          >
            판매자 등록하기
          </button>
        </div>
      </main>
    );
  }

  if (!loading && (forceProfileSetup || (sellerUser && !sellerUser.nickname))) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-300/30 bg-slate-950/80 p-6 shadow-2xl">
          <h1 className="text-2xl font-bold text-white">판매자 닉네임 설정</h1>
          <p className="mt-2 text-sm text-slate-300">
            에스크로 관리를 시작하려면 닉네임을 먼저 등록하세요. 영문 소문자와 숫자만 사용할 수 있습니다.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-emerald-300/50 bg-slate-900/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profilePreview} alt="preview" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">프로필 이미지</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-50 hover:bg-emerald-400/30">
                파일 선택
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <p className="text-[11px] text-slate-400">Vercel Blob에 업로드됩니다. 10MB 이하 권장.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-xs text-slate-400">닉네임 (영문 소문자/숫자만)</label>
            <input
              value={profileNickname}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-z0-9]/g, '');
                setProfileNickname(val);
              }}
              maxLength={20}
              className="w-full rounded-xl border-2 border-emerald-300/60 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
              placeholder="예: seller123"
            />
            <p className="text-[11px] text-slate-400">닉네임은 영문 소문자와 숫자만 사용할 수 있습니다.</p>
          </div>

          {profileError && <p className="mt-2 text-xs text-rose-300">{profileError}</p>}

          <button
            type="button"
            onClick={handleProfileSave}
            disabled={profileSaving || !profileNickname.trim()}
            className="mt-6 w-full rounded-xl bg-emerald-400 px-4 py-3 text-base font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60"
          >
            {profileSaving ? '저장 중...' : '닉네임 등록하기'}
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
          <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-emerald-300/40 bg-slate-900/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sellerUser?.avatar || '/profile-default.png'}
                alt="seller avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{sellerUser?.nickname || '판매자'}</p>
            </div>
            {!sellerUser?.nickname && (
              <button
                type="button"
                onClick={openProfileModal}
                className="ml-2 rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-50 hover:bg-emerald-400/30"
              >
                설정하기
              </button>
            )}
            {sellerUser?.nickname && (
              <button
                type="button"
                onClick={openProfileModal}
                className="ml-2 rounded-full border border-slate-600/60 bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-slate-100 hover:bg-slate-700"
              >
                프로필 수정
              </button>
            )}
          </div>
        </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
              KYC: {sellerUser?.seller?.kyc?.status === 'approved'
                ? '승인'
                : sellerUser?.seller?.kyc?.status === 'pending'
                ? '검토 중'
                : sellerUser?.seller?.kyc?.status === 'rejected'
                ? '반려'
                : '미제출'}
            </div>
            <button
              type="button"
              onClick={() => history.back()}
            className={btnGhost}
          >
            ← 돌아가기
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${lang}/loot/seller/${sellerUser?.seller?.escrowWalletAddress || escrowWalletAddress}/buyorder`)}
            className={btnSecondary}
          >
            구매 신청 내역 보러가기
          </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <p className="text-xs text-slate-300">에스크로 지갑</p>
            <p className="mt-1 font-mono text-sm text-emerald-100 break-all">{escrowWalletAddress}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-50 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                스마트 어카운트
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MPC
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-300">USDT 잔액 (온체인)</p>
                <p className="mt-2 text-4xl font-extrabold text-emerald-100">{onchainBalance}</p>
                <p className="mt-1 text-[11px] text-slate-400">에스크로 지갑에 예치된 온체인 USDT</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferTab('deposit');
                    fetchWalletUsdtBalance();
                    setTransferModalOpen(true);
                  }}
                  className={btnPrimary}
                >
                  충/환전하기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxPanelOpen(true);
                    loadEscrowTx();
                  }}
                  className={btnSecondary}
                >
                  내역보기
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <p className="text-xs text-slate-300">판매 환율 (원/USDT)</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <p className="text-4xl font-extrabold text-emerald-100 tracking-tight">
                {sellerUser?.seller?.usdtToKrwRate
                  ? sellerUser.seller.usdtToKrwRate.toLocaleString('ko-KR')
                  : '-'}
              </p>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRateInput(
                      sellerUser?.seller?.usdtToKrwRate
                        ? String(sellerUser.seller.usdtToKrwRate)
                        : '',
                    );
                    setRateModalOpen(true);
                  }}
                  className={btnPrimary}
                >
                  환율 수정하기
                </button>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              환율을 조정하면 새로운 구매 요청에 즉시 반영됩니다.
            </p>
            {rateHistory.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-semibold text-slate-200">환율 변경 이력</p>
                <div className="mt-2 space-y-2 text-[11px] text-slate-300">
                  {rateHistory.map((h) => (
                    <div key={h._id || h.changedAt} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-200">{h.prevRate ?? '-'}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-emerald-100">{h.nextRate}</span>
                        {typeof h.nextRate === 'number' && (h.prevRate || h.prevRate === 0) ? (
                          (() => {
                            const diff = Number(h.nextRate) - Number(h.prevRate || 0);
                            const sign = diff > 0 ? '+' : diff < 0 ? '−' : '';
                            const color =
                              diff > 0 ? 'text-emerald-200' : diff < 0 ? 'text-rose-200' : 'text-slate-200';
                            return (
                              <span className={`ml-1 font-semibold ${color}`}>
                                {sign}
                                {Math.abs(diff)}
                              </span>
                            );
                          })()
                        ) : null}
                      </div>
                      <span className="text-slate-400">
                        {h.changedAt ? new Date(h.changedAt).toLocaleString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {statusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => (!updatingStatus ? setStatusModalOpen(false) : null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-200/40 bg-slate-950/90 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">판매 상태 변경</h3>
              <p className="mt-2 text-sm text-emerald-100/90">
                {sellerUser?.seller?.status === 'confirmed'
                  ? '판매를 중지하면 신규 구매 요청이 더 이상 접수되지 않습니다.'
                  : '판매를 시작하면 신규 구매 요청을 받을 수 있습니다.'}
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => (!updatingStatus ? setStatusModalOpen(false) : null)}
                  className="w-full rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 sm:w-auto"
                  disabled={updatingStatus}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!updatingStatus) handleStatusToggle().finally(() => setStatusModalOpen(false));
                  }}
                  className="w-full rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60 sm:w-auto"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? '변경중...' : '확인'}
                </button>
              </div>
            </div>
          </div>
        )}

        {rateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => (!updatingRate ? setRateModalOpen(false) : null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-200/40 bg-slate-950/90 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">판매 환율 수정</h3>
              <p className="mt-1 text-xs text-emerald-100/80">
                현재 환율: {sellerUser?.seller?.usdtToKrwRate?.toLocaleString('ko-KR') || '-'} 원/USDT
              </p>
              <div className="mt-4 space-y-2">
                <label className="text-sm font-semibold text-emerald-50" htmlFor="rate-input-modal">
                  새 환율 입력
                </label>
                <input
                  id="rate-input-modal"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full rounded-xl border border-emerald-300/40 bg-slate-950/70 px-4 py-4 text-3xl font-extrabold text-emerald-50 text-right tracking-tight focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  inputMode="decimal"
                  placeholder="예: 1450"
                />
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => (!updatingRate ? setRateModalOpen(false) : null)}
                  className="w-full rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 sm:w-auto"
                  disabled={updatingRate}
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleRateUpdate}
                  disabled={
                    updatingRate ||
                    !rateInput ||
                    Number(rateInput) === Number(sellerUser?.seller?.usdtToKrwRate || 0)
                  }
                  className="w-full rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60 sm:w-auto"
                >
                  {updatingRate ? '저장중...' : '저장하기'}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300">판매 상태</p>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  판매 활성화/중지
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      sellerUser?.seller?.status === 'confirmed'
                        ? 'border border-emerald-300/60 bg-slate-900/60 text-emerald-200'
                        : 'border border-amber-300/60 bg-slate-900/60 text-amber-200'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {sellerUser?.seller?.status === 'confirmed' ? '활성' : '대기/중지'}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalOpen(true)}
                disabled={updatingStatus}
                className={`rounded-full px-4 py-2.5 text-sm font-bold shadow-lg whitespace-nowrap ${
                  sellerUser?.seller?.status === 'confirmed'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-900'
                } disabled:opacity-60 disabled:cursor-not-allowed transition`}
              >
                {updatingStatus
                  ? '변경중...'
                  : sellerUser?.seller?.status === 'confirmed'
                  ? '판매 중지하기'
                  : '판매 시작하기'}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              판매 중지 시 신규 구매 요청이 접수되지 않습니다. 기존 요청은 정상적으로 처리됩니다.
            </p>
            {statusHistory.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-semibold text-slate-200">상태 변경 이력</p>
                <div className="mt-2 space-y-2 text-[11px] text-slate-300">
                  {statusHistory.map((h) => (
                    <div key={h._id || h.changedAt} className="flex items-center justify-between gap-2">
                      <span>
                        <span className={statusColorClass(h.prevStatus)}>
                          {statusLabelKr(h.prevStatus) || '없음'}
                        </span>{' '}
                        →{' '}
                        <span className={`font-semibold ${statusColorClass(h.nextStatus)}`}>
                          {statusLabelKr(h.nextStatus)}
                        </span>
                      </span>
                      <span className="text-slate-400">
                        {h.changedAt ? new Date(h.changedAt).toLocaleString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
            <p className="text-xs text-slate-300">정산 계좌</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-white">
                  {sellerUser?.seller?.bankInfo?.bankName || '-'} /{' '}
                  {sellerUser?.seller?.bankInfo?.accountHolder || '-'}
                </p>
                <p className="font-mono text-xl font-semibold text-emerald-200">
                  {sellerUser?.seller?.bankInfo?.accountNumber || '-'}
                </p>
            <p className="mt-2 text-[11px] text-slate-400">
              입금 정보는 고객 화면의 “판매자 입금 계좌”에 표시됩니다.
            </p>
                {!sellerUser?.seller?.bankInfo && (
                  <p className="mt-1 text-[11px] text-amber-200">
                    정산 계좌가 없습니다. 설정 후 거래 정산이 가능합니다.
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/${lang}/loot/bankinfo-settings`)}
                  className={btnPrimary}
                >
                  계좌 설정하기
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-300/30 bg-emerald-900/30 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-200/80">누적 통계</p>
              <h3 className="text-lg font-bold text-white">결제 완료 주문 합계</h3>
            </div>
            <span className="text-xs text-emerald-200/80">
              {summaryLoading ? '집계 중...' : '실시간'}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
              <p className="text-[11px] text-emerald-100/80">총 거래수</p>
              <p className="mt-1 text-xl font-bold text-white">
                {summaryLoading ? '-' : totalSummary.count.toLocaleString('ko-KR')} 건
              </p>
            </div>
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
              <p className="text-[11px] text-emerald-100/80">총 거래량</p>
              <p className="mt-1 text-xl font-bold text-white">
                {summaryLoading ? '-' : totalSummary.usdt.toFixed(6)} USDT
              </p>
            </div>
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
              <p className="text-[11px] text-emerald-100/80">총 거래금액</p>
              <p className="mt-1 text-xl font-bold text-white">
                {summaryLoading ? '-' : totalSummary.krw.toLocaleString('ko-KR')} 원
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-emerald-100/80">
            이 통계는 현재 에스크로 지갑({escrowWalletAddress.slice(0, 6)}...{escrowWalletAddress.slice(-4)})의
            결제 완료된 주문을 기준으로 산출됩니다.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
            <p className="text-xs text-slate-300">최근 거래 완료</p>
              <h3 className="text-lg font-bold text-white">결제 완료된 주문 (최신 5건)</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                router.push(`/${lang}/loot/seller/${sellerUser?.seller?.escrowWalletAddress || escrowWalletAddress}/buyorder`)
              }
              className={btnSecondary}
            >
              더보기
            </button>
          </div>
          {recentLoading ? (
            <p className="mt-3 text-sm text-slate-300">불러오는 중...</p>
          ) : recentDone.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">완료된 거래가 없습니다.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentDone.map((o) => (
                <div key={o._id || o.tradeId} className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">
                      {o.usdtAmount} USDT / {Number(o.krwAmount || 0).toLocaleString('ko-KR')}원
                    </div>
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-50">
                      완료
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300 space-y-1">
                    <div>주문번호: {o.tradeId || '-'}</div>
                    <div>신청시각: {o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</div>
                    <div>
                      결제완료 시각:{' '}
                      {o.paymentConfirmedAt ? new Date(o.paymentConfirmedAt).toLocaleString() : '-'}
                    </div>
                    {(o.buyer?.bankInfo?.accountHolder || o.buyer?.depositName) && (
                      <div>
                        입금자명:{' '}
                        <span className="font-semibold text-white">
                          {o.buyer?.bankInfo?.accountHolder || o.buyer?.depositName}
                        </span>
                      </div>
                    )}
                    {(o.buyer?.bankInfo?.bankName || o.buyer?.bankInfo?.accountNumber) && (
                      <div>
                        입금계좌: {o.buyer?.bankInfo?.bankName || '-'} /{' '}
                        {o.buyer?.bankInfo?.accountNumber || '-'}
                      </div>
                    )}
                    {(o.buyer?.receiveWalletAddress || o.buyer?.walletAddress || o.walletAddress) && (
                      <div className="font-mono text-[11px] text-emerald-50 break-all">
                        USDT 수령 지갑:{' '}
                        {o.buyer?.receiveWalletAddress || o.buyer?.walletAddress || o.walletAddress}
                      </div>
                    )}
                    {o.escrowTransactionHash && (
                      <div className="font-mono text-[11px] text-emerald-50 break-all">
                        에스크로 Tx: {o.escrowTransactionHash}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {txPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div className="relative w-full max-w-lg bg-slate-950/95 border-r border-emerald-300/30 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between bg-slate-900/80 px-4 py-3 border-b border-emerald-300/20 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Escrow</p>
                <h3 className="text-lg font-bold text-white">충환전 내역</h3>
                <p className="text-[11px] text-slate-400 break-all">{escrowWalletAddress}</p>
              </div>
              <button
                type="button"
                onClick={() => setTxPanelOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                닫기
              </button>
            </div>
            <div className="p-4 space-y-3">
              {txLoading && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  충환전 내역을 불러오는 중입니다...
                </div>
              )}
              {txError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
                  {txError}
                </div>
              )}
              {!txLoading && !txError && txList.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  거래 내역이 없습니다.
                </div>
              )}
              {txList.map((tx, idx) => (
                <div
                  key={`${tx?.hash || idx}`}
                  className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[11px] break-all text-emerald-100">
                      {tx?.hash || '-'}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        tx?.value && Number(tx.value) > 0
                          ? 'bg-emerald-400/20 border border-emerald-300/60 text-emerald-50'
                          : 'bg-sky-400/20 border border-sky-300/60 text-sky-50'
                      }`}
                    >
                      {tx?.value && Number(tx.value) > 0 ? '출금' : '입금'}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-emerald-100/80">
                    <span>{tx?.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : '-'}</span>
                    <span>{tx?.value ? Number(tx.value).toLocaleString('ko-KR') : '0'} WEI</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setTxPanelOpen(false)}
          />
        </div>
      )}

      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => (!transferLoading ? setTransferModalOpen(false) : null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-300/30 bg-slate-950/90 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">충/환전</h3>
              <button
                type="button"
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
                onClick={() => setTransferModalOpen(false)}
                disabled={transferLoading}
              >
                닫기
              </button>
            </div>
              <div className="mt-3 grid grid-cols-2 rounded-xl border border-emerald-300/40 bg-slate-900/70 p-1">
                {[ 
                  { key: 'deposit', label: '충전하기' },
                  { key: 'withdraw', label: '환전하기' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setTransferTab(tab.key as 'deposit' | 'withdraw');
                      if (tab.key === 'deposit') fetchWalletUsdtBalance();
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      transferTab === tab.key
                        ? 'bg-emerald-400 text-slate-900 shadow'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>방향</span>
                <span className="font-semibold text-white">
                  {transferTab === 'deposit' ? '내 지갑 → 에스크로' : '에스크로 → 내 지갑'}
                </span>
              </div>
              <div className="flex justify-between text-[12px] text-slate-300">
                <span>{transferTab === 'deposit' ? '내 지갑 잔액' : '에스크로 잔액'}</span>
                <span className="text-lg font-extrabold text-emerald-50">
                  {transferTab === 'deposit'
                    ? walletUsdtBalance !== null
                      ? walletUsdtBalance.toFixed(6)
                      : '-'
                    : escrowUsdtBalance !== null
                    ? escrowUsdtBalance.toFixed(6)
                    : '-'}{' '}
                  USDT
                </span>
              </div>
              <label className="text-xs text-slate-400">수량 (USDT)</label>
              <input
                value={transferAmount}
                step="any"
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                  let numeric = Number(sanitized);
                  let nextValue = sanitized;
                  if (
                    transferTab === 'deposit' &&
                    walletUsdtBalance !== null &&
                    Number.isFinite(numeric) &&
                    numeric > walletUsdtBalance
                  ) {
                    numeric = walletUsdtBalance;
                    nextValue = walletUsdtBalance.toString();
                  }
                  if (
                    transferTab === 'withdraw' &&
                    escrowUsdtBalance !== null &&
                    Number.isFinite(numeric) &&
                    numeric > escrowUsdtBalance
                  ) {
                    numeric = escrowUsdtBalance;
                    nextValue = escrowUsdtBalance.toString();
                  }
                  setTransferAmount(nextValue);
                }}
                inputMode="decimal"
                placeholder="예: 12.3456"
                className="w-full rounded-2xl border-2 border-emerald-300/50 bg-slate-900/70 px-4 py-3 text-right text-lg font-semibold text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
              />
              {transferError && <p className="text-xs text-rose-300">{transferError}</p>}
              <button
                type="button"
                onClick={submitTransfer}
                disabled={transferLoading}
                className="mt-2 w-full rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60"
              >
                {transferLoading ? '처리 중...' : '실행'}
              </button>
            </div>
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => (!profileSaving ? setProfileModalOpen(false) : null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-300/30 bg-slate-950/90 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">프로필 설정</h3>
              <button
                type="button"
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
                onClick={() => setProfileModalOpen(false)}
                disabled={profileSaving}
              >
                닫기
              </button>
            </div>
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-emerald-300/50 bg-slate-900/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profilePreview} alt="preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">현재 이미지</p>
                    <p className="text-[11px] text-slate-400">새 이미지를 선택하면 변경됩니다.</p>
                  </div>
                </div>
                <label className="cursor-pointer rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-50 hover:bg-emerald-400/30">
                  파일 선택
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-400">Vercel Blob에 업로드됩니다. 10MB 이하 권장.</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <span className="text-sm text-slate-300">현재 닉네임</span>
                  <span className="text-lg font-bold text-emerald-100">{sellerUser?.nickname || '-'}</span>
                </div>
                <label className="text-xs text-slate-400">변경할 닉네임 (영문 소문자/숫자만)</label>
                <input
                  value={profileNickname}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-z0-9]/g, '');
                    setProfileNickname(val);
                  }}
                  maxLength={20}
                  className="mt-1 w-full rounded-xl border-2 border-emerald-300/60 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  placeholder="새 닉네임을 입력하세요"
                />
              </div>

              {profileError && <p className="text-xs text-rose-300">{profileError}</p>}
              {!profileError && (
                <p className="text-[11px] text-slate-400">
                  닉네임은 영문 소문자와 숫자만 사용할 수 있습니다.
                </p>
              )}

              <button
                type="button"
                onClick={handleProfileSave}
                disabled={
                  profileSaving ||
                  (!profileFile &&
                    (!profileNickname.trim() ||
                      profileNickname.trim() === (sellerUser?.nickname?.trim() || '')))
                }
                className="w-full rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 shadow hover:bg-emerald-300 disabled:opacity-60"
              >
                {profileSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
