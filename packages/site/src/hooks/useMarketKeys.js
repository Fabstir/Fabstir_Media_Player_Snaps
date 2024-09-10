import { dbClient } from '../GlobalOrbit';
import { user } from '../user';
import { SEA } from 'gun';

import axios from 'axios';

export default function useMarketKeys() {
  const createMarketItemSEAPair = async () => {
    const marketItemSEAPair = await SEA.pair();
    return marketItemSEAPair;
  };

  const submitEncryptedMarketItemKey = async (
    sellerPub,
    marketItemId,
    scrambledMarketItemSEAPair,
  ) => {
    const SUBMISSION_ENDPOINT = `${process.env.NEXT_PUBLIC_FABSTIR_CONTROLLER_URL}/submit_market_key`;
    const payload = {
      sellerPub, // Owner's GUN user public key
      marketItemId, // MarketItem Plan ID
      scrambledMarketItemSEAPair, // Encrypted MarketItem SEA Pair
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
   * @param {string} userMarketItemAddress The blockchain address used for marketItem verification.
   * @returns {Promise} A promise that resolves with the scrambled marketItem key or rejects with an error.
   */
  const retrieveEncryptedMarketItemKey = (
    sellerPub,
    marketItemId,
    buyerPub,
  ) => {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_FABSTIR_CONTROLLER_URL}/retrieve_market_key/${sellerPub}/${marketItemId}/${buyerPub}`,
        )
        .then((response) => {
          // Assuming the server returns the re-encrypted marketItem key in the response
          if (response.data && response.data.scrambledMarketItemSEAPair) {
            resolve(response.data.scrambledMarketItemSEAPair);
          } else {
            reject(
              new Error(
                'useMarketKeys: MarketItem key not found in the response.',
              ),
            );
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getMarketItemKey = async (userPub, marketItemId, marketItemSEAPair) => {
    console.log('useMarketKeys: getMarketItemKey: userPub = ', userPub);
    console.log(
      'useMarketKeys: getMarketItemKey: marketItemId = ',
      marketItemId,
    );
    console.log(
      'useMarketKeys: getMarketItemKey: marketItemSEAPair = ',
      marketItemSEAPair,
    );

    let scrambledKey;
    try {
      scrambledKey = await new Promise((res, rej) =>
        dbClient
          .user(userPub)
          .get('market')
          .get(marketItemId)
          .once((final_value) => {
            if (final_value) {
              console.log(
                'useMarketKeys: getMarketItemKey: Successfully retrieved scrambledKey',
              );
              res(final_value);
            } else {
              rej(
                new Error(
                  'useMarketKeys: getMarketItemKey: No value returned for scrambledKey',
                ),
              );
            }
          }),
      );
    } catch (error) {
      console.error(
        'useMarketKeys: getMarketItemKey: Error retrieving scrambledKey:',
        error,
      );
    }

    console.log(
      'useMarketKeys: getMarketItemKey: scrambledKey = ',
      scrambledKey,
    );

    const key = await SEA.decrypt(scrambledKey, marketItemSEAPair);
    return key;
  };

  const putMarketItemKey = async (marketItemId, marketItemSEAPair, key) => {
    console.log(
      'useMarketKeys: putMarketItemKey: marketItemId = ',
      marketItemId,
    );
    console.log(
      'useMarketKeys: putMarketItemKey: marketItemSEAPair = ',
      marketItemSEAPair,
    );

    console.log('useMarketKeys: putMarketItemKey: key = ', key);

    const scrambledKey = await SEA.encrypt(key, marketItemSEAPair);

    console.log(
      'useMarketKeys: putMarketItemKey: scrambledKey = ',
      scrambledKey,
    );

    user
      .get('market')
      .get(marketItemId)
      .put(scrambledKey, (ack) => {
        if (ack.err) {
          console.error('useMarketKeys: putMarketItemKey: Error:', ack.err);
        } else {
          console.log('useMarketKeys: putMarketItemKey: Success:', ack.ok);
        }
      });
  };

  return {
    createMarketItemSEAPair,
    submitEncryptedMarketItemKey,
    retrieveEncryptedMarketItemKey,
    getMarketItemKey,
    putMarketItemKey,
  };
}
