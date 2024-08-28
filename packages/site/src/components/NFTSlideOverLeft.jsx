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
import { UsersIcon, ShareIcon } from 'heroiconsv1/outline';
import Link from 'next/link';

import {
  currentnftcategories,
  currentnftformstate,
} from '../atoms/nftSlideOverAtom';
import SimpleToggle from './SimpleToggle';
import { teamsstate } from '../atoms/teamsAtom';
import TeamsView from './TeamsView';
import { permissionsstate } from '../atoms/permissionsAtom';
import { Input } from '../ui-components/input';
import { Select } from '../ui-components/select';
import { Textarea } from '../ui-components/textarea';
import { Checkbox } from '../ui-components/checkbox';

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
    getValues,
    watch,
    reset,
  } = useFormContext();

  const [currentNFTForm, setCurrentNFTForm] =
    useRecoilState(currentnftformstate);
  const [teams, setTeams] = useRecoilState(teamsstate);
  const [permissions, setPermissions] = useRecoilState(permissionsstate);

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
              className="text-lg font-medium tracking-wider text-light-gray"
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
                className="block text-sm font-medium black"
              >
                Name
              </label>
              <div className="mt-1 rounded-lg border-2 border-white">
                <Input
                  type="text"
                  name="name"
                  register={register('name')}
                  className="block w-full bg-white"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                {errors.name?.message}
              </p>
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="symbol"
                className="block text-sm font-medium black"
              >
                Symbol
              </label>
              <div className="mt-1 rounded-lg border-2 border-white">
                <Input
                  type="text"
                  name="symbol"
                  register={register('symbol')}
                  className="block w-full bg-white sm:text-sm"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                {errors.symbol?.message}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="supply"
                className="block text-sm font-medium black"
              >
                Supply
              </label>
              <div className="mt-1 rounded-lg border-2 border-white">
                <Input
                  type="number"
                  id="supply"
                  min="0"
                  step="1"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  register={register('supply')}
                  disabled={!watch('multiToken')}
                  className="block w-full bg-white sm:text-sm"
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                {errors.supply?.message}
              </p>
            </div>

            <div className="col-span-1 ml-2">
              <Checkbox
                id="multiToken"
                label="Collection"
                defaultChecked={false}
                register={register('multiToken')}
                error={errors.multiToken?.message}
                className="items-center"
              />
            </div>

            <div className="sm:col-span-4">
              <Textarea
                id="summary"
                label="Summary"
                rows={2}
                maxLength={summaryMax}
                register={register('summary')}
                error={errors.summary?.message}
                className="mt-1"
                placeholder="Enter a brief summary"
              />
            </div>

            <div className="sm:col-span-4">
              <Textarea
                id="description"
                label="Description"
                rows={4}
                maxLength={descriptionMax}
                register={register('description')}
                error={errors.description?.message}
                className="mt-1"
                placeholder="Enter a detailed description"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="shipping-heading" className="mt-6">
          <div className="grid grid-cols-6 gap-x-2">
            <div className="sm:col-span-3">
              <Select
                id="type"
                label="Type"
                options={[
                  { value: 'audio', label: 'audio' },
                  { value: 'image', label: 'image' },
                  { value: 'video', label: 'video' },
                  { value: 'other', label: 'other' },
                ]}
                register={register('type')}
                error={errors.type?.message}
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Select
                id="category"
                label="Category"
                options={currentNFTCategories.map((category) => ({
                  value: category,
                  label: category,
                }))}
                register={register('category')}
                error={errors.category?.message}
                className="mt-1"
              />
            </div>

            <div className="col-span-1 ml-2">
              <Checkbox
                id="deployed"
                label="Deploy"
                defaultChecked={false}
                register={register('deployed')}
                error={errors.deployed?.message}
                className="items-center"
              />
            </div>
          </div>

          <br />
          <div className="">
            <div className="">
              <Link
                href="/teams"
                onClick={() => {
                  // setTeams({
                  //   teamsName: nft.teamsName || 'Teams',
                  //   teams: nft.teams,
                  // });
                  setCurrentNFTForm(getValues());
                }}
              >
                <div className="flex flex-1 flex-row">
                  <div className="text-dark-gray text-lg">
                    {teams.teamsName}&nbsp;
                  </div>
                  <UsersIcon
                    className="h-6 w-6 text-white transition duration-100 hover:scale-125 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray"
                    aria-hidden="true"
                  />
                </div>
              </Link>
              <TeamsView teams={teams.teams} />

              <Link
                href="/permissions"
                onClick={() => {
                  // setTeams({
                  //   teamsName: nft.teamsName || 'Teams',
                  //   teams: nft.teams,
                  // });
                  setCurrentNFTForm(getValues());
                }}
              >
                <div className="flex flex-1 flex-row">
                  <div className="text-dark-gray text-lg mr-1">
                    Permissions
                  </div>
                  <ShareIcon
                    className="h-6 w-6 text-white transition duration-100 hover:scale-125 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <TeamsView teams={permissions} />
            </div>
          </div>
          <br />

          <div className="sm:col-span-3">
            <label
              htmlFor="attributes"
              className="block text-sm font-medium black"
            >
              Attributes
            </label>
            <div className="mt-1 rounded-lg border-2 border-dotted border-white p-4">
              <TokenAttributes
                typeValue={watch('type')}
                setValueTokenData={setValue}
              />
            </div>
          </div>
          <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
            {errors.attributes?.message}
          </p>
        </section>

        <div className="mt-10 border-t border-white pt-8 sm:flex sm:items-center sm:justify-between">
          <Input
            type="submit"
            className="w-full rounded-md border border-transparent px-2 py-2 text-sm font-medium text-white shadow-sm hover: focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:mr-6 bg-slate-800"
            value={submitText}
          />
          <p className="mt-4 text-center text-sm  sm:mt-0 sm:text-left">
            You won't be charged until the next step.
          </p>
        </div>
      </div>
    </form>
  );
};

export default NFTSlideOverLeft;
