import { useQuery } from '@tanstack/react-query';
import useMintBadge from '../blockchain/useMintBadge';
import { dbClient, dbClientOnce, dbClientLoad } from '../GlobalOrbit';
import useUserProfile from './useUserProfile';

const fetchBadges = async (userPub, getUserProfile, getOwnBadges) => {
  const results = await dbClientLoad(
    dbClient.get('#Fabstir_badge_requests:' + userPub),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    null,
    true,
  );

  console.log('useBadgesRequested: fetchBadges results = ', results);
  return results;
};

export default function useBadgesRequested(userPub) {
  const { getOwnBadges } = useMintBadge();
  const [getUserProfile] = useUserProfile();

  return useQuery(
    [userPub, 'badges requested'],
    () => {
      if (userPub !== null)
        return fetchBadges(userPub, getUserProfile, getOwnBadges);
      else return [];
    },
    {
      refetchInterval: process.env.NEXT_PUBLIC_GUN_REFETCH_INTERVAL
        ? Number(process.env.NEXT_PUBLIC_GUN_REFETCH_INTERVAL)
        : undefined,
      refetchIntervalInBackgroundFocus: true,
    },
  );
}
