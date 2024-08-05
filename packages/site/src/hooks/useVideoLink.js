import {
  combineKeytoEncryptedCid,
  removeS5Prefix,
} from '../utils/s5EncryptCIDHelper';
import useNFTMedia from './useNFTMedia';
import useIPFS from './useIPFS';

/**
 * `useVideoLink` is a custom React hook designed to manage and provide video links for playback within a React application.
 * This hook encapsulates the logic for fetching, processing, and updating the state of video links based on specific inputs
 * or conditions. It simplifies the integration of video playback functionalities by abstracting the complex processes involved
 * and exposing a straightforward interface for use in components.
 *
 * @returns {Object} An object containing the video link state and any associated utility functions, facilitating easy access
 * and manipulation of video links for playback.
 */
export default function useVideoLink() {
  const portNumber = parseInt(window.location.port, 10);

  const { removeIPFSPrefix } = useIPFS();

  const {
    getMetadata,
    getTranscodedMetadata,
    putMetadata,
    deleteTranscodePending,
    getTranscodePending,
    hasVideoMedia,
  } = useNFTMedia();

  const getPlayerSources = (metadata) => {
    if (!Array.isArray(metadata)) {
      return;
    }

    const sources = [];
    metadata.forEach((videoFormat) => {
      // if subtitle or video audio track
      if (!videoFormat.kind) {
        let src;
        if (videoFormat.cid.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
          const cid = removeIPFSPrefix(videoFormat.cid);
          src = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`;
        } else {
          const cid = removeS5Prefix(videoFormat.cid);
          src = `${process.env.NEXT_PUBLIC_S5_PORTAL_STREAMING_URL}:${portNumber}/s5/blob/${cid}?mediaType=${videoFormat.type}`;
        }

        const source = {
          src,
          type: videoFormat.type,
          label: videoFormat.label,
          res: videoFormat.res,
        };
        sources.push(source);
      } else if (videoFormat.kind === 'audio') {
        let src;
        if (videoFormat.cid.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
          src = removeIPFSPrefix(videoFormat.cid);
          src = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${src}`;
        } else {
          src = removeS5Prefix(videoFormat.cid);
          src = `${process.env.NEXT_PUBLIC_S5_PORTAL_STREAMING_URL}:${portNumber}/s5/blob/${src}?mediaType=${videoFormat.type}`;
        }

        let source = {
          ...videoFormat,
          src,
        };
        delete source.cid;
        sources.push(source);
      } else if (videoFormat.kind === 'subtitles') {
        let src;
        if (videoFormat.cid.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
          src = removeIPFSPrefix(videoFormat.cid);
          src = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${src}`;
        } else {
          src = removeS5Prefix(videoFormat.cid);
          src = `${process.env.NEXT_PUBLIC_S5_PORTAL_STREAMING_URL}:${portNumber}/s5/blob/${src}?mediaType=text%2Fplain`;
        }

        let source = {
          ...videoFormat,
          src,
        };
        delete source.cid;
        sources.push(source);
      }
    });

    return sources;
  };

  const hasMetadataTracksTranscodePending = (metadata) => {
    if (!Array.isArray(metadata)) {
      return false;
    }

    const isHasMetadataTracksTranscodePending = metadata.some(
      (videoFormat) => videoFormat.isTranscodePending,
    );
    return isHasMetadataTracksTranscodePending;
  };

  async function updateMetadataTracksWithTranscoded(metadata) {
    const updatedMetadata = [];
    let isUpdated = false;
    for (const videoFormat of metadata) {
      if (videoFormat.isTranscodePending) {
        const transcodePending = await getTranscodePending(videoFormat.cid);
        if (transcodePending?.taskId) {
          const transcodedMetadata = await getTranscodedMetadata(
            transcodePending.taskId,
          );
          if (transcodedMetadata && transcodedMetadata.length > 0) {
            // Spread the transcodedMetadata array into the updatedMetadata array
            let updatedAudioTrack = { ...videoFormat };
            delete updatedAudioTrack.isTranscodePending;
            delete updatedAudioTrack.cid;

            let updatedAudioTracks = transcodedMetadata.map((track) => {
              return { ...updatedAudioTrack, ...track };
            });

            updatedMetadata.push(...updatedAudioTracks);
            deleteTranscodePending(videoFormat.cid);
            isUpdated = true;
            continue; // Skip the rest of the loop and proceed with the next videoFormat
          }
        }
      }
      // If transcodedMetadata is undefined, null, or an empty array, or if isTranscodePending is false
      updatedMetadata.push(videoFormat);
    }
    return { updatedMetadata, isUpdated };
  }

  /**
   * Processes a video link by updating its metadata and determining the video URL.
   * If the metadata does not contain media information, it attempts to fetch and update the metadata using the provided key and cidWithoutKey.
   * If the updated metadata still lacks media information, it checks for any pending transcode tasks.
   * If a transcode task is completed, it fetches the transcoded metadata, merges it with the existing metadata, updates the metadata in storage, and deletes the transcode pending entry.
   * Finally, if the metadata contains media information, it determines the video URL based on the metadata.
   *
   * @param {Object} metadata - The initial metadata for the video.
   * @param {string} key - The key associated with the video metadata.
   * @param {string} cid - The content identifier for the video.
   * @param {string} cidWithoutKey - The content identifier for the video without the key.
   * @returns {Promise<{metadata: Object, videoUrl: string | null}>} An object containing the updated metadata and the video URL, if available.
   */
  async function processVideoLink(metadata, key, cid, cidWithoutKey) {
    let videoUrl = null;

    // Replace any isTranscodePending with transcoded metadata
    let isUpdatedMetadataToWrite = false;
    if (hasMetadataTracksTranscodePending(metadata)) {
      const { updatedMetadata, isUpdated } =
        await updateMetadataTracksWithTranscoded(metadata);
      isUpdatedMetadataToWrite = isUpdated;

      if (isUpdated) metadata = updatedMetadata;
    }

    // If video media has no metadata, fetch metadata
    if (!hasVideoMedia(metadata)) {
      metadata = await getMetadata(key, cidWithoutKey);

      console.log('useVideoLink: metadata =', metadata);

      if (!hasVideoMedia(metadata)) {
        console.log(
          'useVideoLink: const transcodedMetadata = await getTranscodedMetadata(cid)',
        );
        console.log('useVideoLink: cid = ', cid);

        const transcodePending = await getTranscodePending(cidWithoutKey);
        console.log('useVideoLink: transcodePending =', transcodePending);

        if (transcodePending?.taskId) {
          const transcodedMetadata = await getTranscodedMetadata(
            transcodePending.taskId,
          );
          console.log('useVideoLink: transcodedMetadata =', transcodedMetadata);
          if (transcodedMetadata) {
            metadata = [...(transcodedMetadata || []), ...(metadata || [])];

            console.log('useVideoLink: ttranscodedMetadata key =', key);
            console.log(
              'useVideoLink: ttranscodedMetadata cidWithoutKey =',
              cidWithoutKey,
            );
            console.log(
              'useVideoLink: ttranscodedMetadata metadata =',
              metadata,
            );
            await putMetadata(key, cidWithoutKey, metadata);
            isUpdatedMetadataToWrite = false;
            deleteTranscodePending(cidWithoutKey);
          }
        }
      }

      // Update with urls to transcoded videos
      if (hasVideoMedia(metadata)) videoUrl = getPlayerSources(metadata);
    } else {
      // Update with urls to transcoded videos
      videoUrl = getPlayerSources(metadata);
    }

    if (isUpdatedMetadataToWrite)
      // Ensure that any audio tracks that have been transcoded are written to storage
      await putMetadata(key, cidWithoutKey, metadata);

    return videoUrl;
  }

  // For unencrypted video, cid and cidWithoutKey will be the same
  return async ({ key, cidWithoutKey, metadata }) => {
    if (metadata === null) return;

    console.log('useVideoLink: cidWithoutKey =', cidWithoutKey);
    const cid = key
      ? combineKeytoEncryptedCid(key, cidWithoutKey)
      : cidWithoutKey;

    const videoUrl = await processVideoLink(metadata, key, cid, cidWithoutKey);

    console.log('useVideoLink: videoUrl = ', videoUrl);
    return videoUrl;
  };
}
