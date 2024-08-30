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
import ColorSelect from '../../src/ui-components/colorSelect';
import Loader from '../../src/components/Loader';
import { Checkbox } from '../../src/ui-components/checkbox';

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

let users = [
  {
    id: 1,
    name: 'Tony Reichert',
    role: 'CEO',
    team: 'Management',
    status: 'active',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png',
    email: 'tony.reichert@example.com',
  },
  {
    id: 2,
    name: 'Zoey Lang',
    role: 'Tech Lead',
    team: 'Development',
    status: 'paused',
    age: '25',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png',
    email: 'zoey.lang@example.com',
  },
  {
    id: 3,
    name: 'Jane Fisher',
    role: 'Sr. Dev',
    team: 'Development',
    status: 'active',
    age: '22',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/2.png',
    email: 'jane.fisher@example.com',
  },
  {
    id: 4,
    name: 'William Howard',
    role: 'C.M.',
    team: 'Marketing',
    status: 'vacation',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png',
    email: 'william.howard@example.com',
  },
  {
    id: 5,
    name: 'Kristen Copper',
    role: 'S. Manager',
    team: 'Sales',
    status: 'active',
    age: '24',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/3.png',
    email: 'kristen.cooper@example.com',
  },
  {
    id: 6,
    name: 'Brian Kim',
    role: 'P. Manager',
    team: 'Management',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/3.png',
    email: 'brian.kim@example.com',
    status: 'active',
  },
  {
    id: 7,
    name: 'Michael Hunt',
    role: 'Designer',
    team: 'Design',
    status: 'paused',
    age: '27',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/4.png',
    email: 'michael.hunt@example.com',
  },
  {
    id: 8,
    name: 'Samantha Brooks',
    role: 'HR Manager',
    team: 'HR',
    status: 'active',
    age: '31',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/4.png',
    email: 'samantha.brooks@example.com',
  },
  {
    id: 9,
    name: 'Frank Harrison',
    role: 'F. Manager',
    team: 'Finance',
    status: 'vacation',
    age: '33',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/5.png',
    email: 'frank.harrison@example.com',
  },
  {
    id: 10,
    name: 'Emma Adams',
    role: 'Ops Manager',
    team: 'Operations',
    status: 'active',
    age: '35',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/5.png',
    email: 'emma.adams@example.com',
  },
  {
    id: 11,
    name: 'Brandon Stevens',
    role: 'Jr. Dev',
    team: 'Development',
    status: 'active',
    age: '22',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/7.png',
    email: 'brandon.stevens@example.com',
  },
  {
    id: 12,
    name: 'Megan Richards',
    role: 'P. Manager',
    team: 'Product',
    status: 'paused',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/7.png',
    email: 'megan.richards@example.com',
  },
  {
    id: 13,
    name: 'Oliver Scott',
    role: 'S. Manager',
    team: 'Security',
    status: 'active',
    age: '37',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/8.png',
    email: 'oliver.scott@example.com',
  },
  {
    id: 14,
    name: 'Grace Allen',
    role: 'M. Specialist',
    team: 'Marketing',
    status: 'active',
    age: '30',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/8.png',
    email: 'grace.allen@example.com',
  },
  {
    id: 15,
    name: 'Noah Carter',
    role: 'IT Specialist',
    team: 'I. Technology',
    status: 'paused',
    age: '31',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/9.png',
    email: 'noah.carter@example.com',
  },
  {
    id: 16,
    name: 'Ava Perez',
    role: 'Manager',
    team: 'Sales',
    status: 'active',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/9.png',
    email: 'ava.perez@example.com',
  },
  {
    id: 17,
    name: 'Liam Johnson',
    role: 'Data Analyst',
    team: 'Analysis',
    status: 'active',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/11.png',
    email: 'liam.johnson@example.com',
  },
  {
    id: 18,
    name: 'Sophia Taylor',
    role: 'QA Analyst',
    team: 'Testing',
    status: 'active',
    age: '27',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/11.png',
    email: 'sophia.taylor@example.com',
  },
  {
    id: 19,
    name: 'Lucas Harris',
    role: 'Administrator',
    team: 'Information Technology',
    status: 'paused',
    age: '32',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/12.png',
    email: 'lucas.harris@example.com',
  },
  {
    id: 20,
    name: 'Mia Robinson',
    role: 'Coordinator',
    team: 'Operations',
    status: 'active',
    age: '26',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/12.png',
    email: 'mia.robinson@example.com',
  },
];

