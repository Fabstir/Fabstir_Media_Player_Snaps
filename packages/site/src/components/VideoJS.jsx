import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import '../../../../node_modules/video.js/dist/video-js.css';
import { SpeakerXMarkIcon, SpeakerWaveIcon } from 'heroiconsv2/24/outline';

/**
 * VideoJS is a React component that integrates the Video.js library for video playback. It supports both video and audio media types,
 * allows for the dynamic switching of video sources based on user interaction, and provides a custom mute/unmute button with hover effects.
 * The component initializes a Video.js player instance, configures it based on the provided options, and manages its lifecycle within the React component's lifecycle.
 * It also handles the logic for playing a trailer source on hover when the main video is not playing and switches back to the main source when the video is clicked to play.
 * Additionally, it includes logic for muting and unmuting the player with a custom button and dynamically loads the videojs-resolution-switcher plugin for resolution switching.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.options - Configuration options for the Video.js player.
 * @param {Function} props.onReady - Callback function that is called when the Video.js player is ready.
 * @param {boolean} props.isAudio - Flag to indicate if the current media is audio. Adjusts UI accordingly.
 * @param {string} props.trailerSource - The source URL of the trailer video. Used for hover play functionality.
 * @param {string} props.mainSource - The source URL of the main video or audio.
 * @param {boolean} props.isPlayClicked - State to control play/pause based on user interaction outside the component.
 * @param {Function} props.setIsPlayClicked - Setter function for the `isPlayClicked` state.
 * @returns {React.ReactElement} The rendered component.
 */
