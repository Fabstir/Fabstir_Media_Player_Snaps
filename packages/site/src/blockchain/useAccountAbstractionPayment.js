// Importing the required types from ethers.js
import useParticlePayment from './useParticlePayment';
import useNativePayment from './useNativePayment';

// eslint-disable-next-line jsdoc/check-param-names
/**
 * This function is used to handle account abstraction payments. It uses the provided smart account
 * to determine which payment method to use (Biconomy, Particle, or Native) and returns an object
 * with the appropriate payment handling functions.
 *
 * @param {Object} smartAccount - The smart account object to use for payment abstraction.
 *
 * @returns {Object} An object containing the following properties:
 * - handleAAPayment: A function to handle the account abstraction payment.
 * - handleAAPaymentSponsor: A function to handle the account abstraction payment sponsor.
 * - createTransaction: A function to create a transaction.
 * - processTransactionBundle: A function to process a transaction bundle.
 *
 * @throws {Error} Throws an error if the `NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK` environment variable is not set to a valid value.
 */
export default function useAccountAbstractionPayment(smartAccount) {
  const particle = useParticlePayment(smartAccount);

  const native = useNativePayment(smartAccount);

  if (!smartAccount) {
    return {
      handleAAPayment: () => {},
      handleAAPaymentSponsor: null,
      createTransaction: () => {},
      processTransactionBundle: () => {},
    };
  }

  if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle') {
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
  if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle')
    return smartAccount.getAddress(smartAccount);
  else if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Native')
    return smartAccount.getAddress(smartAccount);
  else
    throw new Error(
      `getSmartAccountAddress: process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK is not valid`,
    );
};
