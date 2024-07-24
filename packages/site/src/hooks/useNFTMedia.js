import { dbClient } from '../GlobalOrbit';
import { user } from '../user';
import { SEA } from 'gun';
import {
  getKeyFromEncryptedCid,
  removeKeyFromEncryptedCid,
} from '../utils/s5EncryptCIDHelper';

import { encryptWithKey, decryptWithKey } from '../utils/cryptoUtils';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useEncKey from './useEncKey';
import useMintNFT from '../blockchain/useMintNFT';
import useCreateNFT from './useCreateNFT';
import { getNFTAddressId, constructNFTAddressId } from '../utils/nftUtils';
import useUploadEncKey from './useUploadEncKey';
import useContractUtils from '../blockchain/useContractUtils';
import { useContext } from 'react';
import BlockchainContext from '../../state/BlockchainContext';
import usePortal from './usePortal';
import { fetchNFTOnChain, fetchNFT1155OnChain } from '../hooks/useNFT';
import useFabstirController from './useFabstirController';

/**
 * Custom React hook for fetching and managing NFT media data.
 *
 * This hook is designed to abstract the complexities involved in fetching and managing media data
 * associated with Non-Fungible Tokens (NFTs). It provides a simplified interface for retrieving media
 * information, handling loading states, and managing errors that may occur during the data fetching process.
 * Ideal for use in components that display NFT media or require information about NFT assets.
 *
 * @returns {Object} An object containing NFT media data, loading state, and any errors encountered.
 */
