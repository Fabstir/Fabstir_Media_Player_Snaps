import { Interface } from '@ethersproject/abi';

import { useContext } from 'react';
import IERC165 from '../../contracts/IERC165.json';
import TipERC721 from '../../contracts/TipERC721.json';
import TipERC1155 from '../../contracts/TipERC1155.json';
import FNFTNestable from '../../contracts/FNFTNestable.json';

import BlockchainContext, {
  BlockchainContextType,
} from '../../state/BlockchainContext';

import useMintNFT from './useMintNFT';

import useAccountAbstractionPayment, {
  getSmartAccountAddress,
} from './useAccountAbstractionPayment';
import useContractUtils from './useContractUtils';
import { AccountAbstractionPayment } from '../../types';
import useUserProfile from '../hooks/useUserProfile';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';

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
  const { connectedChainId, smartAccountProvider, smartAccount } =
    blockchainContext;
  console.log(
    'useMintNestableNFT: smartAccountProvider = ',
    smartAccountProvider,
  );
  const userAuthPub = useRecoilValue(userauthpubstate);

  const {
    getChainIdAddressFromContractAddresses,
    getChainIdFromChainIdAddress,
    getAddressFromChainIdAddress,
    newReadOnlyContract,
    newContract,
    getChainIdAddressFromChainIdAndAddress,
  } = useContractUtils();

  const { getIsERC721Address, getIsERC721, getIsERC1155 } = useMintNFT();
  const [getUserProfile] = useUserProfile();

  const accountAbstractionPayment = useAccountAbstractionPayment(
    smartAccount as object,
  ) as AccountAbstractionPayment;

  if (!getIsERC721Address || !getIsERC721) {
    throw new Error(
      'useMintNestableNFT: getIsERC721Address or getIsERC721 is undefined',
    );
  }

  if (!smartAccountProvider || !smartAccount) {
    console.log(
      'useMintNestableNFT: smartAccountProvider or smartAccount is null or no providers',
    );
    return {
      getIsNestableNFT: async () => {
        throw new Error(
          'Cannot check if NFT is nestable: smartAccount is not defined',
        );
      },
      upgradeToNestableNFT: async () => {
        throw new Error(
          'Cannot upgrade to nestable NFT: smartAccount is not defined',
        );
      },
      addChildToNestableNFT: async () => {
        throw new Error(
          'Cannot add child to nestable NFT: smartAccount is not defined',
        );
      },
      removeChildFromNestableNFT: async () => {
        throw new Error(
          'Cannot remove child from nestable NFT: smartAccount is not defined',
        );
      },
      mintNestableNFT: async () => {
        throw new Error(
          'Cannot mint nestable NFT: smartAccount is not defined',
        );
      },
      getChildrenOfNestableNFT: async () => {
        throw new Error(
          'Cannot get children of nestable NFT: smartAccount is not defined',
        );
      },
      getChildOfNestableNFT: async () => {
        throw new Error(
          'Cannot get child of nestable NFT: smartAccount is not defined',
        );
      },
    };
  }

  let processTransactionBundle;

  if (accountAbstractionPayment)
    processTransactionBundle =
      accountAbstractionPayment.processTransactionBundle;
  else throw new Error('useMintNestableNFT: accountAbstractionPayment is null');

  // const { processTransactionBundle } = smartAccount
  //   ? accountAbstractionPayment
  //   : {
  //       handleBiconomyPayment: null,
  //       createTransaction: null,
  //       processTransactionBundle: null,
  //     };

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

    const iERC165 = newReadOnlyContract(tokenAddress, IERC165.abi);

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

    if (!connectedChainId)
      throw new Error('useMintNestableNFT: No default chain id');

    const nestableNFTContract = newReadOnlyContract(
      getChainIdAddressFromContractAddresses(
        connectedChainId,
        'NEXT_PUBLIC_NESTABLENFT_ADDRESS',
      ),
      FNFTNestable.abi,
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

    if (!connectedChainId)
      throw new Error('useMintNestableNFT: No default chain id');

    const nestableNFTContract = newReadOnlyContract(
      getChainIdAddressFromContractAddresses(
        connectedChainId,
        'NEXT_PUBLIC_NESTABLENFT_ADDRESS',
      ),
      FNFTNestable.abi,
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

    if (!smartAccount) {
      throw new Error(
        'upgradeToNestableNFT: nestableNFT: smartAccount is undefined',
      );
    }

    const nftAddress = nft.address;
    // const userOps = []

    // 3. transfer ownership of NFT to ERC7401 contract
    const nftContract = newContract(
      nftAddress,
      TipERC721.abi,
      smartAccountProvider,
    );

    if (!connectedChainId)
      throw new Error('useMintNestableNFT: No connected chain id');

    const nestableContractAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_NESTABLENFT_ADDRESS',
    );
    console.log(
      'useMintNestableNFT: nestableContractAddress = ',
      nestableContractAddress,
    );

    const signer = smartAccountProvider.getSigner();
    const signerAddress = await signer.getAddress();

    if (await getIsOwnNFT(signerAddress, nft)) {
      console.log('useMintNestableNFT: NFT is already owned by signer');
    } else throw new Error('useMintNestableNFT: NFT is not owned by signer');

    const transactionNFTApprove = [
      await (nftContract as any).populateTransaction.approve(
        getAddressFromChainIdAddress(nestableContractAddress),
        nft.id,
      ),
      nftAddress,
    ];

    console.log(
      'useMintNestableNFT: transactionNFTTransferFrom = ',
      transactionNFTApprove,
    );

    const nestableNFTContractAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_NESTABLENFT_ADDRESS',
    );
    const nestableNFTContract = newContract(
      nestableNFTContractAddress,
      FNFTNestable.abi,
      smartAccountProvider,
    );
    console.log(
      'useMintNestableNFT: nestableNFTContract = ',
      nestableNFTContract,
    );

    // 4. ERC7401 owner proposes child
    const transactionNestableNFTAddChild = [
      await (nestableNFTContract as any).populateTransaction.addChildNFT(
        parentId,
        getAddressFromChainIdAddress(nft.address),
        nft.id,
        [],
      ),
      nestableNFTContractAddress,
    ];

    console.log(
      'useMintNestableNFT: transactionNestableNFTAddChild = ',
      transactionNestableNFTAddChild,
    );

    // 3. ERC7401 owner proposes child
    const transactionNestableNFTAcceptChild = [
      await (nestableNFTContract as any).populateTransaction.acceptChild(
        parentId,
        childIndex,
        getAddressFromChainIdAddress(nft.address),
        nft.id,
      ),
      nestableNFTContractAddress,
    ];

    console.log(
      'useMintNestableNFT: transactionNestableNFTAcceptChild = ',
      transactionNestableNFTAcceptChild,
    );

    // Below section gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance
    try {
      const { receipt } = await processTransactionBundle([
        transactionNFTApprove,
        transactionNestableNFTAddChild,
        transactionNestableNFTAcceptChild,
      ]);

      if (receipt.isSuccess) {
        return {
          address: String(nestableNFTContractAddress), // Ensure the address is a string
          id: parentId,
        };
      } else
        throw new Error(
          'useMintNestableNFT: addChildToNestableNFT: Transaction failed',
        );
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

    if (!smartAccount) {
      throw new Error(
        'mintNestableNFT: nestableNFT: smartAccount is undefined',
      );
    }

    console.log(
      'mintNestableNFT: nestableNFT: mintNFT: recipientAccountAddress = ',
      recipientAccountAddress,
    );

    // Here we are minting NFT to smart account address itself
    const data = nestableNFTInterface.encodeFunctionData('mint', [
      recipientAccountAddress,
    ]);
    console.log(`mintNestableNFT: nestableNFT: data: ${data}`);

    if (connectedChainId === null || connectedChainId === undefined) {
      throw new Error('connectedChainId is null or undefined.');
    }

    //    const nftAddress = '0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e'; // Todo // use from config
    const nestableNFTAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_NESTABLENFT_ADDRESS',
    );

    const transaction = [{ data }, nestableNFTAddress];

    console.log(`mintNestableNFT: nestableNFT: transaction: ${transaction}`);

    // Below section gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance
    try {
      const { receipt } = await processTransactionBundle([transaction]);
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
      (child: any) =>
        child.tokenId.toString() === childId.toString() &&
        child.contractAddress === getAddressFromChainIdAddress(childAddress),
    );

    if (childIndex === -1) {
      const errorMessage =
        'useMintNestableNFT: removeChildFromNestableNFT: child not found';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const child = children[childIndex];
    if (child.contractAddress !== getAddressFromChainIdAddress(childAddress)) {
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

    const chainId = getChainIdFromChainIdAddress(childAddress);
    if (
      !getIsERC721Address(
        getChainIdAddressFromChainIdAndAddress(chainId, child.contractAddress),
      )
    ) {
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

    if (!smartAccount)
      throw new Error(
        'upgradeToNestableNFT: nestableNFT: smartAccount is undefined',
      );

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);

    // remove child from nestableNFT
    if (connectedChainId === null || connectedChainId === undefined) {
      throw new Error('connectedChainId is null or undefined.');
    }

    const nestableNFTContractAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_NESTABLENFT_ADDRESS',
    );

    const nestableNFTContract = newContract(
      nestableNFTContractAddress,
      FNFTNestable.abi,
      smartAccountProvider,
    );
    console.log(
      'useMintNestableNFT: removeChildFromNestableNFT: nestableNFTContract = ',
      nestableNFTContract,
    );

    // 4. ERC7401 owner proposes child
    const minTxRemoveChildFromParent = await (
      nestableNFTContract as any
    ).populateTransaction.transferChild(
      parentId,
      smartAccountAddress,
      0,
      childIndex,
      getAddressFromChainIdAddress(childAddress),
      child.tokenId,
      false,
      [],
    );

    console.log(
      'useMintNestableNFT: removeChildFromNestableNFT: minTxRemoveChildFromParent = ',
      minTxRemoveChildFromParent,
    );

    const transactionRemoveChildFromParent = [
      minTxRemoveChildFromParent,
      nestableNFTContractAddress,
    ];

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

    if (!getIsERC721(nft.address)) {
      const errorMessage = 'useMintNestableNFT: not an ERC721 token';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`useMintNestableNFT: smartAccount: ${smartAccount}`);

    if (!smartAccount)
      throw new Error(
        'upgradeToNestableNFT: nestableNFT: smartAccount is undefined',
      );

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);

    const nestableNFT = await mintNestableNFT(smartAccountAddress);

    const nestableNFTWithChild = await addChildToNestableNFT(
      nestableNFT.id,
      0,
      nft,
    );
    return nestableNFTWithChild;
  };

  const getIsOwnNFT = async (userAccountAddress: string, nft: any) => {
    if (!userAccountAddress || !nft.address || !nft.id) return false;

    let isOwnNFT;
    if (await getIsNestableNFT(nft.address)) {
      const nestableNFTContract = newReadOnlyContract(
        getChainIdAddressFromContractAddresses(
          connectedChainId,
          'NEXT_PUBLIC_NESTABLENFT_ADDRESS',
        ),
        FNFTNestable.abi,
      );

      try {
        const ownerAddress =
          (await nestableNFTContract.directOwnerOf(nft.id))?.[0] ?? undefined;
        console.log('getIsOwnNFT: ownerAddress = ', ownerAddress);

        isOwnNFT =
          ownerAddress?.toString().toLowerCase() ===
          userAccountAddress.toLowerCase();
      } catch (error) {
        console.error(`getIsOwnNFT: Failed to get owner of token: ${error}`);
        // Handle the error appropriately here
      }
    } else if (await getIsERC721(nft)) {
      const tipERC721 = newReadOnlyContract(nft.address, TipERC721.abi);
      const ownerAddress = await tipERC721.ownerOf(nft.id);
      console.log('getIsOwnNFT: ownerAddress = ', ownerAddress);

      try {
        isOwnNFT =
          (await tipERC721.ownerOf(nft.id))?.toLowerCase() ===
          userAccountAddress.toLowerCase();
      } catch (error) {
        console.error(`getIsOwnNFT: Failed to get owner of token: ${error}`);
        // Handle the error appropriately here
      }
    }

    console.log('getIsOwnNFT: isOwnNFT = ', isOwnNFT);

    return isOwnNFT;
  };

  const getNFTQuantity = async (userPub: string, nft: any) => {
    const userAuthProfile = await getUserProfile(userPub);

    let quantity = 0;
    if (await getIsNestableNFT(nft.address)) {
      const isOwnNFT = await getIsOwnNFT(userAuthProfile.accountAddress, nft);
      if (isOwnNFT) quantity = 1;
    } else if (await getIsERC721(nft)) {
      const isOwnNFT = await getIsOwnNFT(userAuthProfile.accountAddress, nft);
      if (isOwnNFT) quantity = 1;
    }

    console.log('getNFTQuantity: quantity = ', quantity);
    return quantity;
  };

  return {
    getIsNestableNFT,
    upgradeToNestableNFT,
    addChildToNestableNFT,
    removeChildFromNestableNFT,
    mintNestableNFT,
    getChildrenOfNestableNFT,
    getChildOfNestableNFT,
    getIsOwnNFT,
    getNFTQuantity,
  };
}
