import { Dialog, Transition } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { ethers } from 'ethers';
import { SEA } from 'gun';
import { XIcon } from 'heroiconsv1/outline';
import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import * as yup from 'yup';
import {
  currenciesdecimalplaces,
  currenciesstate,
} from '../atoms/currenciesAtom';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useCreateMarketItem from '../blockchain/useCreateMarketItem';
import useMintNFT from '../blockchain/useMintNFT';
import useUserProfile from '../hooks/useUserProfile';
import { Select } from '../../ui-components/select';
import { Input } from '../../ui-components/input';
import useMarketKeys from '../hooks/useMarketKeys';
import useEncKey from '../hooks/useEncKey';
import { process_env } from '../utils/process_env';
import { user } from '../components/user';
import { Button } from '../ui-components/button';

/**
 * `SellNFT` is a React functional component that provides an interface for selling an NFT.
 * This component allows users to list their NFT for sale, with options to open or close the sale interface.
 *
 * @component
 * @param {Object} props - The properties passed to the SellNFT component.
 * @param {Object} props.nft - The NFT object containing details of the NFT to be sold.
 * @param {boolean} props.open - A flag indicating whether the sale interface is open.
 * @param {Function} props.setOpen - Callback function to set the open state of the sale interface.
 * @param {Function} props.setRerender - Callback function to trigger a re-render of the parent component.
 * @returns {JSX.Element} The rendered component for selling an NFT.
 */
export default function SellNFT({ nft, open, setOpen, setRerender }) {
  const userAuthPub = useRecoilValue(userauthpubstate);

  const [submitText, setSubmitText] = useState('Sell');

  const currenciesDecimalPlaces = useRecoilValue(currenciesdecimalplaces);
  const currencies = useRecoilValue(currenciesstate);

  const {
    createMarketItemSEAPair,
    putMarketItemKey,
    submitEncryptedMarketItemKey,
  } = useMarketKeys();

  const [marketAddress, setMarketAddress] = useState();
  const [, , , , getMarketAddress] = useUserProfile();
  const getEncKey = useEncKey();

  useEffect(() => {
    (async () => {
      if (open) setMarketAddress(await getMarketAddress(userAuthPub));
    })();
  }, [getMarketAddress, open, userAuthPub]);

  const { createMarketNFT721Item, createMarketNFT1155Item } =
    useCreateMarketItem();

  const { getIsERC721, getIsERC1155 } = useMintNFT();

  // amount: yup
  // .number()
  // .test('int', 'Must be int greater than zero.', (val) => {
  //   return ethers.BigNumber.from(val).gt(ethers.constants.Zero)
  // })

  yup.addMethod(yup.number, 'log', function () {
    return this.test({
      name: 'log',
      message: '${path} should be logged',
      test: function (value, { path }) {
        console.log(`SellNFT: ${path} = ${value}`);
        return true;
      },
    });
  });

  yup.addMethod(yup.string, 'log', function () {
    return this.test({
      name: 'log',
      message: '${path} should be logged',
      test: function (value, { path }) {
        console.log(`SellNFT: ${path} = ${value}`);
        return true;
      },
    });
  });

  const sellSchema = yup.object().shape({
    amount: yup
      .number()
      .integer()
      .required('Must have an amount greater than zero.')
      .positive()
      .log(),
    resellerPercentage: yup.number().min(0).max(100).notRequired(),
    price: yup.number().required('Must have a price.').positive().log(),
    currency: yup.string().required('Currency is required').log(),
  });

  const defaultSell = {
    currency: process_env.DEFAULT_CURRENCY,
    amount: 1,
    price: 0.0,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultSell,
    resolver: yupResolver(sellSchema),
  });

  async function handleSubmit_CreateSale(data) {
    setSubmitText('New market item...');

    const price = ethers.utils.parseUnits(
      data.price.toString(),
      currenciesDecimalPlaces[data.currency],
    );

    const resellerFeeRatio = ethers.utils.parseEther(
      (data.resellerPercentage / 100.0).toString(),
    );

    const startTime = ethers.BigNumber.from(parseInt(Date.now() / 1000));
    const endTime = ethers.constants.MaxUint256;
    const cancelTime = endTime;

    (async () => {
      try {
        let marketItemId;

        // If the reseller fee ratio is greater or equal to the platform fee
        // then seller's item is listed on the marketplace permissionlessly
        // else listing is pending and up to the platform owner to accept or reject the listing
        if (await getIsERC721(nft)) {
          const result = await createMarketNFT721Item(
            marketAddress,
            nft,
            data.currency,
            ethers.BigNumber.from(data.amount),
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
            ethers.BigNumber.from(data.amount),
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
  }

  useEffect(() => {}, []);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={setOpen}
      >
        <div className="inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed bottom-0 left-1/2 flex max-w-full -translate-x-1/2 transform pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <div className="w-screen max-w-md">
                <div className="flex h-full flex-col border-2  bg-dark-gray shadow-xl">
                  <div className="px-4 py-2 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {/* {result?.media_type} */}
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <Button
                          variant=""
                          size="medium"
                          className="rounded-md"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-2 text-left">
                    <div>
                      <h3 className="text-lg font-medium leading-6 tracking-wider text-white">
                        {nft.name}
                      </h3>
                      <p className="mt-4 text-sm text-gray-500">
                        This will create a buy now item on the secondary market.
                      </p>
                    </div>
                    <form
                      onSubmit={handleSubmit(handleSubmit_CreateSale)}
                      className="mt-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6"
                    >
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="amount"
                          className="block text-sm font-medium text-light-gray"
                        >
                          Amount
                        </label>
                        <div className="mt-1">
                          <Input
                            id="amount"
                            register={register('amount')}
                            className="block w-full rounded-md border-gray-300 bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                          {errors.amount?.message}
                        </p>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="resellerPercentage"
                          className="block text-sm font-medium text-light-gray"
                        >
                          Reseller % (optional)
                        </label>
                        <div className="mt-1">
                          <Input
                            id="resellerPercentage"
                            register={register('resellerPercentage')}
                            className="block w-full rounded-md border-gray-300 bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                          {errors.resellerPercentage?.message}
                        </p>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="currency"
                          className="block text-sm font-medium text-light-gray"
                        >
                          Currency
                        </label>
                        <Select
                          type="text"
                          id="currency"
                          register={register(`currency`)}
                          className="block w-full rounded-md border-gray-300 bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          {currencies.map((currency, index) => (
                            <option key={index}>{currency}</option>
                          ))}
                        </Select>
                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                          {errors.currency?.message}
                        </p>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="price"
                          className="block text-sm font-medium text-light-gray"
                        >
                          price
                        </label>
                        <div className="mt-1">
                          <Input
                            id="price"
                            register={register('price')}
                            className="block w-full rounded-md border-gray-300 bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                          {errors.price?.message}
                        </p>
                      </div>
                      <div className="justify-center sm:col-span-2 sm:col-start-3">
                        <Button
                          type="submit"
                          variant=""
                          size="medium"
                          className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium"
                        >
                          {submitText}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
