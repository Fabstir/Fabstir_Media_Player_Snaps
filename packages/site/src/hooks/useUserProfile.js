import { dbClient } from '../GlobalOrbit';

export default function useUserProfile() {
  return [
    // return profile
    async (userPub) => {
      if (!userPub) return null;

      const profileJSON = await new Promise((res) =>
        dbClient
          .user(userPub)
          .get('profile')
          .once((final_value) => res(final_value)),
      );

      console.log('profileJSON = ', profileJSON);

      // Check if profileJSON is a string and not an empty string
      if (typeof profileJSON === 'string' && profileJSON.trim() !== '') {
        try {
          // Attempt to parse profileJSON
          return JSON.parse(profileJSON);
        } catch (error) {
          console.error('Error parsing profileJSON:', error);
          // Handle parsing error (e.g., return null or a default value)
          return null;
        }
      } else {
        // profileJSON is not a string or is an empty string, return null or handle accordingly
        return null;
      }
    },
    // return image
    async (userPub) => {
      const userProfile = await new Promise((res) =>
        dbClient
          .user(userPub)
          .get('profile')
          .once((final_value) => res(final_value)),
      );
      if (!userProfile) return null;

      return JSON.parse(userProfile).image;
    },
    // return security questions
    async (userPub) => {
      const securityQuestion1 = await new Promise((res) =>
        dbClient
          .user(userPub)
          .get('security question 1')
          .once((final_value) => res(final_value)),
      );

      const securityQuestion2 = await new Promise((res) =>
        dbClient
          .user(userPub)
          .get('security question 2')
          .once((final_value) => res(final_value)),
      );

      return [securityQuestion1, securityQuestion2];
    },
    // return user name
    async (userPub) => {
      const userProfile = await new Promise((res) =>
        dbClient
          .user(userPub)
          .get('profile')
          .once((final_value) => res(final_value)),
      );
      console.log('useUserProfile: userProfile = ', userProfile);

      if (!userProfile) return null;
      const userProfileJSON = JSON.parse(userProfile);

      return userProfileJSON?.userName;
      // const alias = await user.get('alias') // userAuthPub string
      // console.log(`useUserProfile userName = ${alias}`)
      // return alias
    },
    // return user marketAddress
    async (userPub) => {
      try {
        const marketAddress = await new Promise((res) =>
          dbClient
            .user(userPub)
            .get('NFT market address')
            .once((final_value) => res(final_value)),
        );

        console.log('useUserProfile: getMarketAddress: userPub = ', userPub);
        console.log(
          'useUserProfile: getMarketAddress: getMarketAddress = ',
          marketAddress,
        );
        return marketAddress;
      } catch (e) {
        console.log(
          'useUserProfile: getMarketAddress: marketAddress error = ',
          e,
        );
      }

      return null;
    },
    // set user marketAddress
    async (userPub, marketAddress) => {
      dbClient.user(userPub).get('NFT market address').put(marketAddress);

      console.log('useUserProfile: setMarketAddress = ', marketAddress);
    },
  ];
}
