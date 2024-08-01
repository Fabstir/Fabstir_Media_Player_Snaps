import { ethers } from 'ethers';
import { useContext } from 'react';
import TipERC1155 from '../../contracts/TipERC1155.json';
import TipERC721 from '../../contracts/TipERC721.json';

import { useRecoilValue } from 'recoil';
import BlockchainContext from '../../state/BlockchainContext';
import { currencycontractaddressesstate } from '../atoms/currenciesAtom';
import useUserProfile from '../hooks/useUserProfile';

import FNFTMarketCreateFacet from '../../contracts/FNFTMarketCreateFacet.json';
import ITokenWhitelist from '../../contracts/ITokenWhitelist.json';
import FNFTMarketDiamond from '../../contracts/FNFTMarketDiamond.json';

import { userauthpubstate } from '../atoms/userAuthAtom';
import useAccountAbstractionPayment from './useAccountAbstractionPayment';
import { getAddressFromContractEvent } from '../utils/blockchainUtils';
import useMintNFT from './useMintNFT';
import useContractUtils from './useContractUtils';

/**
 * Custom hook to create a market item for sale on Fabstir's NFT marketplace.
 *
 * This hook provides the functionality to create a new item in the market.
 * It handles the necessary state and logic required for the creation process.
 *
 * @returns {Object} An object containing the state and functions to create a market item.
 */
