import { user } from '../user';

/**
 * Provides a custom hook for deleting an encryption key associated with a specific NFT address ID from a decentralized database.
 * This hook returns a function that, when called with an NFT address ID, logs the operation and sets the encryption key for that NFT to `null`,
 * effectively deleting it. This operation is part of managing encryption keys for NFTs, ensuring that access to encrypted content can be controlled.
 *
 * @hook useDeleteEncKey
 * @returns {Function} A function that takes an NFT address ID as a parameter and deletes its associated encryption key.
 */
export default function useDeleteEncKey() {
  return (nftAddressId) => {
    console.log('useDeleteEncKey: for nft address = ', nftAddressId);

    user.get('nfts_enc_keys').get(nftAddressId).get('enc_key').put(null);
  };
}
