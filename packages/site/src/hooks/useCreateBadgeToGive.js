import { useRecoilValue } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import { userpubstate } from '../atoms/userAtom';
import { getUser } from '../GlobalOrbit';
import { stringifyArrayProperties } from '../utils/stringifyProperties';

export default function useCreateBadgeToGive() {
  const userPub = useRecoilValue(userpubstate);
  const user = getUser();

  console.log('useCreateBadge: userPub = ', userPub);

  return useMutation(
    (badge) => {
      console.log('useCreateBadge: badge = ', badge);

      const newBadge = stringifyArrayProperties(badge);

      user.get('badges to give').get(newBadge.address).put(newBadge);
      console.log('useCreateBadge: badge.address = ', badge.address);
    },
    {
      onMutate: async (newBadge) => {
        await queryClient.cancelQueries([userPub, 'badges to give']);

        const previousBadges = queryClient.getQueryData([
          userPub,
          'badges to give',
        ]);

        queryClient.setQueryData([userPub, 'badges to give'], (oldData) => {
          return [...(oldData || []), newBadge];
        });

        return { previousBadges };
      },
      onError: (error, newBadge, context) => {
        queryClient.setQueryData(
          [userPub, 'badges to give'],
          context.previousBadges,
        );
        console.error('useCreateBadgeToGive: error = ', error);
      },
      onSettled: () => {
        queryClient.invalidateQueries([userPub, 'badges to give']);
      },
    },
  );
}
