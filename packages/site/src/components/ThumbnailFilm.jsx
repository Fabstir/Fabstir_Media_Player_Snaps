import React from 'react';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { forwardRef } from 'react';
import { useRecoilState } from 'recoil';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';

/**
 * A utility function to concatenate class names.
 * @param {...string} classes - The class names to concatenate.
 * @returns {string} - The concatenated class names.
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * ThumbnailFilm component renders a thumbnail view of a video NFT.
 * It receives the NFT metadata, poster image, styles, and handlers as props, uses the useRecoilState hook to store the current NFT metadata,
 * and renders the thumbnail view with the NFT poster image, title, overview, and release date.
 * It also renders the add/remove buttons if the handlers are provided.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.nft - The NFT metadata.
 * @param {string} props.posterImage - The URL of the poster image.
 * @param {string} props.twTitleStyle - Tailwind CSS style for the title.
 * @param {string} props.twTextStyle - Tailwind CSS style for the text.
 * @param {Function} props.handleSubmit_AddEntityToList - Function to handle adding entity to the list.
 * @param {Function} props.handleSubmit_RemoveEntityFromList - Function to handle removing entity from the list.
 * @param {React.Ref} ref - The ref passed to the component.
 * @returns {React.Element} The rendered ThumbnailFilm component.
 */
const ThumbnailFilm = forwardRef(
  (
    {
      nft,
      posterImage,
      twTitleStyle,
      twTextStyle,
      handleSubmit_AddEntityToList,
      handleSubmit_RemoveEntityFromList,
    },
    ref,
  ) => {
    /**
     * State to hold the current NFT metadata.
     * @type {[Object, Function]}
     */
    const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

    return (
      <div ref={ref} className="group transform cursor-pointer p-2">
        <div className="shadow-lg shadow-fabstir-dark-purple md:shadow-lg lg:shadow-xl xl:shadow-xl 2xl:shadow-xl 3xl:shadow-2xl">
          <Image
            layout="responsive"
            src={
              posterImage ? posterImage : nft.posterImage ? nft.posterImage : ''
            }
            alt=""
            height={480}
            width={320}
            onClick={(e) => {
              e.preventDefault();
              console.log('ThumbnailFilm: onClick nft = ', nft);
              if (nft.address) {
                setCurrentNFT(nft);
              }
            }}
          />

          {handleSubmit_AddEntityToList && (
            <div
              onClick={(e) => {
                e.preventDefault();
                handleSubmit_AddEntityToList(nft);
              }}
              className="absolute left-1/2 top-1/2 z-10 flex w-fit -translate-x-1/2 -translate-y-1/2 rounded-full border-none bg-fabstir-gray bg-opacity-75 font-semibold text-fabstir-light-gray opacity-0 duration-300 group-hover:opacity-100"
            >
              <PlusIcon
                className="h-8 w-8 font-bold text-fabstir-light-gray lg:h-10 lg:w-10"
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
                className="h-6 w-6 font-bold text-fabstir-light-gray lg:h-8 lg:w-8"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        <div className="">
          <h2
            className={classNames(
              'mt-1 text-fabstir-dark-gray transition-all duration-100 ease-in-out group-hover:font-bold',
              twTitleStyle,
            )}
          >
            {nft.address ? nft.name : nft.title || nft.original_name}
          </h2>
          <div className={classNames('mt-1 line-clamp-3', twTextStyle)}>
            {nft.overview || nft.summary}
          </div>
          <div className="item-center text-xs opacity-0 group-hover:opacity-100 sm:justify-between md:text-xs lg:text-sm xl:text-lg 2xl:text-lg 3xl:text-xl">
            {/* {nft.media_type && `${nft.media_type} •`}{' '} */}
            <div
              className={classNames(
                'flex flex-row justify-between sm:mt-1 lg:mt-0',
                twTextStyle,
              )}
            >
              <span>{nft.release_date || nft.first_air_date}</span>
              {nft.vote_count && <span>votes {nft.vote_count}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ThumbnailFilm;
