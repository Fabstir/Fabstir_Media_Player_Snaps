import { atom } from 'recoil';

export const playlistnftstate = atom({
  key: 'playlistNFTStateAtom',
  default: [],
});

export const playlistcurrentindexstate = atom({
  key: 'playlistCurrentIndexStateAtom',
  default: 0,
});

export const isplayclickedstate = atom({
  key: 'isPlayClickedStateAtom',
  default: false,
});

export const isplaystate = atom({
  key: 'isPlayStateAtom',
  default: false,
});
