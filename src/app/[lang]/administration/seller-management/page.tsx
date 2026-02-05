'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

export default function SellerManagementPage() {
  const params = useParams<{ lang?: string }>();
  const router = useRouter();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam || 'ko';

  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/getAllUsersByStorecode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: '',
          limit: 200,
          page: 1,
        }),
      });
      const data = await response.json();
      const users = data?.result?.users || [];
      const sellerUsers = users.filter((user: any) => Boolean(user?.seller));
      sellerUsers.sort((a: any, b: any) => {
        const aTime = new Date(a?.seller?.kyc?.submittedAt || 0).getTime();
        const bTime = new Date(b?.seller?.kyc?.submittedAt || 0).getTime();
        return bTime - aTime;
      });
      setSellers(sellerUsers);
    } catch (error) {
      console.error('Error fetching sellers', error);
      setSellers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  return (
    <main className="p-4 min-h-[100vh] flex items-start justify-center container max-w-screen-lg mx-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      <div className="w-full">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full border border-slate-200/70 bg-white/90 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Image src="/icon-back.png" alt="Back" width={20} height={20} className="rounded-full" />
          </button>
          <span className="font-semibold">판매자 관리</span>
        </div>

        <div className="w-full rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Image src="/icon-seller.png" alt="Seller" width={24} height={24} className="h-6 w-6" />
              <h2 className="text-lg font-bold text-slate-900">판매자 목록</h2>
            </div>
            <span className="text-sm font-semibold text-slate-600">{sellers.length} 명</span>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Image src="/icon-loading.png" alt="Loading" width={18} height={18} className="h-4 w-4 animate-spin" />
                판매자 목록을 불러오는 중입니다.
              </div>
            ) : sellers.length === 0 ? (
              <div className="text-sm text-slate-500">판매자 정보가 있는 회원이 없습니다.</div>
            ) : (
              <table className="min-w-full border-collapse border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">프로필</th>
                    <th className="px-4 py-2 text-left">지갑주소</th>
                    <th className="px-4 py-2 text-left">상태</th>
                    <th className="px-4 py-2 text-left">활동 상태</th>
                    <th className="px-4 py-2 text-left">계좌정보</th>
                    <th className="px-4 py-2 text-left">계좌정보 신청시간</th>
                    <th className="px-4 py-2 text-left">KYC</th>
                    <th className="px-4 py-2 text-left">KYC 신청시간</th>
                    <th className="px-4 py-2 text-left">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((sellerUser, index) => {
                    const sellerStatus = sellerUser?.seller?.status;
                    const normalizedSellerStatus = sellerStatus === 'confirmed' ? 'confirmed' : 'pending';
                    const kycStatus =
                      sellerUser?.seller?.kyc?.status ||
                      (sellerUser?.seller?.kyc?.idImageUrl ? 'pending' : 'none');
                    const bankInfo = sellerUser?.seller?.bankInfo;
                    const bankInfoStatus =
                      bankInfo?.status || (bankInfo?.accountNumber ? 'pending' : 'none');
                    const bankInfoLabel =
                      bankInfoStatus === 'approved'
                        ? '승인완료'
                        : bankInfoStatus === 'rejected'
                        ? '거절'
                        : bankInfoStatus === 'pending'
                        ? '심사중'
                        : '미제출';
                    const bankName = bankInfo?.bankName || '-';
                    const maskedAccount = bankInfo?.accountNumber
                      ? `${bankInfo.accountNumber.slice(0, 3)}****${bankInfo.accountNumber.slice(-2)}`
                      : '-';
                    const bankInfoSubmittedAt = bankInfo?.submittedAt;
                    const kycSubmittedAt = sellerUser?.seller?.kyc?.submittedAt;
                    const avatar = sellerUser?.avatar || '/profile-default.png';
                    const initials = (sellerUser?.nickname || sellerUser?.walletAddress || 'NA')
                      .replace(/^0x/i, '')
                      .slice(0, 2)
                      .toUpperCase();
                    const isEnabled = Boolean(sellerUser?.seller?.enabled);
                    return (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-white">
                              {sellerUser?.avatar ? (
                                <Image
                                  src={avatar}
                                  alt="Profile"
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-semibold tracking-[0.12em]">
                                  {initials}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900">{sellerUser?.nickname || '-'}</span>
                              <span className="text-[11px] text-slate-500">{initials}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-slate-700 text-xs">
                          {sellerUser?.walletAddress?.substring(0, 6)}...
                          {sellerUser?.walletAddress?.substring(sellerUser?.walletAddress.length - 4)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex min-w-[160px] items-center justify-center rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm ${
                              normalizedSellerStatus === 'confirmed'
                                ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200/80 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {normalizedSellerStatus === 'confirmed' ? '판매가능상태' : '판매불가능상태'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex min-w-[120px] items-center justify-center rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm ${
                              isEnabled
                                ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200/80 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {isEnabled ? '활동중' : '중지'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex w-fit items-center rounded-full border px-2 py-1 text-xs font-semibold ${
                                bankInfoStatus === 'approved'
                                  ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                                  : bankInfoStatus === 'rejected'
                                  ? 'border-rose-200/80 bg-rose-50 text-rose-700'
                                  : bankInfoStatus === 'pending'
                                  ? 'border-amber-200/80 bg-amber-50 text-amber-700'
                                  : 'border-slate-200/80 bg-slate-50 text-slate-600'
                              }`}
                            >
                              {bankInfoLabel}
                            </span>
                            <span className="text-xs text-slate-600">{bankName}</span>
                            <span className="text-xs text-slate-500">{maskedAccount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-600">
                          {bankInfoSubmittedAt ? new Date(bankInfoSubmittedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${
                              kycStatus === 'approved'
                                ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                                : kycStatus === 'rejected'
                                ? 'border-rose-200/80 bg-rose-50 text-rose-700'
                                : kycStatus === 'pending'
                                ? 'border-amber-200/80 bg-amber-50 text-amber-700'
                                : 'border-slate-200/80 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {kycStatus === 'approved'
                              ? '승인완료'
                              : kycStatus === 'rejected'
                              ? '거절'
                              : kycStatus === 'pending'
                              ? '심사중'
                              : '미제출'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-600">
                          {kycSubmittedAt ? new Date(kycSubmittedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => {
                              router.push(`/${lang}/administration/seller/${sellerUser.walletAddress}?storecode=${sellerUser.storecode || ''}`);
                            }}
                            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
