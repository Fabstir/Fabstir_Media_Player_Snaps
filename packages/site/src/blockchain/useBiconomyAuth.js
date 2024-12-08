import { BrowserProvider } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

import {
  AAWrapProvider,
  SendTransactionMode,
  SmartAccount,
} from '@particle-network/aa';
import { createSmartAccountClient, createBundler } from '@biconomy/account';
import { createTransak, getTransak, initTransak } from '../hooks/useTransakSDK';
import { getSmartAccountAddress } from './useAccountAbstractionPayment';
import { useContext, useEffect, useRef, useState } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { getSupportedChainIds, getSupportedChains } from '../utils/chainUtils';
import useContractUtils from './useContractUtils';
import { useConfig } from '../../state/configContext';
import { fetchConfig } from '../fetchConfig';
import { ParticleAuthModule, ParticleProvider } from '@biconomy/particle-auth';
import { ThemeContext } from '../components/ThemeContext';

/* eslint-disable node/no-process-env */

/**
 * This hook is used to manage the authentication state using Biconomy SDK.
 *
 * @returns {Object} The authentication state and associated actions.
 */
export default function useBiconomyAuth() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId, setConnectedChainId, userInfo, setUserInfo } =
    blockchainContext;

  const { theme, setTheme } = useContext(ThemeContext);

  const particle = useRef(null);

  console.log(
    'useBiconomyAuth: process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET = ',
    process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET,
  );
  if (process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET === 'true')
    return { socialLogin: null };

  const { getChainInfoFromChainId } = useContractUtils();

  /**
   * Creates and sets up a Biconomy smart account.
   *
   * @async
   * @function createAndSetBiconomySmartAccount
   * @param {Object} config - The configuration object containing necessary parameters.
   * @param {Object} userInfo - The user information object.
   * @returns {Promise<Object>} A promise that resolves to an object containing the smart account, web3 provider, direct provider, user information, and EOA address.
   * @throws {Error} If there is an error creating or setting up the smart account.
   */
  const createAndSetBiconomySmartAccount = async (config, userInfo) => {
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 1');
    const supportedChains = getSupportedChains();
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 2');
    if (!supportedChains || supportedChains.length === 0)
      throw new Error('useBiconomyAuth: supportedChains is empty');

    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 4');
    if (
      supportedChains[0].id !== Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID)
    )
      throw new Error(
        'useBiconomyAuth: supportedChains[0].id must be default chain',
      );
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 4');

    const chainId =
      connectedChainId || Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID);
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 5');

    const particleProvider = new ParticleProvider(particle.current.auth);
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 6');

    console.log({ particleProvider });
    const web3Provider = new Web3Provider(particleProvider, 'any');
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 7');

    const signer = web3Provider.getSigner();
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 8');
    const smartAccount = await createSmartAccountClient({
      signer,
      bundler: await createBundler({
        bundlerUrl: config.biconomyBundlerUrl,
        userOpReceiptMaxDurationIntervals: { 84532: 120000 },
      }),
      biconomyPaymasterApiKey: config.biconomyPaymasterApiKey, // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
      rpcUrl: config.rpcProvider,
      chainId,
    });
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 9');
    console.log(
      'createAndSetBiconomySmartAccount: smartAccount = ',
      smartAccount,
    );

    const smartContractAddress = await smartAccount.getAccountAddress();
    console.log('address: ', smartContractAddress);
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 10');

    const eoaAddress = await particle.current.auth.getEVMAddress();
    console.log('useBiconomyAuth: createAndSetBiconomySmartAccount: 11');
    console.log('useBiconomyAuth: eoaAddress = ', eoaAddress);

    return {
      smartAccount,
      web3Provider,
      directProvider: new Web3Provider(particleProvider),
      userInfo,
      eoaAddress,
    };
  };

  useEffect(() => {
    (async () => {
      await initializeParticle();
    })();
  }, []);

  /**
   * Logs the user out by disconnecting from the blockchain network.
   *
   * @async
   * @function
   * @returns {Promise<void>} A Promise that resolves when the logout process is complete.
   */
  const logout = async () => {
    await particle.current.auth.logout();
  };

  /**
   * Initializes the Particle Network instance.
   *
   * @async
   * @function initializeParticle
   * @returns {Promise<void>} A promise that resolves when the Particle Network instance is initialized.
   * @throws {Error} If there is an error during initialization.
   */
  const initializeParticle = async () => {
    const supportedChains = getSupportedChains();
    const chainId = supportedChains[0].id;
    const config = await fetchConfig(chainId);

    particle.current = new ParticleAuthModule.ParticleNetwork({
      projectId: config.projectId,
      clientKey: config.clientKey,
      appId: config.appId,
      chainName: supportedChains[0].name,
      chainId,
      wallet: {
        displayWalletEntry: true,
        defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
      },
    });

    particle.current?.setAuthTheme({
      uiMode: theme,
      displayCloseButton: true,
      displayWallet: true, // display wallet entrance when send transaction.
      modalBorderRadius: 10, // auth & wallet modal border radius. default 10.
    });

    particle.current?.setERC4337({
      name: 'BICONOMY',
      version: '2.0.0',
    });

    // Check if user is already logged in
    const isLoggedIn = await particle.current.auth?.isLogin();
    if (isLoggedIn) {
      const storedUserInfo = await particle.current.auth.getUserInfo();
      setUserInfo(storedUserInfo);
    }
  };

  /**
   * Logs the user in using the Particle Network.
   *
   * @async
   * @function login
   * @param {boolean} [isFresh=false] - Indicates whether to perform a fresh login.
   * @returns {Promise<Object>} A promise that resolves to the updated user information.
   * @throws {Error} If there is an error during the login process.
   */
  const login = async (isFresh = false) => {
    const supportedChains = getSupportedChains();
    const chainId = supportedChains[0].id;
    const config = await fetchConfig(chainId);
    console.log('socialLogin: Fetched config:', config);

    // const isLoggedIn = particle?.auth?.isLogin();
    let updatedUserInfo = null;

    await initializeParticle();

    const isLoggedIn = await particle.current.auth?.isLogin();
    if (!isLoggedIn) {
      updatedUserInfo = await particle.current.auth.login(); // Trigger Biconomy's Particle login modal
      setUserInfo(updatedUserInfo);
      return updatedUserInfo;
    }

    return userInfo;
  };

  useEffect(() => {
    particle.current?.setAuthTheme({
      uiMode: theme,
      displayCloseButton: true,
      displayWallet: true, // display wallet entrance when send transaction.
      modalBorderRadius: 10, // auth & wallet modal border radius. default 10.
    });
  }, [theme]);

  /**
   * Handles social login for the application.
   *
   * @async
   * @function socialLogin
   * @param {boolean} [isFresh=false] - Indicates whether this is a fresh login attempt.
   * @returns {Promise<void>} A promise that resolves when the login process is complete.
   * @throws {Error} If the login process fails.
   */
  const socialLogin = async (isFresh = false) => {
    console.log('useBiconomyAuth: socialLogin: 1');
    const supportedChains = getSupportedChains();
    console.log('useBiconomyAuth: socialLogin: 2');

    const chainId = supportedChains[0].id;
    console.log('useBiconomyAuth: socialLogin: 3');
    const config = await fetchConfig(chainId);
    console.log('useBiconomyAuth: socialLogin: 4');
    console.log('socialLogin: Fetched config:', config);

    const userInfo = await login(isFresh);
    console.log('useBiconomyAuth: socialLogin: 5');

    if (!userInfo) {
      return {
        smartAccount: null,
        web3Provider: null,
        userInfo: null,
        eoaAddress: null,
      };
    }
    console.log('useBiconomyAuth: socialLogin: 6');

    return await createAndSetBiconomySmartAccount(config, userInfo);
  };

  const fundYourSmartAccount = async (userInfo, smartAccount) => {
    try {
      if (!smartAccount) throw new Error('smartAccount is undefined');

      const smartAccountAddress = await getSmartAccountAddress(smartAccount);

      const transakData = {
        walletAddress: smartAccountAddress,
        firstName: userInfo?.name || '',
        email: userInfo?.email || '',
      };

      const transakObject = createTransak('STAGING', transakData);

      initTransak(transakObject);

      const transak = getTransak(transakObject);
      return transak;
    } catch (error) {
      throw new Error(
        'useBiconomyAuth: handleFundYourSmartAccount: error received ',
        error,
      );
    }
  };

  return {
    socialLogin,
    fundYourSmartAccount,
    logout,
  };
}
