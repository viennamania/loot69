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
  description: '',
  image: '',
  link: '',
  placement: 'p2p-home',
  order: 0,
  isActive: true,
};

type GlobalAdForm = typeof EMPTY_FORM;

type GlobalAd = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  placement?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

const PLACEMENT_OPTIONS = [
  { value: 'p2p-home', label: 'P2P 홈' },
  { value: 'buyer-guide', label: '구매자 가이드' },
  { value: 'seller-guide', label: '판매자 가이드' },
];

const PLACEMENT_DESCRIPTIONS: Record<string, string> = {
  'p2p-home': 'P2P 홈 상단/중앙 제휴 배너 영역에 노출됩니다.',
  'buyer-guide': '구매자 가이드 페이지의 제휴 배너 영역에 노출됩니다.',
  'seller-guide': '판매자 가이드 페이지의 제휴 배너 영역에 노출됩니다.',
};

export default function BannerAdminPage() {
  const params = useParams();
  const langParam = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  const adminHomeHref = `/${langParam ?? 'ko'}/administration`;
  const [form, setForm] = useState<GlobalAdForm>({ ...EMPTY_FORM });
  const [ads, setAds] = useState<GlobalAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterPlacement, setFilterPlacement] = useState('p2p-home');

  const isEditing = Boolean(form.id);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/globalAd/getAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement: filterPlacement || undefined,
          limit: 200,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      setAds(Array.isArray(data?.result) ? data.result : []);
    } catch (error) {
      toast.error('배너 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPlacement]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, placement: filterPlacement || 'p2p-home' }));
  }, [filterPlacement]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, placement: filterPlacement || 'p2p-home' });
  };

  const submitForm = async () => {
    if (!form.title.trim()) {
      toast.error('제목을 입력하세요.');
      return;
    }
    if (!form.image.trim()) {
      toast.error('배너 이미지를 업로드하세요.');
      return;
    }
    if (!form.link.trim()) {
      toast.error('링크 URL을 입력하세요.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/globalAd/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id || undefined,
          title: form.title.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
          link: form.link.trim(),
          placement: form.placement.trim() || 'p2p-home',
          order: Number(form.order) || 0,
          isActive: form.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      toast.success(isEditing ? '배너가 수정되었습니다.' : '배너가 추가되었습니다.');
      resetForm();
      fetchAds();
    } catch (error) {
      toast.error('배너 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (file.size / 1024 / 1024 > 10) {
      toast.error('이미지 파일은 10MB 이하로 업로드해주세요.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'content-type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!response.ok) {
        throw new Error('FAILED_TO_UPLOAD');
      }
      const data = await response.json();
      if (!data?.url) {
        throw new Error('NO_URL');
      }
      setForm((prev) => ({ ...prev, image: data.url }));
      toast.success('이미지가 업로드되었습니다.');
    } catch (error) {
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const onEdit = (ad: GlobalAd) => {
    setForm({
      id: ad._id || ad.id || '',
      title: ad.title || '',
      description: ad.description || '',
      image: ad.image || '',
      link: ad.link || '',
      placement: ad.placement || 'p2p-home',
      order: Number(ad.order) || 0,
      isActive: ad.isActive !== false,
    });
  };

  const onDelete = async (ad: GlobalAd) => {
    if (!ad._id) return;
    if (!confirm('해당 배너를 삭제할까요?')) return;

    try {
      const response = await fetch('/api/globalAd/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad._id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'FAILED');
      }
      toast.success('배너가 삭제되었습니다.');
      fetchAds();
    } catch (error) {
      toast.error('배너 삭제에 실패했습니다.');
    }
  };

  const toggleActive = async (ad: GlobalAd) => {
    if (!ad._id) return;
    try {
      await fetch('/api/globalAd/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ad._id,
          title: ad.title || '',
          description: ad.description || '',
          image: ad.image || '',
          link: ad.link || '',
          placement: ad.placement || 'p2p-home',
          order: Number(ad.order) || 0,
          isActive: !(ad.isActive !== false),
        }),
      });
      fetchAds();
    } catch (error) {
      toast.error('활성 상태 변경에 실패했습니다.');
    }
  };

  const previewImage = useMemo(() => form.image.trim(), [form.image]);
  const selectedPlacement =
    PLACEMENT_OPTIONS.find((option) => option.value === filterPlacement) ?? PLACEMENT_OPTIONS[0];
  const selectedPlacementDescription = PLACEMENT_DESCRIPTIONS[selectedPlacement.value] ?? '';

  return (
    <main className="min-h-screen bg-slate-50">
      <AppBarComponent />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-20 pt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icon-admin.png" alt="Banner" width={32} height={32} className="h-8 w-8" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">P2P Banner</p>
                <h1 className="text-xl font-bold text-slate-900">제휴 배너 관리</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={adminHomeHref}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                관리자 홈
              </Link>
              <label className="text-xs font-semibold text-slate-500">플레이스먼트</label>
              <select
                value={filterPlacement}
                onChange={(event) => setFilterPlacement(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                {PLACEMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchAds}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                새로고침
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            플레이스먼트는 배너가 노출될 위치를 의미합니다. 선택한 위치에만 배너가 노출되며,
            이미지는 가로형(2:1 권장)을 업로드하세요.
          </p>
          <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-700">
            <span className="font-semibold">현재 플레이스먼트:</span> {selectedPlacement.label}
            {selectedPlacementDescription ? ` · ${selectedPlacementDescription}` : ''}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-900">배너 목록</h2>
              <p className="text-xs text-slate-500">
                현재 플레이스먼트: {selectedPlacement.label}
                {selectedPlacementDescription ? ` · ${selectedPlacementDescription}` : ''}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  배너 목록을 불러오는 중입니다.
                </div>
              ) : ads.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  등록된 배너가 없습니다.
                </div>
              ) : (
                ads.map((ad) => (
                  <div
                    key={ad._id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {ad.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ad.image} alt={ad.title || 'banner'} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No Image</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ad.title || '제목 없음'}</p>
                        <p className="text-xs text-slate-500">{ad.description || '설명 없음'}</p>
                        <p className="text-xs text-slate-400">{ad.placement || 'p2p-home'} · order {ad.order ?? 0}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={() => toggleActive(ad)}
                        className={`rounded-full px-3 py-1 font-semibold ${
                          ad.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ad.isActive !== false ? '활성' : '비활성'}
                      </button>
                      <button
                        onClick={() => onEdit(ad)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700"
                      >
                        수정하기
                      </button>
                      <button
                        onClick={() => onDelete(ad)}
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
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-900">{isEditing ? '배너 수정' : '배너 추가'}</h2>
              <p className="text-xs text-slate-500">
                현재 플레이스먼트: {selectedPlacement.label}
                {selectedPlacementDescription ? ` · ${selectedPlacementDescription}` : ''}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">제목</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="예: Binance Pay"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">설명</label>
                <input
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="예: 글로벌 파트너 결제 지원"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">배너 이미지</label>
                <div className="mt-2 flex flex-col gap-3">
                  <label className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    {uploading ? '업로드 중...' : previewImage ? '이미지 변경하기' : '이미지 업로드'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file || uploading) return;
                        handleImageUpload(file);
                        event.currentTarget.value = '';
                      }}
                    />
                  </label>
                  {previewImage ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewImage} alt="preview" className="h-32 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                      업로드한 이미지가 여기에 표시됩니다.
                    </div>
                  )}
                  {previewImage ? (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                      className="w-fit rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600"
                    >
                      이미지 제거하기
                    </button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">링크 URL</label>
                <input
                  value={form.link}
                  onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="https://partner.com"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500">정렬 순서</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={submitForm}
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? '저장 중...' : isEditing ? '배너 수정하기' : '배너 추가하기'}
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
