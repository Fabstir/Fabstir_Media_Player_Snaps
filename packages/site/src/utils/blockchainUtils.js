import { Interface } from '@ethersproject/abi';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

/**
 * Extracts a contract address from a specified event in a transaction receipt.
 *
 * This function parses the logs from a given transaction receipt using the provided ABI
 * and searches for an event with a name that matches `eventName`. Once the event is found,
 * it retrieves the event argument specified by `eventArg` (which can be either the argument name
 * or its index) and returns its value, typically representing a contract address.
 *
 * @param {Object} receipt - The transaction receipt containing an array of log objects.
 * @param {Array|Object} abi - The ABI (Application Binary Interface) used to parse the logs.
 * @param {string} eventName - The name of the event to find in the logs.
 * @param {string|number} eventArg - The key or index of the event argument whose value will be extracted.
 * @returns {string} The extracted contract address.
 * @throws {Error} Throws an error if the specified event is not found in the receipt logs.
 */
export function getAddressFromContractEvent(receipt, abi, eventName, eventArg) {
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
    contractAddress = transferLog.args[eventArg];

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

/**
 * Logs all events parsed from a transaction receipt.
 *
 * This function iterates through the logs in the provided transaction receipt, attempts to
 * parse each log using the supplied ABI, and logs the event name along with each argument.
 * If a log cannot be parsed (for example, if it doesn't match any event in the ABI), an error message is logged.
 *
 * @param {Object} receipt - The transaction receipt containing an array of log objects.
 * @param {Array|Object} abi - The ABI (Application Binary Interface) used to parse the logs.
 * @returns {void}
 */
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

/**
 * Truncates a given address by showing a specified number of characters at the start and end,
 * with a break character in between.
 *
 * If the address length is less than or equal to the number of characters to show, the original address is returned.
 *
 * @param {string} address - The full address string to be truncated.
 * @param {number} [charsToShow=6] - The number of characters to display at both the beginning and the end of the address.
 * @param {string} [breakChar='...'] - The string to insert between the beginning and ending parts of the address.
 * @returns {string} The truncated address string.
 */
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

/**
 * Converts a BigNumber string into a floating point number.
 *
 * This function uses ethers.js's BigNumber to parse the input string, then converts
 * it to a floating point number using the specified number of decimal places. This
 * conversion leverages `formatUnits` to accurately handle the decimal scaling
 * and avoid precision loss.
 *
 * @param {string} bigNumberString - The string representation of the BigNumber.
 * @param {number} [decimalPlaces=18] - The number of decimal places to use for the conversion.
 * @returns {number} The resulting floating point number.
 */
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
