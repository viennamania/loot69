'use client';

import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import SendbirdProvider from '@sendbird/uikit-react/SendbirdProvider';
import GroupChannel from '@sendbird/uikit-react/GroupChannel';
import GroupChannelList from '@sendbird/uikit-react/GroupChannelList';

const SENDBIRD_APP_ID = process.env.NEXT_PUBLIC_SENDBIRD_APP_ID || process.env.SENDBIRD_APP_ID || '';
const ADMIN_CHAT_ID = 'lootManager';

const AdminSupportChatWidget = () => {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [adminChatOpen, setAdminChatOpen] = useState(false);
  const [adminChatView, setAdminChatView] = useState<'list' | 'chat'>('list');
  const [adminSessionToken, setAdminSessionToken] = useState<string | null>(null);
  const [adminChannelUrl, setAdminChannelUrl] = useState<string | null>(null);
  const [adminChatLoading, setAdminChatLoading] = useState(false);
  const [adminChatError, setAdminChatError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setIsAdmin(false);
      setLoadingAdmin(false);
      return;
    }
    let active = true;
    const fetchUser = async () => {
      setLoadingAdmin(true);
      try {
        const response = await fetch('/api/user/getUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storecode: 'admin', walletAddress: address }),
        });
        const data = await response.json();
        if (active) {
          setIsAdmin(data?.result?.role === 'admin');
        }
      } catch {
        if (active) {
          setIsAdmin(false);
        }
      } finally {
        if (active) {
          setLoadingAdmin(false);
        }
      }
    };
    fetchUser();
    return () => {
      active = false;
    };
  }, [address]);

  useEffect(() => {
    if (!isAdmin) {
      setAdminChatOpen(false);
      setAdminChatView('list');
      setAdminChannelUrl(null);
      setAdminSessionToken(null);
      setAdminChatError(null);
      setAdminChatLoading(false);
      return;
    }

    let active = true;
    const fetchSessionToken = async () => {
      setAdminChatLoading(true);
      setAdminChatError(null);
      try {
        const response = await fetch('/api/sendbird/session-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: ADMIN_CHAT_ID,
            nickname: '상담관리',
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || '상담관리 채팅 세션을 만들지 못했습니다.');
        }

        const data = (await response.json()) as { sessionToken?: string };
        if (!data.sessionToken) {
          throw new Error('세션 토큰이 비어 있습니다.');
        }

        if (active) {
          setAdminSessionToken(data.sessionToken);
        }
      } catch (error) {
        if (active) {
          const message =
            error instanceof Error ? error.message : '상담관리 채팅을 불러오지 못했습니다.';
          setAdminChatError(message);
        }
      } finally {
        if (active) {
          setAdminChatLoading(false);
        }
      }
    };

    fetchSessionToken();

    return () => {
      active = false;
    };
  }, [isAdmin]);

  if (loadingAdmin || !isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {adminChatOpen && (
        <div
          className="w-[360px] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.7)] backdrop-blur md:w-[520px] md:max-w-[75vw] lg:w-[720px] lg:max-w-[65vw] xl:w-[840px] xl:max-w-[60vw]"
          role="dialog"
          aria-label="상담관리 채팅 위젯"
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">상담관리</p>
              <p className="text-xs text-slate-500">Sendbird 채팅 관리</p>
            </div>
            <button
              type="button"
              onClick={() => setAdminChatOpen(false)}
              className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
            >
              닫기
            </button>
          </div>
          <div className="px-4 py-4 text-sm text-slate-700">
            {adminChatError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-xs text-amber-700">
                {adminChatError}
              </div>
            ) : !adminSessionToken ? (
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/90 px-3 py-3 text-xs text-slate-600">
                {adminChatLoading ? '채팅을 준비 중입니다.' : '채팅을 불러오는 중입니다.'}
              </div>
            ) : (
              <SendbirdProvider
                appId={SENDBIRD_APP_ID}
                userId={ADMIN_CHAT_ID}
                accessToken={adminSessionToken}
                theme="light"
              >
                {/* Mobile: toggle list/chat */}
                <div className="md:hidden">
                  {adminChatView === 'list' ? (
                    <div className="h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <GroupChannelList
                        onChannelSelect={(channel) => {
                          setAdminChannelUrl(channel?.url ?? null);
                          setAdminChatView('chat');
                        }}
                        onChannelCreated={(channel) => {
                          setAdminChannelUrl(channel?.url ?? null);
                          setAdminChatView('chat');
                        }}
                        selectedChannelUrl={adminChannelUrl ?? undefined}
                        disableAutoSelect
                      />
                    </div>
                  ) : (
                    <div className="h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {adminChannelUrl ? (
                        <GroupChannel channelUrl={adminChannelUrl} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          대화를 선택하세요.
                        </div>
                      )}
                    </div>
                  )}
                  {adminChatView === 'chat' && (
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setAdminChatView('list')}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        목록으로
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop: list + chat side by side */}
                <div className="hidden md:flex md:h-[560px] md:gap-3 lg:h-[680px]">
                  <div className="h-full min-w-0 flex-[0_0_40%] overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <GroupChannelList
                      onChannelSelect={(channel) => {
                        setAdminChannelUrl(channel?.url ?? null);
                        setAdminChatView('chat');
                      }}
                      onChannelCreated={(channel) => {
                        setAdminChannelUrl(channel?.url ?? null);
                        setAdminChatView('chat');
                      }}
                      selectedChannelUrl={adminChannelUrl ?? undefined}
                      disableAutoSelect
                    />
                  </div>
                  <div className="h-full min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {adminChannelUrl ? (
                      <GroupChannel channelUrl={adminChannelUrl} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        대화를 선택하세요.
                      </div>
                    )}
                  </div>
                </div>
              </SendbirdProvider>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAdminChatOpen((prev) => !prev)}
        className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.7)] backdrop-blur transition hover:-translate-y-0.5"
        aria-expanded={adminChatOpen}
        aria-controls="admin-support-chat"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        상담관리
      </button>
    </div>
  );
};

export default AdminSupportChatWidget;
