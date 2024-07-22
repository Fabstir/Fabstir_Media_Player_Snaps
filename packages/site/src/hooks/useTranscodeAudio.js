import { removeKeyFromEncryptedCid } from '../utils/s5EncryptCIDHelper';
import useNFTMedia from './useNFTMedia';

/**
 * `useTranscodeAudio` is a custom React hook that provides functionality to transcode audio files. It handles the process of
 * converting audio files into a desired format, managing the transcoding state, and any errors that might occur during the process.
 * This hook is useful for applications that need to ensure audio files are in a consistent format for playback or further processing.
 *
 * @returns {Object} An object containing properties and functions to manage the transcoding process. This includes the current state
 * of the transcoding operation, any error messages, and functions to initiate transcoding.
 */
export default function useTranscodeAudio() {
  const { setTranscodePending } = useNFTMedia();

  /**
   * Transcodes the audio file with the given CID.
   * @param {string} cid - The CID of the audio file.
   * @param {boolean} isEncrypted - Indicates whether the audio file is encrypted.
   * @returns {Promise<string>} - The CID of the transcoded audio file.
   */
  async function transcodeAudio(cid, isEncrypted, isGPU, audioFormats) {
    if (!cid) return cid;

    console.log('useTranscodeAudio: cid = ', cid);

    const url = `${
      process.env.NEXT_PUBLIC_TRANSCODER_CLIENT_URL
    }/transcode?source_cid=${cid}&media_formats=${JSON.stringify(
      audioFormats,
    )}&is_encrypted=${isEncrypted}&is_gpu=false`;
    console.log('useTranscodeAudio: url = ', url);

    try {
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      console.log('useTranscodeAudio: data =', data);

      if (data?.status_code === 200) {
        const cidWithoutKey = isEncrypted
          ? removeKeyFromEncryptedCid(cid)
          : cid;
        setTranscodePending(cidWithoutKey, data.task_id, isEncrypted);

        return data.task_id;
      } else {
        throw new Error(data.error_message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return { transcodeAudio };
}
