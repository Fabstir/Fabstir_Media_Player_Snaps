import { dbClient, getUser } from '../GlobalOrbit';
import { user } from '../user';
import { queryClient } from '../../pages/_app';
import useParticleAuth from '../blockchain/useParticleAuth';
import useUserPubsExt from './useUserPubsExt';
import { userpubstate } from '../atoms/userAtom';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { useSetRecoilState } from 'recoil';

/**
 * Custom hook for managing user creation, login, and sign out.
 *
 * @returns {Object} An object containing methods for user creation, existence check, login, and sign out.
 * @property {Function} createUser - Function to create a new user.
 * @property {Function} isUserExists - Function to check if a user exists.
 * @property {Function} login - Function to log in a user.
 * @property {Function} signOut - Function to sign out a user.
 */
export default function useCreateUser() {
  const { logout } = useParticleAuth();
  const { putUserPub } = useUserPubsExt();
  const setUserAuthPub = useSetRecoilState(userauthpubstate);
  const setUserPub = useSetRecoilState(userpubstate);

  const isUserExists = async (alias) => {
    return new Promise((resolve) => {
      dbClient.get(`~@${alias}`).once((data) => {
        resolve(data !== undefined);
      });
    });
  };

  const login = async (username, password) => {
    if (!username || !username.trim())
      return Promise.reject(new Error('User name cannot be blank'));

    if (!password || !password.trim())
      return Promise.reject(new Error('Password cannot be blank'));

    let loggedIn = false;

    console.log('useLogin: username= ', username);

    const err = await new Promise((res) =>
      user.auth(username, password, (finalValue) => res(finalValue)),
    );

    console.log('useLogin: err= ', err);
    if (err.err) throw new Error(err.err);
    else {
      queryClient.removeQueries();
      loggedIn = true;
      setUserAuthPub(user.is.pub);
      setUserPub(user.is.pub);
    }

    return loggedIn;
  };

  const putUserProfile = async (userProfile) => {
    const user = getUser();
    //    await user.get('profile').put(JSON.stringify(userProfile));

    await new Promise((resolve, reject) => {
      user.get('profile').put(JSON.stringify(userProfile), function (ack) {
        if (ack.err) {
          console.log(`useCreateUser: putUserProfile: ack.err = ${ack.err}`);
          reject(ack.err);
        } else {
          // setUserName(userProfile.userName);
          console.log(
            `useCreateUser: userProfile.userName =`,
            userProfile.userName,
          );
          console.log(`useCreateUser: putUserProfile: success`);
          resolve();
        }
      });
    });
  };

  const putUserColor = async (colors) => {
    const user = getUser();

    await new Promise((resolve, reject) => {
      user.get('color').put(JSON.stringify(colors), function (ack) {
        if (ack.err) {
          console.log(`useCreateUser: color: ack.err = ${ack.err}`);
          reject(ack.err);
        } else {
          resolve();
        }
      });
    });
  };
  
  const createUser = (username, password, userProfile) => {
    const user = getUser();
  
    if (!username || !username.trim()) {
      return Promise.reject(new Error('User name cannot be blank'));
    }
  
    if (!password || !password.trim()) {
      return Promise.reject(new Error('Password cannot be blank'));
    }
  
    console.log('inputPassword = ', password);
  
    return new Promise((resolve, reject) => {
      user?.create(username, password, async ({ err }) => {
        if (err) {
          const errorMessage = typeof err === 'string' ? err : JSON.stringify(err);
          reject(new Error(`User creation error: ${errorMessage}`));
        } else {
          try {
            const response = await login(username, password);
  
            // Check response status
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error response: ${errorText}`);
              reject(new Error(`API error: ${response.status}`));
              return;
            }
  
            // Check if the response is JSON
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
              const isLoggedIn = await response.json();
  
              // Handle user profile updates
              const pair = user._.sea;
              userProfile = { ...userProfile, epub: pair.epub };
  
              await putUserProfile(userProfile);
              const pub = user.is.pub;
              await putUserPub(pub);
  
              resolve(isLoggedIn);
            } else {
              const text = await response.text();
              console.error(`Expected JSON but received: ${text}`);
              reject(new Error('Unexpected response format'));
            }
          } catch (error) {
            console.error(`Error during login or profile update: ${error.message}`);
            reject(error);
          }
        }
      });
    });
  };
  

  const signOut = async () => {
    user.leave();

    if (process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET !== 'true') await logout();

    // Clear the session storage
    sessionStorage.clear();

    queryClient.clear();

    console.log("useSignOut: You've logged out!");
  };

  return {
    createUser,
    putUserProfile,
    putUserColor,
    isUserExists,
    login,
    signOut,
  };
}
