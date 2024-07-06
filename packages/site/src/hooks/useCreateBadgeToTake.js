import { SEA } from 'gun';
import { useRecoilValue } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';
import { userpubstate } from '../atoms/userAtom';
import { dbClient } from '../GlobalOrbit';
import { stringifyArrayProperties } from '../utils/stringifyProperties';

export default function useCreateBadgeToTake() {
  const userPub = useRecoilValue(userpubstate);

  return useMutation(
    async (badge) => {
      console.log('useCreateBadgeToTake: badge = ', badge);

      const newBadge = JSON.stringify(stringifyArrayProperties(badge));

      var hash = await SEA.work(newBadge, null, null, {
        name: 'SHA-256',
      });
      console.log('useCreateBadgeToTake: hash = ', hash);

      dbClient
        .get('#' + userPub)
        .get(hash)
        .put(newBadge, (ack) => {
          if (ack.err) {
            console.log(
              'useCreateBadgeToTake: put operation failed: ack = ',
              ack,
            );
          } else {
            console.log('useCreateBadgeToTake: put operation successful');
          }
        });

      console.log(
        'useCreateBadgeToTake: newBadge.address = ',
        newBadge.address,
      );
    },
    {
      onMutate: (newBadge) => {
        console.log('useCreateBadge onMutate newBadge = ', newBadge);

        queryClient.cancelQueries([userPub, 'badges to take']);

        let oldBadges = queryClient.getQueryData([userPub, 'badges to take']);
        console.log('useCreateBadge oldBadges = ', oldBadges);

        queryClient.setQueryData([userPub, 'badges to take'], (old) => {
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

        const newBadges = queryClient.getQueryData([userPub, 'badges to take']);
        console.log('useCreateBadge newBadges = ', newBadges);

        return () =>
          queryClient.setQueryData([userPub, 'badges to take'], oldBadges);
      },
      onError: (error, newBadge, rollback) => {
        console.log('useCreateBadgeToTake: error = ', error);
        rollback();
      },
      onSuccess: (data, newBadge) => {
        queryClient.invalidateQueries([userPub, 'badges to take']);

        queryClient.getQueryData([userPub, 'badges to take']);
      },
    },
  );
}
