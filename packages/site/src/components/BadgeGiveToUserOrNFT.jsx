import { AddressZero } from '@ethersproject/constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useState } from 'react';
import * as yup from 'yup';
import { Input } from '../ui-components/input';
import useMintBadge from '../blockchain/useMintBadge';
import useUserProfile from '../hooks/useUserProfile';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { badgetogiveforaccountslideoverstate } from '../atoms/badgeDetailsSlideOverFunctions';
import useContractUtils from '../blockchain/useContractUtils';
import BlockchainContext from '../../state/BlockchainContext';
import useSendBadge from '../hooks/useSendBadge';
import useCreateBadgeToTake from '../hooks/useCreateBadgeToTake';

const defaultFormValues = {
  userPub: '',
  nftAddress: '',
  nftTokenId: '',
};

export default function BadgeGiveToUserOrNFT({ badge }) {
  const blockchainContext = useContext(BlockchainContext);
  const { providers, connectedChainId } = blockchainContext;

  const userAuthPub = useRecoilValue(userauthpubstate);

  const [submitText, setSubmitText] = useState('Give');

  const { minterOf, getSignature } = useMintBadge();
  const [getUserProfile] = useUserProfile();

  const setOpenBadgeToGiveForAccount = useSetRecoilState(
    badgetogiveforaccountslideoverstate,
  );

  const { createUri } = useSendBadge();

  const { mutate: createBadgeToTake, ...createBadgeToTakeInfo } =
    useCreateBadgeToTake();

  const { getChainIdAddressFromChainIdAndAddress } = useContractUtils();

  const giveBadgeSchema = yup
    .object()
    .shape({
      userPub: yup.string().required('Must have a user public key.'),
      nftAddress: yup.string().nullable(),
      nftTokenId: yup.string().nullable(),
    })
    .test(
      'nftAddress-nftTokenId',
      'Both nftAddress and nftTokenId must be defined if one is defined.',
      function (value) {
        const { nftAddress, nftTokenId } = value;
        if ((nftAddress && !nftTokenId) || (!nftAddress && nftTokenId)) {
          return new yup.ValidationError(
            'Both nftAddress and nftTokenId must be defined if one is defined.',
            null,
            'nftAddress',
          );
        }
        return true;
      },
    );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    defaultValues: defaultFormValues,
    resolver: yupResolver(giveBadgeSchema),
  });

  const handleGiveBadgeToNFT = async (badge, nft) => {
    const minter = await minterOf(badge);
    const userAuthProfile = await getUserProfile(userAuthPub);

    if (
      minter === AddressZero ||
      (userAuthProfile.accountAddress.toLowerCase() === minter.toLowerCase() &&
        badge.from.toLowerCase() ===
          getChainIdAddressFromChainIdAndAddress(
            connectedChainId,
            minter,
          ).toLowerCase())
    ) {
      setSubmitText('Giving...');
      const userAuthPubProfile = await getUserProfile(userAuthPub);

      const uri = await createUri(badge);

      const newBadge = { ...badge, uri, taker: badge.taker };
      const signature = await getSignature(
        badge.taker,
        newBadge,
        newBadge.giver,
      );

      console.log('BadgeDropdown: newBadge = ', newBadge);

      await createBadgeToTake({
        ...newBadge,
        signature,
        nftAddress: nft.address,
        nftOwner: nft.creator,
        nftTokenId: nft.id,
      });
      setSubmitText('Given!');
    } else {
      setSubmitText('Error!');
    }

    setCurrentBadgeRequesting(null);
    setUserPubRequest(null);

    setOpenBadgeToGiveToNFT(false);
  };

  const handleGiveBadgeToAccount = async (badge) => {
    const minter = await minterOf(badge);
    const userAuthProfile = await getUserProfile(userAuthPub);

    if (
      minter === AddressZero ||
      (userAuthProfile.accountAddress.toLowerCase() === minter.toLowerCase() &&
        badge.from.toLowerCase() ===
          getChainIdAddressFromChainIdAndAddress(
            connectedChainId,
            minter,
          ).toLowerCase())
    ) {
      setSubmitText('Giving...');
      //        const userAuthPubProfile = await getUserProfile(userAuthPub)
      const uri = await createUri(badge);

      const newBadge = { ...badge, uri, taker: badge.taker };
      const signature = await getSignature(
        badge.taker,
        newBadge,
        newBadge.giver,
      );

      console.log('BadgeDropdown: newBadge = ', newBadge);

      createBadgeToTake({
        ...newBadge,
        signature,
      });
      setSubmitText('Given!');
    } else {
      setSubmitText('Error!');
    }
    setOpenBadgeToGiveForAccount(false);
  };

  const handleGiveBadge = async (data) => {
    const newBadge = { ...badge, taker: data.userPub };
    if (data.nftAddress && data.nftTokenId) {
      await handleGiveBadgeToNFT(newBadge, {
        address: data.nftAddress,
        id: data.nftTokenId,
      });
    } else {
      await handleGiveBadgeToAccount(newBadge);
    }
  };

  return (
    <>
      {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-white">
          <body class="h-full">
          ```
        */}
      <div className="flex min-h-full flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <h2 className="mt-4 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Give to User or NFT
            </h2>
          </div>
          <form onSubmit={handleSubmit(handleGiveBadge)} className="space-y-6">
            <div className="relative -space-y-px rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300" />
              <div>
                <label htmlFor="email-address" className="sr-only">
                  User Public Key
                </label>
                <Input
                  id="userPub"
                  name="userPub"
                  type="userPub"
                  required
                  placeholder="User Public Key"
                  autoComplete="userPub"
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  register={register('userPub')}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  NFT Address (optional)
                </label>
                <Input
                  id="nftAddress"
                  name="nftAddress"
                  type="nftAddress"
                  placeholder="NFT Address (optional)"
                  autoComplete="current-nftAddress"
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  register={register('nftAddress')}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  NFT Token Id (optional)
                </label>
                <Input
                  id="nftTokenId"
                  name="nftTokenId"
                  type="nftTokenId"
                  placeholder="NFT Token Id (optional)"
                  autoComplete="current-nftTokenId"
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  register={register('nftTokenId')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary text-primary-content hover:bg-primary-dark px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg- focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
