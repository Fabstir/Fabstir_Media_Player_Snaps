import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

/**
 * Renders a VideoJS player component with configurable options.
 *
 * This component integrates VideoJS to provide a rich video or audio player experience. It supports
 * dynamic source switching between a trailer and the main content, based on user interaction. Additionally,
 * it allows for the inclusion of subtitle tracks for both the trailer and the main content.
 *
 * @param {Object} props - The properties passed to the VideoJS component.
 * @param {Object} props.options - The configuration options for the VideoJS player.
 * @param {Function} props.onReady - Callback function that is called when the player is ready.
 * @param {boolean} props.isAudio - Determines if the player should be in audio mode.
 * @param {string} props.trailerSource - The source URL of the trailer video or audio.
 * @param {string} props.mainSource - The source URL of the main video or audio content.
 * @param {boolean} props.isPlayClicked - State to track if play has been clicked, used to switch sources.
 * @param {Function} props.setIsPlayClicked - Function to update the isPlayClicked state.
 * @param {Array<Object>} props.trailerSubtitleTracks - Subtitle tracks for the trailer.
 * @param {Array<Object>} props.mainSubtitleTracks - Subtitle tracks for the main content.
 * @returns {JSX.Element} The VideoJS player component.
 */
const VideoJS = ({
  options,
  onReady,
  isAudio,
  trailerSource,
  mainSource,
  isPlayClicked,
  setIsPlayClicked,
  trailerSubtitleTracks,
  mainSubtitleTracks,
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const isMouseOverUnmute = useRef(false);

  /**
   * Chooses the video source based on the play button click status.
   *
   * This function determines which video source to use (main content or trailer) based on whether the
   * play button has been clicked. It is designed to switch the video source from the trailer to the main
   * content once the user initiates playback.
   *
   * @param {boolean} isPlayClicked - A boolean indicating if the play button has been clicked.
   * @param {string} mainSource - The URL of the main video content.
   * @param {string} trailerSource - The URL of the trailer video content.
   * @returns {string} The URL of the video source to be used.
   */
  const chooseSource = (isPlayClicked, mainSource, trailerSource) => {
    return mainSource && trailerSource
      ? isPlayClicked
        ? mainSource
        : trailerSource
      : mainSource
        ? mainSource
        : trailerSource;
  };

  const chooseSubtitleTracks = (isPlayClicked, mainTracks, trailerTracks) => {
    return isPlayClicked ? mainTracks : trailerTracks;
  };

  /**
   * Initializes and configures the VideoJS player.
   *
   * This function is responsible for setting up the VideoJS player within the component. It includes
   * configuration steps such as loading the video or audio source, applying subtitles if available,
   * and attaching event listeners for player events. This setup is crucial for ensuring that the player
   * behaves as expected in different scenarios, such as switching between the trailer and the main content.
   */
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

          const player = (playerRef.current = videojs(
            videoElement,
            {
              ...options,
              sources: chooseSource(isPlayClicked, mainSource, trailerSource),
              tracks: chooseSubtitleTracks(
                isPlayClicked,
                mainSubtitleTracks,
                trailerSubtitleTracks,
              ),
            },
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

              player.ready(() => {
                const subtitleButton = player.controlBar.addChild('button', {
                  clickHandler: function () {
                    const currentTracks = player.textTracks();
                    const menu = player.createMenu();

                    menu.addItem(
                      new videojs.MenuItem(player, {
                        label: 'Off',
                        selected: true,
                        clickHandler: () => {
                          currentTracks.forEach((track) => {
                            track.mode = 'disabled';
                          });
                          player.trigger('texttrackchange');
                        },
                      }),
                    );

                    for (let i = 0; i < currentTracks.length; i++) {
                      const track = currentTracks[i];
                      if (
                        track.kind === 'subtitles' ||
                        track.kind === 'captions'
                      ) {
                        menu.addItem(
                          new videojs.MenuItem(player, {
                            label: track.label,
                            selected: track.mode === 'showing',
                            clickHandler: () => {
                              currentTracks.forEach((t) => {
                                t.mode = t === track ? 'showing' : 'disabled';
                              });
                              player.trigger('texttrackchange');
                            },
                          }),
                        );
                      }
                    }

                    const menuButton = new videojs.MenuButton(player, {
                      menu: menu,
                    });
                    menuButton.el().appendChild(menu.el());
                    this.appendChild(menuButton.el());

                    // Prevent menu from closing immediately
                    menuButton.on('click', function (event) {
                      event.stopPropagation();
                    });
                  },
                  text: 'Subtitles',
                });
              });
            },
          ));

          console.log('VideoJS: player', player);
          player.addClass('vjs-matrix');
          if (isAudio) player.audioOnlyMode(isAudio);

          player.muted(!isAudio);
          setIsMuted(!isAudio);

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
      playerRef.current.on('ended', () => {
        setIsPlayClicked(false);
      });
    }

    return () => {
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
  }, []);

  useEffect(() => {
    if (!trailerSource) return;

    const videoElement = videoRef.current;
    let hoverTimeout;

    if (!isPlayClicked && videoElement) {
      const playTrailer = () => {
        console.log('VideoJS1: playTrailer called');
        hoverTimeout = setTimeout(() => {
          if (!isPlayClicked && playerRef.current) {
            console.log('VideoJS1: play1');
            playerRef.current.src(trailerSource);
            updateSubtitleTracks(trailerSubtitleTracks);
            playerRef.current.play();
          }
        }, 400);
      };

      const pauseTrailer = () => {
        if (!isPlayClicked) {
          console.log('VideoJS1: pauseTrailer called');
          clearTimeout(hoverTimeout);
          if (
            !isMouseOverUnmute.current &&
            !isPlayClicked &&
            playerRef.current
          ) {
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
  }, [isPlayClicked, trailerSource, trailerSubtitleTracks, options]);

  /**
   * Updates the subtitle tracks for the VideoJS player.
   *
   * This function is responsible for dynamically updating the subtitle tracks of the VideoJS player instance.
   * It can be used to add, remove, or modify the subtitle tracks based on user interaction or other criteria.
   * This is particularly useful for applications that need to support multiple languages or provide additional
   * accessibility features.
   *
   * @param {Array<Object>} tracks - An array of subtitle track objects to be updated in the player. Each object
   *                                 should contain properties required by VideoJS for subtitle tracks, such as
   *                                 src (source URL), kind, label, and srclang (language code).
   */
  const updateSubtitleTracks = (tracks) => {
    if (playerRef.current) {
      const currentTracks = playerRef.current.textTracks();

      // Remove existing tracks
      for (let i = currentTracks.length - 1; i >= 0; i--) {
        playerRef.current.removeRemoteTextTrack(currentTracks[i]);
      }

      // Add new tracks
      tracks?.forEach((track) => {
        playerRef.current.addRemoteTextTrack(track, false);
      });
    }
  };

  useEffect(() => {
    if (playerRef.current) {
      const newSource = chooseSource(isPlayClicked, mainSource, trailerSource);
      const newTracks = chooseSubtitleTracks(
        isPlayClicked,
        mainSubtitleTracks,
        trailerSubtitleTracks,
      );

      playerRef.current.src(newSource);
      updateSubtitleTracks(newTracks);

      if (isPlayClicked) {
        console.log('VideoJS1: play damn mainSource', mainSource);
        console.log('VideoJS1: play2');
        playerRef.current.play();
      }
    }
  }, [
    isPlayClicked,
    mainSource,
    trailerSource,
    mainSubtitleTracks,
    trailerSubtitleTracks,
  ]);

  useEffect(() => {
    if (!trailerSource) return;

    const videoPlayerEl = videoRef.current;
    if (videoPlayerEl && playerRef.current) {
      const handleMouseEnter = () => {
        if (!isPlayClicked) {
          playerRef.current.controlBar.hide();
        }
      };
      const handleMouseLeave = () => {
        if (!isPlayClicked) {
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
      playerRef.current.on('ended', () => {
        if (isPlayClicked) {
          setIsPlayClicked(false);
          playerRef.current.src(trailerSource);
          updateSubtitleTracks(trailerSubtitleTracks);
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.off('ended');
      }
    };
  }, [isPlayClicked, trailerSource, setIsPlayClicked, trailerSubtitleTracks]);

  useEffect(() => {
    const isInitiallyMuted = playerRef.current
      ? playerRef.current.muted()
      : !isAudio;
    setIsMuted(isInitiallyMuted);
  }, []);

  useEffect(() => {
    //if (!trailerSource) return;

    if (playerRef.current) {
      playerRef.current.muted(isPlayClicked ? false : isMuted);
    }
  }, [isPlayClicked, isMuted, trailerSource]);

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
          backgroundColor: 'rgba(75, 85, 99, 0.5)',
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
      playerRef.current.pause();
      playerRef.current.currentTime(0);
      setIsPlayClicked(false);
    }
  };

  useEffect(() => {
    setIsPlayClicked(false);

    return () => {
      stopVideo();
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
