import { atom } from 'recoil';

/**
 * Atom to store the state of the NFT slide-over component.
 * It returns a boolean value indicating whether the slide-over component is open or closed.
 *
 * @function
 * @returns {Object} An atom object with a boolean value indicating whether the slide-over component is open or closed.
 */
export const nftslideoverstate = atom({
  key: 'nftSlideOverState',
  default: false,
});

/**
 * Atom to store the current NFT categories.
 * It returns an array of objects representing the current NFT categories.
 *
 * @function
 * @returns {Object} An atom object with an array of objects representing the current NFT categories.
 */
export const currentnftcategories = atom({
  key: 'currentNFTCategories',
  default: null,
});
