'use client';

///import type { Metadata } from "next";
///import { Inter } from "next/font/google";

///import "./globals.css";

///import { ThirdwebProvider } from "thirdweb/react";

import { useState, useEffect, useMemo } from "react";


//import Script from "next/script";

//import { Analytics } from '@vercel/analytics/next';
//import { SpeedInsights } from '@vercel/speed-insights/next';


//const inter = Inter({ subsets: ["latin"] });

////import localFont from "next/font/local";



import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Button, Menu, MenuItem, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { langs } from "@/utils/langs";




import Image from "next/image";

import { toast } from 'react-hot-toast';



import {
  getContract,
} from "thirdweb";

import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,

  useSetActiveWallet,

  useConnectedWallets,

  AutoConnect,

} from "thirdweb/react";



import {
  inAppWallet,
  createWallet,
  getWalletBalance,
} from "thirdweb/wallets";


import {
  getUserPhoneNumber,
  getUserEmail,
} from "thirdweb/wallets/in-app";


import {
  balanceOf,
  transfer,
} from "thirdweb/extensions/erc20";


import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
} from "thirdweb/chains";


import {
  clientId,
  client,
} from "./../app/client";

import {
  chain as envChain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,

  bscContractAddressMKRW,
} from "@/app/config/contractAddresses";
import { add } from "thirdweb/extensions/farcaster/keyGateway";


import { useQRCode } from 'next-qrcode';
import { Connect } from "twilio/lib/twiml/VoiceResponse";
import { useClientWallets } from "@/lib/useClientWallets";


const walletAuthOptions = ["google", "email", "phone"];

type NetworkKey = "ethereum" | "polygon" | "arbitrum" | "bsc";

const resolveNetwork = (value?: string | null): NetworkKey | null => {
  if (value === "ethereum" || value === "polygon" || value === "arbitrum" || value === "bsc") {
    return value;
  }
  return null;
};

