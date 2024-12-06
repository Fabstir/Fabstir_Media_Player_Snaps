export function getChainIdFromChainIdAddress(chainIdAddress: string): number;
export function getAddressFromChainIdAddress(chainIdAddress: string): string;
export function getChainIdAddressFromChainIdAndAddress(
  chainId: number,
  address: string,
): string;
export function chainIdAddressType(address: string): string;
export function addressType(address: string): string;
export function getProviderFromProviders(chainId: number): any;
export function getProviderFromChainIdAddress(chainIdAddress: string): any;
export function getProviderFromChainId(chainId: number): any;
export function getAddressFromChainIdAddressForTransaction(
  chainIdAddress: string,
): string;
export function newReadOnlyContract(
  chainIdAddress: string,
  abi: any,
  provider?: any,
): Contract;
export function newContract(
  chainIdAddress: string,
  abi: any,
  signer: any,
): Contract;
export function getChainIdAddressFromContractAddresses(
  chainId: number,
  envName: string,
): string;
export function getAddressFromContractAddresses(
  chainId: number,
  envName: string,
): string;
export function getTokenAddressFromChainIdAndTokenSymbol(
  connectedChainId: number,
  tokenSymbol: string,
): string | undefined;
export function getTokenNumberOfDecimalPlacesChainIdAndTokenSymbol(
  connectedChainId: number,
  tokenSymbol: string,
): number;
export function getCalcContractAddressesFromCurrencies(): Record<
  string,
  string
>;
export function getCalcDecimalPlacesFromCurrencies(): Record<string, number>;
export function getCalcCurrenciesFromContractAddresses(): Record<
  string,
  string
>;
export function getChainInfoFromChainId(chainId: number): any;
export function getDefaultCurrencySymbolFromChainId(
  chainId: number,
): string | undefined;
export function abbreviateAddress(address: string): string;
export function calculateInterfaceId(abi: any): string;
export function getRpcProviders(): Promise<Record<number, JsonRpcProvider>>;

const useContractUtils: () => {
  getChainIdFromChainIdAddress: typeof getChainIdFromChainIdAddress;
  getAddressFromChainIdAddress: typeof getAddressFromChainIdAddress;
  getChainIdAddressFromChainIdAndAddress: typeof getChainIdAddressFromChainIdAndAddress;
  chainIdAddressType: typeof chainIdAddressType;
  addressType: typeof addressType;
  getProviderFromProviders: typeof getProviderFromProviders;
  getProviderFromChainIdAddress: typeof getProviderFromChainIdAddress;
  getProviderFromChainId: typeof getProviderFromChainId;
  getAddressFromChainIdAddressForTransaction: typeof getAddressFromChainIdAddressForTransaction;
  newReadOnlyContract: typeof newReadOnlyContract;
  newContract: typeof newContract;
  getChainIdAddressFromContractAddresses: typeof getChainIdAddressFromContractAddresses;
  getAddressFromContractAddresses: typeof getAddressFromContractAddresses;
  getTokenAddressFromChainIdAndTokenSymbol: typeof getTokenAddressFromChainIdAndTokenSymbol;
  getTokenNumberOfDecimalPlacesChainIdAndTokenSymbol: typeof getTokenNumberOfDecimalPlacesChainIdAndTokenSymbol;
  getCalcContractAddressesFromCurrencies: typeof getCalcContractAddressesFromCurrencies;
  getCalcDecimalPlacesFromCurrencies: typeof getCalcDecimalPlacesFromCurrencies;
  getCalcCurrenciesFromContractAddresses: typeof getCalcCurrenciesFromContractAddresses;
  getChainInfoFromChainId: typeof getChainInfoFromChainId;
  getDefaultCurrencySymbolFromChainId: typeof getDefaultCurrencySymbolFromChainId;
  abbreviateAddress: typeof abbreviateAddress;
  calculateInterfaceId: typeof calculateInterfaceId;
  getRpcProviders: typeof getRpcProviders;
};

export default useContractUtils;
