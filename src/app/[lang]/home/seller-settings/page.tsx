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
    polygon,
    arbitrum,
} from "thirdweb/chains";

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

//const storecode = "admin";



const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "email",
        "x",
        "passkey",
        //"phone",
        //"facebook",
        "line",
        "apple",
        "coinbase",
      ],
    },
  }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("io.metamask"),
  createWallet("com.bitget.web3"),
  createWallet("com.trustwallet.app"),
  createWallet("com.okex.wallet"),

];


const contractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon

//const contractAddressArbitrum = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum




import {
    useRouter,
    useSearchParams,
} from "next//navigation";
import { add } from 'thirdweb/extensions/farcaster/keyGateway';





export default function SettingsPage({ params }: any) {


    //console.log("params", params);
    
    const searchParams = useSearchParams();
 
    ///const wallet = searchParams.get('wallet');




    const contract = getContract({
        // the client you have created via `createThirdwebClient()`
        client,
        // the chain the contract is deployed on

        chain: polygon,

        ///address: contractAddressArbitrum,
        address: contractAddress,
    
    
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
    
    
    const { Canvas } = useQRCode();


    const router = useRouter();



    // get the active wallet
    const activeWallet = useActiveWallet();

    const setActiveAccount = useSetActiveWallet();
    
    const connectWallets = useConnectedWallets();





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







    // selected storecode
    const [selectedStorecode, setSelectedStorecode] = useState('');


    // get all stores
    const [stores, setStores] = useState([]);
    useEffect(() => {

        const fetchData = async () => {

            const response = await fetch("/api/store/getAllStores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletAddress: address,
                    limit: 100,
                    page: 1,
                    searchStore: '',
                    agentcode: '',
                })
            });

            const data = await response.json();

            //console.log("getAllStores data", data);

            if (data.result) {
                setStores(data.result.stores);

                // set selected storecode to the first storecode
                if (data.result.stores.length > 0) {
                    setSelectedStorecode(data.result.stores[0].storecode);
                }
            }

        };

        fetchData();
    }, [address]);








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

    const [vaultWallet, setVaultWallet] = useState({
        address: '',
        privateKey: '',
    });


    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/user/getUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storecode: selectedStorecode,
                    walletAddress: address,
                }),
            });

            const data = await response.json();

            //console.log("data", data);

            /*
            {
                "_id": "690c382334f80c6d88725f72",
                "storecode": "cfdkzznw",
                "walletAddress": "0xC76033Fc29D138a01865884B32D0604765073613",
                "nickname": "hasddsa",
                "seller": {
                    "status": "confirmed",
                    "bankInfo": {
                        "bankName": "신한은행",
                        "accountNumber": "82937493283",
                        "accountHolder": "오고고"
                    }
                }
            }
            */



            if (data.result) {
                setNickname(data.result.nickname);
                
                data.result.avatar && setAvatar(data.result.avatar);
                

                setUserCode(data.result.id);

                setSeller(data.result.seller);

                setEscrowWalletAddress(data.result.escrowWalletAddress);

                setVaultWallet(data.result?.vaultWallet);

            } else {
                setNickname('');
                setAvatar('/profile-default.png');
                setUserCode('');
                setSeller(null);
                setEditedNickname('');
                setAccountHolder('');
                setAccountNumber('');

                setEscrowWalletAddress('');


                setVaultWallet({
                    address: '',
                    privateKey: '',
                });

                //setBankName('');
            }

        };

        fetchData();
    }, [address, selectedStorecode]);






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
                    storecode: selectedStorecode,
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
                    storecode: selectedStorecode,
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


      if (!editedNickname || !bankName || !accountNumber || !accountHolder) {
        toast.error('Please fill all the fields');
        return;
      }

      setApplying(true);

  
      try {
  
  
          await fetch('/api/user/updateSeller', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storecode: selectedStorecode,
                walletAddress: address,
                nickname: editedNickname,
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
                storecode: selectedStorecode,
                walletAddress: address,
            }),
          }).then((response) => response.json())
            .then((data) => {
                setNickname(data.result.nickname);
                setSeller(data.result.seller);

                setVaultWallet(data.result?.vaultWallet);
            });

  
  
  
          /////toast.success('USDT sent successfully');
  
        
  
  
      } catch (error) {
        toast.error('Failed to apply');
      }
  
      setApplying(false);
    };
  




    // check box edit seller
    const [editSeller, setEditSeller] = useState(false);




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
            storecode: selectedStorecode,
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
            storecode: selectedStorecode,
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




    // get balance of valut wallet address
    const [vaultWalletBalance, setVaultWalletBalance] = useState("0");
    useEffect(() => {
        const fetchData = async () => {
            if (!vaultWallet?.address) {
                return;
            }

            const result = await balanceOf({
                contract,
                address: vaultWallet?.address || '',
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

    }, [vaultWallet?.address, contract]);



    // /api/vault/withdrawVault
    // withdrawAmount
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);

    const withdrawVault = async () => {
        if (withdrawing) {
            return;
        }

        if (!address) {
            toast.error('Please connect your wallet');
            return;
        }
        
        if (!selectedStorecode) {
            toast.error('Please select a store');
            return;
        }

        if (!withdrawAmount || Number(withdrawAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setWithdrawing(true);

        try {
            const response = await fetch('/api/vault/withdrawVault', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storecode: selectedStorecode,
                    walletAddress: address,
                    withdrawAmount: withdrawAmount,
                }),
            });

            const data = await response.json();

            //console.log('withdrawVault data', data);

            if (data.result) {
                setWithdrawAmount('');
                toast.success('Withdraw request has been submitted');
            } else {
                toast.error('Withdraw request has been failed');
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error('Withdraw request has been failed');
        }

        setWithdrawing(false);
    };

    // render
 
    return (

        <main className="p-4 min-h-[100vh] flex items-start justify-center container max-w-screen-sm mx-auto">

            <div className="py-0 w-full">
        

                {/* title "판매자 설정" */}
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    판매자 설정
                </h1>

                <div
                className="mb-4 w-full flex flex-row gap-2 items-center justify-start text-zinc-500 text-lg">
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

                {/* describe "판매자 설정 페이지입니다. 상점별로 판매자 정보를 설정할 수 있습니다." */}
                <p className="text-sm text-gray-500 mb-4">
                    판매자 설정 페이지입니다. 상점별로 판매자 정보를 설정할 수 있습니다.
                </p>

                {/* card style select store box, grid view */}
                {/* stores, setSelectedStorecode */}
                {/* store.storeName, store.storecode, store.storeLogo */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {stores.map((store: any) => (
                        <div
                            key={store.storecode}
                            onClick={() => setSelectedStorecode(store.storecode)}
                            className={`
                                p-4 border rounded-lg cursor-pointer
                                ${selectedStorecode === store.storecode ? 'bg-blue-500 text-white' : 'bg-white text-black'}
                            `}
                        >
                            <div className="flex flex-col items-center">
                                <Image
                                    src={store.storeLogo}
                                    alt={store.storeName}
                                    width={100}
                                    height={100}
                                    className="mb-2 w-16 h-16 rounded-lg object-cover"
                                />
                                <span className="font-semibold">{store.storeName}</span>
                            </div>
                        </div>
                    ))}
                </div>


                {seller && (

                    <div className='w-full flex flex-col gap-2 items-start justify-between border border-gray-300 p-4 rounded-lg'>

                        <div className="flex flex-row items-center gap-2">
                            {/* dot */}
                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                            <span className="text-lg">
                                판매자 정보
                            </span>
                        </div>


                        <div className="flex flex-col gap-4 w-full">

                            {/* 판매자 이름 */}
                            <div className='flex flex-row items-start gap-2
                                border-t border-b border-gray-300 py-2'>
                                <Image
                                    src="/icon-seller.png"
                                    alt="User"
                                    width={24}
                                    height={24}
                                />
                                <span className="text-lg text-zinc-500 font-semibold">
                                    판매자 이름: {
                                        nickname ? nickname : '등록 안됨'
                                    }
                                </span>
                            </div>

                            {/* 판매자 지갑주소 */}
                            <div className='flex flex-col items-start gap-2
                                border-t border-b border-gray-300 py-2'>
                                {/* 제목: 에스크로 지갑 */}
                                <div className='flex flex-row items-start gap-2'>
                                    <Image
                                        src="/icon-escrow.jpeg"
                                        alt="Escrow"
                                        width={24}
                                        height={24}
                                    />
                                    <span className="text-lg font-semibold">에스크로 지갑</span>
                                </div>

                                <div className="flex flex-row items-center gap-2">
                                    <span className="text-lg text-zinc-500 font-semibold">
                                        지갑주소: {vaultWallet?.address || '등록 안됨'}
                                    </span>
                                    {vaultWallet?.address && (
                                        <button
                                            onClick={() => {
                                                if (vaultWallet?.address) {
                                                    navigator.clipboard.writeText(vaultWallet?.address);
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

                                {vaultWallet?.address && (
                                    <div className='w-full flex flex-row items-center gap-2'>
                                        <Canvas
                                        text={vaultWallet?.address || ''}
                                            options={{
                                            //level: 'M',
                                            margin: 2,
                                            scale: 4,
                                            ///width: 200,
                                            // width 100%
                                            width: 150,
                                            color: {
                                                dark: '#000000FF',
                                                light: '#FFFFFFFF',
                                            },
                                
                                            }}
                                        />

                                        <div className='w-full flex flex-col items-start gap-2'>

                                            <div className='w-full flex flex-col items-end justify-center gap-2'>

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

                                                {/* inpmut amount and withdraw vault button */}
                                                <div className='flex flex-row items-center gap-2'>
                                                    <input
                                                        type="text"
                                                        placeholder="출금 금액"
                                                        className={`
                                                            p-2 border border-gray-300 rounded text-xl w-48
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                                                        `}
                                                        value={withdrawAmount}
                                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                                    />
                                                    <button
                                                        className={`
                                                            ${withdrawing ? 'bg-gray-300 text-gray-400' : 'bg-blue-500 text-white'}
                                                            p-2 rounded-lg text-sm font-semibold w-32
                                                        `}
                                                        onClick={withdrawVault}
                                                        disabled={withdrawing}
                                                    >
                                                        {withdrawing ? '출금 요청중...' : '출금 요청'}
                                                    </button>
                                                </div>

                                                {/* 설명 */}
                                                <div className='flex flex-row items-center gap-2'>
                                                    <Image
                                                        src="/icon-info.png"
                                                        alt="Info"
                                                        width={16}
                                                        height={16}
                                                    />
                                                    <span className='text-zinc-500 font-semibold'>
                                                        출금 요청 시, 판매자 지갑으로 출금이 진행됩니다.
                                                    </span>
                                                </div>


                                            </div>

                                        </div>

                                    </div>
                                )}

                            </div>


                            <div className='w-full flex flex-col items-start gap-4
                                border-t border-b border-gray-300 py-2'>


                                {/* USDT 1개당 판매가격(원) */}
                                <div className='w-full flex flex-row items-center justify-between gap-4'>
                                    <div className='flex flex-row items-center gap-2'>
                                        <Image
                                            src="/icon-price.png"
                                            alt="Price"
                                            width={24}
                                            height={24}
                                        />
                                        <span className='text-zinc-500 font-semibold'>
                                            USDT 1개당 판매가격:
                                        </span>
                                    </div>

                                    {editingUsdtPrice ? (
                                        <span className='text-zinc-500 font-semibold'>
                                            불러오는 중...
                                        </span>
                                    ) : (
                                        <div className='flex flex-col items-center gap-2'>
                                            <div className='flex flex-row items-center gap-1'>
                                                <span className='text-green-500 font-bold text-4xl'>
                                                    {usdtPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                </span>
                                                <span className='text-zinc-500 font-semibold'>
                                                    원
                                                </span>
                                            </div>

                                        </div>
                                    )}
                                </div>

                                {/* 설명 */}
                                {/* 판매가격보다 높은 구매주문이 있을 경우에만 매칭이 됩니다. */}
                                <div className='flex flex-row items-center gap-2'>
                                    <Image
                                        src="/icon-info.png"
                                        alt="Info"
                                        width={16}
                                        height={16}
                                    />
                                    <span className='text-zinc-500 font-semibold'>
                                        판매가격보다 높은 구매주문이 있을 경우에만 매칭이 됩니다.
                                    </span>
                                </div>



                            </div>


                            <div className='w-full flex flex-col items-start gap-2
                                border-t border-b border-gray-300 py-2'>

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
                    </div>
                )}



                <div className='mt-4 flex flex-col gap-2 items-center justify-between border border-gray-300 p-4 rounded-lg'>
                    

                    <div className='w-full flex flex-row gap-2 items-center justify-between'>

                        <div className="flex flex-row items-center gap-2">
                            {/* dot */}
                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                            <span className="text-lg">
                                판매자 정보 수정
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
                                disabled={applying}

                                onClick={() => {
                                    // apply to be a seller
                                    // set seller to true
                                    // set seller to false
                                    // set seller to pending

                                    apply();

                                }}
                                className={`
                                    ${applying ? 'bg-gray-300 text-gray-400' : 'bg-blue-500 text-white'}
                                    w-32
                                    p-2 rounded-lg text-sm font-semibold
                                `}
                            >
                                {Apply}
                            </button>
                        )}

                    </div>

                    {/* 아이디(nickname), 은행명, 계좌번호, 예금주 */}
                    <div className='flex flex-col gap-2 items-start justify-between'>

                        {/* 판매자 이름 (nickname) */}
                        <input
                            disabled={applying}
                            className="p-2 w-64 text-zinc-100 bg-zinc-800 rounded-lg text-lg"
                            placeholder='판매자 이름을 입력하세요.'
                            value={editedNickname}
                            type='text'
                            onChange={(e) => {
                                setEditedNickname(e.target.value);
                            }}
                        />


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
                            <option value="산업은행" selected={bankName === "산업은행"}>
                                산업은행
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

        </main>

    );

}

          
