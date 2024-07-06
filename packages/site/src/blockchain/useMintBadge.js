import { useContext } from 'react';
import { arrayify, splitSignature } from '@ethersproject/bytes';
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
  const { smartAccount, smartAccountProvider, connectedChainId } =
    blockchainContext;

  const { processTransactionBundle } =
    useAccountAbstractionPayment(smartAccount);
  const {
    getChainIdAddressFromContractAddresses,
    getChainIdAddressFromChainIdAndAddress,
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
          userAuthProfile.eoaAddress,
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
    const userProfile = await getUserProfile(userPub);
    const userProfileFrom = await getUserProfile(userPubFrom);

    const abtToken = newReadOnlyContract(badge.address, ABTToken.abi);
    console.log('useMintBadge: getSignature abtToken = ', abtToken);
    console.log(
      `useMintBadge: getSignature getHash active=${userProfile.accountAddress}, passive=${userProfileFrom.accountAddress}, tokenURI=${badge.uri}`,
    );

    const hash = await abtToken.getHash(
      userProfile.accountAddress,
      userProfileFrom.accountAddress,
      badge.uri,
    );
    console.log('useMintBadge: getSignature hash = ', hash);

    const signer = smartAccountProvider.getSigner();
    const flatSig = await signer.signMessage(arrayify(hash));

    console.log('useMintBadge: getSignature flatSig = ', flatSig);

    let sig = splitSignature(flatSig);
    const signature = pack(
      ['bytes32', 'bytes32', 'uint8'],
      [sig.r, sig.s, sig.v],
    );
    console.log('useMintBadge: getSignature signature = ', signature);

    // Recover the signer's address
    const messageArray = arrayify(hash);
    const recoveredAddress = verifyMessage(messageArray, flatSig);
    console.log('useMintBadge: recoveredAddress = ', recoveredAddress);

    return signature;
  };

  const giveBadge = async (userPub, badge) => {
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
        badge.to,
        userProfileTo.eoaAddress,
      ),
      abtToken.address,
    ]);

    userOps.push([
      await abtToken.populateTransaction.give(
        badge.to,
        badge.uri,
        badge.signature,
      ),
      abtToken.address,
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
          badge.from,
          badge.uri,
          badge.signature,
        ),
        abtToken.address,
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
        abtToken.address,
      ],
    ]);

    console.log(`useMintBadge: exit revokeBadge`);
  };

  const unequip = async (userPub, badge) => {
    if (!isABTToken(badge)) return;

    const abtToken = newContract(
      badge.address,
      ABTToken.abi,
      smartAccountProvider,
    );
    await processTransactionBundle([
      [
        [await abtToken.populateTransaction.unequip(badge.tokenId)],
        abtToken.address,
      ],
    ]);

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
    let minter = await abtToken.minter();

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
      badge.from,
      badge.uri,
    );
    console.log('useMintBadge: used = ', used);

    return used;
  };

  const clearBadgesToTakeCache = async (userPub) => {
    queryClient.invalidateQueries([userPub, 'badges to take']);
    queryClient.getQueryData([userPub, 'badges to take']);
  };

  return {
    getSignature,
    giveBadge,
    takeBadge,
    revokeBadge,
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
  };
}
