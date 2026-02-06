// nickname settings
'use client';
import React, { useEffect, useMemo, useState } from 'react';



import { toast } from 'react-hot-toast';

import { client } from "../../../client";

import {
    getContract,
    sendAndConfirmTransaction,
} from "thirdweb";



import {
    polygon,
    arbitrum,
    ethereum,
    bsc,
} from "thirdweb/chains";

import {
    ConnectButton,
    useActiveAccount,
} from "thirdweb/react";


import { getUserPhoneNumber } from "thirdweb/wallets/in-app";
import { useClientWallets } from '@/lib/useClientWallets';
import { chain as chainId } from '@/app/config/contractAddresses';


import Image from 'next/image';

import GearSetupIcon from "@/components/gearSetupIcon";


import Uploader from '@/components/uploader';

import { balanceOf, transfer } from "thirdweb/extensions/erc20";
 

import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../dictionaries";




const storecode = "admin";

const activeChainId = chainId || 'bsc';
const getChainObject = () => {
  switch (activeChainId) {
    case 'ethereum':
      return ethereum;
    case 'polygon':
      return polygon;
    case 'arbitrum':
      return arbitrum;
    case 'bsc':
    default:
      return bsc;
  }
};


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




    const contract = getContract({
        // the client you have created via `createThirdwebClient()`
        client,
        // the chain the contract is deployed on 
        
        chain: arbitrum,

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
    const { wallets } = useClientWallets();
    const chainObj = useMemo(() => getChainObject(), []);
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




    useEffect(() => {
        const fetchData = async () => {
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

                setEscrowWalletAddress(data.result.escrowWalletAddress);
            } else {
                setNickname('');
                setAvatar('/profile-default.png');
                setUserCode('');
                setSeller(null);
                setEditedNickname('');
                setAccountHolder('');
                setAccountNumber('');

                setEscrowWalletAddress('');

                //setBankName('');
            }

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
                throw new Error(error?.error || `Sendbird nickname update failed (status ${response.status})`);
            }
        } catch (error) {
            console.error('Sendbird nickname update failed', error);
            toast.error(
              error instanceof Error ? error.message : '채팅 닉네임 변경에 실패했습니다.',
              { id: 'profile-save' }
            );
        }
    };





    const setUserData = async () => {


        toast.loading('저장 중...', { id: 'profile-save' });


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

                toast.success('채팅 닉네임도 변경됨', { id: 'profile-save' });

            } else {

                toast.error('아이디 저장에 실패했습니다', { id: 'profile-save' });
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

                toast.success('채팅 닉네임도 변경됨', { id: 'profile-save' });

            } else {
                toast.error('아이디 저장에 실패했습니다', { id: 'profile-save' });
            }
        }

        toast.dismiss('profile-save');


        

        
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
                storecode: storecode,
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
                storecode: storecode,
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



    const [escrowWalletAddress, setEscrowWalletAddress] = useState('');

    if (!address) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-12 text-slate-100 flex items-center justify-center">
                <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl space-y-4">
                    <div>
                        <p className="text-sm text-emerald-100/80">프로필 설정</p>
                        <h1 className="text-2xl font-bold text-white">지갑을 연결해주세요</h1>
                        <p className="mt-2 text-sm text-slate-300">
                            Web3 로그인을 먼저 진행하면 프로필 정보를 수정할 수 있습니다.
                        </p>
                    </div>
                    <ConnectButton
                        client={client}
                        wallets={wallets}
                        chain={chainObj}
                        theme="dark"
                        connectButton={{
                            label: '웹3 로그인',
                            style: {
                                height: 48,
                                borderRadius: 9999,
                                background: '#0f172a',
                                color: '#e2e8f0',
                                fontWeight: 700,
                                border: '1px solid rgba(94,234,212,0.4)',
                                width: '100%',
                            },
                        }}
                        connectModal={{ size: 'wide', showThirdwebBranding: false }}
                        locale="ko_KR"
                    />
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
                    >
                        ← 돌아가기
                    </button>
                </div>
            </main>
        );
    }

    return (

        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 py-10 text-slate-100 flex items-start justify-center">

            <div className="w-full max-w-3xl space-y-6">
        

                <div className="w-full flex flex-row gap-2 items-center justify-between text-slate-200 text-sm"
                >
                    {/* go back button */}
                    <div className="flex justify-start items-center gap-2">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center rounded-full border border-white/20 bg-slate-900/70 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <Image
                                src="/icon-back.png"
                                alt="Back"
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                        </button>
                        {/* title */}
                        <span className="text-sm text-slate-100 font-semibold">
                            돌아가기
                        </span>
                    </div>


                </div>



                <div className="mt-5 flex flex-col items-start justify-center space-y-4">

                    <div className='flex flex-row items-center gap-3'>
                        <Image
                            src={"/icon-user.png"}
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
                        <div className="text-xl font-semibold text-slate-900">
                            {Profile_Settings}
                            
                        </div>


                    </div>


                    {/* 회원코드(id) */}
                    {userCode && (
                        <div className='flex flex-row gap-2 items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg'>
                            <div className="flex flex-row items-center gap-2">
                                <div className='w-2 h-2 bg-emerald-400 rounded-full'></div>
                                <span className="text-sm font-semibold text-slate-100">
                                    회원코드
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-emerald-100">
                                {userCode}
                            </span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(userCode);
                                    toast.success('회원코드가 복사되었습니다');
                                }}
                                className="rounded-full border border-emerald-300/50 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-50 shadow-sm transition hover:bg-emerald-400/30"
                            >
                                복사하기
                            </button>
                        </div>
                    )}



                
                    <div className='w-full  flex flex-col gap-5 '>

                        {userCode && (
                            <div className='flex flex-row gap-2 items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg'>


                                <div className="flex flex-row items-center gap-2">
                                    {/* dot */}
                                    <div className='w-2 h-2 bg-emerald-400 rounded-full'></div>
                                    <span className="text-sm font-semibold text-slate-100">
                                        나의 아이디
                                    </span>
                                </div>


                                <span className="text-lg font-semibold text-emerald-100">
                                    {nickname}
                                </span>



                                
                                <button
                                    onClick={() => {

                                        nicknameEdit ? setNicknameEdit(false) : setNicknameEdit(true);

                                    } }
                                    className="rounded-full border border-emerald-300/50 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-50 shadow-sm transition hover:bg-emerald-400/30"
                                >
                                    {nicknameEdit ? '취소하기' : '수정하기'}
                                </button>

                                <Image
                                src="/verified.png"
                                alt="Verified"
                                width={20}
                                height={20}
                                className="rounded-lg"
                                />


                                
                            </div>
                        )}


                        { (address && (nicknameEdit || !userCode)) && (
                            <div className=' flex flex-col xl:flex-row gap-3 items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg'>


                                <div className="flex flex-row items-center gap-2">
                                    {/* dot */}
                                    <div className='w-2 h-2 bg-emerald-400 rounded-full'></div>
                                    <span className="text-sm font-semibold text-slate-100">
                                        {nicknameEdit ? "내 아이디 수정" : "내 아이디 설정"}
                                    </span>
                                </div>


                                <div className='flex flex-col gap-2'>
                                    <input
                                        disabled={!address}
                                        className="w-full rounded-2xl border-2 border-emerald-300/40 bg-slate-950/70 px-6 py-5 text-2xl font-black text-emerald-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                                        placeholder={Enter_your_nickname}
                                        
                                        //value={nickname}
                                        value={editedNickname}

                                        type='text'
                                        onChange={(e) => {
                                            // check if the value is a number
                                            // check if the value is alphanumeric and lowercase

                                            if (!/^[a-z0-9]*$/.test(e.target.value)) {
                                                alert(Nickname_should_be_alphanumeric_lowercase);
                                                return;
                                            }
                                            if ( e.target.value.length > 10) {
                                                toast.error(Nickname_should_be_at_least_5_characters_and_at_most_10_characters);
                                                return;
                                            }

                                            //setNickname(e.target.value);

                                            setEditedNickname(e.target.value);

                                        } }


                                    />
                                    <div className='flex flex-row gap-2 items-center justify-between'>
                                        <span className='text-xs font-semibold text-slate-300'>
                                            {Nickname_should_be_5_10_characters}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    disabled={!address}
                                    className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-emerald-300 disabled:opacity-60"
                                    onClick={() => {
                                        setUserData();
                                    }}
                                >
                                    저장하기
                                </button>

                                

                            </div>
                        )}


                        {false && userCode && (
                            <div className='flex flex-row xl:flex-row gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>

                                <div className="bg-green-500 text-sm text-zinc-100 p-2 rounded-lg">
                                    {My_Profile_Picture}
                                </div>

                                <div className="p-2 bg-zinc-800 rounded text-zinc-100 text-xl font-semibold">
                                    <Uploader
                                        lang={params.lang}
                                        walletAddress={address as string}
                                    />
                                </div>

                            </div>
                        )}



                    </div>


                </div>

                <div className="mt-8 w-full rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200/80">Profile Guide</span>
                                <p className="text-base font-semibold text-white">프로필을 최신 상태로 유지하세요</p>
                                <p className="text-xs text-slate-300">
                                    빠른 거래 승인과 안전한 정산을 위해 기본 정보를 최신화해 주세요.
                                </p>
                            </div>
                            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-white shadow-sm ring-1 ring-emerald-300/40">
                                <Image
                                    src="/icon-shield.png"
                                    alt="Guide"
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 opacity-95"
                                />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                                    <Image src="/icon-user.png" alt="Profile" width={18} height={18} className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-100">닉네임</span>
                                    <span className="text-[11px] text-slate-400">실사용 닉네임 유지</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                                    <Image src="/icon-bank-check.png" alt="Verification" width={18} height={18} className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-100">인증 정보</span>
                                    <span className="text-[11px] text-slate-400">계좌/연락처 확인</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                                    <Image src="/icon-chat.png" alt="Support" width={18} height={18} className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-100">문의 대응</span>
                                    <span className="text-[11px] text-slate-400">알림/채팅 확인</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

        </main>

    );

}

          
