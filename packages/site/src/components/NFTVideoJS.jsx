import React, { useState, useEffect, useRef } from 'react';
import 'video.js/dist/video-js.css';
import usePortal from '../hooks/usePortal';
import VideoJS from './VideoJS';
import videojs from 'video.js';
import useContractUtils from '../blockchain/useContractUtils';
import useVideoLinkS5 from '../hooks/useVideoLink';
import useNFTMedia from '../hooks/useNFTMedia';
import { ArrowLeftIcon, ArrowRightIcon } from 'heroiconsv2/24/outline';

/**
 * A React component that integrates VideoJS for NFT video playback.
 *
 * This component wraps the VideoJS player to provide a customized video playback experience tailored for
 * NFT (Non-Fungible Token) videos. It supports functionalities such as dynamic source loading, playback controls,
 * and custom styling to enhance the user's interaction with NFT media. The component is designed to be easily
 * integrated into NFT marketplaces or galleries, offering a seamless way to preview and interact with video-based
 * NFTs.
 *
 * @param {Object} props - The properties passed to the NFTVideoJS component.
 * @returns {JSX.Element} The VideoJS player configured for NFT video playback.
 */
export const NFTVideoJS = ({
  nft,
  setIsPlay,
  encKey,
  isPlayClicked,
  setIsPlayClicked,
  metadata,
  handleNext,
  handlePrev,
  playlistNFT,
}) => {
  console.log('test: NFTVideoJS');

  window.videojs = videojs;

  const getVideoLink = useVideoLinkS5();

  const { getBlobUrl, getPortalType } = usePortal();
  const [options, setOptions] = useState();

  const [trailerSource, setTrailerSource] = useState();
  const [mainSource, setMainSource] = useState();
  const [trailerAudioTracks, setTrailerAudioTracks] = useState([]);
  const [mainAudioTracks, setMainAudioTracks] = useState([]);
  const [trailerSubtitleTracks, setTrailerSubtitleTracks] = useState([]);
  const [mainSubtitleTracks, setMainSubtitleTracks] = useState([]);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [killswitch, setKillswitch] = useState(false);

  const hasExecutedRef = useRef(false);

  const { getAddressFromChainIdAddress } = useContractUtils();

  const {
    getMediaResumeState,
    putMediaResumeState,
    putPlaylistLastPlayedNFT,
    getPlaylistLastPlayedNFT,
  } = useNFTMedia();

  // Add ref to track current nft
  const nftRef = useRef(nft);

  const stopVideo = (playerRef) => {
    setMainSource([]);
    setMainAudioTracks([]);
    setIsPlayClicked(false);
    if (setIsPlay) {
      setIsPlay(false);
    }
    setKillswitch(true);
  };

  async function handlePlayerResume(player) {
    const resumeState = await getMediaResumeState(nftRef.current);
    if (resumeState?.resumeTime) player.currentTime(resumeState.resumeTime);
  }

  async function handlePlayerSaveResumeTime(player) {
    if (!player) return;

    const currentTime = player.currentTime() || 0;

    const duration = player.duration();
    const resumeTimePercent = (currentTime / duration) * 100;

    const resumeState = await getMediaResumeState(nftRef.current);

    await putMediaResumeState(
      nftRef.current,
      currentTime,
      resumeTimePercent,
      resumeState?.isFinished ||
        resumeTimePercent >= process.env.NEXT_PUBLIC_FINISHED_PERCENT_THRESHOLD,
    );

    if (playlistNFT?.playlist?.length > 0)
      await putPlaylistLastPlayedNFT(playlistNFT, nftRef.current);
  }

  async function handlePlayerEnd(player) {
    const currentTime = player.currentTime() || 0;
    const resumeState = await getMediaResumeState(nftRef.current);

    const duration = player.duration();
    const resumeTimePercent = (currentTime / duration) * 100;

    await putMediaResumeState(
      nftRef.current,
      0,
      0,
      resumeState?.isFinished ||
        resumeTimePercent >= process.env.NEXT_PUBLIC_FINISHED_PERCENT_THRESHOLD,
    );

    if (playlistNFT?.playlist?.length > 0)
      await putPlaylistLastPlayedNFT(playlistNFT, playlistNFT.playlist[0]);
  }

  const handlePlayerReady = (player) => {
    console.log('test: ScreenView handlePlayerReady');

    player.on('waiting', () => {
      console.log('player is waiting');
    });

    if (setIsPlay) {
      player.on('play', () => {
        setIsPlay(true);
      });

      player.on('pause', () => {
        //   setIsPlay(false);
      });
    }

    // player.on('ended', () => {
    //   handleNext?.();
    //   console.log('player ended');
    // });

    player.on('timeupdate', function (event) {
      //chrome fix
      if (
        player.duration() > 0 &&
        player.currentTime() >= player.duration() - 0.1
      ) {
        console.log(
          `NFTVideoJS: player.currentTime() = ${player.currentTime()}`,
        );
        console.log(`NFTVideoJS: player.duration() = ${player.duration()}`);
        if (handleNext) player.currentTime(0);

        handleNext?.();
        console.log('video ended');
      }
    });

    player.on('mouseover', () => {
      player.controlBar.show();
    });

    player.on('mouseout', () => {
      player.controlBar.hide();
    });

    // player.on('timeupdate', () => {
    //   setPlayerCurrentTime(player.currentTime())
    // })

    player.on('dispose', () => {
      console.log('player will dispose');
    });

    player.on('resolutionchange', function () {
      console.info('Source changed to %s', player.src());
    });

    player.on('loadedmetadata', () => {
      setDuration(player.duration());
    });

    // player.on('*', function (event) {
    //   if (event.type.includes('resolution')) {
    //     console.log('Resolution-related event:', event.type);
    //   }
    // });
  };

  const separateSubtitlesFromSources = (sources) => {
    const videoSources = sources.filter((source) => !source.kind);
    const subtitleTracks = sources
      .filter((source) => source.kind === 'subtitles')
      .map((subtitle) => ({
        kind: 'subtitles',
        src: subtitle.src,
        srclang: subtitle.srclang,
        label: subtitle.label,
      }));

    const audioTracks = sources
      .filter((source) => source.kind === 'audio')
      .map((audio) => ({
        kind: 'audio',
        src: audio.src,
        language: audio.language,
        label: audio.language,
        enabled: false,
      }));

    return { videoSources, audioTracks, subtitleTracks };
  };

  const isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  };

  useEffect(() => {
    // Update ref when nft changes
    nftRef.current = nft;

    if (!nftRef.current && !encKey && !metadata) return;

    //setIsPlayClicked(false);
    (async () => {
      console.log('NFTVideoJS: nftRef.current.name useEffect getEncKey');

      console.log('NFTVideoJS: nftRef.current = ', nftRef.current);
      console.log('NFTVideoJS: encKey = ', encKey);
      console.log('NFTVideoJS: metadata = ', metadata);

      console.log('NFTVideoJS: nftRef.current.video = ', nftRef.current.video);

      if (!nftRef.current.video) return;

      let mainVideoData = await getVideoLink({
        key: encKey,
        cidWithoutKey: nftRef.current.video,
        metadata,
      });

      if (mainVideoData) {
        const { videoSources, audioTracks, subtitleTracks } =
          separateSubtitlesFromSources(mainVideoData);
        setMainSource(videoSources);
        setMainAudioTracks(audioTracks);
        setMainSubtitleTracks(subtitleTracks);
      } else {
        setMainSource(null);
        setMainAudioTracks(null);
        setMainSubtitleTracks(null);
      }

      if (nftRef.current.animation_url) {
        const trailerData = await getVideoLink({
          key: null,
          cidWithoutKey: nftRef.current.animation_url,
        });

        let videoSources = null;
        let audioTracks = null;
        let subtitleTracks = null;

        if (trailerData) {
          ({ videoSources, audioTracks, subtitleTracks } =
            separateSubtitlesFromSources(trailerData));
        }

        setTrailerSource(videoSources);
        setTrailerAudioTracks(audioTracks);
        setTrailerSubtitleTracks(subtitleTracks);
      } else {
        setTrailerSource(null);
        setTrailerAudioTracks(null);
        setTrailerSubtitleTracks(null);
      }

      console.log('NFTVideoJS: nftRef.current.name useEffect getVideoLink');
      console.log('NFTVideoJS: mainSource = ', mainSource);
      console.log('NFTVideoJS: trailerSource = ', trailerSource);

      let nftImage;
      if (nftRef.current?.backdropImage)
        nftImage = await getBlobUrl(nftRef.current.backdropImage);
      else if (nftRef.current?.image)
        nftImage = await getBlobUrl(nftRef.current.image);
      else nftImage = null;

      console.log('NFTVideoJS: nftRef.current.name useEffect getBlobUrl');

      const theOptions = {
        autoplay: false,
        controls: true,
        bigPlayButton: false,
        responsive: true,
        fluid: true,
        height: 1080,
        width: 1920,
        playbackRates: [0.5, 1, 1.5, 2],
        poster: !isPlayClicked ? nftImage : '',
        posterImage: false,
        userActions: { hotkeys: true },
        html5: {
          vhs: {
            withCredentials: true,
          },
        },
        portalType: getPortalType(nftRef.current.video),
        preload: 'none',
      };

      console.log('NFTVideoJS: nftRef.current = ', nftRef.current);
      console.log('NFTVideoJS: nftRef.current.name = ', nftRef.current.name);
      console.log('NFTVideoJS: theOptions = ', theOptions);
      setOptions(theOptions);
    })();

    // Cleanup function
    return () => {
      console.log('NFTVideoJS: Component is unloading');
    };
  }, [nft, encKey, metadata]);

  return (
    <>
      {options && (
        <>
          <VideoJS
            options={options}
            trailerSource={trailerSource}
            mainSource={mainSource}
            onReady={handlePlayerReady}
            isPlayClicked={isPlayClicked}
            setIsPlayClicked={setIsPlayClicked}
            trailerAudioTracks={trailerAudioTracks}
            mainAudioTracks={mainAudioTracks}
            trailerSubtitleTracks={trailerSubtitleTracks}
            mainSubtitleTracks={mainSubtitleTracks}
            killswitch={killswitch}
            handlePlayerPlay={handlePlayerResume}
            handlePlayerPause={handlePlayerSaveResumeTime}
            handlePlayerEnd={handlePlayerEnd}
            handlePlayerDispose={handlePlayerSaveResumeTime}
            isPlaylist={playlistNFT?.playlist?.length > 0}
          />

          <div style={{ marginTop: '10px', display: 'flex', gap: '1rem' }}>
            <button onClick={() => handlePrev?.()} aria-label="Previous Video">
              <ArrowLeftIcon size={24} />
            </button>
            <button onClick={() => handleNext?.()} aria-label="Next Video">
              <ArrowRightIcon size={24} />
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default NFTVideoJS;
