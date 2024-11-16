import createDBClient from 'fabstirdb-lib';
import { parseArrayProperties } from './utils/stringifyProperties';
import { fetchConfig } from '../src/fetchConfig';

let dbClient: any;
let isDBClientInitialized = false;

const initializeDBClientFunction = async () => {
  if (typeof window === 'undefined') {
    // Do not run this code on the server
    return;
  }

  const config = await fetchConfig();
  if (!config) {
    throw new Error('Failed to fetch configuration');
  }

  if (!config.fabstirDbBackendUrl) {
    throw new Error('No FabstirDB backend URL provided in the configuration');
  }

  dbClient = createDBClient(config.fabstirDbBackendUrl, '');

  console.log(
    'GlobalOrbit.ts: config.fabstirDbBackendUrl: ',
    config.fabstirDbBackendUrl,
  );
  console.log('GlobalOrbit.ts: dbClient: ', dbClient);

  isDBClientInitialized = true;
};

// Create a Promise that resolves when dbClient is isDBClientInitialized
const dbClientWaitForInitialized = initializeDBClientFunction();

const initializeDBClient = async () => {
  if (!isDBClientInitialized) {
    await dbClientWaitForInitialized;
  }
};

const getUser = () => {
  if (!dbClient || !dbClient.user) return null;

  const user = dbClient.user();
  console.log('GlobalOrbit.ts: user: ', user);
  return user;
};

const dbClientOnce = async (
  path: any,
  timeout1: number,
  timeout2: number,
  isParse = false,
) => {
  try {
    const resultObject = await path.load();
    if (resultObject === undefined) {
      return undefined;
    }

    const resultArray = Object.values(resultObject);
    console.log('dbClientOnce: resultArray = ', resultArray);

    const parsedResultArray = [];
    for (const result of resultArray) {
      let parsedResult = isParse ? JSON.parse(result as string) : result;
      parsedResult = parseArrayProperties(parsedResult); // Apply parseArrayProperties to the linked object
      parsedResultArray.push(parsedResult);
    }
    console.log('dbClientOnce: parsedResultArray = ', parsedResultArray);

    return parsedResultArray;
  } catch (error) {
    console.error(error);
  }
};

const dbClientLoad = async (
  path: any,
  timeout1: number,
  timeout2: number,
  isParse = false,
) => {
  const resultArray = await dbClientOnce(path, timeout1, timeout2, isParse);
  return resultArray;
};

export {
  dbClient,
  isDBClientInitialized,
  dbClientWaitForInitialized,
  initializeDBClient,
  getUser,
  dbClientOnce,
  dbClientLoad,
};
