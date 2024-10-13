import createDBClient from 'fabstirdb-lib';
import { parseArrayProperties } from './utils/stringifyProperties';
/**
 * Instance of the OrbitDB client, created using the backend URL.
 */
const dbClient = createDBClient(
  process.env.NEXT_PUBLIC_FABSTIRDB_BACKEND_URL || '',
  '',
);

/**
 * Retrieves the current user from the database client.
 *
 * @returns The current user object if it exists, or null if no user is logged in.
 */
const getUser = () => {
  if (!dbClient.user) return null;

  const user = dbClient.user();
  console.log('GlobalOrbit.ts: user: ', user);
  return user;
};

console.log(
  'GlobalOrbit.ts: process.env.NEXT_PUBLIC_FABSTIRDB_BACKEND_URL: ',
  process.env.NEXT_PUBLIC_FABSTIRDB_BACKEND_URL,
);
console.log('GlobalOrbit.ts: dbClient: ', dbClient);

/**
 * FabstirDB serves as an interface API for storing data in a graph database. Based off of GUN API
 * it rejects with a timeout error. Optionally, it can parse the result if `isParse` is set to true.
 *
 * @async
 * @function dbClientOnce
 * @param {any} path - The database path or query to execute.
 * @param {number} timeout1 - The primary timeout duration in milliseconds.
 * @param {number} [timeout2] - The secondary timeout duration in milliseconds. If not provided, it defaults to twice the primary timeout.
 * @param {boolean} [isParse=false] - Flag indicating whether to parse the result of the database operation.
 * @returns {Promise<any>} A promise that resolves with the result of the database operation or rejects with a timeout error.
 */
async function dbClientOnce(
  path: any,
  timeout1: number,
  timeout2: number,
  isParse = false,
) {
  try {
    const resultObject = await path.load();
    if (resultObject === undefined) {
      return undefined;
    }

    const resultArray = Object.values(resultObject);
    console.log('gunLoad: resultArray = ', resultArray);

    const parsedResultArray = [];
    for (const result of resultArray) {
      let parsedResult = isParse ? JSON.parse(result as string) : result;
      parsedResult = parseArrayProperties(parsedResult); // Apply parseArrayProperties to the linked object
      parsedResultArray.push(parsedResult);
    }
    console.log('gunLoad: parsedResultArray = ', parsedResultArray);

    return parsedResultArray;
  } catch (error) {
    console.error(error);
  }
}

async function dbClientLoad(
  path: any,
  timeout1: number,
  timeout2: number,
  isParse = false,
) {
  const resultArray = await dbClientOnce(path, timeout1, timeout2, isParse);
  return resultArray;
}

export { dbClient, getUser, dbClientOnce, dbClientLoad };
