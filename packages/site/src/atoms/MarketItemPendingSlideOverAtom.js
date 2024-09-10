import { atom } from 'recoil'

export const marketitemacceptslideoverstate = atom({
  key: 'marketItemAcceptSlideOverAtom',
  default: false,
})

export const marketitemrejectslideoverstate = atom({
  key: 'marketItemRejectSlideOverAtom',
  default: false,
})

export const marketitemremoveslideoverstate = atom({
  key: 'marketItemRemoveSlideOverAtom',
  default: false,
})

export const marketitemdeleteslideoverstate = atom({
  key: 'marketItemDeleteSlideOverAtom',
  default: false,
})

export const marketitemrcancelslideoverstate = atom({
  key: 'marketItemCancelSlideOverAtom',
  default: false,
})

export const currentmarketitemmarketaddressstate = atom({
  key: 'currentMarketItemMarketAddressAtom',
  default: false,
})

export const currentmarketitemidstate = atom({
  key: 'currentMarketItemIdAtom',
  default: false,
})
