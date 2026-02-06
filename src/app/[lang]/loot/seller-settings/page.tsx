'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';

import { client } from '@/app/client';
import { useClientWallets } from '@/lib/useClientWallets';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';
import { chain as chainId } from '@/app/config/contractAddresses';

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

export default function SellerSettingsPage() {
  const params = useParams<{ lang?: string }>();
  const lang = Array.isArray(params?.lang) ? params?.lang?.[0] : params?.lang || 'ko';
  const { wallets } = useClientWallets();
  const chainObj = getChainObject();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('/profile-default.png');
   const [escrowAddress, setEscrowAddress] = useState('');
  const [loading, setLoading] = useState(false);
   const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const res = await fetch('/api/user/getUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storecode: STORECODE, walletAddress: address }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.result) {
          setNickname(data.result.nickname || '판매자');
          setAvatar(data.result.avatar || '/profile-default.png');
          setEscrowAddress(data.result.seller?.escrowWalletAddress || '');
        }
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [address]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-emerald-300/60 bg-slate-900/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-emerald-100/70">판매자 설정</p>
              <h1 className="text-lg font-bold text-white">{nickname || '판매자'}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            ← 돌아가기
          </button>
        </header>

        {!address && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <p className="text-sm text-emerald-100/80">지갑을 연결해주세요</p>
            <h2 className="text-xl font-bold text-white">판매자 정보를 보려면 Web3 로그인</h2>
            <p className="mt-2 text-sm text-slate-300">지갑 연결 후 프로필을 설정할 수 있습니다.</p>
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
                connectModal={{ size: 'wide', showThirdwebBranding: false }}
                locale={lang === 'ko' ? 'ko_KR' : 'en_US'}
              />
            </div>
          </div>
        )}

        {address && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <h3 className="text-base font-semibold text-white">판매자 프로필</h3>
            <p className="text-sm text-slate-300">판매자 상태/활동 표시 없이 프로필만 확인합니다.</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-emerald-300/60 bg-slate-900/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-lg font-bold text-white">{nickname || '판매자'}</p>
                <p className="text-xs text-slate-300">지갑 주소: {address.slice(0, 6)}...{address.slice(-4)}</p>
              </div>
            </div>
            {loading && <p className="mt-3 text-sm text-slate-400">불러오는 중...</p>}
            {escrowAddress && (
              <div className="relative mt-6 overflow-hidden rounded-3xl border border-emerald-300/30 bg-gradient-to-br from-emerald-900/40 via-slate-900/60 to-slate-950 p-5 shadow-2xl">
                <div className="pointer-events-none absolute -left-10 -top-14 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                    에스크로 지갑
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-50">
                      스마트 어카운트
                    </span>
                    <span className="rounded-full border border-cyan-300/60 bg-cyan-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-50">
                      MPC
                    </span>
                  </div>
                </div>
                <p className="mt-4 break-all font-mono text-lg tracking-tight text-emerald-50">
                  {escrowAddress}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator?.clipboard?.writeText(escrowAddress).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20"
                  >
                    복사하기
                  </button>
                  {copied && <span className="text-[11px] text-emerald-200">복사되었습니다</span>}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
