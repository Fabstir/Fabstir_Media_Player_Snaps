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

<<<<<<< HEAD
  userInfo: ParticleAuthModule.UserInfo | null;
=======
  userInfo: ParticleAuthModule.UserInfo;
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
  setUserInfo: React.Dispatch<
    React.SetStateAction<ParticleAuthModule.UserInfo | null>
  >;

<<<<<<< HEAD
  smartAccount: BiconomySmartAccount | null;
  setSmartAccount: React.Dispatch<
=======
  smartAccount?: BiconomySmartAccount;
  setSmartAccount?: React.Dispatch<
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
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