export default function useNFTMedia() {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const userAuthPub = useRecoilValue(userauthpubstate);
  const getEncKey = useEncKey();

  const { getIsERC721Address, getIsERC1155 } = useMintNFT();
  const { mutate: createNFT, ...createNFTInfo } = useCreateNFT();
  const uploadEncKey = useUploadEncKey();
  const { getChainIdAddressFromChainIdAndAddress, newReadOnlyContract } =
    useContractUtils();

  const { downloadFile } = usePortal();
  const { retrieveKeyFromController } = useFabstirController();
  /**
   * Gets the metadata for a file or directory in the S5 network.
   *
   * @param {String} cid - The CID of the file or directory.
   * @returns {Promise} - A promise that resolves with the metadata object.
   */
  async function getMetadata(key, cidWithoutKey) {
    console.log('useNFTMedia: getMetadata: key = ', key);
    console.log('useNFTMedia: getMetadata: cidWithoutKey = ', cidWithoutKey);

    if (!cidWithoutKey) return cidWithoutKey;

    console.log('useNFTMedia: getMetadata: inside');
    console.log('useNFTMedia: getMetadata: cidWithoutKey = ', cidWithoutKey);

    const metaData = await new Promise((res) =>
      user
        .get('media')
        .get(cidWithoutKey)
        .once((final_value) => res(final_value)),
    );

    console.log('useNFTMedia: getMetadata: metaData = ', metaData);
    if (!metaData) return;

    if (key) {
      console.log('useNFTMedia: getMetadata: key = ', key);

      const metaDataDecrypted = decryptWithKey(metaData, key);
      console.log(
        'useS5net: getMetadata: metaDataDecrypted = ',
        metaDataDecrypted,
      );
      return metaDataDecrypted;
    }

    console.log('useNFTMedia: getMetadata: metaData = ', metaData);
    try {
      return JSON.parse(metaData);
    } catch (error) {
      console.error('Failed to parse metaData:', error);
      return {};
    }
  }

  /**
   * Checks if the provided metadata contains any media entries
   *
   * This function iterates through an array of metadata objects,
   * and determines if there is at least one entry without a 'kind' property defined. It is useful
   * for identifying metadata entries that are not additional VideoJS foreign audio or subtitle tracks
   * and assumes therefore that they are media format entries.
   *
   * @param {Array<Object>} metaData - An array of metadata objects to be checked.
   * @returns {boolean} Returns `true` if there is at least one metadata entry without a 'kind' property, otherwise `false`.
   */
  function hasMetadataMedia(metaData) {
    if (!metaData || metaData.length === 0) return false;

    for (const mediaFormat of metaData) {
      if (!mediaFormat.kind) return true;
    }

    return false;
  }

  function hasVideoMedia(metaData) {
    if (!metaData || metaData.length === 0) return false;

    for (const mediaFormat of metaData) {
      if (!mediaFormat.kind && mediaFormat.type.startsWith('video/'))
        return true;
    }

    return false;
  }

  function hasAudioMedia(metaData) {
    if (!metaData || metaData.length === 0) return false;

    for (const mediaFormat of metaData) {
      if (!mediaFormat.kind && mediaFormat.type.startsWith('audio/'))
        return true;
    }

    return false;
  }

  /**
   * Updates the metadata for a file or directory in the S5 network.
   *
   * @param {String} key - The key for encrypting the metadata.
   * @param {String} cidWithoutKey - The CID of the file or directory.
   * @param {Object} metaData - The new metadata object.
   * @returns {Promise} - A promise that resolves when the metadata has been updated.
   */
  async function putMetadata(key, cidWithoutKey, metaData) {
    console.log('useNFTMedia: putMetadata: key = ', key);
    console.log('useNFTMedia: putMetadata: cidWithoutKey = ', cidWithoutKey);
    console.log('useNFTMedia: putMetadata: metaData = ', metaData);

    if (!cidWithoutKey) return cidWithoutKey;

    let metaDataString;
    if (key) {
      console.log('useNFTMedia: putMetadata: metaData = ', metaData);

      metaDataString = encryptWithKey(metaData, key);
      console.log(
        'useNFTMedia: putMetadata: metaDataString = ',
        metaDataString,
      );

      const metaDataDecrypted = decryptWithKey(metaDataString, key);
      console.log(
        'useNFTMedia: putMetadata: metaDataDecrypted = ',
        metaDataDecrypted,
      );

      if (JSON.stringify(metaDataDecrypted) !== JSON.stringify(metaData)) {
        console.error(
          'useNFTMedia: putMetadata: metaDataDecrypted !== metaData',
        );
        throw new Error(
          'useNFTMedia: putMetadata: metaDataDecrypted !== metaData',
        );
      }
    } else {
      metaDataString = JSON.stringify(metaData);
    }

    console.log('useNFTMedia: putMetadata: cidWithoutKey = ', cidWithoutKey);
    console.log('useNFTMedia: putMetadata: metaDataString = ', metaDataString);

    return new Promise((resolve, reject) => {
      user
        .get('media')
        .get(cidWithoutKey)
        .put(metaDataString, (ack) => {
          if (ack.err) {
            console.error('useNFTMedia: putMetadata: Error = ', ack.err);
            reject(ack.err);
          } else {
            console.log('useNFTMedia: putMetadata: Success');
            resolve();
          }
        });
    });
  }

  async function getTranscodePending(cid) {
    if (!cid) return;

    cid = removeExtension(cid);
    console.log('useNFTMedia: getTranscodePending: cid = ', cid);

    const resultScrambled = await new Promise((res) =>
      user
        .get('transcodes_pending')
        .get(cid)
        .once((final_value) => res(final_value)),
    );

    if (!resultScrambled) return;

    console.log(
      'useS5net: getTranscodePending: resultScrambled = ',
      resultScrambled,
    );
    const result = await SEA.decrypt(resultScrambled, user._.sea);
    console.log(
      'useNFTMedia: getTranscodePendingCidScrambled: result = ',
      result,
    );
    return result;
  }

  async function putNFTsMedia(nftsMedia) {
    for (const nftMedia of nftsMedia) {
      if (nftMedia.cid) {
        const nftMediaData = [];
        for (const mediaFormat of nftMedia.data) {
          const { key, ...restDataFormat } = mediaFormat;
          nftMediaData.push(restDataFormat);
        }
        await putMetadata(nftMedia.key, nftMedia.cid, nftMediaData);
      }
    }
  }

  async function setTranscodePending(cid, taskId, isEncrypted = true) {
    if (!cid) return;

    cid = removeExtension(cid);
    console.log('useNFTMedia: setTranscodePending: cid = ', cid);

    const transcodePending = { taskId, isEncrypted };
    console.log(
      'useS5net: setTranscodePending: transcodePending = ',
      transcodePending,
    );
    const transcodePendingScrambled = await SEA.encrypt(
      transcodePending,
      user._.sea,
    );

    console.log(
      'useS5net: setTranscodePending: transcodePendingScrambled = ',
      transcodePendingScrambled,
    );

    user.get('transcodes_pending').get(cid).put(transcodePendingScrambled);
  }

  function deleteTranscodePending(cid) {
    if (!cid) return;

    cid = removeExtension(cid);

    user.get('transcodes_pending').get(cid).put(null);
  }

  async function getTranscodedMetadata(taskId) {
    if (!taskId) return;

    const transcodeUrl = `${process.env.NEXT_PUBLIC_TRANSCODER_CLIENT_URL}/get_transcoded/${taskId}`;
    console.log('getTranscodedMetadata: transcoded url = ', transcodeUrl);

    try {
      const response = await fetch(transcodeUrl, { method: 'POST' });
      console.log('getTranscodedMetadata: response = ', response);

      if (!response.ok) {
        console.log(
          'getTranscodedMetadata: response.status = ',
          response.status,
        );
        if (response.status === 404) {
          // The job might not be completed yet.
          return;
        } else {
          // There's an issue with the request itself, so throw an error to propagate the error to the caller.
          console.error(
            `getTranscodedMetadata: HTTP error: ${response.status}`,
          );
          throw new Error(
            `getTranscodedMetadata: HTTP error: ${response.status}`,
          );
        }
      } else {
        const data = await response.json();
        console.log('getTranscodedMetadata: data =', data);

        if (data.progress < 100) return;

        console.log(
          'getTranscodedMetadata: typeof data.metadata =',
          typeof data.metadata,
        );

        const metadata = data.metadata ? JSON.parse(data.metadata) : null;
        console.log('getTranscodedMetadata: metadata =', metadata);

        return Object.values(metadata);
      }
    } catch (error) {
      // Network errors or other unexpected issues. Propagate the error to the caller.
      console.error('getTranscodedMetadata: Unexpected error:', error);
      //      throw error
    }
  }

  /**
   * Asynchronously retrieves the transcoding progress of a given task.
   *
   * This function is designed to query the status of a video transcoding task by its unique identifier (taskId).
   * It can be used in applications that require monitoring the progress of video processing operations, such as
   * converting video formats or resolutions. This is particularly useful in platforms that manage or distribute
   * digital media content, allowing for real-time updates on transcoding tasks.
   *
   * @param {string} taskId - The unique identifier of the transcoding task.
   * @returns {Promise<number>} A promise that resolves to the current progress of the transcoding task, represented as a percentage.
   */
  async function getTranscodeProgress(taskId) {
    if (!taskId) return;

    const transcodeUrl = `${process.env.NEXT_PUBLIC_TRANSCODER_CLIENT_URL}/get_transcoded/${taskId}`;
    console.log('getTranscodeProgress: transcoded url = ', transcodeUrl);

    try {
      const response = await fetch(transcodeUrl, { method: 'GET' });

      if (!response.ok) {
        console.log(
          'getTranscodeProgress: response.status = ',
          response.status,
        );
        if (response.status === 404) {
          // The job might not be completed yet.
          return;
        } else {
          // There's an issue with the request itself, so throw an error to propagate the error to the caller.
          console.error(`getTranscodeProgress: HTTP error: ${response.status}`);
          throw new Error(
            `getTranscodeProgress: HTTP error: ${response.status}`,
          );
        }
      } else {
        const data = await response.json();
        console.log('getTranscodeProgress: data =', data);

        return data.progress;
      }
    } catch (error) {
      // Network errors or other unexpected issues. Propagate the error to the caller.
      console.error('getTranscodeProgress: Unexpected error:', error);
      //      throw error
    }
  }

  /**
   * Updates the `transcodesCompleted` state with the given value.
   *
   * @param {Array} value - The new value for the `transcodesCompleted` state.
   */
  async function updateTranscodesCompleted() {
    // go through all pending, any that return a result then update 'media' node and remove from pending
    console.log('TranscodesCompleted: start');

    try {
      const results = await new Promise((res) =>
        user.get('transcodes_pending').load((final_value) => res(final_value), {
          wait: process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
        }),
      );
      console.log('TranscodesCompleted checked');
      console.log('TranscodesCompleted: results = ', results);

      if (results)
        for (var cid in results) {
          try {
            const transcodePending = await getTranscodePending(cid);
            if (!transcodePending) continue;

            console.log('TranscodesCompleted: cid = ', cid);
            console.log(
              'TranscodesCompleted: transcodePending = ',
              transcodePending,
            );

            if (!transcodePending && transcodePending?.taskId) {
              console.log('TranscodesCompleted: inside transcodePending');

              const metadata = await getTranscodedMetadata(
                transcodePending.taskId,
              );
              if (metadata) {
                console.log('TranscodesCompleted: metadata = ', metadata);

                if (transcodePending.isEncrypted) {
                  const cidWithoutKey = removeKeyFromEncryptedCid(cid);
                  const key = getKeyFromEncryptedCid(cid);
                  console.log(
                    'TranscodesCompleted: cidWithoutKey = ',
                    cidWithoutKey,
                  );

                  await putMetadata(key, cidWithoutKey, metadata);
                } else await putMetadata(null, cid, metadata); // unencrypted

                deleteTranscodePending(cid);
              }
            }
          } catch (error) {
            // Network errors or other unexpected issues. Stop retrying and propagate the error to the caller.
            console.error('TranscodesCompleted: Unexpected error:', error);
          }
        }
    } catch (e) {
      console.error('TranscodesCompleted: e: ', e);
    }
  }

  function removeExtension(cid) {
    return cid.split('.').shift();
  }

  /**
   * Gets the metadata for a media file or directory from a particular user.
   * With a valid key, the metadata is decrypted and returned.
   *
   * @param {String} cid - The CID of the file or directory.
   * @returns {Promise} - A promise that resolves with the metadata object.
   */
  async function getMetadataFromUser(userPub, key, cidWithoutKey) {
    if (!cidWithoutKey) return cidWithoutKey;

    console.log('useNFTMedia: getMetadataFromUser: userPub = ', userPub);
    console.log('useNFTMedia: getMetadataFromUser: key = ', key);
    console.log(
      'useNFTMedia: getMetadataFromUser: cidWithoutKey = ',
      cidWithoutKey,
    );

    console.log('useNFTMedia: getMetadataFromUser: inside');
    console.log(
      'useNFTMedia: getMetadataFromUser: cidWithoutKey = ',
      cidWithoutKey,
    );

    const metaData = await new Promise((res) =>
      dbClient
        .user(userPub)
        .get('media')
        .get(cidWithoutKey)
        .once((final_value) => res(final_value)),
    );

    console.log('useNFTMedia: getMetadataFromUser: metaData = ', metaData);
    if (!metaData) return;

    if (key) {
      console.log('useNFTMedia: getMetadataFromUser: key = ', key);

      const metaDataDecrypted = decryptWithKey(metaData, key);
      console.log(
        'useS5net: getMetadata: metaDataDecrypted = ',
        metaDataDecrypted,
      );
      return metaDataDecrypted;
    }

    console.log('useNFTMedia: getMetadata: metaData = ', metaData);
    try {
      return JSON.parse(metaData);
    } catch (error) {
      console.error('Failed to parse metaData:', error);
      return {};
    }
  }

  const getNFTsMedia = async (nfts) => {
    const nftsMedia = [];

    for (const nft of nfts) {
      if (nft.video || nft.audio) {
        const key = await getEncKey(userAuthPub, nft);

        const nftMedia = await getMetadata(
          key,
          nft.video ? nft.video : nft.audio,
        );

        if (nftMedia)
          nftsMedia.push({
            cid: nft.video ? nft.video : nft.audio,
            data: nftMedia,
          });
      }
    }

    return nftsMedia;
  };

  /**
   * Asynchronously unlocks a video from its controller.
   *
   * This function is designed to interact with a smart contract or a controller to unlock access to a
   * video. It is typically used in scenarios where video content is locked behind a paywall or requires
   * specific permissions to access. The unlocking process may involve transactions on the blockchain,
   * verifying ownership of tokens, or other forms of digital rights management.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves once the video has been successfully unlocked.
   */
  const unlockVideoFromController = async (
    userPub,
    address,
    id,
    additionalMetaData = {},
  ) => {
    const isERC721 = await getIsERC721Address(address);
    if (!isERC721) {
      const isERC1155 = await getIsERC1155({ address });
      if (!isERC1155)
        throw new Error('index: handleAddAddress: address is not ERC721');
    }

    const addressId = constructNFTAddressId(address, id);

    let nft = isERC721
      ? await fetchNFTOnChain(addressId, newReadOnlyContract, downloadFile)
      : await fetchNFT1155OnChain(addressId, newReadOnlyContract, downloadFile);
    nft = { ...nft, id, ...additionalMetaData };
    console.log('index: nft = ', nft);

    createNFT(nft);

    let encKey = null;

    try {
      let parentAddressId = '';
      if (additionalMetaData.parentAddress && additionalMetaData.parentId) {
        parentAddressId = constructNFTAddressId(
          additionalMetaData.parentAddress,
          additionalMetaData.parentId,
        );
      }

      encKey = await retrieveKeyFromController(
        userPub,
        nft.creator,
        addressId,
        parentAddressId,
      );
    } catch (error) {}
    if (encKey) {
      await uploadEncKey({
        nftAddressId: addressId,
        encKey: encKey,
      });
    }
    if (nft?.animation_url) {
      const animationUrlMediaData = await getMetadataFromUser(
        nft.creator,
        null,
        nft.animation_url,
      );
      await putMetadata(null, nft.animation_url, animationUrlMediaData);
    }

    if (nft?.video) {
      const videoMediaData = await getMetadataFromUser(
        nft.creator,
        encKey,
        nft.video,
      );
      await putMetadata(encKey, nft.video, videoMediaData);
    }
  };

  /**
   * Asynchronously unlocks nestable keys from a controller.
   *
   * This function is designed to interact with a controller (e.g., a smart contract) to unlock access to
   * nestable keys. These keys may be used to access or modify nested structures within a digital asset,
   * such as a nestable NFT. The unlocking process may involve blockchain transactions, verifying ownership
   * of certain tokens, or other forms of digital rights management.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves once the nestable keys have been successfully unlocked.
   */
  const unlockNestableKeysFromController = async (
    userPub,
    nft,
    getIsNestableNFT,
    getChildrenOfNestableNFT,
  ) => {
    if (await getIsNestableNFT(nft.address)) {
      {
        createNFT(nft);

        getChildrenOfNestableNFT(nft.id).then(async (children) => {
          for (const child of children) {
            const nftAddress = getChainIdAddressFromChainIdAndAddress(
              connectedChainId,
              child.contractAddress,
            );
            await unlockVideoFromController(
              userPub,
              nftAddress,
              child.tokenId.toString(),
              { parentId: nft.id, parentAddress: nft.address },
            );
          }
        });
      }
    } else {
      await unlockVideoFromController(userPub, nft.address, nft.id);
    }
  };

  return {
    getMetadata,
    putMetadata,
    hasMetadataMedia,
    hasVideoMedia,
    hasAudioMedia,
    getNFTsMedia,
    putNFTsMedia,
    getTranscodePending,
    setTranscodePending,
    getTranscodedMetadata,
    deleteTranscodePending,
    getTranscodeProgress,
    updateTranscodesCompleted,
    removeExtension,
    getMetadataFromUser,
    unlockVideoFromController,
    unlockNestableKeysFromController,
  };
}
