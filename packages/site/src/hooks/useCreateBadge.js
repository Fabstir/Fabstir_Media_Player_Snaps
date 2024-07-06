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
      onMutate: (newBadge) => {
        console.log('useCreateBadge: onMutate newBadge = ', newBadge);

        queryClient.cancelQueries([userAuthPub, 'badges']);

        let oldBadges = queryClient.getQueryData([userAuthPub, 'badges']);
        console.log('useCreateBadge oldBadges = ', oldBadges);

        queryClient.setQueryData([userAuthPub, 'badges'], (old) => {
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

        const newBadges = queryClient.getQueryData([userAuthPub, 'badges']);
        console.log('useCreateBadge: newBadges = ', newBadges);

        return () =>
          queryClient.setQueryData([userAuthPub, 'badges'], oldBadges);
      },
      onError: (error, newBadge, rollback) => {
        console.log('useCreateBadge: error = ', error);
        rollback();
      },
      onSuccess: (data, newBadge) => {
        queryClient.invalidateQueries([userAuthPub, 'badges']);
        queryClient.getQueryData([userAuthPub, 'badges']);
        console.log('useCreateBadge: invalidateQueries');
      },
    },
  );
}
