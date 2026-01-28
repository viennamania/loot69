'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AppBarComponent from '@/components/Appbar/AppBar';

const EMPTY_FORM = {
  id: '',
  title: '',
  summary: '',
  content: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  order: 0,
  isPinned: false,
  isActive: true,
};

type NoticeForm = typeof EMPTY_FORM;

type NoticeItem = {
  _id?: string;
  id?: string;
  title?: string;
  summary?: string;
  content?: string[] | string;
  publishedAt?: string;
  order?: number;
  isPinned?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const formatDate = (value?: string) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export default function NoticeAdminPage() {
  const params = useParams();
  const langParam = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  const adminHomeHref = `/${langParam ?? 'ko'}/administration`;
  const [form, setForm] = useState<NoticeForm>({ ...EMPTY_FORM });
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(form.id);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notice/getAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 200 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      setNotices(Array.isArray(data?.result) ? data.result : []);
    } catch (error) {
      toast.error('공지사항 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, publishedAt: new Date().toISOString().slice(0, 10) });
  };

  const submitForm = async () => {
    if (!form.title.trim()) {
      toast.error('제목을 입력하세요.');
      return;
    }
    if (!form.content.trim()) {
      toast.error('내용을 입력하세요.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/notice/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id || undefined,
          title: form.title.trim(),
          summary: form.summary.trim(),
          content: form.content.trim(),
          publishedAt: form.publishedAt,
          order: Number(form.order) || 0,
          isPinned: form.isPinned,
          isActive: form.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      toast.success(isEditing ? '공지사항이 수정되었습니다.' : '공지사항이 추가되었습니다.');
      resetForm();
      fetchNotices();
    } catch (error) {
      toast.error('공지사항 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (notice: NoticeItem) => {
    const contentValue = Array.isArray(notice.content)
      ? notice.content.join('\n')
      : notice.content || '';
    setForm({
      id: notice._id || notice.id || '',
      title: notice.title || '',
      summary: notice.summary || '',
      content: contentValue,
      publishedAt: formatDate(notice.publishedAt || notice.createdAt) || new Date().toISOString().slice(0, 10),
      order: Number(notice.order) || 0,
      isPinned: notice.isPinned === true,
      isActive: notice.isActive !== false,
    });
  };

  const onDelete = async (notice: NoticeItem) => {
    if (!notice._id) return;
    if (!confirm('해당 공지사항을 삭제할까요?')) return;
    try {
      const response = await fetch('/api/notice/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notice._id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      toast.success('공지사항이 삭제되었습니다.');
      fetchNotices();
    } catch (error) {
      toast.error('공지사항 삭제에 실패했습니다.');
    }
  };

  const toggleActive = async (notice: NoticeItem) => {
    if (!notice._id) return;
    try {
      const publishedAt = notice.publishedAt || notice.createdAt;
      await fetch('/api/notice/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notice._id,
          title: notice.title || '',
          summary: notice.summary || '',
          content: notice.content || [],
          publishedAt,
          order: Number(notice.order) || 0,
          isPinned: notice.isPinned === true,
          isActive: !(notice.isActive !== false),
        }),
      });
      fetchNotices();
    } catch (error) {
      toast.error('활성 상태 변경에 실패했습니다.');
    }
  };

  const togglePinned = async (notice: NoticeItem) => {
    if (!notice._id) return;
    try {
      const publishedAt = notice.publishedAt || notice.createdAt;
      await fetch('/api/notice/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notice._id,
          title: notice.title || '',
          summary: notice.summary || '',
          content: notice.content || [],
          publishedAt,
          order: Number(notice.order) || 0,
          isPinned: !(notice.isPinned === true),
          isActive: notice.isActive !== false,
        }),
      });
      fetchNotices();
    } catch (error) {
      toast.error('고정 상태 변경에 실패했습니다.');
    }
  };

  const previewSummary = useMemo(() => form.summary || form.content.split('\n')[0] || '', [form.summary, form.content]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppBarComponent />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-20 pt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icon-admin.png" alt="Notice" width={32} height={32} className="h-8 w-8" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Notice</p>
                <h1 className="text-xl font-bold text-slate-900">공지사항 관리</h1>
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
                onClick={fetchNotices}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                새로고침
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            공지사항은 활성화 상태인 항목만 사용자 화면에 노출됩니다. 상단 고정과 정렬 순서를 설정할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">공지 목록</h2>
            <div className="mt-4 flex flex-col gap-3">
              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  공지사항을 불러오는 중입니다.
                </div>
              ) : notices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  등록된 공지사항이 없습니다.
                </div>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice._id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{notice.title || '제목 없음'}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(notice.publishedAt || notice.createdAt)} · order {notice.order ?? 0}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          onClick={() => togglePinned(notice)}
                          className={`rounded-full px-3 py-1 font-semibold ${
                            notice.isPinned ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {notice.isPinned ? '상단 고정' : '고정 해제'}
                        </button>
                        <button
                          onClick={() => toggleActive(notice)}
                          className={`rounded-full px-3 py-1 font-semibold ${
                            notice.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {notice.isActive !== false ? '활성' : '비활성'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{notice.summary || '요약 없음'}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={() => onEdit(notice)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700"
                      >
                        수정하기
                      </button>
                      <button
                        onClick={() => onDelete(notice)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600"
                      >
                        삭제하기
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{isEditing ? '공지 수정' : '공지 추가'}</h2>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">제목</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="예: 공지사항 제목"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">요약</label>
                <input
                  value={form.summary}
                  onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="요약을 입력하세요 (비워두면 첫 줄이 요약으로 사용됩니다)"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">내용</label>
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                  className="mt-1 min-h-[160px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="내용을 줄바꿈으로 구분해 입력하세요"
                />
                <p className="mt-2 text-xs text-slate-500">
                  요약 미입력 시 첫 번째 줄: {previewSummary || '미리보기 없음'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500">게시 날짜</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">정렬 순서</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(event) => setForm((prev) => ({ ...prev, isPinned: event.target.checked }))}
                  />
                  상단 고정
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  활성화
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={submitForm}
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? '저장 중...' : isEditing ? '공지 수정하기' : '공지 추가하기'}
                </button>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    새로 작성하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
