// nickname settings
'use client';
import React, { use, useEffect, useRef, useState } from 'react';



import { toast } from 'react-hot-toast';

import { useClientWallets } from '@/lib/useClientWallets';
import { client } from "@/app/client";


import {
    getContract,
    getContractEvents,
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

import { balanceOf, transfer, transferEvent, decimals } from "thirdweb/extensions/erc20";
 

import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../dictionaries";




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

    const kycFileHint = "파일 조건: JPG/PNG, 10MB 이하";
    

    
    
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
        sponsorGas: true,
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

    const selectedChainObject =
        selectedChain === "ethereum" ? ethereum :
        selectedChain === "polygon" ? polygon :
        selectedChain === "arbitrum" ? arbitrum :
        selectedChain === "bsc" ? bsc : ethereum;




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
    const [usdtBalance, setUsdtBalance] = useState(0);
    const [loadingUsdtBalance, setLoadingUsdtBalance] = useState(false);
    const hasLoadedUsdtBalanceRef = useRef(false);
    const [escrowTopUpAmount, setEscrowTopUpAmount] = useState("");
    const [toppingUpEscrow, setToppingUpEscrow] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);

    
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

    } , [seller?.escrowWalletAddress, selectedChain]);

    const activeTradeStatus = seller?.buyOrder?.status;
    const activeTradeUsdtAmount = ['accepted', 'paymentRequested', 'paymentConfirmed'].includes(activeTradeStatus)
        ? Number(seller?.buyOrder?.usdtAmount || 0)
        : 0;
    const withdrawableEscrowBalance = Math.max(
        escrowBalance - (Number.isFinite(activeTradeUsdtAmount) ? activeTradeUsdtAmount : 0),
        0,
    );
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');


    useEffect(() => {
        if (!address) {
            setLoadingUsdtBalance(false);
            hasLoadedUsdtBalanceRef.current = false;
            return;
        }

        hasLoadedUsdtBalanceRef.current = false;

        const getUserBalance = async () => {
            if (!address) return;


            console.log('fetching user balance for address', address);

            try {
                if (!hasLoadedUsdtBalanceRef.current) {
                    setLoadingUsdtBalance(true);
                }
                const result = await balanceOf({
                    contract,
                    address: address,
                });
                if (selectedChain === 'bsc') {
                    setUsdtBalance(Number(result) / 10 ** 18);
                } else {
                    setUsdtBalance(Number(result) / 10 ** 6);
                }
            } catch (error) {
                console.error('Failed to fetch user balance', error);
            } finally {
                if (!hasLoadedUsdtBalanceRef.current) {
                    setLoadingUsdtBalance(false);
                }
                hasLoadedUsdtBalanceRef.current = true;
            }
        };

        getUserBalance();

        const interval = setInterval(() => {
            getUserBalance();
        }, 10000);

        return () => clearInterval(interval);
    }, [address, selectedChain]);


    const topUpEscrowWallet = async () => {
        if (toppingUpEscrow) return;
        if (!activeAccount) {
            toast.error('지갑을 먼저 연결해주세요.');
            return;
        }
        if (!seller?.escrowWalletAddress) {
            toast.error('에스크로 지갑 주소가 없습니다.');
            return;
        }
        const amount = Number(escrowTopUpAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error('충전할 USDT 수량을 입력해주세요.');
            return;
        }
        if (loadingUsdtBalance) {
            toast.error('USDT 잔액 확인 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        if (amount > usdtBalance) {
            toast.error(`USDT 잔액이 부족합니다. 보유: ${usdtBalance.toFixed(6)} USDT`);
            return;
        }

        setToppingUpEscrow(true);
        try {
            const transaction = transfer({
                contract,
                to: seller.escrowWalletAddress,
                amount: amount,
            });

            await sendAndConfirmTransaction({
                account: activeAccount as any,
                transaction,
            });

            setEscrowTopUpAmount("");
            toast.success('에스크로 지갑으로 USDT가 전송되었습니다.');
            setShowTopUpModal(false);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error
                ? error.message
                : typeof error === 'string'
                ? error
                : JSON.stringify(error);
            toast.error(`충전에 실패했습니다: ${message}`);
        } finally {
            setToppingUpEscrow(false);
        }
    };

    const fetchEscrowHistory = async () => {
        if (!seller?.escrowWalletAddress) return;
        setHistoryError('');
        setLoadingHistory(true);
        try {
            // 이력은 BSC 체인 기준으로 고정 조회
            const historyContract = getContract({
                client,
                chain: bsc,
                address: bscContractAddressUSDT,
            });

            const preparedIn = transferEvent({ to: seller.escrowWalletAddress });
            const preparedOut = transferEvent({ from: seller.escrowWalletAddress });

            // Try progressively broader queries to avoid missing older history or indexer hiccups.
            const queryPlans: Array<{
                blockRange?: bigint;
                fromBlock?: bigint;
                toBlock?: bigint;
            }> = [
                { blockRange: 500000n },      // fast recent window
                { blockRange: 2000000n },     // wider recent window
                { fromBlock: 0n },            // full history (indexer/RPC may be slower)
            ];

            let incoming: any[] = [];
            let outgoing: any[] = [];
            let lastError: unknown = null;

            for (const plan of queryPlans) {
                try {
                    const [inc, out] = await Promise.all([
                        getContractEvents({
                            contract: historyContract,
                            events: [preparedIn],
                            useIndexer: true,
                            ...plan,
                        }),
                        getContractEvents({
                            contract: historyContract,
                            events: [preparedOut],
                            useIndexer: true,
                            ...plan,
                        }),
                    ]);
                    incoming = inc;
                    outgoing = out;
                    if (inc.length + out.length > 0) break;
                } catch (err) {
                    lastError = err;
                    // fall through to next plan
                }
            }

            if (incoming.length + outgoing.length === 0 && lastError) {
                console.error('Escrow history query error', lastError);
            }

            const tokenDecimals =
                (await decimals({ contract: historyContract }).catch(() => null)) ?? 18;
            const normalize = (events: any[], direction: 'in' | 'out') =>
                events.map((evt) => {
                    const value = (evt as any)?.data?.value ?? 0n;
                    const amount = Number(value) / 10 ** tokenDecimals;
                    const counterparty =
                        direction === 'in'
                            ? (evt as any)?.data?.from
                            : (evt as any)?.data?.to;
                    const txHash =
                        (evt as any)?.transaction?.transactionHash ||
                        (evt as any)?.transactionHash ||
                        '';
                    const blockNumberRaw =
                        (evt as any)?.transaction?.blockNumber ??
                        (evt as any)?.blockNumber ??
                        0n;
                    const blockNumber =
                        typeof blockNumberRaw === 'bigint'
                            ? Number(blockNumberRaw)
                            : Number(blockNumberRaw || 0);
                    const logIndex =
                        typeof (evt as any)?.logIndex === 'bigint'
                            ? Number((evt as any)?.logIndex)
                            : Number((evt as any)?.logIndex || 0);
                    return {
                        direction,
                        amount,
                        counterparty,
                        txHash,
                        blockNumber,
                        logIndex,
                    };
                });

            const merged = [...normalize(incoming, 'in'), ...normalize(outgoing, 'out')]
                .filter((item) => Number.isFinite(item.amount))
                // de-duplicate possible overlaps (e.g., self transfers)
                .reduce((acc: any[], item) => {
                    const key = `${item.txHash}-${item.logIndex}-${item.direction}`;
                    if (!acc.some((i) => i._key === key)) {
                        acc.push({ ...item, _key: key });
                    }
                    return acc;
                }, [])
                .sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0))
                .slice(0, 120);

            if (merged.length === 0) {
                setHistoryEvents([]);
                setHistoryError('거래내역이 없습니다. 체인/토큰을 확인하거나 더 최근에 발생한 거래인지 확인하세요.');
            } else {
                setHistoryEvents(merged);
                setHistoryError('');
            }
        } catch (error) {
            console.error('Failed to fetch escrow history', error);
            setHistoryError('거래내역을 불러오지 못했습니다.');
        } finally {
            setLoadingHistory(false);
        }
    };




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
        if (withdrawableEscrowBalance <= 0) {
            toast.error('거래중 수량을 제외하면 회수 가능한 잔액이 없습니다.');
            return;
        }
        setClearingSellerEscrowWalletBalance(true);
        const response = await fetch('/api/escrow/clearSellerEscrowWallet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedChain: selectedChain,
                walletAddress: address,
                withdrawAmount: withdrawableEscrowBalance,
            }),
        });
        const data = await response.json().catch(() => ({}));
        setClearingSellerEscrowWalletBalance(false);
        if (!response.ok || data?.error || !data?.result) {
            const message = data?.error || '잔액 회수 요청에 실패했습니다.';
            toast.error(message);
            return;
        }
        toast.success('판매자 에스크로 지갑 잔액 전부 회수 요청이 완료되었습니다.');
        setShowWithdrawModal(false);
    };




    return (

        <main className="seller-shell relative min-h-[100vh] overflow-hidden px-4 pb-28 text-slate-100 antialiased">

        <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>

        <AutoConnect client={client} wallets={[wallet]} />

            <div className="relative mx-auto w-full max-w-[400px] py-3">
        

                {/*
                {storecode && (
                    <div className="w-full flex flex-row items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {storecode}
                        </span>
                    </div>
                )}
                */}
        
                <div className="seller-panel mb-3 flex w-full items-center justify-start gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2">
                    {/* go back button */}
                    <div className="flex w-full items-center gap-2">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center rounded-full border border-slate-200/70 bg-white/90 p-2 shadow-sm">
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
                        <div className="seller-panel rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-center shadow-sm sm:p-5">
                            <p className="text-base font-semibold text-slate-600">
                                로그인해서 지갑을 연결하세요.
                            </p>
                            <div className="mt-4 inline-flex items-center justify-center">
                                <ConnectButton
                                    client={client}
                                    wallets={wallets}
                                    chain={selectedChainObject}
                                    theme={"dark"}
                                    connectButton={{
                                        style: {
                                            backgroundColor: "#0f172a",
                                            color: "#e2e8f0",
                                            padding: "10px 26px",
                                            borderRadius: "999px",
                                            fontSize: "15px",
                                            fontWeight: 700,
                                            border: "1px solid rgba(168, 85, 247, 0.45)",
                                            boxShadow:
                                                "0 0 0 1px rgba(34, 197, 94, 0.2), 0 16px 32px -18px rgba(168, 85, 247, 0.9), 0 0 24px rgba(168, 85, 247, 0.35)",
                                            letterSpacing: "0.02em",
                                        },
                                        label: "웹3 로그인",
                                    }}
                                    connectModal={{
                                        size: "wide",
                                        titleIcon: "https://loot.menu/logo.png",
                                        showThirdwebBranding: false,
                                    }}
                                    locale={"ko_KR"}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-6">

                        {loadingUserData && (
                            <div className="text-sm text-slate-500">Loading user data...</div>
                        )}

                        {!loadingUserData && !nickname && (
                            <div className='seller-panel w-full flex flex-col gap-2 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-6'>

                                <span className="text-base font-semibold text-slate-800">
                                    회원이 아닙니다.
                                </span>

                                <button
                                    onClick={() => {
                                        router.push('/' + params.lang + '/loot/profile-settings');
                                    }}
                                    className="w-full rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto"
                                >
                                    회원가입하기
                                </button>

                            </div>
                        )}

                        {!loadingUserData && nickname && !seller && (
                            <div className='seller-panel w-full flex flex-col gap-3 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-6'>

                                {/* nickname */}
                                <div className='w-full flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:justify-between'>
                                    <div className="flex flex-row items-center gap-2">
                                        {/* dot */}
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            회원아이디
                                        </span>
                                    </div>
                                    <span className="text-xl font-semibold text-emerald-700 sm:text-2xl">
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
                                        ${applyingSeller ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white'}
                                        w-full px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition sm:w-auto
                                    `}
                                    disabled={applyingSeller}
                                >
                                    {applyingSeller ? Applying + '...' : Apply}
                                </button>

                            </div>
                        )}


                        {!loadingUserData && seller && (
                            <>
                            <div className='seller-panel w-full flex flex-col gap-3 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm sm:gap-4 sm:p-5'>

                                {/* image and title */}
                                <div className='w-full flex items-center gap-3'>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/10 text-slate-100 shadow-sm">
                                        <Image
                                            src="/icon-seller.png"
                                            alt="Seller"
                                            width={24}
                                            height={24}
                                            className='h-6 w-6'
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-slate-900 sm:text-xl">
                                            {Seller} 설정
                                        </span>
                                        <span className="text-xs text-slate-300">
                                            판매자 상태 및 계정 설정
                                        </span>
                                    </div>
                                </div>


                                {/* nickname */}
                                <div className='w-full flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:justify-between'>
                                    <div className="flex flex-row items-center gap-2">
                                        {/* dot */}
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            회원아이디
                                        </span>
                                    </div>
                                    <span className="text-xl font-semibold text-emerald-700 sm:text-2xl">
                                        {nickname}
                                    </span>
                                </div>

                                {/* seller?.status */}
                                {/* status: pending, confirmed */}
                                <div className='w-full flex flex-col gap-2 items-start border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between'>
                                    <div className="flex flex-row items-center gap-2">
                                        {/* dot */}
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            판매자 상태
                                        </span>
                                    </div>
                                    {seller?.status === 'confirmed' ? (
                                        <span className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm sm:w-auto sm:min-w-[160px]">
                                            판매가능상태
                                        </span>
                                    ) : (
                                        <span className="inline-flex w-full items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700 shadow-sm sm:w-auto sm:min-w-[160px]">
                                            판매불가능상태
                                        </span>
                                    )}
                                </div>


                                {/* seller?.enabled */}
                                {/* 판매시작 여부 */}
                                {/* toggle seller enabled */}
                                <div className='w-full flex flex-col gap-2 items-start border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between'>
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
                                            className="flex w-full flex-row items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-white shadow-sm sm:w-auto"
                                        >
                                            <span className="text-sm font-semibold">
                                                판매중
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={toggleSellerEnabled}
                                            className="flex w-full flex-row items-center justify-center gap-2 rounded-full bg-slate-200 px-4 py-1.5 text-slate-600 shadow-sm sm:w-auto"
                                        >
                                            <span className="text-sm font-semibold">
                                                판매중지
                                            </span>
                                        </button>
                                    )}
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

                            <div className='seller-panel mt-4 w-full flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm sm:p-5'>
                                <div className="flex w-full flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/10 text-slate-100 shadow-sm">
                                            <Image
                                                src="/icon-kyc-minimal.svg"
                                                alt="KYC"
                                                width={24}
                                                height={24}
                                                className="h-6 w-6"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-semibold text-slate-900 sm:text-xl">KYC</span>
                                            <span className="text-xs text-slate-300">신원 확인 및 계좌 정보 제출 상태 확인</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='seller-panel w-full rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm sm:p-5'>
                                    <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/10 text-slate-100 shadow-sm">
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
                                                <span className="text-xs text-slate-300">계좌 정보 제출 후 심사됩니다.</span>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex w-full items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold sm:w-auto ${
                                                bankInfoStatus === 'approved'
                                                    ? 'border-emerald-300/50 bg-emerald-500/15 text-emerald-200'
                                                    : bankInfoStatus === 'rejected'
                                                    ? 'border-rose-300/50 bg-rose-500/15 text-rose-200'
                                                    : bankInfoStatus === 'pending'
                                                    ? 'border-amber-300/50 bg-amber-500/15 text-amber-200'
                                                    : 'border-slate-300/40 bg-white/5 text-slate-200'
                                            }`}
                                        >
                                            {bankInfoStatusLabel}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-col gap-1 text-sm text-slate-300">
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
                                            <span className="text-xs text-emerald-300">
                                                승인된 계좌 정보입니다. 승인 시간: {seller?.bankInfo?.reviewedAt ? new Date(seller.bankInfo.reviewedAt).toLocaleString() : '-'}
                                            </span>
                                        )}
                                        {bankInfoStatus === 'pending' && (
                                            <span className="text-xs text-amber-300">
                                                신청 시간: {seller?.bankInfo?.submittedAt ? new Date(seller.bankInfo.submittedAt).toLocaleString() : '-'}
                                            </span>
                                        )}
                                        {bankInfoStatus === 'rejected' && seller?.bankInfo?.rejectionReason && (
                                            <span className="text-xs text-rose-300">거절 사유: {seller.bankInfo.rejectionReason}</span>
                                        )}
                                    </div>
                                </div>

                                <div className='seller-panel w-full flex flex-col gap-4 items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5'>
                                <div className='w-full flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:justify-between'>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-300">
                                            입금받을 계좌 정보 신청
                                        </span>
                                    </div>

                                    {bankInfoStatus === 'pending' ? (
                                        <div className="w-full rounded-full border border-amber-300/50 bg-amber-500/15 px-3 py-1.5 text-center text-xs font-semibold text-amber-200 shadow-sm sm:w-auto">
                                            심사중
                                        </div>
                                    ) : applying ? (
                                        <div className="w-full rounded-full border border-slate-300/40 bg-white/10 px-3 py-1.5 text-center text-xs font-semibold text-slate-200 shadow-sm sm:w-auto">
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
                                                : 'bg-emerald-600 text-white'}
                                                w-full px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition sm:w-auto
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
                            
                            <div className="seller-panel mt-4 w-full rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm sm:p-5">
                                <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/10 text-slate-100 shadow-sm">
                                            <Image
                                                src="/icon-kyc-minimal.svg"
                                                alt="KYC"
                                                width={24}
                                                height={24}
                                                className="h-6 w-6"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900">신분증 인증 (KYC)</span>
                                            <span className="text-xs text-slate-300">주민증/운전면허증/여권 중 1장 업로드</span>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex w-full items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold sm:w-auto ${
                                                kycStatus === 'approved'
                                                ? 'border-emerald-300/50 bg-emerald-500/15 text-emerald-200'
                                                : kycStatus === 'rejected'
                                                ? 'border-rose-300/50 bg-rose-500/15 text-rose-200'
                                                : kycStatus === 'pending'
                                                ? 'border-amber-300/50 bg-amber-500/15 text-amber-200'
                                                : 'border-slate-300/40 bg-white/5 text-slate-200'
                                        }`}
                                    >
                                        {kycStatusLabel}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-col gap-3">
                                    {kycStatus === 'pending' ? (
                                        <>
                                            <div className="flex flex-col gap-2 rounded-xl border border-amber-300/50 bg-amber-500/15 px-4 py-3 text-sm text-amber-200 shadow-sm">
                                                <span className="font-semibold">심사 신청이 접수되었습니다.</span>
                                                <span className="text-xs text-amber-200">{kycFileHint}</span>
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
                                            <div className="rounded-xl border border-emerald-300/50 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200 shadow-sm">
                                                <span className="font-semibold">승인된 신분증입니다.</span>
                                                <span className="text-xs text-emerald-200">{kycFileHint}</span>
                                                <span className="mt-1 text-xs text-emerald-300">
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
                                    ) : kycStatus === 'rejected' ? (
                                        <>
                                            <div className="rounded-xl border border-rose-300/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-200 shadow-sm">
                                                <span className="font-semibold">신분증 인증이 반려되었습니다.</span>
                                                {seller?.kyc?.rejectionReason && (
                                                    <span className="mt-1 text-xs text-rose-200">
                                                        거절 사유: {seller.kyc.rejectionReason}
                                                    </span>
                                                )}
                                                <p className="mt-2 text-xs text-rose-200">
                                                    수정 후 다시 업로드해 주세요.
                                                </p>
                                                <label
                                                    htmlFor="kyc-id-upload-seller"
                                                    className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-rose-300/60 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-100 shadow-sm transition sm:w-auto"
                                                >
                                                    신분증 다시 업로드
                                                    <input
                                                        id="kyc-id-upload-seller"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleKycFileChange}
                                                    />
                                                </label>
                                                <span className="mt-2 text-xs text-rose-200">{kycFileHint}</span>
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
                                                className="cursor-pointer rounded-xl border border-dashed border-slate-200/80 bg-slate-50/80 px-4 py-4 text-center shadow-sm"
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
                                                    <span className="text-xs text-slate-300">JPG/PNG, 10MB 이하</span>
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
                                            <p className="text-xs text-slate-300">
                                                업로드 후 심사까지 영업일 기준 1-2일 소요될 수 있습니다.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={submitKyc}
                                                disabled={kycSubmitting || (!kycFile && !kycImageUrl)}
                                                className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition sm:w-auto sm:self-start ${
                                                    kycSubmitting || (!kycFile && !kycImageUrl)
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : 'bg-slate-900 text-white'
                                                }`}
                                            >
                                                {kycSubmitting ? '심사 신청 중...' : '심사신청하기'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            </div>
                            </>
                        )}


                        {!loadingUserData && seller?.escrowWalletAddress && (
                            
                            <div className='seller-panel w-full flex flex-col gap-3 items-start justify-between mt-4 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm sm:p-5'>

                                <div className='w-full flex items-center gap-3'>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/10 text-slate-100 shadow-sm">
                                        <Image
                                            src="/icon-escrow-wallet.png"
                                            alt="Escrow Wallet"
                                            width={24}
                                            height={24}
                                            className='h-6 w-6'
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-slate-900 sm:text-xl">
                                            에스크로 지갑 정보
                                        </span>
                                        <span className="text-xs text-slate-300">
                                            에스크로 잔액 및 지갑 주소 안내
                                        </span>
                                    </div>
                                </div>
                                {/* 설명 */}
                                {/* 에스크로 지갑에 잔액이 있어야 구매주문을 자동으로 처리할 수 있습니다. */}
                                <div className="text-sm text-slate-300 mb-4">
                                    에스크로 지갑에 잔액이 있어야 구매주문을 자동으로 처리할 수 있습니다.
                                </div>

                            <div className="flex flex-row items-center gap-2">
                                <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                <span className="text-sm font-semibold text-slate-300">
                                    에스크로 지갑 주소
                                </span>
                            </div>

                                <div className='w-full flex flex-col gap-3'>
                                    <div className="flex w-full flex-row items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src="/icon-smart-wallet.png"
                                                alt="Smart Wallet"
                                                width={50}
                                                height={50}
                                                className='w-8 h-8'
                                            />
                                            <button
                                                className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(seller?.escrowWalletAddress || "");
                                                    toast.success("에스크로 지갑 주소가 복사되었습니다" );
                                                } }
                                            >
                                                {seller?.escrowWalletAddress.slice(0, 6)}...{seller?.escrowWalletAddress.slice(-4)}
                                            </button>
                                        </div>
                                        <button
                                            className="rounded-full border border-slate-300/50 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-sm transition hover:border-emerald-300/60 hover:text-emerald-100"
                                            onClick={() => {
                                                setShowHistoryDrawer(true);
                                                fetchEscrowHistory();
                                            }}
                                        >
                                            에스크로 입출금내역
                                        </button>
                                    </div>
                                </div>

                                <div className='w-full flex flex-col gap-2 items-start border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between'>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                        <span className="text-sm font-semibold text-slate-300">
                                            에스크로 잔액
                                        </span>
                                    </div>
                                    <div className='flex flex-row items-center gap-2'>
                                        <span className="text-2xl font-semibold text-emerald-300 tabular-nums tracking-tight sm:text-3xl xl:text-4xl"
                                            style={{ fontFamily: 'monospace' }}
                                        >
                                            {escrowBalance.toFixed(2)}
                                        </span>
                                    </div>

                                </div>

                                {/* 설명 */}
                                {/* 에스크로 지갑 잔액을 모두 나의 지갑 (address) 으로 회수할 수 있습니다. */}
                                <div className="text-sm text-slate-300 mb-2">
                                    에스크로 지갑 잔액을 전부 나의 지갑 ({address?.slice(0,6)}...{address?.slice(-4)}) 으로 회수할 수 있습니다.
                                </div>
                                <div
                                    className={`escrow-summary ${activeTradeUsdtAmount > 0 ? 'escrow-summary--active' : ''}`}
                                >
                                    거래중 수량: {activeTradeUsdtAmount.toFixed(6)} USDT
                                    <div className="escrow-summary-sub">
                                        회수 가능 잔액: {withdrawableEscrowBalance.toFixed(6)} USDT
                                    </div>
                                </div>
                                    {/* 잔액 회수하기 버튼 */}
                                    <div className='w-full flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:justify-end'>
                                        <button
                                            onClick={() => {
                                                if (withdrawableEscrowBalance <= 0) {
                                                    toast.error('거래중 수량을 제외하면 회수 가능한 잔액이 없습니다.');
                                                    return;
                                                }
                                                setShowWithdrawModal(true);
                                            }}
                                            className={`
                                                ${clearingSellerEscrowWalletBalance ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white'}
                                                w-full px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition sm:w-auto
                                            `}
                                            disabled={clearingSellerEscrowWalletBalance || withdrawableEscrowBalance <= 0}
                                        >
                                            {clearingSellerEscrowWalletBalance ? '회수중...' : '잔액 전부 회수하기'}
                                        </button>
                                    </div>

                                <div className="mt-4 flex w-full justify-end">
                                    <button
                                        onClick={() => setShowTopUpModal(true)}
                                        className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition sm:w-auto"
                                    >
                                        내 지갑에서 충전하기
                                    </button>
                                </div>


                                {/* 판매금액(원) 설정 */}
                                <div className='w-full flex flex-col gap-2 items-start justify-between mt-4
                                border-t border-slate-200/80 pt-4'>

                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                            <span className="text-sm font-semibold text-slate-600">
                                                1 USDT 당 판매금액(원) 설정
                                            </span>
                                        </div>

                                        {/* seller.usdtToKrwRate */}
                                        <span className="text-sm text-slate-500">
                                            (현재 설정: {seller?.usdtToKrwRate || 0} 원)
                                        </span>
                                    </div>


                                    {/* market 연동 or 지정가 설정 */}
                                    {/* market 연동: upbit or bithumb or korbit */}
                                    {/* market중 하나 선택, 또는 지정가 선택 */}
                                    {/* checkbox style */}
                                    <div className='w-full flex flex-col gap-2 items-start'>

                                        <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-slate-700">
                                                가격 설정 방식:
                                            </span>
                                            {' '}
                                            <span className="text-sm text-slate-500">
                                                (현재 설정: {seller?.priceSettingMethod === 'market' ? 'Market 연동' : '지정가'})
                                            </span>
                                        </div>

                                        <div className="flex w-full gap-2">
                                            <button
                                                onClick={() => {
                                                    //setPriceSettingMethod('market');
                                                    setPriceSettingMethodFunc('market');

                                                }}
                                                className={`
                                                ${seller?.priceSettingMethod === 'market'
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-white/10 text-slate-100 border border-slate-200/60'}
                                                flex-1 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition
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
                                                    : 'bg-white/10 text-slate-100 border border-slate-200/60'}
                                                flex-1 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition
                                            `}
                                            disabled={seller?.priceSettingMethod === 'fixed'}
                                        >
                                                지정가
                                            </button>
                                        </div>

                                    </div>

                                    {/* priceSettingMethod 가 fixed 일 때만 보이기 */}
                                    {seller?.priceSettingMethod === 'fixed' && (

                                        <div className='w-full flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:justify-end'>

                                            <input 
                                                className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:w-36"
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
                                                    ${updatingUsdtToKrw ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white'}
                                                    w-full px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition sm:w-auto
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

                                        <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                                            연동할 마켓 선택:
                                        </span>
                                        <div className='w-full flex flex-col gap-2 items-start sm:flex-row sm:flex-wrap sm:items-center sm:justify-end'>

                                            <button
                                                onClick={() => {
                                                    //setMarket('upbit');
                                                    setMarketFunc('upbit');
                                                }}
                                                className={`
                                                        ${seller?.market === 'upbit'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-white/10 text-slate-100 border border-slate-200/60'}
                                                    w-full px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition sm:w-auto
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
                                                            : 'bg-white/10 text-slate-100 border border-slate-200/60'}
                                                    w-full px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition sm:w-auto
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
                                                            : 'bg-white/10 text-slate-100 border border-slate-200/60'}
                                                    w-full px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition sm:w-auto
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

                                        <div className="flex flex-row flex-nowrap gap-2">
                                            <button
                                                disabled={generatingPromotionText || updatingPromotionText}
                                                onClick={generatePromotionText}
                                                className={`
                                                    ${generatingPromotionText || updatingPromotionText
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : 'bg-white/10 text-slate-100 border border-slate-200/60'}
                                                    flex-1 min-w-0 whitespace-nowrap px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
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
                                                        : 'bg-emerald-600 text-white'}
                                                    flex-1 min-w-0 whitespace-nowrap px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
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

                                </div>

                            </div>
                        )}

                    </div>
                )}

            </div>
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                        onClick={() => {
                            if (!clearingSellerEscrowWalletBalance) {
                                setShowWithdrawModal(false);
                            }
                        }}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 bg-slate-900/90 p-6 shadow-2xl">
                        <div className="flex items-center justify-start">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-sky-200/70">에스크로 잔액 회수</p>
                                <h3 className="mt-1 text-lg font-bold text-white">잔액 전부 회수하기</h3>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 rounded-xl border border-slate-200/40 bg-slate-800/60 p-4 text-sm text-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">에스크로 잔액</span>
                                <span className="font-semibold text-emerald-200">{escrowBalance.toFixed(6)} USDT</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">거래중 수량</span>
                                <span className="font-semibold text-amber-200">{activeTradeUsdtAmount.toFixed(6)} USDT</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-700/80 pt-2">
                                <span className="text-slate-100">회수 가능 잔액</span>
                                <span className="text-xl font-bold text-white">{withdrawableEscrowBalance.toFixed(6)} USDT</span>
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                            회수된 금액은 연결된 내 지갑 ({address?.slice(0, 6)}...{address?.slice(-4)}) 으로 전송됩니다.
                        </p>
                        {clearingSellerEscrowWalletBalance && (
                            <p className="mt-2 rounded-lg border border-amber-300/50 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-100">
                                처리중입니다. 창을 닫지 말아주세요.
                            </p>
                        )}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                className="w-full rounded-full border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40 sm:w-auto"
                                onClick={() => setShowWithdrawModal(false)}
                                disabled={clearingSellerEscrowWalletBalance}
                            >
                                취소
                            </button>
                            <button
                                className={`
                                    ${clearingSellerEscrowWalletBalance ? 'bg-slate-400 text-slate-800' : 'bg-emerald-600 text-white'}
                                    w-full rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition sm:w-auto
                                `}
                                onClick={clearSellerEscrowWalletBalance}
                                disabled={clearingSellerEscrowWalletBalance}
                            >
                                {clearingSellerEscrowWalletBalance ? '처리중...' : '확인 후 회수하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showTopUpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                        onClick={() => {
                            if (!toppingUpEscrow) {
                                setShowTopUpModal(false);
                            }
                        }}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 bg-slate-900/90 p-6 shadow-2xl">
                        <div className="flex items-center justify-start">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-sky-200/70">에스크로 충전</p>
                                <h3 className="mt-1 text-lg font-bold text-white">내 지갑에서 충전하기</h3>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 rounded-xl border border-slate-200/40 bg-slate-800/60 p-4 text-sm text-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">내 지갑 보유 USDT</span>
                                <div className="flex items-center gap-2">
                                    {loadingUsdtBalance && (
                                        <span
                                            className="inline-flex h-2 w-2 rounded-full bg-emerald-300/70 animate-pulse"
                                            aria-label="갱신 중"
                                        />
                                    )}
                                    <span className="font-semibold text-emerald-200">
                                        {usdtBalance.toFixed(6)} USDT
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300" htmlFor="topup-amount">
                                    전송할 USDT 수량
                                </label>
                                <input
                                    id="topup-amount"
                                    className="w-full rounded-xl border border-slate-200/80 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-right"
                                    placeholder="예: 25.5"
                                    value={escrowTopUpAmount}
                                    type="text"
                                    inputMode="decimal"
                                    onChange={(e) => {
                                        const sanitized = e.target.value.replace(/[^0-9.]/g, '');
                                        const normalized = sanitized.replace(/(\..*)\./g, '$1');
                                        if (normalized === '' || normalized === '.') {
                                            setEscrowTopUpAmount(normalized);
                                            return;
                                        }
                                        const nextValue = Number(normalized);
                                        if (!Number.isFinite(nextValue)) {
                                            return;
                                        }
                                        if (!loadingUsdtBalance && nextValue > usdtBalance) {
                                            setEscrowTopUpAmount(usdtBalance.toFixed(6));
                                            return;
                                        }
                                        setEscrowTopUpAmount(normalized);
                                    }}
                                    disabled={toppingUpEscrow}
                                />
                            </div>
                        </div>

                        {toppingUpEscrow && (
                            <p className="mt-3 rounded-lg border border-emerald-300/50 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                                전송중입니다. 창을 닫지 말아주세요.
                            </p>
                        )}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                className="w-full rounded-full border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40 sm:w-auto"
                                onClick={() => setShowTopUpModal(false)}
                                disabled={toppingUpEscrow}
                            >
                                취소
                            </button>
                            <button
                                className={`
                                    ${toppingUpEscrow ? 'bg-slate-400 text-slate-800' : 'bg-emerald-600 text-white'}
                                    w-full rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition sm:w-auto
                                `}
                                onClick={topUpEscrowWallet}
                                disabled={toppingUpEscrow || !escrowTopUpAmount || Number(escrowTopUpAmount) <= 0}
                            >
                                {toppingUpEscrow ? '전송중...' : '확인 후 전송'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showHistoryDrawer && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                        onClick={() => {
                            if (!loadingHistory) {
                                setShowHistoryDrawer(false);
                            }
                        }}
                    />
                    <div className="drawer-panel absolute left-0 top-0 h-full w-full max-w-lg overflow-hidden border-r border-slate-200/60 bg-slate-950/95 p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-sky-200/70">History</p>
                                <h3 className="text-lg font-bold text-white">에스크로 입출금내역</h3>
                                <p className="text-xs text-slate-400">
                                    에스크로 지갑: {seller?.escrowWalletAddress?.slice(0, 6)}...{seller?.escrowWalletAddress?.slice(-4)}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    BSC 체인 기준 USDT 트랜잭션만 조회합니다. 최근 거래를 우선 조회하며 필요한 경우 전체 블록을 재조회합니다.
                                </p>
                            </div>
                            <button
                                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-100 disabled:opacity-40"
                                onClick={fetchEscrowHistory}
                                disabled={loadingHistory}
                            >
                                {loadingHistory ? '불러오는 중...' : '새로고침'}
                            </button>
                        </div>

                        <div className="mt-4 h-[calc(100%-90px)] overflow-y-auto pr-2">
                            {historyError && (
                                <div className="mb-3 rounded-lg border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100">
                                    {historyError}
                                </div>
                            )}
                            {loadingHistory && (
                                <div className="flex h-24 items-center justify-center text-sm text-slate-300">
                                    거래내역을 불러오는 중입니다...
                                </div>
                            )}
                            {!loadingHistory && !historyError && historyEvents.length === 0 && (
                                <div className="flex h-24 items-center justify-center text-sm text-slate-400">
                                    거래내역이 없습니다.
                                </div>
                            )}
                            {!loadingHistory && historyEvents.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {historyEvents.map((item, idx) => (
                                        <div
                                            key={item._key || `${item.txHash || 'tx'}-${idx}`}
                                            className="rounded-xl border border-slate-200/40 bg-slate-900/80 p-3 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        item.direction === 'in'
                                                            ? 'bg-emerald-500/15 text-emerald-100 border border-emerald-400/40'
                                                            : 'bg-rose-500/15 text-rose-100 border border-rose-400/40'
                                                    }`}
                                                >
                                                    {item.direction === 'in' ? '입금' : '출금'}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    블록 #{item.blockNumber || '-'}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex flex-col gap-1 text-xs text-slate-300">
                                                    <span className="font-semibold text-slate-100">
                                                        {item.amount?.toFixed ? item.amount.toFixed(6) : '-'} USDT
                                                    </span>
                                                    <span className="text-slate-400">
                                                        상대 지갑: {item.counterparty ? `${item.counterparty.slice(0, 6)}...${item.counterparty.slice(-4)}` : '-'}
                                                    </span>
                                                </div>
                                                {item.txHash && (
                                                    <button
                                                        className="text-[11px] font-semibold text-emerald-200 underline underline-offset-4"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(item.txHash || '');
                                                            toast.success('트랜잭션 해시가 복사되었습니다.');
                                                        }}
                                                    >
                                                        해시 복사
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        <style jsx global>{`
          .seller-shell {
            --seller-bg: #070b18;
            --seller-surface: rgba(15, 23, 42, 0.88);
            --seller-surface-soft: rgba(30, 41, 59, 0.72);
            --seller-border: rgba(56, 189, 248, 0.32);
            --seller-text: #e6f1ff;
            --seller-muted: #a6b4c9;
            --seller-glow: rgba(34, 211, 238, 0.35);
            background-color: var(--seller-bg);
            background-image:
              radial-gradient(circle at 12% 8%, rgba(56, 189, 248, 0.18), transparent 52%),
              radial-gradient(circle at 86% 14%, rgba(59, 130, 246, 0.16), transparent 58%),
              radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.14), transparent 62%),
              repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.05) 0 1px, transparent 1px 12px),
              repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.04) 0 1px, transparent 1px 6px);
          }

          .seller-shell .seller-panel {
            position: relative;
            background: linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.72)) !important;
            border-color: rgba(56, 189, 248, 0.35) !important;
            box-shadow:
              0 0 0 1px rgba(15, 23, 42, 0.8),
              0 18px 40px -28px rgba(56, 189, 248, 0.9),
              inset 0 0 0 1px rgba(148, 163, 184, 0.08);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
          }

          .seller-shell .seller-panel::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            border: 1px solid rgba(56, 189, 248, 0.12);
            pointer-events: none;
          }

          .seller-shell .seller-panel::after {
            content: "";
            position: absolute;
            top: 0;
            left: 12%;
            right: 12%;
            height: 2px;
            border-radius: 999px;
            background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent);
            opacity: 0.7;
            pointer-events: none;
          }

          .seller-shell .bg-white,
          .seller-shell .bg-white\\/90,
          .seller-shell .bg-white\\/95,
          .seller-shell .bg-white\\/80 {
            background-color: var(--seller-surface) !important;
          }

          .seller-shell .bg-slate-50,
          .seller-shell .bg-slate-50\\/80,
          .seller-shell .bg-slate-100 {
            background-color: var(--seller-surface-soft) !important;
          }

          .seller-shell .bg-slate-200,
          .seller-shell .bg-amber-50,
          .seller-shell .bg-amber-50\\/80,
          .seller-shell .bg-emerald-50,
          .seller-shell .bg-emerald-50\\/80 {
            background-color: rgba(125, 211, 252, 0.16) !important;
          }

          .seller-shell .border-slate-200,
          .seller-shell .border-slate-200\\/70,
          .seller-shell .border-slate-200\\/80,
          .seller-shell .border-slate-200\\/90,
          .seller-shell .border-slate-300,
          .seller-shell .border-amber-200\\/70,
          .seller-shell .border-amber-200\\/80,
          .seller-shell .border-emerald-200\\/70,
          .seller-shell .border-emerald-200\\/80 {
            border-color: var(--seller-border) !important;
          }

          .seller-shell .text-slate-900,
          .seller-shell .text-slate-800,
          .seller-shell .text-slate-700 {
            color: var(--seller-text) !important;
          }

          .seller-shell .text-slate-600,
          .seller-shell .text-slate-500,
          .seller-shell .text-slate-400 {
            color: var(--seller-muted) !important;
          }

          .seller-shell input,
          .seller-shell select,
          .seller-shell textarea {
            color: var(--seller-text) !important;
            background-color: rgba(8, 12, 24, 0.78) !important;
            border-color: rgba(56, 189, 248, 0.45) !important;
          }

          .seller-shell input::placeholder,
          .seller-shell textarea::placeholder {
            color: rgba(56, 189, 248, 0.95);
            font-weight: 700;
            text-shadow: 0 1px 10px rgba(56, 189, 248, 0.45);
          }

          .seller-shell .escrow-summary {
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(56, 189, 248, 0.35);
            background: rgba(5, 10, 24, 0.65);
            color: #e6f1ff;
            padding: 10px 12px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.01em;
            box-shadow: 0 14px 28px -22px rgba(56, 189, 248, 0.65);
          }

          .seller-shell .escrow-summary--active {
            border-color: rgba(16, 185, 129, 0.5);
            background: rgba(10, 28, 26, 0.7);
            box-shadow: 0 14px 28px -22px rgba(16, 185, 129, 0.7);
          }

          .seller-shell .escrow-summary-sub {
            margin-top: 4px;
            font-size: 12px;
            color: rgba(148, 197, 255, 0.9);
          }

          .seller-shell .escrow-summary--active .escrow-summary-sub {
            color: rgba(167, 243, 208, 0.92);
          }

          .drawer-panel {
            animation: slideInFromLeft 180ms ease-out;
          }

          @keyframes slideInFromLeft {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0%);
            }
          }

          .seller-shell a,
          .seller-shell button,
          .seller-shell [role="button"] {
            transition: none !important;
          }

          .seller-shell a:hover,
          .seller-shell button:hover,
          .seller-shell [role="button"]:hover {
            transform: none !important;
            box-shadow: none !important;
            filter: none !important;
          }
        `}</style>
        </main>

    );

}

          
