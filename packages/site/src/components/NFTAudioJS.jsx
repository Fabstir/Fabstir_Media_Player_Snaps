import React, { useRef, useState } from 'react';
import 'video.js/dist/video-js.css';
import usePortal from '../hooks/usePortal';
import VideoJS from './VideoJS';
import useAudioLink from '../hooks/useAudioLink';

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
  setPlayerCurrentTime,
}) => {
  const getAudioLink = useAudioLink();

  const { getBlobUrl, getPortalType } = usePortal();
  const [options, setOptions] = useState();
  const [trailerSource, setTrailerSource] = useState();
  const [mainSource, setMainSource] = useState();

  const scrollable = useRef(null);

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
      player.bigPlayButton.show();
    });

    player.on('mouseout', () => {
      player.controlBar.hide();
      player.bigPlayButton.hide();
    });

    if (setPlayerCurrentTime) {
      player.on('timeupdate', () => {
        setPlayerCurrentTime(player.currentTime());
      });
    }

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
    if (!nft && !encKey && !metadata) return;

    setIsPlayClicked(false);
    (async () => {
      const mainAudioData = await getAudioLink({
        key: encKey,
        cidWithoutKey: nft.audio,
        metadata,
      });

      if (mainAudioData) {
        const { audioSources, subtitleTracks } =
          separateSubtitlesFromSources(mainAudioData);
        setMainSource(audioSources);
        // if (setMainSubtitleTracks) setMainSubtitleTracks(subtitleTracks);
      }

      if (nft.animation_url) {
        const trailerData = await getAudioLink({
          key: null,
          cidWithoutKey: nft.animation_url,
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
      if (nft && nft.image) nftImage = await getBlobUrl(nft.image);
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
        posterImage: false,
        userActions: { hotkeys: true },
        html5: {
          vhs: {
            withCredentials: true,
          },
        },
        portalType: getPortalType(nft.audio),
        preload: 'none',
      };
      setOptions(theOptions);
    })();
  }, [nft]);

  return (
    <div>
      {options && (
        <VideoJS
          options={options}
          trailerSource={trailerSource}
          mainSource={mainSource}
          onReady={handlePlayerReady}
          isPlayClicked={isPlayClicked}
          setIsPlayClicked={setIsPlayClicked}
          isAudio={true}
        />
      )}
    </div>
  );
};

export default NFTAudioJS;
