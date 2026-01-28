'use client';

import type { GetStaticProps, InferGetStaticPropsType } from 'next';



import { useState, useEffect, use } from "react";



import { toast } from 'react-hot-toast';

import { client } from "../../../client";

import {
    getContract,
    sendAndConfirmTransaction,
} from "thirdweb";



import {
    polygon,
    arbitrum,
} from "thirdweb/chains";

import {
    ConnectButton,
    useActiveAccount,
    useActiveWallet,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";


import { getUserPhoneNumber } from "thirdweb/wallets/in-app";


import Image from 'next/image';

import GearSetupIcon from "@/components/gearSetupIcon";


import Uploader from '@/components/uploader';

import { balanceOf, deposit, transfer } from "thirdweb/extensions/erc20";
 






// open modal

import Modal from '@/components/modal';

import { useRouter }from "next//navigation";

import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../dictionaries";
import { Pay } from 'twilio/lib/twiml/VoiceResponse';




import { useSearchParams } from "next/navigation";
import { parse } from 'path';



import { clientId } from "../../../client";




interface SellOrder {
  _id: string;
  createdAt: string;
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

  walletAddress: string;

  seller: any;


  status: string;

  acceptedAt: string;
  paymentRequestedAt: string;
  paymentConfirmedAt: string;

  tradeId: string;

  buyer: any;

  privateSale: boolean;


  escrowTransactionHash: string;
  transactionHash: string;
}





const wallets = [
  inAppWallet({
    auth: {
      options: ["phone", "email"],
    },
  }),
];


const recipientWalletAddress = "0x2111b6A49CbFf1C8Cc39d13250eF6bd4e1B59cF6";


const contractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon
const contractAddressArbitrum = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum




export default function Index({ params }: any) {

    //console.log('params', params);

    // get params

    const searchParams = useSearchParams();

    const storeUser = searchParams.get('storeUser');

    console.log('storeUser', storeUser);


    //const storecode = storeUser?.split('@').slice(-1)[0];
    //const memberid = storeUser?.split('@').slice(0, -1).join('@');

    
    const storecode = params?.center;

    console.log("storecode", storecode);

    const memberid = storeUser;
  
    console.log("memberid", memberid);

  


  

    const paramDepositName = decodeURIComponent(searchParams.get('depositName') || '');
    const paramDepositBankName = decodeURIComponent(searchParams.get('depositBankName') || '');
    const paramDepositBankAccountNumber = searchParams.get('depositBankAccountNumber');


    const paramDepositAmountKrw = searchParams.get('depositAmountKrw');


    useEffect(() => {
      // Dynamically load the Binance widget script
      const script = document.createElement("script");
      script.src = "https://public.bnbstatic.com/unpkg/growth-widget/cryptoCurrencyWidget@0.0.20.min.js";
      script.async = true;
      document.body.appendChild(script);
  
      return () => {
        // Cleanup the script when the component unmounts
        document.body.removeChild(script);
      };
    }, []);



    const contract = getContract({
      // the client you have created via `createThirdwebClient()`
      client,
      // the chain the contract is deployed on
      
      
      chain: arbitrum,
    
    
    
      // the contract's address
      ///address: contractAddressArbitrum,
  
      address: contractAddressArbitrum,
  
  
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
      Total: "",
      Orders: "",
      Trades: "",
      Search_my_trades: "",
  
      Seller: "",
      Buyer: "",
      Me: "",

      Price: "",
      Amount: "",
      Rate: "",
  
      Go_Buy_USDT: "",
      Go_Sell_USDT: "",

      Disconnect_Wallet: "",

      My_Order: "",

      Payment: "",
      Bank_Transfer: "",


      hours: "",
      minutes: "",
      seconds: "",

      hours_ago: "",
      minutes_ago: "",
      seconds_ago: "",

      Waiting_for_seller_to_deposit: "",
      to_escrow: "",

      If_you_request_payment: "",
      I_agree_to_escrow_USDT: "",


 
      Bank_Name: "",
      Account_Number: "",
      Account_Holder: "",
      Deposit_Name: "",
      Deposit_Amount: "",
      Deposit_Deadline: "",

      Waiting_for_seller_to_confirm_payment: "",

      Confirm_Payment: "",

      Connect_Wallet_Description_For_Buyers: "",

      I_agree_to_the_terms_of_trade: "",

      Requesting_Payment: "",

      Deposit_Information: "",

      Request_Payment: "",

      Checking_the_bank_transfer_from_the_buyer: "",

      I_agree_to_check_the_bank_transfer_of: "",

      Transfering_USDT_to_the_buyer_wallet_address: "",

      Anonymous: "",

      TID: "",

      Escrow: "",

      Profile: "",
      My_Profile_Picture: "",
  
      Edit: "",


      Cancel: "",
      Save: "",
      Enter_your_nickname: "",

      Nickname_should_be_5_10_characters: "",

      You_must_have_a_wallet_address_to_buy_USDT: "",
      Make_Wallet_Address: "",

      My_Wallet_Address: "",

      PRICE_10000_KRW: "",
      PRICE_50000_KRW: "",
      PRICE_100000_KRW: "",
      PRICE_300000_KRW: "",
      PRICE_500000_KRW: "",
      PRICE_1000000_KRW: "",
      PRICE_5000000_KRW: "",
      PRICE_10000000_KRW: "",

      Please_keep_Your_Wallet_address_safe: "",

      Waiting_for_the_USDT_to_be_sent_to_the_store_address: "",
      Successfully_sent_USDT_to_the_store_address: "",

      Order_accepted_successfully: "",

      Order_Opened: "",
      Trade_Started: "",

      When_the_deposit_is_completed: "",

      Completed_at: "",

      Please_enter_deposit_name: "",

      Copy: "",

      Your_wallet_address_is_copied: "",

      Charge: "",

      Deposit_name_description: "",

      Deposit_Confirmed: "",

      Account_number_has_been_copied: "",

      Payment_name_has_been_copied: "",

      Payment_amount_has_been_copied: "",

      My_Balance: "",


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
      Total,
      Orders,
      Trades,
      Price,
      Amount,
      Rate,

      Search_my_trades,
      Seller,
      Buyer,
      Me,
      Go_Buy_USDT,
      Go_Sell_USDT,

      Disconnect_Wallet,

      My_Order,

      Payment,
      Bank_Transfer,

      hours,
      minutes,
      seconds,

      hours_ago,
      minutes_ago,
      seconds_ago,

      Waiting_for_seller_to_deposit,
      to_escrow,

      If_you_request_payment,
      I_agree_to_escrow_USDT,

      Bank_Name,
      Account_Number,
      Account_Holder,
      Deposit_Name,
      Deposit_Amount,
      Deposit_Deadline,

      Waiting_for_seller_to_confirm_payment,

      Confirm_Payment,

      Connect_Wallet_Description_For_Buyers,

      I_agree_to_the_terms_of_trade,

      Requesting_Payment,

      Deposit_Information,

      Request_Payment,

      Checking_the_bank_transfer_from_the_buyer,

      I_agree_to_check_the_bank_transfer_of,

      Transfering_USDT_to_the_buyer_wallet_address,

      Anonymous,

      TID,

      Escrow,

      Profile,
      My_Profile_Picture,

      Edit,

      Cancel,
      Save,
      Enter_your_nickname,

      Nickname_should_be_5_10_characters,

      You_must_have_a_wallet_address_to_buy_USDT,
      Make_Wallet_Address,

      My_Wallet_Address,

      PRICE_10000_KRW,
      PRICE_50000_KRW,
      PRICE_100000_KRW,
      PRICE_300000_KRW,
      PRICE_500000_KRW,
      PRICE_1000000_KRW,
      PRICE_5000000_KRW,
      PRICE_10000000_KRW,

      Please_keep_Your_Wallet_address_safe,

      Waiting_for_the_USDT_to_be_sent_to_the_store_address,
      Successfully_sent_USDT_to_the_store_address,

      Order_accepted_successfully,

      Order_Opened,
      Trade_Started,

      When_the_deposit_is_completed,

      Completed_at,

      Please_enter_deposit_name,

      Copy,

      Your_wallet_address_is_copied,

      Charge,

      Deposit_name_description,

      Deposit_Confirmed,

      Account_number_has_been_copied,

      Payment_name_has_been_copied,

      Payment_amount_has_been_copied,

      My_Balance,

    } = data;
   
 
 
 
 
  const router = useRouter();
    

  //const orderId = params.orderId as string;

  const orderId = "0";
  
  console.log('orderId', orderId);


 

    // get the active wallet
    const activeWallet = useActiveWallet();




  const smartAccount = useActiveAccount();


  //const address = smartAccount?.address || "";

  const [address, setAddress] = useState(
    smartAccount?.address || ""
  );




    const [balance, setBalance] = useState(0);
    useEffect(() => {

      if (!address) {
        return;
      }
  
      // get the balance
      const getBalance = async () => {
        const result = await balanceOf({
          contract,
          address: address,
        });
    
        //console.log(result);
    
        setBalance( Number(result) / 10 ** 6 );
  
      };
  
      if (address) getBalance();
  
      const interval = setInterval(() => {
        if (address) getBalance();
      } , 5000);

      return () => clearInterval(interval);
  
    } , [address, contract]);




    

    // fetch store info by storecode
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [loadingStoreInfo, setLoadingStoreInfo] = useState(true);
    useEffect(() => {
      const fetchStoreInfo = async () => {
        if (!storecode) {
          return;
        }

        setLoadingStoreInfo(true);
        const response = await fetch('/api/store/getOneStore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode: storecode,
          }),
        });

        if (!response) {
          setLoadingStoreInfo(false);
          toast.error('가맹점 정보를 가져오는 데 실패했습니다.');
          return;
        }
  
        const data = await response?.json();
  
        //console.log('data', data);
  
        if (data.result) {
          setStoreInfo(data.result);
        }
  
        setLoadingStoreInfo(false);
      };
  
      fetchStoreInfo();
    }, [storecode]);

    /*
    {
    "_id": "681b3cd4b6da3a9ffe0f7831",
    "storecode": "wmipqryz",
    "storeName": "비고비",
    "storeType": "test",
    "storeUrl": "https://test.com",
    "storeDescription": "설명입니다.",
    "storeLogo": "https://crypto-ex-vienna.vercel.app/logo.png",
    "storeBanner": "https://crypto-ex-vienna.vercel.app/logo.png",
    "createdAt": "2025-05-07T10:58:28.019Z"
    }
    */






    /*
    const [totalSummary, setTotalSummary] = useState<any>(null);
    const [loadingSummary, setLoadingSummary] = useState(true);
  
   
  
    useEffect(() => {
  
      const fetchTotalSummary = async () => {
  
        console.log('fetchTotalSummary=======>');
  
        try {
    
          setLoadingSummary(true);
          const response = await fetch('/api/summary/getTotalSummary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {
                //searchStore: searchStore,
              }
            ),
          });
  
  
  
  
          if (!response.ok) {
            setLoadingSummary(false);
            toast.error('Failed to fetch total summary');
            console.log('Failed to fetch total summary');
            return;
          }
          const data = await response.json();
          
          console.log('getStoreSummary data', data);
      
          setTotalSummary(data.result);
  
        } catch (error) {
          console.error('Error fetching total summary:', error);
          toast.error('Error fetching total summary');
        } finally {
      
          setLoadingSummary(false);
  
        }
    
      }
  
      fetchTotalSummary();
  
      // interval
      const interval = setInterval(() => {
        fetchTotalSummary();
      }, 10000);
      return () => clearInterval(interval);
  
  
      
    }, []);

    */




   


    const [nickname, setNickname] = useState(storeUser);

    const [inputNickname, setInputNickname] = useState('');


   // select krw amount (10000, 50000, 100000, 300000, 500000, 1000000, 5000000, 10000000)

   const [krwAmounts, setKrwAmounts] = useState([10000, 50000, 100000, 300000, 500000, 1000000, 5000000, 10000000]);
   // select one of krw amount

   const [selectedKrwAmount, setSelectedKrwAmount] = useState(0);


   useEffect(() => {
      if (paramDepositAmountKrw) {
        setSelectedKrwAmount(Number(paramDepositAmountKrw));
      } else {
        setSelectedKrwAmount(0);
      }
   }, [paramDepositAmountKrw]);









   const [depositName, setDepositName] = useState(
     ////randomDepositName[Math.floor(Math.random() * randomDepositName.length)]
     paramDepositName
   );

   const [depositBankName, setDepositBankName] = useState(
     //koreanBankName[Math.floor(Math.random() * koreanBankName.length)]
     paramDepositBankName
   );

   const [depositBankAccountNumber, setDepositBankAccountNumber] = useState(
     paramDepositBankAccountNumber
   );

   const [depositAmountKrw, setDepositAmountKrw] = useState(
      paramDepositAmountKrw
    );



    const [loadingUser, setLoadingUser] = useState(true);
    const [user, setUser] = useState<any>(null);





    // set user payment info
    // /api/user/setUserPaymentInfoByStorecode

    useEffect(() => {
      const setUserPaymentInfo = async () => {
        const response = await fetch('/api/payment/setUserPaymentInfoByStorecode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode: storecode,
            nickname: nickname,
            paymentInfo: {
              depositName: depositName,
              depositBankName: depositBankName,
              depositBankAccountNumber: depositBankAccountNumber,
              depositAmountKrw: depositAmountKrw,
            },
          }),
        });

        if (!response.ok) {
          console.error('Failed to set user payment info');
          return;
        }

        const data = await response.json();
        console.log('User payment info set successfully:', data);


        // router to
        // 'https://t.me/goodtether_user_bot' + '?start=' + storecode + '_' + storeUser
        
        //router.push('https://t.me/goodtether_user_bot' + '?start=' + storecode + '_' + storeUser);

        if (clientId === '213e1813510d42bf66a4136dcc90b032') {
          router.push('https://t.me/goodtether_user_bot' + '?start=' + storecode + '_' + storeUser);
        } else if (clientId === '95034cfeb204ef7777ecfe26c110a6ca') {
          router.push('https://t.me/goodtether_golden_user_bot' + '?start=' + storecode + '_' + storeUser);
        } else if (clientId === '5940b4b6011fd9f3302f40912883c1fc') {
          router.push('https://t.me/goodtether_maga_user_bot' + '?start=' + storecode + '_' + storeUser);
        }

      };

      setUserPaymentInfo();
    }, [storecode, nickname, depositName, depositBankName, depositBankAccountNumber, depositAmountKrw]);








   /*
    const fetchWalletAddress = async (
      paramNickname: string
    ) => {

      if (nickname) {
        return;
      }


      const mobile = '010-1234-5678';


      const response = await fetch('/api/user/setUserWithoutWalletAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: storecode,
          nickname: paramNickname,
          mobile: mobile,
        }),
      });
  
      const data = await response?.json();
  
      console.log('setUserWithoutWalletAddress data', data);

      if (!data.walletAddress) {

        toast.error('User registration has been failed');
        return;
      }

      const walletAddress = data.walletAddress;

      setAddress(walletAddress);

      setNickname(paramNickname);


    }
    */

 

    // user walletAddress is auto generated or not
    const [isMyWalletAddress, setIsMyWalletAddress] = useState(false);
    const [userPassword, setUserPassword] = useState('');

    
    useEffect(() => {

      const fetchWalletAddress = async ( ) => {

        setLoadingUser(true);
  
        const mobile = '010-1234-5678';
  
        /*
        const response = await fetch('/api/user/setUserWithoutWalletAddress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode: storecode,
            nickname: nickname,
            mobile: mobile,
          }),
        });
        */

        const response = await fetch('/api/user/setBuyerWithoutWalletAddressByStorecode', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              storecode: storecode,
              
              userCode: storeUser,
              mobile: mobile,
    
              userName: depositName,
              userBankName: depositBankName,
              userBankAccountNumber: depositBankAccountNumber,
              userType: 'abc',
            }
          ),
        });

        if (!response) {
          setLoadingUser(false);
          toast.error('회원등록에 실패했습니다.');
          console.log('회원등록에 실패했습니다.');
          return;
        }

    
        const data = await response?.json();
    
        console.log('setBuyerWithoutWalletAddressByStorecode data', data);
  
        if (!data.walletAddress) {
          setLoadingUser(false);
          toast.error('회원등록에 실패했습니다.');
          return;
        }
  
   
  
        setAddress(data.walletAddress);
        


        setUser({
          storecode: storecode,
          walletAddress: data.walletAddress,
          nickname: storeUser,
          avatar: '',
          mobile: mobile,
        });





        // check if user buy order by nickname and storecode
           // get one buy order by nickname and storecode
        const responseGetOneBuyOrder = await fetch('/api/order/getOneBuyOrderByNicknameAndStorecode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            storecode: storecode,
            nickname: nickname,
          })
        });
        const dataGetBuyOrder = await responseGetOneBuyOrder.json();
        //console.log('acceptSellOrderRandom dataGetBuyOrder', dataGetBuyOrder);
        if (dataGetBuyOrder.result) {
          const order = dataGetBuyOrder.result;

          router.push('/' + params.lang + '/' + storecode + '/pay-usdt-reverse/' + order._id);
          return;
        }

        setLoadingUser(false);
      }
  

      if (isMyWalletAddress === false) {

        fetchWalletAddress();
        
      }


    } , [isMyWalletAddress, storecode, storeUser,  depositName, depositBankName, depositBankAccountNumber]);
    


    ///console.log('isMyWalletAddress', isMyWalletAddress);










    // set user wallet address
    // /api/user/setUserWithoutWalletAddress
    const setUserWalletAddress = async () => {
        
      if (!nickname) {
        toast.error('Please enter your nickname');
        return;
      }

      if (!userPassword) {
        toast.error('Please enter your password');
        return;
      }

      const mobile = '010-1234-5678';

      const response = await fetch('/api/user/setUserWithoutWalletAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: storecode,
          nickname: nickname,
          mobile: mobile,
          password: userPassword,
        }),
      });

      const data = await response?.json();

      console.log('setUserWithoutWalletAddress data', data);

      if (!data.walletAddress) {

        toast.error('User registration has been failed');
        return;
      }

      const walletAddress = data.walletAddress;

      console.log('walletAddress', walletAddress);

      setAddress(walletAddress);

      setUser({
        walletAddress: address,
        nickname: nickname,
        avatar: '',
        mobile: '010-1234-5678',
      });

    }








  












 

    const [sellOrders, setSellOrders] = useState<SellOrder[]>([]);


    /*
    useEffect(() => {

      const fetchSellOrders = async () => {

        if (orderId !== '0') {
          return;
        }
        

        if (!selectedKrwAmount) {
          return;
        }





        // api call
        const responseGetAllSellOrders = await fetch('/api/order/getAllSellOrders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            chain: params.center,
          })
        });

        const dataGetAllSellOrders = await responseGetAllSellOrders.json();

        
        //console.log('data', data);



        if (dataGetAllSellOrders.result) {

          // find one of sell order which is krwAmount is selectedKrwAmount and status is ordered
          

          const order = dataGetAllSellOrders.result.orders.find((item: any) => {
            return item.krwAmount === selectedKrwAmount && item.status === 'ordered';
          });

          if (order) {
            setSellOrders([order]);
          } else {
            toast.error('Sell order not found');
          }

        }

      }

      fetchSellOrders();

    } , [selectedKrwAmount, params.lang, params.center, orderId]);
    */
    

    

  
    

    



    useEffect(() => {

        if (!orderId) {
          return;
        }
        
        const fetchSellOrders = async () => {





          // api call
          const response = await fetch('/api/order/getOneSellOrder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderId,
            })
          });
  
          const data = await response?.json();
  
          console.log('getOneSellOrder data', data);
  
          if (data.result) {

            if (data.result.orders.length > 0) {

              setSellOrders(data.result.orders);

              setAddress(data.result.orders[0].buyer.walletAddress);

              ////setNickname(data.result.orders[0].buyer.nickname);
            }


          }
  
        };
  
        fetchSellOrders();



        
        const interval = setInterval(() => {

          fetchSellOrders();
        }, 10000);
        
        return () => clearInterval(interval);
        
  
    }, [orderId]);





    // array of escrowing
    const [escrowing, setEscrowing] = useState([] as boolean[]);

    useEffect(() => {
        
        setEscrowing(
          new Array(sellOrders.length).fill(false)
        );
  
    } , [sellOrders]);





    // array of requestingPayment
    const [requestingPayment, setRequestingPayment] = useState([] as boolean[]);

    useEffect(() => {

      setRequestingPayment(
        
        sellOrders.map((item) => {
          
          if (item.status === 'paymentRequested') {
            return true;
          }
          return false;
        } )

      );

    } , [sellOrders]);








    const [isModalOpen, setModalOpen] = useState(false);

    const closeModal = () => setModalOpen(false);
    const openModal = () => setModalOpen(true);





    const [usdtAmount, setUsdtAmount] = useState(0);

    const [defaultKrWAmount, setDefaultKrwAmount] = useState(0);

    const [krwAmount, setKrwAmount] = useState(
      krwAmounts[0]
    );

    ///console.log('usdtAmount', usdtAmount);



    const [rate, setRate] = useState(1380);




    useEffect(() => {

      if (usdtAmount === 0) {

        setDefaultKrwAmount(0);

        setKrwAmount(0);

        return;
      }
    
        
      setDefaultKrwAmount( Math.round(usdtAmount * rate) );


      setKrwAmount( Math.round(usdtAmount * rate) );

    } , [usdtAmount, rate]);








    /* agreement for trade */
    const [agreementForTrade, setAgreementForTrade] = useState([] as boolean[]);
    useEffect(() => {
        setAgreementForTrade (
            sellOrders.map((item, idx) => {
                return false;
            })
        );
    } , [sellOrders]);

    const [acceptingSellOrder, setAcceptingSellOrder] = useState([] as boolean[]);

    useEffect(() => {
        setAcceptingSellOrder (
            sellOrders.map((item, idx) => {
                return false;
            })
        );
    } , [sellOrders]);


    // request payment check box
    const [requestPaymentCheck, setRequestPaymentCheck] = useState([] as boolean[]);
    useEffect(() => {
        
        setRequestPaymentCheck(
          new Array(sellOrders.length).fill(false)
        );
  
    } , [sellOrders]);





    const acceptSellOrder = (index: number, orderId: string) => {

        if (!user) {
            return;
        }

        setAcceptingSellOrder (
            sellOrders.map((item, idx) => {
                if (idx === index) {
                    return true;
                } else {
                    return false;
                }
            })
        );


        fetch('/api/order/acceptSellOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lang: params.lang,
                storecode: storecode,
                orderId: orderId,
                buyerWalletAddress: user.walletAddress,
                buyerNickname: user.nickname,
                buyerAvatar: user.avatar,
                buyerMobile: user.mobile,
            }),
        })
        .then(response => response?.json())
        .then(data => {

            console.log('data', data);

            //setSellOrders(data.result.orders);
            //openModal();

            toast.success(Order_accepted_successfully);


            /*
            fetch('/api/order/getOneSellOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: orderId,
                }),
            })
            .then(response => response?.json())
            .then(data => {
                ///console.log('data', data);
                setSellOrders(data.result.orders);
            })
            */


            // reouter to

            router.push('/' + params.lang + '/' + storecode + '/pay-usdt/' + orderId);




        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            setAcceptingSellOrder (
                sellOrders.map((item, idx) => {
                    return false;
                })
            );
        } );


    }





    const requstPayment = async (
      index: number,
      orderId: string,
      tradeId: string,
      amount: number,
    ) => {
      // check balance
      // send payment request

      if (balance < amount) {
        toast.error('Insufficient balance');
        return;
      }

      if (escrowing[index]) {
        toast.error('Escrowing');
        return;
      }


      if (requestingPayment[index]) {
        toast.error('Requesting payment');
        return;
      }



      setEscrowing(
        escrowing.map((item, idx) => {
          if (idx === index) {
            return true;
          }
          return item;
        })
      );

   


      // send USDT
      // Call the extension function to prepare the transaction
      const transaction = transfer({
        contract,
        to: recipientWalletAddress,
        amount: amount,
      });
      


      try {


        const transactionResult = await sendAndConfirmTransaction({
            transaction: transaction,
            
            account: smartAccount as any,
        });

        console.log("transactionResult===", transactionResult);


        setEscrowing(
          escrowing.map((item, idx) => {
            if (idx === index) {
              return false;
            }
            return item;
          })
        );



        // send payment request

        if (transactionResult) {

          /*
          setRequestingPayment(
            requestingPayment.map((item, idx) => {
              if (idx === index) {
                return true;
              }
              return item;
            })
          );
          */
          
          


        
          const response = await fetch('/api/order/requestPayment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lang: params.lang,
              storecode: storecode,
              orderId: orderId,
              transactionHash: transactionResult.transactionHash,
            })
          });

          const data = await response?.json();

          console.log('/api/order/requestPayment data====', data);


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

            const response = await fetch('/api/order/getOneSellOrder', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderId: orderId,
              })
            });
    
            const data = await response?.json();
    
            ///console.log('data', data);
    
            if (data.result) {
              setSellOrders(data.result.orders);
            }
            


            // refresh balance

            const result = await balanceOf({
              contract,
              address: address,
            });

            //console.log(result);

            setBalance( Number(result) / 10 ** 6 );


            toast.success('Payment request has been sent');
          } else {
            toast.error('Payment request has been failed');
          }

        }


      } catch (error) {
        console.error('Error:', error);

        toast.error('Payment request has been failed');

        setEscrowing(
          escrowing.map((item, idx) => {
            if (idx === index) {
              return false;
            }
            return item;
          })
        );


      }


      

    }










    const [privateSale, setprivateSale] = useState(false);


    const [sellOrdering, setSellOrdering] = useState(false);

    const sellOrder = async () => {
      // api call
      // set sell order

      if (sellOrdering) {
        return;
      }

      setSellOrdering(true);

      const response = await fetch('/api/order/setSellOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: address,
          usdtAmount: usdtAmount,
          krwAmount: krwAmount,
          rate: rate,
          privateSale: privateSale,
        })
      });

      const data = await response?.json();

      //console.log('data', data);

      if (data.result) {
        toast.success('Sell order has been created');

        setUsdtAmount(0);
        setprivateSale(false);
     


        await fetch('/api/order/getOneSellOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            walletAddress: address
          })
        }).then(async (response) => {
          const data = await response?.json();
          //console.log('data', data);
          if (data.result) {
            setSellOrders(data.result.orders);
          }
        });




      } else {
        toast.error('Sell order has been failed');
      }

      setSellOrdering(false);

      

    };







  // array of confirmingPayment

  const [confirmingPayment, setConfirmingPayment] = useState([] as boolean[]);

  useEffect(() => {
      
      setConfirmingPayment(
        new Array(sellOrders.length).fill(false)
      );

  } , [sellOrders]);



  // confirm payment check box
  const [confirmPaymentCheck, setConfirmPaymentCheck] = useState([] as boolean[]);
  useEffect(() => {
      
      setConfirmPaymentCheck(
        new Array(sellOrders.length).fill(false)
      );

  } , [sellOrders]);



  const confirmPayment = async (

    index: number,
    orderId: string,

  ) => {
    // confirm payment
    // send usdt to buyer wallet address

    if (confirmingPayment[index]) {
      return;
    }

    setConfirmingPayment(
      confirmingPayment.map((item, idx) => {
        if (idx === index) {
          return true;
        }
        return item;
      })
    );




    const response = await fetch('/api/order/confirmPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lang: params.lang,
        storecode: storecode,
        orderId: orderId,
      })
    });

    const data = await response?.json();

    //console.log('data', data);

    if (data.result) {

      const response = await fetch('/api/order/getOneSellOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
        })
      });

      const data = await response?.json();

      ///console.log('data', data);

      if (data.result) {
        setSellOrders(data.result.orders);
      }

      toast.success('Payment has been confirmed');
    } else {
      toast.error('Payment has been failed');
    }

    setConfirmingPayment(
      confirmingPayment.map((item, idx) => {
        if (idx === index) {
          return false;
        }
        return item;
      })
    );



  }



  // api setUserWithoutWalletAddress

  const setUserWithoutWalletAddress = async () => {

    ///////const nickname = prompt('Enter your nickname');

    if (!nickname) {

      toast.error('Please enter your nickname for temporary user');
      return;
    }

    const mobile = '010-1234-5678';
    

    const response = await fetch('/api/user/setUserWithoutWalletAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode: storecode,
        nickname: nickname,
        mobile: mobile,
      }),
    });

    const data = await response?.json();

    console.log('setUserWithoutWalletAddress data.walletAddress', data.walletAddress);

    if (data.walletAddress) {

      //setAddress(data.result);

      ////setUser(data.result);
      
      //window.location.reload();

      setAddress(data.walletAddress);


      /*
      await fetch('/api/user/getUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: data.result.walletAddress,
        }),
      })
      .then(response => response?.json())
      .then(data => {
          console.log('data=======', data);
          setUser(data.result);
      })
      .catch((error) => {
          console.error('Error:', error);
      });
      */



    } else {
      toast.error('User registration has been failed');
    }


  }


  const [acceptingSellOrderRandom, setAcceptingSellOrderRandom] = useState(false);


  const acceptSellOrderRandom = async (
    krwAmount: number,
    depositName: string,
    depositBankName: string,
    depositBankAccountNumber: string,
  ) => {

    
    //console.log('acceptSellOrderRandom depositName', depositName);
    //console.log('acceptSellOrderRandom depositBankName', depositBankName);

    if (acceptingSellOrderRandom) {
      return;
    }

    setAcceptingSellOrderRandom(true);




    // fectch sell order and accept one of them
    
    const responseGetAllSellOrders = await fetch('/api/order/getAllSellOrders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lang: params.lang,
        storecode: storecode,
      })
    });

    const dataGetAllSellOrders = await responseGetAllSellOrders.json();

    ///console.log('acceptSellOrderRandom dataGetAllSellOrders', dataGetAllSellOrders);

    //console.log('acceptSellOrderRandom krwAmount', krwAmount);


    if (dataGetAllSellOrders.result) {

      // find one of sell order which is krwAmount is selectedKrwAmount and status is ordered
      

      const order = dataGetAllSellOrders.result.orders.find((item: any) => {
        return item.krwAmount === krwAmount && item.status === 'ordered';
      });

      if (order) {


        // accept sell order

        const response = await fetch('/api/order/acceptSellOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lang: params.lang,
            storecode: storecode,
            
            orderId: order._id,

            buyerWalletAddress: address,
            buyerNickname: nickname,
            buyerAvatar: '',
            buyerMobile: '010-1234-5678',
            depositName: depositName,
            depositBankName: depositBankName,
            depositBankAccountNumber: depositBankAccountNumber,
          }),
        });

        const data = await response?.json();

        if (data.result) {
          toast.success("판매 주문이 수락되었습니다");

          //router.push('/' + params.lang + '/' + storecode + '/pay-usdt/' + order._id);

        } else {
          toast.error('판매 주문 수락에 실패했습니다');
        }



        //setSellOrders([order]);
      } else {

        
        ///toast.error('Sell order not found');

        // if sell order not found, create buy order

        const usdtAmount =  parseFloat((krwAmount / rate).toFixed(2));

        console.log('usdtAmount', usdtAmount);


        const response = await fetch('/api/order/setBuyOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            storecode: storecode,
            walletAddress: address,
            nickname: nickname,
            usdtAmount: usdtAmount,
            krwAmount: krwAmount,
            rate: rate,
            privateSale: false,
            buyer: {
              depositBankName: depositBankName,
              depositBankAccountNumber: depositBankAccountNumber,
              depositName: depositName,
            }
          })
        });

        const data = await response.json();

        ///console.log('setBuyOrder data.result', data.result);



        if (data.result) {
          toast.success('구매 주문이 생성되었습니다');

          const order = data.result;

          router.push('/' + params.lang + '/' + storecode + '/pay-usdt-reverse/' + order._id);


        } else {
          toast.error('구매 주문에 실패했습니다');
        }



      }



    } else {
      toast.error('Sell order not found');
    }

    setAcceptingSellOrderRandom(false);

  }



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

      //console.log('data', data);

      setStoreCodeNumber(data?.storeCodeNumber);

    }

    fetchStoreCode();

  } , []);













  if (orderId !== '0') {
      
      return (
        <div>
          Order not found
        </div>
      );

    }



  if (orderId === '0' && !storeUser) {
    return (
      <div>
        Store user not found
      </div>
    );
  }


  /*
  if (orderId === '0' && storeCodeNumber && storecode !== storeCodeNumber) {
    return (
      <div>
        Store code is invalid
      </div>
    );
  }
    */
  

  if (orderId === '0' && !paramDepositName) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 p-4'>
        <span className='text-lg font-semibold'>
        Deposit name is invalid
        </span>
        <span className='text-sm text-zinc-500'>
        storeUser: {storeUser}  storecode: {storecode} paramDepositName: {paramDepositName} paramDepositBankName: {paramDepositBankName} paramDepositBankAccountNumber: {paramDepositBankAccountNumber} paramDepositAmountKrw: {paramDepositAmountKrw}
        </span>

      </div>
    );
  }

  if (orderId === '0' && !paramDepositBankName) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 p-4'>
        <span className='text-lg font-semibold'>
        Deposit bank name is invalid
        </span>
        <span className='text-sm text-zinc-500'>
        storeUser: {storeUser}  storecode: {storecode} paramDepositName: {paramDepositName} paramDepositBankName: {paramDepositBankName} paramDepositBankAccountNumber: {paramDepositBankAccountNumber} paramDepositAmountKrw: {paramDepositAmountKrw}
        </span>

      </div>
    );
  }

  if (orderId === '0' && !paramDepositBankAccountNumber) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 p-4'>
        <span className='text-lg font-semibold'>
        Deposit bank account number is invalid
        </span>
        <span className='text-sm text-zinc-500'>
        storeUser: {storeUser}  storecode: {storecode} paramDepositName: {paramDepositName} paramDepositBankName: {paramDepositBankName} paramDepositBankAccountNumber: {paramDepositBankAccountNumber} paramDepositAmountKrw: {paramDepositAmountKrw}
        </span>

      </div>
    );
  }





  // check storeInfo
  if (loadingStoreInfo) {
    return (
      <div className="w-full h-screen flex items-center justify-center">

        <div className='flex flex-col items-center justify-center gap-2'>

          <Image
            src="/banner-loading.gif"
            alt="Loading"
            width={200}
            height={200}
            className="w-32 h-32"
          />
          <div className="text-sm text-zinc-500">
            가맹점 정보를 불러오는 중입니다...
          </div>
        </div>
      </div>
    );
  }

  if (!loadingStoreInfo && !storeInfo) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Image
            src="/banner-warning.webp"
            alt="Error"
            width={200}
            height={200}
            className="w-32 h-32"
          />
          <div className="text-sm text-zinc-500">
            가맹점 정보를 찾을 수 없습니다.
          </div>
        </div>
      </div>
    );
  }








    
  return (

    <main className="
      pl-2 pr-2
      pb-10 min-h-[100vh] flex flex-col items-center justify-start container
      max-w-screen-sm
      mx-auto
      bg-zinc-50
      text-zinc-500
      ">


      <div className="
        h-32

        w-full flex flex-col gap-2 justify-center items-center
        p-4
        bg-zinc-900
        text-zinc-100
        ">

        {loadingStoreInfo ? (
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <Image
              src="/icon-loading.png"
              alt="Loading"
              width={24}
              height={24}
              className='animate-spin'
            />
            <div className="text-sm text-zinc-50">
              가맹점 정보를 불러오는 중입니다.
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-row items-center justify-between gap-2">

            <div className='flex flex-col gap-2 items-center justify-start'>
              <Image
                src={storeInfo?.storeLogo || '/logo.png'}
                alt="Store Logo"
                width={38}
                height={38}
                className='rounded-full w-10 h-10'
              />
              <span className="text-sm text-zinc-100 font-semibold">
                {storeInfo?.storeName}
              </span>
            </div>

            {loadingUser && (
              <div className="flex flex-row items-center justify-center gap-2">
                <Image
                  src="/icon-loading.png"
                  alt="Loading"
                  width={24}
                  height={24}
                  className='animate-spin'
                />
                <div className="text-sm text-zinc-50">
                  회원정보를 불러오는 중입니다.
                </div>
              </div>
            )}

            {!loadingUser && user && (

              <div className="flex flex-col items-start justify-center gap-2">

                <div className='flex flex-row gap-2 items-center justify-center'>
                  <span className="text-sm text-zinc-100">

                    아이디:{' '}{
                      memberid ? memberid : sellOrders.length > 0 ? sellOrders[0]?.buyer.nickname
                      : user?.nickname
                    }
                  </span>
                </div>

                <div className='flex flex-row gap-2 items-center justify-center'>
                  <span className="text-sm text-zinc-100">
                    USDT지갑:{' '}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      ///toast.success("USDT지갑주소가 복사되었습니다.");
                      alert("USDT지갑주소가 복사되었습니다: " + address);
                    }}
                    className="text-sm underline text-zinc-100 hover:text-zinc-200"
                  >
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </button>
                </div>

                {/* balance */}
                <div className="flex flex-row gap-2 items-center justify-center">
                  <span className="text-sm text-zinc-100">
                    잔액:{' '}
                  </span>

                  <div className="flex flex-row items-center justify-center gap-2">
                    <span className="text-xl font-semibold text-zinc-100">
                      {Number(balance).toFixed(2)}
                    </span>
                    {' '}
                    <span className="text-sm text-zinc-100">
                      USDT
                    </span>
                  </div>
                </div>

                
              </div>

            )}




          </div>
        )}


      </div>



      <div className="
        mt-5
        p-4  w-full
        flex flex-col gap-2 justify-start items-center
        bg-zinc-50
        rounded-2xl
        shadow-lg
        shadow-zinc-200
        border-2 border-zinc-200
        border-opacity-50
        ">


        <button
          onClick={() => {
            window.open('https://t.me/goodtether_user_bot' + '?start=' + storecode + '_' + storeUser);
            }}
          className="
            w-full
            bg-telegram
            hover:bg-telegram/80
            text-white
            font-semibold
            py-3
            rounded-lg
            shadow-lg
            shadow-telegram/50
            flex flex-row items-center justify-center gap-2
            "
        >
          <Image
            src="/icon-telegram.png"
            alt="Telegram"
            width={24}
            height={24}
            className='w-6 h-6'
          />
          <span className="text-lg">
            텔레그램으로 이동하기
          </span>
        </button>

        <span className="text-sm text-zinc-500">
          텔레그램에서 입금확인 후, 자동으로 구매 주문이 생성됩니다.
        </span>

        <span className="text-sm text-zinc-400">
          storeUser: {storeUser}  storecode: {storecode} paramDepositName: {paramDepositName} paramDepositBankName: {paramDepositBankName} paramDepositBankAccountNumber: {paramDepositBankAccountNumber} paramDepositAmountKrw: {paramDepositAmountKrw}
        </span>




          
      </div>


    </main>

  );


};


