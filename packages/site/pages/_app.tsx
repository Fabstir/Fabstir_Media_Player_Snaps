import React, { useEffect } from 'react';

import type { AppProps } from 'next/app';
import { useContext } from 'react';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import '../styles/globals.css';
import { ethers } from 'ethers';
//import { JsonRpcProvider } from 'ethers/providers';
import BlockchainContext from '../state/BlockchainContext';

import { ToggleThemeContext } from '../src/Root';
import { RecoilRoot } from 'recoil';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const toggleTheme = useContext(ToggleThemeContext);
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');

  // useEffect(() => {
  //   if ('serviceWorker' in navigator) {
  //     console.log('MyApp: userEffect');
  //     window.addEventListener('load', function () {
  //       console.log('MyApp: before navigator.serviceWorker.register');
  //       navigator.serviceWorker.register('/sw.js').then(
  //         function (registration) {
  //           console.log(
  //             'MyApp: ServiceWorker registration successful with scope: ',
  //             registration.scope,
  //           );
  //         },
  //         function (err) {
  //           console.log('MyApp: ServiceWorker registration failed: ', err);
  //         },
  //       );
  //     });
  //   }
  // }, []);

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
    <BlockchainContext.Provider value={{ provider }}>
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
