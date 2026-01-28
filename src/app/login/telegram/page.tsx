"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useConnect } from "thirdweb/react";
import { useRouter } from "next/navigation";

//import { client, wallet } from "../../constants";


import { client } from "../../client";



import Image from 'next/image';


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
import { useClientWallets } from "@/lib/useClientWallets";
function TelegramLoginContent() {
    const searchParams = useSearchParams();
    const { wallet } = useClientWallets();

    //console.log('Search params:', searchParams);



    const { connect } = useConnect();
    const router = useRouter();


    //const [params, setParams] = useState({ signature: '', message: '', center: '', referralCode: '', path: '' });



    /*
      const urlPayment = `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?signature=${authCode}&message=${encodeURI(message)}`
  + `&storecode=${storecode}&storeUser=${encodeURI(userNickname)}&depositName=${encodeURI(depositName)}&depositBankName=${encodeURI(depositBankName)}&depositBankAccountNumber=${depositBankAccountNumber}&depositAmountKrw=${depositAmountKrw}`
  + `&telegramId=${telegramId}&path=${path}`;
    */

    const [params, setParams] = useState({
        signature: '',
        message: '',
        storecode: '',
        storeUser: '',
        depositName: '',
        depositBankName: '',
        depositBankAccountNumber: '',
        depositAmountKrw: '',
        center: '',
        referralCode: '',
        path: ''
    });



    useEffect(() => {
        /*
        const signature = searchParams.get('signature') || '';
        const message = searchParams.get('message') || '';
        const center = searchParams.get('center') || '';
        const path = searchParams.get('path') || '';
        const referralCode = searchParams.get('referralCode') || '';
        setParams({ signature, message, center, referralCode, path });
        */

        const signature = searchParams.get('signature') || '';
        const message = searchParams.get('message') || '';
        const storecode = searchParams.get('storecode') || '';
        const storeUser = searchParams.get('storeUser') || '';
        const depositName = searchParams.get('depositName') || '';
        const depositBankName = searchParams.get('depositBankName') || '';
        const depositBankAccountNumber = searchParams.get('depositBankAccountNumber') || '';
        const depositAmountKrw = searchParams.get('depositAmountKrw') || '';
        const center = searchParams.get('center') || '';
        const referralCode = searchParams.get('referralCode') || '';
        const path = searchParams.get('path') || '/';
        setParams({ signature, message, storecode, storeUser, depositName, depositBankName, depositBankAccountNumber, depositAmountKrw, center, referralCode, path });

        //console.log('SearchParams:', { signature, message, center });

    }, [searchParams]);
 

    //console.log('params.signature=', params.signature);
    //console.log('params.message=', params.message);
    //console.log('params.storecode=', params.storecode);
    //console.log('params.storeUser=', params.storeUser);
    //console.log('params.depositName=', params.depositName);
    //console.log('params.depositBankName=', params.depositBankName);
    //console.log('params.depositBankAccountNumber=', params.depositBankAccountNumber);
    //console.log('params.depositAmountKrw=', params.depositAmountKrw);
    //console.log('params.center=', params.center);
    //console.log('params.referralCode=', params.referralCode);
    //console.log('params.path=', params.path);





    useQuery({
        queryKey: ["telegram-login", params.signature, params.message],
        queryFn: async () => {
            if (!params.signature || !params.message) {
                console.error('Missing signature or message');
                return false;
            }
            try {

                await connect(async () => {
                    await wallet.connect({
                        client,
                        strategy: "auth_endpoint",
                        payload: JSON.stringify({
                            signature: params.signature,
                            message: params.message,
                        }),
                        encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE as string,
                    });
                    return wallet;
                });

                /*
                  const message = JSON.stringify({
                        username,
                        expiration,
                    });
                */
                // username form message

                const { username } = JSON.parse(params.message);

                console.log('Telegram username:', username);



                //router.replace("/?center=" + params.center + "&telegramId=" + username);

                //router.replace(params.path + "?center=" + params.center + "&telegramId=" + username + "&referralCode=" + params.referralCode);

                router.replace(params.path +
                    `?center=${params.center}&telegramId=${username}&referralCode=${params.referralCode}`
                    +
                    `&storecode=${params.storecode}&storeUser=${encodeURIComponent(params.storeUser)}&depositName=${encodeURIComponent(params.depositName)}&depositBankName=${encodeURIComponent(params.depositBankName)}&depositBankAccountNumber=${params.depositBankAccountNumber}&depositAmountKrw=${params.depositAmountKrw}`
                );


                return true;

            } catch (error) {
                console.error('Connection error:', error);
                return false;
            }
        },
        enabled: !!params.signature && !!params.message,
    });



    //console.log('Query result:', queryResult);
    return (
        <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center
        bg-black text-white">
            
            {/*
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            */}

            <div className="flex flex-col gap-2 items-center justify-center">
                <div className="text-lg font-semibold">
                    텔레그램 지갑 연결 중...
                </div>
                <Image
                    src="/connecting.gif"
                    width={300}
                    height={300}
                    alt="Connecting..."
                />
            </div>
        </div>
    );
}




export default function TelegramLogin() {
    return (
        <Suspense fallback={<div>Loading............</div>}>
            <TelegramLoginContent />
        </Suspense>
    );
}
