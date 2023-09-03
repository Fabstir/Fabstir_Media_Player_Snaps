import React from 'react';
import { ethers } from 'ethers';

interface BlockchainContextType {
  provider?: ethers.JsonRpcProvider;
}

const BlockchainContext = React.createContext<BlockchainContextType>({});

export default BlockchainContext;
