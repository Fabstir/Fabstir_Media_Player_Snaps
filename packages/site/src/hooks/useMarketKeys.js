import { dbClient } from '../GlobalOrbit';
import { user } from '../user';
import { SEA } from 'gun';

import axios from 'axios';
import { useConfig } from '../../state/configContext';

export default function useMarketKeys() {
  const config = useConfig();

  const createMediaSEAPair = async () => {
    const mediaSEAPair = await SEA.pair();
    return mediaSEAPair;
  };

  const submitEncryptedMediaKey = async (
    sellerPub,
    cidWithoutKey,
    scrambledMediaSEAPair,
  ) => {
    const SUBMISSION_ENDPOINT = `${config.fabstirControllerUrl}/submit_media_key`;

    const encodedCidWithoutKey = encodeURIComponent(cidWithoutKey);
    const payload = {
      sellerPub, // Owner's GUN user public key
      encodedCidWithoutKey, // Media Plan ID
      scrambledMediaSEAPair, // Encrypted Media SEA Pair
    };

    try {
      const response = await axios.post(SUBMISSION_ENDPOINT, payload);
      console.log('useMarketKeys: Success:', response.data);
      // Handle success response, maybe update UI or state accordingly
    } catch (error) {
      console.error(
        'useMarketKeys: Error submitting encrypted marketItem key:',
        error,
      );
      // Handle error, maybe show a message to the user
    }
  };

  /**
   * Retrieves the scrambled marketItem key for a subscriber.
   *
   * @param {string} sellerPub The public key of the content owner.
   * @param {string} planId The ID of the marketItem plan.
   * @param {string} subscriberPub The public key of the subscriber.
   * @param {string} userMediaAddress The blockchain address used for marketItem verification.
   * @returns {Promise} A promise that resolves with the scrambled marketItem key or rejects with an error.
   */
  const retrieveEncryptedMediaKey = (sellerPub, cidWithoutKey, buyerPub) => {
    return new Promise((resolve, reject) => {
      const encodedCidWithoutKey = encodeURIComponent(cidWithoutKey);
      const url = `${config.fabstirControllerUrl}/retrieve_media_key/${sellerPub}/${encodedCidWithoutKey}/${buyerPub}`;
      console.log('useMarketKeys: retrieveEncryptedMediaKey: url = ', url);
      axios
        .get(url)
        .then((response) => {
          // Assuming the server returns the re-encrypted marketItem key in the response
          if (response.data && response.data.scrambledMediaSEAPair) {
            resolve(response.data.scrambledMediaSEAPair);
          } else {
            reject(
              new Error('useMarketKeys: Media key not found in the response.'),
            );
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getMediaKey = async (userPub, cidWithoutKey, mediaSEAPair) => {
    console.log('useMarketKeys: getMediaKey: userPub = ', userPub);
    console.log('useMarketKeys: getMediaKey: cidWithoutKey = ', cidWithoutKey);
    console.log('useMarketKeys: getMediaKey: mediaSEAPair = ', mediaSEAPair);

    let scrambledKey;
    try {
      scrambledKey = await new Promise((res, rej) =>
        gun
          .user(userPub)
          .get('market')
          .get(cidWithoutKey)
          .once((final_value) => {
            if (final_value) {
              console.log(
                'useMarketKeys: getMediaKey: Successfully retrieved scrambledKey',
              );
              res(final_value);
            } else {
              rej(
                new Error(
                  'useMarketKeys: getMediaKey: No value returned for scrambledKey',
                ),
              );
            }
          }),
      );
    } catch (error) {
      console.error(
        'useMarketKeys: getMediaKey: Error retrieving scrambledKey:',
        error,
      );
    }

    console.log('useMarketKeys: getMediaKey: scrambledKey = ', scrambledKey);

    const key = await SEA.decrypt(scrambledKey, mediaSEAPair);
    return key;
  };

  const putMediaKey = async (cidWithoutKey, mediaSEAPair, key) => {
    console.log('useMarketKeys: putMediaKey: cidWithoutKey = ', cidWithoutKey);
    console.log('useMarketKeys: putMediaKey: mediaSEAPair = ', mediaSEAPair);

    console.log('useMarketKeys: putMediaKey: key = ', key);

    const scrambledKey = await SEA.encrypt(key, mediaSEAPair);

    console.log('useMarketKeys: putMediaKey: scrambledKey = ', scrambledKey);

    user
      .get('market')
      .get(cidWithoutKey)
      .put(scrambledKey, (ack) => {
        if (ack.err) {
          console.error('useMarketKeys: putMediaKey: Error:', ack.err);
        } else {
          console.log('useMarketKeys: putMediaKey: Success:', ack.ok);
        }
      });
  };
  return {
    createMediaSEAPair,
    submitEncryptedMediaKey,
    retrieveEncryptedMediaKey,
    getMediaKey,
    putMediaKey,
  };
}
