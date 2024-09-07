import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';
import { Button } from '../ui-components/button';

/**
 * A utility function to concatenate class names.
 * @param {...string} classes - The class names to concatenate.
 * @returns {string} - The concatenated class names.
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * ThumbnailArt component renders a thumbnail view of an art NFT.
 * It receives the NFT metadata, image, styles, and handlers as props, uses the useRecoilState hook to store the current NFT metadata,
 * and renders the thumbnail view with the NFT image, title, and summary.
 * It also renders the add/remove buttons if the handlers are provided.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.nft - The NFT metadata.
 * @param {string} props.nftImage - The URL of the NFT image.
 * @param {string} props.twTitleStyle - Tailwind CSS style for the title.
 * @param {string} props.twTextStyle - Tailwind CSS style for the text.
 * @param {Function} props.handleSubmit_AddEntityToList - Function to handle adding entity to the list.
 * @param {Function} props.handleSubmit_RemoveEntityFromList - Function to handle removing entity from the list.
 * @returns {React.Element} The rendered ThumbnailArt component.
 */
export default function ThumbnailArt({
  nft,
  nftImage,
  twTitleStyle,
  twTextStyle,
  handleSubmit_AddEntityToList,
  handleSubmit_RemoveEntityFromList,
}) {
  /**
   * State to hold the current NFT metadata.
   * @type {[Object, Function]}
   */
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

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
          'shadow-md shadow-black/50',
        )}
      >
        <Button
          type="button"
          variant=""
          size="medium"
          className="block h-fit m-0 p-0"
        >
          <img src={nftImage} alt="" crossOrigin="anonymous" />

          {handleSubmit_AddEntityToList && (
            <div
              onClick={(e) => {
                e.preventDefault();
                handleSubmit_AddEntityToList(nft);
              }}
              className="absolute left-1/2 top-1/2 z-10 flex w-fit -translate-x-1/2 -translate-y-1/2 rounded-full border-none bg-gray bg-opacity-75 font-semibold text-light-gray opacity-0 duration-300 group-hover:opacity-100"
            >
              <PlusIcon
                className="h-8 w-8 font-bold text-light-gray lg:h-10 lg:w-10"
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
              className="absolute left-1/2 top-1/2 z-10 flex w-fit -translate-x-1/2 -translate-y-1/2 rounded-full border-none bg-gray bg-opacity-75 font-semibold text-light-gray opacity-0 duration-300 group-hover:opacity-100"
            >
              <MinusIcon
                className="h-6 w-6 font-bold text-light-gray lg:h-8 lg:w-8"
                aria-hidden="true"
              />
            </div>
          )}
        </Button>
      </div>
      <div className="text-left">
        <p
          className={classNames(
            'pointer-events-none mt-2 block truncate font-medium text-light-gray',
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
