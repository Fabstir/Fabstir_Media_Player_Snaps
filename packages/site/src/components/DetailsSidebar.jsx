import { ChevronDoubleDownIcon } from '@heroicons/react/24/solid';
import { PencilIcon } from 'heroiconsv2/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { user } from '../user';

import { saveAs } from 'file-saver';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { nftattributesexpandstate } from '../atoms/nftAttrributesExpand';
import {
  nftmetadataexpandstate,
  nftsselectedaschild,
} from '../atoms/nftMetaDataExpand';
import usePortal from '../hooks/usePortal';
import { removeAddress, addAddress, replaceAddress } from '../utils/snapsState';

import NFTAudioJS from './NFTAudioJS';
import NFTFileUrls from './NFTFileUrls';
import NFTVideoJS from './NFTVideoJS';
import useMintNestableNFT from '../blockchain/useMintNestableNFT';
import RenderModel from './RenderModel';
import {
  is3dmodelstate,
  iswasmreadystate,
  refetchnftscountstate,
} from '../atoms/renderStateAtom';
import useEncKey from '../hooks/useEncKey';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { userpubstate } from '../atoms/userAtom';
import useNFTMedia from '../hooks/useNFTMedia';
import MediaCaption from './MediaCaption';
import useMintNFT from '../blockchain/useMintNFT';
import useReplaceNFT from '../hooks/useReplaceNFT';
import {
  constructNFTAddressId,
  getUniqueKeyFromNFT,
  getNFTAddressId,
} from '../utils/nftUtils';
import useDeleteNFT from '../hooks/useDeleteNFT';
import { transfernftslideoverstate } from '../atoms/transferNFTOverAtom';
import useUserProfile from '../hooks/useUserProfile';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';
import { Zero, One } from '@ethersproject/constants';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom';
import { useMintNestableERC1155NFT } from '../blockchain/useMintNestableERC1155NFT';
import NFTAudioLyrics from './NFTAudioLyrics';
import TeamUserView from './TeamUserView';
import { useRouter } from 'next/router';
import {
  isupdateteamsstate,
  teamsstate,
  updatenftwithteamsstate,
  updateteamsstate,
} from '../atoms/teamsAtom';
import { stringifyArrayProperties } from '../utils/stringifyProperties';
import TeamsView from './TeamsView';
import { Button } from '../ui-components/button';
import PlaylistsView from './PlaylistsView';
import {
  isplayclickedstate,
  isplaystate,
  playlistcurrentindexstate,
  playlistnftstate,
} from '../atoms/playlistAtom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const userViewStyle = 'relative mx-auto grid gap-x-4 gap-y-8 grid-cols-6';

/**
 * A utility function to append a field to an object.
 * @param {Object} old - The original object.
 * @param {string} field - The field to append.
 * @param {any} value - The value to set for the field.
 * @returns {Object} - The new object with the appended field.
 */
const appendNFTField = (old, field, value) => ({ ...old, [field]: value });

/**
 * A utility function to decorate NFT information.
 * @param {Object} information - The NFT information to decorate.
 * @returns {Object|null} - The decorated information or null if the input is falsy.
 */
const nftInformationDecorator = (information) => {
  if (!information) return null;

  let output = {};
  Object.keys(information)
    .filter(
      (key) =>
        key !== 'name' &&
        key !== 'symbol' &&
        key !== 'summary' &&
        key !== 'attributes' &&
        key !== 'tokenise' &&
        key !== 'subscriptionPlan' &&
        key !== 'holders' &&
        key !== 'enc_key' &&
        key !== 'teams' &&
        key !== 'playlistNFT' &&
        key !== 'isPreview',
    )
    .forEach((key) => {
      let val;
      if (key === 'created')
        val = new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'full',
          timeStyle: 'long',
        }).format(information[key]);
      else val = information[key];
      output = appendNFTField(output, key, val);
    });

  // Sort the keys of the output object
  const sortedOutput = Object.keys(JSON.parse(JSON.stringify(output).trim()))
    .sort()
    .reduce((acc, key) => {
      acc[key] = output[key];
      return acc;
    }, {});

  console.log('sortedOutput = ', sortedOutput);
  return sortedOutput; // Return the sorted object directly
};

const twStyle = 'ml-8 grid gap-y-6 grid-cols-6 gap-x-5';
const twTitleStyle = 'text-xs';
const twTextStyle = 'invisible';

/**
 * The DetailsSidebar component.
 * @param {Object} props - The props for the component.
 * @param {Object} props.currentNFT - The current NFT.
 * @param {string} props.width1 - The width property.
 * @param {boolean} props.isTheatreMode - The theatre mode state.
 * @param {Function} props.setIsTheatreMode - The setter for the theatre mode state.
 * @param {boolean} props.isScreenViewClosed - The screen view closed state.
 * @param {Function} props.setIsScreenViewClosed - The setter for the screen view closed state.
 * @returns {JSX.Element} - The JSX element.
 */
