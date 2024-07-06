import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';
import { dbClient } from '../GlobalOrbit';
import { stringifyArrayProperties } from '../utils/stringifyProperties';
import { getBadgeAddressId } from '../utils/badgeUtils.js';

export default function useCreateBadgeRequested() {
  const userPub = useRef();

  return useMutation(
    (badge) => {
      console.log('useCreateBadgeRequested: badge = ', badge);

      const newBadge2 = stringifyArrayProperties(badge);
      delete newBadge2.cert;

      console.log('useCreateBadgeRequested: badge.cert = ', badge.cert);
      console.log(
        'useCreateBadgeRequested: newBadge2.giver = ',
        newBadge2.giver,
      );

      dbClient
        .user(newBadge2.taker)
        .get('badges')
        .get(getBadgeAddressId(newBadge2))
        .put(
          newBadge2,
          function (ack) {
            if (ack.err) {
              console.log('useCreateBadgeRequested: ack.err = ', ack.err);
            } else console.log('useCreateBadgeRequested: success');
          },
          { opt: { cert: badge.cert } },
        );
      console.log(
        'useCreateBadgeRequested: newBadge2.address = ',
        newBadge2.address,
      );
      console.log('useCreateBadgeRequested: newBadge2 = ', newBadge2);
    },
    {
      onMutate: (newBadge) => {
        console.log('useCreateBadgeRequested: onMutate newBadge = ', newBadge);
        console.log(
          'useCreateBadgeRequested: newBadge.giver = ',
          newBadge.giver,
        );

        queryClient.cancelQueries([newBadge.giver, 'badges']);

        let oldBadges = queryClient.getQueryData([newBadge.giver, 'badges']);
        console.log('useCreateBadge oldBadges = ', oldBadges);

        queryClient.setQueryData([newBadge.giver, 'badges'], (old) => {
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

        const newBadges = queryClient.getQueryData([newBadge.giver, 'badges']);
        console.log('useCreateBadgeRequested: newBadges = ', newBadges);

        return () =>
          queryClient.setQueryData([newBadge.giver, 'badges'], oldBadges);
      },
      onError: (error, newBadge, rollback) => {
        console.log('useCreateBadgeRequested: error = ', error);
        rollback();
      },
      onSuccess: (data, newBadge) => {
        queryClient.invalidateQueries([newBadge.giver, 'badges']);
        queryClient.getQueryData([newBadge.giver, 'badges']);
        console.log('useCreateBadgeRequested: invalidateQueries');
      },
    },
  );
}
