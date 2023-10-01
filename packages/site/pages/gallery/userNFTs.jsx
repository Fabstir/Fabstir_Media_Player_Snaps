import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserNFTsSection from '../../src/components/UserNFTsSection';
import { useRecoilState, useRecoilValue } from 'recoil';
import DetailsSidebar from '../../src/components/DetailsSidebar';
import { currentnftmetadata } from '../../src/atoms/nftMetaDataAtom';
import { loadState } from '../../src/utils';
import NFTSlideOver from '../../src/components/NFTSlideOver';
import { nftslideoverstate } from '../../src/atoms/nftSlideOverAtom';

/**
 * Tailwind CSS style for title text.
 * @type {string}
 */
const twTitleStyle =
  'text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md';

const twTextStyle =
  'text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md';

const twUserTitleStyle =
  'text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md';

const userViewStyle = 'relative mx-auto w-20 text-xs';

/**
 * Utility function to join class names.
 * @param {...string} classes - The class names to join.
 * @returns {string} - The joined class names.
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * UserNFTs component to display user's NFTs and details.
 * @component
 * @returns {React.Element} The UserNFTs component.
 */
export default function UserNFTs() {
  /**
   * State to control the visibility of the NFT slide over component.
   * @type {[boolean, Function]}
   */
  const [openNFT, setOpenNFT] = useRecoilState(nftslideoverstate);

  /**
   * State to hold the submit button text.
   * @type {[string, Function]}
   */
  const [submitText, setSubmitText] = useState('Add NFT');

  /**
   * State to trigger re-rendering of the UserNFTs component.
   * @type {[number, Function]}
   */
  const [rerenderUserNFTs, setRerenderUserNFTs] = useState(0);

  /**
   * State to hold the current NFT metadata.
   * @type {[Object, Function]}
   */
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  const router = useRouter();

  function handleBackToRoot() {
    router.push('/');
  }

  return (
    <>
      <div className="grid grid-cols-2 p-4">
        <div className="flex flex-1 flex-col items-stretch overflow-hidden overflow-y-auto rounded-sm">
          <UserNFTsSection
            theTitle="My NFTs"
            twStyle="grid grid-cols-8 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-5 md:gap-x-5 lg:grid-cols-6 xl:gap-x-5 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-x-5 3xl:grid-cols-8"
            twTitleStyle="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-lg 2xl:text-lg"
            twTextStyle="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md"
          />
        </div>
        <div className="mx-auto xl:w-1/2">
          <DetailsSidebar currentNFT={currentNFT} />
        </div>
      </div>
      <NFTSlideOver
        open={openNFT}
        setOpen={setOpenNFT}
        submitText={submitText}
        setSubmitText={setSubmitText}
        clearOnSubmit
        currentNFT
        setRerenderUserNFTs={setRerenderUserNFTs}
      />
      <button onClick={handleBackToRoot}>Back to Root</button>
    </>
  );
}
