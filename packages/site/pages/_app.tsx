import React, { useEffect, useState, useContext } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import {
  Web3Provider,
  JsonRpcProvider,
  JsonRpcSigner,
  Provider,
  ExternalProvider,
} from '@ethersproject/providers';
import { AuthType } from '@particle-network/auth-core';
import type { AppProps } from 'next/app';
import { Header } from '../src/components/Header';
import '../styles/globals.css';
import BlockchainContext from '../state/BlockchainContext';
import { SmartAccount } from '@particle-network/aa';
import { ToggleThemeContext } from '../src/Root';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserInfo } from '@particle-network/auth-core';
import {
  getSupportedChains,
  getBaseSepolia,
  getPolygonAmoy,
} from '../src/utils/chainUtils';
import { ConfigContext } from '../state/configContext';
import { Config } from '../state/types';
import { fetchConfig } from '../src/fetchConfig';
import { ThemeProvider } from '../src/components/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const queryClient = new QueryClient();
queryClient.clear();

function MyApp({ Component, pageProps }: AppProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [baseSepolia, setBaseSepolia] = useState<any>(null);
  const [polygonAmoy, setPolygonAmoy] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const fetchedConfig = await fetchConfig();
      setConfig(fetchedConfig);
    })();
  }, []);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [smartAccount, setSmartAccount] = useState<
    SmartAccount | JsonRpcSigner | null
  >(null);
  const [smartAccountProvider, setSmartAccountProvider] =
    useState<Provider | null>(null);
  const [directProvider, setDirectProvider] = useState<JsonRpcProvider | null>(
    null,
  );
  const [connectedChainId, setConnectedChainId] = useState<number | null>(null);
  const [providers, setProviders] = useState<{
    [key: string]: JsonRpcProvider;
  }>({});

  const toggleTheme = useContext(ToggleThemeContext);

  useEffect(() => {
    (async () => {
      const baseSepolia = await getBaseSepolia();
      setBaseSepolia(baseSepolia);
    })();

    (async () => {
      const polygonAmoy = await getPolygonAmoy();
      setPolygonAmoy(polygonAmoy);
    })();
  }, []);

  useEffect(() => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'ServiceWorker registration successful with scope: ',
          registration.scope,
        );
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async (newChainIdHex: string) => {
        const newChainId = Number.parseInt(newChainIdHex, 16);
        setConnectedChainId(newChainId);
        console.log('_app: Connected chainId: ', newChainId);

        const web3Provider = new Web3Provider(
          window.ethereum as unknown as ExternalProvider,
        );
        const signer = web3Provider.getSigner();
        setSmartAccount(signer);
        setSmartAccountProvider(web3Provider);
        setDirectProvider(signer.provider);
      };

      window.ethereum.on('chainChanged', (newChainIdHex: unknown) =>
        handleChainChanged(newChainIdHex as string),
      );

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const supportChains = getSupportedChains();
  // const chainsArray: Chain[] = supportChains;
  // const chains = chainsArray as [Chain, ...Chain[]];

  const DynamicAuthCoreContextProvider = dynamic(
    () =>
      import('@particle-network/authkit').then(
        (mod) => mod.AuthCoreContextProvider,
      ),
    { ssr: false },
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
      <ToastContainer />
    </ThemeProvider>
  );

  if (!config || !baseSepolia || !polygonAmoy) return <div>Loading...</div>;

  const chains: [
    typeof baseSepolia,
    typeof polygonAmoy,
    ...(typeof baseSepolia | typeof polygonAmoy)[],
  ] = [baseSepolia, polygonAmoy];

  return (
    <BlockchainContext.Provider
      value={{
        userInfo,
        setUserInfo,
        smartAccount,
        setSmartAccount,
        providers,
        setProviders,
        directProvider,
        setDirectProvider,
        connectedChainId,
        setConnectedChainId,
        smartAccountProvider,
        setSmartAccountProvider,
      }}
    >
      <RecoilRoot>
        <ConfigContext.Provider value={config}>
          {isParticleEnabled && config && false ? (
            <DynamicAuthCoreContextProvider
              options={{
                projectId: config?.projectId || '',
                clientKey: config?.clientKey || '',
                appId: config?.appId || '',
                chains,
                authTypes: [AuthType.email, AuthType.google, AuthType.apple],
                themeType: 'dark',
                fiatCoin: 'USD',
                language: 'en',
                customStyle: {
                  logo: 'https://xxxx',
                  projectName: 'Fabstir Media Player',
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
                  // customStyle: {
                  //   supportChains,
                  // },
                },
                erc4337: {
                  name: 'BICONOMY',
                  version: '2.0.0',
                },
              }}
            >
              {content}
            </DynamicAuthCoreContextProvider>
          ) : (
            content
          )}
        </ConfigContext.Provider>
      </RecoilRoot>
    </BlockchainContext.Provider>
  );
}

export default MyApp;
