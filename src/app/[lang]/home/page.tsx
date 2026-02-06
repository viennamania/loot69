'use client';

import { useState, useEffect, use, act } from "react";

import Image from "next/image";



// open modal

///import Modal from '@/components/modal';

import ModalUser from '@/components/modal-user';

import { useRouter }from "next//navigation";


import { toast } from 'react-hot-toast';

import { client } from "../../client";



import {
  getContract,
  sendAndConfirmTransaction,
  sendTransaction,
  waitForReceipt,
  sendBatchTransaction,
} from "thirdweb";



import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,

  useSetActiveWallet,

  useConnectedWallets,


} from "thirdweb/react";

import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";





import { getUserPhoneNumber } from "thirdweb/wallets/in-app";


import { balanceOf, transfer } from "thirdweb/extensions/erc20";
import { add } from "thirdweb/extensions/farcaster/keyGateway";
 


import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../dictionaries";
//import Chat from "@/components/Chat";
import { ClassNames } from "@emotion/react";


import useSound from 'use-sound';
import { it } from "node:test";
import { get } from "http";


import { useSearchParams } from 'next/navigation';



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
} from "@/app/config/contractAddresses";


import { useQRCode } from 'next-qrcode';



interface BuyOrder {
  _id: string;
  createdAt: string;
  walletAddress: string;
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

  agentName: string;
  agentcode: string;

  userStats: any;

  paymentMethod: string;

  escrowWallet: {
    address: string;
    balance: number;
    transactionHash: string;
  };

}



const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "email",
      ],
    },
  }),
];





