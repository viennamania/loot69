import { NextResponse } from 'next/server';

const APPLICATION_ID = process.env.NEXT_PUBLIC_SENDBIRD_APP_ID || process.env.SENDBIRD_APP_ID || 'CCD67D05-55A6-4CA2-A6B1-187A5B62EC9D';
const API_BASE = `https://api-${APPLICATION_ID}.sendbird.com/v3`;
const REQUEST_TIMEOUT_MS = Number(process.env.SENDBIRD_REQUEST_TIMEOUT_MS ?? 8000);

const logSendbird = (
    level: 'info' | 'warn' | 'error',
    label: string,
    data: Record<string, unknown>,
) => {
    const prefix = `[sendbird:${label}]`;
    if (level === 'error') {
        console.error(prefix, data);
        return;
    }
    if (level === 'warn') {
        console.warn(prefix, data);
        return;
    }
    console.info(prefix, data);
};

const fetchWithTimeout = async (
    label: string,
    url: string,
    init: RequestInit,
) => {
    const controller = new AbortController();
    const startedAt = Date.now();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        const durationMs = Date.now() - startedAt;
        if (!response.ok) {
            let errorBody: string | null = null;
            try {
                errorBody = await response.clone().text();
            } catch {
                errorBody = null;
            }
            logSendbird('error', label, {
                status: response.status,
                durationMs,
                errorBody: errorBody && errorBody.length > 500 ? `${errorBody.slice(0, 500)}…` : errorBody,
            });
        } else if (durationMs > 1000) {
            logSendbird('warn', label, { durationMs });
        }
        return { response, durationMs };
    } catch (error) {
        const durationMs = Date.now() - startedAt;
        const isTimeout = error instanceof DOMException && error.name === 'AbortError';
        logSendbird('error', label, {
            durationMs,
            error: error instanceof Error ? error.message : String(error),
            timeout: isTimeout,
        });
        throw new Error(isTimeout ? 'Sendbird request timed out' : 'Sendbird request failed');
    } finally {
        clearTimeout(timeoutId);
    }
};

const getHeaders = () => {
    const apiToken = process.env.SENDBIRD_API_TOKEN;
    if (!apiToken) {
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Api-Token': apiToken,
    };
};

export async function POST(request: Request) {
    const headers = getHeaders();
    if (!headers) {
        return NextResponse.json({ error: 'Sendbird API token is missing.' }, { status: 500 });
    }

    const body = (await request.json().catch(() => null)) as {
        userId?: string;
        limit?: number;
    } | null;

    if (!body?.userId) {
        return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    const limit = Math.max(1, Math.min(20, body.limit ?? 10));
    const url = new URL(`${API_BASE}/users/${encodeURIComponent(body.userId)}/my_group_channels`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('order', 'latest_last_message');
    url.searchParams.set('include_empty', 'true');
    url.searchParams.set('show_member', 'true');

    try {
        const { response } = await fetchWithTimeout(`user-channels:${body.userId}`, url.toString(), {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || 'Failed to load user channels');
        }

        const data = (await response.json()) as {
            channels?: {
                channel_url: string;
                name?: string;
                members?: {
                    user_id: string;
                    nickname?: string;
                    profile_url?: string;
                }[];
                last_message?: {
                    message?: string;
                    created_at?: number;
                };
                created_at?: number;
                unread_message_count?: number;
            }[];
        };

        const items =
            data.channels?.map((channel) => {
                const members =
                    channel.members?.filter((member) => member.user_id !== body.userId) ?? [];
                return {
                    channelUrl: channel.channel_url,
                    members: members.map((member) => ({
                        userId: member.user_id,
                        nickname: member.nickname,
                        profileUrl: member.profile_url,
                    })),
                    lastMessage: channel.last_message?.message || '',
                    updatedAt: channel.last_message?.created_at || channel.created_at || 0,
                    unreadMessageCount: channel.unread_message_count || 0,
                };
            }) ?? [];

        return NextResponse.json({ items });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load user channels';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
