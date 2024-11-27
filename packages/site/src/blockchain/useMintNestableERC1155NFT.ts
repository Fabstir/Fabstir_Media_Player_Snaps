import { useState, useCallback, useContext } from 'react';
import { Zero } from '@ethersproject/constants';
import { Web3Provider } from '@ethersproject/providers';
import { Interface } from '@ethersproject/abi';
import TipERC1155 from '../../contracts/TipERC1155.json';
import FNFTNestableERC1155 from '../../contracts/FNFTNestableERC1155.json';

import IERC165 from '../../contracts/IERC165.json';
import BlockchainContext, {
  BlockchainContextType,
} from '../../state/BlockchainContext';
import useContractUtils from './useContractUtils';
import useMintNFT from './useMintNFT';
import useAccountAbstractionPayment, {
  getSmartAccountAddress,
} from './useAccountAbstractionPayment';
import { AccountAbstractionPayment } from '../../types';
import useUserProfile from '../hooks/useUserProfile';
import { useSetRecoilState } from 'recoil';
import {
  constructNFTAddressId,
  convertAttributesToNFT721Convention,
} from '../utils/nftUtils';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom';
import useIPFS from '../hooks/useIPFS';
import useS5net from '../hooks/useS5';

const chainIdAddress = 'YOUR_CHAIN_ID_ADDRESS';

type NFT = {
  name?: string;
  symbol?: string;
  supply?: string;
  [key: string]: any;
};

type MintNestableNFTResponse = {
  address: string;
  id: string;
  amount: number;
  uri: string;
};

/**
 * Custom hook for minting Nestable ERC1155 NFTs.
 *
 * This hook provides functionality to mint ERC1155 tokens that can be nested within each other,
 * allowing for a hierarchical structure of tokens. It can be used in decentralized applications
 * (DApps) that require complex ownership and transfer logic for assets represented as NFTs.
 *
 * @returns {Object} An object containing functions and properties related to the minting process.
 */
