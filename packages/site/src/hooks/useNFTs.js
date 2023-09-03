import React, { useContext } from 'react';
import { ethers } from 'ethers';
import { useQuery } from '@tanstack/react-query';
import TipERC721 from '../../contracts/TipERC721.json';
import usePortal from './usePortal';
import { S5Client } from '../../../../node_modules/s5client-js/dist/mjs/index';
import BlockchainContext from '../../state/BlockchainContext';

const getMetadata = async (uri, downloadFile) => {
  const json = await downloadFile(uri, {});

  if (json) {
    return JSON.parse(json);
  }
};

/**
 * Fetches NFT metadata from the blockchain and downloads the NFT images.
 * Receives the NFT addresses, provider, and downloadFile function as parameters.
 * Initializes a new ethers Contract instance with the NFT address and provider.
 * Calls the name, symbol, and tokenURI methods to get the NFT metadata.
 * Calls the getMetadata function to download the NFT  metadata.
 * Returns an array of NFT objects.
 */
const fetchNFTs = async (nftAddresses, provider, downloadFile) => {
  //const provider = new ethers.providers.JsonRpcProvider();
  console.log('useNFTs: fetchNFTs nftAddresses = ', nftAddresses);
  console.log('useNFTs: fetchNFTs');

  const nfts = [];

  for (const address in nftAddresses) {
    console.log('useNFTs: address = ', address);

    // Initialize a new ethers Contract instance with the NFT address and provider
    const contract = new ethers.Contract(address, TipERC721.abi, provider);

    const name = await contract.name();
    console.log('useNFTs: name = ', name);

    const symbol = await contract.symbol();
    const uri = await contract.tokenURI(1);

    // Call the getMetadata function to download the NFT metadata
    const metadata = await getMetadata(uri, downloadFile);

    const nft = {
      address,
      name,
      symbol,
      ...metadata,
    };

    nfts.push(nft);

    console.log(`useNFTs: nft = `, nft);
  }

  return nfts;
};

/**
 * Custom hook that fetches NFT metadata from the blockchain and downloads the NFT images.
 * Receives an array of NFT addresses as a parameter.
 * Initializes a new S5Client instance with the portal URL and custom options.
 * Uses the usePortal hook to download the NFT images.
 * Uses the useQuery hook from react-query to fetch the NFT metadata.
 * Returns the query result.
 */
export default function useNFTs(nftAddresses) {
  const customClientOptions = {};
  const client = new S5Client(
    process.env.NEXT_PUBLIC_PORTAL_URL,
    customClientOptions,
  );

  console.log('useNFTs: nftAddresses = ', nftAddresses);

  // Use the usePortal hook to download the NFT images
  const { downloadFile } = usePortal();

  console.log(
    'useNFTs: process.env.NEXT_PUBLIC_PORTAL_URL = ',
    process.env.NEXT_PUBLIC_PORTAL_URL,
  );

  // Use the useContext hook to get the blockchain provider from the BlockchainContext
  const blockchainContext = useContext(BlockchainContext);
  const { provider } = blockchainContext;

  // Use the useQuery hook from react-query to fetch the NFT metadata
  return useQuery(['nfts'], () => {
    return fetchNFTs(nftAddresses.state, provider, downloadFile);
  });
}
