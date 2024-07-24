import React, { useState, useEffect } from 'react';
import 'video.js/dist/video-js.css';
import usePortal from '../hooks/usePortal';
import useVideoLink from '../hooks/useVideoLink';
import VideoJS from './VideoJS';
import videojs from 'video.js';

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
  onReady,
  setIsPlay,
  encKey,
  isPlayClicked,
  setIsPlayClicked,
  metadata,
}) => {
  console.log('NFTVideoJS: nft.name useEffect');
  console.log('test: NFTVideoJS');

  window.videojs = videojs;

  const getVideoLink = useVideoLink();

  const { getBlobUrl, getPortalType } = usePortal();
  const [options, setOptions] = useState();

  const [trailerSource, setTrailerSource] = useState();
  const [mainSource, setMainSource] = useState();
  const [trailerAudioTracks, setTrailerAudioTracks] = useState([]);
  const [mainAudioTracks, setMainAudioTracks] = useState([]);
  const [trailerSubtitleTracks, setTrailerSubtitleTracks] = useState([]);
  const [mainSubtitleTracks, setMainSubtitleTracks] = useState([]);

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
        setIsPlay(false);
      });

      player.on('ended', () => {
        setIsPlay(false);
      });
    }

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

  useEffect(() => {
    if (!nft && !encKey && !metadata) return;

    setIsPlayClicked(false);
    (async () => {
      console.log('NFTVideoJS: nft.name useEffect getEncKey');

      console.log('NFTVideoJS: nft = ', nft);
      console.log('NFTVideoJS: encKey = ', encKey);
      console.log('NFTVideoJS: metadata = ', metadata);

      console.log('NFTVideoJS: nft.video = ', nft.video);

      if (!nft.video) return;

      const mainVideoData = await getVideoLink({
        key: encKey,
        cidWithoutKey: nft.video,
        metadata,
      });

      if (mainVideoData) {
        const { videoSources, audioTracks, subtitleTracks } =
          separateSubtitlesFromSources(mainVideoData);
        setMainSource(videoSources);
        setMainAudioTracks(audioTracks);
        setMainSubtitleTracks(subtitleTracks);
      }

      if (nft.animation_url) {
        const trailerData = await getVideoLink({
          key: null,
          cidWithoutKey: nft.animation_url,
        });

        if (trailerData) {
          const { videoSources, audioTracks, subtitleTracks } =
            separateSubtitlesFromSources(trailerData);
          setTrailerSource(videoSources);
          setTrailerAudioTracks(audioTracks);
          setTrailerSubtitleTracks(subtitleTracks);
        }
      } else setTrailerSource(null);

      console.log('NFTVideoJS: nft.name useEffect getVideoLink');
      console.log('NFTVideoJS: mainSource = ', mainSource);
      console.log('NFTVideoJS: trailerSource = ', trailerSource);

      let nftImage;
      if (nft?.backdropImage) nftImage = await getBlobUrl(nft.backdropImage);
      else if (nft?.image) nftImage = await getBlobUrl(nft.image);
      else nftImage = null;

      console.log('NFTVideoJS: nft.name useEffect getBlobUrl');

      const theOptions = {
        autoplay: false,
        controls: true,
        bigPlayButton: false,
        responsive: true,
        fluid: true,
        height: 1080,
        width: 1920,
        playbackRates: [0.5, 1, 1.5, 2],
        poster: nftImage,
        posterImage: false,
        userActions: { hotkeys: true },
        html5: {
          vhs: {
            withCredentials: true,
          },
        },
        portalType: getPortalType(nft.video),
        preload: 'none',
      };

      console.log('NFTVideoJS: nft = ', nft);
      console.log('NFTVideoJS: nft.name = ', nft.name);
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
        />
      )}
    </>
  );
};

export default NFTVideoJS;
