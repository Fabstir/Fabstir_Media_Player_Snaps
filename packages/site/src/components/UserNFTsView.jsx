import React, { useState } from 'react';
import UserNFTView from './UserNFTView';
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/solid';
import { useRecoilState } from 'recoil';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom';
import { useRouter } from 'next/router';

/**
 * UserNFTsView component to render the user's NFTs in a gallery view.
 * It receives the user's NFT metadata and styles as props, filters out null NFTs, and renders the UserNFTView component for each NFT.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.nfts - The array of NFT metadata.
 * @param {string} props.twStyle - Tailwind CSS style for the component.
 * @param {string} props.twTitleStyle - Tailwind CSS style for the title.
 * @param {string} props.twTextStyle - Tailwind CSS style for the text.
 * @returns {React.Element} The rendered UserNFTsView component.
 */
export default function UserNFTsView({
  nfts,
  twStyle,
  twTitleStyle,
  twTextStyle,
}) {
  /**
   * State to hold the NFTs.
   * @type {[Array, Function]}
   */
  const router = useRouter();
  const [theNFTs, setTheNfts] = useState();
  const [selectedParentNFTAddressId, setSelectedParentNFTAddressId] =
    useRecoilState(selectedparentnftaddressid);

  function handleBackToRoot() {
    router.push('/');
  }

  function handleUpToParent() {
    setSelectedParentNFTAddressId('');
  }

  return (
    <>
      {selectedParentNFTAddressId ? (
        <button
          className="flex items-center text-gray-500 hover:text-gray-700 mb-10"
          onClick={handleUpToParent}
        >
          <ChevronDoubleLeftIcon className="h-6 w-6 mr-2" />
          Back to parent
        </button>
      ) : (
        <button className="mb-8" onClick={handleBackToRoot}>
          <div className="flex justify-center">
            <ChevronDoubleLeftIcon
              className="h-6 w-6 font-bold text-gray-500 lg:h-8 lg:w-8 pb-2"
              aria-hidden="true"
            />
            Back to Root
          </div>
        </button>
      )}
      <div className={`${twStyle} list-none`}>
        {nfts
          ?.filter((nft) => nft !== null) // Filter out null NFTs
          .map((nft) => (
            <li
              key={nft.name}
              className="mr-4 transform items-center transition duration-100 ease-in hover:scale-105 hover:text-fabstir-light-gray"
            >
              <UserNFTView
                nft={nft}
                twTitleStyle={twTitleStyle}
                twTextStyle={twTextStyle}
              />
            </li>
          ))}
      </div>
    </>
  );
}
