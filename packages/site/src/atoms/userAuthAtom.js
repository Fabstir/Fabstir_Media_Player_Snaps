import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

export const userauthpubstate = atom({
  key: 'userAuthPubAtom',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const userauthusernamestate = atom({
  key: 'userAuthUserNameAtom',
  default: null,
  effects_UNSTABLE: [persistAtom],
});
