import { ethers } from 'ethers';
import useContractUtils from './useContractUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';

export default function useNativePayment(signer) {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const { addressType, getProviderFromChainId } = useContractUtils();

  // Ensures the signer is correctly provided and alerts if not
  if (!signer) {
    console.error('useNativePayment: No signer provided');
    //    throw new Error('useNativePayment: requires a valid signer')
  }

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

    for (const [transactionData, address, gasEstimate] of transactions) {
      const tx = { to: address, data: transactionData.data };
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

  const handleAAPaymentSponsor = async (transactions) => {
    // Initialize the aggregated receipt structure
    const aggregatedReceipt = {
      isSuccess: true,
      transactions: [], // Contains transaction hash and status
      logs: [], // Aggregate logs from all transactions
    };

    // Optionally initialize arrays to store hashes and details for all transactions
    const transactionHashes = [];
    const transactionDetails = [];

    // Set up signer using the sponsored account private key
    const provider = getProviderFromChainId(connectedChainId);

    // Update with your provider URL
    const wallet = new ethers.Wallet(
      process.env.NEXT_PUBLIC_SPONSORED_ACCOUNT_PRIVATE_KEY,
      provider,
    );

    for (const [transactionData, address, gasEstimate] of transactions) {
      const tx = { to: address, data: transactionData.data };
      if (gasEstimate) {
        tx.gasLimit = gasEstimate;
      }

      try {
        // Send the transaction using the sponsored wallet
        const response = await wallet.sendTransaction(tx);
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
          `useNativePayment: handleAAPaymentSponsor: receipt.isSuccess = ${aggregatedReceipt.isSuccess}`,
        );

        console.log(
          `useNativePayment: handleAAPaymentSponsor: transactionHashes = ${transactionHashes}`,
        );

        console.log(
          `useNativePayment: handleAAPaymentSponsor: transactionDetails = ${JSON.stringify(
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
      const address = addressType(chainIdAddress);

      const createdTransaction = createTransaction()
        .to(address)
        .data(transactionData);
      createdTransactions.push([createdTransaction, address]);
    }

    if (process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED === 'true')
      return await handleAAPaymentSponsor(createdTransactions);
    else {
      return await handleAAPayment(createdTransactions);
    }
  }

  return {
    handleAAPayment,
    handleAAPaymentSponsor,
    createTransaction,
    processTransactionBundle,
  };
}
