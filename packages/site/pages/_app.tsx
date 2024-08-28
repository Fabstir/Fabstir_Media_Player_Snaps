import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

import Head from 'next/head';
import { Web3Provider } from '@ethersproject/providers';
import { AuthType } from '@particle-network/auth-core';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';

import type { AppProps } from 'next/app';
import { useContext, useState } from 'react';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import '../styles/globals.css';
import { JsonRpcProvider, Provider } from '@ethersproject/providers';
import BlockchainContext from '../state/BlockchainContext';
import { SmartAccount } from '@particle-network/aa';
import { ToggleThemeContext } from '../src/Root';
import { RecoilRoot } from 'recoil';
import { JsonRpcSigner } from '@ethersproject/providers';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import useParticleAuth from '../src/blockchain/useParticleAuth';
import { ParticleAuthModule } from '@biconomy/particle-auth';
import { getConnectedChainId } from '../src/utils/chainUtils';
import { process_env } from '../src/utils/process_env';
import {
  getChainNameFromChainId,
  getSupportedChains,
  getSupportedChainIds,
} from '../src/utils/chainUtils';

// Import the ParticleAuth type
import { ParticleAuth } from '../types';
import { ThemeProvider } from '../src/components/ThemeContext';

// Create a client
export const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [userInfo, setUserInfo] = useState<ParticleAuthModule.UserInfo | null>(
    null,
  );
  const [smartAccount, setSmartAccount] = useState<
    SmartAccount | JsonRpcSigner | null
  >(null);
  const [smartAccountProvider, setSmartAccountProvider] =
    useState<Provider | null>(null);
  const [connectedChainId, setConnectedChainId] = useState<number | null>(null);
  const [providers, setProviders] = useState<{
    [key: string]: JsonRpcProvider;
  }>({});

  // const { socialLogin } = useParticleAuth() as ParticleAuth;

  const toggleTheme = useContext(ToggleThemeContext);

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

  function getRpcProviders() {
    const rpcProviders: { [key: string]: JsonRpcProvider } = {};

    for (const [key, value] of Object.entries(process_env)) {
      if (key.startsWith('NEXT_PUBLIC_RPC_PROVIDER_')) {
        const chainId = Number(key.split('_').pop());

        if (chainId !== undefined && !isNaN(chainId) && value !== undefined) {
          rpcProviders[chainId] = new JsonRpcProvider(value);
        }
      }
    }

    return rpcProviders;
  }

  useEffect(() => {
    const rpcProviders = getRpcProviders();
    setProviders(rpcProviders);

    if (
      // process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET === 'true' &&
      window.ethereum
    ) {
      const handleChainChanged = async (newChainIdHex: string) => {
        const newChainId = Number.parseInt(newChainIdHex, 16);
        setConnectedChainId(newChainId);
        console.log('_app: Connected chainId: ', newChainId);

        const web3Provider = new Web3Provider(window.ethereum);
        const smartAccount = web3Provider.getSigner();
        setSmartAccount(smartAccount);
        setSmartAccountProvider(web3Provider);
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      // Return a cleanup function that removes the event listener
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const supportChains = getSupportedChains();

  const DynamicAuthCoreContextProvider = dynamic(
    () =>
      import('@particle-network/auth-core-modal').then(
        (mod) => mod.AuthCoreContextProvider,
      ),
    { ssr: false }, // This will load the component only on client side
  );

  const isParticleEnabled =
    process.env.NEXT_PUBLIC_IS_PARTICLE_ENABLED === 'true';

  const content = (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>Web3 Media Player</title>
        </Head>
        <div className="flex flex-col w-full min-h-screen max-w-full">
          <Header handleToggleClick={toggleTheme} />
          <Component {...pageProps} />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );

  return (
    <BlockchainContext.Provider
      value={{
        userInfo,
        setUserInfo,
        smartAccount,
        setSmartAccount,
        providers,
        setProviders,
        connectedChainId,
        setConnectedChainId,
        smartAccountProvider,
        setSmartAccountProvider,
      }}
    >
      <RecoilRoot>
        {isParticleEnabled ? (
          <DynamicAuthCoreContextProvider
            options={{
              projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID || '',
              clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY || '',
              appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID || '',
              erc4337: {
                name: 'BICONOMY',
                version: '2.0.0',
              },
              authTypes: [AuthType.email, AuthType.google, AuthType.apple],
              themeType: 'dark', // light or dark
              fiatCoin: 'USD',
              language: 'en',
              customStyle: {
                logo: 'https://xxxx', // image url
                projectName: 'xxx',
                modalBorderRadius: 10,
                theme: {
                  light: {
                    textColor: '#000',
                  },
                  dark: {
                    textColor: '#fff',
                  },
                },
              },
              wallet: {
                visible: true,
                customStyle: {
                  supportChains,
                },
              },
            }}
          >
            {content}
          </DynamicAuthCoreContextProvider>
        ) : (
          content
        )}
      </RecoilRoot>
    </BlockchainContext.Provider>
  );
}

export default MyApp;
