import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

/**
 * Atom to store the state of the currencies.
 * It returns an array of objects representing the currencies.
 *
 * @function
 * @returns {Object} An atom object with an array of objects representing the currencies.
 */
export const currenciesstate = atom({
  key: 'currenciesAtom',
  default: [],
  effects_UNSTABLE: [persistAtom],
});

/**
 * Atom to store the logo URLs of the currencies.
 * It returns an object representing the logo URLs of the currencies.
 *
 * @function
 * @returns {Object} An atom object with an object representing the logo URLs of the currencies.
 */
export const currencieslogourlstate = atom({
  key: 'currenciesLogoUrlAtom',
  default: {},
  effects_UNSTABLE: [persistAtom],
});

/**
 * Atom to store the contract addresses of the currencies.
 * It returns an object representing the contract addresses of the currencies.
 *
 * @function
 * @returns {Object} An atom object with an object representing the contract addresses of the currencies.
 */
export const currencycontractaddressesstate = atom({
  key: 'currencyContractAddressesAtom',
  default: {},
  effects_UNSTABLE: [persistAtom],
});

/**
 * Atom to store the currencies associated with contract addresses.
 * It returns an object representing the currencies associated with contract addresses.
 *
 * @function
 * @returns {Object} An atom object with an object representing the currencies associated with contract addresses.
 */
export const contractaddressescurrenciesstate = atom({
  key: 'contractAddressesCurrenciesAtom',
  default: {},
  effects_UNSTABLE: [persistAtom],
});

/**
 * Atom to store the decimal places of the currencies.
 * It returns an array representing the decimal places of the currencies.
 *
 * @function
 * @returns {Object} An atom object with an array representing the decimal places of the currencies.
 */
export const currenciesdecimalplaces = atom({
  key: 'currenciesDecimalPlacesAtom',
  default: [],
  effects_UNSTABLE: [persistAtom],
});
