import { dbClient } from '../GlobalOrbit.ts';
import { user } from '../user';
import { getNFTAddressId } from '../utils/nftUtils';
import { SEA } from 'gun';

export default function useEncKey() {
  return async (userPub, nft, isEncrypt = true) => {
    console.log('useEncKey: userPub = ', userPub);
    console.log('useEncKey: nft = ', nft);
    console.log('useEncKey: isEncrypt = ', isEncrypt);

    try {
      console.log('useEncKey: inside');
      const encKeyScrambled = await new Promise((resolve, reject) => {
        dbClient
          .user(userPub)
          .get('nfts_enc_keys')
          .get(getNFTAddressId(nft))
          .get('enc_key')
          .once((final_value, key) => {
            if (final_value) {
              resolve(final_value); // Resolve the promise with the final_value
            } else {
              reject('useEncKey: No key found'); // Reject the promise if no value is found
            }
          });
      });

      if (!encKeyScrambled) return;

      console.log('useEncKey: encKeyScrambled = ', encKeyScrambled);

      if (isEncrypt) {
        const encKey = await SEA.decrypt(encKeyScrambled, user._.sea);

        console.log('useEncKey: encKey = ', encKey);
        //    const encKey = JSON.parse(encKeyScrambled)
        return encKey;
      } else {
        return encKeyScrambled;
      }
    } catch (e) {
      console.log('useEncKey: error = ', e);
    }
  };
}
