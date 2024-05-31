import createDBClient from 'fabstirdb-lib';
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

export { dbClient, getUser };
