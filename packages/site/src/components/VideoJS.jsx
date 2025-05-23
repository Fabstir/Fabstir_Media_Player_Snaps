import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { trailermutestate } from '../atoms/nftPlayerAtom';
import { useRecoilState } from 'recoil';
import { Button } from '../ui-components/button';
import { isplayclickedstate } from '../atoms/playlistAtom';

/**
 * `VideoJS` is a React component that renders a VideoJS player with configurable options. This component integrates VideoJS
 * to provide a rich video or audio player experience. It supports dynamic source switching between a trailer and the main content
 * based on user interaction. Additionally, it allows for the inclusion of subtitle and audio tracks for both the trailer and the main content.
 *
 * @component
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
 * @param {Array<Object>} props.trailerAudioTracks - Audio tracks for the trailer.
 * @param {Array<Object>} props.mainAudioTracks - Audio tracks for the main content.
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
  trailerAudioTracks,
  mainAudioTracks,
  trailerSubtitleTracks,
  mainSubtitleTracks,
  handlePlayerPlay,
  handlePlayerPause,
  handlePlayerEnd,
  handlePlayerDispose,
  isPlaylist,
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isMuted, setIsMuted] = useRecoilState(trailermutestate);
  const [isMainMuted, setIsMainMuted] = useState(false);
  const isMouseOverUnmute = useRef(false);
  const [currentResolution, setCurrentResolution] = useState('');
  const [isChangingResolution, setIsChangingResolution] = useState(false);

  const audioTrailerSrc = useRef(null);
  const [audioMainSrc, setAudioMainSrc] = useState(null);
  const audioRef = useRef(null);

  console.log('test: VideoJS: isPlayClicked', isPlayClicked);

  const playDelay1 = 200;
  const playDelay2 = 1000;

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
    const source =
      mainSource && trailerSource
        ? isPlayClicked
          ? mainSource
          : trailerSource
        : mainSource
          ? mainSource
          : trailerSource;
    console.log('VideoJS: chooseSource: VideoJS: source', source);

    // const source2 = [
    //   {
    //     label: source[0].label,
    //     src: '/uJh_BcVuH9TVWmG3Nz5Bbfxp3bFRsyVyrlqusm4wV4kAX1hEbWQ',
    //     type: source[0].type,
    //   },
    // ]
    // console.log('VideoJS: chooseSource: VideoJS: source2', source2)

    return source;
  };

  const chooseSubtitleTracks = (isPlayClicked, mainTracks, trailerTracks) => {
    return isPlayClicked ? mainTracks : trailerTracks;
  };

  const chooseAudioTracks = (isPlayClicked, mainTracks, trailerTracks) => {
    const tracks = isPlayClicked ? mainTracks : trailerTracks;

    if (!tracks || tracks.length === 0) return [];

    let idx = 0;
    if (currentResolution && mainSource) {
      idx = mainSource.findIndex(
        (source) => source.label === currentResolution,
      );
      if (idx === -1) idx = 0;
    }

    const numberOfTracksPerAudio = tracks.filter(
      (track) => track.language === tracks[0].language,
    ).length;
    const audioTracks = tracks.filter(
      (track, index) => index % numberOfTracksPerAudio === idx,
    );

    return audioTracks;
  };

  const addAudioTrackButton = (player) => {
    const MenuButton = videojs.getComponent('MenuButton');
    const MenuItem = videojs.getComponent('MenuItem');

    class AudioTrackMenuItem extends MenuItem {
      constructor(player, options) {
        super(player, {
          ...options,
          selectable: true,
          selected: options.track.enabled,
        });
        this.track = options.track;
      }

      handleClick(event) {
        super.handleClick(event);
        const tracks = this.player_.audioTracks();
        console.log(
          'VideoJS: All audio tracks:',
          JSON.stringify(tracks, null, 2),
        );
        console.log(
          'VideoJS: Selected track:',
          JSON.stringify(this.track, null, 2),
        );

        const wasPlaying = !player.paused(); // Check if the player was playing

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          if (track.label === this.track.label) {
            track.enabled = true;
            this.selected(true);
            console.log(
              `VideoJS: Enabling track: ${track.label}, enabled: ${track.enabled}`,
            );

            const mainTrack = chooseAudioTracks(
              true,
              mainAudioTracks,
              null,
            )?.find((track) => track.label === this.track.label);

            if (mainTrack?.src) {
              const currentTime = this.player_.currentTime(); // Store current time
              setAudioMainSrc(mainTrack.src);

              // Use setTimeout to ensure the audio source is set before playing
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = currentTime; // Set the correct time

                  if (wasPlaying) {
                    audioRef.current
                      .play()
                      .catch((e) => console.error('Audio play failed:', e));
                  }
                }
              }, 0);
            }
          } else {
            track.enabled = false;
            this.selected(false);
          }
        }
        this.player_.trigger('audiotrackchange', this.track);
      }

      update() {
        const selected = this.track.enabled;
        this.selected(selected);
        this.el_.style.backgroundColor = selected
          ? 'rgba(255, 255, 255, 0.75)'
          : 'rgba(0, 0, 0, 0.5)';
        this.el_.style.color = selected ? '#000' : '#fff';
      }
    }

    class AudioTrackButton extends MenuButton {
      constructor(player, options = {}) {
        super(player, options);
        this.addClass('vjs-audio-button');
        this.updateButtonTitle();
      }

      createEl() {
        const el = super.createEl();
        return el;
      }

      createItems() {
        const items = [];
        const tracks = this.player_.audioTracks();

        if (!tracks) {
          return items;
        }

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          items.push(
            new AudioTrackMenuItem(this.player_, {
              track: track,
              label: track.label || track.language || 'Unknown',
            }),
          );
        }

        return items;
      }

      updateButtonTitle() {
        const tracks = this.player_.audioTracks();
        let currentTrack = null;
        for (let i = 0; i < tracks.length; i++) {
          if (tracks[i].enabled) {
            currentTrack = tracks[i];
            break;
          }
        }
        const title = currentTrack ? currentTrack.label : 'Audio Track';
        this.el().setAttribute('title', title);
        console.log('Button title updated to:', title);
      }

      handleMenuItemClick(item) {
        super.handleMenuItemClick(item);
        this.updateButtonTitle();
      }
    }

    videojs.registerComponent('AudioTrackButton', AudioTrackButton);

    const audioButton = player.controlBar.addChild(
      'AudioTrackButton',
      {},
      player.controlBar.children_.length - 1,
    );

    // Ensure the button is always visible when there are audio tracks
    if (audioButton && audioButton.el() && player.audioTracks().length > 0) {
      audioButton.el().style.display = 'flex';
    }

    player.on('audiotrackchange', (event, changedTrack) => {
      console.log('Audio track changed to:', changedTrack.label);
      if (player?.controlBar?.getChild) {
        const audioTrackButton =
          player.controlBar.getChild('AudioTrackButton') ?? undefined;
        if (audioTrackButton) {
          audioTrackButton.updateButtonTitle();
          const items = audioTrackButton.menu.children();
          for (let i = 0; i < items.length; i++) {
            items[i].update();
          }
        }

        // Log the current state of audio tracks
        const tracks = player.audioTracks();
        console.log('Current audio tracks:');
        for (let i = 0; i < tracks.length; i++) {
          console.log(
            `Track ${i}: label = ${tracks[i].label}, enabled = ${tracks[i].enabled}`,
          );
        }
      }
    });

    // Force an update of the button title after a short delay
    setTimeout(() => {
      try {
        // Check player and controlBar exist
        if (!player || !player.controlBar) {
          console.log('Player or controlBar not initialized');
          return;
        }

        // Check getChild is a function
        if (typeof player.controlBar.getChild !== 'function') {
          console.log('getChild is not a function');
          return;
        }

        // Safely try to get AudioTrackButton
        let audioTrackButton;
        try {
          audioTrackButton = player.controlBar.getChild('AudioTrackButton');
        } catch (e) {
          console.log('Error getting AudioTrackButton:', e);
          return;
        }

        // Only update if button exists
        if (audioTrackButton?.updateButtonTitle) {
          audioTrackButton.updateButtonTitle();
        }
      } catch (error) {
        console.log('Error in audioTrackButton setup:', error);
      }
    }, 100);
  };

  const addResolutionButton = (player) => {
    const ResolutionMenuItem = videojs.extend(
      videojs.getComponent('MenuItem'),
      {
        constructor: function (player, options) {
          videojs.getComponent('MenuItem').call(this, player, options);
          this.selected(this.options_.src === player.currentSrc());
        },
        handleClick: function (event) {
          const currentTime = player.currentTime();
          const wasPlaying = !player.paused();

          // Find the matching source object
          const newSource = player.options_.sources.find(
            (source) => source.label === this.options_.label,
          );

          if (newSource) {
            setIsChangingResolution(true);

            // Remove the poster
            player.poster('');
            //player.posterImage = false;

            // Store the current playback rate
            const playbackRate = player.playbackRate();

            player.src({
              label: newSource.label,
              src: newSource.src,
              type: newSource.type,
            });

            player.one('loadedmetadata', () => {
              player.currentTime(currentTime);
              player.playbackRate(playbackRate);
              if (wasPlaying) {
                player.play();
              }

              setIsChangingResolution(false);
            });

            player.load();
            player.play();

            player.trigger('resolutionchange', this.options_.label);
          } else {
            player.src(null);

            console.error(
              'No matching source found for resolution:',
              this.options_.label,
            );
          }
        },
      },
    );

    const ResolutionMenuButton = videojs.extend(
      videojs.getComponent('MenuButton'),
      {
        constructor: function (player, options) {
          videojs.getComponent('MenuButton').call(this, player, options);
          this.controlText('Quality');
          this.el().classList.add('vjs-resolution-button');
          this.updateButtonText();
        },
        createItems: function () {
          return player.options_.sources?.map((source) => {
            return new ResolutionMenuItem(player, {
              label: source.label || source.res,
              src: source.src,
            });
          });
        },
        updateButtonText: function () {
          const currentSrc = this.player().currentSource();
          const label = currentSrc.label || currentSrc.res || 'Auto';
          this.el().querySelector('.vjs-icon-placeholder').textContent = label;
        },
        handleClick: function (event) {
          // Show/hide menu on click
          if (this.menu.hasClass('vjs-lock-showing')) {
            this.menu.unlockShowing();
          } else {
            this.menu.lockShowing();
          }
          this.updateButtonText();
        },
      },
    );

    videojs.registerComponent('ResolutionMenuButton', ResolutionMenuButton);
    return player.controlBar.addChild(
      'ResolutionMenuButton',
      {},
      player.controlBar.children_.length - 1,
    );
  };

  useEffect(() => {
    if (playerRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        .video-js .vjs-audio-button {
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 3em;
          cursor: pointer;
        }
        .video-js .vjs-audio-button .vjs-icon-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .video-js .vjs-audio-button .vjs-icon-placeholder::before {
          content: "\\f109";  /* This is the VideoJS icon code for headphones */
          font-family: VideoJS;
          font-size: 1.8em;
          line-height: 1.67;
        }
      `;
      playerRef.current.el().appendChild(style);
    }
  }, []);

  const removeDefaultAudioButton = (player) => {
    const defaultAudioButton = player.controlBar.getChild('audioTrackButton');
    if (defaultAudioButton) {
      player.controlBar.removeChild(defaultAudioButton);
      console.log('Removed default audio button');
    }
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
    console.log('TRACE: setupPlayer called, isPlayClicked =', isPlayClicked);

    if (videoRef.current && !playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      console.log('VideoJS: initializePlayer called');
      window.videojs = videojs;

      const player = videojs(videoElement, {
        ...options,
        sources: chooseSource(isPlayClicked, mainSource, trailerSource),
      });

      playerRef.current = player;

      player.pause();
      // player.currentTime(0);
      player.src(chooseSource(isPlayClicked, mainSource, trailerSource));
      player.load();

      if (isPlayClicked) {
        setTimeout(() => {
          if (playerRef.current) {
            console.log('VideoJS: Setting up delayed loadeddata handler');
            playerRef.current.one('loadeddata', () => {
              console.log('VideoJS: loadeddata event fired, playing now');
              playerRef.current
                .play()
                .catch((err) =>
                  console.error('VideoJS: play error (loadeddata)', err),
                );
            });
          }
        }, playDelay1);

        // Keep the fallback as a safety net with longer timeout
        setTimeout(() => {
          if (playerRef.current && playerRef.current.paused()) {
            console.log('VideoJS: Fallback play after 2s');
            playerRef.current
              .play()
              .catch((err) =>
                console.error('VideoJS: play error (fallback)', err),
              );
          }
        }, playDelay2);
      }

      player.ready(() => {
        console.log('VideoJS: Player is ready');

        // Remove the default audio button
        removeDefaultAudioButton(player);

        // Set up audio
        const audioTracks = chooseAudioTracks(
          trailerAudioTracks?.length > 0,
          trailerAudioTracks,
          mainAudioTracks,
        );
        console.log(
          'VideoJS: Adding audio tracks:',
          JSON.stringify(audioTracks, null, 2),
        );

        if (audioTracks.length > 0) {
          console.log(
            'VideoJS: Setting initial audio source:',
            audioTracks[0].src,
          );

          if (trailerAudioTracks?.length > 0)
            audioTrailerSrc.current = audioTracks[0].src;

          // Enable the first audio track by default
          audioTracks[0].enabled = true;
        } else {
          console.log('VideoJS: No audio tracks available');
        }

        audioTracks.forEach((track) => {
          const newTrack = new videojs.AudioTrack({
            id: track.id,
            kind: track.kind,
            label: track.label,
            language: track.language,
            enabled: track === audioTracks[0], // Enable only the first track
          });
          player.audioTracks().addTrack(newTrack);
        });

        if (mainAudioTracks?.length > 0) {
          setAudioMainSrc(mainAudioTracks[0].src);
        }

        console.log(
          'VideoJS: Audio tracks after adding:',
          player.audioTracks(),
        );

        // Add our custom audio button
        addAudioTrackButton(player);

        addResolutionButton(player);

        onReady && onReady(player);
      });

      console.log('VideoJS: player', player);
      player.addClass('vjs-matrix');
      if (isAudio) player.audioOnlyMode(isAudio);

      player.muted(isMuted); // Ensure the player is not muted
      audioRef.current.muted = isMuted;

      player.controlBar.hide();
    }
  };

  useEffect(() => {
    const handleVolumeChange = () => {
      console.log('VideoJS: Volume changed');
      if (isPlayClicked && audioRef.current) {
        const isMuted = playerRef.current.muted();
        audioRef.current.muted = isMuted;
        setIsMainMuted(isMuted);
      }
    };

    if (playerRef.current) {
      playerRef.current.on('play', async () => {
        console.log('VideoJS: play');

        if (isPlayClicked) await handlePlayerPlay(playerRef.current);
      });

      playerRef.current.on('ended', async () => {
        console.log('VideoJS: end');
        audioRef.current.pause();

        audioRef.current.currentTime = Math.round(
          playerRef.current.currentTime() * 1000,
        );

        if (isPlayClicked) await handlePlayerEnd(playerRef.current);
      });

      playerRef.current.on('dispose', async () => {
        console.log('VideoJS: dispose');

        if (isPlayClicked && !playerRef.current.paused())
          await handlePlayerDispose();
      });

      playerRef.current.on('play', () => {
        console.log('VideoJS: Video started playing');
        audioRef.current.muted =
          isPlayClicked && audioMainSrc
            ? isMainMuted
            : !isPlayClicked && audioTrailerSrc
              ? isMuted
              : true;
        audioRef.current
          .play()
          .then(() => console.log('VideoJS: Audio play successful'))
          .catch((e) => console.error('VideoJS: Audio play failed:', e));
      });

      playerRef.current.on('pause', async () => {
        console.log('VideoJS: Video paused');
        audioRef.current.pause();

        if (isPlayClicked) await handlePlayerPause(playerRef.current);
      });

      playerRef.current.on('seeking', () => {
        console.log('VideoJS: Video seeking');
        audioRef.current.currentTime = playerRef.current.currentTime();
      });

      playerRef.current.on('volumechange', handleVolumeChange);

      // In your resolutionchange event listener in VideoJS.jsx:
      playerRef.current.on('resolutionchange', (event, newResolution) => {
        console.log('Resolution changed to:', newResolution);
        setCurrentResolution(newResolution);
        setTimeout(() => {
          const resolutionButton = playerRef.current.controlBar.getChild(
            'ResolutionMenuButton',
          );
          if (resolutionButton) {
            resolutionButton.updateButtonText();
          }
        }, 0);
      });
    }

    return () => {
      if (playerRef.current) {
        console.log('VideoJS: Removing event listeners');
        playerRef.current.off('play');
        playerRef.current.off('pause');
        playerRef.current.off('seeking');
        playerRef.current.off('volumechange', handleVolumeChange);
        playerRef.current.off('resolutionchange');
        playerRef.current.off('ended');
      }
    };
  }, [isPlayClicked, options, isMainMuted, isMuted]);

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
        console.log('VideoJS: playTrailer called');
        hoverTimeout = setTimeout(() => {
          if (!isPlayClicked && playerRef.current) {
            const currentSource = playerRef.current.src();
            const isSourceInTrailer = trailerSource.some(
              (trailer) => trailer.src === currentSource,
            );

            if (!isSourceInTrailer) {
              audioRef.current.currentTime = 0; // Reset the playback time to the beginning
              playerRef.current.src(trailerSource);
            }
            updateSubtitleTracks(trailerSubtitleTracks);
            playerRef.current.muted(isMuted);

            audioRef.current.muted = isMuted;
            audioRef.current.play();
            playerRef.current.play();
          }
        }, playDelay1);
      };

      const pauseTrailer = () => {
        if (!isPlayClicked) {
          console.log('VideoJS: pauseTrailer called');
          clearTimeout(hoverTimeout);
          if (
            !isMouseOverUnmute.current &&
            !isPlayClicked &&
            playerRef.current
          ) {
            console.log(
              'VideoJS: pauseTrailer: currentTime',
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
  }, [isPlayClicked, trailerSource, trailerSubtitleTracks, options, isMuted]);

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
    console.log(
      'TRACE: Source change useEffect, isPlayClicked =',
      isPlayClicked,
    );

    if (playerRef.current) {
      const newSource = chooseSource(isPlayClicked, mainSource, trailerSource);
      console.log('TRACE: - Sources when changing:', {
        isPlayClicked,
        mainSource,
        trailerSource,
        selectedSource: newSource,
        currentPlayerSrc: playerRef.current.currentSrc(),
      });
      console.log('VideoJS: newSource', newSource);

      // Stop any current playback completely
      playerRef.current.pause();

      // Clear any existing event handlers
      playerRef.current.off('loadedmetadata');
      playerRef.current.off('loadeddata');

      // Set new source and load ONCE
      playerRef.current.src(newSource);
      playerRef.current.load();

      // Exit if no source
      if (!newSource) return;

      // Update tracks AFTER setting source
      const newTracks = chooseSubtitleTracks(
        isPlayClicked,
        mainSubtitleTracks,
        trailerSubtitleTracks,
      );
      updateSubtitleTracks(newTracks);

      // Set muted state before playing
      playerRef.current.muted(isPlayClicked ? isMainMuted : isMuted);

      // Add delayed play mechanism
      // Replace the delayed play mechanism with this more robust approach:
      if (isPlayClicked) {
        // Verify source is set correctly before playing
        setTimeout(() => {
          if (playerRef.current) {
            // Get the expected source again to ensure it's correct
            const expectedSource = chooseSource(
              true,
              mainSource,
              trailerSource,
            );
            const currentSource = playerRef.current.currentSrc();

            console.log('Before play - Source check:', {
              expectedSource,
              currentSource,
            });

            // Force source update if needed
            if (!currentSource.includes(expectedSource[0]?.src)) {
              console.log('Fixing source before play');
              playerRef.current.src(expectedSource);
              playerRef.current.load();
            }

            // Now play with the correct source
            console.log('Playing video after delay');
            playerRef.current
              .play()
              .catch((err) =>
                console.error('Play error after source change:', err),
              );
          }
        }, playDelay1);
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

  // useEffect(() => {
  //   if (!trailerSource) return;

  //   if (playerRef.current) {
  //     playerRef.current.on('ended', () => {
  //       if (isPlayClicked) {
  //         playerRef.current.poster(options?.poster);
  //         // setIsPlayClicked(false);
  //         playerRef.current.src(trailerSource);
  //         updateSubtitleTracks(trailerSubtitleTracks);
  //       }
  //     });
  //   }

  //   return () => {
  //     if (playerRef.current) {
  //       playerRef.current.off('ended');
  //     }
  //   };
  // }, [isPlayClicked, trailerSource, setIsPlayClicked, trailerSubtitleTracks]);

  useEffect(() => {
    if (playerRef.current && isPlayClicked) {
      playerRef.current.muted(isMainMuted);
    }
  }, [isPlayClicked]);

  const UnmuteButton = ({ isMuted }) => (
    <div className="absolute bottom-7 right-6 z-20">
      <Button
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
            console.log('VideoJS: isPlayerClicked', isPlayClicked);
            player.muted(!isMuted);
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }
        }}
      >
        {isMuted ? (
          <SpeakerXMarkIcon className="text-fabstir-light-gray-300 h-6 w-6" />
        ) : (
          <SpeakerWaveIcon className="text-fabstir-light-gray-300 h-6 w-6" />
        )}
      </Button>
    </div>
  );

  const stopVideo = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.currentTime(0);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      playerRef.current.poster(options?.poster);
      if (!isPlaylist && setIsPlayClicked) setIsPlayClicked(false);
    }
  };

  useEffect(() => {
    playerRef.current.poster(options?.poster);
    if (!isPlaylist && setIsPlayClicked) setIsPlayClicked(false);

    return () => {
      stopVideo();
    };
  }, [options]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        console.log('VideoJS: Audio metadata loaded');
      };
      audioRef.current.onplay = () => {
        console.log('VideoJS: Audio started playing');
      };
      audioRef.current.onerror = (e) => {
        console.error('VideoJS: Audio error:', e);
      };
    }
  }, [audioMainSrc]);

  useEffect(() => {
    if (audioRef.current) {
      console.log('Current audio src:', audioRef.current.src);
    }
  }, [isPlayClicked, audioMainSrc]);

  // useEffect(() => {
  //   if (audioRef.current) {
  //     // Pause the audio and reset the source
  //     audioRef.current.pause()
  //     audioRef.current.src = ''
  //     audioRef.current.load()

  //     // Set the new source
  //     audioRef.current.src = isPlayClicked
  //       ? audioMainSrc
  //       : !isMuted
  //       ? audioTrailerSrc
  //       : null
  //     audioRef.current.load()

  //     // Log the current audio src
  //     console.log('Current audio src:', audioRef.current.src)
  //   }
  // }, [isPlayClicked, audioMainSrc, audioTrailerSrc, isMuted])
  useEffect(() => {
    if (!isAudio && isPlayClicked && videoRef.current) {
      videoRef.current.removeAttribute('poster');
    }
  }, [isPlayClicked]);

  useEffect(() => {
    if (isPlayClicked && isAudio && playerRef.current) {
      playerRef.current.one('play', () => {
        // Reapply the poster image when playing audio
        playerRef.current.poster(options?.poster);
        // Also update the video element attribute, just in case
        if (videoRef.current) {
          videoRef.current.setAttribute('poster', options?.poster);
        }
      });
    }
  }, [isPlayClicked, isAudio, options]);

  return (
    <div data-vjs-player className="relative">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered h-full w-full"
        poster={!isPlayClicked ? options?.poster : ''}
      ></video>
      <audio
        ref={audioRef}
        src={isPlayClicked ? audioMainSrc : audioTrailerSrc.current}
        onLoadedMetadata={() => console.log('VideoJS: Audio metadata loaded')}
        onPlay={() => console.log('VideoJS: Audio started playing')}
        onPause={() => console.log('VideoJS: Audio paused')}
        onError={(e) => console.error('VideoJS: Audio error:', e.target.error)}
        autoPlay={false}
      />
      {trailerSource && !isPlayClicked && <UnmuteButton isMuted={isMuted} />}
    </div>
  );
};

export default VideoJS;
