import { dbClient } from '../GlobalOrbit';
import { user } from '../user';
import { queryClient } from '../../pages/_app';
import useParticleAuth from '../blockchain/useParticleAuth';

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
    }

    return loggedIn;
  };

  const createUser = (username, password) => {
    if (!username || !username.trim())
      return Promise.reject(new Error('User name cannot be blank'));

    if (!password || !password.trim())
      return Promise.reject(new Error('Password cannot be blank'));

    console.log('inputPassword = ', password);

    return new Promise((resolve, reject) => {
      user.create(username, password, ({ err }) => {
        if (err) reject(new Error(err));
        else {
          login(username, password)
            .then((isLoggedIn) => resolve(isLoggedIn))
            .catch(reject);
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
    isUserExists,
    login,
    signOut,
  };
}
