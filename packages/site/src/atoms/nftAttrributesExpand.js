import { atom } from 'recoil';

/**
 * Atom to store the state of the NFT attributes expand component.
 * It returns a boolean value indicating whether the attributes expand component is open or closed.
 *
 * @function
 * @returns {Object} An atom object with a boolean value indicating whether the attributes expand component is open or closed.
 */
export const nftattributesexpandstate = atom({
  key: 'nftAttrributesExpandState',
  default: false,
});
