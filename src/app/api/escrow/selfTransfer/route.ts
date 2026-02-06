import { NextResponse, type NextRequest } from 'next/server';
import { createThirdwebClient, getContract } from 'thirdweb';
import { transfer } from 'thirdweb/extensions/erc20';
import { serverWallet, waitForTransactionHash } from 'thirdweb/engine';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';
import { chain as chainId } from '@/app/config/contractAddresses';

const CHAIN = (chainId || 'bsc').toLowerCase();

function getChainObj() {
  switch (CHAIN) {
    case 'ethereum':
      return ethereum;
    case 'polygon':
      return polygon;
    case 'arbitrum':
      return arbitrum;
    default:
      return bsc;
  }
}

function getUsdtAddress() {
  switch (CHAIN) {
    case 'ethereum':
      return '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    case 'polygon':
      return '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    case 'arbitrum':
      return '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
    default:
      return '0x55d398326f99059fF775485246999027B3197955';
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { from, to, amount } = body || {};
  if (!from || !to || !amount) {
    return NextResponse.json({ error: 'from, to, amount required' }, { status: 400 });
  }

  const secretKey = process.env.THIRDWEB_SECRET_KEY || '';
  const vaultAccessToken =
    process.env.THIRDWEB_VAULT_ACCESS_TOKEN ||
    process.env.THIRDWEB_ENGINE_VAULT_ACCESS_TOKEN ||
    process.env.THIRDWEB_ENGINE_VAULT_TOKEN ||
    process.env.THIDWEB_VAULT_TOKEN ||
    process.env.VAULT_TOKEN ||
    '';

  if (!secretKey || !vaultAccessToken) {
    return NextResponse.json({ error: 'engine credentials missing' }, { status: 500 });
  }

  const client = createThirdwebClient({ secretKey });
  const chainObj = getChainObj();
  const contract = getContract({
    client,
    chain: chainObj,
    address: getUsdtAddress(),
  });

  try {
    const wallet = serverWallet({
      client,
      address: from,
      chain: chainObj,
      vaultAccessToken,
    });

    const transaction = transfer({
      contract,
      to,
      amount,
    });

    const { transactionId } = await wallet.enqueueTransaction({ transaction });
    const { transactionHash } = await waitForTransactionHash({ client, transactionId });

    return NextResponse.json({ result: { transactionId, transactionHash } });
  } catch (error) {
    console.error('selfTransfer error', error);
    return NextResponse.json({ error: 'transfer failed' }, { status: 500 });
  }
}
