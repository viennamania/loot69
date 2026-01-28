// nickname settings
'use client';
import React, { use, useEffect, useState } from 'react';



import { toast } from 'react-hot-toast';

import { client } from "../../../client";

import {
    getContract,
    sendAndConfirmTransaction,
} from "thirdweb";

import {
    ConnectButton,
    useActiveAccount,
    useActiveWallet,

    useConnectedWallets,
    useSetActiveWallet,
} from "thirdweb/react";


import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";

import { getUserPhoneNumber } from "thirdweb/wallets/in-app";


import Image from 'next/image';

import GearSetupIcon from "@/components/gearSetupIcon";


import Uploader from '@/components/uploader';

import { balanceOf, transfer } from "thirdweb/extensions/erc20";
 

import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../dictionaries";


import { useQRCode } from 'next-qrcode';


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


const contractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon

const contractAddressArbitrum = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum




import {
    useRouter,
    useSearchParams,
} from "next//navigation";





export default function SettingsPage({ params }: any) {


    //console.log("params", params);
    
    const searchParams = useSearchParams();
 
    ///const wallet = searchParams.get('wallet');

    const { Canvas } = useQRCode();




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

        Wallet_Settings: "",
        Profile_Settings: "",

        Profile: "",
        My_Profile_Picture: "",
  
        Edit: "",


        Cancel: "",
        Save: "",
        Enter_your_nickname: "",
        Nickname_should_be_5_10_characters: "",

        Seller: "",
        Not_a_seller: "",
        Apply: "",
        Applying: "",
        Enter_your_bank_name: "",
        Enter_your_account_number: "",
        Enter_your_account_holder: "",
        Send_OTP: "",
        Enter_OTP: "",
        Verify_OTP: "",
        OTP_verified: "",

        Nickname_should_be_alphanumeric_lowercase: "",
        Nickname_should_be_at_least_5_characters_and_at_most_10_characters: "",

        Copied_Wallet_Address: "",

        Escrow: "",

        Make_Escrow_Wallet: "",

        Escrow_Wallet_Address_has_been_created: "",
        Failed_to_create_Escrow_Wallet_Address: "",
  
    
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

        Wallet_Settings,
        Profile_Settings,

        Profile,
        My_Profile_Picture,
  
        Edit,

        Cancel,
        Save,
        Enter_your_nickname,
        Nickname_should_be_5_10_characters,

        Seller,
        Not_a_seller,
        Apply,
        Applying,
        Enter_your_bank_name,
        Enter_your_account_number,
        Enter_your_account_holder,
        Send_OTP,
        Enter_OTP,
        Verify_OTP,
        OTP_verified,

        Nickname_should_be_alphanumeric_lowercase,
        Nickname_should_be_at_least_5_characters_and_at_most_10_characters,

        Copied_Wallet_Address,

        Escrow,

        Make_Escrow_Wallet,

        Escrow_Wallet_Address_has_been_created,
        Failed_to_create_Escrow_Wallet_Address,

    } = data;
    
    



    const router = useRouter();



  // get the active wallet
  const activeWallet = useActiveWallet();

  const setActiveAccount = useSetActiveWallet();
 
  const connectWallets = useConnectedWallets();

  //console.log('connectWallets', connectWallets);

  const smartConnectWallet = connectWallets?.[0];
  const inAppConnectWallet = connectWallets?.[1];






    const smartAccount = useActiveAccount();

    const address = smartAccount?.address;

      
 

    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
  
  
      if (smartAccount) {
  
        //const phoneNumber = await getUserPhoneNumber({ client });
        //setPhoneNumber(phoneNumber);
  
  
        getUserPhoneNumber({ client }).then((phoneNumber) => {
          setPhoneNumber(phoneNumber || "");
        });
  
  
  
      }
  
    } , [smartAccount]);








    ///const [nativeBalance, setNativeBalance] = useState(0);
    const [balance, setBalance] = useState(0);
    useEffect(() => {
  
      // get the balance
      const getBalance = async () => {
  
        ///console.log('getBalance address', address);
  
        
        const result = await balanceOf({
          contract,
          address: address || "",
        });
  
    
        //console.log('balance result', result);
    
        setBalance( Number(result) / 10 ** 6 );
  
        /*
        await fetch('/api/user/getBalanceByWalletAddress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chain: params.center,
            walletAddress: address,
          }),
        })
  
        .then(response => response.json())
  
        .then(data => {
            setNativeBalance(data.result?.displayValue);
        });
        */
  
  
      };
  
      if (address) getBalance();
  
      const interval = setInterval(() => {
        if (address) getBalance();
      } , 5000);
  
      return () => clearInterval(interval);
  
    } , [address, contract]);
  




    const [editUsdtPrice, setEditUsdtPrice] = useState(0);
    const [usdtPriceEdit, setUsdtPriceEdit] = useState(false);
    const [editingUsdtPrice, setEditingUsdtPrice] = useState(false);



    // get usdt price
    // api /api/order/getPrice

    const [usdtPrice, setUsdtPrice] = useState(0);
    useEffect(() => {

        if (!address) {
            return;
        }

        const fetchData = async () => {

            setEditingUsdtPrice(true);

            const response = await fetch("/api/order/getPrice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletAddress: address,
                }),
            });

            const data = await response.json();

            ///console.log("getPrice data", data);

            if (data.result) {
                setUsdtPrice(data.result.usdtPrice);
            }

            setEditingUsdtPrice(false);
        };

        fetchData();
    }

    , [address]);


    
    const [nickname, setNickname] = useState("");
    const [avatar, setAvatar] = useState("/profile-default.png");
    const [userCode, setUserCode] = useState("");


    const [nicknameEdit, setNicknameEdit] = useState(false);

    const [editedNickname, setEditedNickname] = useState("");


    const [avatarEdit, setAvatarEdit] = useState(false);



    const [seller, setSeller] = useState(null) as any;

    //const [escrowWalletAddress, setEscrowWalletAddress] = useState('');




    const [loadingUserData, setLoadingUserData] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoadingUserData(true);
            const response = await fetch("/api/user/getUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storecode: params.center,
                    walletAddress: address,
                }),
            });

            const data = await response.json();

            ////console.log("data", data);

            if (data.result) {
                setNickname(data.result.nickname);
                
                data.result.avatar && setAvatar(data.result.avatar);
                

                setUserCode(data.result.id);

                setSeller(data.result.seller);

                ////setEscrowWalletAddress(data.result.seller?.escrowWalletAddress || '');
            } else {
                setNickname('');
                setAvatar('/profile-default.png');
                setUserCode('');
                setSeller(null);
                setEditedNickname('');
                setAccountHolder('');
                setAccountNumber('');

                ///setEscrowWalletAddress('');

                //setBankName('');
            }
            setLoadingUserData(false);

        };

        fetchData();
    }, [address, params.center]);






    const setUserData = async () => {


        // check nickname length and alphanumeric
        //if (nickname.length < 5 || nickname.length > 10) {

        if (editedNickname.length < 5 || editedNickname.length > 10) {

            toast.error(Nickname_should_be_5_10_characters);
            return;
        }
        
        ///if (!/^[a-z0-9]*$/.test(nickname)) {
        if (!/^[a-z0-9]*$/.test(editedNickname)) {
            alert(Nickname_should_be_alphanumeric_lowercase);
            return;
        }

        if (nicknameEdit) {


            const response = await fetch("/api/user/updateUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storecode: params.center,
                    walletAddress: address,
                    
                    //nickname: nickname,
                    nickname: editedNickname,

                }),
            });

            const data = await response.json();

            ///console.log("updateUser data", data);

            if (data.result) {

                setUserCode(data.result.id);
                setNickname(data.result.nickname);

                setNicknameEdit(false);
                setEditedNickname('');

                toast.success('아이디이 저장되었습니다');

            } else {

                toast.error('아이디 저장에 실패했습니다');
            }


        } else {

            const response = await fetch("/api/user/setUserVerified", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lang: params.lang,
                    storecode: params.center,
                    walletAddress: address,
                    
                    //nickname: nickname,
                    nickname: editedNickname,

                    mobile: phoneNumber,
                }),
            });

            const data = await response.json();

            console.log("data", data);

            if (data.result) {

                setUserCode(data.result.id);
                setNickname(data.result.nickname);

                setNicknameEdit(false);
                setEditedNickname('');

                toast.success('아이디이 저장되었습니다');

            } else {
                toast.error('아이디 저장에 실패했습니다');
            }
        }


        

        
    }


    // 은행명, 계좌번호, 예금주
    const [bankName, setBankName] = useState("");

    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");

    const [applying, setApplying] = useState(false);


    const apply = async () => {
      if (applying) {
        return;
      }
  
  
      if (!bankName || !accountNumber || !accountHolder) {
        toast.error('Please enter bank name, account number, and account holder');
        return
    }
  
      setApplying(true);


      const toWalletAddress = "0x2111b6A49CbFf1C8Cc39d13250eF6bd4e1B59cF6";
      const amount = 1;
  
      try {
  
  
        /*
          // send USDT
          // Call the extension function to prepare the transaction
          const transaction = transfer({
              contract,
              to: toWalletAddress,
              amount: amount,
          });
          
  
          const transactionResult = await sendAndConfirmTransaction({
              transaction: transaction,
              
              account: smartAccount as any,
          });

  
          console.log(transactionResult);
            */
  
          await fetch('/api/user/updateSeller', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: params.center,
                walletAddress: address,
                sellerStatus: 'confirmed',
                bankName: bankName,
                accountNumber: accountNumber,
                accountHolder: accountHolder,
            }),
          });
          


          await fetch('/api/user/getUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: params.center,
                walletAddress: address,
            }),
          }).then((response) => response.json())
            .then((data) => {
                setSeller(data.result.seller);
            });

  
  
  
          /////toast.success('USDT sent successfully');
  
        
  
  
      } catch (error) {
        toast.error('Failed to apply');
      }
  
      setApplying(false);
    };
  



    // sellerEnabled
    // functon to toggle seller enabled
    const toggleSellerEnabled = async () => {
        if (!seller) return;
        const newEnabled = !seller.enabled;
        await fetch('/api/user/updateSellerEnabled', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: params.center,
                walletAddress: address,
                sellerEnabled: newEnabled,
            }),
        });
        setSeller({
            ...seller,
            enabled: newEnabled,
        });
    };


    // apply seller
    const [applyingSeller, setApplyingSeller] = useState(false);
    const applySeller = async () => {
        if (applyingSeller) return;
        setApplyingSeller(true);

        const response = await fetch('/api/user/applySeller', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: params.center,
                walletAddress: address,
            }),
        });
        const data = await response.json();

        if (!data.result) {
            toast.error('판매자 신청에 실패했습니다');
            setApplyingSeller(false);
            return;
        }


        // reload seller data
        const responseGetUser  = await fetch("/api/user/getUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                storecode: params.center,
                walletAddress: address,
            }),
        });
        const dataGetUser = await responseGetUser.json();
        if (dataGetUser.result) {
            setSeller(dataGetUser.result.seller);
        }
        setApplyingSeller(false);
    };



    // check box edit seller
    const [editSeller, setEditSeller] = useState(false);


    const [otp, setOtp] = useState('');

    ///const [verifiedOtp, setVerifiedOtp] = useState(false);
    const [verifiedOtp, setVerifiedOtp] = useState(true);
  
    const [isSendedOtp, setIsSendedOtp] = useState(false);
  
  
  
    const [isSendingOtp, setIsSendingOtp] = useState(false);
  
    const [isVerifingOtp, setIsVerifingOtp] = useState(false);
  
    
  
    const sendOtp = async () => {
  
      setIsSendingOtp(true);
        
      const response = await fetch('/api/transaction/setOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang: params.lang,
          chain: params.center,
          walletAddress: address,
          mobile: phoneNumber,
        }),
      });
  
      const data = await response.json();
  
      //console.log("data", data);
  
      if (data.result) {
        setIsSendedOtp(true);
        toast.success('OTP sent successfully');
      } else {
        toast.error('Failed to send OTP');
      }
  
      setIsSendingOtp(false);
  
    };
  
    const verifyOtp = async () => {
  
      setIsVerifingOtp(true);
        
      /*
      const response = await fetch('/api/transaction/verifyOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang: params.lang,
          chain: params.center,
          walletAddress: address,
          otp: otp,
        }),
      });
  
      const data = await response.json();
  
      //console.log("data", data);
  
      if (data.status === 'success') {
        setVerifiedOtp(true);
        toast.success('OTP verified successfully');
      } else {
        toast.error('Failed to verify OTP');
      }
        */
    
      setVerifiedOtp(true);
      toast.success('OTP verified successfully');
  
      setIsVerifingOtp(false);
    
    }
  







    // get escrow wallet address and balance
    
    const [escrowBalance, setEscrowBalance] = useState(0);

    
    useEffect(() => {

    const getEscrowBalance = async () => {

        if (!address) {
            setEscrowBalance(0);
            return;
        }

        if (!seller?.escrowWalletAddress || seller?.escrowWalletAddress === '') return;

        const result = await balanceOf({
            contract,
            address: seller?.escrowWalletAddress,
        });

        //console.log('escrow balance result', result);
    
        setEscrowBalance( Number(result) / 10 ** 6 );

    };

    getEscrowBalance();

    const interval = setInterval(() => {
        getEscrowBalance();
    } , 5000);

    return () => clearInterval(interval);

    } , [address, seller?.escrowWalletAddress, contract]);




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
            storecode: params.center,
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




    // user.seller usdtToKrwRate rate update
    const [usdtToKrwRate, setUsdtToKrwRate] = useState(0);
    const [updatingUsdtToKrw, setUpdatingUsdtToKrw] = useState(false);
    const updateUsdtToKrwRate = async () => {
        if (!seller) return;
        setUpdatingUsdtToKrw(true);
        await fetch('/api/user/updateSellerUsdtToKrwRate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: params.center,
                walletAddress: address,
                usdtToKrwRate: usdtToKrwRate,
            }),
        });
        setUpdatingUsdtToKrw(false);
        setSeller({
            ...seller,
            usdtToKrwRate: usdtToKrwRate,
        });
    };



    return (

        <main className="p-4 min-h-[100vh] flex items-start justify-center container max-w-screen-sm mx-auto">

            <div className="py-0 w-full">
        

                {params.center && (
                    <div className="w-full flex flex-row items-center justify-center gap-2 bg-black/10 p-2 rounded-lg mb-4">
                        <span className="text-sm text-zinc-500">
                        {params.center}
                        </span>
                    </div>
                )}
        
                <div className="w-full flex flex-row gap-2 items-center justify-start text-zinc-500 text-lg"
                >
                    {/* go back button */}
                    <div className="w-full flex justify-start items-center gap-2">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center bg-gray-200 rounded-full p-2">
                            <Image
                                src="/icon-back.png"
                                alt="Back"
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                        </button>
                        {/* title */}
                        <span className="text-sm text-gray-500 font-semibold">
                            돌아가기
                        </span>
                    </div>



                </div>

                {!address && (
                    <div className="w-full flex flex-col items-center justify-center gap-4 mt-8">
                        <div className="text-lg text-zinc-500">
                            {Please_connect_your_wallet_first}
                        </div>
                    </div>
                )}


                {address && (
                    <div className="w-full flex flex-col items-end justify-center gap-2">

                        <div className="flex flex-row items-center justify-center gap-2">

                            <button
                                className="text-lg text-zinc-600 underline"
                                onClick={() => {
                                    navigator.clipboard.writeText(address);
                                    toast.success(Copied_Wallet_Address);
                                } }
                            >
                                {address.substring(0, 6)}...{address.substring(address.length - 4)}
                            </button>
                            
                            <Image
                                src="/icon-shield.png"
                                alt="Wallet"
                                width={100}
                                height={100}
                                className="w-6 h-6"
                            />

                        </div>

                        <div className="flex flex-row items-center justify-end  gap-2">
                            <span className="text-2xl xl:text-4xl font-semibold text-[#409192]"
                                style={{ fontFamily: 'monospace' }}
                            >
                                {Number(balance).toFixed(2)}
                            </span>
                        </div>

                    </div>
                )}

                {address && loadingUserData && (
                    <div>Loading user data...</div>
                )}

                {address && !loadingUserData && !nickname && (
                    <div className='w-full flex flex-col gap-2 items-center justify-center border border-gray-300 p-4 rounded-lg'>

                        <span className="text-lg font-semibold">
                            회원이 아닙니다.
                        </span>

                        <button
                            onClick={() => {
                                router.push('/' + params.lang + '/administration/profile-settings');
                            }}
                            className="bg-blue-500 text-zinc-100 px-4 py-2 rounded"
                        >
                            회원가입하기
                        </button>

                    </div>
                )}

                {address && !loadingUserData && nickname && !seller && (
                    <div className='w-full flex flex-col gap-2 items-center justify-center border border-gray-300 p-4 rounded-lg'>

                        {/* nickname */}
                        <div className='w-full flex flex-row gap-2 items-center justify-between'>
                            <div className="flex flex-row items-center gap-2">
                                {/* dot */}
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    회원아이디
                                </span>
                            </div>
                            <span className="text-4xl font-semibold text-[#409192]">
                                {nickname}
                            </span>
                        </div>

                        <span className="text-lg font-semibold">
                            판매자가 아닙니다.
                        </span>

                        <button
                            onClick={() => {
                                applySeller();
                            }}
                            className={`
                                ${applyingSeller ? 'bg-gray-400' : 'bg-blue-500'} text-zinc-100 px-4 py-2 rounded
                            `}
                            disabled={applyingSeller}
                        >
                            {applyingSeller ? Applying + '...' : Apply}
                        </button>

                    </div>
                )}


                {!loadingUserData && seller && (

                    <div className='w-full flex flex-col gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>

                        {/* image and title */}
                        <div className='w-full flex flex-row gap-2 items-center justify-start'>
                            <Image
                                src="/icon-seller.png"
                                alt="Seller"
                                width={50}
                                height={50}
                                className='w-10 h-10'
                            />
                            <span className="text-2xl font-semibold">
                                {Seller} 설정
                            </span>
                        </div>


                        {/* nickname */}
                        <div className='w-full flex flex-row gap-2 items-center justify-between'>
                            <div className="flex flex-row items-center gap-2">
                                {/* dot */}
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    회원아이디
                                </span>
                            </div>
                            <span className="text-4xl font-semibold text-[#409192]">
                                {nickname}
                            </span>
                        </div>

                        {/* seller?.status */}
                        {/* status: pending, confirmed, rejected */}
                        <div className='w-full flex flex-row gap-2 items-center justify-between
                            border-t border-gray-300 pt-4'>
                            <div className="flex flex-row items-center gap-2">
                                {/* dot */}
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    판매자 상태
                                </span>
                            </div>
                            {seller?.status === 'pending' ? (
                                <div className="flex flex-row items-center gap-2
                                    bg-yellow-200 text-yellow-800 p-2 rounded-lg">
                                    <span className="text-lg font-semibold">
                                        승인대기중
                                    </span>
                                </div>
                            ) : seller?.status === 'confirmed' ? (
                                <div className="flex flex-row items-center gap-2
                                    bg-green-200 text-green-800 p-2 rounded-lg">
                                    <span className="text-lg font-semibold">
                                        승인완료
                                    </span>
                                </div>
                            ) : seller?.status === 'rejected' ? (
                                <div className="flex flex-row items-center gap-2
                                    bg-red-200 text-red-800 p-2 rounded-lg">
                                    <span className="text-lg font-semibold">
                                        승인거절
                                    </span>
                                </div>
                            ) : null}
                        </div>


                        {/* seller?.enabled */}
                        {/* 판매시작 여부 */}
                        {/* toggle seller enabled */}
                        <div className='w-full flex flex-row gap-2 items-center justify-between
                            border-t border-gray-300 pt-4'>
                            <div className="flex flex-row items-center gap-2">
                                {/* dot */}
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    판매자 활동 상태
                                </span>
                            </div>
                            {seller?.enabled ? (
                                <button
                                    onClick={toggleSellerEnabled}
                                    className="flex flex-row items-center gap-2
                                        bg-green-500 text-zinc-100 p-2 rounded-lg"
                                >
                                    <span className="text-lg font-semibold">
                                        판매중
                                    </span>
                                </button>
                            ) : (
                                <button
                                    onClick={toggleSellerEnabled}
                                    className="flex flex-row items-center gap-2
                                        bg-gray-300 text-gray-600 p-2 rounded-lg"
                                >
                                    <span className="text-lg font-semibold">
                                        판매중지
                                    </span>
                                </button>
                            )}
                        </div>
                        


                        {/* bank info */}

                        <div className='w-full flex flex-row gap-2 items-center justify-between
                            border-t border-gray-300 pt-4'>
                            <div className="flex flex-row items-center gap-2">
                                {/* dot */}
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    입금받을 계좌 정보
                                </span>
                            </div>


                            <div className="flex flex-col xl:flex-row p-2 gap-2">
                                
                                <span className="text-lg text-zinc-500 font-semibold">
                                    {seller?.bankInfo?.bankName}
                                </span>

                                <span className="text-lg text-zinc-500 font-semibold">
                                    {seller?.bankInfo?.accountNumber}
                                </span>
                                <span className="text-lg text-zinc-500 font-semibold">
                                    {seller?.bankInfo?.accountHolder}
                                </span>

                            </div>

                            {/*
                            <button
                                onClick={() => {
                                    setEditSeller(!editSeller);
                                }}
                                className="p-2 bg-blue-500 text-zinc-100 rounded"
                            >
                                {editSeller ? Cancel : Edit}
                            </button>
                            */}


                        </div>


                        <div className='mt-4 flex flex-col gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>
                            
                            <div className='w-full flex flex-row gap-2 items-center justify-between'>

                                <div className="flex flex-row items-center gap-2">
                                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                    <span className="text-lg">
                                        입금받을 계좌 정보 수정
                                    </span>
                                </div>

                                {!seller && (
                                    <div className="text-lg text-zinc-500">
                                        {Not_a_seller}
                                    </div>
                                )}

                                {applying ? (
                                    <div className="p-2 bg-zinc-800 rounded text-zinc-100 text-xl font-semibold">
                                        {Applying}...
                                    </div>
                                ) : (
                                    <button
                                        disabled={applying || !verifiedOtp}

                                        onClick={() => {
                                            // apply to be a seller
                                            // set seller to true
                                            // set seller to false
                                            // set seller to pending

                                            apply();

                                        }}
                                        className={`
                                            ${!verifiedOtp ? 'bg-gray-300 text-gray-400'
                                            : 'bg-green-500 text-zinc-100'}

                                            p-2 rounded-lg text-sm font-semibold
                                        `}
                                    >
                                        {Apply}
                                    </button>
                                )}

                            </div>

                            {/* 은행명, 계좌번호, 예금주 */}
                            <div className='flex flex-col gap-2 items-start justify-between w-full'>

                                {/*                             
                                <input 
                                    disabled={applying}
                                    className="p-2 w-64 text-zinc-100 bg-zinc-800 rounded text-lg font-semibold"
                                    placeholder={Enter_your_bank_name}
                                    value={bankName}
                                    type='text'
                                    onChange={(e) => {
                                        setBankName(e.target.value);
                                    }}
                                />
                                */}


                                <select
                                    disabled={!address}
                                    className="p-2 w-full text-lg text-center bg-zinc-800 rounded-lg text-zinc-100
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                    value={bankName}
                                    onChange={(e) => {
                                        setBankName(e.target.value);
                                    }}
                                >
                                    <option value="" selected={bankName === ""}>
                                        은행선택
                                    </option>
                                    <option value="카카오뱅크" selected={bankName === "카카오뱅크"}>
                                        카카오뱅크
                                    </option>
                                    <option value="케이뱅크" selected={bankName === "케이뱅크"}>
                                        케이뱅크
                                    </option>
                                    <option value="토스뱅크" selected={bankName === "토스뱅크"}>
                                        토스뱅크
                                    </option>
                                    <option value="국민은행" selected={bankName === "국민은행"}>
                                        국민은행
                                    </option>
                                    <option value="우리은행" selected={bankName === "우리은행"}>
                                        우리은행
                                    </option>
                                    <option value="신한은행" selected={bankName === "신한은행"}>
                                        신한은행
                                    </option>
                                    <option value="농협" selected={bankName === "농협"}>
                                        농협
                                    </option>
                                    <option value="기업은행" selected={bankName === "기업은행"}>
                                        기업은행
                                    </option>
                                    <option value="하나은행" selected={bankName === "하나은행"}>
                                        하나은행
                                    </option>
                                    <option value="외환은행" selected={bankName === "외환은행"}>
                                        외환은행
                                    </option>
                                    <option value="부산은행" selected={bankName === "부산은행"}>
                                        부산은행
                                    </option>
                                    <option value="대구은행" selected={bankName === "대구은행"}>
                                        대구은행
                                    </option>
                                    <option value="전북은행" selected={bankName === "전북은행"}>
                                        전북은행
                                    </option>
                                    <option value="경북은행" selected={bankName === "경북은행"}>
                                        경북은행
                                    </option>
                                    <option value="광주은행" selected={bankName === "광주은행"}>
                                        광주은행
                                    </option>
                                    <option value="수협" selected={bankName === "수협"}>
                                        수협
                                    </option>
                                    <option value="씨티은행" selected={bankName === "씨티은행"}>
                                        씨티은행
                                    </option>
                                    <option value="대신은행" selected={bankName === "대신은행"}>
                                        대신은행
                                    </option>
                                    <option value="동양종합금융" selected={bankName === "동양종합금융"}>
                                        동양종합금융
                                    </option>
                                    <option value="JT친애저축은행" selected={bankName === "JT친애저축은행"}>
                                        JT친애저축은행
                                    </option>

                                </select>

                                
                                <input 
                                    disabled={applying}
                                    className="p-2 w-64 text-zinc-100 bg-zinc-800 rounded-lg text-lg"
                                    placeholder={Enter_your_account_number}
                                    value={accountNumber}
                                    type='number'
                                    onChange={(e) => {

                                        // check if the value is a number

                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');

                                        setAccountNumber(e.target.value);
                                    }}
                                />
                                <input 
                                    disabled={applying}
                                    className="p-2 w-64 text-zinc-100 bg-zinc-800 rounded-lg text-lg"
                                    placeholder={Enter_your_account_holder}
                                    value={accountHolder}
                                    type='text'
                                    onChange={(e) => {
                                        setAccountHolder(e.target.value);
                                    }}
                                />
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
                                <div className="text-white">
                                    {OTP_verified}
                                </div>
                                </div>
                            ) : (
                            
                        
                                <div className="w-full flex flex-row gap-2 items-start">

                                <button
                                    disabled={!address || isSendingOtp}
                                    onClick={sendOtp}
                                    className={`
                                    
                                    ${isSendedOtp && 'hidden'}

                                    w-32 p-2 rounded-lg text-sm font-semibold

                                        ${
                                        !address || isSendingOtp
                                        ?'bg-gray-300 text-gray-400'
                                        : 'bg-green-500 text-white'
                                        }
                                    
                                    `}
                                >
                                    {Send_OTP}
                                </button>


                                <div className={`flex flex-row gap-2 items-center justify-center ${!isSendedOtp && 'hidden'}`}>
                                    <input
                                    type="text"
                                    placeholder={Enter_OTP}
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
                                        {Verify_OTP}
                                    </button>
                                </div>



                                </div>

                            )}
                            */}

                        </div>

                    </div>
                )}


                {!loadingUserData && seller?.escrowWalletAddress && (
                    
                    <div className='w-full flex flex-col gap-2 items-start justify-between mt-4 p-4 border border-gray-300 rounded-lg'>

                        <div className='w-full flex flex-row gap-2 items-center justify-start mb-2'>
                            <Image
                                src="/icon-escrow-wallet.png"
                                alt="Escrow Wallet"
                                width={50}
                                height={50}
                                className='w-10 h-10'
                            />
                            <span className="text-2xl font-semibold">
                                에스크로 지갑 정보
                            </span>
                        </div>
                        {/* 설명 */}
                        {/* 에스크로 지갑에 잔액이 있어야 구매주문을 자동으로 처리할 수 있습니다. */}
                        <div className="text-zinc-500 mb-4">
                            에스크로 지갑에 잔액이 있어야 구매주문을 자동으로 처리할 수 있습니다.
                        </div>

                        <div className="flex flex-row items-center gap-2">
                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                            <span className="text-lg">
                                에스크로 지갑 주소
                            </span>
                        </div>

                        <div className='w-full flex flex-row gap-2 items-center justify-between'>
                            <div className="flex flex-row items-center gap-2">
                                <Image
                                    src="/icon-smart-wallet.png"
                                    alt="Smart Wallet"
                                    width={50}
                                    height={50}
                                    className='w-8 h-8'
                                />
                                <button
                                    className="text-lg text-zinc-600 underline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(seller?.escrowWalletAddress || "");
                                        toast.success("에스크로 지갑 주소가 복사되었습니다" );
                                    } }
                                >
                                    {seller?.escrowWalletAddress.slice(0, 6)}...{seller?.escrowWalletAddress.slice(-4)}
                                </button>
                            </div>
                            {/* QR code */}
                            <Canvas text={seller?.escrowWalletAddress || ""} />
                        </div>

                        <div className='w-full flex flex-row gap-2 items-center justify-between mt-4
                        border-t border-gray-300 pt-4'>
                            <div className="flex flex-row items-center gap-2">
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    에스크로 잔액
                                </span>
                            </div>
                            <div className='flex flex-row items-center gap-2 mb-2'>
                                <span className="text-2xl xl:text-4xl font-semibold text-[#409192]"
                                    style={{ fontFamily: 'monospace' }}
                                >
                                    {escrowBalance.toFixed(2)}
                                </span>
                            </div>

                        </div>

                        {/* 충전하기, 회수하기 버튼 */}
                        <div className='w-full flex flex-row gap-2 items-center justify-end'>

                            <button
                                onClick={() => {
                                    //router.push('/' + params.lang + '/wallet/deposit?storecode=' + storecode + '&to=' + (seller?.escrowWalletAddress || ''));
                                }}
                                className="bg-blue-500 text-zinc-100 px-4 py-2 rounded-lg"
                            >
                                충전하기
                            </button>

                            <button
                                onClick={() => {
                                    // open transfer escrow balance modal
                                    //setIsOpenTransferEscrowBalanceModal(true);
                                }}
                                className="bg-red-500 text-zinc-100 px-4 py-2 rounded-lg"
                            >
                                회수하기
                            </button>

                        </div>


                        {/* 판매금액(원) 설정 */}
                        <div className='w-full flex flex-col gap-2 items-start justify-between mt-4
                        border-t border-gray-300 pt-4'>

                            <div className="flex flex-row items-center gap-2">
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className="text-lg">
                                    1 USDT 당 판매금액(원) 설정
                                </span>

                                {/* seller.usdtToKrwRate */}
                                <span className="text-lg text-zinc-500">
                                    (현재 설정: {seller?.usdtToKrwRate || 0} 원)
                                </span>
                            </div>

                            <div className='w-full flex flex-row gap-2 items-center justify-end'>

                                <input 
                                    className="p-2 w-32 text-zinc-100 bg-zinc-800 rounded-lg text-lg font-semibold text-right"
                                    placeholder="예: 1300"
                                    value={usdtToKrwRate}
                                    type='number'
                                    onChange={(e) => {
                                        // check if the value is a number
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                        setUsdtToKrwRate(Number(e.target.value));
                                    }}
                                />

                                <button
                                    disabled={updatingUsdtToKrw}
                                    onClick={updateUsdtToKrwRate}
                                    className={`
                                        ${updatingUsdtToKrw ? 'bg-gray-300 text-gray-400' : 'bg-green-500 text-zinc-100'}
                                        p-2 rounded-lg text-sm font-semibold
                                    `}
                                >
                                    {updatingUsdtToKrw ? '수정중...' : '수정하기'}
                                </button>

                            </div>

                        </div>

                    </div>
                )}



            </div>

        </main>

    );

}

          
