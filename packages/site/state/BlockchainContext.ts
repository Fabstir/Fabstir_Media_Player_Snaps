import React from 'react';
import { SmartAccount } from '@particle-network/aa';
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider,
  Provider,
} from '@ethersproject/providers';
import type { UserInfo } from '@particle-network/auth-core';

/*
BlockchainContextType is a TypeScript type definition for a context object in a React application that's related 
to blockchain functionality. This context object contains state and dispatch functions for various blockchain-related 
properties, including user information, smart account details, provider details, and the connected chain ID.

Here's a brief description of each property:

userInfo: User information from the ParticleAuthModule.
setUserInfo: Function to set the user information.
smartAccount: The smart account object, which can be a BiconomySmartAccountV2, a SmartAccount, or a JsonRpcSigner.
setSmartAccount: Function to set the smart account.
smartAccountProvider: The provider for the smart account.
setSmartAccountProvider: Function to set the smart account provider.
connectedChainId: The ID of the connected blockchain chain.
setConnectedChainId: Function to set the connected chain ID.
providers: An object mapping keys to JsonRpcProvider instances.
setProviders: Function to set the providers object.
*/
export type BlockchainContextType = {
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;

  smartAccount: SmartAccount | JsonRpcSigner | null;
  setSmartAccount: React.Dispatch<
    React.SetStateAction<SmartAccount | JsonRpcSigner | null>
  >;

  smartAccountProvider: Provider | null;
  setSmartAccountProvider: React.Dispatch<
    React.SetStateAction<Provider | null>
  >;

  directProvider: JsonRpcProvider | null;
  setDirectProvider: React.Dispatch<
    React.SetStateAction<JsonRpcProvider | null>
  >;

  connectedChainId: number | null;
  setConnectedChainId: React.Dispatch<React.SetStateAction<number | null>>;

  providers: { [key: string]: JsonRpcProvider };
  setProviders: React.Dispatch<
    React.SetStateAction<{ [key: string]: JsonRpcProvider }>
  >;
};

const BlockchainContext = React.createContext<BlockchainContextType>({
  userInfo: null,
  setUserInfo: () => {},
  smartAccount: null,
  setSmartAccount: () => {},
  smartAccountProvider: null,
  setSmartAccountProvider: () => {},
  directProvider: null,
  setDirectProvider: () => {},
  providers: {},
  setProviders: () => {},
  connectedChainId: null,
  setConnectedChainId: () => {},
});

export default BlockchainContext;
