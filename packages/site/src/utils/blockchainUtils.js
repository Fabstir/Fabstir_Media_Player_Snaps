import { Interface } from '@ethersproject/abi';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

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

export function bigNumberToFloat(bigNumberString, decimalPlaces = 18) {
  // Parse the Big Number string
  const bigNumber = BigNumber.from(bigNumberString);

  // Convert to floating point number using string division to avoid precision loss
  const floatNumber = parseFloat(formatUnits(bigNumber, decimalPlaces));

  return floatNumber;
}

export function abbreviateAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function abbreviateAddress2(
  address,
  charsToShowStart = 6,
  charsToShowEnd = 4,
) {
  return `${address.slice(0, charsToShowStart)}...${address.slice(
    -charsToShowEnd,
  )}`;
}
