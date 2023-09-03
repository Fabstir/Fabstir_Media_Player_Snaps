import useS5net from './useS5';

const SIA_CID_PREFIX = 'sia:';

/**
 * Custom hook that provides access to the S5net portal functionality.
 * Uses the useS5net hook to get the S5net instance.
 * Provides functions for uploading files and directories, downloading files, and getting portal link and blob URLs.
 * Returns an object with the portal functions.
 */
export default function usePortal() {
  const s5 = useS5net();

  async function downloadFile(uri, customOptions) {
    if (!uri) return;

    return await s5.downloadFile(uri, customOptions);
  }

  async function getPortalLinkUrl(uri, customOptions) {
    if (!uri) return;

    return await s5.getPortalLinkUrl(uri, customOptions);
  }

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
