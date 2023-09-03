import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { currentnftmetadata } from '../atoms/nftMetaDataAtom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Renders a thumbnail view of an art NFT.
 * Receives the NFT metadata, image, styles, and handlers as props.
 * Uses the useRecoilState hook to store the current NFT metadata.
 * Renders the thumbnail view with the NFT image, title, and summary.
 * Renders the add/remove buttons if the handlers are provided.
 */
export default function ThumbnailArt({
  nft,
  nftImage,
  twTitleStyle,
  twTextStyle,
  handleSubmit_AddEntityToList,
  handleSubmit_RemoveEntityFromList,
}) {
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  // Render the thumbnail view with the NFT image, title, and summary
  return (
    <div className="w-full">
      <div
        onClick={async () => {
          setCurrentNFT(nft);
        }}
        className={classNames(
          nft?.current
            ? 'ring-2 ring-indigo-500 ring-offset-2'
            : 'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100',
          'group aspect-h-7 aspect-w-10 block overflow-hidden rounded-lg bg-fabstir-dark-gray shadow-md shadow-fabstir-black/50',
        )}
      >
        <button type="button" className="absolute inset-0 focus:outline-none">
          <img src={nftImage} alt="" crossOrigin="anonymous" />

          {handleSubmit_AddEntityToList && (
            <div
              onClick={(e) => {
                e.preventDefault();
                handleSubmit_AddEntityToList(nft);
              }}
              className="absolute left-1/2 top-1/2 z-10 flex w-fit -translate-x-1/2 -translate-y-1/2 rounded-full border-none bg-fabstir-gray bg-opacity-75 font-semibold text-fabstir-light-gray opacity-0 duration-300 group-hover:opacity-100"
            >
              <PlusIcon
                className="h-8 w-8 font-bold text-fabstir-white lg:h-10 lg:w-10"
                aria-hidden="true"
              />
            </div>
          )}
          {handleSubmit_RemoveEntityFromList && (
            <div
              onClick={(e) => {
                e.preventDefault();
                handleSubmit_RemoveEntityFromList(nft);
              }}
              className="absolute left-1/2 top-1/2 z-10 flex w-fit -translate-x-1/2 -translate-y-1/2 rounded-full border-none bg-fabstir-gray bg-opacity-75 font-semibold text-fabstir-light-gray opacity-0 duration-300 group-hover:opacity-100"
            >
              <MinusIcon
                className="h-6 w-6 font-bold text-fabstir-white lg:h-8 lg:w-8"
                aria-hidden="true"
              />
            </div>
          )}

          <span className="sr-only">View details for {nft.name}</span>
        </button>
      </div>
      <div className="text-left">
        <p
          className={classNames(
            'pointer-events-none mt-2 block truncate font-medium text-fabstir-light-gray',
            twTitleStyle,
          )}
        >
          {nft.name}
        </p>
        <p
          className={classNames(
            'pointer-events-none block font-medium text-gray-500 line-clamp-2',
            twTextStyle,
          )}
        >
          {nft?.summary}
        </p>
      </div>
    </div>
  );
}
