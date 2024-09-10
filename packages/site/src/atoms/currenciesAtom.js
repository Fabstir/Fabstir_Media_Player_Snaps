import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

// export const currentcurrencystate = atom({
//   key: 'currentCurrencyAtom',
//   default: [],
//   effects_UNSTABLE: [persistAtom],
// })

export const currenciesstate = atom({
  key: 'currenciesAtom',
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const currencieslogourlstate = atom({
  key: 'currenciesLogoUrlAtom',
  default: {},
  effects_UNSTABLE: [persistAtom],
});

export const contractaddressesfromcurrenciesstate = atom({
  key: 'contractAddressesFromCurrenciesAtom',
  default: {},
  effects_UNSTABLE: [persistAtom],
});

export const currenciesfromcontractaddressesstate = atom({
  key: 'currenciesFromContractAddressesAtom',
  default: {},
  effects_UNSTABLE: [persistAtom],
});

export const decimalplacesfromcurrenciesstate = atom({
  key: 'decimalPlacesFromCurrenciesAtom',
  default: [],
  effects_UNSTABLE: [persistAtom],
});
