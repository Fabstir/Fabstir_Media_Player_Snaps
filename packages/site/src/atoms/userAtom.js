import { atom } from 'recoil'
import { recoilPersist } from 'recoil-persist'
const { persistAtom } = recoilPersist()

export const userpubstate = atom({
  key: 'userPubAtom',
  default: null,
  effects_UNSTABLE: [persistAtom],
})

// export const userpasswordstate = atom({
//   key: 'userPasswordAtom',
//   default: null,
// })
