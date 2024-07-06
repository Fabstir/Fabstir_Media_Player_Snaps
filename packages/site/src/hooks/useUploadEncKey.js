import { user } from '../user';

export default function useUploadEncKey() {
  //  const userPub = useRecoilValue(userpubstate)

  return async ({ nftAddressId, encKey }) => {
    const encKeyScrambled = await SEA.encrypt(encKey, user._.sea);
    console.log('useUploadEncKey: encKeyScrambled = ', encKeyScrambled);

    user
      .get('nfts_enc_keys')
      .get(nftAddressId)
      .get('enc_key')
      .put(encKeyScrambled, (ack) => {
        if (ack.err) {
          console.log(
            `useUploadEncKey: Error updating encryption key for NFT address ID: ${nftAddressId}, put operation failed:`,
            ack.err,
          );
        } else {
          console.log(
            `useUploadEncKey: Successfully updated encryption key for NFT address ID: ${nftAddressId}`,
          );
        }
      });
  };
}
