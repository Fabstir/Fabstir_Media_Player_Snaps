import React, { useState } from 'react';
import UserNFTsSection from '../../src/components/UserNFTsSection';
import { useRecoilState, useRecoilValue } from 'recoil';
import DetailsSidebar from '../../src/components/DetailsSidebar';
import { currentnftmetadata } from '../../src/atoms/nftMetaDataAtom';
import { loadState } from '../../src/utils';

const twTitleStyle =
  'text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md';
const twTextStyle =
  'text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md';
const twUserTitleStyle =
  'text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md';

const userViewStyle = 'relative mx-auto w-20 text-xs';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserNFTs() {
  const [nftAddresseObjects, setNFTAddresseObjects] = useState();

  (async () => {
    const state = await loadState();
    setNFTAddresseObjects(state.addresses);
  })();

  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  return (
    <>
      <div className="grid grid-cols-2">
        <div className="flex flex-1 flex-col items-stretch overflow-hidden overflow-y-auto rounded-sm">
          <UserNFTsSection
            nftAddresseObjects={nftAddresseObjects}
            twStyle="grid grid-cols-8 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-5 md:gap-x-5 lg:grid-cols-6 xl:gap-x-5 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-x-5 3xl:grid-cols-8"
            twTitleStyle="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-lg 2xl:text-lg"
            twTextStyle="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md"
          />
        </div>
        <div className="mx-auto xl:w-1/2">
          <DetailsSidebar currentNFT={currentNFT} />
        </div>
      </div>
    </>
  );
}
