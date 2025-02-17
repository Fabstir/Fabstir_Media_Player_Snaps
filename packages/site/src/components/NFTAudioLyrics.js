import React, { useEffect, useRef, useState } from 'react';
import 'video.js/dist/video-js.css';
import usePortal from '../hooks/usePortal';
import throttle from 'lodash.throttle';

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

/**
 * `NFTAudioLyrics` is a React component that displays the lyrics of an audio NFT. It highlights the current line of lyrics
 * based on the current playback time of the audio player. The component allows customization of the background and highlight
 * colors of the lyrics through props.
 *
 * @component
 * @param {Object} props - The props for the NFTAudioLyrics component.
 * @param {Object} props.nft - The NFT object containing the lyrics and other metadata.
 * @param {number} props.playerCurrentTime - The current playback time of the audio player, used to determine which line of lyrics to highlight.
 * @param {string} [props.bgColourLyrics='bg-fabstir-black'] - The Tailwind CSS class for the background color of the lyrics. Defaults to 'bg-fabstir-black'.
 * @param {string} [props.highlightColourLyrics='bg-fabstir-white'] - The Tailwind CSS class for the highlight color of the current line of lyrics. Defaults to 'bg-fabstir-white'.
 */
export const NFTAudioLyrics = ({
  nft,
  bgColourLyrics = 'bg-fabstir-black',
  highlightColourLyrics = 'bg-fabstir-white',
  player,
}) => {
  const { downloadFile } = usePortal();

  const [lyricsKeys, setLyricsKeys] = useState();
  const [lyricsIndexDisplay, setLyricsIndexDisplay] = useState();
  const [lyrics, setLyrics] = useState();

  const scrollable = useRef(null);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);

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

  useEffect(() => {
    // If player is falsy, do nothing
    if (!player) return;
    if (typeof player.on !== 'function') return;

    // Capture the current player instance
    const currentPlayer = player;

    const throttleTimeUpdate = throttle((time) => {
      setPlayerCurrentTime(time);
    }, 250);

    const onTimeUpdate = () => {
      // Double-check currentPlayer is valid before calling currentTime
      if (currentPlayer && typeof currentPlayer.currentTime === 'function') {
        throttleTimeUpdate(currentPlayer.currentTime());
      }
    };

    // Use a try/catch when setting the listener
    try {
      currentPlayer.on('timeupdate', onTimeUpdate);
    } catch (error) {
      console.error('Error adding timeupdate listener:', error);
    }

    return () => {
      throttleTimeUpdate.cancel();
      try {
        if (currentPlayer && typeof currentPlayer.off === 'function') {
          currentPlayer.off('timeupdate', onTimeUpdate);
        }
      } catch (error) {
        console.error('Error removing timeupdate listener:', error);
      }
    };
  }, [player]);

  React.useEffect(() => {
    if (lyrics) {
      const idx = getValueForLowestKey(lyricsKeys, playerCurrentTime);
      const lower = Math.max(idx.counter, 0);
      const upper = Math.min(idx.counter + 9, Object.keys(lyrics).length - 1);

      const theLyricsIndexDisplay = [...Array(upper - lower + 1).keys()].map(
        (i) => lower - 1 + i + 1,
      );
      setLyricsIndexDisplay(theLyricsIndexDisplay);
    }
  }, [lyrics, lyricsKeys, playerCurrentTime]);

  return (
    <div>
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
            <pre className="font-open-sans scroll-hidden ref={scrollable} h-full overflow-auto text-center tracking-wide text-light-gray scrollbar-hide">
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

export default NFTAudioLyrics;
