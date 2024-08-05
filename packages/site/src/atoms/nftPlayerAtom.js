import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

export const trailermutestate = atom({
  key: 'trailerMuteAtom',
  default: true,
  // effects_UNSTABLE: [persistAtom],
});

// export const userpasswordstate = atom({
//   key: 'userPasswordAtom',
//   default: null,
// })
