import { useQuery } from '@tanstack/react-query';
import useMintBadge from '../blockchain/useMintBadge';
import { dbClient, dbClientOnce } from '../GlobalOrbit';
import useUserProfile from './useUserProfile';

const fetchBadges = async (
  userPub,
  nft,
  getUserProfile,
  getOwnBadges,
  gettokenURI,
) => {
  console.log('useBadgesForNFT: fetchBadges inside');

  console.log('useBadgesForNFT: userPub = ', userPub);

  const userProfile = await getUserProfile(userPub);
  console.log(
    'useBadgesForNFT: userProfile.address = ',
    userProfile.accountAddress,
  );

  let results = await dbClientOnce(
    dbClient.user(userPub).get('badges'),
    process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
  );

  if (!results || results.length === 0) return [];

  console.log('useBadgesForNFT: fetchBadges results = ', results);

  let newArray = [];
  for (let result of results) {
    let tokenURI;
    try {
      tokenURI = await gettokenURI(result);
    } catch (err) {}

    if (tokenURI) {
      if (result.attributes)
        result['attributes'] = JSON.parse(result.attributes);
      if (result.fileUrls) result['fileUrls'] = JSON.parse(result.fileUrls);
      newArray.push(result);
    }
  }
  results = newArray;

  console.log('useBadgesForNFT: fetchBadges results = ', results);

  const userAccountAddress = userProfile.accountAddress;
  console.log('useBadgesForNFT: fetchBadges userPub = ', userPub);
  console.log(
    'useBadgesForNFT: fetchBadges userProfile.accountAddress = ',
    userProfile.accountAddress,
  );

  const ownBadges = await getOwnBadges(userAccountAddress, results);

  console.log('useBadgesForNFT: fetchBadges: ownBadges = ', ownBadges);

  const badgesForNFT = ownBadges.filter(
    (badge) => badge.nftAddress === nft.address,
  );
  console.log('useBadgesForNFT: fetchBadges: badgesForNFT = ', badgesForNFT);

  return badgesForNFT;
};

export default function useBadgesForNFT(userPub, nft) {
  const { getOwnBadges, gettokenURI } = useMintBadge();
  const [getUserProfile] = useUserProfile();
  console.log('fetchBadges: useBadges');

  return useQuery(
    ['badges for NFT', userPub, nft?.address],
    () => {
      if (userPub !== null)
        return fetchBadges(
          userPub,
          nft,
          getUserProfile,
          getOwnBadges,
          gettokenURI,
        );
      else return [];
    },
    process.env.NEXT_PUBLIC_GUN_REFETCH_INTERVAL
      ? {
          refetchInterval: Number(process.env.NEXT_PUBLIC_GUN_REFETCH_INTERVAL),
          refetchIntervalInBackground: true,
        }
      : {},
  );
}
