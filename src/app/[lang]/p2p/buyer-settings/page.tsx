// nickname settings
'use client';
import React, { use, useEffect, useState } from 'react';



import { toast } from 'react-hot-toast';

import { useClientWallets } from '@/lib/useClientWallets';
import { client } from "@/app/client";

import {
    getContract,
    sendAndConfirmTransaction,
} from "thirdweb";

import {
    AutoConnect,
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



const storecode = "admin";



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

    const { smartAccountEnabled, wallet } = useClientWallets();

    // get the active wallet
    const activeWallet = useActiveWallet();

    const setActiveAccount = useSetActiveWallet();
    
    const connectWallets = useConnectedWallets();

    //console.log('connectWallets', connectWallets);

    const smartConnectWallet = connectWallets?.[0];
    const inAppConnectWallet = connectWallets?.[1];


    const smartAccount = useActiveAccount();

    const address = smartAccount?.address;

    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '-';

    const copyWalletAddress = async () => {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            toast.success('지갑주소가 복사되었습니다.');
            setWalletCopied(true);
            window.setTimeout(() => setWalletCopied(false), 1500);
        } catch (error) {
            console.error('Failed to copy wallet address', error);
            toast.error('복사에 실패했습니다.');
        }
    };

      
 

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
            chain: storecode,
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
    const [walletCopied, setWalletCopied] = useState(false);



    //const [seller, setSeller] = useState(null) as any;

    //const [escrowWalletAddress, setEscrowWalletAddress] = useState('');


    const [buyer, setBuyer] = useState(null) as any;

    const [kycFile, setKycFile] = useState<File | null>(null);
    const [kycPreview, setKycPreview] = useState<string | null>(null);
    const [kycImageUrl, setKycImageUrl] = useState<string | null>(null);
    const [kycSubmitting, setKycSubmitting] = useState(false);


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
                    storecode: storecode,
                    walletAddress: address,
                }),
            });

            const data = await response.json();

            ////console.log("data", data);

            if (data.result) {
                setNickname(data.result.nickname);
                
                data.result.avatar && setAvatar(data.result.avatar);
                

                setUserCode(data.result.id);

                setBuyer(data.result.buyer);
                setKycImageUrl(data.result.buyer?.kyc?.idImageUrl || null);
                setKycPreview(data.result.buyer?.kyc?.idImageUrl || null);

                ////setEscrowWalletAddress(data.result.seller?.escrowWalletAddress || '');
            } else {
                setNickname('');
                setAvatar('/profile-default.png');
                setUserCode('');
                setBuyer(null);
                setEditedNickname('');
                setAccountHolder('');
                setAccountNumber('');
                setKycImageUrl(null);
                setKycPreview(null);
                setKycFile(null);

                ///setEscrowWalletAddress('');

                //setBankName('');
            }
            setLoadingUserData(false);

        };

        fetchData();
    }, [address]);

    const updateSendbirdNickname = async (nextNickname: string) => {
        if (!address || !nextNickname) return;
        try {
            const response = await fetch('/api/sendbird/update-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: address,
                    nickname: nextNickname,
                    profileUrl: avatar || undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(error?.error || 'Sendbird nickname update failed');
            }
        } catch (error) {
            console.error('Sendbird nickname update failed', error);
            toast.error('채팅 닉네임 변경에 실패했습니다.');
        }
    };





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
                    storecode: storecode,
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
                await updateSendbirdNickname(data.result.nickname);

                setNicknameEdit(false);
                setEditedNickname('');

                toast.success('채팅 닉네임도 변경됨');

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
                    storecode: storecode,
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
                await updateSendbirdNickname(data.result.nickname);

                setNicknameEdit(false);
                setEditedNickname('');

                toast.success('채팅 닉네임도 변경됨');

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
  
          const nextBuyerStatus = buyer?.status === 'confirmed' ? 'confirmed' : 'pending';
          const nextBankInfo = {
            ...(buyer?.bankInfo || {}),
            status: 'pending',
            submittedAt: new Date().toISOString(),
            rejectionReason: '',
          };

          await fetch('/api/user/updateBuyer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
                buyerStatus: nextBuyerStatus,
                bankName: bankName,
                accountNumber: accountNumber,
                accountHolder: accountHolder,
                buyer: {
                    ...(buyer || {}),
                    status: nextBuyerStatus,
                    bankInfo: nextBankInfo,
                    kyc: buyer?.kyc,
                },
            }),
          });
          


          await fetch('/api/user/getUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
            }),
          }).then((response) => response.json())
            .then((data) => {
                setBuyer(data.result.buyer);
            });

  
  
  
          /////toast.success('USDT sent successfully');
  
        
  
  
      } catch (error) {
        toast.error('Failed to apply');
      }
  
      setApplying(false);
    };
  



    // apply buyer
    const [applyingBuyer, setApplyingBuyer] = useState(false);
    const applyBuyer = async () => {
        if (applyingBuyer) return;
        setApplyingBuyer(true);
        await fetch('/api/user/applyBuyer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
            }),
        });
        // reload buyer data
        const response = await fetch("/api/user/getUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
            }),
        });
        const data = await response.json();
        if (data.result) {
            setBuyer(data.result.buyer);
        }
        setApplyingBuyer(false);
    };

    const handleKycFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0] || null;
        if (!file) {
            return;
        }
        if (file.size / 1024 / 1024 > 10) {
            toast.error('파일 용량은 10MB 이하만 가능합니다.');
            return;
        }
        setKycFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setKycPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const submitKyc = async () => {
        if (!address || kycSubmitting) {
            return;
        }
        if (!kycFile && !kycImageUrl) {
            toast.error('신분증 사진을 업로드해 주세요.');
            return;
        }
        setKycSubmitting(true);
        try {
            let uploadedUrl = kycImageUrl;
            if (kycFile) {
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'content-type': kycFile.type || 'application/octet-stream',
                    },
                    body: kycFile,
                });
                if (!uploadRes.ok) {
                    throw new Error('Upload failed');
                }
                const uploadData = await uploadRes.json();
                uploadedUrl = uploadData?.url || uploadData?.pathname || '';
            }

            if (!uploadedUrl) {
                throw new Error('Upload failed');
            }

            const updatedBuyer = {
                ...(buyer || {}),
                kyc: {
                    ...(buyer?.kyc || {}),
                    status: 'pending',
                    idImageUrl: uploadedUrl,
                    submittedAt: new Date().toISOString(),
                },
            };

            await fetch('/api/user/updateBuyer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storecode: storecode,
                    walletAddress: address,
                    buyerStatus: buyer?.status || 'pending',
                    bankName: buyer?.bankInfo?.bankName || bankName || '',
                    accountNumber: buyer?.bankInfo?.accountNumber || accountNumber || '',
                    accountHolder: buyer?.bankInfo?.accountHolder || accountHolder || '',
                    buyer: updatedBuyer,
                }),
            });

            const response = await fetch("/api/user/getUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storecode: storecode,
                    walletAddress: address,
                }),
            });
            const data = await response.json();
            if (data.result) {
                setBuyer(data.result.buyer);
                setKycImageUrl(data.result.buyer?.kyc?.idImageUrl || uploadedUrl);
                setKycPreview(data.result.buyer?.kyc?.idImageUrl || uploadedUrl);
            } else {
                setBuyer(updatedBuyer);
                setKycImageUrl(uploadedUrl);
                setKycPreview(uploadedUrl);
            }
            setKycFile(null);
            toast.success('심사 신청이 완료되었습니다.');
        } catch (error) {
            toast.error('심사 신청에 실패했습니다.');
        }
        setKycSubmitting(false);
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
          chain: storecode,
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
          chain: storecode,
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

    const kycStatus = buyer?.kyc?.status || (kycImageUrl ? 'pending' : 'none');
    const kycStatusLabel =
        kycStatus === 'approved'
            ? '승인완료'
            : kycStatus === 'rejected'
            ? '승인거절'
            : kycStatus === 'pending'
            ? '심사중'
            : '미제출';
    const bankInfoStatus =
        buyer?.bankInfo?.status ||
        (buyer?.bankInfo?.accountNumber
            ? buyer?.status === 'confirmed'
                ? 'approved'
                : 'pending'
            : 'none');
    const bankInfoStatusLabel =
        bankInfoStatus === 'approved'
            ? '승인완료'
            : bankInfoStatus === 'rejected'
            ? '승인거절'
            : bankInfoStatus === 'pending'
            ? '심사중'
            : '미제출';

    return (

        <main className="p-4 min-h-[100vh] flex items-start justify-center container max-w-screen-sm mx-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
            <AutoConnect client={client} wallets={[wallet]} />

            <div className="py-0 w-full">
        
                {/*
                {storecode && (
                    <div className="w-full flex flex-row items-center justify-center gap-2 bg-black/10 p-2 rounded-lg mb-4">
                        <span className="text-sm text-zinc-500">
                        {storecode}
                        </span>
                    </div>
                )}
                */}
        
                <div className="w-full flex flex-row gap-2 items-center justify-start text-slate-600 text-sm mb-4">
                    {/* go back button */}
                    <div className="w-full flex justify-start items-center gap-2">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center rounded-full border border-slate-200/70 bg-white/90 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <Image
                                src="/icon-back.png"
                                alt="Back"
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                        </button>
                        {/* title */}
                        <span className="text-sm text-slate-600 font-semibold">
                            돌아가기
                        </span>
                    </div>



                </div>




                {address && (
                    <div className="w-full" />
                )}


                {!address ? (
                    <div className="w-full">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-center shadow-sm">
                            <p className="text-base font-semibold text-slate-600">
                                로그인해서 지갑을 연결하세요.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push(`/${params.lang}/web3login`)}
                                className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                                웹3 로그인 이동
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-4">


                        {loadingUserData && (
                            <div className="mt-4 flex w-full items-center justify-center rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                                사용자 정보를 불러오는 중입니다...
                            </div>
                        )}

                        {loadingUserData && (
                            <div className="text-sm text-slate-500">Loading user data...</div>
                        )}

                        {!loadingUserData && !nickname && (
                            <div className='w-full flex flex-col gap-2 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm'>

                                <span className="text-base font-semibold text-slate-800">
                                    회원이 아닙니다.
                                </span>

                                <button
                                    onClick={() => {
                                        router.push('/' + params.lang + '/p2p/profile-settings');
                                    }}
                                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                >
                                    회원가입하기
                                </button>

                            </div>
                        )}

                        {!loadingUserData && nickname && !buyer?.status && (
                            <div className='w-full flex flex-col gap-3 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm'>

                                <div className="w-full flex flex-col gap-3">
                                    <div className='w-full flex flex-row gap-2 items-center justify-between'>
                                        <div className="flex flex-row items-center gap-2">
                                            {/* dot */}
                                            <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                            <span className="text-sm font-semibold text-slate-600">
                                                회원아이디
                                            </span>
                                        </div>
                                        <span className="text-2xl font-semibold text-emerald-700">
                                            {nickname}
                                        </span>
                                    </div>
                                    <div className='w-full flex flex-row gap-2 items-center justify-between'>
                                        <div className="flex flex-row items-center gap-2">
                                            {/* dot */}
                                            <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                            <span className="text-sm font-semibold text-slate-600">
                                                지갑주소
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="max-w-[70%] break-all text-right text-xs font-semibold text-slate-600"
                                                title={address || ''}
                                            >
                                                {shortAddress}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={copyWalletAddress}
                                                disabled={!address}
                                                className={`rounded-full border px-2 py-1 text-xs font-semibold shadow-sm transition ${
                                                    address
                                                        ? 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300'
                                                        : 'border-slate-200/80 bg-slate-100 text-slate-400'
                                                }`}
                                            >
                                                {walletCopied ? '복사됨' : '복사하기'}
                                            </button>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        구매한 USDT 를 받을 지갑주소입니다.
                                    </span>
                                </div>

                                <span className="inline-flex items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
                                    구매불가능상태
                                </span>

                                <button
                                    onClick={() => {
                                        applyBuyer();
                                    }}
                                    className={`
                                        ${applyingBuyer ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'}
                                        px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition
                                    `}
                                    disabled={applyingBuyer}
                                >
                                    {applyingBuyer ? Applying + '...' : Apply}
                                </button>

                            </div>
                        )}


                        {!loadingUserData && buyer?.status && (
                            <>
                            <div className='w-full flex flex-col gap-4 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm'>

                                {/* image and title */}
                                <div className='w-full flex flex-row gap-2 items-center justify-start'>
                                    <Image
                                        src="/icon-buyer.png"
                                        alt="Buyer Settings"
                                        width={50}
                                        height={50}
                                        className='w-10 h-10'
                                    />
                                    <span className="text-xl font-semibold text-slate-900">
                                        구매자 설정
                                    </span>
                                </div>


                                <div className="w-full flex flex-col gap-3">
                                    <div className='w-full flex flex-row gap-2 items-center justify-between'>
                                        <div className="flex flex-row items-center gap-2">
                                            {/* dot */}
                                            <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                            <span className="text-sm font-semibold text-slate-600">
                                                회원아이디
                                            </span>
                                        </div>
                                        <span className="text-2xl font-semibold text-emerald-700">
                                            {nickname}
                                        </span>
                                    </div>
                                    <div className='w-full flex flex-row gap-2 items-center justify-between'>
                                        <div className="flex flex-row items-center gap-2">
                                            {/* dot */}
                                            <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                            <span className="text-sm font-semibold text-slate-600">
                                                지갑주소
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="max-w-[70%] break-all text-right text-xs font-semibold text-slate-600"
                                                title={address || ''}
                                            >
                                                {shortAddress}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={copyWalletAddress}
                                                disabled={!address}
                                                className={`rounded-full border px-2 py-1 text-xs font-semibold shadow-sm transition ${
                                                    address
                                                        ? 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300'
                                                        : 'border-slate-200/80 bg-slate-100 text-slate-400'
                                                }`}
                                            >
                                                {walletCopied ? '복사됨' : '복사하기'}
                                            </button>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        구매한 USDT 를 받을 지갑주소입니다.
                                    </span>
                                </div>

                                {/* buyer?.status */}
                                {/* status: pending, confirmed */}
                                <div className='w-full flex flex-row gap-2 items-center justify-between
                                    border-t border-slate-200/80 pt-4'>
                                    <div className="flex flex-row items-center gap-2">
                                        {/* dot */}
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            구매자 상태
                                        </span>
                                    </div>
                                    {buyer?.status === 'confirmed' ? (
                                        <span className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
                                            구매가능상태
                                        </span>
                                    ) : (
                                        <span className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700 shadow-sm">
                                            구매불가능상태
                                        </span>
                                    )}
                                </div>

                                <div className='mt-4 w-full rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm'>
                                    <div className="flex w-full flex-row items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                <Image
                                                    src="/icon-bank-check.png"
                                                    alt="Bank"
                                                    width={24}
                                                    height={24}
                                                    className="h-6 w-6"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900">입금할 계좌 정보</span>
                                                <span className="text-xs text-slate-500">계좌 정보 제출 후 심사됩니다.</span>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                                bankInfoStatus === 'approved'
                                                    ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                                                    : bankInfoStatus === 'rejected'
                                                    ? 'border-rose-200/80 bg-rose-50 text-rose-700'
                                                    : bankInfoStatus === 'pending'
                                                    ? 'border-amber-200/80 bg-amber-50 text-amber-700'
                                                    : 'border-slate-200/80 bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            {bankInfoStatusLabel}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-col gap-1 text-sm text-slate-600">
                                        {buyer?.bankInfo?.bankName ? (
                                            <>
                                                <span>은행: {buyer?.bankInfo?.bankName}</span>
                                                <span>계좌번호: {buyer?.bankInfo?.accountNumber}</span>
                                                <span>예금주: {buyer?.bankInfo?.accountHolder}</span>
                                            </>
                                        ) : (
                                            <span>등록된 계좌 정보가 없습니다.</span>
                                        )}
                                        {bankInfoStatus === 'approved' && (
                                            <span className="text-xs text-emerald-600">
                                                승인된 계좌 정보입니다. 승인 시간: {buyer?.bankInfo?.reviewedAt ? new Date(buyer.bankInfo.reviewedAt).toLocaleString() : '-'}
                                            </span>
                                        )}
                                        {bankInfoStatus === 'pending' && (
                                            <span className="text-xs text-amber-600">
                                                신청 시간: {buyer?.bankInfo?.submittedAt ? new Date(buyer.bankInfo.submittedAt).toLocaleString() : '-'}
                                            </span>
                                        )}
                                        {bankInfoStatus === 'rejected' && buyer?.bankInfo?.rejectionReason && (
                                            <span className="text-xs text-rose-600">거절 사유: {buyer.bankInfo.rejectionReason}</span>
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

                            <div className='mt-4 w-full flex flex-col gap-4 items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4'>
                                <div className='w-full flex flex-row gap-2 items-center justify-between'>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            입금할 계좌 정보 신청
                                        </span>
                                    </div>

                                    {!buyer && (
                                        <div className="text-sm text-slate-500">
                                            구매자 승인이 필요합니다.
                                        </div>
                                    )}

                                    {bankInfoStatus === 'pending' ? (
                                        <div className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
                                            심사중
                                        </div>
                                    ) : applying ? (
                                        <div className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                                            {Applying}...
                                        </div>
                                    ) : (
                                        <button
                                            disabled={applying || !verifiedOtp}
                                            onClick={() => {
                                                apply();
                                            }}
                                            className={`
                                                ${!verifiedOtp ? 'bg-slate-200 text-slate-400'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-500'}
                                                px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition
                                            `}
                                        >
                                            {Apply}
                                        </button>
                                    )}
                                </div>

                                {/* 은행명, 계좌번호, 예금주 */}
                                <div className='flex flex-col gap-2 items-start justify-between w-full'>
                                    <select
                                        disabled={!address || bankInfoStatus === 'pending' || applying}
                                        className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                                        <option value="SC제일은행" selected={bankName === "SC제일은행"}>
                                            SC제일은행
                                        </option>
                                        <option value="한국씨티은행" selected={bankName === "한국씨티은행"}>
                                            한국씨티은행
                                        </option>
                                        <option value="산업은행" selected={bankName === "산업은행"}>
                                            산업은행
                                        </option>
                                        <option value="JT친애저축은행" selected={bankName === "JT친애저축은행"}>
                                            JT친애저축은행
                                        </option>
                                    </select>

                                    <input 
                                        disabled={applying || bankInfoStatus === 'pending'}
                                        className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        placeholder={Enter_your_account_number}
                                        value={accountNumber}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        onChange={(e) => {
                                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                            setAccountNumber(e.target.value);
                                        }}
                                    />
                                    <input 
                                        disabled={applying || bankInfoStatus === 'pending'}
                                        className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        placeholder={Enter_your_account_holder}
                                        value={accountHolder}
                                        type='text'
                                        onChange={(e) => {
                                            setAccountHolder(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 w-full rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
                                <div className="flex w-full flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                            <Image
                                                src="/icon-kyc.png"
                                                alt="KYC"
                                                width={24}
                                                height={24}
                                                className="h-6 w-6"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900">신분증 인증 (KYC)</span>
                                            <span className="text-xs text-slate-500">주민증/운전면허증/여권 중 1장 업로드</span>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                            kycStatus === 'approved'
                                                ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                                                : kycStatus === 'rejected'
                                                ? 'border-rose-200/80 bg-rose-50 text-rose-700'
                                                : kycStatus === 'pending'
                                                ? 'border-amber-200/80 bg-amber-50 text-amber-700'
                                                : 'border-slate-200/80 bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        {kycStatusLabel}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-col gap-3">
                                    {kycStatus === 'pending' ? (
                                        <>
                                            <div className="flex flex-col gap-2 rounded-xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 shadow-sm">
                                                <span className="font-semibold">심사 신청이 접수되었습니다.</span>
                                                <span className="text-xs">
                                                    신청 시간: {buyer?.kyc?.submittedAt ? new Date(buyer.kyc.submittedAt).toLocaleString() : '-'}
                                                </span>
                                            </div>
                                            {kycPreview && (
                                                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={kycPreview}
                                                        alt="KYC Preview"
                                                        className="h-40 w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : kycStatus === 'approved' ? (
                                        <>
                                            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                                                <span className="font-semibold">승인된 신분증입니다.</span>
                                                <span className="mt-1 text-xs text-emerald-600">
                                                    승인 시간: {buyer?.kyc?.reviewedAt ? new Date(buyer.kyc.reviewedAt).toLocaleString() : '-'}
                                                </span>
                                            </div>
                                            {kycPreview && (
                                                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={kycPreview}
                                                        alt="KYC Preview"
                                                        className="h-40 w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <label
                                                htmlFor="kyc-id-upload-buyer"
                                                className="cursor-pointer rounded-xl border border-dashed border-slate-200/80 bg-slate-50/80 px-4 py-4 text-center shadow-sm transition hover:border-slate-300"
                                            >
                                                <input
                                                    id="kyc-id-upload-buyer"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleKycFileChange}
                                                />
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-sm font-semibold text-slate-700">신분증 사진 업로드</span>
                                                    <span className="text-xs text-slate-500">JPG/PNG, 10MB 이하</span>
                                                </div>
                                            </label>
                                            {kycPreview && (
                                                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={kycPreview}
                                                        alt="KYC Preview"
                                                        className="h-40 w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500">
                                                업로드 후 심사까지 영업일 기준 1-2일 소요될 수 있습니다.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={submitKyc}
                                                disabled={kycSubmitting || (!kycFile && !kycImageUrl)}
                                                className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition sm:w-auto sm:self-start ${
                                                    kycSubmitting || (!kycFile && !kycImageUrl)
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                                }`}
                                            >
                                                {kycSubmitting ? '심사 신청 중...' : '심사신청하기'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            </>
                        )}

                    </div>
                )}

            </div>

        </main>

    );

}

          
