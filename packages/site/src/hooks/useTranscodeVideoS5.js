import useS5net from './useS5';

export default function useTranscodeVideoS5() {
  const { setTranscodePending } = useS5net();

  /**
   * Transcodes a video using the S5net transcoder service.
   * Receives the NFT object, encryption key, and isGPU flag as parameters.
   * Initializes an array of video formats to transcode to.
   * Constructs the transcoder service URL with the NFT video CID, video formats, encryption key, and flags.
   * Sends a POST request to the transcoder service to queue the transcoding job.
   * Logs the response data and throws an error if the response status code is not 200.
   */
  async function transcodeVideo(nft, encryptionKey, isGPU) {
    if (!nft) return nft;

    console.log('useTranscodeVideoS5: nft = ', nft);

    const videoFormats = [
      // {
      //   id: 29,
      //   label: '720p',
      //   type: 'video/mp4',
      //   ext: 'mp4',
      //   vcodec: 'libx264',
      //   preset: 'medium',
      //   profile: 'main',
      //   ch: 2,
      //   vf: 'scale=1280x720',
      //   b_v: '1M',
      //   ar: '44k',
      //   gpu: true,
      // },
      {
        id: 32,
        label: '1080p',
        type: 'video/mp4',
        ext: 'mp4',
        vcodec: 'av1_nvenc',
        preset: 'medium',
        profile: 'main',
        ch: 2,
        vf: 'scale=1920x1080',
        b_v: '4.5M',
        ar: '44k',
        gpu: true,
      },
      {
        id: 34,
        label: '2160p',
        type: 'video/mp4',
        ext: 'mp4',
        vcodec: 'av1_nvenc',
        preset: 'slower',
        profile: 'high',
        ch: 2,
        vf: 'scale=3840x2160',
        b_v: '18M',
        ar: '48k',
        gpu: true,
      },
    ];

    let cid;
    if (encryptionKey?.length > 0) {
      cid = combineKeytoEncryptedCid(encryptionKey, nft.video);
    } else cid = nft.video;

    const isEncrypted = encryptionKey ? true : false;
    // Construct the transcoder service URL with the NFT video CID, video formats, and flags
    const url = `${
      process.env.NEXT_PUBLIC_TRANSCODER_CLIENT_URL
    }/transcode?source_cid=${cid}&video_formats=${JSON.stringify(
      videoFormats,
    )}&is_encrypted=${isEncrypted}&is_gpu=${isGPU}`;
    console.log('useTranscodeVideoS5: url = ', url);

    try {
      // Send a POST request to the transcoder service to queue the transcoding job
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      console.log('useTranscodeVideoS5: data =', data);

      if (data && data.status_code === 200) {
        console.log('useTranscodeVideoS5: transcoding queued successfully');
      } else {
        throw new Error(data.error_message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return { transcodeVideo };
}