export function useMintNestableERC1155NFT() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const blockchainContext =
    useContext<BlockchainContextType>(BlockchainContext);
  const { connectedChainId, smartAccountProvider, smartAccount } =
    blockchainContext;
  const {
    getChainIdAddressFromContractAddresses,
    getChainIdAddressFromChainIdAndAddress,
    getAddressFromChainIdAddress,
    getChainIdFromChainIdAddress,
    newReadOnlyContract,
    newContract,
  } = useContractUtils();
  const {
    getIsERC721Address,
    getIsERC721,
    getIsERC1155,
    getIsERC1155Address,
    getNFTQuantity: getNFTQuantityFromStandard,
    uploadNFTMetadataAndReturnCID,
  } = useMintNFT();
  const [getUserProfile] = useUserProfile();

  const setSelectedParentNFTAddressId = useSetRecoilState(
    selectedparentnftaddressid,
  );

  const accountAbstractionPayment = useAccountAbstractionPayment(
    smartAccount as object,
  ) as AccountAbstractionPayment;

  let processTransactionBundle;

  if (accountAbstractionPayment)
    processTransactionBundle =
      accountAbstractionPayment.processTransactionBundle;
  else throw new Error('useMintNestableNFT: accountAbstractionPayment is null');

  console.log(
    'useMintNestableNFT: smartAccountProvider = ',
    smartAccountProvider,
  );

  /**
   * Asynchronously checks if a given token address is for a nestable NFT.
   *
   * This function queries the blockchain to determine if the specified token address corresponds to
   * a nestable ERC1155 NFT. Nestable NFTs allow for the creation of hierarchical structures of tokens,
   * enabling more complex ownership and transfer scenarios.
   *
   * @param {string} tokenAddress - The blockchain address of the token to check.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the token is nestable, otherwise `false`.
   */
  const getIsNestableNFT = async (tokenAddress: string): Promise<boolean> => {
    console.log(
      'useMintNestableNFT: getIsNestableNFT: tokenAddress = ',
      tokenAddress,
    );

    const iERC165 = newReadOnlyContract(tokenAddress, IERC165.abi);

    const iNestableERC1155InterfaceId = 0x8ee3ef1e;
    const result = await iERC165.supportsInterface(iNestableERC1155InterfaceId);

    console.log('useMintNestableNFT: getIsNestableNFTToken = ', result);
    return result;
  };

  /**
   * Asynchronously adds a child NFT to a parent nestable NFT.
   *
   * This function is designed to modify the hierarchical structure of nestable ERC1155 NFTs by adding
   * a child NFT to a specified parent NFT. It interacts with the blockchain to update the ownership
   * and nesting information of the involved NFTs.
   *
   * @param {string} parentTokenId - The token ID of the parent NFT to which the child will be added.
   * @param {string} childTokenId - The token ID of the child NFT that is being added to the parent.
   * @param {number} quantity - The quantity of the child NFT to add to the parent.
   * @param {string} contractAddress - The blockchain address of the contract managing the NFTs.
   * @param {string} signer - The signer object representing the current user's blockchain account.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  const addChildToNestableNFT = async (
    parentAddress: string,
    parentId: number,
    childIndex: number,
    nft: NFT,
    data: Uint8Array,
  ) => {
    if (!smartAccountProvider)
      throw new Error('useMintNestableNFT: No smart account provider');

    if (!connectedChainId)
      throw new Error('useMintNestableNFT: No connected chain id');

    if (!getIsERC1155Address)
      throw new Error('useMintNestableNFT: No getIsERC1155Address');

    if (!nft) throw new Error('addChildToNestableNFT: No NFT');

    console.log(
      `useMintNestableNFT: addChildToNestableNFT parentId ${parentId}, childIndex ${childIndex}, nft ${nft}}`,
    );

    console.log(`useMintNestableNFT: smartAccount: ${smartAccount}`);

    if (!smartAccount) {
      throw new Error(
        'useMintNestableNFT: nestableNFT: smartAccount is undefined',
      );
    }

    if (!getIsERC1155Address(nft.address)) {
      const errorMessage = 'useMintNestableNFT: not an ERC1155 token';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const nftAddress = nft.address;

    // 3. transfer ownership of NFT to ERC7401 contract
    const nftContract = newContract(
      nftAddress,
      TipERC1155.abi,
      smartAccountProvider,
    );

    if (!connectedChainId)
      throw new Error('useMintNestableNFT: No connected chain id');

    const nestableContractAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_NESTABLENFT_ERC1155_ADDRESS',
    );
    console.log(
      'useMintNestableNFT: nestableContractAddress = ',
      nestableContractAddress,
    );

    const signer = (smartAccountProvider as Web3Provider).getSigner();
    const signerAddress = await signer.getAddress();

    if (await getIsOwnNFT(signerAddress, nft)) {
      console.log('useMintNestableNFT: NFT is already owned by signer');
    } else throw new Error('useMintNestableNFT: NFT is not owned by signer');

    setIsLoading(true);
    setError(null);
    try {
      const transactionNFTApprove = [
        await (nftContract as any).populateTransaction.setApprovalForAll(
          getAddressFromChainIdAddress(nestableContractAddress),
          true,
        ),
        nftAddress,
      ];

      const nestableNFTContractAddress = getChainIdAddressFromContractAddresses(
        connectedChainId,
        'NEXT_PUBLIC_NESTABLENFT_ERC1155_ADDRESS',
      );
      const nestableNFTContract = newContract(
        nestableNFTContractAddress,
        FNFTNestableERC1155.abi,
        smartAccountProvider,
      );
      console.log(
        'useMintNestableNFT: nestableNFTContract = ',
        nestableNFTContract,
      );

      const addr1 = getAddressFromChainIdAddress(nft.address);

      // 4. ERC7401 owner proposes child
      const transactionNestableNFTAddChild = [
        await (nestableNFTContract as any).populateTransaction.addChildNFT(
          parentId,
          getAddressFromChainIdAddress(nft.address),
          nft.id,
          data,
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

      const { receipt } = await processTransactionBundle([
        transactionNFTApprove,
        transactionNestableNFTAddChild,
        transactionNestableNFTAcceptChild,
      ]);

      setIsLoading(false);

      if (receipt.isSuccess) {
        setSelectedParentNFTAddressId(
          constructNFTAddressId(parentAddress, parentId) as any,
        );

        return {
          address: String(nestableNFTContractAddress), // Ensure the address is a string
          id: parentId,
        };
      } else
        throw new Error(
          'useMintNestableERC1155NFT: addChildToNestableNFT: Transaction failed',
        );
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Asynchronously removes a child NFT from a parent nestable NFT.
   *
   * This function facilitates the removal of a child NFT from its parent in the context of nestable
   * ERC1155 NFTs. It ensures the update of the hierarchical structure by interacting with the blockchain
   * to adjust the ownership and nesting details accordingly.
   *
   * @param {string} parentTokenId - The token ID of the parent NFT from which the child will be removed.
   * @param {string} childTokenId - The token ID of the child NFT that is being removed from the parent.
   * @param {number} quantity - The quantity of the child NFT to remove from the parent.
   * @param {string} contractAddress - The blockchain address of the contract managing the NFTs.
   * @param {string} signer - The signer object representing the current user's blockchain account.
   * @returns {Promise<void>} A promise that resolves when the operation is complete, indicating the child NFT has been successfully removed from the parent.
   */
  const removeChildFromNestableNFT = async (
    parentId: number,
    childAddress: string,
    childId: number,
  ) => {
    setIsLoading(true);
    setError(null);

    console.log(
      `useMintNestableNFT: removeChildFromNestableNFT: parentId ${parentId}, childAddress ${childAddress}, childId ${childId}}`,
    );

    const children = await getChildrenOfNestableNFT(parentId.toString());
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
    if (!getIsERC1155Address)
      throw new Error(
        'useMintNestableNFT: removeChildFromNestableNFT: No getIsERC1155Address',
      );
    if (
      !getIsERC1155Address(
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
        'useMintNestableNFT: nestableNFT: smartAccount is undefined',
      );

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);

    // remove child from nestableNFT
    if (connectedChainId === null || connectedChainId === undefined) {
      throw new Error('connectedChainId is null or undefined.');
    }

    const nestableNFTContractAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_NESTABLENFT_ERC1155_ADDRESS',
    );

    const nestableNFTContract = newContract(
      nestableNFTContractAddress,
      FNFTNestableERC1155.abi,
      smartAccountProvider,
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

    try {
      const { receipt } = await processTransactionBundle([
        transactionRemoveChildFromParent,
      ]);
      setIsLoading(false);
      return {
        address: childAddress,
        id: childId.toString(),
      };
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Function to mint a new Nestable ERC1155 NFT.
   * It takes the recipient account address and amount as arguments and returns a promise that resolves to a `MintNestableNFTResponse` object.
   *
   * @async
   * @function
   * @param {string} userPub - The recipient account address.
   * @param {number} amount - The amount of tokens to mint.
   * @returns {Promise<MintNestableNFTResponse>} A promise that resolves to a `MintNestableNFTResponse` object.
   */
  const mintNestableNFT = async (
    userPub: string,
    nft: NFT,
    amount: number,
  ): Promise<MintNestableNFTResponse> => {
    console.log(`mintNestableNFT: nestableNFT: smartAccount: ${smartAccount}`);

    // generate mintNft data
    const nestableNFTInterface = new Interface([
      'function mint(address _to, uint256 _amount)',
    ]);

    if (!smartAccount) {
      throw new Error(
        'mintNestableNFT: nestableNFT: smartAccount is undefined',
      );
    }

    console.log(
      'mintNestableNFT: nestableNFT: mintNFT: recipientAccountAddress = ',
      userPub,
      'amount = ',
      amount,
    );

    if (connectedChainId === null || connectedChainId === undefined) {
      throw new Error('connectedChainId is null or undefined.');
    }

    const nestableNFTAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_NESTABLENFT_ERC1155_ADDRESS',
    );

    if (!uploadNFTMetadataAndReturnCID)
      throw new Error('mintNestableNFT: No uploadNFTMetadataAndReturnCID');

    const cid = await uploadNFTMetadataAndReturnCID(nft);

    console.log(
      'useMintNFT: NEXT_PUBLIC_NESTABLENFT_ADDRESS',
      process.env.NEXT_PUBLIC_NESTABLENFT_ADDRESS,
    );
    // console.log('mintNestableNFT: nftAddress = ', nftAddress);
    // console.log('mintNestableNFT: smartAccountAddress = ', smartAccountAddress);
    console.log('mintNestableNFT: cid = ', cid);

    // const isERC721 = await getIsERC721Address(nftAddress)
    // console.log('useMintNFT: isERC721 = ', isERC721)

    const fnftNestable = newContract(
      nestableNFTAddress,
      FNFTNestableERC1155.abi,
      smartAccountProvider,
    );

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);

    try {
      const { receipt } = await processTransactionBundle([
        [
          await fnftNestable.populateTransaction.mintToken(
            smartAccountAddress,
            0,
            cid,
            amount,
            [],
          ),
          nestableNFTAddress,
        ],
      ]);
      const iface = new Interface(TipERC1155.abi);
      const parsedLogs = receipt.logs.map((log: any) => {
        try {
          return iface.parseLog(log);
        } catch (e) {
          return null;
        }
      });

      // Filter out null values and find the TransferSingle event
      const transferLog = parsedLogs.find(
        (log: any) => log && log.name === 'TransferSingle',
      );

      if (transferLog) {
        console.log(
          'mintNestableNFT: nestableNFT: Token ID:',
          transferLog.args.id.toString(),
          'Amount:',
          transferLog.args.value.toString(),
        );
      } else {
        console.log(
          'mintNestableNFT: nestableNFT: TransferSingle event not found',
        );
      }

      const tokenId = transferLog?.args.id;
      const mintedAmount = transferLog?.args.value;

      return {
        address: nestableNFTAddress,
        id: tokenId ? tokenId.toString() : undefined,
        amount: mintedAmount ? mintedAmount.toString() : undefined,
        uri: cid,
      };
    } catch (e) {
      const errorMessage = 'mintNestableNFT: nestableNFT: error received';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(`${errorMessage}: ${e}`);
    }
  };

  /**
   * Function to get the children of a Nestable ERC1155 NFT.
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
        'NEXT_PUBLIC_NESTABLENFT_ERC1155_ADDRESS',
      ),
      FNFTNestableERC1155.abi,
    );

    const children = await nestableNFTContract.childrenOf(parentId);
    return children;
  };

  /**
   * Asynchronously retrieves the child NFTs of a specified parent nestable NFT.
   *
   * This function queries the blockchain to fetch the details of child NFTs nested within a given parent
   * NFT. It is particularly useful in applications that require the visualization or manipulation of the
   * hierarchical structure of nestable ERC1155 NFTs.
   *
   * @param {string} parentTokenId - The token ID of the parent NFT whose children are to be retrieved.
   * @param {string} contractAddress - The blockchain address of the contract managing the NFTs.
   * @returns {Promise<Array<{tokenId: string, quantity: number}>>} A promise that resolves to an array of objects,
   *          each representing a child NFT with its token ID and quantity nested within the parent NFT.
   */
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
        'NEXT_PUBLIC_NESTABLENFT_ERC1155_ADDRESS',
      ),
      FNFTNestableERC1155.abi,
    );

    const child = await nestableNFTContract.childOf(
      parentId,
      position.toString(),
    );
    console.log('useMintNestableNFT: getChildOfNestableNFT: child = ', child);
    return child;
  };

  /**
   * Asynchronously checks if a specific NFT is owned by a given user account.
   *
   * This function queries the blockchain to determine whether the specified NFT is owned by the provided
   * user account address. It is useful for verifying ownership before performing actions that require
   * the caller to be the owner of the NFT.
   *
   * @param {string} userAccountAddress - The blockchain address of the user account to check for ownership.
   * @param {any} nft - The NFT object or identifier to check ownership of. The exact structure or requirements
   *                    of this parameter depend on the implementation and the blockchain being interacted with.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the user account owns the specified NFT, otherwise `false`.
   */
  const getIsOwnNFT = async (userAccountAddress: string, nft: any) => {
    if (!connectedChainId || !userAccountAddress || !nft.address || !nft.id)
      return;

    let isOwnNFT;
    if (!getIsERC1155) throw new Error('getIsOwnNFT: No getIsERC1155');

    if (nft.parentAddress && (await getIsNestableNFT(nft.parentAddress))) {
      const nestableNFTContract = newReadOnlyContract(
        getChainIdAddressFromContractAddresses(
          connectedChainId,
          'NEXT_PUBLIC_NESTABLENFT_ERC1155_ADDRESS',
        ),
        FNFTNestableERC1155.abi,
      );

      try {
        const ownerAddress =
          (await nestableNFTContract.directOwnerOf(nft.parentId))?.[0] ??
          undefined;
        console.log('getIsOwnNFT: ownerAddress = ', ownerAddress);

        isOwnNFT =
          ownerAddress?.toString().toLowerCase() ===
          userAccountAddress.toLowerCase();
      } catch (error) {
        console.error(`getIsOwnNFT: Failed to get owner of token: ${error}`);
        // Handle the error appropriately here
      }
    } else if (await getIsERC1155(nft)) {
      const tipERC1155 = newReadOnlyContract(nft.address, TipERC1155.abi);
      try {
        isOwnNFT = (await tipERC1155.balanceOf(userAccountAddress, nft.id)) > 0;
      } catch (error) {
        console.error(
          `getIsOwnNFT: Failed to get whether owner of token: ${error}`,
        );
        // Handle the error appropriately here
      }
    }

    console.log('getIsOwnNFT: isOwnNFT = ', isOwnNFT);

    return isOwnNFT;
  };

  /**
   * Asynchronously retrieves the quantity of a specific NFT owned by a user.
   *
   * This function queries the blockchain to determine the quantity of a given NFT that is owned by the
   * specified user. It is useful for applications that need to display or verify the amount of a certain
   * NFT a user possesses, especially in contexts where multiple quantities of the same NFT can be owned.
   *
   * @param {string} userPub - The public address of the user whose NFT quantity is being queried.
   * @param {any} nft - The NFT object or identifier for which the quantity is being checked. The exact
   *                    structure or requirements of this parameter depend on the implementation and the
   *                    blockchain being interacted with.
   * @returns {Promise<number>} A promise that resolves to the quantity of the specified NFT owned by the user.
   */
  const getNFTQuantity = async (userPub: string, nft: any) => {
    const userAuthProfile = await getUserProfile(userPub);

    let quantity = Zero;
    if (!getNFTQuantityFromStandard)
      throw new Error('getNFTQuantity: No getNFTQuantityFromStandard');

    if (nft.parentAddress && nft.parentId) {
      quantity = await getNFTQuantityFromStandard(userPub, {
        address: nft.parentAddress,
        id: nft.parentId,
      });
    } else {
      quantity = await getNFTQuantityFromStandard(userPub, nft);
    }

    console.log('getNFTQuantity: quantity = ', quantity);
    return quantity;
  };

  /**
   * Approves a spender to manage all assets of the specified NFT by interacting with the TipERC1155 contract.
   *
   * @param {Object} nft - The NFT object containing the address of the NFT contract.
   * @param {string} spender - The address of the spender to be approved.
   * @returns {Promise<void>} A promise that resolves when the approval transaction is processed.
   */
  const approve = async (nft: any, spender: string) => {
    const tipERC1155Contract = newContract(
      nft.address,
      TipERC1155.abi,
      smartAccountProvider,
    );

    const { receipt } = await processTransactionBundle([
      [
        await tipERC1155Contract.populateTransaction.setApprovalForAll(
          spender,
          true,
        ),
        nft.address,
      ],
    ]);

    console.log('useMintNFT: approve receipt = ', receipt);
  };

  return {
    isLoading,
    error,
    getIsNestableNFT,
    addChildToNestableNFT,
    removeChildFromNestableNFT,
    mintNestableNFT,
    getChildrenOfNestableNFT,
    getChildOfNestableNFT,
    getIsOwnNFT,
    getNFTQuantity,
    approve,
  };
}
