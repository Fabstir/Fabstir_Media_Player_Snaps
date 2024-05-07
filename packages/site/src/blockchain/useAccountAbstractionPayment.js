// Importing the required types from ethers.js
import useBiconomyPayment from './useBiconomyPayment';
import useParticlePayment from './useParticlePayment';
import useNativePayment from './useNativePayment';

/**
 * This hook function selects the appropriate payment method based on the environment variable `NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK`.
 * It supports Biconomy, Particle, and Native payment methods.
 *
 * @param {object} provider - The provider object to be used for the payment.
 * @param {object} smartAccount - The smart account object to be used for the payment.
 * @returns {object} An object containing the following methods:
 * - handleAAPayment: Function to handle the account abstraction payment.
 * - handleAAPaymentSponsor: Function to handle the account abstraction payment sponsor. This is null for Native payment method.
 * - createTransaction: Function to create a transaction.
 * - processTransactionBundle: Function to process a transaction bundle.
 * @throws {Error} Will throw an error if `NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK` is not 'Biconomy', 'Particle', or 'Native'.
 */
export default function useAccountAbstractionPayment(provider, smartAccount) {
  const biconomy = useBiconomyPayment(provider, smartAccount);
  const particle = useParticlePayment(provider, smartAccount);

  const native = useNativePayment(smartAccount);

  if (!provider)
    throw new Error(`useAccountAbstractionPayment: provider is undefined`);

  if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Biconomy') {
    return {
      handleAAPayment: biconomy.handleAAPayment,
      handleAAPaymentSponsor: biconomy.handleAAPaymentSponsor,
      createTransaction: biconomy.createTransaction,
      processTransactionBundle: biconomy.processTransactionBundle,
    };
  } else if (
    process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle'
  ) {
    return {
      handleAAPayment: particle.handleAAPayment,
      handleAAPaymentSponsor: particle.handleAAPaymentSponsor,
      createTransaction: particle.createTransaction,
      processTransactionBundle: particle.processTransactionBundle,
    };
  } else if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native') {
    return {
      handleAAPayment: native.handleAAPayment,
      handleAAPaymentSponsor: null,
      createTransaction: native.createTransaction,
      processTransactionBundle: native.processTransactionBundle,
    };
  } else
    throw new Error(
      `useAccountAbstractionPayment: process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK is not valid`,
    );
}

export const getSmartAccountAddress = (smartAccount) => {
  if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Biconomy')
    return smartAccount.getAccountAddress(smartAccount);
  else if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle')
    return smartAccount.getAddress(smartAccount);
  else if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native')
    return smartAccount.getAddress(smartAccount);
  else
    throw new Error(
      `getSmartAccountAddress: process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK is not valid`,
    );
};