const VideoJS = ({
  options,
  onReady,
  isAudio,
  trailerSource,
  mainSource,
  isPlayClicked,
  setIsPlayClicked,
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const isMouseOverUnmute = useRef(false);

  const chooseSource = (isPlayClicked, mainSource, trailerSource) => {
    return mainSource && trailerSource
      ? isPlayClicked
        ? mainSource
        : trailerSource
      : mainSource
        ? mainSource
        : trailerSource;
  };

  // Initialize or update the player
  const setupPlayer = () => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      console.log('VideoJS: initializePlayer called');
      window.videojs = videojs;

      import('videojs-resolution-switcher')
        .then((module) => {
          const videojsResolutionSwitcher = module.default;

          if (typeof videojsResolutionSwitcher === 'function') {
            videojs.registerPlugin(
              'videoJsResolutionSwitcher',
              videojsResolutionSwitcher,
            );
          } else {
            console.error(
              'VideoJS: videojs-resolution-switcher is not a function.',
            );
          }

          options.sources = mainSource;

          const player = (playerRef.current = videojs(
            videoElement,
            options,
            () => {
              videojs.log('player is ready');
              onReady && onReady(player);
              if (player.videoJsResolutionSwitcher) {
                player.videoJsResolutionSwitcher({
                  default: 'high',
                  dynamicLabel: true,
                });
              } else {
                console.error(
                  'VideoJS: Plugin has not been registered to the player',
                );
              }
            },
          ));

          console.log('VideoJS: player', player);
          player.addClass('vjs-matrix');
          if (isAudio) player.audioOnlyMode(isAudio);

          player.muted(true);
          setIsMuted(true);

          player.controlBar.hide();
        })
        .catch((error) => {
          console.error('Error loading videojs-resolution-switcher:', error);
        });
    }

    if (playerRef.current) {
      if (isPlayClicked) {
        console.log('VideoJS1: play3');
        playerRef.current.play();
      }
    }
  };

  useEffect(() => {
    if (playerRef.current) {
      // Attach play and pause event listeners to handle play state
      // playerRef.current.on('play', () => {
      //   if (!isPlayClicked) {
      //     // Prevents setting isPlayClicked to true if the play event was triggered by hover
      //     setIsPlayClicked(true)
      //   }
      // })

      playerRef.current.on('ended', () => {
        // Consider what should happen when the video ends. Should isPlayClicked be false?
        setIsPlayClicked(false);
      });
    }

    return () => {
      // Cleanup event listeners
      if (playerRef.current) {
        playerRef.current.off('play');
        playerRef.current.off('pause');
        playerRef.current.off('ended');
      }
    };
  }, [setIsPlayClicked, isPlayClicked, options]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setupPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (!trailerSource) return;

    // Hover logic to play/pause trailer
    const videoElement = videoRef.current;
    let hoverTimeout;

    if (!isPlayClicked && videoElement) {
      const playTrailer = () => {
        console.log('VideoJS1: playTrailer called');
        // Delay playing the trailer to minimize flickering
        hoverTimeout = setTimeout(() => {
          if (!isPlayClicked) {
            console.log('VideoJS1: play1');
            playerRef.current.src(trailerSource);
            playerRef.current.play();
          }
        }, 400);
      };

      const pauseTrailer = () => {
        if (!isPlayClicked) {
          console.log('VideoJS1: pauseTrailer called');
          clearTimeout(hoverTimeout); // Prevent delayed play action if mouse leaves early
          if (!isMouseOverUnmute.current && !isPlayClicked) {
            console.log(
              'VideoJS1: pauseTrailer: currentTime',
              playerRef.current.currentTime(),
            );
            playerRef.current.pause();
          }
        }
      };

      if (videoElement) {
        videoElement.addEventListener('mouseenter', playTrailer);
        videoElement.addEventListener('mouseleave', pauseTrailer);

        return () => {
          videoElement.removeEventListener('mouseenter', playTrailer);
          videoElement.removeEventListener('mouseleave', pauseTrailer);
        };
      }
    }
  }, [isPlayClicked, trailerSource, options]); // React to changes in isPlayClicked

  useEffect(() => {
    if (playerRef.current) {
      const newSource = chooseSource(isPlayClicked, mainSource, trailerSource);
      playerRef.current.src(newSource);
      if (isPlayClicked) {
        console.log('VideoJS1: play damn mainSource', mainSource);
        console.log('VideoJS1: play2');
        playerRef.current.play();
      }
    }
  }, [isPlayClicked, mainSource, trailerSource, options]);

  useEffect(() => {
    if (!trailerSource) return;

    const videoPlayerEl = videoRef.current;
    if (videoPlayerEl && playerRef.current) {
      const handleMouseEnter = () => {
        if (!isPlayClicked) {
          // Hide control bar if the main video is not playing
          playerRef.current.controlBar.hide();
        }
      };
      const handleMouseLeave = () => {
        if (!isPlayClicked) {
          // Optionally, hide control bar on mouse leave if needed
          playerRef.current.controlBar.hide();
        }
      };

      videoPlayerEl.addEventListener('mouseenter', handleMouseEnter);
      videoPlayerEl.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        videoPlayerEl.removeEventListener('mouseenter', handleMouseEnter);
        videoPlayerEl.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isPlayClicked, options]);

  useEffect(() => {
    if (!trailerSource) return;

    if (playerRef.current) {
      // Listen to the 'ended' event for mainSource
      playerRef.current.on('ended', () => {
        if (isPlayClicked) {
          // Check if the ended source was mainSource
          setIsPlayClicked(false); // Reset playClicked to switch to trailerSource
          // Switch to trailerSource and seek to the last known time
          playerRef.current.src(trailerSource);
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.off('ended');
      }
    };
  }, [isPlayClicked, trailerSource, setIsPlayClicked, options]);

  useEffect(() => {
    // Assuming playerRef.current is already initialized at this point
    const isInitiallyMuted = playerRef.current
      ? playerRef.current.muted()
      : true;
    setIsMuted(isInitiallyMuted); // Initialize mute state based on player's current state
  }, []);

  useEffect(() => {
    if (!trailerSource) return;

    if (playerRef.current) {
      // Unmute when switching to mainSource, respect mute state for trailerSource
      playerRef.current.muted(isPlayClicked ? false : isMuted);
    }
  }, [isPlayClicked, isMuted, options]);

  const UnmuteButton = () => (
    <div className="absolute bottom-7 right-6 z-20">
      <button
        id="unmute-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(75, 85, 99, 0.5)', // This is Tailwind's gray-700 at 50% opacity
          backdropFilter: 'blur(10px)',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          playerRef.current?.controls(true);
          isMouseOverUnmute.current = false;
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          playerRef.current?.controls(false);
          isMouseOverUnmute.current = true;
        }}
        onClick={() => {
          const player = playerRef.current;
          if (player) {
            const currentMuteState = player.muted();
            player.muted(!currentMuteState);
            setIsMuted(!currentMuteState);
          }
        }}
      >
        {isMuted ? (
          <SpeakerXMarkIcon className="h-6 w-6 text-fabstir-light-gray-300" />
        ) : (
          <SpeakerWaveIcon className="h-6 w-6 text-fabstir-light-gray-300" />
        )}
      </button>
    </div>
  );

  const stopVideo = () => {
    if (playerRef.current) {
      playerRef.current.pause(); // Pause the video
      playerRef.current.currentTime(0); // Reset the time to the beginning
      setIsPlayClicked(false);
    }
  };

  // When leaving this page, setIsPlayClicked to false
  useEffect(() => {
    setIsPlayClicked(false);

    return () => {
      stopVideo(); // Stop the video when the component is about to unmount or when dependencies change
    };
  }, [options]);

  return (
    <div data-vjs-player className="relative">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered h-full w-full"
        poster={options?.poster}
      ></video>
      {trailerSource && !isPlayClicked && <UnmuteButton />}
    </div>
  );
};

export default VideoJS;
