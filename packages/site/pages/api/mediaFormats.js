// pages/api/mediaFormats.js
import fs from 'fs';
import path from 'path';

function removeCommentsFromJSON(jsonString) {
  console.log('Removing comments from JSON string');
  // Remove single-line comments
  jsonString = jsonString.replace(/^\s*\/\/.*$/gm, '');
  // Remove multi-line comments
  jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//gm, '');
  console.log('Comments removed');
  return jsonString.trim();
}

/**
 * Handles the request to fetch video format details from a JSON file.
 * It reads the file specified by the `filePath` query parameter from the `public` directory,
 * removes comments from the JSON content, validates the JSON, and returns the parsed video formats.
 * If any step fails (e.g., file not found, invalid JSON), it returns an appropriate error response.
 *
 * @async
 * @function handler
 * @param {Object} req - The request object, containing query parameters.
 * @param {Object} res - The response object, used to return data or errors back to the client.
 * @param {string} req.query.filePath - The relative path to the JSON file within the `public` directory.
 * @returns {Promise<void>} A promise that resolves with no value, indicating the response has been sent.
 */
export default async function handler(req, res) {
  console.log('Handler function called');

  // Get the filePath from query parameters
  const { filePath } = req.query;
  if (!filePath) {
    return res
      .status(400)
      .json({ error: 'filePath query parameter is required' });
  }

  // Validate and resolve the absolute path
  const basePath = path.join(process.cwd(), 'public');
  const resolvedPath = path.join(basePath, filePath);
  if (!resolvedPath.startsWith(basePath)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  console.log('Resolved File Path:', resolvedPath);

  try {
    const data = await fs.promises.readFile(resolvedPath, 'utf8');
    console.log('Original Data:', data); // Log the original data for debugging

    const strippedData = removeCommentsFromJSON(data);
    console.log('Stripped Data:', strippedData); // Check the output after stripping comments

    // Verify if strippedData is valid JSON before parsing
    try {
      const videoFormats = JSON.parse(strippedData);
      console.log('Parsed JSON:', videoFormats);
      res.status(200).json(videoFormats);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError.message);
      res.status(500).json({ error: 'Failed to parse JSON' });
    }
  } catch (error) {
    console.error('Error reading the JSON file:', error.message);
    res.status(500).json({ error: 'Failed to read video formats' });
  }
}
