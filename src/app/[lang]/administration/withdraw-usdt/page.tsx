// send USDT
'use client';


import React, { useEffect, useMemo, useState } from 'react';

import { toast } from 'react-hot-toast';
import { client } from '../../../client';


import {
    //ThirdwebProvider,
    ConnectButton,
  
    useConnect,
  
    useReadContract,
  
    useActiveWallet,

    useActiveAccount,
    useSendBatchTransaction,

    useConnectedWallets,

    useSetActiveWallet,

    AutoConnect,
    
} from "thirdweb/react";



import {
  getContract,
  //readContract,
  sendTransaction,
  sendAndConfirmTransaction,
} from "thirdweb";

import {
  balanceOf,
  transfer,
} from "thirdweb/extensions/erc20";
 


import {
  createWallet,
  inAppWallet,
  getWalletBalance,
} from "thirdweb/wallets";

import Image from 'next/image';

import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../dictionaries";
import { useClientWallets } from "@/lib/useClientWallets";



import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
  type Chain,
} from "thirdweb/chains";

import {
  chain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,
} from "@/app/config/contractAddresses";




const walletAuthOptions = ["phone", "email"];


const contractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon


const contractAddressArbitrum = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum

type NetworkKey = 'ethereum' | 'polygon' | 'arbitrum' | 'bsc';
const EMPTY_NATIVE_BALANCES: Record<NetworkKey, number | null> = {
  ethereum: null,
  polygon: null,
  arbitrum: null,
  bsc: null,
};
const NETWORK_OPTIONS: Array<{
  id: NetworkKey;
  label: string;
  chain: Chain;
  contractAddress: string;
  nativeSymbol: string;
  decimals: number;
}> = [
  {
    id: 'ethereum',
    label: 'Ethereum',
    chain: ethereum,
    contractAddress: ethereumContractAddressUSDT,
    nativeSymbol: 'ETH',
    decimals: 6,
  },
  {
    id: 'polygon',
    label: 'Polygon',
    chain: polygon,
    contractAddress: polygonContractAddressUSDT,
    nativeSymbol: 'POL',
    decimals: 6,
  },
  {
    id: 'arbitrum',
    label: 'Arbitrum',
    chain: arbitrum,
    contractAddress: arbitrumContractAddressUSDT,
    nativeSymbol: 'ETH',
    decimals: 6,
  },
  {
    id: 'bsc',
    label: 'BSC',
    chain: bsc,
    contractAddress: bscContractAddressUSDT,
    nativeSymbol: 'BNB',
    decimals: 18,
  },
];






/*
const smartWallet = new smartWallet(config);
const smartAccount = await smartWallet.connect({
  client,
  personalAccount,
});
*/

import {
  useRouter,
  useSearchParams
} from "next//navigation";

import { Select } from '@mui/material';
import { Sen } from 'next/font/google';
import { Router } from 'next/router';
import path from 'path';









