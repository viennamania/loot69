'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type NoticeItem = {
  _id?: string;
  id?: string;
  title?: string;
  summary?: string;
  content?: string[] | string;
  publishedAt?: string;
  createdAt?: string;
};

const resolveSummary = (notice: NoticeItem) => {
  if (notice?.summary) {
    return notice.summary;
  }
  if (Array.isArray(notice?.content)) {
    return notice.content.find((line) => line?.trim()) || '';
  }
  if (typeof notice?.content === 'string') {
    return notice.content.split('\n')[0] || '';
  }
  return '';
};

export default function P2PBuyerNoticePage() {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchNotices = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch('/api/notice/getActive?limit=100');
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || '공지사항을 불러오지 못했습니다.');
        }
        if (active) {
          setNotices(Array.isArray(data?.result) ? data.result : []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : '공지사항을 불러오지 못했습니다.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchNotices();
    return () => {
      active = false;
    };
  }, []);

  const visibleNotices = useMemo(() => notices.filter((item) => item?.title), [notices]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black sm:bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#f0f0f3_45%,#dadce1_100%)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-0 pt-6 pb-0 sm:px-5 sm:py-10">
        <main className="flex flex-1 flex-col overflow-hidden bg-white sm:rounded-[32px] sm:border sm:border-black/10 sm:shadow-[0_34px_90px_-50px_rgba(15,15,18,0.45)] sm:ring-1 sm:ring-black/10">
          <div className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
            <header className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">공지사항</h1>
                <button
                  type="button"
                  onClick={() => router.push(`/${lang}/p2p-buyer`)}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/60"
                >
                  뒤로
                </button>
              </div>
              <p className="text-sm text-black/60">
                최신 공지사항을 한눈에 확인하세요.
              </p>
            </header>

            <section className="grid gap-3">
              {loading && (
                <div className="rounded-2xl border border-black/10 bg-white/80 px-4 py-6 text-center text-sm text-black/60">
                  공지사항을 불러오는 중입니다.
                </div>
              )}
              {!loading && errorMessage && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-600">
                  {errorMessage}
                </div>
              )}
              {!loading && !errorMessage && visibleNotices.length === 0 && (
                <div className="rounded-2xl border border-black/10 bg-white/80 px-4 py-6 text-center text-sm text-black/60">
                  등록된 공지사항이 없습니다.
                </div>
              )}
              {!loading &&
                !errorMessage &&
                visibleNotices.map((notice) => {
                  const id = String(notice?._id ?? notice?.id ?? '');
                  const dateSource = notice?.publishedAt || notice?.createdAt;
                  const dateLabel = dateSource ? String(dateSource).slice(0, 10) : '';
                  const summary = resolveSummary(notice);
                  return (
                    <Link
                      key={id}
                      href={`/${lang}/notice/${id}`}
                      className="rounded-2xl border border-black/10 bg-white/90 px-4 py-4 text-black shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] transition hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.3)]"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs text-black/50">
                        <span>{dateLabel}</span>
                        <span>자세히 보기</span>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold">{notice.title}</h2>
                      {summary && (
                        <p className="mt-2 text-sm text-black/60 line-clamp-2">{summary}</p>
                      )}
                    </Link>
                  );
                })}
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
                    <Link href={`/${lang}/p2p-buyer/terms-of-service`} className="px-2 hover:text-white">
                      이용약관
                    </Link>
                    <span className="text-[#566072]">|</span>
                    <Link href={`/${lang}/p2p-buyer/privacy-policy`} className="px-2 hover:text-white">
                      개인정보처리방침
                    </Link>
                    <span className="text-[#566072]">|</span>
                    <Link href={`/${lang}/p2p-buyer/refund-policy`} className="px-2 hover:text-white">
                      환불 분쟁 정책
                    </Link>
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
