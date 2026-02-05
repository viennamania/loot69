'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

type SellerStatus = 'pending' | 'confirmed' | 'rejected' | undefined;
type SellerStatusValue = 'pending' | 'confirmed';
type KycStatus = 'pending' | 'approved' | 'rejected' | 'none' | undefined;

export default function SellerDetailPage() {
  const params = useParams<{ lang?: string; walletAddress?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const storecode = searchParams.get('storecode') || 'admin';
  const walletAddressParam = Array.isArray(params?.walletAddress)
    ? params?.walletAddress?.[0]
    : params?.walletAddress;
  const walletAddress = walletAddressParam || '';

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState<'approve' | 'reject' | null>(null);
  const [bankDecisionLoading, setBankDecisionLoading] = useState<'approve' | 'reject' | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [togglingEnabled, setTogglingEnabled] = useState(false);
  const [selectedSellerStatus, setSelectedSellerStatus] = useState<SellerStatusValue>('pending');
  const rejectionReasons = [
    '신분증 식별 불가',
    '정보 불일치',
    '사진 품질 불량',
    '타인 신분증 의심',
    '유효기간 만료',
    '얼굴/정보 가림',
    '서류 종류 불일치',
    '중복 제출',
    '기타',
  ];
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const bankRejectionReasons = [
    '예금주 불일치',
    '계좌번호 오류',
    '은행 정보 누락',
    '서류 불충분',
    '기타',
  ];
  const [selectedBankRejectionReason, setSelectedBankRejectionReason] = useState('');
  const [customBankRejectionReason, setCustomBankRejectionReason] = useState('');

  const fetchUser = async () => {
    if (!walletAddress) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/user/getUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode,
          walletAddress,
        }),
      });
      const data = await response.json();
      setUser(data?.result || null);
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, storecode]);

  useEffect(() => {
    if (user?.seller?.kyc?.rejectionReason) {
      setSelectedRejectionReason(user.seller.kyc.rejectionReason);
      if (!rejectionReasons.includes(user.seller.kyc.rejectionReason)) {
        setSelectedRejectionReason('기타');
        setCustomRejectionReason(user.seller.kyc.rejectionReason);
      }
    }
    if (user?.seller?.bankInfo?.rejectionReason) {
      setSelectedBankRejectionReason(user.seller.bankInfo.rejectionReason);
      if (!bankRejectionReasons.includes(user.seller.bankInfo.rejectionReason)) {
        setSelectedBankRejectionReason('기타');
        setCustomBankRejectionReason(user.seller.bankInfo.rejectionReason);
      }
    }
  }, [user]);

  const seller = user?.seller || {};
  const sellerStatus: SellerStatus = seller?.status;
  const kycStatus: KycStatus = seller?.kyc?.status || (seller?.kyc?.idImageUrl ? 'pending' : 'none');
  const kycImageUrl = seller?.kyc?.idImageUrl;
  const bankInfoStatus: KycStatus =
    seller?.bankInfo?.status || (seller?.bankInfo?.accountNumber ? 'pending' : 'none');
  const normalizedSellerStatus: SellerStatusValue = sellerStatus === 'confirmed' ? 'confirmed' : 'pending';
  const isEnabled = Boolean(seller?.enabled);

  const buildStatusHistory = (nextStatus: SellerStatusValue, reason: string) => {
    const previousStatus = seller?.status || 'pending';
    if (previousStatus === nextStatus) {
      return seller?.statusHistory || [];
    }
    return [
      ...(seller?.statusHistory || []),
      {
        from: previousStatus,
        to: nextStatus,
        changedAt: new Date().toISOString(),
        changedBy: '관리자',
        reason,
      },
    ];
  };

  useEffect(() => {
    setSelectedSellerStatus(normalizedSellerStatus);
  }, [normalizedSellerStatus]);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!walletAddress || !seller) {
      return;
    }
    if (decision === 'rejected' && !selectedRejectionReason) {
      toast.error('거절 사유를 선택해 주세요.');
      return;
    }
    if (decision === 'rejected' && selectedRejectionReason === '기타' && !customRejectionReason.trim()) {
      toast.error('기타 사유를 입력해 주세요.');
      return;
    }
    setDecisionLoading(decision === 'approved' ? 'approve' : 'reject');
    try {
      const nextSellerStatus =
        decision === 'approved' && bankInfoStatus === 'approved' ? 'confirmed' : 'pending';
      const finalRejectionReason =
        decision === 'rejected'
          ? selectedRejectionReason === '기타'
            ? customRejectionReason.trim()
            : selectedRejectionReason
          : '';
      const updatedSeller = {
        ...seller,
        status: nextSellerStatus,
        statusHistory: buildStatusHistory(nextSellerStatus, '신분증 심사'),
        kyc: {
          ...(seller?.kyc || {}),
          status: decision,
          reviewedAt: new Date().toISOString(),
          rejectionReason: finalRejectionReason,
        },
      };

      await fetch('/api/user/updateSellerInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: user?.storecode || storecode,
          walletAddress,
          sellerStatus: nextSellerStatus,
          bankName: seller?.bankInfo?.bankName || '',
          accountNumber: seller?.bankInfo?.accountNumber || '',
          accountHolder: seller?.bankInfo?.accountHolder || '',
          seller: updatedSeller,
        }),
      });

      toast.success(decision === 'approved' ? '승인 완료되었습니다.' : '거절 처리되었습니다.');
      await fetchUser();
    } catch (error) {
      console.error('Decision failed', error);
      toast.error('처리에 실패했습니다.');
    }
    setDecisionLoading(null);
  };

  const handleBankDecision = async (decision: 'approved' | 'rejected') => {
    if (!walletAddress || !seller) {
      return;
    }
    if (decision === 'rejected' && !selectedBankRejectionReason) {
      toast.error('거절 사유를 선택해 주세요.');
      return;
    }
    if (decision === 'rejected' && selectedBankRejectionReason === '기타' && !customBankRejectionReason.trim()) {
      toast.error('기타 사유를 입력해 주세요.');
      return;
    }
    setBankDecisionLoading(decision === 'approved' ? 'approve' : 'reject');
    try {
      const nextSellerStatus =
        decision === 'approved' && kycStatus === 'approved' ? 'confirmed' : 'pending';
      const finalReason =
        decision === 'rejected'
          ? selectedBankRejectionReason === '기타'
            ? customBankRejectionReason.trim()
            : selectedBankRejectionReason
          : '';
      const updatedSeller = {
        ...seller,
        status: nextSellerStatus,
        statusHistory: buildStatusHistory(nextSellerStatus, '계좌 심사'),
        bankInfo: {
          ...(seller?.bankInfo || {}),
          status: decision,
          reviewedAt: new Date().toISOString(),
          rejectionReason: finalReason,
        },
      };

      await fetch('/api/user/updateSellerInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: user?.storecode || storecode,
          walletAddress,
          sellerStatus: nextSellerStatus,
          bankName: seller?.bankInfo?.bankName || '',
          accountNumber: seller?.bankInfo?.accountNumber || '',
          accountHolder: seller?.bankInfo?.accountHolder || '',
          seller: updatedSeller,
        }),
      });

      toast.success(decision === 'approved' ? '계좌 승인 완료되었습니다.' : '계좌 거절 처리되었습니다.');
      await fetchUser();
    } catch (error) {
      console.error('Bank decision failed', error);
      toast.error('처리에 실패했습니다.');
    }
    setBankDecisionLoading(null);
  };

  const handleStatusUpdate = async () => {
    if (!walletAddress || !seller) {
      return;
    }
    setStatusUpdating(true);
    try {
      const nextStatus = selectedSellerStatus || 'pending';
      const updatedSeller = {
        ...seller,
        status: nextStatus,
        statusHistory: buildStatusHistory(nextStatus, '관리자 수동 변경'),
      };
      await fetch('/api/user/updateSellerInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: user?.storecode || storecode,
          walletAddress,
          sellerStatus: nextStatus,
          bankName: seller?.bankInfo?.bankName || '',
          accountNumber: seller?.bankInfo?.accountNumber || '',
          accountHolder: seller?.bankInfo?.accountHolder || '',
          seller: updatedSeller,
        }),
      });
      toast.success('판매자 상태가 변경되었습니다.');
      await fetchUser();
    } catch (error) {
      console.error('Status update failed', error);
      toast.error('상태 변경에 실패했습니다.');
    }
    setStatusUpdating(false);
  };

  const toggleSellerEnabled = async () => {
    if (!walletAddress || !seller) return;
    setTogglingEnabled(true);
    try {
      await fetch('/api/user/updateSellerEnabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storecode: user?.storecode || storecode,
          walletAddress,
          sellerEnabled: !isEnabled,
        }),
      });
      toast.success(!isEnabled ? '판매자 활동을 활성화했습니다.' : '판매자 활동을 중지했습니다.');
      await fetchUser();
    } catch (error) {
      console.error('Toggle seller enabled failed', error);
      toast.error('활동 상태 변경에 실패했습니다.');
    }
    setTogglingEnabled(false);
  };

  return (
    <main className="p-4 min-h-[100vh] flex items-start justify-center container max-w-screen-md mx-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      <div className="w-full">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full border border-slate-200/70 bg-white/90 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Image src="/icon-back.png" alt="Back" width={20} height={20} className="rounded-full" />
          </button>
          <span className="font-semibold">판매자 상세</span>
        </div>

        {loading ? (
          <div className="w-full rounded-2xl border border-slate-200/80 bg-white/95 p-6 text-sm text-slate-600 shadow-sm">
            판매자 정보를 불러오는 중입니다.
          </div>
        ) : !user ? (
          <div className="w-full rounded-2xl border border-rose-200/80 bg-rose-50/80 p-6 text-sm text-rose-700 shadow-sm">
            판매자 정보를 찾을 수 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={user?.avatar || '/icon-user.png'}
                      alt="Avatar"
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">회원아이디</span>
                      <span className="text-lg font-semibold text-slate-900">{user?.nickname || '-'}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex min-w-[160px] items-center justify-center rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm ${
                      normalizedSellerStatus === 'confirmed'
                        ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200/80 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {normalizedSellerStatus === 'confirmed' ? '판매가능상태' : '판매불가능상태'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-semibold">
                    활동 상태: {isEnabled ? '활동중' : '중지'}
                  </span>
                  <button
                    type="button"
                    onClick={toggleSellerEnabled}
                    disabled={togglingEnabled}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                      togglingEnabled
                        ? 'bg-slate-200 text-slate-400'
                        : isEnabled
                        ? 'bg-rose-600 text-white hover:bg-rose-500'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {togglingEnabled ? '변경중...' : isEnabled ? '활동 중지' : '활동 활성화'}
                  </button>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                  <span>지갑주소: {walletAddress}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">판매자 상태 변경</span>
                  <span className="text-xs text-slate-500">관리자 수동 변경</span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <select
                    className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 sm:w-56"
                    value={selectedSellerStatus}
                    onChange={(event) => setSelectedSellerStatus(event.target.value as SellerStatusValue)}
                  >
                    <option value="pending">판매불가능상태</option>
                    <option value="confirmed">판매가능상태</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={statusUpdating || selectedSellerStatus === normalizedSellerStatus}
                    className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                      statusUpdating || selectedSellerStatus === normalizedSellerStatus
                        ? 'bg-slate-200 text-slate-400'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {statusUpdating ? '변경 중...' : '상태 변경하기'}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">판매자 상태 변경 로그</span>
                <span className="text-xs text-slate-500">최신순</span>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                {(seller?.statusHistory || []).length === 0 ? (
                  <span className="text-xs text-slate-500">변경 기록이 없습니다.</span>
                ) : (
                  [...(seller?.statusHistory || [])]
                    .sort((a: any, b: any) => {
                      const aTime = new Date(a?.changedAt || 0).getTime();
                      const bTime = new Date(b?.changedAt || 0).getTime();
                      return bTime - aTime;
                    })
                    .map((entry: any, index: number) => (
                      (() => {
                        const toConfirmed = entry?.to === 'confirmed';
                        const fromConfirmed = entry?.from === 'confirmed';
                        const stateStyle = toConfirmed
                          ? {
                              badge: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
                              icon: (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ),
                              label: '판매가능상태',
                            }
                          : {
                              badge: 'border-amber-200/80 bg-amber-50 text-amber-700',
                              icon: (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M12 7v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  <circle cx="12" cy="17" r="1.5" fill="currentColor" />
                                </svg>
                              ),
                              label: '판매불가능상태',
                            };
                        const fromStyle = fromConfirmed
                          ? {
                              badge: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
                              label: '판매가능상태',
                            }
                          : {
                              badge: 'border-amber-200/80 bg-amber-50 text-amber-700',
                              label: '판매불가능상태',
                            };

                        return (
                      <div
                        key={`${entry?.changedAt || 'log'}-${index}`}
                        className="flex flex-col gap-1 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${fromStyle.badge}`}>
                            {fromStyle.label}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${stateStyle.badge}`}>
                            {stateStyle.icon}
                            {stateStyle.label}
                          </span>
                          <span className="text-slate-500">
                            {entry?.changedAt ? new Date(entry.changedAt).toLocaleString() : '-'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          변경자: {entry?.changedBy || '-'} · 사유: {entry?.reason || '-'} · 이전 상태:{' '}
                          {entry?.from === 'confirmed' ? '판매가능상태' : '판매불가능상태'}
                        </div>
                      </div>
                        );
                      })()
                    ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Image src="/icon-bank-check.png" alt="Bank" width={22} height={22} className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">입금 계좌 심사</span>
                    <span className="text-xs text-slate-500">
                      신청 시간: {seller?.bankInfo?.submittedAt ? new Date(seller.bankInfo.submittedAt).toLocaleString() : '-'}
                    </span>
                    {bankInfoStatus === 'approved' && (
                      <span className="text-xs text-emerald-600">
                        승인 시간: {seller?.bankInfo?.reviewedAt ? new Date(seller.bankInfo.reviewedAt).toLocaleString() : '-'}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                    bankInfoStatus === 'approved'
                      ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                      : bankInfoStatus === 'rejected'
                      ? 'border-rose-200/80 bg-rose-50 text-rose-700'
                      : bankInfoStatus === 'pending'
                      ? 'border-amber-200/80 bg-amber-50 text-amber-700'
                      : 'border-slate-200/80 bg-slate-50 text-slate-600'
                  }`}
                >
                  {bankInfoStatus === 'approved'
                    ? '승인완료'
                    : bankInfoStatus === 'rejected'
                    ? '거절'
                    : bankInfoStatus === 'pending'
                    ? '심사중'
                    : '미제출'}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
                {seller?.bankInfo?.bankName ? (
                  <>
                    <span>은행: {seller?.bankInfo?.bankName}</span>
                    <span>계좌번호: {seller?.bankInfo?.accountNumber}</span>
                    <span>예금주: {seller?.bankInfo?.accountHolder}</span>
                  </>
                ) : (
                  <span>등록된 계좌 정보가 없습니다.</span>
                )}
              </div>

              {seller?.bankInfo?.accountNumber && (
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-700">거절 사유 선택</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bankRejectionReasons.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => {
                          setSelectedBankRejectionReason(reason);
                          if (reason !== '기타') {
                            setCustomBankRejectionReason('');
                          }
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                          selectedBankRejectionReason === reason
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  {selectedBankRejectionReason === '기타' && (
                    <div className="mt-3">
                      <textarea
                        value={customBankRejectionReason}
                        onChange={(event) => setCustomBankRejectionReason(event.target.value)}
                        placeholder="기타 거절 사유를 입력해 주세요."
                        className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        rows={3}
                      />
                    </div>
                  )}
                  {seller?.bankInfo?.rejectionReason && (
                    <p className="mt-2 text-xs text-slate-500">
                      현재 사유: {seller.bankInfo.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleBankDecision('approved')}
                  disabled={bankDecisionLoading !== null || !seller?.bankInfo?.accountNumber}
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    bankDecisionLoading || !seller?.bankInfo?.accountNumber
                      ? 'bg-emerald-100 text-emerald-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {bankDecisionLoading === 'approve' ? '승인 처리중...' : '승인하기'}
                </button>
                <button
                  type="button"
                  onClick={() => handleBankDecision('rejected')}
                  disabled={
                    bankDecisionLoading !== null ||
                    !seller?.bankInfo?.accountNumber ||
                    !selectedBankRejectionReason ||
                    (selectedBankRejectionReason === '기타' && !customBankRejectionReason.trim())
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    bankDecisionLoading ||
                    !seller?.bankInfo?.accountNumber ||
                    !selectedBankRejectionReason ||
                    (selectedBankRejectionReason === '기타' && !customBankRejectionReason.trim())
                      ? 'bg-rose-100 text-rose-300'
                      : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  {bankDecisionLoading === 'reject' ? '거절 처리중...' : '거절하기'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Image src="/icon-kyc.png" alt="KYC" width={22} height={22} className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">신분증 심사</span>
                    <span className="text-xs text-slate-500">
                      신청 시간: {seller?.kyc?.submittedAt ? new Date(seller.kyc.submittedAt).toLocaleString() : '-'}
                    </span>
                    {kycStatus === 'approved' && (
                      <span className="text-xs text-emerald-600">
                        승인 시간: {seller?.kyc?.reviewedAt ? new Date(seller.kyc.reviewedAt).toLocaleString() : '-'}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
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
              </div>

              <div className="mt-4">
                {kycImageUrl ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={kycImageUrl} alt="KYC" className="h-72 w-full object-contain bg-slate-50" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
                    업로드된 신분증 사진이 없습니다.
                  </div>
                )}
              </div>

              {kycImageUrl && (
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-700">거절 사유 선택</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rejectionReasons.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => {
                          setSelectedRejectionReason(reason);
                          if (reason !== '기타') {
                            setCustomRejectionReason('');
                          }
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                          selectedRejectionReason === reason
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  {selectedRejectionReason === '기타' && (
                    <div className="mt-3">
                      <textarea
                        value={customRejectionReason}
                        onChange={(event) => setCustomRejectionReason(event.target.value)}
                        placeholder="기타 거절 사유를 입력해 주세요."
                        className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        rows={3}
                      />
                    </div>
                  )}
                  {seller?.kyc?.rejectionReason && (
                    <p className="mt-2 text-xs text-slate-500">
                      현재 사유: {seller.kyc.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDecision('approved')}
                  disabled={decisionLoading !== null || !kycImageUrl}
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    decisionLoading || !kycImageUrl
                      ? 'bg-emerald-100 text-emerald-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {decisionLoading === 'approve' ? '승인 처리중...' : '승인하기'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('rejected')}
                  disabled={
                    decisionLoading !== null ||
                    !kycImageUrl ||
                    !selectedRejectionReason ||
                    (selectedRejectionReason === '기타' && !customRejectionReason.trim())
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    decisionLoading ||
                    !kycImageUrl ||
                    !selectedRejectionReason ||
                    (selectedRejectionReason === '기타' && !customRejectionReason.trim())
                      ? 'bg-rose-100 text-rose-300'
                      : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  {decisionLoading === 'reject' ? '거절 처리중...' : '거절하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
