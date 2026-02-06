'use client';

import { useEffect, useState } from 'react';
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
  const [needsNickname, setNeedsNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [sellerNickname, setSellerNickname] = useState('');
  const [userExists, setUserExists] = useState(false);

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
          setUserExists(true);
          const rawNick = data.result.nickname || '';
          const userNick = rawNick.trim();
          const sellerNick = data.result.seller?.nickname?.trim?.() || '';
          const escrow = data.result.seller?.escrowWalletAddress || '';
          const shouldNeedNickname = !userNick;

          setNickname(userNick); // keep empty if none
          setSellerNickname(sellerNick);
          setNeedsNickname(shouldNeedNickname);
          setNewNickname('');
          setAvatar(data.result.avatar || '/profile-default.png');
          setEscrowAddress(escrow || '');
        } else {
          // No user data returned
          setUserExists(false);
          setNeedsNickname(true);
          setNickname('');
        }
      } catch (e) {
        // If fetching fails, allow nickname registration to appear
        setNeedsNickname(true);
        setUserExists(false);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [address]);

  const handleSaveNickname = async () => {
    if (!address) return;
    const trimmed = newNickname.trim();
    const isValid = /^[a-z0-9]{3,20}$/.test(trimmed);
    if (!isValid) {
      setSaveError('영문 소문자와 숫자 3~20자로 입력해주세요.');
      return;
    }
    setSaveError(null);
    setSaveSuccess(null);
    setSaveLoading(true);
    try {
      const res = await fetch('/api/user/registerSellerWithEscrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: STORECODE,
          walletAddress: address,
          nickname: trimmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        throw new Error(data?.error || '닉네임 저장에 실패했습니다.');
      }
      setNickname(trimmed);
      setSellerNickname(trimmed);
      setEscrowAddress(data?.result?.escrowWalletAddress || '');
      setNeedsNickname(false);
      setSaveSuccess('닉네임이 저장되었습니다.');
    } catch (error: any) {
      setSaveError(error?.message || '닉네임 저장에 실패했습니다.');
    } finally {
      setSaveLoading(false);
    }
  };

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

        {address && needsNickname && (
          <section className="rounded-3xl border border-emerald-400/30 bg-emerald-900/30 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">판매자 아이디 등록</h3>
                <p className="text-sm text-emerald-100/80">
                  영문 소문자와 숫자만 3~20자로 입력해주세요.
                </p>
                {!userExists && (
                  <p className="mt-1 text-[11px] text-amber-200">
                    이 지갑 주소로 등록된 회원 정보가 없습니다. 닉네임을 등록하면 회원이 생성됩니다.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs text-emerald-100/80" htmlFor="nicknameInput">
                닉네임
              </label>
              <input
                id="nicknameInput"
                value={newNickname}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                  setNewNickname(v);
                  setSaveError(null);
                  setSaveSuccess(null);
                }}
                className="w-full rounded-2xl border border-emerald-400/40 bg-slate-950/70 px-4 py-3 text-lg font-semibold text-emerald-50 outline-none ring-2 ring-transparent focus:border-emerald-300 focus:ring-emerald-400/40"
                placeholder="예: myshop123"
                maxLength={20}
              />
              <p className="text-[11px] text-emerald-100/70">사용 가능한 문자: a-z, 0-9</p>
              {saveError && <p className="text-sm text-rose-200">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-emerald-200">{saveSuccess}</p>}
            </div>
            <button
              type="button"
              disabled={
                saveLoading ||
                newNickname.length < 3 ||
                newNickname.length > 20 ||
                /^[a-z0-9]{3,20}$/.test(newNickname) === false
              }
              onClick={handleSaveNickname}
              className="mt-5 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-center text-sm font-bold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
            >
              {saveLoading ? '저장 중...' : '닉네임 등록하기'}
            </button>
          </section>
        )}

        {address && !needsNickname && (
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
                {sellerNickname && (
                  <p className="text-[11px] font-semibold text-emerald-200">판매자 아이디: {sellerNickname}</p>
                )}
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/${lang}/loot/seller/${escrowAddress}`)
                    }
                    className="inline-flex items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-500 text-sm font-bold text-emerald-950 px-4 py-2 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                  >
                    나의 에스크로 관리하기
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
