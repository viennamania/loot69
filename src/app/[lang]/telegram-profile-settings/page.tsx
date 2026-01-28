// nickname settings
'use client';
import React, { useEffect, useState, Suspense } from "react";



import {
    getContract,
    sendTransaction,
    sendAndConfirmTransaction,
} from "thirdweb";

import { deployERC721Contract } from 'thirdweb/deploys';

import {
    getOwnedNFTs,
    mintTo
} from "thirdweb/extensions/erc721";


import {
    ConnectButton,
    useActiveAccount,
    useActiveWallet,

    useConnectedWallets,
    useSetActiveWallet,


} from "thirdweb/react";

import { shortenAddress } from "thirdweb/utils";
////import { Button } from "@headlessui/react";
import { AutoConnect } from "thirdweb/react";

import Image from 'next/image';


import { balanceOf, transfer } from "thirdweb/extensions/erc20";
 
/*
import {
	accountAbstraction,
	client,
    wallet,
	editionDropContract,
	editionDropTokenId,
} from "../constants";
*/



import { client } from "../../client";


import {
  inAppWallet,
} from "thirdweb/wallets";

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



import {
    useRouter,
    useSearchParams,
} from "next//navigation";
import { useClientWallets } from "@/lib/useClientWallets";


//const contractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon


