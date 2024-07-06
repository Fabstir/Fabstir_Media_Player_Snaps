/**
 * Custom hook for transcoding audio files using S5net.
 * @returns {Object} - An object containing the transcodeAudio function.
 */
export default function useTranscodeAudioS5() {
  /**
   * Transcodes the audio file with the given CID.
   * @param {string} cid - The CID of the audio file.
   * @param {boolean} isEncrypted - Indicates whether the audio file is encrypted.
   * @returns {Promise<string>} - The CID of the transcoded audio file.
   */
  async function transcodeAudio(cid, isEncrypted) {
    if (!cid) return cid;

    console.log('useTranscodeAudioS5: cid = ', cid);

    const audioFormats = [
      {
        id: 16,
        label: '1600k',
        type: 'audio/flac',
        ext: 'flac',
        acodec: 'flac',
        ch: 2,
        ar: '48k',
      },
    ];

    const url = `${
      process.env.NEXT_PUBLIC_TRANSCODER_CLIENT_URL
    }/transcode?source_cid=${cid}&media_formats=${JSON.stringify(
      audioFormats,
    )}&is_encrypted=${isEncrypted}&is_gpu=false`;
    console.log('useTranscodeAudioS5: url = ', url);

    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      console.log('useTranscodeAudioS5: data =', data);

      if (data && data.status_code === 200) {
        console.log('useTranscodeAudioS5: transcoding queued successfully');
      } else {
        throw new Error(data.error_message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return { transcodeAudio };
}
