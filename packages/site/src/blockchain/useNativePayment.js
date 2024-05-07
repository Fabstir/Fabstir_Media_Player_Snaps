export default function useNativePayment(signer) {
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
    return handleAAPayment(transactions);
  }

  return {
    handleAAPayment,
    createTransaction,
    processTransactionBundle,
  };
}
