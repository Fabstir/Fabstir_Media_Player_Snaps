import { dbClient, dbClientOnce, getUser } from '../GlobalOrbit';
import { getNFTAddressId } from '../utils/nftUtils';
import { stringifyArrayProperties } from '../utils/stringifyProperties';

export default function useBadgeGating() {
  const createBadgesGating = async (nft, badges) => {
    if (!nft) throw new Error('useBadgeGating: No NFT provided');
    const user = getUser();

    badges.forEach((badge) => {
      const newBadge = stringifyArrayProperties(badge);

      user
        .get(getNFTAddressId(nft.address))
        .get('badges gated')
        .get(newBadge.address)
        .put(newBadge);
    });
  };

  const getBadgesGating = async (userPub, nft) => {
    if (!userPub || !nft?.adress) return;

    const results = await dbClientOnce(
      dbClient
        .user(userPub)
        .get(getNFTAddressId(nft.address))
        .get('badges gated'),
      process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    );

    return results;
  };

  const getBadges = async (userPub) => {
    if (!userPub) return;

    const results = await dbClientOnce(
      dbClient.user(userPub).get('badges'),
      process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    );

    return results;
  };

  const getBadgeToGive = async (userPub, badgeAddressId) => {
    if (!userPub || !badgeAddressId) return;

    const badge = await new Promise((res) =>
      dbClient
        .user(userPub)
        .get('badges to give')
        .get(badgeAddressId)
        .once((final_value) => res(final_value)),
    );

    return badge;
  };

  const getBadgesToGive = async (userPub, badgeAddress) => {
    if (!userPub) return;

    const badges = await dbClientOnce(
      dbClient.user(userPub).get('badges to give'),
      process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    );

    const results = badges.filter((badge) =>
      badge.addressId.startsWith(badgeAddress + '_'),
    );
    return results;
  };

  return {
    createBadgesGating,
    getBadgesGating,
    getBadges,
    getBadgeToGive,
    getBadgesToGive,
  };
}
