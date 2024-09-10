import useMintNFT from '../blockchain/useMintNFT';
import { dbClientOnce } from '../GlobalOrbit';
import { user } from '../../src/user';
import { getNFTAddressId } from '../utils/nftUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { getSmartAccountAddress } from '../blockchain/useAccountAbstractionPayment';

require('gun/lib/load.js');

export default function useNFTSale() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId, smartAccount } = blockchainContext;

  const { getIsOwnNFT } = useMintNFT();

  /**
   * Asynchronously removes NFTs that are not owned by the current user.
   *
   * This function fetches the list of NFTs and filters out the ones that are not owned
   * by the current user. It performs the necessary asynchronous operations to retrieve
   * and process the NFT data.
   *
   * @async
   * @function removeNFTsNotOwned
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  const removeNFTsNotOwned = async () => {
    const nftsRetrieved = await dbClientOnce(
      user.get('nfts'),
      process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    );

    console.log('removeNFTsNotOwned: nftsRetrieved = ', nftsRetrieved);

    if (!nftsRetrieved) return;

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);

    for (const nft of nftsRetrieved) {
      const isOwnNFT = await getIsOwnNFT(smartAccountAddress, nft);
      if (!isOwnNFT) {
        console.log('removeNFTsNotOwned: nft = ', nft);
        const nftAddressId = getNFTAddressId(nft);
        user.get('nfts').get(nftAddressId).put(null);
      }
    }
  };

  return {
    removeNFTsNotOwned,
  };
}
