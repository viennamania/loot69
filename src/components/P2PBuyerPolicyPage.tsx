'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type PolicyResponse = {
  title?: string;
  content?: string[] | string;
  updatedAt?: string;
  createdAt?: string;
};

type PolicyPageProps = {
  slug: string;
  title: string;
  description: string;
};

const normalizeContent = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value.filter((line) => line.trim().length > 0);
  }
  if (!value) {
    return [];
  }
  return String(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

export default function P2PBuyerPolicyPage({ slug, title, description }: PolicyPageProps) {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';

  const [policy, setPolicy] = useState<PolicyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchPolicy = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(`/api/policy/get?slug=${encodeURIComponent(slug)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || '정책 정보를 불러오지 못했습니다.');
        }
        if (active) {
          setPolicy(data?.result || null);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : '정책 정보를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPolicy();

    return () => {
      active = false;
    };
  }, [slug]);

  const content = useMemo(() => normalizeContent(policy?.content), [policy]);
  const displayTitle = policy?.title?.trim() || title;
  const updatedAt = policy?.updatedAt || policy?.createdAt;
  const updatedDate = updatedAt ? String(updatedAt).slice(0, 10) : '';

  return (
    <div className="flex min-h-screen flex-col bg-white text-black sm:bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#f0f0f3_45%,#dadce1_100%)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-0 pt-6 pb-0 sm:px-5 sm:py-10">
        <main className="flex flex-1 flex-col overflow-hidden bg-white sm:rounded-[32px] sm:border sm:border-black/10 sm:shadow-[0_34px_90px_-50px_rgba(15,15,18,0.45)] sm:ring-1 sm:ring-black/10">
          <div className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
            <header className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">{displayTitle}</h1>
                <button
                  type="button"
                  onClick={() => router.push(`/${lang}/p2p-buyer`)}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/60"
                >
                  뒤로
                </button>
              </div>
              <p className="text-sm text-black/60">{description}</p>
              {updatedDate && (
                <p className="text-xs text-black/50">마지막 업데이트: {updatedDate}</p>
              )}
            </header>

            <section className="rounded-3xl border border-black/10 bg-white/90 p-5 text-black shadow-[0_18px_40px_-28px_rgba(0,0,0,0.25)]">
              {loading && (
                <p className="text-sm text-black/70">정책 정보를 불러오는 중입니다...</p>
              )}
              {!loading && errorMessage && (
                <p className="text-sm text-rose-500">{errorMessage}</p>
              )}
              {!loading && !errorMessage && content.length === 0 && (
                <p className="text-sm text-black/70">
                  등록된 정책 내용이 없습니다. 관리자에서 내용을 추가해 주세요.
                </p>
              )}
              {!loading && !errorMessage && content.length > 0 && (
                <div className="space-y-3 text-sm leading-relaxed text-black/80">
                  {content.map((line, index) => (
                    <p key={`${slug}-${index}`}>{line}</p>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="mt-auto px-0 sm:px-5">
            <footer className="mx-0 rounded-none bg-[#1f1f1f] px-0 py-6 pb-0 text-center text-xs text-[#9aa3b2] sm:-mx-5 sm:rounded-b-[32px] sm:px-5 sm:pb-8">
              <div className="px-5 sm:px-0">
              <div className="flex flex-col items-center gap-2">
                <p className="text-2xl font-semibold tracking-tight text-[#ff8a1f]">
                  Loot69™
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#b6beca]">
                  <span className="px-2">이용약관</span>
                  <span className="text-[#566072]">|</span>
                  <span className="px-2">개인정보처리방침</span>
                  <span className="text-[#566072]">|</span>
                  <span className="px-2">환불 분쟁 정책</span>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-[#8a93a6]">
                리스크 고지: 가상자산 결제에는 가격 변동 및 네트워크 지연 등 위험이
                수반될 수 있습니다. 결제 전에 수수료·환율·정산 조건을 확인해 주세요.
              </p>

              <div className="mt-4 space-y-1 text-[11px] text-[#b6beca]">
                <p>이메일: help@loot.menu</p>
                <p>주소: 14F, Corner St. Paul &amp; Tombs of the Kings, 8046 Pafos, Cyprus</p>
              </div>

              <p className="mt-4 text-[11px] text-[#6c7688]">
                Copyright © Loot69 All Rights Reserved
              </p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
