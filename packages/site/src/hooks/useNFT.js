import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import { parseArrayProperties } from '../utils/stringifyProperties';
import TipERC721 from '../../contracts/TipERC721.json';
import TipERC1155 from '../../contracts/TipERC1155.json';
import { S5Client } from '../../../../node_modules/s5client-js/dist/mjs/index';
import BlockchainContext from '../../state/BlockchainContext';
import { useContext } from 'react';
import usePortal from './usePortal.js';
import { dbClient } from '../GlobalOrbit';

export const fetchNFT = async (userPub, nftAddressId) => {
  if (!nftAddressId) return null;

  const resultRetrieved = await new Promise((res) =>
    dbClient
      .user(userPub)
      .get('nfts')
      .get(nftAddressId)
      .once((final_value) => res(final_value)),
  );

  const result = parseArrayProperties(resultRetrieved);
  return result;
};

/**
 * Asynchronously retrieves metadata from a given URI.
 *
 * @async
 * @function
 * @param {string} uri - The URI to fetch metadata from.
 * @param {function} downloadFile - The function to use for downloading the file from the URI.
 * @returns {Promise<Object|null>} - A promise that resolves to the metadata object or null if the metadata could not be retrieved.
 */
const getMetadata = async (uri, downloadFile) => {
  const json = await downloadFile(uri, {});
  return json;

  // if (json) {
  //   return JSON.parse(json);
  // }
};

/**
 * Asynchronously fetches NFT metadata from the blockchain and downloads the NFT image.
 *
 * @async
 * @function
 * @param {string} address_id - The address of the NFT.
 * @param {Object} provider - The blockchain provider.
 * @param {function} downloadFile - The function to use for downloading files.
 * @returns {Promise<Object|null>} - A promise that resolves to an NFT object containing the metadata or null if the NFT address is not provided.
 */
export const fetchNFTOnChain = async (
  address_id,
  newReadOnlyContract,
  downloadFile,
) => {
  if (!address_id) return null;

  const [address, id] = address_id.split('_');
  const parsedId = parseInt(id, 10);

  // Initialize a new Contract instance with the NFT address and provider
  const contract = newReadOnlyContract(address, TipERC721.abi);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const uri = await contract.tokenURI(parsedId);

  // Call the getMetadata function to download the NFT metadata
  const metadata = await getMetadata(uri, downloadFile);

  // Create an NFT object with the metadata
  const nft = {
    address: address,
    name,
    symbol,
    ...metadata,
  };
  console.log('useNFT: nft = ', nft);

  return nft;
};

export const fetchNFT1155OnChain = async (
  address_id,
  newReadOnlyContract,
  downloadFile,
) => {
  if (!address_id) return null;

  const [address, id] = address_id.split('_');
  const parsedId = parseInt(id, 10);

  // Initialize a new Contract instance with the NFT address and provider
  const contract = newReadOnlyContract(address, TipERC1155.abi);
  const uri = await contract.uri(parsedId);

  // Call the getMetadata function to download the NFT metadata
  const metadata = await getMetadata(uri, downloadFile);

  // Create an NFT object with the metadata
  const nft = {
    address: address,
    ...metadata,
  };
  console.log('useNFT: nft = ', nft);

  return nft;
};

/**
 * Custom hook that fetches NFT metadata from the blockchain and downloads the NFT image.
 *
 * @function
 * @param {string} address_id - The address of the NFT.
 * @returns {Object} - The query result containing the NFT metadata and other query information.
 */
export default function useNFT(address_id) {
  const customClientOptions = {};
  const client = new S5Client(
    process.env.NEXT_PUBLIC_PORTAL_URL,
    customClientOptions,
  );
  const { downloadFile } = usePortal();
  const { newReadOnlyContract } = useContractUtils();

  // Use the useContext hook to get the blockchain provider from the BlockchainContext
  const blockchainContext = useContext(BlockchainContext);

  // Use the useQuery hook from react-query to fetch the NFT metadata
  return useQuery(
    ['nft', address_id],
    () => fetchNFT(address_id, newReadOnlyContract, downloadFile),
    {
      placeholderData: () =>
        queryClient
          .getQueryData(['nfts'])
          ?.find((d) => d.nftAddress == address_id),
      staleTime: 10000,
    },
  );
}
