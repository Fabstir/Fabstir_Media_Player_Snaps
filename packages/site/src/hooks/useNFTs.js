import { Zero } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { useQuery } from '@tanstack/react-query';
import useMintNFT from '../blockchain/useMintNFT';
import { dbClient, dbClientOnce, dbClientLoad } from '../GlobalOrbit';
import useUserProfile from './useUserProfile';
import FNFTNestable from '../../contracts/FNFTNestable.json';

import { constructNFTAddressId, splitNFTAddressId } from '../utils/nftUtils.js';
import { useRecoilValue } from 'recoil';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom.js';
import { fetchNFT } from './useNFT.js';
import useMintNestableNFT from '../blockchain/useMintNestableNFT';
import useReplaceNFT from './useReplaceNFT.js';
import useContractUtils from '../blockchain/useContractUtils';
import { parseArrayProperties } from '../utils/stringifyProperties';
import { useMintNestableERC1155NFT } from '../blockchain/useMintNestableERC1155NFT';

const swapAnyNestableNFTWithFirstChild = async (
  userPub,
  nfts,
  getIsNestableNFT,
  getChildrenOfNestable721NFT,
  getChildrenOfNestable1155NFT,
  selectedParentNFTAddressId,
  newReadOnlyContract,
  getChainIdFromChainIdAddress,
  getChainIdAddressFromChainIdAndAddress,
) => {
  if (!nfts) return [];

  const updatedNFTs = [];

  const { address: parentAddress, id: parentId } = selectedParentNFTAddressId
    ? splitNFTAddressId(selectedParentNFTAddressId)
    : { address: null, id: null };

  for (const idx in nfts) {
    const nft = nfts[idx];

    // if any are nestableNFTs then use the first child as `nft`
    console.log('useMintNFt: swapAnyParentWithFirstChild: nft = ', nft);
    const nftAddress = nft.address;
    const isNestable = await getIsNestableNFT(nft);
    console.log(
      'useMintNFt: swapAnyParentWithFirstChild: isNestable = ',
      isNestable,
    );

    if (isNestable) {
      console.log(
        `useMintNFt: swapAnyParentWithFirstChild: nftAddress = ${nftAddress}`,
      );
      const contractNestableNFT = newReadOnlyContract(
        nftAddress,
        FNFTNestable.abi,
      );

      console.log('useMintNFt: swapAnyParentWithFirstChild: before childOf');
      const child = await contractNestableNFT.childOf(
        BigNumber.from(nft.id),
        Zero,
      );
      console.log('useMintNFt: swapAnyParentWithFirstChild: child = ', child);

      let nftAddressId = constructNFTAddressId(
        child.contractAddress,
        child.tokenId.toString(),
      );
      const chainId = getChainIdFromChainIdAddress(nft.address);
      nftAddressId = getChainIdAddressFromChainIdAndAddress(
        chainId,
        nftAddressId,
      );

      const childNFT = await fetchNFT(userPub, nftAddressId);

      console.log(
        'useMintNFt: swapAnyParentWithFirstChild: childNFT = ',
        childNFT,
      );

      if (parentId || selectedParentNFTAddressId) {
        childNFT.parentId = parentId;

        if (isNestable) {
          const modelUris = await getModelUrisFromNestedNFT(
            userPub,
            parentId,
            childNFT.multiToken
              ? getChildrenOfNestableERC1155NFT
              : getChildrenOfNestableERC721NFT,
          );
          if (modelUris && modelUris.length > 0) {
            childNFT.fileUrls.push(...modelUris);
          }
        }
      }

      updatedNFTs.push({ ...childNFT, isNestable });
    } else {
      if (!nft.parentId || Number(nft.parentId) === Number(parentId))
        updatedNFTs.push(nft);
    }
  }

  return updatedNFTs;
};

export const fetchScopedNFTs = async (userPub, userProfile) => {
  console.log('useNFTs: timeout = ', process.env.NEXT_PUBLIC_GUN_TIMEOUT);

  const resultArray = await dbClientOnce(
    dbClient.user(userPub).get('nfts'),
    process.env.NEXT_PUBLIC_GUN_TIMEOUT,
  );

  console.log('fetchNFTs: resultArray = ', resultArray);

  console.log('fetchNFTs: userProfile = ', userProfile);
  console.log(
    'fetchNFTs: userProfile?.accountAddress = ',
    userProfile?.accountAddress,
  );

  const parsedResultArray = resultArray?.map((element) =>
    parseArrayProperties(element),
  );
  return parsedResultArray;

  // const userAccountAddress = userProfile.accountAddress

  // const ownNFTs = await getOwnNFTs(userAccountAddress, resultArray)

  // console.log('fetchNFTs: ownNFTs = ', ownNFTs)

  // return ownNFTs
};

