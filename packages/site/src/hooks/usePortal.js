import useS5net from './useS5';

const SIA_CID_PREFIX = 'sia:';

/**
 * Custom hook that provides access to the S5net portal functionality.
 * Uses the useS5net hook to get the S5net instance.
 * Provides functions for uploading files and directories, downloading files, and getting portal link and blob URLs.
 * Returns an object with the portal functions.
 *
 * @function
 * @returns {Object} - An object containing functions to interact with the S5net portal.
 */
export default function usePortal() {
  const s5 = useS5net();

  /**
   * Asynchronously downloads a file from a given URI.
   *
   * @async
   * @function
   * @param {string} uri - The URI of the file to be downloaded.
   * @param {Object} customOptions - Custom options for the download request.
   * @returns {Promise<any>} - A promise that resolves to the downloaded file data.
   */
  async function downloadFile(uri, customOptions) {
    if (!uri) return;

    return await s5.downloadFile(uri, customOptions);
  }

  /**
   * Asynchronously retrieves a portal link URL for a given URI.
   *
   * @async
   * @function
   * @param {string} uri - The URI for which to get the portal link URL.
   * @param {Object} customOptions - Custom options for the request.
   * @returns {Promise<string>} - A promise that resolves to the portal link URL.
   */
  async function getPortalLinkUrl(uri, customOptions) {
    if (!uri) return;

    return await s5.getPortalLinkUrl(uri, customOptions);
  }

  /**
   * Asynchronously retrieves a blob URL for a given URI.
   *
   * @async
   * @function
   * @param {string} uri - The URI for which to get the blob URL.
   * @returns {Promise<string>} - A promise that resolves to the blob URL.
   */
  async function getBlobUrl(uri) {
    if (!uri) return;

    return await s5.getBlobUrl(uri);
  }

  // default
  return {
    uploadFile: s5.uploadFile,
    downloadFile,
    uploadDirectory: s5.uploadDirectory,
    getPortalLinkUrl,
    getBlobUrl,
  };
}
