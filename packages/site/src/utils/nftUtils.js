export const getNFTAddressId = (nft) => {
  return `${nft.address}_${nft.id}`;
};

export const splitNFTAddressId = (nftAddressId) => {
  const [address, id] = nftAddressId.split('_');
  return { address, id };
};

export const constructNFTAddressId = (address, id) => {
  return `${address}_${id}`;
};

export const getUniqueKeyFromNFT = (nft) => {
  return `${constructNFTAddressId(nft.address, nft.id)}${
    nft.parentId ? `_` + nft.parentId : ''
  }`;
};

export const convertAttributesToNFT721Convention = (attributes) => {
  const nftAttributes = [];
  for (const key in attributes) {
    nftAttributes.push({
      trait_type: key,
      value: attributes[key],
    });
  }
  return nftAttributes;
};

export const getCidWithoutKeyFromNFT = (nft) => {
  let cidWithoutKey = nft.video ? nft.video : nft.audio ? nft.audio : null;

  if (cidWithoutKey === null) {
    throw new Error('getCidWithoutKey: No video or audio found');
  }

  return cidWithoutKey;
};
