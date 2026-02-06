'use client';

import { useState, useEffect, use, act, useRef, useMemo } from "react";

import Image from "next/image";



// open modal

///import Modal from '@/components/modal';

import ModalUser from '@/components/modal-user';

import { useRouter }from "next//navigation";


import { toast } from 'react-hot-toast';

import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import GroupChannel from "@sendbird/uikit-react/GroupChannel";
import { useSendbird } from "@sendbird/uikit-react";
import { GroupChannelHandler } from "@sendbird/chat/groupChannel";

import {
  clientId,
  client
} from "../../../client";



import {

  getContract,
  sendAndConfirmTransaction,
  sendTransaction,
  waitForReceipt,
  sendBatchTransaction,

  readContract,
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
} from "thirdweb/wallets";





import { getUserPhoneNumber } from "thirdweb/wallets/in-app";


import { balanceOf, transfer } from "thirdweb/extensions/erc20";
import { add } from "thirdweb/extensions/farcaster/keyGateway";
 


import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../dictionaries";
//import Chat from "@/components/Chat";
import { ClassNames } from "@emotion/react";


import useSound from 'use-sound';

import { useSearchParams } from 'next/navigation';
import { useClientWallets } from "@/lib/useClientWallets";

import { getAllUsersForSettlementOfStore } from "@/lib/api/user";


import { paymentUrl } from "../../../config/payment";
import { version } from "../../../config/version";


import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
} from "thirdweb/chains";

import {
  chain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,

  bscContractAddressMKRW,
} from "@/app/config/contractAddresses";



import { useAnimatedNumber } from "@/components/useAnimatedNumber";




interface BuyOrder {
  _id: string;
  createdAt: string;
  walletAddress: string;
  isWeb3Wallet: boolean;
  nickname: string;
  avatar: string;
  trades: number;
  price: number;
  available: number;
  limit: string;
  paymentMethods: string[];

  usdtAmount: number;
  krwAmount: number;
  rate: number;



  seller: any;

  tradeId: string;
  status: string;
  acceptedAt: string;
  paymentRequestedAt: string;
  paymentConfirmedAt: string;
  paymentAmount: number;
  cancelledAt: string;


  buyer: any;

  canceller: string;

  escrowTransactionHash: string;
  transactionHash: string;

  storecode: string;
  store: any;

  settlement: any;

  agentFeeRate: number;
  centerFeeRate: number;
  tradeFeeRate: number;

  cancelTradeReason: string;


  autoConfirmPayment: boolean;

  agent: any;

  userStats: any;


  settlementUpdatedAt: string;
  settlementUpdatedBy: string; // who updates the settlement

  transactionHashFail: boolean; // if the transaction failed, set this to true

  audioOn: boolean; // default true, used for audio notification in trade history page



  paymentMethod: string;

  escrowWallet: {
    address: string;
    balance: number;
    transactionHash: string;
  };

  platformFee: {
    percentage: number;
    address: string;
  };

}

type SellerChatItem = {
  channelUrl: string;
  members: { userId: string; nickname?: string; profileUrl?: string }[];
  lastMessage?: string;
  updatedAt?: number;
  unreadMessageCount?: number;
};


const walletAuthOptions = ["google", "email", "phone"];

const SENDBIRD_APP_ID = process.env.NEXT_PUBLIC_SENDBIRD_APP_ID || process.env.SENDBIRD_APP_ID || '';

type BannerAd = {
  id: string;
  title: string;
  image: string;
  link: string;
};

