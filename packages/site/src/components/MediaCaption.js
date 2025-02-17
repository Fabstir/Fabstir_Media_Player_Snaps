import React, { useEffect, useState } from 'react';
import { PlayIcon } from 'heroiconsv2/24/solid';
import ResumePlayModal from './ResumePlayModal';
import useNFTMedia from '../hooks/useNFTMedia';
import { getUniqueKeyFromNFT } from '../utils/nftUtils';

/**
 * Renders a media caption component for an NFT, including its title, overview, media type, and release date.
 * It also provides a play button to trigger media playback and displays the quantity of the NFT if available.
 * The component uses conditional rendering to display data based on the NFT's attributes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.nft - The NFT object containing information like title, name, overview, summary, attributes, and type.
 * @param {Function} props.setIsPlayClicked - A function to set the state indicating whether the play button has been clicked.
 * @param {number} [props.nftQuantity] - The quantity of the NFT, optional.
 * @returns {React.ReactElement} The MediaCaption component.
 */
const MediaCaption = ({
  nft,
  setIsPlayClicked,
  nftQuantity,
  playlistNFT,
  setPlaylistCurrentIndex,
}) => {
  const {
    getMediaResumeState,
    putMediaResumeState,
    putPlaylistLastPlayedNFT,
    getPlaylistLastPlayedNFT,
  } = useNFTMedia();
  const [resumeTime, setResumeTime] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);

  function handlePlay() {
    setIsPlayClicked(true);
  }

  const handlePlayClick = async () => {
    console.log('test44: handlePlayClick called'); //

    if (nft?.playlist?.length > 0) {
      const playlistLastPlayedNFTAddressId =
        await getPlaylistLastPlayedNFT(nft);

      const currentIndex =
        !playlistLastPlayedNFTAddressId?.lastplayedNFTAddressId
          ? 0
          : nft?.playlist?.findIndex(
              (nft) =>
                getUniqueKeyFromNFT(nft).toLowerCase() ===
                playlistLastPlayedNFTAddressId.lastplayedNFTAddressId.toLowerCase(),
            );
      setPlaylistCurrentIndex(currentIndex);

      //      if (currentIndex>0)
      if (currentIndex === undefined || currentIndex === null) handlePlay();
      else {
        const playlistLastPlayedNFT = nft.playlist[currentIndex];

        const mediaResumeState = await getMediaResumeState(
          playlistLastPlayedNFT,
        );
        const time = mediaResumeState?.resumeTime
          ? mediaResumeState?.resumeTime
          : 0;
        if (time && time > 0) {
          setResumeTime(time);
          setShowResumeModal(true);
        } else {
          handlePlay();
        }
      }
    } else {
      const mediaResumeState = await getMediaResumeState(nft);
      const time = mediaResumeState?.resumeTime
        ? mediaResumeState?.resumeTime
        : 0;
      if (time && time > 0) {
        setResumeTime(time);
        setShowResumeModal(true);
      } else {
        handlePlay();
      }
    }
  };

  const [contentName, setContentName] = useState('');

  useEffect(() => {
    if (nft?.playlist?.length > 0) {
      (async () => {
        const playlistLastPlayedNFTAddressId =
          await getPlaylistLastPlayedNFT(nft);

        let currentIndex;
        if (playlistLastPlayedNFTAddressId?.lastplayedNFTAddressId) {
          currentIndex = nft?.playlist?.findIndex(
            (nft) =>
              getUniqueKeyFromNFT(nft).toLowerCase() ===
              playlistLastPlayedNFTAddressId.lastplayedNFTAddressId.toLowerCase(),
          );
        }

        const playlistChildNFT =
          currentIndex !== undefined && currentIndex !== null
            ? nft.playlist[currentIndex]
            : null;
        setContentName(
          `${playlistChildNFT?.title || playlistChildNFT?.name} from playlist ${nft?.title || nft?.name}`,
        );
      })();
    } else {
      setContentName(nft?.title || nft?.name);
    }
  }, [nft]);

  return (
    <div className="text-white dark:text-white">
      <div
        className="absolute inset-0"
        style={{ boxShadow: '0 0 25px 25px rgba(0, 0, 0, 0.5)' }}
      ></div>
      <div className="p-2">
        <h2 className="mb-2 mt-1 text-sm font-bold @md:text-base @lg:text-lg @xl:text-xl @2xl:text-2xl">
          {nft?.title || nft?.name}
        </h2>

        {setIsPlayClicked && (
          <>
            <button
              onClick={() => {
                console.log('MediaCaption: Button was clicked');
                handlePlayClick();
              }}
              className="h-10 w-10 transform transition-transform hover:scale-110"
            >
              <PlayIcon />
            </button>

            {showResumeModal && (
              <ResumePlayModal
                resumeTime={resumeTime}
                contentName={contentName}
                onResume={async () => {
                  if (nft?.playlist?.length > 0) {
                    const playlistLastPlayedNFTAddressId =
                      await getPlaylistLastPlayedNFT(nft);

                    const currentIndex = nft?.playlist?.findIndex(
                      (nft) =>
                        getUniqueKeyFromNFT(nft).toLowerCase() ===
                        playlistLastPlayedNFTAddressId.lastplayedNFTAddressId.toLowerCase(),
                    );
                    setPlaylistCurrentIndex(currentIndex);

                    setShowResumeModal(false);
                    handlePlay();
                  } else {
                    const playlistLastPlayedNFTAddressId =
                      await getPlaylistLastPlayedNFT(playlistNFT);
                    const currentIndex = playlistNFT?.playlist?.findIndex(
                      (nft) =>
                        getUniqueKeyFromNFT(nft).toLowerCase() ===
                        playlistLastPlayedNFTAddressId.lastplayedNFTAddressId.toLowerCase(),
                    );
                    setPlaylistCurrentIndex(currentIndex);

                    setShowResumeModal(false);
                    handlePlay();
                  }
                }}
                onRestart={async () => {
                  if (nft?.playlist?.length > 0) {
                    await putPlaylistLastPlayedNFT(nft, nft.playlist[0]);
                    setPlaylistCurrentIndex(0);

                    const resumeState = await getMediaResumeState(
                      nft.playlist[0],
                    );
                    await putMediaResumeState(
                      nft.playlist[0],
                      0,
                      0,
                      resumeState.isFinished,
                    );

                    setShowResumeModal(false);
                    handlePlay();
                  } else {
                    const resumeState = await getMediaResumeState(nft);
                    await putMediaResumeState(
                      nft,
                      0,
                      0,
                      resumeState.isFinished,
                    );

                    setShowResumeModal(false);
                    handlePlay();
                  }
                }}
                onClose={() => setShowResumeModal(false)}
              />
            )}
          </>
        )}

        <p className="line-clamp-4 text-xs @md:line-clamp-5 @md:text-sm @lg:text-sm @xl:text-base @2xl:text-lg @3xl:text-xl">
          {nft?.overview || nft?.summary}
        </p>
      </div>
      <div className="pointer-events-auto flex items-center px-2 text-xs @md:text-sm @lg:text-base @xl:text-lg @2xl:text-lg @3xl:text-xl">
        {nft?.attributes?.['media_type']
          ? `${nft?.attributes?.['media_type']} •`
          : nft?.type
            ? `${nft?.type} •`
            : ''}
        {nft?.attributes?.['release_date']
          ? `${nft?.attributes?.['release_date']} •`
          : nft?.attributes?.['first_air_date']
            ? `${nft?.attributes?.['first_air_date']} •`
            : ''}
      </div>
      {nftQuantity && <div className="px-2">{`Qty: ${nftQuantity}`}</div>}
      <span className="sr-only">Favorite</span>
    </div>
  );
};

export default MediaCaption;