function ProfilePage() {
    const { wallet } = useClientWallets();

    const searchParams = useSearchParams();

    const center = searchParams.get("center");
    
    
    const telegramId = searchParams.get("telegramId");

    //const telegramId = '441516803'; // test


    /*
    const [telegramId, setTelegramId] = useState(
        searchParams.get("telegramId") || ""
    );
    */

    const account = useActiveAccount();

    /*
    const contract = getContract({
        client,
        chain: polygon,
        address: contractAddress,
    });
    */


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







    const router = useRouter();



    const address = account?.address;
  
  
    // test address
    //const address = "0xc7184E0Df0E6a7A57FCEC93CF47e3f4EeE76Ec2A";




    const [balance, setBalance] = useState(0);
    useEffect(() => {

        // get the balance
        const getBalance = async () => {

        ///console.log('getBalance address', address);

        
        const result = await balanceOf({
            contract,
            address: address || "",
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




    
    const [nickname, setNickname] = useState("");
    const [editedNickname, setEditedNickname] = useState("");

    const [avatar, setAvatar] = useState("/profile-default.png");



    

    const [userCode, setUserCode] = useState("");


    const [nicknameEdit, setNicknameEdit] = useState(false);



    const [avatarEdit, setAvatarEdit] = useState(false);



    const [seller, setSeller] = useState(null) as any;


    const [isAgent, setIsAgent] = useState(false);

    const [referralCode, setReferralCode] = useState("");

    const [erc721ContractAddress, setErc721ContractAddress] = useState("");

    const [userStorecode, setUserStorecode] = useState("");

    const [isCenterOwner, setIsCenterOwner] = useState(false);

    const [isValideTelegramId, setIsValideTelegramId] = useState(false);

    ///const [telegramId, setTelegramId] = useState("");

    const [store, setStore] = useState(null) as any;


    const [loadingGetUser, setLoadingGetUser] = useState(true);
    useEffect(() => {
        const fetchData = async () => {

            setLoadingGetUser(true);
            const response = await fetch("/api/user/getPayUserByTelegramId", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    telegramId: telegramId,
                }),
            });

            const data = await response.json();

            //console.log("data", data);


            if (data.result) {

                /*
                  store: {
                    _id: new ObjectId('68a96c452abf570c337e4edf'),
                    agentcode: 'natggzca',
                    storecode: 'deslbddt',
                    storeName: 'ChatGPT',
                    storeType: 'test',
                    storeUrl: 'https://test.com',
                    storeDescription: '설명입니다.',
                    storeLogo: 'https://t0gqytzvlsa2lapo.public.blob.vercel-storage.com/PRzu522-wjyF9MJYWAGKibxHwqqlUk77VtqG06.png',
                    storeBanner: 'https://crypto-ex-vienna.vercel.app/logo.png',
                    createdAt: '2025-08-23T07:22:45.112Z',
                    backgroundColor: 'purple-500',
                    totalBuyerCount: 7,
                    adminWalletAddress: '0x8527dDa689a7b5484de68ed525723e48d4f68a14',
                    settlementWalletAddress: '0x8527dDa689a7b5484de68ed525723e48d4f68a14',
                    settlementFeeWalletAddress: '0x3f62cf1DC5277308eB5Bbc54f6ae7E9E3372695e',
                    settlementFeePercent: 0.2,
                    sellerWalletAddress: '0x8527dDa689a7b5484de68ed525723e48d4f68a14',
                    bankInfo: {
                    bankName: '신한은행',
                    accountNumber: '982374928794',
                    accountHolder: '이한성'
                    },
                    agentFeePercent: 0.1,
                    totalKrwAmount: 752000,
                    totalKrwAmountClearance: 0,
                    totalPaymentConfirmedClearanceCount: 0,
                    totalPaymentConfirmedCount: 42,
                    totalUsdtAmount: 541.41,
                    totalUsdtAmountClearance: 0,
                    totalAgentFeeAmount: 0.535,
                    totalAgentFeeAmountKRW: 742,
                    totalFeeAmount: 1.083,
                    totalFeeAmountKRW: 1497,
                    totalSettlementAmount: 0,
                    totalSettlementAmountKRW: 749732,
                    totalSettlementCount: 42,
                    telegramBot: 'crypto_goodag_bot'
                },
                    */

                setStore(data.result.store);

                /*
                  buyer: {
                    depositBankAccountNumber: '82347923',
                    depositBankName: '토스뱅크',
                    depositName: '주하영'
                },
                */

                setUserName(data.result.buyer?.depositName || "");
                setUserBankName(data.result.buyer?.depositBankName || "");
                setUserBankAccountNumber(data.result.buyer?.depositBankAccountNumber || "");

                setNickname(data.result.nickname);
                
                data.result.avatar && setAvatar(data.result.avatar);
                

                setUserCode(data.result.id);

                //setSeller(data.result.seller);

                //setIsAgent(data.result.agent);

                ///setReferralCode(data.result.erc721ContractAddress);
                //setErc721ContractAddress(data.result.erc721ContractAddress);

                setUserStorecode(data.result.storecode);

                setWalletAddress(data.result.walletAddress);

                //if (data.result?.centerOwner) {
                //    setIsCenterOwner(true);
                //}
            
                ///setTelegramId(data.result.telegramId);
                /*
                if (data.result.telegramId) {
                    setTelegramId(data.result.telegramId);
                    setIsValideTelegramId(true);
                }
                */


            }

            setLoadingGetUser(false);

        };

        telegramId &&
        fetchData();

    }, [telegramId]);



    // check user nickname duplicate


    const [isNicknameDuplicate, setIsNicknameDuplicate] = useState(false);

    const checkNicknameIsDuplicate = async ( nickname: string ) => {

        const response = await fetch("/api/user/checkUserByNickname", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nickname: nickname,
                center: center,
            }),
        });


        const data = await response?.json();


        console.log("checkNicknameIsDuplicate data", data);

        if (data.result) {
            setIsNicknameDuplicate(true);
        } else {
            setIsNicknameDuplicate(false);
        }

    }



    /*

    const response = await fetch('/api/user/setBuyerWithoutWalletAddressByStorecode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
        userCode,
        userName,
        userBankName,
        userBankAccountNumber,
      }),
    });
    */

    const [walletAddress, setWalletAddress] = useState("");

    const [userName, setUserName] = useState("");
    const [userBankName, setUserBankName] = useState("");
    const [userBankAccountNumber, setUserBankAccountNumber] = useState("");

    const [loadingSetBuyerData, setLoadingSetBuyerData] = useState(false);

    const setBuyerData = async () => {
        setLoadingSetBuyerData(true);

        const response = await fetch('/api/user/setBuyerWithoutWalletAddressByStorecode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: userStorecode,
                userCode: userCode,
                userName: userName,
                userBankName: userBankName,
                userBankAccountNumber: userBankAccountNumber,

                telegramId: telegramId,
            }),
        });

        const data = await response.json();

        if (data.result) {
            // Handle success

            setWalletAddress(data.result.walletAddress);

            alert('구매자 정보가 저장되었습니다.');

        } else {
            // Handle error
            alert('구매자 정보 저장에 실패했습니다. 다시 시도해주세요.');
        }

        setLoadingSetBuyerData(false);
    };










    const [loadingSetUserData, setLoadingSetUserData] = useState(false);

    const setUserData = async () => {


        // check nickname length and alphanumeric
        //if (nickname.length < 5 || nickname.length > 10) {

        if (editedNickname.length < 5 || editedNickname.length > 10) {

            //toast.error("회원아이디는 5자 이상 10자 이하로 입력해주세요");
            return;
        }
        
        ///if (!/^[a-z0-9]*$/.test(nickname)) {
        if (!/^[a-z0-9]*$/.test(editedNickname)) {
            //toast.error("회원아이디는 영문 소문자와 숫자만 입력해주세요");
            return;
        }


        setLoadingSetUserData(true);

        if (nicknameEdit) {


            const response = await fetch("/api/user/updateUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
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

                setIsValideTelegramId(true);
                

                //toast.success('Nickname saved');

            } else {

                //toast.error('You must enter different nickname');
            }


        } else {

            const response = await fetch("/api/user/setUserVerified", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletAddress: address,                    
                    //nickname: nickname,
                    nickname: editedNickname,
                    userType: "",
                    mobile: "",
                    telegramId: telegramId,
                    center: center,
                }),
            });

            const data = await response.json();

            //console.log("data", data);

            if (data.result) {

                setUserCode(data.result.id);
                setNickname(data.result.nickname);
                setIsValideTelegramId(true);

                setNicknameEdit(false);
                setEditedNickname('');

                //toast.success('Nickname saved');

            } else {
                //toast.error('Error saving nickname');
            }
        }

        setLoadingSetUserData(false);

        
    }








    const [agentName, setAgentName] = useState("");
    const [agentDescription, setAgentDescription] = useState("");


    const [agentImage, setAgentImage] = useState("https://owinwallet.com/logo-aiagent.png");
    const [ganeratingAgentImage, setGeneratingAgentImage] = useState(false);


 



    return (

        <main
            className="pb-10 min-h-[100vh] flex items-start justify-center container max-w-screen-lg mx-auto"
        >

            <AutoConnect
                client={client}
                wallets={[wallet]}
            />


            <div className="py-0 w-full">


                {/* title */}
                <div className="flex flex-row gap-2 items-center justify-start p-4">
                    <Image
                        src="/icon-user.png"
                        alt="User Icon"
                        width={24}
                        height={24}
                    />
                    <span className="text-lg xl:text-xl font-semibold text-black">
                        나의 프로필
                    </span>
                </div>


                <div className="flex flex-col items-start justify-center gap-5 p-4">

                    
                    {/* telegramId */}
                    <span className='text-sm font-semibold text-gray-500'>
                        텔레그램 ID: {telegramId}
                    </span>

                    {/*
                    <div className="w-full flex justify-center mt-5">
                        
                        {address ? (
                            <div className="w-full flex flex-row gap-2 items-center justify-center">

                                <button
                                    onClick={() => (window as any).Telegram.WebApp.openLink(`https://polygonscan.com/address/${address}`)}
                                    className="flex flex-row gap-2 items-center"
                                >
                                    <Image
                                        src="/icon-shield.png"
                                        alt="Wallet"
                                        width={24}
                                        height={24}
                                        className="rounded"
                                    />
                                    <span className="text-sm font-semibold text-gray-500
                                        underline
                                        hover:text-gray-300
                                    ">
                                        {shortenAddress(address)}
                                    </span>
                                </button>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(address);
                                        alert('지갑주소가 복사되었습니다.');
                                    }}
                                    className="p-2 bg-blue-500 text-zinc-100 rounded"
                                >
                                    복사
                                </button>

                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 items-center justify-center">
                                <p className="text-sm text-zinc-400">
                                    연결된 지갑이 없습니다. 지갑을 연결해 주세요.
                                </p>

                                <span className='text-sm font-semibold text-gray-500'>
                                    텔레그램 ID: {telegramId}
                                </span>

                            </div>
                        )}      
                    </div>



                    {userCode && isValideTelegramId && (
                        <div className='w-full flex flex-row gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>
  
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className='text-sm font-semibold text-gray-500'>
                                    텔레그램ID
                                </span>
                            </div>
                            <div className='flex flex-row gap-2 items-center justify-between'>
                                <div className="p-2 bg-zinc-800 rounded text-zinc-100 text-xl font-semibold">
                                    {telegramId}
                                </div>
                            </div>


                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(telegramId as string);
                                    alert('텔레그램ID가 복사되었습니다.');
                                }}
                                className="p-2 bg-blue-500 text-zinc-100 rounded"
                            >
                                복사
                            </button>

                            {isCenterOwner && (
                                <span className='text-xs font-semibold text-green-500'>
                                    센터 소유자 입니다.
                                </span>
                            )}
                        </div>
                    )}

                    {userCode && !isValideTelegramId && (
                        <div className='w-full flex flex-col gap-2 items-start justify-between border border-gray-300 p-4 rounded-lg'>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <span className='text-sm font-semibold text-gray-500'>
                                    텔레그램ID(MID)
                                </span>
                                <span className='text-lg font-semibold text-blue-500'>
                                    {telegramId}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    setUserTelegramId();
                                }}
                                disabled={loadingSetUserTelegramId}
                                className={`
                                    ${loadingSetUserTelegramId ? 'bg-gray-300 text-gray-400' : 'bg-blue-500 text-zinc-100'}
                                    p-2 rounded-lg text-sm font-semibold
                                    w-64 mt-5
                                `}
                            >
                                {loadingSetUserTelegramId ? "텔레그램 ID 저장중..." : "텔레그램 ID 저장하기"}
                            </button>
    
                        </div>
                    )}
                    */}


                    {/* 회원아이디을 저장하면 나의 소속 센터 봇가 설정됩니다 */}
                    {/*
                    {address && !userCenter && (
                        <div className='w-full flex flex-col gap-2 items-start justify-between border border-gray-300 p-4 rounded-lg'>
                            <div className="bg-green-500 text-sm text-zinc-100 p-2 rounded">
                                회원아이디을 저장하면 나의 소속 센터 봇이 설정됩니다
                            </div>
                            <span className='text-sm font-semibold text-gray-500'>
                                회원아이디는 영문 소문자와 숫자로 5자 이상 10자 이하로 입력해주세요.
                            </span>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <span className='text-sm font-semibold text-gray-500'>
                                    나의 소속 센터 봇:
                                </span>
                                <span className='text-lg font-semibold text-blue-500'>
                                    {center}
                                </span>
                            </div>

                        </div>
                    )}
                    */}

                    

                    <div className='w-full  flex flex-col gap-5 '>


                        {loadingGetUser && (
                            <div className='w-full flex flex-col gap-2 items-center justify-center border border-gray-300 p-4 rounded-lg'>
                                <span className='text-sm font-semibold text-gray-500'>
                                    사용자 정보를 불러오는 중...
                                </span>
                                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6"></div>
                            </div>
                        )}



                        {
                        !loadingGetUser &&
                        telegramId && walletAddress && (

                            <div className="w-full flex flex-col gap-5 items-start justify-between border border-gray-300 p-4 rounded-lg">

                                {/* storecode, storeName, storeLogo */}
                                <div className='w-full flex flex-col gap-2 items-start justify-between'>
                                    <div className="flex flex-row gap-2 items-center justify-start">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className='text-sm font-semibold text-gray-500'>
                                            가맹점 정보
                                        </span>
                                    </div>
                                    <div className='flex flex-col gap-2 items-start justify-between'>

                                        {store ? (
                                            <div className='flex flex-row gap-2 items-center justify-start'>
                                                {store.storeLogo && (
                                                    <Image
                                                        src={store.storeLogo}
                                                        alt="Store Logo"
                                                        width={48}
                                                        height={48}
                                                        className="rounded"
                                                    />
                                                )}
                                                <div className="p-2 text-zinc-800 font-semibold text-xl">
                                                    {store.storeName} ({store.storecode})
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-2 text-zinc-800 font-semibold text-xl">
                                                가맹점 정보 없음
                                            </div>
                                        )}
                                        
                                    </div>
                                </div>
                                
                                
                                <div className='w-full flex flex-col gap-2 items-start justify-between'>
                                    <div className="flex flex-row gap-2 items-center justify-start">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className='text-sm font-semibold text-gray-500'>
                                            회원아이디
                                        </span>
                                    </div>

                                    <div className='flex flex-row gap-2 items-center justify-start'>
                                        <div className="p-2 text-zinc-800 font-semibold text-xl">
                                            {nickname}
                                        </div>
                                    </div>
                                </div>

                                {/* userName, userBankName, userBankAccountNumber */}
                                <div className='w-full flex flex-col gap-2 items-start justify-between'>
                                    <div className="flex flex-row gap-2 items-center justify-start">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className='text-sm font-semibold text-gray-500'>
                                            예금주명, 은행명, 계좌번호
                                        </span>
                                    </div>
                                    <div className='flex flex-col gap-2 items-start justify-between'>
                                        <div className="p-2 text-zinc-800 font-semibold text-xl">
                                            {userName} / {userBankName} / {userBankAccountNumber}
                                        </div>
                                    </div>
                                </div>

                                {/*
                                <div className='w-full flex flex-row gap-2 items-center justify-end'>
                                    <button
                                        onClick={() => {

                                            nicknameEdit ? setNicknameEdit(false) : setNicknameEdit(true);

                                        } }
                                        className="p-2 bg-blue-500 text-zinc-100 rounded"
                                    >
                                        {nicknameEdit ? "취소" : "수정"}
                                    </button>
                                </div>
                                */}
                                

                            </div>

                        )}


                        {
                        !loadingGetUser &&
                        telegramId && (nicknameEdit || !walletAddress) && (
                            <div className=' flex flex-col gap-2 items-start justify-between border border-gray-300 p-4 rounded-lg'>

                                
                                {/* 가맹점 코드 */}
                                <div className='w-full flex flex-col gap-2 items-start justify-between'>
                                    <div className="flex flex-row gap-2 items-center justify-start">
                                        {/* dot */}
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className='text-sm font-semibold text-gray-500'>
                                            가맹점 코드
                                        </span>
                                    </div>

                                    <div className='flex flex-col gap-2 items-start justify-between'>
                                        
                                        <input
                                            className="p-2 w-64 text-zinc-800 rounded-lg border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            "
                                            placeholder="가맹점 코드"
                                            value={userStorecode}
                                            type='text'
                                            onChange={(e) => {
                                                setUserStorecode(e.target.value);
                                            } }
                                        />

                                    </div>
                                </div>

                                {/* 회원아이디 */}
                                <div className='w-full flex flex-col gap-2 items-start justify-between'>
                                    <div className="flex flex-row gap-2 items-center justify-start">
                                        {/* dot */}
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className='text-sm font-semibold text-gray-500'>
                                        
                                            {!userCode ? "회원아이디" :
                                                nicknameEdit ? "수정할 내 회원아이디" : "새로운 회원아이디"
                                            }
                                        </span>
                                    </div>

                                    <div className='flex flex-col gap-2 items-start justify-between'>
                                        
                                        <input
                                            //disabled={!address}
                                            className="p-2 w-64 text-zinc-800 rounded-lg border border-gray-300
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                                disabled:bg-gray-200 disabled:text-gray-400
                                            "
                                            placeholder="회원아이디"
                                            
                                            //value={nickname}
                                            //value={editedNickname}
                                            value={userCode}

                                            type='text'
                                            onChange={(e) => {
                                                // check if the value is a number
                                                // check if the value is alphanumeric and lowercase

                                                if (!/^[a-z0-9]*$/.test(e.target.value)) {
                                                    //toast.error('회원아이디는 영문 소문자와 숫자만 입력해주세요');
                                                    return;
                                                }
                                                if ( e.target.value.length > 10) {
                                                    //toast.error('회원아이디는 10자 이하로 입력해주세요');
                                                    return;
                                                }
                                                
                                                setUserCode(e.target.value);


                                                //setNickname(e.target.value);

                                                //setEditedNickname(e.target.value);

                                                //checkNicknameIsDuplicate(e.target.value);

                                            } }
                                        />

                                        {/* 3 / 10 */}
                                        <div className='flex flex-row gap-2 items-center justify-start'>
                                            
                                            {userCode.length < 5 ? (
                                                <span className='text-sm font-semibold text-red-500'>
                                                    {userCode.length} / 10
                                                </span>
                                            ) : (
                                                <span className='text-sm font-semibold text-green-500'>
                                                    {userCode.length} / 10
                                                </span>
                                            )}
                                            
                                        </div>

                                        {userCode && isNicknameDuplicate && (
                                            <div className='flex flex-row gap-2 items-center justify-start'>
                                                {/* dot */}
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span className='text-sm font-semibold text-red-500'>
                                                    이미 사용중인 회원아이디입니다.
                                                </span>
                                            </div>
                                        )}

                                        {userCode
                                        && !isNicknameDuplicate
                                        && userCode.length >= 5
                                        && (
                                            <div className='flex flex-row gap-2 items-center justify-start'>
                                                {/* dot */}
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className='text-sm font-semibold text-green-500'>
                                                    사용가능한 회원아이디입니다.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex flex-row gap-2 items-center justify-start'>
                                        <Image
                                            src="/icon-info.png"
                                            alt="Info Icon"
                                            width={16}
                                            height={16}
                                        />
                                        <span className='text-sm font-semibold text-gray-500'>
                                            회원아이디는 5자 이상 10자 이하로 입력해주세요
                                        </span>
                                    </div>
                                </div>


                                {/* userName, userBankName, userBankAccountNumber */}
                                <div className='w-full flex flex-col gap-2 items-start justify-between'>

                                    <div className="flex flex-row gap-2 items-center justify-start">
                                        {/* dot */}
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className='text-sm font-semibold text-gray-500'>
                                            예금주명, 은행명, 계좌번호
                                        </span>
                                    </div>

                                    <input
                                        className="p-2 w-64 text-zinc-800 rounded-lg border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                        "
                                        placeholder="예금주명"
                                        value={userName}
                                        type='text'
                                        onChange={(e) => {
                                            setUserName(e.target.value);
                                        } }
                                    />
                                    <input
                                        className="p-2 w-64 text-zinc-800 rounded-lg border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                        "
                                        placeholder="은행명"
                                        value={userBankName}
                                        type='text'
                                        onChange={(e) => {
                                            setUserBankName(e.target.value);
                                        } }
                                    />
                                    <input
                                        className="p-2 w-64 text-zinc-800 rounded-lg border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                        "
                                        placeholder="계좌번호"
                                        value={userBankAccountNumber}
                                        type='text'
                                        onChange={(e) => {
                                            setUserBankAccountNumber(e.target.value);
                                        } }
                                    />
                                </div>


                                <button
                                    disabled={
                                        !telegramId
                                        || userStorecode.length < 3
                                        || userCode.length < 5
                                        || !userName
                                        || !userBankName
                                        || !userBankAccountNumber
                                        || isNicknameDuplicate
                                        || loadingSetBuyerData
                                    }
                                    className={`
                                        w-full
                                        ${!telegramId
                                        || userStorecode.length < 3
                                        || userCode.length < 5
                                        || !userName
                                        || !userBankName
                                        || !userBankAccountNumber
                                        || isNicknameDuplicate
                                        || loadingSetUserData
                                        ? 'bg-gray-300 text-gray-400'
                                        : 'bg-blue-500 text-zinc-100'}

                                        p-2 rounded-lg text-sm font-semibold
                                        w-64 mt-5
                                    `}
                                    onClick={() => {
                                        setBuyerData();
                                        
                                    }}
                                >
                                    {loadingSetBuyerData ? "지갑주소 생성중..." : "지갑주소 생성하기"}

                                </button>

                                

                            </div>
                        )}

                        {/*
                        {userCode && (
                            <div className='flex flex-row xl:flex-row gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>

                                <div className="bg-green-500 text-sm text-zinc-100 p-2 rounded">
                                    프로필 이미지
                                </div>

                                <div className="p-2 bg-zinc-800 rounded text-zinc-100 text-xl font-semibold">
                                    <Uploader
                                        lang='kr'
                                        walletAddress={address as string}
                                    />
                                </div>

                            </div>
                        )}
                        */}


                    </div>


                </div>

            </div>

        </main>

    );

}

          

function Header(
    {
        center,
        agent,
        tokenId,
    } : {
        center: string
        agent: string
        tokenId: string
    }
) {

    const router = useRouter();
  
  
    return (
      <header className="flex flex-col items-center mb-5 md:mb-10">
  
        {/* header menu */}
        <div className="w-full flex flex-row justify-between items-center gap-2
          bg-green-500 p-4 rounded-lg mb-5
        ">
            {/* logo */}
            <button
                onClick={() => {
                    router.push('/?center=' + center + '&agent=' + agent + '&tokenId=' + tokenId);
                }}
            >            
                <div className="flex flex-row gap-2 items-center">
                    <Image
                    src="/logo-aiagent.png"
                    alt="Circle Logo"
                    width={35}
                    height={35}
                    className="rounded-full w-10 h-10 xl:w-14 xl:h-14"
                    />
                    <span className="text-lg xl:text-3xl text-gray-800 font-semibold">
                    AI Agent
                    </span>
                </div>
            </button>

            {/*}
            <div className="flex flex-row gap-2 items-center">
                <button
                onClick={() => {
                    router.push(
                        "/tbot?center=" + center + "agent=" + agent + "&tokenId=" + tokenId
                    );
                }}
                className="text-gray-600 hover:underline text-xs xl:text-lg"
                >
                TBOT
                </button>
                <button
                onClick={() => {
                    router.push('/profile?center=' + center + 'agent=' + agent + '&tokenId=' + tokenId);
                }}
                className="text-gray-600 hover:underline text-xs xl:text-lg"
                >
                SETTINGS
                </button>
            </div>
            */}


        </div>
        
      </header>
    );
  }



  export default function Profile() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProfilePage />
        </Suspense>
    );
  }
