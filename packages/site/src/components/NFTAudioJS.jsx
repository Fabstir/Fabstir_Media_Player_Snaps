import React, { useRef, useState } from 'react';
import 'video.js/dist/video-js.css';
import usePortal from '../hooks/usePortal';
import VideoJS from './VideoJS';
import useAudioLinkS5 from '../hooks/useAudioLinkS5';

/**
 * @param {object} object - object with sorted integer keys
 * @param {number} index - index to look up
 */
function getValueForLowestKey(object, index) {
  let returned = object[0];

  for (const key in object) {
    if (object[key].time > index) break;
    returned = object[key];
  }

  return returned;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const NFTAudioJS = ({
  nft,
  setIsPlay,
  bgColourLyrics = 'bg-black',
  highlightColourLyrics = 'bg-white',
}) => {
  const audioRef = React.useRef(null);
  const playerRef = React.useRef(null);

  const getAudioLinkS5 = useAudioLinkS5();

  const { getBlobUrl, downloadFile, getPortalType } = usePortal();
  const [options, setOptions] = useState();

  const [lyricsKeys, setLyricsKeys] = useState();
  const [lyricsIndexDisplay, setLyricsIndexDisplay] = useState();
  const [lyrics, setLyrics] = useState();

  const scrollable = useRef(null);

  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);

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

    player.on('timeupdate', () => {
      setPlayerCurrentTime(player.currentTime());
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });
  };

  React.useEffect(() => {
    (async () => {
      if (nft.lyricsUrl) {
        const theLyricsDownload = await downloadFile(nft.lyricsUrl);
        const theLyricsSplit = theLyricsDownload.split(/\r?\n/);

        // Need to filter out any lines that don't have times.
        // Extract times as key and the rest of line as value
        // Convert key to seconds
        const theLyricsKeys = [];
        const theLyrics = [' ', ' ', ' ', ' '];

        let counter = 0;
        for (const idx in theLyricsSplit) {
          const lyricSplit = theLyricsSplit[idx];
          if (
            lyricSplit.charAt(0) !== '[' ||
            lyricSplit.charAt(3) !== ':' ||
            lyricSplit.charAt(9) !== ']'
          )
            continue;

          const minutes = Number(lyricSplit.substring(1, 2));
          const seconds = Number(lyricSplit.substring(4, 8));
          const time = minutes * 60 + seconds;

          const lyric = lyricSplit.substring(10);

          theLyricsKeys.push({ time, counter });
          theLyrics.push(lyric);

          counter++;
        }

        setLyricsKeys(theLyricsKeys);
        setLyrics(theLyrics);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!nft) return;
    (async () => {
      let prog_index_m3u8_url = await getAudioLinkS5({
        nft,
      });

      if (
        !prog_index_m3u8_url ||
        prog_index_m3u8_url.length === 0 ||
        !prog_index_m3u8_url[0].src
      )
        return;

      //prog_index_m3u8_url[0].src = prog_index_m3u8_url[0].src + '.flac'
      // const prog_index_m3u8_url = await getVideoLink({
      //   encKey,
      //   dirLink: nft.audio,
      // })

      console.log('DetailsSidebar: nft.audio1 = ', nft.audio);
      console.log('test4: nft.audio1 = ', nft.audio);
      console.log('test4: prog_index_m3u8_url = ', prog_index_m3u8_url);

      // console.log(
      //   'DetailsSidebar: prog_index_m3u8_url nft.audio = ',
      //   nft.audio
      // )
      console.log(
        'DetailsSidebar: prog_index_m3u8_url = ',
        prog_index_m3u8_url,
      );

      let nftImage;
      if (nft && nft.image) nftImage = await getBlobUrl(nft.image);
      else nftImage = null;

      const theOptions = {
        // lookup the options in the docs for more options
        autoplay: false,
        controls: true,
        bigPlayButton: true,
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
        // techOrder: ['vlc', 'html5', 'flash'],
        sources: [
          {
            src: prog_index_m3u8_url[0].src,
            type: 'audio/flac',
          },
        ],
        // portalType: getPortalType(nft.audio),
      };
      setOptions(theOptions);
    })();
  }, [nft]);

  return (
    <div>
      {options && (
        <VideoJS options={options} onReady={handlePlayerReady} isAudio={true} />
      )}

      {nft.lyricsUrl && (
        <div className="py-5">
          <div className="relative h-44 overflow-hidden">
            <div
              className={classNames(
                bgColourLyrics,
                'absolute -inset-x-5 -top-5 h-12 blur-lg',
              )}
            ></div>
            <div
              className={classNames(
                highlightColourLyrics,
                'absolute top-1/2 h-12 w-full -translate-y-1/2 mix-blend-overlay blur-md',
              )}
            ></div>
            <pre className="font-open-sans scroll-hidden ref={scrollable} h-full overflow-auto text-center tracking-wide text-white/60 scrollbar-hide">
              <div>
                {lyricsIndexDisplay?.map((key, index) => (
                  <p key={`${key}-${index}`}>{lyrics[key]}</p>
                ))}
              </div>

              <div
                className={classNames(
                  bgColourLyrics,
                  'absolute -inset-x-5 -bottom-5 h-12 blur-lg',
                )}
              ></div>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTAudioJS;
