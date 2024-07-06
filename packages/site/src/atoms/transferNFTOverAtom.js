import { atom } from 'recoil';

/**
 * Defines an atom for managing the state of the NFT transfer slide-over UI component.
 * This atom holds a boolean value indicating whether the slide-over is open (`true`) or closed (`false`).
 *
 * @module transferNFTOverAtom
 * @function transfernftslideoverstate
 * @returns {Atom<boolean>} An atom with a default value of `false`, representing the closed state of the NFT transfer slide-over.
 */
export const transfernftslideoverstate = atom({
  key: 'TransferNFTSlideOver',
  default: false,
});
