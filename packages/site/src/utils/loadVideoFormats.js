export const fetchVideoFormats = async () => {
  try {
    const animationUrlFormatsPath = 'settings/animationUrlFormats.json';
    const animationResponse = await fetch(
      `/api/videoFormats?filePath=${animationUrlFormatsPath}`,
    );

    const animationUrlFormats = await animationResponse.json();
    for (const format of animationUrlFormats) {
      format.dest = process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK;
    }

    const videoFormatsPath = 'settings/videoFormats.json';
    const videoResponse = await fetch(
      `/api/videoFormats?filePath=${videoFormatsPath}`,
    );
    if (!animationResponse.ok || !videoResponse.ok) {
      throw new Error('Failed to fetch formats');
    }

    const videoFormats = await videoResponse.json();
    for (const format of videoFormats) {
      format.dest = process.env.NEXT_PUBLIC_S5;
    }

    return { animationUrlFormats, videoFormats };
  } catch (error) {
    console.error('Failed to load format data:', error);
  }
};
