import { SEA } from 'gun';
import { dbClient } from '../GlobalOrbit';
import { convertAttributesToNFT721Convention } from '../utils/nftUtils';
import useIPFS from './useIPFS';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useUserProfile from './useUserProfile';
import useCreateMarketItem from '../blockchain/useCreateMarketItem';

export default function useSellNFT() {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const [, , , , getMarketAddress] = useUserProfile();

  const { createMarketNFT721Item, createMarketNFT1155Item } =
    useCreateMarketItem();

  const sellNFT = async (userPub, amount, price, resellerFeeRatio) => {
    const startTime = ethers.BigNumber.from(parseInt(Date.now() / 1000));
    const endTime = ethers.constants.MaxUint256;
    const cancelTime = endTime;

    const marketAddress = await getMarketAddress(userPub);
    (async () => {
      try {
        let marketItemId;
        if (await getIsERC721(nft)) {
          const result = await createMarketNFT721Item(
            marketAddress,
            nft,
            data.currency,
            ethers.BigNumber.from(amount),
            price,
            price,
            startTime,
            endTime,
            cancelTime,
            resellerFeeRatio ? resellerFeeRatio : ethers.constants.Zero,
          );
          marketItemId = result.marketItemId.toNumber();
        } else if (await getIsERC1155(nft)) {
          const result = await createMarketNFT1155Item(
            marketAddress,
            nft,
            data.currency,
            ethers.BigNumber.from(amount),
            price,
            price,
            startTime,
            endTime,
            cancelTime,
            resellerFeeRatio ? resellerFeeRatio : ethers.constants.Zero,
          );
          marketItemId = result.marketItemId.toNumber();
        } else throw new Error('SellNFT: NFT is not ERC721 or ERC1155');

        console.log(`SellNFT: marketItemId = ${marketItemId}`);

        // A new salesSeaPair is generated specifically for the sale.
        const marketItemSEAPair = await createMarketItemSEAPair();

        // The seller retrieves the existing video decryption key from their GUN user graph
        const key = await getEncKey(userAuthPub, nft);

        if (key) {
          // The video key is then re-encrypted with the salesSeaPair's public key and stored in a marketplace node within the seller's user graph
          await putMarketItemKey(marketItemId, marketItemSEAPair, key);

          // The seller encrypts the marketItemSEAPair with the subscription controller's public key
          const passphrase = await SEA.secret(
            process_env.SUBSCRIPTION_CONTROLLER_EPUB,
            user._.sea,
          );

          const scrambledMarketItemSEAPair = await SEA.encrypt(
            { marketItemSEAPair, marketAddress, marketItemId },
            passphrase,
          );
          console.log(
            'SellNFT: scrambledMarketItemSEAPair = ',
            scrambledMarketItemSEAPair,
          );

          console.log(
            'SellNFT: process_env.SUBSCRIPTION_CONTROLLER_EPUB = ',
            process_env.SUBSCRIPTION_CONTROLLER_EPUB,
          );

          console.log('SellNFT: user._.sea = ', user._.sea);

          await submitEncryptedMarketItemKey(
            userAuthPub,
            marketItemId,
            scrambledMarketItemSEAPair,
          );
        }

        setSubmitText('On Sale');
        setRerender((prev) => prev + 1);

        setOpen(false);
      } catch (err) {
        alert(err.message);
      }
    })();
  };

  return { sellNFT };
}
