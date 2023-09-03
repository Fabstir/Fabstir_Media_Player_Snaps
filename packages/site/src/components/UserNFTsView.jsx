import React, { useEffect, useState } from 'react';

import UserNFTView from './UserNFTView';

/**
 * Renders the user's NFTs in a gallery view.
 * Receives the user's NFT metadata and styles as props.
 * Filters out null NFTs.
 * Renders the UserNFTView component for each NFT.
 */
export default function UserNFTsView({
  nfts,
  twStyle,
  twTitleStyle,
  twTextStyle,
}) {
  // Initialize state for the NFTs
  const [theNFTs, setTheNfts] = useState();

  return (
    <div className={twStyle}>
      {nfts
        ?.filter((nft) => nft !== null) // Filter out null NFTs
        .map((nft) => (
          <li
            key={nft.name}
            className="mr-4 transform items-center shadow-lg shadow-fabstir-light-purple/50 transition duration-100 ease-in hover:scale-105 hover:text-fabstir-white"
          >
            <UserNFTView
              nft={nft}
              twTitleStyle={twTitleStyle}
              twTextStyle={twTextStyle}
            />
          </li>
        ))}
    </div>
  );
}