const TypingText = ({
  text,
  speed = 60,
  pause = 2200,
  className,
  cursorClassName = 'typing-cursor',
}: {
  text: string;
  speed?: number;
  pause?: number;
  className?: string;
  cursorClassName?: string;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pause'>('typing');

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setPhase('typing');
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplayText(text);
      setPhase('pause');
      return;
    }

    setDisplayText('');
    setPhase('typing');
  }, [text]);

  useEffect(() => {
    if (!text) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let timeoutId: number | undefined;

    if (phase === 'typing') {
      if (displayText.length < text.length) {
        timeoutId = window.setTimeout(() => {
          const nextLength = displayText.length + 1;
          setDisplayText(text.slice(0, nextLength));
          if (nextLength === text.length) {
            setPhase('pause');
          }
        }, speed);
      }
    } else if (phase === 'pause' && displayText.length > 0) {
      timeoutId = window.setTimeout(() => {
        setDisplayText('');
        setPhase('typing');
      }, pause);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [displayText, pause, phase, speed, text]);

  const isPaused = phase === 'pause' && displayText.length === text.length;
  const showCursor = displayText.length > 0;
  const combinedClassName = `${className ?? ''}${isPaused ? ' typing-flash' : ''}`;

  return (
    <span className={combinedClassName}>
      {displayText}
      {showCursor && (
        <span className={cursorClassName} aria-hidden="true">
          |
        </span>
      )}
    </span>
  );
};



export default function Index({ params }: any) {
  const { wallet, wallets } = useClientWallets({ authOptions: walletAuthOptions });

  const sellerWalletAddress = params.sellerWalletAddress;
  const buyAmount = params.buyAmount;

  const searchParams = useSearchParams();
 
  ////////const wallet = searchParams.get('wallet');


  // limit, page number params
  /*
  const limit = searchParams.get('limit') || 20;
  const page = searchParams.get('page') || 1;

  useEffect(() => {
    if (searchParams.get('limit')) {
      setLimitValue(searchParams.get('limit') || 20);
    }
    if (searchParams.get('page')) {
      setPageValue(searchParams.get('page') || 1);
    }
  }, [searchParams]);
  */


 




  const searchParamsStorecode = searchParams.get('storecode') || "";


  const activeWallet = useActiveWallet();


  const contract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    
    
    //chain: arbitrum,
    chain:  chain === "ethereum" ? ethereum :
            chain === "polygon" ? polygon :
            chain === "arbitrum" ? arbitrum :
            chain === "bsc" ? bsc : arbitrum,
  
  
  
    // the contract's address
    ///address: contractAddressArbitrum,

    address: chain === "ethereum" ? ethereumContractAddressUSDT :
            chain === "polygon" ? polygonContractAddressUSDT :
            chain === "arbitrum" ? arbitrumContractAddressUSDT :
            chain === "bsc" ? bscContractAddressUSDT : arbitrumContractAddressUSDT,


    // OPTIONAL: the contract's abi
    //abi: [...],
  });




  const contractMKRW = getContract({
    // the client you have created via `createThirdwebClient()`
    client,

    // the chain the contract is deployed on
    chain: bsc,

    // the contract's address
    address: bscContractAddressMKRW,

    // OPTIONAL: the contract's abi
    //abi: [...],
  });







 




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
    Buy: "",
    Sell: "",
    Amount: "",
    Price: "",
    Total: "",
    Orders: "",
    Trades: "",
    Search_my_trades: "",

    Anonymous: "",

    Seller: "",
    Buyer: "",
    Me: "",

    Buy_USDT: "",
    Rate: "",
    Payment: "",
    Bank_Transfer: "",

    I_agree_to_the_terms_of_trade: "",
    I_agree_to_cancel_the_trade: "",

    Opened_at: "",
    Cancelled_at: "",
    Completed_at: "",


    Opened: "",
    Completed: "",
    Cancelled: "",


    Waiting_for_seller_to_deposit: "",

    to_escrow: "",
    If_the_seller_does_not_deposit_the_USDT_to_escrow: "",
    this_trade_will_be_cancelled_in: "",

    Cancel_My_Trade: "",


    Order_accepted_successfully: "",
    Order_has_been_cancelled: "",
    My_Order: "",

    hours: "",
    minutes: "",
    seconds: "",

    hours_ago: "",
    minutes_ago: "",
    seconds_ago: "",

    Order_Opened: "",
    Trade_Started: "",
    Expires_in: "",

    Accepting_Order: "",

    Escrow: "",

    Chat_with_Seller: "",
    Chat_with_Buyer: "",

    Table_View: "",

    TID: "",

    Status: "",

    Sell_USDT: "",

    Buy_Order_Opened: "",
  
    Insufficient_balance: "",


    Request_Payment: "",

    Payment_has_been_confirmed: "",

    Confirm_Payment: "",

    Escrow_Completed: "",

    Buy_Order_Accept: "",

    Payment_Amount: "",

    Buy_Amount: "",

    Deposit_Name: "",

    My_Balance: "",

    Make_Escrow_Wallet: "",
    Escrow_Wallet_Address_has_been_created: "",
    Failed_to_create_Escrow_Wallet_Address: "",

    Newest_order_has_been_arrived: "",
    Payment_request_has_been_sent: "",
    Escrow_balance_is_less_than_payment_amount: "",

    Copied_Wallet_Address: "",


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
    Buy,
    Sell,
    Amount,
    Price,
    Total,
    Orders,
    Trades,
    Search_my_trades,

    Anonymous,

    Seller,
    Buyer,
    Me,

    Buy_USDT,
    Rate,
    Payment,
    Bank_Transfer,
    I_agree_to_the_terms_of_trade,
    I_agree_to_cancel_the_trade,

    Opened_at,
    Cancelled_at,
    Completed_at,

    Opened,
    Completed,
    Cancelled,

    Waiting_for_seller_to_deposit,

    to_escrow,

    If_the_seller_does_not_deposit_the_USDT_to_escrow,
    this_trade_will_be_cancelled_in,

    Cancel_My_Trade,

    Order_accepted_successfully,
    Order_has_been_cancelled,
    My_Order,

    hours,
    minutes,
    seconds,

    hours_ago,
    minutes_ago,
    seconds_ago,

    Order_Opened,
    Trade_Started,
    Expires_in,

    Accepting_Order,

    Escrow,

    Chat_with_Seller,
    Chat_with_Buyer,

    Table_View,

    TID,

    Status,

    Sell_USDT,

    Buy_Order_Opened,

    Insufficient_balance,

    Request_Payment,

    Payment_has_been_confirmed,

    Confirm_Payment,

    Escrow_Completed,

    Buy_Order_Accept,

    Payment_Amount,

    Buy_Amount,

    Deposit_Name,

    My_Balance,

    Make_Escrow_Wallet,
    Escrow_Wallet_Address_has_been_created,
    Failed_to_create_Escrow_Wallet_Address,

    Newest_order_has_been_arrived,
    Payment_request_has_been_sent,
    Escrow_balance_is_less_than_payment_amount,

    Copied_Wallet_Address,

  } = data;




  const router = useRouter();



  /*
  const setActiveAccount = useSetActiveWallet();
 

  const connectWallets = useConnectedWallets();

  const smartConnectWallet = connectWallets?.[0];
  const inAppConnectWallet = connectWallets?.[1];
  */


  const activeAccount = useActiveAccount();

  const address = activeAccount?.address;



  const [phoneNumber, setPhoneNumber] = useState("");

  
  useEffect(() => {

    if (address) {

  

      //const phoneNumber = await getUserPhoneNumber({ client });
      //setPhoneNumber(phoneNumber);


      getUserPhoneNumber({ client }).then((phoneNumber) => {
        setPhoneNumber(phoneNumber || "");
      });

    }

  } , [address]);
  


  //const [nativeBalance, setNativeBalance] = useState(0);
  const [balance, setBalance] = useState(0);
  useEffect(() => {

    // get the balance
    const getBalance = async () => {

      if (!address) {
        setBalance(0);
        return;
      }

      
      const result = await balanceOf({
        contract,
        address: address,
      });

  
      if (chain === 'bsc') {
        setBalance( Number(result) / 10 ** 18 );
      } else {
        setBalance( Number(result) / 10 ** 6 );
      }


    };


    if (address) getBalance();

    
    const interval = setInterval(() => {
      if (address) getBalance();
    } , 5000);

    return () => clearInterval(interval);
    

  } , [address, contract]);




  // balance of MKRW
  const [mkrwBalance, setMkrwBalance] = useState(0);
  useEffect(() => {
    if (!address) {
      return;
    }
    // get the balance
    const getMkrwBalance = async () => {
      const result = await balanceOf({
        contract: contractMKRW,
        address: address,
      });
  
      setMkrwBalance( Number(result) / 10 ** 18 );

  
    };
    if (address) getMkrwBalance();
    const interval = setInterval(() => {
      if (address) getMkrwBalance();
    } , 5000);
    return () => clearInterval(interval);
  }, [address, contractMKRW]);


  const [ownerWalletAddress, setOwnerWalletAddress] = useState('');
  useEffect(() => {
    if (sellerWalletAddress) {
      // api call to get sell owner wallet address by sellerEscrowWalletAddress
      fetch('/api/user/getSellOwnerWalletAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: "admin",
          escrowWalletAddress: sellerWalletAddress,
        }),
      })
      .then(response => response.json())
      .then(data => {
        
        
        ///console.log('getSellOwnerWalletAddress data', data);


        if (data.walletAddress) {
          setOwnerWalletAddress(data.walletAddress);
        }
      });
    }
  }, [sellerWalletAddress]);

  const isOwnerSeller = Boolean(
    address &&
    ownerWalletAddress &&
    address === ownerWalletAddress
  );

  useEffect(() => {
    if (!ownerWalletAddress || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('sellerOwnerWalletAddress', ownerWalletAddress);
    window.dispatchEvent(new Event('seller-owner-wallet-address'));
  }, [ownerWalletAddress]);

  const [selectedChatChannelUrl, setSelectedChatChannelUrl] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [sellerChatItems, setSellerChatItems] = useState<SellerChatItem[]>([]);
  const [sellerChatLoading, setSellerChatLoading] = useState(false);
  const [sellerChatError, setSellerChatError] = useState<string | null>(null);
  const [globalBannerAds, setGlobalBannerAds] = useState<BannerAd[]>([]);
  const chatUnreadTotalRef = useRef<number | null>(null);
  const chatInitializedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const fetchGlobalAds = async () => {
      try {
        const response = await fetch('/api/globalAd/getActive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placement: 'p2p-home',
            limit: 12,
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const ads = Array.isArray(data?.result) ? data.result : [];
        const normalized = ads
          .map((ad: any, index: number) => {
            const image =
              ad?.image ||
              ad?.imageUrl ||
              ad?.banner ||
              ad?.bannerImage ||
              ad?.bannerUrl;
            const link =
              ad?.link ||
              ad?.linkUrl ||
              ad?.url ||
              ad?.redirectUrl ||
              ad?.targetUrl;

            if (!image || !link) {
              return null;
            }

            return {
              id: String(ad?._id ?? ad?.id ?? index),
              title: ad?.title || ad?.name || '제휴 배너',
              image,
              link,
            } as BannerAd;
          })
          .filter(Boolean) as BannerAd[];

        if (active) {
          setGlobalBannerAds(normalized);
        }
      } catch (error) {
        // ignore
      }
    };

    fetchGlobalAds();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    chatInitializedRef.current = false;
    chatUnreadTotalRef.current = null;

    const fetchSellerChats = async () => {
      if (!ownerWalletAddress) {
        if (isMounted) {
          setSellerChatItems([]);
          setSellerChatError(null);
        }
        return;
      }

      setSellerChatLoading(true);
      setSellerChatError(null);

      try {
        const response = await fetch('/api/sendbird/user-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: ownerWalletAddress,
            limit: 10,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || '대화목록을 불러오지 못했습니다.');
        }

        const data = (await response.json()) as { items?: SellerChatItem[] };
        if (isMounted) {
          setSellerChatItems(data.items || []);
          chatInitializedRef.current = true;
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : '대화목록을 불러오지 못했습니다.';
          setSellerChatError(message);
        }
      } finally {
        if (isMounted) {
          setSellerChatLoading(false);
        }
      }
    };

    fetchSellerChats();
    if (ownerWalletAddress) {
      intervalId = setInterval(fetchSellerChats, 15000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ownerWalletAddress]);

  useEffect(() => {
    if (!ownerWalletAddress) {
      chatUnreadTotalRef.current = null;
      chatInitializedRef.current = false;
      return;
    }
    if (!chatInitializedRef.current) {
      return;
    }
    if (!sellerChatItems.length) {
      chatUnreadTotalRef.current = 0;
      return;
    }

    const unreadTotal = sellerChatItems.reduce(
      (sum, item) => sum + (item.unreadMessageCount ?? 0),
      0
    );
    const previousUnread = chatUnreadTotalRef.current;

    if (previousUnread === null) {
      chatUnreadTotalRef.current = unreadTotal;
      return;
    }

    if (unreadTotal > previousUnread && !isChatOpen) {
      const nextChannel = sellerChatItems.find((item) => (item.unreadMessageCount ?? 0) > 0)?.channelUrl;
      if (nextChannel) {
        setSelectedChatChannelUrl(nextChannel);
      }
      setIsChatOpen(true);
    }

    chatUnreadTotalRef.current = unreadTotal;
  }, [ownerWalletAddress, sellerChatItems, isChatOpen]);








  const [escrowWalletAddress, setEscrowWalletAddress] = useState('');
  const [makeingEscrowWallet, setMakeingEscrowWallet] = useState(false);

  const makeEscrowWallet = async () => {
      
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }


    setMakeingEscrowWallet(true);

    fetch('/api/order/getEscrowWalletAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lang: params.lang,
        storecode: "admin",
        walletAddress: address,
        //isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
        isSmartAccount: false,
      }),
    })
    .then(response => response.json())
    .then(data => {
        
        //console.log('getEscrowWalletAddress data.result', data.result);


        if (data.result) {
          setEscrowWalletAddress(data.result.escrowWalletAddress);
          toast.success(Escrow_Wallet_Address_has_been_created);
        } else {
          toast.error(Failed_to_create_Escrow_Wallet_Address);
        }
    })
    .finally(() => {
      setMakeingEscrowWallet(false);
    });

  }

  //console.log("escrowWalletAddress", escrowWalletAddress);




  // get escrow wallet address and balance
  
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [escrowNativeBalance, setEscrowNativeBalance] = useState(0);

  
  useEffect(() => {

    const getEscrowBalance = async () => {

      if (!address) {
        setEscrowBalance(0);
        return;
      }

      if (!escrowWalletAddress || escrowWalletAddress === '') return;


      
      const result = await balanceOf({
        contract,
        address: escrowWalletAddress,
      });

      //console.log('escrowWalletAddress balance', result);

  
      setEscrowBalance( Number(result) / 10 ** 6 );
            


      /*
      await fetch('/api/user/getUSDTBalanceByWalletAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: "admin",
          walletAddress: escrowWalletAddress,
        }),
      })
      .then(response => response?.json())
      .then(data => {

        console.log('getUSDTBalanceByWalletAddress data.result.displayValue', data.result?.displayValue);

        setEscrowBalance(data.result?.displayValue);

      } );
       */




      await fetch('/api/user/getBalanceByWalletAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: "admin",
          walletAddress: escrowWalletAddress,
        }),
      })
      .then(response => response?.json())
      .then(data => {


        ///console.log('getBalanceByWalletAddress data', data);


        setEscrowNativeBalance(data.result?.displayValue);

      });
      



    };

    getEscrowBalance();

    const interval = setInterval(() => {
      getEscrowBalance();
    } , 5000);

    return () => clearInterval(interval);

  } , [address, escrowWalletAddress, contract,]);
  

  //console.log('escrowBalance', escrowBalance);







  

  // get User by wallet address
  const [isAdmin, setIsAdmin] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  useEffect(() => {

    if (!address) {

      setUser(null);
      return;
    }

    setLoadingUser(true);

    fetch('/api/user/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            storecode: "admin",
            walletAddress: address,
        }),
    })
    .then(response => response.json())
    .then(data => {
        
        //console.log('data.result', data.result);


        setUser(data.result);

        setEscrowWalletAddress(data.result.escrowWalletAddress);

        setIsAdmin(data.result?.role === "admin");

    })
    .catch((error) => {
        console.error('Error:', error);
    });


    setLoadingUser(false);

  } , [address]);



  const [isPlaying, setIsPlaying] = useState(false);
  //const [play, { stop }] = useSound(galaxySfx);
  const [play, { stop }] = useSound('/ding.mp3');

  function playSong() {
    setIsPlaying(true);
    play();
  }

  function stopSong() {
    setIsPlaying(false);
    stop();
  }






  const [isModalOpen, setModalOpen] = useState(false);

  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  
  
  
  
  const [searchStorecode, setSearchStorecode] = useState("");
  useEffect(() => {
    setSearchStorecode(searchParamsStorecode || "");
  }, [searchParamsStorecode]);






  const [searchStoreName, setSearchStoreName] = useState("");




  const [searchOrderStatusCancelled, setSearchOrderStatusCancelled] = useState(false);
  const [searchOrderStatusCompleted, setSearchOrderStatusCompleted] = useState(false);


  const [searchMyOrders, setSearchMyOrders] = useState(false);






  /*
  // search form date to date
  const [searchFormDate, setSearchFromDate] = useState("");
  // from date is not today, but today - 30 days
  useEffect(() => {
    
    ///from date isAdmin not today, but today - 30 days
    const today = new Date();
    const formattedDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0]; // YYYY-MM-DD format
    setSearchFromDate(formattedDate);
  }, []);



  const [searchToDate, setSearchToDate] = useState("");
  useEffect(() => {
    const today = new Date();
    const toDate = new Date(today.setDate(today.getDate() + 1)); // add 1 day to today
    setSearchToDate(toDate.toISOString().split('T')[0]); // YYYY-MM-DD format
  }, []);
  */



  /*
  // limit number
  const [limitValue, setLimitValue] = useState(limit || 20);

  // page number
  const [pageValue, setPageValue] = useState(page || 1);
  */

 const [limitValue, setLimitValue] = useState(20);
  useEffect(() => {
    const limit = searchParams.get('limit') || 20;
    const nextLimit = Number(limit);
    setLimitValue((prev) => (Object.is(prev, nextLimit) ? prev : nextLimit));
  }, [searchParams]);



  const [pageValue, setPageValue] = useState(1);
  useEffect(() => {
    const page = searchParams.get('page') || 1;
    const nextPage = Number(page);
    setPageValue((prev) => (Object.is(prev, nextPage) ? prev : nextPage));
  }, [searchParams]);



  //const today = new Date();
  //today.setHours(today.getHours() + 9); // Adjust for Korean timezone (UTC+9)
  //const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  // search form date to date
  //const [searchFromDate, setSearchFromDate] = useState(formattedDate);
  //const [searchToDate, setSearchToDate] = useState(formattedDate);

  // from last 30 days
  const [today] = useState(new Date());
  const [thirtyDaysAgo] = useState(new Date(new Date().setDate(today.getDate() - 30)));
  const formattedToDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const formattedFromDate = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD format

  const [searchFromDate, setSearchFromDate] = useState(formattedFromDate);
  const [searchToDate, setSearchToDate] = useState(formattedToDate);




  //const [totalCount, setTotalCount] = useState(0);
    
  const [buyOrders, setBuyOrders] = useState<BuyOrder[]>([]);



  /*
  getAllBuyOrders result totalCount 367
getAllBuyOrders result totalKrwAmount 91645000
getAllBuyOrders result totalUsdtAmount 66409.36
getAllBuyOrders result totalSettlementCount 367
getAllBuyOrders result totalSettlementAmount 66021.883
getAllBuyOrders result totalSettlementAmountKRW 91110233
getAllBuyOrders result totalFeeAmount 387.477
getAllBuyOrders result totalFeeAmountKRW 534718.74
getAllBuyOrders result totalAgentFeeAmount 0
getAllBuyOrders result totalAgentFeeAmountKRW 0
*/
  /*
  const [buyOrderStats, setBuyOrderStats] = useState({
    totalCount: 0,
    totalKrwAmount: 0,
    totalUsdtAmount: 0,
    totalSettlementCount: 0,
    totalSettlementAmount: 0,
    totalSettlementAmountKRW: 0,
    totalFeeAmount: 0,
    totalFeeAmountKRW: 0,
    totalAgentFeeAmount: 0,
    totalAgentFeeAmountKRW: 0,
  });

  */

 const [buyOrderStats, setBuyOrderStats] = useState<{
    totalCount: number;
    totalKrwAmount: number;
    totalUsdtAmount: number;
    totalSettlementCount: number;
    totalSettlementAmount: number;
    totalSettlementAmountKRW: number;
    totalFeeAmount: number;
    totalFeeAmountKRW: number;
    totalAgentFeeAmount: number;
    totalAgentFeeAmountKRW: number;

    /*
    totalByUserType: Array<{
      _id: string;
      totalCount: number;
      totalKrwAmount: number;
      totalUsdtAmount: number;
    }>;
    */

    totalByBuyerDepositName: Array<{
        _id: string;
        totalCount: number;
        totalKrwAmount: number;
        totalUsdtAmount: number;
      }>;
    totalReaultGroupByBuyerDepositNameCount: number;

    /*
    totalBySellerBankAccountNumber: Array<{
      _id: string;
      totalCount: number;
      totalKrwAmount: number;
      totalUsdtAmount: number;
      bankUserInfo: any;
    }>;
    */
  }>({
    totalCount: 0,
    totalKrwAmount: 0,
    totalUsdtAmount: 0,
    totalSettlementCount: 0,
    totalSettlementAmount: 0,
    totalSettlementAmountKRW: 0,
    totalFeeAmount: 0,
    totalFeeAmountKRW: 0,
    totalAgentFeeAmount: 0,
    totalAgentFeeAmountKRW: 0,

    //totalByUserType: [],
    
    totalByBuyerDepositName: [],
    totalReaultGroupByBuyerDepositNameCount: 0,

    
    //totalBySellerBankAccountNumber: [],
  });




  const animatedTotalCount = useAnimatedNumber(buyOrderStats.totalCount);
  const animatedTotalUsdtAmount = useAnimatedNumber(buyOrderStats.totalUsdtAmount, { decimalPlaces: 3 });
  const animatedTotalKrwAmount = useAnimatedNumber(buyOrderStats.totalKrwAmount);

  const animatedTotalSettlementCount = useAnimatedNumber(buyOrderStats.totalSettlementCount);
  const animatedTotalSettlementAmount = useAnimatedNumber(buyOrderStats.totalSettlementAmount, { decimalPlaces: 3 });
  const animatedTotalSettlementAmountKRW = useAnimatedNumber(buyOrderStats.totalSettlementAmountKRW);







  const [buyerDisplayValueArray, setBuyerDisplayValueArray] = useState<number[]>([]);
  function updateBuyerDisplayValue(index: number, value: number) {
    setBuyerDisplayValueArray((prevValues) => {
      const newValues = [...prevValues];
      newValues[index] = value;
      return newValues;
    });
  }

  useEffect(() => {
    buyOrderStats.totalByBuyerDepositName.forEach((item, index) => {
      const targetValue = item.totalKrwAmount;
      const duration = 1000; // animation duration in ms
      const startValue = buyerDisplayValueArray[index] || 0;
      const startTime = performance.now();
      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = startValue + (targetValue - startValue) * progress;
        updateBuyerDisplayValue(index, Math.round(currentValue));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      requestAnimationFrame(animate);
    });
  }, [buyOrderStats.totalByBuyerDepositName]);










  //console.log('buyOrders', buyOrders);


  // cancel buy order function

  const [cancellingBuyOrders, setCancellingBuyOrders] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    cancellingBuyOrders.push(false);
  }

  const cancelBuyOrderByAdmin = (index: number, orderId: string) => {
    if (cancellingBuyOrders[index]) {
      return;
    }
    setCancellingBuyOrders((prev) =>
      prev.map((item, idx) => idx === index ? true : item)
    );
    fetch('/api/order/cancelBuyOrderByAdmin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: address,
        orderId: orderId,
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('cancelBuyOrder data', data);
      if (data.result) {
        toast.success('Buy order has been cancelled');
        const cancelledAt = new Date().toISOString();
        setBuyOrders((prev) =>
          prev.map((item) =>
            item._id === orderId
              ? {
                  ...item,
                  status: 'cancelled',
                  cancelledAt,
                  cancelTradeReason: '관리자에 의한 취소',
                  canceller: 'admin',
                }
              : item
          )
        );
        setSellersBalance((prev) =>
          prev.map((seller) =>
            seller?.seller?.buyOrder?._id === orderId
              ? {
                  ...seller,
                  seller: {
                    ...seller.seller,
                    buyOrder: {
                      ...seller.seller.buyOrder,
                      status: 'cancelled',
                      cancelledAt,
                      cancelTradeReason: '관리자에 의한 취소',
                    },
                  },
                }
              : seller
          )
        );
      } else {
        toast.error('Failed to cancel buy order');
      }
    })
    .finally(() => {
      setCancellingBuyOrders((prev) =>
        prev.map((item, idx) => idx === index ? false : item)
      );
    });
  }


  



  /* agreement for trade */
  const [agreementForTrade, setAgreementForTrade] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
      agreementForTrade.push(false);
  }
  /*
  useEffect(() => {
      setAgreementForTrade (
          buyOrders.map((item, idx) => {
              return false;
          })
      );
  } , [buyOrders]);
    */
    
    
  // initialize false array of 100
  const [acceptingBuyOrder, setAcceptingBuyOrder] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
      acceptingBuyOrder.push(false);
  }

   



   
    /*
    useEffect(() => {
        setAcceptingBuyOrder (
            buyOrders.map((item, idx) => {
                return false;
            })
        );
    } , [buyOrders]);
     */


    /*
    // sms receiver mobile number array
    const [smsReceiverMobileNumbers, setSmsReceiverMobileNumbers] = useState([] as string[]);
    useEffect(() => {
        setSmsReceiverMobileNumbers(
            buyOrders.map((item, idx) => {
                return user?.mobile || '';
            })
        );
    } , [buyOrders, user]);
    */

  const [smsReceiverMobileNumber, setSmsReceiverMobileNumber] = useState('');
  useEffect(() => {
      setSmsReceiverMobileNumber(phoneNumber);
  } , [phoneNumber]);



  const acceptBuyOrder = (
    index: number,
    orderId: string,
    smsNumber: string,

    tradeId: string,
    walletAddress: string,
  ) => {

      if (!address) {
          toast.error('Please connect your wallet');
          return;
      }

      /*
      if (!escrowWalletAddress || escrowWalletAddress === '') {
        toast.error('에스크로 지갑이 없습니다.');
        return;
      }
      */

      setAcceptingBuyOrder (
        acceptingBuyOrder.map((item, idx) => idx === index ? true : item)
      );


      fetch('/api/order/acceptBuyOrder', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              lang: params.lang,
              storecode: "admin",
              orderId: orderId,
              sellerWalletAddress: address,
              sellerStorecode: "admin",

              /*
              sellerNickname: user ? user.nickname : '',
              sellerAvatar: user ? user.avatar : '',

              //buyerMobile: user.mobile,

              sellerMobile: smsNumber,
              */



              seller: user?.seller,

              tradeId: tradeId,
              buyerWalletAddress: walletAddress,

          }),
      })
      .then(response => response.json())
      .then(data => {

          console.log('data', data);

          //setBuyOrders(data.result.orders);
          //openModal();

          toast.success(Order_accepted_successfully);

          playSong();



          fetch('/api/order/getAllBuyOrders', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(
                {
                  storecode: searchStorecode,
                  limit: Number(limitValue),
                  page: Number(pageValue),
                  walletAddress: address,
                  searchMyOrders: searchMyOrders,
                  searchOrderStatusCancelled: searchOrderStatusCancelled,
                  searchOrderStatusCompleted: searchOrderStatusCompleted,

                  searchStoreName: searchStoreName,

                  fromDate: searchFromDate,
                  toDate: searchToDate,

                }
              ),
          })
          .then(response => response.json())
          .then(data => {
              ///console.log('data', data);
              setBuyOrders(data.result.orders);

              //setTotalCount(data.result.totalCount);

              setBuyOrderStats({
                totalCount: data.result.totalCount,
                totalKrwAmount: data.result.totalKrwAmount,
                totalUsdtAmount: data.result.totalUsdtAmount,
                totalSettlementCount: data.result.totalSettlementCount,
                totalSettlementAmount: data.result.totalSettlementAmount,
                totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
                totalFeeAmount: data.result.totalFeeAmount,
                totalFeeAmountKRW: data.result.totalFeeAmountKRW,
                totalAgentFeeAmount: data.result.totalAgentFeeAmount,
                totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

                totalByBuyerDepositName: data.result.totalByBuyerDepositName,
                totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
              });

          })



      })
      .catch((error) => {
          console.error('Error:', error);
      })
      .finally(() => {


          setAgreementForTrade (
            agreementForTrade.map((item, idx) => idx === index ? false : item)
          );


          setAcceptingBuyOrder (
              acceptingBuyOrder.map((item, idx) => idx === index ? false : item)
          );

      } );


  }







  // agreement for cancel trade
  const [agreementForCancelTrade, setAgreementForCancelTrade] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    agreementForCancelTrade.push(false);
  }
  /*
  useEffect(() => {
    setAgreementForCancelTrade(
      buyOrders.map(() => false)
    );
  } , [buyOrders]);
   */


  // cancelReason
  const [cancelTradeReason, setCancelTradeReason] = useState([] as string[]);
  for (let i = 0; i < 100; i++) {
    cancelTradeReason.push('');
  }




    // cancel sell order state
    const [cancellings, setCancellings] = useState([] as boolean[]);
    for (let i = 0; i < 100; i++) {
      cancellings.push(false);
    }
    /*
    useEffect(() => {
      setCancellings(buyOrders.map(() => false));
    }, [buyOrders]);
    */





  const cancelTrade = async (orderId: string, index: number) => {



    if (cancellings[index]) {
      return;
    }



    setCancellings(
      cancellings.map((item, i) => i === index ? true : item)
    );


    // if escrowWallet is exists, call cancelTradeBySellerWithEscrow API
    const buyOrder = buyOrders[index];

    if (buyOrder?.escrowWallet && buyOrder?.escrowWallet?.transactionHash) {

      try {

      const result = await fetch('/api/order/cancelTradeBySellerWithEscrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          storecode: "admin",
          walletAddress: address,
          cancelTradeReason: cancelTradeReason[index],
        })

      });

      const data = await result.json();
      //console.log('cancelTradeBySellerWithEscrow data', data);


      if (data.result) {

        toast.success(Order_has_been_cancelled);

        playSong();

        await fetch('/api/order/getAllBuyOrders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            {
              storecode: searchStorecode,
              limit: Number(limitValue),
              page: Number(pageValue),
              walletAddress: address,
              searchMyOrders: searchMyOrders,
              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,

              searchStoreName: searchStoreName,

              fromDate: searchFromDate,
              toDate: searchToDate,
            }
          )
        }).then(async (response) => {
          const data = await response.json();
          //console.log('data', data);
          if (data.result) {
            setBuyOrders(data.result.orders);

            ////setTotalCount(data.result.totalCount);

            setBuyOrderStats({
              totalCount: data.result.totalCount,
              totalKrwAmount: data.result.totalKrwAmount,
              totalUsdtAmount: data.result.totalUsdtAmount,
              totalSettlementCount: data.result.totalSettlementCount,
              totalSettlementAmount: data.result.totalSettlementAmount,
              totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
              totalFeeAmount: data.result.totalFeeAmount,
              totalFeeAmountKRW: data.result.totalFeeAmountKRW,
              totalAgentFeeAmount: data.result.totalAgentFeeAmount,
              totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

              totalByBuyerDepositName: data.result.totalByBuyerDepositName,
              totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
            });

          }
        });

      } else {
        toast.error('판매취소에 실패했습니다.');
      }




      } catch (error) {
        console.error('Error cancelling trade with escrow:', error);
        toast.error('판매취소에 실패했습니다.');
        setCancellings(
          cancellings.map((item, i) => i === index ? false : item)
        );
        return;
    }


    } else {

      const response = await fetch('/api/order/cancelTradeBySeller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
          storecode: "admin",
          walletAddress: address,
          cancelTradeReason: cancelTradeReason[index],
        })
      });

      if (!response.ok) {
        toast.error('판매취소에 실패했습니다.');
        setCancellings(
          cancellings.map((item, i) => i === index ? false : item)
        );
        return;
      }

      const data = await response.json();

      ///console.log('data', data);

      if (data.result) {

        toast.success(Order_has_been_cancelled);

        //playSong();


        await fetch('/api/order/getAllBuyOrders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            {
              storecode: searchStorecode,
              limit: Number(limitValue),
              page: Number(pageValue),
              walletAddress: address,
              searchMyOrders: searchMyOrders,
              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,

              searchStoreName: searchStoreName,

              fromDate: searchFromDate,
              toDate: searchToDate,
            }
          )
        }).then(async (response) => {
          const data = await response.json();
          //console.log('data', data);
          if (data.result) {
            setBuyOrders(data.result.orders);

            //setTotalCount(data.result.totalCount);

            setBuyOrderStats({
              totalCount: data.result.totalCount,
              totalKrwAmount: data.result.totalKrwAmount,
              totalUsdtAmount: data.result.totalUsdtAmount,
              totalSettlementCount: data.result.totalSettlementCount,
              totalSettlementAmount: data.result.totalSettlementAmount,
              totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
              totalFeeAmount: data.result.totalFeeAmount,
              totalFeeAmountKRW: data.result.totalFeeAmountKRW,
              totalAgentFeeAmount: data.result.totalAgentFeeAmount,
              totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

              totalByBuyerDepositName: data.result.totalByBuyerDepositName,
              totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
            });


          }
        });

      } else {
        toast.error('판매취소에 실패했습니다.');
      }


    }



    setAgreementForCancelTrade(
      agreementForCancelTrade.map((item, i) => i === index ? false : item)
    );

    setCancellings(
      cancellings.map((item, i) => i === index ? false : item)
    );

  }









    // request payment check box
    const [requestPaymentCheck, setRequestPaymentCheck] = useState([] as boolean[]);
    for (let i = 0; i < 100; i++) {
      requestPaymentCheck.push(false);
    }

    /*
    useEffect(() => {
        
        setRequestPaymentCheck(
          new Array(buyOrders.length).fill(false)
        );
  
    } , [buyOrders]);
     */
    




    // array of escrowing
    const [escrowing, setEscrowing] = useState([] as boolean[]);
    for (let i = 0; i < 100; i++) {
      escrowing.push(false);
    }

    /*
    useEffect(() => {
        
        setEscrowing(
          new Array(buyOrders.length).fill(false)
        );
  
    } , [buyOrders]);
     */

    // array of requestingPayment
    const [requestingPayment, setRequestingPayment] = useState([] as boolean[]);
    for (let i = 0; i < 100; i++) {
      requestingPayment.push(false);
    }


    /*
    useEffect(() => {

      setRequestingPayment(

        new Array(buyOrders.length).fill(false)

      );

    } , [buyOrders]);
      */





  // without escrow
  const [isWithoutEscrow, setIsWithoutEscrow] = useState(true);


  const requestPayment = async (
    index: number,
    orderId: string,
    tradeId: string,
    amount: number,
    storecode: string,


    bankInfo: any,
  ) => {


    // check escrowWalletAddress

    if (!isWithoutEscrow && escrowWalletAddress === '') {
      toast.error('Recipient wallet address is empty');
      return;
    }

    // check balance
    // send payment request

    if (balance < amount) {
      toast.error(Insufficient_balance);
      return;
    }


    // check all escrowing is false
    if (!isWithoutEscrow && escrowing.some((item) => item === true)) {
      toast.error('Escrowing');
      return;
    }




    // check all requestingPayment is false
    if (requestingPayment.some((item) => item === true)) {
      toast.error('Requesting Payment');
      return;
    }


    if (!isWithoutEscrow) {


      setEscrowing(
        escrowing.map((item, idx) =>  idx === index ? true : item) 
      );
  

  


      // send USDT
      // Call the extension function to prepare the transaction
      const transaction = transfer({
        contract,
        to: escrowWalletAddress,
        amount: amount,
      });
      


      try {


        /*
        const transactionResult = await sendAndConfirmTransaction({
            account: smartAccount as any,
            transaction: transaction,
        });

        //console.log("transactionResult===", transactionResult);
        */

        /*
        const { transactionHash } = await sendTransaction({
          
          account: activeAccount as any,

          transaction,
        });
        */

        // sendAndConfirmTransaction
        const transactionHash = await sendAndConfirmTransaction({
          account: activeAccount as any,
          transaction,
        });



        ///console.log("transactionHash===", transactionHash);


        /*
        const transactionResult = await waitForReceipt({
          client,
          chain: arbitrum ,
          maxBlocksWaitTime: 1,
          transactionHash: transactionHash,
        });


        console.log("transactionResult===", transactionResult);
        */
  

        // send payment request

        //if (transactionResult) {
        if (transactionHash) {

          
          setRequestingPayment(
            requestingPayment.map((item, idx) => idx === index ? true : item)
          );
          
          
          


        
          const response = await fetch('/api/order/buyOrderRequestPayment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lang: params.lang,
              storecode: storecode,
              orderId: orderId,
              //transactionHash: transactionResult.transactionHash,
              transactionHash: transactionHash,
            })
          });

          const data = await response.json();

          //console.log('/api/order/buyOrderRequestPayment data====', data);


          /*
          setRequestingPayment(
            requestingPayment.map((item, idx) => {
              if (idx === index) {
                return false;
              }
              return item;
            })
          );
          */
          


          if (data.result) {

            toast.success(Payment_request_has_been_sent);

            //toast.success('Payment request has been sent');

            playSong();
            

            
            await fetch('/api/order/getAllBuyOrders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(
                {
                  storecode: searchStorecode,
                  limit: Number(limitValue),
                  page: Number(pageValue),
                  walletAddress: address,
                  searchMyOrders: searchMyOrders,
                  searchOrderStatusCancelled: searchOrderStatusCancelled,
                  searchOrderStatusCompleted: searchOrderStatusCompleted,

                  searchStoreName: searchStoreName,


                  fromDate: searchFromDate,
                  toDate: searchToDate,
                }
              )
            }).then(async (response) => {
              const data = await response.json();
              //console.log('data', data);
              if (data.result) {
                setBuyOrders(data.result.orders);
    
                //setTotalCount(data.result.totalCount);

                setBuyOrderStats({
                  totalCount: data.result.totalCount,
                  totalKrwAmount: data.result.totalKrwAmount,
                  totalUsdtAmount: data.result.totalUsdtAmount,
                  totalSettlementCount: data.result.totalSettlementCount,
                  totalSettlementAmount: data.result.totalSettlementAmount,
                  totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
                  totalFeeAmount: data.result.totalFeeAmount,
                  totalFeeAmountKRW: data.result.totalFeeAmountKRW,
                  totalAgentFeeAmount: data.result.totalAgentFeeAmount,
                  totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

                  totalByBuyerDepositName: data.result.totalByBuyerDepositName,
                  totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
                });

              }
            });


            // refresh balance

            const result = await balanceOf({
              contract,
              address: address || "",
            });

            //console.log(result);

            setBalance( Number(result) / 10 ** 6 );


          

          } else {
            toast.error('Payment request has been failed');
          }

        }


      } catch (error) {
        console.error('Error:', error);

        toast.error('Payment request has been failed');
      }

      setEscrowing(
        escrowing.map((item, idx) =>  idx === index ? false : item)
      );



    } else {
      // without escrow


      try {

        const transactionHash = '0x';


        setRequestingPayment(
          requestingPayment.map((item, idx) => idx === index ? true : item)
        );
        


      
        const response = await fetch('/api/order/buyOrderRequestPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            storecode: storecode,
            orderId: orderId,
            //transactionHash: transactionResult.transactionHash,
            transactionHash: transactionHash,

            // payment bank information


            paymentBankInfo: bankInfo,




          })
        });

        const data = await response.json();


        if (data.result) {

          toast.success(Payment_request_has_been_sent);

          //toast.success('Payment request has been sent');

          playSong();
          
          await fetch('/api/order/getAllBuyOrders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
              {
                storecode: searchStorecode,
                limit: Number(limitValue),
                page: Number(pageValue),
                walletAddress: address,
                searchMyOrders: searchMyOrders,
                searchOrderStatusCancelled: searchOrderStatusCancelled,
                searchOrderStatusCompleted: searchOrderStatusCompleted,

                searchStoreName: searchStoreName,

                fromDate: searchFromDate,
                toDate: searchToDate,
              }
            )
          }).then(async (response) => {
            const data = await response.json();
            //console.log('data', data);
            if (data.result) {
              setBuyOrders(data.result.orders);
  
              //setTotalCount(data.result.totalCount);

              setBuyOrderStats({
                totalCount: data.result.totalCount,
                totalKrwAmount: data.result.totalKrwAmount,
                totalUsdtAmount: data.result.totalUsdtAmount,
                totalSettlementCount: data.result.totalSettlementCount,
                totalSettlementAmount: data.result.totalSettlementAmount,
                totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
                totalFeeAmount: data.result.totalFeeAmount,
                totalFeeAmountKRW: data.result.totalFeeAmountKRW,
                totalAgentFeeAmount: data.result.totalAgentFeeAmount,
                totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

                totalByBuyerDepositName: data.result.totalByBuyerDepositName,
                totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
              });

            }
          });


          // refresh balance

          const result = await balanceOf({
            contract,
            address: address || "",
          });

          //console.log(result);

          setBalance( Number(result) / 10 ** 6 );


        } else {
          toast.error('결제요청이 실패했습니다.');
        }

      } catch (error) {
        console.error('Error:', error);

        toast.error('결제요청이 실패했습니다.');
      }

      
    } // end of without escrow


    setRequestingPayment(
      requestingPayment.map((item, idx) => idx === index ? false : item)
    );


  }









  // array of confirmingPayment

  const [confirmingPayment, setConfirmingPayment] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    confirmingPayment.push(false);
  }

  /*
  useEffect(() => {
      
      setConfirmingPayment(
        new Array(buyOrders.length).fill(false)
      );

  } , [buyOrders]);
   */


  // confirm payment check box
  const [confirmPaymentCheck, setConfirmPaymentCheck] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    confirmPaymentCheck.push(false);
  }

  /*
  useEffect(() => {
      
      setConfirmPaymentCheck(
        new Array(buyOrders.length).fill(false)
      );

  } , [buyOrders]);
    */




  // payment amoount array
  const [paymentAmounts, setPaymentAmounts] = useState([] as number[]);
  useEffect(() => {

    // default payment amount is from sellOrders krwAmount
      
    setPaymentAmounts(
      buyOrders.map((item) => item.krwAmount)
      );

  } , [buyOrders]);

  const [paymentAmountsUsdt, setPaymentAmountsUsdt] = useState([] as number[]);
  useEffect(() => {

    // default payment amount is from sellOrders krwAmount
      
    setPaymentAmountsUsdt(
      buyOrders.map((item) => item.usdtAmount)
      );

  } , [buyOrders]);



  // confirm payment
  const confirmPayment = async (

    index: number,
    orderId: string,
    //paymentAmount: number,
    krwAmount: number,
    //paymentAmountUsdt: number,
    usdtAmount: number,

    buyerWalletAddress: string,

    paymentMethod: string, // 'bank' or 'mkrw' or 'usdt'

  ) => {
    // confirm payment
    // send usdt to buyer wallet address


    // if escrowWalletAddress balance is less than paymentAmount, then return

    //console.log('escrowBalance', escrowBalance);
    //console.log('paymentAmountUsdt', paymentAmountUsdt);
    

    // check balance
    // if balance is less than paymentAmount, then return
    /*
    if (balance < usdtAmount) {
      toast.error(Insufficient_balance);
      return;
    }
      */

    const storecode = "admin";


    if (confirmingPayment[index]) {
      return;
    }

    setConfirmingPayment(
      confirmingPayment.map((item, idx) =>  idx === index ? true : item)
    );




        // transfer my wallet to buyer wallet address

        //const buyerWalletAddress = buyOrders[index].walletAddress;

      try {


        /*
        const transaction = transfer({
          contract,
          to: buyerWalletAddress,
          amount: usdtAmount,
        });


        //const { transactionHash } = await sendAndConfirmTransaction({

        const { transactionHash } = await sendTransaction({
          transaction: transaction,
          account: activeAccount as any,
        });
        */

        const transactionHash = '0x';

        console.log("transactionHash===", transactionHash);



        if (transactionHash) {


          if (paymentMethod === 'mkrw') {

            const response = await fetch('/api/order/buyOrderConfirmPaymentWithEscrow', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                lang: params.lang,
                storecode: storecode,
                orderId: orderId,
                paymentAmount: krwAmount,
                transactionHash: transactionHash,
                ///isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
                isSmartAccount: false,
              })
            });

            const data = await response.json();



          } else {

            const response = await fetch('/api/order/buyOrderConfirmPaymentWithoutEscrow', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                lang: params.lang,
                storecode: storecode,
                orderId: orderId,
                paymentAmount: krwAmount,
                transactionHash: transactionHash,
                ///isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
                isSmartAccount: false,
              })
            });

            const data = await response.json();

            //console.log('data', data);

          }




          
          await fetch('/api/order/getAllBuyOrders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
              {
                storecode: searchStorecode,
                limit: Number(limitValue),
                page: Number(pageValue),
                walletAddress: address,
                searchMyOrders: searchMyOrders,
                searchOrderStatusCancelled: searchOrderStatusCancelled,
                searchOrderStatusCompleted: searchOrderStatusCompleted,

                searchStoreName: searchStoreName,

                fromDate: searchFromDate,
                toDate: searchToDate,
              }
            )
          }).then(async (response) => {
            const data = await response.json();
            //console.log('data', data);
            if (data.result) {
              setBuyOrders(data.result.orders);
  
              //setTotalCount(data.result.totalCount);

              setBuyOrderStats({
                totalCount: data.result.totalCount,
                totalKrwAmount: data.result.totalKrwAmount,
                totalUsdtAmount: data.result.totalUsdtAmount,
                totalSettlementCount: data.result.totalSettlementCount,
                totalSettlementAmount: data.result.totalSettlementAmount,
                totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
                totalFeeAmount: data.result.totalFeeAmount,
                totalFeeAmountKRW: data.result.totalFeeAmountKRW,
                totalAgentFeeAmount: data.result.totalAgentFeeAmount,
                totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

                totalByBuyerDepositName: data.result.totalByBuyerDepositName,
                totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
              });


            }
          });
          

          // update sellersBalance seller.buyOrder.status to 'paymentConfirmed'
          /*
          setSellersBalance((prev) =>
            prev.map((seller) =>
              seller.walletAddress === address
                ? { ...seller, seller: { ...seller.seller, buyOrder: { ...seller.seller.buyOrder, status: 'paymentConfirmed' } } }
                : seller

            )
          );
          */



          toast.success(Payment_has_been_confirmed);
          ////playSong();






        } else {
          toast.error('결제확인이 실패했습니다.');
        }

    } catch (error) {
      console.error('Error:', error);
      //toast.error('결제확인이 실패했습니다.');
    }



    setConfirmingPayment(
      confirmingPayment.map((item, idx) => idx === index ? false : item)
    );

    setConfirmPaymentCheck(
      confirmPaymentCheck.map((item, idx) => idx === index ? false : item)
    );
  

  }








  // send payment
  const sendPayment = async (

    index: number,
    orderId: string,
    //paymentAmount: number,
    krwAmount: number,
    //paymentAmountUsdt: number,
    usdtAmount: number,

    buyerWalletAddress: string,

  ) => {
    // confirm payment
    // send usdt to buyer wallet address


    // if escrowWalletAddress balance is less than paymentAmount, then return

    //console.log('escrowBalance', escrowBalance);
    //console.log('paymentAmountUsdt', paymentAmountUsdt);
    

    // check balance
    // if balance is less than paymentAmount, then return
    if (balance < usdtAmount) {
      toast.error(Insufficient_balance);
      return;
    }

    const storecode = "admin";


    if (confirmingPayment[index]) {
      return;
    }

    setConfirmingPayment(
      confirmingPayment.map((item, idx) =>  idx === index ? true : item)
    );

      try {


        const transaction = transfer({
          contract,
          to: buyerWalletAddress,
          amount: usdtAmount,
        });



        //const { transactionHash } = await sendAndConfirmTransaction({
        const { transactionHash } = await sendTransaction({
          transaction: transaction,
          account: activeAccount as any,
        });

        console.log("transactionHash===", transactionHash);



        if (transactionHash) {


          //alert('USDT 전송이 완료되었습니다.');


          const response = await fetch('/api/order/buyOrderConfirmPaymentWithoutEscrow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lang: params.lang,
              storecode: storecode,
              orderId: orderId,
              paymentAmount: krwAmount,
              transactionHash: transactionHash,
              ///isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
              isSmartAccount: false,
            })
          });

          const data = await response.json();

          //console.log('data', data);


          await fetch('/api/order/getAllBuyOrders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
              {
                storecode: searchStorecode,
                limit: Number(limitValue),
                page: Number(pageValue),
                walletAddress: address,
                searchMyOrders: searchMyOrders,
                searchOrderStatusCancelled: searchOrderStatusCancelled,
                searchOrderStatusCompleted: searchOrderStatusCompleted,

                searchStoreName: searchStoreName,

                fromDate: searchFromDate,
                toDate: searchToDate,
              }
            )
          }).then(async (response) => {
            const data = await response.json();
            //console.log('data', data);
            if (data.result) {
              setBuyOrders(data.result.orders);
  
              //setTotalCount(data.result.totalCount);


              setBuyOrderStats({
                totalCount: data.result.totalCount,
                totalKrwAmount: data.result.totalKrwAmount,
                totalUsdtAmount: data.result.totalUsdtAmount,
                totalSettlementCount: data.result.totalSettlementCount,
                totalSettlementAmount: data.result.totalSettlementAmount,
                totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
                totalFeeAmount: data.result.totalFeeAmount,
                totalFeeAmountKRW: data.result.totalFeeAmountKRW,
                totalAgentFeeAmount: data.result.totalAgentFeeAmount,
                totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

                totalByBuyerDepositName: data.result.totalByBuyerDepositName,
                totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
              });

            }
          });

          toast.success(Payment_has_been_confirmed);
          playSong();


        } else {
          toast.error('결제확인이 실패했습니다.');
        }

    } catch (error) {
      console.error('Error:', error);
      //toast.error('결제확인이 실패했습니다.');
    }



    setConfirmingPayment(
      confirmingPayment.map((item, idx) => idx === index ? false : item)
    );

    setConfirmPaymentCheck(
      confirmPaymentCheck.map((item, idx) => idx === index ? false : item)
    );
  

  }







  
  // array of rollbackingPayment
  const [rollbackingPayment, setRollbackingPayment] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    rollbackingPayment.push(false);
  }
  /*
  useEffect(() => {
      
      setRollbackingPayment(
        new Array(buyOrders.length).fill(false)
      );

  } , [buyOrders]);
   */

  // rollback payment check box
  const [rollbackPaymentCheck, setRollbackPaymentCheck] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    rollbackPaymentCheck.push(false);
  }
  /*
  useEffect(() => {
      
      setRollbackPaymentCheck(
        new Array(buyOrders.length).fill(false)
      );

  } , [buyOrders]);
   */


  // rollback payment
  const rollbackPayment = async (

    index: number,
    orderId: string,
    paymentAmount: number,
    paymentAmountUsdt: number,

  ) => {
    // rollback payment
    // send usdt to seller wallet address

    if (rollbackingPayment[index]) {
      return;
    }


    /*
    // if escrowWalletAddress balance is less than paymentAmount, then return
    if (escrowBalance < paymentAmountUsdt) {
      toast.error(Escrow_balance_is_less_than_payment_amount);
      return;
    }

    // if escrowNativeBalance is less than 0.1, then return
    if (escrowNativeBalance < 0.1) {
      toast.error('ETH balance is less than 0.1');
      return;
    }
      */
    


    setRollbackingPayment(
      rollbackingPayment.map((item, idx) => idx === index ? true : item)
    );


    try {

      const response = await fetch('/api/order/buyOrderRollbackPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lang: params.lang,
          storecode: "admin",
          orderId: orderId,
          paymentAmount: paymentAmount,
          ///isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
          isSmartAccount: false,
        })
      });

      const data = await response.json();

      //console.log('data', data);

      if (data.result) {


        toast.success('Payment has been rollbacked');

        playSong();

        
        ///fetchBuyOrders();

        // fetch Buy Orders
        await fetch('/api/order/getAllBuyOrders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              storecode: searchStorecode,
              limit: Number(limitValue),
              page: Number(pageValue),
              walletAddress: address,
              searchMyOrders: searchMyOrders,
              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,

              searchStoreName: searchStoreName,

              fromDate: searchFromDate,
              toDate: searchToDate,
            }
          ),
        })
        .then(response => response.json())
        .then(data => {
            ///console.log('data', data);
            setBuyOrders(data.result.orders);

            //setTotalCount(data.result.totalCount);

            setBuyOrderStats({
              totalCount: data.result.totalCount,
              totalKrwAmount: data.result.totalKrwAmount,
              totalUsdtAmount: data.result.totalUsdtAmount,
              totalSettlementCount: data.result.totalSettlementCount,
              totalSettlementAmount: data.result.totalSettlementAmount,
              totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
              totalFeeAmount: data.result.totalFeeAmount,
              totalFeeAmountKRW: data.result.totalFeeAmountKRW,
              totalAgentFeeAmount: data.result.totalAgentFeeAmount,
              totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

              totalByBuyerDepositName: data.result.totalByBuyerDepositName,
              totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
            });

        })

      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Rollback payment has been failed');
    }



    setRollbackingPayment(
      rollbackingPayment.map((item, idx) => idx === index ? false : item)
    );

    setRollbackPaymentCheck(
      rollbackPaymentCheck.map((item, idx) => idx === index ? false : item)
    );


  }




  // settlement
 
  // array of settlement

  const [loadingSettlement, setLoadingSettlement] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    loadingSettlement.push(false);
  }

  // settlement check box
  const [settlementCheck, setSettlementCheck] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    settlementCheck.push(false);
  }

  const settlementRequest = async (index: number, orderId: string) => {
    // settlement

    if (loadingSettlement[index]) {
      return;
    }

    setLoadingSettlement(
      loadingSettlement.map((item, idx) => idx === index ? true : item)
    );

    // api call to settlement
    try {
      const response = await fetch('/api/order/updateBuyOrderSettlement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
        })
      });
      const data = await response.json();

      //console.log('data', data);

      if (data.result) {

        toast.success('정산이 완료되었습니다.');

        playSong();

        // fetch Buy Orders
        await fetch('/api/order/getAllBuyOrders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              storecode: searchStorecode,
              limit: Number(limitValue),
              page: Number(pageValue),
              walletAddress: address,
              searchMyOrders: searchMyOrders,
              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,

              searchStoreName: searchStoreName,

              fromDate: searchFromDate,
              toDate: searchToDate,
            }
          ),
        })
        .then(response => response.json())
        .then(data => {
            ///console.log('data', data);
            setBuyOrders(data.result.orders);

            //setTotalCount(data.result.totalCount);

            setBuyOrderStats({
              totalCount: data.result.totalCount,
              totalKrwAmount: data.result.totalKrwAmount,
              totalUsdtAmount: data.result.totalUsdtAmount,
              totalSettlementCount: data.result.totalSettlementCount,
              totalSettlementAmount: data.result.totalSettlementAmount,
              totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
              totalFeeAmount: data.result.totalFeeAmount,
              totalFeeAmountKRW: data.result.totalFeeAmountKRW,
              totalAgentFeeAmount: data.result.totalAgentFeeAmount,
              totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,

              totalByBuyerDepositName: data.result.totalByBuyerDepositName,
              totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
            });

        })

      } else {
        toast.error('Settlement has been failed');
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Settlement has been failed');
    }


    setLoadingSettlement(
      loadingSettlement.map((item, idx) => idx === index ? false : item)
    );

    setSettlementCheck(
      settlementCheck.map((item, idx) => idx === index ? false : item)
    );

  }















  // transfer escrow balance to seller wallet address

  const [amountOfEscrowBalance, setAmountOfEscrowBalance] = useState("");

  const [transferingEscrowBalance, setTransferingEscrowBalance] = useState(false);


  const transferEscrowBalance = async () => {

    if (transferingEscrowBalance) {
      return;
    }

    setTransferingEscrowBalance(true);

    try {

      const response = await fetch('/api/order/transferEscrowBalanceToSeller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lang: params.lang,
          storecode: "admin",
          walletAddress: address,
          amount: amountOfEscrowBalance,
          ///escrowWalletAddress: escrowWalletAddress,
          //isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
          isSmartAccount: false,
        })
      });

      const data = await response.json();

      //console.log('data', data);

      if (data.result) {

        setAmountOfEscrowBalance("");

        toast.success('Escrow balance has been transfered to seller wallet address');

      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Transfer escrow balance has been failed');
    }

    setTransferingEscrowBalance(false);

  }










  //const [latestBuyOrder, setLatestBuyOrder] = useState<BuyOrder | null>(null);


  useEffect(() => {


    const fetchBuyOrders = async () => {

      //console.log('fetchBuyOrders===============>');
      //console.log("address=", address);
      //console.log("searchMyOrders=", searchMyOrders);


      //console.log('acceptingBuyOrder', acceptingBuyOrder);
      //console.log('escrowing', escrowing);
      //console.log('requestingPayment', requestingPayment);
      //console.log('confirmingPayment', confirmingPayment);



      // check all agreementForTrade is false

      if (
        //!address || !searchMyOrders
        agreementForTrade.some((item) => item === true)
        || acceptingBuyOrder.some((item) => item === true)
        || agreementForCancelTrade.some((item) => item === true)
        || confirmPaymentCheck.some((item) => item === true)
        || rollbackPaymentCheck.some((item) => item === true)
        || acceptingBuyOrder.some((item) => item === true)
        || escrowing.some((item) => item === true)
        || requestingPayment.some((item) => item === true)
        || confirmingPayment.some((item) => item === true)
        || rollbackingPayment.some((item) => item === true)
      ) {
        return;
      }


      

      const isSellerHistory = Boolean(sellerWalletAddress);
      const endpoint = isSellerHistory
        ? '/api/order/getAllBuyOrdersBySellerEscrowWallet'
        : '/api/order/getAllBuyOrders';
      const payload = isSellerHistory
        ? {
            limit: Number(limitValue),
            page: Number(pageValue),
            walletAddress: sellerWalletAddress,
            startDate: searchFromDate,
            endDate: searchToDate,
          }
        : {
            storecode: searchStorecode,
            limit: Number(limitValue),
            page: Number(pageValue),
            walletAddress: address,
            searchMyOrders: searchMyOrders,
            searchOrderStatusCancelled: searchOrderStatusCancelled,
            searchOrderStatusCompleted: searchOrderStatusCompleted,
            searchStoreName: searchStoreName,
            fromDate: searchFromDate,
            toDate: searchToDate,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return;
      }



      const data = await response.json();

      //console.log('data', data);


      // if data.result is different from buyOrders
      // check neweset order is different from buyOrders
      // then toasts message
      //console.log('data.result.orders[0]', data.result.orders?.[0]);
      //console.log('buyOrders[0]', buyOrders);


      //console.log('buyOrders[0]', buyOrders?.[0]);

      /*
      if (data.result.orders?.[0]?._id !== latestBuyOrder?._id) {

        setLatestBuyOrder(data.result.orders?.[0] || null);

   
        
        //toast.success(Newest_order_has_been_arrived);
        toast.success('새로운 주문이 도착했습니다');




        // <audio src="/racing.mp3" typeof="audio/mpeg" autoPlay={soundStatus} muted={!soundStatus} />
        // audio play

        //setSoundStatus(true);

        // audio ding play

        playSong();

        // Uncaught (in promise) NotAllowedError: play() failed because the user didn't interact with the document first.


      }
      */



      setBuyOrders(data.result.orders);

      if (isSellerHistory) {
        setBuyOrderStats({
          totalCount: data.result.totalCount,
          totalKrwAmount: data.result.totalKrwAmount,
          totalUsdtAmount: data.result.totalUsdtAmount,
          totalSettlementCount: 0,
          totalSettlementAmount: 0,
          totalSettlementAmountKRW: 0,
          totalFeeAmount: 0,
          totalFeeAmountKRW: 0,
          totalAgentFeeAmount: 0,
          totalAgentFeeAmountKRW: 0,
          totalByBuyerDepositName: [],
          totalReaultGroupByBuyerDepositNameCount: 0,
        });
      } else {
        setBuyOrderStats({
          totalCount: data.result.totalCount,
          totalKrwAmount: data.result.totalKrwAmount,
          totalUsdtAmount: data.result.totalUsdtAmount,
          totalSettlementCount: data.result.totalSettlementCount,
          totalSettlementAmount: data.result.totalSettlementAmount,
          totalSettlementAmountKRW: data.result.totalSettlementAmountKRW,
          totalFeeAmount: data.result.totalFeeAmount,
          totalFeeAmountKRW: data.result.totalFeeAmountKRW,
          totalAgentFeeAmount: data.result.totalAgentFeeAmount,
          totalAgentFeeAmountKRW: data.result.totalAgentFeeAmountKRW,
          totalByBuyerDepositName: data.result.totalByBuyerDepositName,
          totalReaultGroupByBuyerDepositNameCount: data.result.totalReaultGroupByBuyerDepositNameCount,
        });
      }


    }


    fetchBuyOrders();

    
    
    const interval = setInterval(() => {

      fetchBuyOrders();


    }, 3000);


    return () => clearInterval(interval);
    


  } , [

    address,
    searchMyOrders,
    agreementForTrade,
    acceptingBuyOrder,
    escrowing,
    requestingPayment,
    confirmingPayment,
    rollbackingPayment,
    agreementForCancelTrade,
    confirmPaymentCheck,
    rollbackPaymentCheck,

    ///latestBuyOrder,
    searchOrderStatusCancelled,
    searchOrderStatusCompleted,
    

    //searchStoreName,

    limitValue,
    pageValue,
    searchStorecode,
    searchFromDate,
    searchToDate
]);



