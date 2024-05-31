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
import useContractUtils from './useContractUtils';
import { AccountAbstractionPayment } from '../../types';

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
  const { providers, connectedChainId, smartAccountProvider, smartAccount } =
    blockchainContext;
  console.log('useMintNFT: providers = ', providers);
  console.log('useMintNFT: smartAccountProvider = ', smartAccountProvider);

  const {
    getChainIdAddressFromContractAddresses,
    newReadOnlyContract,
    newContract,
  } = useContractUtils();

  const { processTransactionBundle } = useAccountAbstractionPayment(
    smartAccount as object,
  ) as AccountAbstractionPayment;

  const { uploadFile } = usePortal() as {
    uploadFile: (file: File) => Promise<string>;
  };

  if (
    !providers ||
    Object.keys(providers).length === 0 ||
    !smartAccountProvider ||
    !smartAccount
  ) {
    console.log(
      'useMintNFT: smartAccountProvider or smartAccount is null or no providers',
    );
    return {
      mintNFT: async () => {
        throw new Error('Cannot mint NFT: smartAccount is not defined');
      },
      getIsERC721: async () => {
        throw new Error(
          'Cannot check if NFT is ERC721: smartAccount is not defined',
        );
      },
      getIsERC721Address: async () => {
        throw new Error(
          'Cannot check if NFT address is ERC721: smartAccount is not defined',
        );
      },
    };
  }

  type ExtendedBlobPropertyBag = BlobPropertyBag & {
    lastModified?: number;
  };

  /**
   * Asynchronously mints a new NFT.
   *
   * @param {NFT} nft - The NFT to be minted.
   * @returns {Promise<MintNFTResponse>} - A promise that resolves to the response of the minting operation.
   */
  const mintNFT = async (nft: NFT): Promise<MintNFTResponse> => {
    if (!connectedChainId) throw new Error('useMintNFT: No default chain id');
    const nftAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_TIPERC721_ADDRESS',
    );
    if (!nftAddress) throw new Error('useMintNFT: nftAddress is undefined');

    // ------------------------STEP 1: Initialise Biconomy Smart Account SDK--------------------------------//
    console.log(`useMintNFT: smartAccount: ${smartAccount}`);

    // // get EOA address from wallet provider
    // const signer = await connectToWallet();

    // ------------------------STEP 2: Build Partial User op from your user Transaction/s Request --------------------------------//

    // passing accountIndex is optional, by default it will be 0
    // it should match with the index used to initialise the SDK Biconomy Smart Account instance
    const biconomySmartAccount = smartAccount;
    console.log(`useMintNFT: biconomySmartAccount: ${biconomySmartAccount}`);

    if (
      !biconomySmartAccount ||
      !providers ||
      Object.keys(providers).length === 0
    )
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
    const tipERC721Contract = newContract(
      nftAddress,
      TipERC721.abi,
      smartAccountProvider,
    );

    // Below function gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance
    try {
      const transact1 = await (
        tipERC721Contract as any
      ).populateTransaction.safeMint(smartAccountAddress, cid);

      console.log('useMintNFT: transact1 = ', transact1);

      const { receipt } = await processTransactionBundle([
        [
          await (tipERC721Contract as any).populateTransaction.safeMint(
            smartAccountAddress,
            cid,
          ),
          nftAddress,
        ],
      ]);

      console.log('useMintNFT: receipt = ', receipt);

      const iface = new Interface(TipERC721.abi);
      const parsedLogs = receipt.logs.map((log: any) => {
        try {
          return iface.parseLog(log);
        } catch (e) {
          return null;
        }
      });

      // Filter out null values and find the Transfer event
      const transferLog = parsedLogs.find(
        (log: any) => log && log.name === 'Transfer',
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
    const iERC165 = newReadOnlyContract(nftAddress, IERC165.abi);

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

    const iERC165 = newReadOnlyContract(nftAddress, IERC165.abi);

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
