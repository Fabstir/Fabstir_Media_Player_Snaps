import { atom } from 'recoil';

/**
 * Atom to store the state of the NFT metadata expand component.
 * It returns a boolean value indicating whether the metadata expand component is open or closed.
 *
 * @function
 * @returns {Object} An atom object with a boolean value indicating whether the metadata expand component is open or closed.
 */
export const nftmetadataexpandstate = atom({
  key: 'nftMetaDataExpandState',
  default: true,
});

/**
 * Atom to store the NFTs selected as child.
 * It returns an array of objects representing the NFTs selected as child.
 *
 * @function
 * @returns {Object} An atom object with an array of objects representing the NFTs selected as child.
 */
export const nftsselectedaschild = atom({
  key: 'nftsSelectedAsChild',
  default: [],
});
