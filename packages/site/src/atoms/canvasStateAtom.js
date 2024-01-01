// store/canvasState.js
import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

export const canvasstate = atom({
  key: 'canvasState',
  default: null, // default value
  effects_UNSTABLE: [persistAtom],
});
