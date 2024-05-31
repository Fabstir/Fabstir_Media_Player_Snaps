import { dbClient } from './GlobalOrbit';

// Database

// Gun User
export let user = {};

if (typeof window !== 'undefined') {
  //  user = gun.user().recall({ sessionStorage: true })
  user = dbClient.user();
  console.log('user: user =', user);

  dbClient.on('auth', async (event) => {
    console.log('index: auth event emitted, user.is = ', user?.is);
  });
}
