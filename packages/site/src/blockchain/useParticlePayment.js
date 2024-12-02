import { useContext } from 'react';
import useContractUtils from './useContractUtils';
import BlockchainContext from '../../state/BlockchainContext';
import { parseUnits } from '@ethersproject/units';

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
    let feeQuotesResult;
    try {
      feeQuotesResult = await smartAccount.getFeeQuotes(transactions);
      console.log('Fee Quotes Result:', feeQuotesResult);
    } catch (error) {
      console.error('Error getting fee quotes:', error);
      alert(`Error: ${error.message}`);
    }

    // pay with ERC-20 tokens: fee quotes
    if (feeQuotesResult.tokenPaymaster) {
      const tokenPaymasterAddress =
        feeQuotesResult.tokenPaymaster.tokenPaymasterAddress;

      let tokenFeeQuotes;

      // Conditionally override token information for USDC if connected to Polygon Amoy
      // to try and overcome Particle Wallet API bug
      if (
        connectedChainId ===
        Number(process.env.NEXT_PUBLIC_POLYGON_AMOY_CHAIN_ID)
      ) {
        // Find the DAI fee quote
        const daiFeeQuote = feeQuotesResult.tokenPaymaster.feeQuotes.find(
          (quote) => quote.tokenInfo.symbol === 'DAI',
        );

        if (!daiFeeQuote) {
          throw new Error('handleAAPayment: DAI fee quote not found');
        }

        // Override token information for USDC
        tokenFeeQuotes = feeQuotesResult.tokenPaymaster.feeQuotes.map(
          (quote) => {
            if (quote.tokenInfo.symbol === 'USDC') {
              const adjustedFee = parseUnits(quote.fee, 18 - 6)
                .mul(120)
                .div(100);
              return {
                ...quote,
                tokenInfo: {
                  ...quote.tokenInfo,
                  decimals: 18,
                },
                fee: adjustedFee.toString(), // Adjust the fee calculation
              };
            }
            return quote;
          },
        );
      } else {
        tokenFeeQuotes = feeQuotesResult.tokenPaymaster.feeQuotes;
      }

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
   * @function
   * @param {Array<{data: string, chainId: string}>} transactions - An array of objects, each containing transaction data and a chain ID address.
   * @returns {Promise<Object>} A promise that resolves to an object containing the user operation hash, transaction details, and receipt.
   * @throws {Error} If the smart account is undefined or the connected chain ID is null or undefined.
   */
  async function processTransactionBundle(
    transactions,
    isSponsored = process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED,
  ) {
    const createdTransactions = [];

    for (const [transactionData, chainIdAddress] of transactions) {
      const address =
        getAddressFromChainIdAddressForTransaction(chainIdAddress);

      const createdTransaction = createTransaction()
        .to(address)
        .data(transactionData);
      createdTransactions.push(createdTransaction);
    }

    if (isSponsored === 'all' || isSponsored === 'true') {
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