export default function Index({ params }: any) {

  const searchParams = useSearchParams();
 
  const wallet = searchParams.get('wallet');


  // limit, page number params

  const limit = searchParams.get('limit') || 20;
  const page = searchParams.get('page') || 1;


  const activeWallet = useActiveWallet();


  const contract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    
    
    chain: chain === 'ethereum' ? ethereum :
      chain === 'polygon' ? polygon :
      chain === 'arbitrum' ? arbitrum :
      chain === 'bsc' ? bsc : ethereum,

    // the contract's address
    ///address: contractAddressArbitrum,

    address: chain === 'ethereum' ? ethereumContractAddressUSDT :
      chain === 'polygon' ? polygonContractAddressUSDT :
      chain === 'arbitrum' ? arbitrumContractAddressUSDT :
      chain === 'bsc' ? bscContractAddressUSDT :
      ethereumContractAddressUSDT,


    // OPTIONAL: the contract's abi
    //abi: [...],
  });


  const { Canvas } = useQRCode();





 




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
  


    const [searchStorecode, setSearchStorecode] = useState("");




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
        storecode: searchStorecode,
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



  // get seller
  const [seller, setSeller] = useState<any>(null);
  const [loadingSeller, setLoadingSeller] = useState(true);
  useEffect(() => {

    if (!address || searchStorecode === '') {
      setSeller(null);
      setLoadingSeller(false);
      return;
    }

    setLoadingSeller(true);

    fetch('/api/user/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            storecode: searchStorecode,
            walletAddress: address,
        }),
    })
    .then(response => response.json())
    .then(data => {
        setSeller(data.result);
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .finally(() => {
        setLoadingSeller(false);
    });

  }, [address, searchStorecode]);





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

  

  const [searchOrderStatusCancelled, setSearchOrderStatusCancelled] = useState(false);
  const [searchOrderStatusCompleted, setSearchOrderStatusCompleted] = useState(false);


  const [searchMyOrders, setSearchMyOrders] = useState(false);




    
  // search form date to date
  const [searchFromDate, setSearchFromDate] = useState("");
  // set today's date in YYYY-MM-DD format
  useEffect(() => {
    const today = new Date();
    
    //const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    // this month first date
    const firstDateOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const formattedDate = firstDateOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD format

    setSearchFromDate(formattedDate);
  }, []);




  const [searchToDate, setSearchToDate] = useState("");

  // set today's date in YYYY-MM-DD format
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setSearchToDate(formattedDate);
  }, []);
  
  




  // limit number
  const [limitValue, setLimitValue] = useState(limit || 20);
  useEffect(() => {
    setLimitValue(limit || 20);
  }, [limit]);

  // page number
  const [pageValue, setPageValue] = useState(page || 1);
  useEffect(() => {
    setPageValue(page || 1);
  }, [page]);


  const [totalCount, setTotalCount] = useState(0);
    
  const [buyOrders, setBuyOrders] = useState<BuyOrder[]>([]);


  //console.log('buyOrders', buyOrders);

  



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

                    searchFromDate: searchFromDate,
                    searchToDate: searchToDate,

                    searchOrderStatusCancelled: searchOrderStatusCancelled,
                    searchOrderStatusCompleted: searchOrderStatusCompleted,

                  }
                ),
            })
            .then(response => response.json())
            .then(data => {
                ///console.log('data', data);
                setBuyOrders(data.result.orders);

                setTotalCount(data.result.totalCount);
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

      const data = await response.json();

      ///console.log('data', data);

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

              searchFromDate: searchFromDate,
              searchToDate: searchToDate,

              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,
            }
          )
        }).then(async (response) => {
          const data = await response.json();
          //console.log('data', data);
          if (data.result) {
            setBuyOrders(data.result.orders);

            setTotalCount(data.result.totalCount);
          }
        });

      } else {
        toast.error('판매취소에 실패했습니다.');
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
    ) => {


      // check escrowWalletAddress

      if (!isWithoutEscrow && escrowWalletAddress === '') {
        toast.error('Recipient wallet address is empty');
        return;
      }

      // check balance
      // send payment request
      /*
      if (balance < amount) {
        toast.error(Insufficient_balance);
        return;
      }
      */


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

          const { transactionHash } = await sendTransaction({
            
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

                    searchFromDate: searchFromDate,
                    searchToDate: searchToDate,

                    searchOrderStatusCancelled: searchOrderStatusCancelled,
                    searchOrderStatusCompleted: searchOrderStatusCompleted,
                  }
                )
              }).then(async (response) => {
                const data = await response.json();
                //console.log('data', data);
                if (data.result) {
                  setBuyOrders(data.result.orders);
      
                  setTotalCount(data.result.totalCount);
                }
              });


              // refresh balance
              /*
              const result = await balanceOf({
                contract,
                address: address || "",
              });

              //console.log(result);

              setBalance( Number(result) / 10 ** 6 );
              */

            

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

                  searchFromDate: searchFromDate,
                  searchToDate: searchToDate,

                  searchOrderStatusCancelled: searchOrderStatusCancelled,
                  searchOrderStatusCompleted: searchOrderStatusCompleted,
                }
              )
            }).then(async (response) => {
              const data = await response.json();
              //console.log('data', data);
              if (data.result) {
                setBuyOrders(data.result.orders);
    
                setTotalCount(data.result.totalCount);
              }
            });


            // refresh balance
            /*
            const result = await balanceOf({
              contract,
              address: address || "",
            });

            //console.log(result);

            setBalance( Number(result) / 10 ** 6 );
            */

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




  /*

  // confirm payment
  const confirmPayment = async (

    index: number,
    orderId: string,
    paymentAmount: number,
    paymentAmountUsdt: number,

    //storecode: string,

  ) => {
    // confirm payment
    // send usdt to buyer wallet address


    // if escrowWalletAddress balance is less than paymentAmount, then return

    //console.log('escrowBalance', escrowBalance);
    //console.log('paymentAmountUsdt', paymentAmountUsdt);
    


    const storecode = "admin";


    if (confirmingPayment[index]) {
      return;
    }

    setConfirmingPayment(
      confirmingPayment.map((item, idx) =>  idx === index ? true : item)
    );


    try {

      
      if (!isWithoutEscrow) {
      
        const response = await fetch('/api/order/buyOrderConfirmPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            storecode: storecode,
            orderId: orderId,
            paymentAmount: paymentAmount,
            ///isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
            isSmartAccount: false,
          })
        });

        const data = await response.json();

        //console.log('data', data);

        if (data.result) {
          
          ///fetchBuyOrders();

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

                searchFromDate: searchFromDate,
                searchToDate: searchToDate,

                searchOrderStatusCancelled: searchOrderStatusCancelled,
                searchOrderStatusCompleted: searchOrderStatusCompleted,
              }
            )
          }).then(async (response) => {
            const data = await response.json();
            //console.log('data', data);
            if (data.result) {
              setBuyOrders(data.result.orders);
  
              setTotalCount(data.result.totalCount);
            }
          });


          toast.success(Payment_has_been_confirmed);

          playSong();


        } else {
          toast.error('결제확인이 실패했습니다.');
        }

      } else {


        // transfer my wallet to buyer wallet address

        const buyerWalletAddress = buyOrders[index].walletAddress;
        const usdtAmount = buyOrders[index].usdtAmount;

        const transaction = transfer({
          contract,
          to: buyerWalletAddress,
          amount: usdtAmount,
        });


        try {

          
          const { transactionHash } = await sendTransaction({
            account: activeAccount as any,
            transaction,
          });
          


          console.log("transactionHash===", transactionHash);



          if (transactionHash) {

            const response = await fetch('/api/order/buyOrderConfirmPaymentWithoutEscrow', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                lang: params.lang,
                storecode: storecode,
                orderId: orderId,
                paymentAmount: paymentAmount,
                transactionHash: transactionHash,
                ///isSmartAccount: activeWallet === inAppConnectWallet ? false : true,
                isSmartAccount: false,
              })
            });

            const data = await response.json();

            //console.log('data', data);

            if (data.result) {
              
              ///fetchBuyOrders();

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

                    searchFromDate: searchFromDate,
                    searchToDate: searchToDate,

                    searchOrderStatusCancelled: searchOrderStatusCancelled,
                    searchOrderStatusCompleted: searchOrderStatusCompleted,
                  }
                )
              }).then(async (response) => {
                const data = await response.json();
                //console.log('data', data);
                if (data.result) {
                  setBuyOrders(data.result.orders);
      
                  setTotalCount(data.result.totalCount);
                }
              });

              toast.success(Payment_has_been_confirmed);
              playSong();
            } else {
              toast.error('결제확인이 실패했습니다.');
            }


          } else {
            toast.error('결제확인이 실패했습니다.');
          }

        } catch (error) {
          console.error('Error:', error);
          toast.error('결제확인이 실패했습니다.');
        }



      }






    } catch (error) {
      console.error('Error:', error);
      toast.error('결제확인이 실패했습니다.');
    }


    setConfirmingPayment(
      confirmingPayment.map((item, idx) => idx === index ? false : item)
    );

    setConfirmPaymentCheck(
      confirmPaymentCheck.map((item, idx) => idx === index ? false : item)
    );
  

  }
  */






  // confirm payment
  const confirmPayment = async (

    index: number,
    orderId: string,

    storecode: string,

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

    ///const storecode = "admin";


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

        ///console.log("transactionHash===", transactionHash);



        if (transactionHash) {


          if (paymentMethod === 'mkrw') {

            const response = await fetch('/api/order/buyOrderConfirmPaymentWithEscrow', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                lang: params.lang,
                storecode: params.center,
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




          /*
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
              });


            }
          });
          */

          setBuyOrders(
            buyOrders.map((item, idx) => {
              if (idx === index) {
                return {
                  ...item,
                  status: 'paymentConfirmed',
                  transactionHash: transactionHash,
                };
              }
              return item;
            })
          );

          toast.success(Payment_has_been_confirmed);
          //alert(Payment_has_been_confirmed);
          //////playSong();






        } else {
          //toast.error('결제확인이 실패했습니다.');
          alert('결제확인이 실패했습니다.');

        }

    } catch (error) {
      console.error('Error:', error);
      //toast.error('결제확인이 실패했습니다.');
      alert('결제확인이 실패했습니다.');
    }



    setConfirmingPayment(
      confirmingPayment.map((item, idx) => idx === index ? false : item)
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

              searchFromDate: searchFromDate,
              searchToDate: searchToDate,

              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,
            }
          ),
        })
        .then(response => response.json())
        .then(data => {
            ///console.log('data', data);
            setBuyOrders(data.result.orders);

            setTotalCount(data.result.totalCount);
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










  const [latestBuyOrder, setLatestBuyOrder] = useState<BuyOrder | null>(null);


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

              searchFromDate: searchFromDate,
              searchToDate: searchToDate,

              searchOrderStatusCancelled: searchOrderStatusCancelled,
              searchOrderStatusCompleted: searchOrderStatusCompleted,
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

      setTotalCount(data.result.totalCount);
      


    }


    fetchBuyOrders();

    
    
    const interval = setInterval(() => {

      fetchBuyOrders();


    }, 3000);


    return () => clearInterval(interval);
    


  } , [
    limitValue,
    pageValue,
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

    latestBuyOrder,
    searchOrderStatusCancelled,
    searchOrderStatusCompleted,

    searchFromDate,
    searchToDate,
    //playSong,

    searchStorecode,
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

        fromDate: searchFromDate,
        toDate: searchToDate,

        searchOrderStatusCancelled: searchOrderStatusCancelled,
        searchOrderStatusCompleted: searchOrderStatusCompleted,
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
  setTotalCount(data.result.totalCount);
  setFetchingBuyOrders(false);

  return data.result.orders;
}






    // check table view or card view
    const [tableView, setTableView] = useState(true);




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
              storecode: selectedItem?.storecode,
              ////walletAddress: address,
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

  } , [selectedItem]);





    const [storeTrades, setStoreTrades] = useState<{
      totalCount: number;
      totalKrwAmount: number;
      totalUsdtAmount: number;
      totalSettlementCount: number;
      totalSettlementAmount: number;
      totalSettlementAmountKRW: number;
      latestTrades: any[];
    }>({
      totalCount: 0,
      totalKrwAmount: 0,
      totalUsdtAmount: 0,
      totalSettlementCount: 0,
      totalSettlementAmount: 0,
      totalSettlementAmountKRW: 0,
      latestTrades: [],
    });

    const [fetchingStoreTrades, setFetchingStoreTrades] = useState(false);
  
    const fetchStoreSummary = async () => {
      if (!address) {
        return;
      }

      if (fetchingStoreTrades) {
        return;
      }

      setFetchingStoreTrades(true);


      const response = await fetch('/api/summary/getStoreTrades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            storecode: "",
          }
        ),
      });
      if (!response.ok) {

        setFetchingStoreTrades(false);
        return;
      }
      const data = await response.json();
      
      console.log('getStoreSummary data', data);
  
      setStoreTrades(data.result);

      setFetchingStoreTrades(false);
  
    }
  
  
    useEffect(() => {
      if (!address) {
        return;
      }
      fetchStoreSummary();
      // interval
      const interval = setInterval(() => {
        fetchStoreSummary();
      } , 10000);
      return () => clearInterval(interval);
    } , [address]);
  




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
        toast.error('상점 검색에 실패했습니다.');
        return;
      }
  
      const data = await response.json();
      
      ///console.log('getAllStores data', data);
  
  
  
  
      setAllStores(data.result.stores);
      setStoreTotalCount(data.result.totalCount);
      setFetchingAllStores(false);
      return data.result.stores;
    }
    useEffect(() => {

      fetchAllStores();
    }, []); 




    // get balance of valut wallet address
    const [vaultWalletBalance, setVaultWalletBalance] = useState("0");
    useEffect(() => {
        const fetchData = async () => {
            if (!seller?.vaultWallet?.address) {
                return;
            }

            const result = await balanceOf({
                contract,
                address: seller?.vaultWallet?.address || '',
            });

            const balance = Number(result) / 10 ** 6;
            setVaultWalletBalance(balance.toString());
        };
        fetchData();

        // interval every 10 seconds
        const interval = setInterval(() => {
            fetchData();
        }, 10000);

        return () => clearInterval(interval);

    }, [seller?.vaultWallet?.address, contract]);




    return (

      <main className="p-4 pb-10 min-h-[100vh] flex items-start justify-center container max-w-screen-2xl mx-auto">


        <div className="py-0 w-full">


          <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-2 bg-black/10 p-2 rounded-lg mb-4">
              
            <div className="w-full flex flex-row items-center justify-start gap-2">
              <button
                onClick={() => router.push('/' + params.lang + '/home')}
                className="flex bg-zinc-100 text-sm text-[#3167b4] px-4 py-2 rounded-lg hover:bg-zinc-200"
              >
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={100}
                  height={100}
                  className="h-4 w-4"
                />
              </button>
            </div>


            {address && !loadingUser && (


              <div className="w-full flex flex-row items-center justify-end gap-2">
                <button
                  onClick={() => {
                    router.push('/' + params.lang + '/home/profile-settings');
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
                        <span className="text-sm text-[#f3f4f6]">
                          센터 관리자
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-[#f3f4f6]">
                      {user?.nickname || "프로필"}
                    </span>

                  </div>
                </button>


                
              </div>


            )}



          </div>

          {!address && (
            <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-[linear-gradient(120deg,#ecfdf3_0%,#f0f9ff_55%,#ffffff_100%)] p-5 shadow-[0_22px_55px_-40px_rgba(16,185,129,0.6)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-sm">
                    <Image
                      src="/icon-smart-wallet.png"
                      alt="Web3 Login"
                      width={26}
                      height={26}
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                      Web3 Login
                    </span>
                    <span className="text-lg font-semibold text-slate-900">
                      지갑을 연결하고 안전하게 거래하세요
                    </span>
                    <span className="text-sm text-slate-600">
                      비수탁 로그인 · 서명 기반 인증 · 실시간 보안 모니터링
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/' + params.lang + '/web3login')}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(16,185,129,0.7)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
                >
                  웹3 로그인
                </button>
              </div>
            </div>
          )}



          <div className="flex flex-col items-start justify-center gap-2 mt-4">


              {/* USDT 가격 binance market price */}
              {/*
              <div
              className="
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




            {/* 홈 / 상점관리 / 회원관리 / P2P구매관리 */}
            {/* memnu buttons same width left side */}
            <div className="w-full flex justify-start items-center gap-2">



            </div>


            <div className='flex flex-row items-center space-x-4'>
                <Image
                  src="/icon-buyorder.png"
                  alt="Trade"
                  width={35}
                  height={35}
                  className="w-6 h-6"
                />

                <div className="text-xl font-semibold">
                  P2P 구매주문 내역
                </div>

            </div>


                {/* check box for Native Wallet */}
                {/*
                {address && (
                  <div className="flex flex-row items-center gap-2">
                    <input
                      disabled={true}
                      type="checkbox"
                      checked={
                        activeWallet === inAppConnectWallet
                      }
                      onChange={(e) => 
                        ///e.target.checked ? setActiveAccount(inAppConnectWallet) : setActiveAccount(smartConnectWallet)

                        e.target.checked ?
                        router.push( window.location.pathname )
                        :
                        router.push( window.location.pathname  + '?wallet=smart' )

                      } 
                      className="w-5 h-5"
                    />
                    <label className="text-sm text-zinc-500">Pro Wallet</label>
                  </div>
                )}
                */}


                <div className="w-full flex flex-col xl:flex-row items-center justify-end gap-2">


                  <div className="hidden flex-row items-center justify-center gap-2">
                    {/* 구매하기 버튼 */}
                    {/* new window */}

                    <button
                      onClick={() => {
                        router.push('/' + params.lang + '/home/paymaster');
                        //window.open(
                        //  '/'+ params.lang + '/home/paymaster',
                        //</div>  '_blank'
                        //);
                      }}
                      className="bg-yellow-500 text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-yellow-400"
                    >
                      <div className="flex flex-row items-center justify-center gap-2">
                        <Image
                          src="/icon-paymaster-buy.webp"
                          alt="Buy"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                        <span className="text-sm">
                          구매하기
                        </span>
                      </div>
                    </button>

                    {/* 출금하기 버튼 */}
                    <button
                      onClick={() => {
                        router.push('/' + params.lang + '/administration/withdraw-usdt');
                        //window.open(
                        //  '/'+ params.lang + '/home/withdraw',
                        //  '_blank'
                        //);
                      }}
                      className="bg-green-500 text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-green-400"
                    >
                      <div className="flex flex-row items-center justify-center gap-2">
                        <Image
                          src="/icon-withdraw.png"
                          alt="Withdraw"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                        <span className="text-sm">
                          출금하기
                        </span>
                      </div>
                    </button>
                  </div>


                </div>


                <div className="w-full flex flex-row items-center justify-end gap-2">

                  {/*
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm">{Total}</div>
                    <div className="text-xl font-semibold text-zinc-500">
                      {buyOrders.length} 
                    </div>
                  </div>
                  */}



                  {/*}
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm">
                      {Buy_Order_Accept}
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {buyOrders.filter((item) => item.status === 'accepted').length}
                    </div>
                  </div>
                  */}

                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm">거래중</div>
                    <div className="text-xl font-semibold text-zinc-500">

                      {
                        buyOrders.filter((item) => item.status === 'accepted' || item.status === 'paymentRequested').length

                      }

                    </div>
                  </div>

                  {/* buy order status */}
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-sm">전체</div>
                    <div className="text-xl font-semibold text-zinc-500">
                      {totalCount}
                    </div>
                  </div>

                </div>



                <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-3">


                  {/* select storecode */}
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
                        상점선택
                      </span>


                      <select
                        value={searchStorecode}
                        
                        //onChange={(e) => setSearchStorecode(e.target.value)}

                        // storecode parameter is passed to fetchBuyOrders
                        onChange={(e) => {
                          setSearchStorecode(e.target.value);
                          setPageValue(1);
                          fetchBuyOrders();
                        }}



                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3167b4]"
                      >
                        <option value="">전체</option>

                        {fetchingAllStores && (
                          <option value="" disabled>
                            상점 검색중...
                          </option>
                        )}

                        {!fetchingAllStores && allStores && allStores.map((item, index) => (
                          <option key={index} value={item.storecode}
                            className="flex flex-row items-center justify-start gap-2"
                          >
                            
                            {item.storeName}{' '}({item.storecode})

                          </option>
                        ))}
                      </select>
                  
                  </div>





                  {/* serach fromDate and toDate */}
                  {/* DatePicker for fromDate and toDate */}
                  <div className="flex flex-col xl:flex-row items-center gap-2">
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
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3167b4]"
                      />
                    </div>

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
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3167b4]"
                      />
                    </div>
                  </div>


                  <div className="flex flex-row items-center gap-2">
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
                          fetchBuyOrders();
                        }}
                        className="w-5 h-5"
                      />
                      <label className="text-sm text-zinc-500">판매취소</label>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <input
                        type="checkbox"
                        checked={searchOrderStatusCompleted}
                        onChange={(e) => {
                          setSearchOrderStatusCompleted(e.target.checked);
                          setPageValue(1);
                          fetchBuyOrders();
                        }}
                        className="w-5 h-5"
                      />
                      <label className="text-sm text-zinc-500">판매완료</label>
                    </div>
                  </div>

               


                  {true && (
                    <div className="flex flex-col xl:flex-row items-center justify-center gap-2
                    
                    border border-zinc-800 rounded-lg p-2 bg-zinc-100">



                      
                      <div className="hidden flex-row items-center justify-center gap-2">
                        <Image
                          src="/icon-loading.png"
                          alt="Loading"
                          width={20}
                          height={20}
                          className={` ${
                            fetchingStoreTrades ? 'animate-spin' : ''}
                            w-6 h-6
                          `}
                        />
                      </div>
                      



                      {/* 총 거래수 */}

                      <div className="w-full flex flex-row items-center justify-center gap-2">

                        <div className="flex flex-col items-center justify-center gap-2">
                          <h2 className="text-lg">총 거래수</h2>
                          <p className="text-lg text-zinc-500">
                            {
                              storeTrades.totalCount
                            }
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <h2 className="text-lg">총 거래금액</h2>
                          <p className="text-lg text-zinc-500">
                            {Number(storeTrades.totalKrwAmount)?.toLocaleString()} 원
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <h2 className="text-lg">총 거래량</h2>
                          <p className="text-lg text-zinc-500">
                            {Number(storeTrades.totalUsdtAmount)?.toLocaleString()} USDT
                          </p>
                        </div>

                      </div>

                      {/* divider */}
                      {/*
                      <div className="xl:hidden w-full h-0.5 bg-zinc-200 my-2" />

                      <div className="w-full flex flex-row items-between justify-center gap-2">

                        <div className="flex flex-col items-center justify-center gap-2">
                          <h2 className="text-lg">총 결제수</h2>
                          <p className="text-lg text-zinc-500">
                            {storeTrades?.totalSettlementCount}
                          </p>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2">
                          <h2 className="text-lg">총 정산금액</h2>
                          <p className="text-lg text-zinc-500">
                            {Number(storeTrades?.totalSettlementAmountKRW)?.toLocaleString()} 원
                          </p>
                        </div>


                        <div className="flex flex-col items-center justify-center gap-2">
                          <h2 className="text-lg">총 결제량</h2>
                          <p className="text-lg text-zinc-500">
                            {Number(storeTrades?.totalSettlementAmount)?.toLocaleString()} USDT
                          </p>
                        </div>

                      </div>
                      */}


                    </div>
                  
                  )}






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
                        자동입금확인중
                      </span>
                    </div>

                  </div>
                )}
                */}

                {address && (
                  <div className="flex flex-col items-center gap-2 mt-4">

                    {/* 판매자 정보 */}
                    {/* user.seller, user.vaultWallet */}

                    {searchStorecode !== '' && !seller && (
                      <div className='w-full flex flex-col gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>

                        <div className="flex flex-row items-center gap-2">
                            {/* dot */}
                            <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                            <span className="text-lg">
                                판매자 정보가 없습니다.
                            </span>
                        </div>

                        <span className="text-lg text-zinc-500 font-semibold">
                            판매를 위해 판매자 등록을 해주세요.
                        </span>

                      </div>
                    )}

                    {seller && (

                        <div className='w-full flex flex-col gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>

                            <div className="flex flex-row items-center gap-2">
                                {/* dot */}
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    판매자 정보
                                </span>
                            </div>


                            <div className="flex flex-col p-2 gap-2">
                                {/* 판매자 아이디 */}
                                <span className="text-lg text-zinc-500 font-semibold">
                                    아이디: {
                                        seller?.nickname ? seller?.nickname : '등록 안됨'
                                    }
                                </span>

                                {/* 판매자 지갑주소 */}
                                <div className='flex flex-col items-start gap-2'>

                                    <div className="flex flex-row items-center gap-2">
                                        <span className="text-lg text-zinc-500 font-semibold">
                                            지갑주소: {seller?.vaultWallet?.address || '등록 안됨'}
                                        </span>
                                        {seller?.vaultWallet?.address && (
                                            <button
                                                onClick={() => {
                                                    if (seller?.vaultWallet?.address) {
                                                        navigator.clipboard.writeText(seller?.vaultWallet?.address);
                                                        toast.success(Copied_Wallet_Address);
                                                    }
                                                }}
                                                className="p-1 bg-gray-200 rounded"
                                            >
                                                <Image
                                                    src="/icon-copy.png"
                                                    alt="Copy"
                                                    width={16}
                                                    height={16}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {seller?.vaultWallet?.address && (
                                        <div className='flex flex-row items-center gap-2'>
                                            <Canvas
                                            text={seller?.vaultWallet?.address || ''}
                                                options={{
                                                //level: 'M',
                                                margin: 2,
                                                scale: 4,
                                                ///width: 200,
                                                // width 100%
                                                width: 45,
                                                color: {
                                                    dark: '#000000FF',
                                                    light: '#FFFFFFFF',
                                                },
                                    
                                                }}
                                            />

                                            {/* balance */}
                                            <div className='flex flex-row items-center gap-2'>
                                                <span className='text-4xl font-bold text-green-500'
                                                    style={{ fontFamily: 'monospace' }}>
                                                    {vaultWalletBalance
                                                    && parseFloat(vaultWalletBalance).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                </span>
                                                <span className='text-zinc-500 font-semibold'>
                                                    USDT
                                                </span>
                                            </div>
                                        </div>
                                    )}


                                </div>

                                {/* 판매자 은행 정보 */}
                                <span className="text-lg text-zinc-500 font-semibold">
                                    은행이름: {seller?.bankInfo?.bankName}
                                </span>

                                <span className="text-lg text-zinc-500 font-semibold">
                                    계좌번호: {seller?.bankInfo?.accountNumber}
                                </span>
                                <span className="text-lg text-zinc-500 font-semibold">
                                    예금주: {seller?.bankInfo?.accountHolder}
                                </span>

                            </div>
                        </div>
                    )}


                    {/* 판매자 등록 버튼 */}
                    <button
                      onClick={() => {
                        router.push('/' + params.lang + '/home/seller-settings');
                      }}
                      className="bg-[#0047ab] text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-[#0047ab]/80"
                    >
                      <div className="flex flex-row items-center justify-center gap-2">
                        <Image
                          src="/icon-seller.png"
                          alt="Settings"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                        <span className="text-sm">
                          판매자 설정하기
                        </span>
                      </div>
                    </button>

                  </div>
                )}
                



                {/* table view is horizontal scroll */}
                {tableView ? (


                  <div className="w-full overflow-x-auto">

                    <table className="w-full table-auto border-collapse border border-zinc-800 rounded-md">

                      <thead
                        className="bg-[#0047ab] text-white text-sm font-semibold"
                        //style={{
                        //  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        //}}
                      >
                        <tr>

                          <th className="p-2">
                            상점
                            <br/>
                            {TID}
                          </th>

                          <th className="p-2">
                            구매자 아이디<br/>입금자<br/>USDT지갑
                          </th>
                          
                          <th className="p-2">
                            구매금액<br/>{Buy_Amount}<br/>{Rate}
                          </th>
                          {/*
                          <th className="p-2">{Payment_Amount}</th>
                          */}

                          <th className="p-2">
                            <div className="flex flex-col items-center justify-center gap-2">

                              <div className="flex flex-row items-center justify-center gap-2">
                                <span>자동매칭</span>
                                <Image
                                  src="/icon-matching.png"
                                  alt="Auto Matching"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 animate-spin"
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

                              <span className="text-sm text-zinc-50 font-semibold">
                                판매자
                              </span>

                            </div>
                          </th>

                          {/*
                          {address && (
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
                          )}
                          */}

                          <th className="p-2">
                            <div className="flex flex-col items-center justify-center gap-2">

                              <div className="flex flex-row items-center justify-center gap-2">
                                <span>
                                  입금확인
                                </span>
                                <Image
                                  src="/icon-bank-auto.png"
                                  alt="Bank Auto"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 animate-spin"
                                />
                                <span className="text-sm text-zinc-50 font-semibold">
                                  {
                                    buyOrders.filter((item) => item.status === 'paymentRequested').length
                                  }
                                </span>

                              </div>

                              <span className="text-sm text-zinc-50 font-semibold">
                                입금통장
                              </span>
                              <span className="text-sm text-zinc-50 font-semibold">
                                입금액
                              </span>

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

                          <th className="
                            p-2">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="flex flex-row items-center justify-center gap-2">
                                {/* storeLogo */}
                                <Image
                                  src={store?.storeLogo || "/icon-store.png"}
                                  alt="Store"
                                  width={30}
                                  height={30}
                                  className="rounded-lg w-8 h-8 object-cover"
                                />
                                <span>
                                  가맹점 자동결제 및 정산(USDT)
                                </span>
                                <Image
                                  src="/icon-settlement.png"
                                  alt="Settlement"
                                  width={20}
                                  height={20}
                                  className={`
                                    ${buyOrders.filter((item) => item.status === 'paymentConfirmed'
                                    && item?.settlement?.status !== "paymentSettled").length > 0 ? 'animate-spin' : ''}
                                    w-5 h-5
                                  `}
                                />

                                <span className="text-sm text-zinc-50 font-semibold">
                                  {
                                    buyOrders.filter((item) => item.status === 'paymentConfirmed'
                                    && item?.settlement?.status !== "paymentSettled").length
                                  }
                                </span>

                              </div>


                            </div>

                          </th>








                          {/*
                          <th className="
                            hidden xl:table-cell
                            p-2">
                            정산비율
                          </th>

                          <th className="
                            p-2">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="flex flex-row items-center justify-center gap-2">
                                <span>
                                  자동정산
                                </span>
                                <Image
                                  src="/icon-settlement.png"
                                  alt="Settlement"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 animate-spin"
                                />

                                <span className="text-sm text-zinc-50 font-semibold">
                                  {
                                    buyOrders.filter((item) => item.status === 'paymentConfirmed'
                                    && item?.settlement?.status !== "paymentSettled").length
                                  }
                                </span>

                              </div>


                            </div>

                          </th>
                          */}
                         

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

                              w-32 h-32
                              flex flex-col xl:flex-row items-start justify-start gap-2
                              bg-zinc-100
                              rounded-lg
                              border border-zinc-800
                              hover:bg-zinc-200
                              cursor-pointer
                              transition-all duration-200 ease-in-out
                              hover:scale-105
                              hover:shadow-lg
                              hover:shadow-zinc-500/50
                              p-2

                              "
                              onClick={() => {
                              setSelectedItem(item);
                              //setShowDetail(true);
                            }}
                              
                              >




                                <div className=" flex flex-col gap-2 items-center justify-start">

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
                                    
                                    <span className="text-sm text-zinc-500 font-semibold">
                                      {
                                        item?.store?.storeName
                                      }
                                    </span>
                                  </div>


                                  <span className="text-sm text-zinc-500 font-semibold">
                                  {
                                    "#" + item.tradeId
                                  }
                                  </span>

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

                                </div>

                              </div>

                            </td>
                            
                            <td className="p-2">
                              <div className="flex flex-col items-start justify-start gap-2">
                                {/*
                                <Image
                                  src={item.avatar || "/profile-default.png"}
                                  alt="Avatar"
                                  width={20}
                                  height={20}
                                  priority={true} // Added priority property
                                  className="rounded-full"
                                  style={{
                                      objectFit: 'cover',
                                      width: '20px',
                                      height: '20px',
                                  }}
                                />
                                */}
                                
                                <div className="flex flex-col gap-2 items-center justify-center">



                                  <span className="text-lg text-blue-600 font-bold">
                                    {
                                      item?.nickname?.length > 3 ?
                                      item?.nickname?.substring(0, 3) + '...' :
                                      item?.nickname
                                    }
                                  </span>


                                  <div className="flex flex-row items-center gap-2">
                                    <span className="text-sm text-yellow-600 font-semibold">
                                      {
                                        //item.walletAddress === address ? 'Me' : item.tradeId ? item.tradeId : ''

                                        item?.buyer?.depositName.slice(0,1) + '...'

                                      }
                                    </span>
                                    <span className="
                                      hidden xl:flex
                                      text-sm text-zinc-500">
                                      {
                                        item?.buyer?.depositBankName
                                      }
                                    </span>
                                    <span className="
                                      text-sm text-zinc-500">
                                      {
                                        item?.buyer?.depositBanktAccountNumber &&
                                        item?.buyer?.depositBanktAccountNumber.substring(0, 3) + '...'
                                      }
                                    </span>
                                  </div>


                                </div>

                                <span className="text-sm text-zinc-500">
                                  {
                                    item.walletAddress.substring(0, 6) + '...' + item.walletAddress.substring(item.walletAddress.length - 4)
                                  }
                                </span>



                              </div>

                            </td>


                            <td className="p-2">
                              <div className="
                                w-32
                                flex flex-col gap-2 items-end justify-start">
                                <span className="text-lg text-zinc-500 font-semibold"
                                  style={{
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {
                                    item.krwAmount?.toLocaleString() + ' 원'
                                  }
                                </span>
                                <span className="text-lg text-[#409192]"
                                  style={{
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {item.usdtAmount}{' '}USDT
                                </span>
                                <span className="text-sm text-zinc-500"
                                  style={{
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {
                                    Number(item.rate).toFixed(2)
                                    //Number(item.krwAmount / item.usdtAmount).toFixed(2)
                                  }
                                </span>
                              </div>
                            </td>

                            {/*}
                            <td className="p-2">
                              <div className="flex flex-col gap-2 items-center justify-center">
                                {

                                  (
                                    item.status === 'paymentRequested' ||
                                    item.status === 'ordered' ||
                                    item.status === 'accepted' ||
                                    item.status === 'paymentConfirmed'
                                  ) ? (

                                    <div className="text-xl text-zinc-500 font-semibold"
                                      // monospace
                                      style={{
                                        fontFamily: 'monospace',
                                      }}
                                    >
                                      {
                                        item.krwAmount?.toLocaleString() + ' 원'
                                      }
                                    </div>

                                  ) : (
                                    item.status === 'test'
                                  ) ? (
                                    <div className="flex flex-col gap-2 items-end justify-center">
                                      <input
                                        disabled={false}
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
                                  ) : (
                                    <></>
                                  )

                                }
                              </div>
                            </td>
                            */}






                            <td className="p-2">

                              <div className="
                                w-48
                                flex flex-row items-center justify-center gap-2">
                                {/* status */}
                                {item.status === 'ordered' && (
                                  <div className="flex flex-col gap-2 items-center justify-center">

                                    <div className="flex flex-row items-center justify-center gap-2">
                                      <Image
                                        src="/icon-matching.png"
                                        alt="Auto Matching"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 animate-spin"
                                      />
                                      <span className="text-sm text-zinc-500 font-semibold">
                                        판매자 매칭중
                                      </span>
                                    </div>

                                    <button
                                      className="text-sm text-red-600 font-semibold
                                        border border-red-600 rounded-lg p-2"
                                    >
                                      {Buy_Order_Opened}
                                    </button>


                           
                                  


                                  {/*
                                  <div className="text-lg text-yellow-600 font-semibold
                                    border border-yellow-600 rounded-lg p-2
                                    bg-yellow-100
                                    w-full text-center
                                    ">


                                    {Buy_Order_Opened}
                                  </div>
                                  */}

                                  </div>
                                )}

                                {item.status === 'ordered' ? (
                                  <span className="text-sm text-zinc-500 font-semibold">
                                    
                                  </span>
                                ) : (

                                  <div className="flex flex-col gap-2 items-center justify-center">

                                    <div className="flex flex-row items-center justify-center gap-2">

                                      <Image
                                        src="/icon-matching.png"
                                        alt="Matching Completed"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5"
                                      />
                                      <span className="text-sm text-zinc-500 font-semibold">
                                        매칭완료
                                      </span>
                                    </div>


                                    <div className="flex flex-row items-center justify-center gap-2">
                                      <Image
                                        src={item.seller?.avatar || "/icon-seller.png"}
                                        alt="Seller Avatar"
                                        width={20}
                                        height={20}
                                        className="rounded-full w-5 h-5"
                                      />
                                      <span className="text-xl font-bold text-green-500">
                                        {
                                          item.seller?.nickname &&
                                          item.seller.nickname.length > 10 ?
                                          item.seller.nickname.slice(0, 10) + '...' :
                                          item.seller?.nickname
                                        }
                                      </span>
                                    </div>

                                    {/* wallet address */}
                                    <span className="text-sm text-zinc-500">
                                      {
                                        item.seller?.walletAddress &&
                                        item.seller?.walletAddress.slice(0, 5) + '...' + item.seller?.walletAddress.slice(-5)
                                      }
                                    </span>


                                  </div>
                                )}


                              






                                {item.status === 'accepted' && (

                                  <div className="flex flex-col gap-2 items-center justify-center">
                                    <button
                                      className="text-sm text-blue-600 font-semibold
                                        border border-blue-600 rounded-lg p-2"
                                    >
                                      {Trade_Started}
                                    </button>


                                    {/*
                                    <div className="text-sm text-white">
                                      {item.seller?.nickname}
                                    </div>
                                    */}
                                    
                                    <div className="text-sm text-zinc-500">

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

                                  <div className="flex flex-col gap-2 items-start justify-start">

                                    {/*
                                    <div className="text-lg text-yellow-600 font-semibold
                                      border border-yellow-600 rounded-lg p-2
                                      bg-yellow-100
                                      w-full text-center
                                      ">
                              

                                      {Request_Payment}


                                    </div>
                                    */}
                                    <button
                                      className="text-sm text-yellow-600 font-semibold
                                        border border-yellow-600 rounded-lg p-2"
                                    >
                                      {Request_Payment}
                                    </button>


                                    {/*
                                    <div className="text-sm text-white">
                                      {item.seller?.nickname}
                                    </div>
                                    */}

                                    <div className="text-sm text-zinc-500">
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
                                  <div className="flex flex-col gap-2 items-start justify-start">
 
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
                                        className="text-sm text-red-600 font-semibold
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
                                  <div className="flex flex-col gap-2 items-start justify-start">

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
                                      className="text-sm text-[#409192] font-semibold
                                        border border-green-600 rounded-lg p-2"
                                    >
                                      {Completed}
                                    </button>

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
                                  <div className="flex flex-col gap-2 items-start justify-start">
                                    
                                    {Completed_at}
                                  </div>
                                )}

                              </div>

                            </td>


                            {/*
                            {address && (
                              <td className="p-2
                              w-32
                              ">
                                <div className="w-full flex flex-col gap-2 items-center justify-center">
    

                                {
                                  user?.seller &&
                                  item.status === 'ordered'  && (


                                  <div className="bg-gray-500/10
                                    rounded-md
                                    p-2

                                    w-44
                                    xl:w-64
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
                                            acceptBuyOrder(index, item._id, smsReceiverMobileNumber);
                                          }}
                                        >
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
                                          
                                        </button>

                                      </div>

                                    </div>

                                  </div>

                                )}



                                {item?.seller?.walletAddress !== address ? (

                                  <div className="flex flex-col gap-2 items-center justify-center">


                                    <div className="flex flex-col xl:flex-row gap-2 items-center justify-center">
                                      <span className="text-sm text-zinc-500 font-semibold">
                                        {item.seller?.bankInfo?.bankName}
                                      </span>
                                      <span className="text-sm text-zinc-500 font-semibold">
                                        {
                                          item.seller?.bankInfo?.accountNumber &&
                                          item.seller?.bankInfo?.accountNumber.substring(0, 3) + '...'
                                        }
                                      </span>
                                      <span className="text-sm text-zinc-500 font-semibold">
                                        {item.seller?.bankInfo?.accountHolder}
                                      </span>
                                    </div>

                                    {item.status === 'cancelled' && (
                                      <div className="text-sm text-red-600">
                                        {item.cancelTradeReason ? item.cancelTradeReason :
                                          "판매취소사유 없음"
                                        }
                                        
                                      </div>
                                    )}
                                  </div>

                                ) : (

      


                                  <div className={`
                                    ${
                                    item.status === 'accepted' ? 'bg-blue-500/10'
                                    : item.status === 'paymentRequested' ? 'bg-blue-500/10'
                                    : item.status === 'paymentConfirmed' ? 'bg-blue-500/10'
                                    : item.status === 'cancelled' ? 'bg-red-500/10'
                                    : item.status === 'paymentConfirmed' ? 'bg-green-500/10'
                                    : 'bg-gray-500/10'
                                    } 

                                    rounded-md
                                    p-2

                                    w-44
                                    xl:w-64
                                    flex flex-col xl:flex-row gap-2 items-start justify-start
                                    `}>

                                    
                                    <div className="
                                      w-full
                                      flex flex-col gap-2 items-start justify-start">


                                      {item.status === 'accepted' && item.seller && item.seller.walletAddress === address && (
                                        
                                        <div className="flex flex-col items-center gap-2">
                                        
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
                                                cancelTrade(item._id, index);
                                              }}
                                            >
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



                                        </div>

                                      )}

                                      {item.status === 'cancelled' && (
                                        <div className="text-sm text-red-600">
                                          {item.cancelTradeReason ? item.cancelTradeReason :
                                            "판매취소사유 없음"
                                          }
                                          
                                        </div>
                                      )}
                                    </div>


                                    <div className="w-full flex flex-col gap-2 items-start justify-start">

                                      {
                                        item.seller && item.seller.walletAddress === address &&
                                        item.status === 'accepted' && (


                                        <div className="
                                          w-full
                                          flex flex-col gap-2 items-center justify-center">

                                          <div className="flex flex-row gap-2">

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
                                              
                                              className="text-sm text-yellow-600 font-semibold
                                                border border-yellow-600 rounded-lg p-2
                                                bg-yellow-100
                                                w-full text-center
                                                hover:bg-yellow-200
                                                cursor-pointer
                                                transition-all duration-200 ease-in-out
                                                hover:scale-105
                                                hover:shadow-lg
                                                hover:shadow-yellow-500/50
                                              "
                                              onClick={() => {

                                                requestPayment(
                                                  index,
                                                  item._id,
                                                  item.tradeId,
                                                  item.usdtAmount,
                                                  item.storecode,
                                                );
                                              }}
                                            >

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
                                            
                                            </button>






                                          </div>

                                          <div className="flex flex-col gap-2 items-center justify-center">
                                            <div className="flex flex-row gap-2 items-center justify-center">
                                              <span className="text-sm text-zinc-500">
                                                {item.seller?.bankInfo?.bankName}
                                              </span>
                                              <span className="text-sm text-zinc-500">
                                                {item.seller?.bankInfo?.accountHolder}
                                              </span>

                                            </div>

                                            <span className="text-sm text-zinc-500">
                                              {
                                                item.seller?.bankInfo?.accountNumber
                                              }
                                            </span>

                                          </div>


                                        </div>
                                      )}



                                      {item.seller && item.seller.walletAddress === address &&   
                                      item.status === 'paymentRequested' && (

                                        <div className="
                                          w-full
                                          flex flex-col gap-2 items-end justify-center">


                                          
                                          <div className="flex flex-row gap-2">

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
                                            />

                                            <button
                                              disabled={confirmingPayment[index] || !confirmPaymentCheck[index]}
                                              
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
                                                  paymentAmounts[index],
                                                  paymentAmountsUsdt[index],
                                                  //item.storecode,
                                                );
                                              }}

                                            >

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
                                                판매완료
                                              </span>

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

                                              </button>

                                            </div>
                                          )}


                                          <div className="w-full flex flex-row gap-2 items-center justify-center">
                                            <input
                                              disabled={false}
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

  
                                      {item.status === 'paymentConfirmed' && (
                                        <div className="flex flex-col gap-2 items-center justify-center">

                                          

                                        </div>
                                      )}




                                    </div>

                                  


                                  </div>

                                )}

                                </div>

                              </td>
                            )}
                            */}
                            


                            <td className="p-2">

                              {item?.status === 'paymentConfirmed' && (
                                <div className="
                                  w-32
                                  flex flex-col gap-2 items-center justify-center">
                                  <div className="flex flex-row gap-2 items-center justify-center">
                                    <Image
                                      src="/icon-bank-check.png"
                                      alt="Bank Check"
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                    <span className="text-sm font-semibold text-zinc-500">
                                      입금완료
                                    </span>
                                  </div>

                                  {/* seller bank info */}
                                  <div className="flex flex-row gap-2 items-center justify-center">
                                    <span className="text-sm text-zinc-500">
                                      {item.seller?.bankInfo?.bankName}
                                    </span>
                                    <span className="text-sm text-zinc-500">
                                      {item.seller?.bankInfo?.accountHolder}
                                    </span>
                                  </div>

                                  {/* paymentAmount */}
                                  <span className="text-lg text-[#409192] font-semibold"
                                    style={{ fontFamily: 'monospace' }}>
                                    {
                                      item.paymentAmount?.toLocaleString()
                                    }{' '}원
                                  </span>
                                


                                </div>
                              )}

                              {item?.status === 'paymentRequested' && (

                                <div className="
                                  w-32
                                  flex flex-col gap-2 items-center justify-center">
     
                                  <div className="flex flex-row gap-2 items-center justify-center">
                                    <Image
                                      src="/icon-bank-auto.png"
                                      alt="Bank Auto"
                                      width={20}
                                      height={20}
                                      className="animate-spin"
                                    />
                                    <span className="text-sm font-semibold text-zinc-500">
                                      입금확인중
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-2 items-center justify-center">
                                    <div className="flex flex-row items-center gap-2">
                                      <div className="text-sm text-zinc-500">
                                        {item.seller?.bankInfo?.bankName}
                                      </div>
                                      <div className="text-sm text-zinc-500">
                                        {item.seller?.bankInfo?.accountHolder}
                                      </div>
                                    </div>
                                    <div className="text-sm text-zinc-500">
                                      {
                                        item.seller?.bankInfo?.accountNumber
                                      }
                                    </div>

                                  </div>




                                  {item.seller
                                  && item.seller.walletAddress === seller?.vaultWallet?.address
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
                                            confirm("수동으로 입금확인을 처리하시겠습니까?") &&
                                            confirmPayment(
                                              index,
                                              item._id,
                                              //paymentAmounts[index],
                                              //paymentAmountsUsdt[index],

                                              item.storecode,

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

                              )}
                            </td>









                        <td className="p-2">
                          <div className="
                            w-64 flex flex-col gap-2 items-center justify-center">
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
                                      acceptBuyOrder(index, item._id, smsReceiverMobileNumber);
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
                                  {/* seller nickname */}
                                  <div className="text-lg text-zinc-500 font-semibold">
                                    {user?.nickname}
                                  </div>
                                </div>


                              </div>

                            </div>

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
                                      판매자가 판매한 테더(USDT)를 구매자에게 보내는 중
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
                              flex flex-col xl:flex-row gap-2 items-start justify-start
                              `}>


                              
                              <div className="
                                w-full
                                flex flex-col gap-2 items-start justify-start">


                                {
                                (item.status === 'accepted' || item.status === 'paymentRequested')
                                && item.seller
                                && item.seller.walletAddress === address
                                
                                && (
                                  
                                  <div className="flex flex-col items-center gap-2">
                                  
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
                                          cancelTrade(item._id, index);
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
                                    {/* warning message */}
                                    {/* 취소사유가 없을 경우 판매자 평가에 영향을 미칠 수 있습니다. */}
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

                                      className={`flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md ${cancellings[index] || !agreementForCancelTrade[index] ? 'bg-gray-500' : 'bg-red-500'}`}
                                        
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

                                    {item.store?.bankInfo ? (

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
                                          
                                          className="text-sm text-yellow-600 font-semibold
                                            border border-yellow-600 rounded-lg p-2
                                            bg-yellow-100
                                            w-full text-center
                                            hover:bg-yellow-200
                                            cursor-pointer
                                            transition-all duration-200 ease-in-out
                                            hover:scale-105
                                            hover:shadow-lg
                                            hover:shadow-yellow-500/50
                                          "
                                          onClick={() => {

                                            requestPayment(
                                              index,
                                              item._id,
                                              item.tradeId,
                                              item.usdtAmount,
                                              item.storecode,

                                              //item.store?.bankInfo,
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
                                            {item.store?.bankInfo?.accountHolder}
                                          </span>
                                          <span className="text-sm text-zinc-500">
                                            {item.store?.bankInfo?.bankName}
                                          </span>
                                        </div>
                                        {/*
                                        <span className="text-sm text-zinc-500">
                                          {
                                            item.store?.bankInfo?.accountNumber &&
                                            item.store?.bankInfo?.accountNumber.length > 5 &&
                                            item.store?.bankInfo?.accountNumber.substring(0, 5) + '...'
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


                                {/*
                                {item.seller
                                && item.seller.walletAddress === address
                                && item.status === 'paymentRequested'
                                
                                ///////////////&& item?.autoConfirmPayment

                                && (

                                  <div className="
                                    w-full
                                    flex flex-col gap-2 items-center justify-center">
                                    
                                    <div className="flex flex-row items-center gap-2">


                                      <button
                                        disabled={isProcessingSendTransaction.current || confirmingPayment[index] }
                                        
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
                                            {confirmingPayment[index] ? '처리중...' : '판매완료'}
                                          </span>
                                        </div>

                                      </button>

                                    </div>

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

                                    <div className="text-sm text-red-500">
                                      입금확인후 판매완료 버튼을 눌러 P2P 거래를 완료하세요.
                                    </div>

                                  </div>


                                )}
                                */}



                                {/* paymentConfirmed */}
                                {/* paymentAmount */}
                                {item.status === 'paymentConfirmed' && (

                                  <div className="
                                    w-56
                                    flex flex-col gap-2 items-center justify-center">





                                    {/* 자동입금처리일경우 */}
                                    {/* 수동으로 결제완료처리 버튼 */}
                                  
                                    { !item?.settlement &&

                                    ///item?.autoConfirmPayment &&

                                    (item?.transactionHash === '0x' || item?.transactionHash === undefined) &&
                                    
                                    (


                                      <div className="w-full flex flex-col items-start justify-center gap-2">

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


                                        {/*
                                        <button
                                          //disabled={confirmingPayment[index] || !confirmPaymentCheck[index]}
                                          //disabled={confirmingPayment[index]}
                                          disabled={
                                            
                                            //isProcessingSendTransaction
                                            isProcessingSendTransaction.current

                                            || sendingTransaction[index]
                                          }

                                          className={`
                                            w-full  
                                            flex flex-row gap-1 text-sm text-white px-2 py-1 rounded-md
                                            border border-blue-600
                                            hover:border-blue-700
                                            hover:shadow-lg
                                            hover:shadow-blue-500/50
                                            transition-all duration-200 ease-in-out

                                            ${sendingTransaction[index] ? 'bg-gray-500' : 'bg-blue-500'}
                                          `}

                                          // onclick avoid avoid repeated execution of onclick event
                                          // use a ref to track if the event is already in progress
                                          
                                          onClick={(e) => {

                                            //e.preventDefault();
                                            //e.stopPropagation();

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
                                              src="/icon-tether.png"
                                              alt="Transfer"
                                              width={20}
                                              height={20}
                                              className={`
                                              ${sendingTransaction[index] ? 'animate-spin' : 'animate-pulse'}
                                                w-5 h-5
                                              `}
                                            />
                                            <span className="text-sm text-white">
                                              {sendingTransaction[index] ? '전송중...' : '전송하기'}
                                            </span>
                                          </div>

                                        </button>
                                        */}


                                        {/* warning message */}
                                        {/*
                                        {sendingTransaction[index] && (
                                          <div className="flex flex-row gap-2 items-center justify-center">
                                            <Image
                                              src="/icon-warning.png"
                                              alt="Warning"
                                              width={20}
                                              height={20}
                                              className="w-5 h-5"
                                            />
                                            <div className="text-sm text-red-500">
                                              전송중에 절대 새로고침하거나 뒤로가기를 하지 마세요.
                                            </div>
                                          </div>
                                        )}
                                        */}

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



                          {
                          (item?.transactionHash && item?.transactionHash !== '0x') && (
                            <div className="w-full flex flex-col gap-2 items-center justify-center">

                              <div className="flex flex-row gap-2 items-center justify-center">
                                <Image
                                  src="/icon-trade.png"
                                  alt="Trade Completed"
                                  width={30}
                                  height={30}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <span className="text-sm">
                                  P2P 거래를 완료했습니다.
                                </span>
                              </div>

                              <button
                                className="
                                  flex flex-row gap-2 items-center justify-between
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
                            </div>
                          )}


                          {item?.settlement &&
                          (!item?.transactionHash || item?.transactionHash === '0x') && (
                            <div className="flex flex-row gap-2 items-center justify-center">
                              <span className="text-sm text-zinc-500">
                                txid 저장이 누락되었습니다.
                              </span>
                            </div>
                          )}




                          {/*
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
                                판매자가 판매한 테더(USDT)를 구매자에게 보내는 중
                              </span>
                            </div>
                          )}
                            */}


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
                                <Image
                                  src={`/logo-chain-${chain}.png`}
                                  alt={`${chain} Logo`}
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





                          </div>

                        </td>


                        <td className="p-2">
                          <div className="w-full flex flex-col gap-2 items-center justify-center
                            bg-zinc-50 p-4 rounded-lg shadow-sm">


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
                                  src='/icon-payment.png'
                                  alt="Payment Completed"
                                  width={30}
                                  height={30}
                                  className="w-10 h-10 rounded-lg"
                                />
                                <span className="text-sm font-semibold text-zinc-500">
                                  회원이
                                </span>
                                <span className="text-sm font-semibold text-zinc-500">
                                  {item?.store?.storeName}
                                </span>
                                <span className="text-sm font-semibold text-zinc-500">
                                  가맹점 결제를 완료했습니다.
                                </span>

                              </div>

                            )}


                            <div className="flex flex-row gap-2 items-between justify-center">

                              {item?.settlement && (
                                <div className="flex flex-col gap-2 items-end justify-center">

                                  {/*
                                  <div className="w-full flex flex-row gap-2 items-center justify-center">
                                    <span className="
                                    w-14 text-end
                                    text-sm text-zinc-500"
                                      style={{
                                        fontFamily: 'monospace',
                                      }}>
                                      {Number(
                                        100.0 - (item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0)
                                         - (item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.0)
                                         - (item?.settlement?.platformFeePercent ? item?.settlement?.platformFeePercent : 0.0)
                                      ).toFixed(2)
                                      }%
                                    </span>
                                  </div>
                                  */}

                                  {/*
                                  <div className="w-full flex flex-row gap-2 items-center justify-center">
                                    <span className="
                                    w-16
                                    text-sm text-zinc-500">
                                      AG 수수료
                                    </span>
                                    <span className="
                                    w-14 text-end
                                    text-sm text-zinc-500"
                                      style={{
                                        fontFamily: 'monospace',
                                      }}>
                                      {Number(item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0).toFixed(3)}%
                                    </span>
                                  </div>

                                  <div className="w-full flex flex-row gap-2 items-center justify-center">
                                    <span className="
                                    w-16
                                    text-sm text-zinc-500">
                                      센터 수수료
                                    </span>
                                    <span className="
                                    w-14  text-end
                                    text-sm text-zinc-500"
                                      style={{
                                        fontFamily: 'monospace',
                                      }}>
                                      {Number(item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.3).toFixed(3)}%
                                    </span>
                                  </div>
                                  */}

                                </div>
                              )}



                              {item?.settlement ? (

                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <div className="w-full flex flex-col gap-2 items-end justify-center">
                                    <button
                                      className="
                                      w-full
                                      flex flex-col gap-2 items-center justify-center px-4 py-2
                                      rounded-lg
                                      border border-blue-600
                                      hover:border-blue-700
                                      

                                      bg-blue-100 text-blue-600 font-semibold

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
                                        window.open(
    
                                          chain === 'ethereum' ? `https://etherscan.io/tx/${item.settlement.txid}`
                                          : chain === 'polygon' ? `https://polygonscan.com/tx/${item.settlement.txid}`
                                          : chain === 'arbitrum' ? `https://arbiscan.io/tx/${item.settlement.txid}`
                                          : chain === 'bsc' ? `https://bscscan.com/tx/${item.settlement.txid}`
                                          : `https://arbiscan.io/tx/${item.settlement.txid}`,

                                          '_blank'
                                        );
                                      }}
                                    >

                                      <div className="w-full flex flex-row gap-2 items-center justify-center"
                                        style={{
                                          fontFamily: 'monospace',
                                        }}
                                      >
                                        <div className="flex flex-row gap-1 items-center justify-center">
                                          <Image
                                            src="/icon-tether.png"
                                            alt="Settlement Tether"
                                            width={20}
                                            height={20}
                                            className="w-5 h-5"
                                          />
                                          <span className="text-lg font-semibold text-[#409192]">
                                            {Number(item?.settlement?.settlementAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                          </span>
                                        </div>


                                        {/* chain logo */}
                                        <Image
                                          src={`/logo-chain-${chain}.png`}
                                          alt={`${chain} Logo`}
                                          width={20}
                                          height={20}
                                          className="w-5 h-5"
                                        />


                                        
                                        {/*
                                        <span>
                                          {
                                            item?.settlement?.agentFeeAmount ?
                                            item?.settlement?.agentFeeAmount?.toLocaleString() + ' USDT'
                                            : '0 USDT'
                                          }
                                          {' '}
                                          {
                                            item?.settlement?.agentFeeWalletAddress &&
                                          item?.settlement?.agentFeeWalletAddress?.slice(0, 5) + '...'}
                                        </span>
                                        <span>
                                          {item?.settlement?.feeAmount?.toLocaleString() + ' USDT'}
                                          {' '}
                                          {
                                            item?.settlement?.feeWalletAddress &&
                                          item?.settlement?.feeWalletAddress?.slice(0, 5) + '...'}
                                        </span>
                                        */}



                                      </div>

                                    </button>

                                    {/* https://arbiscan.io/token/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9?a=0x27819bb55cB09A6Bc1E1a82e7A085A340981039A */}
                                    {/*
                                    <div className="flex flex-row items-center justify-center gap-1">
                                      <Image
                                        src="/icon-shield.png"
                                        alt="Settlement Shield"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5"
                                      />
                                      <button
                                        className="
                                          text-sm text-blue-600 underline font-semibold
                                          hover:text-blue-800
                                          hover:cursor-pointer
                                          transition-all duration-200 ease-in-out
                                          hover:scale-105
                                          hover:shadow-lg
                                          hover:shadow-blue-500/50
                                        "
                                        onClick={() => {
                                          window.open(
                                            chain === 'ethereum' ? `https://etherscan.io/token/${ethereumContractAddressUSDT}?a=${item?.settlement?.settlementWalletAddress}`
                                            : chain === 'polygon' ? `https://polygonscan.com/token/${polygonContractAddressUSDT}?a=${item?.settlement?.settlementWalletAddress}`
                                            : chain === 'arbitrum' ? `https://arbiscan.io/token/${arbitrumContractAddressUSDT}?a=${item?.settlement?.settlementWalletAddress}`
                                            : chain === 'bsc' ? `https://bscscan.com/token/${bscContractAddressUSDT}?a=${item?.settlement?.settlementWalletAddress}`
                                            : `https://arbiscan.io/token/${item?.settlement?.settlementWalletAddress}`,
                                            '_blank'
                                          );
                                        }}
                                      >
                                          {
                                            item?.settlement?.settlementWalletAddress &&
                                            item?.settlement?.settlementWalletAddress?.slice(0, 5) + '...'
                                          }
                                      </button>
                                    </div>
                                    */}
                                  </div>

                                  {/*
                                  <div className="
                                  w-40 
                                  flex flex-col gap-2 items-end justify-center"
                                  >
                                    <div className="flex flex-row gap-1 items-center justify-center">
                                      <Image
                                        src="/icon-user.png"
                                        alt="User Icon"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5"
                                      />
                                      <span className="text-lg font-semibold text-blue-600">
                                        {item.nickname}
                                      </span>
                                    </div>
                                    <span className="text-sm text-blue-600 font-semibold"
                                      style={{
                                        fontFamily: 'monospace',
                                      }}
                                    >
                                      {Number(item.krwAmount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원 충전
                                    </span>
                                  </div>
                                  */}

                                </div>

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

                                          {/*
                                          <div className="flex flex-row gap-2 items-center justify-center">
                                            <Image
                                              src="/icon-payment.gif"
                                              alt="Payment Processing"
                                              width={30}
                                              height={30}
                                            />
                                            <span className="text-sm font-semibold text-zinc-500">
                                              회원({item.nickname})이 구매한 테더(USDT)를 결제하는 중
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

                                          <div className="flex flex-row items-center justify-center gap-1">
                                            <Image
                                              src="/icon-tether.png"
                                              alt="Settlement Tether"
                                              width={20}
                                              height={20}
                                              className="w-5 h-5"
                                            />
                                            <span className="text-lg font-semibold text-[#409192]"
                                              style={{
                                                fontFamily: 'monospace',
                                              }}
                                            >
                                              {Number(item.usdtAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            </span>
                                          </div>
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


















                            {/*
                            <td className="
                              hidden xl:table-cell
                              p-2">
                              <div className="flex flex-col gap-2 items-end justify-center">

                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <span className="
                                  w-10
                                  text-sm text-zinc-500">
                                    상점
                                  </span>
                                  <span className="
                                  w-14 text-end
                                  text-sm text-zinc-500"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}>
                                    {Number(
                                      100 - (item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0) - (item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.3)
                                    ).toFixed(2)
                                    }%
                                  </span>
                                </div>

                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <span className="
                                  w-10
                                  text-sm text-zinc-500">
                                    에이전트
                                  </span>
                                  <span className="
                                  w-14 text-end
                                  text-sm text-zinc-500"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}>
                                    {Number(item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0).toFixed(2)}%
                                  </span>
                                </div>

                                <div className="w-full flex flex-row gap-2 items-center justify-center">
                                  <span className="
                                  w-10
                                  text-sm text-zinc-500">
                                    센터
                                  </span>
                                  <span className="
                                  w-14  text-end
                                  text-sm text-zinc-500"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}>
                                    {Number(item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.3).toFixed(2)}%
                                  </span>
                                </div>


                                
                                <span className="text-sm text-zinc-500"
                                  style={{
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  상점:{' '}
                                  { //  settlementFeePercent
                                    // dealerFeePercent
                                    Number(
                                      100 - (item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0) - (item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.3)
                                    ).toFixed(2)

                                  }%
                                </span>
                                <span className="text-sm text-zinc-500"
                                  style={{
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  에이전트:{' '}
                                  {
                                    Number(item.store?.agentFeePercent ? item.store?.agentFeePercent : 0.0).toFixed(2)
                                  }%
                                </span>
                                <span className="text-sm text-zinc-500"
                                  style={{
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  센터:{' '}
                                  {
                                    Number(item.store.settlementFeePercent ? item.store.settlementFeePercent : 0.3).toFixed(2)
                                  }%
                                </span>
                                


                              </div>
                            </td>


                            <td className="
                            p-2">

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
                                    window.open(
                                      `https://arbiscan.io/tx/${item.settlement.txid}`,
                                      '_blank'
                                    );
                                  }}
                                >


                                  <div className="flex flex-col gap-2 items-end justify-center"
                                    style={{
                                      fontFamily: 'monospace',
                                    }}
                                  >


                                    
                                    <span>
                                      {item?.settlement?.settlementAmount?.toLocaleString() + ' USDT'}
                                      {' '}
                                      {
                                        item?.settlement?.settlementWalletAddress &&
                                      item?.settlement?.settlementWalletAddress?.slice(0, 5) + '...'}
                                    </span>
                                    <span>
                                      {item?.settlement?.agentFeeAmount?.toLocaleString() + ' USDT'}
                                      {' '}
                                      {
                                        item?.settlement?.agentFeeWalletAddress &&
                                      item?.settlement?.agentFeeWalletAddress?.slice(0, 5) + '...'}
                                    </span>
                                    <span>
                                      {item?.settlement?.feeAmount?.toLocaleString() + ' USDT'}
                                      {' '}
                                      {
                                        item?.settlement?.feeWalletAddress &&
                                      item?.settlement?.feeWalletAddress?.slice(0, 5) + '...'}
                                    </span>

                                  </div>

                                </button>

                              ) : (
                                <>
                                  {item.status === 'paymentConfirmed' && (
                                  <div className="flex flex-row gap-2 items-center justify-center">
                                    <Image
                                      src="/icon-settlement.png"
                                      alt="Settlement"
                                      width={20}
                                      height={20}
                                      className="animate-spin"
                                    />
                                    <span className="text-sm font-semibold text-zinc-500">
                                      상점 결제중...
                                    </span>
                                  </div>
                                  )}
                                </>
                              )}
                            </td>
                            */}



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

                                    Number(item.krwAmount / item.usdtAmount).toFixed(2)

                                    }</p>
                                </div>


                              </div>

                      

                              <div className="mb-4 flex flex-col items-start text-sm ">
                                {Payment}: {Bank_Transfer} ({item.seller?.bankInfo?.bankName})
                              </div>



                              <div className="flex flex-col items-start justify-start gap-2">
                                <p className="mt-2 mb-2 flex items-center gap-2">

                                  <Image
                                      src={item.avatar || '/profile-default.png'}
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
                                      src={item?.buyer?.avatar || "/profile-default.png"}
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
                                    src={item.seller?.avatar || "/profile-default.png"}
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
                              
                                            window.open(`https://arbiscan.io/tx/${item.escrowTransactionHash}`);
                                            


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
        
                                                      acceptBuyOrder(index, item._id, smsReceiverMobileNumber);
                                                

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
            <div className="mt-4 flex flex-row items-center justify-center gap-4">


              <div className="flex flex-row items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) =>
                    
                    router.push(`/${params.lang}/home?limit=${Number(e.target.value)}&page=${page}`)

                  }

                  className="text-sm bg-zinc-800 text-zinc-200 px-2 py-1 rounded-md"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>


              {/* 처을으로 */}
              <button
                disabled={Number(page) <= 1}
                className={`text-sm text-white px-4 py-2 rounded-md ${Number(page) <= 1 ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={() => {
                  
                  router.push(`/${params.lang}/home?limit=${Number(limit)}&page=1`);

                }
              }
              >
                처음으로
              </button>

              <button
                disabled={Number(page) <= 1}
                className={`text-sm text-white px-4 py-2 rounded-md ${Number(page) <= 1 ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={() => {
                  
                  router.push(`/${params.lang}/home?limit=${Number(limit)}&page=${Number(page) - 1}`);

                }}
              >
                이전
              </button>


              <span className="text-sm text-zinc-500">
                {page} / {Math.ceil(Number(totalCount) / Number(limit))}
              </span>


              <button
                disabled={Number(page) >= Math.ceil(Number(totalCount) / Number(limit))}
                className={`text-sm text-white px-4 py-2 rounded-md ${Number(page) >= Math.ceil(Number(totalCount) / Number(limit)) ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={() => {
                  
                  router.push(`/${params.lang}/home?limit=${Number(limit)}&page=${Number(page) + 1}`);

                }}
              >
                다음
              </button>

              {/* 마지막으로 */}
              <button
                disabled={Number(page) >= Math.ceil(Number(totalCount) / Number(limit))}
                className={`text-sm text-white px-4 py-2 rounded-md ${Number(page) >= Math.ceil(Number(totalCount) / Number(limit)) ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={() => {
                  
                  router.push(`/${params.lang}/home?limit=${Number(limit)}&page=${Math.ceil(Number(totalCount) / Number(limit))}`);

                }}
              >
                마지막으로
              </button>

            </div>


            


            <div className="w-full flex flex-col items-center justify-center mt-10 mb-10
              bg-white shadow-lg rounded-lg p-6
              border border-gray-200
              ">
              <p className="text-sm text-zinc-500 font-semibold">
              📌 필독 안내사항
              </p>
              <div className='flex flex-col items-start justify-start mt-2'>
                <ul className="list-disc list-inside text-sm text-zinc-500 font-semibold">
                  <li>대행 신청 전 유의사항을 반드시 확인해 주세요. 신청 전 안내된 내용을 충분히 숙지하지 않아 발생하는 모든 문제는 회원 본인의 책임이며, 당사는 이에 대해 책임지지 않습니다.</li>
                  <li>코인 전송 완료 후에는 취소 및 환불이 불가능합니다. 대행 신청 완료 후 진행된 코인 거래는 어떤 경우에도 취소나 환불이 불가하오니 신중히 진행해 주세요.</li>
                  <li>최근 코인 거래 관련 사기가 빈번하게 발생하고 있습니다. 구매 및 판매 시 반드시 신원과 거래 내용을 철저히 확인하신 후 진행해 주시기 바랍니다. ※ 대행 신청 후 사고 발생 시 당사는 도움을 드릴 수 없습니다.</li>
                  <li>불법 자금 거래 및 금융사기 방지를 위해 최선을 다하고 있습니다. 의심스러운 거래로 판단될 경우, 회원 본인에게 신분증, 통장 사본, 거래 내역, 이체 확인증 등의 추가 인증을 요청드릴 수 있습니다.</li>
                  <li>잘못된 정보 입력 시 거래에 문제가 발생할 수 있습니다. 모든 정보를 정확히 기입해 주시고, 신청 전 다시 한 번 확인 부탁드립니다.</li>
                  <li>영업시간: 연중무휴 24시간 운영 언제든지 문의 및 이용이 가능합니다.</li>
                </ul>
              </div>
            </div>







            {/* footer */}
            {/* 이용약관 / 개인정보처리방침 / 고객센터 */}
            <div className="
              w-full
              flex flex-col items-center justify-center mt-10 mb-10
              bg-white shadow-lg rounded-lg p-6
              border border-gray-200
              ">

              <div className="text-sm text-zinc-500 mt-2">
                © 2025 LOOT. All rights reserved.
              </div>

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
        src={`https://cryptoss.beauty/ko/${selectedItem?.storecode}/pay-usdt-reverse/${selectedItem?._id}`}

        
          
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
    const receiveAmount = (amount / price).toFixed(2);
    const commission = 0.01; // example commission
  
    return (

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
          <h2 className="text-lg font-semibold text-black ">Iskan9</h2>
          <span className="ml-2 text-blue-500 text-sm">318 trades</span>
        </div>
        <p className="text-gray-600 mt-2">The offer is taken from another source. You can only use chat if the trade is open.</p>
        
        <div className="mt-4">
          <div className="flex justify-between text-gray-700">
            <span>Price</span>
            <span>{price} KRW</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Limit</span>
            <span>40680.00 KRW - 99002.9 KRW</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Available</span>
            <span>1085.91 USDT</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Seller&apos;s payment method</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 rounded-full">Tinkoff</span>
          </div>
          <div className="mt-4 text-gray-700">
            <p>24/7</p>
          </div>
        </div>
  
        <div className="mt-6 border-t pt-4 text-gray-700">
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-gray-700">I want to pay</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(
                    e.target.value === '' ? 0 : parseInt(e.target.value)
                ) }

                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700">I will receive</label>
              <input 
                type="text"
                value={`${receiveAmount} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700">Commission</label>
              <input 
                type="text"
                value={`${commission} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
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
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
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


