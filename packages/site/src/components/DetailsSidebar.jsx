import { ChevronDoubleDownIcon } from '@heroicons/react/24/solid';
import { TvIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';

import { saveAs } from 'file-saver';
import { useRecoilState, useRecoilValue } from 'recoil';
import { nftattributesexpandstate } from '../atoms/nftAttrributesExpand';
import { nftmetadataexpandstate } from '../atoms/nftMetaDataExpand';
import usePortal from '../hooks/usePortal';
//import NFTAudioJS from './NFTAudioJS';
import NFTFileUrls from './NFTFileUrls';
import NFTVideoJS from './NFTVideoJS';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const userViewStyle = 'relative mx-auto grid gap-x-4 gap-y-8 grid-cols-6';

const appendNFTField = (old, field, value) => ({ ...old, [field]: value });

const nftInformationDecorator = (information) => {
  if (!information) return null;

  let output = {};
  Object.keys(information)
    .filter(
      (key) =>
        key !== 'name' &&
        key !== 'summary' &&
        key !== 'attributes' &&
        key !== 'image' &&
        key !== 'multiToken' &&
        key !== 'tokenise' &&
        key !== 'image' &&
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

export default function DetailsSidebar({
  currentNFT,
  width1,
  isTheatreMode,
  setIsTheatreMode,
  isScreenViewClosed,
  setIsScreenViewClosed,
}) {
  const [nft, setNFT] = useState();

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

  const nftInfoDecorated = nftInformationDecorator(nft ? nft : null);

  const [nftImage, setNFTImage] = useState();
  const { getPortalLinkUrl, getBlobUrl } = usePortal();

  const [isPlay, setIsPlay] = useState(false);

  //  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [nftToPlay, setNFTToPlay] = useState();

  const [isPublic, setIsPublic] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    console.log('DetailsSidebar: currentNFT = ', currentNFT);
    setNFT(currentNFT);
    (async () => {})();
  }, [currentNFT, currentNFT?.image]);

  useEffect(() => {
    console.log('DetailsSidebar: nft.image = ', nft?.image);
    (async () => {
      if (nft?.image) {
        const linkUrl = await getBlobUrl(nft.image);
        setNFTImage(linkUrl);
      }
    })();
  }, [nft]);

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

  return (
    <aside
      className={classNames(
        'mx-auto flex-1 rounded-sm border-l border-fabstir-dark-gray bg-fabstir-black px-8 pb-8 pt-2 shadow-lg lg:block',
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
          className={classNames('mx-auto', isTheatreMode ? '' : 'max-w-5xl')}
        >
          {nft && nftImage && !nft.video && !nft.audio && (
            <div>
              <div className="aspect-h-7 aspect-w-10 block w-full rounded-lg shadow-2xl shadow-fabstir-black/50">
                <img
                  src={nftImage}
                  alt=""
                  className="mx-auto object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-lg font-medium text-fabstir-white">
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
                    <h2 className="text-lg font-medium text-fabstir-white">
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

          {/* {nft?.audio && (
            <div>
              <div className="w-full overflow-hidden rounded-lg shadow-2xl shadow-fabstir-black/50">
                {nftToPlay ? (
                  <NFTAudioJS
                    nft={nft}
                    playerCurrentTime={playerCurrentTime}
                    className="min-w-[256px] rounded-2xl bg-fabstir-dark-gray shadow-lg shadow-fabstir-black md:shadow-lg lg:shadow-xl xl:shadow-xl 2xl:shadow-xl 3xl:shadow-2xl"
                  />
                ) : (
                  <img
                    src={nftImage}
                    alt=""
                    className="mx-auto object-cover"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-lg font-medium text-fabstir-white">
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
          )} */}
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
            <div className="flex-row-1 mt-4 flex justify-between">
              <div className="flex items-center">
                <div className="rounded border-2 border-fabstir-gray">
                  <input
                    id="same-as-shipping"
                    name="same-as-shipping"
                    type="checkbox"
                    checked={nft?.multiToken}
                    disabled={true}
                    className="fabstir-light-gray h-4 w-4 rounded bg-fabstir-dark-gray text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-2">
                  <label
                    htmlFor="same-as-shipping"
                    className="text-sm font-medium text-fabstir-medium-light-gray"
                  >
                    Multi Token
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <div className="rounded border-2 border-fabstir-gray">
                  <input
                    id="same-as-shipping"
                    name="same-as-shipping"
                    type="checkbox"
                    checked={nft?.tokenise}
                    disabled={true}
                    className="h-4 w-4 rounded border-fabstir-light-gray bg-fabstir-dark-gray text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-2">
                  <label
                    htmlFor="same-as-shipping"
                    className="text-sm font-medium text-fabstir-medium-light-gray"
                  >
                    Tokenise
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <div className="rounded border-2 border-fabstir-gray">
                  <input
                    id="same-as-shipping"
                    name="same-as-shipping"
                    type="checkbox"
                    checked={nft?.membership}
                    disabled={true}
                    className="fabstir-light-gray h-4 w-4 rounded bg-fabstir-dark-gray text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-2">
                  <label
                    htmlFor="same-as-shipping"
                    className="text-sm font-medium text-fabstir-medium-light-gray"
                  >
                    Membership
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <div className="rounded border-2 border-fabstir-gray">
                  <input
                    id="same-as-shipping"
                    name="same-as-shipping"
                    type="checkbox"
                    checked={nft?.playlist}
                    disabled={true}
                    className="fabstir-light-gray h-4 w-4 rounded bg-fabstir-dark-gray text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-2">
                  <label
                    htmlFor="same-as-shipping"
                    className="text-sm font-medium text-fabstir-medium-light-gray"
                  >
                    Playlists
                  </label>
                </div>
              </div>
            </div>
            <section
              aria-labelledby="billing-heading"
              className="mt-4 border-t border-fabstir-gray"
            ></section>

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
