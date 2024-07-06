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
      onMutate: (newBadge) => {
        console.log('useCreateBadge onMutate newBadge = ', newBadge);

        queryClient.cancelQueries([userPub, 'badges to give']);

        let oldBadges = queryClient.getQueryData([userPub, 'badges to give']);
        console.log('useCreateBadge oldBadges = ', oldBadges);

        queryClient.setQueryData([userPub, 'badges to give'], (old) => {
          return old
            ? [
                ...old,
                {
                  ...newBadge,
                  isPreview: true,
                },
              ]
            : [
                {
                  ...newBadge,
                  isPreview: true,
                },
              ];
        });

        const newBadges = queryClient.getQueryData([userPub, 'badges to give']);
        console.log('useCreateBadge newBadges = ', newBadges);

        const iter1 = () =>
          queryClient.setQueryData([userPub, 'badges to give'], oldBadges);
        console.log('useCreateBadge: iter1 = ', iter1);

        return () =>
          queryClient.setQueryData([userPub, 'badges to give'], oldBadges);
      },
      onError: (error, newBadge, rollback) => {
        console.log('useCreateBadge: error = ', error);
        rollback();
      },
      onSuccess: (data, newBadge) => {
        queryClient.invalidateQueries([userPub, 'badges to give']);

        queryClient.getQueryData([userPub, 'badges to give']);
      },
    },
  );
}
