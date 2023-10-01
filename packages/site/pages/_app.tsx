import React, { useEffect } from 'react';

import type { AppProps } from 'next/app';
import { useContext, useState } from 'react';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import '../styles/globals.css';
import { JsonRpcProvider } from '@ethersproject/providers';
import BlockchainContext from '../state/BlockchainContext';

import { ToggleThemeContext } from '../src/Root';
import { RecoilRoot } from 'recoil';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_PROVIDER);
const signerAdmin = provider.getSigner(0);

// Create a client
export const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [smartAccount, setSmartAccount] = useState(null);
  const [smartAccountProvider, setSmartAccountProvider] = useState(null);

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

  return (
    <BlockchainContext.Provider
      value={{
        provider,
        signerAdmin,
        smartAccount,
        setSmartAccount,
        smartAccountProvider,
        setSmartAccountProvider,
      }}
    >
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
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
