import { useRecoilValue } from 'recoil';
import {
  currenciesfromcontractaddressesstate,
  decimalplacesfromcurrenciesstate,
  currencieslogourlstate,
  currenciesstate,
  contractaddressesfromcurrenciesstate,
} from '../atoms/currenciesAtom';
import useContractUtils from '../blockchain/useContractUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';

export default function useCurrencyUtils() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const currencies = useRecoilValue(currenciesstate);
  const currenciesLogoUrl = useRecoilValue(currencieslogourlstate);
  const decimalPlacesFromCurrencies = useRecoilValue(
    decimalplacesfromcurrenciesstate,
  );

  const contractAddressesFromCurrencies = useRecoilValue(
    contractaddressesfromcurrenciesstate,
  );

  const currenciesFromContractAddresses = useRecoilValue(
    currenciesfromcontractaddressesstate,
  );

  const { getChainIdAddressFromChainIdAndAddress } = useContractUtils();

  const getWhiteListedCurrencies = () => {
    return currencies;
  };

  const getCurrenciesLogoUrl = () => {
    return currenciesLogoUrl;
  };

  const getDecimalPlacesFromCurrencies = () => {
    return decimalPlacesFromCurrencies;
  };

  const getDecimalPlaceFromCurrency = (currency) => {
    return decimalPlacesFromCurrencies[
      getChainIdAddressFromChainIdAndAddress(connectedChainId, currency)
    ];
  };

  const getContractAddressesFromCurrencies = () => {
    return contractAddressesFromCurrencies;
  };

  const getContractAddressFromCurrency = (currency) => {
    return contractAddressesFromCurrencies[
      getChainIdAddressFromChainIdAndAddress(connectedChainId, currency)
    ];
  };

  const getCurrenciesFromContractAddresses = () => {
    return currenciesFromContractAddresses;
  };

  const getCurrencyFromContractAddress = (tokenAddress) => {
    return currenciesFromContractAddresses[
      getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        tokenAddress.toLowerCase(),
      )
    ];
  };

  return {
    getWhiteListedCurrencies,
    getCurrenciesLogoUrl,
    getDecimalPlacesFromCurrencies,
    getDecimalPlaceFromCurrency,
    getContractAddressesFromCurrencies,
    getContractAddressFromCurrency,
    getCurrenciesFromContractAddresses,
    getCurrencyFromContractAddress,
  };
}
