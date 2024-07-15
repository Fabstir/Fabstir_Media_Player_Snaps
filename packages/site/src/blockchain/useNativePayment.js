import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import useContractUtils from './useContractUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';

export default function useNativePayment(signer) {
  const {
    getAddressFromChainIdAddressForTransaction,
    getProviderFromProviders,
  } = useContractUtils();
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  // Ensures the signer is correctly provided and alerts if not
  if (!signer) {
    console.error('useNativePayment: No signer provided');
    //    throw new Error('useNativePayment: requires a valid signer')
  }

  /**
   * Handles execution of onchain transactions using blockchain native token for gas.
   *
   * @async
   * @function
   * @param {Array} transactions - An array of transactions to be processed.
   * @returns {Promise<void>} A Promise that resolves when the payment process is complete.
   */
  const handleAAPayment = async (transactions) => {
    const aggregatedReceipt = {
      isSuccess: true,
      transactions: [], // Contains transaction hash and status
      logs: [], // Aggregate logs from all transactions
    };

    // Optionally initialize arrays to store hashes and details for all transactions
    const [transactionData, address, gasEstimate] = transactions[0];
    console.log(
      `useNativePayment: handleAAPayment: transactionData = ${transactionData}`,
    );
    console.log(`useNativePayment: handleAAPayment: address = ${address}`);
    console.log(
      `useNativePayment: handleAAPayment: gasEstimate = ${gasEstimate}`,
    );

    const transactionHashes = [];
    const transactionDetails = [];

    const provider = getProviderFromProviders(connectedChainId);

    const latestBlock = await provider.getBlock('latest');
    const baseFeePerGas = BigNumber.from(latestBlock.baseFeePerGas);

    // Calculate maxFeePerGas and maxPriorityFeePerGas
    const maxPriorityFeePerGas = parseUnits('2', 'gwei'); // Example priority fee
    const buffer = parseUnits('2', 'gwei'); // Example buffer
    const maxFeePerGas = baseFeePerGas.add(maxPriorityFeePerGas).add(buffer);

    for (const [transactionData, address, gasEstimate] of transactions) {
      const tx = {
        to: address,
        data: transactionData.data,
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
      };
      if (gasEstimate) {
        tx.gasLimit = gasEstimate;
      }

      try {
        const response = await signer.sendTransaction(tx);
        const receipt = await response.wait();

        // Aggregate information for return structure
        transactionHashes.push(receipt.transactionHash);
        transactionDetails.push(receipt);

        aggregatedReceipt.transactions.push({
          transactionHash: receipt.transactionHash,
          status: receipt.status,
        });
        aggregatedReceipt.logs.push(...receipt.logs);

        if (receipt.status === 0) {
          aggregatedReceipt.isSuccess = false;
        }

        console.log(
          `useNativePayment: handleAAPayment: receipt.isSuccess = ${aggregatedReceipt.isSuccess}`,
        );

        console.log(
          `useNativePayment: handleAAPayment: transactionHashes = ${transactionHashes}`,
        );

        console.log(
          `useNativePayment: handleAAPayment: transactionDetails = ${JSON.stringify(
            transactionDetails,
            null,
            '\t',
          )}`,
        );
      } catch (error) {
        console.error('useNativePayment: Error sending transaction:', error);
        aggregatedReceipt.isSuccess = false;
        break; // Depending on your policy, this could be a continue instead
      }
    }

    // Assembling the return object
    // Note: `userOpHash` and `transactionUserOpDetails` are adapted to the context of direct transactions
    return {
      receipt: aggregatedReceipt,
      userOpHash: transactionHashes, // Return all transaction hashes as the operation hash equivalent
      transactionUserOpDetails: transactionDetails, // Return all transaction receipts as the operation details equivalent
    };
  };

  // This function may not be necessary for native payments but is included for API consistency
  function createTransaction() {
    return {
      to: (address) => ({
        data: (data) => ({
          to: address,
          data: data.data,
          // You can expand this template as needed
        }),
      }),
    };
  }

  // Process a bundle of transactions, with the option for additional configurations like gas limit adjustments
  async function processTransactionBundle(transactions) {
    const createdTransactions = [];

    for (const [transactionData, chainIdAddress] of transactions) {
      const address =
        getAddressFromChainIdAddressForTransaction(chainIdAddress);

      const createdTransaction = createTransaction()
        .to(address)
        .data(transactionData);
      createdTransactions.push([createdTransaction, address]);
    }

    return handleAAPayment(createdTransactions);
  }

  return {
    handleAAPayment,
    createTransaction,
    processTransactionBundle,
  };
}