export default function ColorCustomization() {
  const router = useRouter();
  const [smartAccountAddress, setSmartAccountAddress] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loader, setLoader] = useState(true);
  const [colors, setColors] = useState({
    lightButtonTextColor: '#000000', // Black text for light mode buttons
    lightButtonColor: '#ffffff', // White button color for light mode
    lightButtonHoverColor: '#f0f0f0', // Slightly darker white on hover
    lightButtonHoverTextColor: '#000000', // Black text on hover
    lightButtonShadow: '#d1d1d1', // Light gray shadow for light buttons
    lightTextColor: '#333333', // Dark gray for light mode text
    lightBackgroundColor: '#f9f9f9', // Very light gray background
    lightSuccessTextColor: '#28a745', // Green text for success messages
    lightWarningTextColor: '#ffc107', // Yellow text for warnings
    lightErrorTextColor: '#dc3545', // Red text for errors
    lightAllowShadow: false,

    darkButtonTextColor: '#ffffff', // White text for dark mode buttons
    darkButtonColor: '#333333', // Dark gray button color for dark mode
    darkButtonHoverColor: '#444444', // Slightly lighter gray on hover
    darkButtonHoverTextColor: '#ffffff', // White text on hover
    darkButtonShadow: '#222222', // Darker gray shadow for dark buttons
    darkTextColor: '#f9f9f9', // Very light gray for dark mode text
    darkBackgroundColor: '#121212', // Very dark background
    darkSuccessTextColor: '#28a745', // Green text for success messages
    darkWarningTextColor: '#ffc107', // Yellow text for warnings
    darkErrorTextColor: '#dc3545', // Red text for errors
    darkAllowShadow: false,
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
    control,
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
    setLoader(true);
    const colorKeys = [
      'ButtonTextColor',
      'ButtonColor',
      'ButtonHoverColor',
      'ButtonHoverTextColor',
      'ButtonShadow',
      'TextColor',
      'BackgroundColor',
      'SuccessTextColor',
      'WarningTextColor',
      'ErrorTextColor',
      'AllowShadow',
    ];

    // Set values based on isDarkMode
    if (isDarkMode) {
      colorKeys.forEach((key) => {
        key == 'AllowShadow'
          ? setValue(`dark${key}`, colors[`dark${key}`] || false)
          : setValue(`dark${key}`, colors[`dark${key}`] || '');
      });
    } else {
      colorKeys.forEach((key) => {
        key == 'AllowShadow'
          ? setValue(`light${key}`, colors[`light${key}`] || false)
          : setValue(`light${key}`, colors[`light${key}`] || '');
      });
    }

    // Simulate loading state
    const timer = setTimeout(() => {
      setLoader(false);
    }, 1000);

    // Cleanup timeout
    return () => clearTimeout(timer);
  }, [isDarkMode, colors, setValue]);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoader(false);
    }, 1000);

    // Cleanup timeout
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // List of color keys for both light and dark modes
    const colorKeys = [
      'TextColor',
      'ButtonColor',
      'ButtonTextColor',
      'ButtonHoverColor',
      'ButtonHoverTextColor',
      'ButtonShadow',
      'BackgroundColor',
      'SuccessTextColor',
      'WarningTextColor',
      'ErrorTextColor',
      'AllowShadow',
    ];

    // Iterate through light mode and dark mode keys
    colorKeys.forEach((key) => {
      key == 'ButtonShadow'
        ? 
        colors.lightAllowShadow &&
          document.documentElement.style.setProperty(
            `--light${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            colors[`light${key}`],
          )
        : document.documentElement.style.setProperty(
            `--light${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            colors[`light${key}`],
          );
      //e.g --light-text-color
      key == 'ButtonShadow'
        ? colors.darkAllowShadow &&
          document.documentElement.style.setProperty(
            `--dark${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            colors[`dark${key}`],
          )
        : document.documentElement.style.setProperty(
            `--dark${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            colors[`dark${key}`],
          );
      //e.g --dark-text-color
    });
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

  const iconClasses =
    'text-xl text-default-500 pointer-events-none flex-shrink-0';

  return (
    <main className="flex  flex-col items-center justify-between ">
      {loader ? (
        <Loader />
      ) : (
        <div className="z-10 w-full bg-white p-10 rounded-xl ">
          <div className="flex relative mb-10">
            <div className="flex justify-start ml-4 absolute left-0 bg-gray p-2 rounded-md">
              <TextLink className="no-underline	" href="/">
                <div className="flex items-center">
                  <ChevronDoubleLeftIcon
                    className="h-4 w-4 font-bold text-gray-500 mr-1 text-white"
                    aria-hidden="true"
                  />
                  <span className="text-white">Back</span>
                </div>
              </TextLink>
            </div>
            <h1 className="font-bold text-4xl w-full text-center ">
              Color Customization
            </h1>
          </div>

          <div className="text-center">
            <div className="inline-flex justify-center mb-6 bg-gray p-3 rounded-lg mx-auto">
              <button
                onClick={() => setIsDarkMode(false)}
                className={` rounded-none px-4 py-2 ${!isDarkMode ? 'bg-button-background text-button-text ' : 'bg-gray text-gray-800 '}`}
              >
                Light Mode
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`rounded-none px-4 py-2 ${isDarkMode ? ' bg-button-background text-button-text dark:bg-button-background dark:text-button-text' : 'bg-gray text-gray-800'}`}
              >
                Dark Mode
              </button>
            </div>
            <div className="lg:flex ">
              <div className="w-9/12 pr-4 ">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {isDarkMode ? (
                    <div className="w-full ">
                      <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200">
                        <h2 className="text-2xl font-bold mb-3">Button</h2>
                        <div className="items-center justify-start lg:flex flex-wrap">
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Button Text Color"
                              value={selectedColors.darkButtonTextColor}
                              onChange={(value) =>
                                setValue('darkButtonTextColor', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkButtonTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Button Color"
                              value={selectedColors.darkButtonColor}
                              onChange={(value) =>
                                setValue('darkButtonColor', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkButtonColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Button Hover Color"
                              value={selectedColors.darkButtonHoverColor}
                              onChange={(value) =>
                                setValue('darkButtonHoverColor', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkButtonHoverColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Button Hover Text Color"
                              value={selectedColors.darkButtonHoverTextColor}
                              onChange={(value) =>
                                setValue('darkButtonHoverTextColor', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkButtonHoverTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Button Shadow"
                              value={selectedColors.darkButtonShadow}
                              onChange={(value) =>
                                setValue('darkButtonShadow', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkButtonShadow"
                              errors={errors}
                            />
                          </div>
                          <div className="">
                            <Checkbox
                              id="darkAllowShadow"
                              label="Allow Button Shadow"
                              defaultChecked={false}
                              register={register('darkAllowShadow')}
                              error={''}
                              className="items-center"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3 right-3">
                        <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200 w-6/12">
                          <h2 className="text-2xl font-bold mb-2">Text</h2>
                          <div className="items-center justify-between lg:flex flex-wrap">
                            <div className="p-3 flex flex-col  text-left w-8/12 relative mb-2">
                              <ColorSelect
                                label="Dark Text Color"
                                value={selectedColors.darkTextColor}
                                onChange={(value) =>
                                  setValue('darkTextColor', value)
                                }
                                colors={darkThemeColor}
                                register={register}
                                name="darkTextColor"
                                errors={errors}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200 w-6/12">
                          <h2 className="text-2xl font-bold mb-2">
                            Background
                          </h2>
                          <div className="items-center justify-between lg:flex flex-wrap">
                            <div className="p-3 flex flex-col text-left w-8/12 relative mb-2">
                              <ColorSelect
                                label="Dark Background Color"
                                value={selectedColors.darkBackgroundColor}
                                onChange={(value) =>
                                  setValue('darkBackgroundColor', value)
                                }
                                colors={darkThemeColor}
                                register={register}
                                name="darkBackgroundColor"
                                errors={errors}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200">
                        <h2 className="text-2xl font-bold mb-2">Messages</h2>
                        <div className="items-center justify-between lg:flex flex-wrap">
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Success Text color"
                              value={selectedColors.darkSuccessTextColor}
                              onChange={(value) =>
                                setValue('darkSuccessTextColor', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkSuccessTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Warning Text color"
                              value={selectedColors.darkWarningTextColor}
                              onChange={(value) =>
                                setValue('darkWarningTextColor', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkWarningTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Error Text color"
                              value={selectedColors.darkErrorTextColor}
                              onChange={(value) =>
                                setValue('darkErrorTextColor', value)
                              }
                              colors={darkThemeColor}
                              register={register}
                              name="darkErrorTextColor"
                              errors={errors}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200">
                        <h2 className="text-2xl font-bold mb-2">Button</h2>
                        <div className="items-center justify-start lg:flex flex-wrap">
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Button Text Color"
                              value={selectedColors.lightButtonTextColor}
                              onChange={(value) =>
                                setValue('lightButtonTextColor', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightButtonTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Button Color"
                              value={selectedColors.lightButtonColor}
                              onChange={(value) =>
                                setValue('lightButtonColor', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightButtonColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Button Hover Color"
                              value={selectedColors.lightButtonHoverColor}
                              onChange={(value) =>
                                setValue('lightButtonHoverColor', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightButtonHoverColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Button Hover Text Color"
                              value={selectedColors.lightButtonHoverTextColor}
                              onChange={(value) =>
                                setValue('lightButtonHoverTextColor', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightButtonHoverTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Button Shadow"
                              value={selectedColors.lightButtonShadow}
                              onChange={(value) =>
                                setValue('lightButtonShadow', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightButtonShadow"
                              errors={errors}
                            />
                          </div>
                          <div className="">
                            <Checkbox
                              id="lightAllowShadow"
                              label="Allow Button Shadow"
                              defaultChecked={false}
                              register={register('lightAllowShadow')}
                              error={''}
                              className="items-center"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200 w-6/12">
                          <h2 className="text-2xl font-bold mb-2">Text</h2>
                          <div className="items-center justify-between lg:flex flex-wrap">
                            <div className="p-3 flex flex-col text-left w-8/12 relative mb-2">
                              <ColorSelect
                                label="Dark Text Color"
                                value={selectedColors.lightTextColor}
                                onChange={(value) =>
                                  setValue('lightTextColor', value)
                                }
                                colors={lightThemeColor}
                                register={register}
                                name="lightTextColor"
                                errors={errors}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200 w-6/12">
                          <h2 className="text-2xl font-bold mb-2">
                            Background
                          </h2>
                          <div className="items-center justify-between lg:flex flex-wrap">
                            <div className="p-3 flex flex-col text-left w-8/12 relative mb-2">
                              <ColorSelect
                                label="Dark Background Color"
                                value={selectedColors.lightBackgroundColor}
                                onChange={(value) =>
                                  setValue('lightBackgroundColor', value)
                                }
                                colors={lightThemeColor}
                                register={register}
                                name="lightBackgroundColor"
                                errors={errors}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="item mb-5 shadow-lg py-4 rounded-xl bg-slate-200">
                        <h2 className="text-2xl font-bold mb-2">Messages</h2>
                        <div className="items-center justify-between lg:flex flex-wrap">
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Success Text color"
                              value={selectedColors.lightSuccessTextColor}
                              onChange={(value) =>
                                setValue('lightSuccessTextColor', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightSuccessTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Warning Text color"
                              value={selectedColors.lightWarningTextColor}
                              onChange={(value) =>
                                setValue('lightWarningTextColor', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightWarningTextColor"
                              errors={errors}
                            />
                          </div>
                          <div className="p-3 flex flex-col text-left w-4/12 relative mb-2">
                            <ColorSelect
                              label="Dark Error Text color"
                              value={selectedColors.lightErrorTextColor}
                              onChange={(value) =>
                                setValue('lightErrorTextColor', value)
                              }
                              colors={lightThemeColor}
                              register={register}
                              name="lightErrorTextColor"
                              errors={errors}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end mt-8">
                    <button
                      type="submit"
                      className="px-4 py-3 bg-slate-500 text-white text-xl rounded-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
              <div className="preview w-3/12">
                <div
                  className="h-full px-4 py-8 rounded-xl text-left"
                  style={{
                    backgroundColor: isDarkMode
                      ? selectedColors.darkBackgroundColor
                      : selectedColors.lightBackgroundColor,
                    color: isDarkMode
                      ? selectedColors.darkTextColor
                      : selectedColors.lightTextColor,
                  }}
                >
                  <h2
                    style={{
                      color: isDarkMode
                        ? selectedColors.darkSuccessTextColor
                        : selectedColors.lightSuccessTextColor,
                    }}
                    className="text-4xl font-bold text-center mb-3"
                  >
                    Preview
                  </h2>
                  <h3 className="text-3xl font-bold mt-5">Text</h3>

                  <p className="text-lg">Text: Hello there! My name is Alex.</p>
                  <h3 className="text-3xl font-bold mt-5">Button</h3>

                  <button
                    className="mt-3 px-4 py-2 rounded-md"
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
                  <h3 className="text-3xl font-bold mt-5">Messages</h3>
                  <p
                    className="mt-3 text-xl mb-3"
                    style={{
                      color: isDarkMode
                        ? selectedColors.darkSuccessTextColor
                        : selectedColors.lightSuccessTextColor,
                    }}
                  >
                    This is success
                  </p>
                  <p
                    className="text-xl mb-3"
                    style={{
                      color: isDarkMode
                        ? selectedColors.darkWarningTextColor
                        : selectedColors.lightWarningTextColor,
                    }}
                  >
                    This is warning
                  </p>
                  <p
                    className="text-xl"
                    style={{
                      color: isDarkMode
                        ? selectedColors.darkErrorTextColor
                        : selectedColors.lightErrorTextColor,
                    }}
                  >
                    This is error
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
