import { useContext } from 'react';
import useContractUtils from './useContractUtils';
import BlockchainContext from '../../state/BlockchainContext';

/**
 * Function to handle Biconomy payment for a given user operation with sponsorship.
 * It checks if the smart account is defined and throws an error if it is not.
 * It then gets the Biconomy paymaster and paymaster service data for the given user operation.
 * It then gets the paymaster and data response for the user operation.
 * Finally, it sends the user operation and returns the user operation response.
 *
 * @function
 * @param {any} userOp - The user operation to handle Biconomy payment for.
 * @returns {Promise<any>} - The user operation response.
 */
export default function useParticlePayment(smartAccount) {
  const {
    getAddressFromChainIdAddressForTransaction,
    getProviderFromProviders,
    getDefaultCurrencySymbolFromChainId,
  } = useContractUtils();
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  /**
   * Function to handle Biconomy payment for a given user operation.
   * It checks if the smart account is defined and throws an error if it is not.
   * It then gets the Biconomy paymaster and fee quotes for the given user operation.
   * If the fee quotes are not defined, it throws an error.
   * It then calculates the gas fee for the user operation and builds the final user operation.
   * Finally, it sends the user operation and returns the user operation response.
   *
   * @function
   * @param {any} transactions - The partial user operation to handle Biconomy payment for.
   * @returns {Promise<any>} - The user operation response.
   */
  const handleAAPayment = async (transactions) => {
    if (!smartAccount)
      throw new Error(`handleAAPayment: smartAccount is undefined`);

    //get fee quotes with tx or txs
    const feeQuotesResult = await smartAccount.getFeeQuotes(transactions);

    // pay with ERC-20 tokens: fee quotes
    if (feeQuotesResult.tokenPaymaster) {
      const tokenPaymasterAddress =
        feeQuotesResult.tokenPaymaster.tokenPaymasterAddress;
      const tokenFeeQuotes = feeQuotesResult.tokenPaymaster.feeQuotes;

      const tokenFeeQuote = tokenFeeQuotes.find(
        (quote) =>
          quote?.tokenInfo?.symbol ===
          getDefaultCurrencySymbolFromChainId(connectedChainId),
      );

      if (!tokenFeeQuote)
        throw new Error('handleAAPayment: Token fee quote not found');

      const userOpBundle = await smartAccount.buildUserOperation({
        tx: transactions,
        feeQuote: tokenFeeQuote,
        tokenPaymasterAddress,
      });
      const userOp = userOpBundle.userOp;
      const userOpHash = userOpBundle.userOpHash;

      const txHash = await smartAccount.sendUserOperation({
        userOp,
        userOpHash,
      });
      console.log('useParticlePayment: handleAAPayment: txHash = ', txHash);

      const provider = getProviderFromProviders(connectedChainId);
      const receipt = await provider.waitForTransaction(txHash);
      console.log(
        'useAccountAbstractionPaymentSponsor: handleAAPayment: receipt =',
        receipt,
      );

      return {
        userOpHash,
        transactionUserOpDetails: null,
        receipt,
      };
    }
    return null;
  };

  /**
   * Function to handle Biconomy payment for a given user operation with sponsorship.
   *
   * @function
   * @param {any} transactions - The user operation to handle Biconomy payment for.
   * @returns {Promise<any>} - The user operation response.
   */
  const handleAAPaymentSponsor = async (transactions) => {
    if (!smartAccount)
      throw new Error(
        `useMintNestableNFT: handleAAPayment: smartAccount is undefined`,
      );

    const feeQuotesResult = await smartAccount.getFeeQuotes(transactions);

    // gasless transaction userOp, maybe null
    const gaslessUserOp = feeQuotesResult.verifyingPaymasterGasless?.userOp;
    const gaslessUserOpHash =
      feeQuotesResult.verifyingPaymasterGasless?.userOpHash;

    console.log(
      'useParticlePayment: handleAAPaymentSponsor: gaslessUserOp = ',
      gaslessUserOp,
    );
    console.log(
      'useParticlePayment: handleAAPaymentSponsor: gaslessUserOpHash = ',
      gaslessUserOpHash,
    );

    // Some code
    if (gaslessUserOp && gaslessUserOpHash) {
      try {
        const txHash = await smartAccount.sendUserOperation({
          userOp: gaslessUserOp,
          userOpHash: gaslessUserOpHash,
        });

        console.log(
          'useParticlePayment: handleAAPaymentSponsor: txHash = ',
          txHash,
        );

        const provider = getProviderFromProviders(connectedChainId);
        const receipt = await provider.waitForTransaction(txHash);
        console.log(
          'useAccountAbstractionPaymentSponsor: handleAAPaymentSponsor: receipt =',
          receipt,
        );

        return {
          userOpHash: gaslessUserOpHash,
          transactionUserOpDetails: null,
          receipt,
        };
      } catch (error) {
        console.error(
          'useAccountAbstractionPaymentSponsor: handleAAPaymentSponsor: error = ',
          error,
        );
      }
    }

    return null;
  };

  function createTransaction() {
    return {
      to: (address) => {
        return {
          data: (data) => {
            return {
              value: (value) => {
                return {
                  to: address,
                  data: data.data,
                  value: value, // Include the value property
                };
              },
              to: address,
              data: data.data,
            };
          },
        };
      },
    };
  }

  /**
   * Processes a bundle of transactions. If the environment variable `NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED` is set to 'all' or 'true',
   * it handles the payment process using Biconomy's Account Abstraction (AA) feature with a sponsor. Otherwise, it handles the payment process using AA without a sponsor.
   *
   * @async
   * @param {Array<Array<string, string>>} transactions - An array of pairs, each containing transaction data and a chain ID address.
   * @returns {Promise<Object>} A promise that resolves to an object containing the user operation hash, transaction details, and receipt.
   * @throws {Error} If the smart account is undefined or the connected chain ID is null or undefined.
   */
  async function processTransactionBundle(transactions) {
    const createdTransactions = [];

    for (const [transactionData, chainIdAddress] of transactions) {
      const address =
        getAddressFromChainIdAddressForTransaction(chainIdAddress);

      const createdTransaction = createTransaction()
        .to(address)
        .data(transactionData);
      createdTransactions.push(createdTransaction);
    }

    if (
      process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED === 'all' ||
      process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED === 'true'
    ) {
      return await handleAAPaymentSponsor(createdTransactions);
    } else return await handleAAPayment(createdTransactions);
  }

  return {
    handleAAPayment,
    handleAAPaymentSponsor,
    createTransaction,
    processTransactionBundle,
  };
}
