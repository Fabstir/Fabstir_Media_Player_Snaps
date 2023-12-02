import React from 'react';
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider,
  Provider,
} from '@ethersproject/providers';
import { BiconomySmartAccount } from '@biconomy/account';
import { ParticleAuthModule } from '@biconomy/particle-auth';

export interface BlockchainContextType {
  provider: JsonRpcProvider | null;

  userInfo: ParticleAuthModule.UserInfo | null;
  setUserInfo: React.Dispatch<
    React.SetStateAction<ParticleAuthModule.UserInfo | null>
  >;

  smartAccount: BiconomySmartAccount | null;
  setSmartAccount: React.Dispatch<
    React.SetStateAction<BiconomySmartAccount | null>
  >;

  smartAccountProvider: Provider | null;
  setSmartAccountProvider: React.Dispatch<
    React.SetStateAction<Provider | null>
  >;
}

const BlockchainContext = React.createContext<BlockchainContextType>({
  provider: null,
  userInfo: null,
  setUserInfo: () => {},
  smartAccount: null,
  setSmartAccount: () => {},
  smartAccountProvider: null,
  setSmartAccountProvider: () => {},
});

export default BlockchainContext;
