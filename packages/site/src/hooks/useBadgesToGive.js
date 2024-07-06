import { useQuery } from '@tanstack/react-query';
import { dbClient, dbClientOnce } from '../GlobalOrbit';

const fetchBadges = async (userPub) => {
  console.log('useBadgesToGive: fetchBadges initiated');

  const results = await dbClient.user(userPub).get('badges to give').load();

  // const results = await dbClientOnce(
  //   dbClient.user(userPub).get('badges to give'),
  //   process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
  // );

  console.log('useBadgesToGive: fetchBadges results = ', results);
  return results;
};

export default function useBadgesToGive(userPub) {
  console.log('useBadgesToGive: initiated');
  return useQuery([userPub, 'badges to give'], () => {
    if (userPub !== null) return fetchBadges(userPub);
    else return [];
  });
}
