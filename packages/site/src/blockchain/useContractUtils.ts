import { Contract } from '@ethersproject/contracts';
import { useContext } from 'react';
import BlockchainContext, {
  BlockchainContextType,
} from '../../state/BlockchainContext';
import { process_env } from '../utils/process_env';
import { PolygonAmoy, BaseSepolia } from '@particle-network/chains';

/**
 * Custom hook to provide utility functions for interacting with contracts.
 *
 * @returns {Object} An object containing various utility functions for contracts.
 */
export default function useContractUtils() {
  const blockchainContext =
    useContext<BlockchainContextType>(BlockchainContext);
  const { providers, connectedChainId } = blockchainContext;

  const getChainIdFromChainIdAddress = (chainIdAddress: string): number => {
    return Number(chainIdAddress.split(':')[0]);
  };

  const getAddressFromChainIdAddress = (chainIdAddress: string): string => {
    return chainIdAddress.split(':')[1];
  };

  const getChainIdAddressFromChainIdAndAddress = (
    chainId: number,
    address: string,
  ): string => {
    return `${chainId}:${address}`;
  };

  const getProviderFromProviders = (chainId: number | null): any => {
    if (chainId === null || chainId === undefined) {
      throw new Error('ChainId is undefined.');
    }

    return providers[chainId];
  };

  const getProviderFromChainIdAddress = (chainIdAddress: string): any => {
    const chainId = getChainIdFromChainIdAddress(chainIdAddress);
    return providers[chainId];
  };

  const getProviderFromChainId = (chainId: number): any => {
    return providers[chainId];
  };

  const getAddressFromChainIdAddressForTransaction = (
    chainIdAddress: string,
  ): string => {
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
  const newReadOnlyContract = (chainIdAddress: string, abi: any) => {
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
  const newContract = (chainIdAddress: string, abi: any, signer: any) => {
    const address = getAddressFromChainIdAddressForTransaction(chainIdAddress);
    return new Contract(address, abi, signer);
  };

  const getChainIdAddressFromContractAddresses = (
    chainId: number,
    envName: string,
  ): string => {
    const envVariableName = `${envName}_${chainId}`;
    console.log(Object.keys(process_env));
    const envVariableValue = (
      process_env as Record<string, string | undefined>
    )[envVariableName];
    if (!envVariableValue) {
      throw new Error(
        `getChainIdAddressFromContractAddresses: Environment variable ${envVariableName} is not set`,
      );
    }
    return `${chainId}:${envVariableValue}`;
  };

  const getTokenAddressFromChainIdAndTokenSymbol = (
    connectedChainId: string,
    tokenSymbol: string,
  ) => {
    const tokenName = `NEXT_PUBLIC_${tokenSymbol}_TOKEN_ADDRESS_${connectedChainId}`;
    const tokenAddress = (process_env as Record<string, string | undefined>)[
      tokenName
    ];

    return tokenAddress;
  };

  const getTokenNumberOfDecimalPlacesChainIdAndTokenSymbol = (
    connectedChainId: string,
  ) => {
    const tokenName = `NEXT_PUBLIC_DEFAULT_CURRENCY_DECIMAL_PLACES_${connectedChainId}`;
    const tokenNumberOfDecimalPlaces = (
      process_env as Record<string, string | undefined>
    )[tokenName];

    if (!tokenNumberOfDecimalPlaces) return 18;

    return Number(tokenNumberOfDecimalPlaces);
  };

  const getCurrencyContractAddresses = () => {
    const tokenAddresses: Record<string, string> = {};

    for (const [key, value] of Object.entries(process_env)) {
      if (key.startsWith('NEXT_PUBLIC_') && key.includes('_TOKEN_ADDRESS_')) {
        if (value !== undefined) {
          const parts = key.split('_TOKEN_ADDRESS_');
          const currencySymbol = parts[0].replace('NEXT_PUBLIC_', '');
          const chainId = parts[1];
          tokenAddresses[`${chainId}:${currencySymbol}`] = value;
        }
      }
    }

    return tokenAddresses;
  };

  const getCurrencyDecimalPlaces = () => {
    const tokensNumberOfDecimalsPlaces: Record<string, number> = {};

    for (const [key, value] of Object.entries(process_env)) {
      if (key.startsWith('NEXT_PUBLIC_') && key.includes('_TOKEN_ADDRESS_')) {
        if (value !== undefined) {
          const parts = key.split('_TOKEN_ADDRESS_');
          const currencySymbol = parts[0].replace('NEXT_PUBLIC_', '');
          const chainId = parts[1];

          const tokenNameForDecimalPlaces = `NEXT_PUBLIC_${currencySymbol}_TOKEN_DECIMAL_PLACES_${chainId}`;

          const numberOfDecimalPlaces = (
            process_env as Record<string, string | undefined>
          )[tokenNameForDecimalPlaces];

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

  const getContractAddressesCurrencies = () => {
    const contractAddressesCurrencies: Record<string, string> = {};

    for (const [key, value] of Object.entries(process_env)) {
      if (key.startsWith('NEXT_PUBLIC_') && key.includes('_TOKEN_ADDRESS_')) {
        if (value !== undefined) {
          const parts = key.split('_TOKEN_ADDRESS_');
          const currencySymbol = parts[0].replace('NEXT_PUBLIC_', '');
          const chainId = parts[1];
          contractAddressesCurrencies[`${chainId}:${value}`] = currencySymbol;
        }
      }
    }

    return contractAddressesCurrencies;
  };

  const getChainInfoFromChainId = (chainId: number) => {
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

  const getDefaultCurrencySymbolFromChainId = (chainId: number) => {
    const defaultCurrencySymbol = (
      process_env as { [key: string]: string | undefined }
    )[`NEXT_PUBLIC_DEFAULT_CURRENCY_${chainId}`];

    return defaultCurrencySymbol;
  };

  return {
    getChainIdFromChainIdAddress,
    getChainIdAddressFromChainIdAndAddress,
    getProviderFromChainIdAddress,
    getAddressFromChainIdAddress,
    getProviderFromChainId,
    getProviderFromProviders,
    getAddressFromChainIdAddressForTransaction,
    getChainIdAddressFromContractAddresses,
    newReadOnlyContract,
    newContract,
    getTokenAddressFromChainIdAndTokenSymbol,
    getDefaultCurrencySymbolFromChainId,
    getTokenNumberOfDecimalPlacesChainIdAndTokenSymbol,
    getCurrencyContractAddresses,
    getCurrencyDecimalPlaces,
    getContractAddressesCurrencies,
    getChainInfoFromChainId,
  };
}
