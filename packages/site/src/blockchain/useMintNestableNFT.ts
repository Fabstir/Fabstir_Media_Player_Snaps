import { ethers } from 'ethers';
import { Interface } from '@ethersproject/abi';

import { Contract, ContractFactory } from '@ethersproject/contracts';

import { JsonRpcProvider } from '@ethersproject/providers';

import { useContext } from 'react';
import IERC165 from '../../contracts/IERC165.json';
import TipERC721 from '../../contracts/TipERC721.json';
import FNFTNestable from '../../contracts/FNFTNestable.json';

import BlockchainContext, {
  BlockchainContextType,
} from '../../state/BlockchainContext';

import useMintNFT, { getIsERC721NonHook } from './useMintNFT';

import useAccountAbstractionPayment, {
  getSmartAccountAddress,
} from './useAccountAbstractionPayment';

type NFT = {
  name?: string;
  symbol?: string;
  supply?: string;
  [key: string]: any;
};

type MintNestableNFTResponse = {
  address: string;
  id: string;
};

/**
 * Custom hook to mint a Nestable NFT and add child NFTs to it.
 * It returns an object with functions to mint a Nestable NFT, add a child NFT to it, and remove a child NFT from it.
 *
 * @function
 * @returns {Object} An object with functions to mint a Nestable NFT, add a child NFT to it, and remove a child NFT from it.
 */
