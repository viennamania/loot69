'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AppBarComponent from '@/components/Appbar/AppBar';

const POLICY_CONFIG = [
  { slug: 'terms-of-service', label: '이용약관', description: '서비스 이용 조건과 책임 범위를 안내합니다.' },
  { slug: 'privacy-policy', label: '개인정보처리방침', description: '개인정보 수집·이용·보관 정책을 안내합니다.' },
  { slug: 'refund-policy', label: '환불·분쟁 정책', description: '환불/분쟁 처리 절차와 기준을 안내합니다.' },
];

type PolicyForm = {
  slug: string;
  title: string;
  content: string;
  updatedAt?: string;
};

const createEmptyForms = () =>
  POLICY_CONFIG.reduce<Record<string, PolicyForm>>((acc, policy) => {
    acc[policy.slug] = { slug: policy.slug, title: policy.label, content: '' };
    return acc;
  }, {});

export default function PolicyAdminPage() {
  const params = useParams();
  const langParam = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  const adminHomeHref = `/${langParam ?? 'ko'}/administration`;
  const [forms, setForms] = useState<Record<string, PolicyForm>>(createEmptyForms);
  const [loading, setLoading] = useState(false);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/policy/getAll');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      const nextForms = createEmptyForms();
      (Array.isArray(data?.result) ? data.result : []).forEach((item: any) => {
        if (!item?.slug || !nextForms[item.slug]) return;
        nextForms[item.slug] = {
          slug: item.slug,
          title: item.title || nextForms[item.slug].title,
          content: Array.isArray(item.content) ? item.content.join('\n') : item.content || '',
          updatedAt: item.updatedAt || item.createdAt,
        };
      });
      setForms(nextForms);
    } catch (error) {
      toast.error('정책 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const updateForm = (slug: string, updates: Partial<PolicyForm>) => {
    setForms((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], ...updates },
    }));
  };

  const savePolicy = async (slug: string) => {
    const form = forms[slug];
    if (!form?.title.trim()) {
      toast.error('제목을 입력하세요.');
      return;
    }
    if (!form?.content.trim()) {
      toast.error('내용을 입력하세요.');
      return;
    }

    setSavingSlug(slug);
    try {
      const response = await fetch('/api/policy/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title: form.title.trim(),
          content: form.content.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      toast.success('정책이 저장되었습니다.');
      fetchPolicies();
    } catch (error) {
      toast.error('정책 저장에 실패했습니다.');
    } finally {
      setSavingSlug(null);
    }
  };

  const activeForms = useMemo(() => POLICY_CONFIG.map((policy) => forms[policy.slug]), [forms]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppBarComponent />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-20 pt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icon-admin.png" alt="Policy" width={32} height={32} className="h-8 w-8" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Policy</p>
                <h1 className="text-xl font-bold text-slate-900">정책 페이지 관리</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={adminHomeHref}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                관리자 홈
              </Link>
              <button
                onClick={fetchPolicies}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                새로고침
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            이용약관/개인정보처리방침/환불·분쟁 정책을 관리합니다. 각 정책은 공개 페이지에 즉시 반영됩니다.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
              정책 정보를 불러오는 중입니다.
            </div>
          )}

          {activeForms.map((form) => {
            const meta = POLICY_CONFIG.find((policy) => policy.slug === form.slug);
            return (
              <div key={form.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{meta?.label}</h2>
                    <p className="text-xs text-slate-500">{meta?.description}</p>
                  </div>
                  {form.updatedAt && (
                    <span className="text-xs font-semibold text-slate-400">
                      최근 수정: {String(form.updatedAt).slice(0, 10)}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">제목</label>
                    <input
                      value={form.title}
                      onChange={(event) => updateForm(form.slug, { title: event.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder={`${meta?.label} 제목`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">내용</label>
                    <textarea
                      value={form.content}
                      onChange={(event) => updateForm(form.slug, { content: event.target.value })}
                      className="mt-1 min-h-[200px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="줄바꿈으로 구분해 입력하세요"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => savePolicy(form.slug)}
                      disabled={savingSlug === form.slug}
                      className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {savingSlug === form.slug ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
