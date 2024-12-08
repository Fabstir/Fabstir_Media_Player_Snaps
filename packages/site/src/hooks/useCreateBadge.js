import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { getUser } from '../GlobalOrbit';
import { stringifyArrayProperties } from '../utils/stringifyProperties';
import { getBadgeAddressId } from '../utils/badgeUtils.js';

export default function useCreateBadge() {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const user = getUser();

  return useMutation(
    (badge) => {
      console.log('useCreateBadge: badge = ', badge);

      const newBadge = stringifyArrayProperties(badge);
      const badgeAddressId = getBadgeAddressId(newBadge);
      console.log('useCreateBadge: badgeAddressId = ', badgeAddressId);

      user.get('badges').get(badgeAddressId).put(newBadge);
      console.log('useCreateBadge: badge.address = ', badge.address);
    },
    {
      onMutate: async (newBadge) => {
        await queryClient.cancelQueries([userAuthPub, 'badges']);

        const previousBadges = queryClient.getQueryData([
          userAuthPub,
          'badges',
        ]);

        queryClient.setQueryData([userAuthPub, 'badges'], (oldData) => {
          return [...(oldData || []), newBadge];
        });

        return { previousBadges };
      },
      onError: (error, newBadge, context) => {
        queryClient.setQueryData(
          [userAuthPub, 'badges'],
          context.previousBadges,
        );
        console.error('useCreateBadgeToGive: error = ', error);
      },
      onSettled: () => {
        queryClient.invalidateQueries([userAuthPub, 'badges']);
      },
    },
  );
}
