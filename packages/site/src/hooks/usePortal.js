import useIPFS from './useIPFS';
import useS5net from './useS5';

export default function usePortal(storageNetwork = process.env.NEXT_PUBLIC_S5) {
  const s5 = useS5net();
  const ipfs = useIPFS();

  // portalType is a hack for when a cid is transformed to an actual portal url
  // hence unable to distinguish
  async function downloadFile(uri, customOptions) {
    if (!uri) return;

    if (
      uri.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX) ||
      customOptions?.portalType === 'ipfs'
    ) {
      return await ipfs.downloadFile(uri, customOptions);
    } else return await s5.downloadFile(uri, customOptions);
  }

  async function downloadFileWithFields(uri) {
    if (!uri) return;

    if (uri.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
      throw new Error('downloadFileWithFields not implemented for IPFS');
    } else return await s5.downloadFileWithFields(uri);
  }

  async function getBlobUrl(uri) {
    if (!uri) return;

    if (uri.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
      return ipfs.getBlobUrl(uri);
    } else return await s5.getBlobUrl(uri);
  }

  async function getPortalLinkUrl(uri, customOptions) {
    if (!uri) return;

    if (
      uri.startsWith(
        process.env.NEXT_PUBLIC_IPFS_PREFIX ||
          customOptions?.portalType === 'ipfs',
      )
    )
      return await ipfs.getPortalLinkUrl(uri, customOptions);
    else return await s5.getPortalLinkUrl(uri, customOptions);
  }

  function getPortalType(uri) {
    if (uri.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
      return 'ipfs';
    } else return 's5';
  }

  if (process.env.NEXT_PUBLIC_PORTAL_TYPE === `ipfs`)
    return {
      uploadFile: ipfs.uploadFile,
      downloadFile,
      uploadDirectory: ipfs.uploadDirectory,
      getPortalLinkUrl,
      getPortalType,
      downloadFileWithFields,
      getBlobUrl,
    };

  return {
    uploadFile:
      storageNetwork === process.env.NEXT_PUBLIC_IPFS
        ? ipfs.uploadFile
        : s5.uploadFile,
    downloadFile,
    uploadDirectory:
      storageNetwork === process.env.NEXT_PUBLIC_IPFS
        ? ipfs.uploadDirectory
        : s5.uploadDirectory,
    getPortalLinkUrl,
    getPortalType,
    downloadFileWithFields,
    getBlobUrl,
  };
}
