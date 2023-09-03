import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import TipERC721 from '../../contracts/TipERC721.json';
import { S5Client } from '../../../../node_modules/s5client-js/dist/mjs/index';
import BlockchainContext from '../../state/BlockchainContext';
import { ethers } from 'ethers';

const getMetadata = async (uri, downloadFile) => {
  const json = await downloadFile(uri, {});

  if (json) {
    return JSON.parse(json);
  }
};

/**
 * Fetches NFT metadata from the blockchain and downloads the NFT image.
 * Receives the NFT address, provider, and downloadFile function as parameters.
 * Initializes a new ethers Contract instance with the NFT address and provider.
 * Calls the name, symbol, and tokenURI methods to get the NFT metadata.
 * Calls the getMetadata function to download the NFT image and get the metadata.
 * Returns an NFT object.
 */
export const fetchNFT = async (nftAddress, provider, downloadFile) => {
  if (!nftAddress) return null;

  // Initialize a new ethers Contract instance with the NFT address and provider
  const contract = new ethers.Contract(nftAddress, TipERC721.abi, provider);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const uri = await contract.tokenURI(1);

  // Call the getMetadata function to download the NFT metadata
  const metadata = await getMetadata(uri, downloadFile);

  // Create an NFT object with the metadata
  const nft = {
    address: nftAddress,
    name,
    symbol,
    ...metadata,
  };
  console.log('useNFT: nft = ', nft);

  return nft;
};

/**
 * Custom hook that fetches NFT metadata from the blockchain and downloads the NFT image.
 * Receives an NFT address as a parameter.
 * Initializes a new S5Client instance with the portal URL and custom options.
 * Uses the usePortal hook to download the NFT image.
 * Uses the useContext hook to get the blockchain provider from the BlockchainContext.
 * Uses the useQuery hook from react-query to fetch the NFT metadata.
 * Returns the query result.
 */
export default function useNFT(nftAddress) {
  const customClientOptions = {};
  const client = new S5Client(
    process.env.NEXT_PUBLIC_PORTAL_URL,
    customClientOptions,
  );
  const { downloadFile } = usePortal();

  // Use the useContext hook to get the blockchain provider from the BlockchainContext
  const blockchainContext = useContext(BlockchainContext);
  const { provider } = blockchainContext;

  // Use the useQuery hook from react-query to fetch the NFT metadata
  return useQuery(
    ['nft', nftAddress],
    () => fetchNFT(nftAddress, provider, downloadFile),
    {
      placeholderData: () =>
        queryClient
          .getQueryData(['nfts'])
          ?.find((d) => d.nftAddress == nftAddress),
      staleTime: 10000,
    },
  );
}
