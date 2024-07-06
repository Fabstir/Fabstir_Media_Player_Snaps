import React, { useState } from 'react';
import 'video.js/dist/video-js.css';
import usePortal from '../hooks/usePortal';
import useVideoLinkS5 from '../hooks/useVideoLinkS5';
import VideoJS from './VideoJS';
import videojs from 'video.js';

/**
 * A React component that renders a Video.js player for an NFT video.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.nft - The NFT object containing video information.
 * @param {Function} props.onReady - The callback function to be called when the video is ready to play.
 * @param {Function} props.setIsPlay - The state setter function for the video play state.
 * @returns {JSX.Element} - The NFTVideoJS component.
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

  const getVideoLinkS5 = useVideoLinkS5();

  const { getBlobUrl, getPortalType } = usePortal();
  const [options, setOptions] = useState();

  const [trailerSource, setTrailerSource] = useState();
  const [mainSource, setMainSource] = useState();

  const handlePlayerReady = (player) => {
    console.log('test: ScreenView handlePlayerReady');

    // you can handle player events here
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
  };

  React.useEffect(() => {
    if (!nft && !encKey && !metadata) return;

    setIsPlayClicked(false);
    (async () => {
      console.log('NFTVideoJS: nft.name useEffect getEncKey');

      console.log('NFTVideoJS: nft = ', nft);
      console.log('NFTVideoJS: encKey = ', encKey);
      console.log('NFTVideoJS: metadata = ', metadata);

      console.log('NFTVideoJS: nft.video = ', nft.video);

      if (!nft.video) return;

      const prog_index_m3u8_url = await getVideoLinkS5({
        key: encKey,
        cidWithoutKey: nft.video,
        metadata,
      });
      //      if (!prog_index_m3u8_url) return

      if (prog_index_m3u8_url !== undefined) setMainSource(prog_index_m3u8_url);

      const sampleSources = nft.animation_url
        ? await getVideoLinkS5({
            key: null,
            cidWithoutKey: nft.animation_url,
          })
        : null;

      setTrailerSource(sampleSources);

      console.log('NFTVideoJS: nft.name useEffect getVideoLink');
      console.log('NFTVideoJS: prog_index_m3u8_url = ', prog_index_m3u8_url);

      let nftImage;
      if (nft?.backdropImage) nftImage = await getBlobUrl(nft.backdropImage);
      else if (nft?.image) nftImage = await getBlobUrl(nft.image);
      else nftImage = null;

      console.log('NFTVideoJS: nft.name useEffect getBlobUrl');

      console.log('NFTVideoJS: prog_index_m3u8_url= ', prog_index_m3u8_url);

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
        />
      )}
    </>
  );
};

export default NFTVideoJS;
