import { Web3Provider } from '@ethersproject/providers';
import { createSmartAccountClient, createBundler } from '@biconomy/account';
import { ParticleNetwork, WalletEntryPosition } from '@particle-network/auth';
import { SmartAccount } from '@particle-network/aa';
import { ParticleProvider } from '@particle-network/provider';
import { createTransak, getTransak, initTransak } from '../hooks/useTransakSDK';
import { getSmartAccountAddress } from './useAccountAbstractionPayment';
import { useContext, useEffect, useRef } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import {
  getChainNameFromChainId,
  getSupportedChains,
  getSupportedChainIds,
} from '../utils/chainUtils';

/* eslint-disable node/no-process-env */

/**
 * This hook is used to manage the authentication state for Particle.
 *
 * @returns {Object} The authentication state and associated actions.
 */
export default function useParticleAuth() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId, setConnectedChainId } = blockchainContext;

  console.log(
    'useParticleAuth: process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET = ',
    process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET,
  );
  if (process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET === 'true')
    return { socialLogin: null };

  const supportChains = getSupportedChains();

  const particle = useRef(
    new ParticleNetwork({
      projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
      clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
      appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
      chainName: getChainNameFromChainId(
        connectedChainId || process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
      ),
      chainId: Number(
        connectedChainId || process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
      ),
      wallet: {
        displayWalletEntry: true,
        defaultWalletEntryPosition: WalletEntryPosition.BR,
        supportChains,
      },
    }),
  ).current;

  const particleProvider = new ParticleProvider(particle.auth);

  console.log({ particleProvider });
  const web3Provider = new Web3Provider(particleProvider, 'any');

  /**
   * Asynchronously creates and sets a Biconomy smart account.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the smart account is successfully created and set.
   * @throws {Error} If there's an error while creating or setting the smart account.
   */
  const createAndSetBiconomySmartAccount = async () => {
    let userInfo;

    const smartAccount = await createSmartAccountClient({
      signer: web3Provider.getSigner(),
      bundler: await createBundler({
        bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
        userOpReceiptMaxDurationIntervals: {
          [Number(
            connectedChainId || process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
          )]: 120000,
        },
      }),
      biconomyPaymasterApiKey:
        process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY, // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
      rpcUrl: process.env.NEXT_PUBLIC_JSONRPC_URL,
      chainId: Number(
        connectedChainId || process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
      ),
      // userOpReceiptMaxDurationIntervals: {
      //   [parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID)]: parseInt(
      //     process.env.NEXT_PUBLIC_BICONOMY_USEROPRECEIPTMAXDURATIONINTERVALS
      //   ),
      // },
    });

    const smartContractAddress = await smartAccount.getAccountAddress();
    console.log('address: ', smartContractAddress);

    const eoaAddress = await particle.auth.getEVMAddress();
    console.log('useParticleAuth: eoaAddress = ', eoaAddress);

    return {
      smartAccount,
      web3Provider,
      userInfo,
      eoaAddress,
    };
  };

  /**
   * Asynchronously creates and sets a Particle smart account.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the smart account is successfully created and set.
   * @throws {Error} If there's an error while creating or setting the smart account.
   */
  const createAndSetParticleSmartAccount = async () => {
    let userInfo;

    const paymasterApiKeys = [];
    const supportedChainIds = getSupportedChainIds();

    for (const chainId of supportedChainIds) {
      paymasterApiKeys.push({
        chainId: chainId,
        // chainName: getChainName(chainId),
        apiKey: process.env.NEXT_PUBLIC_PARTICLE_PAYMASTER_API_KEY,
      });
    }

    const smartAccount = new SmartAccount(particleProvider, {
      projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
      clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
      appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
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

    const result = {
      smartAccount,
      web3Provider,
      userInfo,
      eoaAddress: null,
    };

    return result;
  };

  useEffect(() => {
    const originalOn = particle.auth.on;
    particle.auth.on = function (eventName, listener) {
      console.log(`useParticleAuth: Event "${eventName}" was triggered`);
      originalOn.call(this, eventName, listener);
    };

    const handleChainChanged = async (newChainIdHex) => {
      const newChainId = Number.parseInt(newChainIdHex, 16);
      setConnectedChainId(newChainId);
      console.log('useParticleAuth: Connected chainId: ', newChainId);

      if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Biconomy') {
        return await createAndSetBiconomySmartAccount();
      } else if (
        process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle'
      ) {
        return await createAndSetParticleSmartAccount();
      }
    };

    const handleConnect = (userInfo) => {
      console.log('useParticleAuth: particle userInfo', userInfo);
    };

    const handleDisconnect = () => {
      console.log('useParticleAuth: particle disconnect');
    };

    particle.auth.on('chainChanged', handleChainChanged);
    particle.auth.on('connect', handleConnect);
    particle.auth.on('disconnect', handleDisconnect);

    // particle.switchChain({
    //   name: 'Polygon',
    //   id: 80002,
    // });

    return () => {
      particle.auth.off('chainChanged', handleChainChanged);
      particle.auth.off('connect', handleConnect);
      particle.auth.off('disconnect', handleDisconnect);
      particle.auth.on = originalOn; // Restore the original method
    };
  }, [particle.auth, setConnectedChainId]);

  // Polling mechanism for detecting chain changes
  useEffect(() => {
    let lastChainId = particle.auth.getChainId();

    const interval = setInterval(async () => {
      const currentChainId = await particle.auth.getChainId();
      console.log('useParticleAuth: Polling - currentChainId', currentChainId);
      if (currentChainId !== lastChainId) {
        console.log(
          'useParticleAuth: Polling detected chain change: ',
          currentChainId,
        );
        setConnectedChainId(parseInt(currentChainId, 16));
        lastChainId = currentChainId;
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [particle.auth, setConnectedChainId]);

  const login = async (isFresh = false) => {
    let userInfo;
    const isLoggedIn = particle.auth.isLogin();
    console.log('useParticleAuth: isLoggedIn = ', isLoggedIn);

    if (!isLoggedIn && !isFresh) userInfo = await particle.auth.login();
    else if (isLoggedIn) userInfo = particle.auth.getUserInfo();
    else return null;

    console.log('useParticleAuth: userInfo = ', userInfo);

    particle.auth.on('chainChanged', (chain) => {
      console.log('useParticleAuth: particle chainChanged', chain);
    });

    return userInfo;
  };

  const logout = async () => {
    await particle.auth.logout();
    console.log('logout');
  };

  const socialLogin = async (isFresh = false) => {
    const userInfo = await login(isFresh);
    if (!userInfo)
      return {
        smartAccount: null,
        web3Provider: null,
        userInfo: null,
        eoaAddress: null,
      };

    console.log('Logged in user:', userInfo);

    particle.setAuthTheme({
      uiMode: 'dark',
      displayCloseButton: true,
      displayWallet: true, // display wallet entrance when send transaction.
      modalBorderRadius: 10, // auth & wallet modal border radius. default 10.
    });

    //support languages: en, zh-CN, zh-TW, zh-HK, ja, ko
    particle.setLanguage('en');

    if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native') {
      // do not open account abstraction wallet
      particle.setERC4337(false);
    } else {
      // support fiat coin values: 'USD' | 'CNY' | 'JPY' | 'HKD' | 'INR' | 'KRW'
      particle.setFiatCoin('USD');

      // enable ERC-4337, openWallet will open Account Abstraction Wallet
      particle.setERC4337({
        name: 'BICONOMY',
        version: '2.0.0',
      });
    }

    if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Biconomy') {
      return await createAndSetBiconomySmartAccount();
    } else if (
      process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle'
    ) {
      return await createAndSetParticleSmartAccount();
    } else if (
      process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native'
    ) {
      const signer = web3Provider.getSigner();

      //      if (web3Provider) {
      const eoaAddress = await signer.getAddress();
      //      }

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
