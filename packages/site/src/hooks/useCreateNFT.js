import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import { saveState, loadState } from '../utils';

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
 * and recoil to manage the state.
 *
 * @function
 * @returns {Object} - The result object from the useMutation hook, which includes data, error, and other properties.
 */
export default function useCreateNFT() {
  return useMutation(
    /**
     * The mutation function which is called when the mutation is triggered.
     * It saves the new NFT data to the state.
     *
     * @async
     * @function
     * @param {Object} nftJSON - The JSON representation of the NFT to be created.
     */
    async (nftJSON) => {
      console.log('useCreateNFT: nft = ', nftJSON);

      let newState;

      if (nftJSON?.video) {
        //        await transcodeVideo(nft, encryptionKey, true);
        newState = { isTranscodePending: true };
      } else newState = {};

      await saveNFTtoState(`${nftJSON.address}_${nftJSON.id}`, newState);
      console.log('useCreateNFT: newState = ', newState);
    },
    {
      onMutate: (newNFT) => {
        console.log('useCreateNFT onMutate newNFT = ', newNFT);

        queryClient.cancelQueries(['nfts']);

        let oldNFTs = queryClient.getQueryData(['nfts']);
        console.log('useCreateNFT oldNFTs = ', oldNFTs);

        queryClient.setQueryData(['nfts'], (old) => {
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

        const newNFTs = queryClient.getQueryData(['nfts']);
        console.log('useCreateNFT newNFTs = ', newNFTs);

        return () => queryClient.setQueryData(['nfts'], oldNFTs);
      },
      onError: (error, newNFT, rollback) => {
        console.log('useCreateNFT: error = ', error);
        rollback();
      },
      onSuccess: (data, newNFT) => {
        queryClient.invalidateQueries(['nfts']);
        queryClient.refetchQueries(['nfts']);

        const updatedNFTs = queryClient.getQueryData(['nfts']);
        console.log('useCreateNFT: Updated NFTs:', updatedNFTs);
      },
    },
  );
}
