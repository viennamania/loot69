'use client';

import { useState, useEffect, use, act } from "react";

import Image from "next/image";



// open modal

///import Modal from '@/components/modal';

import ModalUser from '@/components/modal-user';

import { useRouter }from "next//navigation";


import { toast } from 'react-hot-toast';

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
  //ConnectButton,

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



const walletAuthOptions = ["google", "email"];



export default function Index({ params }: any) {

  const searchParams = useSearchParams();
  const { wallet, wallets } = useClientWallets({ authOptions: walletAuthOptions });
 
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
    setLimitValue(Number(limit));
  }, [searchParams]);



  const [pageValue, setPageValue] = useState(1);
  useEffect(() => {
    const page = searchParams.get('page') || 1;
    setPageValue(Number(page));
  }, [searchParams]);



  const today = new Date();
  today.setHours(today.getHours() + 9); // Adjust for Korean timezone (UTC+9)
  const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  // search form date to date
  const [searchFromDate, setSearchFromDate] = useState(formattedDate);
  const [searchToDate, setSearchToDate] = useState(formattedDate);





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
    setCancellingBuyOrders(
      cancellingBuyOrders.map((item, idx) => idx === index ? true : item)
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
        setBuyOrders(
          buyOrders.filter((item, idx) => idx !== index)
        );
      } else {
        toast.error('Failed to cancel buy order');
      }
    })
    .finally(() => {
      setCancellingBuyOrders(
        cancellingBuyOrders.map((item, idx) => idx === index ? false : item)
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
              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,

              searchStoreName: searchStoreName,

              fromDate: searchFromDate,
              toDate: searchToDate,
            }

        ),
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






  // check table view or card view
  const [tableView, setTableView] = useState(true);


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
  */

  useEffect(() => {
    if (totalNumberOfAudioOnBuyOrders > 0 && loadingTotalNumberOfBuyOrders === false) {
      const audio = new Audio('/notification.wav');
      audio.play();
    }
  }, [totalNumberOfAudioOnBuyOrders, loadingTotalNumberOfBuyOrders]);








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




  // /api/user/getAllSellersForBalance
  const [sellersBalance, setSellersBalance] = useState([] as any[]);
  const fetchSellersBalance = async () => {
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
      const finalSortedSellers = sortedSellers.sort((a: any, b: any) => {
        if (a.walletAddress === address) return -1;
        if (b.walletAddress === address) return 1;
        return b.totalPaymentConfirmedUsdtAmount - a.totalPaymentConfirmedUsdtAmount;
      });


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
      

      setSellersBalance(finalSortedSellers);

    } else {
      console.error('Error fetching sellers balance');
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
  const [buyAmountInputs, setBuyAmountInputs] = useState<number[]>([]);

  const [buyOrderingPrivateSaleArray, setBuyOrderingPrivateSaleArray] = useState<boolean[]>([]);

  const buyOrderPrivateSale = (
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

    if (!buyAmountInputs[index] || buyAmountInputs[index] <= 0) {
      toast.error('구매 금액을 입력해주세요.');
      return;
    }

    // if buyAmountInputs[index] is more than currentUsdtBalanceArray[index], show error
    if (buyAmountInputs[index] > currentUsdtBalanceArray[index]) {
      toast.error('구매 금액이 판매자의 잔여 USDT 잔고를 초과합니다.');
      return;
    }

    setBuyOrderingPrivateSaleArray((prev) => {
      const newArray = [...prev];
      newArray[index] = true;
      return newArray;
    });
    fetch('/api/order/buyOrderPrivateSale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        buyerWalletAddress: address,
        sellerWalletAddress: sellerWalletAddress,
        usdtAmount: buyAmountInputs[index],
      }),
    })
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
      <main className="p-4 pb-10 min-h-[100vh] flex items-start justify-center container max-w-screen-2xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="py-0 w-full flex flex-col items-center justify-center gap-4">

          <Image
            src="/banner-loading.gif"
            alt="Loading"
            width={200}
            height={200}
          />

          <div className="text-lg text-slate-400">회원 정보를 불러오는 중</div>
        </div>
      </main>
    );
  }





  return (

    <main className="p-4 pb-10 min-h-[100vh] flex items-start justify-center container max-w-screen-2xl mx-auto bg-slate-950">

      <AutoConnect
          client={client}
          wallets={[wallet]}
      />





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


        <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-2 bg-slate-800/90 border border-slate-700 p-2 rounded-lg mb-4 shadow-xl">
            
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <button
              onClick={() => router.push('/' + params.lang + '/administration')}
              className="flex items-center justify-center gap-2
              rounded-lg p-2
              hover:bg-slate-700/50
              hover:cursor-pointer
              hover:scale-105
              transition-transform duration-200 ease-in-out"

            >
              <Image
                src="/logo.png"
                alt="logo"
                width={100}
                height={100}
                className="h-10 w-10 rounded-full"
              />
            </button>
          </div>


          {address && !loadingUser && (


            <div className="w-full flex flex-col xl:flex-row items-center justify-end gap-2">
              
              <button
                onClick={() => {
                  router.push('/' + params.lang + '/administration/profile-settings');
                }}
                className="flex bg-[#0047ab] text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-[#0047ab]/80"
              >
                <div className="flex flex-row items-center justify-center gap-2">
                  {isAdmin && (
                    <div className="flex flex-row items-center justify-center gap-2">
                      <Image
                        src="/icon-admin.png"
                        alt="Admin"
                        width={20}
                        height={20}
                        className="rounded-lg w-5 h-5"
                      />
                      <span className="text-sm text-slate-100">
                        센터 관리자
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-slate-100">
                    {user?.nickname || "프로필"}
                  </span>

                </div>
              </button>

              {/* sellerSettings */}
              {user?.seller && (
                <button
                  onClick={() => {
                    router.push('/' + params.lang + '/p2p/seller-settings');
                  }}
                  className="flex bg-slate-700 text-sm text-slate-100 px-4 py-2 rounded-lg hover:bg-slate-600 border border-slate-600 shadow-md"
                >
                  <div className="flex flex-row items-center justify-center gap-2">
                    <Image
                      src="/icon-seller.png"
                      alt="Seller"
                      width={20}
                      height={20}
                      className="rounded-lg w-5 h-5"
                    />
                    <span className="text-sm text-slate-100">
                      판매자 설정
                    </span>
                  </div>
                </button>
              )}

              {/* opnew new window for admin dashboard */}
              {/* https://loot.menu/ko/administration/buyorder */}
              {isAdmin && (
                <button
                  onClick={() => {
                    window.open('https://loot.menu/' + params.lang + '/administration/buyorder', '_blank');
                  }}
                  className="flex bg-slate-700 text-sm text-slate-100 px-4 py-2 rounded-lg hover:bg-slate-600 border border-slate-600 shadow-md"
                >
                  <div className="flex flex-row items-center justify-center gap-2">
                    <Image
                      src="/icon-dashboard.png"
                      alt="Dashboard"
                      width={20}
                      height={20}
                      className="rounded-lg w-5 h-5"
                    />
                    <span className="text-sm text-slate-100">
                      관리자 대시보드
                    </span>
                  </div>
                </button>
              )}

            </div>

          )}


          {/*!address && (
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

          )*/}




        </div>



        <div className="flex flex-col items-start justify-center gap-2 mt-4">


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
                          className="text-lg text-zinc-600 underline"
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
          border-t border-b border-zinc-300
          py-4
          ">

            <div className="w-full flex flex-col xl:flex-row items-center justify-start gap-2">
              <Image
                src="/icon-today.png"
                alt="Today"
                width={50}
                height={50}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex flex-col gap-2 items-center">
                {/* background color is 파스텔 오렌지  */}
                <div className="
                  bg-orange-900/40
                  px-2 py-1 rounded-full
                  text-sm font-semibold text-orange-300
                  border border-orange-700
                "
                >
                  {/* dot before */}
                  <div className="inline-block w-2 h-2 bg-orange-300 rounded-full mr-2"></div>
                  <span className="align-middle">
                    거래수(건)
                  </span>
                </div>
                <div className="text-4xl font-semibold text-slate-200">
                  {
                    //buyOrderStats.totalCount?.toLocaleString()
                    animatedTotalCount
                  }
                </div>
              </div>

              <div className="flex flex-col xl:flex-row items-center justify-center gap-2">

                <div className="flex flex-col gap-2 items-center">
                  <div className="
                    bg-slate-700/70
                    px-2 py-1 rounded-full
                    text-sm font-semibold text-slate-200
                    border border-slate-600
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
                    bg-slate-700/70
                    px-2 py-1 rounded-full
                    text-sm font-semibold text-slate-200
                    border border-slate-600
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
            <table className="w-full xl:table-auto border-collapse border border-zinc-300
            bg-white/80
            p-4 rounded-lg shadow-md
            backdrop-blur-md
            ">
              <thead>
                <tr className="bg-zinc-200 text-zinc-700 text-sm font-semibold">
                  <th className="border border-zinc-300 px-2 py-1">거래ID</th>
                  <th className="border border-zinc-300 px-2 py-1">구래량(USDT)</th>
                  <th className="border border-zinc-300 px-2 py-1">거래금액(원)</th>
                  <th className="border border-zinc-300 px-2 py-1">생성일시</th>
                  <th className="border border-zinc-300 px-2 py-1">상태</th>
                </tr>
              </thead>
              <tbody>
                {buyOrders.filter((order) =>
                  order.status === 'ordered' ||
                  order.status === 'accepted' ||
                  order.status === 'paymentRequested'
                ).map((order, index) => (
                  <tr key={index} className="text-zinc-600 text-sm hover:bg-zinc-100
                  transition-colors duration-150 ease-in-out
                  ">
                    <td className="border border-zinc-300 px-2 py-1 text-center">{order.tradeId}</td>
                    <td className="border border-zinc-300 px-2 py-1 text-center"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {order.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                    <td className="border border-zinc-300 px-2 py-1 text-center"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {order.krwAmount.toLocaleString()}
                    </td>
                    <td className="border border-zinc-300 px-2 py-1 text-center">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-zinc-300 px-2 py-1 text-center capitalize">
                      {order.status === 'ordered' && '주문접수'}
                      {order.status === 'accepted' && '결제대기'}
                      {order.status === 'paymentRequested' && '결제요청중'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            */}




            <div className="flex flex-col items-end justify-center gap-4">

              {/* 구매주문 목록 */}
              <div className="
                w-full
                flex flex-row items-center justify-end gap-2
                bg-slate-900/80
                p-2 rounded-lg shadow-xl
                backdrop-blur-md
                border border-slate-700
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
                    bg-slate-800/90 border border-slate-700
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
                        
                        <div className="w-full flex flex-col items-start justify-center gap-2">
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
                            <span className="text-sm text-slate-400">
                              {
                                (new Date().getTime() - new Date(order?.createdAt).getTime()) > 0
                                ? `${Math.floor((new Date().getTime() - new Date(order?.createdAt).getTime()) / 60000)}분 경과`
                                : ''
                              }
                            </span>
                          )}

                          {order.status === 'paymentRequested' && (
                            <span className="text-sm text-slate-400">
                              {
                                (new Date().getTime() - new Date(order?.paymentRequestedAt).getTime()) > 0
                                ? `${Math.floor((new Date().getTime() - new Date(order?.paymentRequestedAt).getTime()) / 60000)}분 경과`
                                : ''
                              }
                            </span>
                          )}


                        </div>

                        <div className="w-full flex flex-col items-end justify-center gap-1">
                          <span className="text-sm text-slate-200 font-semibold">
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
                          <span className="text-xs text-slate-300 font-semibold"
                            style={{ fontFamily: 'monospace' }}>
                            {order?.rate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 원/USDT
                          </span>
                        </div>

                      </div>

                    </div>

                  ))}

                  {processingBuyOrders.length > 3 && (
                    <span className="text-4xl text-slate-300 font-semibold">
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

          
          
          <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-4
          border-t border-b border-zinc-300
          py-4
          ">
            <div className="flex flex-row items-center justify-start gap-2">
              <Image
                src="/icon-market.png"
                alt="Market"
                width={50}
                height={50}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <span className="text-lg font-bold text-slate-200">
                실시간 환율 정보
              </span>
              <Image
                src="/icon-live.gif"
                alt="Live"
                width={30}
                height={30}
                className="w-8 h-8 object-cover"
              />
            </div>

            <div className="w-full flex flex-col xl:flex-row items-center justify-end gap-4"> 

              {/* animatedUpbitUsdtToKrwRate */}
              {/* logo-upbit.jpg */}
              {/* upbit usdt to krw rate display */}
              {/* large font size */}
              {/* upbitUsdtToKrwRateTimestamp - convert to local time */}
              <div className="w-64   
                flex flex-row items-center justify-between gap-2 p-2">
                <Image
                  src="/icon-market-upbit.png"
                  alt="Upbit"
                  width={50}
                  height={50}
                  className="w-12 h-12 object-cover"
                />
                
                <div className="w-full flex flex-col items-end justify-center">

                  <span className="text-2xl text-slate-200 font-semibold"
                    style={{ fontFamily: 'monospace' }}>
                      {animatedUpbitUsdtToKrwRate && animatedUpbitUsdtToKrwRate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>

                  <div className="flex flex-row items-center justify-end gap-1">
                    <span
                      className={`text-sm font-semibold
                      ${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-red-400' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-blue-400' :
                        'text-slate-400'
                      }
                      `}
                      style={{ fontFamily: 'monospace' }}
                      >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `▲ ${upbitUsdtToKrwRateChangePrice}` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `▼ ${upbitUsdtToKrwRateChangePrice}` :
                        `- 0`
                      }
                    </span>
                    {/* upbitUsdtToKrwRateChangePriceRate => percentage with 4 decimal places */}
                    <span className={`text-sm font-semibold
                      ${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-red-400' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-blue-400' :
                        'text-slate-400'
                      }
                      `}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        `(0.0000%)`
                      }
                    </span>
                    
                  </div>
                  <span className="text-sm text-slate-400"
                    style={{ fontFamily: 'monospace' }}>
                    {
                      //upbitUsdtToKrwRateTimestamp ? new Date(upbitUsdtToKrwRateTimestamp).toLocaleString() : ''
                    
                      TradeDateKst && TradeTimeKst ? `${TradeTimeKst.slice(0,2)}:${TradeTimeKst.slice(2,4)}:${TradeTimeKst.slice(4,6)}` : ''
                    }
                  </span>
                </div>

              </div>

              {/* divider line for row or column for xl */}
              <div className="w-full xl:h-16 h-full xl:w-0 border border-zinc-300"></div>

              {/* bithumb usdt to krw rate display */}
              <div className="w-64
                flex flex-row items-center justify-between gap-2 p-2">
                <Image
                  src="/icon-market-bithumb.png"
                  alt="Bithumb"
                  width={50}
                  height={50}
                  className="w-12 h-12 object-cover"
                />
                <div className="w-full flex flex-col items-end justify-center">

                  <span className="text-2xl text-slate-200 font-semibold"
                    style={{ fontFamily: 'monospace' }}>
                      {animatedBithumbUsdtToKrwRate && animatedBithumbUsdtToKrwRate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>

                  <div className="flex flex-row items-center justify-end gap-1">
                    <span className={`text-sm font-semibold
                      ${
                        bithumbUsdtToKrwRateChange === 'RISE' ? 'text-red-400' :
                        bithumbUsdtToKrwRateChange === 'FALL' ? 'text-blue-400' :
                        'text-slate-400'
                      }
                      `}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        bithumbUsdtToKrwRateChange === 'RISE' ? `▲ ${bithumbUsdtToKrwRateChangePrice}` :
                        bithumbUsdtToKrwRateChange === 'FALL' ? `▼ ${bithumbUsdtToKrwRateChangePrice}` :
                        `- 0`
                      }
                    </span>
                    {/* bithumbUsdtToKrwRateChangePriceRate => percentage with 4 decimal places */}
                    <span className={`text-sm font-semibold
                      ${
                        bithumbUsdtToKrwRateChange === 'RISE' ? 'text-red-400' :
                        bithumbUsdtToKrwRateChange === 'FALL' ? 'text-blue-400' :
                        'text-slate-400'
                      }
                      `}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        bithumbUsdtToKrwRateChange === 'RISE' ? `(${(bithumbUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        bithumbUsdtToKrwRateChange === 'FALL' ? `(${(bithumbUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        `(0.0000%)`
                      }
                    </span>
                    
                  </div>
                  <span className="text-sm text-slate-400"
                    style={{ fontFamily: 'monospace' }}>
                    {
                      //bithumbUsdtToKrwRateTimestamp ? new Date(bithumbUsdtToKrwRateTimestamp).toLocaleString() : ''
                    
                      TradeDateKst && TradeTimeKst ? `${TradeTimeKst.slice(0,2)}:${TradeTimeKst.slice(2,4)}:${TradeTimeKst.slice(4,6)}` : ''
                    }
                  </span>
                </div>
              </div>

              {/* divider line for row or column for xl */}
              <div className="w-full xl:h-16 h-full xl:w-0 border border-zinc-300"></div>

              <div className="w-64
                flex flex-row items-center justify-between gap-2 p-2">
                <Image
                  src="/icon-market-korbit.png"
                  alt="Korbit"
                  width={50}
                  height={50}
                  className="w-12 h-12 object-cover"
                />
                <div className="w-full flex flex-col items-end justify-center">

                  <span className="text-2xl text-slate-200 font-semibold"
                    style={{ fontFamily: 'monospace' }}>
                      {animatedUpbitUsdtToKrwRate && animatedUpbitUsdtToKrwRate.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>

                  <div className="flex flex-row items-center justify-end gap-1">
                    <span className={`text-sm font-semibold
                      ${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-red-400' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-blue-400' :
                        'text-slate-400'
                      }
                      `}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `▲ ${upbitUsdtToKrwRateChangePrice}` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `▼ ${upbitUsdtToKrwRateChangePrice}` :
                        `- 0`
                      }
                    </span>
                    {/* upbitUsdtToKrwRateChangePriceRate => percentage with 4 decimal places */}
                    <span className={`text-sm font-semibold
                      ${
                        upbitUsdtToKrwRateChange === 'RISE' ? 'text-red-400' :
                        upbitUsdtToKrwRateChange === 'FALL' ? 'text-blue-400' :
                        'text-slate-400'
                      }
                      `}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {
                        upbitUsdtToKrwRateChange === 'RISE' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        upbitUsdtToKrwRateChange === 'FALL' ? `(${(upbitUsdtToKrwRateChangeRate * 100).toFixed(4)}%)` :
                        `(0.0000%)`
                      }
                    </span>
                    
                  </div>
                  <span className="text-sm text-zinc-500"
                    style={{ fontFamily: 'monospace' }}>
                    {
                      //upbitUsdtToKrwRateTimestamp ? new Date(upbitUsdtToKrwRateTimestamp).toLocaleString() : ''
                    
                      TradeDateKst && TradeTimeKst ? `${TradeTimeKst.slice(0,2)}:${TradeTimeKst.slice(2,4)}:${TradeTimeKst.slice(4,6)}` : ''
                    }
                  </span>
                </div>

              </div>


            </div>

          </div>
          
          
          <div className="w-full flex flex-col items-start justify-center gap-2
          border-t border-b border-zinc-300
          py-4
          ">

            {/* title - 판매주문 */}
            <div className="flex flex-row items-center justify-start gap-2">
              <Image
                src="/icon-sale.png"
                alt="Sale"
                width={50}
                height={50}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <h2 className="text-lg font-bold text-slate-200">
                판매 주문 현황
              </h2>
            </div>

            {sellersBalance.length > 0 && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

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
                    bg-slate-800/90
                    p-4 rounded-lg shadow-xl
                    backdrop-blur-md
                    border border-slate-700
                    
                    ${(seller.seller.buyOrder?.status === 'ordered' || seller.seller.buyOrder?.status === 'paymentRequested') ?
                      'ring-4 ring-red-500/50 animate-pulse' : ''
                    }
                    
                    ${seller.currentUsdtBalanceChanged
                    ? 'ring-2 ring-emerald-500/70 animate-pulse' : ''
                    }

                    ${seller.walletAddress === address
                    ? 'ring-4 ring-amber-400/70' : ''
                    }

                    `}
                  >

                    {/* seller.nickanme position fixed top left corner ribbon style */}
                    <div className="
                    absolute top-0 left-0
                    flex flex-row items-center justify-start
                    h-10  
                    ">
                      <div className="h-full
                      flex flex-row items-center justify-between gap-2
                      bg-slate-700 text-slate-100 px-2 py-1 rounded-br-lg rounded-tl-lg shadow-xl border border-slate-600
                      ">
                        <div className="flex flex-row items-center justify-center gap-1">
                          <Image
                            src="/icon-seller.png"
                            alt="Seller"
                            width={20}
                            height={20}
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                          <span className="text-sm font-semibold">
                            {seller.nickname}
                          </span>
                        </div>

                        {/* whe  seller.seller?.totalPaymentConfirmedUsdtAmount > 10, show a badge */}
                        {seller.seller?.totalPaymentConfirmedUsdtAmount > 20 && (
                          <Image
                            src="/icon-best-seller.png"
                            alt="Best Seller"
                            width={30}
                            height={30}
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                        )}
                      </div>

                      {seller.walletAddress === address && (
                        <div
                          className="h-full
                          flex flex-row items-center justify-center gap-2
                          bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-xl border border-slate-500
                          ">
                          <span className="text-sm font-semibold">
                            나의 판매자계정
                          </span>

                          {/*
                        
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
                          */}

                        </div>
                      )}


                    </div>



                    {/* seller.seller?.usdtToKrwRate top right corner ribbon style */}
                    <div className="absolute top-0 right-0
                    flex flex-col items-center justify-center gap-1
                    bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-bl-lg rounded-tr-lg
                    shadow-xl
                    ">
                                          
                      {seller.seller?.usdtToKrwRate && (

                        <div className="flex flex-col items-start justify-center gap-1">

                          <div className="w-full flex flex-row items-center justify-start gap-2">

                            <div className="w-full flex flex-row items-center justify-between gap-2">
                              <span className="text-sm text-slate-300">
                                판매<br/>금액
                              </span>

                              <span className="text-2xl font-semibold text-amber-400"
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
                                        
                                        <div className="flex flex-row items-center justify-center gap-2">

                                          <div className="flex flex-col items-center justify-center gap-1
                                          border border-slate-600 bg-slate-700/50 rounded-lg px-2 py-1
                                          ">
                                            <span className="text-xs text-slate-300">
                                              지정가
                                            </span>
                                          </div>          
                                          
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
                                        </div>
                                      )}

                                      {/*
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
                                      */}
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center gap-1
                                    border border-slate-600 bg-slate-700/50 rounded-lg px-2 py-1
                                    ">
                                      <span className="text-xs text-slate-300">
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

                    </div>



                    {/* if seller.walletAddress is equal to address, fixed position notice for my seller account */}
                    {/*

                    {seller.walletAddress === address && (
                      <div
                        // top right corner ribbon style
                        className="absolute top-0 right-0
                        flex flex-col items-center justify-center
                        bg-yellow-400 text-zinc-800 px-2 py-1 rounded-bl-lg rounded-tr-lg
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
                      className={`mt-8
                      w-full
                      flex flex-col items-start justify-center gap-2
                      p-2
                      border border-zinc-300 rounded-lg
                      
                      ${seller.currentUsdtBalanceChanged ? 'bg-green-100/70 animate-pulse' : ''}

                      `}
                      */

                      // 배경색은 금융 무게감 있는 어두운 색상
                      className={`mt-8
                      w-full
                      flex flex-col items-start justify-center gap-2
                      
                      bg-slate-900/80 p-4 rounded-lg border border-slate-700 shadow-xl backdrop-blur-md
                      `}

                    >
                    



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
                                    border border-zinc-300 rounded-lg px-2 py-1
                                    ">
                                      <span className="text-xs text-zinc-600">
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
                      
                      <div className="w-full flex flex-col items-start justify-center gap-2">

              
                        <div className="w-full flex flex-col items-start justify-center gap-2">

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


                          <div className="w-full flex flex-row items-center justify-between gap-2">    

                            <div className="flex flex-row items-center justify-center gap-2">
                              <Image
                                src="/icon-escrow-wallet.webp"
                                alt="Escrow Wallet"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                              <button
                                className="text-sm text-slate-300 underline hover:text-slate-200"
                                onClick={() => {
                                  navigator.clipboard.writeText(seller.seller.escrowWalletAddress);
                                  toast.success(Copied_Wallet_Address);
                                } }
                              >
                                {
                                  seller.seller.escrowWalletAddress.substring(0, 6)}...{seller.seller.escrowWalletAddress.substring(seller.seller.escrowWalletAddress.length - 4)
                                }
                              </button>
                            </div>

                            {/* https://polygonscan.com/token/0xc2132d05d31c914a87c6611c10748aeb04b58e8f?a=0x07385f5149Eb1dE0D17739fBc395B560cb7fFE44 */}
                            {/* open new window to polygonscan escrow wallet address */}
                            {/* logo-polygon.png */}
                            <button
                              className="flex items-center justify-center gap-2
                              rounded-lg p-1
                              hover:bg-black/10
                              hover:cursor-pointer
                              hover:scale-105
                              transition-transform duration-200 ease-in-out"
                              onClick={() => {
                                window.open(`https://polygonscan.com/token/0xc2132d05d31c914a87c6611c10748aeb04b58e8f?a=${seller.seller.escrowWalletAddress}`, '_blank');
                              }}
                            >
                              <Image
                                src="/logo-polygon.png"
                                alt="Polygon"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                            </button>

                          </div>

                          <div className="w-full flex flex-col items-start justify-center gap-1">

                            <div className="w-full flex flex-col items-center justify-center gap-2">

                              <div className="w-full flex flex-row items-center justify-right gap-2">
                                <Image
                                  src="/icon-tether.png"
                                  alt="USDT"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5"
                                />
                                <span className="text-4xl xl:text-2xl text-emerald-300 font-semibold"
                                  style={{ fontFamily: 'monospace' }}>
                                  {
                                    //Number(seller.currentUsdtBalance).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    currentUsdtBalanceArray[index]?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

                                  }
                                </span>
                              </div>

                              {seller.walletAddress === address && (
                                <div className="w-28 flex flex-col items-center justify-center gap-1">
                                  {/* 충전금액 입력 */}
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="충전금액"
                                    className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-1 text-xs text-center
                                    focus:outline-none focus:ring-2 focus:ring-blue-500
                                    "
                                  />

                                  {/* 충전하기 버튼 */}
                                  <button
                                    onClick={() => {
                                      /*
                                      const inputElement = document.querySelectorAll('input')[index];
                                      const amount = Number(inputElement.value);
                                      if (amount >= 1) {
                                        router.push('/' + params.lang + '/seller/deposit-usdt?amount=' + amount);
                                      } else {
                                        toast.error('충전금액은 1 USDT 이상이어야 합니다.');
                                      }
                                      */
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

                            </div>

                            {/* if balance is less than 10 USDT, show warning */}
                            {currentUsdtBalanceArray[index] < 10 ? (
                              <div className="text-red-400 text-sm font-medium">
                                {/*Warning: Low escrow balance may result in no order assignments. Please recharge USDT. */}
                                경고: 에스크로 잔액이 부족하면 주문 할당이 이루어지지 않을 수 있습니다. USDT를 충전해주세요.
                              </div>
                            ) : (
                              <>
                              {seller.walletAddress === address && (
                                <div className="text-emerald-400 text-sm mt-1 font-medium">
                                  {/*If you deposit more USDT, more orders will be assigned. */}
                                  충전된 USDT가 많을수록 더 많은 주문이 할당됩니다.
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
                              <span className="text-sm text-slate-200 font-semibold">
                                {seller.seller?.bankInfo?.bankName}
                              </span>
                              <span className="text-sm text-slate-300">
                                {seller.seller?.bankInfo?.accountNumber.length > 5
                                  ? seller.seller?.bankInfo?.accountNumber.substring(0, 5) +'****'
                                  : seller.seller?.bankInfo?.accountNumber
                                }
                              </span>
                              <span className="text-sm font-semibold text-slate-200">
                                {seller.seller?.bankInfo?.accountHolder.length > 2
                                  ? seller.seller?.bankInfo?.accountHolder.substring(0, 1) +'**'
                                  : seller.seller?.bankInfo?.accountHolder
                                }
                              </span>
                            </div>


                            {/* seller?.autoProcessDeposit */}
                            {/* toggleAutoProcessDeposit */}
                            <div className="flex flex-col items-start justify-center ml-4 gap-1">

                              <span className="w-full flex text-sm font-semibold text-slate-200">
                                자동입금처리
                              </span>
                              {seller.seller?.autoProcessDeposit ? (
                                <div className="w-full flex flex-col items-center justify-center">
                                  <div className="flex text-xs text-emerald-300 font-semibold
                                  bg-emerald-900/30 border border-emerald-700 rounded-lg px-2 py-1 text-center
                                  ">
                                    활성화 상태
                                  </div>
                                  {/* 설명 */}
                                  <div className="text-xs text-slate-400 mt-1">
                                    구매자가 입금을 하면 자동으로 입금확인이 처리됩니다.
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full flex flex-col items-center justify-center">
                                  <div className="flex text-xs text-red-300 font-semibold
                                  bg-red-900/30 border border-red-700 rounded-lg px-2 py-1 text-center
                                  ">
                                    비활성화 상태
                                  </div>
                                  {/* 설명 */}
                                  <div className="text-xs text-slate-400 mt-1">
                                    구매자가 입금을 하면 판매자가 수동으로 입금확인을 합니다.
                                  </div>
                                </div>
                              )}

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
                            </div>

                          </div>
                        )}

                      </div>

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
                      mt-10
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
                              width={50}
                              height={50}
                              className="w-16 h-16 object-contain"
                            />
                            {/* TID */}
                            <span className="text-sm">
                              TID: #<button
                                  className="text-sm text-zinc-600 underline"
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
                            border-t border-zinc-300 pt-2
                            ">
                            {/* TID */}
                            {/*
                            <div className="flex flex-row items-center justify-start gap-2">

                              <span className="text-sm">
                                TID: #<button
                                    className="text-sm text-zinc-600 underline"
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
                                  {/* 입금자명 */}
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

                              {/* if seller.walletAddress is equal to address and autoProcessDeposit is false, show 입금완료하기 button */}
                              {
                              seller.walletAddress === address && !seller.seller?.autoProcessDeposit && (
                      
                                <button
                  
                                  disabled={confirmingPayment[index]}
                                  
                                  className={`
                                    ${confirmingPayment[index]
                                    ? 'text-slate-400 cursor-not-allowed bg-slate-600'
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
                              )}

                            </div>


                            {/* noew - paymentRequestedAt 경과 */}
                            {/* time ago from paymentRequestedAt to now */}
                            <div className="w-full flex flex-row items-center justify-end">
                              <span className="text-sm text-slate-400">
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
                            border-t border-slate-600 pt-2
                            ">
                            {/*
                            <span className="text-sm">
                              TID: #<button
                                  className="text-sm text-slate-400 underline"
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
                                width={50}
                                height={50}
                                className="w-16 h-16 object-contain"
                              />
                              <span className="text-sm text-slate-300">
                                TID: #<button
                                    className="text-sm text-slate-400 underline"
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

                            {/* USDT 전송이 환료된후에 판매 대기중으로 변경됩니다. */}
                            <span className="text-sm text-slate-400">
                              USDT 전송이 완료된후에 판매 대기중으로 변경됩니다.
                            </span>

                          </div>

                        </div>

                      ) : (
                        <div className="w-full flex flex-col items-start justify-center gap-2">
                          
                          {/* if balance is greater than or equal to 10 USDT, show 판매 대기중 */}
                          {currentUsdtBalanceArray[index] >= 10 ? (

                            <div className="w-full flex flex-col items-start justify-center gap-2">
                              <div className="w-full flex flex-row items-center justify-start gap-2">
                                <Image
                                  src="/icon-sale.png"
                                  alt="On Sale"
                                  width={50}
                                  height={50}
                                  className="w-16 h-16 object-contain"
                                />
                                {/* 판매 홍보용 문구 */}
                                {seller.seller?.promotionText ? (
                                <span className="text-sm font-semibold text-slate-200">
                                  {seller.seller?.promotionText}
                                </span>
                                ) : (
                                <span className="text-xs font-semibold text-slate-400">
                                  홍보 문구가 설정되지 않았습니다.
                                </span>
                                )}
                                
                              </div>

                              {/* 입력창 */}
                              {/* 수정하기 버튼 */}
                              {seller.walletAddress === address && (
                                <div className="w-full flex flex-col items-start justify-center gap-1">
                                  <input
                                    type="text"
                                    className="w-full border border-slate-600 bg-slate-700 text-slate-200 rounded-lg p-2 text-xs
                                    placeholder:text-slate-400
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
                                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
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

                            </div>

                          ) : (
                            <div className="flex flex-row items-center gap-2
                            bg-red-500 text-white px-3 py-1 rounded-lg">

                              {/* /icon-sale.png gray scale */}
                              <Image
                                src="/icon-sale.png"
                                alt="Off Sale"
                                width={50}
                                height={50}
                                className="w-16 h-16 object-contain grayscale"
                              />
                              <span className="text-xs font-semibold">
                                에스크로 잔액 부족
                              </span>
                            
                            </div>
                          )}

                          {/* 최근 거래내역 */}
                          {/* seller?.buyOrder */}
                          {seller.seller?.buyOrder && (
                            <div className="w-full flex flex-col items-start justify-center gap-1
                            border-t border-slate-600 pt-2
                            ">
                              <span className="text-sm font-semibold text-slate-200">
                                최근 거래내역
                              </span>
                              <div className="w-full flex flex-row items-center justify-start gap-2">
                                <span className="text-sm text-slate-400">
                                  상태:
                                </span>
                                <span className="text-sm font-semibold text-slate-200">
                                  {seller.seller?.buyOrder?.status === 'completed' ? '거래완료' :
                                    seller.seller?.buyOrder?.status === 'paymentConfirmed' ? 'USDT전송완료' :
                                    seller.seller?.buyOrder?.status === 'paymentRequested' ? '입금확인중' :
                                    seller.seller?.buyOrder?.status === 'ordered' ? '입금대기중' :
                                    '알수없음'
                                  }
                                </span>
                              </div>
                              <div className="w-full flex flex-row items-center justify-start gap-2">
                                <span className="text-sm text-slate-400">
                                  거래시간:
                                </span>
                                <span className="text-sm font-semibold text-slate-200">
                                  {seller.seller?.buyOrder?.createdAt ? new Date(seller.seller?.buyOrder?.createdAt).toLocaleString() : ''}
                                </span>
                              </div>
                            </div>
                          )}



                          {/* if seller.walletAddress is equal to address, show this section */}
                          <div className={'w-full flex flex-col items-start justify-center gap-2'}>

                            {/* totalPaymentConfirmedCount
                            totalPaymentConfirmedUsdtAmount
                            totalPaymentConfirmedKrwAmount
                            정상 거래 */}
                            {/* green color for background */}
                            <div className="w-full flex flex-row items-center justify-between gap-2 mt-2
                            p-2 bg-emerald-900/30 border border-emerald-700 rounded-lg
                            ">
                              <div className="w-20 flex flex-col items-start justify-center gap-0">
                                <span className="text-sm text-slate-400">
                                  정상거래
                                </span>
                                <span className="text-lg text-slate-200">
                                  {seller.seller?.totalPaymentConfirmedCount || 0}
                                </span>
                              </div>
                              <div className="w-full flex flex-col items-end justify-center gap-1">

                                <span className="text-lg text-emerald-300"
                                  style={{ fontFamily: 'monospace' }}>
                                  {seller.seller?.totalPaymentConfirmedUsdtAmount
                                  && seller.seller?.totalPaymentConfirmedUsdtAmount.toLocaleString()} USDT
                                </span>
                                <span className="text-lg text-amber-300"
                                  style={{ fontFamily: 'monospace' }}>
                                  {seller.seller?.totalPaymentConfirmedKrwAmount
                                  && seller.seller?.totalPaymentConfirmedKrwAmount.toLocaleString()} 원
                                </span>
                              </div>
                            </div>

                            {/* 중재 거래 */}
                            {/* red color for background */}
                            <div className="w-full flex flex-row items-center justify-between gap-2
                            p-2 bg-red-900/30 border border-red-700 rounded-lg
                            ">
                              <div className="w-20 flex flex-col items-start justify-center gap-0">
                                <span className="text-sm text-slate-400">
                                  중재거래
                                </span>
                                <span className="text-lg text-slate-200">
                                  {seller.seller?.totalDisputeResolvedCount || 0}
                                </span>
                              </div>
                              <div className="w-full flex flex-col items-end justify-center gap-1">
                                <span className="text-lg text-emerald-300"
                                  style={{ fontFamily: 'monospace' }}>
                                  {seller.seller?.totalDisputeResolvedUsdtAmount
                                  ? seller.seller?.totalDisputeResolvedUsdtAmount.toLocaleString()
                                  : '0'
                                  } USDT
                                </span>
                                <span className="text-lg text-amber-300"
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
                              border-t border-slate-600 pt-2
                              ">
                              <div className="w-full flex flex-col items-start justify-center gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  onChange={(e) => {
                                    const newBuyAmountInputs = [...buyAmountInputs];
                                    newBuyAmountInputs[index] = Number(e.target.value);
                                    setBuyAmountInputs(newBuyAmountInputs);
                                  }}
                                  className={`
                                    ${address && !buyOrderingPrivateSaleArray[index]
                                    ? 'border border-slate-600 bg-slate-700 text-slate-200 rounded-lg p-2 text-sm' :
                                    'border border-slate-600 bg-slate-800 text-slate-500 rounded-lg p-2 text-sm cursor-not-allowed'
                                    }
                                    w-full focus:outline-none focus:ring-2 focus:ring-blue-500
                                  `}
                                  disabled={!address || buyOrderingPrivateSaleArray[index]}
                                />
                                <button
                                  onClick={() => {
                                    buyOrderPrivateSale(
                                      index,
                                      seller.walletAddress,
                                    )
                                  }}
                                  className={`
                                    ${address && !buyOrderingPrivateSaleArray[index]
                                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-blue-500/50 border-0' 
                                      : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                                    }
                                    px-4 py-2 rounded-lg font-semibold text-sm
                                    transition-all duration-200 ease-in-out
                                    transform hover:scale-105 active:scale-95
                                    w-full
                                  `}
                                  disabled={!address || buyOrderingPrivateSaleArray[index]}
                                >
                                  <span className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                    구매하기
                                  </span>
                                </button>
                              </div>
                              {/* 로그인을 해야 구매할 수 있습니다. */}
                              {!address && (
                                <div className="text-sm text-red-600">
                                  로그인을 해야 구매할 수 있습니다.
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
                        <div className="w-full flex flex-col items-start justify-center gap-2">

                          <div className="w-full flex flex-row items-center justify-start gap-2
                          border-t border-b border-zinc-300 py-2
                          ">
                            <Image
                              src="/icon-buyer.png"
                              alt="Buyer"
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-lg object-cover"
                            />
                            <div className="flex flex-col items-start justify-center gap-0">
                              <span className="text-sm font-semibold">
                                {seller.seller?.buyOrder?.nickname}
                              </span>
                              <button
                                className="text-sm text-zinc-600 underline"
                                onClick={() => {
                                  navigator.clipboard.writeText(seller.seller?.buyOrder?.walletAddress);
                                  toast.success(Copied_Wallet_Address);
                                } }
                              >
                                {seller.seller?.buyOrder?.walletAddress.substring(0, 6)}...{seller.seller?.buyOrder?.walletAddress.substring(seller.seller?.buyOrder?.walletAddress.length - 4)}
                              </button>
                            </div>

                            {/* isWeb3Wallet is false, 결제용 지갑 */}
                            {seller.seller?.buyOrder?.isWeb3Wallet ? (
                              <span className="text-sm">
                                (Web3 지갑)
                              </span>
                            ) : (
                              <span className="text-sm">
                                (결제용 지갑)
                              </span>
                            )}


                          </div>

                          <div className="w-full flex flex-row items-center justify-between gap-2">
                            <span className="text-sm">
                              주문시간:
                            </span>
                            <span className="text-sm">
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
                            <span className="text-sm">
                              입금요청시간:
                            </span>
                            <span className="text-sm">
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
                            <span className="text-sm">
                              입금완료시간:
                            </span>
                            <span className="text-sm">
                              {new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getFullYear() + '-' +
                                String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getMonth() + 1).padStart(2, '0') + '-' +
                                String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getDate()).padStart(2, '0') + ' ' +
                                String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getHours()).padStart(2, '0') + ':' +
                                String(new Date(seller.seller?.buyOrder?.paymentConfirmedAt).getMinutes()).padStart(2, '0')
                              }
                            </span>
                          </div>
                          )}

                          <span className="text-sm">
                            {Buy_Amount}(USDT): {seller.seller?.buyOrder?.usdtAmount}
                          </span>
                          <span className="text-sm">
                            {Payment_Amount}(원): {seller.seller?.buyOrder?.krwAmount.toLocaleString()}
                          </span>
                          <span className="text-sm">
                            {Rate}(원): {seller.seller?.buyOrder?.rate.toLocaleString()} 
                          </span>

                        </div>
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



                      className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="text-sm text-slate-300">판매취소</label>
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
                  <label className="text-sm text-slate-300">판매완료</label>
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
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <span className="text-sm text-slate-400">~</span>

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
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="text-sm text-slate-400 underline hover:text-slate-200"
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
                      className="text-sm text-slate-400 underline hover:text-slate-200"
                    >
                      어제
                    </button>
                  </div>

              </div>



            </div>



          </div>

          {/* 통장 */}
          {/*}
          {address && user?.seller?.bankInfo && (
            <div className="flex flex-row items-center gap-2 mt-4">
              <Image
                src="/icon-bank.png"
                alt="Bank"
                width={35}
                height={35}
                className="w-6 h-6"
              />
              <div className="text-sm xl:text-xl font-semibold">
                {user?.seller?.bankInfo.bankName}{' '}
                {user?.seller?.bankInfo.accountNumber}{' '}
                {user?.seller?.bankInfo.accountHolder}
              </div>

              <div className="flex flex-row gap-2 items-center justify-center">
                <Image
                  src="/icon-bank-auto.png"
                  alt="Bank Auto"
                  width={20}
                  height={20}
                  className="animate-spin"
                />
                <span className="text-sm font-semibold text-zinc-500">
                  자동자동입금확인중
                </span>
              </div>

            </div>
          )}
          */}

          {/*}
          {address && !user?.seller?.bankInfo && (
            <div className="flex flex-row items-center gap-2 mt-4">
              <Image
                src="/icon-bank.png"
                alt="Bank"
                width={35}
                height={35}
                className="w-6 h-6"
              />
              <div className="text-sm text-zinc-500 font-semibold">
                입금통장정보가 없습니다. 입금통장정보가 없으면 판매가 불가능합니다.
              </div>
            </div>
          )}
          */}

          {/* trade summary */}

          <div className="hidden
            flex-col xl:flex-row items-start justify-between gap-2
            w-full
            bg-zinc-100/50
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
                <div className="text-sm text-slate-300">거래수(건)</div>
                <div className="text-4xl font-semibold text-slate-200">
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
            <div className="hidden xl:block w-0.5 h-20 bg-zinc-300"></div>
            <div className="xl:hidden w-full h-0.5 bg-zinc-300"></div>

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
                  <div className="text-sm text-slate-300">가맹점 결제수(건)</div>
                    <span className="text-4xl font-semibold text-slate-300">
                      {buyOrderStats.totalSettlementCount?.toLocaleString()}
                    </span>
                </div>

                <div className="flex flex-row items-center justify-center gap-2">

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm text-slate-300">가맹점 결제량(USDT)</div>
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
                    <div className="text-sm text-slate-300">가맹점 결제금액(원)</div>
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
                  border-b border-slate-600 pb-2">

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm text-slate-300">센터 수수료량(USDT)</div>
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
                    <div className="text-sm text-slate-300">센터 수수료금액(원)</div>
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
                    <div className="text-sm text-slate-300">AG 수수료량(USDT)</div>
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
            <div className="hidden xl:block w-0.5 h-10 bg-zinc-300"></div>
            <div className="xl:hidden w-full h-0.5 bg-zinc-300"></div>

            <div className="xl:w-1/4 flex flex-row items-center justify-center gap-2">
              <div className="flex flex-col gap-2 items-center">
                <div className="text-sm">총 청산수(건)</div>
                <div className="text-xl font-semibold text-zinc-500">
                  {tradeSummary.totalClearanceCount?.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <div className="text-sm">총 청산금액(원)</div>
                <div className="text-xl font-semibold text-zinc-500">
                  {tradeSummary.totalClearanceAmount?.toLocaleString()} 원
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="text-sm">총 청산수량(USDT)</div>
                <div className="text-xl font-semibold text-zinc-500">
                  {tradeSummary.totalClearanceAmountUSDT?.toLocaleString()} USDT
                </div>
              </div>
            </div>
            */}
            
          </div>


          {/* buyOrderStats.totalByBuyerDepositName */}
          
          <div className="hidden
            w-full
            grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6
            gap-4
            items-start justify-start
            border-t border-zinc-300
            py-4
            ">
            {buyOrderStats.totalByBuyerDepositName?.map((item, index) => (
              <div
                key={index}
                className={`w-full flex flex-col items-start justify-center gap-2
                p-2 rounded-lg shadow-md
                backdrop-blur-md
                ${buyerDisplayValueArray && buyerDisplayValueArray[index] !== undefined && buyerDisplayValueArray[index] !== item.totalKrwAmount
                  ? 'bg-yellow-100/80 animate-pulse'
                  : 'bg-white/80'}
                `}
              >
                <div className="flex flex-row items-start justify-start gap-1">
                  <Image
                    src="/icon-user.png"
                    alt="User"
                    width={30}
                    height={30}
                    className="w-6 h-6"
                  />          
                  {item._id.length > 1 ? item._id.slice(0, 1) + '*' .repeat(item._id.length - 1) : item._id}  
                </div>
                <div className="w-full flex flex-row items-center justify-between gap-1">
                  <span className="text-sm text-zinc-500">
                    {item.totalCount?.toLocaleString() || '0'}건
                  </span>
                  ｜
                  <span className="text-sm text-green-600"
                    style={{ fontFamily: 'monospace' }}>
                    {(item.totalUsdtAmount || 0).toLocaleString()}테더
                  </span>
                  ｜
                  <span className="text-sm text-yellow-600"
                    style={{ fontFamily: 'monospace' }}>
                    {(item.totalKrwAmount || 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}


            {buyOrderStats.totalReaultGroupByBuyerDepositNameCount! - buyOrderStats.totalByBuyerDepositName!.length > 0 && (

              <div className="text-xl font-bold text-red-500
                flex items-center justify-center"
              >
                +{buyOrderStats.totalReaultGroupByBuyerDepositNameCount! - buyOrderStats.totalByBuyerDepositName!.length} 명
              </div>

            )}
          </div>


          {/* table view is horizontal scroll */}
          {tableView ? (


            <div className="
              hidden
              w-full overflow-x-auto">

              <table className="w-full table-auto border-collapse border border-zinc-800 rounded-md">

                <thead
                  className="bg-[#0047ab] text-white text-sm font-semibold"
                  //style={{
                  //  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  //}}
                >
                  <tr>

                    <th className="p-2 text-start">
                      <div className="flex flex-col items-start justify-center gap-2">
                        <span className="text-sm text-zinc-50 font-semibold">
                          가맹점
                        </span>
                        <span className="text-sm text-zinc-50 font-semibold">
                          P2P거래번호
                        </span>
                        <span className="text-sm text-zinc-50 font-semibold">
                          거래시작시간
                        </span>
                      </div>
                    </th>

                    <th className="p-2 text-start">
                      <div className="flex flex-col items-start justify-center gap-2">
                        <span className="text-sm text-zinc-50 font-semibold">
                          구매자 아이디
                        </span>
                        <span className="text-sm text-zinc-50 font-semibold">
                          USDT지갑
                        </span>
                        <span className="text-sm text-zinc-50 font-semibold">
                          입금자
                        </span>
                      </div>
                    </th>
                    
                    <th className="p-2 text-end">
                      <div className="flex flex-col items-end justify-center gap-2">
                        <span className="text-sm text-zinc-50 font-semibold">
                          {Buy_Amount}(USDT)
                        </span>
                        <span className="text-sm text-zinc-50 font-semibold">
                          구매금액(원)
                        </span>
                        <span className="text-sm text-zinc-50 font-semibold">
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
                            <span className="text-sm text-zinc-50 font-semibold">
                              판매자 아이디
                            </span>
                            <span className="text-sm text-zinc-50 font-semibold">
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
                            bg-zinc-100 rounded-full
                            w-5 h-5 animate-spin"
                            */
                            // if buyOrders.filter((item) => item.status === 'ordered').length > 0, then animate spin
                            className={`
                              w-5 h-5
                              ${buyOrders.filter((item) => item.status === 'ordered').length > 0 ? 'animate-spin' : ''}
                            `}
                          />

                          {/* the count of status is ordered */}
                          <span className="text-sm text-zinc-50 font-semibold">
                            {
                              buyOrders.filter((item) => item.status === 'ordered').length
                            }
                          </span>

                          <span className="text-sm text-zinc-50 font-semibold">
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
                          <span className="text-sm text-zinc-50 font-semibold">
                            {
                              buyOrders.filter((item) => item.status === 'paymentRequested').length
                            }
                          </span>

                        </div>

                        <div className="w-full flex flex-col items-end justify-center gap-2">
                          <span className="text-sm text-zinc-50 font-semibold">
                            입금통장
                          </span>
                          <span className="text-sm text-zinc-50 font-semibold">
                            입금액(원)
                          </span>
                        </div>

                      </div>
                    </th>


                    <th className="p-2">
                      <div className="flex flex-col xl:flex-row items-center justify-center gap-2">
                        <span>
                          판매취소
                        </span>
                        <span>
                          판매완료
                        </span>
                      </div>
                    </th>

                    {/*
                    <th className="
                      p-2">
                      정산비율(%)
                    </th>
                    */}

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

                          <span className="text-sm text-zinc-50 font-semibold">
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
                        index % 2 === 0 ? 'bg-zinc-100' : 'bg-zinc-200'


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
                          bg-slate-700
                          rounded-lg
                          border border-slate-600
                          hover:bg-slate-600
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
                              <span className="text-sm text-slate-200 font-bold">
                                {
                                  item?.store?.storeName?.length > 5 ?
                                  item?.store?.storeName?.substring(0, 5) + '...' :
                                  item?.store?.storeName
                                }
                              </span>
                              <span className="text-sm text-slate-400">
                                {
                                  item?.agent.agentName?.length > 5 ?
                                  item?.agent.agentName?.substring(0, 5) + '...' :
                                  item?.agent.agentName
                                }
                              </span>
                            </div>
                          </div>


                          <span className="text-sm text-zinc-500 font-semibold">
                          {
                            "#" + item.tradeId
                          }
                          </span>

                          <div className="flex flex-row items-center justify-start gap-2">

                            <div className="flex flex-col items-start justify-start">

                              <span className="text-sm text-zinc-800 font-semibold">
                                {new Date(item.createdAt).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                              {/*
                              <span className="text-sm text-zinc-500">
                                {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                })}
                              </span>
                              */}

                              <div className="flex flex-row items-center justify-start gap-1">
                                <span className="text-sm text-zinc-500 font-semibold">
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
                                    <span className="text-xl text-slate-300 font-semibold">
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
                            <span className="text-sm text-zinc-500 font-semibold">
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
                              <span className="text-lg text-zinc-500 font-semibold">
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
                                <span className="text-lg text-slate-200 font-bold">
                                  {
                                    item?.buyer?.depositName
                                  }
                                </span>
                                <span className="
                                  hidden xl:flex
                                  text-sm text-slate-400">
                                  {
                                    item?.buyer?.depositBankName
                                  }
                                </span>
                                <span className="
                                  text-sm text-slate-400">
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
                            <span className="text-sm text-zinc-500">
                              {
                                item?.userStats?.totalPaymentConfirmedCount
                                ? item?.userStats?.totalPaymentConfirmedCount.toLocaleString() + ' 건' :
                                0 + ' 건'
                              }
                            </span>
                            <span className="text-sm text-zinc-500">
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

                          <span className="text-sm text-zinc-500"
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
                              <span className="text-sm text-zinc-500">
                                결제방법
                              </span>
                              <span className="text-sm text-zinc-500">
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
                                    <span className="text-sm text-zinc-500">
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
                                <span className="text-sm text-zinc-500 font-semibold">
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
                                  <span className="text-lg font-semibold text-zinc-500">
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
                                  <span className="text-sm text-slate-300 font-semibold">
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
                              
                              <div className="text-sm text-slate-400">

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

                              <div className="text-sm text-slate-400">
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

                                <div className="text-sm text-zinc-500">
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
                                className="text-sm text-zinc-500"
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
                                <span className="text-sm font-semibold text-zinc-500">
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
                                <span className="text-sm font-semibold text-zinc-500">
                                  수동입금확인
                                </span>
                              </div>

                            )}

                            {/* seller bank info */}
                            <div className="flex flex-row gap-2 items-center justify-end">
                              <span className="text-sm text-zinc-500">
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
                                <span className="text-sm font-semibold text-slate-300">
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
                                    <span className="text-sm font-semibold text-slate-300">
                                      자동입금확인중
                                    </span>
                                  ) : (
                                    <span className="text-sm font-semibold text-slate-300">
                                      자동입금확인중
                                    </span>
                                  )}

                                </div>



                                <div className="flex flex-row gap-1 items-center justify-end">
                                  <div className="text-sm text-slate-400">
                                    {item.seller?.bankInfo?.bankName}
                                  </div>
                                  <div className="text-lg text-slate-200 font-bold">
                                    {item.seller?.bankInfo?.accountHolder}
                                  </div>
                                </div>
                                {/*
                                <div className="flex flex-row items-end justify-start text-sm text-zinc-500">
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
                                            //confirm("수동으로 입금확인을 처리하시겠습니까?") &&
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



                      <td className="p-2">
                        <div className="
                        w-60
                        flex flex-col gap-2 items-center justify-center">

                        {/*
                        {
                          user?.seller &&
                          item.status === 'ordered'  && (

                          <div className="bg-gray-500/10
                            rounded-md
                            p-2
                            flex flex-col xl:flex-row gap-2 items-start justify-start">
                            <div className="
                              w-full
                              flex flex-col gap-2 items-end justify-center">

                              <div className="flex flex-row gap-2">
                                <input
                                  type="checkbox"
                                  checked={agreementForTrade[index]}
                                  onChange={(e) => {
                                    setAgreementForTrade(
                                      agreementForTrade.map((item, idx) => idx === index ? e.target.checked : item)
                                    );
                                  }}
                                />
                                <button
                                  disabled={acceptingBuyOrder[index] || !agreementForTrade[index]}
                                  className="
                                    text-sm text-blue-600 font-semibold
                                    border border-blue-600 rounded-lg p-2
                                    bg-blue-100
                                    w-full text-center
                                    hover:bg-blue-200
                                    cursor-pointer
                                    transition-all duration-200 ease-in-out
                                    hover:scale-105
                                    hover:shadow-lg
                                    hover:shadow-blue-500/50
                                  "
                                  onClick={() => {
                                    acceptBuyOrder(index, item._id, smsReceiverMobileNumber, item.tradeId, item.walletAddress)
                                  }}
                                >
                                  <div className="flex flex-row gap-2 items-center justify-center">
                                    {acceptingBuyOrder[index] && (
                                      <Image
                                        src="/icon-loading.png"
                                        alt="Loading"
                                        width={20}
                                        height={20}
                                        className="animate-spin"
                                      />
                                    )}
                                    <span className="text-sm">{Buy_Order_Accept}</span>
                                  </div>
                                </button>

                              </div>

                              <div className="flex flex-row gap-2 items-center justify-center">
                                <Image
                                  src={user?.avatar || "/icon-seller.png"}
                                  alt="User"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5"
                                />
                                <div className="text-lg text-zinc-500 font-semibold">
                                  {user?.nickname}
                                </div>
                              </div>


                            </div>

                          </div>

                        )}
                        */}



                        {item?.seller?.walletAddress === address && (

                          <>



                        {/* 상태가 cancelled 이고, escrowTransactionHash가 없을 경우 */}
                        {/* 에스크로 돌아주기 버튼 */}
                        { item.status === 'cancelled'
                        && item?.escrowWallet?.transactionHash
                        && item?.escrowWallet?.transactionHash !== '0x'
                        && (!item?.escrowTransactionHash || item?.escrowTransactionHash === '0x')
                        && (
                          <button
                            className="text-sm text-blue-600 font-semibold
                              border border-blue-600 rounded-lg p-2
                              bg-blue-100
                              w-full text-center
                              hover:bg-blue-200
                              cursor-pointer
                              transition-all duration-200 ease-in-out
                              hover:scale-105
                              hover:shadow-lg
                              hover:shadow-blue-500/50
                            "
                            onClick={() => {
                              // TODO: implement return to escrow logic
                            }}
                          >
                            <div className="flex flex-row gap-2 items-center justify-start ml-2">
                              <Image
                                src={`/token-mkrw-icon.png`}
                                alt="MKRW Logo"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                              <Image
                                src={`/logo-chain-${chain}.png`}
                                alt={`${chain} Logo`}
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                              <span className="text-sm">
                                {item?.escrowWallet?.balance?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MKRW 회수하기
                              </span>
                            </div>
                          </button>
                        )}





                            {/*
                            <button
                              onClick={() => {
                                
                                //router.push(`/chat?channel=${item._id}`);

                                router.push(`/${params.lang}/${item.storecode}/chat/${item._id}`);


                              }}
                              className="w-8 h-8
                              flex items-center justify-center
                              bg-white rounded-lg shadow-md
                              hover:bg-gray-100
                              transition-all duration-200 ease-in-out
                              hover:scale-105
                              hover:shadow-lg
                              hover:shadow-blue-500/50
                              cursor-pointer
                              p-1

                              "
                            >
                              <Image
                                src="/icon-chat.png"
                                alt="Chat"
                                width={24}
                                height={24}
                              />
                            </button>
                            */}


                          </>


                        )}




                        {item?.seller?.walletAddress !== address ? (

                          <div className="flex flex-col gap-2 items-center justify-center">

                            {item.status === 'paymentConfirmed' &&
                            !item?.settlement &&
                            (!item?.transactionHash || item?.transactionHash === '0x') && (
                              <div className="flex flex-row gap-2 items-center justify-center">
                                <Image
                                  src="/icon-loading.png"
                                  alt="Loading Icon"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 animate-spin"
                                />
                                <span className="text-sm text-zinc-500">
                                  판매자가 테더(USDT)를 구매자에게 보내는 중
                                </span>
                              </div>
                            )}

                          </div>

                        ) : (

                          <div className={`
                            ${
                            //item.status === 'accepted' ? 'bg-blue-500/10'
                            //: item.status === 'paymentRequested' ? 'bg-blue-500/10'
                            //: item.status === 'paymentConfirmed' ? 'bg-blue-500/10'
                            //: item.status === 'cancelled' ? 'bg-red-500/10'
                            //: item.status === 'paymentConfirmed' ? 'bg-green-500/10'
                            //: 'bg-gray-500/10'
                            <></>
                            } 

                            rounded-md
                            p-2
                            w-full
                            flex flex-col xl:flex-row gap-2 items-start justify-start
                            `}>


                            
                            <div className="
                              w-full
                              flex flex-col gap-2 items-start justify-start">


                              {
                              (item.status === 'accepted' || item.status === 'paymentRequested')
                              && item.seller && item.seller.walletAddress === address && (
                                
                                <div className="flex flex-col items-center gap-2">

                                  
                                  <div className="flex flex-row items-center gap-2">
                                    {/*
                                    <input
                                      type="checkbox"
                                      checked={agreementForCancelTrade[index]}
                                      onChange={(e) => {
                                        setAgreementForCancelTrade(
                                          agreementForCancelTrade.map((item, idx) => idx === index ? e.target.checked : item)
                                        );
                                      }}
                                    />
                                    */}
                                    <button
                                      //disabled={cancellings[index] || !agreementForCancelTrade[index]}
                                      disabled={cancellings[index]}
                  
                                      className="text-sm text-red-600 font-semibold
                                        border border-red-600 rounded-lg p-2
                                        bg-red-100
                                        w-full text-center
                                        hover:bg-red-200
                                        cursor-pointer
                                        transition-all duration-200 ease-in-out
                                        hover:scale-105
                                        hover:shadow-lg
                                        hover:shadow-red-500/50
                                      "  
                                      onClick={() => {
                                        confirm("정말로 판매를 취소하시겠습니까?") && cancelTrade(item._id, index);
                                      }}
                                    >
                                      <div className="flex flex-row gap-2 items-center justify-center">
                                        {cancellings[index] && (
                                          <Image
                                            src="/icon-loading.png"
                                            alt="Loading"
                                            width={20}
                                            height={20}
                                            className="w-5 h-5
                                            animate-spin"
                                          />
                                        )}
                                        <span className="text-sm">{Cancel_My_Trade}</span>
                                      </div>
                                    
                                    </button>
                                  </div>

                                  <input 
                                    type="text"
                                    value={cancelTradeReason[index]}
                                    onChange={(e) => {
                                      setCancelTradeReason(
                                        cancelTradeReason.map((item, idx) => idx === index ? e.target.value : item)
                                      );
                                    }}
                                    placeholder="판매취소사유"
                                    className="w-full h-8
                                    text-center rounded-md text-sm text-zinc-500 font-semibold bg-zinc-100 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <div className="text-xs text-red-500">
                                    취소사유가 없을 경우 판매자 평가에 영향을 미칠 수 있습니다.
                                  </div>
                                


                                </div>

                              )}

                              {/*
                              {item.status === 'cancelled' && (

                                <div className="w-full flex flex-col gap-2 items-center justify-center">
                                  <span className="text-sm text-red-600">
                                    {item.cancelTradeReason ? item.cancelTradeReason :
                                      "판매취소사유 없음"
                                    }
                                  </span>
                                </div>

                              )}
                              */}

                            </div>
                            

                            <div className="
                            w-full
                            flex flex-col gap-2 items-start justify-start">

                              {/*
                              {item.status === 'accepted' && item.seller && item.seller.walletAddress === address && (
                                
                                <div className="flex flex-row items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={agreementForCancelTrade[index]}
                                    onChange={(e) => {
                                      setAgreementForCancelTrade(
                                        agreementForCancelTrade.map((item, idx) => idx === index ? e.target.checked : item)
                                      );
                                    }}
                                  />
                                  <button
                                    disabled={cancellings[index] || !agreementForCancelTrade[index]}

                                    className={`flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md ${cancellings[index] || !agreementForCancelTrade[index] ? 'bg-slate-600' : 'bg-red-600'}`}
                                      
                                    onClick={() => {
                                      cancelTrade(item._id, index);
                                    }}
                                  >
                                    {cancellings[index] && (
                                      <Image
                                        src="/icon-loading.png"
                                        alt="Loading"
                                        width={20}
                                        height={20}
                                        className="animate-spin"
                                      />
                                    )}
                                    
                                    <span className="text-sm">{Cancel_My_Trade}</span>
                                  
                                  </button>
                                </div>

                              )}
                              */}


                              {
                                item.seller && item.seller.walletAddress === address &&
                                item.status === 'accepted' && (


                                <div className="
                                  w-full
                                  flex flex-col gap-2 items-center justify-center">

                                  {item.seller?.bankInfo ? (

                                    <div className="flex flex-row items-center gap-2">

                                      {/*
                                      <input
                                        disabled={escrowing[index] || requestingPayment[index]}
                                        type="checkbox"
                                        checked={requestPaymentCheck[index]}
                                        onChange={(e) => {
                                          setRequestPaymentCheck(
                                            requestPaymentCheck.map((item, idx) => {
                                              if (idx === index) {
                                                return e.target.checked;
                                              }
                                              return item;
                                            })
                                          );
                                        }}
                                      />
                                      */}

                                      <button
                                        disabled={escrowing[index] || requestingPayment[index] }
                                        
                                        className="text-sm text-amber-600 font-semibold
                                          border border-amber-600 rounded-lg p-2
                                          bg-amber-100/10
                                          w-full text-center
                                          hover:bg-amber-100/20
                                          cursor-pointer
                                          transition-all duration-200 ease-in-out
                                          hover:scale-105
                                          hover:shadow-lg
                                          hover:shadow-amber-500/50
                                        "
                                        onClick={() => {

                                          requestPayment(
                                            index,
                                            item._id,
                                            item.tradeId,
                                            item.usdtAmount,
                                            item.storecode,

                                            item.seller?.bankInfo,
                                          );
                                        }}
                                      >

                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          { (escrowing[index] || requestingPayment[index]) && (
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
                                            {Request_Payment}
                                          </span>
                                        </div>
                                      
                                      </button>

                                    </div>

                                  ) : (
                                    <div className="flex flex-row gap-2 items-center justify-center">
                                      <Image
                                        src="/icon-bank.png"
                                        alt="Bank"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5"
                                      />
                                      <span className="text-sm text-red-600 font-semibold">
                                        결제은행정보 없음
                                      </span>
                                    </div>
                                  )}
                                  

                                  {/* seller bank info */}

                                  {item?.paymentMethod === 'bank' && (

                                    <div className="flex flex-col gap-2 items-center justify-center">
                                      <div className="flex flex-row gap-2 items-center justify-center">
                                        <span className="text-sm text-zinc-500">
                                          {item.seller?.bankInfo?.accountHolder}
                                        </span>
                                        <span className="text-sm text-zinc-500">
                                          {item.seller?.bankInfo?.bankName}
                                        </span>
                                      </div>
                                      {/*
                                      <span className="text-sm text-zinc-500">
                                        {
                                          item.seller?.bankInfo?.accountNumber &&
                                          item.seller?.bankInfo?.accountNumber.length > 5 &&
                                          item.seller?.bankInfo?.accountNumber.substring(0, 5) + '...'
                                        }
                                      </span>
                                      */}

                                      {/* 결제요청을 하면 회원에게 입금 안내가 전송됩니다. */}
                                      <div className="text-xs text-red-500">
                                        결제요청을 하면 회원에게 입금 안내가 전송됩니다.
                                      </div>

                                    </div>

                                  )}
        
                                </div>
                              )}


                              {/*}
                              {item.seller
                              && item.seller.walletAddress === address
                              && item.status === 'paymentRequested'
                              
                              ///////////////&& item?.autoConfirmPayment

                              && (

                                <div className="
                                  w-full
                                  flex flex-col gap-2 items-center justify-center">
                                  
                                  <div className="flex flex-row gap-2">

                                    <button
                                      disabled={confirmingPayment[index]}
                                      
                                      className="text-sm text-[#409192] font-semibold
                                        border border-green-600 rounded-lg p-2
                                        bg-green-100
                                        w-full text-center
                                        hover:bg-green-200
                                        cursor-pointer
                                        transition-all duration-200 ease-in-out
                                        hover:scale-105
                                        hover:shadow-lg
                                        hover:shadow-green-500/50
                                      "
                                      
                                      onClick={() => {
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
                                              src="/icon-loading.png"
                                              alt="Loading"
                                              width={20}
                                              height={20}
                                              className="w-5 h-5
                                              animate-spin"
                                            />
                                        )}
                                        <span className="text-sm">
                                          수동입금확인
                                        </span>
                                      </div>

                                    </button>


                                  </div>


                                  {!isWithoutEscrow && (
                                    <div className="flex flex-row gap-2">

                                      <input
                                        disabled={rollbackingPayment[index]}
                                        type="checkbox"
                                        checked={rollbackPaymentCheck[index]}
                                        onChange={(e) => {
                                          setRollbackPaymentCheck(
                                            rollbackPaymentCheck.map((item, idx) => {
                                              if (idx === index) {
                                                return e.target.checked;
                                              }
                                              return item;
                                            })
                                          );
                                        }}
                                      />

                                      <button
                                        disabled={rollbackingPayment[index] || !rollbackPaymentCheck[index]}
                                        className={`flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md ${rollbackingPayment[index] || !rollbackPaymentCheck[index] ? 'bg-gray-500' : 'bg-red-500'}`}
                                        onClick={() => {
                                          rollbackPayment(
                                            index,
                                            item._id,
                                            paymentAmounts[index],
                                            paymentAmountsUsdt[index]
                                          );
                                        }}

                                      >
                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          <Image
                                            src="/icon-loading.png"
                                            alt="loading"
                                            width={16}
                                            height={16}
                                            className={rollbackingPayment[index] ? 'animate-spin' : 'hidden'}
                                          />
                                          <span className="text-sm">
                                            에스크로 취소
                                          </span>
                                        </div>

                                      </button>

                                    </div>
                                  )}


                                  <div className="w-full flex flex-row gap-2 items-center justify-center">
                                    <input
                                      disabled={true}
                                      type="number"
                                      value={paymentAmounts[index]}
                                      onChange={(e) => {
                                        setPaymentAmounts(
                                          paymentAmounts.map((item, idx) => idx === index ? Number(e.target.value) : item)
                                        );
                                      }}
                                      className="w-20 h-8 rounded-md text-right text-lg text-zinc-500 font-semibold bg-zinc-100 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />{' '}원
                                  </div>


                                </div>


                              )}

                              */}



                              {/* paymentConfirmed */}
                              {/* paymentAmount */}
                              {item.status === 'paymentConfirmed' && (

                                <div className="
                                  w-full
                                  flex flex-col gap-2 items-center justify-center">





                                  {/* 자동입금처리일경우 */}
                                  {/* 수동으로 결제완료처리 버튼 */}
                                
                                  { !item?.settlement &&

                                  ///item?.autoConfirmPayment &&

                                  (item?.transactionHash === '0x' || item?.transactionHash === undefined) &&
                                  
                                  (


                                    <div className="w-full flex flex-row items-center justify-center gap-2">

                                      {/*
                                      <input
                                        disabled={confirmingPayment[index]}
                                        type="checkbox"
                                        checked={confirmPaymentCheck[index]}
                                        onChange={(e) => {
                                          setConfirmPaymentCheck(
                                            confirmPaymentCheck.map((item, idx) => {
                                              if (idx === index) {
                                                return e.target.checked;
                                              }
                                              return item;
                                            })
                                          );
                                        }}
                                        className="w-5 h-5 rounded-md border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      />
                                      */}

                                      <button
                                        //disabled={confirmingPayment[index] || !confirmPaymentCheck[index]}
                                        disabled={confirmingPayment[index]}

                                        /*
                                        className={`
                                          w-full
                                        flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md
                                        border border-green-600
                                        hover:border-green-700
                                        hover:shadow-lg
                                        hover:shadow-green-500/50
                                        transition-all duration-200 ease-in-out

                                        ${confirmingPayment[index] ? 'bg-red-500' : 'bg-green-500'}
                                        ${!confirmPaymentCheck[index] ? 'bg-gray-500' : 'bg-green-500'}
                                        
                                        `}
                                        */

                                        className={`
                                          w-full
                                          flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md
                                          border border-green-600
                                          hover:border-green-700
                                          hover:shadow-lg
                                          hover:shadow-green-500/50
                                          transition-all duration-200 ease-in-out

                                          ${confirmingPayment[index] ? 'bg-red-500' : 'bg-green-500'}
                                        `}

                                        onClick={() => {
                                          //confirmPayment(
                                          sendPayment(

                                            index,
                                            item._id,
                                            
                                            //paymentAmounts[index],
                                            item.krwAmount,

                                            //paymentAmountsUsdt[index],
                                            item.usdtAmount,


                                            item.walletAddress,
                                          );
                                        }}


                                      >

                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          <Image
                                            src="/icon-transfer.png"
                                            alt="Transfer"
                                            width={20}
                                            height={20}
                                            className={`
                                            ${confirmingPayment[index] ? 'animate-spin' : 'animate-pulse'}
                                              w-5 h-5
                                            `}
                                          />
                                          <span className="text-sm">
                                            구매자에게 USDT 전송
                                          </span>
                                        </div>

                                      </button>

                                    </div>




                                  )}

                                </div>
                              )}


                            </div>


                          </div>

                        )}


                        {item.status === 'cancelled' && (

                          <div className="w-full flex flex-col gap-2 items-center justify-center">
                            <span className="text-sm text-red-600">
                              {item.cancelTradeReason ? item.cancelTradeReason :
                                "판매취소사유 없음"
                              }
                            </span>
                          </div>

                        )}



                        {item?.transactionHash
                        && item?.transactionHash !== '0x'
                        && (
                          <button
                            className="
                              flex flex-row gap-2 items-center justify-between
                              text-sm text-blue-600 font-semibold
                              border border-blue-600 rounded-lg p-2
                              bg-blue-100
                              text-center
                              hover:bg-blue-200
                              cursor-pointer
                              transition-all duration-200 ease-in-out
                              hover:scale-105
                              hover:shadow-lg
                              hover:shadow-blue-500/50
                            "
                            onClick={() => {
                              let url = '';
                              if (chain === "ethereum") {
                                url = `https://etherscan.io/tx/${item.transactionHash}`;
                              } else if (chain === "polygon") {
                                url = `https://polygonscan.com/tx/${item.transactionHash}`;
                              } else if (chain === "arbitrum") {
                                url = `https://arbiscan.io/tx/${item.transactionHash}`;
                              } else if (chain === "bsc") {
                                url = `https://bscscan.com/tx/${item.transactionHash}`;
                              } else {
                                url = `https://arbiscan.io/tx/${item.transactionHash}`;
                              }
                              window.open(url, '_blank');

                            }}
                          >
                              <div className="flex flex-col gap-2 items-start justify-start ml-2">
                                <div className="flex flex-col gap-1 items-start justify-start">
                                  <span className="text-sm">
                                    판매한 테더(USDT) 수량
                                  </span>
                                  <div className="flex flex-row gap-1 items-center justify-start">
                                    <Image
                                      src={`/token-usdt-icon.png`}
                                      alt="USDT Logo"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                    <span className="text-lg text-[#409192] font-semibold"
                                      style={{
                                        fontFamily: 'monospace',
                                      }}>
                                      {item?.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    </span>
                                  </div>
                                  <span className="text-sm text-zinc-500">
                                    테더(USDT) 전송내역
                                  </span>
                                </div>
                              </div>
                              {/* chain logo */}
                              <Image
                                src={`/logo-chain-${chain}.png`}
                                alt={`${chain} Logo`}
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                          </button>
                        )}


                        {item?.settlement &&
                        (!item?.transactionHash || item?.transactionHash === '0x') && (
                          <div
                            className="
                              flex flex-row gap-2 items-center justify-between
                              text-sm text-blue-600 font-semibold
                              border border-blue-600 rounded-lg p-2
                              bg-blue-100
                              text-center
                              hover:bg-blue-200
                              cursor-pointer
                              transition-all duration-200 ease-in-out
                              hover:scale-105
                              hover:shadow-lg
                              hover:shadow-blue-500/50
                            "
                          >
                              <div className="flex flex-col gap-2 items-start justify-start ml-2">
                                <div className="flex flex-col gap-1 items-start justify-start">
                                  <span className="text-sm">
                                    판매한 테더(USDT) 수량
                                  </span>
                                  <div className="flex flex-row gap-1 items-center justify-start">
                                    <Image
                                      src={`/token-usdt-icon.png`}
                                      alt="USDT Logo"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                    <span className="text-lg text-[#409192] font-semibold"
                                      style={{
                                        fontFamily: 'monospace',
                                      }}>
                                      {item?.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    </span>
                                  </div>
                                  <span className="text-sm text-zinc-500">
                                    TXID 저장누락
                                  </span>
                                </div>
                              </div>
                              {/* chain logo */}
                              <Image
                                src={`/logo-chain-${chain}.png`}
                                alt={`${chain} Logo`}
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                          </div>
                        )}



                        {item?.escrowTransactionHash
                        && item?.escrowTransactionHash !== '0x'
                        && (
                          <button
                            className={`
                              ${item.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}
                              flex flex-row gap-2 items-center justify-between
                              text-sm font-semibold
                              border border-purple-600 rounded-lg p-2
                              w-full text-center
                              hover:bg-purple-200
                              cursor-pointer
                              transition-all duration-200 ease-in-out
                              hover:scale-105
                              hover:shadow-lg
                              hover:shadow-purple-500/50
                            `}

                            
                            onClick={() => {
                              let url = '';
                              if (chain === "ethereum") {
                                url = `https://etherscan.io/tx/${item.escrowTransactionHash}`;
                              } else if (chain === "polygon") {
                                url = `https://polygonscan.com/tx/${item.escrowTransactionHash}`;
                              } else if (chain === "arbitrum") {
                                url = `https://arbiscan.io/tx/${item.escrowTransactionHash}`;
                              } else if (chain === "bsc") {
                                url = `https://bscscan.com/tx/${item.escrowTransactionHash}`;
                              } else {
                                url = `https://arbiscan.io/tx/${item.escrowTransactionHash}`;
                              }
                              window.open(url, '_blank');

                            }}
                          >
                            <div className="flex flex-row gap-2 items-center justify-start ml-2">
                              <Image
                                src={`/token-mkrw-icon.png`}
                                alt="MKRW Logo"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                              <span className="text-sm">
                                {item?.status === 'cancelled' ?
                                  '에스크로(MKRW) 회수내역'
                                  :
                                  '에스크로(MKRW) 전송내역'
                                }
                              </span>
                            </div>
                            <Image
                              src={`/logo-chain-${chain}.png`}
                              alt={`${chain} Logo`}
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                          </button>
                        )}

                        </div>

                      </td>


                      <td className="p-2 hidden
                      ">
                        <div className="w-full
                          flex flex-col gap-2 items-center justify-center
                          border border-dashed border-zinc-300 rounded-lg p-2">

                          {item.status === "paymentConfirmed" &&
                            (!item?.transactionHash || item?.transactionHash === '0x') &&
                            !item?.settlement && (
                            
                            <div className="flex flex-col gap-2">
                              {/* 자동결제 지갑주소 */}

                              <div className="w-full flex flex-row gap-2 items-center justify-start">
                                <Image
                                  src={item?.store?.storeLogo || '/icon-store.png'}
                                  alt="Store Logo"
                                  width={30}
                                  height={30}
                                  className="w-6 h-6 rounded-lg object-cover"
                                />
                                <span className="text-sm font-semibold text-zinc-500">
                                  {item?.store?.storeName}{' '}가맹점 자동결제 지갑주소
                                </span>
                              </div>


                              <div className="flex flex-row gap-1 items-center">
                                <Image
                                  src="/icon-shield.png"
                                  alt="Wallet Icon"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 rounded-lg object-cover"
                                />
                                <span className="text-sm font-semibold text-zinc-500">
                                  {item.store?.settlementWalletAddress ?
                                    item.store.settlementWalletAddress.slice(0, 5) + '...' + item.store.settlementWalletAddress.slice(-4)
                                    : '없음'}
                                </span>
                              </div>

                              {/* info P2P 판매완료후 자동으로 결제와 정산을 진행합니다. */}
                              <div className="flex flex-row gap-1 items-center">
                                <Image
                                  src="/icon-info.png"
                                  alt="Info Icon"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 rounded-lg object-cover"
                                />
                                <span className="text-sm font-semibold text-zinc-500">
                                  P2P 판매완료후 자동으로 결제와 정산을 진행합니다.
                                </span>
                              </div>

                            </div>
                          )}


                          {item?.settlement && (

                            <div className="w-full flex flex-row gap-2 items-center justify-start">
                              <Image
                                src="/icon-payment.png"
                                alt="Payment Icon"
                                width={30}
                                height={30}
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                              <Image
                                src={item?.store?.storeLogo || '/icon-store.png'}
                                alt="Store Logo"
                                width={30}
                                height={30}
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                              <span className="text-sm font-semibold text-zinc-500">
                                {item?.store?.storeName}{' '}가맹점 결제 및 정산완료
                              </span>
                            </div>

                          )}


                          <div className="flex flex-row gap-2 items-between justify-center">

                            {item?.settlement && (
                              <div className="flex flex-col gap-2 items-end justify-center">

                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <span className="
                                  w-14 
                                  text-xs text-zinc-500">
                                    가맹점 결제
                                  </span>
                                  <span className="
                                  w-12 text-end
                                  text-sm text-zinc-500"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}>
                                    {Number(
                                      100 - (item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0)
                                      - (item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.0)
                                      - (item?.platformFee?.percentage ? item?.platformFee?.percentage : 0.0)
                                    ).toFixed(2)
                                    }%
                                  </span>
                                </div>

                                {/*
                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <span className="
                                  w-14
                                  text-xs text-zinc-500">
                                    PG 수수료
                                  </span>
                                  <span className="
                                  w-12 text-end
                                  text-sm text-zinc-500"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}>
                                    {Number(item?.platformFee?.percentage ? item?.platformFee?.percentage : 0.0).toFixed(2)}%
                                  </span>
                                </div>

                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <span className="
                                  w-14
                                  text-xs text-zinc-500">
                                    센터 수수료
                                  </span>
                                  <span className="
                                  w-12  text-end
                                  text-sm text-zinc-500"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}>
                                    {Number(item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.3).toFixed(2)}%
                                  </span>
                                </div>

                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <span className="
                                  w-14
                                  text-xs text-zinc-500">
                                    AG 수수료
                                  </span>
                                  <span className="
                                  w-12 text-end
                                  text-sm text-zinc-500"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}>
                                    {Number(item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0).toFixed(2)}%
                                  </span>
                                </div>
                                */}

                              </div>
                            )}


                            {/*
                            {item?.settlement ? (


                              <button
                                className="
                                w-48
                                flex flex-col gap-2 items-center justify-center
                                bg-purple-500 text-white px-2 py-1 rounded-md hover:bg-purple-600
                                text-sm
                                transition duration-300 ease-in-out
                                transform hover:scale-105
                                hover:shadow-lg
                                hover:shadow-purple-500/50
                                hover:cursor-pointer
                                hover:transition-transform
                                hover:duration-300
                                hover:ease-in-out

                                "

                                onClick={() => {
                                  let url = '';
                                  if (chain === "ethereum") {
                                    url = `https://etherscan.io/tx/${item.settlement.txid}`;
                                  } else if (chain === "polygon") {
                                    url = `https://polygonscan.com/tx/${item.settlement.txid}`;
                                  } else if (chain === "arbitrum") {
                                    url = `https://arbiscan.io/tx/${item.settlement.txid}`;
                                  } else if (chain === "bsc") {
                                    url = `https://bscscan.com/tx/${item.settlement.txid}`;
                                  } else {
                                    url = `https://arbiscan.io/tx/${item.settlement.txid}`;
                                  }
                                  window.open(url, '_blank');
                                }}
                              >


                                <div className="flex flex-col gap-2 items-end justify-center"
                                  style={{
                                    fontFamily: 'monospace',
                                  }}
                                >
            
                                  <span>
                                    {item?.settlement?.settlementAmount?.toLocaleString()}
                                    {' '}
                                    {
                                      item?.settlement?.settlementWalletAddress &&
                                    item?.settlement?.settlementWalletAddress?.slice(0, 5) + '...'}
                                  </span>
                                  <span>
                                    {
                                      item?.settlement?.agentFeeAmount ?
                                      item?.settlement?.agentFeeAmount?.toLocaleString()
                                      : '0'
                                    }
                                    {' '}
                                    {
                                      item?.settlement?.agentFeeWalletAddress &&
                                    item?.settlement?.agentFeeWalletAddress?.slice(0, 5) + '...'}
                                  </span>
                                  <span>
                                    {item?.settlement?.feeAmount?.toLocaleString()}
                                    {' '}
                                    {
                                      item?.settlement?.feeWalletAddress &&
                                    item?.settlement?.feeWalletAddress?.slice(0, 5) + '...'}
                                  </span>

                                </div>

                              </button>

                            ) : (
                              <>
                                {item.status === 'paymentConfirmed'
                                && item?.transactionHash !== '0x'
                                && (
                                  <div className="flex flex-row gap-2 items-center justify-center">

                                    {item.storecode === 'admin' ? (

                                      <div className="flex flex-row gap-2 items-center justify-center">
                                        일반 회원 구매
                                      </div>

                                    ) : (
                                    
                                      <div className="flex flex-col gap-2 items-center justify-center">

                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          <Image
                                            src="/icon-settlement.png"
                                            alt="Settlement"
                                            width={20}
                                            height={20}
                                            className="animate-spin"
                                          />
                                          <span className="text-sm font-semibold text-zinc-500">
                                            가맹점 결제 및 정산중
                                          </span>
                                        </div>

                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          <Image
                                            src={item.store?.storeLogo || '/icon-store.png'}
                                            alt="Store Logo"
                                            width={20}
                                            height={20}
                                            className="rounded-lg w-6 h-6"
                                          />
                                          <span className="text-sm font-semibold text-zinc-500">
                                            {item.store?.storeName}
                                          </span>
                                        </div>

                                        <div className="flex flex-row gap-1 items-center justify-center">
                                          <Image
                                            src="/token-usdt-icon.png"
                                            alt="USDT"
                                            width={20}
                                            height={20}
                                            className="rounded-lg w-6 h-6"
                                          />
                                          <span className="text-lg font-semibold text-[#409192]"
                                            style={{
                                              fontFamily: 'monospace',
                                            }}
                                          >
                                            {
                                            Number(item.usdtAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                            }
                                          </span>
                                        </div>

                                        {item.transactionHash &&
                                          new Date().getTime() - new Date(item.paymentConfirmedAt).getTime() > 1000 * 5 * 60 && (

                                          <div className="flex flex-row gap-2 items-center justify-center">
                                            <input
                                              disabled={loadingSettlement[index]}
                                              type="checkbox"
                                              checked={settlementCheck[index]}
                                              onChange={(e) => {
                                                setSettlementCheck(
                                                  settlementCheck.map((item, idx) => {
                                                    if (idx === index) {
                                                      return e.target.checked;
                                                    }
                                                    return item;
                                                  })
                                                );
                                              }}
                                              className="w-5 h-5
                                              rounded-md"

                                            />

                                            <button
                                              disabled={
                                                !settlementCheck[index]
                                                || loadingSettlement[index]
                                              }
                                              className={`
                                                ${settlementCheck[index] ? 'bg-blue-500' : 'bg-gray-500'}
                                                w-full
                                                flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md
                                                hover:bg-blue-600
                                                hover:shadow-lg
                                                hover:shadow-blue-500/50
                                                transition-all duration-200 ease-in-out
                                                ${!settlementCheck[index] || loadingSettlement[index]
                                                ? 'cursor-not-allowed' : 'cursor-pointer'}
                                              `}

                                              onClick={() => {
                                              
                                                settlementRequest(
                                                  index,
                                                  item._id,
                                                );
                                                

                                              }}
                                            >
                                              <div className="flex flex-row gap-2 items-center justify-center">
                                                {loadingSettlement[index] ? (
                                                  <span className="text-sm">
                                                    정산중...
                                                  </span>
                                                ) : (
                                                  <span className="text-sm">
                                                    수동으로 정산하기
                                                  </span>
                                                )}
                                              </div>

                                            </button>
                                          </div>
                                        )}



                                      </div>

                                    )}


                                  </div>
                                )}
                              </>
                            )}
                            */}


                            {item?.settlement && item?.settlement?.settlementAmount ? (

                              <div className="flex flex-row gap-2 items-center justify-center">

                                <button
                                  /*
                                  className="
                                  w-44        
                                  flex flex-col gap-2 items-center justify-center
                                  bg-purple-500 text-white px-2 py-1 rounded-md hover:bg-purple-600
                                  text-sm
                                  transition duration-300 ease-in-out
                                  transform hover:scale-105
                                  hover:shadow-lg
                                  hover:shadow-purple-500/50
                                  hover:cursor-pointer
                                  hover:transition-transform
                                  hover:duration-300
                                  hover:ease-in-out

                                  "
                                  */
                                  disabled={item.settlement.txid === "0x" || !item.settlement.txid}

                                  className={`
                                    ${item.settlement.txid === "0x" || !item.settlement.txid ? "bg-slate-600 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600 cursor-pointer hover:shadow-lg hover:shadow-slate-500/50 border border-slate-500"}
                                    text-sm
                                    text-white px-2 py-1 rounded-md
                                    transition duration-300 ease-in-out
                                    transform hover:scale-105
                                    hover:shadow-lg
                                    hover:shadow-blue-500/50
                                    hover:cursor-pointer
                                    hover:transition-transform
                                    hover:duration-300
                                    hover:ease-in-out
                                  `}

                                  onClick={() => {
                                    if (item.settlement.txid === "0x" || !item.settlement.txid) {
                                      alert("트랙젝션 해시가 없습니다.");
                                      return;
                                    } else {
                                      window.open(
                                        
                                        chain === 'ethereum' ? `https://etherscan.io/tx/${item.settlement.txid}`
                                        : chain === 'polygon' ? `https://polygonscan.com/tx/${item.settlement.txid}`
                                        : chain === 'arbitrum' ? `https://arbiscan.io/tx/${item.settlement.txid}`
                                        : chain === 'bsc' ? `https://bscscan.com/tx/${item.settlement.txid}`
                                        : `https://arbiscan.io/tx/${item.settlement.txid}`,

                                        '_blank'
                                      );
                                    }
                                  }}
                                >


                                  <div className="flex flex-col gap-2 items-end justify-center"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}
                                  >
              
                                    <span>
                                      {item?.settlement?.settlementAmount?.toLocaleString()}
                                      {' '}
                                      {
                                        item?.settlement?.settlementWalletAddress &&
                                      item?.settlement?.settlementWalletAddress?.slice(0, 5) + '...'}
                                    </span>

                                    {/*
                                    <span>
                                      {
                                        item?.settlement?.platformFeeAmount ?
                                        item?.settlement?.platformFeeAmount?.toLocaleString()
                                        : '0'
                                      }
                                      {' '}
                                      {
                                        item?.settlement?.platformFeeWalletAddress &&
                                      item?.settlement?.platformFeeWalletAddress?.slice(0, 5) + '...'}
                                    </span>

                                    <span>
                                      {item?.settlement?.feeAmount?.toLocaleString()}
                                      {' '}
                                      {
                                        item?.settlement?.feeWalletAddress &&
                                      item?.settlement?.feeWalletAddress?.slice(0, 5) + '...'}
                                    </span>

                                    <span>
                                      {
                                        item?.settlement?.agentFeeAmount ?
                                        item?.settlement?.agentFeeAmount?.toLocaleString()
                                        : '0'
                                      }
                                      {' '}
                                      {
                                        item?.settlement?.agentFeeWalletAddress &&
                                      item?.settlement?.agentFeeWalletAddress?.slice(0, 5) + '...'}
                                    </span>
                                    */}



                                  </div>

                                </button>



                              
                                <div className="  
                                w-24 
                                flex flex-col gap-2 items-end justify-center"
                                >
                                  <div className="flex flex-col gap-1 items-center justify-center">
                                    <Image
                                      src="/icon-user.png"
                                      alt="User Icon"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                    <span className="text-lg font-semibold text-blue-600">
                                      {item.nickname.slice(0, 6)}...
                                    </span>
                                  </div>
                                  <span className="text-sm text-zinc-500">
                                    충전금액(원)
                                  </span>
                                  <span className="text-sm text-blue-600 font-semibold"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {Number(item.krwAmount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  </span>
                                </div>



                              </div>

                            ) : (
                              <>
                                {item.status === 'paymentConfirmed'
                                && item?.transactionHash !== '0x'
                                && item?.transactionHashFail !== true
                                && (
                                  <div className="flex flex-row gap-2 items-center justify-center">

                                    {item.storecode === 'admin' ? (

                                      <div className="flex flex-row gap-2 items-center justify-center">
                                        일반 회원 구매
                                      </div>

                                    ) : (
                                    
                                      <div className="flex flex-col gap-2 items-center justify-center">

                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          <Image
                                            src="/icon-payment.gif"
                                            alt="Payment Processing"
                                            width={30}
                                            height={30}
                                          />
                                          <span className="text-sm font-semibold text-zinc-500">
                                            가맹점 결제 및 정산중
                                          </span>
                                        </div>

                                        <div className="flex flex-row gap-2 items-center justify-center">
                                          <Image
                                            src={item.store?.storeLogo || '/icon-store.png'}
                                            alt="Store Logo"
                                            width={20}
                                            height={20}
                                            className="rounded-lg w-6 h-6 object-cover"
                                          />
                                          <span className="text-sm font-semibold text-zinc-500">
                                            {item.store?.storeName}
                                          </span>
                                        </div>

                                        <div className="flex flex-row gap-1 items-center justify-center">
                                          <Image
                                            src="/token-usdt-icon.png"
                                            alt="USDT"
                                            width={20}
                                            height={20}
                                            className="rounded-lg w-6 h-6 object-cover"
                                          />
                                          <span className="text-lg font-semibold text-[#409192]"
                                            style={{
                                              fontFamily: 'monospace',
                                            }}
                                          >
                                            {Number(item.usdtAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                          </span>
                                        </div>

                                        {/*
                                          if item.paymentConfirmedAt (2025-07-03T09:26:37.818Z)
                                            is last 1 hour, show button to settlement
                                        */}

                                        {/*
                                        {item.transactionHash &&
                                          new Date().getTime() - new Date(item.paymentConfirmedAt).getTime() > 1000 * 5 * 60 && (

                                          <div className="flex flex-row gap-2 items-center justify-center">
                                            <input
                                              disabled={loadingSettlement[index]}
                                              type="checkbox"
                                              checked={settlementCheck[index]}
                                              onChange={(e) => {
                                                setSettlementCheck(
                                                  settlementCheck.map((item, idx) => {
                                                    if (idx === index) {
                                                      return e.target.checked;
                                                    }
                                                    return item;
                                                  })
                                                );
                                              }}
                                              className="w-5 h-5
                                              rounded-md"

                                            />

                                            <button
                                              disabled={
                                                !settlementCheck[index]
                                                || loadingSettlement[index]
                                              }
                                              className={`
                                                ${settlementCheck[index] ? 'bg-blue-500' : 'bg-gray-500'}
                                                w-full
                                                flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md
                                                hover:bg-blue-600
                                                hover:shadow-lg
                                                hover:shadow-blue-500/50
                                                transition-all duration-200 ease-in-out
                                                ${!settlementCheck[index] || loadingSettlement[index]
                                                ? 'cursor-not-allowed' : 'cursor-pointer'}
                                              `}

                                              onClick={() => {
                                              
                                                settlementRequest(
                                                  index,
                                                  item._id,
                                                );
                                                

                                              }}
                                            >
                                              <div className="flex flex-row gap-2 items-center justify-center">
                                                {loadingSettlement[index] ? (
                                                  <span className="text-sm">
                                                    정산중...
                                                  </span>
                                                ) : (
                                                  <span className="text-sm">
                                                    수동으로 정산하기
                                                  </span>
                                                )}
                                              </div>

                                            </button>
                                          </div>
                                        )}
                                        */}


                                      </div>

                                    )}


                                  </div>
                                )}
                              </>
                            )}






                          </div>

                        </div>

                      </td>




                      {/* 상세보기 */}
                      {/*
                      <td className="p-2">
                        <div className="
                          w-20
                        flex flex-col gap-2 items-center justify-center">
                          <button
                            className="text-sm bg-zinc-500 text-white px-2 py-1 rounded-md hover:bg-zinc-600"

                            onClick={() => {
                              setSelectedItem(item);
                              openModal();
                              
                            }}

                          >
                            거래보기
                          </button>
      

                          {item?.settlement && item?.settlement?.txid && (
                          <button
                            className="text-sm bg-zinc-500 text-white px-2 py-1 rounded-md hover:bg-zinc-600"
                            onClick={() => {
                              window.open(
                                `https://arbiscan.io/tx/${item.settlement.txid}`,
                                '_blank'
                              );
                            }}
                          >
                            정산보기
                          </button>
                          )}
                        </div>
                      </td>
                      */}


                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


          ) : (

            <div className="w-full grid gap-4 lg:grid-cols-2 xl:grid-cols-3 justify-center ">

                {buyOrders.map((item, index) => (
    
                  <div
                    key={index}
                    className="relative flex flex-col items-center justify-center"
                  >


                    {item.status === 'ordered' && (new Date().getTime() - new Date(item.createdAt).getTime() > 1000 * 60 * 60 * 24) && (
                      <div className="absolute inset-0 flex justify-center items-center z-10
                        bg-black bg-opacity-50
                      ">
                        <Image
                          src="/icon-expired.png"
                          alt="Expired"
                          width={100}
                          height={100}
                          className="opacity-20"
                        />
                      </div>
                    )}

                    {item.status === 'cancelled' && (
                      <div className="absolute inset-0 flex justify-center items-center z-10
                        bg-black bg-opacity-50
                      ">
                        <Image
                          src="/icon-cancelled.png"
                          alt="Cancelled"
                          width={100}
                          height={100}
                          className="opacity-20"
                        />
                      </div>
                    )}


                    <article
                        //key={index}
                        className={` w-96 xl:w-full h-full relative
                          ${item.walletAddress === address ? 'border-green-500' : 'border-gray-200'}

                          ${item.status === 'accepted' || item.status === 'paymentRequested' ? 'border-red-600' : 'border-gray-200'}

                          p-4 rounded-md border bg-black bg-opacity-50
                      `}
                    >

                      {item.status === 'ordered' && (


                        <div className="w-full flex flex-col gpa-2 items-start justify-start">


                            <div className="w-full flex flex-row items-center justify-between gap-2">

                              <div className="flex flex-row items-center gap-2">

                                {/* if createdAt is recent 1 hours, show new badge */}
                                {new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 && (
                                  <Image
                                    src="/icon-new.png"
                                    alt="New"
                                    width={28}
                                    height={28}
                                  />
                                )}

                                <Image
                                  src="/icon-public-sale.png"
                                  alt="Public Sale"
                                  width={28}
                                  height={28}
                                />

                              

                                {params.lang === 'ko' ? (

                                  <p className="text-sm text-zinc-500">

                                  
                                    {

                                      new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                      ) :
                                      new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                      ) : (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                      )
                                    }{' '}{Buy_Order_Opened} 

                                  </p>
                                  
                                  ) : (

                                    <p className="text-sm text-zinc-500">


                                  
                                    {Buy_Order_Opened}{' '}{

                                      new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                      ) :
                                      new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                      ) : (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                      )
                                    }



                                  </p>


                                )}

                              </div>



                              {/* share button */}
                              {/*
                              <button
                                className="text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                                onClick={() => {

                                  window.open(`https://gold.goodtether.com/${params.lang}/sell-usdt/${item._id}`, '_blank');

                                }}
                              >
                                <Image
                                  src="/icon-share.png"
                                  alt="Share"
                                  width={20}
                                  height={20}
                                />
                              </button>
                              */}


                            </div>


                            {24 - Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) > 0 ? (

                              <div className="mt-2 flex flex-row items-center space-x-2">
                                <Image
                                  src="/icon-timer.webp"
                                  alt="Timer"
                                  width={28}
                                  height={28}
                                />
                                <p className="text-sm text-zinc-500">{Expires_in} {

                                  24 - Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) - 1

                                  } {hours} {
                                    60 - Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) % 60
                                  } {minutes}

                                </p>
                              </div>

                            ) : (
                              <div className="mt-2 flex flex-row items-center space-x-2">
                                {/*
                                <Image
                                  src="/icon-timer.webp"
                                  alt="Expired"
                                  width={28}
                                  height={28}
                                />
                                <p className="text-sm text-zinc-500">Expired</p>
                                */}
                              </div>
                            )}

                        </div>

                      )}





                      { (item.status === 'accepted' || item.status === 'paymentRequested' || item.status === 'cancelled') && (
                          
                        <div className={`
                          ${item.status !== 'cancelled' && 'h-16'}

                          mb-4 flex flex-row items-center bg-zinc-800 px-2 py-1 rounded-md`}>
                            <Image
                              src="/icon-trade.png"
                              alt="Trade"
                              width={32}
                              height={32}
                            />


                            <p className="text-sm font-semibold text-[#409192] ">
                              {item.tradeId}
                            </p>

                            {item.status === 'cancelled' ? (
                              <p className="ml-2 text-sm text-zinc-500">
                                {new Date(item.acceptedAt)?.toLocaleString()}
                              </p>
                            ) : (
                              
                              <>
                                {params.lang === 'ko' ? (

                                  <p className="ml-2 text-sm text-zinc-500">

                                  
                                    {new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000) + ' ' + seconds_ago
                                    ) :
                                    new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                    ) : (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                    )
                                    }{' '}{Trade_Started}

                                  </p>



                                ) : (

                                  <p className="ml-2 text-sm text-zinc-500">

                                    {Trade_Started} {
                                      new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000) + ' ' + seconds_ago
                                      ) :
                                      new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                      ) : (
                                        ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                      )
                                    }

                                  </p>

                                )}




                              </>
                            
                            )}



                              {/* share button */}
                              <button
                                className="ml-5 text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                                onClick={() => {

                                  //window.open(`https://gold.goodtether.com/${params.lang}/${"admin"}/sell-usdt/${item._id}`, '_blank');

                                  // copy to clipboard

                                  navigator.clipboard.writeText(`https://gold.goodtether.com/${params.lang}/${"admin"}/sell-usdt/${item._id}`);

                                  toast.success('Link copied to clipboard');

                                }}
                              >
                                <Image
                                  src="/icon-share.png"
                                  alt="Share"
                                  width={20}
                                  height={20}
                                />
                              </button>



                          </div>
                      )}


                        {/*
                        
                        {item.acceptedAt && (
                          <p className="mb-2 text-sm text-zinc-500">
                            Trade started at {new Date(item.acceptedAt).toLocaleDateString() + ' ' + new Date(item.acceptedAt).toLocaleTimeString()}
                          </p>
                        )}
                        */}




                      {item.status === 'cancelled' && (
                          <div className="mt-4 flex flex-row items-center gap-2">
                            <Image
                              src='/icon-cancelled.webp'
                              alt='cancel'
                              width={20}
                              height={20}
                            />
                            <p className="text-sm text-red-500">
                              {Cancelled_at} {
                                new Date(item.cancelledAt).toLocaleDateString() + ' ' + new Date(item.cancelledAt).toLocaleTimeString()
                              }
                            </p>
                          </div>
                        )}




              

                        <div className="mt-4 flex flex-col items-start">



                          <p className="text-xl text-zinc-500"
                            style={{ fontFamily: 'monospace' }}>
                            {Price}: {
                              // currency
                            
                              Number(item.krwAmount)?.toLocaleString() + ' 원'

                            }
                          </p>

                          <div className="mt-2 flex flex-row items-start gap-2">

                            <p className="text-xl font-semibold text-zinc-500">
                              {item.usdtAmount}{' '}USDT
                            </p>
                            <p className="text-lg font-semibold text-zinc-500">{Rate}: {

                              Number(item.krwAmount / item.usdtAmount).toFixed(3)

                              }</p>
                          </div>


                        </div>

                

                        <div className="mb-4 flex flex-col items-start text-sm ">
                          {Payment}: {Bank_Transfer} ({item.seller?.bankInfo?.bankName})
                        </div>



                        <div className="flex flex-col items-start justify-start gap-2">
                          <p className="mt-2 mb-2 flex items-center gap-2">

                            <Image
                                src={item.avatar || '/icon-user.png'}
                                alt="Avatar"
                                width={32}
                                height={32}
                                priority={true} // Added priority property
                                className="rounded-full"
                                style={{
                                    objectFit: 'cover',
                                    width: '32px',
                                    height: '32px',
                                }}
                            />

                            <div className="flex flex-col gap-2 items-start">
                              <div className="flex items-center space-x-2">{Buyer}:</div>

                              <div className="text-sm font-semibold">
                                {item.nickname}
                              </div>
                              <div className="text-lg text-[#409192]">
                                {item.buyer?.depositName}
                              </div>
                            </div>

                            <Image
                              src="/verified.png"
                              alt="Verified"
                              width={20}
                              height={20}
                              className="rounded-lg"
                            />

                            <Image
                              src="/best-buyer.png"
                              alt="Best Buyer"
                              width={20}
                              height={20}
                              className="rounded-lg"
                            />

                          </p>


                          {address && item.walletAddress !== address && item?.buyer && item?.buyer?.walletAddress === address && (
                            <button
                              className="bg-green-500 text-white px-4 py-2 rounded-lg"
                              onClick={() => {
                                  //console.log('Buy USDT');
                                  // go to chat
                                  // close modal
                                  //closeModal();
                                  ///goChat(item._id, item.tradeId);

                                  router.push(`/${params.lang}/${"admin"}/sell-usdt/${item._id}`);

                              }}
                            >
                              {Chat_with_Buyer + ' ' + item.nickname}
                            </button>
                          )}


                        </div>




                        {/* buyer cancelled the trade */}
                        {item.status === 'cancelled' && (
                          <div className="mt-4 flex flex-col gap-2 items-start justify-center">
                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src={item?.buyer?.avatar || "/icon-user.png"}
                                alt="Profile Image"
                                width={32}
                                height={32}
                                priority={true} // Added priority property
                                className="rounded-full"
                                style={{
                                    objectFit: 'cover',
                                    width: '32px',
                                    height: '32px',
                                }}
                              />
                              <p className="text-sm text-red-500 font-semibold">
                                {Buyer}: {
                                  address && item?.buyer?.nickname ? item?.buyer?.nickname : Anonymous
                                }
                              </p>

                            </div>


                          </div>
                        )}



                        {(item.status === 'accepted' || item.status === 'paymentRequested') && (
                    
                          <div className="mt-4 flex flex-row items-center gap-2">
                            <Image
                              src={item.seller?.avatar || "/icon-seller.png"}
                              alt="Profile Image"
                              width={32}
                              height={32}
                              priority={true} // Added priority property
                              className="rounded-full"
                              style={{
                                  objectFit: 'cover',
                                  width: '32px',
                                  height: '32px',
                              }}
                            />
                            <p className="text-xl text-[#409192] font-semibold">
                              {Seller}: {
                                item.seller?.nickname
                              }
                            </p>
                            <Image
                              src="/verified.png"
                              alt="Verified"
                              width={20}
                              height={20}
                              className="rounded-lg"
                            />
                          </div>
                        
                        )}
                      

                        {/* waiting for escrow */}
                        {item.status === 'accepted' && (



                          <div className="mt-4 flex flex-col gap-2 items-center justify-start">


                              
                              
                            <div className="mt-4 flex flex-row gap-2 items-center justify-start">
                              <Image
                                src="/icon-loading.png"
                                alt="Escrow"
                                width={32}
                                height={32}
                                className="animate-spin"
                              />

                              <div className="flex flex-col gap-2 items-start">
                                <span>
                                  {Waiting_for_seller_to_deposit} {item.usdtAmount} USDT {to_escrow}...
                                </span>

                                <span className="text-sm text-zinc-500">

                                  {If_the_seller_does_not_deposit_the_USDT_to_escrow},

                                  {this_trade_will_be_cancelled_in} {

                                    (1 - Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) - 1) > 0
                                    ? (1 - Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) - 1) + ' ' + hours
                                    : (60 - Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60) % 60) + ' ' + minutes

                                  } 

                                </span>
                              </div>
                            </div>





                            {item.buyer?.walletAddress === address && (

                              <div className="mt-4 flex flex-col items-center justify-center gap-2">



                                <div className="flex flex-row items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={agreementForCancelTrade[index]}
                                    onChange={(e) => {
                                      setAgreementForCancelTrade(
                                        buyOrders.map((item, idx) => {
                                          if (idx === index) {
                                            return e.target.checked;
                                          } else {
                                            return false;
                                          }
                                        })
                                      );
                                    }}
                                  />
                                  <label className="text-sm text-zinc-500">
                                    {I_agree_to_cancel_the_trade}
                                  </label>
                                </div>


                                <div className="mt-5 flex flex-row items-center gap-2">

                                  <button
                                    disabled={cancellings[index] || !agreementForCancelTrade[index]}
                                    className={`text-sm bg-red-500 text-white px-2 py-1 rounded-md ${cancellings[index] || !agreementForCancelTrade[index] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                                    onClick={() => {

                                      cancelTrade(item._id, index);

                                    }}
                                  >

                                    <div className="flex flex-row items-center gap-2 px-2 py-1">
                                      {cancellings[index] ? (
                                        <div className="
                                          w-4 h-4
                                          border-2 border-zinc-800
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
                                      ) : (
                                        <Image
                                          src="/icon-cancelled.png"
                                          alt="Cancel"
                                          width={16}
                                          height={16}
                                        />
                                      )}
                                      {Cancel_My_Trade}
                                    </div>
                                      
                                  
                                  </button>
                                </div>

                              </div>

                            )}


                          </div>
                        )}



                        {/* if status is accepted, show payment request button */}
                        {item.status === 'paymentConfirmed' && (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-[#409192]">
                              {Completed}
                            </span>
                            <span>{
                              item.paymentConfirmedAt && new Date(item.paymentConfirmedAt)?.toLocaleString()
                            }</span>
                          </div>
                        )}

                        {
                        item.seller && item.seller.walletAddress === address &&
                        item.status === 'accepted' && (
                          <div className="flex flex-row gap-1">

                            {/* check box for agreement */}
                            <input
                              disabled={escrowing[index] || requestingPayment[index]}
                              type="checkbox"
                              checked={requestPaymentCheck[index]}
                              onChange={(e) => {
                                setRequestPaymentCheck(
                                  requestPaymentCheck.map((item, idx) => {
                                    if (idx === index) {
                                      return e.target.checked;
                                    }
                                    return item;
                                  })
                                );
                              }}
                            />

                            <button
                              disabled={escrowing[index] || requestingPayment[index] || !requestPaymentCheck[index]}
                              
                              className={`flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md ${escrowing[index] || requestingPayment[index] || !requestPaymentCheck[index] ? 'bg-gray-500' : 'bg-green-500'}`}
                              onClick={() => {

                                requestPayment(
                                  index,
                                  item._id,
                                  item.tradeId,
                                  item.usdtAmount,
                                  item.storecode,

                                  item.seller?.bankInfo,
                                );
                              }}
                            >
                              <Image
                                src="/icon-loading.png"
                                alt="loading"
                                width={16}
                                height={16}
                                className={escrowing[index] || requestingPayment[index] ? 'animate-spin' : 'hidden'}
                              />
                              <span>{Request_Payment}</span>
                            
                            </button>

                          </div>
                        )}


                        {/* waiting for payment */}
                        {item.status === 'paymentRequested' && (

                            <div className="mt-4 flex flex-col gap-2 items-start justify-start">

                              <div className="flex flex-row items-center gap-2">

                                <Image
                                  src="/smart-contract.png"
                                  alt="Smart Contract"
                                  width={32}
                                  height={32}
                                />
                                <div>{Escrow}: {item.usdtAmount} USDT</div>
                                <button
                                  className="bg-white text-black px-2 py-2 rounded-md"

                                  onClick={() => {
                                    let url = '';
                                    if (chain === "ethereum") {
                                      url = `https://etherscan.io/tx/${item.escrowTransactionHash}`;
                                    } else if (chain === "polygon") {
                                      url = `https://polygonscan.com/tx/${item.escrowTransactionHash}`;
                                    } else if (chain === "arbitrum") {
                                      url = `https://arbiscan.io/tx/${item.escrowTransactionHash}`;
                                    } else if (chain === "bsc") {
                                      url = `https://bscscan.com/tx/${item.escrowTransactionHash}`;
                                    } else {
                                      url = `https://arbiscan.io/tx/${item.escrowTransactionHash}`;
                                    }
                                    window.open(url, '_blank');
                                  }}

                                >
                                  <Image
                                    src='/logo-arbitrum.png'
                                    alt="Chain"
                                    width={20}
                                    height={20}
                                  />
                                </button>
                              </div>

                              <div className="flex flex-row gap-2 items-center justify-start">

                                {/* rotate loading icon */}
                              
                                <Image
                                  src="/icon-loading.png"
                                  alt="Escrow"
                                  width={32}
                                  height={32}
                                  className="animate-spin"
                                />

                                <div>Waiting for buyer to send {
                                item.krwAmount?.toLocaleString('ko-KR', {
                                  style: 'currency',
                                  currency: 'KRW',
                                })} to seller...</div>
                              

                              </div>


                            </div>
                        )}



                      





                        {item.status === 'ordered' && (
                          <>

                          {acceptingBuyOrder[index] ? (

                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src='/icon-loading.png'
                                alt='loading'
                                width={35}
                                height={35}
                                className="animate-spin"
                              />
                              <div>{Accepting_Order}...</div>
                            </div>


                          ) : (
                            <>
                              
                              {item.walletAddress === address ? (
                                <div className="flex flex-col space-y-4">
                                  {My_Order}
                                </div>
                              ) : (
                                <div className="w-full flex items-center justify-center">

                                  {item.status === 'ordered' && (
                                    
                                    // check if the order is expired
                                    new Date().getTime() - new Date(item.createdAt).getTime() > 1000 * 60 * 60 * 24

                                  ) ? (

                                    <>
                                      {/*
                                      <Image
                                        src="/icon-expired.png"
                                        alt="Expired"
                                        width={80}
                                        height={80}
                                      />
                                      */}
                                  
                                  </>
                                  ) : (
                                    <>

                                      {user?.seller && user?.seller?.bankInfo && (

          

                                        <div className="mt-4 flex flex-col items-center justify-center">

                                          {/* agreement for trade */}
                                          <div className="flex flex-row items-center space-x-2">
                                            <input
                                              disabled={!address}
                                              type="checkbox"
                                              checked={agreementForTrade[index]}
                                              onChange={(e) => {
                                                  setAgreementForTrade(
                                                      buyOrders.map((item, idx) => {
                                                          if (idx === index) {
                                                              return e.target.checked;
                                                          } else {
                                                              return false;
                                                          }
                                                      })
                                                  );
                                              }}
                                            />
                                            <label className="text-sm text-zinc-500">
                                              {I_agree_to_the_terms_of_trade}
                                            </label>
                                          </div>



                                          {/* input sms receiver mobile number */}

                                          {address && agreementForTrade[index] && (
                                            <div className="mt-8 flex flex-row items-center justify-start gap-2">

                                              <span className="text-sm text-zinc-500">SMS</span>

                                              <div className="flex flex-col items-start justify-start">
                                                <input
                                                  disabled={!address || !agreementForTrade[index]}
                                                  type="text"
                                                  placeholder="SMS Receiver Mobile Number"
                                                  className={`w-full px-4 py-2 rounded-md text-black`}
                                                  value={smsReceiverMobileNumber}
                                                  onChange={(e) => {
                                                      setSmsReceiverMobileNumber(e.target.value);
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )}

                                          <button
                                            disabled={!address || !agreementForTrade[index]}
                                            className={`m-10 text-lg text-white px-4 py-2 rounded-md
                                              ${!address || !agreementForTrade[index] ? 'bg-zinc-800' : 'bg-green-500 hover:bg-green-600'}
                                              `}
                                            onClick={() => {
  
                                                acceptBuyOrder(index, item._id, smsReceiverMobileNumber, item.tradeId, item.walletAddress)
                                          

                                            }}
                                          >
                                            {Buy_Order_Accept} {item.usdtAmount} USDT
                                          </button>


                                        </div>

                                      )}

                                    </>

                                  )}

                                </div>



                                )}

                              </>

                            )}

                          </>

                        )}



                    </article>




                    {/* status */}
                    {/*
                    <div className="absolute bottom-4 right-4 flex flex-row items-start justify-start">
                      <div className="text-sm text-zinc-500">
                        {item.status === 'ordered' ? 'Order opened at ' + new Date(item.createdAt)?.toLocaleString()
                        : item.status === 'accepted' ? 'Trade started at ' + new Date(item.acceptedAt)?.toLocaleString()
                        : item.status === 'paymentRequested' ? 'Payment requested at ' + new Date(item.paymentRequestedAt)?.toLocaleString()
                        : item.status === 'cancelled' ? 'Trade cancelled at ' + new Date(item.cancelledAt)?.toLocaleString()
                        : item.status === 'paymentConfirmed' ? 'Trade completed at ' + new Date(item.paymentConfirmedAt)?.toLocaleString()
                        : 'Unknown'}
                      </div>
                    </div>
                    */}






                  </div>
            
                ))}

            </div>

          )}

          


        </div>

      

        {/* pagination */}
        {/* url query string */}
        {/* 1 2 3 4 5 6 7 8 9 10 */}
        {/* ?limit=10&page=1 */}
        {/* submit button */}
        {/* totalPage = Math.ceil(totalCount / limit) */}
        <div className="hidden
        mt-4 flex-row items-center justify-center gap-4">


          <div className="flex flex-row items-center gap-2">
            <select
              value={limitValue}
              onChange={(e) =>
                router.push(`/${params.lang}/administration/buyorder?storecode=${searchStorecode}&limit=${Number(e.target.value)}&page=${pageValue}`)
              }

              className="text-sm bg-zinc-800 text-zinc-200 px-2 py-1 rounded-md"
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
              router.push(`/${params.lang}/administration/buyorder?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=1`)
            }}
          >
            처음으로
          </button>


          <button
            disabled={Number(pageValue) <= 1}
            className={`text-sm text-white px-4 py-2 rounded-md ${Number(pageValue) <= 1 ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={() => {

              router.push(`/${params.lang}/administration/buyorder?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=${Number(pageValue) - 1}`)


            }}
          >
            이전
          </button>


          <span className="text-sm text-zinc-500">
            {pageValue} / {Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}
          </span>


          <button
            disabled={Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}
            className={`text-sm text-white px-4 py-2 rounded-md ${Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue)) ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={() => {

              router.push(`/${params.lang}/administration/buyorder?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=${Number(pageValue) + 1}`)

            }}
          >
            다음
          </button>

          {/* 마지막으로 */}
          <button
            disabled={Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}
            className={`text-sm text-white px-4 py-2 rounded-md ${Number(pageValue) >= Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue)) ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={() => {

              router.push(`/${params.lang}/administration/buyorder?storecode=${searchStorecode}&limit=${Number(limitValue)}&page=${Math.ceil(Number(buyOrderStats.totalCount) / Number(limitValue))}`)

            }}
          >
            마지막으로
          </button>

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
        className="border border-zinc-300 rounded-lg"
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

      <div className="max-w-2xl mx-auto bg-slate-800 shadow-2xl rounded-lg p-6 border border-slate-700">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-emerald-500 mr-2"></span>
          <h2 className="text-lg font-semibold text-slate-100 ">Iskan9</h2>
          <span className="ml-2 text-blue-400 text-sm">318 trades</span>
        </div>
        <p className="text-slate-400 mt-2">The offer is taken from another source. You can only use chat if the trade is open.</p>
        
        <div className="mt-4">
          <div className="flex justify-between text-slate-300">
            <span>Price</span>
            <span>{price} KRW</span>
          </div>
          <div className="flex justify-between text-slate-300 mt-2">
            <span>Limit</span>
            <span>40680.00 KRW - 99002.9 KRW</span>
          </div>
          <div className="flex justify-between text-slate-300 mt-2">
            <span>Available</span>
            <span>1085.91 USDT</span>
          </div>
          <div className="flex justify-between text-slate-300 mt-2">
            <span>Seller&apos;s payment method</span>
            <span className="bg-slate-700 text-amber-400 px-2 rounded-full border border-slate-600">Tinkoff</span>
          </div>
          <div className="mt-4 text-slate-300">
            <p>24/7</p>
          </div>
        </div>
  
        <div className="mt-6 border-t border-slate-700 pt-4 text-slate-300">
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-slate-300 font-medium">I want to pay</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(
                    e.target.value === '' ? 0 : parseInt(e.target.value)
                ) }

                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium">I will receive</label>
              <input 
                type="text"
                value={`${receiveAmount} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium">Commission</label>
              <input 
                type="text"
                value={`${commission} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg border border-slate-600 shadow-md"
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


