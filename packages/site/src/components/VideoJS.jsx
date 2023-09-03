import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import '../../../../node_modules/video.js/dist/video-js.css';

/**
 * Renders a video player using Video.js.
 * Receives the player options, onReady handler, and isAudio flag as props.
 * Initializes the player on mount, and disposes it on unmount.
 * Updates the player options when the options prop changes.
 */
export const VideoJS = ({ options, onReady, isAudio }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const updatePlayerOptions = () => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;

    // Update the sources
    if (options.sources) {
      player.src(options.sources);
    }

    console.log('VideoJS: player updated', player);
  };

  // Initialize the player
  const initializePlayer = () => {
    console.log('VideoJS: initializePlayer called');

    const videoElement = videoRef.current;
    console.log('VideoJS: videoElement', videoElement);

    if (!videoElement) return;

    disposePlayer();

    //videojs.Hls.xhr.beforeRequest = '';

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
          default: 'high', // Default resolution [{Number}, 'low', 'high'],
          dynamicLabel: true, // Display dynamic labels or gear symbol
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

  // Dispose the player
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
