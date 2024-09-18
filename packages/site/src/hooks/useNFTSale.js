import { dbClientOnce } from '../GlobalOrbit';
import { user } from '../../src/user';
import { getNFTAddressId } from '../utils/nftUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { getSmartAccountAddress } from '../blockchain/useAccountAbstractionPayment';
import useMintNestableNFT from '../blockchain/useMintNestableNFT';
import { useMintNestableERC1155NFT } from '../blockchain/useMintNestableERC1155NFT';
import useMintNFT from '../blockchain/useMintNFT';

require('gun/lib/load.js');

export default function useNFTSale() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId, smartAccount } = blockchainContext;

  const { getIsERC721, getIsERC1155 } = useMintNFT();
  const { getIsOwnNFT } = useMintNestableNFT();
  const { getIsOwnNFT: getIsOwnNFTERC1155 } = useMintNestableERC1155NFT();

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
      let isOwnNFT;

      if (await getIsERC721(nft))
        isOwnNFT = await getIsOwnNFT(smartAccountAddress, nft);
      else if (await getIsERC1155(nft))
        isOwnNFT = await getIsOwnNFTERC1155(smartAccountAddress, nft);
      else continue;

      if (isOwnNFT === false) {
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
