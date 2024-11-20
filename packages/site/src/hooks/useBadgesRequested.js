import { useQuery } from '@tanstack/react-query';
import { dbClient, dbClientOnce, dbClientLoad } from '../GlobalOrbit';

const getBadgesRequestedCompleted = async (userPub) => {
  const results = await dbClientLoad(
    dbClient.get('#Fabstir_badge_requests:' + userPub),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    null,
    true,
  );

  return results;
};

const fetchBadges = async (userPub) => {
  const results = await dbClientLoad(
    dbClient.get('#Fabstir_badge_requests:' + userPub),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    null,
  );

  const badgesRequestedCompleted = await getBadgesRequestedCompleted(userPub);

  // Create a hash map of completed badges by their signatures
  const completedBadgesMap = {};
  badgesRequestedCompleted?.forEach((badgeCompleted) => {
    completedBadgesMap[badgeCompleted.signature] = true;
  });

  // Filter results using the hash map
  const filteredResults = results.filter(
    (badge) => !completedBadgesMap[badge.signature],
  );

  console.log('useBadgesRequested: fetchBadges results = ', filteredResults);
  return filteredResults;
};

export default function useBadgesRequested(userPub) {
  return useQuery(
    [userPub, 'badges requested'],
    () => {
      if (userPub !== null) return fetchBadges(userPub);
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
