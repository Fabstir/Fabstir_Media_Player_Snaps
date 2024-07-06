import React from 'react';
import { PlayIcon } from 'heroiconsv2/24/solid';

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
const MediaCaption = ({ nft, setIsPlayClicked, nftQuantity }) => {
  function handlePlay() {
    setIsPlayClicked(true);
  }

  return (
    <>
      <div
        className="absolute inset-0"
        style={{ boxShadow: '0 0 25px 25px rgba(0, 0, 0, 0.5)' }}
      ></div>
      <div className="p-2">
        <h2 className="mb-2 mt-1 text-sm font-bold @md:text-base @lg:text-lg @xl:text-xl @2xl:text-2xl">
          {nft?.title || nft?.name}
        </h2>

        {setIsPlayClicked && (
          <button
            onClick={() => {
              console.log('MediaCaption: Button was clicked');
              handlePlay();
            }}
            className="h-10 w-10 transform transition-transform hover:scale-110"
          >
            <PlayIcon />
          </button>
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
    </>
  );
};

export default MediaCaption;
