import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import { useRecoilValue } from 'recoil';
import { userpubstate } from '../atoms/userAtom';
import { dbClient } from '../GlobalOrbit';
import { user } from '../user';
import { getNFTAddressId } from '../utils/nftUtils.js';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom.js';
import useEncKey from './useEncKey.js';
import useDeleteEncKey from './useDeleteEncKey.js';

export default function useDeleteNFT(userAuthPub) {
  const userPub = useRecoilValue(userpubstate);
  const selectedParentNFTAddressId = useRecoilValue(selectedparentnftaddressid);
  const getEncKey = useEncKey();
  const deleteEncKey = useDeleteEncKey();

  return useMutation(
    async (nft) => {
      console.log(`useDeleteNFT: nft.address=${nft.address}`);

      if (userAuthPub === userPub) {
        user.get('nfts').get(getNFTAddressId(nft)).put(null);
        dbClient
          .user(userAuthPub)
          .get('chat rooms')
          .get(getNFTAddressId(nft))
          .put(null);

        user.get('nftSubscriptionPlans').get(getNFTAddressId(nft)).put(null);

        const encKey = await getEncKey(userAuthPub, nft);
        if (encKey) deleteEncKey(getNFTAddressId(nft));
      } else throw new Error('Not authorised to delete nft');
    },
    {
      onError: (error, variables, rollback) => {
        rollback && rollback();
      },
      onSuccess: (data, nft) => {
        // delete NFT cache
        const previousNFTs = queryClient.getQueryData([
          userPub,
          'nfts',
          selectedParentNFTAddressId,
        ]);

        const optimisticNFTs = previousNFTs.filter(
          (d) => d && d.address !== nft.address,
        );

        queryClient.setQueryData(
          [userPub, 'nfts', selectedParentNFTAddressId],
          optimisticNFTs,
        );
        queryClient.invalidateQueries([
          userPub,
          'nfts',
          selectedParentNFTAddressId,
        ]);

        queryClient.getQueryData([userPub, 'nfts', selectedParentNFTAddressId]);

        // delete chat room cache
        const previousChatRooms = queryClient.getQueryData([
          userPub,
          'chat rooms',
        ]);

        // chat room name is same as nft name
        if (previousChatRooms) {
          const optimisticChatRooms = previousChatRooms.filter(
            (d) => d && d.name !== nft.name,
          );

          queryClient.setQueryData(
            [userPub, 'chat rooms'],
            optimisticChatRooms,
          );
        }

        queryClient.invalidateQueries([userPub, 'chat rooms']);
        queryClient.getQueryData([userPub, 'chat rooms']);

        // delete subscriptionPlans cache
        const previousSubscriptionPlans = queryClient.getQueryData([
          userPub,
          'nftSubscriptionPlans',
        ]);

        if (previousSubscriptionPlans) {
          const optimisticSubscriptionPlans = previousSubscriptionPlans.filter(
            (d) => d && d.address !== nft.address,
          );

          queryClient.setQueryData(
            [userPub, 'nftSubscriptionPlans'],
            optimisticSubscriptionPlans,
          );
        }

        queryClient.invalidateQueries([userPub, 'nftSubscriptionPlans']);
        queryClient.getQueryData([userPub, 'nftSubscriptionPlans']);

        console.log('useDeleteNFT: nft.address = ', nft.address);
        console.log('useDeleteNFT: nft = ', nft);
      },
    },
  );
}
