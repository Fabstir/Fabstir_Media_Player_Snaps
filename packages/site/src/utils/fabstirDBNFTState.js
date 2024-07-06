import { getUser } from '../GlobalOrbit';

/**
 * Asynchronously loads the state of multiple NFTs and maps the second property of each NFT state to an object.
 *
 * @param {string} addressId - The ID of the address from which the NFTs state will be loaded.
 * @returns {Promise<Object>} - A Promise that resolves with an object. The keys of the object are the second properties of each NFT state, and the values are the corresponding values of these properties.
 * @throws {Error} - Throws an error if loading the NFTs state fails.
 */
export const loadNFTsState = async () => {
  const user = getUser();
  const nftsState = await user.get('nfts').load();
  return nftsState;

  // const addressIds = {};
  // for (const nftObject of nftsState) {
  //   for (const [key, value] of Object.entries(nftObject)) {
  //     addressIds[key] = value;
  //   }
  // }
  // return addressIds;
};

/**
 * Asynchronously loads the NFT state from a user's address.
 *
 * @param {string} addressId - The ID of the address from which the NFT state will be loaded.
 * @returns {Promise<Object>} - A Promise that resolves with the NFT state.
 * @throws {Error} - Throws an error if loading the NFT state fails.
 */
export const loadNFTState = async (addressId) => {
  const user = getUser();
  const nftState = await user.get('nfts').get(addressId).once();
  return nftState;
};

/**
 * Asynchronously saves the NFT state to a user's address.
 *
 * @param {string} addressId - The ID of the address where the NFT state will be saved.
 * @param {Object} nftState - The state of the NFT to be saved.
 * @returns {Promise} - A Promise that resolves when the NFT state has been saved.
 * @throws {Error} - Throws an error if saving the NFT state fails.
 */
export const saveNFTState = async (addressId, nftState) => {
  const user = getUser();
  await user
    .get('nfts')
    .get(addressId)
    .put({ [addressId]: nftState });
};
