import { removeKeyFromEncryptedCid } from '../utils/s5EncryptCIDHelper';
import useNFTMedia from './useNFTMedia';

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
      const response = await fetch(url, { method: 'POST' });
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
