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


const walletAuthOptions = ['google', 'email', 'phone'];


export default function SettingsPage({ params }: any) {


    //console.log("params", params);
    
    const searchParams = useSearchParams();
 
    ///const wallet = searchParams.get('wallet');

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

    const { wallet, wallets, smartAccountEnabled, chain } = useClientWallets({
        authOptions: walletAuthOptions,
    });


    const activeAccount = useActiveAccount();
    const activeWallet = useActiveWallet();
    const address = activeAccount?.address;



    const [phoneNumber, setPhoneNumber] = useState("");

    /*
    useEffect(() => {
  
  
      if (smartAccount) {
  
        //const phoneNumber = await getUserPhoneNumber({ client });
        //setPhoneNumber(phoneNumber);
  
  
        getUserPhoneNumber({ client }).then((phoneNumber) => {
          setPhoneNumber(phoneNumber || "");
        });
  
  
  
      }
  
    } , [smartAccount]);
    */



    // selectedChain USDT balance
    const [selectedChain, setSelectedChain] = useState(chain);

    const contract = getContract({
        // the client you have created via `createThirdwebClient()`
        client,
        // the chain the contract is deployed on

        chain:  selectedChain === "ethereum" ? ethereum :
                selectedChain === "polygon" ? polygon :
                selectedChain === "arbitrum" ? arbitrum :
                selectedChain === "bsc" ? bsc : ethereum,

        address: selectedChain === "ethereum" ? ethereumContractAddressUSDT :
                selectedChain === "polygon" ? polygonContractAddressUSDT :
                selectedChain === "arbitrum" ? arbitrumContractAddressUSDT :
                selectedChain === "bsc" ? bscContractAddressUSDT : ethereumContractAddressUSDT,

        // OPTIONAL: the contract's abi
        //abi: [...],
    });




    ///const [nativeBalance, setNativeBalance] = useState(0);


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

    const [kycFile, setKycFile] = useState<File | null>(null);
    const [kycPreview, setKycPreview] = useState<string | null>(null);
    const [kycImageUrl, setKycImageUrl] = useState<string | null>(null);
    const [kycSubmitting, setKycSubmitting] = useState(false);

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

                setSeller(data.result.seller);
                setKycImageUrl(data.result.seller?.kyc?.idImageUrl || null);
                setKycPreview(data.result.seller?.kyc?.idImageUrl || null);

                ////setEscrowWalletAddress(data.result.seller?.escrowWalletAddress || '');
            } else {
                setNickname('');
                setAvatar('/profile-default.png');
                setUserCode('');
                setSeller(null);
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
        return;
      }

      setApplying(true);

      try {
        const nextBankInfo = {
          ...(seller?.bankInfo || {}),
          bankName: bankName,
          accountNumber: accountNumber,
          accountHolder: accountHolder,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          rejectionReason: '',
        };

        const nextSellerStatus = seller?.status === 'confirmed' ? 'confirmed' : 'pending';
        const updatedSeller = {
          ...(seller || {}),
          status: nextSellerStatus,
          bankInfo: nextBankInfo,
        };

        await fetch('/api/user/updateSellerInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode: storecode,
            walletAddress: address,
            sellerStatus: nextSellerStatus,
            bankName: bankName,
            accountNumber: accountNumber,
            accountHolder: accountHolder,
            seller: updatedSeller,
          }),
        });

        const response = await fetch('/api/user/getUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode: storecode,
            walletAddress: address,
          }),
        });
        const data = await response.json();
        if (data.result) {
          setSeller(data.result.seller);
          setKycImageUrl(data.result.seller?.kyc?.idImageUrl || null);
          setKycPreview(data.result.seller?.kyc?.idImageUrl || null);
        }
      } catch (error) {
        toast.error('Failed to apply');
      }

      setApplying(false);
    };

    const handleKycFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
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

        const nextSellerStatus = seller?.status === 'confirmed' ? 'confirmed' : 'pending';
        const updatedSeller = {
          ...(seller || {}),
          status: nextSellerStatus,
          kyc: {
            ...(seller?.kyc || {}),
            status: 'pending',
            idImageUrl: uploadedUrl,
            submittedAt: new Date().toISOString(),
          },
        };

        await fetch('/api/user/updateSellerInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode: storecode,
            walletAddress: address,
            sellerStatus: nextSellerStatus,
            bankName: seller?.bankInfo?.bankName || bankName || '',
            accountNumber: seller?.bankInfo?.accountNumber || accountNumber || '',
            accountHolder: seller?.bankInfo?.accountHolder || accountHolder || '',
            seller: updatedSeller,
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
          setSeller(data.result.seller);
          setKycImageUrl(data.result.seller?.kyc?.idImageUrl || null);
          setKycPreview(data.result.seller?.kyc?.idImageUrl || null);
          setKycFile(null);
        }
      } catch (error) {
        console.error('KYC submit failed', error);
        toast.error('심사 신청에 실패했습니다.');
      }
      setKycSubmitting(false);
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
                storecode: storecode,
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
        await fetch('/api/user/applySeller', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
            }),
        });
        // reload seller data
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
            setSeller(data.result.seller);
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

    const bankInfoStatus =
      seller?.bankInfo?.status ||
      (seller?.bankInfo?.accountNumber
        ? seller?.status === 'confirmed'
          ? 'approved'
          : 'pending'
        : 'none');
    const bankInfoStatusLabel =
      bankInfoStatus === 'approved'
        ? '승인완료'
        : bankInfoStatus === 'rejected'
        ? '거절'
        : bankInfoStatus === 'pending'
        ? '심사중'
        : '미제출';

    const kycStatus = seller?.kyc?.status || (kycImageUrl ? 'pending' : 'none');
    const kycStatusLabel =
      kycStatus === 'approved'
        ? '승인완료'
        : kycStatus === 'rejected'
        ? '거절'
        : kycStatus === 'pending'
        ? '심사중'
        : '미제출';
  







    // get escrow wallet address and balance
    
    const [escrowBalance, setEscrowBalance] = useState(0);

    
    useEffect(() => {

    const getEscrowBalance = async () => {

        if (!seller?.escrowWalletAddress || seller?.escrowWalletAddress === '') return;

        const result = await balanceOf({
            contract,
            address: seller?.escrowWalletAddress,
        });

        //console.log('escrow balance result', result);
        if (selectedChain === 'bsc') {
            setEscrowBalance( Number(result) / 10 ** 18 );
        } else {
            setEscrowBalance( Number(result) / 10 ** 6 );
        }

    };

    getEscrowBalance();

    const interval = setInterval(() => {
        getEscrowBalance();
    } , 5000);

    return () => clearInterval(interval);

    } , [seller?.escrowWalletAddress, contract, selectedChain]);




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
            storecode: storecode,
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
                storecode: storecode,
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


    // toggleAutoProcessDeposit
    const [togglingAutoProcessDeposit, setTogglingAutoProcessDeposit] = useState(false);
    const toggleAutoProcessDeposit = async () => {
        if (!seller) return;
        const newAutoProcessDeposit = !seller.autoProcessDeposit;
        setTogglingAutoProcessDeposit(true);
        await fetch('/api/user/toggleAutoProcessDeposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
                autoProcessDeposit: newAutoProcessDeposit,
            }),
        });
        setTogglingAutoProcessDeposit(false);
        setSeller({
            ...seller,
            autoProcessDeposit: newAutoProcessDeposit,
        });
    };

    // setPriceSettingMethod
    const [settingPriceSettingMethod, setSettingPriceSettingMethod] = useState(false);
    const [priceSettingMethod, setPriceSettingMethod] = useState('fixed');
    const setPriceSettingMethodFunc = async (method: string) => {
        if (!seller) return;
        setSettingPriceSettingMethod(true);
        await fetch('/api/user/setPriceSettingMethod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
                priceSettingMethod: method,
            }),
        });
        setSettingPriceSettingMethod(false);
        setSeller({
            ...seller,
            priceSettingMethod: method,
        });
    };

    // setMarket
    // upbit, bithumb, korbit
    const [settingMarket, setSettingMarket] = useState(false);
    const [market, setMarket] = useState('upbit');
    const setMarketFunc = async (market: string) => {
        if (!seller) return;
        setSettingMarket(true);
        await fetch('/api/user/setMarket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
                market: market,
            }),
        });
        setSettingMarket(false);
        setSeller({
            ...seller,
            market: market,
        });
    };


    // updatingPromotionText
    const [promotionText, setPromotionText] = useState('');
    const [updatingPromotionText, setUpdatingPromotionText] = useState(false);
    const [generatingPromotionText, setGeneratingPromotionText] = useState(false);
    const [promotionGenerateError, setPromotionGenerateError] = useState('');
    const updatePromotionText = async () => {
        if (!seller) return;
        setUpdatingPromotionText(true);
        await fetch('/api/user/updatePromotionText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: storecode,
                walletAddress: address,
                promotionText: promotionText,
            }),
        });
        setUpdatingPromotionText(false);
        setSeller({
            ...seller,
            promotionText: promotionText,
        });
    };

    const generatePromotionText = async () => {
        if (!seller || !address || generatingPromotionText) return;
        setPromotionGenerateError('');
        setGeneratingPromotionText(true);
        try {
            const response = await fetch('/api/user/generatePromotionText', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storecode: storecode,
                    walletAddress: address,
                    market: seller?.market,
                    priceSettingMethod: seller?.priceSettingMethod,
                    price: seller?.price,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data?.text) {
                throw new Error(data?.error || '자동 생성에 실패했습니다.');
            }
            setPromotionText(data.text);
            toast.success('판매 홍보 문구가 자동 생성되었습니다.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '자동 생성에 실패했습니다.';
            setPromotionGenerateError(message);
            toast.error('자동 생성에 실패했습니다.');
        } finally {
            setGeneratingPromotionText(false);
        }
    };



    // call api /api/escrow/clearSellerEscrowWallet
    // 판매자 에스크로 지갑 잔고 회수하기
    const [clearingSellerEscrowWalletBalance, setClearingSellerEscrowWalletBalance] = useState(false);
    const clearSellerEscrowWalletBalance = async () => {
        if (clearingSellerEscrowWalletBalance) return;
        setClearingSellerEscrowWalletBalance(true);
        await fetch('/api/escrow/clearSellerEscrowWallet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedChain: selectedChain,
                walletAddress: address,
            }),
        });
        setClearingSellerEscrowWalletBalance(false);
        toast.success('판매자 에스크로 지갑 잔고 회수 요청이 완료되었습니다.');
    };




    return (

        <main className="p-4 pb-28 min-h-[100vh] flex items-start justify-center container max-w-screen-sm mx-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">

            <AutoConnect client={client} wallets={[wallet]} />

            <div className="py-0 w-full">
        

                {/*
                {storecode && (
                    <div className="w-full flex flex-row items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {storecode}
                        </span>
                    </div>
                )}
                */}
        
                <div className="w-full flex flex-row gap-2 items-center justify-start mb-2"
                >
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



                {/* select chain(ethereum, polygon, arbitrum, bsc) */}
                {/* radio buttons */}
                {/*
                {address && (

                    <div className='w-full flex flex-col items-center justify-center mb-4'>

                        <span className="text-sm text-slate-600 font-semibold mb-2">
                            조회할 USDT 체인을 선택하세요.
                        </span>

                        <div className="w-full flex flex-row items-center justify-center gap-4 mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="chain"
                                    value="ethereum"
                                    checked={selectedChain === 'ethereum'}
                                    onChange={() => setSelectedChain('ethereum')}
                                />
                                <span className="text-sm text-slate-700 font-semibold">Ethereum</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="chain"
                                    value="polygon"
                                    checked={selectedChain === 'polygon'}
                                    onChange={() => setSelectedChain('polygon')}
                                />
                                <span className="text-sm text-slate-700 font-semibold">Polygon</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="chain"
                                    value="arbitrum"
                                    checked={selectedChain === 'arbitrum'}
                                    onChange={() => setSelectedChain('arbitrum')}
                                />
                                <span className="text-sm text-slate-700 font-semibold">Arbitrum</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="chain"
                                    value="bsc"
                                    checked={selectedChain === 'bsc'}
                                    onChange={() => setSelectedChain('bsc')}
                                />
                                <span className="text-sm text-slate-700 font-semibold">BSC</span>
                            </label>
                        </div>
                    </div>

                )}
                */}



                {address && (
                    <div className="mb-2" />
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
                    <div className="w-full flex flex-col gap-6">

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
                                        router.push('/' + params.lang + '/loot/profile-settings');
                                    }}
                                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                >
                                    회원가입하기
                                </button>

                            </div>
                        )}

                        {!loadingUserData && nickname && !seller && (
                            <div className='w-full flex flex-col gap-3 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm'>

                                {/* nickname */}
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

                                <span className="inline-flex items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
                                    판매불가능상태
                                </span>

                                <button
                                    onClick={() => {
                                        applySeller();
                                    }}
                                    className={`
                                        ${applyingSeller ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'}
                                        px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition
                                    `}
                                    disabled={applyingSeller}
                                >
                                    {applyingSeller ? Applying + '...' : Apply}
                                </button>

                            </div>
                        )}


                        {!loadingUserData && seller && (
                            <>
                            <div className='w-full flex flex-col gap-4 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm'>

                                {/* image and title */}
                                <div className='w-full flex flex-row gap-2 items-center justify-start'>
                                    <Image
                                        src="/icon-seller.png"
                                        alt="Seller"
                                        width={50}
                                        height={50}
                                        className='w-10 h-10'
                                    />
                                    <span className="text-xl font-semibold text-slate-900">
                                        {Seller} 설정
                                    </span>
                                </div>


                                {/* nickname */}
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

                                {/* seller?.status */}
                                {/* status: pending, confirmed */}
                                <div className='w-full flex flex-row gap-2 items-center justify-between
                                    border-t border-slate-200/80 pt-4'>
                                    <div className="flex flex-row items-center gap-2">
                                        {/* dot */}
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            판매자 상태
                                        </span>
                                    </div>
                                    {seller?.status === 'confirmed' ? (
                                        <span className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
                                            판매가능상태
                                        </span>
                                    ) : (
                                        <span className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700 shadow-sm">
                                            판매불가능상태
                                        </span>
                                    )}
                                </div>


                                {/* seller?.enabled */}
                                {/* 판매시작 여부 */}
                                {/* toggle seller enabled */}
                                <div className='w-full flex flex-row gap-2 items-center justify-between
                                    border-t border-slate-200/80 pt-4'>
                                    <div className="flex flex-row items-center gap-2">
                                        {/* dot */}
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            판매자 활동 상태
                                        </span>
                                    </div>
                                    {seller?.enabled ? (
                                        <button
                                            onClick={toggleSellerEnabled}
                                            className="flex flex-row items-center gap-2
                                                bg-emerald-600 text-white px-4 py-1.5 rounded-full shadow-sm transition hover:bg-emerald-500"
                                        >
                                            <span className="text-sm font-semibold">
                                                판매중
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={toggleSellerEnabled}
                                            className="flex flex-row items-center gap-2
                                                bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full shadow-sm transition hover:bg-slate-300"
                                        >
                                            <span className="text-sm font-semibold">
                                                판매중지
                                            </span>
                                        </button>
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
                                                <span className="text-sm font-semibold text-slate-900">입금받을 계좌 정보</span>
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
                                        {seller?.bankInfo?.bankName ? (
                                            <>
                                                <span>은행: {seller?.bankInfo?.bankName}</span>
                                                <span>계좌번호: {seller?.bankInfo?.accountNumber}</span>
                                                <span>예금주: {seller?.bankInfo?.accountHolder}</span>
                                            </>
                                        ) : (
                                            <span>등록된 계좌 정보가 없습니다.</span>
                                        )}
                                        {bankInfoStatus === 'approved' && (
                                            <span className="text-xs text-emerald-600">
                                                승인된 계좌 정보입니다. 승인 시간: {seller?.bankInfo?.reviewedAt ? new Date(seller.bankInfo.reviewedAt).toLocaleString() : '-'}
                                            </span>
                                        )}
                                        {bankInfoStatus === 'pending' && (
                                            <span className="text-xs text-amber-600">
                                                신청 시간: {seller?.bankInfo?.submittedAt ? new Date(seller.bankInfo.submittedAt).toLocaleString() : '-'}
                                            </span>
                                        )}
                                        {bankInfoStatus === 'rejected' && seller?.bankInfo?.rejectionReason && (
                                            <span className="text-xs text-rose-600">거절 사유: {seller.bankInfo.rejectionReason}</span>
                                        )}
                                    </div>
                                </div>


                                {/* 입금 자동 처리 시작 / 중지 토글 버튼 */}
                                {/*
                                <div className='w-full flex flex-row gap-2 items-center justify-between
                                    border-t border-gray-300 pt-4'>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                        <span className="text-lg">
                                            입금 자동 처리 상태
                                        </span>
                                    </div>
                                    {seller?.autoProcessDeposit ? (
                                        <button
                                            onClick={toggleAutoProcessDeposit}
                                            className={`
                                                ${togglingAutoProcessDeposit ? 'bg-gray-300 text-gray-400' : 'bg-green-500 text-zinc-100'}
                                                flex flex-row items-center gap-2 p-2 rounded-lg
                                            `}
                                            disabled={togglingAutoProcessDeposit}
                                        >
                                            <span className="text-lg font-semibold">
                                                자동 처리 중
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={toggleAutoProcessDeposit}
                                            className={`
                                                ${togglingAutoProcessDeposit ? 'bg-gray-300 text-gray-400' : 'bg-gray-300 text-gray-600'}
                                                flex flex-row items-center gap-2 p-2 rounded-lg
                                            `}
                                            disabled={togglingAutoProcessDeposit}
                                        >
                                            <span className="text-lg font-semibold">
                                                자동 처리 중지
                                            </span>
                                        </button>
                                    )}
                                </div>
                                */}

                            </div>

                            <div className='mt-4 w-full flex flex-col gap-4 items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4'>
                                <div className='w-full flex flex-row gap-2 items-center justify-between'>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            입금받을 계좌 정보 신청
                                        </span>
                                    </div>

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
                                                    신청 시간: {seller?.kyc?.submittedAt ? new Date(seller.kyc.submittedAt).toLocaleString() : '-'}
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
                                                    승인 시간: {seller?.kyc?.reviewedAt ? new Date(seller.kyc.reviewedAt).toLocaleString() : '-'}
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
                                                htmlFor="kyc-id-upload-seller"
                                                className="cursor-pointer rounded-xl border border-dashed border-slate-200/80 bg-slate-50/80 px-4 py-4 text-center shadow-sm transition hover:border-slate-300"
                                            >
                                                <input
                                                    id="kyc-id-upload-seller"
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
                                            {kycStatus === 'rejected' && seller?.kyc?.rejectionReason && (
                                                <span className="text-xs text-rose-600">거절 사유: {seller.kyc.rejectionReason}</span>
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


                        {!loadingUserData && seller?.escrowWalletAddress && (
                            
                            <div className='w-full flex flex-col gap-3 items-start justify-between mt-4 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm'>

                                <div className='w-full flex flex-row gap-2 items-center justify-start mb-2'>
                                    <Image
                                        src="/icon-escrow-wallet.png"
                                        alt="Escrow Wallet"
                                        width={50}
                                        height={50}
                                        className='w-10 h-10'
                                    />
                                    <span className="text-xl font-semibold text-slate-900">
                                        에스크로 지갑 정보
                                    </span>
                                </div>
                                {/* 설명 */}
                                {/* 에스크로 지갑에 잔액이 있어야 구매주문을 자동으로 처리할 수 있습니다. */}
                                <div className="text-sm text-slate-600 mb-4">
                                    에스크로 지갑에 잔액이 있어야 구매주문을 자동으로 처리할 수 있습니다.
                                </div>

                                <div className="flex flex-row items-center gap-2">
                                    <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                    <span className="text-sm font-semibold text-slate-600">
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
                                            className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
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
                                border-t border-slate-200/80 pt-4'>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            에스크로 잔액
                                        </span>
                                    </div>
                                    <div className='flex flex-row items-center gap-2 mb-2'>
                                        <span className="text-2xl xl:text-4xl font-semibold text-emerald-700 tabular-nums tracking-tight"
                                            style={{ fontFamily: 'monospace' }}
                                        >
                                            {escrowBalance.toFixed(2)}
                                        </span>
                                    </div>

                                </div>

                                {/* 설명 */}
                                {/* 에스크로 지갑 잔액을 모두 나의 지갑 (address) 으로 회수할 수 있습니다. */}
                                <div className="text-sm text-slate-600 mb-2">
                                    에스크로 지갑 잔액을 모두 나의 지갑 ({address?.slice(0,6)}...{address?.slice(-4)}) 으로 회수할 수 있습니다.
                                </div>
                                {/* 잔액 회수하기 버튼 */}
                                <div className='w-full flex flex-row gap-2 items-center justify-end'>

                                    {/* if escrowBalance is 0, disable the button */}
                                    <button
                                        onClick={() => {
                                            if (window.confirm('에스크로 지갑 잔액을 회수하시겠습니까?')) {
                                                clearSellerEscrowWalletBalance();
                                            }
                                        }}
                                        className={`
                                            ${clearingSellerEscrowWalletBalance ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'}
                                            px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition
                                        `}
                                        disabled={clearingSellerEscrowWalletBalance || escrowBalance <= 0}
                                    >
                                        {clearingSellerEscrowWalletBalance ? '회수중...' : '잔액 회수하기'}
                                    </button>

                                </div>


                                {/* 판매금액(원) 설정 */}
                                <div className='w-full flex flex-col gap-2 items-start justify-between mt-4
                                border-t border-slate-200/80 pt-4'>

                                    <div className="flex flex-row items-center gap-2">
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            1 USDT 당 판매금액(원) 설정
                                        </span>

                                        {/* seller.usdtToKrwRate */}
                                        <span className="text-sm text-slate-500">
                                            (현재 설정: {seller?.usdtToKrwRate || 0} 원)
                                        </span>
                                    </div>


                                    {/* market 연동 or 지정가 설정 */}
                                    {/* market 연동: upbit or bithumb or korbit */}
                                    {/* market중 하나 선택, 또는 지정가 선택 */}
                                    {/* checkbox style */}
                                    <div className='w-full flex flex-row gap-2 items-center justify-start'>

                                        <div className="flex flex-row items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-700">
                                                가격 설정 방식:
                                            </span>
                                            {' '}
                                            <span className="text-sm text-slate-500">
                                                (현재 설정: {seller?.priceSettingMethod === 'market' ? 'Market 연동' : '지정가'})
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                //setPriceSettingMethod('market');
                                                setPriceSettingMethodFunc('market');

                                            }}
                                            className={`
                                                ${seller?.priceSettingMethod === 'market'
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}
                                                px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition
                                            `}
                                            disabled={seller?.priceSettingMethod === 'market'}
                                        >
                                            Market 연동
                                        </button>

                                        <button
                                            onClick={() => {
                                                
                                                //setPriceSettingMethod('fixed');
                                                setPriceSettingMethodFunc('fixed');

                                            }}
                                            className={`
                                                ${seller?.priceSettingMethod === 'fixed'
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}
                                                px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition
                                            `}
                                            disabled={seller?.priceSettingMethod === 'fixed'}
                                        >
                                            지정가
                                        </button>

                                    </div>

                                    {/* priceSettingMethod 가 fixed 일 때만 보이기 */}
                                    {seller?.priceSettingMethod === 'fixed' && (

                                        <div className='w-full flex flex-row gap-2 items-center justify-end'>

                                            <input 
                                                className="w-36 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                                                    ${updatingUsdtToKrw ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'}
                                                    px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition
                                                `}
                                            >
                                                {updatingUsdtToKrw ? '수정중...' : '수정하기'}
                                            </button>

                                        </div>
                                    )}

                                    {/* priceSettingMethod 가 market 일 때만 보이기 */}
                                    {/* market 중 한개 선택 upbit, bithumb, korbit */}
                                    {/* combo box style */}
                                    {seller?.priceSettingMethod === 'market' && (


                                        <div className='w-full flex flex-col gap-2 items-start justify-between'>

                                            <span className="text-sm font-semibold text-slate-700">
                                                연동할 마켓 선택:
                                            </span>
                                            <div className='w-full flex flex-row gap-2 items-center justify-end'>

                                                <button
                                                    onClick={() => {
                                                        //setMarket('upbit');
                                                        setMarketFunc('upbit');
                                                    }}
                                                    className={`
                                                        ${seller?.market === 'upbit'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}
                                                        px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition
                                                    `}
                                                    disabled={seller?.market === 'upbit'}
                                                >
                                                    <div className='flex flex-row items-center gap-2'>
                                                        <Image
                                                            src="/icon-market-upbit.png"
                                                            width={24}
                                                            height={24}
                                                            className='w-6 h-6'
                                                            alt="Upbit"
                                                        />
                                                        <span>
                                                            Upbit
                                                        </span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        //setMarket('bithumb');
                                                        setMarketFunc('bithumb');
                                                    }}
                                                    className={`
                                                        ${seller?.market === 'bithumb'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}
                                                        px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition
                                                    `}
                                                    disabled={seller?.market === 'bithumb'}
                                                >
                                                    <div className='flex flex-row items-center gap-2'>
                                                        <Image
                                                            src="/icon-market-bithumb.png"
                                                            width={24}
                                                            height={24}
                                                            className='w-6 h-6'
                                                            alt="Bithumb"
                                                        />
                                                        <span>
                                                            Bithumb
                                                        </span>
                                                    </div>
                                                </button>
                                
                                                <button
                                                    onClick={() => {
                                                        //setMarket('korbit');
                                                        setMarketFunc('korbit');

                                                    }}
                                                    className={`
                                                        ${seller?.market === 'korbit'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}
                                                        px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition
                                                    `}
                                                    disabled={seller?.market === 'korbit'}
                                                >
                                                    <div className='flex flex-row items-center gap-2'>
                                                        <Image
                                                            src="/icon-market-korbit.png"
                                                            width={24}
                                                            height={24}
                                                            className='w-6 h-6'
                                                            alt="Korbit"
                                                        />
                                                        <span>
                                                            Korbit
                                                        </span>
                                                    </div>
                                                </button>


                                            </div>

                                            {/* setMarketFunc */}
                                            {/*
                                            <button
                                                disabled={settingMarket || !market}
                                                onClick={() => {
                                                    setMarketFunc(market);
                                                } }

                                                className={`
                                                    ${settingMarket ? 'bg-gray-300 text-gray-400' : 'bg-green-500 text-zinc-100'}
                                                    p-2 rounded-lg text-sm font-semibold
                                                `}
                                            >
                                                {settingMarket ? '설정중...' : '설정하기'}
                                            </button>
                                            */}

                                        </div>

                                    )}

                        
                                    {/* 판매 홍보 문구 설정 */}
                                    <div className='w-full flex flex-col gap-2 items-start justify-between mt-4
                                    border-t border-slate-200/80 pt-4'>

                                        <div className="flex flex-row items-center gap-2">
                                            <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                            <span className="text-sm font-semibold text-slate-600">
                                                판매 홍보 문구 설정
                                            </span>
                                        </div>
                                        {/* 이미 설정되어 있는 문구가 있으면 보여주기 */}
                                        {seller?.promotionText && (
                                            <div className="text-sm text-slate-500">
                                                현재 설정된 문구: {seller?.promotionText}
                                            </div>
                                        )}

                                        <textarea
                                            className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                            placeholder="예: 빠르고 안전한 USDT 구매, 지금 바로 거래하세요!"
                                            value={promotionText}
                                            onChange={(e) => {
                                                setPromotionText(e.target.value);
                                            }}
                                            rows={4}
                                        ></textarea>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                disabled={generatingPromotionText || updatingPromotionText}
                                                onClick={generatePromotionText}
                                                className={`
                                                    ${generatingPromotionText || updatingPromotionText
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}
                                                    px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition
                                                `}
                                            >
                                                {generatingPromotionText ? '자동 생성중...' : '자동 생성'}
                                            </button>
                                            <button
                                                disabled={updatingPromotionText || generatingPromotionText}
                                                onClick={updatePromotionText}
                                                className={`
                                                    ${updatingPromotionText || generatingPromotionText
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-500'}
                                                    px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition
                                                `}
                                            >
                                                {updatingPromotionText ? '수정중...' : '수정하기'}
                                            </button>
                                        </div>
                                        {promotionGenerateError && (
                                            <div className="text-xs font-semibold text-rose-500">
                                                {promotionGenerateError}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src="/icon-info.png"
                                                alt="Guide"
                                                width={18}
                                                height={18}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm font-semibold text-slate-700">
                                                이 페이지에서 설정할 항목
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">
                                            판매 금액(원), 가격 설정 방식(시장가/고정가), 마켓 연동 선택, 판매 홍보 문구를 설정합니다.
                                        </p>
                                    </div>

                                </div>

                            </div>
                        )}

                    </div>
                )}

            </div>
        </main>

    );

}

          
