import { Web3Provider } from '@ethersproject/providers';

const chainList: { [key: number]: string } = {
  1: 'Ethereum',
  5: 'Ethereum',
  80002: 'Polygon',
  84532: 'Base',
};

/**
 * Returns the name of the chain for a given chain ID.
 *
 * @param {number} chainId - The ID of the chain.
 * @returns {string} The name of the chain, or 'Unknown Chain' if the chain ID is not found.
 */
export function getChainNameFromChainId(chainId: number): string {
  return chainList[chainId] || 'Unknown Chain';
}

/**
 * Returns an array of supported chains with their IDs and names.
 *
 * @returns {Array<{id: number, name: string}>} An array of objects, each containing a chain ID and name.
 */
export const getSupportedChains = () => {
  const chainIds = process.env.NEXT_PUBLIC_WHITELISTED_CHAIN_IDS?.split(',');
  const chainNames =
    process.env.NEXT_PUBLIC_WHITELISTED_CHAIN_NAMES?.split(',');

  let chains: { id: number; name: string }[] = [];

  if (chainIds && chainNames) {
    chains = chainIds.map((id, i) => {
      return { id: Number(id), name: chainNames[i] };
    });
  }

  return chains;
};

/**
 * Returns an array of supported chain IDs.
 *
 * @returns {number[]} An array of supported chain IDs.
 */
export const getSupportedChainIds = () => {
  const chainIds = process.env.NEXT_PUBLIC_WHITELISTED_CHAIN_IDS?.split(',');

  let chains: number[] = [];

  if (chainIds) {
    chains = chainIds.map((id) => {
      return Number(id);
    });
  }

  return chains;
};

export const getConnectedChainId = async (smartAccount: any) => {
  let provider;
  let chainId;

  if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle') {
    // Particle-specific provider extraction
    provider = new Web3Provider(smartAccount.provider);
    const newChainIdHex = await smartAccount.getChainId();
    chainId = Number.parseInt(newChainIdHex, 16);
  } else if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native') {
    // Native provider (MetaMask) extraction
    provider = new Web3Provider(window.ethereum);

    // Fetch the network information
    const network = await provider.getNetwork();
    chainId = network.chainId;
  } else {
    throw new Error(
      `getConnectedChainId: process.env.DEFAULT_AA_PAYMENT_NETWORK is not valid`,
    );
  }

  // If no network is connected, return process.env.CHAIN_ID
  if (!chainId) {
    return Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID);
  }

  return chainId;
};
