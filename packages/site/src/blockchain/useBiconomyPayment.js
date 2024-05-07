import { PaymasterMode } from '@biconomy/account';

/**
 * Custom hook to handle payments using Biconomy.
 *
 * @param {Object} provider - The provider object to interact with Ethereum.
 * @param {Object} smartAccount - The smart account object to perform transactions.
 * @returns {Object} An object containing various functions to handle payments and transactions.
 *
 * @property {Function} handleAAPayment - Function to handle AA payment.
 * @property {Function} handleAAPaymentSponsor - Function to handle AA payment with a sponsor.
 * @property {Function} createTransaction - Function to create a transaction object.
 * @property {Function} processTransactionBundle - Function to process a bundle of transactions.
 */
export default function useBiconomyPayment(provider, smartAccount) {
  const handleAAPayment = async (transactions) => {
    if (!smartAccount)
      throw new Error(`handleAAPayment: smartAccount is undefined`);

    console.log('handleAAPayment: transactions = ', transactions);

    const paymasterServiceData = {
      mode: PaymasterMode.ERC20,
      preferredToken: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS,
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

    const { receipt } = transactionUserOpDetails;

    return {
      userOpHash: userOpResponse.userOpHash,
      transactionUserOpDetails,
      receipt,
    };
  };

  const handleAAPaymentSponsor = async (transactions) => {
    if (!smartAccount)
      throw new Error(
        `useMintNestableNFT: handleAAPaymentSponsor: smartAccount is undefined`,
      );

    try {
      let paymasterServiceData = {
        mode: PaymasterMode.SPONSORED, // - mandatory // now we know chosen fee token and requesting paymaster and data for it
        feeTokenAddress: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS,
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

  async function processTransactionBundle(
    transactions,
    increaseGasLimit = 0.0,
    gasLimits = null,
  ) {
    const createdTransactions = [];

    for (const [transactionData, address] of transactions) {
      const createdTransaction = createTransaction()
        .to(address)
        .data(transactionData);
      createdTransactions.push(createdTransaction);
    }

    if (
      process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED === 'all' ||
      process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED === 'true'
    ) {
      return await handleAAPaymentSponsor(
        createdTransactions,
        increaseGasLimit,
        gasLimits,
      );
    } else
      return await handleAAPayment(
        createdTransactions,
        increaseGasLimit,
        gasLimits,
      );
  }

  return {
    handleAAPayment,
    handleAAPaymentSponsor,
    createTransaction,
    processTransactionBundle,
  };
}
