import { atom } from 'recoil';

/**
 * Atom to store the selected parent NFT address ID.
 * It returns a string representing the selected parent NFT address ID.
 *
 * @function
 * @returns {Object} An atom object with a string representing the selected parent NFT address ID.
 */
export const selectedparentnftaddressid = atom({
  key: 'selectedParentNFTAddressId',
  default: null,
});
