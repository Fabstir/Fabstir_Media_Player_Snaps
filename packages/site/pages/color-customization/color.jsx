import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from 'axios';
import BlockchainContext from '../../state/BlockchainContext';
import { getSmartAccountAddress } from '../../src/blockchain/useAccountAbstractionPayment';
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/solid';
import { TextLink } from '../../src/ui-components/text';
import useCreateUser from '../../src/hooks/useCreateUser';
import { Button } from '../../src/ui-components/button';
import { Select, SelectItem, Avatar } from '@nextui-org/react';
import ColorSelect from '../../src/ui-components/colorSelect';

let url = process.env.NEXT_PUBLIC_FABSTIRDB_BACKEND_URL || '';

const darkThemeColorSet = new Set([
  { label: 'Dark Gray', value: '#333333' },
  { label: 'Charcoal', value: '#2C2C2C' },
  { label: 'Slate Gray', value: '#6C757D' },
  { label: 'Gunmetal', value: '#2A2A2A' },
  { label: 'Ash Gray', value: '#B2B2B2' },
  { label: 'Midnight Blue', value: '#003366' },
  { label: 'Ocean Blue', value: '#004080' },
  { label: 'Dark Purple', value: '#2E003E' },
  { label: 'Indigo', value: '#4B0082' },
  { label: 'Forest Green', value: '#228B22' },
  { label: 'Deep Green', value: '#004d00' },
  { label: 'Crimson Red', value: '#DC143C' },
  { label: 'Firebrick', value: '#B22222' },
  { label: 'Burnt Orange', value: '#CC5500' },
  { label: 'Golden Rod', value: '#DAA520' },
  { label: 'Dark Olive Green', value: '#556B2F' },
  { label: 'Steel Blue', value: '#4682B4' },
  { label: 'Dark Salmon', value: '#E9967A' },
  { label: 'Rosy Brown', value: '#BC8F8F' },
]);
const darkThemeColor = Array.from(darkThemeColorSet);

const lightThemeColorSet = new Set([
  { label: 'White', value: '#FFFFFF' },
  { label: 'Light Gray', value: '#F0F0F0' },
  { label: 'Gainsboro', value: '#DCDCDC' },
  { label: 'Silver', value: '#C0C0C0' },
  { label: 'Light Slate Gray', value: '#778899' },
  { label: 'Sky Blue', value: '#87CEEB' },
  { label: 'Powder Blue', value: '#B0E0E6' },
  { label: 'Alice Blue', value: '#F0F8FF' },
  { label: 'Lavender', value: '#E6E6FA' },
  { label: 'Light Pink', value: '#FFB6C1' },
  { label: 'Peach Puff', value: '#FFDAB9' },
  { label: 'Misty Rose', value: '#FFE4E1' },
  { label: 'Honeydew', value: '#F0FFF0' },
  { label: 'Pale Goldenrod', value: '#EEE8AA' },
  { label: 'Light Green', value: '#90EE90' },
  { label: 'Light Coral', value: '#F08080' },
  { label: 'Coral', value: '#FF7F50' },
  { label: 'Turquoise', value: '#40E0D0' },
  { label: 'Light Sea Green', value: '#20B2AA' },
  { label: 'Khaki', value: '#F0E68C' },
]);
const lightThemeColor = Array.from(lightThemeColorSet);

