// pages/api/download.js
import fetch from 'node-fetch'; // Ensure you're using node-fetch v2 for compatibility

/**
 * Handles the request to download a file from IPFS based on the provided CID.
 * It validates the CID parameter, fetches the file from the specified IPFS gateway,
 * and returns the file with the appropriate content type. If any step fails,
 * it returns an error response.
 *
 * @async
 * @function handler
 * @param {Object} req - The request object from Next.js API route, containing query parameters.
 * @param {Object} res - The response object used to return data or errors back to the client.
 * @param {string} req.query.cid - The Content Identifier (CID) of the file to be downloaded from IPFS.
 * @returns {Promise<void>} A promise that resolves with no value, indicating the response has been sent.
 */
export default async function handler(req, res) {
  const { cid } = req.query;
  if (!cid) {
    return res.status(400).json({ error: 'Missing CID parameter' });
  }

  const url = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`;

  try {
    const externalResponse = await fetch(url);
    if (!externalResponse.ok) {
      throw new Error(
        `Failed to download file from IPFS: ${externalResponse.statusText}`,
      );
    }

    const contentType = externalResponse.headers.get('Content-Type');
    const buffer = await externalResponse.arrayBuffer();

    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error downloading file:', error.message);
    res.status(500).json({ error: 'Failed to download file' });
  }
}
