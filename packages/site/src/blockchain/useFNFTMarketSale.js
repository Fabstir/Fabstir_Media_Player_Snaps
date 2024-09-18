import { ethers } from 'ethers';
import { useContext } from 'react';
import FNFTMarketCreateFacet from '../../contracts/FNFTMarketCreateFacet.json';
import FNFTMarketSaleFacet from '../../contracts/FNFTMarketSaleFacet.json';
import SimpleToken from '../../contracts/SimpleToken.json';
import BlockchainContext from '../../state/BlockchainContext';

import useAccountAbstractionPayment, {
  getSmartAccountAddress,
} from './useAccountAbstractionPayment';
import {
  getAddressFromContractEvent,
  logAllEventsFromReceipt,
} from '../utils/blockchainUtils';
import useContractUtils from './useContractUtils';
import useCreateMarketItem from './useCreateMarketItem';
import useCurrencyUtils from '../utils/useCurrencyUtils';

export default function useFNFTMarketSale(fnftMarketAddress) {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId, smartAccountProvider, smartAccount } =
    blockchainContext;

  const { processTransactionBundle } =
    useAccountAbstractionPayment(smartAccount);
  const {
    getChainIdAddressFromContractAddresses,
    getChainIdAddressFromChainIdAndAddress,
    getAddressFromChainIdAddress,
    newReadOnlyContract,
    newContract,
    getDefaultCurrencySymbolFromChainId,
  } = useContractUtils();

  const {
    getContractAddressFromCurrency,
    getCurrencyFromContractAddress,
    getDecimalPlaceFromCurrency,
  } = useCurrencyUtils();

  const { storeMediaKeyLicense } = useCreateMarketItem();

  const fnftMarketCreateFacet = fnftMarketAddress
    ? newContract(
        fnftMarketAddress,
        FNFTMarketCreateFacet.abi,
        smartAccountProvider,
      )
    : null;

  const fnftMarketSaleFacet = fnftMarketAddress
    ? newContract(
        fnftMarketAddress,
        FNFTMarketSaleFacet.abi,
        smartAccountProvider,
      )
    : null;

  const fetchMarketItem = async (itemId) => {
    const marketItem = await fnftMarketCreateFacet?.fetchMarketItem(itemId);
    return marketItem;
  };

  const fetchMarketItemsFrom = async (marketAddress) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const marketItems = await fnftMarketCreateFacet.fetchMarketItems();

    console.log(`useFNFTMarketSale: marketItems = ${marketItems}`);
    return marketItems;
  };

  const fetchMarketItems = async () => {
    const marketItems = await fnftMarketCreateFacet?.fetchMarketItems();

    console.log(`useFNFTMarketSale: marketItems = ${marketItems}`);
    return marketItems;
  };

  const fetchMarketItemsPending = async () => {
    const marketItemsPending =
      await fnftMarketCreateFacet?.fetchMarketItemsPending();

    console.log(
      `useFNFTMarketSale: fetchMarketItemsPending = ${marketItemsPending}`,
    );
    return marketItemsPending;
  };

  const makeMarketSale = async (userPub, itemId, fnftToken) => {
    await processTransactionBundle([
      [
        await fnftMarketSaleFacet.populateTransaction.makeMarketSale(
          itemId,
          fnftToken,
        ),
        fnftMarketSaleFacet.address,
      ],
    ]);

    return true;
  };

  const fetchMarketItemsSoldFrom = async (marketAddress, itemId) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const marketItemsSold =
      await fnftMarketCreateFacet.fetchMarketItemsSold(itemId);

    console.log(
      'useFNFTMarketSale: fetchMarketItemsSold: marketItemsSold = ',
      marketItemsSold,
    );
    return marketItemsSold;
  };

  const fetchMarketItemsSold = async (itemId) => {
    if (fnftMarketCreateFacet) {
      const marketItemsSold = await fnftMarketCreateFacet.fetchMarketItemsSold(
        ethers.BigNumber.from(itemId),
      );

      console.log(
        'useFNFTMarketSale: fetchMarketItemsSold: marketItemsSold = ',
        marketItemsSold,
      );
      return marketItemsSold;
    }
  };

  const createMarketSale = async (
    currency,
    itemId,
    fnftToken,
    valueSold,
    reseller,
  ) => {
    const erc20Token = newContract(
      getContractAddressFromCurrency(currency),
      SimpleToken.abi,
      smartAccountProvider,
    );

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);
    const balance = await erc20Token.balanceOf(smartAccountAddress);

    if (balance.lt(ethers.BigNumber.from(valueSold))) {
      alert('Not enough balance in your account.');
      return false;
    }

    const userOps = [];

    userOps.push([
      await erc20Token.populateTransaction.approve(
        getAddressFromChainIdAddress(fnftMarketAddress),
        valueSold,
      ),
      erc20Token.address,
    ]);

    //    createTransaction().to(erc20Token.address).data(txErc20TokenApprove.data)

    userOps.push([
      await fnftMarketSaleFacet.populateTransaction.createMarketSale(
        itemId,
        fnftToken,
        valueSold,
        reseller || ethers.constants.AddressZero,
      ),
      getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        fnftMarketSaleFacet.address,
      ),
    ]);

    console.log('useFNFTMarketSale: userOps= ', userOps);

    const { receipt } = await processTransactionBundle(userOps);
    logAllEventsFromReceipt(receipt, FNFTMarketSaleFacet.abi);

    console.log('useFNFTMarketSale: createMarketSale: exit');

    return true;
  };

  const fetchMyNFTsBoughtFrom = async (marketAddress, userPub) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    const marketItemsSold = await fnftMarketCreateFacet.fetchMyNFTsBought();

    console.log(
      'useFNFTMarketSale: fetchMyNFTsBoughtFrom: marketAddress = ',
      marketAddress,
    );
    console.log(
      'useFNFTMarketSale: fetchMyNFTsBoughtFrom: userPub = ',
      userPub,
    );
    console.log(
      'useFNFTMarketSale: fetchMyNFTsBoughtFrom: marketItemsSold = ',
      marketItemsSold,
    );
    return marketItemsSold;
  };

  const fetchMyNFTsBought = async (userPub) => {
    try {
      const marketItemsSold = await fetchMyNFTsBoughtFrom(
        fnftMarketAddress,
        userPub,
      );

      return marketItemsSold;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const fetchMyNFTsSoldFrom = async (marketAddress, userPub) => {
    const fnftMarketCreateFacet = newReadOnlyContract(
      marketAddress,
      FNFTMarketCreateFacet.abi,
    );

    try {
      const marketItemsSold = await fnftMarketCreateFacet.fetchMyNFTsSold();

      console.log(
        'useFNFTMarketSale: fetchMyNFTsSoldFrom: marketAddress = ',
        marketAddress,
      );
      console.log(
        'useFNFTMarketSale: fetchMyNFTsSoldFrom: userPub = ',
        userPub,
      );
      console.log(
        'useFNFTMarketSale: fetchMyNFTsSoldFrom: marketItemsSold = ',
        marketItemsSold,
      );
      return marketItemsSold;
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchMyNFTsSold = async (userPub) => {
    try {
      const marketItemsSold = await fetchMyNFTsSoldFrom(
        fnftMarketAddress,
        userPub,
      );
      return marketItemsSold;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const getPrice = async (itemId) => {
    const price = await fnftMarketSaleFacet.price(itemId);
    return price;
  };

  const getMarketItemStatusAmount = async (marketItemStatus, itemId) => {
    console.log('getIsMarketStatus: itemId = ', itemId);
    const marketItemStatusAmount =
      await fnftMarketCreateFacet?.getMarketItemStatusAmount(
        marketItemStatus,
        itemId,
      );

    console.log(
      'getIsMarketStatus: marketItemStatusAmount = ',
      marketItemStatusAmount,
    );
    return marketItemStatusAmount;
  };

  // const cancelMarket = async (userPub, itemId) => {
  //   if (!fnftMarketCreateFacet)
  //     throw new Error(
  //       'useFNFTMarketSale: No fnftMarketCreateFacet, unable to cancel market'
  //     )

  //   await processTransactionBundle([
  //     [
  //       await fnftMarketCreateFacet.populateTransaction.cancelMarket(itemId),
  //       fnftMarketCreateFacet.address,
  //     ],
  //   ])
  // }

  const getBuyNowAllocatedAmount = async (nft) => {
    const theMarketItems = await fetchMarketItems();

    let theBuyNowAllocatedAmount = 0;

    if (theMarketItems)
      for (const marketItem of theMarketItems) {
        if (
          marketItem.fnftToken &&
          getChainIdAddressFromChainIdAndAddress(
            connectedChainId,
            marketItem.fnftToken,
          ) === nft?.address &&
          marketItem.tokenId.toString() === nft?.id
        ) {
          const isMarketItemActive = await getIsMarketItemActive(
            marketItem.itemId,
          );
          console.log(
            'DetailsSidebar: isMarketItemActive = ',
            isMarketItemActive,
          );

          if (isMarketItemActive) {
            if (marketItem.startPrice.eq(marketItem.reservePrice)) {
              theBuyNowAllocatedAmount += Number(marketItem.amount);
            }
          }
        }
      }

    return theBuyNowAllocatedAmount;
  };

  const getAuctionAllocatedAmount = async (nft) => {
    const theMarketItems = await fetchMarketItems();

    let theAuctionAllocatedAmount = 0;

    if (theMarketItems)
      for (const marketItem of theMarketItems) {
        if (
          marketItem.fnftToken &&
          getChainIdAddressFromChainIdAndAddress(
            connectedChainId,
            marketItem.fnftToken,
          ) === nft?.address &&
          marketItem.tokenId.toString() === nft?.id
        ) {
          const isMarketItemActive = await getIsMarketItemActive(
            marketItem.itemId,
          );
          console.log(
            'DetailsSidebar: isMarketItemActive = ',
            isMarketItemActive,
          );

          if (isMarketItemActive) {
            if (!marketItem.startPrice.eq(marketItem.reservePrice)) {
              theAuctionAllocatedAmount += Number(marketItem.amount);
            }
          }
        }
      }

    return theAuctionAllocatedAmount;
  };

  const getBuyNowAndAuctionAllocatedAmount = async ({
    theMarketItems,
    nft,
    setNFTCurrency,
    setNFTPrice,
    setNFTStartPrice,
    setNFTReservePrice,
    setNFTAmount,
  }) => {
    let buyNowAllocatedAmount = 0;
    let auctionAllocatedAmount = 0;

    if (theMarketItems)
      for (const marketItem of theMarketItems) {
        if (
          marketItem.fnftToken &&
          getChainIdAddressFromChainIdAndAddress(
            connectedChainId,
            marketItem.fnftToken,
          ) === nft?.address &&
          marketItem.tokenId.toString() === nft?.id.toString()
        ) {
          const isMarketItemActive = await getIsMarketItemActive(
            marketItem.itemId,
          );
          console.log(
            'DetailsSidebar: isMarketItemActive = ',
            isMarketItemActive,
          );

          if (isMarketItemActive) {
            setNFTCurrency(
              getCurrencyFromContractAddress(marketItem.baseToken),
            );

            const numOfDecimalPlaces = getDecimalPlaceFromCurrency(
              getCurrencyFromContractAddress(marketItem.baseToken),
            );

            const formattedStartPrice = ethers.utils.formatUnits(
              marketItem.startPrice,
              numOfDecimalPlaces,
            );

            if (marketItem.startPrice.eq(marketItem.reservePrice)) {
              buyNowAllocatedAmount += Number(marketItem.amount);

              setNFTPrice(formattedStartPrice);
            } else {
              setNFTStartPrice(formattedStartPrice);

              const formattedReservePrice = ethers.utils.formatUnits(
                marketItem.reservePrice,
                numOfDecimalPlaces,
              );
              setNFTReservePrice(formattedReservePrice);

              auctionAllocatedAmount += Number(marketItem.amount);
            }

            setNFTAmount(buyNowAllocatedAmount + auctionAllocatedAmount);
          }
        }
      }

    return {
      buyNowAllocatedAmount,
      auctionAllocatedAmount,
    };
  };

  const acceptMarketNFT = async (nft, amount) => {
    const { receipt } = await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.acceptMarketItemsPending(
          [nft.itemId],
          [amount],
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);

    try {
      const marketItemId = getAddressFromContractEvent(
        receipt,
        FNFTMarketCreateFacet.abi,
        'MarketItemCreated',
        0,
      );

      console.log(
        'createMarketNFT721Item: marketItemCreatedEvent = ',
        marketItemId,
      );

      await storeMediaKeyLicense(
        nft,
        fnftMarketAddress,
        marketItemId.toNumber(),
      );

      return marketItemId;
    } catch (error) {
      console.error('Error fetching marketItemCreatedEvent:', error);
      return null;
    }
  };

  const rejectMarketNFT = async (nft, amount) => {
    await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.deleteMarketItemsPending(
          [nft.itemId],
          [amount],
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);
  };

  const cancelMarketItem = async (marketItemId, amount) => {
    await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.removeMarketItems(
          [marketItemId],
          [amount],
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);
  };

  const deleteMarketNFT = async (nft, amount) => {
    await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.deleteMarketItemsPending(
          [nft.itemId],
          [amount],
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);
  };

  const removeMarketNFT = async (nft, amount) => {
    await processTransactionBundle([
      [
        await fnftMarketCreateFacet.populateTransaction.removeMarketItems(
          [nft.itemId],
          [amount],
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);
  };

  const cancelMarketNFT = async (nft, amount) => {
    await processTransactionBundle([
      [
        // Reusing the removeMarketItems for removal, for cancel as well
        // to save on contract size
        await fnftMarketCreateFacet.populateTransaction.removeMarketItems(
          [nft.itemId],
          [amount],
        ),
        fnftMarketCreateFacet.address,
      ],
    ]);
  };

  const MarketItemStatus = {
    Accepted: 0,
    Pending: 1,
    Rejected: 2,
    Deleted: 3,
    Cancelled: 4,
    Removed: 5,
    Sold: 6,
  };

  const getIsMarketItemActive = async (itemId) => {
    console.log('getIsMarketItemActive: itemId = ', itemId);
    const isMarketItemActive_ =
      await fnftMarketCreateFacet?.isMarketItemActive(itemId);

    console.log(
      'getIsMarketItemActive: isMarketItemActive_ = ',
      isMarketItemActive_,
    );
    return isMarketItemActive_;
  };

  return {
    fetchMarketItem,
    fetchMarketItemsFrom,
    fetchMarketItems,
    fetchMarketItemsPending,
    makeMarketSale,
    fetchMarketItemsSoldFrom,
    fetchMarketItemsSold,
    createMarketSale,
    fetchMyNFTsBoughtFrom,
    fetchMyNFTsBought,
    fetchMyNFTsSoldFrom,
    fetchMyNFTsSold,
    getPrice,
    getMarketItemStatusAmount,
    cancelMarketItem,
    getBuyNowAllocatedAmount,
    getAuctionAllocatedAmount,
    getBuyNowAndAuctionAllocatedAmount,
    acceptMarketNFT,
    rejectMarketNFT,
    removeMarketNFT,
    deleteMarketNFT,
    cancelMarketNFT,
    MarketItemStatus,
    getIsMarketItemActive,
  };
}
