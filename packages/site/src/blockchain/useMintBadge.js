import { ethers } from 'ethers';
import { useContext } from 'react';
import { arrayify, splitSignature } from '@ethersproject/bytes';
import { Web3Provider } from '@ethersproject/providers';
import { pack } from '@ethersproject/solidity';
import { verifyMessage } from '@ethersproject/wallet';
import { AddressZero } from '@ethersproject/constants';

import ABTToken from '../../contracts/ABTToken.json';
import FNFTFactoryABTToken from '../../contracts/FNFTFactoryABTToken.json';
import IERC165 from '../../contracts/IERC165.json';

import BlockchainContext from '../../state/BlockchainContext';
import { useRecoilValue } from 'recoil';
import useUserProfile from '../hooks/useUserProfile';
import { queryClient } from '../../pages/_app.tsx';
import useAccountAbstractionPayment from './useAccountAbstractionPayment';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { getAddressFromContractEvent } from '../utils/blockchainUtils';
import useContractUtils from './useContractUtils';

export default function useMintBadge() {
  const blockchainContext = useContext(BlockchainContext);
  const {
    smartAccount,
    smartAccountProvider,
    directProvider,
    connectedChainId,
  } = blockchainContext;

  const { processTransactionBundle } =
    useAccountAbstractionPayment(smartAccount);
  const {
    getChainIdAddressFromContractAddresses,
    getChainIdAddressFromChainIdAndAddress,
    getAddressFromChainIdAddress,
    newReadOnlyContract,
    newContract,
  } = useContractUtils();

  const [getUserProfile] = useUserProfile();

  const userAuthPub = useRecoilValue(userauthpubstate);

  const deployBadge = async (userPub, badge) => {
    const userAuthProfile = await getUserProfile(userAuthPub);

    const fnftFactoryABTTokenAddress = getChainIdAddressFromContractAddresses(
      connectedChainId,
      'NEXT_PUBLIC_FNFTFACTORY_ABT_TOKEN_ADDRESS',
    );

    // deploy ABT token
    const fnftFactoryABTToken = newContract(
      fnftFactoryABTTokenAddress,
      FNFTFactoryABTToken.abi,
      smartAccountProvider,
    );

    const { receipt } = await processTransactionBundle([
      [
        await fnftFactoryABTToken.populateTransaction.deploy(
          badge.name,
          badge.symbol,
          userAuthProfile.accountAddress,
        ),
        fnftFactoryABTTokenAddress,
      ],
    ]);

    // get address of abtToken
    console.log(
      'useMintBadge: fnftABTTokenAddress deployment receipt = ',
      receipt,
    );

    let fnftABTTokenAddress = getAddressFromContractEvent(
      receipt,
      FNFTFactoryABTToken.abi,
      'ABTTokenCreated',
      'abtToken',
    );

    fnftABTTokenAddress = getChainIdAddressFromChainIdAndAddress(
      connectedChainId,
      fnftABTTokenAddress,
    );

    return { address: fnftABTTokenAddress };
  };

  const getSignature = async (userPub, badge, userPubFrom) => {
    try {
      // First make sure smart account is initialized
      // await smartAccount.init();

      const userProfile = await getUserProfile(userPub);
      const userProfileFrom = await getUserProfile(userPubFrom);

      // Add these logs to check which addresses are being used
      const wrappedSigner = smartAccountProvider.getSigner();

      console.log('Addresses:', {
        directProviderAddress: await directProvider.getSigner().selectedAddress, // EOA address
        // wrappedSignerAddress: await wrappedSigner.getAddress(), // Should be smart account address
        smartAccountAddress: await smartAccount.getAddress(),
      });

      const abtToken = new ethers.Contract(
        getAddressFromChainIdAddress(badge.address),
        ABTToken.abi,
        smartAccountProvider.getSigner(),
      );

      const hash = await abtToken.getHash(
        userProfile.accountAddress,
        userProfileFrom.accountAddress,
        badge.uri,
      );

      const signer = directProvider.getSigner();
      const flatSig = await signer.signMessage(arrayify(hash));
      console.log('useMintBadge: getSignature flatSig = ', flatSig);

      return flatSig;

      // // Try using the smart account provider directly for signing
      // try {
      //   // First attempt: Use smart account's provider directly
      //   const flatSig = await smartAccount.provider.signMessage(hash);
      //   return flatSig;
      // } catch (signError) {
      //   console.log('First signing attempt failed:', signError);

      //   // Second attempt: Use wrapped provider
      //   const signer = smartAccountProvider.getSigner();
      //   const flatSig = await signer.signMessage(arrayify(hash));
      //   return flatSig;
      // }
    } catch (error) {
      console.error('Detailed error in getSignature:', {
        error,
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  };

  const giveBadge = async (badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newContract(
      badge.address,
      ABTToken.abi,
      smartAccountProvider,
    );

    console.log(`useMintBadge: giveBadge from={signerAccountAddress}`);

    console.log(
      `useMintBadge: giveBadge badge.to=${badge.to}, badge.uri=${badge.uri}, badge.signature=${badge.signature}`,
    );

    const userProfileTo = await getUserProfile(badge.taker);

    const userOps = [];

    userOps.push([
      await abtToken.populateTransaction.setEOA(
        getAddressFromChainIdAddress(badge.to),
        userProfileTo.accountAddress,
      ),
      getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        abtToken.address,
      ),
    ]);

    userOps.push([
      await abtToken.populateTransaction.give(
        getAddressFromChainIdAddress(badge.to),
        badge.uri,
        badge.signature,
      ),
      getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        abtToken.address,
      ),
    ]);

    const { receipt } = await processTransactionBundle(userOps);

    console.log('useMintBadge: TipNFT deployment receipt = ', receipt);

    const tokenId = getAddressFromContractEvent(
      receipt,
      ABTToken.abi,
      'Transfer',
      2,
    );

    console.log(
      `useMintBadge: giveBadge { address: ${abtToken.address}, uri: ${badge.uri}, tokenId: ${tokenId} }`,
    );

    return tokenId;
  };

  const takeBadge = async (badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newContract(
      badge.address,
      ABTToken.abi,
      smartAccountProvider,
    );

    console.log(
      `useMintBadge: takeBadge take=${badge.from}, uri=${badge.uri}, signature=${badge.signature}`,
    );

    const { receipt } = await processTransactionBundle([
      [
        await abtToken.populateTransaction.take(
          getAddressFromChainIdAddress(badge.from),
          badge.uri,
          badge.signature,
        ),
        getChainIdAddressFromChainIdAndAddress(
          connectedChainId,
          abtToken.address,
        ),
      ],
    ]);

    console.log('useMintBadge: TipNFT deployment receipt = ', receipt);

    const tokenId = getAddressFromContractEvent(
      receipt,
      ABTToken.abi,
      'Transfer',
      2,
    );

    console.log(
      `useMintBadge: takeBadge { address: ${abtToken.address}, uri: ${badge.uri}, tokenId: ${tokenId} }`,
    );

    return tokenId;
  };

  // Revokes a badge from a user by interacting with the ABTToken contract
  const revokeBadge = async (userAuthPub, userPub, badge) => {
    if (!isABTToken(badge)) return;

    const userProfile = await getUserProfile(userPub);

    // newly deployed Badge, token starts from id 1

    const abtToken = newContract(
      badge.address,
      ABTToken.abi,
      smartAccountProvider,
    );

    console.log(
      `useMintBadge: takeBadge take=${badge.from}, uri=${badge.uri}, signature=${badge.signature}`,
    );

    await processTransactionBundle([
      [
        await abtToken.populateTransaction.revoke(
          userProfile.accountAddress,
          badge.uri,
          badge.signature,
        ),
        getChainIdAddressFromChainIdAndAddress(
          connectedChainId,
          abtToken.address,
        ),
      ],
    ]);

    console.log(`useMintBadge: exit revokeBadge`);
  };

  // Giver cancels taker's request
  const cancelRequest = async (badge) => {
    if (!isABTToken(badge)) return;

    // newly deployed Badge, token starts from id 1

    const abtToken = newContract(
      badge.address,
      ABTToken.abi,
      smartAccountProvider,
    );

    console.log(
      `useMintBadge: cancelRequest to=${badge.to}, uri=${badge.uri}, signature=${badge.signature}`,
    );

    const userProfileTo = await getUserProfile(badge.taker);

    const userOps = [];

    userOps.push([
      await abtToken.populateTransaction.setEOA(
        getAddressFromChainIdAddress(badge.to),
        userProfileTo.accountAddress,
      ),
      getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        abtToken.address,
      ),
    ]);

    userOps.push([
      await abtToken.populateTransaction.cancelRequest(
        getAddressFromChainIdAddress(badge.to),
        badge.uri,
        badge.signature,
      ),
      getChainIdAddressFromChainIdAndAddress(
        connectedChainId,
        abtToken.address,
      ),
    ]);

    const { receipt } = await processTransactionBundle(userOps);
    console.log('useMintBadge: cancelRequest: receipt = ', receipt);
  };

  const unequip = async (userPub, badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newContract(
      badge.address,
      ABTToken.abi,
      smartAccountProvider,
    );

    const { receipt } = await processTransactionBundle([
      [
        await abtToken.populateTransaction.unequip(badge.tokenId),
        badge.address,
      ],
    ]);

    console.log('useMintBadge: unequip receipt = ', receipt);
    console.log('useMintBadge: unequip badge.tokenId = ', badge.tokenId);
  };

  // call ERC-165 supportsInterface
  // return true if interface ABT token is supported
  const isABTToken = async (badge) => {
    if (!badge?.address) return false;

    const iERC165 = newReadOnlyContract(badge.address, IERC165.abi);

    let result;
    try {
      const abtTokenInterfaceId = 0x5164cf47;
      result = await iERC165.supportsInterface(abtTokenInterfaceId);
    } catch (error) {
      console.error('useMintBadge: isABTToken: error=', error);
    }
    console.log('useMintBadge: isABTToken: result=', result);

    return result;
  };

  const getOwnBadges = async (userAccountAddress, badges) => {
    if (!badges) return [];

    const ownBadges = [];

    console.log(
      'userMint: getOwnBadges userAccountAddress = ',
      userAccountAddress,
    );
    for (const idx in badges) {
      const badge = badges[idx];

      if (!badge?.address) continue;
      const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);
      const balance = await abtToken.balanceOf(userAccountAddress);
      console.log('userMint: getOwnBadges balance = ', balance);
      if (balance > 0) ownBadges.push(badge);
    }

    return ownBadges;
  };

  const getNextTokenId = async (badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);
    const tokenId = await abtToken.nextTokenId();

    return tokenId;
  };

  const minterOf = async (badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);
    let minter;
    try {
      minter = await abtToken.minter();
    } catch (error) {
      console.error('Error fetching minter:', error);
      minter = undefined;
    }

    console.log(
      'useMintBadge: minterOf minter === ethers.constants.AddressZero = ',
      minter === AddressZero,
    );
    if (minter === AddressZero && badge.tokenId)
      minter = await abtToken.minterOf(badge.tokenId);

    return minter;
  };

  const balanceOf = async (userPub, badge) => {
    if (!isABTToken(badge)) return;

    const userProfile = await getUserProfile(userPub);

    const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);
    const balance = await abtToken.balanceOf(userProfile.accountAddress);

    console.log('useMintBadge: badge.balanceOf = ', balance);
    return balance;
  };

  const ownerOf = async (badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);
    console.log('useMintBadge: badge.tokenId = ', badge.tokenId);
    const owner = await abtToken.ownerOf(badge.tokenId);

    console.log('useMintBadge: owner = ', owner);
    return owner;
  };

  const gettokenURI = async (badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);
    const tokenURI = await abtToken.tokenURI(badge.tokenId);

    return tokenURI;
  };

  const isUsed = async (active, passive, badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);

    const activeProfile = await getUserProfile(active);

    const used = await abtToken.isUsed(
      activeProfile.accountAddress,
      getAddressFromChainIdAddress(badge.from),
      badge.uri,
    );
    console.log('useMintBadge: used = ', used);

    return used;
  };

  const clearBadgesToTakeCache = async (userPub) => {
    queryClient.invalidateQueries([userPub, 'badges to take']);
    queryClient.getQueryData([userPub, 'badges to take']);
  };

  const setEOA = async (badge, account, eoa) => {
    if (!isABTToken(badge)) return;

    const abtToken = newContract(
      badge.address,
      ABTToken.abi,
      smartAccountProvider,
    );

    console.log(`useMintBadge: setEOA take=${badge.from}, uri=${badge.uri}`);

    const { receipt } = await processTransactionBundle([
      [
        await abtToken.populateTransaction.setEOA(account, eoa),
        getChainIdAddressFromChainIdAndAddress(
          connectedChainId,
          abtToken.address,
        ),
      ],
    ]);

    console.log('useMintBadge: setEOA receipt = ', receipt);
  };

  return {
    getSignature,
    giveBadge,
    takeBadge,
    revokeBadge,
    cancelRequest,
    deployBadge,
    isABTToken,
    getOwnBadges,
    unequip,
    getNextTokenId,
    minterOf,
    balanceOf,
    ownerOf,
    gettokenURI,
    isUsed,
    clearBadgesToTakeCache,
    setEOA,
  };
}
