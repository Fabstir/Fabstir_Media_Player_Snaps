import { dbClient, dbClientOnce } from '../GlobalOrbit';

const fetchBadges = async (userPub) => {
  const resultArray = await dbClientOnce(
    dbClient.user(userPub).get('badges to give'),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
  );

  console.log('fetchBadges resultArray = ', resultArray);
  return resultArray;
};

export default function useBadgesAll() {
  return { fetchBadges };
}
