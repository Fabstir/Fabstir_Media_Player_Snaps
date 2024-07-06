/**
 * This module defines a React component that represents a form for creating a new NFT (Non-Fungible Token).
 * It uses Tailwind CSS for styling and relies on several hooks and components from other modules.
 *
 * @module NFTSlideOverLeft
 */
import React, { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import TokenAttributes from './TokenAttributes';
import { Input } from '../ui-components/input';

import {
  currentnftcategories,
  currentnftformstate,
} from '../atoms/nftSlideOverAtom';
import SimpleToggle from './SimpleToggle';

// Tailwind CSS styles
const twStyle = 'ml-8 grid gap-y-6 grid-cols-6 gap-x-5';
const twTitleStyle = 'text-xs';
const twTextStyle = 'invisible';

/**
 * The NFTSlideOverLeft component represents a form for creating a new NFT.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.nft - The NFT object.
 * @param {string} props.submitText - The text to display on the submit button.
 * @param {Function} props.handleSubmit_NFT - The function to call when the form is submitted.
 * @param {number} props.summaryMax - The maximum number of characters allowed in the summary field.
 * @param {number} props.descriptionMax - The maximum number of characters allowed in the description field.
 *
 * @returns {JSX.Element} The JSX representation of the component.
 */
const NFTSlideOverLeft = ({
  nft,
  submitText,
  handleSubmit_NFT,
  summaryMax,
  descriptionMax,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const [currentNFTForm, setCurrentNFTForm] =
    useRecoilState(currentnftformstate);

  const currentNFTCategories = useRecoilValue(currentnftcategories);

  const userViewStyle = 'relative mx-auto grid gap-x-4 gap-y-8 grid-cols-6';
  console.log('NFTSlideOverLeft: submitText = ', submitText);
  console.log('NFTSlideOverLeft: handleSubmit = ', handleSubmit);

  useEffect(() => {
    if (currentNFTForm) {
      reset(currentNFTForm);
      setCurrentNFTForm('');
    }
    // if (subscriptionPlans.data.length > 1 && !getValues('subscriptionPlan'))
    //   setValue('subscriptionPlan', subscriptionPlans[0])
  }, []);

  return (
    <form
      onSubmit={handleSubmit((data) => handleSubmit_NFT(data))}
      method="POST"
      className="px-4 pb-36 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16"
    >
      <div className="mx-auto max-w-lg lg:max-w-none">
        <section aria-labelledby="payment-heading">
          <div className="flex justify-between">
            <h2
              id="payment-heading"
              className="text-lg font-medium tracking-wider text-fabstir-light-gray"
            >
              CREATE NFT
            </h2>
            <div className="flex items-center gap-4">
              <SimpleToggle
                enabled={watch('isPublic')}
                setEnabled={() => setValue('isPublic', !watch('isPublic'))}
              />
              <label>{watch('isPublic') ? 'Public' : 'Private'}</label>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium fabstir-black"
              >
                Name
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="name"
                  {...register('name')}
                  className="block w-full bg-fabstir-white"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.name?.message}
              </p>
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="symbol"
                className="block text-sm font-medium fabstir-black"
              >
                Symbol
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="symbol"
                  {...register('symbol')}
                  className="block w-full bg-fabstir-white sm:text-sm"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.symbol?.message}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="supply"
                className="block text-sm font-medium fabstir-black"
              >
                Supply
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="number"
                  id="supply"
                  min="0"
                  step="1"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  {...register('supply')}
                  disabled={!watch('multiToken')}
                  className="block w-full bg-fabstir-white sm:text-sm"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.supply?.message}
              </p>
            </div>

            <div className="col-span-1 ml-2 flex items-center">
              <div className="rounded border-2 border-fabstir-white">
                <input
                  id="multiToken"
                  type="checkbox"
                  defaultChecked={false}
                  {...register('multiToken')}
                  className="h-4 w-4 rounded bg-fabstir-white text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-2">
                <label
                  htmlFor="multiToken"
                  className="text-sm font-medium fabstir-black"
                >
                  Collection
                </label>
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.multiToken?.message}
              </p>
            </div>

            <div className="sm:col-span-4">
              <div className="flex justify-between">
                <label
                  htmlFor="summary"
                  className="block text-sm font-medium fabstir-black"
                >
                  Summary
                </label>
                <span className="text-sm text-fabstir-medium-light-gray">
                  Max. {summaryMax} characters
                </span>
              </div>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <textarea
                  name="summary"
                  rows={2}
                  {...register('summary')}
                  className="block w-full bg-fabstir-white px-4 py-3"
                  defaultValue={''}
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.summary?.message}
              </p>
            </div>

            <div className="sm:col-span-4">
              <div className="flex justify-between">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium fabstir-black"
                >
                  Description
                </label>
                <span className="text-sm text-fabstir-medium-light-gray">
                  Max. {descriptionMax} characters
                </span>
              </div>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <textarea
                  name="description"
                  rows={4}
                  {...register('description')}
                  className="block w-full bg-fabstir-white px-4 py-3"
                  defaultValue={''}
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.description?.message}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="shipping-heading" className="mt-6">
          <div className="grid grid-cols-6 gap-x-2">
            <div className="sm:col-span-3">
              <label
                htmlFor="type"
                className="block text-sm font-medium fabstir-black"
              >
                Type
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <select
                  name="type"
                  {...register('type')}
                  className="block w-full bg-fabstir-white sm:text-sm"
                >
                  <option>audio</option>
                  <option>image</option>
                  <option>video</option>
                  <option>other</option>
                </select>
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.type?.message}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="category"
                className="block text-sm font-medium fabstir-black"
              >
                Category
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <select
                  name="category"
                  {...register('category')}
                  className="sm:text-md block w-full bg-fabstir-white"
                >
                  {currentNFTCategories.map((currentNFTCategory) => (
                    <option key={currentNFTCategory}>
                      {currentNFTCategory}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.category?.message}
              </p>
            </div>

            <div className="col-span-1 ml-2 flex items-center">
              <div className="rounded border-2 border-fabstir-white">
                <input
                  id="deployed"
                  type="checkbox"
                  defaultChecked={false}
                  {...register('deployed')}
                  className="h-4 w-4 rounded bg-fabstir-white text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-2">
                <label
                  htmlFor="deployed"
                  className="text-sm font-medium fabstir-black"
                >
                  Deploy
                </label>
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.deployed?.message}
              </p>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="attributes"
              className="block text-sm font-medium fabstir-black"
            >
              Attributes
            </label>
            <div className="mt-1 rounded-lg border-2 border-dotted border-fabstir-white p-4">
              <TokenAttributes
                typeValue={watch('type')}
                setValueTokenData={setValue}
              />
            </div>
          </div>
          <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
            {errors.attributes?.message}
          </p>
        </section>

        <div className="mt-10 border-t border-fabstir-white pt-8 sm:flex sm:items-center sm:justify-between">
          <input
            type="submit"
            className="w-full rounded-md border border-transparent bg-fabstir-light-purple px-2 py-2 text-sm font-medium text-white shadow-sm hover:bg-fabstir-dark-purple focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:mr-6 bg-slate-800"
            value={submitText}
          />
          <p className="mt-4 text-center text-sm text-fabstir-medium-light-gray sm:mt-0 sm:text-left">
            You won't be charged until the next step.
          </p>
        </div>
      </div>
    </form>
  );
};

export default NFTSlideOverLeft;
