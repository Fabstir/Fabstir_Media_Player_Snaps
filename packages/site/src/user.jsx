import { dbClient, dbClientWaitForInitialized } from './GlobalOrbit';

// Database

// Gun User
export let user = {};

const initializeUser = async () => {
  await dbClientWaitForInitialized; // Wait for dbClient to be isDBClientInitialized

  if (typeof window !== 'undefined' && dbClient) {
    console.log('user: before');
    user = dbClient.user();
    console.log('user: user =', user);

    dbClient.on('auth', async (event) => {
      console.log('index: auth event emitted, user.is = ', user?.is);
    });
  } else {
    console.log('Condition not met: window or dbClient is undefined');
  }
};

initializeUser();
