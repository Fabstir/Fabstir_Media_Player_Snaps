import { Interface } from '@ethersproject/abi';

export function getAddressFromContractEvent(
  receipt,
  abi,
  eventName,
  eventArgName,
) {
  const iface = new Interface(abi);
  const parsedLogs = receipt.logs.map((log) => {
    try {
      return iface.parseLog(log);
    } catch (e) {
      return null;
    }
  });

  // Filter out null values and find the Transfer event
  const transferLog = parsedLogs.find((log) => log && log.name === eventName);

  let contractAddress;
  if (transferLog) {
    contractAddress = transferLog.args[eventArgName];

    console.log(
      'getAddressFromContractEvent: contractAddress:',
      contractAddress,
    );
  } else {
    const errMessage =
      'getAddressFromContractEvent: ${eventName} event not found';
    console.error(errMessage);
    throw new Error(errMessage);
  }

  return contractAddress;
}

export function logAllEventsFromReceipt(receipt, abi) {
  const iface = new Interface(abi);
  receipt.logs.forEach((log) => {
    try {
      const parsedLog = iface.parseLog(log);
      if (parsedLog) {
        console.log(`Event: ${parsedLog.name}`);
        parsedLog.args.forEach((arg, index) => {
          console.log(`Argument ${index}:`, arg.toString());
        });
      }
    } catch (e) {
      // This log didn't match any in the ABI
      console.error(
        "logAllEventsFromReceipt: This log didn't match any in the ABI, e = ",
        e,
      );
    }
  });
}

export function truncateAddress(address, charsToShow = 6, breakChar = '...') {
  const len = address.length;
  if (len <= charsToShow) {
    return address;
  }
  return (
    address.substring(0, charsToShow) +
    breakChar +
    address.substring(len - charsToShow, len)
  );
}
