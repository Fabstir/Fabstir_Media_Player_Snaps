import { ethers } from 'ethers';
import useFNFTMarketSale from '../blockchain/useFNFTMarketSale';
import { fetchNFT } from './useNFT';
import { constructNFTAddressId } from '../utils/nftUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { bigNumberToFloat } from '../utils/blockchainUtils.js';
import { useRecoilValue } from 'recoil';
import useCurrencyUtils from '../utils/useCurrencyUtils.js';
import useContractUtils from '../blockchain/useContractUtils';

export default function useMarketNFTs(marketAddress) {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const { getChainIdAddressFromChainIdAndAddress } = useContractUtils();
  const {
    fetchMarketItem,
    fetchMarketItems,
    fetchMarketItemsPending,
    getMarketItemStatusAmount,
    getIsMarketItemActive,
    MarketItemStatus,
  } = useFNFTMarketSale(marketAddress);

  const { getCurrencyFromContractAddress, getDecimalPlaceFromCurrency } =
    useCurrencyUtils();

  const fetchMarketNFTs = async () => {
    const marketItems = await fetchMarketItems();
    const nftsActive = [];
    for (const marketItemElement of marketItems) {
      let nftAddressId = constructNFTAddressId(
        marketItemElement.fnftToken,
        marketItemElement.tokenId.toString(),
      );

      nftAddressId = getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        nftAddressId,
      );

      const marketItem = await fetchMarketItem(marketItemElement.itemId);
      console.log('useFNFTMarketSale: marketItem = ', marketItem);

      console.log('useMarketNFTs: nftAddressId', nftAddressId);
      const isMarketItemActive = await getIsMarketItemActive(marketItem.itemId);
      console.log('useMarketNFTs: isMarketItemActive', isMarketItemActive);
      if (isMarketItemActive) {
        const [sellerPub] = marketItem.data.split(',');
        if (!sellerPub) continue;

        const nft = await fetchNFT(sellerPub, nftAddressId);
        if (nft)
          nftsActive.push({ ...nft, itemId: marketItem.itemId.toString() });
      }
    }

    return nftsActive;
  };

  const fetchMarketNFTsBuyNow = async () => {
    const marketItems = await fetchMarketItems();
    const nftsActive = [];
    for (const marketItemElement of marketItems) {
      let nftAddressId = constructNFTAddressId(
        marketItemElement.fnftToken,
        marketItemElement.tokenId.toString(),
      );

      nftAddressId = getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        nftAddressId,
      );

      const marketItem = await fetchMarketItem(marketItemElement.itemId);
      console.log('useFNFTMarketSale: marketItem = ', marketItem);

      console.log('useMarketNFTs: nftAddressId', nftAddressId);
      const isMarketItemActive = await getIsMarketItemActive(marketItem.itemId);
      console.log('useMarketNFTs: isMarketItemActive', isMarketItemActive);

      const priceCurrency = getCurrencyFromContractAddress(
        marketItem.baseToken,
      );

      const numOfDecimalPlaces = getDecimalPlaceFromCurrency(priceCurrency);

      const startPriceCurrency = ethers.utils.formatUnits(
        marketItem.startPrice,
        numOfDecimalPlaces,
      );

      const reservePriceCurrency = ethers.utils.formatUnits(
        marketItem.reservePrice,
        numOfDecimalPlaces,
      );

      const MAX_UINT256 =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      if (isMarketItemActive) {
        const [sellerPub] = marketItem.data.split(',');
        if (!sellerPub) continue;

        const nft = await fetchNFT(sellerPub, nftAddressId);
        if (
          nft &&
          ethers.BigNumber.from(marketItem.startPrice).eq(
            ethers.BigNumber.from(marketItem.reservePrice),
          )
        ) {
          const startTime =
            marketItem.startTime.toHexString() === MAX_UINT256
              ? undefined
              : new Date(marketItem.startTime.toNumber() * 1000).toISOString();

          const endTime =
            marketItem.endTime.toHexString() === MAX_UINT256
              ? undefined
              : new Date(marketItem.endTime.toNumber() * 1000).toISOString();

          nftsActive.push({
            ...nft,
            itemId: marketItem.itemId.toString(),
            amount: marketItem.amount.toString(),
            startPrice: startPriceCurrency,
            reservePrice: reservePriceCurrency,
            priceCurrency,
            startTime,
            endTime,
            resellerFeePercentage:
              bigNumberToFloat(marketItem.resellerFeeRatio) * 100,
            creatorFeePercentage:
              bigNumberToFloat(marketItem.creatorFeeRatio) * 100,
          });
        }
      }
    }

    return nftsActive;
  };

  const fetchMarketNFTsAuction = async () => {
    const marketItems = await fetchMarketItems();

    const nftsActive = [];
    for (const marketItemElement of marketItems) {
      let nftAddressId = constructNFTAddressId(
        marketItemElement.fnftToken,
        marketItemElement.tokenId.toString(),
      );

      nftAddressId = getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        nftAddressId,
      );

      const marketItem = await fetchMarketItem(marketItemElement.itemId);
      console.log('useFNFTMarketSale: marketItem = ', marketItem);

      console.log('useMarketNFTs: nftAddressId', nftAddressId);
      const isMarketItemActive = await getIsMarketItemActive(marketItem.itemId);
      console.log('useMarketNFTs: isMarketItemActive', isMarketItemActive);

      const priceCurrency = getCurrencyFromContractAddress(
        marketItem.baseToken,
      );

      const numOfDecimalPlaces = getDecimalPlaceFromCurrency(priceCurrency);

      const startPriceCurrency = ethers.utils.formatUnits(
        marketItem.startPrice,
        numOfDecimalPlaces,
      );

      const reservePriceCurrency = ethers.utils.formatUnits(
        marketItem.reservePrice,
        numOfDecimalPlaces,
      );

      const MAX_UINT256 =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      if (isMarketItemActive) {
        const [sellerPub] = marketItem.data.split(',');
        if (!sellerPub) continue;

        const nft = await fetchNFT(sellerPub, nftAddressId);
        if (
          nft &&
          ethers.BigNumber.from(marketItem.startPrice).ne(
            ethers.BigNumber.from(marketItem.reservePrice),
          )
        ) {
          const startTime =
            marketItem.startTime.toHexString() === MAX_UINT256
              ? undefined
              : new Date(marketItem.startTime.toNumber() * 1000).toISOString();

          const endTime =
            marketItem.endTime.toHexString() === MAX_UINT256
              ? undefined
              : new Date(marketItem.endTime.toNumber() * 1000).toISOString();

          nftsActive.push({
            ...nft,
            itemId: marketItem.itemId.toString(),
            amount: marketItem.amount.toString(),
            startPrice: startPriceCurrency,
            reservePrice: reservePriceCurrency,
            priceCurrency,
            startTime,
            endTime,
            resellerFeePercentage:
              bigNumberToFloat(marketItem.resellerFeeRatio) * 100,
            creatorFeePercentage:
              bigNumberToFloat(marketItem.creatorFeeRatio) * 100,
          });
        }
      }
    }

    return nftsActive;
  };

  const fetchMarketNFTsPending = async () => {
    console.log('fetchMarketNFTsPending: marketItemsPending');
    const marketItemsPending = await fetchMarketItemsPending();

    console.log(
      'fetchMarketNFTsPending: marketItemsPending',
      marketItemsPending,
    );

    if (!marketItemsPending) return [];

    const nftsPending = [];
    for (const marketItemPending of marketItemsPending) {
      let nftAddressId = constructNFTAddressId(
        marketItemPending.fnftToken,
        marketItemPending.tokenId.toString(),
      );

      nftAddressId = getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        nftAddressId,
      );

      const priceCurrency = getCurrencyFromContractAddress(
        marketItemPending.baseToken,
      );

      const numOfDecimalPlaces = getDecimalPlaceFromCurrency(priceCurrency);

      const startPriceCurrency = ethers.utils.formatUnits(
        marketItemPending.startPrice,
        numOfDecimalPlaces,
      );

      const reservePriceCurrency = ethers.utils.formatUnits(
        marketItemPending.reservePrice,
        numOfDecimalPlaces,
      );

      const MAX_UINT256 =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const nft = await fetchNFT(marketItemPending.data, nftAddressId);
      if (nft) {
        const startTime =
          marketItemPending.startTime.toHexString() === MAX_UINT256
            ? undefined
            : new Date(
                marketItemPending.startTime.toNumber() * 1000,
              ).toISOString();

        const endTime =
          marketItemPending.endTime.toHexString() === MAX_UINT256
            ? undefined
            : new Date(
                marketItemPending.endTime.toNumber() * 1000,
              ).toISOString();

        nftsPending.push({
          ...nft,
          itemId: marketItemPending.itemId.toString(),
          amount: marketItemPending.amount.toString(),
          startPrice: startPriceCurrency,
          reservePrice: reservePriceCurrency,
          priceCurrency,
          startTime,
          endTime,
          resellerFeePercentage:
            bigNumberToFloat(marketItemPending.resellerFeeRatio) * 100,
          creatorFeePercentage:
            bigNumberToFloat(marketItemPending.creatorFeeRatio) * 100,
        });
      }
    }

    console.log('fetchMarketNFTsPending: nftsPending', nftsPending);
    return nftsPending;
  };

  const getMarketItemStatus = async (itemId) => {
    if (!itemId) return;

    let marketStatus = {};

    for (const [status, value] of Object.entries(MarketItemStatus)) {
      const amount = await getMarketItemStatusAmount(value, itemId);
      if (amount > 0) {
        marketStatus[status.toLowerCase()] = amount.toString();
      }
    }

    return marketStatus;
  };
  return {
    fetchMarketNFTs,
    fetchMarketNFTsPending,
    fetchMarketNFTsBuyNow,
    fetchMarketNFTsAuction,
    getMarketItemStatus,
  };
}
