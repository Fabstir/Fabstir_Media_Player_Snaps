import { dbClient, dbClientOnce, dbClientLoad } from '../GlobalOrbit';
import { user } from '../user';
import useContractUtils from '../blockchain/useContractUtils';

export default function useMarketAddress() {
  const { getChainIdAddressFromChainIdAndAddress } = useContractUtils();

  const getMarketAddressFromUser = async (userPub, chainId) => {
    const marketAddresses = await dbClientLoad(
      dbClient.user(userPub).get('NFT market addresses'),
      process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    );

    // Find result element from resultArray string array whose value ends with chainId
    const marketAddress = marketAddresses?.find((element) =>
      element.startsWith(chainId + ':'),
    );
    console.log('useMarketAddress: marketAddress = ', marketAddress);

    return marketAddress;
  };

  const getMarketAddress = async (chainId) => {
    const marketAddresses = await dbClientOnce(
      user.get('NFT market addresses'),
      process.env.NEXT_PUBLIC_GUN_WAIT_TIME,
    );

    // Find result element from resultArray string array whose value ends with chainId
    const marketAddress = marketAddresses?.find((element) =>
      element.startsWith(chainId + ':'),
    );

    return marketAddress;
  };

  const putMarketAddress = (chainId, marketAddress) => {
    const chaindIDMarketAddress = getChainIdAddressFromChainIdAndAddress(
      chainId,
      marketAddress,
    );
    user.get('NFT market addresses').set(chaindIDMarketAddress, (ack) => {
      if (!ack.err) {
        console.log('useMarketAddress: Market address stored successfully');
      } else {
        console.error(
          'useMarketAddress: Error storing market address:',
          ack.err,
        );
      }
    });
  };

  return {
    getMarketAddressFromUser,
    getMarketAddress,
    putMarketAddress,
  };
}
