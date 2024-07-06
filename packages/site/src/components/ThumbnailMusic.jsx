import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React from 'react';
import { useRecoilState } from 'recoil';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ThumbnailMusic({
  nft,
  nftImage,
  twTitleStyle,
  twTextStyle,
  handleSubmit_AddEntityToList,
  handleSubmit_RemoveEntityFromList,
}) {
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  return (
    <div className="group transform cursor-pointer p-2">
      <div className="shadow-lg shadow-fabstir-dark-purple md:shadow-lg lg:shadow-xl xl:shadow-xl 2xl:shadow-xl 3xl:shadow-2xl">
        <Image
          layout="responsive"
          src={nftImage}
          alt=""
          height={480}
          width={320}
          onClick={(e) => {
            e.preventDefault();
            console.log('ThumbnailAudio: onClick nft = ', nft);
            if (nft.address) {
              setCurrentNFT(nft);
            }
          }}
        />
        {/* <img src={nftImage} alt="" crossOrigin="anonymous" /> */}
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
        <span className="sr-only">View details for {nft.name}</span>
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
