import { BrowserProvider } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

import {
  useEthereum,
  useConnect,
  useAuthCore,
} from '@particle-network/authkit';

import {
  AAWrapProvider,
  SendTransactionMode,
  SmartAccount,
} from '@particle-network/aa';
import { createTransak, getTransak, initTransak } from '../hooks/useTransakSDK';
import { getSmartAccountAddress } from './useAccountAbstractionPayment';
import { useContext, useEffect, useRef } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { getSupportedChainIds } from '../utils/chainUtils';
import { process_env } from '../utils/process_env';
import useContractUtils from './useContractUtils';
import { useConfig } from '../../state/configContext';
import { fetchConfig } from '../fetchConfig';
import { chain } from 'lodash';

/* eslint-disable node/no-process-env */

/**
 * This hook is used to manage the authentication state for Particle.
 *
 * @returns {Object} The authentication state and associated actions.
 */
export default function useParticleAuth() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId, setConnectedChainId } = blockchainContext;

  const config = useConfig();

  console.log(
    'useParticleAuth: process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET = ',
    process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET,
  );
  if (process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET === 'true')
    return { socialLogin: null };

  const { provider: particleProvider, switchChain } = useEthereum();
  const { connect, disconnect, connected } = useConnect();
  const {
    userInfo,
    login: particleLogin,
    logout: particleLogout,
  } = useAuthCore();

  const { getChainInfoFromChainId } = useContractUtils();

  console.log({ particleProvider });

  /**
   * Handles the event when the blockchain network chain has changed.
   *
   * @async
   * @function
   * @param {string} newChainIdHex - The new chain ID in hexadecimal format.
   * @returns {Promise<void>|Promise<Object>} A Promise that resolves when the chain change process is complete. If the default AA payment network is 'Particle', it returns a Promise that resolves with the newly created Particle smart account.
   */
  const handleChainChanged = async (newChainIdHex) => {
    const newChainId = Number.parseInt(newChainIdHex, 16);

    if (connectedChainId === newChainId) return;

    setConnectedChainId(newChainId);
    console.log('useParticleAuth: Connected chain: ', newChainId);
    if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle') {
      return await createAndSetParticleSmartAccount();
    }
  };

  particleProvider.on('chainChanged', handleChainChanged);

  /**
   * Asynchronously creates and sets a Particle smart account.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the smart account is successfully created and set.
   * @throws {Error} If there's an error while creating or setting the smart account.
   */
  const createAndSetParticleSmartAccount = async () => {
    const paymasterApiKeys = [];
    const supportedChainIds = getSupportedChainIds();

    for (const chainId of supportedChainIds) {
      console.log(
        'createAndSetParticleSmartAccount: Fetching config for chainId:',
        chainId,
      ); // Log the chainId
      const config = await fetchConfig(chainId);
      console.log('createAndSetParticleSmartAccount: Fetched config:', config);

      paymasterApiKeys.push({
        chainId: chainId,
        apiKey: config.apiKey,
      });
    }

    const smartAccount = new SmartAccount(particleProvider, {
      projectId: config.projectId,
      clientKey: config.clientKey,
      appId: config.appId,
      aaOptions: {
        accountContracts: {
          BICONOMY: [
            {
              version: '2.0.0',
              chainIds: supportedChainIds,
            },
          ],
        },
        paymasterApiKeys,
      },
    });

    // set current smart account contract
    smartAccount.setSmartAccountContract({
      name: 'BICONOMY',
      version: '2.0.0',
    });

    const customProvider = new Web3Provider(
      new AAWrapProvider(smartAccount, SendTransactionMode.Gasless),
      'any',
    );

    const result = {
      smartAccount,
      web3Provider: customProvider,
      userInfo,
      directProvider: new Web3Provider(particleProvider),
      eoaAddress: smartAccount.provider.selectedAddress,
    };

    return result;
  };

  /**
   * Logs the user in by connecting to the blockchain network.
   *
   * @async
   * @function
   * @param {boolean} [isFresh=false] - A flag indicating whether this is a fresh login.
   * @returns {Promise<Object>|undefined} A Promise that resolves with the user info object if the login is successful. If the user is already logged in, it returns the existing user info. If an error occurs during the login process, it returns undefined.
   */
  const login = async (isFresh = false) => {
    if (!userInfo || !connected) {
      try {
        const chainInfo = getChainInfoFromChainId(
          connectedChainId || Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID),
        );
        console.log('useParticleAuth: chainInfo = ', chainInfo);
        console.log('useParticleAuth: chainInfo = ', chainInfo);

        const newUserInfo = await connect({});

        // const newUserInfo = await connect({
        //   email: '',
        //   code: '',
        //   chain: chainInfo,
        // });

        console.log('useParticleAuth: chainInfo = ', chainInfo);
        console.log('useParticleAuth: chainInfo = ', chainInfo);

        await switchChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID));
        return newUserInfo;
      } catch (error) {
        console.error(error.message);
      }
    }

    await switchChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID));

    return userInfo;
  };

  /**
   * Logs the user out by disconnecting from the blockchain network.
   *
   * @async
   * @function
   * @returns {Promise<void>} A Promise that resolves when the logout process is complete.
   */
  const logout = async () => {
    await disconnect();
    console.log('logout');
  };

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
    if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle') {
      const userInfo = await login(isFresh);
      if (!userInfo)
        return {
          smartAccount: null,
          web3Provider: null,
          userInfo: null,
          eoaAddress: null,
        };

      return await createAndSetParticleSmartAccount();
    } else if (
      process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native'
    ) {
      const signer = web3Provider.getSigner();

      const eoaAddress = await signer.getAddress();

      console.log('useParticleAuth: eoaAddress = ', eoaAddress);

      return {
        smartAccount: signer,
        web3Provider,
        userInfo,
        eoaAddress,
      };
    } else
      throw new Error(
        'useParticleAuth: process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK is not valid',
      );
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
        'useParticleAuth: handleFundYourSmartAccount: error received ',
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
