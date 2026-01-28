'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';

const SELLER_CACHE_KEY = 'orangex-seller-escrow-cache';
const SELLER_CACHE_TTL_MS = 5 * 60 * 1000;

type SellerCache = {
  walletAddress: string;
  escrowWalletAddress: string;
  updatedAt: number;
};

const readCache = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(SELLER_CACHE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SellerCache;
  } catch {
    return null;
  }
};

const writeCache = (cache: SellerCache) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SELLER_CACHE_KEY, JSON.stringify(cache));
};

const getLangFromPath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && /^[a-z]{2}$/i.test(first)) {
    return first;
  }
  return 'ko';
};

const MySellerWidgetGlobal = () => {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address || '';
  const pathname = usePathname();
  const lang = useMemo(() => getLangFromPath(pathname), [pathname]);
  const [escrowWalletAddress, setEscrowWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!address) {
      setEscrowWalletAddress(null);
      return;
    }

    const cached = readCache();
    if (
      cached &&
      cached.walletAddress === address &&
      Date.now() - cached.updatedAt < SELLER_CACHE_TTL_MS
    ) {
      setEscrowWalletAddress(cached.escrowWalletAddress || null);
    }

    const fetchSeller = async () => {
      try {
        const response = await fetch('/api/user/getUserByWalletAddress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storecode: 'admin',
            walletAddress: address,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch seller info');
        }


        const data = (await response.json()) as {
          result?: { seller?: { escrowWalletAddress?: string } };
        };
        const nextEscrowWallet =
          data?.result?.seller?.escrowWalletAddress || null;

        if (isMounted) {
          setEscrowWalletAddress(nextEscrowWallet);
        }

        if (nextEscrowWallet) {
          writeCache({
            walletAddress: address,
            escrowWalletAddress: nextEscrowWallet,
            updatedAt: Date.now(),
          });
        }
      } catch {
        if (isMounted) {
          setEscrowWalletAddress(null);
        }
      }
    };

    fetchSeller();

    return () => {
      isMounted = false;
    };
  }, [address]);

  console.log('MySellerWidgetGlobal render', { address, escrowWalletAddress });

  if (!address || !escrowWalletAddress) {
    return null;
  }


  return (
    <div className="fixed top-20 left-6 z-40">
      <Link
        href={`/${lang}/escrow/${escrowWalletAddress}`}
        className="group inline-flex items-center gap-3 rounded-full border border-amber-200/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-32px_rgba(15,23,42,0.55)]"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: 'var(--accent, #f97316)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12h18M16 6l5 6-5 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        나의 판매계정
      </Link>
    </div>
  );
};

export default MySellerWidgetGlobal;
