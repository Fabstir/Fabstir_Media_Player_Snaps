import React, { useEffect, useState } from 'react';

import UserNFTsView from './UserNFTsView';
import useNFTs from '../hooks/useNFTs';

/**
 * Renders the user's NFTs section.
 * Receives the user's NFT addresses and styles as props.
 * Uses the useNFTs hook to fetch the NFT metadata for each address.
 * Filters the NFTs based on the selected filters.
 * Renders the UserNFTsView component to display the filtered NFTs.
 */
export default function UserNFTsSection({
  nftAddresseObjects,
  twStyle,
  twTitleStyle,
  twTextStyle,
}) {
  if (!nftAddresseObjects) {
    return <></>;
  }

  // Extract NFT addresses from nftAddresseObjects
  let nftAddresses = [];
  Object.keys(nftAddresseObjects).map((address) => nftAddresses.push(address));

  // Fetch NFT metadata for each address
  const nfts = useNFTs(nftAddresseObjects);

  // Filter NFTs based on selected filters
  const [filteredUserNFTs, setFilteredUserNFTs] = useState();

  useEffect(() => {
    setFilteredUserNFTs(nfts.data);
    console.log('UserNFTsSection: nfts.data = ', nfts.data);
  }, [nfts, nfts.data]);

  // Render UserNFTsView component to display filtered NFTs
  return (
    <main className="h-screen flex-1 rounded-sm bg-fabstir-light-purple">
      {/* Gallery */}
      <section className="mt-8 pb-16" aria-labelledby="gallery-heading">
        {filteredUserNFTs && (
          <UserNFTsView
            nfts={filteredUserNFTs}
            twStyle={twStyle}
            twTitleStyle={twTitleStyle}
            twTextStyle={twTextStyle}
          />
        )}
      </section>
    </main>
  );
}
