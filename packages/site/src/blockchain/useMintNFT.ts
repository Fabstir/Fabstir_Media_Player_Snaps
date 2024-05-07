import { ethers } from 'ethers';

import { Contract, ContractFactory } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import { JsonRpcProvider } from '@ethersproject/providers';

import { useContext } from 'react';
import IERC165 from '../../contracts/IERC165.json';
import TipERC721 from '../../contracts/TipERC721.json';
import { getSmartAccountAddress } from './useAccountAbstractionPayment';

import BlockchainContext, {
  BlockchainContextType,
} from '../../state/BlockchainContext';

import usePortal from '../hooks/usePortal';

import useAccountAbstractionPayment from './useAccountAbstractionPayment';

const erc721InterfaceId = 0x80ac58cd;

type NFT = {
  name?: string;
  symbol?: string;
  supply?: string;
  [key: string]: any;
};

type MintNFTResponse = {
  address: string;
  id: string;
  uri: string;
};

export default function useMintNFT() {
  const blockchainContext =
    useContext<BlockchainContextType>(BlockchainContext);
  const { provider, smartAccountProvider, smartAccount } = blockchainContext;
  console.log('useMintNFT: provider = ', provider);
  console.log('useMintNFT: smartAccountProvider = ', smartAccountProvider);

  const { processTransactionBundle } = useAccountAbstractionPayment(
    provider,
    smartAccount,
  );

  const { uploadFile } = usePortal() as {
    uploadFile: (file: File) => Promise<string>;
  };

  if (!provider || !smartAccountProvider || !smartAccount) {
    console.log(
      'useMintNFT: provider, smartAccountProvider or smartAccount is null',
    );
    return;
  }

  const nftAddress = process.env.NEXT_PUBLIC_TIPERC721_ADDRESS;
  if (!nftAddress) throw new Error('useMintNFT: nftAddress is undefined');

  type ExtendedBlobPropertyBag = BlobPropertyBag & {
    lastModified?: number;
  };

  /**
   * Function to mint a new NFT.
   * It takes the NFT metadata as an argument and mints the new NFT using account abstraction for fees payment.
   *
   * @async
   * @function
   * @param {NFT} nft - The NFT metadata.
   * @returns {Promise<MintNFTResponse>} The response containing the NFT address, ID, and URI.
   */
  const mintNFT = async (nft: NFT): Promise<MintNFTResponse> => {
    // ------------------------STEP 1: Initialise Biconomy Smart Account SDK--------------------------------//
    console.log(`useMintNFT: smartAccount: ${smartAccount}`);

    // // get EOA address from wallet provider
    // const signer = await connectToWallet();

    // ------------------------STEP 2: Build Partial User op from your user Transaction/s Request --------------------------------//

    // passing accountIndex is optional, by default it will be 0
    // it should match with the index used to initialise the SDK Biconomy Smart Account instance
    const biconomySmartAccount = smartAccount;
    console.log(`useMintNFT: biconomySmartAccount: ${biconomySmartAccount}`);

    if (!biconomySmartAccount || !provider)
      return {
        address: '',
        id: '',
        uri: '',
      };

    if (!processTransactionBundle)
      throw new Error('useMintNFT: processTransactionBundle is undefined');

    const smartAccountAddress =
      await getSmartAccountAddress(biconomySmartAccount);

    const nftMetaData = { ...nft };

    delete nftMetaData.supply;
    console.log('useMintNFT: nftMetaData = ', nftMetaData);

    const metaDataFileObject = new File(
      [
        new Blob([JSON.stringify(nftMetaData)], {
          lastModified: Date.now(),
          type: 'text/plain',
        } as ExtendedBlobPropertyBag),
      ],
      'ERC721Metadata.json',
    );
    const cid = await uploadFile(metaDataFileObject);
    console.log('useMintNFT: cid = ', cid);

    // Here we are minting NFT to smart account address itself
    const tipERC721Contract = new Contract(
      nftAddress,
      TipERC721.abi,
      smartAccountProvider,
    );

    // Below function gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance
    try {
      const { receipt } = await processTransactionBundle([
        [
          await tipERC721Contract.populateTransaction.safeMint(
            smartAccountAddress,
            cid,
          ),
          nftAddress,
        ],
      ]);

      console.log('useMintNFT: receipt = ', receipt);

      const iface = new Interface(TipERC721.abi);
      const parsedLogs = receipt.logs.map((log) => {
        try {
          return iface.parseLog(log);
        } catch (e) {
          return null;
        }
      });

      // Filter out null values and find the Transfer event
      const transferLog = parsedLogs.find(
        (log) => log && log.name === 'Transfer',
      );

      if (transferLog) {
        console.log(
          'useMintNFT: Token ID:',
          transferLog.args.tokenId.toString(),
        );
      } else {
        console.log('useMintNFT:Transfer event not found');
      }

      const tokenId = transferLog?.args.tokenId;

      return {
        address: nftAddress as string,
        id: tokenId ? tokenId.toNumber().toString() : undefined,
        uri: cid,
      };
    } catch (e) {
      const errorMessage = 'useMintNFT: error received';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(errorMessage, e);
    }
  };

  /**
   * Function to check if an NFT contract is ERC721 compliant.
   * It takes the NFT contract address as an argument and returns a boolean indicating if it is ERC721 compliant.
   *
   * @async
   * @function
   * @param {string} nftAddress - The address of the NFT contract.
   * @returns {Promise<boolean>} A boolean indicating if the NFT contract is ERC721 compliant.
   */
  const getIsERC721 = async (nftAddress: string): Promise<boolean> => {
    if (!nftAddress) return false;

    console.log('useMintNFT: getIsERC721: nftAddress = ', nftAddress);
    const iERC165 = new Contract(nftAddress, IERC165.abi, provider);

    console.log('before isERC721 result');
    const result = (await iERC165.supportsInterface(
      erc721InterfaceId,
    )) as boolean;
    console.log('isERC721 result = ', result);

    return result;
  };

  // call ERC-165 supportsInterface
  // return true if interface ERC-721 is supported
  const getIsERC721Address = async (nftAddress: string): Promise<boolean> => {
    if (!nftAddress) return false;

    const iERC165 = new ethers.Contract(
      nftAddress,
      IERC165.abi,
      smartAccountProvider,
    );

    console.log('getIsERC721Address: before getIsERC721Address result');

    let result;
    try {
      result = await iERC165.supportsInterface(erc721InterfaceId);
      // Handle success, e.g., console.log(result);
    } catch (error) {
      console.error(
        'getIsERC721Address: Error checking if the contract supports ERC721 interface:',
        error,
      );
    }
    console.log('getIsERC721Address: getIsERC721Address result = ', result);

    return result;
  };

  return {
    mintNFT,
    getIsERC721,
    getIsERC721Address,
  };
}

export const getIsERC721NonHook = async (
  nftAddress: string,
  provider: JsonRpcProvider | null,
): Promise<boolean> => {
  if (!nftAddress || !provider) return false;

  console.log('useMintNFT: getIsERC721: nftAddress = ', nftAddress);
  const iERC165 = new Contract(nftAddress, IERC165.abi, provider);

  console.log('before isERC721 result');
  const result = (await iERC165.supportsInterface(
    erc721InterfaceId,
  )) as boolean;
  console.log('isERC721 result = ', result);

  return result;
};
