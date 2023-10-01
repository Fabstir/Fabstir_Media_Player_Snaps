import { Web3Provider } from '@ethersproject/providers';
import Web3Modal from 'web3modal';

/**
 * Asynchronously connects to a wallet using Web3Modal and ethers.js.
 *
 * @async
 * @function
 * @returns {Promise<ethers.Wallet>} - A promise that resolves to an ethers.js Wallet instance representing the connected wallet's signer account.
 * @throws Will throw an error if the connection or account retrieval fails.
 */
export const connectToWallet = async () => {
  // Create a new instance of Web3Modal configured to connect to the Ethereum mainnet
  const web3Modal = new Web3Modal({
    network: 'mainnet', // Specify the network to connect to (mainnet in this case)
    cacheProvider: true, // Enable caching to allow for quicker reconnects
  });

  // Connect to the wallet and get the provider
  const connection2 = await web3Modal.connect();

  // Create a new ethers.js Web3 provider using the connection
  const provider2 = new Web3Provider(connection2);

  // Get the signer account associated with the first account in the wallet
  const signerAccount = provider2.getSigner(0);

  // Return the signer account
  return signerAccount;
};
