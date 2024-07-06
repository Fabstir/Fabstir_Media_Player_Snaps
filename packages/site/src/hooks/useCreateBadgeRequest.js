import { SEA } from 'gun';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';
import { dbClient, getUser } from '../GlobalOrbit';
import { stringifyArrayProperties } from '../utils/stringifyProperties';

export default function useCreateBadgeRequest() {
  return useMutation(
    async (badge) => {
      console.log('useCreateBadgeRequest: badge = ', badge);

      const user = getUser();
      const pair = user._.sea;

      const certificate = await SEA.certify(
        badge.giver,
        [{ '#': { '*': 'badges' } }],
        pair,
      );

      let newBadge = stringifyArrayProperties(badge);
      const giver = newBadge.giver;
      newBadge = JSON.stringify({ ...newBadge, cert: certificate });

      var hash = await SEA.work(newBadge, null, null, { name: 'SHA-256' });

      dbClient
        .get('#Fabstir_badge_requests:' + giver)
        .get(hash)
        .put(newBadge, (ack) => {
          if (ack.err) {
            console.log(
              'useCreateBadgeRequest: put operation failed:',
              ack.err,
            );
          } else {
            console.log('useCreateBadgeRequest: put operation successful');
          }
        });

      console.log('useCreateBadgeRequest: badge.giver = ', badge.giver);
      console.log('useCreateBadgeRequest: hash = ', hash);
      console.log('useCreateBadgeRequest: newBadge = ', newBadge);
      console.log('useCreateBadgeRequest: badge.address = ', badge.address);
    },
    {
      onMutate: (newBadge) => {
        console.log('useCreateBadge onMutate newBadge = ', newBadge);

        queryClient.cancelQueries([newBadge.giver, 'badges requested']);

        let oldBadges = queryClient.getQueryData([
          newBadge.giver,
          'badges requested',
        ]);
        console.log('useCreateBadge oldBadges = ', oldBadges);

        queryClient.setQueryData(
          [newBadge.giver, 'badges requested'],
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
          newBadge.giver,
          'badges requested',
        ]);
        console.log('useCreateBadge newBadges = ', newBadges);

        return () =>
          queryClient.setQueryData(
            [newBadge.giver, 'badges requested'],
            oldBadges,
          );
      },
      onError: (error, newBadge, rollback) => {
        console.log('useCreateBadgeRequest: error = ', error);
        rollback();
      },
      onSuccess: (data, newBadge) => {
        queryClient.invalidateQueries([newBadge.giver, 'badges requested']);

        queryClient.getQueryData([newBadge.giver, 'badges requested']);
      },
    },
  );
}
