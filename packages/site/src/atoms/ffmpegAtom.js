import { atom } from 'recoil'
import { recoilPersist } from 'recoil-persist'
const { persistAtom } = recoilPersist()

export const ffmpegstate = atom({
  key: 'ffmpegAtom',
  default: '',
  effects_UNSTABLE: [persistAtom],
})

export const ffmpegprogressstate = atom({
  key: 'ffmpegProgress',
  default: null,
})