export default function DetailsSidebar({
  width1,
  isTheatreMode,
  setIsTheatreMode,
  isScreenViewClosed,
  setIsScreenViewClosed,
}) {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const userPub = useRecoilValue(userpubstate);
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  const [nft, setNFT] = useState();
  const [fileUrls, setFileUrls] = useState(null);

  const [is3dModel, setIs3dModel] = useRecoilState(is3dmodelstate);
  const [isWasmReady, setIsWasmReady] = useRecoilState(iswasmreadystate);

  const [openTransferNFTSliderOver, setOpenTransferNFTSliderOver] =
    useRecoilState(transfernftslideoverstate);

  const setRefetchNFTsCount = useSetRecoilState(refetchnftscountstate);

  const [teams, setTeams] = useRecoilState(teamsstate);
  const [isPlayClicked, setIsPlayClicked] = useRecoilState(isplayclickedstate);

  console.log('UserNFTView: inside DetailsSidebar');
  console.log('DetailsSidebar: nft = ', nft);
  console.log('UserNFTs: nft = ', nft);

  const [selectedSubscriptionPlans, setSelectedSubscriptionPlans] = useState(
    [],
  );
  const { getIsERC721, getIsERC1155, getIsERC721Address, getIsERC1155Address } =
    useMintNFT();
  const [getUserProfile] = useUserProfile();

  const [openNFTMetaData, setOpenNFTMetaData] = useRecoilState(
    nftmetadataexpandstate,
  );

  const [openNFTAttributes, setOpenNFTAttributes] = useRecoilState(
    nftattributesexpandstate,
  );

  const nftInfoDecorated = nftInformationDecorator(
    currentNFT ? currentNFT : null,
  );
  console.log('DetailsSidebar: nftInfoDecorated1 = ', nftInfoDecorated);

  const [nftImage, setNFTImage] = useState();
  const { getPortalLinkUrl, getBlobUrl } = usePortal();
  const [modelUris, setModelUris] = useState(null);

  const {
    getChildrenOfNestableNFT,
    addChildToNestableNFT,
    removeChildFromNestableNFT,
    getIsOwnNFT,
  } = useMintNestableNFT();

  const {
    getChildrenOfNestableNFT: getChildrenOfNestableERC1155NFT,
    addChildToNestableNFT: addChildToNestableERC1155NFT,
    removeChildFromNestableNFT: removeChildFromNestableERC1155NFT,
    getIsOwnNFT: getIsOwnERC1155NFT,
    getNFTQuantity,
  } = useMintNestableERC1155NFT();

  const [selectedNFTs, setSelectedNFTs] = useRecoilState(nftsselectedaschild);

  const getEncKey = useEncKey();
  const [isPlay, setIsPlay] = useRecoilState(isplaystate);
  const [nftQuantity, setNFTQuantity] = useState();
  const [encKey, setEncKey] = useState();
  const [mediaMetadata, setMediaMetadata] = useState();

  const { getMetadataFromUser, getMediaResumeState, putMediaResumeState } =
    useNFTMedia();
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [nftToPlay, setNFTToPlay] = useState();
  const { mutate: deleteNFT, ...deleteNFTInfo } = useDeleteNFT(userAuthPub);

  const { upgradeNFTToParent, removeChildNFT, updateNFTToPointToParent } =
    useReplaceNFT();
  const selectedParentNFTAddressId = useRecoilValue(selectedparentnftaddressid);
  const selectedParentNFTType = useRef();

  const [updateNFTWithTeams, setUpdateNFTWithTeams] = useRecoilState(
    updatenftwithteamsstate,
  );
  const [isUpdateTeams, setIsUpdateTeams] = useRecoilState(isupdateteamsstate);
  const [userAuthProfile, setUserAuthProfile] = useState();

  const playlistCurrentIndex = useRef(0);
  const router = useRouter();
  const playlistNFT = useRef(null);

  const twPlaylistStyle =
    'ml-8 grid grid-cols-1 gap-4 auto-rows-max' +
    ' grid-cols-[repeat(auto-fill,minmax(150px,1fr))]';
  const twPlaylistTitleStyle =
    'text-sm sm:text-sm md:text-md lg:text-md xl:text-lg 2xl:text-lg';
  const twPlaylistTextStyle =
    'text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md 2xl:text-md group-hover:scale-110';

  useEffect(() => {
    (async () => {
      if (await getIsERC721Address(selectedParentNFTAddressId)) {
        selectedParentNFTType.current = 'ERC721';
      } else if (await getIsERC1155Address(selectedParentNFTAddressId)) {
        selectedParentNFTType.current = 'ERC1155';
      } else {
        selectedParentNFTType.current = '';
      }
    })();
  }, [selectedParentNFTAddressId]);

  useEffect(() => {
    if (isUpdateTeams && updateNFTWithTeams) {
      console.log('DetailsSidebar: updateNFTWithTeams = ', updateNFTWithTeams);

      const nft = {
        ...updateNFTWithTeams,
        teamsName: teams.teamsName,
        teams: [...(teams.teams || [])],
      };
      setCurrentNFT(nft);
      setNFT(nft);

      const updatedNFT = stringifyArrayProperties(nft);
      const addressId = getUniqueKeyFromNFT(updatedNFT);
      user
        .get('nfts')
        .get(addressId)
        .put(updatedNFT, function (ack) {
          if (ack.err) {
            console.error('DetailsSidebar: Error writing data:', ack.err);
          } else {
            console.log(
              'DetailsSidebar: updatedNFT.address = ',
              updatedNFT.address,
            );
          }
        });

      setUpdateNFTWithTeams(null);
      setIsUpdateTeams(false);
    }
  }, [updateNFTWithTeams, isUpdateTeams]);

  useEffect(() => {
    (async () => {
      console.log('DetailsSidebar: setEncKey inside nft = ', nft);
      if (nft?.address && nft?.id) {
        console.log(
          'DetailsSidebar: setEncKey inside if (nft?.address && nft?.id)',
        );

        const encKey = await getEncKey(userPub, nft);

        const cidWithoutKey = nft.video
          ? nft.video
          : nft.audio
            ? nft.audio
            : null;

        if (cidWithoutKey) {
          const mediaMetadata = await getMetadataFromUser(
            userPub,
            encKey,
            cidWithoutKey,
          );
          setMediaMetadata(mediaMetadata);
          console.log(
            'checkIfUserSubscribedToNFT: mediaMetadata = ',
            mediaMetadata,
          );
        }

        if (userAuthPub === userPub) {
          console.log('DetailsSidebar: setEncKey getEncKey');

          if (!encKey) {
            console.log('DetailsSidebar: setEncKey xx encKey = ', encKey);
            console.log('DetailsSidebar: setEncKey xx nft = ', nft);
          }

          console.log('DetailsSidebar: setEncKey encKey = ', encKey);
          const theEncKey = !encKey && encKey !== null ? null : encKey;
          setEncKey(theEncKey);
          console.log('DetailsSidebar: setEncKey theEncKey = ', theEncKey);
        } else {
          setEncKey(null);
          console.log('DetailsSidebar: setEncKey = null');
        }
      }
    })();
  }, [nft, nft?.address, nft?.id]);

  useEffect(() => {
    console.log('DetailsSidebar: currentNFT = ', currentNFT);
    setNFT(currentNFT);

    if (!isWasmReady) return;

    if (
      nftInfoDecorated &&
      'fileUrls' in nftInfoDecorated &&
      nftInfoDecorated.fileUrls
    ) {
      //      setFileUrls(nftInfoDecorated.fileUrls);

      const renderModels = async () => {
        //        setIs3dModel(false);

        const uris = [];
        for (const [key, value] of Object.entries(nftInfoDecorated.fileUrls)) {
          let [uri, extension] = value.split('.');
          console.log('DetailsSidebar: uri = ', uri);

          extension = extension.split('<')[0];
          console.log('DetailsSidebar: extension = ', extension);

          if (
            extension.toLowerCase() === 'obj' ||
            extension.toLowerCase() === 'gltf'
          ) {
            console.log('DetailsSidebar: value = ', value);
            uris.push(`${uri}.${extension.toLowerCase()}`);
          }
        }

        setModelUris(uris);

        if (uris.length === 0) {
          setIs3dModel(false);
          return;
        }

        setIs3dModel(true);
      };

      renderModels();
    } else {
      setIs3dModel(false);
      setModelUris(null);
    }

    (async () => {})();
  }, [currentNFT, currentNFT?.image, isWasmReady]);

  useEffect(() => {
    if (!nft) return;
    //    setIs3dModel(false);

    console.log('DetailsSidebar: nft.image = ', nft?.image);
    (async () => {
      if (nft?.image) {
        const linkUrl = await getBlobUrl(nft.image);
        setNFTImage(linkUrl);
      }
    })();
  }, [nft]);

  useEffect(() => {
    (async () => {
      if (nft?.address && nft?.id) {
        // if (nft?.isNestable) {
        //   const userProfile = await getUserProfile(userPub);

        //   const isOwnNFT = await getIsOwnNFT(userProfile.accountAddress, {
        //     address: nft.parentAddress,
        //     id: nft.parentId,
        //   });
        //   console.log('DetailsSidebar: isOwnNFT = ', isOwnNFT);
        // }

        const quantity = await getNFTQuantity(userPub, nft); // stop gap until nestable NFT supports ERC-1155
        setNFTQuantity(quantity);
      } else setNFTQuantity(undefined);
    })();
  }, [nft, userPub, selectedParentNFTAddressId]);

  useEffect(() => {
    // if (mediaMetadata && mediaMetadata.length > 0) {

    if (currentNFT?.playlist?.length > 0) {
      playlistNFT.current = currentNFT;
      playlistCurrentIndex.current = 0;

      const playlistChildNFT = currentNFT.playlist[0];
      setNFTToPlay(playlistChildNFT);
    } else {
      if (
        currentNFT?.playlistNFT &&
        playlistNFT.current &&
        getUniqueKeyFromNFT(currentNFT?.playlistNFT).toLowerCase() ===
          getUniqueKeyFromNFT(playlistNFT.current).toLowerCase()
      ) {
        const index = playlistNFT.current?.playlist.findIndex(
          (nft) =>
            getUniqueKeyFromNFT(currentNFT).toLowerCase() ===
            getUniqueKeyFromNFT(nft).toLowerCase(),
        );

        playlistCurrentIndex.current = index;
      } else playlistNFT.current = null;

      setNFTToPlay(currentNFT);
    }

    setIsPlay(false);
    setIsPlayClicked(false);

    // }
  }, [currentNFT]);

  useEffect(() => {
    (async () => {
      const userAuthProfile = await getUserProfile(userAuthPub);
      setUserAuthProfile(userAuthProfile);
    })();
  }, [userAuthPub]);

  /**
   * Function to handle downloading a file from a given URI.
   * It determines the file name based on the key parameter and the URI.
   * If the key parameter is 'uri', it sets the file name to the NFT symbol followed by '_metadata.json'.
   * Otherwise, it extracts the file name from the URI and removes the '<<' and '>>' characters.
   * It then gets the portal link URL for the given URI and downloads the file using the file name.
   *
   * @function
   * @param {string} key - The key parameter to determine the file name.
   * @param {string} uri - The URI of the file to download.
   * @returns {void}
   */
  async function handle_DownloadFile(key, uri) {
    let fileName;
    if (key === 'uri') fileName = `${nft.symbol}_metadata.json`;
    else {
      const init = uri.indexOf('<<');
      const fin = uri.indexOf('>>');
      fileName = uri.substr(init + 2, fin - init - 2);
      uri = uri.substring(0, uri.lastIndexOf('<<'));
    }

    let linkUrl = await getPortalLinkUrl(uri);
    saveAs(linkUrl, fileName);

    console.log('DetailSidebar: handle_DownloadFile: linkUrl = ', linkUrl);
  }

  /**
   * Function to handle adding an NFT to the selectedNFTs array.
   * It checks if the NFT is defined and if the selectedNFTs array already contains the NFT.
   * If the NFT is not defined or already exists in the selectedNFTs array, it returns.
   * Otherwise, it adds the NFT to the selectedNFTs array.
   *
   * @function
   * @returns {void}
   */
  function handleAddToNestableNFT() {
    if (!nft) return;

    if (
      selectedNFTs?.find((nftElement) => nftElement.address === nft.address)
    ) {
      return;
    }

    setSelectedNFTs((prev) => [...prev, nft]);
  }

  /**
   * Function to handle removing an NFT from the selectedNFTs array.
   * It checks if the NFT is defined and if the selectedNFTs array contains the NFT.
   * If the NFT is not defined or does not exist in the selectedNFTs array, it returns.
   * Otherwise, it removes the NFT from the selectedNFTs array.
   *
   * @function
   * @param {Object} nft - The NFT object to remove from the selectedNFTs array.
   * @returns {void}
   */
  function removeFromNestableNFT(nft) {
    if (!nft) return;

    const index = selectedNFTs.findIndex(
      (selectedNFT) => selectedNFT.address === nft.address,
    );

    if (index !== -1) {
      setSelectedNFTs((prev) => {
        const newSelectedNFTs = [...prev];
        newSelectedNFTs.splice(index, 1);
        return newSelectedNFTs;
      });
    }
  }

  /**
   * Function to handle removing an NFT from the selectedNFTs array.
   * It checks if the NFT is defined and if the selectedNFTs array contains the NFT.
   * If the NFT is not defined or does not exist in the selectedNFTs array, it returns.
   * Otherwise, it removes the NFT from the selectedNFTs array.
   *
   * @function
   * @param {Object} nft - The NFT object to remove from the selectedNFTs array.
   * @returns {void}
   */
  async function handleRemoveFromNestableNFT() {
    if (!nft) return;

    if (!nft.parentAddress || !nft.parentId) return;

    let addressId = {};

    const NFTType = {
      ERC721: 'ERC721',
      ERC1155: 'ERC1155',
    };

    let theSelectedParentNFTType;

    if (await getIsERC721Address(nft.parentAddress)) {
      addressId = await removeChildFromNestableNFT(
        nft.parentId,
        nft.address,
        nft.id,
      );
      theSelectedParentNFTType = NFTType.ERC721;
    } else if (await getIsERC1155Address(nft.parentAddress)) {
      addressId = await removeChildFromNestableERC1155NFT(
        nft.parentId,
        nft.address,
        nft.id,
      );
      theSelectedParentNFTType = NFTType.ERC1155;
    } else
      throw new Error(
        'DetailsSidebar: handleRemoveFromNestableNFT: NFT is neither ERC721 nor ERC1155',
      );

    if (process.env.NEXT_PUBLIC_IS_USE_FABSTIRDB === 'true') {
      await removeChildNFT(nft, {
        address: nft.parentAddress,
        id: nft.parentId,
      });
    } else {
      const newAddress = `${address.address}_${address.id}`;
      await addAddress(newAddress);
      setCurrentNFT(null);
    }

    // setRefetchNFTsCount((prev) => prev + 1);
  }

  async function filterNFTsByType(nfts, typeChecker) {
    // Map each NFT to a promise that resolves to true or false based on the type check
    const checks = await Promise.all(
      nfts.map(async (nft) => await typeChecker(nft)),
    );

    // Filter the NFTs based on the checks
    return nfts.filter((_, index) => checks[index]);
  }

  /**
   * Function to handle adding the selected NFTs to the parent NFT.
   * It checks if the parent NFT is defined and if the selectedNFTs array is not empty.
   * If the parent NFT is not defined or the selectedNFTs array is empty, it returns.
   * Otherwise, it adds the selected NFTs to the parent NFT and updates the parent NFT's metadata.
   *
   * @function
   * @returns {void}
   */
  async function handleSelectedToParent() {
    if (!selectedNFTs?.length > 0 || !nft?.isNestable) return;

    let numberOfChildren;
    console.log(
      'DetailsSidebar: handleSelectedToParent: numberOfChildren = ',
      numberOfChildren,
    );

    let theSelectedNFTs;

    const NFTType = {
      ERC721: 'ERC721',
      ERC1155: 'ERC1155',
    };
    let theSelectedParentNFTType;

    if (await getIsERC721Address(nft.address)) {
      const children = await getChildrenOfNestableNFT(nft.id);
      console.log(
        'DetailsSidebar: handleSelectedToParent: children = ',
        children,
      );

      numberOfChildren = children?.length > 0 ? children.length : 0;
      console.log(
        'DetailsSidebar: handleSelectedToParent: numberOfChildren = ',
        numberOfChildren,
      );
      theSelectedNFTs = await filterNFTsByType(selectedNFTs, getIsERC721);
      theSelectedParentNFTType = NFTType.ERC721;
    } else if (await getIsERC1155Address(nft.address)) {
      const children = await getChildrenOfNestableERC1155NFT(nft.id);
      console.log(
        'DetailsSidebar: handleSelectedToParent: children = ',
        children,
      );

      numberOfChildren = children?.length > 0 ? children.length : 0;
      console.log(
        'DetailsSidebar: handleSelectedToParent: numberOfChildren = ',
        numberOfChildren,
      );

      theSelectedNFTs = await filterNFTsByType(selectedNFTs, getIsERC1155);
      theSelectedParentNFTType = NFTType.ERC1155;
    } else {
      throw new Error(
        'handleSelectedToParent: selectedParentNFTType.current is neither ERC721 nor ERC1155',
      );
    }

    let nestableNFT;
    for (const selectedNFT of theSelectedNFTs) {
      if (theSelectedParentNFTType === NFTType.ERC721) {
        await addChildToNestableNFT(
          nft.address,
          nft.id,
          numberOfChildren - 1,
          selectedNFT,
        );
      } else if (theSelectedParentNFTType === NFTType.ERC1155) {
        await addChildToNestableERC1155NFT(
          nft.address,
          nft.id,
          numberOfChildren - 1,
          selectedNFT,
          [],
        );
      } else
        throw new Error(
          'handleSelectedToParent: theSelectedParentNFTType is neither ERC721 nor ERC1155',
        );

      numberOfChildren++;

      if (process.env.NEXT_PUBLIC_IS_USE_FABSTIRDB === 'true') {
        await updateNFTToPointToParent(selectedNFT, {
          address: nft.address,
          id: nft.id,
        });
      } else {
        const addressId = constructNFTAddressId(
          selectedNFT.address,
          selectedNFT.id,
        );
        console.log(
          `DetailsSidebar: handleSelectedToParent: removed address ${addressId} from Snaps state`,
        );

        await removeAddress(addressId);
      }

      removeFromNestableNFT(selectedNFT);

      setCurrentNFT(null);
    }
  }

  const isNFTSelected = selectedNFTs.some(
    (selectedNFT) => selectedNFT.address === nft?.address,
  );

  useEffect(() => {
    return () => {
      console.log('DetailsSidebar: Component is unloading');
    };
  }, []); //

  function handle_TransferNFT() {
    console.log('DetailsSidebar: handle_TransferNFT');

    setOpenTransferNFTSliderOver(true);
    // setRefetchNFTsCount((prev) => prev + 1);
  }

  function handleEditTeams() {
    console.log('DetailsSidebar: handleEditTeams');

    setTeams({ teamsName: nft.teamsName, teams: { ...nft.teams } });
    setUpdateNFTWithTeams(nft);

    router.push(`/teams`);
  }

  const handlePermissions = async () => {
    const addressId = getNFTAddressId(nft);
    router.push(`/permissions/${addressId}`);
  };

  const playVideo = (index) => {
    if (index >= 0 && index < playlistNFT.current.playlist.length) {
      setNFTToPlay(playlistNFT.current.playlist[index]);
      setNFT(playlistNFT.current.playlist[index]);
      setIsPlayClicked(true);
    }
  };

  const handleNext = async () => {
    if (!(playlistNFT?.current?.playlist?.length > 0)) {
      setIsPlayClicked(false);
      setIsPlay(false);
      return;
    }

    playlistCurrentIndex.current = playlistCurrentIndex.current + 1;
    playVideo(playlistCurrentIndex.current);

    const resumeState = await getMediaResumeState(
      playlistNFT.current.playlist[playlistCurrentIndex.current],
    );

    if (playlistNFT.current.playlist[playlistCurrentIndex.current])
      await putMediaResumeState(
        playlistNFT.current.playlist[playlistCurrentIndex.current],
        0,
        0,
        resumeState?.isFinished,
      );

    if (playlistCurrentIndex.current >= playlistNFT.current.playlist.length) {
      playlistCurrentIndex.current = 0;
      setIsPlayClicked(false);
      setIsPlay(false);
      setNFT(playlistNFT.current);
      console.log('Reached end of playlist.');
    }
  };

  const handlePrev = () => {
    if (playlistCurrentIndex.current <= 0) {
      setIsPlayClicked(false);
      setIsPlay(false);

      return;
    }

    playlistCurrentIndex.current = playlistCurrentIndex.current - 1;
    playVideo(playlistCurrentIndex.current);
  };

  useEffect(() => {
    if (isPlayClicked && nft?.playlist?.length > 0) {
      if (
        playlistCurrentIndex.current >= 0 &&
        playlistCurrentIndex.current < playlistNFT.current.playlist.length
      ) {
        setNFTToPlay(
          playlistNFT.current.playlist[playlistCurrentIndex.current],
        );
        setNFT(playlistNFT.current.playlist[playlistCurrentIndex.current]);
      }
    }
  }, [isPlayClicked, nft, playlistCurrentIndex.current]);

  const setPlaylistCurrentIndex = (playlistIndex) => {
    playlistCurrentIndex.current = playlistIndex;
  };

  return (
    <aside
      className={classNames(
        'mx-auto flex-1 rounded-sm border-l border-fabstir-dark-gray bg-fabstir-white px-8 pb-8 pt-2 shadow-lg lg:block',
        width1,
      )}
    >
      {setIsScreenViewClosed && (
        <div className="mt-6 flex justify-between">
          <h3 className="font-medium text-fabstir-light-gray">NFT</h3>
          <ChevronDoubleDownIcon
            className={
              'flex h-6 w-6 transform justify-end text-fabstir-light-gray transition duration-200 ease-in ' +
              (isScreenViewClosed ? 'rotate-180' : 'rotate-0')
            }
            aria-hidden="true"
            onClick={() => setIsScreenViewClosed((prev) => !prev)}
          />
        </div>
      )}

      {!isScreenViewClosed && (
        <div
          className={classNames(
            'mx-auto mt-4',
            isTheatreMode ? '' : 'max-w-5xl',
          )}
        >
          {nft && nftImage && !nft.video && !nft.audio && (
            <div>
              <div
                id="nftFrame"
                className="aspect-h-7 aspect-w-10 block w-full rounded-lg shadow-2xl shadow-fabstir-black/50"
                style={{
                  display:
                    nft && nftImage && !nft.video && !nft.audio
                      ? 'block'
                      : 'none',
                }}
              >
                <div className="relative">
                  <RenderModel nft={nft} modelUris={modelUris} />
                  <img
                    src={nftImage}
                    alt=""
                    className="mx-auto object-cover relative z-20 w-full"
                    crossOrigin="anonymous"
                    style={{ visibility: is3dModel ? 'hidden' : 'visible' }}
                  />

                  {/* overlay */}
                  {nft && nftImage && nft?.playlist?.length > 0 ? (
                    <div className="absolute bottom-0 left-0 z-20 m-5 w-fit bg-black bg-opacity-50 text-fabstir-white">
                      <MediaCaption
                        nft={nft}
                        setIsPlayClicked={setIsPlayClicked}
                        nftQuantity={nftQuantity?.toString()}
                        playlistNFT={playlistNFT.current}
                        setPlaylistCurrentIndex={setPlaylistCurrentIndex}
                      />
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute bottom-0 left-0 z-20 m-5 w-fit bg-black bg-opacity-50 text-fabstir-white">
                      <MediaCaption
                        nft={nft}
                        nftQuantity={nftQuantity?.toString()}
                        playlistNFT={playlistNFT.current}
                        setPlaylistCurrentIndex={setPlaylistCurrentIndex}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {nft?.video &&
            (encKey === null ||
              (typeof encKey === 'string' && encKey.trim() !== '')) && (
              <div>
                <div className="w-full overflow-hidden rounded-lg shadow-2xl shadow-fabstir-black/50">
                  <div className="relative">
                    {nftToPlay ? (
                      <NFTVideoJS
                        nft={nft}
                        setIsPlay={setIsPlay}
                        className="3xl:shadow-2xl min-w-[256px] rounded-2xl bg-fabstir-dark-gray shadow-lg shadow-fabstir-black md:shadow-lg lg:shadow-xl xl:shadow-xl 2xl:shadow-xl"
                        encKey={encKey}
                        isPlayClicked={isPlayClicked}
                        setIsPlayClicked={setIsPlayClicked}
                        metadata={mediaMetadata}
                        handleNext={
                          playlistNFT.current?.playlist?.length > 0
                            ? handleNext
                            : null
                        }
                        handlePrev={
                          playlistNFT.current?.playlist?.length > 0
                            ? handlePrev
                            : null
                        }
                        playlistNFT={playlistNFT.current}
                      />
                    ) : (
                      <img
                        src={nftImage}
                        alt=""
                        className="mx-auto object-cover"
                        crossOrigin="anonymous"
                      />
                    )}
                    {!isPlayClicked && (
                      <div className="absolute bottom-2 left-0 z-20 m-5 w-fit bg-black bg-opacity-50 text-fabstir-white">
                        <MediaCaption
                          nft={nft}
                          setIsPlayClicked={setIsPlayClicked}
                          nftQuantity={nftQuantity?.toString()}
                          playlistNFT={playlistNFT.current}
                          setPlaylistCurrentIndex={setPlaylistCurrentIndex}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {nft?.audio &&
            (encKey === null ||
              (typeof encKey === 'string' && encKey.trim() !== '')) && (
              <div>
                <div className="w-full overflow-hidden rounded-lg shadow-2xl shadow-fabstir-black/50">
                  <div className="relative">
                    {nftToPlay ? (
                      <NFTAudioJS
                        nft={nft}
                        setIsPlay={setIsPlay}
                        className="3xl:shadow-2xl min-w-[256px] rounded-2xl bg-fabstir-dark-gray shadow-lg shadow-fabstir-black md:shadow-lg lg:shadow-xl xl:shadow-xl 2xl:shadow-xl"
                        encKey={encKey}
                        isPlayClicked={isPlayClicked}
                        setIsPlayClicked={setIsPlayClicked}
                        metadata={mediaMetadata}
                        setPlayerCurrentTime={setPlayerCurrentTime}
                      />
                    ) : (
                      <img
                        src={nftImage}
                        alt=""
                        className="mx-auto object-cover"
                        crossOrigin="anonymous"
                      />
                    )}
                    {!isPlayClicked && (
                      <div className="absolute bottom-2 left-0 z-20 m-5 w-fit bg-black bg-opacity-50 text-fabstir-white">
                        <MediaCaption
                          nft={nft}
                          setIsPlayClicked={setIsPlayClicked}
                          nftQuantity={nftQuantity?.toString()}
                          playlistNFT={playlistNFT.current}
                          setPlaylistCurrentIndex={setPlaylistCurrentIndex}
                        />
                      </div>
                    )}
                  </div>
                  <NFTAudioLyrics
                    nft={nft}
                    playerCurrentTime={playerCurrentTime}
                  />
                </div>
              </div>
            )}
        </div>
      )}
      <div className="">
        {userPub === userAuthPub &&
          !selectedParentNFTAddressId &&
          nftQuantity?.gt(0) && (
            <div className="flex justify-between mt-4">
              <div className="flex flex-1 justify-center gap-x-2">
                <Button
                  variant="primary"
                  size="medium"
                  onClick={async () => {
                    await handle_TransferNFT();
                  }}
                  className="w-28 rounded-md border border-transparent px-4 py-2 text-sm font-medium tracking-wide"
                >
                  Transfer
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={handlePermissions}
                  className="w-28 rounded-md border border-transparent px-4 py-2 text-sm font-medium tracking-wide"
                >
                  Resell
                </Button>{' '}
              </div>
            </div>
          )}
      </div>

      <div className="">
        <div className="">
          <h3 className="font-medium text-fabstir-gray">Information</h3>
          <ChevronDoubleDownIcon
            className={
              'h-6 w-6 transform text-fabstir-light-gray transition duration-200 ease-in ' +
              (openNFTMetaData ? 'rotate-180' : 'rotate-0')
            }
            aria-hidden="true"
            onClick={() =>
              setOpenNFTMetaData((openNFTMetaData) => !openNFTMetaData)
            }
          />
        </div>

        {/* {openNFTMetaData && ( */}
        <div
          className={`"flex space-y-2" h-auto w-full flex-col justify-between sm:flex-row ${
            openNFTMetaData === false && 'hidden'
          }`}
        >
          {!nft?.isNestable ? (
            <div className="mt-2 flex flex-1 flex-row justify-between">
              {isNFTSelected ? (
                <Button
                  className="p-1 text-sm"
                  variant="primary"
                  size="medium"
                  onClick={handleRemoveFromNestableNFT}
                >
                  Remove from select
                </Button>
              ) : (
                <Button
                  className="p-1 text-sm"
                  variant="primary"
                  size="medium"
                  onClick={handleAddToNestableNFT}
                >
                  Add to selected
                </Button>
              )}
            </div>
          ) : selectedNFTs?.length > 0 ? (
            <div className="mt-2 flex flex-1 flex-row justify-between">
              <Button
                className="p-1 text-sm"
                variant="primary"
                size="medium"
                onClick={handleSelectedToParent}
              >
                Add selected to Parent
              </Button>
            </div>
          ) : (
            nft?.parentAddress && (
              <div className="mt-2 flex flex-1 flex-row justify-between">
                <Button
                  className="p-1 text-sm"
                  variant="primary"
                  size="medium"
                  onClick={handleRemoveFromNestableNFT}
                >
                  Remove from Parent
                </Button>
              </div>
            )
          )}

          <div className="group">
            {nft?.teamsName && (
              <div className="flex items-center justify-between mt-6">
                <h2 className="text-2xl font-semibold tracking-tight text-fabstir-dark-gray sm:text-xl">
                  {nft?.teamsName}
                </h2>

                {userPub === userAuthPub && (
                  <Button
                    onClick={handleEditTeams}
                    variant="primary"
                    size="medium"
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <PencilIcon className="w-5 h-5 text-fabstir-gray hover:text-dark-gray" />
                  </Button>
                )}
              </div>
            )}

            <TeamsView teams={nft?.teams} />
          </div>

          {nft?.playlist && (
            <div>
              <div className="relative z-0 mx-4 mb-4 mt-8 flex items-center justify-between pt-8">
                <span className="text-fabstir-white justify-start whitespace-nowrap pr-3 text-lg font-semibold tracking-wide">
                  Playlist NFTs
                </span>
                <div className="border-fabstir-divide-color1 w-full border-t" />
                <div className="ml-4">Public</div>
              </div>

              <div className="bg-fabstir-medium-dark-gray relative z-0 rounded-lg p-4 pb-4 shadow-lg">
                <PlaylistsView
                  nfts={nft.playlist.map((aNFT) => ({
                    ...aNFT,
                    playlistNFT: nft,
                  }))}
                  // setNFTs={updateNFTPlaylist}
                  userAccountAddress={userAuthProfile?.accountAddress}
                  twStyle={twPlaylistStyle}
                  twTitleStyle={twPlaylistTitleStyle}
                  twTextStyle={twPlaylistTextStyle}
                  disableNavigation={false}
                  scale={110}
                />
              </div>
            </div>
          )}

          {playlistNFT.current?.playlist && (
            <div>
              <div className="relative z-0 mx-4 mb-4 mt-8 flex items-center justify-between pt-8">
                <span className="text-fabstir-white justify-start whitespace-nowrap pr-3 text-lg font-semibold tracking-wide">
                  Playlist NFTs
                </span>
                <div className="border-fabstir-divide-color1 w-full border-t" />
                <div className="ml-4">Public</div>
              </div>

              <div className="bg-fabstir-medium-dark-gray relative z-0 rounded-lg p-4 pb-4 shadow-lg">
                <PlaylistsView
                  nfts={playlistNFT.current.playlist.map((nft) => ({
                    ...nft,
                    playlistNFT: playlistNFT.current,
                  }))}
                  userAccountAddress={userAuthProfile?.accountAddress}
                  twStyle={twPlaylistStyle}
                  twTitleStyle={twPlaylistTitleStyle}
                  twTextStyle={twPlaylistTextStyle}
                  disableNavigation={false}
                  scale={110}
                  playlistCurrentIndex={playlistCurrentIndex.current}
                />
              </div>
            </div>
          )}

          <div className="mt-2">
            <h2 className="text-2xl font-semibold tracking-tight text-fabstir-dark-gray sm:text-xl mt-6">
              Metadata
            </h2>

            <dl className="mt-2 divide-y divide-fabstir-divide-color1 border-b border-t border-fabstir-medium-light-gray">
              {nftInfoDecorated &&
                Object.entries(nftInfoDecorated).reduce((acc, [key, value]) => {
                  // Filter out null, undefined, or empty array values
                  if (
                    value === null ||
                    value === undefined ||
                    (Array.isArray(value) && value.length === 0)
                  ) {
                    return acc;
                  }

                  const element = (
                    <div
                      key={key}
                      className="flex justify-between py-3 text-sm font-medium"
                    >
                      <dt className="text-fabstir-gray">
                        {key}
                        {'\u00A0'}
                      </dt>
                      <dd className="truncate text-gray-500">
                        {key.toLowerCase().endsWith('urls') ||
                        key.toLowerCase().endsWith('uri') ? (
                          <NFTFileUrls
                            field={key}
                            fileUrls={value}
                            handle_DownloadFile={handle_DownloadFile}
                          />
                        ) : Array.isArray(value) ? (
                          <div>{value.join(', ')}</div>
                        ) : (
                          <div>{value}</div>
                        )}
                      </dd>
                    </div>
                  );

                  acc.push(element);
                  return acc;
                }, [])}
            </dl>
          </div>

          <div className="divide-y divide-fabstir-divide-color1">
            <div className="group my-4">
              <div className="mt-4 flex justify-between">
                <h3 className="font-medium text-fabstir-dark-gray">
                  Attributes
                </h3>
                <div className="flex flex-1 justify-end">
                  <ChevronDoubleDownIcon
                    className={
                      'h-6 w-6 transform text-fabstir-light-gray transition duration-200 ease-in ' +
                      (openNFTAttributes ? 'rotate-180' : 'rotate-0')
                    }
                    aria-hidden="true"
                    onClick={() =>
                      setOpenNFTAttributes(
                        (openNFTAttributes) => !openNFTAttributes,
                      )
                    }
                  />
                  <ChevronDoubleDownIcon
                    className={
                      'h-6 w-6 transform text-fabstir-light-gray transition duration-200 ease-in ' +
                      (openNFTAttributes ? 'rotate-180' : 'rotate-0')
                    }
                    aria-hidden="true"
                    onClick={() =>
                      setOpenNFTAttributes(
                        (openNFTAttributes) => !openNFTAttributes,
                      )
                    }
                  />
                </div>
              </div>

              {/* {openNFTAttributes && ( */}
              <div
                className={`"flex space-y-2" h-auto w-full flex-col justify-between sm:flex-row ${
                  openNFTAttributes === false && 'hidden sm:flex'
                }`}
              >
                {nft?.attributes &&
                  nft.attributes.map(({ key, value }, index) => {
                    if (value) {
                      return (
                        <div
                          key={index}
                          className="flex justify-between py-3 text-sm font-medium"
                        >
                          <dt className="text-fabstir-gray">
                            {openNFTAttributes ? key : key + ':'}
                            {'\u00A0'}
                          </dt>
                          <dd
                            className={
                              'text-gray-500 ' +
                              (openNFTAttributes ? '' : 'line-clamp-1')
                            }
                          >
                            {Array.isArray(value) ? value.join(', ') : value}
                          </dd>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
