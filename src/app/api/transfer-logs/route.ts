import { NextResponse } from 'next/server';

const UPSTREAM = 'https://www.stable.makeup/api/tokenTransfer/getLatestTransactionHashLogs';

export async function GET() {
  try {
    const upstream = await fetch(UPSTREAM, { cache: 'no-store' });
    const payload = await upstream.json();

    return NextResponse.json(payload, {
      status: upstream.status,
      headers: corsHeaders(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transfer logs' }, { status: 502, headers: corsHeaders() });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
