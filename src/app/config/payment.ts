// export env PAYMENT_URL
export const paymentUrl = process.env.NEXT_PUBLIC_PAYMENT_URL;

export const platformFeePercentage = process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE
  ? Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE)
  : 0.0; // default 0%

export const platformFeeWalletAddress = process.env.NEXT_PUBLIC_PLATFORM_FEE_ADDRESS
  ? process.env.NEXT_PUBLIC_PLATFORM_FEE_WALLET_ADDRESS
  : '';

