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
import { BiconomySmartAccountV2 } from '@biconomy/account';
import { ParticleAuthModule } from '@biconomy/particle-auth';

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_PROVIDER);

// Create a client
export const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [userInfo, setUserInfo] = useState<ParticleAuthModule.UserInfo | null>(
    null,
  );
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [smartAccountProvider, setSmartAccountProvider] =
    useState<Provider | null>(null);

  const { socialLogin } = useParticleAuth();

  const toggleTheme = useContext(ToggleThemeContext);

  // Add event listener when component mounts
  useEffect(() => {
    const initialiseSmartAccount = async () => {
      if (!(smartAccount && smartAccountProvider && userInfo)) {
        const { biconomySmartAccount, web3Provider, userInfo } =
          await socialLogin(true);

        if (web3Provider) {
          setSmartAccount(biconomySmartAccount);
          setSmartAccountProvider(web3Provider);
          setUserInfo(userInfo);
        }
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
          <div className="flex flex-col w-full min-h-screen max-w-6xl mx-auto">
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
