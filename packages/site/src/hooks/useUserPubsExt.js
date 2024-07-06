import { SEA } from 'gun';

import { dbClient } from '../GlobalOrbit';

export default function useUserPubsExt() {
  const USERS_CONTENT = `#Fabstir${process.env.NEXT_PUBLIC_FABSTIR_MEDIA_PLAYER_INSTANCE}_users`;

  const fetchUserPubs = async (filter) => {
    const userPubs = [];

    console.log('useUserPubs: inside');

    //  if (!filter) {
    const results = await new Promise((res) =>
      dbClient.get(USERS_CONTENT).once((final_value) => res(final_value)),
    );

    console.log('useUserPubs: results!! = ', results);

    if (results) {
      for (let key in results) {
        if (key !== '_' && key !== '#') userPubs.push(results[key]);
      }

      console.log('useUserPubs: userPubs = ', userPubs);
    }
    //}

    return userPubs;
    //return results
  };

  const putUserPub = async (userPub) => {
    const hash = await SEA.work(userPub, null, null, {
      name: 'SHA-256',
    });

    dbClient
      .get(USERS_CONTENT)
      .get(hash)
      .put(userPub, (ack) => {
        if (ack.err) {
          console.error(
            'useUserPubsExt: putUser: Error writing to Gun:',
            ack.err,
          );
        } else {
          console.log('useUserPubsExt: putUser: Successfully written to Gun');
        }
      });
  };

  async function getAllUsersPubs() {
    return new Promise((resolve, reject) => {
      let results = [];

      console.log('getAllUsersPubs: Starting to fetch all users pubs');

      dbClient
        .get(USERS_CONTENT)
        .map()
        .once((dataJSON, key) => {
          if (dataJSON && key) {
            const data = JSON.parse(dataJSON);
            results.push(data.pub);
            console.log(
              `useUserPubsExt: getAllUsersPubs: Found pub for user ${key}: ${data.addre}`,
            );
          } else {
            console.error('getAllUsersPubs: No data or key found');
          }
        });

      // Adjust the timeout as needed based on expected data volume and network latency
      setTimeout(() => {
        console.log(
          'useUserPubsExt: getAllUsersPubs: Finished fetching all users pubs',
        );
        resolve(results);
      }, process.env.NEXT_PUBLIC_GUN_WAIT_TIME); // Allow time for all async operations to complete
    });
  }

  async function getAllUsersProfiles() {
    const userProfiles = [];

    console.log('fetchUsers inside');

    //  if (!filter) {
    const results = await new Promise((res) =>
      dbClient.get(USERS_CONTENT).once((final_value) => res(final_value)),
    );

    console.log('fetchUsers: results!! = ', results);

    if (results) {
      const userPubs = [];

      for (let key in results) {
        if (key !== '_' && key !== '#') userPubs.push(results[key]);
      }

      console.log('fetchUsers: userPubs = ', userPubs);

      for (let key in userPubs) {
        const result = await new Promise((res) =>
          dbClient
            .user(userPubs[key])
            .get('profile')
            .once((final_value) => res(final_value)),
        );

        console.log('fetchUsers: result = ', result);

        if (!result) continue;
        let userProfile = JSON.parse(result);

        console.log('fetchUsers: userProfile = ', userProfile);
        userProfile = { ...userProfile, userPub: userPubs[key] };

        userProfiles.push(userProfile);
      }
    }
    //}

    console.log('fetchUsers: userProfiles = ', userProfiles);

    return userProfiles;
  }

  async function isUserExists(userPub) {
    const hash = await SEA.work(userPub, null, null, {
      name: 'SHA-256',
    });

    return new Promise((resolve, reject) => {
      dbClient
        .get(USERS_CONTENT)
        .get(hash)
        .once((data, key) => {
          if (data) {
            console.log('isUserExists: user exists');
            resolve(true);
          } else {
            console.log('isUserExists: user does not exist');
            resolve(false);
          }
        });
    });
  }

  return {
    fetchUserPubs,
    putUserPub,
    getAllUsersPubs,
    getAllUsersProfiles,
    isUserExists,
  };
}
