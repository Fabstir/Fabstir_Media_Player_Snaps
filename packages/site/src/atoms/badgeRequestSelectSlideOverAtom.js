import { atom } from 'recoil'

export const currentbadgerequestselectformstate = atom({
  key: 'currentBadgeRequestSelectForm',
  default: null,
})

export const currentbadgerequestingstate = atom({
  key: 'currentBadgeRequesting',
  default: null,
})

export const currentbadgerequestedslideovertate = atom({
  key: 'currentBadgeRequestedSlideOver',
  default: false,
})
