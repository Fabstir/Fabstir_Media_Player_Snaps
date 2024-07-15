import { useRecoilValue } from 'recoil';
import useMintNestableNFT from '../blockchain/useMintNestableNFT';
import useDeleteNFT from './useDeleteNFT';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import useContractUtils from '../blockchain/useContractUtils';

export default function useDeleteNestableNFT() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const { getChainIdAddressFromChainIdAndAddress } = useContractUtils();
  const { getIsNestableNFT, getChildrenOfNestableNFT } = useMintNestableNFT();

  const userAuthPub = useRecoilValue(userauthpubstate);
  const { mutate: deleteNFT, ...deleteNFTInfo } = useDeleteNFT(userAuthPub);

  const deleteNestableNFT = async (nft) => {
    if (await getIsNestableNFT(nft.address)) {
      {
        getChildrenOfNestableNFT(nft.id).then(async (children) => {
          for (const child of children) {
            const nftAddress = getChainIdAddressFromChainIdAndAddress(
              connectedChainId,
              child.contractAddress,
            );

            const childNFT = {
              address: nftAddress,
              id: child.tokenId.toString(),
            };

            deleteNFT(childNFT);
          }
        });
      }
    } else {
      throw new Error('NFT is not nestable');
    }

    deleteNFT(nft);
  };

  return {
    deleteNestableNFT,
  };
}
