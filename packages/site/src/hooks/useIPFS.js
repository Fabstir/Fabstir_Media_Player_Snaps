import axios from 'axios';

/**
 * Custom React hook to interact with IPFS via Pinata using JWT for authentication.
 */
export default function useIPFS() {
  const pinataBaseUrl = 'https://api.pinata.cloud';
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

  /**
   * Uploads a file to IPFS via Pinata.
   * @param {File} file The file to upload.
   * @returns {Promise<string>} The IPFS hash of the uploaded file.
   */
  async function uploadFile(file) {
    const url = `${pinataBaseUrl}/pinning/pinFileToIPFS`;

    // Prepare form data
    let data = new FormData();
    data.append('file', file);

    // Pinata request headers using Bearer token (JWT) for authentication
    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      'Content-Type': 'multipart/form-data',
    };

    try {
      const response = await axios.post(url, data, { headers });
      return addIPFSPrefix(response.data.IpfsHash); // Return the IPFS hash
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Uploads a directory to IPFS via Pinata.
   * @param {Array<File>} files The files in the directory to upload.
   * @param {String} directoryName The name of the directory.
   * @returns {Promise<string>} The IPFS hash of the uploaded directory.
   */
  async function uploadDirectory(files, directoryName) {
    const url = `${pinataBaseUrl}/pinning/pinFileToIPFS`;

    // Prepare form data
    let data = new FormData();
    files.forEach((file) => {
      data.append('file', file, `${directoryName}/${file.name}`);
    });

    // Pinata request headers
    const headers = {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
      'Content-Type': 'multipart/form-data',
    };

    try {
      const response = await axios.post(url, data, { headers });
      return addIPFSPrefix(response.data.IpfsHash); // Return the IPFS hash of the directory
    } catch (error) {
      console.error('Failed to upload directory to IPFS:', error);
      throw error;
    }
  }

  /**
   * Retrieves the URL for accessing a file or directory from IPFS.
   * @param {String} ipfsHash The IPFS hash of the file or directory.
   * @returns {String} The URL to access the file or directory.
   */
  function getPortalLinkUrl(ipfsHash) {
    ipfsHash = removeIPFSPrefix(ipfsHash);
    return `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${ipfsHash}`;
  }

  async function uploadLargeFile(file) {
    return uploadFile(file);
  }

  const downloadFile = async (cid) => {
    try {
      const ipfsHash = removeIPFSPrefix(cid);
      const response = await fetch(`/api/download?cid=${ipfsHash}`);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json(); // Assuming the metadata is in JSON format
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Error downloading file');
    }
  };

  const downloadFileWithFields = async (cid) => {
    try {
      if (!cid) return;

      const response = await fetch(`/api/download?cid=${cid}`);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const contentType =
        response.headers.get('Content-Type') || 'application/octet-stream'; // Fallback to a generic binary type
      return { arrayBuffer, contentType };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  };

  const downloadLargeFile = async (cid, byteRange = 0) => {
    await downloadFile(cid, byteRange);
  };

  // Function to get a Blob URL from a CID by downloading the file and converting it to a Blob URL
  const getBlobUrl = async (cid) => {
    try {
      if (!cid) return;

      cid = removeIPFSPrefix(cid);

      const { arrayBuffer, contentType } = await downloadFileWithFields(cid); // Destructure to get both arrayBuffer and contentType
      const blob = new Blob([arrayBuffer], { type: contentType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting blob URL:', error);
      throw error;
    }
  };

  // Function to remove 's5:// prefix' from a string. If the string is not prefixed with 's5://', the original string is returned.
  function removeIPFSPrefix(uri) {
    if (uri?.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
      return uri.slice(process.env.NEXT_PUBLIC_IPFS_PREFIX.length);
    } else {
      return uri;
    }
  }

  function addIPFSPrefix(uri) {
    if (uri && !uri.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
      return process.env.NEXT_PUBLIC_IPFS_PREFIX + uri;
    } else {
      return uri;
    }
  }

  // Return the functions for use in your components
  return {
    uploadFile,
    uploadDirectory,
    getPortalLinkUrl,
    uploadLargeFile,
    downloadFile,
    downloadLargeFile,
    downloadFileWithFields,
    getBlobUrl,
    removeIPFSPrefix,
    addIPFSPrefix,
  };
}
