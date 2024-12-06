import { PaymasterMode } from '@biconomy/account';
import useContractUtils from './useContractUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import { process_env } from '../utils/process_env';

/**
 * Custom hook to handle payments using Biconomy.
 *
 * @param {Object} smartAccount - The smart account object to perform transactions.
 * @returns {Object} An object containing various functions to handle payments and transactions.
 *
 * @property {Function} handleAAPayment - Function to handle AA payment.
 * @property {Function} handleAAPaymentSponsor - Function to handle AA payment with a sponsor.
 * @property {Function} createTransaction - Function to create a transaction object.
 * @property {Function} processTransactionBundle - Function to process a bundle of transactions.
 */
export default function useBiconomyPayment(smartAccount) {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const {
    getAddressFromChainIdAddressForTransaction,
    getTokenAddressFromChainIdAndTokenSymbol,
  } = useContractUtils();

  /**
   * Handles the payment process using Biconomy's Account Abstraction (AA) feature.
   *
   * @async
   * @param {Object[]} transactions - An array of transaction objects to be processed.
   * @returns {Promise<Object>} A promise that resolves to an object containing the user operation hash, transaction details, and receipt.
   * @throws {Error} If the smart account is undefined or the connected chain ID is null or undefined.
   */
  const handleAAPayment = async (transactions) => {
    if (!smartAccount)
      throw new Error(`handleAAPayment: smartAccount is undefined`);

    if (connectedChainId === null || connectedChainId === undefined) {
      throw new Error('connectedChainId is null or undefined.');
    }

    console.log('handleAAPayment: transactions = ', transactions);

    const tokenSymbolName = 'NEXT_PUBLIC_DEFAULT_CURRENCY_' + connectedChainId;
    console.log('handleAAPayment: tokenSymbolName = ', tokenSymbolName);

    const tokenSymbol = process_env[tokenSymbolName];
    const tokenAddress = getTokenAddressFromChainIdAndTokenSymbol(
      connectedChainId,
      tokenSymbol,
    );

    console.log('handleAAPayment: tokenAddress = ', tokenAddress);

    const paymasterServiceData = {
      mode: PaymasterMode.ERC20,
      preferredToken: tokenAddress,
    };

    const userOpResponse = await smartAccount.sendTransaction(transactions, {
      paymasterServiceData,
    });
    console.log(
      `useBiconomyPayment: handleAAPayment: userOps Hash: ${userOpResponse.userOpHash}`,
    );

    const transactionUserOpDetails = await userOpResponse.wait();

    console.log(
      `useBiconomyPayment: handleAAPayment: transactionUserOpDetails = ${JSON.stringify(
        transactionUserOpDetails,
        null,
        '\t',
      )}`,
    );

    if (transactionUserOpDetails.success !== 'true')
      throw new Error('handleAAPayment: Transaction failed');

    const { receipt } = transactionUserOpDetails;

    return {
      userOpHash: userOpResponse.userOpHash,
      transactionUserOpDetails,
      receipt,
    };
  };

  /**
   * Handles the payment process using Biconomy's Account Abstraction (AA) feature with a sponsor.
   *
   * @async
   * @param {Object[]} transactions - An array of transaction objects to be processed.
   * @returns {Promise<Object>} A promise that resolves to an object containing the user operation hash, transaction details, and receipt.
   * @throws {Error} If the smart account is undefined or the connected chain ID is null or undefined.
   */
  const handleAAPaymentSponsor = async (transactions) => {
    if (!smartAccount)
      throw new Error(
        `useMintNestableNFT: handleAAPaymentSponsor: smartAccount is undefined`,
      );

    if (connectedChainId === null || connectedChainId === undefined) {
      throw new Error('connectedChainId is null or undefined.');
    }

    try {
      const tokenSymbol = process_env['DEFAULT_CURRENCY_' + connectedChainId];

      let paymasterServiceData = {
        mode: PaymasterMode.SPONSORED, // - mandatory // now we know chosen fee token and requesting paymaster and data for it
        feeTokenAddress: getTokenAddressFromChainIdAndTokenSymbol(
          connectedChainId,
          tokenSymbol,
        ),
        // optional params..
        calculateGasLimits: true, // Always recommended and especially when using token paymaster
      };
      const userOpResponse = await smartAccount.sendTransaction(transactions, {
        paymasterServiceData,
      });

      console.log(
        `useBiconomyPayment: handleAAPaymentSponsor: userOps Hash: ${userOpResponse.userOpHash}`,
      );

      const transactionUserOpDetails = await userOpResponse.wait();

      console.log(
        `useBiconomyPayment: handleAAPaymentSponsor: transactionUserOpDetails = ${JSON.stringify(
          transactionUserOpDetails,
          null,
          '\t',
        )}`,
      );

      if (transactionUserOpDetails.success !== 'true')
        throw new Error('handleAAPaymentSponsor: Transaction failed');

      const { receipt } = transactionUserOpDetails;

      return {
        userOpHash: userOpResponse.userOpHash,
        transactionUserOpDetails,
        receipt,
      };
    } catch (error) {
      console.error('buildUserOp error:', error);
      // Here you can handle the error without triggering the popup
    }
  };

  function createTransaction() {
    return {
      to: (address) => {
        return {
          data: (data) => {
            return {
              to: address,
              data: data.data,
            };
          },
        };
      },
    };
  }

  /**
   * Processes a bundle of transactions. If the environment variable `DEFAULT_ALLOW_AA_SPONSORED` is set to 'all' or 'true',
   * it handles the payment process using Biconomy's Account Abstraction (AA) feature with a sponsor. Otherwise, it handles the payment process using AA without a sponsor.
   *
   * @async
   * @param {Array<Array<string, string>>} transactions - An array of pairs, each containing transaction data and a chain ID address.
   * @param {number} [increaseGasLimit=0.0] - The amount to increase the gas limit by.
   * @param {Array<number>} [gasLimits=null] - An array of gas limits for the transactions.
   * @returns {Promise<Object>} A promise that resolves to an object containing the user operation hash, transaction details, and receipt.
   * @throws {Error} If the smart account is undefined or the connected chain ID is null or undefined.
   */
  async function processTransactionBundle(
    transactions,
    isSponsored = process_env.DEFAULT_ALLOW_AA_SPONSORED,
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
