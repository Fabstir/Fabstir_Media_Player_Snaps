import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import { useRecoilValue } from 'recoil';
import { currentbadgemetadata } from '../atoms/badgeSlideOverAtom.js';
import { userpubstate } from '../atoms/userAtom';
import { user } from '../user';
import { getBadgeAddressId } from '../utils/badgeUtils.js';

export default function useDeleteBadge(userAuthPub) {
  const currentBadge = useRecoilValue(currentbadgemetadata);
  const userPub = useRecoilValue(userpubstate);

  return useMutation(
    async (badge) => {
      console.log(`useDeleteBadge: badge.address=${badge.address}`);

      if (userAuthPub === userPub && currentBadge.address === badge.address) {
        //        gun.get('badges').get(badge.address).put(null)
        user.get('badges').get(getBadgeAddressId(badge)).put(null);
      } else throw new Error('Not authorised to delete badge');
    },
    {
      onError: (error, variables, rollback) => {
        rollback && rollback();
      },
      onSuccess: (data, badge) => {
        // delete Badge cache
        const previousBadges = queryClient.getQueryData([userPub, 'badges']);

        const optimisticBadges = previousBadges.filter(
          (d) => d && d.address !== badge.address,
        );

        queryClient.setQueryData([userPub, 'badges'], optimisticBadges);
        queryClient.invalidateQueries([userPub, 'badges']);

        queryClient.getQueryData([userPub, 'badges']);

        console.log('useDeleteBadge: badge.address = ', badge.address);
        console.log('useDeleteBadge: badge = ', badge);
      },
    },
  );
}
