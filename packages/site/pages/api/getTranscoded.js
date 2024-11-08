// pages/api/getTranscoded.js

/**
 * API Route handler for retrieving transcoded video metadata.
 * This function receives a taskId as a query parameter, constructs a request to the transcoder service,
 * and returns the response to the client. It uses a JWT token for authentication with the transcoder service.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.query - The query parameters from the request.
 * @param {string} req.query.taskId - The task ID of the transcoding job.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
export default async function handler(req, res) {
  const { taskId } = req.query;
  const token = process.env.FABSTIR_TRANSCODER_JWT;

  if (!taskId) {
    console.error('Missing required parameter: taskId');
    return res
      .status(400)
      .json({ error: 'Missing required parameter: taskId' });
  }

  const config = {
    fabstirTranscoderUrl: process.env.FABSTIR_TRANSCODER_URL, // Ensure this is set in your environment variables
  };

  if (!config.fabstirTranscoderUrl) {
    console.error('FABSTIR_TRANSCODER_URL is not defined');
    return res.status(500).json({
      error: 'Internal Server Error: FABSTIR_TRANSCODER_URL is not defined',
    });
  }

  const url = `${config.fabstirTranscoderUrl}/get_transcoded/${taskId}`;

  console.log('getTranscoded URL:', url);

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
        rawText,
      });
    }

    if (response.ok) {
      res.status(200).json(data);
    } else {
      console.error('Error from transcode service:', data);
      res
        .status(response.status)
        .json({ error: data.error_message || rawText });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
