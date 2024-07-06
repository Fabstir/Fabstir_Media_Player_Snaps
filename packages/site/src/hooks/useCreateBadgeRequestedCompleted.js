import { useRecoilValue } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { getUser } from '../GlobalOrbit';
import { stringifyArrayProperties } from '../utils/stringifyProperties';

export default function useCreateBadgeRequestedCompleted() {
  const userAuthPub = useRecoilValue(userauthpubstate);

  return useMutation(
    (badge) => {
      console.log('useCreateBadgeRequestedCompleted: badge = ', badge);

      const newBadge2 = stringifyArrayProperties(badge);

      delete newBadge2.userPub;
      delete newBadge2.cert;
      const user = getUser();

      user
        .get('badges requested completed')
        .get(badge.signature)
        .put(newBadge2);
      console.log(
        'useCreateBadgeRequestedCompleted: badge.address = ',
        badge.address,
      );
      console.log('useCreateBadgeRequestedCompleted: newBadge2 = ', newBadge2);
    },
    {
      onMutate: (newBadge) => {
        console.log(
          'useCreateBadgeRequestedCompleted: onMutate newBadge = ',
          newBadge,
        );

        queryClient.cancelQueries([userAuthPub, 'badges requested completed']);

        let oldBadges = queryClient.getQueryData([
          userAuthPub,
          'badges requested completed',
        ]);
        console.log('useCreateBadge oldBadges = ', oldBadges);

        queryClient.setQueryData(
          [userAuthPub, 'badges requested completed'],
          (old) => {
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
          },
        );

        const newBadges = queryClient.getQueryData([
          userAuthPub,
          'badges requested completed',
        ]);
        console.log(
          'useCreateBadgeRequestedCompleted: newBadges = ',
          newBadges,
        );

        return () =>
          queryClient.setQueryData(
            [userAuthPub, 'badges requested completed'],
            oldBadges,
          );
      },
      onError: (error, newBadge, rollback) => {
        console.log('useCreateBadgeRequestedCompleted: error = ', error);
        rollback();
      },
      onSuccess: (data, newBadge) => {
        queryClient.invalidateQueries([
          userAuthPub,
          'badges requested completed',
        ]);
        queryClient.getQueryData([userAuthPub, 'badges requested completed']);
        console.log('useCreateBadgeRequestedCompleted: invalidateQueries');
      },
    },
  );
}
