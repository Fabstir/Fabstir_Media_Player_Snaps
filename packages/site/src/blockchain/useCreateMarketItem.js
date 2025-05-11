import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero, Zero } from '@ethersproject/constants';

import { SEA } from 'gun';
import { user } from '../user';
import { FEA } from 'fabstirdb-lib';

import { useContext } from 'react';
import TipERC1155 from '../../contracts/TipERC1155.json';
import TipERC721 from '../../contracts/TipERC721.json';

import { useRecoilValue } from 'recoil';
import BlockchainContext from '../../state/BlockchainContext';
import useUserProfile from '../hooks/useUserProfile';

import FNFTMarketCreateFacet from '../../contracts/FNFTMarketCreateFacet.json';

import { userauthpubstate } from '../atoms/userAuthAtom';
import useAccountAbstractionPayment from './useAccountAbstractionPayment';
import { getAddressFromContractEvent } from '../utils/blockchainUtils';
import useMintNFT from './useMintNFT';
import useContractUtils from './useContractUtils';
import useEncKey from '../hooks/useEncKey';
import useMarketKeys from '../hooks/useMarketKeys';
import useCurrencyUtils from '../utils/useCurrencyUtils';
import { useMintNestableERC1155NFT } from './useMintNestableERC1155NFT';
import useMintNestableNFT from './useMintNestableNFT';
import {
  constructNFTAddressId,
  getCidWithoutKeyFromNFT,
} from '../utils/nftUtils';
import { fetchNFT } from '../hooks/useNFT.js';
import { connect } from '@particle-network/auth-core';
import { useConfig } from '../../state/configContext';

