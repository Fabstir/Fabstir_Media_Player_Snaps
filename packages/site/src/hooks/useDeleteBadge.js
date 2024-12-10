import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { currentbadgemetadata } from '../atoms/badgeSlideOverAtom.js';
import { userpubstate } from '../atoms/userAtom';
import { user } from '../user';
import { getBadgeAddressId } from '../utils/badgeUtils.js';

/**
 * Custom hook to handle deleting a badge.
 *
 * This hook provides a mutation to delete a badge, optimistically updates the cache,
 * and handles errors by rolling back the optimistic update if necessary.
 *
 * @param {string} userAuthPub - The authenticated user's public key.
 * @returns {Object} The mutation object for deleting a badge.
 */
export default function useDeleteBadge(userAuthPub) {
  const currentBadge = useRecoilValue(currentbadgemetadata);
  const userPub = useRecoilValue(userpubstate);
  const queryClient = useQueryClient();

  return useMutation(
    async (badge) => {
      console.log(`useDeleteBadge: badge.address=${badge.address}`);

      if (userAuthPub === userPub && currentBadge.address === badge.address) {
        user.get('badges').get(getBadgeAddressId(badge)).put(null);
      } else {
        throw new Error('Not authorised to delete badge');
      }
    },
    {
      onMutate: async (badge) => {
        await queryClient.cancelQueries([userPub, 'badges']);

        const previousBadges =
          queryClient.getQueryData([userPub, 'badges']) || [];

        const optimisticBadges = previousBadges.filter(
          (d) => d && d.address !== badge.address,
        );

        queryClient.setQueryData([userPub, 'badges'], optimisticBadges);

        return { previousBadges };
      },
      onError: (error, badge, context) => {
        if (context?.previousBadges) {
          queryClient.setQueryData([userPub, 'badges'], context.previousBadges);
        }
        console.error('useDeleteBadge: error = ', error);
      },
      onSettled: () => {
        queryClient.invalidateQueries([userPub, 'badges']);
      },
    },
  );
}
