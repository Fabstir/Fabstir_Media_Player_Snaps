import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

export const isbadgesviewclosedatomstate = atom({
  key: 'isBadgesViewClosedAtom',
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const isnftsviewclosedstate = atom({
  key: 'isNFTsViewClosedAtom',
  default: false,
  effects_UNSTABLE: [persistAtom],
});