export default function useMintNestableNFT() {
  const blockchainContext =
    useContext<BlockchainContextType>(BlockchainContext);
  const { provider, smartAccountProvider, smartAccount } = blockchainContext;
  console.log('useMintNestableNFT: provider = ', provider);
  console.log(
    'useMintNestableNFT: smartAccountProvider = ',
    smartAccountProvider,
  );
  const { getIsERC721Address } = useMintNFT();

  if (!provider || !smartAccountProvider || !smartAccount) {
    console.log('useMintNestableNFT: provider, or smartAccount is undefined');
    return;
  }

  const { processTransactionBundle } =
    provider && smartAccount
      ? useAccountAbstractionPayment(provider, smartAccount)
      : { handleBiconomyPayment: null, createTransaction: null };

  /**
   * Function to check if an NFT contract is Nestable NFT compliant.
   * It takes the NFT contract address as an argument and returns a boolean indicating if it is Nestable NFT compliant.
   *
   * @async
   * @function
   * @param {string} tokenAddress - The address of the NFT contract.
   * @returns {Promise<boolean>} A boolean indicating if the NFT contract is Nestable NFT compliant.
   */
  const getIsNestableNFT = async (tokenAddress: string): Promise<boolean> => {
    console.log(
      'useMintNestableNFT: getIsNestableNFT: tokenAddress = ',
      tokenAddress,
    );

    const iERC165 = new Contract(tokenAddress, IERC165.abi, provider);

    const iERC7401InterfaceId = 0x42b0e56f;
    const result = await iERC165.supportsInterface(iERC7401InterfaceId);

    console.log('useMintNestableNFT: getIsNestableNFTToken = ', result);
    return result;
  };

  /**
   * Function to get the children of a Nestable NFT.
   * It takes the parent NFT ID as an argument and returns a promise that resolves to an array of child NFT IDs.
   *
   * @async
   * @function
   * @param {string} parentId - The parent NFT ID.
   * @returns {Promise<string[]>} A promise that resolves to an array of child NFT IDs.
   */
  const getChildrenOfNestableNFT = async (parentId: string): Promise<any> => {
    console.log(
      'useMintNestableNFT: getChildrenOfNestableNFT: parentId = ',
      parentId,
    );

    const nestableNFTContract = new Contract(
      process.env.NEXT_PUBLIC_NESTABLENFT_ADDRESS as string,
      FNFTNestable.abi,
      provider,
    );

    const children = await nestableNFTContract.childrenOf(parentId);
    return children;
  };

  const getChildOfNestableNFT = async (
    parentId: string,
    position: number,
  ): Promise<any> => {
    console.log(
      'useMintNestableNFT: getChildOfNestableNFT: parentId = ',
      parentId,
    );

    const nestableNFTContract = new Contract(
      process.env.NEXT_PUBLIC_NESTABLENFT_ADDRESS as string,
      FNFTNestable.abi,
      provider,
    );

    const child = await nestableNFTContract.childOf(
      parentId,
      position.toString(),
    );
    console.log('useMintNestableNFT: getChildOfNestableNFT: child = ', child);
    return child;
  };

  /**
   * Function to add a child NFT to a Nestable NFT.
   * It takes the parent NFT ID, child index, and NFT object as arguments and returns a promise that resolves to a `MintNestableNFTResponse` object.
   *
   * @async
   * @function
   * @param {string} parentId - The parent NFT ID.
   * @param {number} childIndex - The index of the child NFT.
   * @param {NFT} nft - The NFT object to add as a child.
   * @returns {Promise<MintNestableNFTResponse>} A promise that resolves to a `MintNestableNFTResponse` object.
   */
  const addChildToNestableNFT = async (
    parentId: string,
    childIndex: number,
    nft: NFT,
  ): Promise<MintNestableNFTResponse> => {
    console.log(
      `useMintNestableNFT: addChildToNestableNFT parentId ${parentId}, childIndex ${childIndex}, nft ${nft}}`,
    );

    console.log(`useMintNestableNFT: smartAccount: ${smartAccount}`);

    if (!getIsERC721Address(nft.address)) {
      const errorMessage = 'useMintNestableNFT: not an ERC721 token';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // passing accountIndex is optional, by default it will be 0
    // it should match with the index used to initialise the SDK Biconomy Smart Account instance
    console.log(`useMintNestableNFT: smartAccount: ${smartAccount}`);

    if (!smartAccount || !provider)
      throw new Error(
        'upgradeToNestableNFT: nestableNFT: smartAccount or provider is undefined',
      );

    const nftAddress = nft.address;
    // const userOps = []

    // 3. transfer ownership of NFT to ERC7401 contract
    const nftContract = new Contract(
      nftAddress,
      TipERC721.abi,
      smartAccountProvider,
    );

    const transactionNFTApprove = [
      await nftContract.populateTransaction.approve(
        process.env.NEXT_PUBLIC_NESTABLENFT_ADDRESS as string,
        nft.id,
      ),
      nftAddress,
    ];

    console.log(
      'useMintNestableNFT: transactionNFTTransferFrom = ',
      transactionNFTApprove,
    );

    const nestableNFTContract = new Contract(
      process.env.NEXT_PUBLIC_NESTABLENFT_ADDRESS as string,
      FNFTNestable.abi,
      smartAccountProvider,
    );
    console.log(
      'useMintNestableNFT: nestableNFTContract = ',
      nestableNFTContract,
    );

    // 4. ERC7401 owner proposes child
    const transactionNestableNFTAddChild = [
      await nestableNFTContract.populateTransaction.addChildNFT(
        parentId,
        nft.address,
        nft.id,
        [],
      ),
      nestableNFTContract.address,
    ];

    console.log(
      'useMintNestableNFT: transactionNestableNFTAddChild = ',
      transactionNestableNFTAddChild,
    );

    // 3. ERC7401 owner proposes child
    const transactionNestableNFTAcceptChild = [
      await nestableNFTContract.populateTransaction.acceptChild(
        parentId,
        childIndex,
        nftAddress,
        nft.id,
      ),
      nestableNFTContract.address,
    ];

    console.log(
      'useMintNestableNFT: transactionNestableNFTAcceptChild = ',
      transactionNestableNFTAcceptChild,
    );

    // Below section gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance
    try {
      await processTransactionBundle([
        transactionNFTApprove,
        transactionNestableNFTAddChild,
        transactionNestableNFTAcceptChild,
      ]);
      return {
        address: nestableNFTContract.address,
        id: parentId,
      };
    } catch (e) {
      const errorMessage = 'useMintNestableNFT: error received ';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(`${errorMessage}: ${e}`);
    }
  };

  /**
   * Function to mint a new Nestable NFT.
   * It takes the recipient account address as an argument and returns a promise that resolves to a `MintNestableNFTResponse` object.
   *
   * @async
   * @function
   * @param {string} recipientAccountAddress - The recipient account address.
   * @returns {Promise<MintNestableNFTResponse>} A promise that resolves to a `MintNestableNFTResponse` object.
   */
  const mintNestableNFT = async (
    recipientAccountAddress: string,
  ): Promise<MintNestableNFTResponse> => {
    console.log(`mintNestableNFT: nestableNFT: smartAccount: ${smartAccount}`);

    // generate mintNft data
    const nestableNFTInterface = new Interface(['function mint(address _to)']);

    // passing accountIndex is optional, by default it will be 0
    // it should match with the index used to initialise the SDK Biconomy Smart Account instance
    console.log(`mintNestableNFT: nestableNFT: smartAccount: ${smartAccount}`);

    if (!smartAccount || !provider)
      throw new Error(
        'mintNestableNFT: nestableNFT: smartAccount or provider is undefined',
      );

    console.log(
      'mintNestableNFT: nestableNFT: mintNFT: recipientAccountAddress = ',
      recipientAccountAddress,
    );

    // Here we are minting NFT to smart account address itself
    const data = nestableNFTInterface.encodeFunctionData('mint', [
      recipientAccountAddress,
    ]);
    console.log(`mintNestableNFT: nestableNFT: data: ${data}`);

    //    const nftAddress = '0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e'; // Todo // use from config
    const nestableNFTAddress = process.env.NEXT_PUBLIC_NESTABLENFT_ADDRESS;

    const transaction = {
      to: nestableNFTAddress,
      data,
    };

    console.log(`mintNestableNFT: nestableNFT: transaction: ${transaction}`);

    // Below section gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance
    try {
      const { receipt } = await processTransactionBundle([transaction]);
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
          'mintNestableNFT: nestableNFT: Token ID:',
          transferLog.args.tokenId.toString(),
        );
      } else {
        console.log('mintNestableNFT: nestableNFT:Transfer event not found');
      }

      const tokenId = transferLog?.args.tokenId;

      return {
        address: nestableNFTAddress,
        id: tokenId ? tokenId.toNumber().toString() : undefined,
      };
    } catch (e) {
      const errorMessage = 'mintNestableNFT: nestableNFT: error received';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(`${errorMessage}: ${e}`);
    }
  };

  /**
   * Function to remove a child NFT from a Nestable NFT.
   * It takes the parent NFT ID, child NFT address and child NFT ID as arguments and returns a promise that resolves to a `MintNestableNFTResponse` object.
   *
   * @async
   * @function
   * @param {string} parentId - The ID of the parent Nestable NFT.
   * @param {string} childAddress - The address of the child NFT.
   * @param {string} childId - The ID of the child NFT.
   * @returns {Promise<MintNestableNFTResponse>} A promise that resolves to a `MintNestableNFTResponse` object.
   */
  const removeChildFromNestableNFT = async (
    parentId: string,
    childAddress: string,
    childId: string,
  ): Promise<MintNestableNFTResponse> => {
    console.log(
      `useMintNestableNFT: removeChildFromNestableNFT: parentId ${parentId}, childAddress ${childAddress}, childId ${childId}}`,
    );

    const children = await getChildrenOfNestableNFT(parentId);
    console.log(
      'useMintNestableNFT: removeChildFromNestableNFT: children = ',
      children,
    );

    console.log(
      'useMintNestableNFT: removeChildFromNestableNFT: childId type:',
      typeof childId,
    );

    const childIndex = children.findIndex(
      (child) =>
        child.tokenId.toString() === childId.toString() &&
        child.contractAddress === childAddress,
    );

    if (childIndex === -1) {
      const errorMessage =
        'useMintNestableNFT: removeChildFromNestableNFT: child not found';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const child = children[childIndex];
    if (child.contractAddress !== childAddress) {
      const errorMessage =
        'useMintNestableNFT: removeChildFromNestableNFT: childAddress does not match';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(
      `useMintNestableNFT: removeChildFromNestableNFT: removeChildFromNestableNFT parentId ${parentId}, childIndex ${childIndex}, child ${child}}`,
    );

    console.log(
      `useMintNestableNFT: removeChildFromNestableNFT: smartAccount: ${smartAccount}`,
    );

    if (!getIsERC721Address(child.contractAddress)) {
      const errorMessage =
        'useMintNestableNFT: removeChildFromNestableNFT: not an ERC721 token';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // passing accountIndex is optional, by default it will be 0
    // it should match with the index used to initialise the SDK Biconomy Smart Account instance
    console.log(
      `useMintNestableNFT: removeChildFromNestableNFT: smartAccount: ${smartAccount}`,
    );

    if (!smartAccount || !provider)
      throw new Error(
        'upgradeToNestableNFT: nestableNFT: smartAccount or provider is undefined',
      );

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);

    // remove child from nestableNFT

    const nestableNFTContract = new Contract(
      process.env.NEXT_PUBLIC_NESTABLENFT_ADDRESS as string,
      FNFTNestable.abi,
      smartAccountProvider,
    );
    console.log(
      'useMintNestableNFT: removeChildFromNestableNFT: nestableNFTContract = ',
      nestableNFTContract,
    );

    // 4. ERC7401 owner proposes child
    const minTxRemoveChildFromParent =
      await nestableNFTContract.populateTransaction.transferChild(
        parentId,
        smartAccountAddress,
        0,
        childIndex,
        childAddress,
        child.tokenId,
        false,
        [],
      );

    console.log(
      'useMintNestableNFT: removeChildFromNestableNFT: minTxRemoveChildFromParent = ',
      minTxRemoveChildFromParent,
    );

    const transactionRemoveChildFromParent = {
      to: nestableNFTContract.address,
      data: minTxRemoveChildFromParent.data,
    };

    // Below function gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance

    try {
      await processTransactionBundle([transactionRemoveChildFromParent]);
      return {
        address: childAddress,
        id: childId.toString(),
      };
    } catch (e) {
      const errorMessage =
        'useMintNestableNFT: removeChildFromNestableNFT: error received';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(`${errorMessage}: ${e}`);
    }
  };

  /**
   * Function to upgrade an ERC721 NFT to a Nestable NFT.
   * It takes the NFT object as an argument and returns a promise that resolves to a `MintNestableNFTResponse` object.
   *
   * @async
   * @function
   * @param {NFT} nft - The NFT object to upgrade.
   * @returns {Promise<MintNestableNFTResponse>} A promise that resolves to a `MintNestableNFTResponse` object.
   */
  const upgradeToNestableNFT = async (
    nft: NFT,
  ): Promise<MintNestableNFTResponse> => {
    // ------------------------STEP 1: Initialise Biconomy Smart Account SDK--------------------------------//
    console.log(`useMintNestableNFT: smartAccount: ${smartAccount}`);

    if (!getIsERC721NonHook(nft.address, provider)) {
      const errorMessage = 'useMintNestableNFT: not an ERC721 token';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`useMintNestableNFT: smartAccount: ${smartAccount}`);

    if (!smartAccount || !provider)
      throw new Error(
        'upgradeToNestableNFT: nestableNFT: smartAccount or provider is undefined',
      );

    const smartAccountAddress = await smartAccount.getAccountAddress();

    const nestableNFT = await mintNestableNFT(smartAccountAddress);

    const nestableNFTWithChild = await addChildToNestableNFT(
      nestableNFT.id,
      0,
      nft,
    );
    return nestableNFTWithChild;
  };

  return {
    getIsNestableNFT,
    upgradeToNestableNFT,
    addChildToNestableNFT,
    removeChildFromNestableNFT,
    mintNestableNFT,
    getChildrenOfNestableNFT,
    getChildOfNestableNFT,
  };
}

export const getIsNestableNFTNonHook = async (
  tokenAddress: string,
  provider: JsonRpcProvider | null,
): Promise<boolean> => {
  console.log(
    'useMintNestableNFT: getIsNestableNFT: tokenAddress = ',
    tokenAddress,
  );

  if (!provider) throw new Error('provider is undefined');

  const iERC165 = new Contract(tokenAddress, IERC165.abi, provider);

  const iERC7401InterfaceId = 0x42b0e56f;
  const result = await iERC165.supportsInterface(iERC7401InterfaceId);

  console.log('useMintNestableNFT: getIsNestableNFTToken = ', result);
  return result;
};
