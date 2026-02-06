import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Manrope, Playfair_Display } from 'next/font/google';
import { getPolicyBySlug } from '@/lib/api/policy';

export const dynamic = 'force-dynamic';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});

const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const normalizeContent = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value.filter((line) => line.trim().length > 0);
  }
  if (!value) return [];
  return String(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

export default async function TermsOfServicePage({ params }: { params: { lang?: string } }) {
  const lang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang ?? 'ko';
  const policy = await getPolicyBySlug('terms-of-service');
  const title = policy?.title?.trim() || '이용약관';
  const content = normalizeContent(policy?.content);
  const updatedAt = policy?.updatedAt || policy?.createdAt;
  const updatedDate = updatedAt ? String(updatedAt).slice(0, 10) : '';

  return (
    <div
      className={`${bodyFont.variable} ${displayFont.variable} relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#fff7ed_0%,#f0f9ff_45%,#fff1f2_85%)] text-slate-900 font-[var(--font-body)]`}
      style={
        {
          '--accent': '#ff7a1a',
          '--accent-deep': '#ea580c',
          '--sea': '#0ea5e9',
          '--ink': '#1c1917',
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,var(--sea)_0%,transparent_70%)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px] opacity-20" />

      <main className="container relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-10">
        <header className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_35px_100px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-25" />
          <div className="absolute -bottom-16 left-[-12%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--sea)_0%,transparent_70%)] opacity-20" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                Policy
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Image
                  src="/logo-loot.webp"
                  alt="Loot69"
                  width={140}
                  height={44}
                  className="h-10 w-auto"
                />
                <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-500">
                  이용약관
                </span>
              </div>
              <h1 className="font-[var(--font-display)] text-3xl text-[color:var(--ink)] sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-xl text-base text-slate-600">
                서비스 이용 조건과 책임 범위를 안내합니다.
              </p>
              {updatedDate && (
                <p className="text-xs font-semibold text-slate-400">마지막 업데이트: {updatedDate}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${lang}/loot`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
              >
                P2P 홈으로 돌아가기
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200/70 bg-white/90 px-6 py-8 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)]">
          {content.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-5 py-8 text-center text-sm text-slate-500">
              등록된 이용약관이 없습니다. 관리자에서 내용을 추가해 주세요.
            </div>
          ) : (
            <div className="space-y-4 text-sm leading-relaxed text-slate-700">
              {content.map((line, index) => (
                <p key={`terms-${index}`}>{line}</p>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
