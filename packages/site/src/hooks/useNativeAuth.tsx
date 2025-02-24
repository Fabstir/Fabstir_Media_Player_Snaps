import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import useContractUtils from '../blockchain/useContractUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { getConnectedChainId } from '../utils/chainUtils';
import { createEOAAccount } from '../utils/eoaUtils';
import { useConfig } from '../../state/configContext';

export default function useNativeAuth() {
  const blockchainContext = useContext(BlockchainContext);
  const {
    smartAccountProvider,
    setSmartAccountProvider,
    setDirectProvider,
    smartAccount,
    setSmartAccount,
    connectedChainId,
    setConnectedChainId,
  } = blockchainContext;

  const { getProviderFromChainId } = useContractUtils();
  const config = useConfig();

  /**
   * Logs in the user natively. If the environment variable `NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED` is set to 'true',
   * it uses a sponsored account. Otherwise, it creates an externally owned account (EOA).
   *
   * @async
   * @returns {Promise<string>} A promise that resolves to the user's account address.
   * @throws {Error} If there's no connected chain ID or if the creation of the EOA account fails.
   */
  const loginNative = async () => {
    let userAccountAddress: string;

    if (process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED === 'true') {
      const wallet = new ethers.Wallet(
        config.sponsoredAccountPrivateKey as string,
      );

      if (!connectedChainId)
        throw new Error('index: connect: No connected chain id');

      const directProvider = getProviderFromChainId(connectedChainId);
      const signer = wallet.connect(directProvider);
      setSmartAccount(signer as any);
      setSmartAccountProvider(signer as any);

      setDirectProvider(directProvider as any);

      userAccountAddress = await signer.getAddress();

      const chainId = await getConnectedChainId(signer);
      setConnectedChainId(chainId);
    } else {
      const result: any = await createEOAAccount();
      console.log('_app: result=', result);

      if (!result.smartAccount || !result.web3Provider || !result.eoaAddress)
        throw new Error('index: connect: createEOAAccount failed');

      setSmartAccount(result.smartAccount);
      setSmartAccountProvider(result.web3Provider);
      setDirectProvider(result.web3Provider);

      userAccountAddress = result.eoaAddress;

      const chainId = await getConnectedChainId(result.smartAccount);
      setConnectedChainId(chainId);
    }

    return userAccountAddress;
  };

  return { loginNative };
}
