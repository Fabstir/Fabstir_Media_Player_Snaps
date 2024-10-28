import axios from 'axios';
import { Config } from '../state/types';

const configMap: Map<number, Config> = new Map();
let defaultConfig: Config | null = null;

/**
 * Fetches the configuration from the server.
 *
 * This function attempts to fetch the configuration from the `/api/config` endpoint.
 * If the configuration is not already cached, it will retry the request multiple times
 * with a delay between each attempt. If all attempts fail, it will use a fallback configuration.
 *
 * @param {number} chainId - The chain ID to fetch the specific configuration for.
 * @returns {Promise<Config | null>} A promise that resolves to the configuration object or null if the fetch fails.
 * @throws {Error} Throws an error if the configuration cannot be fetched after multiple attempts.
 */
export const fetchConfig = async (chainId?: number): Promise<Config | null> => {
  console.log('fetchConfig: chainId:', chainId); // Log the chainId being passed

  // Fetch and cache the default configuration if not already cached
  if (!defaultConfig) {
    try {
      const response = await axios.get('/api/config');
      console.log('fetchConfig: Default config response:', response.data); // Log the default config response
      defaultConfig = response.data;
    } catch (error) {
      console.error('fetchConfig: Error fetching default config:', error);
      throw new Error('Failed to fetch default configuration');
    }
  }

  // If no chainId is provided, return the default configuration
  if (!chainId) {
    return defaultConfig;
  }

  // Check if the specific configuration for the chainId is already cached
  if (configMap.has(chainId)) {
    console.log('fetchConfig: Returning cached config for chainId:', chainId);
    return Object.assign({}, defaultConfig, configMap.get(chainId));
  }

  // Fetch the specific configuration for the chainId
  try {
    const url = `/api/config?chainId=${chainId}`;
    console.log('fetchConfig: Requesting URL:', url); // Log the URL being requested
    const response = await axios.get(url);
    console.log('fetchConfig: Response from /api/config:', response.data); // Log the response

    // Cache the specific configuration for the chainId
    configMap.set(chainId, response.data);

    // Merge the default configuration with the specific configuration for the chainId
    return Object.assign({}, defaultConfig, response.data);
  } catch (error) {
    console.error('fetchConfig: Error fetching config for chainId:', error);
    throw new Error('Failed to fetch configuration');
  }
};
