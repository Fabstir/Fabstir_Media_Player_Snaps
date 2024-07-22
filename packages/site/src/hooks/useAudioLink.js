import { saveState, loadState } from '../utils';
import {
  combineKeytoEncryptedCid,
  removeS5Prefix,
} from '../utils/s5EncryptCIDHelper';
import useIPFS from './useIPFS';
import useNFTMedia from './useNFTMedia';

/**
 * `useAudioLink` is a custom React hook designed to manage and provide an audio link for playback. This hook encapsulates
 * logic for fetching, processing, and updating the state of an audio link based on specific inputs or conditions.
 * It returns the current state of the audio link, along with any utility functions for manipulating or updating that state.
 *
 * @returns {Object} An object containing the audio link state and any associated utility functions.
 */
export default function useAudioLink() {
  const { removeIPFSPrefix } = useIPFS();

  const portNumber = parseInt(window.location.port, 10);

  const {
    getMetadata,
    getTranscodedMetadata,
    putMetadata,
    deleteTranscodePending,
    getTranscodePending,
    hasAudioMedia,
  } = useNFTMedia();

  const getPlayerSources = (metadata) => {
    const sources = [];
    metadata.forEach((audioFormat) => {
      let source;
      if (audioFormat.cid.startsWith(process.env.NEXT_PUBLIC_IPFS_PREFIX)) {
        const cid = removeIPFSPrefix(audioFormat.cid);
        source = {
          src: `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`,
          type: audioFormat.type,
          label: audioFormat.label,
        };
      } else {
        const cid = removeS5Prefix(audioFormat.cid);
        source = {
          src: `${process.env.NEXT_PUBLIC_S5_PORTAL_STREAMING_URL}:${portNumber}/s5/blob/${cid}`,
          type: audioFormat.type,
          label: audioFormat.label,
        };
      }
      sources.push(source);
    });

    return sources;
  };

  // For unencrypted audio, cid and cidWithoutKey will be the same
  async function processAudioLink(metadata, key, cid, cidWithoutKey) {
    let audioUrl = null;

    if (!hasAudioMedia(metadata)) {
      metadata = await getMetadata(key, cidWithoutKey);
      console.log('useAudioLink: metadata =', metadata);

      if (!hasAudioMedia(metadata)) {
        console.log(
          'useAudioLink: const transcodedMetadata = await getTranscodedMetadata(cid)',
        );
        console.log('useAudioLink: cid = ', cid);

        const transcodePending = await getTranscodePending(cidWithoutKey);
        console.log('useAudioLink: transcodePending =', transcodePending);

        if (transcodePending?.taskId) {
          const transcodedMetadata = await getTranscodedMetadata(
            transcodePending.taskId,
          );
          console.log('useAudioLink: transcodedMetadata =', transcodedMetadata);
          if (transcodedMetadata) {
            metadata = [...(transcodedMetadata || []), ...(metadata || [])];

            console.log('useAudioLink: ttranscodedMetadata key =', key);
            console.log(
              'useAudioLink: ttranscodedMetadata cidWithoutKey =',
              cidWithoutKey,
            );
            console.log(
              'useAudioLink: ttranscodedMetadata metadata =',
              metadata,
            );
            await putMetadata(key, cidWithoutKey, metadata);
            deleteTranscodePending(cidWithoutKey);
          }
        }
      }

      if (hasAudioMedia(metadata)) audioUrl = getPlayerSources(metadata);
    } else {
      audioUrl = getPlayerSources(metadata);
    }

    return audioUrl;
  }

  // For unencrypted audio, cid and cidWithoutKey will be the same
  return async ({ key, cidWithoutKey, metadata }) => {
    if (metadata === null) return;

    console.log('useAudioLink: cidWithoutKey =', cidWithoutKey);
    const cid = key
      ? combineKeytoEncryptedCid(key, cidWithoutKey)
      : cidWithoutKey;

    const audioUrl = await processAudioLink(metadata, key, cid, cidWithoutKey);

    console.log('useAudioLink: audioUrl = ', audioUrl);
    return audioUrl;
  };
}
