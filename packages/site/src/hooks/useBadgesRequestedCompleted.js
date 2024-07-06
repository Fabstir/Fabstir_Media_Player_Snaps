import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { dbClientOnce, getUser } from '../GlobalOrbit';

const fetchBadges = async () => {
  const user = getUser();

  const results = await dbClientOnce(
    user.get('badges requested completed'),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
  );

  console.log('useBadgesRequestedCompleted: fetchBadges results = ', results);
  return results;
};

export default function useBadgesRequestedCompleted() {
  const userAuthPub = useRecoilValue(userauthpubstate);

  return useQuery(
    [userAuthPub, 'badges requested completed'],
    () => {
      if (userAuthPub !== null) return fetchBadges();
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
