import { ChevronDoubleDownIcon } from '@heroicons/react/24/solid';
import { TvIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';

import { saveAs } from 'file-saver';
import { useRecoilState, useRecoilValue } from 'recoil';
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
        key !== 'summary' &&
        key !== 'attributes' &&
        key !== 'multiToken' &&
        key !== 'tokenise' &&
        key !== 'subscriptionPlan' &&
        key !== 'holders' &&
        key !== 'enc_key' &&
        key !== 'teams' &&
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

  console.log('output = ', output);
  return JSON.parse(JSON.stringify(output).trim());
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
  currentNFT,
  width1,
  isTheatreMode,
  setIsTheatreMode,
  isScreenViewClosed,
  setIsScreenViewClosed,
}) {
  const [nft, setNFT] = useState();
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [fileUrls, setFileUrls] = useState(null);

  console.log('UserNFTView: inside DetailsSidebar');
  console.log('DetailsSidebar: nft = ', nft);
  console.log('UserNFTs: nft = ', nft);

  const [selectedSubscriptionPlans, setSelectedSubscriptionPlans] = useState(
    [],
  );
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
  const [is3dModel, setIs3dModel] = useState(false);
  const { getPortalLinkUrl, getBlobUrl } = usePortal();
  const [modelUris, setModelUris] = useState(null);

  const {
    getChildrenOfNestableNFT,
    addChildToNestableNFT,
    removeChildFromNestableNFT,
    upgradeToNestableNFT,
  } = useMintNestableNFT();

  const [selectedNFTs, setSelectedNFTs] = useRecoilState(nftsselectedaschild);

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
   * Function to handle upgrading an NFT to a nestable NFT.
   * It checks if the parent NFT is defined and if the selectedNFTs array is not empty.
   * If the parent NFT is not defined or the selectedNFTs array is empty, it returns.
   * Otherwise, it creates a new nestable NFT with the selected NFTs as children and updates the parent NFT's metadata.
   *
   * @function
   * @returns {void}
   */
  async function handleUpgradeToNestableNFT() {
    if (!nft) return;

    const { address, id } = await upgradeToNestableNFT(nft);

    console.log(
      'DetailsSidebar: handleUpgradeToNestableNFT: address = ',
      address,
    );
    console.log('DetailsSidebar: handleUpgradeToNestableNFT: token id = ', id);

    // now need to swap NFT address with nestable NFT address in Snaps state
    await replaceAddress(`${nft.address}_${nft.id}`, `${address}_${id}`);
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

    const { address, id } = await removeChildFromNestableNFT(
      nft.parentId,
      nft.address,
      nft.id,
    );

    await addAddress(`${address}_${id}`);
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
    if (!selectedNFTs?.length > 0 || !nft?.parentId) return;

    const children = await getChildrenOfNestableNFT(nft.parentId);
    console.log(
      'DetailsSidebar: handleSelectedToParent: children = ',
      children,
    );

    let numberOfChildren = children?.length > 0 ? children.length : 0;
    console.log(
      'DetailsSidebar: handleSelectedToParent: numberOfChildren = ',
      numberOfChildren,
    );

    const theSelectedNFTs = [...selectedNFTs];

    for (const selectedNFT of theSelectedNFTs) {
      const nestableNFT = await addChildToNestableNFT(
        nft.parentId,
        0,
        selectedNFT,
      );

      numberOfChildren++;

      const addressId = `${selectedNFT.address}_${selectedNFT.id}`;
      await removeAddress(addressId);
      console.log(
        `DetailsSidebar: handleSelectedToParent: removed address ${addressId} from Snaps state`,
      );

      removeFromNestableNFT(selectedNFT);

      console.log(
        `DetailsSidebar: handleSelectedToParent: added nft address ${selectedNFT.address} with token id ${selectedNFT.id} to nestableNFT = ${nestableNFT}`,
      );
    }
  }

  const isNFTSelected = selectedNFTs.some(
    (selectedNFT) => selectedNFT.address === nft?.address,
  );

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
                  <RenderModel
                    nft={nft}
                    is3dModel={is3dModel}
                    setIs3dModel={setIs3dModel}
                    isWasmReady={isWasmReady}
                    setIsWasmReady={setIsWasmReady}
                    modelUris={modelUris}
                  />
                  <img
                    src={nftImage}
                    alt=""
                    className="mx-auto object-cover relative z-30"
                    crossOrigin="anonymous"
                    style={{ visibility: is3dModel ? 'hidden' : 'visible' }}
                  />
                </div>{' '}
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-lg font-medium text-fabstir-black">
                      <span className="sr-only">Details for </span>
                      {nft?.name}
                    </h2>
                    <p className="text-sm font-medium text-fabstir-light-gray">
                      {nft?.price}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-fabstir-light-gray/80">
                    {nft?.summary}
                  </p>
                </div>
                <div className="flex items-baseline">
                  {/* <ArrowCircleUpIcon className="h-6 w-6" aria-hidden="true" /> */}

                  <div onClick={() => setIsTheatreMode((prev) => !prev)}>
                    <TvIcon
                      className={classNames(
                        'ml-2 w-5 hover:scale-125 hover:text-fabstir-white md:w-6 xl:w-7',
                      )}
                    />
                  </div>
                </div>
                {/* <ArrowCircleUpIcon className="h-6 w-6" aria-hidden="true" /> */}
                <span className="sr-only">Favorite</span>
              </div>
            </div>
          )}

          {nft?.video && (
            <div>
              <div className="w-full overflow-hidden rounded-lg shadow-2xl shadow-fabstir-black/50">
                <NFTVideoJS
                  nft={nft}
                  className="min-w-[256px] rounded-2xl bg-fabstir-dark-gray shadow-lg shadow-fabstir-black md:shadow-lg lg:shadow-xl xl:shadow-xl 2xl:shadow-xl 3xl:shadow-2xl"
                />
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-lg font-medium text-fabstir-black">
                      <span className="sr-only">Details for </span>
                      {nft?.name}
                    </h2>
                    <p className="text-sm font-medium text-fabstir-light-gray">
                      {nft?.price}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-fabstir-light-gray/80">
                    {nft?.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {nft?.audio && (
            <div>
              <div className="w-full overflow-hidden rounded-lg shadow-2xl shadow-fabstir-black/50">
                <NFTAudioJS
                  nft={nft}
                  className="min-w-[256px] rounded-2xl bg-fabstir-dark-gray shadow-lg shadow-fabstir-black md:shadow-lg lg:shadow-xl xl:shadow-xl 2xl:shadow-xl 3xl:shadow-2xl"
                />
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-lg font-medium text-fabstir-black">
                      <span className="sr-only">Details for </span>
                      {nft?.name}
                    </h2>
                    <p className="text-sm font-medium text-fabstir-light-gray">
                      {nft?.price}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-fabstir-light-gray/80">
                    {nft?.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="">
        <div className="">
          <h3 className="font-medium text-fabstir-light-gray">Information</h3>
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
          {!nft?.parentId ? (
            <div className="mt-2 flex flex-1 flex-row justify-between">
              <button
                className="bg-blue-100 p-1 text-sm"
                onClick={handleUpgradeToNestableNFT}
              >
                Upgrade to Nestable
              </button>

              {isNFTSelected ? (
                <button
                  className="bg-blue-100 p-1 text-sm"
                  onClick={handleRemoveFromNestableNFT}
                >
                  Remove from select
                </button>
              ) : (
                <button
                  className="bg-blue-100 p-1 text-sm"
                  onClick={handleAddToNestableNFT}
                >
                  Add to select
                </button>
              )}
            </div>
          ) : selectedNFTs?.length > 0 ? (
            <div className="mt-2 flex flex-1 flex-row justify-between">
              <button
                className="bg-blue-100 p-1 text-sm"
                onClick={handleSelectedToParent}
              >
                Add selected to Parent
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-1 flex-row justify-between">
              <button
                className="bg-blue-100 p-1 text-sm"
                onClick={handleRemoveFromNestableNFT}
              >
                Remove from Parent
              </button>
            </div>
          )}

          <div className="mt-2">
            <dl className="mt-2 divide-y divide-fabstir-divide-color1 border-b border-t border-fabstir-medium-light-gray">
              {nftInfoDecorated &&
                Object.keys(nftInfoDecorated).map((key) => (
                  <div
                    key={key}
                    className="flex justify-between py-3 text-sm font-medium"
                  >
                    <dt className="text-gray-500">
                      {key}
                      {'\u00A0'}
                    </dt>
                    <dd className="truncate text-fabstir-light-gray">
                      {key.toLowerCase().endsWith('urls') ||
                      key.toLowerCase().endsWith('uri') ? (
                        <NFTFileUrls
                          field={key}
                          fileUrls={nftInfoDecorated[key]}
                          handle_DownloadFile={handle_DownloadFile}
                        />
                      ) : Array.isArray(nftInfoDecorated[key]) ? (
                        <div>{nftInfoDecorated[key].join(',')}</div>
                      ) : (
                        <div>{nftInfoDecorated[key]}</div>
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          <div className="divide-y divide-fabstir-divide-color1">
            <div className="group my-4">
              <div className="mt-4 flex justify-between">
                <h3 className="font-medium text-fabstir-light-gray">
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
                  Object.entries(nft?.attributes).map(([key, value]) => {
                    return (
                      <div
                        key={key}
                        className="flex justify-between py-3 text-sm font-medium"
                      >
                        <dt className="text-fabstir-light-gray">
                          {key}
                          {'\u00A0'}
                        </dt>
                        <dd
                          className={
                            'text-fabstir-light-gray ' +
                            (openNFTAttributes ? '' : 'line-clamp-1')
                          }
                        >
                          {value}
                        </dd>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
