import { NextResponse, type NextRequest } from 'next/server';
import {
  buyOrderConfirmPayment,
  buyOrderGetOrderById,
  type UserProps,
} from '@lib/api/order';
import clientPromise, { dbName } from '@lib/mongodb';
import { createThirdwebClient, Engine, getContract } from 'thirdweb';
import { transfer } from 'thirdweb/extensions/erc20';
import { waitForTransactionHash } from 'thirdweb/engine';
import { ethereum, polygon, arbitrum, bsc } from 'thirdweb/chains';

const CHAIN = process.env.NEXT_PUBLIC_CHAIN || 'bsc';

function getChainObj() {
  switch (CHAIN) {
    case 'ethereum':
      return ethereum;
    case 'polygon':
      return polygon;
    case 'arbitrum':
      return arbitrum;
    case 'bsc':
    default:
      return bsc;
  }
}

function getUsdtAddress(chain: string) {
  switch (chain) {
    case 'ethereum':
      return '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    case 'polygon':
      return '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    case 'arbitrum':
      return '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
    case 'bsc':
    default:
      return '0x55d398326f99059fF775485246999027B3197955';
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { lang, storecode, orderId, paymentAmount } = body || {};

  if (!orderId || !storecode) {
    return NextResponse.json({ error: 'orderId and storecode are required', result: null }, { status: 400 });
  }

  try {
    const order = (await buyOrderGetOrderById(orderId)) as UserProps | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found', result: null }, { status: 404 });
    }

    const recipient = order.buyer?.receiveWalletAddress?.trim?.() || '';
    const sellerEscrow = order.seller?.escrowWalletAddress || order.seller?.walletAddress;
    const usdtAmount = order.usdtAmount || 0;
    const usedAmount = Number.isFinite(paymentAmount) && paymentAmount > 0 ? paymentAmount : usdtAmount;

    if (!sellerEscrow || usedAmount <= 0 || !recipient) {
      return NextResponse.json(
        { error: 'Invalid order data: missing escrow or receive wallet.', result: null },
        { status: 400 },
      );
    }

    const mongo = await clientPromise;
    const collection = mongo.db(dbName).collection('users');
    const sellerUser = await collection.findOne<UserProps>({
      storecode,
      $or: [
        { walletAddress: sellerEscrow },
        { 'seller.escrowWalletAddress': sellerEscrow },
      ],
    });

    if (!sellerUser) {
      return NextResponse.json({ error: 'Seller not found', result: null }, { status: 404 });
    }

    const secretKey = process.env.THIRDWEB_SECRET_KEY || '';
    const vaultAccessToken =
      process.env.THIRDWEB_ENGINE_VAULT_ACCESS_TOKEN ||
      process.env.THIRDWEB_ENGINE_VAULT_TOKEN ||
      process.env.THIRDWEB_VAULT_ACCESS_TOKEN ||
      process.env.THIRDWEB_VAULT_TOKEN ||
      process.env.VAULT_TOKEN ||
      '';

    if (!secretKey || !vaultAccessToken) {
      return NextResponse.json({ error: 'Engine credentials missing', result: null }, { status: 500 });
    }

    const client = createThirdwebClient({ secretKey });
    const chainObj = getChainObj();
    const contract = getContract({
      client,
      chain: chainObj,
      address: getUsdtAddress(CHAIN),
    });

    const wallet = Engine.serverWallet({
      client,
      address: sellerEscrow,
      vaultAccessToken,
    });

    const transaction = transfer({
      contract,
      to: recipient,
      amount: usedAmount,
    });

    const { transactionId } = await wallet.enqueueTransaction({ transaction });
    const { transactionHash } = await waitForTransactionHash({
      client,
      transactionId,
    });

    const result = await buyOrderConfirmPayment({
      lang,
      storecode,
      orderId,
      paymentAmount: usedAmount,
      queueId: null,
      transactionHash,
      escrowTransactionHash: transactionHash,
    });

    return NextResponse.json({ result, transactionId, transactionHash });
  } catch (error) {
    console.error('buyOrderConfirmPaymentEngine error', error);
    return NextResponse.json({ error: 'Internal error', result: null }, { status: 500 });
  }
}
