import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { currentbadgemetadata } from '../atoms/badgeSlideOverAtom.js';
import { userpubstate } from '../atoms/userAtom';
import { user } from '../user';

/**
 * Custom hook to handle rejecting a badge instead of taking it.
 *
 * This hook provides a mutation to reject a badge, optimistically updates the cache,
 * and handles errors by rolling back the optimistic update if necessary.
 *
 * @param {string} userAuthPub - The authenticated user's public key.
 * @returns {Object} The mutation object for rejecting a badge.
 */
export default function useRejectBadge(userAuthPub) {
  const currentBadge = useRecoilValue(currentbadgemetadata);
  const userPub = useRecoilValue(userpubstate);
  const queryClient = useQueryClient();

  return useMutation(
    async (badge) => {
      console.log(`useRejectBadge: badge.address=${badge.address}`);

      if (userAuthPub === userPub && currentBadge.address === badge.address) {
        user
          .get('badges rejected')
          .get(badge.signature)
          .put({ rejected: true });
      } else {
        throw new Error('Not authorised to reject badge');
      }
    },
    {
      onMutate: async (badge) => {
        console.log('useRejectBadge: useRejectBadge: onMutate');
        await queryClient.cancelQueries([userPub, 'badges rejected']);

        const previousBadges =
          queryClient.getQueryData([userPub, 'badges rejected']) || [];

        const optimisticBadges = previousBadges.filter(
          (d) => d && d.address !== badge.address,
        );

        queryClient.setQueryData(
          [userPub, 'badges rejected'],
          optimisticBadges,
        );

        return { previousBadges };
      },
      onError: (error, badge, context) => {
        console.log('useRejectBadge: useRejectBadge: onError');
        if (context?.previousBadges) {
          queryClient.setQueryData(
            [userPub, 'badges rejected'],
            context.previousBadges,
          );
        }
        console.error('useRejectBadge: error = ', error);
      },
      onSettled: () => {
        console.log('useRejectBadge: useRejectBadge: onSettled');
        queryClient.invalidateQueries([userPub, 'badges rejected']);
      },
    },
  );
}
