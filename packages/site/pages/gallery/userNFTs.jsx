import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';
import { getNFTAddressId } from '../../src/utils/nftUtils';

const UserNFTsSection = dynamic(
  () => import('../../src/components/UserNFTsSection'),
  { ssr: false }, // This will make the component only render on the client side
);

// import UserNFTsSection from '../../src/components/UserNFTsSection';
import { useRecoilState, useRecoilValue } from 'recoil';

const DetailsSidebar = dynamic(
  () => import('../../src/components/DetailsSidebar'),
  { ssr: false }, // This will make the component only render on the client side
);

import { currentnftmetadata } from '../../src/atoms/nftSlideOverAtom';

const NFTSlideOver = dynamic(
  () => import('../../src/components/NFTSlideOver'),
  { ssr: false }, // This will make the component only render on the client side
);

import { nftslideoverstate } from '../../src/atoms/nftSlideOverAtom';
import { isbadgesviewclosedatomstate } from '../../src/atoms/userPageAtom';
import UserBadgesSection from '../../src/components/UserBadgesSection';
import UserBadgesToTakeSection from '../../src/components/UserBadgesToTakeSection';
import UserBadgesRequestedSection from '../../src/components/UserBadgesRequestedSection';
import UserBadgesToGiveSection from '../../src/components/UserBadgesToGiveSection';
import { userpubstate } from '../../src/atoms/userAtom';
import { userauthpubstate } from '../../src/atoms/userAuthAtom';
import useUserProfile from '../../src/hooks/useUserProfile';
import useMintBadge from '../../src/blockchain/useMintBadge';

import {
  badgecreateslideoverstate,
  badgeslideoverstate,
  badgetoburnslideoverstate,
  badgetogiveforaccountslideoverstate,
  badgetogiveslideoverstate,
  badgetogivetonftslideoverstate,
  badgetorequestfornftslideoverstate,
  badgetorequestslideoverstate,
  badgetotakeslideoverstate,
} from '../../src/atoms/badgeDetailsSlideOverFunctions';
import {
  currentbadgerequestedslideovertate,
  currentbadgerequestingstate,
} from '../../src/atoms/badgeRequestSelectSlideOverAtom';
import BadgeSlideOver from '../../src/components/BadgeSlideOver';
import BadgeDetailsSlideOver from '../../src/components/BadgeDetailsSlideOver';
import useCreateBadgeToTake from '../../src/hooks/useCreateBadgeToTake';
import useSendBadge from '../../src/hooks/useSendBadge';
import { userpubbadgegivestate } from '../../src/atoms/userBadgeGiveAtom';
import useCreateBadgeRequest from '../../src/hooks/useCreateBadgeRequest';
import { userpubbadgerequeststate } from '../../src/atoms/userBadgeRequestAtomjs';
import useCreateBadge from '../../src/hooks/useCreateBadge';
import useDeleteBadge from '../../src/hooks/useDeleteBadge';
import useCreateBadgeRequested from '../../src/hooks/useCreateBadgeRequested';
import useCreateBadgeRequestedCompleted from '../../src/hooks/useCreateBadgeRequestedCompleted';
import TransferNFT from '../../src/components/TransferNFT';
import { transfernftslideoverstate } from '../../src/atoms/transferNFTOverAtom';

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
 * UserNFTs component to display user's NFTs and details.
 * @component
 * @returns {React.Element} The UserNFTs component.
 */