const [fetchingBuyOrders, setFetchingBuyOrders] = useState(false);

const fetchBuyOrders = async () => {


  if (fetchingBuyOrders) {
    return;
  }
  setFetchingBuyOrders(true);

  const response = await fetch('/api/order/getAllBuyOrders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      {
        storecode: searchStorecode,
        limit: Number(limitValue),
        page: Number(pageValue),
        walletAddress: address,
        searchMyOrders: searchMyOrders,

        searchStoreName: searchStoreName,

        fromDate: searchFromDate,
        toDate: searchToDate,
      }

    ),
  });

  if (!response.ok) {
    setFetchingBuyOrders(false);
    toast.error('Failed to fetch buy orders');
    return;
  }
  const data = await response.json();
  //console.log('data', data);

  setBuyOrders(data.result.orders);
  //setTotalCount(data.result.totalCount);
  setFetchingBuyOrders(false);

  return data.result.orders;
}








    /*
    const [storeCodeNumber, setStoreCodeNumber] = useState('');

    useEffect(() => {
  
      const fetchStoreCode = async () => {
  
        const response = await fetch('/api/order/getStoreCodeNumber', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
  
        //console.log('getStoreCodeNumber data', data);
  
        setStoreCodeNumber(data?.storeCodeNumber);
  
      }
  
      fetchStoreCode();
  
    } , []);

    */

    
    



  const [selectedItem, setSelectedItem] = useState<any>(null);
    


  const [storeAdminWalletAddress, setStoreAdminWalletAddress] = useState("");

  const [fetchingStore, setFetchingStore] = useState(false);
  const [store, setStore] = useState(null) as any;

  useEffect(() => {

    setFetchingStore(true);

    const fetchData = async () => {
        const response = await fetch("/api/store/getOneStore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              storecode: "admin",
              ///walletAddress: address,
            }),
        });

        const data = await response.json();


        if (data.result) {

          setStore(data.result);

          setStoreAdminWalletAddress(data.result?.adminWalletAddress);

        }

        setFetchingStore(false);
    };

    fetchData();

  } , [address]);


  
  /*
  const [tradeSummary, setTradeSummary] = useState({
      totalCount: 0,
      totalKrwAmount: 0,
      totalUsdtAmount: 0,
      totalSettlementCount: 0,
      totalSettlementAmount: 0,
      totalSettlementAmountKRW: 0,
      
      totalFeeAmount: 0,
      totalFeeAmountKRW: 0,

      totalAgentFeeAmount: 0,
      totalAgentFeeAmountKRW: 0,

      orders: [] as BuyOrder[],

      totalClearanceCount: 0,
      totalClearanceAmount: 0,
      totalClearanceAmountUSDT: 0,
    });
    const [loadingTradeSummary, setLoadingTradeSummary] = useState(false);


    const getTradeSummary = async () => {
      if (!address) {
        return;
      }
      setLoadingTradeSummary(true);
      const response = await fetch('/api/summary/getTradeSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({

          agentcode: params.agentcode,
          storecode: searchStorecode,
          walletAddress: address,
          searchMyOrders: searchMyOrders,
          searchOrderStatusCancelled: searchOrderStatusCancelled,
          searchOrderStatusCompleted: searchOrderStatusCompleted,
          
          //searchBuyer: searchBuyer,
          searchBuyer: '',
          //searchDepositName: searchDepositName,
          searchDepositName: '',
          //searchStoreBankAccountNumber: searchStoreBankAccountNumber,
          searchStoreBankAccountNumber: '',






        })
      });
      if (!response.ok) {
        setLoadingTradeSummary(false);
        toast.error('Failed to fetch trade summary');
        return;
      }
      const data = await response.json();
      
      //console.log('getTradeSummary data', data);


      setTradeSummary(data.result);

      setLoadingTradeSummary(false);
      return data.result;
    }



    useEffect(() => {

      if (!address) {
        return;
      }

      getTradeSummary();

      // fetch trade summary every 10 seconds
      const interval = setInterval(() => {
        getTradeSummary();
      }, 10000);
      return () => clearInterval(interval);


    } , [address, searchMyOrders, searchStorecode, searchOrderStatusCancelled, searchOrderStatusCompleted, ]);
    */







     // get All stores
  const [fetchingAllStores, setFetchingAllStores] = useState(false);
  const [allStores, setAllStores] = useState([] as any[]);
  const [storeTotalCount, setStoreTotalCount] = useState(0);
  const fetchAllStores = async () => {
    if (fetchingAllStores) {
      return;
    }
    setFetchingAllStores(true);
    const response = await fetch('/api/store/getAllStores', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          limit: 100,
          page: 1,
        }
      ),
    });

    if (!response.ok) {
      setFetchingAllStores(false);
      toast.error('가맹점 검색에 실패했습니다.');
      return;
    }

    const data = await response.json();
    
    //console.log('getAllStores data', data);




    setAllStores(data.result.stores);
    setStoreTotalCount(data.result.totalCount);
    setFetchingAllStores(false);
    return data.result.stores;
  }
  useEffect(() => {
 
      setAllStores([]);
 
    fetchAllStores();
  }, []); 




  // totalNumberOfBuyOrders
  const [loadingTotalNumberOfBuyOrders, setLoadingTotalNumberOfBuyOrders] = useState(false);
  const [totalNumberOfBuyOrders, setTotalNumberOfBuyOrders] = useState(0);
  const [processingBuyOrders, setProcessingBuyOrders] = useState([] as BuyOrder[]);
  const [totalNumberOfAudioOnBuyOrders, setTotalNumberOfAudioOnBuyOrders] = useState(0);


  // Move fetchTotalBuyOrders outside of useEffect to avoid self-reference error
  const fetchTotalBuyOrders = async (): Promise<void> => {
    setLoadingTotalNumberOfBuyOrders(true);
    const response = await fetch('/api/order/getTotalNumberOfBuyOrders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      console.error('Failed to fetch total number of buy orders');
      setLoadingTotalNumberOfBuyOrders(false);
      return;
    }
    const data = await response.json();
    //console.log('getTotalNumberOfBuyOrders data', data);
    setTotalNumberOfBuyOrders(data.result.totalCount);
    setProcessingBuyOrders(data.result.orders);
    setTotalNumberOfAudioOnBuyOrders(data.result.audioOnCount);

    setLoadingTotalNumberOfBuyOrders(false);
  };

  useEffect(() => {

    setProcessingBuyOrders([]);

    fetchTotalBuyOrders();

    const interval = setInterval(() => {
      fetchTotalBuyOrders();
    }, 5000);
    return () => clearInterval(interval);

  }, []);

      
  /*
  useEffect(() => {
    if (totalNumberOfBuyOrders > 0 && loadingTotalNumberOfBuyOrders === false) {
      const audio = new Audio('/notification.wav'); 
      audio.play();
    }
  }, [totalNumberOfBuyOrders, loadingTotalNumberOfBuyOrders]);
  

  useEffect(() => {
    if (totalNumberOfAudioOnBuyOrders > 0 && loadingTotalNumberOfBuyOrders === false) {
      const audio = new Audio('/notification.wav');
      audio.play();
    }
  }, [totalNumberOfAudioOnBuyOrders, loadingTotalNumberOfBuyOrders]);
  */







  // totalNumberOfClearanceOrders
  /*
  const [loadingTotalNumberOfClearanceOrders, setLoadingTotalNumberOfClearanceOrders] = useState(false);
  const [totalNumberOfClearanceOrders, setTotalNumberOfClearanceOrders] = useState(0);
  useEffect(() => {
    if (!address) {
      setTotalNumberOfClearanceOrders(0);
      return;
    }

    const fetchTotalClearanceOrders = async () => {
      setLoadingTotalNumberOfClearanceOrders(true);
      const response = await fetch('/api/order/getTotalNumberOfClearanceOrders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
      });
      if (!response.ok) {
        console.error('Failed to fetch total number of clearance orders');
        return;
      }
      const data = await response.json();
      //console.log('getTotalNumberOfClearanceOrders data', data);
      setTotalNumberOfClearanceOrders(data.result.totalCount);

      setLoadingTotalNumberOfClearanceOrders(false);
    };

    fetchTotalClearanceOrders();

    const interval = setInterval(() => {
      fetchTotalClearanceOrders();
    }, 5000);
    return () => clearInterval(interval);

  }, [address]);

  useEffect(() => {
    if (totalNumberOfClearanceOrders > 0 && loadingTotalNumberOfClearanceOrders === false) {
      const audio = new Audio('/notification.wav');
      audio.play();
    }
  }, [totalNumberOfClearanceOrders, loadingTotalNumberOfClearanceOrders]);
  */


    // audio notification state
  const [audioNotification, setAudioNotification] = useState<boolean[]>([]);
  
  // keep audioNotification in sync with buyOrders
  useEffect(() => {
    setAudioNotification(
      buyOrders.map((item) => !!item.audioOn)
    );
  }, [buyOrders]);
  
  // handleAudioToggle
  const handleAudioToggle = (index: number, orderId: string) => {
    // api call
    fetch('/api/order/toggleAudioNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId,
        audioOn: !audioNotification[index],
        walletAddress: address,
      }),
    })
    .then(response => response.json())
    .then(data => {
      
      //console.log('toggleAudioNotification data', data);
      //alert('toggleAudioNotification data: ' + JSON.stringify(data));
      /*
      {"success":true,"message":"Audio notification setting updated successfully"}
      */

      if (data.success) {
        // update local state for immediate UI feedback
        setAudioNotification((prev) =>
          prev.map((v, i) => (i === index ? !v : v))
        );
        toast.success('오디오 알림 설정이 변경되었습니다.');
      } else {
        toast.error('오디오 알림 설정 변경에 실패했습니다.');
      }
    })
    .catch(error => {
      console.error('Error toggling audio notification:', error);
      toast.error('오디오 알림 설정 변경에 실패했습니다.' + error.message);
    });
  };




  // 판매자 잔고 불러오기
  const [sellersBalance, setSellersBalance] = useState([] as any[]);
  const [sellerProfileLoaded, setSellerProfileLoaded] = useState(false);
  const fetchSellersBalance = async () => {
    try {
      const response = await fetch('/api/user/getAllSellersForBalance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            storecode: "admin",
            limit: 100,
            page: 1,
            escrowWalletAddress: sellerWalletAddress,
          }
        )
      });

      const data = await response.json();

      ///console.log('getAllSellersForBalance data', data);

      if (data.result) {
        
        //setSellersBalance(data.result.users);

        // if seller.walletAddress of data.result.users is address,
        // then order first
        // and others is ordered by seller.usdtToKrwRate ascending
        /*
        const sortedSellers = data.result.users.sort((a: any, b: any) => {
          if (a.walletAddress === address) return -1;
          if (b.walletAddress === address) return 1;
          return 0;
        });
        */


        const sortedSellers = data.result.users;

        // if walletAddress is address, then order first
        // and then others is ordered by seller.totalPaymentConfirmedUsdtAmount descending

        /*
        const finalSortedSellers = sortedSellers.sort((a: any, b: any) => {
          if (a.walletAddress === address) return -1;
          if (b.walletAddress === address) return 1;
          return a.seller?.usdtToKrwRate - b.seller?.usdtToKrwRate;
        });
        */
      
        /*
        const finalSortedSellers = sortedSellers.sort((a: any, b: any) => {
          if (a.walletAddress === address) return -1;
          if (b.walletAddress === address) return 1;
          return b.totalPaymentConfirmedUsdtAmount - a.totalPaymentConfirmedUsdtAmount;
        });
        */
      // find sellerWalletAddress
        const mySeller = sortedSellers.find((seller: any) => seller.seller.escrowWalletAddress === sellerWalletAddress);


        /*
        // reorder status is 'accepted' first, then 'paymentRequested', then 'paymentConfirmed', then 'cancelled'
        const finalSortedSellers = sortedSellers.sort((a: any, b: any) => {
          const statusOrder = ['accepted', 'paymentRequested', 'paymentConfirmed', 'cancelled'];
          const aStatusIndex = statusOrder.indexOf(a.status);
          const bStatusIndex = statusOrder.indexOf(b.status);
          return aStatusIndex - bStatusIndex;
        });

        // usdtToKrwRate ascending
        finalSortedSellers.sort((a: any, b: any) => {
          return a.usdtToKrwRate - b.usdtToKrwRate;
        });
        */
        

        //setSellersBalance(finalSortedSellers);
        setSellersBalance([
          ...(mySeller ? [mySeller] : [])
        ]);


      } else {
        console.error('Error fetching sellers balance');
      }
    } catch (error) {
      console.error('Error fetching sellers balance', error);
    } finally {
      setSellerProfileLoaded(true);
    }
  };
  useEffect(() => {
    /*
    if (!address) {
      setSellersBalance([]);
      return;
    }
    */

    fetchSellersBalance();
    // interval to fetch every 10 seconds
    const interval = setInterval(() => {
      fetchSellersBalance();
    }, 10000);
    return () => clearInterval(interval);
  }, [address]);


  // sellersBalance.reduce((acc, seller) => acc + seller.currentUsdtBalance, 0)
  // animated totalUsdtBalance
  const [animatedTotalUsdtBalance, setAnimatedTotalUsdtBalance] = useState(0);
  function animateTotalUsdtBalance(targetBalance: number) {
    const animationDuration = 1000; // 1 second
    const frameRate = 30; // 30 frames per second
    const totalFrames = Math.round((animationDuration / 1000) * frameRate);
    const initialBalance = animatedTotalUsdtBalance;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const newBalance = initialBalance + (targetBalance - initialBalance) * progress;
      setAnimatedTotalUsdtBalance(newBalance);
      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 1000 / frameRate);
  }
  useEffect(() => {
    const targetBalance = sellersBalance.reduce((acc, seller) => acc + (seller.currentUsdtBalance || 0), 0);
    animateTotalUsdtBalance(targetBalance);
  }, [sellersBalance]);




  // usdtToKrwRate animation
  const [usdtKrwRateAnimationArray, setUsdtKrwRateAnimationArray] = useState<number[]>([]);
  function animateUsdtKrwRate(targetRates: number[]) {
    const animationDuration = 1000; // 1 second
    const frameRate = 30; // 30 frames per second
    const totalFrames = Math.round((animationDuration / 1000) * frameRate);
    const initialRates = usdtKrwRateAnimationArray.length === targetRates.length
      ? [...usdtKrwRateAnimationArray]
      : targetRates.map(() => 0);
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const newRates = targetRates.map((target, index) => {
        const initial = initialRates[index];
        const progress = Math.min(frame / totalFrames, 1);
        return initial + (target - initial) * progress;
      });
      setUsdtKrwRateAnimationArray(newRates);
      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 1000 / frameRate);
  }
  useEffect(() => {
    const targetRates = sellersBalance.map((seller) => seller.seller?.usdtToKrwRate || 0);
    animateUsdtKrwRate(targetRates);
  }, [sellersBalance]);








  // currentUsdtBalance array for animated display
  const [currentUsdtBalanceArray, setCurrentUsdtBalanceArray] = useState<number[]>([]);
  function animateUsdtBalance(targetBalances: number[]) {
    const animationDuration = 1000; // 1 second
    const frameRate = 30; // 30 frames per second
    const totalFrames = Math.round((animationDuration / 1000) * frameRate);
    const initialBalances = currentUsdtBalanceArray.length === targetBalances.length
      ? [...currentUsdtBalanceArray]
      : targetBalances.map(() => 0);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const newBalances = targetBalances.map((target, index) => {
        const initial = initialBalances[index];
        const progress = Math.min(frame / totalFrames, 1);
        return initial + (target - initial) * progress;
      });
      setCurrentUsdtBalanceArray(newBalances);
      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 1000 / frameRate);
  }
  useEffect(() => {
    const targetBalances = sellersBalance.map((seller) => seller.currentUsdtBalance || 0);
    animateUsdtBalance(targetBalances);
  }, [sellersBalance]);



  // updateUsdtToKrwRate
  const [updatingUsdtToKrwRateArray, setUpdatingUsdtToKrwRateArray] = useState<boolean[]>([]);

  const updateUsdtToKrwRate = async (index: number, sellerId: string, newRate: number) => {
    try {

      updatingUsdtToKrwRateArray[index] = true;
      setUpdatingUsdtToKrwRateArray([...updatingUsdtToKrwRateArray]);

      const response = await fetch('/api/user/updateSellerUsdtToKrwRate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({

          storecode: "admin",
          walletAddress: address,
          usdtToKrwRate: newRate,

          //sellerId,
          //newRate,
        }),
      });
      const data = await response.json();
      //console.log('updateUsdtToKrwRate data', data);
      if (data.result) {
        toast.success('USDT to KRW rate has been updated');
        // refresh sellers balance
        //fetchSellersBalance();

        // update local state for immediate UI feedback
        setSellersBalance((prev) =>
          prev.map((seller, idx) =>
            idx === index ? { ...seller, seller: { ...seller.seller, usdtToKrwRate: newRate } } : seller
          )
        );


      } else {
        toast.error('Failed to update USDT to KRW rate');
      }
    } catch (error) {
      console.error('Error updating USDT to KRW rate:', error);
      toast.error('Failed to update USDT to KRW rate');
    }

    updatingUsdtToKrwRateArray[index] = false;
    setUpdatingUsdtToKrwRateArray([...updatingUsdtToKrwRateArray]);
  };



  // api/market/upbit
  // get upbit usdt to krw rate every 10 seconds

  const [upbitUsdtToKrwRate, setUpbitUsdtToKrwRate] = useState(0);
  const [upbitUsdtToKrwRateChange, setUpbitUsdtToKrwRateChange] = useState("");
  const [upbitUsdtToKrwRateChangePrice, setUpbitUsdtToKrwRateChangePrice] = useState(0);
  const [upbitUsdtToKrwRateChangeRate, setUpbitUsdtToKrwRateChangeRate] = useState(0);


  const [upbitUsdtToKrwRateTimestamp, setUpbitUsdtToKrwRateTimestamp] = useState(0);
  const [TradeDateKst, setTradeDateKst] = useState<any>(null);
  const [TradeTimeKst, setTradeTimeKst] = useState<string>('');
  const [loadingUpbitRate, setLoadingUpbitRate] = useState(false);
  useEffect(() => {
    const fetchUpbitRate = async () => {
      setLoadingUpbitRate(true);
      const response = await fetch('/api/market/upbit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      //console.log('upbit usdt to krw rate data', data);

      /*
      if (data.data && data.data.length > 0) {
        setUpbitUsdtToKrwRate(data.data[0].trade_price);
        setUpbitUsdtToKrwRateTimestamp(data.data[0].trade_timestamp);
        setTradeDateKst(data.data[0].trade_date_kst);
        setTradeTimeKst(data.data[0].trade_time_kst);
      }
      */

      // data.result
      if (data?.result) {
        setUpbitUsdtToKrwRate(data.result.trade_price);
        setUpbitUsdtToKrwRateChange(data.result.change);
        setUpbitUsdtToKrwRateChangePrice(data.result.change_price);
        setUpbitUsdtToKrwRateChangeRate(data.result.change_rate);


        setUpbitUsdtToKrwRateTimestamp(data.result.trade_timestamp);
        setTradeDateKst(data.result.trade_date_kst);
        setTradeTimeKst(data.result.trade_time_kst);
      }


      setLoadingUpbitRate(false);

    };
    fetchUpbitRate();
    const interval = setInterval(() => {
      fetchUpbitRate();
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  // animate upbitUsdtToKrwRate
  const [animatedUpbitUsdtToKrwRate, setAnimatedUpbitUsdtToKrwRate] = useState(0);
  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const frameRate = 30; // 30 frames per second
    const totalFrames = Math.round((animationDuration / 1000) * frameRate);
    const initialRate = animatedUpbitUsdtToKrwRate;
    const targetRate = upbitUsdtToKrwRate;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const newRate = initialRate + (targetRate - initialRate) * progress;
      setAnimatedUpbitUsdtToKrwRate(newRate);
      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 1000 / frameRate);
    return () => clearInterval(interval);
  }, [upbitUsdtToKrwRate]);








  // api/market/bithumb
  // get bithumb usdt to krw rate every 10 seconds
  const [bithumbUsdtToKrwRate, setBithumbUsdtToKrwRate] = useState(0);
  const [bithumbUsdtToKrwRateChange, setBithumbUsdtToKrwRateChange] = useState("");
  const [bithumbUsdtToKrwRateChangePrice, setBithumbUsdtToKrwRateChangePrice] = useState(0);
  const [bithumbUsdtToKrwRateChangeRate, setBithumbUsdtToKrwRateChangeRate] = useState(0);


  const [bithumbUsdtToKrwRateTimestamp, setBithumbUsdtToKrwRateTimestamp] = useState(0);
  //const [TradeDateKst, setTradeDateKst] = useState<any>(null);
  //const [TradeTimeKst, setTradeTimeKst] = useState<string>('');
  const [loadingBithumbRate, setLoadingBithumbRate] = useState(false);

  useEffect(() => {
    const fetchBithumbRate = async () => {
      setLoadingBithumbRate(true);
      const response = await fetch('/api/market/bithumb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      //console.log('bithumb usdt to krw rate data', data);
      // data.result
      if (data?.result) {
        setBithumbUsdtToKrwRate(data.result.trade_price);
        setBithumbUsdtToKrwRateChange(data.result.change);
        setBithumbUsdtToKrwRateChangePrice(data.result.change_price);
        setBithumbUsdtToKrwRateChangeRate(data.result.change_rate);
        setBithumbUsdtToKrwRateTimestamp(data.result.trade_timestamp);
        
        //setTradeDateKst(data.result.trade_date_kst);
        //setTradeTimeKst(data.result.trade_time_kst);
      }
      setLoadingBithumbRate(false);
    };
    fetchBithumbRate();
    const interval = setInterval(() => {
      fetchBithumbRate();
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  // animate bithumbUsdtToKrwRate
  const [animatedBithumbUsdtToKrwRate, setAnimatedBithumbUsdtToKrwRate] = useState(0);
  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const frameRate = 30; // 30 frames per second
    const totalFrames = Math.round((animationDuration / 1000) * frameRate);
    const initialRate = animatedBithumbUsdtToKrwRate;
    const targetRate = bithumbUsdtToKrwRate;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const newRate = initialRate + (targetRate - initialRate) * progress;
      setAnimatedBithumbUsdtToKrwRate(newRate);
      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 1000 / frameRate);
    return () => clearInterval(interval);
  }, [bithumbUsdtToKrwRate]);

  const sellerPromotionContext = useMemo(() => {
    if (!ownerWalletAddress) {
      return null;
    }
    const ownerSeller = sellersBalance.find((item) => item?.walletAddress === ownerWalletAddress);
    if (!ownerSeller) {
      return null;
    }
    const priceSettingMethod = ownerSeller?.seller?.priceSettingMethod;
    const market = ownerSeller?.seller?.market;
    let price = ownerSeller?.seller?.price;
    if (!price && ownerSeller?.seller?.usdtToKrwRate) {
      price = ownerSeller.seller.usdtToKrwRate;
    }
    return {
      priceSettingMethod,
      market,
      price,
      escrowBalance: ownerSeller?.currentUsdtBalance,
      promotionText: ownerSeller?.seller?.promotionText || ownerSeller?.promotionText || '',
    };
  }, [ownerWalletAddress, sellersBalance]);






  // /api/user/toggleAutoProcessDeposit
  const [togglingAutoProcessDeposit, setTogglingAutoProcessDeposit] = useState(false);
  const toggleAutoProcessDeposit = async (currentValue: boolean) => {
    if (togglingAutoProcessDeposit) {
      return;
    }
    setTogglingAutoProcessDeposit(true);
    try {
      const response = await fetch('/api/user/toggleAutoProcessDeposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: "admin",
          walletAddress: address,
          autoProcessDeposit: !currentValue,
        }),
      });
      const data = await response.json();
      //console.log('toggleAutoProcessDeposit data', data);
      if (data.result) {
        // update local state
        setSellersBalance((prev) =>
          prev.map((seller) =>
            seller.walletAddress === address
              ? { ...seller, seller: { ...seller.seller, autoProcessDeposit: !currentValue } }
              : seller
          )
        );
        toast.success('자동 입금 처리 설정이 변경되었습니다.');
      } else {
        toast.error('자동 입금 처리 설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error toggling auto process deposit:', error);
      toast.error('자동 입금 처리 설정 변경에 실패했습니다.');
    }
    setTogglingAutoProcessDeposit(false);
  };



  // updatingPromotionText
  // /api/user/updatePromotionText
  const [promotionText, setPromotionText] = useState('');
  const [updatingPromotionText, setUpdatingPromotionText] = useState(false);
  const updatePromotionText = async () => {
      
      setUpdatingPromotionText(true);
      try {
          const response = await fetch('/api/user/updatePromotionText', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  storecode: "admin",
                  walletAddress: address,
                  promotionText: promotionText,
              }),
          });
          const data = await response.json();
          //console.log('updatePromotionText data', data);
          if (data.result) {
              toast.success('프로모션 문구가 업데이트되었습니다.');

              // update local state for seller
              setSellersBalance((prev) =>
                prev.map((seller) =>
                  seller.walletAddress === address
                    ? { ...seller, seller: { ...seller.seller, promotionText: promotionText } }
                    : seller
                )
              );
              


          } else {
              toast.error('프로모션 문구 업데이트에 실패했습니다.');
          }
      } catch (error) {
          console.error('Error updating promotion text:', error);
          toast.error('프로모션 문구 업데이트에 실패했습니다.');
      }
      setUpdatingPromotionText(false);
  };




  // 판매자를 정해서 구매주문하기 function
  // API /api/order/buyOrderPrivateSale

  // buyAmountInputs
  const MAX_BUY_AMOUNT = 100000;
  const MAX_KRW_AMOUNT = 100000000;

  const formatNumberWithCommas = (value: string) => {
    if (!value) {
      return '';
    }
    const hasDecimal = value.includes('.');
    const [integerPart, decimalPart = ''] = value.split('.');
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '') || '0';
    const integerWithCommas = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return hasDecimal ? `${integerWithCommas}.${decimalPart}` : integerWithCommas;
  };

  const formatUsdtValue = (value: number) => {
    if (!value || Number.isNaN(value)) {
      return '';
    }
    const fixed = (Math.floor(value * 100) / 100).toFixed(2);
    const trimmed = fixed.replace(/\.?0+$/, '');
    return formatNumberWithCommas(trimmed);
  };

  const normalizeUsdtInput = (value: string) => {
    const cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
    if (!cleaned) {
      return '';
    }
    const parts = cleaned.split('.');
    const integerPart = parts[0] ?? '';
    const decimalPart = parts.slice(1).join('');
    const trimmedDecimal = decimalPart.slice(0, 2);
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '');
    if (cleaned.includes('.')) {
      return `${normalizedInteger || '0'}.${trimmedDecimal}`;
    }
    return normalizedInteger;
  };

  const [buyAmountInputs, setBuyAmountInputs] = useState<number[]>([]);
  const [buyAmountKrwInputs, setBuyAmountKrwInputs] = useState<number[]>([]);
  const [buyAmountInputTexts, setBuyAmountInputTexts] = useState<string[]>([]);
  const [buyAmountOverLimitArray, setBuyAmountOverLimitArray] = useState<boolean[]>([]);
  const [buyAmountKrwOverLimitArray, setBuyAmountKrwOverLimitArray] = useState<boolean[]>([]);

  /*
  useEffect(() => {
    // params.buyAmount 으로 모든 input 초기화
    if (params.buyAmount) {
      setBuyAmountInputs(
        sellersBalance.map(() => parseFloat(params.buyAmount as string))
      );
    } else {
      setBuyAmountInputs(
        sellersBalance.map(() => 0)
      );
    }
  }, [params.buyAmount, sellersBalance]);
  */



  const [buyOrderingPrivateSaleArray, setBuyOrderingPrivateSaleArray] = useState<boolean[]>([]);

  const buyOrderPrivateSale = async (
    index: number,
    sellerWalletAddress: string,
  ) => {
    if (!address) {
      toast.error('지갑을 연결해주세요.');
      return;
    }


    if (buyOrderingPrivateSaleArray[index]) {
      return;
    }

    const targetSeller = sellersBalance.find(
      (seller) => seller.walletAddress === sellerWalletAddress
    );
    const rate = targetSeller?.seller?.usdtToKrwRate || 0;
    const krwInput = buyAmountKrwInputs[index] ?? 0;
    const computedUsdtFromKrw =
      rate > 0 && krwInput > 0 ? Math.floor((krwInput / rate) * 100) / 100 : 0;
    const usdtAmount =
      computedUsdtFromKrw > 0 ? computedUsdtFromKrw : buyAmountInputs[index] || 0;

    if (!usdtAmount || usdtAmount <= 0) {
      toast.error('구매 금액을 입력해주세요.');
      return;
    }

    if (usdtAmount > MAX_BUY_AMOUNT) {
      toast.error('구매 수량은 100,000 USDT 이하로 입력해주세요.');
      return;
    }

    // if buyAmountInputs[index] is more than currentUsdtBalanceArray[index], show error
    if (usdtAmount > currentUsdtBalanceArray[index]) {
      toast.error('구매 금액이 판매자의 잔여 USDT 잔고를 초과합니다.');
      return;
    }

    setBuyOrderingPrivateSaleArray((prev) => {
      const newArray = [...prev];
      newArray[index] = true;
      return newArray;
    });

    try {
      const response = await fetch('/api/order/buyOrderPrivateSale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerWalletAddress: address,
          sellerWalletAddress: sellerWalletAddress,
          usdtAmount,
          krwAmount: krwInput,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || '구매 주문 생성에 실패했습니다.');
      }

      if (data.result) {
        toast.success('구매 주문이 생성되었습니다.');
        const nowIso = new Date().toISOString();
        const krwAmount = Math.floor(usdtAmount * rate);

        setBuyAmountInputs((prev) => {
          const next = [...prev];
          next[index] = 0;
          return next;
        });
        setBuyAmountKrwInputs((prev) => {
          const next = [...prev];
          next[index] = 0;
          return next;
        });
        setBuyAmountInputTexts((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
        setBuyAmountOverLimitArray((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
        setBuyAmountKrwOverLimitArray((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });

        setSellersBalance((prev) =>
          prev.map((seller) =>
            seller.walletAddress === sellerWalletAddress
              ? {
                    ...seller,
                    seller: {
                      ...seller.seller,
                      buyOrder: {
                        ...(seller.seller?.buyOrder ?? {}),
                        tradeId:
                          seller.seller?.buyOrder?.tradeId ||
                          `PENDING-${Date.now().toString().slice(-6)}`,
                        walletAddress: address,
                        isWeb3Wallet: true,
                        usdtAmount,
                        rate,
                        krwAmount,
                        status: 'paymentRequested',
                        createdAt: nowIso,
                        acceptedAt: nowIso,
                        paymentRequestedAt: nowIso,
                        buyer: {
                          nickname: user?.nickname || '',
                          walletAddress: address,
                          depositName:
                            user?.buyer?.bankInfo?.accountHolder ||
                            user?.buyer?.depositName ||
                            '',
                        },
                      },
                    },
                }
              : seller
          )
        );

        fetchSellersBalance();
      } else {
        toast.error('구매 주문 생성에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '구매 주문 생성에 실패했습니다.';
      toast.error(message);
    } finally {
      setBuyOrderingPrivateSaleArray((prev) => {
        const newArray = [...prev];
        newArray[index] = false;
        return newArray;
      });
    }



    /*
    .then((response) => response.json())
    .then((data) => {
      //console.log('buyOrderPrivateSale data', data);
      if (data.result) {
        toast.success('구매 주문이 생성되었습니다.');
        
        // update local buyOrders state
        //setBuyOrders((prev) => [data.result, ...prev]);
        // refetch buy orders
        fetchBuyOrders();

      } else {
        toast.error('구매 주문 생성에 실패했습니다: ' + data.message);
      }
      setBuyOrderingPrivateSaleArray((prev) => {
        const newArray = [...prev];
        newArray[index] = false;
        return newArray;
      });
    })
    .catch((error) => {
      console.error('Error creating buy order for private seller:', error);
      toast.error('구매 주문 생성에 실패했습니다: ' + error.message);
      setBuyOrderingPrivateSaleArray((prev) => {
        const newArray = [...prev];
        newArray[index] = false;
        return newArray;
      });
    });
    */


  };
    


  //if (!address) {
  if (false) {
    return (
      <div className="flex flex-col items-center justify-center">

        <AutoConnect
            client={client}
            wallets={[wallet]}
        />


        {/*
        <h1 className="text-2xl font-bold">로그인</h1>

          <ConnectButton
            accountAbstraction={{
              chain: chain === "ethereum" ? ethereum :
                      chain === "polygon" ? polygon :
                      chain === "arbitrum" ? arbitrum :
                      chain === "bsc" ? bsc : arbitrum,
              sponsorGas: false
            }}

            client={client}
            wallets={wallets}
            chain={chain === "ethereum" ? ethereum :
                    chain === "polygon" ? polygon :
                    chain === "arbitrum" ? arbitrum :
                    chain === "bsc" ? bsc : arbitrum}
            
            theme={"light"}

            // button color is dark skyblue convert (49, 103, 180) to hex
            connectButton={{
              style: {
                backgroundColor: "#0047ab", // cobalt blue

                color: "#f3f4f6", // gray-300 
                padding: "2px 2px",
                borderRadius: "10px",
                fontSize: "14px",
                //width: "40px",
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
        */}

      </div>
    );
  }


  if (address && loadingUser) {
    return (
      <main className="p-4 pb-10 min-h-[100vh] flex items-start justify-center container max-w-screen-2xl mx-auto bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="py-0 w-full flex flex-col items-center justify-center gap-4">

          <Image
            src="/banner-loading.gif"
            alt="Loading"
            width={200}
            height={200}
          />

          <div className="text-lg text-slate-600">회원 정보를 불러오는 중</div>
        </div>
      </main>
    );
  }

  const activeSeller = sellersBalance[0];
  const saleRateValue = usdtKrwRateAnimationArray[0] ?? activeSeller?.seller?.usdtToKrwRate;
  const isSellerVerified = Boolean(
    activeSeller?.verified ??
    activeSeller?.seller?.verified ??
    (activeSeller?.seller?.status === 'confirmed')
  );
  const shareLabel = !sellerProfileLoaded
    ? '... 판매자 공유하기'
    : (activeSeller?.nickname ? `${activeSeller.nickname} 판매자 공유하기` : null);
  const dailyTradeHistory = [
    { day: '월', value: 58 },
    { day: '화', value: 92 },
    { day: '수', value: 74 },
    { day: '목', value: 126 },
    { day: '금', value: 98 },
    { day: '토', value: 140 },
    { day: '일', value: 112 },
  ];
  const dailyTradeMax = Math.max(...dailyTradeHistory.map((item) => item.value), 1);
  const dailyTradeChartWidth = 320;
  const dailyTradeChartHeight = 96;
  const dailyTradeChartInset = 8;
  const dailyTradeChartStep =
    dailyTradeHistory.length > 1
      ? dailyTradeChartWidth / (dailyTradeHistory.length - 1)
      : dailyTradeChartWidth;
  const dailyTradePoints = dailyTradeHistory.map((item, index) => {
    const x = Math.round(index * dailyTradeChartStep);
    const y =
      dailyTradeChartInset +
      Math.round(
        (1 - item.value / dailyTradeMax) *
          (dailyTradeChartHeight - dailyTradeChartInset * 2)
      );
    return { x, y };
  });
  const dailyTradeLinePath = dailyTradePoints.length
    ? `M ${dailyTradePoints.map((point) => `${point.x},${point.y}`).join(' ')}`
    : '';
  const dailyTradeAreaPath = dailyTradePoints.length
    ? `M 0 ${dailyTradeChartHeight} L ${dailyTradePoints
        .map((point) => `${point.x},${point.y}`)
        .join(' ')} L ${dailyTradeChartWidth} ${dailyTradeChartHeight} Z`
    : '';
  const bannerAds = globalBannerAds;





  return (

    <main className="relative overflow-hidden p-4 pb-10 min-h-[100vh] flex items-start justify-center container max-w-screen-sm mx-auto bg-[radial-gradient(120%_120%_at_0%_0%,#fff7ed_0%,#fef2f2_38%,#eff6ff_78%,#ecfeff_100%)]">

      <AutoConnect
          client={client}
          wallets={[wallet]}
      />

      <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25)_0%,transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.25)_0%,transparent_70%)] blur-2xl" />

      {bannerAds.length > 0 && (
        <>
          <aside className="pointer-events-auto hidden xl:flex fixed left-6 top-28 z-20 flex-col gap-4">
            {bannerAds.map((ad) => (
              <a
                key={`left-${ad.id}`}
                href={ad.link}
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <div className="relative w-56 aspect-[2/1] overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.6)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/40 opacity-70" />
                  <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-amber-300/40 blur-2xl" />
                </div>
              </a>
            ))}
          </aside>

          <aside className="pointer-events-auto hidden xl:flex fixed right-6 top-28 z-20 flex-col gap-4">
            {bannerAds.map((ad) => (
              <a
                key={`right-${ad.id}`}
                href={ad.link}
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <div className="relative w-56 aspect-[2/1] overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.6)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/40 opacity-70" />
                  <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-sky-300/40 blur-2xl" />
                </div>
              </a>
            ))}
          </aside>
        </>
      )}

      <div className="relative z-10 w-full">




      {/* fixed position right and vertically center */}
      {/*
      <div className="
        flex
        fixed right-4 top-1/2 transform -translate-y-1/2
        z-40
        ">

          <div className="w-full flex flex-col items-end justify-center gap-4">

            <div className="
              h-20
              flex flex-row items-center justify-center gap-2
              bg-white/80
              p-2 rounded-lg shadow-md
              backdrop-blur-md
            ">
              {loadingTotalNumberOfBuyOrders ? (
                <Image
                  src="/loading.png"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="w-6 h-6 animate-spin"
                />
              ) : (
                <Image
                  src="/icon-buyorder.png"
                  alt="Buy Order"
                  width={35}
                  height={35}
                  className="w-6 h-6"
                />
              )}

              {processingBuyOrders.length > 0 && (
              <div className="flex flex-row items-center justify-center gap-1">
                {processingBuyOrders.slice(0, 3).map((order: BuyOrder, index: number) => (

                  <div className="flex flex-col items-center justify-center
                  bg-white p-1 rounded-lg shadow-md
                  "
                  key={index}>
                    <Image
                      src={order?.store?.storeLogo || '/logo.png'}
                      alt={order?.store?.storeName || 'Store'}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-lg object-cover"
                    />
                    <span className="text-xs text-gray-500">
                      {order?.store?.storeName || 'Store'}
                    </span>
                    <span className="text-sm text-gray-800 font-semibold">
                      {order?.buyer.depositName || 'Buyer'}
                    </span>
                  </div>

                ))}

                {processingBuyOrders.length > 3 && (
                  <span className="text-sm text-gray-500">
                    +{processingBuyOrders.length - 3}
                  </span>
                )}
              </div>
              )}

              <p className="text-lg text-red-500 font-semibold">
                {
                totalNumberOfBuyOrders
                }
              </p>

              {totalNumberOfBuyOrders > 0 && (
                <div className="flex flex-row items-center justify-center gap-2">
                  <Image
                    src="/icon-notification.gif"
                    alt="Notification"
                    width={50}
                    height={50}
                    className="w-15 h-15 object-cover"
                    
                  />
                </div>
              )}
            </div>

        
          </div>

        </div>
        */}


      <div className="py-0 w-full">
        <div className="mb-4 flex w-full items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push(`/${params.lang}/loot`)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 12l9-9 9 9M6 10v10a1 1 0 001 1h3m6-11v11a1 1 0 01-1 1h-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            홈으로
          </button>

          {!isOwnerSeller && (
            <button
              type="button"
              onClick={() => router.push(`/${params.lang}/loot/buy`)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_-25px_rgba(249,115,22,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-32px_rgba(249,115,22,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              다른 판매자 보러가기
            </button>
          )}
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-3 mb-6
        p-5
        bg-white/80
        border border-slate-200/70
        rounded-2xl
        shadow-[0_24px_60px_-45px_rgba(15,23,42,0.6)]
        backdrop-blur
        ">

          <div className="w-full flex flex-row items-center justify-center gap-2">
            {/* 홈으로 가기 svg icon button */}
            {/*
            <button
              onClick={() => router.push('/index.html')}
              className="flex items-center justify-center
              bg-slate-100 text-sm text-slate-900 p-2 rounded-lg hover:bg-slate-200 border border-slate-200 shadow-md"
              title="홈으로 가기"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            */}

            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm
                    ${isOwnerSeller ? '' : 'invisible'}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    내 판매자 페이지
                  </span>
                  {isOwnerSeller && (
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-2 text-xs font-semibold text-orange-600 shadow-[0_10px_24px_-18px_rgba(249,115,22,0.6)] transition hover:bg-orange-100/80 sm:w-auto sm:px-4 sm:text-sm"
                      onClick={() => router.push(`/${params.lang}/loot/seller-settings`)}
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-orange-300/70 bg-white text-orange-600 shadow-[0_6px_14px_-10px_rgba(249,115,22,0.7)]">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M10.5 2h3l.5 2.2a7.6 7.6 0 0 1 1.7.7l2-1.2 2.1 2.1-1.2 2a7.6 7.6 0 0 1 .7 1.7L22 10.5v3l-2.2.5a7.6 7.6 0 0 1-.7 1.7l1.2 2-2.1 2.1-2-1.2a7.6 7.6 0 0 1-1.7.7L13.5 22h-3l-.5-2.2a7.6 7.6 0 0 1-1.7-.7l-2 1.2-2.1-2.1 1.2-2a7.6 7.6 0 0 1-.7-1.7L2 13.5v-3l2.2-.5a7.6 7.6 0 0 1 .7-1.7l-1.2-2 2.1-2.1 2 1.2a7.6 7.6 0 0 1 1.7-.7L10.5 2z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </svg>
                      </span>
                      내 판매자 설정하기
                    </button>
                  )}
                </div>
                {shareLabel && (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-white sm:w-auto sm:py-1"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("링크가 복사되었습니다.");
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M15 8a3 3 0 10-6 0v1H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2V8z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 5v6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                    {shareLabel}
                  </button>
                )}
              </div>
              {isOwnerSeller && (
                <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700 sm:justify-start sm:text-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 8v4l3 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  내가 관리하는 판매자 페이지입니다
                </div>
              )}

              <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-stretch gap-3">
                  <div className="flex aspect-square shrink-0 self-stretch items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
                    <Image
                      src={activeSeller?.avatar || activeSeller?.seller?.avatar || "/icon-seller.png"}
                      alt="Seller"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover ring-1 ring-white/80"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      판매자
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900">
                        {activeSeller?.nickname || '판매자'}
                      </span>
                      {activeSeller && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            isSellerVerified
                              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-600'
                              : 'border-rose-400/40 bg-rose-400/10 text-rose-600'
                          }`}
                        >
                          {isSellerVerified ? (
                            <Image
                              src="/verified.png"
                              alt="Verified"
                              width={14}
                              height={14}
                              className="h-3.5 w-3.5"
                            />
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M12 8v5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <circle
                                cx="12"
                                cy="16"
                                r="1"
                                fill="currentColor"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                          {isSellerVerified ? '인증됨' : '미인증'}
                        </span>
                      )}
                      {activeSeller?.seller?.totalPaymentConfirmedUsdtAmount > 20 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                          <Image
                            src="/icon-best-seller.png"
                            alt="Best Seller"
                            width={14}
                            height={14}
                            className="h-3.5 w-3.5"
                          />
                          베스트셀러
                        </span>
                      )}
                    </div>
                    {activeSeller?.walletAddress && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">
                          지갑 {activeSeller.walletAddress.substring(0, 6)}...{activeSeller.walletAddress.substring(activeSeller.walletAddress.length - 4)}
                        </span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-white"
                          onClick={() => {
                            navigator.clipboard.writeText(activeSeller.walletAddress);
                            toast.success(Copied_Wallet_Address);
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M9 9h10a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8a2 2 0 012-2z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 15H4a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          지갑복사
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icon-escrow-wallet.webp"
                      alt="Escrow Wallet"
                      width={50}
                      height={50}
                      className="w-8 h-8"
                    />
                    <div className="text-lg font-semibold text-slate-800">
                      판매자 에스크로 지갑
                    </div>
                  </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  className="rounded-full border border-slate-200/70 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] hover:bg-white"
                  onClick={() => {
                    navigator.clipboard.writeText(sellerWalletAddress);
                    toast.success(Copied_Wallet_Address);
                  } }
                >
                  {sellerWalletAddress.substring(0, 6)}...{sellerWalletAddress.substring(sellerWalletAddress.length - 4)}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-white"
                  onClick={() => {
                    navigator.clipboard.writeText(sellerWalletAddress);
                    toast.success(Copied_Wallet_Address);
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 9h10a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8a2 2 0 012-2z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 15H4a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  지갑복사
                </button>
              </div>
                </div>
              </div>
            </div>
          </div>


        </div>

        <div className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/90 p-4 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.9)] backdrop-blur">
          {sellersBalance[0]?.seller?.priceSettingMethod === 'market' && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                실시간 환율 정보
                <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                  LIVE
                </span>
              </div>
              <span className="text-xs text-slate-400">USDT/KRW</span>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {sellersBalance[0]?.seller?.priceSettingMethod === 'market'
            && sellersBalance[0]?.seller?.market === 'upbit' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Image
                    src="/icon-market-upbit.png"
                    alt="Upbit"
                    width={50}
                    height={50}
                    className="h-7 w-7 rounded-lg border border-slate-800/80 bg-slate-900/80 object-contain p-1"
                  />
                  <span>업비트</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-white tabular-nums sm:text-xl"
                    style={{ fontFamily: 'monospace' }}>
                    {animatedUpbitUsdtToKrwRate && animatedUpbitUsdtToKrwRate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span
                      className={`${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-emerald-300' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-rose-300' :
                        'text-slate-300'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `▲ ${upbitUsdtToKrwRateChangePrice}` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `▼ ${upbitUsdtToKrwRateChangePrice}` :
                        `- 0`
                      }
                    </span>
                    <span
                      className={`${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-emerald-300' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-rose-300' :
                        'text-slate-300'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        `(0.0000%)`
                      }
                    </span>
                  </div>
                  <span className="text-xs text-slate-400"
                    style={{ fontFamily: 'monospace' }}>
                    {
                      TradeDateKst && TradeTimeKst ? `${TradeTimeKst.slice(0,2)}:${TradeTimeKst.slice(2,4)}:${TradeTimeKst.slice(4,6)}` : ''
                    }
                  </span>
                </div>
              </div>
            )}

            {sellersBalance[0]?.seller?.priceSettingMethod === 'market'
            && sellersBalance[0]?.seller?.market === 'bithumb' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Image
                    src="/icon-market-bithumb.png"
                    alt="Bithumb"
                    width={50}
                    height={50}
                    className="h-7 w-7 rounded-lg border border-slate-800/80 bg-slate-900/80 object-contain p-1"
                  />
                  <span>빗썸</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-white tabular-nums sm:text-xl"
                    style={{ fontFamily: 'monospace' }}>
                    {animatedBithumbUsdtToKrwRate && animatedBithumbUsdtToKrwRate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span
                      className={`${
                        bithumbUsdtToKrwRateChange === 'RISE' ? 'text-emerald-300' :
                        bithumbUsdtToKrwRateChange === 'FALL' ? 'text-rose-300' :
                        'text-slate-300'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        bithumbUsdtToKrwRateChange === 'RISE' ? `▲ ${bithumbUsdtToKrwRateChangePrice}` :
                        bithumbUsdtToKrwRateChange === 'FALL' ? `▼ ${bithumbUsdtToKrwRateChangePrice}` :
                        `- 0`
                      }
                    </span>
                    <span
                      className={`${
                        bithumbUsdtToKrwRateChange === 'RISE' ? 'text-emerald-300' :
                        bithumbUsdtToKrwRateChange === 'FALL' ? 'text-rose-300' :
                        'text-slate-300'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        bithumbUsdtToKrwRateChange === 'RISE' ? `(${(bithumbUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        bithumbUsdtToKrwRateChange === 'FALL' ? `(${(bithumbUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        `(0.0000%)`
                      }
                    </span>
                  </div>
                  <span className="text-xs text-slate-400"
                    style={{ fontFamily: 'monospace' }}>
                    {
                      TradeDateKst && TradeTimeKst ? `${TradeTimeKst.slice(0,2)}:${TradeTimeKst.slice(2,4)}:${TradeTimeKst.slice(4,6)}` : ''
                    }
                  </span>
                </div>
              </div>
            )}

            {sellersBalance[0]?.seller?.priceSettingMethod === 'market'
            && sellersBalance[0]?.seller?.market === 'korbit' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Image
                    src="/icon-market-korbit.png"
                    alt="Korbit"
                    width={50}
                    height={50}
                    className="h-7 w-7 rounded-lg border border-slate-800/80 bg-slate-900/80 object-contain p-1"
                  />
                  <span>코빗</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-white tabular-nums sm:text-xl"
                    style={{ fontFamily: 'monospace' }}>
                    {animatedUpbitUsdtToKrwRate && animatedUpbitUsdtToKrwRate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span
                      className={`${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-emerald-300' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-rose-300' :
                        'text-slate-300'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `▲ ${upbitUsdtToKrwRateChangePrice}` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `▼ ${upbitUsdtToKrwRateChangePrice}` :
                        `- 0`
                      }
                    </span>
                    <span
                      className={`${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-emerald-300' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-rose-300' :
                        'text-slate-300'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        `(0.0000%)`
                      }
                    </span>
                  </div>
                  <span className="text-xs text-slate-400"
                    style={{ fontFamily: 'monospace' }}>
                    {
                      TradeDateKst && TradeTimeKst ? `${TradeTimeKst.slice(0,2)}:${TradeTimeKst.slice(2,4)}:${TradeTimeKst.slice(4,6)}` : ''
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {activeSeller?.seller && saleRateValue != null && (
          <div className="mt-4 w-full rounded-2xl border border-amber-400/70 bg-gradient-to-r from-amber-500/90 via-amber-400/80 to-orange-500/90 p-[1px] shadow-[0_22px_60px_-25px_rgba(245,158,11,0.85)]">
            <div className="rounded-2xl bg-slate-950/95 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/20 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                  <span className="inline-flex h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.85)]" />
                  판매금액
                  <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                    핵심정보
                  </span>
                </div>
                <span className="text-xs text-amber-200">원/USDT</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-end gap-2">
                  <span
                    className="text-4xl font-semibold text-amber-200 drop-shadow-[0_6px_18px_rgba(251,191,36,0.5)] sm:text-5xl"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {saleRateValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>
                  <span className="text-sm font-semibold text-amber-100">KRW</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-100">
                  {activeSeller.seller.priceSettingMethod === 'market' ? (
                    <>
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-200">
                        시장가
                      </span>
                      {activeSeller.seller.market === 'upbit' && (
                        <Image
                          src="/icon-market-upbit.png"
                          alt="Upbit"
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-md border border-slate-800/70 bg-slate-900/70 object-contain p-0.5"
                        />
                      )}
                      {activeSeller.seller.market === 'bithumb' && (
                        <Image
                          src="/icon-market-bithumb.png"
                          alt="Bithumb"
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-md border border-slate-800/70 bg-slate-900/70 object-contain p-0.5"
                        />
                      )}
                      {activeSeller.seller.market === 'korbit' && (
                        <Image
                          src="/icon-market-korbit.png"
                          alt="Korbit"
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-md border border-slate-800/70 bg-slate-900/70 object-contain p-0.5"
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[11px] text-amber-200">
                        지정가
                      </span>
                      {activeSeller.walletAddress === address
                      && activeSeller.seller?.buyOrder?.status !== 'ordered'
                      && activeSeller.seller?.buyOrder?.status !== 'paymentRequested' && (
                        <>
                          <button
                            onClick={() => {
                              updateUsdtToKrwRate(
                                0,
                                activeSeller.seller._id,
                                activeSeller.seller.usdtToKrwRate + 1,
                              );
                            }}
                            disabled={updatingUsdtToKrwRateArray[0]}
                            className={`
                              h-7 w-7 rounded-full border border-emerald-300/40 text-emerald-200 transition
                              ${updatingUsdtToKrwRateArray[0]
                              ? 'cursor-not-allowed text-slate-500'
                              : 'hover:bg-emerald-400/20 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)]'}
                            `}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => {
                              updateUsdtToKrwRate(
                                0,
                                activeSeller.seller._id,
                                activeSeller.seller.usdtToKrwRate - 1,
                              );
                            }}
                            disabled={updatingUsdtToKrwRateArray[0]}
                            className={`
                              h-7 w-7 rounded-full border border-rose-300/40 text-rose-200 transition
                              ${updatingUsdtToKrwRateArray[0]
                              ? 'cursor-not-allowed text-slate-500'
                              : 'hover:bg-rose-400/20 hover:shadow-[0_0_12px_rgba(244,63,94,0.35)]'}
                            `}
                          >
                            ▼
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-amber-200/80">
                <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1">
                  구매자가 가장 먼저 확인해야 하는 핵심 금액
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col items-start justify-center gap-4 mt-4">

            {/* 돌아가기 버튼 */}
            {/* /ko/seller/buyorder */}
            {/*
            <button
              onClick={() => router.push('/' + params.lang + '/seller/buyorder')}
              className="flex items-center justify-center gap-2
              bg-slate-100 text-sm text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 border border-slate-200 shadow-md mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm text-slate-900">
                뒤로가기
              </span>
            </button>
            */}


          {/* USDT 가격 binance market price */}
          {/*
          <div
            className="
              h-20
              w-full flex
              binance-widget-marquee
            flex-row items-center justify-center gap-2
            p-2
            "


            data-cmc-ids="1,1027,52,5426,3408,74,20947,5994,24478,13502,35336,825"
            data-theme="dark"
            data-transparent="true"
            data-locale="ko"
            data-fiat="KRW"
            //data-powered-by="Powered by Vienna Mania"
            //data-disclaimer="Disclaimer"
          ></div>
          */}
          



          {/*
          {address && (
              <div className="w-full flex flex-col items-end justify-center gap-4">

                  <div className="flex flex-row items-center justify-center gap-2">
                      <Image
                          src="/icon-shield.png"
                          alt="Wallet"
                          width={50}
                          height={50}
                          className="w-6 h-6"
                      />
                      <button
                          className="text-lg text-slate-600 underline"
                          onClick={() => {
                              navigator.clipboard.writeText(address);
                              toast.success(Copied_Wallet_Address);
                          } }
                      >
                          {address.substring(0, 6)}...{address.substring(address.length - 4)}
                      </button>

                  </div>

                  <div className="flex flex-row items-center justify-center  gap-2">
                    <Image
                        src="/icon-tether.png"
                        alt="USDT"
                        width={50}
                        height={50}
                        className="w-6 h-6"
                    />
                    <span className="text-2xl xl:text-4xl font-semibold text-[#409192]"
                      style={{ fontFamily: 'monospace' }}
                    >
                        {Number(balance).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </span>
                  </div>

              </div>
          )}
          */}







          {/*
          <div className="w-full flex flex-row items-center justify-end gap-2">

            <div className="flex flex-row items-center justify-center gap-2
            bg-white/80
            p-2 rounded-lg shadow-md
            backdrop-blur-md
            ">
              {loadingTotalNumberOfBuyOrders ? (
                <Image
                  src="/icon-loading.png"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="w-6 h-6 animate-spin"
                />
              ) : (
                <Image
                  src="/icon-buyorder.png"
                  alt="Buy Order"
                  width={35}
                  height={35}
                  className="w-6 h-6"
                />
              )}


              <p className="text-lg text-red-500 font-semibold">
                {
                totalNumberOfBuyOrders
                }
              </p>

              {totalNumberOfBuyOrders > 0 && (
                <div className="flex flex-row items-center justify-center gap-2">
                  <Image
                    src="/icon-notification.gif"
                    alt="Notification"
                    width={50}
                    height={50}
                    className="w-15 h-15 object-cover"
                    
                  />
                </div>
              )}
            </div>

            {version !== 'bangbang' && (
            <div className="hidden flex-row items-center justify-center gap-2
            bg-white/80
            p-2 rounded-lg shadow-md
            backdrop-blur-md
            ">

              {loadingTotalNumberOfClearanceOrders ? (
                <Image
                  src="/icon-loading.png"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="w-6 h-6 animate-spin"
                />
              ) : (
                <Image
                  src="/icon-clearance.png"
                  alt="Clearance"
                  width={35}
                  height={35}
                  className="w-6 h-6"
                />
              )}

              <p className="text-lg text-yellow-500 font-semibold">
                {
                totalNumberOfClearanceOrders
                }
              </p>

              {totalNumberOfClearanceOrders > 0 && (
                <div className="flex flex-row items-center justify-center gap-2">
                  <Image
                    src="/icon-notification.gif"
                    alt="Notification"
                    width={50}
                    height={50}
                    className="w-15 h-15 object-cover"
                    
                  />
                  <button
                    onClick={() => {
                      router.push('/' + params.lang + '/administration/clearance-history');
                    }}
                    className="flex items-center justify-center gap-2
                    bg-[#0047ab] text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-[#0047ab]/80"
                  >
                    <span className="text-sm">
                      청산관리
                    </span>
                  </button>
                </div>
              )}
            </div>
            )}
        
          </div>
          */}



          
          
          {/* 오늘 거래 현황 */}

          <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-4
          border-t border-b border-slate-200
          py-4
          ">

            <div className="w-full flex flex-col items-center justify-start gap-2">

              <div className="w-full flex flex-row items-center justify-center gap-2">              
                <div className="flex flex-col gap-2 items-center">
                  {/* background color is 파스텔 오렌지  */}
                  <div className="
                    bg-orange-100/80
                    px-2 py-1 rounded-full
                    text-sm font-semibold text-orange-800
                    border border-orange-200
                  "
                  >
                    {/* dot before */}
                    <div className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    <span className="align-middle">
                      오늘 거래량
                    </span>
                  </div>
                  <div className="text-4xl font-semibold text-slate-800">
                    {
                      //buyOrderStats.totalCount?.toLocaleString()
                      animatedTotalCount
                    }
                  </div>
                </div>
              </div>

              <div className="w-full max-w-xl rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>일별 거래 이력</span>
                  <span className="text-slate-400">최근 7일</span>
                </div>
                <div className="mt-3 h-24 w-full">
                  <svg
                    viewBox={`0 0 ${dailyTradeChartWidth} ${dailyTradeChartHeight}`}
                    preserveAspectRatio="none"
                    className="h-full w-full"
                  >
                    <defs>
                      <linearGradient id="dailyTradeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {dailyTradeAreaPath && (
                      <path d={dailyTradeAreaPath} fill="url(#dailyTradeAreaGradient)" />
                    )}
                    {dailyTradeLinePath && (
                      <path
                        d={dailyTradeLinePath}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {dailyTradePoints.map((point, index) => (
                      <circle
                        key={`${dailyTradeHistory[index]?.day}-${point.x}`}
                        cx={point.x}
                        cy={point.y}
                        r="3.5"
                        fill="#fff7ed"
                        stroke="#f97316"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>
                <div className="mt-2 flex w-full items-center justify-between text-[10px] font-semibold text-slate-500">
                  {dailyTradeHistory.map((item) => (
                    <span key={item.day}>{item.day}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-row items-center justify-center gap-2">

                <div className="flex flex-col gap-2 items-center">
                  <div className="
                    bg-white/70
                    px-2 py-1 rounded-full
                    text-sm font-semibold text-slate-800
                    border border-slate-200
                  ">
                    {/* dot before */}
                    <div className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span className="align-middle">
                      거래량(USDT)
                    </span>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-1">
                    <Image
                      src="/icon-tether.png"
                      alt="Tether"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    {/* RGB: 64, 145, 146 */}
                    <span className="text-4xl text-[#409192]"
                      style={{ fontFamily: 'monospace' }}>
                      {
                        //buyOrderStats.totalUsdtAmount
                        //? buyOrderStats.totalUsdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        //: '0.000'
                        animatedTotalUsdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-center">
                  <div className="
                    bg-white/70
                    px-2 py-1 rounded-full
                    text-sm font-semibold text-slate-800
                    border border-slate-200
                  ">
                    {/* dot before */}
                    <div className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                    <span className="align-middle">
                      거래금액(원)
                    </span>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-1">
                    <span className="text-4xl text-yellow-600"
                      style={{ fontFamily: 'monospace' }}>
                      {
                        //buyOrderStats.totalKrwAmount?.toLocaleString()
                        animatedTotalKrwAmount.toLocaleString()
                      }
                    </span>
                  </div>
                </div>

              </div>

            </div>


            {/* list of buyOrders when status is 'ordered' or 'accepted' or 'paymentRequested' */}
            {/* traideId, usdtAmount, krwAmount, createdAt */}
            {/*
            <table className="w-full xl:table-auto border-collapse border border-slate-200
            bg-white/80
            p-4 rounded-lg shadow-md
            backdrop-blur-md
            ">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm font-semibold">
                  <th className="border border-slate-200 px-2 py-1">거래ID</th>
                  <th className="border border-slate-200 px-2 py-1">구래량(USDT)</th>
                  <th className="border border-slate-200 px-2 py-1">거래금액(원)</th>
                  <th className="border border-slate-200 px-2 py-1">생성일시</th>
                  <th className="border border-slate-200 px-2 py-1">상태</th>
                </tr>
              </thead>
              <tbody>
                {buyOrders.filter((order) =>
                  order.status === 'ordered' ||
                  order.status === 'accepted' ||
                  order.status === 'paymentRequested'
                ).map((order, index) => (
                  <tr key={index} className="text-slate-600 text-sm hover:bg-slate-50
                  transition-colors duration-150 ease-in-out
                  ">
                    <td className="border border-slate-200 px-2 py-1 text-center">{order.tradeId}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {order.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1 text-center"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {order.krwAmount.toLocaleString()}
                    </td>
                    <td className="border border-slate-200 px-2 py-1 text-center">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-slate-200 px-2 py-1 text-center capitalize">
                      {order.status === 'ordered' && '주문접수'}
                      {order.status === 'accepted' && '결제대기'}
                      {order.status === 'paymentRequested' && '결제요청중'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            */}




            <div className="hidden flex-col items-end justify-center gap-4">

              {/* 구매주문 목록 */}
              <div className="
                w-full flex
                flex-row items-center justify-end gap-2
                bg-blue-50/80
                p-2 rounded-lg shadow-xl
                backdrop-blur-md
                border border-slate-200
              ">
  
                {/* array of processingBuyOrders store logos */}
                {processingBuyOrders.length > 0 && (
                <div className="w-full
                  flex flex-col
                  xl:flex-row items-center justify-end gap-2">
                  
                  {/* background dark colors */}
                  {processingBuyOrders.slice(0, 3).map((order: BuyOrder, index: number) => (

                    
                    <div className="
                    w-52

                    flex flex-row items-center justify-start gap-2
                    bg-white/90 border border-slate-200
                    p-2 rounded-lg shadow-md
                    backdrop-blur-md

                    relative
                    "
                    key={index}>

                      {/* top right corner position absolute red dot indicator for status is 'ordered' */}
                      {order.status === 'ordered' && (
                        <div className="
                          absolute top-0 right-0
                          w-4 h-4
                          bg-red-500
                          rounded-full
                          border-2 border-white
                        ">
                        </div>
                      )}

                      {/* order.nickname position fixed top left corner ribbon style */}
                      <div className="
                      absolute top-0 left-0
                      flex flex-row items-center justify-start
                      ">
                        <div className="w-full flex flex-row items-center justify-between gap-2
                        bg-green-500 text-white px-2 py-1 rounded-br-lg rounded-tl-lg shadow-lg
                        ">
                          <div className="flex flex-row items-center justify-center gap-1">
                            <Image
                              src="/icon-buyer.png"
                              alt="Buyer"
                              width={20}
                              height={20}
                              className="w-6 h-6 rounded-lg object-cover"
                            />
                            <span className="text-sm font-semibold">
                              {order.nickname}
                            </span>
                            {!order.isWeb3Wallet && (
                              <Image
                                src="/icon-payment.png"
                                alt="Web3 Wallet"
                                width={20}
                                height={20}
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                            )}
                          </div>

                          {/* whe  seller.seller?.totalPaymentConfirmedUsdtAmount > 10, show a badge */}
                          {/*
                          {seller.seller?.totalPaymentConfirmedUsdtAmount > 20 && (
                            <Image
                              src="/icon-best-seller.png"
                              alt="Best Seller"
                              width={30}
                              height={30}
                              className="w-6 h-6 rounded-lg object-cover"
                            />
                          )}
                          */}

                        </div>
                      </div>
                      
                      {/* order.seller.nickname positon fixed botton right corner ribbon style */}
                      {order.status === 'accepted' || order.status === 'paymentRequested' && (
                        <div className="
                        absolute bottom-0 right-0
                        flex flex-row items-center justify-end
                        ">
                          <div className="w-full flex flex-row items-center justify-between gap-2
                          bg-blue-500 text-white px-2 py-1 rounded-tl-lg rounded-br-lg shadow-lg
                          ">
                            <div className="flex flex-row items-center justify-center gap-1">
                              <span className="text-sm font-semibold">
                                {order.seller.nickname}
                              </span>
                              <Image
                                src="/icon-seller.png"
                                alt="Seller"
                                width={20}
                                height={20}
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="w-full flex flex-row items-start justify-between gap-2 mt-8 mb-8">
                        
                        <div className="w-full flex flex-col items-start justify-center gap-2 relative">
                          <div className="absolute -left-2 -top-2">
                            <Image
                              src="/icon-sale.png"
                              alt="Status Badge"
                              width={40}
                              height={40}
                              className="w-9 h-9 object-contain drop-shadow"
                            />
                          </div>
                          <Image
                            src={order?.store?.storeLogo || '/logo.png'}
                            alt={order?.store?.storeName || 'Store'}
                            width={30}
                            height={30}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          {/* status */}
                          <div className="flex flex-row items-center justify-center gap-1 text-sm font-semibold">
                            {order.status === 'ordered' && (
                              <span className="text-red-400 font-semibold">
                                매칭대기중
                              </span>
                            )}
                            {order.status === 'accepted' && (
                              <span className="text-blue-400 font-semibold">
                                결제대기중
                              </span>
                            )}
                            {order.status === 'paymentRequested' && (
                              <span className="text-amber-400 font-semibold">
                                입금진행중
                              </span>
                            )}
                          </div>

                          {order.status === 'ordered' && (
                            <span className="text-sm text-slate-600">
                              {
                                (new Date().getTime() - new Date(order?.createdAt).getTime()) > 0
                                ? `${Math.floor((new Date().getTime() - new Date(order?.createdAt).getTime()) / 60000)}분 경과`
                                : ''
                              }
                            </span>
                          )}

                          {order.status === 'paymentRequested' && (
                            <span className="text-sm text-slate-600">
                              {
                                (new Date().getTime() - new Date(order?.paymentRequestedAt).getTime()) > 0
                                ? `${Math.floor((new Date().getTime() - new Date(order?.paymentRequestedAt).getTime()) / 60000)}분 경과`
                                : ''
                              }
                            </span>
                          )}


                        </div>

                        <div className="w-full flex flex-col items-end justify-center gap-1">
                          <span className="text-sm text-slate-800 font-semibold">
                            {order?.buyer.depositName.length > 1
                              ? order?.buyer.depositName.slice(0, 1) + '**'
                              : order?.buyer.depositName
                            }
                          </span>

                          <div className="flex flex-row items-center justify-end gap-1">
                            <Image
                              src="/icon-tether.png"
                              alt="Tether"
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                            <span className="text-lg text-emerald-300 font-semibold"
                              style={{ fontFamily: 'monospace' }}>
                              {order?.usdtAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </span>
                          </div>
                          <span className="text-sm text-amber-300 font-semibold"
                            style={{ fontFamily: 'monospace' }}>
                            {order?.krwAmount.toLocaleString()}
                          </span>
                          {/* rate */}
                          <span className="text-xs text-slate-700 font-semibold"
                            style={{ fontFamily: 'monospace' }}>
                            {order?.rate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 원/USDT
                          </span>
                        </div>

                      </div>

                    </div>

                  ))}

                  {processingBuyOrders.length > 3 && (
                    <span className="text-4xl text-slate-700 font-semibold">
                      +{processingBuyOrders.length - 3}
                    </span>
                  )}
                </div>
                )}

                {/*
                <div className="flex flex-row items-center justify-center gap-2">

                  <p className="text-lg text-red-500 font-semibold">
                    {
                    totalNumberOfBuyOrders
                    }
                  </p>

                </div>
                */}

                {totalNumberOfBuyOrders > 0 && (
                  <div className="w-28 flex flex-row items-center justify-center gap-2">
                    <Image
                      src="/icon-notification.gif"
                      alt="Notification"
                      width={50}
                      height={50}
                      className="w-15 h-15 object-cover"
                      
                    />
                  </div>
                )}


              </div>


          
            </div>


          </div>

          
          
          {bannerAds.length > 0 && (
            <div className="w-full">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
                <div className="flex items-center justify-between gap-3 mb-2 px-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    프로모션 배너
                  </div>
                  <span className="text-xs text-slate-600">좌로 자동 스크롤</span>
                </div>
                <div className="escrow-banner-marquee">
                  <div className="escrow-banner-track">
                    {[0, 1].map((loopIndex) => (
                      <div key={`scroll-loop-${loopIndex}`} className="escrow-banner-group">
                        {bannerAds.map((ad) => (
                          <a
                            key={`${loopIndex}-${ad.id}`}
                            href={ad.link}
                            target="_blank"
                            rel="noreferrer"
                            className="escrow-banner-card"
                          >
                            <div className="relative w-44 aspect-[2/1] overflow-hidden rounded-xl border border-white/80 bg-white/80 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.55)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/40 opacity-70" />
                            </div>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 판매자 대화목록 섹션 */}
          {!isOwnerSeller && (
            <SendbirdChatEmbed
                buyerWalletAddress={address}
                sellerWalletAddress={ownerWalletAddress}
                selectedChannelUrl={selectedChatChannelUrl || undefined}
                isOpen={isChatOpen}
                onOpenChange={setIsChatOpen}
                variant="inline"
                promotionContext={sellerPromotionContext}
            />
          )}
          <div className="w-full flex flex-col items-start justify-center gap-2
          border-t border-b border-slate-200
          py-4
          ">

            {sellersBalance.length > 0 && (
              <div className="w-full flex flex-col items-center justify-center gap-4">

                {sellersBalance.map((seller, index) => (
                  <div key={index}

                    // if currentUsdtBalanceArray[index] is changed, then animate the background color

                    /*
                    className="w-full flex flex-row items-start justify-between gap-4
                    bg-white/80
                    p-4 rounded-lg shadow-md
                    backdrop-blur-md
                    ">
                    */

                    // seller.buyOrder.status = 'ordered' or 'paymentRequested' - red border and pulse animation
                    className={`w-full flex flex-col xl:flex-row items-start justify-between gap-4
                    bg-white/90
                    p-4 rounded-lg shadow-xl
                    backdrop-blur-md
                    border border-slate-200
                    
                    ${(
                      (seller.seller.buyOrder?.status === 'ordered'
                      || seller.seller.buyOrder?.status === 'paymentRequested')
                    && (seller.walletAddress !== address && seller.seller?.buyOrder?.walletAddress !== address)
                    ) ?
                      'ring-4 ring-red-500/50 animate-pulse' : ''
                    }
                    

                 

                    ${seller.walletAddress === address
                    ? 'ring-4 ring-amber-400/70' : ''
                    }

                    ${
                    (
                      (seller.seller.buyOrder?.status === 'ordered' ||
                      seller.seller?.buyOrder?.status === 'paymentRequested')
                    && seller.seller?.buyOrder?.walletAddress === address)
                    ? 'ring-4 ring-yellow-400/70' : ''
                    }

                    `}
                  >

                    {/* if seller.walletAddress is equal to address, fixed position notice for my seller account */}
                    {/*

                    {seller.walletAddress === address && (
                      <div
                        // top right corner ribbon style
                        className="absolute top-0 right-0
                        flex flex-col items-center justify-center
                        bg-yellow-400 text-slate-800 px-2 py-1 rounded-bl-lg rounded-tr-lg
                        shadow-lg
                        ">
                        <span className="text-sm font-semibold">
                          나의 판매자계정
                        </span>

                        {seller.seller?.buyOrder?.status === 'paymentRequested' && (
                          <>
                          
                            {seller.seller?.autoProcessDeposit ? (
                              <>

                              </>
                            ) : (                      
                              <button
                
                                disabled={confirmingPayment[index]}
                                
                                className={`
                                  ${confirmingPayment[index]
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-white hover:text-white hover:shadow-yellow-500/50 cursor-pointer'
                                  } bg-blue-600 hover:bg-blue-700
                                  px-3 py-1 rounded-lg
                                  shadow-lg
                                  text-xs
                                `}

                                onClick={() => {
                                  //confirm("수동으로 입금확인을 처리하시겠습니까?") &&
                                  confirmPayment(
                                    index,
                                    seller.seller.buyOrder._id,
                                    //paymentAmounts[index],
                                    //paymentAmountsUsdt[index],

                                    seller.seller.buyOrder.krwAmount,
                                    seller.seller.buyOrder.usdtAmount,
                                    
                                    seller.seller.buyOrder?.walletAddress,

                                    seller.seller.buyOrder?.paymentMethod,
                                  );
                                }}
                              >
                                <div className="flex flex-row gap-2 items-center justify-center">
                                  { confirmingPayment[index] && (
                                      <Image
                                        src="/loading.png"
                                        alt="Loading"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5
                                        animate-spin"
                                      />
                                  )}
                                  <span className="text-xs">
                                    입금완료하기
                                  </span>
                                </div>

                              </button>
                            )}

                          </>

                        )}

                      </div>
                    )}
                    */}

                    {/* 판매자 에스크로 잔고, 입금은행정보 */}
                    <div
                      /*
                      className={`mt-4
                      w-full
                      flex flex-col items-start justify-center gap-2
                      p-2
                      border border-slate-200 rounded-lg
                      
                      ${seller.currentUsdtBalanceChanged ? 'bg-green-100/70 animate-pulse' : ''}

                      `}
                      */

                      // 배경색은 금융 무게감 있는 어두운 색상
                      className={`
                      w-full
                      flex flex-col items-start justify-center gap-4
                      relative overflow-visible
                      rounded-2xl border border-slate-200/70
                      bg-white/90 p-5
                      shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)]
                      backdrop-blur-md
                      `}

                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(59,130,246,0.12)_0%,transparent_55%)]" />
                      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/30 blur-3xl" />
                      <div className="absolute -left-2 -top-2 z-10">
                        <Image
                          src="/icon-sale.png"
                          alt="Status Badge"
                          width={44}
                          height={44}
                          className="w-11 h-11 object-contain drop-shadow"
                        />
                      </div>
                    



                      {/* seller.usdtToKrwRate */}
                      {/*
                      {seller.seller?.usdtToKrwRate && (

                        <div className="flex flex-col items-start justify-center gap-1">

                          <div className="w-full flex flex-row items-center justify-start gap-2">
                            <Image
                              src="/icon-price.png"
                              alt="Price"
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                            <div className="w-full flex flex-row items-center justify-between gap-2">
                              <span className="text-sm">
                                판매금액
                              </span>

                              <span className="text-2xl font-semibold text-yellow-600"
                                style={{ fontFamily: 'monospace' }}>
                                {
                                //seller.seller?.usdtToKrwRate.toLocaleString()
                                usdtKrwRateAnimationArray[index]?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                              </span>

                              {seller.seller?.priceSettingMethod === 'market' ? (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  {seller.seller?.market === 'upbit' && (
                                    <Image
                                      src="/icon-market-upbit.png"
                                      alt="Upbit"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                  )}
                                  {seller.seller?.market === 'bithumb' && (
                                    <Image
                                      src="/icon-market-bithumb.png"
                                      alt="Bithumb"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                  )}
                                  {seller.seller?.market === 'korbit' && (
                                    <Image
                                      src="/icon-market-korbit.png"
                                      alt="Korbit"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  {seller.walletAddress === address ? (
                                    <>

                                      {
                                      seller.seller?.buyOrder?.status !== 'ordered'
                                      && seller.seller?.buyOrder?.status !== 'paymentRequested' && (
                                        <button
                                          onClick={() => {
                                            updateUsdtToKrwRate(
                                              index,
                                              seller.seller._id,
                                              seller.seller.usdtToKrwRate + 1,
                                            );
                                          }}
                                          disabled={updatingUsdtToKrwRateArray[index]}
                                          className={`
                                            ${updatingUsdtToKrwRateArray[index]
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-green-600 hover:text-green-700 hover:shadow-green-500/50 cursor-pointer'
                                            }
                                          `}
                                        >
                                          ▲
                                        </button>
                                      )}


                                      {
                                      seller.seller?.buyOrder?.status !== 'ordered'
                                      && seller.seller?.buyOrder?.status !== 'paymentRequested' && (
                                        <button
                                          onClick={() => {
                                            updateUsdtToKrwRate(
                                              index,
                                              seller.seller._id,
                                              Math.round(upbitUsdtToKrwRate),
                                            );
                                          }}
                                          disabled={updatingUsdtToKrwRateArray[index]}
                                          className={`
                                            ${updatingUsdtToKrwRateArray[index]
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-blue-600 hover:text-blue-700 hover:shadow-blue-500/50 cursor-pointer'
                                            }
                                          `}
                                        >
                                          ⬤
                                        </button>
                                      )}


                                      {
                                      seller.seller?.buyOrder?.status !== 'ordered'
                                      && seller.seller?.buyOrder?.status !== 'paymentRequested' && (
                                        <button
                                          onClick={() => {
                                            updateUsdtToKrwRate(
                                              index,
                                              seller.seller._id,
                                              seller.seller.usdtToKrwRate - 1,
                                            );
                                          }}
                                          disabled={updatingUsdtToKrwRateArray[index]}
                                          className={`
                                            ${updatingUsdtToKrwRateArray[index]
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-red-600 hover:text-red-700 hover:shadow-red-500/50 cursor-pointer'
                                            }
                                          `}
                                        >
                                          ▼
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center gap-1
                                    border border-slate-200 rounded-lg px-2 py-1
                                    ">
                                      <span className="text-xs text-slate-600">
                                        지정가
                                      </span>
                                    </div>
                                  )}

                                </div>
                              )}

                            </div>
                          </div>

                        </div>

                      )}
                      */}
                      
                      <div className="relative w-full flex flex-col items-start justify-center gap-4">

              
                        <div className="w-full flex flex-col items-start justify-center gap-3">

                          {/*}
                          <div className="absolute top-2 right-2">
                            <Image
                              src="/icon-in-escrow.png"
                              alt="In Escrow"
                              width="80"
                              height="50"
                              className="w-20 h-10 object-contain"
                            />
                          </div>
                          */}


                          <div className="w-full flex flex-row items-center justify-between gap-2 pl-8">
                            <div className="flex flex-row items-center justify-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200/60 bg-blue-50 shadow-sm">
                                <Image
                                  src="/icon-escrow-wallet.webp"
                                  alt="Escrow Wallet"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5"
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-800">
                                에스크로 잔고
                              </span>
                            </div>
                            <span className="rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                              USDT
                            </span>
                          </div>

                          <div className="w-full flex flex-col items-start justify-center gap-3">

                          <div className="w-full flex flex-col items-center justify-start gap-3">

                              <div className="w-full rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-white px-5 py-4
                              shadow-[0_18px_45px_-28px_rgba(16,185,129,0.65)]">
                                <div className="flex flex-row items-center gap-2 text-sm font-semibold text-emerald-700">
                                  <Image
                                    src="/icon-tether.png"
                                    alt="USDT"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                  />
                                  <span>USDT</span>
                                </div>
                                <div className="mt-1 text-4xl sm:text-5xl text-emerald-700 font-semibold tracking-tight tabular-nums text-right"
                                  style={{ fontFamily: 'monospace' }}>
                                  {
                                    //Number(seller.currentUsdtBalance).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    currentUsdtBalanceArray[index]?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

                                  }
                                </div>
                              </div>
                              <a
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm hover:text-slate-800 hover:shadow-md"
                                href={`https://polygonscan.com/token/0xc2132d05d31c914a87c6611c10748aeb04b58e8f?a=${seller.seller.escrowWalletAddress}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Image
                                  src="/logo-polygon.png"
                                  alt="Polygonscan"
                                  width={16}
                                  height={16}
                                  className="h-4 w-4"
                                />
                                <span>폴리스캔에서 USDT 잔고 보기</span>
                              </a>

                              {/*
                              {seller.walletAddress === address && (
                                <div className="w-28 flex flex-col items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="충전금액"
                                    className="w-full bg-slate-100 border border-slate-200 text-slate-800 rounded-lg p-1 text-xs text-center
                                    focus:outline-none focus:ring-2 focus:ring-blue-500
                                    "
                                  />
                                  <button
                                    onClick={() => {
                                      
                                      //const inputElement = document.querySelectorAll('input')[index];
                                      //const amount = Number(inputElement.value);
                                      //if (amount >= 1) {
                                      //  router.push('/' + params.lang + '/seller/deposit-usdt?amount=' + amount);
                                      //} else {
                                      //  toast.error('충전금액은 1 USDT 이상이어야 합니다.');
                                      //}
                                    }}
                                    className="w-full text-xs text-white bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded-lg
                                    shadow-md hover:shadow-blue-500/50
                                    border border-blue-600
                                    "
                                  >
                                    충전하기
                                  </button>
                                </div>
                              )}
                              */}

                            </div>

                            {/* if balance is less than 10 USDT, show warning */}
                              {currentUsdtBalanceArray[index] < 10 ? (
                                <div className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                                  {/*Warning: Low escrow balance may result in no order assignments. Please recharge USDT. */}
                                  경고: 에스크로 잔액이 부족하면 주문 할당이 이루어지지 않을 수 있습니다. USDT를 충전해주세요.
                                </div>
                              ) : (
                                <>
                                  {seller.walletAddress === address && (
                                    <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-700">
                                      {/*If you deposit more USDT, more orders will be assigned. */}
                                      충전된 USDT가 많을수록 더 많은 주문이 할당됩니다.
                                    </div>
                                  )}
                                </>
                              )}

                            {!(
                              seller.seller?.buyOrder?.status === 'paymentRequested' ||
                              (seller.seller?.buyOrder?.status === 'paymentConfirmed' &&
                                (!seller.seller?.buyOrder?.transactionHash ||
                                  seller.seller?.buyOrder?.transactionHash === '0x'))
                            ) && (
                              <>
                                {/* if balance is greater than or equal to 10 USDT, show 판매 대기중 */}
                                {currentUsdtBalanceArray[index] >= 10 ? (

                                  <div className="w-full flex flex-col items-start justify-center gap-2">
                                    <div className="w-full flex flex-row items-start justify-start gap-2">
                                      <Image
                                        src={seller.avatar || seller.seller?.avatar || "/icon-seller.png"}
                                        alt="Seller Avatar"
                                        width={44}
                                        height={44}
                                        className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-white"
                                      />
                                      {/* 판매 홍보용 문구 */}
                                      {seller.seller?.promotionText ? (
                                      <span className="relative inline-flex min-h-[160px] flex-1 min-w-0 max-w-[420px] items-start rounded-xl border border-slate-200/70 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.4)] break-words">
                                        <span
                                          className="absolute -left-2 top-3 h-0 w-0 border-y-[8px] border-r-[8px] border-y-transparent border-r-slate-200/70"
                                          aria-hidden="true"
                                        />
                                        <span
                                          className="absolute -left-1.5 top-3.5 h-0 w-0 border-y-[6px] border-r-[6px] border-y-transparent border-r-white/90"
                                          aria-hidden="true"
                                        />
                                        <TypingText text={seller.seller?.promotionText || ''} className="typing-text" />
                                      </span>
                                      ) : (
                                      <span className="text-xs font-semibold text-slate-600">
                                        홍보 문구가 설정되지 않았습니다.
                                      </span>
                                      )}
                                      
                                    </div>

                                    {/* 입력창 */}
                                    {/* 수정하기 버튼 */}
                                    {/*
                                    {seller.walletAddress === address && (
                                      <div className="w-full flex flex-col items-start justify-center gap-1">
                                        <input
                                          type="text"
                                          className="w-full border border-slate-200 bg-slate-100 text-slate-800 rounded-lg p-2 text-xs
                                          placeholder:text-slate-600
                                          focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="판매 홍보용 문구를 입력하세요."
                                          value={promotionText}
                                          onChange={(e) => {
                                              setPromotionText(e.target.value);
                                          }}
                                        />
                                        <button
                                          disabled={updatingPromotionText}
                                          onClick={updatePromotionText}
                                          className={`
                                              ${updatingPromotionText 
                                                ? 'bg-slate-100 text-slate-600 cursor-not-allowed border border-slate-200' 
                                                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg hover:shadow-emerald-500/50 border-0 transform hover:scale-105 active:scale-95'
                                              }
                                              p-2 rounded-lg text-xs w-full font-semibold
                                              transition-all duration-200 ease-in-out
                                          `}
                                        >
                                          <span className="flex items-center justify-center gap-2">
                                            {updatingPromotionText ? (
                                              <>
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                수정중...
                                              </>
                                            ) : (
                                              <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                                수정하기
                                              </>
                                            )}
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                    */}

                                  </div>

                                ) : (
                                  <div className="flex flex-row items-center gap-2
                                  bg-red-500 text-white px-3 py-1 rounded-lg">

                                    {/* /icon-sale.png gray scale */}
                                    <Image
                                      src="/icon-sale.png"
                                      alt="Off Sale"
                                      width={30}
                                      height={30}
                                      className="w-12 h-12 object-contain grayscale"
                                    />
                                    <span className="text-xs font-semibold">
                                      에스크로 잔액 부족
                                    </span>
                                  
                                  </div>
                                )}
                              </>
                            )}

                          </div>

                        </div>

                        {/* seller.seller.bankInfo */}
                        {seller.seller?.bankInfo && (
                          <div className="w-full flex flex-row items-center justify-start gap-2">
                            {/*
                            <Image
                              src="/icon-bank-transfer.png"
                              alt="Bank"
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                            */}
                            <div className="flex flex-col items-start justify-center gap-0">
                              <span className="text-sm text-slate-800 font-semibold">
                                {seller.seller?.bankInfo?.bankName}
                              </span>
                              {seller.walletAddress === address ? (
                                <span className="text-sm text-slate-700">
                                  {seller.seller?.bankInfo?.accountNumber}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-700">
                                  {seller.seller?.bankInfo?.accountNumber.length > 5
                                    ? seller.seller?.bankInfo?.accountNumber.substring(0, 5) +'****'
                                    : seller.seller?.bankInfo?.accountNumber
                                  }
                                </span>
                              )}
                              {seller.walletAddress === address ? (
                                <span className="text-sm font-semibold text-slate-800">
                                  {seller.seller?.bankInfo?.accountHolder}
                                </span>
                              ) : (
                                <span className="text-sm font-semibold text-slate-800">
                                  {seller.seller?.bankInfo?.accountHolder.length > 2
                                    ? seller.seller?.bankInfo?.accountHolder.substring(0, 1) +'**'
                                    : seller.seller?.bankInfo?.accountHolder
                                  }
                                </span>
                              )}
                            </div>


                            {/* seller?.autoProcessDeposit */}
                            {/* toggleAutoProcessDeposit */}
                            <div className="flex flex-col items-start justify-center ml-4 gap-1">

                              <span className="w-full flex text-sm font-semibold text-slate-800">
                                자동입금처리
                              </span>
                              {seller.seller?.autoProcessDeposit ? (
                                <div className="w-full flex flex-col items-center justify-center">
                                  <div className="flex text-xs text-emerald-800 font-semibold
                                  bg-emerald-100/90 border border-emerald-200 rounded-lg px-2 py-1 text-center
                                  ">
                                    활성화 상태
                                  </div>
                                  {/* 설명 */}
                                  <div className="text-xs text-slate-700 mt-1">
                                    구매자가 입금을 하면 자동으로 입금확인이 처리됩니다.
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full flex flex-col items-center justify-center">
                                  <div className="flex text-xs text-red-700 font-semibold
                                  bg-red-100/90 border border-red-200 rounded-lg px-2 py-1 text-center
                                  ">
                                    비활성화 상태
                                  </div>
                                  {/* 설명 */}
                                  <div className="text-xs text-slate-700 mt-1">
                                    구매자가 입금을 하면 판매자가 수동으로 입금확인을 합니다.
                                  </div>
                                </div>
                              )}

                              {/*
                              {seller.walletAddress === address && (
                                <button
                                  onClick={() => {
                                      const currentValue = seller?.seller.autoProcessDeposit;
                                      toggleAutoProcessDeposit(currentValue)
                                  }}
                                  className={`
                                    ${seller.seller?.autoProcessDeposit
                                    ? 'bg-red-900/50 text-red-300 hover:bg-red-800/70 border-red-700 hover:shadow-red-500/50 cursor-pointer'
                                    : 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/70 border-emerald-700 hover:shadow-emerald-500/50 cursor-pointer'
                                    }
                                    rounded-lg border text-xs px-2 py-1 text-center font-semibold
                                  `}
                                  disabled={togglingAutoProcessDeposit}
                                >
                                  {seller.seller?.autoProcessDeposit ? '비활성화 하기' : '활성화 하기'}
                                </button>
                              )}
                              */}
                            </div>

                          </div>
                        )}

                      </div>

                      {seller.seller?.buyOrder?.status === 'paymentRequested' && (

                        <div className="w-full flex flex-col items-start justify-center gap-2
                        bg-amber-50/80 text-slate-900 px-4 py-3 rounded-xl
                        border border-amber-200/70 shadow-[0_18px_40px_-24px_rgba(180,83,9,0.35)]">



                          <div className="flex flex-row items-center gap-2">
                            <Image
                              src="/icon-bank-auto.png"
                              alt="Bank Auto"
                              width={20}
                              height={20}
                              className="w-5 h-5 animate-spin"
                            />
                            <div className="flex flex-col items-start justify-center gap-0">
                              
                              {seller.walletAddress === address && (
                                <span className="text-sm font-semibold">
                                  {'구매자가 ' +
                                  seller.seller?.buyOrder.krwAmount.toLocaleString() + ' 원 입금을 진행중입니다.'}
                                </span>
                              )}
                              {seller.seller?.buyOrder?.buyer?.walletAddress === address && (
                                <span className="text-sm font-semibold">
                                  {'판매자가 ' +
                                  seller.seller?.buyOrder.krwAmount.toLocaleString() + ' 원 입금을 기다리고 있습니다.'}
                                </span>
                              )}


                              {(seller.walletAddress === address || seller.seller?.buyOrder?.buyer?.walletAddress === address)
                              ? (
                                <span className="text-sm">
                                  입금자명: {seller.seller?.buyOrder?.buyer?.depositName || '알수없음'}
                                </span>
                              ) : (
                                <span className="text-sm">
                                  입금자명: *****
                                </span>
                              )}
                            </div>
                          </div>

                          {seller.seller?.buyOrder?.buyer?.walletAddress === address && (
                              <div className="w-full flex flex-col items-start justify-center gap-1
                              border-t border-amber-200/70 pt-2
                              ">
                                <span className="text-sm font-semibold text-slate-700">
                                  구매자는 아래 계좌로 {seller.seller?.buyOrder.krwAmount.toLocaleString()} 원을 입금해주세요.
                                  <br />
                                  입금자명과 입금액이 일치해야 입금확인이 처리됩니다.
                                </span>

                                <div className="flex flex-col items-start justify-center
                                  gap-0 mt-1
                                ">
                                
                                  <span className="text-sm text-slate-700 font-semibold">
                                    {seller.seller?.bankInfo?.bankName}
                                  </span>
                                  <div className="flex flex-row items-center justify-start gap-2">
                                    <span className="text-sm text-slate-700 font-semibold">
                                      {seller.seller?.bankInfo?.accountNumber}
                                    </span>
                                    <button
                                      className="text-sm text-amber-700 underline hover:text-amber-800"
                                      onClick={() => {
                                        navigator.clipboard.writeText(seller.seller?.bankInfo?.accountNumber || '');
                                        toast.success("계좌번호가 복사되었습니다.");
                                      } }
                                    >
                                      ⧉
                                    </button>
                                  </div>
                                  <span className="text-sm font-semibold text-slate-700">
                                    {seller.seller?.bankInfo?.accountHolder}
                                  </span>
                                </div>

                                {/* 10분내로 입금하지 않으면 주문이 자동취소됩니다. */}
                                <span className="text-sm text-slate-600 mt-2">
                                  10분내로 입금하지 않으면 주문을 취소할 수 있습니다.
                                </span>

                              </div>

                          )}



                          {
                          seller.walletAddress === address && !seller.seller?.autoProcessDeposit && (

                            <div className="w-full flex flex-col items-center justify-center mt-2">
                            
                              {/* 입금자명과 입금액이 일치하는지 확인 후에 클릭 */}
                              <span className="text-xs text-slate-600 mb-1">
                                입금자명이 {seller.seller?.buyOrder?.buyer?.depositName || '알수없음'} 으로
                                , 입금액이 {seller.seller?.buyOrder.krwAmount.toLocaleString()} 원 으로 일치하는지 확인 후에 클릭하세요.
                              </span>


                              <button
                
                                disabled={confirmingPayment[index]}
                                
                                className={`
                                  ${confirmingPayment[index]
                                  ? 'text-slate-600 cursor-not-allowed bg-slate-200'
                                  : 'text-white hover:text-white hover:shadow-blue-500/50 cursor-pointer bg-blue-700 hover:bg-blue-600'
                                  }
                                  px-3 py-1 rounded-lg
                                  shadow-lg
                                  w-full
                                  border border-blue-600
                                `}

                                onClick={() => {
                                  confirm("수동으로 입금확인을 처리하시겠습니까?") &&
                                  confirmPayment(
                                    index,
                                    seller.seller.buyOrder._id,
                                    //paymentAmounts[index],
                                    //paymentAmountsUsdt[index],

                                    seller.seller.buyOrder.krwAmount,
                                    seller.seller.buyOrder.usdtAmount,
                                    
                                    seller.seller.buyOrder?.walletAddress,

                                    seller.seller.buyOrder?.paymentMethod,
                                  );
                                }}
                              >
                                <div className="flex flex-row gap-2 items-center justify-center">
                                  { confirmingPayment[index] && (
                                      <Image
                                        src="/loading.png"
                                        alt="Loading"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5
                                        animate-spin"
                                      />
                                  )}
                                  <span className="text-xs">
                                    입금완료하기
                                  </span>
                                </div>

                              </button>

                            </div>

                          )}

                        </div>

                      )}


                      {seller.seller?.buyOrder?.status === 'paymentConfirmed'
                        && (!seller.seller?.buyOrder?.transactionHash || seller.seller?.buyOrder?.transactionHash === '0x') && (

                          <div className="w-full flex flex-row items-center gap-2
                          bg-blue-700 text-white px-3 py-1 rounded-lg border border-blue-600 shadow-lg">
                          
                            <Image
                              src="/icon-transfer.png"
                              alt="Transfer Auto"
                              width={20}
                              height={20}
                              className="w-5 h-5 animate-spin"
                            />
                            <span className="text-sm font-semibold">
                              구매자 지갑({seller.seller?.buyOrder?.buyer?.walletAddress.substring(0, 6)}...{seller.seller?.buyOrder?.buyer?.walletAddress.substring(seller.seller?.buyOrder?.buyer?.walletAddress.length - 4)}) 으로
                              {' '}{seller.seller?.buyOrder.usdtAmount.toLocaleString()} USDT 자동 전송중입니다.
                            </span>
                          </div>

                      )}




                    </div>

                    {/* seller.buyOrder.status */}
                    {/* seller.buyOrder.nickname => 구매자 아이디 */}
                    {/* seller.buyOrder.walletAddress => 구매자 USDT지갑 */}
                    {/* seller.buyOrder.isWeb3Wallet => 구매자 지갑타입 */}
                    {/* seller.buyOrder.paymentRequestedAt */}
                    {/* seller.buyOrder.usdtAmount => 구매량 */}
                    {/* seller.buyOrder.krwAmount => 구매금액 */}
                    {/* seller.buyOrder.rate => 단가 */}
                    <div className="
                      w-full
                      flex flex-col items-start justify-center gap-2">

                      {seller.seller?.buyOrder?.status === 'paymentRequested' ? (
                        <div className="w-full flex flex-col items-start justify-center gap-2">

                          {/* 판매 진행 */}
                          {/*
                          <div className="w-full flex flex-row items-center justify-start gap-2">
                            <div className="flex flex-row items-center gap-2
                            bg-red-500 text-white px-3 py-1 rounded-lg">
                              <span className="text-sm font-semibold">
                                판매 진행중
                              </span>
                            </div>

                          </div>
                          */}
                          {/* /icon-trade.png */}
                          <div className="w-full flex flex-row items-center justify-start gap-2">
                            <Image
                              src="/icon-trade.png"
                              alt="In Trade"
                              width={30}
                              height={30}
                              className="w-12 h-12 object-contain"
                            />
                            {/* TID */}
                            <span className="text-sm text-slate-700">
                              TID: #<button
                                  className="text-sm text-slate-800 underline"
                                  style={{ fontFamily: 'monospace' }}
                                  onClick={() => {
                                    navigator.clipboard.writeText(seller.seller?.buyOrder?.tradeId);
                                    toast.success('TID가 복사되었습니다.');
                                  } }
                                >
                                  {seller.seller?.buyOrder?.tradeId}
                                </button>
                            </span>
                          </div>



                          <div className="w-full flex flex-col items-start justify-center gap-1
                            border-t border-slate-200 pt-2
                            ">


                              <div className="w-full flex flex-row items-center justify-between gap-2">
                                <span className="text-sm text-slate-600">
                                  주문시간:
                                </span>
                                <span className="text-sm text-slate-800">
                                  {seller.seller?.buyOrder?.createdAt ?
                                    // format date to day time string YYYY-MM-DD HH:mm
                                    new Date(seller.seller?.buyOrder?.createdAt).getFullYear() + '-' +
                                    String(new Date(seller.seller?.buyOrder?.createdAt).getMonth() + 1).padStart(2, '0') + '-' +
                                    String(new Date(seller.seller?.buyOrder?.createdAt).getDate()).padStart(2, '0') + ' ' +
                                    String(new Date(seller.seller?.buyOrder?.createdAt).getHours()).padStart(2, '0') + ':' +
                                    String(new Date(seller.seller?.buyOrder?.createdAt).getMinutes()).padStart(2, '0')
                                    : ''
                                  }
                                </span>
                              </div>

                              {/* seller.seller.buyOrder.paymentRequestedAt */}
                              {/* if paymentRequestedAt exists, show the time */}
                              {seller.seller?.buyOrder?.paymentRequestedAt && (
                              <div className="w-full flex flex-row items-center justify-between gap-2">
                                <span className="text-sm text-slate-600">
                                  입금요청시간:
                                </span>
                                <span className="text-sm text-slate-800">
                                  {new Date(seller.seller?.buyOrder?.paymentRequestedAt).getFullYear() + '-' +
                                    String(new Date(seller.seller?.buyOrder?.paymentRequestedAt).getMonth() + 1).padStart(2, '0') + '-' +
                                    String(new Date(seller.seller?.buyOrder?.paymentRequestedAt).getDate()).padStart(2, '0') + ' ' +
                                    String(new Date(seller.seller?.buyOrder?.paymentRequestedAt).getHours()).padStart(2, '0') + ':' +
                                    String(new Date(seller.seller?.buyOrder?.paymentRequestedAt).getMinutes()).padStart(2, '0')
                                  }
                                </span>
                              </div>
                              )}

                              {/* 입금완료시간 */}
                              {seller.seller?.buyOrder?.paymentConfirmedAt && (
                              <div className="w-full flex flex-row items-center justify-between gap-2">
                                <span className="text-sm text-slate-600">
                                  입금완료시간:
                                </span>
                                <span className="text-sm text-slate-800">
                                  {new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getFullYear() + '-' +
                                    String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getMonth() + 1).padStart(2, '0') + '-' +
                                    String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getDate()).padStart(2, '0') + ' ' +
                                    String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getHours()).padStart(2, '0') + ':' +
                                    String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getMinutes()).padStart(2, '0')
                                  }
                                </span>
                              </div>
                              )}

                              <span className="text-sm text-slate-700">
                                {Buy_Amount}(USDT): {seller.seller?.buyOrder?.usdtAmount}
                              </span>
                              <span className="text-sm text-slate-700">
                                {Payment_Amount}(원): {seller.seller?.buyOrder?.krwAmount.toLocaleString()}
                              </span>
                              <span className="text-sm text-slate-700">
                                {Rate}(원): {seller.seller?.buyOrder?.rate.toLocaleString()} 
                              </span>






                            {/* TID */}
                            {/*
                            <div className="flex flex-row items-center justify-start gap-2">

                              <span className="text-sm">
                                TID: #<button
                                    className="text-sm text-slate-600 underline"
                                    style={{ fontFamily: 'monospace' }}
                                    onClick={() => {
                                      navigator.clipboard.writeText(seller.seller?.buyOrder?.tradeId);
                                      toast.success('TID가 복사되었습니다.');
                                    } }
                                  >
                                    {seller.seller?.buyOrder?.tradeId}
                                  </button>
                              </span>
                            </div>
                            */}

                            {/* 입금확인중 */}
                            {/*
                            <div className="w-full flex flex-col items-start justify-center gap-2
                            bg-amber-700 text-white px-3 py-1 rounded-lg border border-amber-600 shadow-lg">


                              <div className="flex flex-row items-center gap-2">
                                <Image
                                  src="/icon-bank-auto.png"
                                  alt="Bank Auto"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 animate-spin"
                                />
                                <div className="flex flex-col items-start justify-center gap-0">
                                  <span className="text-sm font-semibold">
                                    {seller.seller?.buyOrder.krwAmount.toLocaleString()} 원 입금확인중
                                  </span>
                                  {seller.walletAddress === address ? (
                                    <span className="text-sm">
                                      입금자명: {seller.seller?.buyOrder?.buyer?.depositName || '알수없음'}
                                    </span>
                                  ) : (
                                    <span className="text-sm">
                                      입금자명: *****
                                    </span>
                                  )}
                                </div>
                              </div>

                              {
                              seller.walletAddress === address && !seller.seller?.autoProcessDeposit && (

                                <div className="w-full flex flex-col items-center justify-center mt-2">
                                
                                  <span className="text-xs text-slate-700 mb-1">
                                    입금자명이 {seller.seller?.buyOrder?.buyer?.depositName || '알수없음'} 으로
                                    , 입금액이 {seller.seller?.buyOrder.krwAmount.toLocaleString()} 원 으로 일치하는지 확인 후에 클릭하세요.
                                  </span>


                                  <button
                    
                                    disabled={confirmingPayment[index]}
                                    
                                    className={`
                                      ${confirmingPayment[index]
                                      ? 'text-slate-600 cursor-not-allowed bg-slate-200'
                                      : 'text-white hover:text-white hover:shadow-blue-500/50 cursor-pointer bg-blue-700 hover:bg-blue-600'
                                      }
                                      px-3 py-1 rounded-lg
                                      shadow-lg
                                      w-full
                                      border border-blue-600
                                    `}

                                    onClick={() => {
                                      confirm("수동으로 입금확인을 처리하시겠습니까?") &&
                                      confirmPayment(
                                        index,
                                        seller.seller.buyOrder._id,
                                        //paymentAmounts[index],
                                        //paymentAmountsUsdt[index],

                                        seller.seller.buyOrder.krwAmount,
                                        seller.seller.buyOrder.usdtAmount,
                                        
                                        seller.seller.buyOrder?.walletAddress,

                                        seller.seller.buyOrder?.paymentMethod,
                                      );
                                    }}
                                  >
                                    <div className="flex flex-row gap-2 items-center justify-center">
                                      { confirmingPayment[index] && (
                                          <Image
                                            src="/loading.png"
                                            alt="Loading"
                                            width={20}
                                            height={20}
                                            className="w-5 h-5
                                            animate-spin"
                                          />
                                      )}
                                      <span className="text-xs">
                                        입금완료하기
                                      </span>
                                    </div>

                                  </button>

                                </div>

                              )}
                            

                            </div>
                            */}


                            {/* noew - paymentRequestedAt 경과 */}
                            {/* time ago from paymentRequestedAt to now */}
                            <div className="w-full flex flex-row items-center justify-end">
                              <span className="text-sm text-slate-600">
                                {
                                  (new Date().getTime() - new Date(seller.seller?.buyOrder?.paymentRequestedAt).getTime()) > 0
                                  ? `입금요청 후 ${Math.floor((new Date().getTime() - new Date(seller.seller?.buyOrder?.paymentRequestedAt).getTime()) / 60000)}분 경과`
                                  : ''
                                }
                              </span>
                            </div>

                          </div>

                        </div>

                      ) : seller.seller?.buyOrder?.status === 'paymentConfirmed' &&
                          (!seller.seller?.buyOrder?.transactionHash || seller.seller?.buyOrder?.transactionHash === '0x') ? (
                        <div className="w-full flex flex-col items-start justify-center gap-2">
                          {/* 판매 진행중 */}
                          {/*
                          <div className="flex flex-row items-center gap-2
                          bg-red-500 text-white px-3 py-1 rounded-lg">
                            <span className="text-sm font-semibold">
                              판매 진행중
                            </span>
                          </div>
                          */}

                          <div className="w-full flex flex-col items-start justify-center gap-1
                            border-t border-slate-200 pt-2
                            ">
                            {/*
                            <span className="text-sm">
                              TID: #<button
                                  className="text-sm text-slate-600 underline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(seller.seller?.buyOrder?.tradeId);
                                    toast.success('TID가 복사되었습니다.');
                                  } }
                                >
                                  {seller.seller?.buyOrder?.tradeId}
                                </button>
                            </span>
                            */}

                            {/* /icon-trade.png */}
                            {/* TID */}
                            <div className="w-full flex flex-row items-center justify-start gap-2">
                              <Image
                                src="/icon-trade.png"
                                alt="In Trade"
                                width={30}
                                height={30}
                                className="w-12 h-12 object-contain"
                              />
                              <span className="text-sm text-slate-700">
                                TID: #<button
                                    className="text-sm text-slate-800 underline"
                                    style={{ fontFamily: 'monospace' }}
                                    onClick={() => {
                                      navigator.clipboard.writeText(seller.seller?.buyOrder?.tradeId);
                                      toast.success('TID가 복사되었습니다.');
                                    } }
                                  >
                                    {seller.seller?.buyOrder?.tradeId}
                                  </button>
                              </span>
                            </div>


                          

                            {/*
                            <div className="flex flex-row items-center gap-2
                              bg-blue-500 text-white px-3 py-1 rounded-lg">
                            
                              <Image
                                src="/icon-transfer.png"
                                alt="Transfer Auto"
                                width={20}
                                height={20}
                                className="w-5 h-5 animate-spin"
                              />
                              <span className="text-sm font-semibold">
                                {seller.seller?.buyOrder.usdtAmount.toLocaleString()} USDT 자동 전송중
                              </span>
                            </div>
                            */}

                            {/* USDT 전송이 환료된후에 판매 대기중으로 변경됩니다. */}
                            <span className="text-sm text-slate-600">
                              USDT 전송이 완료된후에 판매 대기중으로 변경됩니다.
                            </span>

                          </div>

                        </div>

                      ) : (
                        <div className="w-full flex flex-col items-start justify-center gap-2">
                          
                          {/* if seller.walletAddress is equal to address, show this section */}
                          <div className={'w-full flex flex-col items-start justify-center gap-2'}>

                            {/* totalPaymentConfirmedCount
                            totalPaymentConfirmedUsdtAmount
                            totalPaymentConfirmedKrwAmount
                            정상 거래 */}
                            {/* green color for background */}
                            <div className="w-full flex flex-row items-center justify-between gap-2
                            p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl
                            shadow-[0_12px_28px_-20px_rgba(16,185,129,0.45)]
                            ">
                              <div className="w-24 flex flex-col items-start justify-center gap-1">
                                <span className="inline-flex flex-col items-start gap-0.5 rounded-full border border-emerald-200 bg-white/90 px-2 py-1 text-xs font-semibold text-emerald-700 leading-none">
                                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                      <path
                                        d="M20 6L9 17l-5-5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <span>정상거래</span>
                                  </span>
                                </span>
                                <span className="text-lg font-semibold text-slate-900">
                                  {seller.seller?.totalPaymentConfirmedCount || 0}
                                </span>
                              </div>
                              <div className="w-full flex flex-col items-end justify-center gap-1">

                                <span className="text-lg font-semibold text-emerald-700"
                                  style={{ fontFamily: 'monospace' }}>
                                  {seller.seller?.totalPaymentConfirmedUsdtAmount
                                  && seller.seller?.totalPaymentConfirmedUsdtAmount.toLocaleString()} USDT
                                </span>
                                <span className="text-lg font-semibold text-amber-600"
                                  style={{ fontFamily: 'monospace' }}>
                                  {seller.seller?.totalPaymentConfirmedKrwAmount
                                  && seller.seller?.totalPaymentConfirmedKrwAmount.toLocaleString()} 원
                                </span>
                              </div>
                            </div>

                            {/* 중재 거래 */}
                            {/* red color for background */}
                            <div className="w-full flex flex-row items-center justify-between gap-2
                            p-3 bg-rose-50/80 border border-rose-200 rounded-xl
                            shadow-[0_12px_28px_-20px_rgba(244,63,94,0.35)]
                            ">
                              <div className="w-24 flex flex-col items-start justify-center gap-1">
                                <span className="inline-flex flex-col items-start gap-0.5 rounded-full border border-rose-200 bg-white/90 px-2 py-1 text-xs font-semibold text-rose-700 leading-none">
                                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                      <path
                                        d="M12 9v4m0 4h.01M12 3l9 16H3L12 3z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <span>중재거래</span>
                                  </span>
                                </span>
                                <span className="text-lg font-semibold text-slate-900">
                                  {seller.seller?.totalDisputeResolvedCount || 0}
                                </span>
                              </div>
                              <div className="w-full flex flex-col items-end justify-center gap-1">
                                <span className="text-lg font-semibold text-rose-700"
                                  style={{ fontFamily: 'monospace' }}>
                                  {seller.seller?.totalDisputeResolvedUsdtAmount
                                  ? seller.seller?.totalDisputeResolvedUsdtAmount.toLocaleString()
                                  : '0'
                                  } USDT
                                </span>
                                <span className="text-lg font-semibold text-amber-600"
                                  style={{ fontFamily: 'monospace' }}>
                                  {seller.seller?.totalDisputeResolvedKrwAmount
                                  ? seller.seller?.totalDisputeResolvedKrwAmount.toLocaleString()
                                  : '0'
                                  } 원
                                </span>
                              </div>
                            </div>

                          </div>



                          {/* 구래하기 */}
                          {/* 구래수량(USDT) 입력, 구해하기 버튼 */}
                          {/* 판매 대기중일 경우 */}
                          {/* 나의 판매 계정이 아닐 경우 */}
                          {
                            seller.walletAddress !== address &&
                            currentUsdtBalanceArray[index] >= 10 && (

                            <div className="w-full flex flex-col items-start justify-center gap-2
                              border-t border-slate-200 pt-2
                              ">
                              <div className="w-full flex flex-col items-start justify-center gap-2">
                                
                                {false ? (
                                  <div className="flex flex-col items-start justify-center gap-1 w-full">
                                    {/* buyAmount */}
                                    <span className="text-sm text-slate-600">
                                      구매할 USDT 수량: {buyAmountInputs[index]} USDT
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-start justify-center gap-1 w-full">
                                    <div className="relative w-full">
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="결제할 원화금액"
                                        onChange={(e) => {
                                          const rawValue = e.target.value.replace(/[^\d]/g, '');
                                          const numericValue = rawValue ? Math.floor(Number(rawValue)) : 0;
                                          const rate = seller.seller?.usdtToKrwRate || 0;
                                          const isOverKrwLimit = numericValue > MAX_KRW_AMOUNT;
                                          let krwValue = Math.min(numericValue, MAX_KRW_AMOUNT);
                                          let usdtValue = rate > 0 ? Math.floor((krwValue / rate) * 100) / 100 : 0;
                                          const isOverUsdtLimit = usdtValue > MAX_BUY_AMOUNT;
                                          if (isOverUsdtLimit) {
                                            usdtValue = MAX_BUY_AMOUNT;
                                            krwValue = rate > 0 ? Math.floor(usdtValue * rate) : krwValue;
                                          }

                                          const newBuyAmountInputs = [...buyAmountInputs];
                                          newBuyAmountInputs[index] = usdtValue;
                                          setBuyAmountInputs(newBuyAmountInputs);

                                          const newBuyAmountKrwInputs = [...buyAmountKrwInputs];
                                          newBuyAmountKrwInputs[index] = krwValue;
                                          setBuyAmountKrwInputs(newBuyAmountKrwInputs);

                                          const newBuyAmountInputTexts = [...buyAmountInputTexts];
                                          newBuyAmountInputTexts[index] = formatUsdtValue(usdtValue);
                                          setBuyAmountInputTexts(newBuyAmountInputTexts);

                                          const newBuyAmountOverLimitArray = [...buyAmountOverLimitArray];
                                          newBuyAmountOverLimitArray[index] = isOverUsdtLimit;
                                          setBuyAmountOverLimitArray(newBuyAmountOverLimitArray);

                                          const newBuyAmountKrwOverLimitArray = [...buyAmountKrwOverLimitArray];
                                          newBuyAmountKrwOverLimitArray[index] = isOverKrwLimit;
                                          setBuyAmountKrwOverLimitArray(newBuyAmountKrwOverLimitArray);
                                        }}
                                        value={buyAmountKrwInputs[index]
                                          ? buyAmountKrwInputs[index].toLocaleString()
                                          : ''}
                                        className={`
                                          ${address
                                          && user?.buyer?.bankInfo
                                          && !buyOrderingPrivateSaleArray[index]
                                          ? 'border border-slate-200 bg-white text-slate-900'
                                          : 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                          }
                                          w-full rounded-2xl px-5 py-4 pr-16 text-right text-3xl font-bold tracking-tight shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] placeholder:text-left placeholder:text-lg placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                                          ${Number.isFinite(currentUsdtBalanceArray[index])
                                            && buyAmountInputs[index] > currentUsdtBalanceArray[index]
                                            ? 'border-rose-500 focus:ring-rose-500'
                                            : ''}
                                        `}
                                        disabled={!address || !user?.buyer?.bankInfo || buyOrderingPrivateSaleArray[index]}
                                      />
                                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                        KRW
                                      </span>
                                    </div>
                                    {buyAmountKrwOverLimitArray[index] && (
                                      <span className="text-sm font-semibold text-rose-600">
                                        1억 원 이하만 입력할 수 있습니다.
                                      </span>
                                    )}
                                    <div className="relative w-full">
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="^\\d*(\\.\\d{0,2})?$"
                                        placeholder="구매할 USDT 수량"
                                        onChange={(e) => {
                                          const normalizedValue = normalizeUsdtInput(e.target.value);
                                          const numericValue = normalizedValue ? Number(normalizedValue) : 0;
                                          const rate = seller.seller?.usdtToKrwRate || 0;
                                          const isOverUsdtLimit = numericValue > MAX_BUY_AMOUNT;
                                          let usdtValue = Math.min(numericValue, MAX_BUY_AMOUNT);
                                          usdtValue = Math.floor(usdtValue * 100) / 100;
                                          const rawKrwValue = rate > 0 ? Math.floor(usdtValue * rate) : 0;
                                          const isOverKrwLimit = rawKrwValue > MAX_KRW_AMOUNT;
                                          if (isOverKrwLimit && rate > 0) {
                                            usdtValue = Math.floor((MAX_KRW_AMOUNT / rate) * 100) / 100;
                                          }
                                          const krwValue = rate > 0 ? Math.floor(usdtValue * rate) : 0;
                                          const newBuyAmountInputs = [...buyAmountInputs];
                                          newBuyAmountInputs[index] = usdtValue;
                                          setBuyAmountInputs(newBuyAmountInputs);
                                          const newBuyAmountOverLimitArray = [...buyAmountOverLimitArray];
                                          newBuyAmountOverLimitArray[index] = isOverUsdtLimit;
                                          setBuyAmountOverLimitArray(newBuyAmountOverLimitArray);

                                          const newBuyAmountKrwInputs = [...buyAmountKrwInputs];
                                          newBuyAmountKrwInputs[index] = Math.min(krwValue, MAX_KRW_AMOUNT);
                                          setBuyAmountKrwInputs(newBuyAmountKrwInputs);

                                          const newBuyAmountKrwOverLimitArray = [...buyAmountKrwOverLimitArray];
                                          newBuyAmountKrwOverLimitArray[index] = isOverKrwLimit;
                                          setBuyAmountKrwOverLimitArray(newBuyAmountKrwOverLimitArray);

                                          const newBuyAmountInputTexts = [...buyAmountInputTexts];
                                          const displayValue =
                                            isOverUsdtLimit || isOverKrwLimit
                                              ? formatUsdtValue(usdtValue)
                                              : formatNumberWithCommas(normalizedValue);
                                          newBuyAmountInputTexts[index] = displayValue;
                                          setBuyAmountInputTexts(newBuyAmountInputTexts);
                                        }}
                                        value={
                                          buyAmountInputTexts[index] ??
                                          (buyAmountInputs[index]
                                            ? formatUsdtValue(buyAmountInputs[index])
                                            : '')
                                        }
                                        className={`
                                          ${address
                                          && user?.buyer?.bankInfo
                                          && !buyOrderingPrivateSaleArray[index]
                                          ? 'border border-slate-200 bg-white text-slate-900'
                                          : 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                          }
                                          w-full rounded-2xl px-5 py-4 pr-16 text-right text-4xl font-extrabold tracking-tight shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] placeholder:text-left placeholder:text-xl placeholder:font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                                          ${Number.isFinite(currentUsdtBalanceArray[index])
                                            && buyAmountInputs[index] > currentUsdtBalanceArray[index]
                                            ? 'border-rose-500 focus:ring-rose-500'
                                            : ''}
                                        `}
                                        disabled={!address || !user?.buyer?.bankInfo || buyOrderingPrivateSaleArray[index]}
                                      />
                                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                        USDT
                                      </span>
                                    </div>
                                    {buyAmountOverLimitArray[index] && (
                                      <span className="text-sm font-semibold text-rose-600">
                                        100,000 USDT 이하만 입력할 수 있습니다.
                                      </span>
                                    )}
                                    {buyAmountInputs[index] > 0 && buyAmountInputs[index] < 1 && (
                                      <span className="text-sm font-semibold text-rose-600">
                                        최소 1 USDT 이상 입력해주세요.
                                      </span>
                                    )}
                                    {Number.isFinite(currentUsdtBalanceArray[index])
                                      && buyAmountInputs[index] > currentUsdtBalanceArray[index] && (
                                      <span className="text-sm font-semibold text-rose-600">
                                        에스크로 잔액보다 큰 수량은 구매할 수 없습니다.
                                      </span>
                                    )}
                                  </div>
                                )}


                                <button
                                  onClick={() => {                             
                                    if (!window.confirm('USDT 구매를 진행할까요?')) {
                                      return;
                                    }
                                    buyOrderPrivateSale(index, seller.walletAddress);
                                  }}
                                  className={`
                                    ${address
                                    && user?.buyer?.bankInfo
                                    && !buyOrderingPrivateSaleArray[index]
                                    && buyAmountInputs[index] >= 1
                                    && buyAmountInputs[index] <= (currentUsdtBalanceArray[index] ?? 0)
                                      ? 'buy-cta-animated bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 ring-1 ring-blue-300/40 shadow-[0_18px_45px_-16px_rgba(37,99,235,0.65)] hover:shadow-[0_28px_60px_-18px_rgba(37,99,235,0.85)] hover:-translate-y-0.5' 
                                      : 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                                    }
                                    px-4 py-2 rounded-lg font-semibold text-sm
                                    transition-all duration-200 ease-in-out
                                    transform hover:scale-105 active:scale-95
                                    w-full
                                  `}
                                  disabled={!address
                                    || !user?.buyer?.bankInfo
                                    || buyOrderingPrivateSaleArray[index]
                                    || buyAmountInputs[index] < 1
                                    || buyAmountInputs[index] > (currentUsdtBalanceArray[index] ?? 0)}
                                >
                                  <span className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                    USDT 구매하기
                                  </span>
                                </button>
                              </div>
                              {/* 로그인을 해야 구매할 수 있습니다. */}
                              {!address && (
                                <div className="w-full flex flex-col items-center justify-center mt-2">
                                  <div className="text-sm text-red-600">
                                    로그인을 해야 구매할 수 있습니다.
                                  </div>

                                  <div className="relative mt-3 inline-flex items-center justify-center">
                                    <span className="login-cta-glow" aria-hidden="true" />
                                    <span className="login-cta-ring" aria-hidden="true" />
                                    <div className="relative z-10 login-cta-bounce">
                                      <ConnectButton
                                        client={client}
                                        wallets={wallets}

                                        /*
                                        accountAbstraction={{
                                          chain: arbitrum,
                                          sponsorGas: false
                                        }}
                                        */
                                        
                                        theme={"light"}

                                        // button color is dark skyblue convert (49, 103, 180) to hex
                                        connectButton={{
                                            style: {
                                                backgroundColor: "#3167b4", // dark skyblue
                                                color: "#f3f4f6", // light gray
                                                padding: "2px 10px",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                fontWeight: 700,
                                                width: "60x",
                                                height: "38px",
                                                boxShadow: "0 18px 32px -16px rgba(49, 103, 180, 0.9)",
                                                letterSpacing: "0.02em",
                                            },
                                            label: "웹3 로그인",
                                        }}

                                        connectModal={{
                                          size: "wide", 
                                          //size: "compact",
                                          titleIcon: "https://loot.menu/logo.png",                           
                                          showThirdwebBranding: false,
                                        }}

                                        locale={"ko_KR"}
                                        //locale={"en_US"}
                                      />
                                    </div>
                                  </div>


                                </div>
                              )}

                              {/* 로그아웃 */}
                              {address && (
                                <div className="w-full flex flex-col items-center justify-center mt-2
                                bg-white border border-slate-200 p-2 rounded-lg
                                "> 

                                  {/* 구래자 정보 */}
                                  <div className="w-full flex flex-row items-center justify-start gap-2
                                  border-b border-slate-200 pb-2 mb-2 text-slate-800
                                  ">
                                    <Image
                                      src="/icon-buyer.png"
                                      alt="Buyer"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5 rounded-lg object-cover"
                                    />
                                    <div className="flex flex-col items-start justify-center gap-0">
                                      <span className="text-sm font-semibold text-slate-900">
                                        {user?.nickname || 'No Nickname'}
                                      </span>
                                      <button
                                        className="text-sm font-medium text-slate-600 underline underline-offset-2 transition hover:text-slate-900"
                                        onClick={() => {
                                          navigator.clipboard.writeText(address);
                                          toast.success(Copied_Wallet_Address);
                                        } }
                                      >
                                        {address.substring(0, 6)}...{address.substring(address.length - 4)}
                                      </button>
                                    </div>
                                  </div>

                                  <button
                                      onClick={() => {
                                          confirm("로그아웃 하시겠습니까?") && activeWallet?.disconnect()
                                          .then(() => {

                                              toast.success('로그아웃 되었습니다');

                                              //router.push(
                                              //    "/administration/" + params.center
                                              //);
                                          });
                                      } }

                                      className="
                                        w-full
                                        flex items-center justify-center gap-2
                                        bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg hover:shadow-red-500/50
                                        transition-all duration-200 ease-in-out
                                      "
                                  >

                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M3 4.5A1.5 1.5 0 014.5 3h7a1.5 1.5 0 010 3h-7A1.5 1.5 0 013 4.5zm0 6A1.5 1.5 0 014.5 9h7a1.5 1.5 0 010 3h-7A1.5 1.5 0 013 10.5zm1.5 6a1.5 1.5 0 000 3h7a1.5 1.5 0 000-3h-7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-sm">
                                      로그아웃
                                    </span>
                                  </button>
                                </div>

                              )}

                              {address && !user?.buyer?.bankInfo && (
                                <div className="w-full flex flex-col items-center justify-center mt-2">
                                  <span className="text-sm text-red-600">
                                    은행정보를 등록해야 구매할 수 있습니다.
                                  </span>
                                  {/* go to bank info page button */}
                                  {/* /[params.lang]/loot/buyer-settings */}
                                  <button
                                    onClick={() => {
                                      router.push('/' + params.lang + '/loot/buyer-settings');
                                    }}
                                    className="bg-[#0047ab] text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-[#0047ab]/80 mt-2"
                                  >
                                    은행정보 등록하기
                                  </button>

                                </div>
                              )}

                              {buyOrderingPrivateSaleArray[index] && (
                                <div className="text-sm text-emerald-400">
                                  구매주문 처리중입니다. 잠시만 기다려주세요.
                                </div>
                              )}

                            </div>
                          )}



                        </div>
                      )}


                      {seller.seller?.buyOrder?.status === 'paymentRequested'
                      || (seller.seller?.buyOrder?.status === 'paymentConfirmed' &&
                          (!seller.seller?.buyOrder?.transactionHash || seller.seller?.buyOrder?.transactionHash === '0x'))
                      ? (
                        <>

                        {/*
                        <div className="w-full flex flex-col items-start justify-center gap-2">
                          */}
                          {/* if seller.seller.buyOrder.buyer.walletAddress === address, border */}
                        <div
                          className={`w-full flex flex-col items-start justify-center gap-3 rounded-xl border p-3
                          ${seller.seller?.buyOrder?.buyer?.walletAddress === address
                          ? 'border-blue-200 bg-blue-50/70 shadow-[0_16px_40px_-28px_rgba(59,130,246,0.4)]'
                          : 'border-slate-200 bg-white/80 shadow-sm'}
                          `}
                        >


                          <div className="w-full flex flex-row items-center justify-start gap-2
                          rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2
                          ">
                            <Image
                              src="/icon-buyer.png"
                              alt="Buyer"
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-lg object-cover"
                            />
                            <div className="flex flex-col items-start justify-center gap-0">
                              <span className="text-sm font-semibold text-slate-900">
                                {seller.seller?.buyOrder?.nickname}
                              </span>
                              <button
                                className="text-sm font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
                                onClick={() => {
                                  navigator.clipboard.writeText(seller.seller?.buyOrder?.walletAddress);
                                  toast.success(Copied_Wallet_Address);
                                } }
                              >
                                {seller.seller?.buyOrder?.walletAddress.substring(0, 6)}...{seller.seller?.buyOrder?.walletAddress.substring(seller.seller?.buyOrder?.walletAddress.length - 4)}
                              </button>
                            </div>

                            {/* isWeb3Wallet is false, 결제용 지갑 */}
                            {/*
                            {seller.seller?.buyOrder?.isWeb3Wallet ? (
                              <span className="text-sm">
                                (Web3 지갑)
                              </span>
                            ) : (
                              <span className="text-sm">
                                (결제용 지갑)
                              </span>
                            )}
                            */}


                          </div>



                          {
                          seller.seller?.buyOrder?.status === 'paymentRequested' &&
                          seller.seller?.buyOrder?.buyer?.walletAddress === address ? (

                            <div className="w-full flex flex-col items-start justify-center gap-2">
                              
                              <div className="w-full flex flex-row items-center justify-start gap-2 rounded-lg
                              border border-blue-200/70 bg-blue-50/80 px-3 py-2">
                                <Image
                                  src="/icon-info.png"
                                  alt="Info"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 rounded-full bg-white/90 object-contain shadow-sm ring-1 ring-blue-200/60"
                                />
                                <span className="text-sm font-medium text-blue-800">
                                  해당 구매자의 지갑주소가 본인의 지갑주소인지 꼭 확인하시기 바랍니다.
                                </span>
                              </div>


                              {/* 구매주문취소 버튼 */}
                              <div className="w-full flex flex-col items-start justify-center gap-1
                              border-t border-slate-200/70 pt-3
                              ">
                                <span className="text-sm font-semibold text-slate-700">
                                  입금하기전에 구매주문을 취소하시려면 아래 버튼을 눌러주세요.
                                </span>
                                <div className="w-full flex items-start gap-2 rounded-lg border border-amber-200/70 bg-amber-50/80 px-3 py-2 text-xs font-semibold text-amber-700">
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                    className="mt-0.5"
                                  >
                                    <path
                                      d="M12 9v4"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                    <circle
                                      cx="12"
                                      cy="16.5"
                                      r="1"
                                      fill="currentColor"
                                    />
                                    <path
                                      d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                                      stroke="currentColor"
                                      strokeWidth="1.6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  구매주문을 취소하면 구매자 평점에 불리한 영향이 있을 수 있습니다.
                                </div>
                                <button
                                  onClick={() => {
                                    confirm("구매주문을 취소하시겠습니까?") &&
                                    cancelBuyOrderByAdmin(
                                      index,
                                      seller.seller?.buyOrder?._id,
                                    );
                                  }}
                                  className={`
                                    ${cancellingBuyOrders[index]
                                    ? 'bg-slate-100 text-slate-600 cursor-not-allowed border border-slate-200'
                                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg hover:shadow-red-500/50 border-0 transform hover:scale-105 active:scale-95'
                                    }
                                    px-3 py-1 rounded-lg text-xs font-semibold w-full
                                    transition-all duration-200 ease-in-out
                                  `}
                                >
                                  {cancellingBuyOrders[index] ? '구매주문취소 처리중...' : '구매주문취소'}
                                </button>
                              </div>

                            </div>

                          ) : (<></>)}



                        </div>

                        </>
                      ) : (
                        <></>
                      )}


                    </div>

                    {/* if seller nickname is 'seller', then show withdraw button */}
                    {/*
                    {seller.nickname === 'seller' && (
                      <button
                        onClick={() => {
                          router.push('/' + params.lang + '/admin/withdraw-vault?walletAddress=' + seller.walletAddress);
                        }}
                        className="bg-[#3167b4] text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-[#3167b4]/80"
                      >
                        출금하기
                      </button>
                    )}
                    */}

                  </div>
                ))}

              </div>
            )}
          </div>

          <div className='hidden
            flex-row items-center space-x-4'>
              <Image
                src="/icon-buyorder.png"
                alt="Trade"
                width={35}
                height={35}
                className="w-6 h-6"
              />

              <div className="text-xl font-semibold">
                구매주문 내역
              </div>
          </div>

          <div className="hidden
            w-full flex-col xl:flex-row items-center justify-between gap-5">

            <div className="flex flex-col xl:flex-row items-center gap-2">


              {/* select storecode */}
              <div className="flex flex-row items-center gap-2">
                {fetchingAllStores ? (
                  <Image
                    src="/icon-loading.png"
                    alt="Loading"
                    width={20}
                    height={20}
                    className="animate-spin"
                  />
                ) : (
                  <div className="flex flex-row items-center gap-2">

                    
                    <Image
                      src="/icon-store.png"
                      alt="Store"
                      width={20}
                      height={20}
                      className="rounded-lg w-5 h-5"
                    />

                    <span className="
                      w-32
                      text-sm font-semibold">
                      가맹점선택
                    </span>


                    <select
                      value={searchStorecode}
                      
                      //onChange={(e) => setSearchStorecode(e.target.value)}

                      // storecode parameter is passed to fetchBuyOrders
                      onChange={(e) => {
                        router.push('/' + params.lang + '/administration/buyorder?storecode=' + e.target.value);
                      }}



                      className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">전체</option>
                      {allStores && allStores.map((item, index) => (
                        <option key={index} value={item.storecode}
                          className="flex flex-row items-center justify-start gap-2"
                        >
                          
                          {item.storeName}{' '}({item.storecode})

                        </option>
                      ))}
                    </select>


                  </div>

                )}
              </div>


              <div className="flex
                flex-row items-center gap-2">
                {/* checkbox for searchOrderStatus is 'cancelled' */}
                {/* 판매취소 */}
                {/* 판매완료 */}
                {/* only one checkbox can be checked */}
                <div className="flex flex-row items-center gap-2">
                  <input
                    type="checkbox"
                    checked={searchOrderStatusCancelled}
                    onChange={(e) => {
                      setSearchOrderStatusCancelled(e.target.checked);
                      setPageValue(1);
                      //fetchBuyOrders();
                    }}
                    className="w-5 h-5"
                  />
                  <label className="text-sm text-slate-700">판매취소</label>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <input
                    type="checkbox"
                    checked={searchOrderStatusCompleted}
                    onChange={(e) => {
                      setSearchOrderStatusCompleted(e.target.checked);
                      setPageValue(1);
                      
                      //fetchBuyOrders();
                    }}
                    className="w-5 h-5"
                  />
                  <label className="text-sm text-slate-700">판매완료</label>
                </div>
                
              </div>


              {/* serach fromDate and toDate */}
              {/* DatePicker for fromDate and toDate */}
              <div className="flex
                flex-col xl:flex-row items-center gap-2">
                <div className="flex flex-row items-center gap-2">
                  <Image
                    src="/icon-calendar.png"
                    alt="Calendar"
                    width={20}
                    height={20}
                    className="rounded-lg w-5 h-5"
                  />
                  <input
                    type="date"
                    value={searchFromDate}
                    onChange={(e) => setSearchFromDate(e.target.value)}
                    className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <span className="text-sm text-slate-600">~</span>

                <div className="flex flex-row items-center gap-2">
                  <Image
                    src="/icon-calendar.png"
                    alt="Calendar"
                    width={20}
                    height={20}
                    className="rounded-lg w-5 h-5"
                  />
                  <input
                    type="date"
                    value={searchToDate}
                    onChange={(e) => setSearchToDate(e.target.value)}
                    className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-row items-center gap-2">
                    {/* 오늘, 어제 */}
                    <button
                      onClick={() => {
                        // korea time
                        const today = new Date();
                        today.setHours(today.getHours() + 9); // Adjust for Korean timezone (UTC+9)
                        setSearchFromDate(today.toISOString().split("T")[0]);
                        setSearchToDate(today.toISOString().split("T")[0]);
                      }}
                      className="text-sm text-slate-600 underline hover:text-slate-800"
                    >
                      오늘
                    </button>
                    <button
                      onClick={() => {
                        // korea time yesterday
                        const today = new Date();
                        today.setHours(today.getHours() + 9); // Adjust for Korean timezone (UTC+9)
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        setSearchFromDate(yesterday.toISOString().split("T")[0]);
                        setSearchToDate(yesterday.toISOString().split("T")[0]);
                      }}
                      className="text-sm text-slate-600 underline hover:text-slate-800"
                    >
                      어제
                    </button>
                  </div>

              </div>



            </div>



          </div>


          {/* trade summary */}

          <div className="hidden
            flex-col xl:flex-row items-start justify-between gap-2
            w-full
            bg-slate-50/50
            p-4 rounded-lg shadow-md
            ">

            <div className="xl:w-1/3 w-full
              flex flex-col xl:flex-row items-start justify-start gap-4">

              <Image
                src="/icon-trade.png"
                alt="Trade"
                width={50}
                height={50}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex flex-col gap-2 items-center">
                <div className="text-sm text-slate-700">거래수(건)</div>
                <div className="text-4xl font-semibold text-slate-800">
                  {
                    //buyOrderStats.totalCount?.toLocaleString()
                    animatedTotalCount
                  }
                </div>
              </div>

              <div className="flex flex-row items-center justify-center gap-2">

                <div className="flex flex-col gap-2 items-center">
                  <div className="text-sm">거래량(USDT)</div>
                  <div className="flex flex-row items-center justify-center gap-1">
                    <Image
                      src="/icon-tether.png"
                      alt="Tether"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    {/* RGB: 64, 145, 146 */}
                    <span className="text-4xl text-[#409192]"
                      style={{ fontFamily: 'monospace' }}>
                      {
                        //buyOrderStats.totalUsdtAmount
                        //? buyOrderStats.totalUsdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        //: '0.000'
                        animatedTotalUsdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-center">
                  <div className="text-sm">거래금액(원)</div>
                  <div className="flex flex-row items-center justify-center gap-1">
                    <span className="text-4xl text-yellow-600"
                      style={{ fontFamily: 'monospace' }}>
                      {
                        //buyOrderStats.totalKrwAmount?.toLocaleString()
                        animatedTotalKrwAmount.toLocaleString()
                      }
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* divider */}
            {/*
            <div className="hidden xl:block w-0.5 h-20 bg-slate-200"></div>
            <div className="xl:hidden w-full h-0.5 bg-slate-200"></div>

            <div className="xl:w-2/3 w-full
              flex flex-col xl:flex-row items-start justify-end gap-4">

              <Image
                src="/icon-payment.png"
                alt="Payment"
                width={50}
                height={50}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex flex-col xl:flex-row items-start justify-start gap-2">

                <div className="flex flex-col gap-2 items-center">
                  <div className="text-sm text-slate-700">가맹점 결제수(건)</div>
                    <span className="text-4xl font-semibold text-slate-700">
                      {buyOrderStats.totalSettlementCount?.toLocaleString()}
                    </span>
                </div>

                <div className="flex flex-row items-center justify-center gap-2">

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm text-slate-700">가맹점 결제량(USDT)</div>
                    <div className="flex flex-row items-center justify-center gap-1">
                      <Image
                        src="/icon-tether.png"
                        alt="Tether"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span className="text-xl font-semibold text-[#409192]"
                        style={{ fontFamily: 'monospace' }}>
                        {buyOrderStats.totalSettlementAmount
                          ? buyOrderStats.totalSettlementAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : '0.000'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm text-slate-700">가맹점 결제금액(원)</div>
                    <div className="flex flex-row items-center justify-center gap-1">
                      <span className="text-xl font-semibold text-yellow-600"
                        style={{ fontFamily: 'monospace' }}>
                        {buyOrderStats.totalSettlementAmountKRW?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

          
              <div className="flex flex-col gap-2 items-center">

                <div className="flex flex-row gap-2 items-center
                  border-b border-slate-200 pb-2">

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm text-slate-700">센터 수수료량(USDT)</div>
                    <div className="w-full flex flex-row items-center justify-end gap-1">
                      <Image
                        src="/icon-tether.png"
                        alt="Tether"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span className="text-xl font-semibold text-[#409192]"
                        style={{ fontFamily: 'monospace' }}>
                        {buyOrderStats.totalFeeAmount
                          ? buyOrderStats.totalFeeAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : '0.000'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm text-slate-700">센터 수수료금액(원)</div>
                    <div className="w-full flex flex-row items-center justify-end gap-1">
                      <span className="text-xl font-semibold text-yellow-600"
                        style={{ fontFamily: 'monospace' }}>
                        {buyOrderStats.totalFeeAmountKRW
                          ? buyOrderStats.totalFeeAmountKRW.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : '0'}
                      </span>
                    </div>
                  </div>

                </div>


                <div className="flex flex-row gap-2 items-center">

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm text-slate-700">AG 수수료량(USDT)</div>
                    <div className="w-full flex flex-row items-center justify-end gap-1">
                      <Image
                        src="/icon-tether.png"
                        alt="Tether"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span className="text-xl font-semibold text-[#409192]"
                        style={{ fontFamily: 'monospace' }}>
                        {buyOrderStats.totalAgentFeeAmount
                          ? buyOrderStats.totalAgentFeeAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : '0.000'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm">AG 수수료금액(원)</div>
                    <div className="w-full flex flex-row items-center justify-end gap-1">
                      <span className="text-xl font-semibold text-yellow-600"
                        style={{ fontFamily: 'monospace' }}>
                        {buyOrderStats.totalAgentFeeAmountKRW
                          ? buyOrderStats.totalAgentFeeAmountKRW.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : '0'}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
              

            </div>
            */}

            
            {/* divider */}
            {/*}
            <div className="hidden xl:block w-0.5 h-10 bg-slate-200"></div>
            <div className="xl:hidden w-full h-0.5 bg-slate-200"></div>

            <div className="xl:w-1/4 flex flex-row items-center justify-center gap-2">
              <div className="flex flex-col gap-2 items-center">
                <div className="text-sm">총 청산수(건)</div>
                <div className="text-xl font-semibold text-slate-500">
                  {tradeSummary.totalClearanceCount?.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <div className="text-sm">총 청산금액(원)</div>
                <div className="text-xl font-semibold text-slate-500">
                  {tradeSummary.totalClearanceAmount?.toLocaleString()} 원
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="text-sm">총 청산수량(USDT)</div>
                <div className="text-xl font-semibold text-slate-500">
                  {tradeSummary.totalClearanceAmountUSDT?.toLocaleString()} USDT
                </div>
              </div>
            </div>
            */}
            
          </div>


          <div className="
            mt-6
            w-full overflow-x-auto">

            <table className="w-full table-auto border-collapse border border-black/10 text-sm text-black">
              <thead className="bg-black text-white text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">거래번호</th>
                  <th className="px-3 py-2 text-left font-semibold">거래시간</th>
                  <th className="px-3 py-2 text-left font-semibold">구매자</th>
                  <th className="px-3 py-2 text-right font-semibold">USDT</th>
                  <th className="px-3 py-2 text-right font-semibold">KRW</th>
                  <th className="px-3 py-2 text-left font-semibold">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 bg-white">
                {buyOrders.map((item, index) => (
                  <tr
                    key={`minimal-${index}`}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#f7f7f7]'}
                  >
                    <td className="px-3 py-2 font-semibold text-black">#{item.tradeId}</td>
                    <td className="px-3 py-2 text-black">
                      {item?.createdAt
                        ? new Date(item.createdAt).toLocaleString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-3 py-2 text-black">
                      {item?.nickname || item?.buyer?.nickname || '구매자'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-black">
                      {typeof item?.usdtAmount === 'number'
                        ? item.usdtAmount.toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-black">
                      {typeof item?.krwAmount === 'number'
                        ? item.krwAmount.toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-3 py-2 text-black">
                      {item.status === 'ordered' && '주문접수'}
                      {item.status === 'accepted' && '결제대기'}
                      {item.status === 'paymentRequested' && '결제요청'}
                      {item.status === 'paymentConfirmed' && '결제확인'}
                      {item.status === 'completed' && '거래완료'}
                      {!item.status && '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="hidden">
            <table className="w-full table-auto border-collapse border border-slate-300 rounded-md">

              <thead
                className="bg-[#0047ab] text-white text-sm font-semibold"
                //style={{
                //  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                //}}
              >
                <tr>

                  <th className="p-2 text-start">
                    <div className="flex flex-col items-start justify-center gap-2">
                      <span className="text-sm text-slate-50 font-semibold">
                        가맹점
                      </span>
                      <span className="text-sm text-slate-50 font-semibold">
                        P2P거래번호
                      </span>
                      <span className="text-sm text-slate-50 font-semibold">
                        거래시작시간
                      </span>
                    </div>
                  </th>

                  <th className="p-2 text-start">
                    <div className="flex flex-col items-start justify-center gap-2">
                      <span className="text-sm text-slate-50 font-semibold">
                        구매자 아이디
                      </span>
                      <span className="text-sm text-slate-50 font-semibold">
                        USDT지갑
                      </span>
                      <span className="text-sm text-slate-50 font-semibold">
                        입금자
                      </span>
                    </div>
                  </th>
                  
                  <th className="p-2 text-end">
                    <div className="flex flex-col items-end justify-center gap-2">
                      <span className="text-sm text-slate-50 font-semibold">
                        {Buy_Amount}(USDT)
                      </span>
                      <span className="text-sm text-slate-50 font-semibold">
                        구매금액(원)
                      </span>
                      <span className="text-sm text-slate-50 font-semibold">
                        단가(원)
                      </span>
                    </div>
                  </th>
                  {/*
                  <th className="p-2">{Payment_Amount}</th>
                  */}

                  <th className="p-2 text-start">
                    <div className="flex flex-col items-start justify-center gap-2">

                      <div className="flex flex-col items-start justify-center gap-2">
                          <span className="text-sm text-slate-50 font-semibold">
                            판매자 아이디
                          </span>
                          <span className="text-sm text-slate-50 font-semibold">
                            USDT지갑
                          </span>
                      </div>

                      <div className="flex flex-row items-center justify-center gap-2">
                        <span>자동매칭</span>
                        <Image
                          src="/icon-matching.png"
                          alt="Auto Matching"
                          width={20}
                          height={20}

                          /*
                          className="
                          bg-slate-50 rounded-full
                          w-5 h-5 animate-spin"
                          */
                          // if buyOrders.filter((item) => item.status === 'ordered').length > 0, then animate spin
                          className={`
                            w-5 h-5
                            ${buyOrders.filter((item) => item.status === 'ordered').length > 0 ? 'animate-spin' : ''}
                          `}
                        />

                        {/* the count of status is ordered */}
                        <span className="text-sm text-slate-50 font-semibold">
                          {
                            buyOrders.filter((item) => item.status === 'ordered').length
                          }
                        </span>

                        <span className="text-sm text-slate-50 font-semibold">
                          거래상태
                        </span>

                      </div>

                    </div>
                  </th>


                  <th className="p-2">
                    <div className="flex flex-col items-center justify-center gap-2">

                      <div className="flex flex-row items-center justify-center gap-2">
                        <span>
                          자동입금확인
                        </span>
                        <Image
                          src="/icon-bank-auto.png"
                          alt="Bank Auto"
                          width={20}
                          height={20}

                          //className="w-5 h-5 animate-spin"
                          className={`
                            w-5 h-5
                            ${buyOrders.filter((item) => item.status === 'paymentRequested').length > 0 ? 'animate-spin' : ''}
                          `}
                        />
                        <span className="text-sm text-slate-50 font-semibold">
                          {
                            buyOrders.filter((item) => item.status === 'paymentRequested').length
                          }
                        </span>

                      </div>

                      <div className="w-full flex flex-col items-end justify-center gap-2">
                        <span className="text-sm text-slate-50 font-semibold">
                          입금통장
                        </span>
                        <span className="text-sm text-slate-50 font-semibold">
                          입금액(원)
                        </span>
                      </div>

                    </div>
                  </th>

                  <th className="hidden
                    p-2">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex flex-row items-center justify-center gap-2">
                        <span>
                          자동결제 및 정산(USDT)
                        </span>
                        <Image
                          src="/icon-settlement.png"
                          alt="Settlement"
                          width={20}
                          height={20}
                          ///className="w-5 h-5 animate-spin"
                          className={`
                            w-5 h-5
                            ${buyOrders.filter((item) =>
                              item.status === 'paymentConfirmed'
                              && item?.settlement?.status !== "paymentSettled"
                              && item?.storecode !== 'admin' // admin storecode is not included
                            ).length > 0
                            ? 'animate-spin' : ''}
                          `}
                        />

                        <span className="text-sm text-slate-50 font-semibold">
                          {
                            buyOrders.filter((item) => item.status === 'paymentConfirmed'
                            && item?.settlement?.status !== "paymentSettled"
                            && item?.storecode !== 'admin' // admin storecode is not included
                          ).length
                          }
                        </span>

                      </div>


                    </div>

                  </th>
                  

                </tr>
              </thead>

              {/* if my trading, then tr has differenc color */}
              <tbody>

                {buyOrders.map((item, index) => (

                  
                  <tr key={index} className={`
                    ${
                      index % 2 === 0 ? 'bg-slate-50' : 'bg-slate-100'


                      //item.walletAddress === address ?
                      

                    }
                  `}>
                  

                    <td className="
                      p-2
                    "
                    >

                      <div className="
                        w-36 
                        flex flex-col items-start justify-start gap-2
                        bg-slate-100
                        rounded-lg
                        border border-slate-200
                        hover:bg-slate-200
                        cursor-pointer
                        transition-all duration-200 ease-in-out
                        hover:scale-105
                        hover:shadow-lg
                        hover:shadow-slate-500/50
                        hover:cursor-pointer
                        p-2

                        "
                        onClick={() => {
                          // copy traideId to clipboard
                          navigator.clipboard.writeText(item.tradeId);
                          toast.success("거래번호가 복사되었습니다.");
                        }}
                      
                      >

                        <div className="flex flex-row items-center justify-start gap-2">
                          <Image
                            src={item?.store?.storeLogo || "/icon-store.png"}
                            alt="Store Logo"
                            width={35}
                            height={35}
                            className="
                            rounded-lg
                            w-8 h-8 object-cover"
                          />
                          
                          <div className="flex flex-col items-start justify-start">
                            <span className="text-sm text-slate-800 font-bold">
                              {
                                item?.store?.storeName?.length > 5 ?
                                item?.store?.storeName?.substring(0, 5) + '...' :
                                item?.store?.storeName
                              }
                            </span>
                            <span className="text-sm text-slate-600">
                              {
                                item?.agent?.agentName?.length > 5
                                  ? item?.agent?.agentName?.substring(0, 5) + '...'
                                  : item?.agent?.agentName
                              }
                            </span>
                          </div>
                        </div>


                        <span className="text-sm text-slate-500 font-semibold">
                        {
                          "#" + item.tradeId
                        }
                        </span>

                        <div className="flex flex-row items-center justify-start gap-2">

                          <div className="flex flex-col items-start justify-start">

                            <span className="text-sm text-slate-800 font-semibold">
                              {new Date(item.createdAt).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                            {/*
                            <span className="text-sm text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })}
                            </span>
                            */}

                            <div className="flex flex-row items-center justify-start gap-1">
                              <span className="text-sm text-slate-500 font-semibold">
                                {params.lang === 'ko' ? (
                                  <p>{
                                    new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                    ) :
                                    new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                    ) : (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                    )
                                  }</p>
                                ) : (
                                  <p>{
                                    new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                    ) :
                                    new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                    ) : (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                    )
                                  }</p>
                                )}
                              </span>
                              {/* audioOn */}
                              {item.status === 'ordered' || item.status === 'paymentRequested' && (
                                <div className="flex flex-row items-center justify-center gap-1">
                                  <span className="text-xl text-slate-700 font-semibold">
                                    {item.audioOn ? (
                                      '🔊'
                                    ) : '🔇'}
                                  </span>
                                  {/* audioOn off button */}
                                  <button
                                    className="text-sm text-blue-400 font-semibold underline"
                                    onClick={() => handleAudioToggle(
                                      index,
                                      item._id
                                    )}
                                  >
                                    {item.audioOn ? '끄기' : '켜기'}
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                          {/*
                          <span className="text-sm text-slate-500 font-semibold">
                            {params.lang === 'ko' ? (
                              <p>{
                                new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                ) :
                                new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                ) : (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                )
                              }</p>
                            ) : (
                              <p>{
                                new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                ) :
                                new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                ) : (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                )
                              }</p>
                            )}
                          </span>
                          */}
                        </div>

                      </div>

                    </td>
                    
                    <td className="p-2">
                      <div className="
                        w-36  
                        flex flex-col items-start justify-start gap-2">
                        
                        <div className="w-full flex flex-col gap-2 items-center justify-start">

                          <div className="w-full flex flex-row items-center justify-start gap-2">
                            <Image
                              src={item?.buyer?.avatar || "/icon-user.png"}
                              alt="Avatar"
                              width={20}
                              height={20}
                              className="rounded-full w-5 h-5"
                              style={{
                                objectFit: 'cover',
                              }}
                            />
                            <span className="text-lg text-slate-500 font-semibold">
                              {
                                item?.nickname?.length > 10 ?
                                item?.nickname?.substring(0, 10) + '...' :
                                item?.nickname
                              }
                            </span>
                          </div>

                          {/* wallet address */}
                          <div className="w-full flex flex-row items-start justify-start gap-1">
                            <Image
                              src="/icon-shield.png"
                              alt="Wallet Address"
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                            <button
                              className="text-sm text-blue-400 font-semibold underline
                              "
                              onClick={() => {
                                navigator.clipboard.writeText(item.walletAddress);
                                toast.success(Copied_Wallet_Address);
                              }}
                            >
                              {item.walletAddress.substring(0, 6)}...{item.walletAddress.substring(item.walletAddress.length - 4)}
                            </button>
                          </div>


                          {
                          item?.paymentMethod === 'mkrw' ? (
                            <></>
                          ) : (
                            <div className="w-full flex flex-row items-center justify-start gap-2">
                              <span className="text-lg text-slate-800 font-bold">
                                {
                                  item?.buyer?.depositName
                                }
                              </span>
                              <span className="
                                hidden xl:flex
                                text-sm text-slate-600">
                                {
                                  item?.buyer?.depositBankName
                                }
                              </span>
                              <span className="
                                text-sm text-slate-600">
                                {
                                  item?.buyer?.depositBanktAccountNumber &&
                                  item?.buyer?.depositBanktAccountNumber.substring(0, 3) + '...'
                                }
                              </span>
                            </div>
                          )}


                        </div>


                        
                        {/* userStats */}
                        {/* userStats.totalPaymentConfirmedCount */}
                        {/* userStats.totalPaymentConfirmedKrwAmount */}
                        <div className="flex flex-row items-center justify-center gap-2">
                          <span className="text-sm text-slate-500">
                            {
                              item?.userStats?.totalPaymentConfirmedCount
                              ? item?.userStats?.totalPaymentConfirmedCount.toLocaleString() + ' 건' :
                              0 + ' 건'
                            }
                          </span>
                          <span className="text-sm text-slate-500">
                            {
                              item?.userStats?.totalPaymentConfirmedKrwAmount &&
                              item?.userStats?.totalPaymentConfirmedKrwAmount.toLocaleString() + ' 원'
                            }
                          </span>

                          {!item?.userStats?.totalPaymentConfirmedCount && (
                            <Image
                              src="/icon-new-user.png"
                              alt="New User"
                              width={50}
                              height={50}
                              className="w-10 h-10"
                            />
                          )}
                        </div>

                      </div>

                    </td>


                    <td className="p-2">
                      <div className="
                        w-32
                        flex flex-col gap-2 items-end justify-start">

                        <div className="flex flex-row items-center justify-end gap-2">
                          <Image
                            src="/icon-tether.png"
                            alt="Tether"
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                          <span className="text-xl text-[#409192] font-semibold"
                            style={{
                              fontFamily: 'monospace',
                            }}
                          >
                            {
                            Number(item.usdtAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                          </span>
                        </div>


                        <div className="flex flex-row items-center justify-end gap-1">
                          <span className="text-xl text-yellow-600 font-semibold"
                            style={{
                              fontFamily: 'monospace',
                            }}
                          >
                            {
                              item.krwAmount?.toLocaleString()
                            }
                          </span>
                        </div>

                        <span className="text-sm text-slate-500"
                          style={{
                            fontFamily: 'monospace',
                          }}
                        >
                          {
                            Number(item.rate).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            //Number(item.krwAmount / item.usdtAmount).toFixed(3)
                          }
                        </span>

                        {/* paymentMethod */}
                        <div className="flex flex-col items-end justify-end gap-2">
                          
                          <div className="flex flex-row items-center justify-center gap-2">
                            <span className="text-sm text-slate-500">
                              결제방법
                            </span>
                            <span className="text-sm text-slate-500">
                              {item.paymentMethod === 'bank' ? '은행'
                              : item.paymentMethod === 'card' ? '카드'
                              : item.paymentMethod === 'pg' ? 'PG'
                              : item.paymentMethod === 'cash' ? '현금'
                              : item.paymentMethod === 'crypto' ? '암호화폐'
                              : item.paymentMethod === 'giftcard' ? '기프트카드'
                              : item.paymentMethod === 'mkrw' ? 'MKRW' : '기타'
                              }
                            </span>
                          </div>

                          {item.paymentMethod === 'mkrw' && item?.escrowWallet?.address && (
                            <div className="flex flex-col items-end justify-center gap-2">

                              <div className="flex flex-row items-center justify-center gap-2">
                                <Image
                                  src="/icon-shield.png"
                                  alt="Escrow Wallet"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5"
                                />
                                <button
                                  className="text-sm text-blue-600 font-semibold underline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(item?.escrowWallet.address);
                                    toast.success(Copied_Wallet_Address);
                                  }}
                                >
                                    {item?.escrowWallet.address.substring(0, 6)}...{item?.escrowWallet.address.substring(item?.escrowWallet.address.length - 4)}
                                </button>
                              </div>

                              {/* balance */}
                              {item?.escrowWallet?.balance ? (
                                <div className="flex flex-row items-center justify-center gap-1">
                                  <Image
                                    src="/token-mkrw-icon.png"
                                    alt="MKRW Token"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                  />
                                  <span className="text-lg text-yellow-600 font-semibold"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {
                                      item?.escrowWallet?.balance.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    }
                                  </span>
                                </div>

                              ) : (
                                <div className="flex flex-row items-center justify-center gap-1">
                                  <Image
                                    src="/icon-loading.png"
                                    alt="Loading"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 animate-spin"
                                  />
                                  <span className="text-sm text-slate-500">
                                    에스크로 진행중...
                                  </span>
                                </div>
                              )}

                            </div>

                          )}
      
                        </div>

                      </div>
                    </td>


                    <td className="p-2">

                      <div className="
                        w-52
                        flex flex-row items-start justify-start gap-2">
                          
                        {/* status */}
                        {item.status === 'ordered' && (
                          <div className="w-full flex flex-col gap-2 items-center justify-center">

                            <div className="flex flex-row items-center justify-center gap-2">
                              <Image
                                src="/icon-searching-seller.gif"
                                alt="Auto Matching"
                                width={50}
                                height={50}
                                className="w-8 h-8"
                              />
                              <span className="text-sm text-slate-500 font-semibold">
                                판매자<br/>매칭중
                              </span>
                            </div>

                            <div
                              className="w-full flex items-center justify-center text-sm text-red-600 font-semibold
                                border border-red-600 rounded-lg p-2"
                            >
                              {Buy_Order_Opened}
                            </div>

                          </div>
                        )}



                    

                        {item.status === 'ordered' ? (
                          <div className="w-full flex flex-col gap-2 items-start justify-start">

                            {/* cancel buy order button */}
                            {/* 주문취소하기 */}
                            <button

                              disabled={cancellingBuyOrders[index]}
          
                              className="w-full flex items-center justify-center
                                text-sm text-red-400 font-semibold
                                border border-red-500 rounded-lg p-2
                                bg-red-900/20
                                text-center
                                hover:bg-red-900/30
                                cursor-pointer
                                transition-all duration-200 ease-in-out
                                hover:scale-105
                                hover:shadow-lg
                                hover:shadow-red-500/50
                              "  
                              onClick={() => {
                                confirm("정말로 구매주문을 취소하시겠습니까?") && cancelBuyOrderByAdmin(index, item._id);
                              }}
                            >
                              <div className="flex flex-row gap-2 items-center justify-center">
                                {cancellingBuyOrders[index] && (
                                  <Image
                                    src="/icon-loading.png"
                                    alt="Loading"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5
                                    animate-spin"
                                  />
                                )}
                                <span className="text-sm">
                                  취소하기
                                </span>
                              </div>
                            
                            </button>
                            
                          </div>
                        ) : (

                          <>
                            {item.seller && (
                            <div className="w-full flex flex-col gap-2 items-start justify-start">

                              <div className="flex flex-row items-center justify-center gap-2"> 
                                <Image
                                  src={item?.seller?.avatar || "/icon-seller.png"}
                                  alt="Avatar"
                                  width={20}
                                  height={20}
                                  className="rounded-full w-5 h-5"
                                />
                                <span className="text-lg font-semibold text-slate-500">
                                  {
                                    item.seller?.nickname &&
                                    item.seller.nickname.length > 8 ?
                                    item.seller.nickname.slice(0, 8) + '...' :
                                    item.seller?.nickname
                                  }
                                </span>
                              </div>

                              {/* wallet address */}
                              <div className="flex flex-row items-center justify-center gap-1">
                                <Image
                                  src="/icon-shield.png"
                                  alt="Wallet Address"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5"
                                />
                                <button
                                  className="text-sm text-blue-600 font-semibold underline
                                  "
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.seller?.walletAddress);
                                    toast.success(Copied_Wallet_Address);
                                  }}
                                >
                                  {item.seller?.walletAddress && item.seller?.walletAddress.substring(0, 6) + '...' + item.seller?.walletAddress.substring(item.seller?.walletAddress.length - 4)}
                                </button>
                              </div>

                              <div className="flex flex-row items-center justify-center gap-2">
                                <Image
                                  src="/icon-matching-completed.png"
                                  alt="Matching Completed"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5"
                                />
                                <span className="text-sm text-slate-700 font-semibold">
                                  자동매칭
                                </span>
                              </div>

                            </div>
                            )}

                          </>
                        )}


                        {item.status === 'accepted' && (

                          <div className="w-full flex flex-col gap-2 items-start justify-start">
                            <button
                              className="text-sm text-blue-400 font-semibold
                                border border-blue-500 rounded-lg p-2 bg-blue-900/20"
                            >
                              {Trade_Started}
                            </button>
                            
                            <div className="text-sm text-slate-600">

                              {params.lang === 'ko' ? (
                                <p>{
                                  new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000) + ' ' + seconds_ago
                                  ) :
                                  new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                  ) : (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                  )
                                }</p>
                              ) : (
                                <p>{
                                  new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000) + ' ' + seconds_ago
                                  ) :
                                  new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                  ) : (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                  )
                                }</p>
                              )}

                            </div>


                          </div>
                        )}

                        {item.status === 'paymentRequested' && (

                          <div className="w-full flex flex-col gap-2 items-start justify-start">

                            <button
                              className="text-sm text-amber-400 font-semibold
                                border border-amber-500 rounded-lg p-2 bg-amber-900/20"
                            >
                              {Request_Payment}
                            </button>


                            {/*
                            <div className="text-sm text-white">
                              {item.seller?.nickname}
                            </div>
                            */}

                            <div className="text-sm text-slate-600">
                              {/* from now */}
                              {
                                new Date().getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 ? (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000) + ' ' + seconds_ago
                                ) : new Date().getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 * 60 ? (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                ) : (
                                  ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                )
                              }
                            </div>


                          </div>
                        )}

                        {item.status === 'cancelled' && (
                          <div className="w-full flex flex-col gap-2 items-start justify-start">

                              {/*
                              <div className="text-lg text-red-600 font-semibold
                                border border-red-600 rounded-lg p-2
                                bg-red-100
                                w-full text-center
                                ">
                                {
                                  Cancelled_at
                                }
                              </div>
                              */}
                              <button
                                className="w-full flex items-center justify-center text-sm text-red-600 font-semibold
                                  border border-red-600 rounded-lg p-2"
                              >
                                {Cancelled_at}
                              </button>



                              {/*
                              <span className="text-sm text-white">
                                {item.seller?.nickname}
                              </span>
                              */}

                              <div className="text-sm text-slate-500">
                                {
                                  // from now
                                  new Date().getTime() - new Date(item.cancelledAt).getTime() < 1000 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.cancelledAt).getTime()) / 1000) + ' ' + seconds_ago
                                  ) : new Date().getTime() - new Date(item.cancelledAt).getTime() < 1000 * 60 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.cancelledAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                  ) : (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.cancelledAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                  )
                                }
                              </div>

                          </div>
                        )}


                        {/* if status is accepted, show payment request button */}
                        {item.status === 'paymentConfirmed' && (
                          <div className="w-full flex flex-col gap-2 items-start justify-start">

                            {/*
                            <span className="text-lg text-[#409192] font-semibold
                              border border-green-600 rounded-lg p-2
                              bg-green-100
                              w-full text-center
                              ">


                              {Completed}
                            </span>
                            */}
                            {/*
                            <span className="text-sm font-semibold text-white">
                              {item.seller?.nickname}
                            </span>
                            */}



                            <button
                              className="w-full flex items-center justify-center text-sm text-[#409192] font-semibold
                                border border-green-600 rounded-lg p-2"
                            >
                              {Completed}
                            </button>
                            {/* new window */}
                            <a
                              href={`${paymentUrl}/${params.lang}/${clientId}/${item?.storecode}/pay-usdt-reverse/${item?._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 font-semibold underline"
                            >
                              새창
                            </a>

                            <span
                              className="text-sm text-slate-500"
                            >{
                              //item.paymentConfirmedAt && new Date(item.paymentConfirmedAt)?.toLocaleString()
                              // from now
                              new Date().getTime() - new Date(item.paymentConfirmedAt).getTime() < 1000 * 60 ? (
                                ' ' + Math.floor((new Date().getTime() - new Date(item.paymentConfirmedAt).getTime()) / 1000) + ' ' + seconds_ago
                              ) : new Date().getTime() - new Date(item.paymentConfirmedAt).getTime() < 1000 * 60 * 60 ? (
                                ' ' + Math.floor((new Date().getTime() - new Date(item.paymentConfirmedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                              ) : (
                                ' ' + Math.floor((new Date().getTime() - new Date(item.paymentConfirmedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                              )

                            }</span>
                          </div>
                        )}





                        {item.status === 'completed' && (
                          <div className="w-full flex flex-col gap-2 items-start justify-start">
                            
                            {Completed_at}
                          </div>
                        )}

                      </div>

                    </td>



                    <td className="p-2">

                      {
                      //!item?.escrowTransactionHash &&
                      item?.status === 'paymentConfirmed' && (
                        <div className="
                          w-36
                          flex flex-col gap-2 items-end justify-start">
                          
                          {item?.autoConfirmPayment === true ? (
                          
                            <div className="flex flex-row gap-2 items-center justify-end">
                              <Image
                                src="/icon-bank-check.png"
                                alt="Bank Check"
                                width={20}
                                height={20}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-sm font-semibold text-slate-500">
                                자동입금확인
                              </span>
                            </div>

                          ) : (

                            <div className="flex flex-row gap-2 items-center justify-end">
                              <Image
                                src="/icon-bank-check.png"
                                alt="Bank Check"
                                width={20}
                                height={20}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-sm font-semibold text-slate-500">
                                수동입금확인
                              </span>
                            </div>

                          )}

                          {/* seller bank info */}
                          <div className="flex flex-row gap-2 items-center justify-end">
                            <span className="text-sm text-slate-500">
                              {item.seller?.bankInfo?.bankName}
                            </span>
                            <span className="text-lg text-gray-800 font-bold">
                              {item.seller?.bankInfo?.accountHolder}
                            </span>
                          </div>

                          {/* paymentAmount */}
                          <div className="flex flex-row gap-1 items-center justify-end">
                            <span className="text-xl text-yellow-600 font-semibold"
                              style={{ fontFamily: 'monospace' }}>
                              {
                                item.paymentAmount?.toLocaleString()
                              }
                            </span>
                          </div>

                          <span className="text-sm text-purple-600 font-semibold">
                            {params.lang === 'ko' ? (
                              <p>{
                                new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 ? (
                                  ' ' + Math.floor((new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000) + ' ' + '초 경과'
                                ) :
                                new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 * 60 ? (
                                ' ' + Math.floor((new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60) + ' ' + '분 경과'
                                ) : (
                                  ' ' + Math.floor((new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 경과'
                                )
                              }</p>
                            ) : (
                              <p>{
                                new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 ? (
                                  ' ' + Math.floor((new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000) + ' ' + '초 경과'
                                ) :
                                new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 * 60 ? (
                                ' ' + Math.floor((new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60) + ' ' + '분 경과'
                                ) : (
                                  ' ' + Math.floor((new Date(item.paymentConfirmedAt).getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 경과'
                                )
                              }</p>
                            )}
                          </span>

                        </div>
                      )}

                      {item?.status === 'paymentRequested' && (

                        <div className="
                          w-32
                          flex flex-col gap-2 items-end justify-start">

                          {item?.paymentMethod === 'mkrw' ? (
                            <div className="flex flex-row gap-2 items-center justify-end">
                              <Image
                                src="/token-mkrw-icon.png"
                                alt="MKRW"
                                width={20}
                                height={20}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-sm font-semibold text-slate-700">
                                MKRW
                              </span>
                            </div>
                          ) : (

                            <div className="flex flex-col gap-2 items-end justify-center">

                              <div className="flex flex-row gap-2 items-center justify-end">
                                <Image
                                  src="/icon-bank-auto.png"
                                  alt="Bank Auto"
                                  width={20}
                                  height={20}
                                  className="animate-spin"
                                />
                                {item?.autoConfirmPayment === true ? (
                                  <span className="text-sm font-semibold text-slate-700">
                                    자동입금확인중
                                  </span>
                                ) : (
                                  <span className="text-sm font-semibold text-slate-700">
                                    자동입금확인중
                                  </span>
                                )}

                              </div>



                              <div className="flex flex-row gap-1 items-center justify-end">
                                <div className="text-sm text-slate-600">
                                  {item.seller?.bankInfo?.bankName}
                                </div>
                                <div className="text-lg text-slate-800 font-bold">
                                  {item.seller?.bankInfo?.accountHolder}
                                </div>
                              </div>
                              {/*
                              <div className="flex flex-row items-end justify-start text-sm text-slate-500">
                                {item.seller?.bankInfo?.accountNumber}
                              </div>
                              */}

                              <div className="flex flex-col items-between justify-center">

                                <span className="text-sm text-purple-400 font-semibold">
                                  {params.lang === 'ko' ? (
                                    <p>{
                                      new Date().getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000) + ' ' + '초 경과'
                                      ) :
                                      new Date().getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60) + ' ' + '분 경과'
                                      ) : (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 경과'
                                      )
                                    }</p>
                                  ) : (
                                    <p>{
                                      new Date().getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000) + ' ' + '초 경과'
                                      ) :
                                      new Date().getTime() - new Date(item.paymentRequestedAt).getTime() < 1000 * 60 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60) + ' ' + '분 경과'
                                      ) : (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.paymentRequestedAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 경과'
                                      )
                                    }</p>
                                  )}
                                </span>

                                {
                                false
                                //item.seller
                                //&& item.seller.walletAddress === address
                                
                                ///////////////&& item?.autoConfirmPayment

                                && (

                                  <div className="flex flex-col gap-2 items-center justify-center">

                                    {/* 입금자명과 입금액이 일치하는지 확인 후, 수동으로 입금확인 처리 */}
                      

                                    <div className="flex flex-row gap-2">
                                      
                                      <button

                                        disabled={confirmingPayment[index]}
                                        
                                        className={`
                                          ${confirmingPayment[index]
                                          ? 'text-gray-400 border-gray-400 bg-gray-100 cursor-not-allowed'
                                          : 'text-yellow-600 hover:text-yellow-700 hover:shadow-yellow-500/50 cursor-pointer'
                                          } bg-yellow-100 border border-yellow-600 rounded-lg p-2
                                        `}

                                        onClick={() => {
                                          confirm("수동으로 입금확인을 처리하시겠습니까?") &&
                                          confirmPayment(
                                            index,
                                            item._id,
                                            //paymentAmounts[index],
                                            //paymentAmountsUsdt[index],

                                            item.krwAmount,
                                            item.usdtAmount,
                                            
                                            item.walletAddress,

                                            item.paymentMethod,
                                          );
                                        }}

                                      >
                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          { confirmingPayment[index] && (
                                              <Image
                                                src="/loading.png"
                                                alt="Loading"
                                                width={20}
                                                height={20}
                                                className="w-5 h-5
                                                animate-spin"
                                              />
                                          )}
                                          <span className="text-sm">
                                            입금완료하기
                                          </span>
                                        </div>

                                      </button>


                                    </div>

                                  </div>


                                )}


                              </div>

                            </div>
                            
                          )}

                        </div>

                      )}
                    </td>



                  </tr>

                ))}

              </tbody>

            </table>
            </div>

          </div>




          


        </div>

      

        {/* pagination */}
        {/* url query string */}
        {/* 1 2 3 4 5 6 7 8 9 10 */}
        {/* ?limit=10&page=1 */}
        {/* submit button */}
        {/* totalPage = Math.ceil(totalCount / limit) */}
        <div className="
        mt-4 flex-row items-center justify-center gap-4">


          <div className="flex flex-row items-center gap-2">
            <select
              value={limitValue}
              onChange={(e) =>
                router.push(`/${params.lang}/escrow/${params.sellerWalletAddress}?storecode=${searchStorecode}&limit=${Number(e.target.value)}&page=${pageValue}`)
              }

              className="text-sm bg-slate-50 text-slate-700 px-2 py-1 rounded-md border border-slate-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* 처음으로 */}
          <button
            disabled={Number(pageValue) <= 1}
            className={`text-sm text-white px-4 py-2 rounded-md ${Number(pageValue) <= 1 ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={() => {
              router.push(`/${params.lang}/escrow/${params.sellerWalletAddress}?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=1`)
            }}
          >
            처음으로
          </button>


          <button
            disabled={Number(pageValue) <= 1}
            className={`text-sm text-white px-4 py-2 rounded-md ${Number(pageValue) <= 1 ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={() => {

              router.push(`/${params.lang}/escrow/${params.sellerWalletAddress}?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=${Number(pageValue) - 1}`)


            }}
          >
            이전
          </button>


          <span className="text-sm text-slate-500">
            {pageValue} / {Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}
          </span>


          <button
            disabled={Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}
            className={`text-sm text-white px-4 py-2 rounded-md ${Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue)) ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={() => {

              router.push(`/${params.lang}/escrow/${params.sellerWalletAddress}?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=${Number(pageValue) + 1}`)

            }}
          >
            다음
          </button>

          {/* 마지막으로 */}
          <button
            disabled={Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}
            className={`text-sm text-white px-4 py-2 rounded-md ${Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue)) ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={() => {

              router.push(`/${params.lang}/escrow/${params.sellerWalletAddress}?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=${Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}`)

            }}
          >
            마지막으로
          </button>

        </div>

        {bannerAds.length > 0 && (
          <div className="mt-10 space-y-4 xl:hidden">
            {bannerAds.map((ad) => (
              <a
                key={`mobile-${ad.id}`}
                href={ad.link}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/90 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)]">
                  <div className="relative aspect-[2/1] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/35 opacity-70" />
                </div>
              </a>
            ))}
          </div>
        )}

          
      </div>

      </div>

        {/*
        <Modal isOpen={isModalOpen} onClose={closeModal}>
            <TradeDetail
                closeModal={closeModal}
                //goChat={goChat}
            />
        </Modal>
        */}


        <ModalUser isOpen={isModalOpen} onClose={closeModal}>
            <UserPaymentPage
                closeModal={closeModal}
                selectedItem={selectedItem}
            />
        </ModalUser>

        <style jsx>{`
          .escrow-banner-marquee {
            overflow: hidden;
            width: 100%;
          }

          .escrow-banner-track {
            display: flex;
            gap: 12px;
            animation: escrowBannerMove 24s linear infinite;
            will-change: transform;
          }

          .escrow-banner-group {
            display: flex;
            gap: 12px;
          }

          .escrow-banner-card {
            flex: 0 0 auto;
          }

          .escrow-banner-marquee:hover .escrow-banner-track {
            animation-play-state: paused;
          }

          .typing-text {
            white-space: pre-wrap;
            word-break: break-word;
          }

          .typing-flash {
            animation: typingFlash 0.7s ease-in-out infinite;
          }

          .typing-cursor {
            display: inline-block;
            margin-left: 2px;
            color: #94a3b8;
            animation: typingBlink 0.8s steps(2, start) infinite;
          }

          .buy-cta-animated {
            position: relative;
            overflow: hidden;
          }

          .buy-cta-animated::before {
            content: '';
            position: absolute;
            inset: -50% -20%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.65) 0%, transparent 60%);
            opacity: 0.6;
            animation: buyCtaGlow 1.2s ease-in-out infinite;
            pointer-events: none;
          }

          .buy-cta-animated::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.65) 45%, transparent 90%);
            transform: translateX(-120%);
            animation: buyCtaSheen 1.4s ease-in-out infinite;
            pointer-events: none;
            mix-blend-mode: screen;
          }

          .login-cta-glow {
            position: absolute;
            inset: -14px -18px;
            border-radius: 16px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, transparent 65%);
            filter: blur(14px);
            opacity: 0.75;
            animation: loginGlow 1.7s ease-in-out infinite;
            pointer-events: none;
          }

          .login-cta-ring {
            position: absolute;
            inset: -6px -10px;
            border-radius: 14px;
            border: 2px solid rgba(59, 130, 246, 0.55);
            animation: loginRing 1.7s ease-out infinite;
            pointer-events: none;
          }

          .login-cta-bounce {
            animation: loginBounce 2.3s ease-in-out infinite;
            will-change: transform;
          }

          @keyframes escrowBannerMove {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }

          @keyframes buyCtaGlow {
            0%,
            100% {
              opacity: 0.35;
            }
            50% {
              opacity: 0.9;
            }
          }

          @keyframes buyCtaSheen {
            0% {
              transform: translateX(-140%);
            }
            60% {
              transform: translateX(140%);
            }
            100% {
              transform: translateX(140%);
            }
          }

          @keyframes loginGlow {
            0%,
            100% {
              opacity: 0.45;
              transform: scale(0.98);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }

          @keyframes loginRing {
            0% {
              opacity: 0;
              transform: scale(0.92);
            }
            30% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: scale(1.12);
            }
          }

          @keyframes loginBounce {
            0%,
            100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-2px) scale(1.03);
            }
          }

          @keyframes typingBlink {
            0%,
            49% {
              opacity: 1;
            }
            50%,
            100% {
              opacity: 0;
            }
          }

          @keyframes typingFlash {
            0%,
            100% {
              text-shadow: 0 0 0 rgba(37, 99, 235, 0);
              color: inherit;
            }
            50% {
              text-shadow:
                0 0 6px rgba(59, 130, 246, 0.9),
                0 0 14px rgba(59, 130, 246, 0.9),
                0 0 28px rgba(59, 130, 246, 0.85),
                0 0 42px rgba(59, 130, 246, 0.7);
              color: #0ea5e9;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .escrow-banner-track {
              animation: none;
            }
            .typing-flash {
              animation: none;
              text-shadow: none;
            }
            .typing-cursor {
              animation: none;
            }
            .buy-cta-animated,
            .buy-cta-animated::before,
            .buy-cta-animated::after {
              animation: none;
            }
            .login-cta-glow,
            .login-cta-ring,
            .login-cta-bounce {
              animation: none;
            }
          }
        `}</style>


    </main>

  );


};




const UserPaymentPage = (
  {
      closeModal = () => {},
      selectedItem = null as {
        _id: string;
        nickname: string;
        storecode: string;
        buyer?: {
          depositBankName?: string;
          depositBankAccountNumber?: string;
          depositName?: string
        }
      } | null,
  }
) => {

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">거래정보</h1>
      
      {/* iframe */}
      <iframe
        src={`${paymentUrl}/ko/${clientId}/${selectedItem?.storecode}/pay-usdt-reverse/${selectedItem?._id}`}

        
          
        width="400px"
        height="500px"
        className="border border-slate-200 rounded-lg"
        title="Page"
      ></iframe>


      <button
        onClick={closeModal}
        className="bg-[#0047ab] text-white px-4 py-2 rounded-lg hover:bg-[#0047ab]/80"
      >
        닫기
      </button>
    </div>
  );

};




// close modal

const TradeDetail = (
    {
        closeModal = () => {},
        goChat = () => {},
        
    }
) => {


    const [amount, setAmount] = useState(1000);
    const price = 91.17; // example price
    const receiveAmount = (amount / price).toFixed(3);
    const commission = 0.01; // example commission
  
    return (

      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-lg p-6 border border-slate-200">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-emerald-500 mr-2"></span>
          <h2 className="text-lg font-semibold text-slate-900 ">Iskan9</h2>
          <span className="ml-2 text-blue-400 text-sm">318 trades</span>
        </div>
        <p className="text-slate-600 mt-2">The offer is taken from another source. You can only use chat if the trade is open.</p>
        
        <div className="mt-4">
          <div className="flex justify-between text-slate-700">
            <span>Price</span>
            <span>{price} KRW</span>
          </div>
          <div className="flex justify-between text-slate-700 mt-2">
            <span>Limit</span>
            <span>40680.00 KRW - 99002.9 KRW</span>
          </div>
          <div className="flex justify-between text-slate-700 mt-2">
            <span>Available</span>
            <span>1085.91 USDT</span>
          </div>
          <div className="flex justify-between text-slate-700 mt-2">
            <span>Seller&apos;s payment method</span>
            <span className="bg-slate-100 text-amber-400 px-2 rounded-full border border-slate-200">Tinkoff</span>
          </div>
          <div className="mt-4 text-slate-700">
            <p>24/7</p>
          </div>
        </div>
  
        <div className="mt-6 border-t border-slate-200 pt-4 text-slate-700">
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-slate-700 font-medium">I want to pay</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(
                    e.target.value === '' ? 0 : parseInt(e.target.value)
                ) }

                className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium">I will receive</label>
              <input 
                type="text"
                value={`${receiveAmount} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium">Commission</label>
              <input 
                type="text"
                value={`${commission} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg border border-emerald-500 shadow-md"
                onClick={() => {
                    console.log('Buy USDT');
                    // go to chat
                    // close modal
                    closeModal();
                    goChat();

                }}
            >
                Buy USDT
            </button>
            <button
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg border border-slate-200 shadow-md"
                onClick={() => {
                    console.log('Cancel');
                    // close modal
                    closeModal();
                }}
            >
                Cancel
            </button>
          </div>

        </div>


      </div>
    );
  };




type BuyerAutoReplyContext = {
  buyerWalletAddress?: string;
  sellerWalletAddress?: string;
  priceSettingMethod?: string;
  market?: string;
  price?: number | string;
  escrowBalance?: number | string;
};

const AUTO_REPLY_STORAGE_PREFIX = 'buyer-auto-reply';

const AutoBuyerReplyListener = ({
  channelUrl,
  buyerWalletAddress,
  sellerWalletAddress,
  context,
  enabled,
}: {
  channelUrl: string | null;
  buyerWalletAddress?: string;
  sellerWalletAddress?: string;
  context?: BuyerAutoReplyContext | null;
  enabled: boolean;
}) => {
  const { state } = useSendbird();
  const sdk = state?.stores?.sdkStore?.sdk;
  const sentRef = useRef<Set<string>>(new Set());
  const pendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!sdk?.groupChannel?.addGroupChannelHandler || !channelUrl) {
      return;
    }
    if (!buyerWalletAddress || !sellerWalletAddress) {
      return;
    }
    if (buyerWalletAddress === sellerWalletAddress) {
      return;
    }

    const storageKey = `${AUTO_REPLY_STORAGE_PREFIX}:${buyerWalletAddress}:${channelUrl}`;
    if (typeof window !== 'undefined' && window.localStorage.getItem(storageKey) === '1') {
      sentRef.current.add(channelUrl);
    }

    const handlerId = `${AUTO_REPLY_STORAGE_PREFIX}:${channelUrl}`;
    const handler = new GroupChannelHandler({
      onMessageReceived: async (channel, message) => {
        if (!channel || channel.url !== channelUrl) {
          return;
        }
        if (!message) {
          return;
        }
        const senderId =
          'sender' in message ? (message as { sender?: { userId?: string } })?.sender?.userId : undefined;
        if (senderId !== sellerWalletAddress) {
          return;
        }
        if (sentRef.current.has(channelUrl) || pendingRef.current.has(channelUrl)) {
          return;
        }

        pendingRef.current.add(channelUrl);
        try {
          const aiResponse = await fetch('/api/user/generateBuyerIntentMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyerWalletAddress,
              sellerWalletAddress,
              ...(context ?? {}),
            }),
          });
          const aiData = await aiResponse.json().catch(() => ({}));
          if (!aiResponse.ok || !aiData?.text) {
            return;
          }

          const response = await fetch('/api/sendbird/welcome-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelUrl,
              senderId: buyerWalletAddress,
              message: aiData.text,
            }),
          });
          if (response.ok) {
            sentRef.current.add(channelUrl);
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(storageKey, '1');
            }
          }
        } catch {
          // ignore auto-reply errors
        } finally {
          pendingRef.current.delete(channelUrl);
        }
      },
    });

    sdk.groupChannel.addGroupChannelHandler(handlerId, handler);

    return () => {
      try {
        sdk.groupChannel.removeGroupChannelHandler(handlerId);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [sdk, channelUrl, buyerWalletAddress, sellerWalletAddress, context, enabled]);

  return null;
};

const AutoSellerReplyListener = ({
  channelUrl,
  buyerWalletAddress,
  sellerWalletAddress,
  context,
  enabled,
}: {
  channelUrl: string | null;
  buyerWalletAddress?: string;
  sellerWalletAddress?: string;
  context?: BuyerAutoReplyContext | null;
  enabled: boolean;
}) => {
  const { state } = useSendbird();
  const sdk = state?.stores?.sdkStore?.sdk;
  const repliedRef = useRef<Set<string | number>>(new Set());
  const pendingRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!sdk?.groupChannel?.addGroupChannelHandler || !channelUrl) {
      return;
    }
    if (!buyerWalletAddress || !sellerWalletAddress) {
      return;
    }
    if (buyerWalletAddress === sellerWalletAddress) {
      return;
    }

    const handlerId = `seller-auto-reply:${channelUrl}`;
    const handler = new GroupChannelHandler({
      onMessageReceived: async (channel, message) => {
        if (!channel || channel.url !== channelUrl) {
          return;
        }
        if (!message) {
          return;
        }
        const senderId =
          'sender' in message ? (message as { sender?: { userId?: string } })?.sender?.userId : undefined;
        if (senderId !== buyerWalletAddress) {
          return;
        }
        const messageId =
          'messageId' in message ? (message as { messageId?: number })?.messageId : undefined;
        const key = messageId ?? `${channelUrl}:${(message as any)?.createdAt ?? Date.now()}`;
        if (repliedRef.current.has(key) || pendingRef.current.has(key)) {
          return;
        }

        const messageText =
          'message' in message ? (message as { message?: string })?.message?.trim?.() : '';
        if (!messageText) {
          return;
        }

        pendingRef.current.add(key);
        try {
          const delayMs = 2000 + Math.floor(Math.random() * 2000);
          await new Promise((resolve) => setTimeout(resolve, delayMs));

          const aiResponse = await fetch('/api/user/generateSellerAutoReply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: messageText,
              ...(context ?? {}),
            }),
          });
          const aiData = await aiResponse.json().catch(() => ({}));
          if (!aiResponse.ok || !aiData?.text) {
            return;
          }

          const response = await fetch('/api/sendbird/welcome-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelUrl,
              senderId: sellerWalletAddress,
              message: aiData.text,
            }),
          });
          if (response.ok) {
            repliedRef.current.add(key);
          }
        } catch {
          // ignore auto-reply errors
        } finally {
          pendingRef.current.delete(key);
        }
      },
    });

    sdk.groupChannel.addGroupChannelHandler(handlerId, handler);
    return () => {
      try {
        sdk.groupChannel.removeGroupChannelHandler(handlerId);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [sdk, channelUrl, buyerWalletAddress, sellerWalletAddress, context, enabled]);

  return null;
};

const SendbirdChatEmbed = ({
  buyerWalletAddress,
  sellerWalletAddress,
  selectedChannelUrl,
  isOpen,
  onOpenChange,
  variant = 'floating',
  promotionContext,
}: {
  buyerWalletAddress?: string;
  sellerWalletAddress: string;
  selectedChannelUrl?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'floating' | 'inline';
  promotionContext?: {
    priceSettingMethod?: string;
    market?: string;
    price?: number | string;
    escrowBalance?: number | string;
    promotionText?: string;
  } | null;
}) => {
  const isInline = variant === 'inline';
  const shouldShowChat = isInline || isOpen;
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [channelUrl, setChannelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastPromotionKeyRef = useRef<string | null>(null);
  const buyerAutoReplyContext = useMemo<BuyerAutoReplyContext | null>(() => {
    if (!buyerWalletAddress || !sellerWalletAddress) {
      return null;
    }
    return {
      buyerWalletAddress,
      sellerWalletAddress,
      priceSettingMethod: promotionContext?.priceSettingMethod,
      market: promotionContext?.market,
      price: promotionContext?.price,
      escrowBalance: promotionContext?.escrowBalance,
    };
  }, [buyerWalletAddress, promotionContext, sellerWalletAddress]);
  const sellerAutoReplyContext = buyerAutoReplyContext;

  useEffect(() => {
    let isMounted = true;

    const fetchChat = async () => {
      if (!buyerWalletAddress || !sellerWalletAddress) {
        if (isMounted) {
          setSessionToken(null);
          setChannelUrl(null);
          setErrorMessage(null);
        }
        return;
      }

      if (buyerWalletAddress === sellerWalletAddress && !selectedChannelUrl) {
        setErrorMessage('구매자가 접속하면 채팅이 활성화됩니다.');
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const sessionResponse = await fetch('/api/sendbird/session-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: buyerWalletAddress,
            nickname: `${buyerWalletAddress.slice(0, 6)}...`,
          }),
        });

        if (!sessionResponse.ok) {
          const error = await sessionResponse.json().catch(() => null);
          throw new Error(error?.error || '세션 토큰을 발급하지 못했습니다.');
        }

        const sessionData = (await sessionResponse.json()) as { sessionToken?: string };
        if (!sessionData.sessionToken) {
          throw new Error('세션 토큰이 비어 있습니다.');
        }

        if (isMounted) {
          setSessionToken(sessionData.sessionToken || null);
          if (selectedChannelUrl) {
            setChannelUrl(selectedChannelUrl);
            return;
          }
        }

        const channelResponse = await fetch('/api/sendbird/group-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerId: buyerWalletAddress,
            sellerId: sellerWalletAddress,
          }),
        });

        if (!channelResponse.ok) {
          const error = await channelResponse.json().catch(() => null);
          throw new Error(error?.error || '채팅 채널을 생성하지 못했습니다.');
        }

        const channelData = (await channelResponse.json()) as { channelUrl?: string };

        if (isMounted) {
          setChannelUrl(channelData.channelUrl || null);
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : '채팅을 불러오지 못했습니다.';
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchChat();

    return () => {
      isMounted = false;
    };
  }, [buyerWalletAddress, sellerWalletAddress, selectedChannelUrl]);

  useEffect(() => {
    if (selectedChannelUrl) {
      setChannelUrl(selectedChannelUrl);
      setErrorMessage(null);
    }
  }, [selectedChannelUrl]);

  useEffect(() => {
    if (!channelUrl || !shouldShowChat) {
      return;
    }
    const contextKey = promotionContext ? JSON.stringify(promotionContext) : '';
    if (!contextKey) {
      return;
    }
    const key = `${channelUrl}:${contextKey}:${shouldShowChat}`;
    if (lastPromotionKeyRef.current === key) {
      return;
    }

    const sendPromotion = async () => {
      try {
        const aiResponse = await fetch('/api/user/generateChatPromotion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promotionContext),
        });
        const aiData = await aiResponse.json().catch(() => ({}));
        if (!aiResponse.ok || !aiData?.text) {
          return;
        }

        const response = await fetch('/api/sendbird/welcome-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelUrl,
            senderId: sellerWalletAddress,
            message: aiData.text,
          }),
        });
        if (response.ok) {
          lastPromotionKeyRef.current = key;
        }
      } catch {
        // ignore promotion message errors
      }
    };

    sendPromotion();
  }, [channelUrl, promotionContext, sellerWalletAddress, shouldShowChat]);

  if (!shouldShowChat) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg"
        >
          채팅 열기
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        isInline
          ? 'w-full rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl'
          : 'fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl'
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">구매자 ↔ 판매자 채팅</h3>
          <p className="text-sm text-slate-600">실시간 대화를 통해 거래를 진행하세요.</p>
        </div>
        {!isInline && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isLoading && <span className="text-xs font-semibold text-slate-500">연결 중...</span>}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              닫기
            </button>
          </div>
        )}
        {isInline && isLoading && (
          <span className="text-xs font-semibold text-slate-500">연결 중...</span>
        )}
      </div>

      {!buyerWalletAddress ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          지갑을 연결하면 판매자와 실시간 채팅을 시작할 수 있습니다.
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : (
        <div className="h-[520px] overflow-hidden rounded-xl border border-slate-200">
          {sessionToken && channelUrl ? (
            <SendbirdProvider
              appId={SENDBIRD_APP_ID}
              userId={buyerWalletAddress}
              accessToken={sessionToken}
              theme="light"
            >
              <AutoBuyerReplyListener
                channelUrl={channelUrl}
                buyerWalletAddress={buyerWalletAddress}
                sellerWalletAddress={sellerWalletAddress}
                context={buyerAutoReplyContext}
                enabled={shouldShowChat}
              />
              <AutoSellerReplyListener
                channelUrl={channelUrl}
                buyerWalletAddress={buyerWalletAddress}
                sellerWalletAddress={sellerWalletAddress}
                context={sellerAutoReplyContext}
                enabled={shouldShowChat}
              />
              <GroupChannel channelUrl={channelUrl} />
            </SendbirdProvider>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              채팅을 준비 중입니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SellerChatList = ({
  ownerWalletAddress,
  items,
  loading,
  errorMessage,
  selectedChannelUrl,
  onSelectChannel,
}: {
  ownerWalletAddress: string;
  items: SellerChatItem[];
  loading: boolean;
  errorMessage: string | null;
  selectedChannelUrl?: string | null;
  onSelectChannel: (channelUrl: string) => void;
}) => {
  const formatWallet = (value: string) =>
    value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;

  const formatTime = (value?: number) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">판매자 대화목록</h4>
          <p className="text-xs text-slate-500">
            {ownerWalletAddress ? formatWallet(ownerWalletAddress) : '판매자 확인 중'}
          </p>
        </div>
        {loading && <span className="text-xs text-slate-500">불러오는 중...</span>}
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {errorMessage}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          아직 대화가 없습니다.
        </div>
      ) : (
        <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {items.map((item) => {
            const otherMember = item.members[0];
            const isActive = selectedChannelUrl === item.channelUrl;
            return (
              <div
                key={item.channelUrl}
                
                //onClick={() => onSelectChannel(item.channelUrl)}

                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ${
                  isActive
                    ? 'border-emerald-300 bg-emerald-50/80 shadow-[0_12px_30px_-24px_rgba(16,185,129,0.7)]'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">
                    {otherMember?.nickname || formatWallet(otherMember?.userId || '상대방')}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {item.lastMessage || '최근 메시지가 없습니다.'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400">{formatTime(item.updatedAt)}</span>
                  {item.unreadMessageCount ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.unreadMessageCount}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
