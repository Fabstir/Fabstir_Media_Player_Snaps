import useS5net from './useS5';
import { saveState, loadState } from '../utils';

/**
 * A custom React hook that returns the video link for a given video cid to S5.
 *
 * @param {String} videoId - The ID of the video.
 * @returns {String} - The video link.
 */
export default function useVideoLinkS5() {
  const portNumber = parseInt(window.location.port, 10);

  const { getMetadata, getTranscodedMetadata, putMetadata } = useS5net();

  const getPlayerSources = (metadata) => {
    const sources = [];
    metadata.forEach((videoFormat) => {
      const source = {
        src: `${process.env.NEXT_PUBLIC_S5_PORTAL_STREAMING_URL}:${portNumber}/s5/blob/${videoFormat.cid}?mediaType=video%2Fmp4`,
        type: videoFormat.type,
        label: videoFormat.label,
      };
      sources.push(source);
    });

    return sources;
  };

  // For unencrypted video, cid and cidWithoutKey will be the same
  return async ({ nft }) => {
    let videoUrl;
    const state = await loadState();
    const address = nft.address;

    console.log('useVideoLinkS5: address = ', address);
    console.log('useVideoLinkS5: state = ', state);
    console.log(
      'useVideoLinkS5: state.addresses.state[address] = ',
      state.addresses.state[address],
    );

    let metadata;
    if (state.addresses.state[address].isTranscodePending) {
      console.log(
        'useVideoLinkS5: const transcodedMetadata = await getTranscodedMetadata(cid)',
      );

      const cid = nft.video;
      console.log('useVideoLinkS5: cid = ', cid);

      const transcodedMetadata = await getTranscodedMetadata(cid);
      console.log('useVideoLinkS5: transcodedMetadata =', transcodedMetadata);
      if (transcodedMetadata) {
        metadata = transcodedMetadata;
        state.addresses.state[address] = transcodedMetadata;

        const addresses = state.addresses.state;
        console.log('useVideoLinkS5: addresses = ', addresses);
        await saveState(addresses);
      }
    } else metadata = state.addresses.state[address];

    if (metadata) {
      videoUrl = getPlayerSources(metadata);
    }

    console.log('useVideoLinkS5: videoUrl = ', videoUrl);

    return videoUrl;
  };
}
