// pages/api/transcode.js

/**
 * API Route handler for initiating video transcoding.
 * This function receives query parameters, constructs a request to the transcoder service,
 * and returns the response to the client. It uses a JWT token for authentication with the transcoder service.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.query - The query parameters from the request.
 * @param {string} req.query.sourceCid - The source CID of the video to be transcoded.
 * @param {string} req.query.isEncrypted - Indicates if the video is encrypted.
 * @param {string} req.query.isGpu - Indicates if GPU should be used for transcoding.
 * @param {string} req.query.mediaFormats - The media formats for transcoding.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
export default async function handler(req, res) {
  const { sourceCid, isEncrypted, isGpu, mediaFormats } = req.query;
  const token = process.env.FABSTIR_TRANSCODER_JWT;

  console.log('Received query parameters:', {
    sourceCid,
    isEncrypted,
    isGpu,
    mediaFormats,
  });

  if (!sourceCid || !mediaFormats) {
    console.error('Missing required parameters');
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const config = {
    fabstirTranscoderUrl: process.env.FABSTIR_TRANSCODER_URL, // Ensure this is set in your environment variables
  };

  const url = `${config.fabstirTranscoderUrl}/transcode?source_cid=${sourceCid}&media_formats=${mediaFormats}&is_encrypted=${isEncrypted}&is_gpu=${isGpu}`;

  console.log('Transcode URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const rawText = await response.text();
    console.log('Raw response text:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return res.status(500).json({
        error: 'Failed to parse JSON response from transcoder service',
      });
    }

    if (response.ok) {
      res.status(200).json(data);
    } else {
      console.error('Error from transcode service:', data);
      res.status(response.status).json({ error: data.error_message });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