export default function UserNFTs() {
  /**
   * State to control the visibility of the NFT slide over component.
   * @type {[boolean, Function]}
   */
  const userAuthPub = useRecoilValue(userauthpubstate);
  const userPub = useRecoilValue(userpubstate);

  const [getUserProfile] = useUserProfile();
  const {
    minterOf,
    clearBadgesToTakeCache,
    getSignature,
    giveBadge,
    takeBadge,
    revokeBadge,
    unequip,
    getNextTokenId,
  } = useMintBadge();

  const [handleGiveBadgeToNFTText, setHandleGiveBadgeToNFTText] =
    useState('Give for NFT');

  const [handleGiveBadgeForAccountText, setHandleGiveBadgeForAccountText] =
    useState('Give to User or NFT');

  const [handleGiveBadgeText, setHandleGiveBadgeText] = useState('Give');

  const [handleRequestBadgeText, setHandleRequestBadgeText] =
    useState('Request');

  const [handleRequestBadgeForNFTText, setHandleRequestBadgeForNFTText] =
    useState('Request for NFT');

  const [handleRequestedBadgeText, setHandleRequestedBadgeText] =
    useState('Give');

  const [handleDeleteRequestedBadgeText, setHandleDeleteRequestedBadgeText] =
    useState('Delete');

  const [openBadge, setOpenBadge] = useRecoilState(badgeslideoverstate);
  const [openBadgeCreate, setOpenBadgeCreate] = useRecoilState(
    badgecreateslideoverstate,
  );

  const [openBadgeToGive, setOpenBadgeToGive] = useRecoilState(
    badgetogiveslideoverstate,
  );

  const [openBadgeToGiveToNFT, setOpenBadgeToGiveToNFT] = useRecoilState(
    badgetogivetonftslideoverstate,
  );

  const [openBadgeToGiveForAccount, setOpenBadgeToGiveForAccount] =
    useRecoilState(badgetogiveforaccountslideoverstate);

  const [openBadgeRequest, setOpenBadgeRequest] = useRecoilState(
    badgetorequestslideoverstate,
  );

  const [openBadgeRequestForNFT, setOpenBadgeRequestForNFT] = useRecoilState(
    badgetorequestfornftslideoverstate,
  );

  const [openBadgeToTake, setOpenBadgeToTake] = useRecoilState(
    badgetotakeslideoverstate,
  );

  const [openBadgeToBurn, setOpenBadgeToBurn] = useRecoilState(
    badgetoburnslideoverstate,
  );

  const [openBadgeRequested, setOpenBadgeRequested] = useRecoilState(
    currentbadgerequestedslideovertate,
  );

  const [rerenderBadges, setRerenderBadges] = useState(0);
  const [rerenderBadgesToTake, setRerenderBadgesToTake] = useState(0);
  const [rerenderBadgesRequested, setRerenderBadgesRequested] = useState(0);
  const [rerenderBadgesToGive, setRerenderBadgesToGive] = useState(0);

  /**
   * State to hold the current NFT metadata.
   * @type {[Object, Function]}
   */
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);
  const [isBadgesViewClosed, setIsBadgesViewClosed] = useRecoilState(
    isbadgesviewclosedatomstate,
  );

  const [userPubGive, setUserPubGive] = useRecoilState(userpubbadgegivestate);
  const [userPubRequest, setUserPubRequest] = useRecoilState(
    userpubbadgerequeststate,
  );

  const [openNFT, setOpenNFT] = useRecoilState(nftslideoverstate);
  const [submitText, setSubmitText] = useState('Create NFT');

  const [isPlayClicked, setIsPlayClicked] = useState(false);
  const [rerenderUserNFTs, setRerenderUserNFTs] = useState(0);

  const [openTransferNFTSliderOver, setOpenTransferNFTSliderOver] =
    useRecoilState(transfernftslideoverstate);

  const { mutate: createBadge, ...createBadgeInfo } = useCreateBadge();
  const { mutate: deleteBadge, ...deleteBadgeInfo } =
    useDeleteBadge(userAuthPub);

  const { mutate: createBadgeToTake, ...createBadgeToTakeInfo } =
    useCreateBadgeToTake();

  const { createUri } = useSendBadge();

  /////////////////////////////////////////////////////////

  const handleGiveBadgeToNFT = useCallback(
    async (badge, nft) => {
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (
        minter === ethers.constants.AddressZero ||
        (userAuthProfile.accountAddress === minter && badge.from === minter)
      ) {
        setHandleGiveBadgeToNFTText('Giving...');
        const userAuthPubProfile = await getUserProfile(userAuthPub);

        const uri = await createUri(badge);

        const newBadge = { ...badge, uri };
        const signature = await getSignature(userPub, newBadge, newBadge.giver);

        console.log('BadgeDropdown: newBadge = ', newBadge);

        await createBadgeToTake({
          ...newBadge,
          signature,
          nftAddress: nft.address,
          nftOwner: nft.creator,
          nftTokenId: nft.id,
        });
        setHandleGiveBadgeToNFTText('Given!');
      } else {
        setHandleGiveBadgeToNFTText('Error!');
      }

      setCurrentBadgeRequesting(null);
      setUserPubRequest(null);

      setOpenBadgeToGiveToNFT(false);
    },
    [
      createBadgeToTake,
      createUri,
      getSignature,
      getUserProfile,
      minterOf,
      setOpenBadgeToGiveToNFT,
      userAuthPub,
      userPub,
    ],
  );

  const handleGiveBadge = useCallback(
    async (badge, nft) => {
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (
        minter === ethers.constants.AddressZero ||
        (userAuthProfile.accountAddress === minter && badge.from === minter)
      ) {
        setHandleGiveBadgeText('Giving...');
        //        const userAuthPubProfile = await getUserProfile(userAuthPub)
        const uri = await createUri(badge);

        const newBadge = { ...badge, uri };
        const signature = await getSignature(userPub, newBadge, newBadge.giver);

        console.log('BadgeDropdown: newBadge = ', newBadge);

        createBadgeToTake({
          ...newBadge,
          signature,
        });
        setHandleGiveBadgeText('Given!');
      } else {
        setHandleGiveBadgeText('Error!');
      }
      setOpenBadgeToGiveForAccount(false);
      setUserPubGive(null);
    },
    [
      createBadgeToTake,
      createUri,
      getSignature,
      getUserProfile,
      minterOf,
      setOpenBadgeToGiveForAccount,
      userAuthPub,
      userPub,
    ],
  );

  const [currentBadgeRequesting, setCurrentBadgeRequesting] = useRecoilState(
    currentbadgerequestingstate,
  );

  const handleGiveBadgeForAccount = useCallback(
    async (badge) => {
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (
        minter === ethers.constants.AddressZero ||
        userAuthProfile.accountAddress === minter
      ) {
        setUserPubGive(userPub);
        setCurrentBadgeRequesting(badge);
        setHandleGiveBadgeForAccountText('Give Pending....');
      }
      setOpenBadgeToGive(false);
      alert('Choose User or NFT');
    },
    [
      getUserProfile,
      minterOf,
      setCurrentBadgeRequesting,
      setOpenBadgeToGive,
      setUserPubGive,
      userAuthPub,
      userPub,
    ],
  );

  const { mutate: createBadgeRequest, ...createBadgeRequestInfo } =
    useCreateBadgeRequest();

  const handleRequestBadge = useCallback(
    async (badge, nft) => {
      console.log('userNFTs: handleRequestBadge inside');
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (userAuthProfile.accountAddress !== minter) {
        const uri = await createUri(badge);

        let newBadge = { ...badge, uri };
        const signature = await getSignature(
          newBadge.giver,
          newBadge,
          userAuthPub,
        );

        console.log('BadgeDropdown: newBadge = ', newBadge);

        if (nft)
          newBadge = {
            ...newBadge,
            signature,
            to: userAuthProfile.accountAddress,
            taker: userAuthPub,
            nftAddress: nft.address,
            nftOwner: nft.creator,
            nftTokenId: nft.id,
          };
        else
          newBadge = {
            ...newBadge,
            signature,
            to: userAuthProfile.accountAddress,
            taker: userAuthPub,
          };

        await createBadgeRequest(newBadge);
        console.log(
          'userNFTs: handleRequestBadge createBadgeRequest newBadge = ',
          newBadge,
        );
      }

      setCurrentBadgeRequesting(null);
      setUserPubRequest(null);
      console.log('userNFTs: handleRequestBadge exit');
    },
    [
      createBadgeRequest,
      createUri,
      getSignature,
      getUserProfile,
      minterOf,
      setCurrentBadgeRequesting,
      setUserPubRequest,
      userAuthPub,
      userPub,
    ],
  );

  async function handleRequestBadgeForAccount(badge, nft) {
    setHandleRequestBadgeText('Requesting...');

    await handleRequestBadge(badge, null);

    setHandleRequestBadgeText('Requested!');
    setOpenBadgeToGive(false);
  }

  const handleRequestBadgeForNFT = useCallback(
    async (badge) => {
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (userAuthProfile.accountAddress !== minter) {
        setUserPubRequest(userPub);
        setCurrentBadgeRequesting(badge);
        setHandleRequestBadgeForNFTText('Request Pending....');
      }
      setOpenBadgeToGive(false);
      alert('Choose NFT');
    },
    [
      getUserProfile,
      minterOf,
      setCurrentBadgeRequesting,
      setOpenBadgeToGive,
      setUserPubRequest,
      userAuthPub,
      userPub,
    ],
  );

  useEffect(() => {
    if (createBadgeToTakeInfo.isError) setHandleGiveBadgeToNFTText('Error!');
  }, [createBadgeToTakeInfo.isError]);

  const [handleTakeBadgeText, setHandleTakeBadgeText] = useState('Take');

  const handleTakeBadge = useCallback(
    async (badge, nft) => {
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (userAuthProfile.accountAddress === minter) {
        setHandleTakeBadgeText('Revoking...');

        try {
          await revokeBadge(userAuthPub, userPub, badge); // ensure that badge can no longer be taken
          //      deleteBadge(badge)
          setHandleTakeBadgeText('Revoked!');
        } catch (err) {
          alert(err.message);
          setHandleTakeBadgeText('Revoke');
        }
      } else {
        setHandleTakeBadgeText('Taking...');
        console.log('fetchBadges: before takeBadge');

        try {
          const newTokenId = await takeBadge(badge);
          if (!newTokenId) return;

          //        const tokenId = await getNextTokenId(badge)
          const newBadge = {
            ...badge,
            tokenId: newTokenId.toString(),
            taker: userAuthPub,
          };
          console.log('fetchBadges: before createBadge');
          createBadge(newBadge);

          clearBadgesToTakeCache(userAuthPub);

          console.log('fetchBadges: after createBadge');

          //    createBadge(badge) // JAB 20220716 fudge to allow React to run fetchBadges

          setHandleTakeBadgeText('Taken!');

          //        console.log('fetchBadges: tokenId = ', tokenId)
          console.log('fetchBadges: newTokenId = ', newTokenId);
        } catch (err) {
          alert(err.message);
          setHandleTakeBadgeText('Take');
        }
      }
      setOpenBadgeToTake(false);
    },
    [
      createBadge,
      //      getNextTokenId,
      getUserProfile,
      minterOf,
      revokeBadge,
      setOpenBadgeToTake,
      takeBadge,
      userAuthPub,
      userPub,
    ],
  );

  useEffect(() => {
    if (createBadgeInfo.isError) setHandleTakeBadgeText('Error!');
  }, [createBadgeInfo.isError]);

  const [handleBurnBadgeText, setHandleBurnBadgeText] = useState('Burn');

  const handleBurnBadge = useCallback(
    async (badge, nft) => {
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (userAuthProfile.accountAddress === minter)
        setHandleBurnBadgeText('Revoking...');
      else setHandleBurnBadgeText('Burning...');

      try {
        await unequip(userAuthPub, badge);
        await deleteBadge(badge);

        if (userAuthProfile.accountAddress === minter)
          setHandleBurnBadgeText('Revoked!');
        else setHandleBurnBadgeText('Burnt!');

        setOpenBadgeToBurn(false);
      } catch (err) {
        alert(err.message);

        if (userAuthProfile.accountAddress === minter)
          setHandleBurnBadgeText('Revoke');
        else setHandleBurnBadgeText('Burn');
      }
    },
    [
      deleteBadge,
      getUserProfile,
      minterOf,
      setOpenBadgeToBurn,
      unequip,
      userAuthPub,
    ],
  );

  useEffect(() => {
    if (deleteBadgeInfo.isError) setHandleBurnBadgeText('Error!');
  }, [deleteBadgeInfo.isError]);

  const handleBadgeOnClick = useCallback(
    async (badge) => {
      if (userPub !== userAuthPub) {
        const minter = await minterOf(badge);
        const userAuthProfile = await getUserProfile(userAuthPub);

        if (userAuthProfile.accountAddress === minter)
          setHandleBurnBadgeText('Revoke');
        else setHandleBurnBadgeText('Burn');
      }
    },
    [getUserProfile, minterOf, userAuthPub, userPub],
  );

  async function handleTakeBadgeOnClick(badge) {
    if (userPub !== userAuthPub) {
      const minter = await minterOf(badge);
      const userAuthProfile = await getUserProfile(userAuthPub);

      if (userAuthProfile.accountAddress === minter)
        setHandleTakeBadgeText('Revoke');
      else setHandleTakeBadgeText('Burn');
    }
  }

  const { mutate: createBadgeRequested, ...createBadgeRequestedInfo } =
    useCreateBadgeRequested();
  const {
    mutate: createBadgeRequestedCompleted,
    ...createBadgeRequestedCompletedInfo
  } = useCreateBadgeRequestedCompleted();

  const handleRequestedBadge = useCallback(
    async (badge) => {
      if (userPub === userAuthPub) {
        const minter = await minterOf(badge);
        const userAuthProfile = await getUserProfile(userAuthPub);

        if (
          minter === ethers.constants.AddressZero ||
          userAuthProfile.accountAddress === minter
        ) {
          setHandleRequestedBadgeText('Giving...');
          const tokenId = await getNextTokenId(badge);

          const newBadge = {
            ...badge,
            tokenId: tokenId.toString(),
          };

          console.log('fetchBadges: before createBadgeRequested');
          createBadgeRequested(newBadge);
          console.log('fetchBadges: after createBadgeRequested');

          createBadgeRequestedCompleted(newBadge);

          //    createBadge(badge) // JAB 20220716 fudge to allow React to run fetchBadges
          try {
            setHandleRequestedBadgeText('Given!');
          } catch (err) {
            alert(err.message);
            setHandleRequestedBadgeText('Give');
          }
        }
      }
      setOpenBadgeRequested(false);
    },
    [
      createBadgeRequested,
      createBadgeRequestedCompleted,
      getNextTokenId,
      getUserProfile,
      giveBadge,
      minterOf,
      setOpenBadgeRequested,
      userAuthPub,
      userPub,
    ],
  );

  const handleDeleteRequestedBadge = useCallback(
    async (badge) => {
      if (userPub === userAuthPub) {
        const minter = await minterOf(badge);
        const userAuthProfile = await getUserProfile(userAuthPub);

        if (
          minter === ethers.constants.AddressZero ||
          userAuthProfile.accountAddress === minter
        ) {
          setHandleRequestedBadgeText('Deleting...');
          createBadgeRequestedCompleted(badge);

          setHandleRequestedBadgeText('Deleted!');
        }
      }
      setOpenBadgeRequested(false);
    },
    [
      getUserProfile,
      minterOf,
      userAuthPub,
      userPub,
      createBadgeRequestedCompleted,
      setHandleRequestedBadgeText,
      setOpenBadgeRequested,
    ],
  );

  const handleBadgeRequestedOnClick = useCallback(
    async (badge) => {
      if (userPub === userAuthPub) {
        const minter = await minterOf(badge);
        const userAuthProfile = await getUserProfile(userAuthPub);

        if (
          minter === ethers.constants.AddressZero ||
          userAuthProfile.accountAddress === minter
        ) {
          setHandleRequestedBadgeText('Give');
        } else setHandleRequestedBadgeText('');
      } else setHandleRequestedBadgeText('');
    },
    [getUserProfile, minterOf, userAuthPub, userPub],
  );

  return (
    <>
      <div className="grid grid-cols-2 p-4 bg-background dark:bg-background">
        <div className="flex flex-1 flex-col items-stretch overflow-hidden overflow-y-auto rounded-sm">
          {!isBadgesViewClosed && (
            <UserBadgesSection
              theTitle="My Contracts/Certificates"
              userPub={userPub}
              twStyle="grid grid-cols-4 gap-x-1 gap-y-10 sm:grid-cols-4 sm:gap-x-3 md:grid-cols-6 md:gap-x-5 lg:grid-cols-7 xl:gap-x-5 xl:grid-cols-6 2xl:grid-cols-7 2xl:gap-x-5 3xl:grid-cols-9"
              twTitleStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              twTextStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              handleBadgeOnClick={handleBadgeOnClick}
              key={rerenderBadges}
            />
          )}

          {!isBadgesViewClosed && (
            <UserBadgesToTakeSection
              theTitle="My Contracts/Certificates to Take"
              userPub={userPub}
              twStyle="grid grid-cols-4 gap-x-1 gap-y-10 sm:grid-cols-4 sm:gap-x-3 md:grid-cols-6 md:gap-x-5 lg:grid-cols-7 xl:gap-x-5 xl:grid-cols-6 2xl:grid-cols-7 2xl:gap-x-5 3xl:grid-cols-9"
              twTitleStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              twTextStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              handleBadgeOnClick={handleTakeBadgeOnClick}
              key={rerenderBadgesToTake}
            />
          )}

          {!isBadgesViewClosed && (
            <UserBadgesRequestedSection
              theTitle="Contracts/Certificates Requested"
              userPub={userPub}
              twStyle="grid grid-cols-4 gap-x-1 gap-y-10 sm:grid-cols-4 sm:gap-x-3 md:grid-cols-6 md:gap-x-5 lg:grid-cols-7 xl:gap-x-5 xl:grid-cols-6 2xl:grid-cols-7 2xl:gap-x-5 3xl:grid-cols-9"
              twTitleStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              twTextStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              handleBadgeOnClick={handleBadgeRequestedOnClick}
              key={rerenderBadgesRequested}
            />
          )}

          {!isBadgesViewClosed && (
            <UserBadgesToGiveSection
              theTitle="Contracts/Certificates"
              userPub={userPub}
              twStyle="grid grid-cols-4 gap-x-1 gap-y-10 sm:grid-cols-4 sm:gap-x-3 md:grid-cols-6 md:gap-x-5 lg:grid-cols-7 xl:gap-x-5 xl:grid-cols-6 2xl:grid-cols-7 2xl:gap-x-5 3xl:grid-cols-9"
              twTitleStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              twTextStyle="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-xs 3xl:text-sm"
              openBadge={openBadgeCreate}
              setOpenBadge={setOpenBadgeCreate}
              key={rerenderBadgesToGive}
            />
          )}
          <UserNFTsSection
            // key={currentNFT}
            theTitle="My NFTs"
            twStyle="grid sm:grid-cols-2 sm:gap-x-2 md:grid-cols-3 md:gap-x-3 lg:grid-cols-4 xl:gap-x-3 xl:grid-cols-5 2xl:grid-cols-6 2xl:gap-x-4 3xl:grid-cols-7 ml-2"
            twTitleStyle="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-lg 2xl:text-lg"
            twTextStyle="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-md"
          />
        </div>
        <div className="mx-auto w-full">
          <DetailsSidebar
            isPlayClicked={isPlayClicked}
            setIsPlayClicked={setIsPlayClicked}
          />
        </div>

        <BadgeDetailsSlideOver
          open={openBadgeToGiveForAccount}
          setOpen={setOpenBadgeToGiveForAccount}
          badgeDetailsFunction1={handleGiveBadge}
          badgeDetailsFunction1Name={handleGiveBadgeText}
          width1="max-w-lg"
          isFileDrop={true}
        />
        <BadgeDetailsSlideOver
          open={openBadgeToGiveToNFT}
          setOpen={setOpenBadgeToGiveToNFT}
          badgeDetailsFunction1={handleGiveBadgeToNFT}
          badgeDetailsFunction1Name={handleGiveBadgeToNFTText}
          width1="max-w-lg"
          setRerender1={setRerenderBadges}
          setRerender2={setRerenderBadgesToTake}
          isFileDrop={true}
        />
        <BadgeDetailsSlideOver
          open={openBadgeRequest}
          setOpen={setOpenBadgeRequest}
          badgeDetailsFunction1={handleRequestBadge}
          badgeDetailsFunction1Name={handleRequestBadgeText}
          width1="max-w-lg"
          setRerender1={rerenderBadgesToGive}
          setRerender2={rerenderBadgesRequested}
        />
        {userAuthPub !== userPub && (
          <BadgeDetailsSlideOver
            open={openBadgeToGive}
            setOpen={setOpenBadgeToGive}
            width1="max-w-lg"
            badgeDetailsFunction1={handleRequestBadgeForAccount}
            badgeDetailsFunction1Name={handleRequestBadgeText}
            badgeDetailsFunction2={handleRequestBadgeForNFT}
            badgeDetailsFunction2Name={handleRequestBadgeForNFTText}
            setRerender1={setRerenderBadgesToGive}
            setRerender2={setRerenderBadgesRequested}
          />
        )}
        {userAuthPub === userPub && (
          <BadgeDetailsSlideOver
            open={openBadgeToGive}
            setOpen={setOpenBadgeToGive}
            width1="max-w-lg"
            badgeDetailsFunction1={handleGiveBadgeForAccount}
            badgeDetailsFunction1Name={handleGiveBadgeForAccountText}
            setRerender1={setRerenderBadgesToTake}
          />
        )}
        <BadgeDetailsSlideOver
          open={openBadgeRequested}
          setOpen={setOpenBadgeRequested}
          badgeDetailsFunction1={handleRequestedBadge}
          badgeDetailsFunction1Name={handleRequestedBadgeText}
          badgeDetailsFunction2={handleDeleteRequestedBadge}
          badgeDetailsFunction2Name={handleDeleteRequestedBadgeText}
          setRerender1={setRerenderBadges}
          setRerender2={setRerenderBadgesRequested}
          width1="max-w-lg"
          isFileDrop={true}
        />
        <BadgeDetailsSlideOver
          open={openBadgeToTake}
          setOpen={setOpenBadgeToTake}
          badgeDetailsFunction1={handleTakeBadge}
          badgeDetailsFunction1Name={handleTakeBadgeText}
          setRerender1={setRerenderBadges}
          setRerender2={setRerenderBadgesToTake}
          width1="max-w-lg"
        />
        <BadgeDetailsSlideOver
          open={openBadgeToBurn}
          setOpen={setOpenBadgeToBurn}
          badgeDetailsFunction1={handleBurnBadge}
          badgeDetailsFunction1Name={handleBurnBadgeText}
          badgeDetailsFilterAccountAddresses={true}
          setRerender1={setRerenderBadges}
          setRerender2={setRerenderBadgesToTake}
          width1="max-w-lg"
        />
        <BadgeDetailsSlideOver
          open={openBadge}
          setOpen={setOpenBadge}
          width1="max-w-lg"
        />
      </div>
      <BadgeSlideOver
        open={openBadgeCreate}
        setOpen={setOpenBadgeCreate}
        submitText={submitText}
        setSubmitText={setSubmitText}
        clearOnSubmit
      />
      <NFTSlideOver
        open={openNFT}
        setOpen={setOpenNFT}
        submitText={submitText}
        setSubmitText={setSubmitText}
        clearOnSubmit
        setRerenderUserNFTs={setRerenderUserNFTs}
      />

      {currentNFT && (
        <TransferNFT
          nft={currentNFT}
          open={openTransferNFTSliderOver}
          setOpen={setOpenTransferNFTSliderOver}
          // setRerender={setRerenderDetailsSidebarState}
        />
      )}
    </>
  );
}
