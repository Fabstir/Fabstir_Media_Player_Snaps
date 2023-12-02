/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore

import { saveState, loadState } from '.';

interface TransakObject {
  apiKey: string;
  transak: any;
}

interface Addresses {
  state?: any; // Replace `any` with the actual type of `state`
  // Define other properties of `state.addresses` here
}

export const removeAddress = async (removeAddress: string) => {
  console.log('handleRemoveAddress: removeAddress = ', removeAddress);

  const state: { addresses: Addresses } = (await loadState()) as unknown as {
    addresses: Addresses;
  };

  const addresses = state.addresses.state;

  const newAddresses = { ...addresses };
  delete newAddresses[removeAddress as keyof typeof newAddresses];
  await saveState(newAddresses);

  console.log('removeAddress: newAddresses = ', newAddresses);
};

export const addAddress = async (address: string) => {
  const state: { addresses: Addresses } = (await loadState()) as unknown as {
    addresses: Addresses;
  };

  const addresses = state.addresses.state;

  let nftJSON = {};
  const newAddresses = { ...addresses, [address]: nftJSON };
  await saveState(newAddresses);
};

export const loadAddresses = async (): Promise<object> => {
  const state: { addresses: Addresses } = (await loadState()) as unknown as {
    addresses: Addresses;
  };

  console.log('useCreateNFT: state.addresses.state = ', state.addresses.state);
  console.log('removeAddress: state.addresses.state = ', state.addresses.state);
  return state.addresses.state;
};

export const replaceAddress = async (
  replaceAddress: string,
  withAddress: string,
) => {
  console.log('handleRemoveAddress: removeAddress = ', removeAddress);

  await removeAddress(replaceAddress);
  await addAddress(withAddress);
};
