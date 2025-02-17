import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import usePortal from '../hooks/usePortal';
import { Input } from '../ui-components/input';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { cn } from '../utils/cn';
import SimpleToggle from './SimpleToggle';
import { useRouter } from 'next/router';
// import MeritBadgesView from './MeritBadgesView'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NFTView({
  nft,
  handle_AmountThreshold,
  handleSubmit_AddNFT,
  handleSubmit_RemoveNFT,
  handle_UpNFTs,
  handle_DownNFTs,
  twStyle,
  twTitleStyle,
  twTextStyle,
  to,
  disableNavigation,
  scale = 110,
  isPublic,
  setIsPublic,
  reseller,
}) {
  const [nftImage, setNFTImage] = useState();
  const { getBlobUrl } = usePortal();
  const setCurrentNFT = useSetRecoilState(currentnftmetadata);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (nft?.image) {
        const linkUrl = await getBlobUrl(nft.image);
        setNFTImage(linkUrl);
      }
    })();
  }, [nft]);

  const nftReferral = () => {
    setCurrentNFT(nft);
  };

  return (
    <div className={twStyle}>
      {/* Membership administration actions dropdown */}
      <div
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            'group relative mx-auto w-20 transform space-y-1 transition duration-100 ease-in group-hover:z-50 lg:w-32',
            `group-hover:scale-${parseInt(scale)}`,
          )}
        >
          <div
            onClick={() => nftReferral()} // reseller is owner of the playlist
            className="hover:no-underline"
          >
            <div className="flex flex-col items-center">
              {setIsPublic && (
                <div>
                  <div className="order-2 mb-1 flex-shrink-0 -translate-y-1 sm:order-3 sm:ml-3">
                    <SimpleToggle enabled={isPublic} setEnabled={setIsPublic} />
                  </div>
                </div>
              )}

              <div className="relative">
                <img
                  className="border-primary lg:w-30 mb-2 aspect-[10/7] w-20 rounded-md border-[6px] object-cover shadow-sm"
                  src={nftImage}
                  alt=""
                  crossOrigin="anonymous"
                />
              </div>

              {twTitleStyle &&
                (disableNavigation ? (
                  <p
                    className={classNames(
                      'text-fabstir-white pointer-events-none block truncate text-left font-medium',
                      twTitleStyle,
                    )}
                  >
                    {nft.name}
                  </p>
                ) : (
                  <p
                    className={classNames(
                      'text-fabstir-white pointer-events-none block truncate text-left font-medium',
                      twTitleStyle,
                    )}
                  >
                    {nft.name}
                  </p>
                ))}
              {twTextStyle && (
                <div className="flex w-full flex-row justify-between">
                  <p
                    className={classNames(
                      'text-fabstir-light-gray pointer-events-none truncate text-left font-medium',
                      twTextStyle,
                    )}
                  >
                    {nft.symbol}
                  </p>
                  <p
                    className={classNames(
                      'text-fabstir-light-gray pointer-events-none text-left font-semibold',
                      twTextStyle,
                    )}
                  >
                    {nft.type}
                  </p>
                </div>
              )}

              {twTextStyle && nft?.category && (
                <div className="mb-1 w-full text-left">
                  <p
                    className={classNames(
                      'text-fabstir-light-gray pointer-events-none block w-full truncate font-semibold',
                      twTextStyle,
                    )}
                  >
                    {nft.category}
                  </p>
                </div>
              )}

              <div className="group relative">
                {twTextStyle && nft?.summary && (
                  <>
                    {/* This div contains the clamped text with ellipsis */}
                    <div
                      className={`transition-opacity duration-100 ${
                        isHovered ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      <p
                        className={classNames(
                          'text-fabstir-gray-200 pointer-events-none !line-clamp-3 block text-wrap text-left font-extralight',
                          twTextStyle,
                        )}
                      >
                        {nft.overview || nft.summary}
                      </p>
                    </div>

                    {/* This div contains the full text and will appear on hover */}
                    <div className="pointer-events-none absolute inset-0 top-0 z-50 opacity-0 transition-all duration-100 group-hover:visible group-hover:opacity-100">
                      <div className="transition duration-100 group-hover:shadow-md">
                        <p
                          className={classNames(
                            'text-fabstir-gray-100 pointer-events-none block text-wrap text-left font-extralight',
                            twTextStyle,
                          )}
                        >
                          {nft.overview || nft.summary}
                        </p>
                        <p className="item-center @sm:justify-between @md:text-xs @lg:text-xs @xl:text-xs @2xl:text-xs @3xl:text-xs mt-2 text-xs opacity-0 group-hover:opacity-100">
                          <div
                            className={classNames(
                              'text-copy group-hover:text-copy-light pointer-events-none flex justify-between text-wrap text-left font-extralight group-hover:font-semibold sm:mt-1 lg:mt-0',
                            )}
                          >
                            <p>
                              {nft?.attributes?.['release_date'] ||
                                nft?.attributes?.['first_air_date']}
                            </p>
                          </div>
                        </p>

                        <div className="mt-2">
                          <span className="text-copy text-xs">
                            {nft?.attributes?.['release_date'] ||
                              nft?.attributes?.['first_air_date']}
                          </span>
                          {/* <MeritBadgesView nft={nft} /> */}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {twTextStyle &&
                (nft?.amountThreshold || nft?.amountThreshold === 0) &&
                !handleSubmit_RemoveNFT && (
                  <p
                    className={classNames(
                      'text-fabstir-light-gray pointer-events-none block truncate text-left font-medium',
                      twTextStyle,
                    )}
                  >
                    Threshold: {nft?.amountThreshold}
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6"></div>
    </div>
  );
}
