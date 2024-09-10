import { colorDb } from './GlobalOrbit';

// Database

// Gun color
export let color = {};

if (typeof window !== 'undefined') {
  //  user = gun.user().recall({ sessionStorage: true })
  color = colorDb.color();
  console.log('color: color =', color);

  colorDb.on('auth', async (event) => {
    console.log('index: auth event emitted, color.is = ', color?.is);
  });
}
