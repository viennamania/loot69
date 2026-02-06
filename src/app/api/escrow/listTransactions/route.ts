import { NextResponse, type NextRequest } from 'next/server';
import { createThirdwebClient } from 'thirdweb';
import { searchTransactions } from 'thirdweb/engine';
import { chain as chainId } from '@/app/config/contractAddresses';

const CHAIN = chainId || 'bsc';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { address, limit = 20 } = body || {};
  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  const secretKey = process.env.THIRDWEB_SECRET_KEY || '';
  if (!secretKey) {
    return NextResponse.json({ error: 'engine credentials missing' }, { status: 500 });
  }

  const client = createThirdwebClient({ secretKey });

  const pageSize = Math.min(Number(limit) || 20, 50);
  const fetchBy = async (field: 'from' | 'signerAddress' | 'smartAccountAddress') =>
    searchTransactions({
      client,
      filters: [
        { field, values: [address], operation: 'OR' as any },
        { field: 'chainId', values: [CHAIN], operation: 'OR' as any },
      ],
      page: 1,
      pageSize,
    }).catch(() => ({ transactions: [] }));

  try {
    const [asFrom, asSigner, asSmart] = await Promise.all([
      fetchBy('from'),
      fetchBy('signerAddress'),
      fetchBy('smartAccountAddress'),
    ]);
    const mergedMap = new Map<string, any>();
    [...(asFrom.transactions || []), ...(asSigner.transactions || []), ...(asSmart.transactions || [])].forEach((tx: any) => {
      const key = tx?.transactionHash || tx?.hash || tx?.id || Math.random().toString(36);
      if (!mergedMap.has(key)) mergedMap.set(key, tx);
    });
    const merged = Array.from(mergedMap.values()).sort(
      (a: any, b: any) =>
        new Date(b?.createdAt || b?.timestamp || 0).getTime() -
        new Date(a?.createdAt || a?.timestamp || 0).getTime(),
    );
    return NextResponse.json({ result: merged });
  } catch (error) {
    console.error('listTransactions error', error);
    return NextResponse.json({ error: 'failed to fetch transactions' }, { status: 500 });
  }
}
