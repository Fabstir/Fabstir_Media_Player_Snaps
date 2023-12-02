import React, { useEffect } from 'react';
import Head from 'next/head';

import type { AppProps } from 'next/app';
import { useContext, useState } from 'react';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import '../styles/globals.css';
import { JsonRpcProvider, Provider } from '@ethersproject/providers';
import BlockchainContext from '../state/BlockchainContext';

import { ToggleThemeContext } from '../src/Root';
import { RecoilRoot } from 'recoil';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useParticleAuth from '../src/blockchain/useParticleAuth';
import { BiconomySmartAccount } from '@biconomy/account';
<<<<<<< HEAD
=======
import { Web3Provider } from '@ethersproject/providers';
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
import { ParticleAuthModule } from '@biconomy/particle-auth';

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_PROVIDER);

// Create a client
export const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [userInfo, setUserInfo] = useState<ParticleAuthModule.UserInfo | null>(
    null,
  );
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null,
  );
  const [smartAccountProvider, setSmartAccountProvider] =
<<<<<<< HEAD
    useState<Provider | null>(null);
=======
    useState<Web3Provider | null>(null);
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082

  const { socialLogin } = useParticleAuth();

  const toggleTheme = useContext(ToggleThemeContext);

  // Add event listener when component mounts
  useEffect(() => {
    const initialiseSmartAccount = async () => {
<<<<<<< HEAD
      if (!(smartAccount && smartAccountProvider && userInfo)) {
        const { biconomySmartAccount, web3Provider, userInfo } =
          await socialLogin(true);

        if (web3Provider) {
          setSmartAccount(biconomySmartAccount);
          setSmartAccountProvider(web3Provider);
          setUserInfo(userInfo);
        }
=======
      if (
        !(smartAccount && smartAccountProvider && userInfo) &&
        setSmartAccount &&
        setSmartAccountProvider &&
        setUserInfo
      ) {
        const { biconomySmartAccount, web3Provider, userInfo } =
          await socialLogin(true);

        setSmartAccount(biconomySmartAccount);
        setSmartAccountProvider(web3Provider);
        setUserInfo(userInfo);
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
      }
    };

    initialiseSmartAccount();
  }, []);

  useEffect(() => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (registration) {
        console.log(
          'ServiceWorker registration successful with scope: ',
          registration.scope,
        );
      })
      .catch(function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  }, []);

  return (
    <BlockchainContext.Provider
      value={{
        provider,
<<<<<<< HEAD
=======
        signerAdmin,
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
        userInfo,
        setUserInfo,
        smartAccount,
        setSmartAccount,
        smartAccountProvider,
        setSmartAccountProvider,
      }}
    >
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <Head>
            <title>Web3 Media Player</title>{' '}
          </Head>
          <div className="flex flex-col w-full min-h-screen max-w-full">
            <Header handleToggleClick={toggleTheme} />
            <Component {...pageProps} />
            <Footer />
          </div>
        </QueryClientProvider>
      </RecoilRoot>
    </BlockchainContext.Provider>
  );
}

export default MyApp;
