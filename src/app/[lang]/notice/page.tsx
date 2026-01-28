import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Manrope, Playfair_Display } from 'next/font/google';
import { getActiveNotices } from '@/lib/api/notice';

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

export default async function NoticePage({ params }: { params: { lang?: string } }) {
  const lang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang ?? 'ko';
  const notices = await getActiveNotices({ limit: 100, sortBy: 'publishedAt', pinnedFirst: true });

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
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,var(--sea)_0%,transparent_70%)] opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:18px_18px] opacity-20" />

      <main className="container relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-10">
        <header className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_35px_100px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-30" />
          <div className="absolute -bottom-16 left-[-12%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--sea)_0%,transparent_70%)] opacity-25" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                Notice
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-loot.png"
                  alt="Loot69"
                  width={140}
                  height={44}
                  className="h-10 w-auto"
                />
                <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-500">
                  공지사항
                </span>
              </div>
              <h1 className="font-[var(--font-display)] text-3xl text-[color:var(--ink)] sm:text-4xl">
                Loot69 공지사항
              </h1>
              <p className="max-w-xl text-base text-slate-600">
                서비스 업데이트, 정책 변경, 주요 안내 사항을 확인하세요.
              </p>
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

        <section className="mt-12 grid gap-4">
          {(notices as any[]).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-5 py-8 text-center text-sm text-slate-500 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)]">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            (notices as any[]).map((notice) => {
              const id = String(notice?._id ?? notice?.id ?? '');
              const dateSource = notice?.publishedAt || notice?.createdAt;
              const date = dateSource ? String(dateSource).slice(0, 10) : '';
              const summary =
                notice?.summary ||
                (Array.isArray(notice?.content)
                  ? notice.content.find((line: string) => line?.trim()) || ''
                  : typeof notice?.content === 'string'
                  ? notice.content.split('\n')[0]
                  : '');
              return (
              <Link
              key={id}
              href={`/${lang}/notice/${id}`}
              className="group rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-40px_rgba(15,23,42,0.45)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  {date}
                </div>
                <span className="text-xs font-semibold text-slate-400">자세히 보기</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-orange-600">
                {notice.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{summary}</p>
            </Link>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
