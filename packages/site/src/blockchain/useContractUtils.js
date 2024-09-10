import { Contract } from '@ethersproject/contracts';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { process_env } from '../utils/process_env';
import { PolygonAmoy, BaseSepolia } from '@particle-network/chains';
/**
 * Custom hook to provide utility functions for interacting with contracts.
 *
 * @returns {Object} An object containing various utility functions for contracts.
 */
export default function useContractUtils() {
  const blockchainContext = useContext(BlockchainContext);
  const { providers, connectedChainId } = blockchainContext;

  const getChainIdFromChainIdAddress = (chainIdAddress) => {
    return Number(chainIdAddress.split(':')[0]);
  };

  const getAddressFromChainIdAddress = (chainIdAddress) => {
    return chainIdAddress.split(':')[1];
  };

  const getChainIdAddressFromChainIdAndAddress = (chainId, address) => {
    return `${chainId}:${address}`;
  };

  const chainIdAddressType = (address) => {
    if (typeof address !== 'string')
      throw new Error('Address is not a string.');

    if (!address.includes(':'))
      return getChainIdAddressFromChainIdAndAddress(connectedChainId, address);

    return address;
  };

  const addressType = (address) => {
    if (typeof address !== 'string')
      throw new Error('Address is not a string.');

    if (address.includes(':')) return getAddressFromChainIdAddress(address);

    return address;
  };

  const getProviderFromProviders = (chainId) => {
    if (chainId === null || chainId === undefined) {
      throw new Error('ChainId is undefined.');
    }

    return providers[chainId];
  };

  const getProviderFromChainIdAddress = (chainIdAddress) => {
    const chainId = getChainIdFromChainIdAddress(chainIdAddress);
    return providers[chainId];
  };

  const getProviderFromChainId = (chainId) => {
    return providers[chainId];
  };

  const getAddressFromChainIdAddressForTransaction = (chainIdAddress) => {
    const [chainId, address] = chainIdAddress.split(':');

    if (chainId === undefined) {
      throw new Error('ChainId is undefined.');
    }

    if (connectedChainId === null || connectedChainId === undefined) {
      throw new Error(
        'getAddressFromChainIdAddressForTransaction: connectedChainId is null or undefined.',
      );
    }

    if (chainId !== connectedChainId.toString()) {
      throw new Error(
        `getAddressFromChainIdAddressForTransaction: Connected blockchain network (${connectedChainId}) does not match the chainId (${chainId}) used to return a transaction provider.`,
      );
    }

    return address;
  };

  /**
   * Creates a new read-only contract using the provided chain ID address and ABI.
   *
   * @param {string} chainIdAddress - The chain ID address to use for creating the contract.
   * @param {any} abi - The ABI of the contract.
   * @returns {Contract} A new read-only contract.
   * @throws {Error} If the chain ID address or ABI is not set, or if the provider or address for the chain ID address is not set.
   *
   * @example
   * const readOnlyContract = newReadOnlyContract(chainIdAddress, abi);
   */
  const newReadOnlyContract = (chainIdAddress, abi) => {
    if (!chainIdAddress || !abi) {
      throw new Error('ChainIdAddress or ABI is not set');
    }

    const provider = getProviderFromChainIdAddress(chainIdAddress);
    const address = getAddressFromChainIdAddress(chainIdAddress);

    if (!provider) {
      throw new Error(
        `newReadOnlyContract: Provider for chainIdAddress ${chainIdAddress} is not set`,
      );
    }

    if (!address) {
      throw new Error(
        `newReadOnlyContract: Address for chainIdAddress ${chainIdAddress} is not set`,
      );
    }

    return new Contract(address, abi, provider);
  };

  /**
   * Creates a new contract using the provided chain ID address, ABI, and signer.
   *
   * @param {string} chainIdAddress - The chain ID address to use for creating the contract.
   * @param {any} abi - The ABI of the contract.
   * @param {any} signer - The signer to use for creating the contract.
   * @returns {Contract} A new contract.
   * @throws {Error} If the chain ID address, ABI, or signer is not set, or if the address for the chain ID address is not set.
   *
   * @example
   * const contract = newContract(chainIdAddress, abi, signer);
   */
  const newContract = (chainIdAddress, abi, signer) => {
    const address = getAddressFromChainIdAddressForTransaction(
      chainIdAddressType(chainIdAddress),
    );
    return new Contract(address, abi, signer);
  };

  const getChainIdAddressFromContractAddresses = (chainId, envName) => {
    const envVariableName = `${envName}_${chainId}`;
    console.log(Object.keys(process_env));
    const envVariableValue = process_env[envVariableName];
    if (!envVariableValue) {
      throw new Error(
        `getChainIdAddressFromContractAddresses: Environment variable ${envVariableName} is not set`,
      );
    }
    return `${chainId}:${envVariableValue}`;
  };

  const getAddressFromContractAddresses = (chainId, envName) => {
    const envVariableName = `${envName}_${chainId}`;
    console.log(Object.keys(process_env));
    const envVariableValue = process_env[envVariableName];
    if (!envVariableValue) {
      throw new Error(
        `getChainIdAddressFromContractAddresses: Environment variable ${envVariableName} is not set`,
      );
    }
    return envVariableValue;
  };

  const getTokenAddressFromChainIdAndTokenSymbol = (
    connectedChainId,
    tokenSymbol,
  ) => {
    const tokenName = `NEXT_PUBLIC_${tokenSymbol}_TOKEN_ADDRESS_${connectedChainId}`;
    const tokenAddress = process_env[tokenName];

    return tokenAddress;
  };

  const getTokenNumberOfDecimalPlacesChainIdAndTokenSymbol = (
    connectedChainId,
    tokenSymbol,
  ) => {
    const tokenName = `NEXT_PUBLIC_${tokenSymbol}_TOKEN_DECIMAL_PLACES_${connectedChainId}`;
    const tokenNumberOfDecimalPlaces = process_env[tokenName];

    if (!tokenNumberOfDecimalPlaces) return 18;

    return Number(tokenNumberOfDecimalPlaces);
  };

  const getCalcContractAddressesFromCurrencies = () => {
    const tokenAddresses = {};
    const tokens = process.env.NEXT_PUBLIC_WHITELISTED_CURRENCIES?.split(',');

    for (const [key, value] of Object.entries(process_env)) {
      if (key.includes('_TOKEN_ADDRESS_')) {
        if (value !== undefined) {
          const parts = key.split('_TOKEN_ADDRESS_');
          const currencySymbol = parts[0].replace(/^NEXT_PUBLIC_/, '');

          if (!tokens?.includes(currencySymbol)) continue;
          const chainId = parts[1];

          if (isNaN(Number(chainId))) continue;
          tokenAddresses[`${chainId}:${currencySymbol}`] = value.toLowerCase();
        }
      }
    }

    return tokenAddresses;
  };

  const getCalcDecimalPlacesFromCurrencies = () => {
    const tokensNumberOfDecimalsPlaces = {};
    const tokens = process.env.NEXT_PUBLIC_WHITELISTED_CURRENCIES?.split(',');

    for (const [key, value] of Object.entries(process_env)) {
      if (key.includes('_TOKEN_ADDRESS_')) {
        if (value !== undefined) {
          const parts = key.split('_TOKEN_ADDRESS_');
          const currencySymbol = parts[0].replace(/^NEXT_PUBLIC_/, '');
          if (!tokens?.includes(currencySymbol)) continue;
          const chainId = parts[1];

          if (isNaN(Number(chainId))) continue;

          const tokenNameForDecimalPlaces = `NEXT_PUBLIC_${currencySymbol}_TOKEN_DECIMAL_PLACES_${chainId}`;

          const numberOfDecimalPlaces = process_env[tokenNameForDecimalPlaces];

          if (numberOfDecimalPlaces !== undefined) {
            if (isNaN(Number(numberOfDecimalPlaces))) {
              throw new Error(
                `Invalid number of decimal places: ${numberOfDecimalPlaces}`,
              );
            }
          }

          tokensNumberOfDecimalsPlaces[`${chainId}:${currencySymbol}`] =
            numberOfDecimalPlaces ? Number(numberOfDecimalPlaces) : 18;
        }
      }
    }

    return tokensNumberOfDecimalsPlaces;
  };

  const getCalcCurrenciesFromContractAddresses = () => {
    const currenciesFromContractAddresses = {};
    const tokens = process.env.NEXT_PUBLIC_WHITELISTED_CURRENCIES?.split(',');

    for (const [key, value] of Object.entries(process_env)) {
      if (key.includes('_TOKEN_ADDRESS_')) {
        if (value !== undefined) {
          const parts = key.split('_TOKEN_ADDRESS_');
          const currencySymbol = parts[0].replace(/^NEXT_PUBLIC_/, '');

          if (!tokens?.includes(currencySymbol)) continue;
          const chainId = parts[1];

          if (isNaN(Number(chainId))) continue;

          currenciesFromContractAddresses[`${chainId}:${value.toLowerCase()}`] =
            currencySymbol;
        }
      }
    }

    return currenciesFromContractAddresses;
  };

  const getChainInfoFromChainId = (chainId) => {
    if (chainId === PolygonAmoy.id) {
      return PolygonAmoy;
    } else if (chainId === BaseSepolia.id) {
      return BaseSepolia;
    } else {
      return {
        id: chainId,
        name: 'Unknown Chain',
      };
    }
  };

  const getDefaultCurrencySymbolFromChainId = (chainId) => {
    const defaultCurrencySymbol =
      process_env[`NEXT_PUBLIC_DEFAULT_CURRENCY_${chainId}`];

    return defaultCurrencySymbol;
  };

  function abbreviateAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return {
    getChainIdFromChainIdAddress,
    getChainIdAddressFromChainIdAndAddress,
    getProviderFromChainIdAddress,
    getAddressFromChainIdAddress,
    chainIdAddressType,
    addressType,
    getProviderFromChainId,
    getProviderFromProviders,
    getAddressFromChainIdAddressForTransaction,
    getChainIdAddressFromContractAddresses,
    getAddressFromContractAddresses,
    newReadOnlyContract,
    newContract,
    getTokenAddressFromChainIdAndTokenSymbol,
    getTokenNumberOfDecimalPlacesChainIdAndTokenSymbol,
    getCalcContractAddressesFromCurrencies,
    getCalcDecimalPlacesFromCurrencies,
    getCalcCurrenciesFromContractAddresses,
    getChainInfoFromChainId,
    getDefaultCurrencySymbolFromChainId,
    abbreviateAddress,
  };
}
