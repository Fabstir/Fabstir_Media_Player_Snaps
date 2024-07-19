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
 * A custom React hook that returns the S5 network object.
 *
 * @returns {Object} - The S5 network object.
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

  async function deleteTranscodePending(cid) {
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
        return metadata;
      }
    } catch (error) {
      // Network errors or other unexpected issues. Propagate the error to the caller.
      console.error('getTranscodedMetadata: Unexpected error:', error);
      //      throw error
    }
  }

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
   * Gets the metadata for a file or directory in the S5 network.
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
