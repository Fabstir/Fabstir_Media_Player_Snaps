import { removeKeyFromEncryptedCid } from '../utils/s5EncryptCIDHelper';
import useNFTMedia from './useNFTMedia';

/**
 * `useTranscodeVideo` is a custom React hook designed to facilitate video transcoding operations within a React application.
 * It provides the necessary logic and state management to perform video transcoding, track the transcoding process status,
 * and handle any errors that may arise during the operation. This hook simplifies integrating video transcoding functionalities
 * by abstracting the complex processes involved and exposing a straightforward interface for use in components.
 *
 * @returns {Object} An object containing properties and functions related to the video transcoding process, including the current
 * state of transcoding operations, any error messages, and functions to initiate and manage transcoding tasks.
 */
export default function useTranscodeVideo() {
  const { setTranscodePending } = useNFTMedia();

  async function transcodeVideo(cid, isEncrypted, isGPU, videoFormats) {
    if (!cid) return cid;

    console.log('useTranscodeVideo: cid = ', cid);

    const url = `${
      process.env.NEXT_PUBLIC_TRANSCODER_CLIENT_URL
    }/transcode?source_cid=${cid}&media_formats=${JSON.stringify(
      videoFormats,
    )}&is_encrypted=${isEncrypted}&is_gpu=${isGPU}`;
    console.log('useTranscodeVideo: url = ', url);

    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      console.log('useTranscodeVideo: data =', data);

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

  return { transcodeVideo };
}
