import React, { useEffect, useState } from 'react';
import { Input } from '../ui-components/input';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, PencilIcon } from 'heroiconsv2/24/outline';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import useCreateMarketItem from '../blockchain/useCreateMarketItem';
import useUserProfile from '../hooks/useUserProfile';
import { Button } from '../ui-components/button';

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
  userAuthPub,
  isReadOnly = true,
  handleEditMember,
  handleSubmit_SaveTeamMember,
  handleSubmit_RemoveTeamMember,
  showEditButton,
}) {
  const [isEditable, setIsEditable] = useState(!isReadOnly);
  const [permissionedUser, setPermissionedUser] = useState();
  const [marketAddress, setMarketAddress] = useState();
  const [getUserProfile, , , , getMarketAddress] = useUserProfile();

  const { getPlatformFeeRatio } = useCreateMarketItem();

  useEffect(() => {
    (async () => {
      if (user?.userPub) {
        setMarketAddress(await getMarketAddress(user.userPub));
      }
    })();
  }, [user]);

  const userPubMax = 65;

  const defaultUser = {
    userPub: '',
    amount: '',
    price: '',
    isPermissionless: true,
    saleRoyaltyFee: '',
    // subscriptionRoyaltyFee: '',
  };

  const userSchema = yup
    .object()
    .shape({
      userPub: yup
        .string()
        .max(userPubMax, `Must be less than ${userPubMax} characters`)
        .required('User Public Key is required'),

      amount: yup
        .number()
        .integer()
        .positive('Amount must be a positive number')
        .nullable(true), // Allow null or undefined
      price: yup
        .number()
        .positive('Price must be a positive number')
        .nullable(true), // Allow null or undefined

      isPermissionless: yup
        .boolean()
        .required(
          'Choice of permissionaless or not isPermissionless is required',
        ),

      saleRoyaltyFee: yup.number().positive().required(),
      // subscriptionRoyaltyFee: yup.number().positive().notRequired(),
    })
    .test(
      'amount-and-price',
      'Both amount and price must be specified if one is provided',
      function (value) {
        const { amount, price } = value;
        if ((amount && !price) || (!amount && price)) {
          return this.createError({
            path: 'amount',
            message:
              'Both amount and price must be specified if one is provided',
          });
        }
        return true;
      },
    );

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
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
    reset(user || defaultUser);
  }

  useEffect(() => {
    (async () => {
      if (getValues('isPermissionless')) {
        if (marketAddress) {
          const platformFeeRatio = await getPlatformFeeRatio(marketAddress);
          setValue('saleRoyaltyFee', platformFeeRatio);
        } else {
          console.log('marketAddress is not set');
          setValue('saleRoyaltyFee', null);
        }
      }
    })();
  }, [watch('isPermissionless')]);

  async function handlePermissionless(e) {
    if (e.target.checked) {
      const platformFeeRatio = await getPlatformFeeRatio(marketAddress);
    }
    console.log('handlePermissionless: e = ', e);
    console.log('handlePermissionless: e.target = ', e.target);
    console.log('handlePermissionless: e.target.checked = ', e.target.checked);
  }

  useEffect(() => {
    (async () => {
      const userPub = watch('userPub');
      if (userPub) {
        const user = await getUserProfile(userPub);
        setPermissionedUser(user);
      }
    })();
  }, [watch('userPub')]);

  return (
    <div>
      <div className="space-y-1">
        <div className="w-full border-t " />

        <form onSubmit={handleSubmit(handleSave)}>
          <>
            {!isReadOnly &&
              user?.userPub !== userAuthPub &&
              handleSubmit_RemoveTeamMember && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit_RemoveTeamMember(user?.userPub);
                  }}
                  className={classNames(
                    imageUrl
                      ? 'absolute left-[28px] top-[28px] lg:left-[32px] lg:top-[32px] opacity-0 duration-300 group-hover:opacity-100'
                      : 'mb-2',
                    'text-md z-10 flex w-fit rounded-full border-none bg-gray bg-opacity-75 font-semibold text-gray',
                  )}
                >
                  <MinusIconOutline
                    className="h-6 w-6 font-bold text-white lg:h-8 lg:w-8"
                    aria-hidden="true"
                  />
                </div>
              )}

            <div className="flex flex-1 flex-col space-y-2">
              {permissionedUser?.firstName && (
                <div className="col-span-3 sm:col-span-4">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray"
                  >
                    First name
                  </label>
                  <div className="mt-1 rounded-lg border-2 border-white">
                    <label className="block w-full bg-white">
                      {permissionedUser?.firstName}
                    </label>
                  </div>
                </div>
              )}

              {permissionedUser?.lastName && (
                <div className="col-span-3 sm:col-span-4 mt-1">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray"
                  >
                    Last name
                  </label>
                  <div className="mt-1 rounded-lg border-2 border-white">
                    <label className="block w-full bg-white">
                      {permissionedUser?.lastName}
                    </label>
                  </div>
                </div>
              )}

              {permissionedUser?.company && (
                <div className="col-span-3 sm:col-span-4 mt-1">
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray"
                  >
                    Company
                  </label>
                  <div className="mt-1 rounded-lg border-2 border-white">
                    <label className="block w-full bg-white">
                      {permissionedUser?.company}
                    </label>
                  </div>
                </div>
              )}

              <div className="col-span-3 sm:col-span-4 mt-3">
                <label
                  htmlFor="userPub"
                  className="block text-sm font-medium text-gray"
                >
                  User Public Key
                </label>
                <div className="mt-1 rounded-lg border-2 border-white">
                  <input
                    type="text"
                    name="userPub"
                    {...register('userPub')}
                    className="block w-full bg-white"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-error dark:text-dark-error">
                  {errors.userPub?.message}
                </p>
              </div>

              <div className="col-span-3 sm:col-span-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray"
                >
                  Amount
                </label>
                <div className="mt-1 rounded-lg border-2 border-white">
                  <input
                    type="number"
                    name="amount"
                    {...register('amount')}
                    className="block w-full bg-white"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-error dark:text-dark-error">
                  {errors.amount?.message}
                </p>
              </div>

              <div className="col-span-3 sm:col-span-4">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray"
                >
                  Price
                </label>
                <div className="mt-1 rounded-lg border-2 border-white">
                  <input
                    type="number"
                    name="price"
                    {...register('price')}
                    className="block w-full bg-white"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-error dark:text-dark-error">
                  {errors.price?.message}
                </p>
              </div>

              <div className="col-span-3 sm:col-span-4">
                <label
                  htmlFor="isPermissionless"
                  className="block text-sm font-medium text-gray"
                >
                  Permissionless
                </label>
                <div className="mt-1 rounded-lg border-2 border-white">
                  <input
                    type="checkbox"
                    name="isPermissionless"
                    {...register('isPermissionless')}
                    className="block w-full bg-white"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-error dark:text-dark-error">
                  {errors.isPermissionless?.message}
                </p>
              </div>

              <div className="col-span-3 sm:col-span-4">
                <label
                  htmlFor="saleRoyaltyFee"
                  className="block text-sm font-medium text-gray"
                >
                  Sale Royalty Fee
                </label>
                <div className="mt-1 rounded-lg border-2 border-white">
                  <input
                    type="number"
                    name="saleRoyaltyFee"
                    {...register('saleRoyaltyFee')}
                    className="block w-full bg-white"
                    readOnly={!isEditable || watch('isPermissionless')}
                  />
                </div>
                <p className="mt-1 text-error dark:text-dark-error">
                  {errors.saleRoyaltyFee?.message}
                </p>
              </div>
            </div>

            {/* <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="subscriptionRoyaltyFee"
                className="block text-sm font-medium text-gray"
              >
                Subscription Royalty Fee
              </label>
              <div className="mt-1 rounded-lg border-2 border-white">
                <input
                  type="number"
                  name="subscriptionRoyaltyFee"
                  {...register('subscriptionRoyaltyFee')}
                  className="block w-full bg-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-error dark:text-dark-error">
                {errors.subscriptionRoyaltyFee?.message}
              </p>
            </div> */}
          </>

          {isEditable ? (
            <div className="flex space-x-2">
              <Button
                variant=""
                size="medium"
                onClick={handleCancel}
                className="w-full rounded-md border border-transparent px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant=""
                size="medium"
                className="w-full rounded-md border border-transparent px-4 py-2"
              >
                Save Member
              </Button>
            </div>
          ) : showEditButton ? (
            <Button
              onClick={handleEdit}
              variant=""
              size="medium"
              className="w-full rounded-md border border-transparent px-4 py-2 text-sm flex items-center justify-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Edit
            </Button>
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );
}
