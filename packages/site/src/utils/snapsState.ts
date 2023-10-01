/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore

import { saveState, loadState } from '.';

interface TransakObject {
  apiKey: string;
  transak: any;
}

type NFTCollection = {
  [address: string]: object;
};

export const removeAddress = async (removeAddress: string) => {
  console.log('handleRemoveAddress: removeAddress = ', removeAddress);

  const state: NFTCollection = (await loadState()) as unknown as NFTCollection;

  const addresses = state.addresses.state;

  const newAddresses = { ...addresses };
  delete newAddresses[removeAddress as keyof typeof newAddresses];
  await saveState(newAddresses);

  console.log('removeAddress: newAddresses = ', newAddresses);
};

export const addAddress = async (address: string) => {
  const state: NFTCollection = (await loadState()) as unknown as NFTCollection;
  const addresses = state.addresses.state;

  let nftJSON = {};
  const newAddresses = { ...addresses, [address]: nftJSON };
  await saveState(newAddresses);
};

export const loadAddresses = async (): Promise<object> => {
  const state: NFTCollection = (await loadState()) as unknown as NFTCollection;

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
