import { Transition, TransitionChild } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { XIcon } from 'heroiconsv1/outline';
import React, { Fragment, use, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Input } from '../ui-components/input';
import useFNFTMarketSale from '../blockchain/useFNFTMarketSale.js';

/**
 * `DeleteMarketNFT` is a React functional component that provides the functionality to delete an NFT from the market.
 *
 * This component renders a button that, when clicked, triggers the deletion of the specified NFT.
 * It uses the provided callback function to handle the deletion process.
 *
 * @component
 * @param {Object} props - The properties passed to the DeleteMarketNFT component.
 * @param {string} props.nftId - The ID of the NFT to be deleted.
 * @param {Function} props.onDelete - Callback function to handle the deletion of the NFT.
 * @param {boolean} props.isDeleting - Flag indicating whether the deletion process is in progress.
 * @returns {JSX.Element} The rendered component with a delete button.
 */
export default function DeleteMarketNFT({
  nft,
  marketAddress,
  marketItemId,
  open,
  setOpen,
  setRerender,
}) {
  const [submitText, setSubmitText] = useState('Remove');

  const {
    getMarketItemStatusAmount,
    MarketItemStatus,
    deleteMarketNFT,
    cancelMarketNFT,
  } = useFNFTMarketSale(marketAddress);
  const [marketItemStatusPendingAmount, setMarketItemStatusPendingAmount] =
    useState();
  const [marketItemStatusAcceptedAmount, setMarketItemStatusAcceptedAmount] =
    useState();

  const removeSchema = yup.object().shape({
    amountToDelete: yup
      .number()
      .integer()
      .min(0, 'Amount must be zero or greater.')
      .test(
        'is-less-than-pending',
        'Amount must be less than or equal to pending amount.',
        function (value) {
          return value <= marketItemStatusPendingAmount;
        },
      )
      .log(),

    amountToCancel: yup
      .number()
      .integer()
      .min(0, 'Amount must be zero or greater.')
      .test(
        'is-less-than-pending',
        'Amount must be less than or equal to market amount.',
        function (value) {
          return value <= marketItemStatusAcceptedAmount;
        },
      )
      .log(),
  });

  const defaultRemove = {
    amount: 1,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: defaultRemove,
    resolver: yupResolver(removeSchema),
  });

  useEffect(() => {
    const fetchMarketItemPendingAmount = async () => {
      try {
        // Get pending amount
        const marketItemStatusPendingAmount = await getMarketItemStatusAmount(
          MarketItemStatus.Pending,
          marketItemId,
        );
        if (!marketItemStatusPendingAmount)
          throw new Error('No market item accepted.');

        setMarketItemStatusPendingAmount(Number(marketItemStatusPendingAmount));
        setValue('amountToDelete', Number(marketItemStatusPendingAmount));

        // Get accepted amount
        const marketItemStatusAcceptedAmount = await getMarketItemStatusAmount(
          MarketItemStatus.Accepted,
          marketItemId,
        );
        if (!marketItemStatusAcceptedAmount)
          throw new Error('No market item accepted.');

        setMarketItemStatusAcceptedAmount(
          Number(marketItemStatusAcceptedAmount),
        );
        setValue('amountToCancel', Number(marketItemStatusAcceptedAmount));
      } catch (error) {
        console.error(error);
      }
    };

    if (marketAddress) {
      fetchMarketItemPendingAmount();
    }
  }, [marketAddress, reset, open]);

  useEffect(() => {
    if (marketItemStatusAcceptedAmount) {
      reset({
        ...defaultRemove,
        amountToDelete: Number(marketItemStatusPendingAmount),
        amountToCancel: Number(marketItemStatusAcceptedAmount),
      });
    }
  }, [marketItemStatusAcceptedAmount]);

  async function handle_DeleteMarketNFT(data) {
    console.log('DeleteMarketNFT: handle_DeleteMarketNFT');
    try {
      if (
        data.amountToDelete > 0 &&
        data.amountToDelete <= marketItemStatusPendingAmount
      ) {
        setSubmitText('Deleting amount from market pending...');
        await deleteMarketNFT(
          { itemId: Number(marketItemId) },
          data.amountToDelete,
        );
        setSubmitText('Deleted');
      }

      if (
        data.amountToCancel > 0 &&
        data.amountToCancel <= marketItemStatusAcceptedAmount
      ) {
        setSubmitText('Deleting amount from market...');
        await cancelMarketNFT(
          { itemId: Number(marketItemId) },
          data.amountToCancel,
        );
        setSubmitText('Cancelled');
      }

      setTimeout(() => {
        setOpen(false);
      }, process.env.NEXT_PUBLIC_SLIDEOVER_CLOSE_DELAY);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {}, []);

  return (
    <Transition show={open} as={Fragment}>
      <div
        className="fixed inset-0 z-50 overflow-hidden"
        onClick={() => setOpen(false)}
      >
        <div className="inset-0 overflow-hidden">
          <div className="absolute inset-0" />
          <div className="fixed bottom-0 left-1/2 flex max-w-full -translate-x-1/2 transform pl-10 sm:pl-16">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <div
                className="w-screen max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-full flex-col border-2 border-fabstir-medium-light-gray bg-fabstir-dark-gray shadow-xl">
                  <div className="px-4 py-2 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-fabstir-dark-gray text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-2 text-left">
                    <div>
                      <h3 className="text-lg font-medium leading-6 tracking-wider text-fabstir-white">
                        {nft.name}
                      </h3>
                      <p className="mt-4 text-sm text-gray-500">
                        This will remove NFT from market pending and/or market.
                      </p>
                    </div>
                    <form
                      onSubmit={handleSubmit(handle_DeleteMarketNFT)}
                      className="mt-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6"
                    >
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="marketItemStatusPendingAmount"
                          className="block text-sm font-medium text-fabstir-light-gray"
                        >
                          Amount to Delete
                        </label>
                        <div className="mt-1">
                          <Input
                            id="marketItemStatusPendingAmount"
                            register={register('amountToDelete')}
                            className="block w-full rounded-md border-gray-300 bg-fabstir-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            onInput={(e) => {
                              const value = Number(e.target.value);
                              if (value > marketItemStatusPendingAmount) {
                                e.target.value = marketItemStatusPendingAmount;
                              }
                            }}
                          />
                        </div>
                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                          {errors.amount?.message}
                        </p>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="amountToCancel"
                          className="block text-sm font-medium text-fabstir-light-gray"
                        >
                          Amount to Cancel
                        </label>
                        <div className="mt-1">
                          <Input
                            id="amountToCancel"
                            register={register('amountToCancel')}
                            className="block w-full rounded-md border-gray-300 bg-fabstir-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            onInput={(e) => {
                              const value = Number(e.target.value);
                              if (value > marketItemStatusAcceptedAmount) {
                                e.target.value = marketItemStatusAcceptedAmount;
                              }
                            }}
                          />
                        </div>
                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                          {errors.amount?.message}
                        </p>
                      </div>

                      <div className="justify-center sm:col-span-2 sm:col-start-3">
                        <button
                          type="submit"
                          className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-fabstir-action-colour1 px-4 py-2 text-sm font-medium text-fabstir-white shadow-sm hover:bg-fabstir-hover-colour1 focus:outline-none focus:ring-2 focus:ring-fabstir-focus-colour1 focus:ring-offset-2"
                        >
                          {submitText}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Transition>
  );
}
