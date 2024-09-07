import React, { useEffect, useState } from 'react';
import usePortal from '../hooks/usePortal';
import ThumbnailArt from './ThumbnailArt';
import ThumbnailFilm from './ThumbnailFilm';
import ThumbnailMusic from './ThumbnailMusic';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { useRecoilState } from 'recoil';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';

const tabs = [
  { name: 'Recently Added', href: '#', current: true },
  { name: 'Most Popular', href: '#', current: false },
  { name: 'Favourited', href: '#', current: false },
];

/**
 * A utility function to concatenate class names.
 * @param {...string} classes - The class names to concatenate.
 * @returns {string} - The concatenated class names.
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * UserNFTView component renders a thumbnail view of the user's NFT.
 * It receives the NFT metadata and styles as props, uses the usePortal hook to fetch the NFT image and poster/backdrop images,
 * and renders the appropriate thumbnail component based on the NFT type.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.nft - The NFT metadata.
 * @param {string} props.twTitleStyle - Tailwind CSS style for the title.
 * @param {string} props.twTextStyle - Tailwind CSS style for the text.
 * @param {Function} props.handleSubmit_AddEntityToList - Function to handle adding entity to the list.
 * @param {Function} props.handleSubmit_RemoveEntityFromList - Function to handle removing entity from the list.
 * @returns {React.Element} The rendered UserNFTView component.
 */
export default function UserNFTView({
  nft,
  twTitleStyle,
  twTextStyle,
  handleSubmit_AddEntityToList,
  handleSubmit_RemoveEntityFromList,
}) {
  console.log('UserNFTView: inside');

  const [selectedParentNFTAddressId, setSelectedParentNFTAddressId] =
    useRecoilState(selectedparentnftaddressid);
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  /**
   * State to hold the NFT image URL.
   * @type {[string, Function]}
   */
  const [nftImage, setNFTImage] = useState();

  /**
   * State to hold the NFT backdrop image URL.
   * @type {[string, Function]}
   */
  const [nftBackDropImage, setNFTBackDropImage] = useState();

  /**
   * State to hold the NFT poster image URL.
   * @type {[string, Function]}
   */
  const [nftPosterImage, setNFTPosterImage] = useState();

  /**
   * Object containing the getBlobUrl function from the usePortal hook.
   * @type {Object}
   */
  const { getBlobUrl } = usePortal();

  useEffect(() => {
    (async () => {
      console.log('test: UserNFTView useEffect');
      //      setCurrentNFT(nft);

      if (nft?.image) {
        console.log('UserNFTView: nft.image = ', nft.image);
        const linkUrl = await getBlobUrl(nft.image);
        console.log('UserNFTView: linkUrl = ', linkUrl);
        setNFTImage(linkUrl);
      }
      if (nft.type === 'video' && nft?.posterImage) {
        const linkUrl = await getBlobUrl(nft.posterImage);
        setNFTPosterImage(linkUrl);
      }
      if (nft.type === 'audio' && nft?.backdropImage) {
        const linkUrl = await getBlobUrl(nft.backdropImage);
        setNFTBackDropImage(linkUrl);
      }
    })();
  }, [nft]);

  function handleDoubleClick() {
    const parentAddressId = `${nft?.parentAddress}_${nft?.parentId}`;
    setSelectedParentNFTAddressId(parentAddressId);
    console.log('UserNFTView: selectedParentNFTAddressId = ', parentAddressId);
  }

  return (
    <div
      className="transform transition duration-100 ease-in hover:scale-115 relative"
      onDoubleClick={handleDoubleClick}
    >
      <div>
        {nft.type === 'video' && nftPosterImage ? (
          <ThumbnailFilm
            nft={nft}
            posterImage={nftPosterImage}
            twTitleStyle={twTitleStyle}
            twTextStyle={twTextStyle}
            handleSubmit_AddEntityToList={handleSubmit_AddEntityToList}
            handleSubmit_RemoveEntityFromList={
              handleSubmit_RemoveEntityFromList
            }
          />
        ) : nft.type === 'audio' && nftBackDropImage ? (
          <ThumbnailMusic
            nft={nft}
            nftImage={nftBackDropImage}
            twTitleStyle={twTitleStyle}
            twTextStyle={twTextStyle}
            handleSubmit_AddEntityToList={handleSubmit_AddEntityToList}
            handleSubmit_RemoveEntityFromList={
              handleSubmit_RemoveEntityFromList
            }
          />
        ) : nft.type !== 'video' && nft.type !== 'audio' && nftImage ? (
          <ThumbnailArt
            nft={nft}
            nftImage={nftImage}
            twTitleStyle={twTitleStyle}
            twTextStyle={twTextStyle}
            handleSubmit_AddEntityToList={handleSubmit_AddEntityToList}
            handleSubmit_RemoveEntityFromList={
              handleSubmit_RemoveEntityFromList
            }
          />
        ) : (
          <></>
        )}
      </div>
      {nft?.isNestable && (
        <div className="absolute -top-8 right-0 p-1">
          <ArrowLongRightIcon className="h-8 w-8 text-dark-gray" />
        </div>
      )}
    </div>
  );
}
