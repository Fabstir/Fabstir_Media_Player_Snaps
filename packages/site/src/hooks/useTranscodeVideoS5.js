import useS5net from './useS5';

/**
 * Custom hook that provides a function to transcode a video using the S5net transcoder service.
 *
 * @function
 * @returns {Object} - An object containing a function to transcode a video.
 */
export default function useTranscodeVideoS5() {
  /**
   * Asynchronously transcodes a video using the Fabstir transcoder service.
   * Initializes an array of video formats to transcode to and constructs the transcoder service URL with the necessary parameters.
   * Sends a POST request to the transcoder service to queue the transcoding job and logs the response data.
   * Throws an error if the response status code is not 200.
   *
   * @async
   * @function
   * @param {string} cid - The CID of the video to transcode.
   * @param {boolean} isEncrypted - Flag indicating whether the video is encrypted.
   * @param {boolean} isGPU - Flag indicating whether to use GPU for transcoding.
   * @returns {Promise<void>} - A promise that resolves when the transcoding job is queued successfully.
   */
  async function transcodeVideo(cid, isEncrypted, isGPU) {
    if (!cid) return cid;

    console.log('useTranscodeVideoS5: cid = ', cid);

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

    const url = `${
      process.env.NEXT_PUBLIC_TRANSCODER_CLIENT_URL
    }/transcode?source_cid=${cid}&video_formats=${JSON.stringify(
      videoFormats,
    )}&is_encrypted=${isEncrypted}&is_gpu=${isGPU}`;
    console.log('useTranscodeVideoS5: url = ', url);

    try {
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
