import { Web3Provider } from '@ethersproject/providers';
import CryptoJS from 'crypto-js';

export const getEOAAddress = async (web3Provider) => {
  const signer = web3Provider.getSigner();
  const address = await signer.getAddress();
  return address;
};

/**
 * Generates a password by hashing a user's address and a salt.
 *
 * @param {string} address - The user's address.
 * @param {string} salt - The salt to be combined with the address.
 * @returns {string} - The generated password.
 */
export function generatePassword(address, salt) {
  // Combine the address with a user-specific salt
  const input = `${address}:${salt}`;

  // Hash the combined string using CryptoJS
  const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);

  // Convert to a suitable password format
  // Since CryptoJS outputs a Hex string, we first convert it to a WordArray to encode in Base64
  const password = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Hex.parse(hash),
  ).slice(0, 16);

  return password;
}

/**
 * Requests access to the user's Ethereum accounts.
 *
 * @returns {Promise<string>} - A Promise that resolves with the first Ethereum account.
 * @throws {Error} - Throws an error if the request fails.
 */
export async function requestAccount() {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  return accounts[0]; // Returns the first account.
}

/**
 * Creates an Externally Owned Account (EOA) using the Ethereum provider in the user's browser.
 *
 * @returns {Promise<Object>} - A Promise that resolves with an object containing the EOA address, the Web3 provider, and the signer. If no Ethereum provider is found, all properties in the returned object will be null.
 * @throws {Error} - Throws an error if no Ethereum provider is found.
 */
export async function createEOAAccount() {
  const eoaAddress = await requestAccount();
  if (typeof window.ethereum !== 'undefined') {
    const web3Provider = new Web3Provider(window.ethereum);
    const smartAccount = web3Provider.getSigner();
    return { eoaAddress, web3Provider, smartAccount };
  }
  console.error('Please install an Ethereum provider, like MetaMask');
  return { eoaAddress: null, web3Provider: null, smartAccount: null };
}