export default function useCreateMarketItem() {
  const currencyContractAddresses = useRecoilValue(
    currencycontractaddressesstate,
  );

  const blockchainContext = useContext(BlockchainContext);
  const { smartAccountProvider, smartAccount } = blockchainContext;
  const { processTransactionBundle } =
    useAccountAbstractionPayment(smartAccount);
  const userAuthPub = useRecoilValue(userauthpubstate);
  const { newReadOnlyContract, newContract } = useContractUtils();

  const [getUserProfile] = useUserProfile();
  const { getHoldersAndRatioFromNFT } = useMintNFT();

  /**
   * Creates a market item for an ERC-721 NFT.
   *
   * This function handles the creation of a market item for an ERC-721 NFT, given the necessary parameters.
   *
   * @param {string} nftContractAddress - The address of the NFT contract.
   * @param {number} tokenId - The ID of the token to be listed.
   * @param {string} price - The price at which the NFT will be listed.
   * @param {string} seller - The address of the seller.
   * @returns {Promise<void>} A promise that resolves when the market item has been created.
   */
  const createMarketNFT721Item = async (
    marketAddress,
    nft,
    currency,
    howMuchTokens,
    startPrice,
    reservePrice,
    startTime,
    endTime,
    cancelTime,
    resellerFeeRatio,
  ) => {
    const fnftMarketCreateFacet = newContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
      smartAccountProvider,
    );

    const tipERC721 = newContract(
      nft.address,
      TipERC721.abi,
      smartAccountProvider,
    );

    const userOps = [];

    userOps.push([
      await tipERC721.populateTransaction.approve(marketAddress, nft.id),
      tipERC721.address,
    ]);

    const fnftMarketDiamond = newReadOnlyContract(
      marketAddress,
      FNFTMarketDiamond.abi,
    );

    const tokenWhitelistAddress = await fnftMarketDiamond.tokenWhitelist();

    const tokenWhitelist = newContract(
      tokenWhitelistAddress,
      ITokenWhitelist.abi,
      smartAccountProvider,
    );

    userOps.push([
      await tokenWhitelist.populateTransaction.addTokenToWhitelist(nft.address),
      tokenWhitelist.address,
    ]);

    userOps.push([
      await tokenWhitelist.populateTransaction.addTokenToWhitelist(
        currencyContractAddresses[currency],
      ),
      tokenWhitelist.address,
    ]);

    await processTransactionBundle(userOps);

    const isTokenWhitelist = await tokenWhitelist.isTokenInWhitelist(
      nft.address,
    );
    console.log('createMarketNFT721Item isTokenWhitelist = ', isTokenWhitelist);

    const creatorUserProfile = await getUserProfile(nft.creator);

    const { holders, holdersRatio } = await getHoldersAndRatioFromNFT(nft);

    // if holders is empty, then msg.sender is used by the contract
    const marketItemInput = {
      tokenId: ethers.BigNumber.from(nft.id),
      fnftToken: nft.address,
      baseToken: currencyContractAddresses[currency],
      amount: howMuchTokens,
      startPrice,
      reservePrice,
      startTime,
      endTime,
      cancelTime,
      creator: creatorUserProfile.accountAddress,
      resellerFeeRatio,
      holders,
      holdersRatio,
    };

    const { receipt } = await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.createMarketItem(
          marketItemInput,
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);

    const marketItemId = getAddressFromContractEvent(
      receipt,
      FNFTMarketCreateFacet.abi,
      'MarketItemCreated',
      0,
    );

    console.log('createMarketNFT721Item: marketItemId = ', marketItemId);

    return { marketItemId };
  };

  /**
   * Creates a market item for an ERC-721 NFT.
   *
   * This function handles the creation of a market item for an ERC-721 NFT, given the necessary parameters.
   * It processes the transaction and returns the created market item ID.
   *
   * @param {string} nftContractAddress - The address of the NFT contract.
   * @param {number} tokenId - The ID of the token to be listed.
   * @param {string} price - The price at which the NFT will be listed.
   * @param {string} seller - The address of the seller.
   * @returns {Promise<Object>} A promise that resolves to an object containing the market item ID.
   */
  const createMarketNFT1155Item = async (
    marketAddress,
    nft,
    currency,
    howMuchTokens,
    startPrice,
    reservePrice,
    startTime,
    endTime,
    cancelTime,
    resellerFeeRatio,
  ) => {
    const fnftMarketCreateFacet = newContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
      smartAccountProvider,
    );

    const tipERC1155 = newContract(
      nft.address,
      TipERC1155.abi,
      smartAccountProvider,
    );

    const userOps = [];

    const userAuthProfile = await getUserProfile(userAuthPub);
    const isApproved = await tipERC1155.isApprovedForAll(
      userAuthProfile.accountAddress,
      marketAddress,
    );

    if (!isApproved) {
      userOps.push([
        await tipERC1155.populateTransaction.setApprovalForAll(
          marketAddress,
          true,
        ),
        tipERC1155.address,
      ]);
    }

    const fnftMarketDiamond = newReadOnlyContract(
      marketAddress,
      FNFTMarketDiamond.abi,
    );

    const tokenWhitelistAddress = await fnftMarketDiamond.tokenWhitelist();

    const tokenWhitelist = newContract(
      tokenWhitelistAddress,
      ITokenWhitelist.abi,
      smartAccountProvider,
    );

    userOps.push([
      await tokenWhitelist.populateTransaction.addTokenToWhitelist(nft.address),
      tokenWhitelist.address,
    ]);

    userOps.push([
      await tokenWhitelist.populateTransaction.addTokenToWhitelist(
        currencyContractAddresses[currency],
      ),
      tokenWhitelist.address,
    ]);

    const creatorUserProfile = await getUserProfile(nft.creator);

    await processTransactionBundle(userOps);

    const { holders, holdersRatio } = await getHoldersAndRatioFromNFT(nft);

    const marketItemInput = {
      tokenId: ethers.BigNumber.from(nft.id),
      fnftToken: nft.address,
      baseToken: currencyContractAddresses[currency],
      amount: howMuchTokens,
      startPrice,
      reservePrice,
      startTime,
      endTime,
      cancelTime,
      creator: creatorUserProfile.accountAddress,
      resellerFeeRatio,
      holders,
      holdersRatio,
    };

    const { receipt } = await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.createMarketItem(
          marketItemInput,
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);

    const marketItemId = getAddressFromContractEvent(
      receipt,
      FNFTMarketCreateFacet.abi,
      'MarketItemCreated',
      0,
    );

    console.log('createMarketNFT1155Item: marketItemId = ', marketItemId);

    return { marketItemId };
  };

  /**
   * Retrieves the fee ratio taken by the NFT market's platform.
   *
   * This function fetches the platform fee ratio associated with the specified market address.
   *
   * @param {string} marketAddress - The address of the market for which the platform fee ratio is to be retrieved.
   * @returns {Promise<number>} A promise that resolves to the platform fee ratio as a number.
   */
  const getPlatformFeeRatio = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const platformFeeRatio = await fnftMarketCreateFacet.platformFeeRatio();
    return platformFeeRatio;
  };

  /**
   * Removes a market item from the specified market.
   *
   * This function handles the removal of a market item given its address and ID.
   *
   * @param {string} marketAddress - The address of the market from which the item should be removed.
   * @param {number} marketItemId - The ID of the market item to be removed.
   * @returns {Promise<void>} A promise that resolves when the market item has been removed.
   */
  const removeMarketItem = async (marketAddress, marketItemId) => {
    const fnftMarketCreateFacet = newContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
      smartAccountProvider,
    );

    const { receipt } = await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.removeMarketItem(
          marketItemId,
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);

    console.log('removeMarketItem: receipt = ', receipt);
    if (!receipt.isScuccess) {
      throw new Error('Failed to remove market item');
    }
  };

  return {
    createMarketNFT721Item,
    createMarketNFT1155Item,
    removeMarketItem,
    getPlatformFeeRatio,
  };
}
