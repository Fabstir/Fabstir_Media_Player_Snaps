import React from 'react';
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Provider,
} from '@ethersproject/providers';
import { BiconomySmartAccount } from '@biconomy/account';
import { ParticleAuthModule } from '@biconomy/particle-auth';

export interface BlockchainContextType {
  provider?: JsonRpcProvider;
  signerAdmin?: Promise<JsonRpcSigner>;

  userInfo: ParticleAuthModule.UserInfo;
  setUserInfo: React.Dispatch<
    React.SetStateAction<ParticleAuthModule.UserInfo | null>
  >;

  smartAccount?: BiconomySmartAccount;
  setSmartAccount?: React.Dispatch<
    React.SetStateAction<BiconomySmartAccount | null>
  >;

  smartAccountProvider?: Provider;
  setSmartAccountProvider?: React.Dispatch<
    React.SetStateAction<Provider | null>
  >;
}

const BlockchainContext = React.createContext<BlockchainContextType>({});

export default BlockchainContext;