async function getModelUrisFromNestedNFT(
  userPub,
  id,
  getChildrenOfNestableNFT,
) {
  const children = await getChildrenOfNestableNFT(id);
  if (!children || children.length === 0) return;

  const uris = [];
  for (const child of children) {
    const address_id = `${child.contractAddress.toString()}_${child.tokenId.toString()}`;

    const nft = await fetchNFT(userPub, address_id);

    if (nft.fileUrls) {
      for (const fileUrl of nft.fileUrls) {
        const [urlBefore] = fileUrl.split('<<');
        if (
          urlBefore.toLowerCase().endsWith('.obj') ||
          urlBefore.toLowerCase().endsWith('.gltf')
        ) {
          uris.push(fileUrl);
        }
      }
    }
  }

  return uris;
}

export const fetchNFTs = async (
  selectedParentNFTAddressId,
  userPub,
  getUserProfile,
  getOwnNFTs,
  getIsNestableNFT,
  getChildrenOfNestable721NFT,
  getChildrenOfNestable1155NFT,
  newReadOnlyContract,
  getChainIdFromChainIdAddress,
  getChainIdAddressFromChainIdAndAddress,
  getIsERC1155Address,
) => {
  console.log('useNFTs: userPub = ', userPub);

  console.log(
    'useNFTs: selectedparentnftaddressid = ',
    selectedParentNFTAddressId,
  );

  let ownNFTs;

  const userProfile = await getUserProfile(userPub);

  if (selectedParentNFTAddressId) {
    const userAccountAddress = userProfile.accountAddress;
    const { address: parentAddress, id: parentId } = splitNFTAddressId(
      selectedParentNFTAddressId,
    );

    ownNFTs = await getOwnNFTs(userAccountAddress, [
      { address: parentAddress, id: parentId },
    ]);
    if (ownNFTs.length === 0) return [];

    console.log('useNFTs: before splitNFTAddressId');

    console.log('useNFTs: parentAddress = ', parentAddress);
    console.log('useNFTs: parentId = ', parentId);

    const children = (await getIsERC1155Address(parentAddress))
      ? await getChildrenOfNestable1155NFT(parentId)
      : await getChildrenOfNestable721NFT(parentId);
    console.log('useNFTs: children = ', children);

    const nfts = [];
    for (const child of children) {
      let addressId = constructNFTAddressId(
        child.contractAddress.toString(),
        child.tokenId.toString(),
      );

      const chainId = getChainIdFromChainIdAddress(parentAddress);
      addressId = getChainIdAddressFromChainIdAndAddress(chainId, addressId);

      const nft = await fetchNFT(userPub, addressId);
      nfts.push(nft);
      console.log('useNFTs: push nft = ', nft);
    }

    ownNFTs = nfts;
  } else {
    ownNFTs = await fetchScopedNFTs(userPub, userProfile);
  }

  console.log('fetchNFTs: ownNFTs from parent = ', ownNFTs);
  const resultNFTs = await swapAnyNestableNFTWithFirstChild(
    userPub,
    ownNFTs,
    getIsNestableNFT,
    getChildrenOfNestable721NFT,
    getChildrenOfNestable1155NFT,
    selectedParentNFTAddressId,
    newReadOnlyContract,
    getChainIdFromChainIdAddress,
    getChainIdAddressFromChainIdAndAddress,
  );
  console.log('fetchNFTs: ownNFTs from resultNFTs = ', resultNFTs);
  return resultNFTs;
};

export default function useNFTs(userPub) {
  const { getOwnNFTs, getIsERC1155Address } = useMintNFT();
  const [getUserProfile] = useUserProfile();

  const { getChildrenOfNestableNFT: getChildrenOfNestable721NFT } =
    useMintNestableNFT();
  const { getChildrenOfNestableNFT: getChildrenOfNestable1155NFT } =
    useMintNestableERC1155NFT();

  const { getIsNestableNFT } = useReplaceNFT();

  const selectedParentNFTAddressId = useRecoilValue(selectedparentnftaddressid);

  const {
    newReadOnlyContract,
    getChainIdFromChainIdAddress,
    getChainIdAddressFromChainIdAndAddress,
  } = useContractUtils();

  return useQuery([userPub, 'nfts', selectedParentNFTAddressId], () => {
    if (userPub !== null)
      return fetchNFTs(
        selectedParentNFTAddressId,
        userPub,
        getUserProfile,
        getOwnNFTs,
        getIsNestableNFT,
        getChildrenOfNestable721NFT,
        getChildrenOfNestable1155NFT,
        newReadOnlyContract,
        getChainIdFromChainIdAddress,
        getChainIdAddressFromChainIdAndAddress,
        getIsERC1155Address,
      );
    else return [];
  });
}
