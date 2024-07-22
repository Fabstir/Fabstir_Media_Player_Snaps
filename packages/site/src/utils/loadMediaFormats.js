/**
 * Asynchronously fetches and returns the available media formats from a predefined source or API. This function is designed
 * to be used in contexts where knowing the supported media formats is necessary, such as in media uploading or transcoding services.
 * It abstracts the details of the API or data source from which these formats are retrieved, providing a simple interface for
 * obtaining this information.
 *
 * @async
 * @returns {Promise<Array<string>>} A promise that resolves with an array of strings, each representing a supported media format.
 */
export const fetchMediaFormats = async () => {
  try {
    const animationUrlFormatsPath = 'settings/animationUrlFormats.json';
    const animationResponse = await fetch(
      `/api/mediaFormats?filePath=${animationUrlFormatsPath}`,
    );

    const animationUrlFormats = await animationResponse.json();
    for (const format of animationUrlFormats) {
      format.dest = process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK;
    }

    const videoFormatsPath = 'settings/videoFormats.json';
    const videoResponse = await fetch(
      `/api/mediaFormats?filePath=${videoFormatsPath}`,
    );
    if (!animationResponse.ok || !videoResponse.ok) {
      throw new Error('Failed to fetch formats');
    }

    const videoFormats = await videoResponse.json();
    for (const format of videoFormats) {
      format.dest = process.env.NEXT_PUBLIC_S5;
    }

    const audioFormatsPath = 'settings/audioFormats.json';
    const audioResponse = await fetch(
      `/api/mediaFormats?filePath=${audioFormatsPath}`,
    );
    if (!animationResponse.ok || !audioResponse.ok) {
      throw new Error('Failed to fetch formats');
    }

    const audioFormats = await audioResponse.json();
    for (const format of audioFormats) {
      format.dest = process.env.NEXT_PUBLIC_S5;
    }

    return { animationUrlFormats, videoFormats, audioFormats };
  } catch (error) {
    console.error('Failed to load format data:', error);
  }
};
