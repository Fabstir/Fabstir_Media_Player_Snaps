import {
  combineKeytoEncryptedCid,
  removeS5Prefix,
} from '../utils/s5EncryptCIDHelper';
import useNFTMedia from './useNFTMedia';
import useIPFS from './useIPFS';

/**
 * A custom React hook that returns the video link for a given video cid to S5.
 *
 * @param {String} videoId - The ID of the video.
 * @returns {String} - The video link.
 */
export default function useVideoLinkS5() {
  const portNumber = parseInt(window.location.port, 10);

  const { removeIPFSPrefix } = useIPFS();

  const {
    getMetadata,
    getTranscodedMetadata,
    putMetadata,
    deleteTranscodePending,
    getTranscodePending,
  } = useNFTMedia();

  const getPlayerSources = (metadata) => {
    if (!Array.isArray(metadata)) {
      return;
    }

    const sources = [];
    metadata.forEach((videoFormat) => {
      let src;
      if (videoFormat.cid.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
        const cid = removeIPFSPrefix(videoFormat.cid);
        src = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`;
      } else {
        const cid = removeS5Prefix(videoFormat.cid);
        src = `${process.env.NEXT_PUBLIC_S5_PORTAL_STREAMING_URL}:${portNumber}/s5/blob/${cid}?mediaType=video%2Fmp4`;
      }

      const source = {
        src,
        type: videoFormat.type,
        label: videoFormat.label,
        res: videoFormat.res,
      };
      sources.push(source);
    });

    return sources;
  };

  // For unencrypted video, cid and cidWithoutKey will be the same
  return async ({ key, cidWithoutKey, metadata }) => {
    if (metadata === null) return;

    console.log('useVideoLinkS5: cidWithoutKey =', cidWithoutKey);
    const cid = key
      ? combineKeytoEncryptedCid(key, cidWithoutKey)
      : cidWithoutKey;

    if (!metadata) metadata = await getMetadata(key, cidWithoutKey);

    console.log('useVideoLinkS5: metadata =', metadata);

    let videoUrl;

    if (metadata?.length === 0) {
      console.log(
        'useVideoLinkS5: const transcodedMetadata = await getTranscodedMetadata(cid)',
      );
      console.log('useVideoLinkS5: cid = ', cid);

      const transcodePending = await getTranscodePending(cidWithoutKey);
      console.log('useVideoLinkS5: transcodePending =', transcodePending);

      if (transcodePending?.taskId) {
        const transcodedMetadata = await getTranscodedMetadata(
          transcodePending.taskId,
        );
        console.log('useVideoLinkS5: transcodedMetadata =', transcodedMetadata);
        if (transcodedMetadata) {
          metadata = transcodedMetadata;

          console.log('useVideoLinkS5: ttranscodedMetadata key =', key);
          console.log(
            'useVideoLinkS5: ttranscodedMetadata cidWithoutKey =',
            cidWithoutKey,
          );
          console.log(
            'useVideoLinkS5: ttranscodedMetadata metadata =',
            metadata,
          );
          await putMetadata(key, cidWithoutKey, metadata);
          deleteTranscodePending(cidWithoutKey);
        }
      }
    }

    if (metadata) {
      videoUrl = getPlayerSources(metadata);
    }

    console.log('useVideoLinkS5: videoUrl = ', videoUrl);

    return videoUrl;
  };
}
