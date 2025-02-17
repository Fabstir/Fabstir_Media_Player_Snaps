import React, { useRef, useState } from 'react';
import 'video.js/dist/video-js.css';
import usePortal from '../hooks/usePortal';
import VideoJS from './VideoJS';
import useAudioLink from '../hooks/useAudioLink';
import useNFTMedia from '../hooks/useNFTMedia';
import { ArrowLeftIcon, ArrowRightIcon } from 'heroiconsv2/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const NFTAudioJS = ({
  nft,
  setIsPlay,
  encKey,
  isPlayClicked,
  setIsPlayClicked,
  metadata,
  setPlayer,
  handleNext,
  handlePrev,
  playlistNFT,
}) => {
  const getAudioLink = useAudioLink();

  const { getBlobUrl, getPortalType } = usePortal();
  const [options, setOptions] = useState();
  const [trailerSource, setTrailerSource] = useState();
  const [mainSource, setMainSource] = useState();

  const scrollable = useRef(null);

  const {
    getMediaResumeState,
    putMediaResumeState,
    putPlaylistLastPlayedNFT,
    getPlaylistLastPlayedNFT,
  } = useNFTMedia();

  // Add ref to track current nft
  const nftRef = useRef(nft);

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
    setPlayer(player);

    // you can handle player events here
    player.on('waiting', () => {
      console.log('player is waiting');
    });

    if (setIsPlay) {
      player.on('play', () => {
        setIsPlay(true);
      });

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
    }

    player.on('mouseover', () => {
      player.controlBar.show();
      player.bigPlayButton.show();
    });

    player.on('mouseout', () => {
      player.controlBar.hide();
      player.bigPlayButton.hide();
    });

    // if (setPlayerCurrentTime) {
    //   player.on('timeupdate', () => {
    //     setPlayerCurrentTime(player.currentTime());
    //   });
    // }

    player.on('dispose', () => {
      console.log('player will dispose');
    });

    player.on('resolutionchange', function () {
      console.info('Source changed to %s', player.src());
    });
  };

  const separateSubtitlesFromSources = (sources) => {
    const audioSources = sources.filter((source) => !source.kind);
    const subtitleTracks = sources
      .filter((source) => source.kind === 'subtitles')
      .map((subtitle) => ({
        kind: 'subtitles',
        src: subtitle.src,
        srclang: subtitle.srclang,
        label: subtitle.label,
      }));
    return { audioSources, subtitleTracks };
  };

  React.useEffect(() => {
    // Update ref when nft changes
    nftRef.current = nft;

    if (!nft && !encKey && !metadata) return;

    //    setIsPlayClicked(false);
    (async () => {
      const mainAudioData = await getAudioLink({
        key: encKey,
        cidWithoutKey: nftRef.current.audio,
        metadata,
      });

      if (mainAudioData) {
        const { audioSources, subtitleTracks } =
          separateSubtitlesFromSources(mainAudioData);
        setMainSource(audioSources);
        // if (setMainSubtitleTracks) setMainSubtitleTracks(subtitleTracks);
      }

      if (nftRef.current.animation_url) {
        const trailerData = await getAudioLink({
          key: null,
          cidWithoutKey: nftRef.current.animation_url,
        });

        if (trailerData) {
          const { audioSources, subtitleTracks } =
            separateSubtitlesFromSources(trailerData);
          setTrailerSource(audioSources);
          // if (setTrailerSubtitleTracks)
          //   setTrailerSubtitleTracks(subtitleTracks);
        }
      } else setTrailerSource(null);

      let nftImage;
      if (nftRef.current?.image)
        nftImage = await getBlobUrl(nftRef.current.image);
      else nftImage = null;

      const theOptions = {
        // lookup the options in the docs for more options
        autoplay: false,
        controls: true,
        bigPlayButton: false,
        responsive: true,
        fluid: true,
        height: 1080,
        width: 1920,
        playbackRates: [0.5, 1, 1.5, 2],
        poster: nftImage,
        posterImage: true,
        userActions: { hotkeys: true },
        html5: {
          vhs: {
            withCredentials: true,
          },
        },
        portalType: getPortalType(nftRef.current.audio),
        preload: 'none',
      };
      setOptions(theOptions);
    })();
  }, [nft?.address, nft?.id]);

  return (
    <div>
      {options && (
        <>
          <VideoJS
            options={options}
            trailerSource={trailerSource}
            mainSource={mainSource}
            onReady={handlePlayerReady}
            isPlayClicked={isPlayClicked}
            setIsPlayClicked={setIsPlayClicked}
            isAudio={true}
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
    </div>
  );
};

export default NFTAudioJS;
