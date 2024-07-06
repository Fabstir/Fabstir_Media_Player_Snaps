export const getBadgeAddressId = (badge) => {
  return `${badge.address}_${badge.tokenId}`
}

export const splitBadgeAddressId = (nftAddressId) => {
  const [address, id] = address_id.split('_')
  return { address, id }
}

export const constructBadgeAddressId = (address, id) => {
  return `${address}_${id}`
}
