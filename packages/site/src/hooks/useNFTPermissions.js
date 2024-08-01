import { dbClient } from '../GlobalOrbit';
import { user } from '../user';

/**
 * Custom hook to manage NFT permissions.
 *
 * This hook provides functionality to manage and check permissions related to NFTs.
 * It handles the necessary state and logic required for permission management.
 *
 * @returns {Object} An object containing the state and functions to manage NFT permissions.
 */
export default function useNFTPermissions() {
  const ipfs = useIPFS();

  const getNFTsPermissions = async () => {
    const results = await user.get('NFT permissions').load();
    return results;
  };

  const getNFTPermissions = async (nftAddressId) => {
    const nftPermission = await new Promise((res) =>
      user
        .get('NFT permissions')
        .get(nftAddressId)
        .once((final_value) => res(final_value)),
    );

    return nftPermission;
  };

  const putNFTPermissions = (nftAddressId, nftPermission) => {
    user
      .get('NFT permissions')
      .get(nftAddressId)
      .put(nftPermission, function (ack) {
        if (ack.err) {
          console.error('usePermissions: Error writing data:', ack.err);
        } else {
          console.log('usePermissions: nftAddressId = ', nftAddressId);
          console.log('usePermissions: nftPermissions = ', nftPermission);
        }
      });
    return cid;
  };

  const getEncKeyForUser = async (nftAddressId, userPub) => {
    const scrambledEncKey = await new Promise((res) =>
      user
        .get('NFT permissions')
        .get(nftAddressId)
        .get(userPub)
        .once((final_value) => res(final_value)),
    );

    const passphrase = await SEA.secret(user.userPub, user._.sea);

    const encKey = await SEA.decrypt(scrambledEncKey, passphrase);
    return encKey;
  };

  const putEncKeyForUser = async (nftAddressId, userPub, encKey) => {
    const passphrase = await SEA.secret(user.userPub, user._.sea);
    const scrambledEncKey = await SEA.encrypt(encKey, passphrase);

    user
      .get('NFT enckeys')
      .get(nftAddressId)
      .get(userPub)
      .put(scrambledEncKey, function (ack) {
        if (ack.err) {
          console.error('usePermissions: Error writing data:', ack.err);
        } else {
          console.log('usePermissions: nftAddressId = ', nftAddressId);
          console.log('usePermissions: nftPermissions = ', nftPermission);
        }
      });
  };

  const deleteEncKeyForUser = async (nftAddressId, userPub) => {
    user
      .get('NFT enckeys')
      .get(nftAddressId)
      .get(userPub)
      .put(null, function (ack) {
        if (ack.err) {
          console.error('usePermissions: Deleting data:', ack.err);
        } else {
          console.log('usePermissions: nftAddressId = ', nftAddressId);
          console.log('usePermissions: nftPermissions = ', nftPermission);
        }
      });
  };

  return {
    getNFTPermissions,
    putNFTPermissions,
    getNFTsPermissions,
    getEncKeyForUser,
    putEncKeyForUser,
    deleteEncKeyForUser,
  };
}
