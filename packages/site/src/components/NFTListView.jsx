import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { classNames } from '../utils/classNames';
import usePortal from '../hooks/usePortal';

export default function NFTListView({
  nft,
  to,
  twTitleStyle,
  twTextStyle,
  handleSubmit_RemoveNFT,
  disableNavigation,
  setCurrentNFT,
  handle_UpNFTs,
  handle_DownNFTs,
  isPublic,
  setIsPublic,
  reseller,
}) {
  const [nftImage, setNFTImage] = useState();
  const { getBlobUrl } = usePortal();

  useEffect(() => {
    (async () => {
      if (nft?.image) {
        const linkUrl = await getBlobUrl(nft.image);
        setNFTImage(linkUrl);
      }
    })();
  }, [nft]);

  const content = (
    <div className="border-fabstir-divide-color1 hover:bg-fabstir-medium-dark-gray group border-b p-4">
      <div className="grid grid-cols-[50px_1fr_auto] items-center gap-6">
        <div className="flex items-center">
          <img
            className="border-fabstir-medium-light-gray lg:w-30 aspect-[10/7] w-20 rounded-md border-[6px] object-cover shadow-sm"
            src={nftImage}
            alt=""
            crossOrigin="anonymous"
          />
        </div>

        {/* Title column */}
        <div className="flex items-center">
          <h3
            className={classNames(
              'text-fabstir-white min-w-0 truncate pr-4 text-sm font-medium',
              twTitleStyle,
            )}
          >
            {nft.name}
          </h3>
        </div>

        {/* Controls column */}
        <div className="flex items-center justify-end space-x-2">
          {handle_UpNFTs && (
            <button
              onClick={() => handle_UpNFTs(nft)}
              className="text-fabstir-light-gray hover:text-white"
            >
              ↑
            </button>
          )}
          {handle_DownNFTs && (
            <button
              onClick={() => handle_DownNFTs(nft)}
              className="text-fabstir-light-gray hover:text-white"
            >
              ↓
            </button>
          )}
        </div>
      </div>

      {nft?.attributes?.['release_date'] && (
        <span className="text-fabstir-light-gray mt-1 block pl-2 text-xs">
          {nft.attributes['release_date']}
        </span>
      )}
    </div>
  );

  return disableNavigation ? (
    content
  ) : (
    <Link
      to={to}
      onClick={() => setCurrentNFT(nft)}
      className="block hover:no-underline"
    >
      {content}
    </Link>
  );
}