export default function useCreateMarketItem() {
  const config = useConfig();

  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId, smartAccountProvider, smartAccount } =
    blockchainContext;
  const { processTransactionBundle } =
    useAccountAbstractionPayment(smartAccount);
  const userAuthPub = useRecoilValue(userauthpubstate);
  const {
    getChainIdAddressFromChainIdAndAddress,
    getAddressFromChainIdAddress,
    newReadOnlyContract,
    newContract,
  } = useContractUtils();

  const { getChildrenOfNestableNFT, getIsNestableNFT } = useMintNestableNFT();

  const {
    getChildrenOfNestableNFT: getChildrenOfNestableERC1155NFT,
    getIsNestableNFT: getIsNestableERC1155NFT,
  } = useMintNestableERC1155NFT();

  const { getContractAddressFromCurrency } = useCurrencyUtils();

  const [getUserProfile] = useUserProfile();
  const { getIsERC721, getIsERC1155, getHoldersAndRatioFromNFT } = useMintNFT();
  const getEncKey = useEncKey();

  const { createMediaSEAPair, putMediaKey, submitEncryptedMediaKey } =
    useMarketKeys();

  // Adds a ERC-721 to marketplace for auction
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
    creatorFeeRatio,
    resellerPub,
  ) => {
    const theNFT = nft.parentAddress
      ? await fetchNFT(
          userAuthPub,
          constructNFTAddressId(nft.parentAddress, nft.parentId),
        )
      : nft;

    const fnftMarketCreateFacet = newContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
      smartAccountProvider,
    );

    const tipERC721 = newContract(
      theNFT.address,
      TipERC721.abi,
      smartAccountProvider,
    );

    const owner = await tipERC721.ownerOf(theNFT.id);
    console.log('Owner of NFT:', owner);

    const userOps = [];

    userOps.push([
      await tipERC721.populateTransaction.approve(
        getAddressFromChainIdAddress(marketAddress),
        theNFT.id,
      ),
      theNFT.address,
    ]);

    await processTransactionBundle(userOps);

    const creatorUserProfile = await getUserProfile(nft.creator);

    const { holders, holdersRatio } = await getHoldersAndRatioFromNFT(nft);

    const baseToken = getContractAddressFromCurrency(currency);

    // if holders is empty, then msg.sender is used by the contract
    const marketItemInput = {
      itemId: BigNumber.from(0),
      tokenId: BigNumber.from(theNFT.id),
      seller: AddressZero,
      fnftToken: getAddressFromChainIdAddress(theNFT.address),
      baseToken,
      amount: howMuchTokens,
      startPrice,
      reservePrice,
      startTime,
      endTime,
      cancelTime,
      resellerFeeRatio,
      creator: creatorUserProfile.accountAddress,
      creatorFeeRatio,
      holders,
      holdersRatio,
      data: `${userAuthPub},${resellerPub}`,
    };

    console.log('createMarketNFT721Item: marketItemInput = ', marketItemInput);

    const { receipt } = await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.createMarketItem(
          marketItemInput,
        ),
        marketAddress, //fnftMarketCreateFacet.address,
      ],
    ]);

    try {
      const marketItemId = getAddressFromContractEvent(
        receipt,
        FNFTMarketCreateFacet.abi,
        'MarketItemStatusChanged',
        0,
      );

      console.log(
        'createMarketNFT721Item: marketItemCreatedEvent = ',
        marketItemId,
      );
      return marketItemId;
    } catch (error) {
      console.error('Error fetching marketItemCreatedEvent:', error);
      return null;
    }
  };

  // Adds a ERC-1155 to marketplace for auction
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
    creatorFeeRatio,
    resellerPub,
  ) => {
    const theNFT = nft.parentAddress
      ? await fetchNFT(
          userAuthPub,
          constructNFTAddressId(nft.parentAddress, nft.parentId),
        )
      : nft;

    const fnftMarketCreateFacet = newContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
      smartAccountProvider,
    );

    const tipERC1155 = newContract(
      theNFT.address,
      TipERC1155.abi,
      smartAccountProvider,
    );

    const userOps = [];

    const userAuthProfile = await getUserProfile(userAuthPub);
    // const isApproved = await tipERC1155.isApprovedForAll(
    //   userAuthProfile.accountAddress,
    //   getAddressFromChainIdAddress(marketAddress)
    // )

    // if (!isApproved) {
    userOps.push([
      await tipERC1155.populateTransaction.setApprovalForAll(
        getAddressFromChainIdAddress(marketAddress),
        true,
      ),
      theNFT.address,
    ]);
    await processTransactionBundle(userOps);
    // }

    const creatorUserProfile = await getUserProfile(nft.creator);
    const { holders, holdersRatio } = await getHoldersAndRatioFromNFT(theNFT);

    const marketItemInput = {
      itemId: BigNumber.from(0),
      tokenId: BigNumber.from(theNFT.id),
      seller: AddressZero,
      fnftToken: getAddressFromChainIdAddress(theNFT.address),
      baseToken: getContractAddressFromCurrency(currency),
      amount: howMuchTokens,
      startPrice,
      reservePrice,
      startTime,
      endTime,
      cancelTime,
      resellerFeeRatio,
      creator: creatorUserProfile.accountAddress,
      creatorFeeRatio,
      holders,
      holdersRatio,
      data: `${userAuthPub},${resellerPub}`,
    };

    const { receipt } = await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.createMarketItem(
          marketItemInput,
        ),
        marketAddress, //fnftMarketCreateFacet.address,
      ],
    ]);

    try {
      const marketItemId = getAddressFromContractEvent(
        receipt,
        FNFTMarketCreateFacet.abi,
        'MarketItemStatusChanged',
        0,
      );

      console.log(
        'createMarketNFT1155Item: marketItemCreatedEvent = ',
        marketItemId,
      );
      return marketItemId;
    } catch (error) {
      console.error('Error fetching marketItemCreatedEvent:', error);
      return null;
    }
  };

  const createMarketNFTItem = async (
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
    creatorFeeRatio,
    resellerPub,
  ) => {
    let marketItemId;
    if (await getIsERC721(nft)) {
      marketItemId = await createMarketNFT721Item(
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
        creatorFeeRatio,
        resellerPub,
      );
    } else if (await getIsERC1155(nft)) {
      marketItemId = await createMarketNFT1155Item(
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
        creatorFeeRatio,
        resellerPub,
      );
    } else throw new Error('createMarketNFTItem: NFT type not supported');

    if (!marketItemId) return; // when the market item is placed in the pending state

    storeMediaKeyLicense(nft, marketAddress, marketItemId.toNumber());
    return marketItemId;
  };

  const storeMediaKeyLicenseForNFT = async (
    nft,
    marketAddress,
    marketItemId,
  ) => {
    const key = await getEncKey(userAuthPub, nft);

    if (key) {
      // A new salesSeaPair is generated specifically for the sale.
      const mediaSEAPair = await createMediaSEAPair();
      const cidWithoutKey = getCidWithoutKeyFromNFT(nft);

      // The seller retrieves the existing video decryption key from their GUN user graph

      // The video key is then re-encrypted with the salesSeaPair's public key and stored in a marketplace node within the seller's user graph
      await putMediaKey(cidWithoutKey, mediaSEAPair, key);

      const passphrase = await FEA.secret(
        config.subscriptionControllerEPub,
        user._.sea,
      );

      // The seller encrypts the mediaSEAPair with the subscription controller's public key
      const scrambledMediaSEAPair = await SEA.encrypt(
        { mediaSEAPair, marketAddress, marketItemId },
        passphrase,
      );
      await submitEncryptedMediaKey(
        userAuthPub,
        cidWithoutKey,
        scrambledMediaSEAPair,
      );
      console.log(
        'storeMediaKeyLicenseForNFT: scrambledMediaSEAPair = ',
        scrambledMediaSEAPair,
      );
    }
  };

  const storeMediaKeyLicense = async (nft, marketAddress, marketItemId) => {
    const theNFT = nft.parentAddress
      ? await fetchNFT(
          userAuthPub,
          constructNFTAddressId(nft.parentAddress, nft.parentId),
        )
      : nft;

    // The seller retrieves the existing video decryption key from their GUN user graph
    if (await getIsNestableNFT(theNFT.address)) {
      const children = await getChildrenOfNestableNFT(theNFT.id);
      console.log('storeMediaKeyLicense: children = ', children);

      for (const child of children) {
        const childNFT = await fetchNFT(
          userAuthPub,
          constructNFTAddressId(
            getChainIdAddressFromChainIdAndAddress(
              connectedChainId,
              child.contractAddress,
            ),
            child.tokenId,
          ),
        );
        await storeMediaKeyLicenseForNFT(childNFT, marketAddress, marketItemId);
        console.log('storeMediaKeyLicense: childNFT = ', childNFT);
      }
    } else if (await getIsNestableERC1155NFT(theNFT.address)) {
      const children = await getChildrenOfNestableERC1155NFT(theNFT.id);
      console.log('storeMediaKeyLicense: children = ', children);

      for (const child of children) {
        const childNFT = await fetchNFT(
          userAuthPub,
          constructNFTAddressId(
            getChainIdAddressFromChainIdAndAddress(
              connectedChainId,
              child.contractAddress,
            ),
            child.tokenId,
          ),
        );
        await storeMediaKeyLicenseForNFT(childNFT, marketAddress, marketItemId);
      }
    } else
      await storeMediaKeyLicenseForNFT(theNFT, marketAddress, marketItemId);
  };

  const getMarketFabstirFeeRatio = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const fabstirFeeRatio = await fnftMarketCreateFacet.fabstirFeeRatio();
    return fabstirFeeRatio;
  };

  const getMarketPlatformFeeRatio = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const platformFeeRatio = await fnftMarketCreateFacet.platformFeeRatio();
    return platformFeeRatio;
  };

  const getMarketPlatformCreatorFeeRatio = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const platformCreatorFeeRatio =
      await fnftMarketCreateFacet.platformCreatorFeeRatio();

    console.log(
      'getMarketPlatformCreatorFeeRatio: platformCreatorFeeRatio',
      platformCreatorFeeRatio,
    );
    return platformCreatorFeeRatio;
  };

  const deleteMarketItemPending = async (marketAddress, marketItemId) => {
    const fnftMarketCreateFacet = newContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
      smartAccountProvider,
    );

    await processTransactionBundle([
      await fnftMarketCreateFacet.populateTransaction.deleteMarketItemPending(
        marketItemId,
      ),
      fnftMarketCreateFacet.address,
    ]);
  };

  // extra parameters for platform unlock fee and period for subscriptions
  const getMarketPlatformUnlockFee = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const platformUnlockFee = await fnftMarketCreateFacet.platformUnlockFee();
    return platformUnlockFee;
  };

  const getMarketPlatformUnlockPeriod = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const platformUnlockPeriod =
      await fnftMarketCreateFacet.platformUnlockPeriod();
    return platformUnlockPeriod;
  };

  const getMarketPlatformUnlockFeeToken = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const platformUnlockFeeToken =
      await fnftMarketCreateFacet.platformUnlockFeeToken();
    return platformUnlockFeeToken;
  };

  return {
    createMarketNFT721Item,
    createMarketNFT1155Item,
    deleteMarketItemPending,
    getMarketFabstirFeeRatio,
    getMarketPlatformFeeRatio,
    getMarketPlatformCreatorFeeRatio,
    createMarketNFTItem,
    storeMediaKeyLicense,
    getMarketPlatformUnlockFee,
    getMarketPlatformUnlockPeriod,
    getMarketPlatformUnlockFeeToken,
  };
}
