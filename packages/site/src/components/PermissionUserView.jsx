import React, { useEffect, useState } from 'react';
import { Input } from '../ui-components/input';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, PencilIcon } from 'heroiconsv2/24/outline';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import useCreateMarketItem from '../blockchain/useCreateMarketItem';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `PermissionUserView` is a React functional component that displays the permissions of a user.
 * This component provides a user interface for viewing and managing NFT permissions granted to this user
 * by the NFT owner.
 *
 * @component
 * @param {Object} props - The properties passed to the PermissionUserView component.
 * @param {Object} props.user - The user object containing user details and permissions.
 * @param {boolean} props.isReadOnly - A flag indicating whether the view is read-only.
 * @param {Function} props.handlePermissionChange - Callback function to handle changes to the user's permissions.
 * @param {Function} props.handleRemoveUser - Callback function to handle removing the user.
 * @returns {JSX.Element} The rendered component displaying the user's permissions.
 */
export default function PermissionUserView({
  user,
  isReadOnly = true,
  watch,
  setValue,
  handleEditMember,
  handleSubmit_SaveTeamMember,
  handleSubmit_RemoveTeamMember,
  showEditButton,
}) {
  const [isEditable, setIsEditable] = useState(!isReadOnly);
  const [marketAddress, setMarketAddress] = useState();

  const { getPlatformFeeRatio } = useCreateMarketItem();

  useEffect(() => {
    (async () => {
      setMarketAddress(await getMarketAddress(user.userPub));
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      if (getValues('isPermissionless')) {
        const platformFeeRatio = await getPlatformFeeRatio(marketAddress);
        setValue('saleRoyaltyFee', platformFeeRatio);
      }
    })();
  }, [watch('isPermissionless')]);

  const userPubMax = 65;

  const defaultUser = {
    userPub: '',
    amount: '',
    price: '',
    isPermissionless: true,
    saleRoyaltyFee: '',
    subscriptionRoyaltyFee: '',
  };

  const userSchema = yup.object().shape({
    userPub: yup
      .string()
      .max(userPubMax, `Must be less than ${userPubMax} characters`)
      .required('User Public Key is required'),

    amount: yup
      .number()
      .integer()
      .positive('Amount must be a positive number')
      .when('price', {
        is: (price) => price > 0,
        then: yup
          .number()
          .required('Amount is required when price is specified')
          .positive('Amount must be a positive number'),
      }),

    price: yup
      .number()
      .positive('Price must be a positive number')
      .when('amount', {
        is: (amount) => amount > 0,
        then: yup
          .number()
          .required('Price is required when amount is specified')
          .positive('Price must be a positive number'),
      }),

    isPermissionless: yup
      .boolean()
      .required(
        'Choice of permissionaless or not isPermissionless is required',
      ),

    saleRoyaltyFee: yup.number().positive().notRequired(),
    subscriptionRoyaltyFee: yup.number().positive().notRequired(),
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm({
    defaultValues: user || defaultUser,
    resolver: yupResolver(userSchema),
  });

  function handleEdit() {
    setIsEditable(true);
    handleEditMember();
  }

  function handleSave(data) {
    const updatedUser = {
      ...data,
      userPub: data.userPub ? data.userPub : uuidv4(),
    };
    handleSubmit_SaveTeamMember(updatedUser);

    if (!handleEditMember) reset(defaultUser);
    else setIsEditable(false);
  }

  function handleCancel() {
    setIsEditable(false);
    reset(defaultUser);
  }

  async function handlePermissionless(e) {
    if (e.target.checked) {
      const platformFeeRatio = await getPlatformFeeRatio(marketAddress);
    }
    console.log('handlePermissionless: e = ', e);
    console.log('handlePermissionless: e.target = ', e.target);
    console.log('handlePermissionless: e.target.checked = ', e.target.checked);
  }

  return (
    <div>
      <div className="space-y-1">
        <div className="w-full border-t border-fabstir-divide-color1" />

        <form onSubmit={handleSubmit(handleSave)}>
          <>
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="userPub"
                className="block text-sm font-medium text-fabstir-gray"
              >
                User Public Key
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="userPub"
                  {...register('userPub')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.userPub?.message}
              </p>
            </div>

            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-fabstir-gray"
              >
                Amount
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="number"
                  name="amount"
                  {...register('amount')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.amount?.message}
              </p>
            </div>

            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-fabstir-gray"
              >
                Price
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="number"
                  name="price"
                  {...register('price')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.price?.message}
              </p>
            </div>

            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="isPermissionless"
                className="block text-sm font-medium text-fabstir-gray"
              >
                Permissionless
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="checkbox"
                  name="isPermissionless"
                  {...register('isPermissionless')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.isPermissionless?.message}
              </p>
            </div>

            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="saleRoyaltyFee"
                className="block text-sm font-medium text-fabstir-gray"
              >
                Sale Royalty Fee
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="number"
                  name="saleRoyaltyFee"
                  {...register('saleRoyaltyFee')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable || watch('isPermissionless')}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.saleRoyaltyFee?.message}
              </p>
            </div>

            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="subscriptionRoyaltyFee"
                className="block text-sm font-medium text-fabstir-gray"
              >
                Subscription Royalty Fee
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="number"
                  name="subscriptionRoyaltyFee"
                  {...register('subscriptionRoyaltyFee')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.subscriptionRoyaltyFee?.message}
              </p>
            </div>
          </>

          {isEditable ? (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-md border border-transparent bg-fabstir-light-purple px-4 py-2 text-sm text-fabstir-dark-gray shadow-md hover:bg-fabstir-dark-gray focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full rounded-md border border-transparent bg-fabstir-light-gray px-4 py-2 text-sm text-fabstir-dark-gray shadow-md hover:bg-fabstir-dark-purple focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Save Member
              </button>
            </div>
          ) : showEditButton ? (
            <button
              type="button"
              onClick={handleEdit}
              className="w-full rounded-md border border-transparent bg-fabstir-light-gray px-4 py-2 text-sm text-fabstir-dark-gray shadow-sm hover:bg-fabstir-dark-gray focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Edit
            </button>
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );
}