const ColorCustomization = () => {
  const router = useRouter();
  const [smartAccountAddress, setSmartAccountAddress] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colors, setColors] = useState({
    lightTextColor: '#000000',
    lightButtonColor: '#000000',
    lightButtonTextColor: '#000000',
    lightBackgroundColor: '#ffffff',

    darkTextColor: '#E0E0E0',
    darkButtonColor: '#BB86FC',
    darkButtonTextColor: '#E0E0E0',
    darkBackgroundColor: '#121212',
  });
  const blockchainContext = useContext(BlockchainContext);
  const { smartAccount, setSmartAccount, setConnectedChainId } =
    blockchainContext;
  const { signOut } = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: colors,
  });

  const selectedColors = watch();

  useEffect(() => {
    if (smartAccountAddress) {
      fetchColor();
    }
  }, [smartAccountAddress]);

  const fetchColor = async () => {
    const userData = sessionStorage.getItem('userSession');
    const token = JSON.parse(userData)?.token ?? '';
    try {
      if (!token || !smartAccountAddress) return;
      const response = await axios.get(`${url}/color/${smartAccountAddress}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setColors(response.data.document[0]);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    const setSmartAccountAddressFn = async () => {
      if (smartAccount) {
        setSmartAccountAddress(await getSmartAccountAddress(smartAccount));
      }
    };
    setSmartAccountAddressFn();
  }, [smartAccount]);

  useEffect(() => {
    setValue('lightTextColor', colors.lightTextColor);
    setValue('lightButtonColor', colors.lightButtonColor);
    setValue('lightButtonTextColor', colors.lightButtonTextColor);
    setValue('lightBackgroundColor', colors.lightBackgroundColor);

    setValue('darkTextColor', colors.darkTextColor);
    setValue('darkButtonColor', colors.darkButtonColor);
    setValue('darkButtonTextColor', colors.darkButtonTextColor);
    setValue('darkBackgroundColor', colors.darkBackgroundColor);
  }, [colors, setValue]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--light-text-color',
      colors.lightTextColor,
    );
    document.documentElement.style.setProperty(
      '--light-button-color',
      colors.lightButtonColor,
    );
    document.documentElement.style.setProperty(
      '--light-button-text-color',
      colors.lightButtonTextColor,
    );
    document.documentElement.style.setProperty(
      '--light-background-color',
      colors.lightBackgroundColor,
    );

    document.documentElement.style.setProperty(
      '--dark-text-color',
      colors.darkTextColor,
    );
    document.documentElement.style.setProperty(
      '--dark-button-color',
      colors.darkButtonColor,
    );
    document.documentElement.style.setProperty(
      '--dark-button-text-color',
      colors.darkButtonTextColor,
    );
    document.documentElement.style.setProperty(
      '--dark-background-color',
      colors.darkBackgroundColor,
    );
  }, [colors]);

  const onSubmit = async (data) => {
    try {
      data.smartAccount = smartAccountAddress;
      const userData = sessionStorage.getItem('userSession');
      const token = JSON.parse(userData)?.token ?? '';
      await axios.post(`${url}/color`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      fetchColor();
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (error?.response?.data?.err === 'Invalid token.') {
      handleLogout();
    }
    console.error(
      'Error:',
      error.response?.data || error.request || error.message,
    );
  };

  const handleLogout = async () => {
    await signOut();
    setSmartAccount(null);
    setConnectedChainId(null);
    router.push('/');
  };

  return (
    <React.Fragment>
      <div className="flex justify-start ml-4">
        <TextLink className="mt-6" href="/">
          <div className="flex items-center">
            <ChevronDoubleLeftIcon
              className="h-6 w-6 font-bold text-gray-500 lg:h-8 lg:w-8 mr-2"
              aria-hidden="true"
            />
            <span className="text-text dark:text-dark-text">Back to Root</span>
          </div>
        </TextLink>
      </div>
      <div className="flex">
        <div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-text dark:text-dark-text">
            Color Customization
          </h1>
          <div className="flex justify-center mb-6">
            <Button
              onClick={() => setIsDarkMode(false)}
              className={
                !isDarkMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-800'
              }
            >
              Light Mode
            </Button>
            <Button
              onClick={() => setIsDarkMode(true)}
              className={`ml-2 ${isDarkMode ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}
            >
              Dark Mode
            </Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isDarkMode ? (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Button Text Color
                </label>
                <ColorSelect
                  label="Dark Button Text Color"
                  value={selectedColors.darkButtonTextColor}
                  onChange={(value) => setValue('darkButtonTextColor', value)}
                  colors={darkThemeColor}
                  register={register}
                  name="darkButtonTextColor"
                  errors={errors}
                />
                {errors.darkButtonTextColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Mode Button Background Color
                </label>
                {/* <Select
                  aria-label="Select Dark Button Background Color"
                  value={selectedColors.darkButtonColor}
                  classNames={{
                    label: 'group-data-[filled=true]:-translate-y-5',
                    trigger: 'min-h-16',
                    listboxWrapper: 'max-h-[400px]',
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                      ],
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'before:bg-default-200',
                      content: 'p-0 border-small border-divider bg-background',
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((color) => (
                      <div key={color.key} className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.props.value }}
                        ></div>
                        <div className="flex flex-col">
                          {color.props.textValue}
                        </div>
                      </div>
                    ));
                  }}
                  onChange={(value) => setValue('darkButtonColor', value)}
                  {...register('darkButtonColor', { required: true })}
                >
                  {darkThemeColor.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      textValue={color.label}
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex flex-col">{color.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </Select> */}
                <ColorSelect
                  label="darkButtonColor"
                  value={selectedColors.darkButtonColor}
                  onChange={(value) => setValue('darkButtonColor', value)}
                  colors={darkThemeColor}
                  register={register}
                  name="darkButtonColor"
                  errors={errors}
                />
                {errors.darkButtonColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Mode Text Color
                </label>
                <Select
                  aria-label="Select Dark Text Color"
                  value={selectedColors.darkTextColor}
                  classNames={{
                    label: 'group-data-[filled=true]:-translate-y-5',
                    trigger: 'min-h-16',
                    listboxWrapper: 'max-h-[400px]',
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                      ],
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'before:bg-default-200',
                      content: 'p-0 border-small border-divider bg-background',
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((color) => (
                      <div key={color.key} className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.props.value }}
                        ></div>
                        <div className="flex flex-col">
                          {color.props.textValue}
                        </div>
                      </div>
                    ));
                  }}
                  onChange={(value) => setValue('darkTextColor', value)}
                  {...register('darkTextColor', { required: true })}
                >
                  {darkThemeColor.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      textValue={color.label}
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex flex-col">{color.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                {errors.darkTextColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Mode Background Color
                </label>
                <Select
                  aria-label="Select Dark Background Color"
                  value={selectedColors.darkBackgroundColor}
                  classNames={{
                    label: 'group-data-[filled=true]:-translate-y-5',
                    trigger: 'min-h-16',
                    listboxWrapper: 'max-h-[400px]',
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                      ],
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'before:bg-default-200',
                      content: 'p-0 border-small border-divider bg-background',
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((color) => (
                      <div key={color.key} className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.props.value }}
                        ></div>
                        <div className="flex flex-col">
                          {color.props.textValue}
                        </div>
                      </div>
                    ));
                  }}
                  onChange={(value) => setValue('darkBackgroundColor', value)}
                  {...register('darkBackgroundColor', { required: true })}
                >
                  {darkThemeColor.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      textValue={color.label}
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex flex-col">{color.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                {errors.darkBackgroundColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Light Button Text Color
                </label>
                <Select
                  aria-label="Select Light Button Text Color"
                  value={selectedColors.lightButtonTextColor}
                  classNames={{
                    label: 'group-data-[filled=true]:-translate-y-5',
                    trigger: 'min-h-16',
                    listboxWrapper: 'max-h-[400px]',
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                      ],
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'before:bg-default-200',
                      content: 'p-0 border-small border-divider bg-background',
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((color) => (
                      <div key={color.key} className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.props.value }}
                        ></div>
                        <div className="flex flex-col">
                          {color.props.textValue}
                        </div>
                      </div>
                    ));
                  }}
                  onChange={(value) => setValue('lightButtonTextColor', value)}
                  {...register('lightButtonTextColor')}
                >
                  {lightThemeColor.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      textValue={color.label}
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex flex-col">{color.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                {errors.lightButtonTextColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Light Mode Button Background Color
                </label>
                <Select
                  aria-label="Select Light Button Background Color"
                  value={selectedColors.lightButtonColor}
                  classNames={{
                    label: 'group-data-[filled=true]:-translate-y-5',
                    trigger: 'min-h-16',
                    listboxWrapper: 'max-h-[400px]',
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                      ],
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'before:bg-default-200',
                      content: 'p-0 border-small border-divider bg-background',
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((color) => (
                      <div key={color.key} className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.props.value }}
                        ></div>
                        <div className="flex flex-col">
                          {color.props.textValue}
                        </div>
                      </div>
                    ));
                  }}
                  onChange={(value) => setValue('lightButtonColor', value)}
                  {...register('lightButtonColor')}
                >
                  {lightThemeColor.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      textValue={color.label}
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex flex-col">{color.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                {errors.lightButtonColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Light Mode Text Color
                </label>
                <Select
                  aria-label="Select Light Text Color"
                  value={selectedColors.lightTextColor}
                  classNames={{
                    label: 'group-data-[filled=true]:-translate-y-5',
                    trigger: 'min-h-16',
                    listboxWrapper: 'max-h-[400px]',
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                      ],
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'before:bg-default-200',
                      content: 'p-0 border-small border-divider bg-background',
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((color) => (
                      <div key={color.key} className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.props.value }}
                        ></div>
                        <div className="flex flex-col">
                          {color.props.textValue}
                        </div>
                      </div>
                    ));
                  }}
                  onChange={(value) => setValue('lightTextColor', value)}
                  {...register('lightTextColor')}
                >
                  {lightThemeColor.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      textValue={color.label}
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex flex-col">{color.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                {errors.lightTextColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Light Mode Background Color
                </label>
                <Select
                  aria-label="Select Light Background Color"
                  value={selectedColors.lightBackgroundColor}
                  classNames={{
                    label: 'group-data-[filled=true]:-translate-y-5',
                    trigger: 'min-h-16',
                    listboxWrapper: 'max-h-[400px]',
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                      ],
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      base: 'before:bg-default-200',
                      content: 'p-0 border-small border-divider bg-background',
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((color) => (
                      <div key={color.key} className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.props.value }}
                        ></div>
                        <div className="flex flex-col">
                          {color.props.textValue}
                        </div>
                      </div>
                    ));
                  }}
                  onChange={(value) => setValue('lightBackgroundColor', value)}
                  {...register('lightBackgroundColor')}
                >
                  {lightThemeColor.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      textValue={color.label}
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-10 w-10 ml-5"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex flex-col">{color.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                {errors.lightBackgroundColor && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}
              </>
            )}
            <div className="flex justify-center mt-8">
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
        <div
          className="mt-10 p-4 rounded-md"
          style={{
            backgroundColor: isDarkMode
              ? selectedColors.darkBackgroundColor
              : selectedColors.lightBackgroundColor,
            color: isDarkMode
              ? selectedColors.darkTextColor
              : selectedColors.lightTextColor,
          }}
        >
          <p className="text-sm">This is a preview of your selected colors.</p>
          <button
            className="mt-4 px-4 py-2 rounded-md"
            style={{
              backgroundColor: isDarkMode
                ? selectedColors.darkButtonColor
                : selectedColors.lightButtonColor,
              color: isDarkMode
                ? selectedColors.darkButtonTextColor
                : selectedColors.lightButtonTextColor,
            }}
          >
            Sample Button
          </button>
        </div>
      </div>
      {/* <Select
        items={lightThemeColor}
        label="Select a color"
        className="max-w-xs"
        variant="bordered"
        classNames={{
          label: 'group-data-[filled=true]:-translate-y-5',
          trigger: 'min-h-16',
          listboxWrapper: 'max-h-[400px]',
        }}
        listboxProps={{
          itemClasses: {
            base: [
              'rounded-md',
              'text-default-500',
              'transition-opacity',
              'data-[hover=true]:text-foreground',
              'data-[hover=true]:bg-default-100',
              'dark:data-[hover=true]:bg-default-50',
              'data-[selectable=true]:focus:bg-default-50',
              'data-[pressed=true]:opacity-70',
              'data-[focus-visible=true]:ring-default-500',
            ],
          },
        }}
        popoverProps={{
          classNames: {
            base: 'before:bg-default-200',
            content: 'p-0 border-small border-divider bg-background',
          },
        }}
        renderValue={(items) => {
          return items.map((color) => (
            <div key={color.value} className="flex gap-2 items-center">
              <div
                className="h-6 w-6"
                style={{ backgroundColor: color.data.value }}
              ></div>
              <div className="text-sm">{color.data.label}</div>
            </div>
          ));
        }}
      >
        {(color) => (
          <SelectItem key={color.value} textValue={color.label}>
            <div className="flex gap-2 items-center">
              <div
                className="h-6 w-6"
                style={{ backgroundColor: color.value }}
              ></div>
              <div className="text-sm">{color.label}</div>
            </div>
          </SelectItem>
        )}
      </Select> */}
    </React.Fragment>
  );
};

export default ColorCustomization;
