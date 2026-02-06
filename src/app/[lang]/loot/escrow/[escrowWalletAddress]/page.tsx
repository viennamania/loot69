'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ConnectButton, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { balanceOf } from 'thirdweb/extensions/erc20';
import SendbirdProvider from '@sendbird/uikit-react/SendbirdProvider';
import GroupChannel from '@sendbird/uikit-react/GroupChannel';
import { toast } from 'react-hot-toast';

import { client } from '@/app/client';
import { useClientWallets } from '@/lib/useClientWallets';
import {
  chain as chainId,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,
} from '@/app/config/contractAddresses';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';

const STORECODE = 'admin';
const SENDBIRD_APP_ID =
  process.env.NEXT_PUBLIC_SENDBIRD_API_TOKEN || process.env.SENDBIRD_API_TOKEN || '';

type SellerLite = {
  id?: number;
  nickname?: string;
  avatar?: string;
  walletAddress?: string;
  seller?: {
    status?: string;
    enabled?: boolean;
    usdtToKrwRate?: number;
    promotionText?: string;
    priceSettingMethod?: string;
    market?: string;
    escrowWalletAddress?: string;
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    };
  };
  currentUsdtBalance?: number;
};

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

export default function EscrowSellerPage() {
  const params = useParams<{ lang?: string; escrowWalletAddress?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';
  const escrowWalletParam = params?.escrowWalletAddress;
  const escrowWalletAddress = Array.isArray(escrowWalletParam)
    ? escrowWalletParam[0]
    : escrowWalletParam || '';

  const { wallets } = useClientWallets();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const address = activeAccount?.address ?? activeWallet?.getAccount?.()?.address ?? '';
  const isLoggedIn = Boolean(address);

  const [seller, setSeller] = useState<SellerLite | null>(null);
  const [escrowBalance, setEscrowBalance] = useState<number | null>(null);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [errorSeller, setErrorSeller] = useState<string | null>(null);

  const [buyerNickname, setBuyerNickname] = useState('');
  const [buyerAvatar, setBuyerAvatar] = useState('');
  const [buyerProfile, setBuyerProfile] = useState<any | null>(null);
  const [channelUrl, setChannelUrl] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [buyKrwAmount, setBuyKrwAmount] = useState('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastOrderStatus, setLastOrderStatus] = useState<string | null>(null);
  const [lastOrderDetail, setLastOrderDetail] = useState<any | null>(null);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersInitialized, setOrdersInitialized] = useState(false);
  const [, forceTick] = useState(0);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const pendingUsdtAmount = useMemo(() => {
    return sellerOrders
      .filter((o) => !['paymentConfirmed', 'cancelled'].includes(o?.status))
      .reduce((sum, o) => sum + (Number(o?.usdtAmount) || 0), 0);
  }, [sellerOrders]);

  const availableUsdtToBuy = useMemo(() => {
    if (escrowBalance === null || escrowBalance === undefined) return 0;
    const avail = escrowBalance - pendingUsdtAmount;
    return avail > 0 ? avail : 0;
  }, [escrowBalance, pendingUsdtAmount]);

  const myOrders = useMemo(
    () =>
      sellerOrders
        .filter((o) => address && o?.walletAddress?.toLowerCase() === address.toLowerCase())
        .sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime(),
        ),
    [sellerOrders, address],
  );
  const myPaymentRequestedOrders = useMemo(
    () => myOrders.filter((o) => o?.status === 'paymentRequested'),
    [myOrders],
  );
  const hasActivePaymentRequest = useMemo(
    () => myPaymentRequestedOrders.length > 0,
    [myPaymentRequestedOrders],
  );
  const isCheckingMyOrders = loadingOrders && !ordersInitialized;

  const handleCancelOrder = async () => {
    if (!cancelModalOrderId || !address) return;
    setIsCancelling(true);
    try {
      const response = await fetch('/api/order/cancelBuyOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cancelModalOrderId,
          walletAddress: address,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.result) {
        throw new Error(data?.error || '주문 취소에 실패했습니다.');
      }
      toast.success('주문이 취소되었습니다.');
      setSellerOrders((prev) =>
        prev.map((o) =>
          normalizeId(o?._id) === cancelModalOrderId
            ? { ...o, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : o,
        ),
      );
      setCancelModalOrderId(null);
      forceTick((v) => v + 1); // refresh orders
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '주문 취소에 실패했습니다.');
    } finally {
      setIsCancelling(false);
    }
  };

  const renderCancelModal = () => {
    if (!cancelModalOrderId) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => (!isCancelling ? setCancelModalOrderId(null) : null)}
        />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-rose-200/40 bg-slate-900/90 p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white">주문 취소 안내</h3>
          <p className="mt-2 text-sm text-rose-100">
            주문을 취소하면 구매자 평가에 부정적인 영향을 줄 수 있습니다. 그래도 취소하시겠습니까?
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              className="w-full rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 sm:w-auto"
              onClick={() => setCancelModalOrderId(null)}
              disabled={isCancelling}
            >
              돌아가기
            </button>
            <button
              className={`w-full rounded-full px-4 py-2 text-sm font-semibold shadow-sm sm:w-auto ${
                isCancelling ? 'bg-rose-400 text-rose-100' : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? '취소 중...' : '주문 취소하기'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const chainObj = useMemo(() => getChainObject(), []);
  const usdtAddress = useMemo(() => getUsdtAddress(), []);

  const normalizeId = (value: any) =>
    typeof value === 'string'
      ? value
      : value?.$oid || value?.oid || value?._id || '';

  useEffect(() => {
    if (!escrowWalletAddress) {
      setErrorSeller('에스크로 지갑 주소가 필요합니다.');
      return;
    }
    let active = true;
    const fetchSeller = async () => {
      setLoadingSeller(true);
      setErrorSeller(null);
      try {
        const response = await fetch('/api/user/getAllSellersForBalance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storecode: STORECODE,
            limit: 1,
            page: 1,
            escrowWalletAddress,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || '판매자 정보를 불러오지 못했습니다.');
        }
        const found: SellerLite | undefined = Array.isArray(payload?.result?.users)
          ? payload.result.users[0]
          : undefined;
        if (!found) {
          throw new Error('해당 에스크로 지갑의 판매자를 찾을 수 없습니다.');
        }
        if (active) {
          setSeller(found);
        }
      } catch (error) {
        if (active) {
          setSeller(null);
          setErrorSeller(
            error instanceof Error ? error.message : '판매자 정보를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (active) {
          setLoadingSeller(false);
        }
      }
    };
    fetchSeller();
    return () => {
      active = false;
    };
  }, [escrowWalletAddress]);

  useEffect(() => {
    let active = true;
    const fetchBalance = async () => {
      if (!seller?.seller?.escrowWalletAddress && !escrowWalletAddress) return;
      try {
        const contract = getContract({
          client,
          chain: chainObj,
          address: usdtAddress,
        });
        const result = await balanceOf({
          contract,
          address: escrowWalletAddress,
        });
        const decimals = activeChainId === 'bsc' ? 18 : 6;
        if (active) {
          setEscrowBalance(Number(result) / 10 ** decimals);
        }
      } catch (error) {
        if (active) {
          setEscrowBalance(null);
        }
      }
    };
    fetchBalance();
    const timer = setInterval(fetchBalance, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [seller, escrowWalletAddress, chainObj, usdtAddress]);

  useEffect(() => {
    let active = true;
    const fetchBuyerProfile = async () => {
      if (!address) {
        setBuyerNickname('');
        setBuyerAvatar('');
        return;
      }
      setUserLoading(true);
      try {
        const response = await fetch('/api/user/getUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storecode: STORECODE,
            walletAddress: address,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || '회원 정보를 불러오지 못했습니다.');
        }
        if (active) {
          setBuyerNickname(data?.result?.nickname || address);
          setBuyerAvatar(data?.result?.avatar || '');
          setBuyerProfile(data?.result || null);
        }
      } catch {
        if (active) {
          setBuyerNickname(address);
          setBuyerAvatar('');
          setBuyerProfile(null);
        }
      } finally {
        if (active) setUserLoading(false);
      }
    };
    fetchBuyerProfile();
    return () => {
      active = false;
    };
  }, [address]);

  // poll last order status when we have an order id
  useEffect(() => {
    if (!lastOrderId || !isLoggedIn) return;
    let active = true;

    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/order/getAllBuyOrders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storecode: STORECODE,
            walletAddress: address,
            searchMyOrders: true,
            limit: 50,
            page: 1,
          }),
        });
        const data = await response.json().catch(() => ({}));
        const orders: any[] = data?.result?.orders || [];
        const found = orders.find((o) => normalizeId(o?._id) === lastOrderId);
        if (active && found?.status) {
          setLastOrderStatus(found.status);
          setLastOrderDetail(found);
        }
      } catch (error) {
        // silent
      }
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, 7000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [lastOrderId, isLoggedIn, address]);

  // fetch seller orders for this escrow seller
  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      if (!seller?.walletAddress) return;
      if (!ordersInitialized) {
        setLoadingOrders(true);
      }
      try {
        const response = await fetch('/api/order/getAllBuyOrders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storecode: STORECODE,
            limit: 200,
            page: 1,
            searchMyOrders: false,
            searchOrderStatusCancelled: false,
            searchOrderStatusCompleted: false,
            fromDate: '',
            toDate: '',
          }),
        });
        const data = await response.json().catch(() => ({}));
        const orders: any[] = data?.result?.orders || [];
        const filtered = orders.filter(
          (o) =>
            o?.seller?.walletAddress === seller.walletAddress ||
            o?.seller?.escrowWalletAddress === escrowWalletAddress,
        );
        if (active) {
          setSellerOrders(filtered);
          setOrdersInitialized(true);
        }
      } catch (error) {
        if (active) {
          setSellerOrders([]);
        }
      } finally {
        if (active) {
          setLoadingOrders(false);
        }
      }
    };
    fetchOrders();
    const timer = setInterval(fetchOrders, 10000);
    const tick = setInterval(() => forceTick((v) => v + 1), 1000);
    return () => {
      active = false;
      clearInterval(timer);
      clearInterval(tick);
    };
  }, [seller?.walletAddress, escrowWalletAddress]);

  useEffect(() => {
    let active = true;
    const prepareChat = async () => {
      if (!isLoggedIn || !seller?.walletAddress) {
        setChannelUrl(null);
        setSessionToken(null);
        return;
      }
      setChatLoading(true);
      setChatError(null);
      try {
        const channelResponse = await fetch('/api/sendbird/group-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerId: address,
            sellerId: seller.walletAddress,
          }),
        });
        const channelData = await channelResponse.json().catch(() => ({}));
        if (!channelResponse.ok || !channelData?.channelUrl) {
          throw new Error(channelData?.error || '채널 생성에 실패했습니다.');
        }
        if (active) {
          setChannelUrl(channelData.channelUrl);
        }

        const sessionResponse = await fetch(
          `/api/sendbird/session-token?userId=${encodeURIComponent(address)}&nickname=${encodeURIComponent(
            buyerNickname || address,
          )}&profileUrl=${encodeURIComponent(buyerAvatar || '')}`,
        );
        const sessionData = await sessionResponse.json().catch(() => ({}));
        if (!sessionResponse.ok || !sessionData?.sessionToken) {
          throw new Error(sessionData?.error || '세션 토큰 발급에 실패했습니다.');
        }
        if (active) {
          setSessionToken(sessionData.sessionToken);
        }
      } catch (error) {
        if (active) {
          setChatError(error instanceof Error ? error.message : '채팅을 준비하지 못했습니다.');
        }
      } finally {
        if (active) {
          setChatLoading(false);
        }
      }
    };
    prepareChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, seller?.walletAddress, address, buyerNickname, buyerAvatar]);

  const renderStatusBadge = (status?: string) => {
    const isConfirmed = status === 'confirmed';
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
          isConfirmed
            ? 'border-emerald-300/50 bg-emerald-500/10 text-emerald-100'
            : 'border-amber-300/50 bg-amber-500/10 text-amber-100'
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {isConfirmed ? '판매가능상태' : '판매불가능상태'}
      </span>
    );
  };

  const renderEnabledBadge = (enabled?: boolean) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
        enabled
          ? 'border-emerald-300/50 bg-emerald-500/10 text-emerald-100'
          : 'border-slate-200/60 bg-slate-100/40 text-slate-700'
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {enabled ? '활동중' : '중지'}
    </span>
  );

  const notifySellerChannel = async (summary: string) => {
    if (!channelUrl || !address) return;
    try {
      await fetch('/api/sendbird/welcome-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelUrl,
          senderId: address,
          message: summary,
        }),
      });
    } catch (error) {
      // non-blocking
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1226] to-[#050915] text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-20 pt-10">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            <Image src="/icon-back.png" alt="Back" width={18} height={18} className="rounded-full" />
            돌아가기
          </button>
        </div>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-2 ring-emerald-400/40">
              <Image src="/icon-escrow-wallet.png" alt="escrow" width={28} height={28} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Escrow Seller</p>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {seller?.nickname || '판매자 조회'}
              </h1>
              <p className="text-xs text-slate-400">
                에스크로 지갑: {escrowWalletAddress ? `${escrowWalletAddress.slice(0, 8)}...${escrowWalletAddress.slice(-6)}` : '-'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderStatusBadge(seller?.seller?.status)}
            {renderEnabledBadge(seller?.seller?.enabled)}
          </div>
        </header>

        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-900/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1 break-words">
              <p className="text-xs text-emerald-100/80">내 구매자 정보</p>
              <h2 className="text-lg font-bold text-white">
                {buyerNickname || (userLoading ? '불러오는 중...' : '닉네임 없음')}
              </h2>
              <p className="text-sm text-emerald-100/80">
                입금자명:{' '}
                {buyerProfile?.buyer?.bankInfo?.accountHolder ||
                  buyerProfile?.buyer?.depositName ||
                  (userLoading ? '...' : '미설정')}
              </p>
              <div className="text-sm text-emerald-100/80 space-y-1">
                <p>USDT 수령 지갑:</p>
                <p className="font-mono text-[13px] break-all text-emerald-50">
                  {buyerProfile?.buyer?.receiveWalletAddress
                    ? buyerProfile.buyer.receiveWalletAddress
                    : userLoading
                    ? '...'
                    : '미설정'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">판매 정보</h2>
                <span className="text-xs text-slate-400">실시간</span>
              </div>
            {loadingSeller ? (
              <p className="mt-3 text-sm text-slate-400">판매자 정보를 불러오는 중...</p>
            ) : errorSeller ? (
              <p className="mt-3 text-sm text-rose-300">{errorSeller}</p>
            ) : !seller ? (
              <p className="mt-3 text-sm text-slate-400">판매자 정보를 찾을 수 없습니다.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-400">판매자</p>
                  <p className="mt-1 text-xl font-semibold text-white">{seller.nickname}</p>
                  <p className="text-xs text-slate-500">
                    {seller.walletAddress
                      ? `${seller.walletAddress.slice(0, 8)}...${seller.walletAddress.slice(-6)}`
                      : '-'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-400">판매 단가 (원/USDT)</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-200">
                    {typeof seller?.seller?.usdtToKrwRate === 'number'
                      ? seller.seller.usdtToKrwRate.toLocaleString('ko-KR')
                      : '-'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {seller?.seller?.priceSettingMethod === 'market'
                      ? `시장가 연동 (${seller?.seller?.market || 'upbit'})`
                      : '지정가'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-400">에스크로 잔액 (USDT)</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-200">
                    {escrowBalance !== null ? escrowBalance.toFixed(6) : '-'}
                  </p>
                  <p className="text-[11px] text-slate-500">체인: {activeChainId.toUpperCase()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-400">프로모션 문구</p>
                  <p className="mt-1 text-sm font-semibold text-white leading-relaxed">
                    {seller?.seller?.promotionText || '등록된 문구가 없습니다.'}
                  </p>
                </div>
                {isCheckingMyOrders ? (
                  <div className="rounded-3xl border-2 border-emerald-400/60 bg-emerald-900/30 p-5 shadow-[0_18px_40px_-22px_rgba(16,185,129,0.6)]">
                    <p className="text-sm font-semibold text-emerald-50">내 주문 확인 중...</p>
                    <p className="mt-2 text-xs text-emerald-100/80">잠시만 기다려 주세요.</p>
                  </div>
                ) : hasActivePaymentRequest ? (
                  <div className="rounded-3xl border-2 border-emerald-400/60 bg-emerald-900/30 p-5 shadow-[0_18px_40px_-22px_rgba(16,185,129,0.6)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-emerald-100">내 구매 주문</p>
                        <p className="text-xl font-bold text-white leading-tight">
                          총 {myPaymentRequestedOrders.length}건 진행 중
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {myPaymentRequestedOrders.slice(0, 3).map((order) => (
                        <div
                          key={normalizeId(order?._id)}
                          className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-50"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-semibold">
                              {order.usdtAmount} USDT /{' '}
                              {Number(order.krwAmount || 0).toLocaleString('ko-KR')}원
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  order?.status === 'paymentConfirmed'
                                    ? 'bg-emerald-500/20 text-emerald-50 border border-emerald-300/60'
                                    : order?.status === 'accepted'
                                    ? 'bg-sky-500/20 text-sky-50 border border-sky-300/60'
                                    : order?.status === 'cancelled'
                                    ? 'bg-rose-500/20 text-rose-50 border border-rose-300/60'
                                    : 'bg-amber-500/20 text-amber-50 border border-amber-300/60'
                                }`}
                              >
                                {order?.status === 'paymentConfirmed'
                                  ? '결제완료'
                                  : order?.status === 'accepted'
                                  ? '판매자 승인'
                                  : order?.status === 'cancelled'
                                  ? '취소됨'
                                  : '결제 요청중'}
                              </span>
                              {order?.status === 'paymentRequested' && (
                                <button
                                  type="button"
                                  onClick={() => setCancelModalOrderId(normalizeId(order?._id))}
                                  className="rounded-full border border-rose-300/70 bg-rose-500/20 px-3 py-1.5 text-[11px] font-semibold text-rose-50 hover:bg-rose-500/30"
                                >
                                  주문 취소하기
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-1 text-[11px] text-emerald-100/80">
                            주문번호: {order?.tradeId || '-'} · 환율{' '}
                            {Number(order?.rate || 0).toLocaleString('ko-KR')} 원 ·{' '}
                            {order?.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                          </div>
                          {order?.status === 'paymentRequested' && order?.createdAt && (
                            <div className="mt-1 text-[11px] font-semibold text-amber-100">
                              남은 시간:{' '}
                              {Math.max(
                                0,
                                30 -
                                  Math.floor(
                                    (Date.now() - new Date(order.createdAt).getTime()) / 60000,
                                  ),
                              )}
                              분
                            </div>
                          )}
                          {order?.store?.bankInfo && (
                            <div className="mt-2 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-[11px] text-emerald-50">
                              <div className="font-semibold">판매자 입금 계좌</div>
                              <div className="mt-1 space-y-0.5">
                                <div>은행: {order.store.bankInfo.bankName || '-'}</div>
                                <div>계좌: {order.store.bankInfo.accountNumber || '-'}</div>
                                <div>예금주: {order.store.bankInfo.accountHolder || '-'}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : lastOrderStatus === 'paymentRequested' ? (
                  <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 shadow-inner">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">
                          결제 요청 접수됨
                        </p>
                        <p className="text-sm font-semibold text-white">판매자 승인 대기</p>
                      </div>
                      <span className="rounded-full border border-amber-300/60 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-50">
                        처리중
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-amber-50">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] text-amber-100/80">요청 수량</p>
                        <p className="mt-1 text-lg font-bold">{lastOrderDetail?.usdtAmount ?? '-'} USDT</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] text-amber-100/80">예상 결제 금액</p>
                        <p className="mt-1 text-lg font-bold">
                          {lastOrderDetail?.krwAmount
                            ? Number(lastOrderDetail.krwAmount).toLocaleString('ko-KR')
                            : '-'} 원
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] text-amber-100/80">적용 환율</p>
                        <p className="mt-1 text-lg font-bold">
                          {lastOrderDetail?.rate ? `${lastOrderDetail.rate.toLocaleString('ko-KR')} 원` : '-'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] text-amber-100/80">요청 시간</p>
                        <p className="mt-1 text-sm font-semibold">
                          {lastOrderDetail?.createdAt
                            ? new Date(lastOrderDetail.createdAt).toLocaleString()
                            : '-'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-amber-100/80">
                      판매자 승인 또는 취소 시 상태가 자동으로 업데이트됩니다. 승인 후 결제 안내를 따라주세요.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-3xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-700/35 via-emerald-600/30 to-emerald-500/25 p-6 shadow-[0_24px_50px_-22px_rgba(16,185,129,0.7)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-emerald-100">바로 구매하기</p>
                        <p className="text-xl font-bold text-white leading-tight">USDT 빠른 구매</p>
                      </div>
                      <span className="rounded-full border border-emerald-300/70 bg-emerald-400/25 px-3 py-1 text-[11px] font-semibold text-emerald-50">
                        실시간 요청
                      </span>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-emerald-50" htmlFor="buy-amount">
                          구매 USDT 수량
                        </label>
                        <input
                          id="buy-amount"
                          value={buyAmount}
                          disabled={!isLoggedIn || availableUsdtToBuy <= 0 || placingOrder}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                            let numeric = Number(sanitized);
                            if (
                              Number.isFinite(numeric) &&
                              availableUsdtToBuy > 0 &&
                              numeric > availableUsdtToBuy
                            ) {
                              numeric = availableUsdtToBuy;
                            }
                            setBuyAmount(sanitized);
                            if (seller?.seller?.usdtToKrwRate && Number.isFinite(numeric)) {
                              const calc = Math.floor(numeric * seller.seller.usdtToKrwRate);
                              setBuyKrwAmount(calc ? String(calc) : '');
                            }
                          }}
                          placeholder={availableUsdtToBuy > 0 ? '예: 100' : '구매 가능 수량 없음'}
                          inputMode="decimal"
                          max={availableUsdtToBuy > 0 ? availableUsdtToBuy : undefined}
                          className={`w-full rounded-2xl border-2 px-4 py-3 text-lg font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-300/80 text-right ${
                            isLoggedIn && availableUsdtToBuy > 0
                              ? 'border-emerald-300/70 bg-slate-950/70 text-emerald-50'
                              : 'border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                          }`}
                        />
                        <label className="text-sm font-semibold text-emerald-50" htmlFor="buy-krw">
                          결제할 금액 (KRW)
                        </label>
                        <input
                          id="buy-krw"
                          value={buyKrwAmount}
                          disabled={!isLoggedIn || availableUsdtToBuy <= 0 || placingOrder || !seller?.seller?.usdtToKrwRate}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/[^0-9]/g, '');
                            const numeric = Number(sanitized);
                            setBuyKrwAmount(sanitized);
                            if (seller?.seller?.usdtToKrwRate && Number.isFinite(numeric)) {
                              const usdt = numeric / seller.seller.usdtToKrwRate;
                              const trimmed = usdt > 0 ? usdt.toFixed(6).replace(/0+$/,'').replace(/\.$/,'') : '';
                              setBuyAmount(trimmed);
                            }
                          }}
                          placeholder={seller?.seller?.usdtToKrwRate ? '예: 1500000' : '환율 정보 필요'}
                          inputMode="numeric"
                          className={`w-full rounded-2xl border-2 px-4 py-3 text-lg font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-300/80 text-right ${
                            isLoggedIn && availableUsdtToBuy > 0 && seller?.seller?.usdtToKrwRate
                              ? 'border-emerald-300/70 bg-slate-950/70 text-emerald-50'
                              : 'border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                          }`}
                        />
                        <div className={`rounded-xl px-3 py-2 text-sm font-semibold shadow-inner ${availableUsdtToBuy > 0 ? 'bg-emerald-500/10 text-emerald-100' : 'bg-rose-500/10 text-rose-100'}`}>
                          <div>진행 중: {pendingUsdtAmount.toFixed(6)} USDT</div>
                          <div className="mt-0.5">구매 가능: {availableUsdtToBuy.toFixed(6)} USDT</div>
                        </div>
                        <p className="text-sm font-semibold text-emerald-100/80">
                          예상 결제 금액:{' '}
                          {buyKrwAmount
                            ? Number(buyKrwAmount || 0).toLocaleString('ko-KR')
                            : buyAmount && seller?.seller?.usdtToKrwRate
                            ? (Number(buyAmount || 0) * seller.seller.usdtToKrwRate).toLocaleString('ko-KR')
                            : '-'}{' '}
                          원
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!isLoggedIn) {
                            toast.error('지갑을 먼저 연결해주세요.');
                            return;
                          }
                          if (!seller?.walletAddress || !seller?.seller?.usdtToKrwRate) {
                            toast.error('판매자 정보가 부족합니다.');
                            return;
                          }
                          const amount = Number(buyAmount) || (seller?.seller?.usdtToKrwRate ? Number(buyKrwAmount || 0) / seller.seller.usdtToKrwRate : NaN);
                          if (!Number.isFinite(amount) || amount <= 0) {
                            toast.error('구매 수량을 올바르게 입력하세요.');
                            return;
                          }
                          if (availableUsdtToBuy <= 0 || amount > availableUsdtToBuy) {
                            toast.error('구매 가능 수량을 초과할 수 없습니다.');
                            return;
                          }
                          setPlacingOrder(true);
                          try {
                            const rate = seller.seller.usdtToKrwRate;
                            const krwAmount = buyKrwAmount
                              ? Number(buyKrwAmount)
                              : Math.round(amount * rate);
                            const response = await fetch('/api/order/setBuyOrderForUser', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                lang,
                                storecode: STORECODE,
                                walletAddress: address,
                                nickname: buyerNickname,
                                usdtAmount: amount,
                                krwAmount,
                                rate,
                                privateSale: false,
                                buyer: {
                                  depositBankName: buyerProfile?.buyer?.depositBankName || '',
                                  depositBankAccountNumber: buyerProfile?.buyer?.depositBankAccountNumber || '',
                                  depositName: buyerProfile?.buyer?.depositName || buyerNickname || '',
                                  bankInfo: {
                                    bankName: buyerProfile?.buyer?.depositBankName || '',
                                    accountNumber: buyerProfile?.buyer?.depositBankAccountNumber || '',
                                    accountHolder: buyerProfile?.buyer?.depositName || buyerNickname || '',
                                  },
                                  receiveWalletAddress: buyerProfile?.buyer?.receiveWalletAddress || '',
                                },
                                seller: {
                                  walletAddress: seller.walletAddress,
                                  escrowWalletAddress: seller.seller?.escrowWalletAddress,
                                  bankInfo: {
                                    bankName: seller.seller?.bankInfo?.bankName || '',
                                    accountNumber: seller.seller?.bankInfo?.accountNumber || '',
                                    accountHolder: seller.seller?.bankInfo?.accountHolder || seller.nickname || '',
                                  },
                                },
                              }),
                            });
                            const data = await response.json().catch(() => ({}));
                            if (!response.ok || !data?.result?._id) {
                              throw new Error(data?.error || '구매 요청에 실패했습니다.');
                            }
                            toast.success('구매 요청이 접수되었습니다.');
                            const insertedId = normalizeId(data.result._id);
                            // 주문 생성 후 목록 및 상태 갱신
                            setLastOrderId(null);
                            setLastOrderStatus(null);
                            setLastOrderDetail(null);
                            // 최신 주문 목록 즉시 반영
                            // fetchOrders는 effect 안에 정의되어 있어 여기서 직접 접근 불가하므로 강제 리프레시를 위해 상태를 토글
                            forceTick((v) => v + 1);
                            const summaryMsg = `구매 요청: ${amount} USDT (약 ${krwAmount.toLocaleString('ko-KR')}원), 환율 ${seller.seller.usdtToKrwRate.toLocaleString('ko-KR')}원/USDT`;
                            notifySellerChannel(summaryMsg);
                            setBuyAmount('');
                          } catch (error) {
                            toast.error(
                              error instanceof Error ? error.message : '구매 요청 중 오류가 발생했습니다.',
                            );
                          } finally {
                            setPlacingOrder(false);
                          }
                        }}
                        disabled={
                          placingOrder ||
                          !isLoggedIn ||
                          !seller?.seller?.usdtToKrwRate ||
                          availableUsdtToBuy <= 0 ||
                          !buyAmount ||
                          Number(buyAmount) <= 0
                        }
                        className={`w-full rounded-2xl px-4 py-3 text-lg font-bold shadow-lg transition ${
                          placingOrder || !isLoggedIn
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-emerald-400 text-slate-900 hover:bg-emerald-300'
                        }`}
                      >
                        {placingOrder ? '구매 요청 중...' : '구매하기'}
                      </button>
                    </div>
                  </div>
                )}
                {lastOrderId && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">최근 구매 요청</p>
                        <p className="text-sm font-semibold text-white">주문 ID: {lastOrderId.slice(0, 6)}...{lastOrderId.slice(-4)}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          lastOrderStatus === 'paymentConfirmed'
                            ? 'bg-emerald-500/15 text-emerald-100 border border-emerald-300/60'
                            : lastOrderStatus === 'accepted'
                            ? 'bg-sky-500/15 text-sky-100 border border-sky-300/60'
                            : lastOrderStatus === 'cancelled'
                            ? 'bg-rose-500/15 text-rose-100 border border-rose-300/60'
                            : 'bg-amber-500/15 text-amber-100 border border-amber-300/60'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {lastOrderStatus === 'paymentConfirmed'
                          ? '결제완료'
                          : lastOrderStatus === 'accepted'
                          ? '판매자 승인'
                          : lastOrderStatus === 'cancelled'
                          ? '취소됨'
                          : lastOrderStatus === 'paymentRequested'
                          ? '결제 요청중'
                          : lastOrderStatus || '대기'}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      상태가 바뀌면 자동으로 업데이트됩니다. 결제 완료 후 영수증 안내를 확인해 주세요.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-emerald-900/40 p-5 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Live Chat</p>
                <h2 className="text-lg font-semibold text-white">판매자와 대화</h2>
              </div>
              <div className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                실시간 상담
              </div>
            </div>
            {!seller?.walletAddress ? (
              <p className="mt-3 text-sm text-slate-400">판매자 정보를 먼저 불러와 주세요.</p>
            ) : !isLoggedIn ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-300">지갑을 연결하면 채팅이 시작됩니다.</p>
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={chainObj}
                  theme="dark"
                  connectButton={{
                    label: '웹3 로그인',
                    style: {
                      width: '100%',
                      height: 48,
                      borderRadius: 9999,
                      background: '#0f172a',
                      color: '#e2e8f0',
                      fontWeight: 700,
                      border: '1px solid rgba(94,234,212,0.4)',
                    },
                  }}
                  connectModal={{
                    size: 'wide',
                    showThirdwebBranding: false,
                  }}
                  locale="ko_KR"
                />
              </div>
            ) : chatError ? (
              <p className="mt-3 text-sm text-rose-300">{chatError}</p>
            ) : chatLoading || !sessionToken || !channelUrl ? (
              <p className="mt-3 text-sm text-slate-300">
                {chatLoading ? '채팅 채널을 준비 중입니다...' : '채팅 정보를 불러오는 중입니다...'}
              </p>
            ) : (
              <div className="mt-4 h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                <SendbirdProvider
                  appId={SENDBIRD_APP_ID}
                  userId={address}
                  accessToken={sessionToken}
                  theme="dark"
                >
                  <GroupChannel channelUrl={channelUrl} />
                </SendbirdProvider>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Orders</p>
                <h2 className="text-lg font-semibold text-white">이 판매자 구매 주문</h2>
              </div>
              <span className="text-xs text-slate-400">
                {loadingOrders ? '불러오는 중...' : `${sellerOrders.length}건`}
              </span>
            </div>
            {loadingOrders && !ordersInitialized ? (
              <p className="mt-3 text-sm text-slate-400">주문을 불러오는 중...</p>
            ) : sellerOrders.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">해당 판매자에게 접수된 주문이 없습니다.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {sellerOrders.slice(0, 20).map((order) => (
                  <div
                    key={normalizeId(order?._id)}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                          {order?.usdtAmount} USDT / {Number(order?.krwAmount || 0).toLocaleString('ko-KR')}원
                        </span>
                        <span className="text-[11px] text-slate-400">주문번호: {order?.tradeId || '-'}</span>
                        <span className="text-[11px] text-slate-400">
                          환율 {Number(order?.rate || 0).toLocaleString('ko-KR')} 원 · {order?.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          구매자: {order?.walletAddress ? `${order.walletAddress.slice(0, 6)}...${order.walletAddress.slice(-4)}` : '-'}
                          {address && order?.walletAddress?.toLowerCase() === address.toLowerCase() && (
                            <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                              내 주문
                            </span>
                          )}
                        </span>
                        {order?.status === 'paymentRequested' && order?.createdAt && (
                          <span className="text-[11px] font-semibold text-emerald-100">
                            남은 시간: {Math.max(0, 30 - Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000))}분
                          </span>
                        )}
                        {address && order?.walletAddress?.toLowerCase() === address.toLowerCase() && order?.store?.bankInfo && (
                          <div className="mt-1 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-50">
                            <div className="font-semibold">판매자 입금 계좌</div>
                            <div className="mt-1 space-y-0.5">
                              <div>은행: {order.store.bankInfo.bankName || '-'}</div>
                              <div>
                                계좌: {order.store.bankInfo.accountNumber || '-'}
                              </div>
                              <div>예금주: {order.store.bankInfo.accountHolder || '-'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                            order?.status === 'paymentConfirmed'
                              ? 'bg-emerald-500/15 text-emerald-100 border border-emerald-300/60'
                              : order?.status === 'accepted'
                              ? 'bg-sky-500/15 text-sky-100 border border-sky-300/60'
                              : order?.status === 'cancelled'
                              ? 'bg-rose-500/15 text-rose-100 border border-rose-300/60'
                              : 'bg-amber-500/15 text-amber-100 border border-amber-300/60'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {order?.status === 'paymentConfirmed'
                            ? '결제완료'
                            : order?.status === 'accepted'
                            ? '판매자 승인'
                            : order?.status === 'cancelled'
                            ? '취소됨'
                            : '결제 요청중'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {renderCancelModal()}
      </div>
    </main>
  );
}
