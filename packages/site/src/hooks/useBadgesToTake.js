import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useMintBadge from '../blockchain/useMintBadge';
import { dbClient, dbClientOnce, dbClientLoad } from '../GlobalOrbit';

const fetchBadges = async (userAuthPub, userPub, isUsed, gettokenURI) => {
  console.log('useBadgesToTake: fetchBadges initiated');

  const results = await dbClientLoad(
    dbClient.get('#' + userPub),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    null,
    true,
  );

  const resultArray = [];

  if (results.length !== 0) {
    for (let result of results) {
      if (result && result.address) {
        let tokenURI;
        try {
          tokenURI = await gettokenURI(result);
        } catch (err) {}

        if (tokenURI) continue;

        let used;
        try {
          used = await isUsed(userPub, userAuthPub, result);
          console.log('useBadgesToTake: used = ', used);
        } catch (err) {}

        if (used) continue;

        console.log('useBadgesToTake: result = ', result);

        if (result.attributes)
          result['attributes'] = JSON.parse(result.attributes);
        if (result.fileUrls) result['fileUrls'] = JSON.parse(result.fileUrls);

        resultArray.push(result);
      }
    }
  }

  console.log('useBadgesToTake: fetchBadges results = ', results);
  console.log('useBadgesToTake: fetchBadges resultArray = ', resultArray);

  return resultArray;
};

export default function useBadgesToTake(userPub) {
  const { isUsed, gettokenURI } = useMintBadge();
  const userAuthPub = useRecoilValue(userauthpubstate);

  return useQuery(
    [userPub, 'badges to take'],
    () => {
      if (userPub !== null)
        return fetchBadges(userAuthPub, userPub, isUsed, gettokenURI);
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
