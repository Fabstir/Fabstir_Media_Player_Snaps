import { Web3Provider } from '@ethersproject/providers';

import { ParticleAuthModule, ParticleProvider } from '@biconomy/particle-auth';
import { IBundler, Bundler } from '@biconomy/bundler';
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from '@biconomy/account';
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster';
import { ChainId } from '@biconomy/core-types';

import { createTransak, getTransak, initTransak } from '../hooks/useTransakSDK';

/**
 * Function to fund a Biconomy Smart Account using Transak.
 * It takes the user info and Biconomy Smart Account as arguments and returns a promise that resolves to a Transak object.
 *
 * @async
 * @function
 * @param {ParticleAuthModule.UserInfo} userInfo - The user info object.
 * @param {BiconomySmartAccount} smartAccount - The Biconomy Smart Account object.
 * @returns {Promise<any>} A promise that resolves to a Transak object.
 */
export default function useParticleAuth() {
  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID as string,
    clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY as string,
    appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID as string,
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });

  const bundler: IBundler = new Bundler({
    bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL as string,
    chainId: 80001,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL as string,
  });

  /**
   * Function to log in a user using Particle Auth and return a Biconomy Smart Account, Web3Provider, and user info.
   * It returns a promise that resolves to an object with the Biconomy Smart Account, Web3Provider, and user info.
   *
   * @async
   * @function
   * @returns {Promise<{
   *   biconomySmartAccount: BiconomySmartAccount;
   *   web3Provider: Web3Provider;
   *   userInfo: ParticleAuthModule.UserInfo;
   * }>} A promise that resolves to an object with the Biconomy Smart Account, Web3Provider, and user info.
   */
  const socialLogin = async (): Promise<{
    biconomySmartAccount: BiconomySmartAccount;
    web3Provider: Web3Provider;
    userInfo: ParticleAuthModule.UserInfo;
  }> => {
    const userInfo = await particle.auth.login();
    console.log('Logged in user:', userInfo);
    const particleProvider = new ParticleProvider(particle.auth);
    console.log({ particleProvider });
    const web3Provider = new Web3Provider(particleProvider, 'any');

    console.log('useMintNFT: setSmartAccountProvider(web3Provider);');
    const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
      signer: web3Provider.getSigner(),
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) as ChainId,
      bundler: bundler,
      paymaster: paymaster,
    };

    let biconomySmartAccount = new BiconomySmartAccount(
      biconomySmartAccountConfig,
    );
    biconomySmartAccount = await biconomySmartAccount.init();

    return { biconomySmartAccount, web3Provider, userInfo };
  };

  /**
   * Function to fund a Biconomy Smart Account using Transak.
   * It takes the user info and Biconomy Smart Account as arguments and returns a promise that resolves to a Transak object.
   *
   * @async
   * @function
   * @param {ParticleAuthModule.UserInfo} userInfo - The user info object.
   * @param {BiconomySmartAccount} smartAccount - The Biconomy Smart Account object.
   * @returns {Promise<any>} A promise that resolves to a Transak object.
   */
  const fundYourSmartAccount = async (
    userInfo: ParticleAuthModule.UserInfo,
    smartAccount: BiconomySmartAccount,
  ): Promise<any> => {
    try {
      const biconomySmartAccount = smartAccount;
      if (!biconomySmartAccount)
        throw new Error('biconomySmartAccount is undefined');

      const smartAccountAddress =
        await biconomySmartAccount.getSmartAccountAddress();

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
        'useMintNFT: handleFundYourSmartAccount: error received ',
        error,
      );
    }
  };

  return {
    socialLogin,
    fundYourSmartAccount,
  };
}
