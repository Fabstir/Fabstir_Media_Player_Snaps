import useS5net from './useS5';
import { saveState, loadState } from '../utils';
import { combineKeytoEncryptedCid } from '../utils/s5EncryptCIDHelper';

/**
 * A custom React hook that returns the audio link for a given audio cid to S5.
 *
 * @param {String} audioId - The ID of the audio.
 * @returns {String} - The audio link.
 */
export default function useAudioLinkS5() {
  const portNumber = parseInt(window.location.port, 10);

  const { getTranscodedMetadata } = useS5net();

  const getPlayerSources = (metadata) => {
    const sources = [];
    metadata.forEach((audioFormat) => {
      const source = {
        src: `${process.env.NEXT_PUBLIC_S5_PORTAL_STREAMING_URL}:${portNumber}/s5/blob/${audioFormat.cid}${process.env.NEXT_PUBLIC_DEFAULT_AUDIO_FILE_EXTENSION}`,
        type: audioFormat.type,
        label: audioFormat.label,
      };
      sources.push(source);
    });

    return sources;
  };

  // For unencrypted audio, cid and cidWithoutKey will be the same
  return async ({ nft }) => {
    let audioUrl;
    const state = await loadState();
    const address = `${nft.address}_${nft.id}`;

    if (!state.addresses.state[address]) return {};

    console.log('useAudioLinkS5: address = ', address);
    console.log('useAudioLinkS5: state = ', state);
    console.log(
      'useAudioLinkS5: state.addresses.state[address] = ',
      state.addresses.state[address],
    );

    let metadata;
    if (state.addresses.state[address].isTranscodePending) {
      console.log(
        'useAudioLinkS5: const transcodedMetadata = await getTranscodedMetadata(cid)',
      );

      let cid;

      if (state.addresses.state[address].encKey)
        cid = combineKeytoEncryptedCid(
          state.addresses.state[address].encKey,
          nft.audio,
        );
      else cid = nft.audio;

      console.log('useAudioLinkS5: cid = ', cid);

      const transcodedMetadata = await getTranscodedMetadata(cid);
      console.log('useAudioLinkS5: transcodedMetadata =', transcodedMetadata);
      if (transcodedMetadata) {
        metadata = transcodedMetadata;
        state.addresses.state[address] = transcodedMetadata;

        const addresses = state.addresses.state;
        console.log('useAudioLinkS5: addresses = ', addresses);
        await saveState(addresses);
      }
    } else {
      metadata = state.addresses.state[address];
    }

    if (metadata) {
      audioUrl = getPlayerSources(metadata);
    }

    console.log('useAudioLinkS5: audioUrl = ', audioUrl);

    return audioUrl;
  };
}
