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
      <main
        className="min-h-[100vh] bg-[radial-gradient(120%_120%_at_0%_0%,#111827_0%,#0b1020_45%,#04070d_100%)] px-3 py-6 text-slate-100"
        style={{ fontFamily: '"Rajdhani", "Space Grotesk", "Segoe UI", sans-serif' }}
      >
        <AutoConnect
            client={client}
            wallets={[wallet]}
        />
        <div className="mx-auto flex min-h-[65vh] max-w-[360px] items-center justify-center text-center">
          <p className="text-lg font-semibold text-rose-300 sm:text-xl">
            지갑 연결이 필요합니다. 연결 후 이용하십시오.
          </p>
        </div>
      </main>
    );
  }

  return (

    <main
      className="min-h-[100vh] bg-[radial-gradient(120%_120%_at_0%_0%,#111827_0%,#0b1020_45%,#04070d_100%)] px-3 py-6 text-slate-100"
      style={{ fontFamily: '"Rajdhani", "Space Grotesk", "Segoe UI", sans-serif' }}
    >


      <AutoConnect
          client={client}
          wallets={[wallet]}
      />


      <div className="w-full max-w-[360px] mx-auto">
        
        <div className="rounded-[22px] border border-slate-700/60 bg-slate-950/70 p-3 shadow-[0_30px_80px_-55px_rgba(2,6,23,0.9)] ring-1 ring-emerald-400/10 backdrop-blur-sm">

  
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-emerald-400/40"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
                <Image
                  src="/icon-back.png"
                  alt="Back"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              </span>
              돌아가기
            </button>

          </div>

          <div className="mt-3 flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10">
                <Image
                  src="/logo-tether.svg"
                  alt="USDT"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/70">
                  Wallet Transfer
                </span>
                <span className="text-lg font-semibold text-slate-100">
                  {Withdraw_USDT}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">보안 기준을 충족한 사용자만 출금할 수 있습니다.</p>
          </div>

          <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-950/70 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              네트워크 선택
            </span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value as NetworkKey)}
              disabled={sending}
              className={`w-full rounded-xl border px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${
                sending
                  ? 'cursor-not-allowed border-slate-800 bg-slate-900/60 text-slate-500'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
              aria-label="네트워크 선택"
            >
              {NETWORK_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              선택한 네트워크 기준으로 잔고와 출금이 처리됩니다.
            </p>
          </div>

              

          {address && (
            <div className="mt-4 rounded-2xl border border-slate-700/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,6,23,0.95))] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    My Wallet
                  </span>
                  <button
                    className="text-xs font-semibold text-emerald-200 underline decoration-emerald-400/40 underline-offset-2 transition hover:text-emerald-100"
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
                      <span className="relative inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-3 py-1 text-[11px] font-bold text-white shadow-[0_12px_28px_-16px_rgba(249,115,22,0.9)]">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]" />
                        스마트 어카운트
                      </span>
                    </div>
                  )}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 bg-slate-900">
                    <Image
                      src="/icon-shield.png"
                      alt="Wallet"
                      width={18}
                      height={18}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-end gap-2">
                <span className="text-2xl sm:text-3xl font-semibold text-emerald-300 tabular-nums"
                  style={{ fontFamily: 'monospace' }}
                >
                  {Number(balance).toFixed(3)}
                </span>
                <span className="text-xs font-semibold text-slate-400">USDT</span>
              </div>
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {NETWORK_OPTIONS.map((option) => {
              const value = nativeBalances[option.id];
              return (
                <div
                  key={option.id}
                  className="rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {option.label}
                    </span>
                    {option.id === selectedNetwork && (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                        선택됨
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-base font-semibold text-slate-100 tabular-nums">
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

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/70 p-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-100">출금 요청</span>
              <p className="text-xs text-slate-400">{Enter_the_amount_and_recipient_address}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="text-[11px] font-semibold text-emerald-300 underline decoration-emerald-400/40 underline-offset-2 transition hover:text-emerald-200"
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
                      w-full rounded-xl border px-3 py-3 pr-16 text-right text-2xl font-semibold text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.35)] focus:outline-none focus:ring-2 focus:ring-emerald-400/60
                      ${sending ? 'border-slate-800 bg-slate-900/60 text-slate-500' : 'border-slate-700 bg-slate-900'}
                    `}
                    value={amountInput}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    USDT
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  사용 가능: {formatAmountInput(maxAmount, selectedNetworkConfig.decimals)} USDT
                </div>
              </div>
            

              
              
                  {!wantToReceiveWalletAddress ? (
                    <>
                    <div className='w-full flex flex-row gap-3 items-center justify-between'>
                      <select
                        disabled={sending}

                        className="
                          w-52 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-100 "
                          
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
                          width={32}
                          height={32}
                          className="rounded-full border border-slate-700 bg-slate-900"
                          style={{
                            objectFit: 'cover',
                            width: '32px',
                            height: '32px',
                          }}
                        />

                        {recipient?.walletAddress && (
                          <Image
                            src="/verified.png"
                            alt="check"
                            width={22}
                            height={22}
                          />
                        )}

                      </div>

                      


                    </div>
                

                      {/* input wallet address */}
                      
                      <input
                        disabled={true}
                        type="text"
                        placeholder={User_wallet_address}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-400"
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

                    <div className='flex flex-col gap-3 items-center justify-between'>
                      <input
                        disabled={sending}
                        type="text"
                        placeholder={User_wallet_address}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-100"
                        value={recipient.walletAddress}
                        onChange={(e) => setRecipient({
                          ...recipient,
                          walletAddress: e.target.value,
                        })}
                      />

                      {isWhateListedUser ? (
                        <div className="flex flex-row gap-2 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">


                          <Image
                            src={recipient.avatar || '/profile-default.png'}
                            alt="profile"
                            width={26}
                            height={26}
                            className="rounded-full"
                            style={{
                              objectFit: 'cover',
                              width: '26px',
                              height: '26px',
                            }}
                          />
                          <div>{recipient?.nickname}</div>
                          <Image
                            src="/verified.png"
                            alt="check"
                            width={24}
                            height={24}
                          />
                          
                        </div>
                      ) : (
                        <>

                        {recipient?.walletAddress && (
                          <div className='flex flex-row gap-2 items-start justify-center rounded-xl border border-rose-400/40 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-200'>
                            {/* dot icon */}
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-400"></div>
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
                  className={`mt-1.5 w-full rounded-xl px-4 py-2.5 text-base font-semibold transition-all duration-200 ease-in-out

                      ${
                      !address || !recipient?.walletAddress || !amount || sending || !verifiedOtp
                      ?'bg-slate-800 text-slate-500'
                      : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-900 shadow-[0_20px_40px_-22px_rgba(16,185,129,0.6)] hover:-translate-y-0.5'
                      }
                    
                    `}
                >
                    {Send_USDT}
                </button>

                <div className="w-full flex flex-row gap-2 text-xs font-semibold text-slate-400">

                  {/* sending rotate animation with white color*/}
                  {sending && (
                    <div className="
                      w-4 h-4
                      border-2 border-slate-500
                      rounded-full
                      animate-spin
                    ">
                      <Image
                        src="/icon-loading.png"
                        alt="loading"
                        width={16}
                        height={16}
                      />
                    </div>
                  )}
                  <div>
                    {sending ? Sending : ''}
                  </div>

                </div>

          </div>



          {address && (
            <div className="mt-4 flex items-center justify-between gap-2.5 border-t border-slate-800/70 pt-3">
              <span className="text-[11px] font-semibold text-slate-400">보안 로그인을 확인했습니다.</span>
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={selectedNetworkConfig.chain}

                theme={"dark"}

                // button color is dark skyblue convert (49, 103, 180) to hex
                connectButton={{
                    style: {
                        backgroundColor: "#0b1220",
                        color: "#e2e8f0",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        width: "60x",
                        height: "34px",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
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
