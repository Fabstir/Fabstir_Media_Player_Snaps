import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import '../../../../node_modules/video.js/dist/video-js.css';

/**
 * VideoJS component is a wrapper around the video.js library that renders a video player on the page.
 * It accepts player options, an onReady callback, and a flag indicating if the source is audio as props.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Object} props.options - The options for the video player.
 * @param {Function} props.onReady - Callback function to be called when the player is ready.
 * @param {boolean} props.isAudio - Flag indicating if the source is audio.
 *
 * @returns {JSX.Element} The VideoJS component.
 */
export const VideoJS = ({ options, onReady, isAudio }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  /**
   * Updates the player options based on the options prop.
   */
  const updatePlayerOptions = () => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;

    // Update the sources
    if (options.sources) {
      player.src(options.sources);
    }

    console.log('VideoJS: player updated', player);
  };

  /**
   * Initializes the video player.
   */
  const initializePlayer = () => {
    console.log('VideoJS: initializePlayer called');

    const videoElement = videoRef.current;
    console.log('VideoJS: videoElement', videoElement);

    if (!videoElement) return;

    disposePlayer();

    console.log('VideoJS: Initializing new player');
    window.videojs = videojs;
    const videojsResolutionSwitcher = require('videojs-resolution-switcher');

    // Register the videojs-resolution-switcher plugin
    if (typeof videojsResolutionSwitcher === 'function') {
      videojs.registerPlugin(
        'videoJsResolutionSwitcher',
        videojsResolutionSwitcher,
      );
    } else {
      console.error('VideoJS: videojs-resolution-switcher is not a function.');
    }

    // Create a new player instance
    const player = (playerRef.current = videojs(videoElement, options, () => {
      videojs.log('player is ready');
      onReady && onReady(player);

      // Initialize the videojs-resolution-switcher plugin
      if (player.videoJsResolutionSwitcher) {
        player.videoJsResolutionSwitcher({
          default: 'high',
          dynamicLabel: true,
        });
      } else {
        console.error('VideoJS: Plugin has not been registered to the player');
      }
    }));

    console.log('VideoJS: player', player);
    console.log('VideoJS: options', options);

    // Add a custom class to the player
    player.addClass('vjs-matrix');
    player.bigPlayButton.hide();
    if (isAudio) player.audioOnlyMode(isAudio);
  };

  /**
   * Disposes the video player to free up resources.
   */
  const disposePlayer = () => {
    const player = playerRef.current;

    if (player && !player.isDisposed()) {
      player.dispose();
      playerRef.current = null;
    }
  };

  // Update the player options when the options prop changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializePlayer();
    }

    return () => {
      disposePlayer();
    };
  }, []); // Run only on mount and unmount

  // Update the player options when the options prop changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      updatePlayerOptions();
    }
  }, [options]); // Run when options change

  // Render the video player
  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        poster={options?.poster}
        crossOrigin="anonymous"
      ></video>
    </div>
  );
};

export default VideoJS;
