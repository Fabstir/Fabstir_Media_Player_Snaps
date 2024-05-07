import { Web3Provider } from '@ethersproject/providers';
import { createSmartAccountClient, createBundler } from '@biconomy/account';
import {
  ParticleAuthModule,
  ParticleProvider,
} from '@biconomy-devx/particle-auth';

import { SmartAccount } from '@particle-network/aa';
import { createTransak, getTransak, initTransak } from '../hooks/useTransakSDK';
import { getSmartAccountAddress } from './useAccountAbstractionPayment';
/* eslint-disable no-process-env */

export default function useParticleAuth() {
  console.log(
    'useParticleAuth: process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET = ',
    process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET,
  );
  if (process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET === 'true')
    return { socialLogin: null };

  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
    clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
    appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
    chainName: 'base',
    chainId: 84532,
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });

  const login = async (isFresh = false) => {
    let userInfo;
    const isLoggedIn = particle.auth.isLogin();
    console.log('useParticleAuth: isLoggedIn = ', isLoggedIn);

    if (!isLoggedIn && !isFresh) userInfo = await particle.auth.login();
    else if (isLoggedIn) userInfo = particle.auth.getUserInfo();
    else return null;

    console.log('useParticleAuth: userInfo = ', userInfo);

    return userInfo;
  };

  const logout = async () => {
    await particle.auth.logout();
    console.log('logout');
  };

  const socialLogin = async (isFresh = false) => {
    const userInfo = await login(isFresh);
    if (!userInfo)
      return { smartAccount: null, web3Provider: null, userInfo: null };

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

    const particleProvider = new ParticleProvider(particle.auth);

    console.log({ particleProvider });
    const web3Provider = new Web3Provider(particleProvider, 'any');

    // const module = await ECDSAOwnershipValidationModule.create({
    //   signer: signer, // you will need to supply a signer from an EOA in this step
    //   moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
    // })

    if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Biconomy') {
      const smartAccount = await createSmartAccountClient({
        signer: web3Provider.getSigner(),
        bundler: await createBundler({
          bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
          userOpReceiptMaxDurationIntervals: { 84532: 120000 },
        }),
        biconomyPaymasterApiKey:
          process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY, // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
        rpcUrl: process.env.NEXT_PUBLIC_JSONRPC_URL,
        chainId: 84532,
        // userOpReceiptMaxDurationIntervals: {
        //   [parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)]: parseInt(
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
    } else if (
      process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle'
    ) {
      const smartAccount = new SmartAccount(particleProvider, {
        projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
        clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
        appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
        aaOptions: {
          accountContracts: {
            // 'BICONOMY', 'CYBERCONNECT', 'SIMPLE' is supported now.
            BICONOMY: [
              {
                version: '2.0.0',
                chainIds: [84532],
              },
            ],
          },
          paymasterApiKeys: [
            {
              chainId: 84532,
              apiKey: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY,
            },
          ],
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
      };

      return result;
    } else if (
      process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native'
    ) {
      // const web3Provider = new ethers.providers.Web3Provider(
      //   particleProvider,
      //   'any',
      // );
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