const StabilityConsole = ({ onRequestClose }: { onRequestClose?: () => void }) => {

  const { Canvas } = useQRCode();

  const router = useRouter();
  const { wallet, wallets, smartAccountEnabled } = useClientWallets({ authOptions: walletAuthOptions });


  /*
  useEffect(() => {
  
    window.googleTranslateElementInit = () => {
     new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
    };
  
   }, []);
   */


  //const [showChain, setShowChain] = useState(false);

  const activeWallet = useActiveWallet();

  const activeAccount = useActiveAccount();

  const address = activeAccount?.address;

  const [clientChain, setClientChain] = useState<NetworkKey | null>(null);

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchClientNetwork = async () => {
      try {
        const response = await fetch("/api/client/getClientInfo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        const nextChain = resolveNetwork(data?.result?.clientInfo?.chain || data?.result?.chain);
        if (nextChain && isMounted) {
          setClientChain(nextChain);
        }
      } catch (error) {
        console.error("Failed to fetch client network", error);
      }
    };

    const startPolling = () => {
      if (interval) {
        return;
      }
      interval = setInterval(fetchClientNetwork, 60000);
    };

    const stopPolling = () => {
      if (!interval) {
        return;
      }
      clearInterval(interval);
      interval = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchClientNetwork();
        startPolling();
      } else {
        stopPolling();
      }
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const displayChain = clientChain ?? resolveNetwork(envChain) ?? "polygon";
  const activeChain = displayChain === "ethereum"
    ? ethereum
    : displayChain === "polygon"
    ? polygon
    : displayChain === "arbitrum"
    ? arbitrum
    : bsc;
  const activeUsdtAddress = displayChain === "ethereum"
    ? ethereumContractAddressUSDT
    : displayChain === "polygon"
    ? polygonContractAddressUSDT
    : displayChain === "arbitrum"
    ? arbitrumContractAddressUSDT
    : bscContractAddressUSDT;
  const usdtDecimals = displayChain === "bsc" ? 18 : 6;

  const networkLabel = displayChain === "ethereum"
    ? "Ethereum"
    : displayChain === "polygon"
    ? "Polygon"
    : displayChain === "arbitrum"
    ? "Arbitrum"
    : displayChain === "bsc"
    ? "BSC"
    : "Unknown";

  const networkTone = displayChain === "ethereum"
    ? "border-indigo-200/40 bg-indigo-50/50 text-indigo-700"
    : displayChain === "polygon"
    ? "border-violet-200/40 bg-violet-50/50 text-violet-700"
    : displayChain === "arbitrum"
    ? "border-sky-200/40 bg-sky-50/50 text-sky-700"
    : displayChain === "bsc"
    ? "border-amber-200/40 bg-amber-50/50 text-amber-700"
    : "border-slate-200/40 bg-slate-50/50 text-slate-600";



  const contract = useMemo(() => getContract({
    client,
    chain: activeChain,
    address: activeUsdtAddress,
  }), [activeChain, activeUsdtAddress]);




  const [balance, setBalance] = useState(0);
  const [nativeBalance, setNativeBalance] = useState(0);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {

    if (!address) return;
    // get the balance


    if (!contract) {
      return;
    }

    const getBalance = async () => {

      try {
        const result = await balanceOf({
          contract,
          address: address,
        });

        setBalance(Number(result) / 10 ** usdtDecimals);

      } catch (error) {
        console.error("Error getting balance", error);
      }


      // getWalletBalance
      const result = await getWalletBalance({
        address: address,
        client: client,
        chain: activeChain,
      });

      if (result) {
        setNativeBalance(Number(result.value) / 10 ** result.decimals);
      }

      

    };

    if (address) getBalance();

    // get the balance in the interval

    const interval = setInterval(() => {
      if (address) getBalance();
    }, 5000);


    return () => clearInterval(interval);

  } , [address, contract, activeChain, usdtDecimals]);




  return (

    <div
      className="console-shell relative mx-auto mb-4 w-[360px] max-w-full overflow-hidden rounded-[22px]
      bg-[radial-gradient(120%_120%_at_0%_0%,#fbfaf6_0%,#eff3f7_45%,#e1e8f1_100%)]
      p-2 shadow-[0_40px_80px_-50px_rgba(15,23,42,0.65)] ring-1 ring-[#d6dde7]"
      style={{ fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif' }}
    >

      {/* sponsor gas auto connect */}
      <AutoConnect
        client={client}
        wallets={[wallet]}
      />

      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full
        bg-[radial-gradient(circle_at_center,#9be8d9_0%,rgba(155,232,217,0.2)_45%,transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full
        bg-[radial-gradient(circle_at_center,#bcd1ff_0%,rgba(188,209,255,0.25)_40%,transparent_70%)] blur-2xl" />


      {/* address balance */}
      <div className="console-card relative flex w-full flex-col gap-3">

        {address ? (

          <>
            <div
              className="console-row w-full rounded-2xl border border-slate-200/40 bg-white/60 p-3"
              style={{ animationDelay: "0.05s" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                  <span>내 지갑주소</span>
                </div>
                {smartAccountEnabled && (
                <div className="relative">
                  <span className="smart-account-glow absolute -inset-1 rounded-full" />
                    <span className="smart-account-badge inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      <span className="inline-flex h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)]" />
                      스마트 어카운트
                    </span>
                </div>
                )}
              </div>

              <div className="mt-2 grid w-full gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/50
                  bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900
                  transition hover:border-slate-300"
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    //toast.success(Copied_Wallet_Address);
                    alert("지갑주소가 복사되었습니다.");
                  }}
                >
                  <Image
                    src="/icon-shield.png"
                    alt="Shield"
                    width={20}
                    height={20}
                    className="h-5 w-5 opacity-70"
                  />
                  <span className="tracking-tight">
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </span>
                </button>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>QR 코드</span>
                  <button
                    type="button"
                    onClick={() => setShowQrCode((prev) => !prev)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
                  >
                    {showQrCode ? 'QR 접기' : 'QR 펼치기'}
                  </button>
                </div>

                <div
                  className={`flex justify-center overflow-hidden transition-all duration-300 ease-out origin-top
                  ${showQrCode ? 'max-h-[260px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}
                >
                  <div className="rounded-2xl bg-white/80 p-2 ring-1 ring-slate-200/50">
                    <Canvas
                      text={address}
                      options={{
                        //level: 'M',
                        margin: 2,
                        scale: 4,
                        ///width: 200,
                        // width 100%
                        width: 120,
                        color: {
                          dark: '#0f172a',
                          light: '#ffffff',
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
      


            <div
              className="console-row w-full rounded-2xl border border-emerald-100/40
              bg-[linear-gradient(135deg,#f7fffb_0%,#f8fbff_100%)] p-3"
              style={{ animationDelay: "0.12s" }}
            >
              <div className="flex items-center gap-2 text-[12px] font-medium text-emerald-700/80">
                <Image
                  src="/token-usdt-icon.png"
                  alt="USDT"
                  width={35}
                  height={35}
                  className="h-6 w-6 rounded-lg bg-white p-1 shadow-sm"
                />
                <span>내 테더 잔액(USDT)</span>
              </div>

              <div className="mt-2 flex w-full items-baseline justify-end gap-2 text-right">
                <div
                  className="text-xl font-semibold text-emerald-700 tabular-nums text-right"
                  style={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", "Menlo", monospace' }}
                >
                  {Number(balance).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <span className="text-[11px] font-medium text-emerald-700/60">USDT</span>
              </div>


              {/*
              <button
                disabled={!address}
                onClick={() => {
                  // redirect to send USDT page
                  router.push(
                    "/kr/administration/withdraw-usdt"
                  );

                }}
                className="w-full flex items-center justify-center
                bg-[#0047ab]
                text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                <span className="text-sm text-gray-100">
                  출금하기
                </span>
                <Image
                  src="/icon-share.png"
                  alt="Withdraw USDT"
                  width={20}
                  height={20}
                  className="ml-2"
                />

              </button>
              */}

            </div>

            {!smartAccountEnabled && (
              <div
                className="console-row w-full rounded-2xl border border-slate-200/40 bg-white/60 px-3 py-2.5"
                style={{ animationDelay: "0.18s" }}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={`/logo-chain-${displayChain}.png`}
                      alt={`${displayChain} logo`}
                      width={20}
                      height={20}
                      className="rounded-lg"
                    />
                    <span className="text-[12px] font-medium text-slate-500">
                      가스보유량
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-lg font-semibold text-slate-900 tabular-nums"
                      style={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", "Menlo", monospace' }}
                    >
                      {Number(nativeBalance).toFixed(4)}
                    </span>
                    <span className="text-[12px] font-medium text-slate-500">
                      {displayChain === "ethereum" ? "ETH" :
                      displayChain === "polygon" ? "POL" :
                      displayChain === "arbitrum" ? "ETH" :
                      displayChain === "bsc" ? "BNB" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`console-row w-full rounded-2xl border px-3 py-2.5 ${networkTone}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em]">
                  현재 네트워크
                </span>
                <div className="flex items-center gap-2">
                  <Image
                    src={`/logo-chain-${displayChain}.png`}
                    alt={`${networkLabel} logo`}
                    width={18}
                    height={18}
                    className="h-4 w-4 rounded-full"
                  />
                  <span className="text-base font-semibold">{networkLabel}</span>
                </div>
              </div>
            </div>

            {smartAccountEnabled ? (
              <div
                className="console-row w-full rounded-xl border border-emerald-200/50 bg-emerald-50/70
                px-3 py-2 text-[11px] text-emerald-700"
                style={{ animationDelay: "0.22s" }}
              >
                스마트 어카운트는 출금 시 가스비용이 필요 없어 편리합니다.
              </div>
            ) : (
              nativeBalance < 0.0001 && (
                <div
                  className="console-row w-full rounded-xl border border-rose-200/50 bg-rose-50/70
                  px-3 py-2 text-[11px] text-rose-600"
                  style={{ animationDelay: "0.22s" }}
                >
                  가스비용이 부족합니다.<br />가스비용이 부족하면 입금은 가능하지만 출금은 불가능합니다.
                </div>
              )
            )}


            <div
              className="console-row w-full grid grid-cols-1 gap-2.5"
              style={{ animationDelay: "0.26s" }}
            >
              <button
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900
                px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                //onClick={() => router.push("/ko/administration/withdraw-usdt")}
                /* router and hide button for withdraw USDT */
                onClick={() => {
                  onRequestClose?.();
                  router.push("/ko/administration/withdraw-usdt");
                }}>
                  <Image
                    src={`/icon-withdraw.png`}
                    alt={`Withdraw icon`}
                    width={16}
                    height={16}
                  />
                  <span>USDT 출금하기</span>
              </button>

                <button
                  className="inline-flex h-11 items-center justify-center rounded-full border border-rose-200/70
                  bg-white/70 px-4 text-sm font-semibold text-rose-600
                  transition hover:border-rose-300 hover:bg-rose-50"
                  onClick={() => {
                    // Add your disconnect wallet logic here
                    confirm("지갑 연결을 해제하시겠습니까?") && activeWallet?.disconnect()
                    .then(() => {
                      toast.success('로그아웃 되었습니다');
                    });
                    
                  }}>
                  지갑 연결 해제
                </button>


            </div>


          </>

        ) : (

          <div
            className="console-row w-full rounded-2xl border border-slate-200/50 bg-white/60 p-4 text-center"
            style={{ animationDelay: "0.08s" }}
          >
            {/* 로그인하고 나의 자산을 확인하세요 */}
            <span className="text-[13px] font-medium text-slate-500">
              로그인하고 나의 지갑주소에서 자산을 확인하세요
            </span>


            <div className="mt-4 flex justify-center">
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={activeChain}
                
                theme={"light"}

                // button color is dark skyblue convert (49, 103, 180) to hex
                connectButton={{
                  style: {
                    backgroundColor: "#0f172a",
                    color: "#f8fafc",
                    padding: "2px 12px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    height: "42px",
                    boxShadow: "0 14px 30px -18px rgba(15, 23, 42, 0.6)",
                  },
                  label: "웹3 로그인",
                }}

                connectModal={{
                  size: "wide", 
                  //size: "compact",
                  titleIcon: "https://crypto-ex-vienna.vercel.app/logo.png",                           
                  showThirdwebBranding: false,
                }}

                locale={"ko_KR"}
                //locale={"en_US"}
              />
            </div>

          </div>

        )}

      </div>

      <style jsx>{`
        .console-shell {
          animation: consoleShellIn 0.6s ease-out both;
        }
        .console-card {
          animation: consoleCardIn 0.7s ease-out 0.05s both;
        }
        .console-row {
          animation: consoleRowIn 0.6s ease-out both;
        }
        @keyframes consoleShellIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes consoleCardIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes consoleRowIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .smart-account-badge {
          animation: smartBadgePulse 1.6s ease-in-out infinite;
        }
        .smart-account-glow {
          background: radial-gradient(circle at center, rgba(251, 191, 36, 0.7), rgba(249, 115, 22, 0.3), transparent 70%);
          filter: blur(10px);
          animation: smartGlowPulse 1.6s ease-in-out infinite;
        }
        @keyframes smartBadgePulse {
          0%,
          100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.35), 0 14px 30px -18px rgba(234, 88, 12, 0.7);
          }
          50% {
            transform: translateY(-1px) scale(1.02);
            box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.18), 0 18px 40px -18px rgba(234, 88, 12, 0.8);
          }
        }
        @keyframes smartGlowPulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.08);
          }
        }
      `}</style>

    </div>

  );


};



StabilityConsole.displayName = "StabilityConsole";

export default StabilityConsole;
