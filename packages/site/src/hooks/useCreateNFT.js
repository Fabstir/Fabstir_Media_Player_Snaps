import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';
import { user } from '../user';

import { stringifyArrayProperties } from '../utils/stringifyProperties';
import { getNFTAddressId } from '../utils/nftUtils.js';
import { saveState, loadState } from '../utils';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom.js';
import useFabstirController from './useFabstirController.js';

/**
 * Asynchronously saves the NFT data to the local state.
 *
 * @async
 * @function
 * @param {string} address - The address of the NFT.
 * @param {Object} nftState - The JSON representation of the NFT.
 */
export async function saveNFTtoState(address, nftState) {
  const theState = await loadState();
  const addresses = theState?.addresses?.state;
  console.log('useCreateNFT: addresses = ', addresses);

  const newAddresses = { ...(addresses ?? {}), [address]: nftState };
  console.log('useCreateNFT: newAddresses = ', newAddresses);

  await saveState(newAddresses);
  const newState = await loadState();
  console.log('useCreateNFT: newState = ', newState);
}

/**
 * Custom hook to create an NFT. It uses react-query's useMutation hook to handle the mutation,
 * and recoil to manage the state. NFT address is saved to either wallet sandboxed storage or FabstirDB.
 *
 * @function
 * @returns {Object} - The result object from the useMutation hook, which includes data, error, and other properties.
 */
export default function useCreateNFT() {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const { submitKeyToController } = useFabstirController();

  const userPub = user?.is?.pub;

  return useMutation(
    /**
     * The mutation function which is called when the mutation is triggered.
     * It saves the new NFT data to the state.
     *
     * @async
     * @function
     * @param {Object} nft - The JSON representation of the NFT to be created.
     */
    async (nft) => {
      console.log('useCreateNFT: nft = ', nft);

      let newState;

      if (nft?.video || nft?.audio) {
        //        await transcodeVideo(nft, encryptionKey, true);
        if (nft.encKey)
          newState = { isTranscodePending: true, encKey: nft.encKey };
        else newState = { isTranscodePending: true };
      } else newState = {};

      const { encKey, ...newNFTWithoutEncKey } = nft;
      const newNFT = stringifyArrayProperties(newNFTWithoutEncKey);
      const addressId = getNFTAddressId(newNFT);
      console.log('useCreateNFT: addressId = ', addressId);

      if (process.env.NEXT_PUBLIC_IS_USE_FABSTIRDB === 'true')
        user
          .get('nfts')
          .get(addressId)
          .put(newNFT, function (ack) {
            if (ack.err) {
              console.error('useCreateNFT: Error writing data:', ack.err);
            } else {
              console.log('useCreateNFT: newNFT.address = ', newNFT.address);
            }
          });
      else await saveNFTtoState(`${nft.address}_${nft.id}`, newState);
      console.log('useCreateNFT: newState = ', newState);

      if (nft.encKey) {
        await submitKeyToController(userAuthPub, addressId, nft.encKey);

        console.log('useCreateNFT: nft.encKey = ', nft.encKey);
        // console.log('useCreateNFT: encKey = ', encKey);
      }
    },
    {
      onMutate: (newNFT) => {
        console.log('useCreateNFT onMutate newNFT = ', newNFT);

        queryClient.cancelQueries([userPub, 'nfts']);

        let oldNFTs = queryClient.getQueryData([userPub, 'nfts']);
        console.log('useCreateNFT oldNFTs = ', oldNFTs);

        queryClient.setQueryData([userPub, 'nfts'], (old) => {
          return old
            ? [
                ...old,
                {
                  ...newNFT,
                  isPreview: true,
                },
              ]
            : [
                {
                  ...newNFT,
                  isPreview: true,
                },
              ];
        });

        const newNFTs = queryClient.getQueryData([userPub, 'nfts']);
        console.log('useCreateNFT newNFTs = ', newNFTs);

        return () => queryClient.setQueryData([userPub, 'nfts'], oldNFTs);
      },
      onError: (error, newNFT, rollback) => {
        console.log('useCreateNFT: error = ', error);
        rollback();
      },
      onSuccess: (data, newNFT) => {
        queryClient.invalidateQueries([userPub, 'nfts']);
        const currentNFTs = queryClient.getQueryData([userPub, 'nfts']) || [];
        const updatedNFTs = [...currentNFTs, newNFT]; // Or use `data` if it contains the updated list
        queryClient.setQueryData([userPub, 'nfts'], updatedNFTs);

        console.log('useCreateNFT: Updated NFTs:', updatedNFTs);
      },
    },
  );
}
