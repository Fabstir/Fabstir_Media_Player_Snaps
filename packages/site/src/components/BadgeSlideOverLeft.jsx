import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import TokenAttributes from './TokenAttributes';

import {
  currentbadgecategories,
  currentbadgeformstate,
} from '../atoms/badgeSlideOverAtom';

const BadgeSlideOverLeft = ({
  userPub,
  submitText,
  clearOnSubmit,
  handleSubmit_Badge,
  badgeSchema,
  summaryMax,
  descriptionMax,
  methods,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useFormContext();

  // const { fields, update } = useFieldArray({
  //   control,
  //   name: 'subscriptionPlans',
  // })

  const [currentBadgeForm, setCurrentBadgeForm] = useRecoilState(
    currentbadgeformstate,
  );

  const currentBadgeCategories = useRecoilValue(currentbadgecategories);

  const userViewStyle = 'relative mx-auto grid gap-x-4 gap-y-8 grid-cols-6';

  useEffect(() => {
    if (currentBadgeForm) {
      reset(currentBadgeForm);
      setCurrentBadgeForm('');
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        (async () => {
          await handleSubmit_Badge(data, methods);
        })();
      })}
      method="POST"
      className="px-4 pb-36 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16"
    >
      <div className="mx-auto max-w-lg lg:max-w-none">
        <section aria-labelledby="payment-heading">
          <h2
            id="payment-heading"
            className="text-lg font-medium tracking-wider text-fabstir-light-gray"
          >
            CREATE BADGE (A.K.A. SOULBOUND TOKEN)
          </h2>

          <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-fabstir-light-gray"
              >
                Name
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-gray">
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="block w-full bg-fabstir-dark-gray"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.name?.message}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="symbol"
                className="block text-sm font-medium text-fabstir-light-gray"
              >
                Symbol
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-gray">
                <input
                  type="text"
                  id="symbol"
                  {...register('symbol')}
                  className="block w-full bg-fabstir-dark-gray sm:text-sm"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.symbol?.message}
              </p>
            </div>

            <div className="sm:col-span-4">
              <div className="flex justify-between">
                <label
                  htmlFor="summary"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Summary
                </label>
                <span className="bg-fabstir-dark-gray text-sm text-fabstir-medium-light-gray">
                  Max. {summaryMax} characters
                </span>
              </div>
              <div className="mt-1 rounded-lg border-2 border-fabstir-gray">
                <textarea
                  type="text"
                  id="summary"
                  rows={2}
                  {...register('summary')}
                  className="block w-full bg-fabstir-dark-gray px-4 py-3"
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
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Description
                </label>
                <span className="bg-fabstir-dark-gray text-sm text-fabstir-medium-light-gray">
                  Max. {descriptionMax} characters
                </span>
              </div>
              <div className="mt-1 rounded-lg border-2 border-fabstir-gray">
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="block w-full bg-fabstir-dark-gray px-4 py-3"
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
          <div className="sm:col-span-3">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-fabstir-light-gray"
            >
              Category
            </label>
            <div className="mt-1 rounded-lg border-2 border-fabstir-gray">
              <select
                id="category"
                // value={userProfile.country}
                type="text"
                {...register('category')}
                className="sm:text-md block w-full bg-fabstir-dark-gray"
              >
                {currentBadgeCategories.map((currentBadgeCategory) => (
                  <option key={currentBadgeCategory}>
                    {currentBadgeCategory}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
              {errors.category?.message}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label
                htmlFor="attributes"
                className="block text-sm font-medium text-fabstir-light-gray"
              >
                Attributes
              </label>
              <div className="mt-1 rounded-lg border-2 border-dotted border-fabstir-gray p-4">
                <TokenAttributes setValueTokenData={setValue} />

                {/* <textarea
                  name="attributes"
                  rows={4}
                  {...register('attributes')}
                  className="py-3 px-4 block w-full bg-fabstir-dark-gray"
                  defaultValue={''}
                /> */}
              </div>
            </div>
            <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
              {errors.attributes?.message}
            </p>
          </div>
        </section>

        <div className="mt-10 border-t border-fabstir-gray pt-8 sm:flex sm:items-center sm:justify-between">
          <input
            type="submit"
            className="w-full rounded-md border border-transparent bg-fabstir-light-purple px-2 py-2 text-sm font-medium text-white shadow-sm hover:bg-fabstir-dark-purple focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:mr-6"
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

export default BadgeSlideOverLeft;
