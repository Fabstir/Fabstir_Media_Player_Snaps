// const Gun = require('gun');
// const SEA = require('gun/sea');
import { SEA } from 'gun';
import { user } from '../user';
import { dbClient } from '../GlobalOrbit';

import axios from 'axios';
import useUploadEncKey from './useUploadEncKey';

export default function useFabstirController() {
  const submitKeyToController = async (userPub, addressId, encKey) => {
    console.log(
      'useFabstirController: process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTROLLER_EPUB =',
      process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTROLLER_EPUB,
    );
    console.log(
      'useFabstirController: process.env.NEXT_PUBLIC_FABSTIR_CONTROLLER_URL =',
      process.env.NEXT_PUBLIC_FABSTIR_CONTROLLER_URL,
    );
    console.log('useFabstirController: user._.sea =', user._.sea);

    const passphrase = await dbClient.secret(
      process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTROLLER_EPUB,
      user._.sea,
    );

    // The seller encrypts the marketItemSEAPair with the subscription controller's public key
    const scrambledKeySEAPair = await SEA.encrypt(encKey, passphrase);

    // save encKey
    const SUBMISSION_ENDPOINT = `${process.env.NEXT_PUBLIC_FABSTIR_CONTROLLER_URL}/submit_key`; // Change to your actual endpoint
    const payload = {
      userPub, // Owner's GUN user public key
      nftAddressId: addressId, // Subscription Plan ID
      scrambledKeySEAPair, // Encrypted Subscription SEA Pair
    };

    try {
      const response = await axios.post(SUBMISSION_ENDPOINT, payload);
      console.log('submitKeyToController:', response.data);
    } catch (error) {
      console.error('submitKeyToController: submitting encrypted  key:', error);
    }

    console.log('submitKeyToController: exit');
  };

  const retrieveKeyFromController = (
    userPub,
    creatorPub,
    nftAddressId,
    parentAddressId,
  ) => {
    return new Promise(async (resolve, reject) => {
      // Mark this function as async
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_FABSTIR_CONTROLLER_URL}/retrieve_key/${userPub}/${creatorPub}/${nftAddressId}/${parentAddressId}`,
        );

        if (response.data && response.data.scrambleKeySEAPair) {
          const passphrase = await dbClient.secret(
            process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTROLLER_EPUB,
            user._.sea,
          );

          // Assuming encKey should be retrieved from response.data.scrambleKeySEAPair
          // The original line seems to have a mistake as encKey is used before declaration
          const encKey = await SEA.decrypt(
            response.data.scrambleKeySEAPair,
            passphrase,
          );
          resolve(encKey); // Resolve with the decrypted key
        } else {
          reject(
            new Error(
              'retrieveKeyFromController: Key not found in the response.',
            ),
          );
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    submitKeyToController,
    retrieveKeyFromController,
  };
}
