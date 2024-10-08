import React, { useContext, useEffect, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits, parseEther, formatUnits } from '@ethersproject/units';
import { v4 as uuidv4 } from 'uuid';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import useCreateMarketItem from '../blockchain/useCreateMarketItem';
import useUserProfile from '../hooks/useUserProfile';
import { Button } from '../ui-components/button';
import useMarketAddress from '../hooks/useMarketAddress';
import BlockchainContext from '../../state/BlockchainContext';
import usePortal from '../hooks/usePortal';
import { process_env } from '../utils/process_env';
import {
  bigNumberToFloat,
  abbreviateAddress2,
} from '../utils/blockchainUtils.js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom.js';
import { Select } from '../ui-components/select';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  decimalplacesfromcurrenciesstate,
  currenciesstate,
} from '../atoms/currenciesAtom.js';
import useContractUtils from '../blockchain/useContractUtils.js';
import useMarketNFTs from '../hooks/useMarketNFTs.js';
import useCurrencyUtils from '../utils/useCurrencyUtils.js';
import {
  currentmarketitemidstate,
  currentmarketitemmarketaddressstate,
  marketitemdeleteslideoverstate,
} from '../atoms/MarketItemPendingSlideOverAtom.js';
import useMaths from '../utils/useMaths';

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
 * @param {Object} props.marketItemStatusAmounts - Object containing the status amounts of market items.
 * @param {number} props.marketItemStatusAmounts.Accepted - Number of accepted market items.
 * @param {number} props.marketItemStatusAmounts.Pending - Number of pending market items.
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

  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const { getChainIdAddressFromChainIdAndAddress } = useContractUtils();

  const [permissionedUser, setPermissionedUser] = useState();
  const [creatorFeePercentage, setCreatorFeePercentage] = useState(0);
  const [getUserProfile, , , , getMarketAddress] = useUserProfile();
  const { getMarketAddressFromUser } = useMarketAddress();
  const { getBlobUrl } = usePortal();
  const { createMarketNFTItem, getMarketPlatformCreatorFeeRatio } =
    useCreateMarketItem();

  const { getDecimalPlaceFromCurrency, getCurrencyFromContractAddress } =
    useCurrencyUtils();

  const {
    getMarketFabstirFeeRatio,
    getMarketPlatformFeeRatio,
    deleteMarketItemPending,
    getMarketPlatformUnlockFee,
    getMarketPlatformUnlockPeriod,
    getMarketPlatformUnlockFeeToken,
  } = useCreateMarketItem();
  const currentNFT = useRecoilValue(currentnftmetadata);

  const [userProfileImage, setUserProfileImage] = useState();
  const userPubMax = 65;

  const [platformFeePercentage, setPlatformFeePercentage] = useState();
  const [platformCreatorFeePercentage, setPlatformCreatorFeePercentage] =
    useState();

  const [platformUnlockFee, setPlatformUnlockFee] = useState();
  const [platformUnlockPeriod, setPlatformUnlockPeriod] = useState();

  const [marketItemStatusAmounts, setMarketItemStatusAmounts] = useState('');
  const setCurrentMarketItemMarketAddress = useSetRecoilState(
    currentmarketitemmarketaddressstate,
  );
  const setCurrentMarketItemId = useSetRecoilState(currentmarketitemidstate);

  const { epsilon } = useMaths();

  const defaultCurrencySymbolName =
    'NEXT_PUBLIC_DEFAULT_CURRENCY_' + connectedChainId;
  const defaultCurrency = process_env[defaultCurrencySymbolName];

  const farFutureDate = new Date('3000-01-01T00:00:00Z');

  const defaultUser = {
    isPermissionless: false,
    userPub: '',
    marketAddress: '',
    amount: 1,
    startPrice: undefined,
    reservePrice: undefined,
    startTime: Date.now(),
    endTime: farFutureDate,
    cancelTime: farFutureDate,
    fabstirFeePercentage:
      Number(process.env.NEXT_PUBLIC_NFT_FABSTIR_FEE_RATIO) * 100,
    resellerFeePercentage: undefined,
    creatorFeePercentage: undefined,
    currency: defaultCurrency,
  };
  const decimalPlacesFromCurrencies = useRecoilValue(
    decimalplacesfromcurrenciesstate,
  );
  const currencies = useRecoilValue(currenciesstate);

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
      startPrice: yup
        .number()
        .required()
        .positive('Price must be a positive number')
        .nullable(true), // Allow null or undefined
      reservePrice: yup
        .number()
        .positive('Price must be a positive number')
        .nullable(true) // Allow null or undefined
        .transform(function (value, originalValue) {
          return originalValue === '' ? undefined : value;
        })
        .transform(function (value, originalValue) {
          return originalValue === undefined ? this.parent.startPrice : value;
        }),
      resellerUnlockFee: yup
        .number()
        .required()
        .positive('Unlock fee must be a positive number')
        .nullable(true),
      resellerUnlockPeriod: yup
        .number()
        .required()
        .positive('Unlock period must be a positive number'),
      fabstirFeePercentage: yup.number().min(0).required(),
      resellerFeePercentage: yup.number().min(0).required(),
      creatorFeePercentage: yup.number().min(0).required(),
      currency: yup.string().required('Currency is required'),
      startTime: yup
        .number()
        .required()
        .transform((value, originalValue) => Date.parse(originalValue)),
      endTime: yup
        .number()
        .required()
        .transform((value, originalValue) => Date.parse(originalValue))
        .test(
          'is-greater-than-startTime',
          'End time must be greater than or equal to start time',
          function (value) {
            const { startTime } = this.parent;
            return value >= startTime;
          },
        ),
      cancelTime: yup
        .number()
        .required()
        .transform((value, originalValue) => Date.parse(originalValue))
        .test(
          'is-greater-than-startTime',
          'Cancel time must be greater than or equal to start time',
          function (value) {
            const { startTime } = this.parent;
            return value >= startTime;
          },
        ),
    })
    .test(
      'amount-and-startPrice',
      'Both amount and start price must be specified if one is provided',
      function (value) {
        const { amount, startPrice } = value;
        if ((amount && !startPrice) || (!amount && startPrice)) {
          return this.createError({
            path: 'amount',
            message:
              'Both amount and start price must be specified if one is provided',
          });
        }
        return true;
      },
    )
    .test(
      'fee-percentages',
      'The sum of fabstirFeePercentage, resellerFeePercentage, and creatorFeePercentage must be less than or equal to 100',
      function (value) {
        const {
          fabstirFeePercentage,
          resellerFeePercentage,
          creatorFeePercentage,
        } = value;
        const totalFeePercentage =
          fabstirFeePercentage + resellerFeePercentage + creatorFeePercentage;
        if (totalFeePercentage > 100) {
          return this.createError({
            path: 'fabstirFeePercentage',
            message:
              'The sum of fabstirFeePercentage, resellerFeePercentage, and creatorFeePercentage must be less than or equal to 100',
          });
        }
        return true;
      },
    )
    .test(
      'startPrice-less-than-reservePrice',
      'Start price must be less than or equal to reserve price',
      function (value) {
        const { startPrice, reservePrice } = value;
        if (startPrice < reservePrice) {
          return this.createError({
            path: 'startPrice',
            message:
              'Start price must be greater than or equal to reserve price',
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

  const marketAddress = watch('marketAddress');
  const { getMarketItemStatus } = useMarketNFTs(marketAddress);
  const fabstirFeePercentage = watch('fabstirFeePercentage');

  const [openDeleteNFTSliderOver, setOpenDeleteNFTSliderOver] = useRecoilState(
    marketitemdeleteslideoverstate,
  );

  function handleEdit() {
    setIsEditable(true);
    handleEditMember();
  }

  async function handleSavePermission(data) {
    const startPrice = parseUnits(
      data.startPrice.toString(),
      getDecimalPlaceFromCurrency(data.currency),
    );

    const reservePrice = data.reservePrice
      ? parseUnits(
          data.reservePrice.toString(),
          getDecimalPlaceFromCurrency(data.currency),
        )
      : startPrice;

    const resellerFeeRatio = parseEther(
      (data.resellerFeePercentage / 100).toString(),
    );

    const creatorFeeRatio = parseEther(
      (data.creatorFeePercentage / 100).toString(),
    );

    const startTime = Math.floor(new Date(data.startTime).getTime() / 1000);
    const endTime = Math.floor(new Date(data.endTime).getTime() / 1000);
    const cancelTime = Math.floor(new Date(data.cancelTime).getTime() / 1000);

    const marketItemId = await createMarketNFTItem(
      data.marketAddress,
      currentNFT,
      data.currency,
      BigNumber.from(data.amount),
      startPrice,
      reservePrice,
      startTime,
      endTime,
      cancelTime,
      resellerFeeRatio,
      creatorFeeRatio,
      data.userPub,
    );

    if (!marketItemId) return;

    const updatedUser = {
      ...data,
      userPub: data.userPub ? data.userPub : uuidv4(),
      marketItemId: marketItemId.toString(),
    };
    handleSubmit_SaveTeamMember(updatedUser);

    if (!handleEditMember) reset(defaultUser);
    else setIsEditable(false);
  }

  async function handleDeletePermission(e) {
    e.preventDefault();

    setCurrentMarketItemMarketAddress(marketAddress);
    setCurrentMarketItemId(watch('marketItemId'));

    setOpenDeleteNFTSliderOver(true);

    // const userPub = watch('userPub')
    // handleSubmit_RemoveTeamMember(userPub)
  }

  function handleCancel() {
    setIsEditable(false);
    reset(user || defaultUser);
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    (async () => {
      if (getValues('isPermissionless')) {
        if (marketAddress) {
          const fabstirFeeRatio = await getMarketFabstirFeeRatio(marketAddress);
          setValue(
            'fabstirFeePercentage',
            bigNumberToFloat(fabstirFeeRatio) * 100,
          );

          const platformFeeRatio =
            await getMarketPlatformFeeRatio(marketAddress);
          setValue(
            'resellerFeePercentage',
            bigNumberToFloat(platformFeeRatio) * 100,
          );

          const platformCreatorFeeRatio =
            await getMarketPlatformCreatorFeeRatio(marketAddress);
          setValue(
            'creatorFeePercentage',
            bigNumberToFloat(platformCreatorFeeRatio) * 100,
          );
          const platformUnlockFeeToken =
            await getMarketPlatformUnlockFeeToken(marketAddress);

          const currency = await getCurrencyFromContractAddress(
            platformUnlockFeeToken,
          );
          // setCurrency(currency)
          const decimalPlaces = getDecimalPlaceFromCurrency(currency);

          const platformUnlockFeeBN =
            await getMarketPlatformUnlockFee(marketAddress);
          const platformUnlockFee = formatUnits(
            platformUnlockFeeBN,
            decimalPlaces,
          );

          if (platformUnlockFee && !watch('resellerUnlockFee'))
            setValue('resellerUnlockFee', platformUnlockFee);

          const platformUnlockPeriodBN =
            await getMarketPlatformUnlockPeriod(marketAddress);

          if (platformUnlockPeriodBN && !watch('resellerUnlockPeriod'))
            setValue(
              'resellerUnlockPeriod',
              Number(platformUnlockPeriodBN.toString()) / (24 * 60 * 60),
            );
        } else {
          setValue('fabstirFeePercentage', null);
          setValue('resellerFeePercentage', null);
          setValue('creatorFeePercentage', null);
        }

        user?.startPrice
          ? setValue('startTime', formatDate(user.startTime))
          : setValue('startTime', formatDate(Date.now()));
        user?.endTime
          ? setValue('endTime', formatDate(user.endTime))
          : setValue('endTime', formatDate(farFutureDate));
        user?.cancelTime
          ? setValue('cancelTime', formatDate(user.cancelTime))
          : setValue('cancelTime', formatDate(farFutureDate));
      }
    })();
  }, [watch('isPermissionless')]);

  useEffect(() => {
    (async () => {
      const userPub = watch('userPub');
      if (userPub) {
        const userProfile = await getUserProfile(userPub);
        setPermissionedUser(userProfile);

        const marketAddress = await getMarketAddressFromUser(
          userPub,
          connectedChainId,
        );

        setValue('marketAddress', marketAddress);

        if (marketAddress) {
          const fabstirFeeRatio = await getMarketFabstirFeeRatio(marketAddress);

          if (!fabstirFeeRatio)
            throw new Error('Market does not have a Fabstir fee ratio');

          setValue(
            'fabstirFeePercentage',
            bigNumberToFloat(fabstirFeeRatio) * 100,
          );

          const platformFeeRatio =
            await getMarketPlatformFeeRatio(marketAddress);

          if (platformFeeRatio && !watch('resellerFeePercentage'))
            setValue(
              'resellerFeePercentage',
              bigNumberToFloat(platformFeeRatio) * 100,
            );

          const platformCreatorFeeRatio =
            await getMarketPlatformCreatorFeeRatio(marketAddress);

          if (platformCreatorFeeRatio && !watch('creatorFeePercentage'))
            setValue(
              'creatorFeePercentage',
              bigNumberToFloat(platformCreatorFeeRatio) * 100,
            );

          const platformUnlockFeeToken =
            await getMarketPlatformUnlockFeeToken(marketAddress);

          const currency = await getCurrencyFromContractAddress(
            platformUnlockFeeToken,
          );
          // setCurrency(currency)
          const decimalPlaces = getDecimalPlaceFromCurrency(currency);

          const platformUnlockFeeBN =
            await getMarketPlatformUnlockFee(marketAddress);
          const platformUnlockFee = formatUnits(
            platformUnlockFeeBN,
            decimalPlaces,
          );

          if (platformUnlockFee && !watch('resellerUnlockFee'))
            setValue('resellerUnlockFee', platformUnlockFee);

          const platformUnlockPeriodBN =
            await getMarketPlatformUnlockPeriod(marketAddress);

          if (platformUnlockPeriodBN && !watch('resellerUnlockPeriod'))
            setValue(
              'resellerUnlockPeriod',
              Number(platformUnlockPeriodBN.toString()) / (24 * 60 * 60),
            );
        } else {
          setValue('fabstirFeePercentage', null);
          setValue('resellerFeePercentage', 0);
        }

        user?.startPrice
          ? setValue('startTime', formatDate(user.startTime))
          : setValue('startTime', formatDate(Date.now()));
        user?.endTime
          ? setValue('endTime', formatDate(user.endTime))
          : setValue('endTime', formatDate(farFutureDate));
        user?.cancelTime
          ? setValue('cancelTime', formatDate(user.cancelTime))
          : setValue('cancelTime', formatDate(farFutureDate));
      }
    })();
  }, [watch('userPub')]);

  useEffect(() => {
    console.log(
      'PermissionUserView: Number(watch(`resellerUnlockFee`)) = ',
      Number(watch('resellerUnlockFee')),
    );
    console.log(
      'PermissionUserView: Number(platformUnlockFee) = ',
      Number(platformUnlockFee),
    );
  }, [watch('resellerUnlockFee')]);

  useEffect(() => {
    (async () => {
      const marketAddress = watch('marketAddress');
      if (marketAddress) {
        const marketItemId = watch('marketItemId');
        const marketItemStatus = await getMarketItemStatus(marketItemId);
        setMarketItemStatusAmounts(marketItemStatus);

        const platformFeeRatio = await getMarketPlatformFeeRatio(marketAddress);
        setPlatformFeePercentage(bigNumberToFloat(platformFeeRatio) * 100);

        const platformCreatorFeeRatio =
          await getMarketPlatformCreatorFeeRatio(marketAddress);
        setPlatformCreatorFeePercentage(
          bigNumberToFloat(platformCreatorFeeRatio) * 100,
        );

        const platformUnlockFeeToken =
          await getMarketPlatformUnlockFeeToken(marketAddress);

        const currency = await getCurrencyFromContractAddress(
          platformUnlockFeeToken,
        );
        // setCurrency(currency)
        const decimalPlaces = getDecimalPlaceFromCurrency(currency);

        const platformUnlockFeeBN =
          await getMarketPlatformUnlockFee(marketAddress);
        const platformUnlockFee = formatUnits(
          platformUnlockFeeBN,
          decimalPlaces,
        );

        setPlatformUnlockFee(platformUnlockFee);

        const platformUnlockPeriodBN =
          await getMarketPlatformUnlockPeriod(marketAddress);
        setPlatformUnlockPeriod(
          Number(platformUnlockPeriodBN.toString()) / (24 * 60 * 60),
        );
      }
    })();
  }, [watch('marketAddress')]);

  async function handleResetToPlatformFee() {
    const userPub = watch('userPub');

    if (userPub && marketAddress && platformFeePercentage) {
      setValue('resellerFeePercentage', platformFeePercentage);
      return;
    }
    setValue('resellerFeePercentage', 0);
  }

  async function handleResetToPlatformCreatorFee() {
    const userPub = watch('userPub');

    if (userPub && marketAddress && platformCreatorFeePercentage) {
      setValue('creatorFeePercentage', platformCreatorFeePercentage);
      return;
    }
    setValue('creatorFeePercentage', 0);
  }

  async function handleResetToPlatformUnlockFee() {
    const userPub = watch('userPub');

    if (userPub && marketAddress && platformUnlockFee) {
      setValue('platformUnlockFee', platformUnlockFee);
      return;
    }
    setValue('platformUnlockFee', 0);
  }

  async function handleResetToPlatformUnlockPeriod() {
    const userPub = watch('userPub');

    if (userPub && marketAddress && platformUnlockPeriod) {
      setValue('platformUnlockPeriod', platformUnlockPeriod);
      return;
    }
    setValue('platformUnlockPeriod', 0);
  }

  return (
    <div className="mx-auto max-w-2xl w-fit border-2 border-fabstir-gray p-4">
      {' '}
      {/* Increased max-width */}
      <div className="space-y-4">
        {' '}
        {/* Increased spacing */}
        <div className="border-t border-fabstir-divide-color1" />
        <div className="flex items-center justify-center">
          <form
            onSubmit={handleSubmit(handleSavePermission)}
            className="space-y-4 w-80"
          >
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="isPermissionless"
                className="block text-sm font-medium text-fabstir-light-gray"
              >
                Permissionless
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  name="isPermissionless"
                  {...register('isPermissionless')}
                  className="h-5 w-5 text-fabstir-gray"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-1 text-fabstir-light-pink">
                {errors.isPermissionless?.message}
              </p>
            </div>

            <div className="col-span-3 mt-3 w-full sm:col-span-4">
              <label
                htmlFor="userPub"
                className="block text-sm font-medium text-fabstir-light-gray"
              >
                User Public Key
              </label>
              <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="userPub"
                  {...register('userPub')}
                  className="block w-full truncate bg-fabstir-gray"
                  readOnly={!isEditable}
                  style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                />
              </div>
              <p className="mt-1 text-fabstir-light-pink">
                {errors.userPub?.message}
              </p>
            </div>

            <div className="flex w-full flex-1 flex-col space-y-2">
              {permissionedUser?.firstName && (
                <div className="col-span-3 sm:col-span-4">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    First name
                  </label>
                  <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                    <label className="block w-full bg-fabstir-gray">
                      {permissionedUser.firstName}
                    </label>
                  </div>
                </div>
              )}
              {permissionedUser?.lastName && (
                <div className="col-span-3 mt-1 w-full sm:col-span-4">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Last name
                  </label>
                  <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                    <label className="block w-full bg-fabstir-gray">
                      {permissionedUser.lastName}
                    </label>
                  </div>
                </div>
              )}
              {permissionedUser?.company && (
                <div className="col-span-3 mt-1 w-full sm:col-span-4">
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Company
                  </label>
                  <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                    <label className="block w-full bg-fabstir-gray">
                      {permissionedUser.company}
                    </label>
                  </div>
                </div>
              )}
              {marketAddress && (
                <div className="col-span-3 mt-1 w-full sm:col-span-4">
                  <label
                    htmlFor="marketAddress"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Market Address
                  </label>
                  <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                    <Tippy
                      content={marketAddress}
                      interactive={true}
                      theme="dark"
                      maxWidth="none"
                    >
                      <label className="block w-full bg-fabstir-medium-dark-gray p-3">
                        {abbreviateAddress2(marketAddress, 16, 8)}
                      </label>
                    </Tippy>
                  </div>
                </div>
              )}
              <div className="max-w-full sm:col-span-3">
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Currency
                </label>
                <select
                  type="text"
                  id="currency"
                  {...register(`currency`)}
                  className="block w-full rounded-md border-gray-300 bg-fabstir-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={!isEditable}
                >
                  {currencies.map((currency, index) => (
                    <option key={index}>{currency}</option>
                  ))}
                </select>
                <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                  {errors.currency?.message}
                </p>
              </div>
              <div className="col-span-3 w-full  sm:col-span-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Amount
                </label>
                <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                  <input
                    type="number"
                    name="amount"
                    {...register('amount')}
                    className="block w-full bg-fabstir-gray"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-fabstir-light-pink">
                  {errors.amount?.message}
                </p>
              </div>
              <div className="col-span-3 w-full sm:col-span-4">
                <label
                  htmlFor="startPrice"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Price
                </label>
                <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                  <input
                    type="number"
                    name="startPrice"
                    {...register('startPrice')}
                    className="block w-full bg-fabstir-gray"
                    readOnly={!isEditable}
                    step="any"
                  />
                </div>
                <p className="mt-1 text-fabstir-light-pink">
                  {errors.startPrice?.message}
                </p>
              </div>
              <div className="col-span-3 w-full sm:col-span-4">
                <label
                  htmlFor="reservePrice"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Reserve Price (optional)
                </label>
                <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                  <input
                    type="number"
                    name="reservePrice"
                    {...register('reservePrice')}
                    className="block w-full bg-fabstir-gray"
                    readOnly={!isEditable}
                    step="any"
                  />
                </div>
                <p className="mt-1 text-fabstir-light-pink">
                  {errors.reservePrice?.message}
                </p>
              </div>
              <div className="col-span-3 w-full sm:col-span-4">
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Start Time
                </label>
                <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                  <input
                    type="datetime-local"
                    name="startTime"
                    {...register('startTime')}
                    className="block w-full bg-fabstir-gray"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-fabstir-light-pink">
                  {errors.startTime?.message}
                </p>
              </div>
              <div className="col-span-3 w-full sm:col-span-4">
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  End Time
                </label>
                <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                  <input
                    type="datetime-local"
                    name="endTime"
                    {...register('endTime')}
                    className="block w-full bg-fabstir-gray"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-fabstir-light-pink">
                  {errors.endTime?.message}
                </p>
              </div>
              <div className="col-span-3 w-full sm:col-span-4">
                <label
                  htmlFor="cancelTime"
                  className="block text-sm font-medium text-fabstir-light-gray"
                >
                  Cancel Time
                </label>
                <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                  <input
                    type="datetime-local"
                    name="cancelTime"
                    {...register('cancelTime')}
                    className="block w-full bg-fabstir-gray"
                    readOnly={!isEditable}
                  />
                </div>
                <p className="mt-1 text-fabstir-light-pink">
                  {errors.cancelTime?.message}
                </p>
              </div>
              <div className="col-span-3 w-full  sm:col-span-4">
                <div className="flex flex-col">
                  <div>
                    <label
                      htmlFor="resellerFeePercentage"
                      className="block text-sm font-medium text-fabstir-light-gray"
                    >
                      Reseller Fee %{' '}
                      {watch('resellerFeePercentage') !== null &&
                      watch('resellerFeePercentage') !== undefined &&
                      Math.abs(
                        watch('resellerFeePercentage') - platformFeePercentage,
                      ) < epsilon
                        ? ':- Default'
                        : ''}
                    </label>
                    <div className="flex flex-1 flex-row">
                      <div className="mt-1 flex w-full max-w-full flex-1 flex-row rounded-lg border-2 border-fabstir-white">
                        <input
                          type="number"
                          name="resellerFeeRatio"
                          {...register('resellerFeePercentage')}
                          className="block w-full bg-fabstir-gray"
                          readOnly={!isEditable || watch('isPermissionless')}
                          step="any"
                        />
                      </div>
                      {(isEditable || watch('isPermissionless')) &&
                        watch('marketAddress') &&
                        watch('resellerFeePercentage') !==
                          platformFeePercentage && (
                          <div className="ml-4 min-h-fit">
                            <button
                              onClick={handleResetToPlatformFee}
                              className="mt-1 bg-fabstir-medium-light-gray px-2 py-3"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                    </div>
                    <p className="mt-1 text-fabstir-light-pink">
                      {errors.resellerFeePercentage?.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-span-3 w-full  sm:col-span-4">
                <div className="flex flex-col">
                  <div>
                    <label
                      htmlFor="creatorFeePercentage"
                      className="block text-sm font-medium text-fabstir-light-gray"
                    >
                      Creator Fee %{' '}
                      {watch('creatorFeePercentage') !== null &&
                      watch('creatorFeePercentage') !== undefined &&
                      Math.abs(
                        watch('creatorFeePercentage') -
                          platformCreatorFeePercentage,
                      ) < epsilon
                        ? ':- Default'
                        : ''}
                    </label>
                    <div className="flex flex-1 flex-row">
                      <div className="mt-1 w-full max-w-full rounded-lg border-2 border-fabstir-white">
                        <input
                          type="number"
                          name="creatorFeePercentage"
                          {...register('creatorFeePercentage')}
                          className="block w-full bg-fabstir-gray"
                          readOnly={!isEditable || watch('isPermissionless')}
                          step="any"
                        />
                      </div>
                      {(isEditable || watch('isPermissionless')) &&
                        watch('marketAddress') &&
                        watch('creatorFeePercentage') !==
                          platformCreatorFeePercentage && (
                          <div className="ml-4 min-h-fit">
                            <button
                              onClick={handleResetToPlatformCreatorFee}
                              className="mt-1 bg-fabstir-medium-light-gray px-2 py-3"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                    </div>
                    <p className="mt-1 text-fabstir-light-pink">
                      {errors.creatorFeePercentage?.message}
                    </p>
                  </div>
                </div>
              </div>
              {fabstirFeePercentage && (
                <div className="col-span-3 mt-1 w-full sm:col-span-4">
                  <label
                    htmlFor="fabstirFeeRatio"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Fabstir Fee %
                  </label>
                  <div className="mt-1 max-w-full rounded-lg border-2 border-fabstir-white">
                    <label className="block w-full bg-fabstir-medium-dark-gray p-3">
                      {fabstirFeePercentage}
                    </label>
                  </div>
                  <p className="mt-1 text-fabstir-light-pink">
                    {errors.fabstirFeePercentage?.message}
                  </p>
                </div>
              )}
              <div className="col-span-3 sm:col-span-4">
                <div className="flex flex-col">
                  <div>
                    <label
                      htmlFor="resellerUnlockFee"
                      className="block text-sm font-medium text-fabstir-light-gray"
                    >
                      Unlock Fee ({watch('currency')})
                      {watch('resellerUnlockFee') !== null &&
                      watch('resellerUnlockFee') !== undefined &&
                      Math.abs(
                        Number(watch('resellerUnlockFee')) -
                          Number(platformUnlockFee),
                      ) < epsilon
                        ? ':- Default'
                        : ''}
                    </label>
                    <div className="flex flex-1 flex-row">
                      <div className="mt-1 w-full max-w-full rounded-lg border-2 border-fabstir-white">
                        <input
                          type="number"
                          name="resellerUnlockFee"
                          {...register('resellerUnlockFee')}
                          className="block w-full bg-fabstir-gray"
                          readOnly={!isEditable || watch('isPermissionless')}
                          step="any"
                        />
                      </div>
                      {(isEditable || watch('isPermissionless')) &&
                        watch('marketAddress') &&
                        watch('resellerUnlockFee') !== platformUnlockFee && (
                          <div className="ml-4 min-h-fit">
                            <button
                              onClick={handleResetToPlatformUnlockFee}
                              className="mt-1 bg-fabstir-medium-light-gray px-2 py-3"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                    </div>
                    <p className="mt-1 text-fabstir-light-pink">
                      {errors.resellerUnlockFee?.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-span-3 sm:col-span-4">
                <div className="flex flex-col">
                  <div>
                    <label
                      htmlFor="resellerUnlockPeriod"
                      className="block text-sm font-medium text-fabstir-light-gray"
                    >
                      Unlock Period (days)
                      {watch('resellerUnlockPeriod') !== null &&
                      watch('resellerUnlockPeriod') !== undefined &&
                      Math.abs(
                        Number(watch('resellerUnlockPeriod')) -
                          Number(platformUnlockPeriod),
                      ) < epsilon
                        ? ':- Default'
                        : ''}
                    </label>
                    <div className="flex flex-1 flex-row">
                      <div className="mt-1 w-full max-w-full rounded-lg border-2 border-fabstir-white">
                        <input
                          type="number"
                          name="resellerUnlockPeriod"
                          {...register('resellerUnlockPeriod')}
                          className="block w-full bg-fabstir-gray"
                          readOnly={!isEditable || watch('isPermissionless')}
                          step="any"
                        />
                      </div>
                      {(isEditable || watch('isPermissionless')) &&
                        watch('marketAddress') &&
                        watch('resellerUnlockPeriod') !==
                          platformUnlockPeriod && (
                          <div className="ml-4 min-h-fit">
                            <button
                              onClick={handleResetToPlatformUnlockPeriod}
                              className="mt-1 bg-fabstir-medium-light-gray px-2 py-3"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                    </div>
                    <p className="mt-1 text-fabstir-light-pink">
                      {errors.resellerUnlockPeriod?.message}
                    </p>
                  </div>
                </div>
              </div>
              {marketItemStatusAmounts &&
                Object.keys(marketItemStatusAmounts).length > 0 && (
                  <div className="col-span-3 mt-1 sm:col-span-4">
                    <label
                      htmlFor="fabstirFeeRatio"
                      className="block text-sm font-medium text-fabstir-light-gray"
                    >
                      Market Status
                    </label>
                    <div className="mt-1 w-full rounded-lg border-2 border-fabstir-white">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-fabstir-medium-dark-gray">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fabstir-light-gray"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fabstir-light-gray"
                            >
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-fabstir-gray-700">
                          {Object.entries(marketItemStatusAmounts)
                            .filter(([key, value]) => Number(value) !== 0)
                            .map(([key, value]) => (
                              <tr key={key}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-fabstir-light-gray">
                                  {key}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-fabstir-light-gray">
                                  {value}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}{' '}
            </div>
            {showEditButton &&
              !isEditable &&
              user?.userPub !== userAuthPub &&
              handleSubmit_RemoveTeamMember &&
              (marketItemStatusAmounts?.accepted >= 1 ||
                marketItemStatusAmounts?.pending >= 1) && (
                <Button
                  size="medium"
                  onClick={(e) => handleDeletePermission(e)}
                  className="w-full rounded-md border border-transparent px-4 py-2"
                >
                  Remove Permission
                </Button>
              )}

            {isEditable ? (
              <div className="flex space-x-2">
                <Button
                  size="medium"
                  onClick={handleCancel}
                  className="w-full rounded-md border border-transparent px-4 py-2"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  className="w-full rounded-md border border-transparent px-4 py-2"
                >
                  Save Permission
                </Button>
              </div>
            ) : (
              <></>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
