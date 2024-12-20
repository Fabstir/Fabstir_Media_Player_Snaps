import { dbClient, getUser } from '../GlobalOrbit';
import { user } from '../user';
import { queryClient } from '../../pages/_app';
import useParticleAuth from '../blockchain/useParticleAuth';
import useUserPubsExt from './useUserPubsExt';
import { userpubstate } from '../atoms/userAtom';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { useSetRecoilState } from 'recoil';
import useBiconomyAuth from '../blockchain/useBiconomyAuth';

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
  const { logout: logoutBiconomy } = useBiconomyAuth();

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

  const createUser = (username, password, userProfile) => {
    // const user = getUser();
    if (!username || !username.trim())
      return Promise.reject(new Error('User name cannot be blank'));

    if (!password || !password.trim())
      return Promise.reject(new Error('Password cannot be blank'));

    console.log('inputPassword = ', password);

    return new Promise((resolve, reject) => {
      user.create(username, password, async ({ err }) => {
        if (err) reject(new Error(err));
        else {
          try {
            const isLoggedIn = await login(username, password);

            const pair = user._.sea;
            userProfile = { ...userProfile, epub: pair.epub };

            await putUserProfile(userProfile);

            const pub = user.is.pub;
            await putUserPub(pub);

            resolve(isLoggedIn);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  };

  const signOut = async () => {
    user.leave();

    if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Particle')
      await logout();
    else if (process.env.NEXT_PUBLIC_DEFAULT_AA_PAYMENT_NETWORK === 'Biconomy')
      await logoutBiconomy();

    // Clear the session storage
    sessionStorage.clear();

    queryClient.clear();

    console.log("useSignOut: You've logged out!");
  };

  return {
    createUser,
    putUserProfile,
    isUserExists,
    login,
    signOut,
  };
}
