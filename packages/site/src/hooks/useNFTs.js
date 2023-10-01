import React, { useContext } from 'react';
const { Contract } = require('@ethersproject/contracts');
import { useQuery } from '@tanstack/react-query';
import TipERC721 from '../../contracts/TipERC721.json';
import FNFTNestable from '../../contracts/FNFTNestable.json';

import usePortal from './usePortal';
import { S5Client } from '../../../../node_modules/s5client-js/dist/mjs/index';
import BlockchainContext from '../../state/BlockchainContext';
import { loadState } from '../utils';
import useMintNestableNFT from '../blockchain/useMintNestableNFT';
import { useRecoilValue } from 'recoil';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom';

/**
 * Asynchronously retrieves metadata from a given URI.
 *
 * @async
 * @function
 * @param {string} uri - The URI where the metadata is located.
 * @param {function} downloadFile - The function to download the file from the URI.
 * @returns {Object|null} - The parsed JSON object from the URI or null if the JSON is not available.
 */
const getMetadata = async (uri, downloadFile) => {
  const json = await downloadFile(uri, {});

  if (json) {
    return JSON.parse(json);
  }
};

/**
 * Asynchronously fetches NFT metadata from the blockchain and downloads the NFT images.
 *
 * @async
 * @function
 * @param {Object} nftAddresses - The addresses of the NFTs.
 * @param {Object} provider - The blockchain provider.
 * @param {function} downloadFile - The function to download files.
 * @returns {Array} - An array of NFT objects containing metadata and other properties.
 */
const fetchNFTs = async (
  selectedParentNFTAddressId,
  provider,
  downloadFile,
  getIsNestableNFT,
  getChildrenOfNestableNFT,
) => {
  let nftAddresses = {};

  console.log(
    'useNFTs: selectedparentnftaddressid = ',
    selectedParentNFTAddressId,
  );

  let parentId;
  let parentAddress;
  if (selectedParentNFTAddressId) {
    [parentAddress, parentId] = selectedParentNFTAddressId.split('_');

    const children = await getChildrenOfNestableNFT(parentId);
    console.log('useNFTs: children = ', children);

    children.forEach((child) => {
      const addressId = `${child.contractAddress.toString()}_${child.tokenId.toString()}`;
      nftAddresses[addressId] = {};
      console.log('useNFTs: push addressId = ', addressId);
    });
  } else {
    const state = await loadState();
    nftAddresses = state.addresses.state;
  }

  console.log('useNFTs: fetchNFTs nftAddresses = ', nftAddresses);

  const nfts = [];
  for (const address_id in nftAddresses) {
    console.log('useNFTs: address_id = ', address_id);

    if (!selectedParentNFTAddressId) {
      parentId = undefined;
      parentAddress = undefined;
    }

    const [address, id] = address_id.split('_');
    const parsedId = parseInt(id, 10);

    let nftAddress;
    let nftId;

    // if any are nestableNFTs then use the first child as `nft`
    console.log('useNFTs: address = ', address);
    const isNestableNFT = await getIsNestableNFT(address);
    console.log('useNFTs: isNestableNFT = ', isNestableNFT);

    if (isNestableNFT) {
      const contractNestableNFT = new Contract(
        address,
        FNFTNestable.abi,
        provider,
      );

      console.log('useNFTs: before childOf');
      const child = await contractNestableNFT.childOf(id, 0);
      console.log('useNFTs: child = ', child);

      nftAddress = child.contractAddress;
      nftId = child.tokenId.toString();
      parentId = parsedId;
      parentAddress = address;
    } else {
      nftAddress = address;
      nftId = parsedId;
    }

    // Initialize a new ethers Contract instance with the NFT address and provider
    const contract = new Contract(nftAddress, TipERC721.abi, provider);

    const name = await contract.name();
    console.log('useNFTs: name = ', name);

    const symbol = await contract.symbol();
    const uri = await contract.tokenURI(nftId);

    const owner = await contract.ownerOf(nftId);

    // Call the getMetadata function to download the NFT metadata
    const metadata = await getMetadata(uri, downloadFile);
    console.log(`useNFTs: metadata = `, metadata);

    const nft = {
      address: nftAddress,
      name,
      symbol,
      id: nftId,
      owner,
      ...(metadata || {}),
    };

    if (parentAddress || selectedParentNFTAddressId) {
      nft.parentAddress = parentAddress;
    }

    if (parentId || selectedParentNFTAddressId) {
      nft.parentId = parentId;
    }

    nfts.push(nft);

    console.log(`useNFTs: nft = `, nft);
  }

  console.log(`useNFTs: nfts = `, nfts);
  return nfts;
};

/**
 * Custom hook that fetches NFT metadata from the blockchain and downloads the NFT images.
 *
 * @function
 * @param {Object} nftAddresses - An array of NFT addresses.
 * @returns {Object} - The query result from the useQuery hook, containing data and other properties.
 */
export default function useNFTs() {
  const customClientOptions = {};
  const client = new S5Client(
    process.env.NEXT_PUBLIC_PORTAL_URL,
    customClientOptions,
  );

  // Use the usePortal hook to download the NFT images
  const { downloadFile } = usePortal();

  const { getChildrenOfNestableNFT, getIsNestableNFT } = useMintNestableNFT();

  const selectedParentNFTAddressId = useRecoilValue(selectedparentnftaddressid);

  console.log(
    'useNFTs: process.env.NEXT_PUBLIC_PORTAL_URL = ',
    process.env.NEXT_PUBLIC_PORTAL_URL,
  );

  // Use the useContext hook to get the blockchain provider from the BlockchainContext
  const blockchainContext = useContext(BlockchainContext);
  const { provider } = blockchainContext;

  // Use the useQuery hook from react-query to fetch the NFT metadata
  return useQuery(['nfts', selectedParentNFTAddressId], () => {
    return fetchNFTs(
      selectedParentNFTAddressId,
      provider,
      downloadFile,
      getIsNestableNFT,
      getChildrenOfNestableNFT,
    );
  });
}
