import React from 'react';
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Provider,
} from '@ethersproject/providers';
import { BiconomySmartAccount } from '@biconomy/account';

export interface BlockchainContextType {
  provider?: JsonRpcProvider;
  signerAdmin?: Promise<JsonRpcSigner>;

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