export default function SendUsdt({ params }: any) {

  const { wallet, wallets, smartAccountEnabled } = useClientWallets({
    authOptions: walletAuthOptions,
    sponsorGas: true,
  });

  //console.log("wallet", wallet);
  //console.log("wallets", wallets);
  //console.log("smartAccountEnabled", smartAccountEnabled);





  //console.log("params", params);

  const searchParams = useSearchParams();
 
  ///const wallet = searchParams.get('wallet');
  
  const defaultNetwork: NetworkKey = (chain === 'ethereum'
    || chain === 'polygon'
    || chain === 'arbitrum'
    || chain === 'bsc')
    ? (chain as NetworkKey)
    : 'polygon';
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>(defaultNetwork);
  const selectedNetworkConfig = useMemo(() => (
    NETWORK_OPTIONS.find((option) => option.id === selectedNetwork) ?? NETWORK_OPTIONS[1]
  ), [selectedNetwork]);
  const contract = useMemo(() => (
    getContract({
      // the client you have created via `createThirdwebClient()`
      client,
      // the chain the contract is deployed on
      chain: selectedNetworkConfig.chain,
      address: selectedNetworkConfig.contractAddress,
      // OPTIONAL: the contract's abi
      //abi: [...],
    })
  ), [selectedNetworkConfig]);




  const [data, setData] = useState({
    title: "",
    description: "",

    menu : {
      buy: "",
      sell: "",
      trade: "",
      chat: "",
      history: "",
      settings: "",
    },

    Go_Home: "",
    My_Balance: "",
    My_Nickname: "",
    My_Buy_Trades: "",
    My_Sell_Trades: "",
    Buy: "",
    Sell: "",
    Buy_USDT: "",
    Sell_USDT: "",
    Contact_Us: "",
    Buy_Description: "",
    Sell_Description: "",
    Send_USDT: "",
    Pay_USDT: "",
    Coming_Soon: "",
    Please_connect_your_wallet_first: "",

    USDT_sent_successfully: "",
    Failed_to_send_USDT: "",

    Go_Buy_USDT: "",
    Enter_Wallet_Address: "",
    Enter_the_amount_and_recipient_address: "",
    Select_a_user: "",
    User_wallet_address: "",
    This_address_is_not_white_listed: "",
    If_you_are_sure_please_click_the_send_button: "",

    Sending: "",

    Anonymous: "",

    Copied_Wallet_Address: "",
    Withdraw_USDT: "",

  } );

  useEffect(() => {
      async function fetchData() {
          const dictionary = await getDictionary(params.lang);
          setData(dictionary);
      }
      fetchData();
  }, [params.lang]);

  const {
    title,
    description,
    menu,
    Go_Home,
    My_Balance,
    My_Nickname,
    My_Buy_Trades,
    My_Sell_Trades,
    Buy,
    Sell,
    Buy_USDT,
    Sell_USDT,
    Contact_Us,
    Buy_Description,
    Sell_Description,
    Send_USDT,
    Pay_USDT,
    Coming_Soon,
    Please_connect_your_wallet_first,

    USDT_sent_successfully,
    Failed_to_send_USDT,

    Go_Buy_USDT,
    Enter_Wallet_Address,
    Enter_the_amount_and_recipient_address,
    Select_a_user,
    User_wallet_address,
    This_address_is_not_white_listed,
    If_you_are_sure_please_click_the_send_button,

    Sending,

    Anonymous,

    Copied_Wallet_Address,
    Withdraw_USDT,

  } = data;



  const router = useRouter();



  const activeAccount = useActiveAccount();

  const address = activeAccount?.address;


  const [balance, setBalance] = useState(0);
  const [nativeBalances, setNativeBalances] = useState<Record<NetworkKey, number | null>>(
    EMPTY_NATIVE_BALANCES
  );

  const [amount, setAmount] = useState(0);
  const [amountInput, setAmountInput] = useState('');
  const maxAmount = useMemo(() => (
    Number.isFinite(balance) ? Math.max(0, balance) : 0
  ), [balance]);

  const normalizeAmountInput = (value: string, decimals: number) => {
    const cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
    if (cleaned === '') {
      return '';
    }
    const hasTrailingDot = cleaned.endsWith('.');
    const [wholeRaw, fractionRaw = ''] = cleaned.split('.');
    const whole = wholeRaw.replace(/^0+(?=\d)/, '');
    const limitedFraction = fractionRaw.slice(0, decimals);
    if (hasTrailingDot) {
      return `${whole || '0'}.`;
    }
    if (limitedFraction.length > 0) {
      return `${whole || '0'}.${limitedFraction}`;
    }
    return whole;
  };

  const formatAmountInput = (value: number, decimals: number) => {
    if (!Number.isFinite(value)) {
      return '';
    }
    const fixed = value.toFixed(decimals);
    return fixed.replace(/\.?0+$/, '');
  };

  const handleAmountChange = (value: string) => {
    const normalized = normalizeAmountInput(value, selectedNetworkConfig.decimals);
    const numericValue = normalized && normalized !== '.' ? Number(normalized) : 0;
    if (numericValue > maxAmount) {
      const cappedValue = maxAmount;
      setAmount(cappedValue);
      setAmountInput(formatAmountInput(cappedValue, selectedNetworkConfig.decimals));
      return;
    }
    setAmount(numericValue);
    setAmountInput(normalized);
  };

  const handleMaxAmount = () => {
    const formatted = formatAmountInput(maxAmount, selectedNetworkConfig.decimals);
    setAmount(maxAmount);
    setAmountInput(formatted);
  };

  useEffect(() => {
    if (!amountInput) {
      if (amount !== 0) {
        setAmount(0);
      }
      return;
    }
    const normalized = normalizeAmountInput(amountInput, selectedNetworkConfig.decimals);
    const numericValue = normalized && normalized !== '.' ? Number(normalized) : 0;
    if (numericValue > maxAmount) {
      const cappedValue = maxAmount;
      setAmount(cappedValue);
      setAmountInput(formatAmountInput(cappedValue, selectedNetworkConfig.decimals));
      return;
    }
    if (normalized !== amountInput) {
      setAmountInput(normalized);
    }
    if (numericValue !== amount) {
      setAmount(numericValue);
    }
  }, [maxAmount, selectedNetworkConfig.decimals]);

  useEffect(() => {

    // get the balance
    const getBalance = async () => {


      const result = await balanceOf({
        //contract,
        contract: contract,
        address: address || "",
      });

      setBalance(Number(result) / 10 ** selectedNetworkConfig.decimals);

    };

    if (address) {
      setBalance(0);
      getBalance();
    }

    const interval = setInterval(() => {
      if (address) getBalance();
    } , 5000);

    return () => clearInterval(interval);

  //} , [address, contract, params.center]);

  } , [address, contract, selectedNetworkConfig.decimals]);


  useEffect(() => {
    if (!address) {
      return;
    }

    let isActive = true;
    setNativeBalances(EMPTY_NATIVE_BALANCES);

    const fetchNativeBalances = async () => {
      try {
        const results = await Promise.all(
          NETWORK_OPTIONS.map(async (option) => {
            try {
              const result = await getWalletBalance({
                address,
                client,
                chain: option.chain,
              });
              const numericValue = result
                ? Number(result.value) / 10 ** result.decimals
                : 0;
              return [option.id, numericValue] as const;
            } catch (error) {
              console.error(`Error fetching native balance for ${option.label}`, error);
              return [option.id, null] as const;
            }
          })
        );

        if (!isActive) {
          return;
        }

        setNativeBalances((prev) => {
          const next = { ...prev };
          results.forEach(([id, value]) => {
            next[id] = value;
          });
          return next;
        });
      } catch (error) {
        console.error('Error fetching native balances', error);
      }
    };

    fetchNativeBalances();
    const interval = setInterval(fetchNativeBalances, 10000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [address]);








  const [user, setUser] = useState(
    {
      _id: '',
      id: 0,
      email: '',
      nickname: '',
      avatar: '',
      mobile: '',
      walletAddress: '',
      createdAt: '',
      settlementAmountOfFee: '',
    }
  );

  useEffect(() => {

    if (!address) return;

    const getUser = async () => {

      const response = await fetch('/api/user/getUserByWalletAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });

      const data = await response.json();


      setUser(data.result);

    };

    getUser();

  }, [address]);



  // get list of user wallets from api
  const [users, setUsers] = useState([
    {
      _id: '',
      id: 0,
      email: '',
      avatar: '',
      nickname: '',
      mobile: '',
      walletAddress: '',
      createdAt: '',
      settlementAmountOfFee: '',
    }
  ]);

  const [totalCountOfUsers, setTotalCountOfUsers] = useState(0);

  useEffect(() => {

    if (!address) return;

    const getUsers = async () => {

      const response = await fetch('/api/user/getAllUsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      //console.log("getUsers", data);


      ///setUsers(data.result.users);
      // set users except the current user

      setUsers(data.result.users.filter((user: any) => user.walletAddress !== address));



      setTotalCountOfUsers(data.result.totalCount);

    };

    getUsers();


  }, [address]);






  const [recipient, setRecipient] = useState({
    _id: '',
    id: 0,
    email: '',
    nickname: '',
    avatar: '',
    mobile: '',
    walletAddress: '',
    createdAt: '',
    settlementAmountOfFee: '',
  });



  ///console.log("recipient", recipient);

  //console.log("recipient.walletAddress", recipient.walletAddress);
  //console.log("amount", amount);



  const [otp, setOtp] = useState('');

  //////const [verifiedOtp, setVerifiedOtp] = useState(false);

  const [verifiedOtp, setVerifiedOtp] = useState(true);


  const [isSendedOtp, setIsSendedOtp] = useState(false);



  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isVerifingOtp, setIsVerifingOtp] = useState(false);

  


  const [sending, setSending] = useState(false);
  const sendUsdt = async () => {
    if (sending) {
      return;
    }


    if (!recipient.walletAddress) {
      toast.error('Please enter a valid address');
      return;
    }

    if (!amount) {
      toast.error('Please enter a valid amount');
      return;
    }

    //console.log('amount', amount, "balance", balance);

    if (Number(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setSending(true);

    try {



        // send USDT
        // Call the extension function to prepare the transaction
        const transaction = transfer({
            //contract,

            contract: contract,

            to: recipient.walletAddress,
            amount: amount,
        });

        console.log("contract", contract);
        console.log("recipient.walletAddress", recipient.walletAddress);
        console.log("amount", amount);
        

        /*
        const transactionResult = await sendAndConfirmTransaction({

            transaction: transaction,
            
            account: smartAccount as any,
        });

        console.log("transactionResult", transactionResult);
        
        if (transactionResult.status !== "success") {
          toast.error(Failed_to_send_USDT);
          return;
        }
        */

        /*
        const { transactionHash } = await sendTransaction({
          
          account: activeAccount as any,

          transaction,
        });
        */
        // sendAndConfirmTransaction
        const { transactionHash } = await sendAndConfirmTransaction({
          transaction: transaction,
          account: activeAccount as any,
        });

        
        if (transactionHash) {


          await fetch('/api/transaction/setTransfer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lang: params.lang,
              chain: selectedNetwork,
              walletAddress: address,
              amount: amount,
              toWalletAddress: recipient.walletAddress,
            }),
          });



          toast.success(USDT_sent_successfully);

          setAmount(0); // reset amount
          setAmountInput('');

          // refresh balance

          // get the balance

          const result = await balanceOf({
            contract,
            address: address || "",
          });

          setBalance(Number(result) / 10 ** selectedNetworkConfig.decimals);


        } else {

          toast.error(Failed_to_send_USDT);

        }
      

    } catch (error) {
      console.error('Failed to send USDT', error);
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes('insufficient funds') || message.toLowerCase().includes('gas')) {
        toast.error('가스비용이 부족합니다. 네트워크 잔고를 확인해주세요.');
      } else {
        toast.error(Failed_to_send_USDT);
      }
    }

    setSending(false);
  };



  // get user by wallet address
  const getUserByWalletAddress = async (walletAddress: string) => {

    const response = await fetch('/api/user/getUserByWalletAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: walletAddress,
      }),
    });

    const data = await response.json();

    //console.log("getUserByWalletAddress", data);

    return data.result;

  };
  
  ///const [wantToReceiveWalletAddress, setWantToReceiveWalletAddress] = useState(false);


  const [wantToReceiveWalletAddress, setWantToReceiveWalletAddress] = useState(true);



  const [isWhateListedUser, setIsWhateListedUser] = useState(false);

  
  useEffect(() => {

    if (!recipient?.walletAddress) {
      return;
    }

    // check recipient.walletAddress is in the user list
    getUserByWalletAddress(recipient?.walletAddress)
    .then((data) => {
        
        //console.log("data============", data);
  
        const checkUser = data

        if (checkUser) {
          setIsWhateListedUser(true);

          setRecipient(checkUser as any);

        } else {
          setIsWhateListedUser(false);

          setRecipient({


            _id: '',
            id: 0,
            email: '',
            nickname: '',
            avatar: '',
            mobile: '',
            walletAddress: recipient?.walletAddress,
            createdAt: '',
            settlementAmountOfFee: '',

          });


        }

    });

  } , [recipient?.walletAddress]);
  




  if (!address) {
    return (
      <main className="min-h-[100vh] bg-[radial-gradient(120%_120%_at_0%_0%,#fff7ed_0%,#fef2f2_38%,#eff6ff_78%,#f8fafc_100%)] px-4 py-8">
        <AutoConnect
            client={client}
            wallets={[wallet]}
        />
        <div className="mx-auto flex min-h-[70vh] max-w-screen-sm items-center justify-center text-center">
          <p className="text-2xl font-semibold text-rose-600 sm:text-3xl">
            지갑 연결이 필요합니다. 연결 후 이용하십시오.
          </p>
        </div>
      </main>
    );
  }

  return (

    <main className="min-h-[100vh] bg-[radial-gradient(120%_120%_at_0%_0%,#fff7ed_0%,#fef2f2_38%,#eff6ff_78%,#f8fafc_100%)] px-4 py-8">


      <AutoConnect
          client={client}
          wallets={[wallet]}
      />


      <div className="w-full max-w-screen-sm mx-auto">
        
        <div className="rounded-[32px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.7)] backdrop-blur">

  
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100">
                <Image
                  src="/icon-back.png"
                  alt="Back"
                  width={18}
                  height={18}
                  className="rounded-full"
                />
              </span>
              돌아가기
            </button>

          </div>

          <div className="mt-5 flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 shadow-sm">
                <Image
                  src="/logo-tether.svg"
                  alt="USDT"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Wallet Transfer
                </span>
                <span className="text-xl font-semibold text-slate-900">
                  {Withdraw_USDT}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500">보안 기준을 충족한 사용자만 출금할 수 있습니다.</p>
          </div>

          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              네트워크 선택
            </span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value as NetworkKey)}
              disabled={sending}
              className={`w-full rounded-xl border px-3 py-2 text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                sending
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
              aria-label="네트워크 선택"
            >
              {NETWORK_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              선택한 네트워크 기준으로 잔고와 출금이 처리됩니다.
            </p>
          </div>

              

          {address && (
            <div className="mt-6 rounded-2xl border border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,253,250,0.85))] p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    My Wallet
                  </span>
                  <button
                    className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900"
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      toast.success(Copied_Wallet_Address);
                    }}
                  >
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {smartAccountEnabled && (
                    <div className="relative">
                      <span className="absolute -inset-1 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.75),rgba(249,115,22,0.25),transparent_70%)] blur-lg" />
                      <span className="relative inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-3 py-1 text-[11px] font-bold text-white shadow-[0_12px_28px_-16px_rgba(249,115,22,0.9)]">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]" />
                        스마트 어카운트
                      </span>
                    </div>
                  )}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200/70 bg-white shadow-sm">
                    <Image
                      src="/icon-shield.png"
                      alt="Wallet"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-end gap-2">
                <span className="text-3xl sm:text-4xl font-semibold text-emerald-700 tabular-nums"
                  style={{ fontFamily: 'monospace' }}
                >
                  {Number(balance).toFixed(3)}
                </span>
                <span className="text-sm font-semibold text-slate-500">USDT</span>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {NETWORK_OPTIONS.map((option) => {
              const value = nativeBalances[option.id];
              return (
                <div
                  key={option.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {option.label}
                    </span>
                    {option.id === selectedNetwork && (
                      <span className="rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        선택됨
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-lg font-semibold text-slate-800 tabular-nums">
                      {value == null
                        ? '...'
                        : value.toFixed(4)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {option.nativeSymbol}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.5)]">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-900">출금 요청</span>
              <p className="text-sm text-slate-500">{Enter_the_amount_and_recipient_address}</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="text-xs font-semibold text-emerald-600 underline decoration-emerald-200 underline-offset-2 transition hover:text-emerald-700"
                  >
                    잔고 전체 선택
                  </button>
                </div>
                <div className="relative">
                  <input
                    disabled={sending}
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className={`
                      w-full rounded-2xl border px-4 py-4 pr-20 text-right text-3xl font-semibold text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-emerald-400
                      ${sending ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-200 bg-white'}
                    `}
                    value={amountInput}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    USDT
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  사용 가능: {formatAmountInput(maxAmount, selectedNetworkConfig.decimals)} USDT
                </div>
              </div>
            

              
              
                  {!wantToReceiveWalletAddress ? (
                    <>
                    <div className='w-full flex flex-row gap-4 items-center justify-between'>
                      <select
                        disabled={sending}

                        className="
                          
                          w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-semibold text-slate-800 shadow-sm "
                          
                        value={
                          recipient?.nickname
                        }


                        onChange={(e) => {

                          const selectedUser = users.find((user) => user.nickname === e.target.value) as any;

                          console.log("selectedUser", selectedUser);

                          setRecipient(selectedUser);

                        } } 

                      >
                        <option value="">{Select_a_user}</option>
                        

                        {users.map((user) => (
                          <option key={user.id} value={user.nickname}>{user.nickname}</option>
                        ))}
                      </select>

                      {/* select user profile image */}

                      <div className="w-full flex flex-row gap-2 items-center justify-center">
                        <Image
                          src={recipient?.avatar || '/profile-default.png'}
                          alt="profile"
                          width={38}
                          height={38}
                          className="rounded-full border border-slate-200 bg-white"
                          style={{
                            objectFit: 'cover',
                            width: '38px',
                            height: '38px',
                          }}
                        />

                        {recipient?.walletAddress && (
                          <Image
                            src="/verified.png"
                            alt="check"
                            width={28}
                            height={28}
                          />
                        )}

                      </div>

                      


                    </div>
                

                      {/* input wallet address */}
                      
                      <input
                        disabled={true}
                        type="text"
                        placeholder={User_wallet_address}
                        className="w-80 xl:w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"
                        value={recipient?.walletAddress}
                        onChange={(e) => {
        
                          
                          
                            getUserByWalletAddress(e.target.value)

                            .then((data) => {

                              //console.log("data", data);

                              const checkUser = data;

                              if (checkUser) {
                                setRecipient(checkUser as any);
                              } else {
                                
                                setRecipient({
                                  ...recipient,
                                  walletAddress: e.target.value,
                                });
                                
                              }

                            });

                        } }
                      />


            


                  </>

                  ) : (

                    <div className='flex flex-col gap-4 items-center justify-between'>
                      <input
                        disabled={sending}
                        type="text"
                        placeholder={User_wallet_address}
                        className="w-80 xl:w-96 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
                        value={recipient.walletAddress}
                        onChange={(e) => setRecipient({
                          ...recipient,
                          walletAddress: e.target.value,
                        })}
                      />

                      {isWhateListedUser ? (
                        <div className="flex flex-row gap-2 items-center justify-center rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">


                          <Image
                            src={recipient.avatar || '/profile-default.png'}
                            alt="profile"
                            width={30}
                            height={30}
                            className="rounded-full"
                            style={{
                              objectFit: 'cover',
                              width: '38px',
                              height: '38px',
                            }}
                          />
                          <div>{recipient?.nickname}</div>
                          <Image
                            src="/verified.png"
                            alt="check"
                            width={30}
                            height={30}
                          />
                          
                        </div>
                      ) : (
                        <>

                        {recipient?.walletAddress && (
                          <div className='flex flex-row gap-2 items-start justify-center rounded-xl border border-rose-200/70 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600'>
                            {/* dot icon */}
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                            <div>
                              {This_address_is_not_white_listed}
                              <br />
                              {If_you_are_sure_please_click_the_send_button}
                            </div>
                          </div>

                        )}

                        </>
                      )}



                    </div>

                  )} 

                </div>

                {/* otp verification */}
                {/*
                {verifiedOtp ? (
                  <div className="w-full flex flex-row gap-2 items-center justify-center">
                    <Image
                      src="/verified.png"
                      alt="check"
                      width={30}
                      height={30}
                    />
                    <div className="text-white">OTP verified</div>
                  </div>
                ) : (
              
          
                  <div className="w-full flex flex-row gap-2 items-start">

                    <button
                      disabled={!address || !recipient?.walletAddress || !amount || isSendingOtp}
                      onClick={sendOtp}
                      className={`
                        
                        ${isSendedOtp && 'hidden'}

                        w-32 p-2 rounded-lg text-sm font-semibold

                          ${
                          !address || !recipient?.walletAddress || !amount || isSendingOtp
                          ?'bg-gray-300 text-gray-400'
                          : 'bg-green-500 text-white'
                          }
                        
                        `}
                    >
                        Send OTP
                    </button>

                    <div className={`flex flex-row gap-2 items-center justify-center ${!isSendedOtp && 'hidden'}`}>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        className=" w-40 p-2 border border-gray-300 rounded text-black text-sm font-semibold"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />

                      <button
                        disabled={!otp || isVerifingOtp}
                        onClick={verifyOtp}
                        className={`w-32 p-2 rounded-lg text-sm font-semibold

                            ${
                            !otp || isVerifingOtp
                            ?'bg-gray-300 text-gray-400'
                            : 'bg-green-500 text-white'
                            }
                          
                          `}
                      >
                          Verify OTP
                      </button>
                    </div>

                  </div>

                )}
                  */}

                



                <button
                  disabled={!address || !recipient?.walletAddress || !amount || sending || !verifiedOtp}
                  onClick={sendUsdt}
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-lg font-semibold transition-all duration-200 ease-in-out

                      ${
                      !address || !recipient?.walletAddress || !amount || sending || !verifiedOtp
                      ?'bg-slate-200 text-slate-400'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_20px_40px_-22px_rgba(16,185,129,0.7)] hover:from-emerald-500 hover:to-emerald-400 hover:-translate-y-0.5'
                      }
                    
                    `}
                >
                    {Send_USDT}
                </button>

                <div className="w-full flex flex-row gap-2 text-sm font-semibold text-slate-600">

                  {/* sending rotate animation with white color*/}
                  {sending && (
                    <div className="
                      w-5 h-5
                      border-2 border-slate-400
                      rounded-full
                      animate-spin
                    ">
                      <Image
                        src="/icon-loading.png"
                        alt="loading"
                        width={20}
                        height={20}
                      />
                    </div>
                  )}
                  <div>
                    {sending ? Sending : ''}
                  </div>

                </div>

          </div>



          {address && (
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4">
              <span className="text-xs font-semibold text-slate-400">보안 로그인을 확인했습니다.</span>
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={selectedNetworkConfig.chain}

                theme={"light"}

                // button color is dark skyblue convert (49, 103, 180) to hex
                connectButton={{
                    style: {
                        backgroundColor: "#0047ab", // cobalt blue
                        color: "#f3f4f6", // gray-300
                        padding: "2px 10px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        width: "60x",
                        height: "38px",
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
          )}

        </div>

      </div>

    </main>

  );

}
