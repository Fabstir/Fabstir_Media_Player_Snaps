import { S5Client } from '../../../../node_modules/s5client-js/dist/mjs/index';

import {
  getKeyFromEncryptedCid,
  combineKeytoEncryptedCid,
  removeKeyFromEncryptedCid,
  removeS5Prefix,
  addS5Prefix,
} from '../utils/s5EncryptCIDHelper';
import mime from 'mime/lite';

/**
 * A custom React hook that returns the S5 network object.
 *
 * @returns {Object} - The S5 network object.
 */
export default function useS5net() {
  const headers = {
    'Content-Type': 'text/plain; charset=UTF-8',
  };
  const customClientOptions = {
    authToken: process.env.NEXT_PUBLIC_PORTAL_AUTH_TOKEN,
    headers,
    withCredentials: false,
  };

  const client = new S5Client(
    process.env.NEXT_PUBLIC_PORTAL_URL,
    customClientOptions,
  );

  async function uploadFile(file, customOptions = {}) {
    console.log(`useS5net: uploadFile await client.uploadFile`);
    try {
      let { cid, key, cidWithoutKey } = await client.uploadFile(
        file,
        customOptions,
      );

      cid = addS5Prefix(cid);
      cidWithoutKey = addS5Prefix(cidWithoutKey);

      console.log(`useS5net: uploadFile customOptions  = `, customOptions);
      console.log(`useS5net: uploadFile cid  = `, cid);

      if (customOptions.encrypt) {
        console.log(`useS5net: uploadFile key  = `, key);
        console.log(`useS5net: uploadFile cidWithoutKey  = `, cidWithoutKey);

        if (key !== getKeyFromEncryptedCid(cid)) {
          // Throw an error or handle it somehow
          throw new Error(
            `useS5net: key ${key} !== getKeyFromEncryptedCid(cid) ${getKeyFromEncryptedCid(
              cid,
            )}`,
          );
        }

        const cidWithoutKey1 = removeKeyFromEncryptedCid(cid);

        if (cid !== combineKeytoEncryptedCid(key, cidWithoutKey1)) {
          // Throw an error or handle it somehow
          throw new Error(
            `useS5net: cid ${cid} !== combineKeytoEncryptedCid(key, cidWithoutKey) ${combineKeytoEncryptedCid(
              key,
              cidWithoutKey,
              file.size,
            )}`,
          );
        }
      }

      const fileExtension = file.name?.split('.').pop(); // get file extension
      const cidWithExtension = cid + (fileExtension ? `.${fileExtension}` : '');

      return cidWithExtension;
    } catch (error) {
      console.error('useS5net: Failed to upload the file:', error);
    }
  }

  /**
   * Uploads a large file to the S5 network.
   *
   * @param {Object} file - The file object to be uploaded.
   * @param {Object} options - The options object for the upload.
   * @param {Function} onProgress - The callback function to be called on upload progress.
   * @returns {Promise} - A promise that resolves with the uploaded file's metadata.
   */
  async function uploadLargeFile(acceptedFile, customOptions = {}) {
    console.log(`useS5net: uploadLargeFile await client.uploadFile2`);
    const { cid, key, cidWithoutKey } = await client.uploadLargeFile(
      acceptedFile,
      customOptions,
    );

    if (key !== getKeyFromEncryptedCid(cid)) {
      throw new Error('Invalid key');
    }

    if (cidWithoutKey !== removeKeyFromEncryptedCid(cid)) {
      throw new Error('Invalid cid without key');
    }

    const fileExtension = acceptedFile.name?.split('.').pop(); // get file extension
    const cidWithExtension = cid + (fileExtension ? `.${fileExtension}` : '');

    return addS5Prefix(cidWithExtension);
  }

  async function uploadDirectory(fileObjects, folderName, customOptions) {
    const { cid } = await client.uploadDirectory(
      fileObjects,
      folderName,
      customOptions,
    );
    return addS5Prefix(cid);
  }

  /**
   * Downloads a file from the S5 network.
   *
   * @param {String} cid - The CID of the file to be downloaded.
   * @param {Object} customOptions - The custom options object for the download.
   * @param {String} customOptions.path - The path of the file to be downloaded.
   * @returns {Promise} - A promise that resolves with the downloaded file's content.
   */
  async function downloadFile(cid, customOptions) {
    try {
      cid = removeS5Prefix(cid);

      let cidReq;
      console.log('downloadFile: inside');

      if (customOptions?.path) {
        console.log('downloadFile: before await client.getMetadata(cid)');
        const metadata = await client.getMetadata(cid, customOptions.encrypt);
        console.log('downloadFile: metadata = ', metadata);

        cidReq = metadata?.paths[customOptions.path]?.cid;
      } else cidReq = cid;

      console.log('downloadFile: metadata = ', cidReq);
      const url = await client.getCidUrl(cidReq);
      console.log('downloadFile: url = ', url);

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error fetching the file: ${response.statusText}`);
      }

      const textContent = await response.text();
      return textContent;
    } catch (error) {
      console.error('Failed to download the file:', error);
    }
  }

  async function downloadFileAsArrayBuffer(cid) {
    try {
      cid = removeS5Prefix(cid);

      // console.log('downloadFileAsArrayBuffer:', cid)
      const url = await client.getCidUrl(cid);
      // console.log('downloadFileAsArrayBuffer:', url)

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error fetching the file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Failed to download the file:', error);
    }
  }

  async function downloadFileWithFields(cidOrig) {
    try {
      const cid = removeS5Prefix(cidOrig);

      const fileExtension = cid?.split('.').pop(); // get file extension

      // console.log('downloadFileWithFields: before cid = ', cid)
      const data = await downloadFileAsArrayBuffer(cid);
      const contentType = mime.getType(fileExtension);

      // console.log('downloadFileWithFields: data = ', data)
      // const { metadata } = await client.getMetadata(cid)
      // console.log('downloadFileWithFields: = ', JSON.stringify(metadata))

      const result = { data, contentType, metadata: '', cidOrig };

      return result;
    } catch (error) {
      console.log(error);
    }

    return {
      data: undefined,
      contentType: undefined,
      metadata: undefined,
      cid: undefined,
    };
  }

  /**
   * Downloads a large file from the S5 network.
   *
   * @param {String} cid - The CID of the file to be downloaded.
   * @param {Object} options - The options object for the download.
   * @param {Function} onProgress - The callback function to be called on download progress.
   * @returns {Promise} - A promise that resolves with the downloaded file's content.
   */
  async function downloadLargeFile(cid, byteRange = null) {
    try {
      cid = removeS5Prefix(cid);

      const url = await client.getCidUrl(cid);
      const headers = {};

      if (byteRange) {
        headers['Range'] = `bytes=${byteRange}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error fetching the image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Failed to download the image:', error);
    }
  }

  /**
   * Returns the URL for the S5 portal link with the given parameters.
   *
   * @param {String} cid - The CID of the file.
   * @param {String} filename - The name of the file.
   * @param {String} mimeType - The MIME type of the file.
   * @param {String} size - The size of the file.
   * @returns {String} - The URL for the S5 portal link.
   */
  async function getPortalLinkUrl(cid, customOptions) {
    if (!cid) return cid;

    cid = removeS5Prefix(cid);

    let url;
    if (customOptions?.path) {
      const metadata = await client.getMetadata(cid, customOptions.encrypt);
      console.log('getPortalLinkUrl: metadata = ', metadata);

      const cid2 = metadata?.paths[customOptions.path]?.cid;
      url = await client.getCidUrl(cid2);
    } else url = await client.getCidUrl(cid);

    return url;
  }

  /**
   * Downloads a file from the S5 network as an array buffer, and returns a blob URL for the file.
   *
   * @param {String} uri - The CID of the file to be downloaded.
   * @returns {String} - The blob URL for the downloaded file.
   */
  async function getBlobUrl(uri) {
    if (!uri) return;

    uri = removeS5Prefix(uri);

    const { data, contentType } = await downloadFileWithFields(uri);
    // console.log('getBlobUrl: contentType = ', contentType)

    if (!data) return;

    const objectUrl = URL.createObjectURL(
      new Blob([data], { type: contentType }),
    );

    return objectUrl;
  }

  return {
    uploadFile,
    downloadFile,
    uploadLargeFile,
    downloadLargeFile,
    uploadDirectory,
    getPortalLinkUrl,
    getBlobUrl,
  };
}
