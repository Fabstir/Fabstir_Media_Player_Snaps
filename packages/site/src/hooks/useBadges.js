import { useQuery } from '@tanstack/react-query';
import useMintBadge from '../blockchain/useMintBadge';
import { dbClient, dbClientOnce } from '../GlobalOrbit';
import useUserProfile from './useUserProfile';

const fetchBadges = async (
  userPub,
  getUserProfile,
  getOwnBadges,
  gettokenURI,
) => {
  console.log('useBadges: fetchBadges inside');

  console.log('useBadges: userPub = ', userPub);

  const userProfile = await getUserProfile(userPub);
  console.log('useBadges: userProfile.address = ', userProfile.accountAddress);

  let resultArray = await dbClientOnce(
    dbClient.user(userPub).get('badges'),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
  );

  console.log('useBadges: fetchBadges resultArray = ', resultArray);

  let newArray = [];
  for (let item of resultArray) {
    let tokenURI;
    try {
      tokenURI = await gettokenURI(item);
    } catch (err) {}

    if (tokenURI) {
      if (item.attributes) item['attributes'] = JSON.parse(item.attributes);
      if (item.fileUrls) item['fileUrls'] = JSON.parse(item.fileUrls);
      newArray.push(item);
    }
  }
  resultArray = newArray;

  console.log('useBadges: fetchBadges userPub = ', userPub);
  console.log(
    'useBadges: fetchBadges userProfile.accountAddress = ',
    userProfile.accountAddress,
  );

  const ownBadges = await getOwnBadges(userProfile.accountAddress, resultArray);

  console.log('useBadges: fetchBadges: ownBadges = ', ownBadges);
  return ownBadges;
};

export default function useBadges(userPub) {
  const { getOwnBadges, gettokenURI } = useMintBadge();
  const [getUserProfile] = useUserProfile();
  console.log('fetchBadges: useBadges');

  return useQuery(
    [userPub, 'badges'],
    () => {
      if (userPub !== null)
        return fetchBadges(userPub, getUserProfile, getOwnBadges, gettokenURI);
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
