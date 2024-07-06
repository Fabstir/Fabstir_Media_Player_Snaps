import { yupResolver } from '@hookform/resolvers/yup';
import { isAddress } from '@ethersproject/address';
// import PropTypes from 'prop-types';
import { user } from '../../src/user';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';
import * as yup from 'yup';
import { ChevronDownIcon } from 'heroiconsv2/24/outline';

import { userauthpubstate } from '../../src/atoms/userAuthAtom';
import useCreateUser from '../../src/hooks/useCreateUser';
import usePortal from '../../src/hooks/usePortal';
import useUserProfile from '../../src/hooks/useUserProfile';
import { Input } from '../../src/ui-components/input';
import { Select } from '../../src/ui-components/select';
import { Textarea } from '../../src/ui-components/textarea';
import { countries } from '../../src/utils/mediaAttributes';
import { Checkbox } from '../../src/ui-components/checkbox';
import { Switch } from '../../src/ui-components/switch';

const defaultAvatarImage = '/images/no_avatar.svg';

const defaultProfile = {
  // platformAliases: '',
  isPublished: false,
  about: '',
  firstName: '',
  lastName: '',
  company: '',
  emailAddress: '',
  country: '',
  streetAddress: '',
  city: '',
  region: '',
  zipPostcode: '',
  image: defaultAvatarImage,
};

export default function UserProfile({ initialProfile = defaultProfile }) {
  let { userPub } = useParams();

  //const navigate = useNavigate();
  const router = useRouter();

  //  const [userName, setUserName] = useRecoilState(usernamestate)
  const [userAuthPub] = useRecoilState(userauthpubstate);

  const [submitText, setSubmitText] = useState('Save');

  //  const { createMarket } = useFNFTMarketSale(null)

  if (!userPub) userPub = userAuthPub;
  const [inputReadOnly, setInputReadOnly] = useState(
    userPub === userAuthPub && false,
  );

  const [getUserProfile, , getUserSecurityQuestions] = useUserProfile();
  const [watchUrl, setWatchUrl] = useState();
  const [watchMyPlatformLogoUrl, setWatchMyPlatformLogoUrl] = useState();
  const [
    watchMyPlatformBackgroundImageUrl,
    setWatchMyPlatformBackgroundImageUrl,
  ] = useState();

  useEffect(() => {
    (async () => {
      if (userPub) {
        console.log(
          'Login: inside useEffect user._.sea.pub = ',
          user._.sea.pub,
        );
        let profile = await getUserProfile(userPub);
        console.log('Login: inside useEffect userPub = ', userPub);
        console.log('Login: inside useEffect profile = ', profile);

        reset(profile);

        const linkUrl = await getBlobUrl(profile.image);
        setWatchUrl(linkUrl);
      }
    })();
  }, [userPub]);

  const { uploadFile } = usePortal();

  console.log('before useCreateUser');
  const { createUser, putUserProfile } = useCreateUser();
  console.log('after useCreateUser');

  const securityQuestions = [
    'What Is your favorite book?',
    'What is the name of the road you grew up on?',
    'What is your mother’s maiden name?',
    'What was the name of your first/current/favorite pet?',
    'What was the first company that you worked for?',
    'Where did you meet your spouse?',
    'Where did you go to high school/college?',
    'What is your favorite food?',
    'What city were you born in?',
    'Where is your favorite place to vacation?',
  ];

  const role = [
    '3D Artist',
    '3D Modeler',
    'Actor',
    'Animation Artist',
    'Archivist',
    'Arranger',
    'Art Director',
    'Audio Programmer',
    'Author',
    'Background Vocalist',
    'Casting Director',
    'Character Designer',
    'Choreographer',
    'Cinematographer',
    'Colorist',
    'Composer',
    'Concept Artist',
    'Content Strategist',
    'Copywriter',
    'Costume Designer',
    'Curator',
    'DJ',
    'Data Analyst',
    'Digital Artist',
    'Director',
    'Document Specialist',
    'Editor',
    'Environment Artist',
    'Foley Artist',
    'Graphic Designer',
    'Illustrator',
    'Instrument Technician',
    'Legal Consultant',
    'Lighting Artist',
    'Live Sound Engineer',
    'Location Manager',
    'Lyricist',
    'Makeup Artist',
    'Mastering Engineer',
    'Metaverse Architect',
    'Mixing Engineer',
    'Modeling Artist',
    'Music Manager',
    'Music Producer',
    'Music Publisher',
    'Music Supervisor',
    'Music Video Director',
    'NFT Consultant',
    'Other',
    'Painter',
    'Photographer',
    'Printmaker',
    'Producer',
    'Production Designer',
    'Programmer',
    'Recording Engineer',
    'Researcher',
    'Retoucher',
    'Scientist',
    'Screenwriter',
    'Session Musician',
    'Set Decorator',
    'Singer',
    'Software Developer',
    'Songwriter',
    'Sound Designer',
    'Special Effects',
    'Storyboard Artist',
    'Stunt Coordinator',
    'Texture Artist',
    'Ticket Designer',
    'Translator',
    'UI/UX Designer',
    'Visual Effects',
    'Visual Effects Artist',
  ];

  const userNameMax = 20;
  const aboutMax = 4000;
  const nameMax = 30;
  const companyMax = 50;
  const myPlatformNameMax = 20;
  // const myPlatformAliasMax = 20
  // const platformAliasesMax = 30 * myPlatformAliasMax
  const emailAddressMax = 100;
  const streetAddressMax = 100;
  const countryMax = 40;
  const cityMax = 30;
  const regionMax = 30;
  const zipPostcodeMax = 20;
  const imageMax = 200;

  const isProfileEdit = userAuthPub && userPub === userAuthPub;

  const profileSchema = yup.object().shape({
    userName: yup
      .string()
      .notRequired()
      .max(userNameMax, `Name length is up to ${userNameMax} characters`)
      .required('Name required'),

    accountAddress: yup.string().test({
      name: 'isAddress',
      exclusive: false,
      params: {},
      message: 'Must be valid Ethereum address',
      test: function (value) {
        return isAddress(value);
      },
    }),

    about: yup
      .string()
      .max(aboutMax, `Must be less than ${aboutMax} characters`)
      .notRequired(),

    image: yup
      .string()
      .max(imageMax, `image Url too long`)
      // .required('Upload photo')
      .notRequired()
      .test({
        name: 'noPhoto',
        exclusive: false,
        params: {},
        message: 'Upload photo',
        test: function (value) {
          // You can access the price field with `this.parent`.
          return value !== defaultAvatarImage;
        },
      }),

    firstName: yup
      .string()
      .max(nameMax, `Must be less than ${nameMax} characters`)
      .required('First name required'),
    lastName: yup
      .string()
      .max(nameMax, `Must be less than ${nameMax} characters`)
      .required('Last name required'),
    company: yup
      .string()
      .max(companyMax, `Must be less than ${nameMax} characters`)
      .notRequired(),
    emailAddress: yup
      .string()
      .max(emailAddressMax, `Must be less than ${emailAddressMax} characters`),
    country: yup
      .string()
      .max(countryMax, `Must be less than ${countryMax} characters`)
      .notRequired(),
    streetAddress: yup
      .string()
      .max(streetAddressMax, `Must be less than ${streetAddressMax} characters`)
      .notRequired(),
    city: yup
      .string()
      .max(cityMax, `Must be less than ${cityMax} characters`)
      .notRequired(),
    region: yup
      .string()
      .max(regionMax, `Must be less than ${regionMax} characters`)
      .notRequired(),
    zipPostcode: yup
      .string()
      .max(zipPostcodeMax, `Must be less than ${zipPostcodeMax} characters`)
      .notRequired(),
  });

  async function handlesubmit_save(data) {
    setSubmitText('Saving...');

    let userProfile = { ...data };

    console.log('Profile: handlesubmit_save: inside');

    if (isProfileEdit && userPub) {
      putUserProfile(userProfile);
    } else throw new Error('Must be logged in to save profile.');

    setSubmitText('Saved!');
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    getValues,
    setValue,
  } = useForm({
    defaultValues: initialProfile,
    resolver: yupResolver(profileSchema),
  });

  const { getBlobUrl } = usePortal();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      // Do something with the files
      console.log('acceptedFiles = ', acceptedFiles);

      if (!acceptedFiles || acceptedFiles.length !== 1) {
        alert('Please upload single image only');
        return;
      }

      const link = await uploadFile(acceptedFiles[0]);
      console.log('onDrop: link = ', link);

      setValue('image', link);
      (async () => {
        const linkUrl = await getBlobUrl(link);
        setWatchUrl(linkUrl);
      })();
    },
    [setValue, uploadFile],
  );

  const onDrop2 = useCallback(
    async (acceptedFiles) => {
      // Do something with the files
      console.log('acceptedFiles = ', acceptedFiles);

      if (!acceptedFiles || acceptedFiles.length !== 1) {
        alert('Please upload single image only');
        return;
      }

      const link = await uploadFile(acceptedFiles[0]);
      console.log('onDrop: link = ', link);

      setValue('myPlatformLogo', link);
      (async () => {
        const linkUrl = await getBlobUrl(link);
        setWatchMyPlatformLogoUrl(linkUrl);
      })();
    },
    [setValue, uploadFile],
  );

  const onDrop3 = useCallback(
    async (acceptedFiles) => {
      // Do something with the files
      console.log('acceptedFiles = ', acceptedFiles);

      if (!acceptedFiles || acceptedFiles.length !== 1) {
        alert('Please upload single image only');
        return;
      }

      const link = await uploadFile(acceptedFiles[0]);
      console.log('onDrop: link = ', link);

      setValue('myPlatformBackgroundImage', link);
      (async () => {
        const linkUrl = await getBlobUrl(link);
        setWatchMyPlatformBackgroundImageUrl(linkUrl);
      })();
    },
    [setValue, uploadFile],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } =
    useDropzone({ onDrop: onDrop2 });

  const { getRootProps: getRootProps3, getInputProps: getInputProps3 } =
    useDropzone({ onDrop: onDrop3 });

  const CustomDropdown = ({ options, name, control, defaultValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
      const selectedValues = Array.isArray(selectedValue) ? selectedValue : [];
      const isSelected = selectedValues.includes(option);

      // Update the selection: add if not selected, remove if already selected
      const updatedValues = isSelected
        ? selectedValues.filter((val) => val !== option)
        : [...selectedValues, option];

      setSelectedValue(updatedValues);
      setIsOpen(false);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Update form state when selectedValue changes
    useEffect(() => {
      setValue(name, selectedValue);
    }, [selectedValue, setValue, name]);

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div ref={dropdownRef} className="relative inline-block w-full">
        <input
          readOnly
          className="w-full truncate bg-fabstir-dark-gray py-2 pl-2 pr-8 text-fabstir-light-gray"
          value={selectedValue?.join(', ') || ''}
          title={selectedValue?.join(', ') || ''}
          onClick={() => setIsOpen(!isOpen)}
        />
        <ChevronDownIcon
          className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 transform cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
        {isOpen && (
          <div className="absolute z-10 w-full border-2 border-fabstir-gray bg-fabstir-gray-700">
            {options.map((option) => {
              return (
                <div
                  key={option}
                  className={`p-2 hover:bg-gray-100 ${
                    selectedValue?.includes(option) ? 'bg-fabstir-gray-500' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              );
            })}
          </div>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="hidden"
              multiple
              value={selectedValue || []}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        />
      </div>
    );
  };

  const ColorThemeMode = {
    LIGHT: 'LIGHT',
    DARK: 'DARK',
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="h-screen">
      <div className="mx-auto grid max-w-3xl grid-cols-1 bg-fabstir-gray-700 p-12">
        <form
          onSubmit={handleSubmit(handlesubmit_save)}
          className="space-y-8 divide-y divide-fabstir-gray"
        >
          <div className="space-y-8 divide-y divide-fabstir-gray">
            <div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-fabstir-light-gray">
                  Profile
                </h3>
                <p className="mt-1 text-sm text-fabstir-light-gray">
                  This information will be displayed publicly so be careful what
                  you share.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                <div className="mt-4 sm:col-span-4">
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Username
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray shadow-sm">
                    <Input
                      type="text"
                      id="userName"
                      autoComplete="given-name"
                      readOnly={inputReadOnly}
                      register={register('userName')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.userName?.message}
                  </p>
                </div>

                <div className=" col-span-6 border-b-1 border-fabstir-gray"></div>

                <div className="mt-4 sm:col-span-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-fabstir-light-gray">
                      About
                    </h3>
                    <p className="mt-1 text-sm text-fabstir-light-gray">
                      Write a few sentences about yourself.
                    </p>
                  </div>

                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Textarea
                      id="about"
                      name="about"
                      rows={3}
                      readOnly={inputReadOnly}
                      register={register('about')}
                      className="block w-full rounded-md border border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                      defaultValue={''}
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.about?.message}
                  </p>
                </div>

                <div className=" col-span-6 border-b-1 border-fabstir-gray"></div>

                <div className="flex justify-between sm:col-span-6">
                  <div className="">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium text-fabstir-light-gray"
                    >
                      Photo
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 shadow-md">
                        <img
                          src={watchUrl}
                          alt=""
                          className="object-cover"
                          crossOrigin="anonymous"
                        />
                      </span>
                      <button
                        type="button"
                        className="hover:bg-fabstir-gary ml-5 rounded-md border border-fabstir-gray bg-fabstir-dark-gray px-3 py-2 text-sm font-medium leading-4 text-fabstir-light-gray shadow-sm focus:outline-none focus:ring-2 focus:ring-fabstir-focus-colour1 focus:ring-offset-2"
                      >
                        Change
                      </button>
                    </div>
                    <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                      {errors.image?.message}
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-fabstir-light-gray"
                    >
                      Role(s)
                    </label>
                    <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                      <CustomDropdown
                        options={role}
                        name="role"
                        control={control}
                        defaultValue={getValues(`role`)}
                      />
                    </div>
                    <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                      {errors.role?.message}
                    </p>
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Cover photo
                  </label>
                  <div
                    {...getRootProps()}
                    className="mt-1 flex justify-center rounded-md border-2 border-dashed border-fabstir-gray bg-fabstir-dark-gray px-6 pb-6 pt-5"
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-fabstir-hover-colour1 focus-within:outline-none focus-within:ring-2 focus-within:ring-fabstir-focus-colour1 focus-within:ring-offset-2 hover:text-fabstir-focus-colour1"
                        >
                          <span>Upload a file</span>
                          <Input
                            inputProps={getInputProps()}
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            readOnly={inputReadOnly}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>

                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div>
                <h3 className="text-lg font-medium leading-6 text-fabstir-light-gray">
                  Personal Information
                </h3>
                <p className="mt-1 text-sm text-fabstir-light-gray">
                  Use a permanent address where you can receive mail.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-7">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    First name
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Input
                      type="text"
                      id="firstName"
                      autoComplete="given-name"
                      readOnly={inputReadOnly}
                      register={register('firstName')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.firstName?.message}
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Last name
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray text-black">
                    <Input
                      type="text"
                      id="lastName"
                      autoComplete="family-name"
                      readOnly={inputReadOnly}
                      register={register('lastName')}
                      className="block w-full rounded-md bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm text-black"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.lastName?.message}
                  </p>
                </div>

                <div className="sm:col-span-5">
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Company
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Input
                      type="text"
                      id="company"
                      autoComplete="company"
                      readOnly={inputReadOnly}
                      register={register('company')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.company?.message}
                  </p>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="accountAddress"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Account
                  </label>

                  <div className="flex flex-1">
                    <div className="mr-4 w-full">
                      <div className="mt-1 rounded-md border-2 border-fabstir-gray bg-fabstir-dark-gray p-2 text-fabstir-light-gray">
                        {getValues(`accountAddress`)}
                      </div>
                    </div>

                    {/* <div className="rounded-md border border-fabstir-gray bg-fabstir-dark-gray px-4 py-2 text-sm font-medium text-fabstir-light-gray shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-fabstir-focus-colour1 focus:ring-offset-2">
                      Use Wallet Address
                    </div> */}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="userPub"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Public Key
                  </label>

                  <div className="mr-4 mt-1 flex w-full flex-1 rounded-md border-2 border-fabstir-gray">
                    <div
                      className="block w-full truncate rounded-md border-fabstir-gray bg-fabstir-dark-gray p-2 text-fabstir-light-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                      title={userPub} // Tooltip added here
                    >
                      {userPub}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Email address
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      readOnly={inputReadOnly}
                      register={register('emailAddress')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.emailAddress?.message}
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Country
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Select
                      type="text"
                      id="country"
                      autoComplete="country"
                      register={register('country')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    >
                      {countries.map((country) => (
                        <option key={country}>{country}</option>
                      ))}
                    </Select>
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.country?.message}
                  </p>
                </div>

                <div className="col-start-1 sm:col-span-6">
                  <label
                    htmlFor="street-address"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    Street address
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Input
                      type="text"
                      id="street-address"
                      autoComplete="street-address"
                      readOnly={inputReadOnly}
                      register={register('streetAddress')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.streetAddress?.message}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    City
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      readOnly={inputReadOnly}
                      register={register('city')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.city?.message}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    State / Province
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Input
                      type="text"
                      id="region"
                      autoComplete="address-level1"
                      readOnly={inputReadOnly}
                      register={register('region')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.region?.message}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="postal-code"
                    className="block text-sm font-medium text-fabstir-light-gray"
                  >
                    ZIP / Postal code
                  </label>
                  <div className="mt-1 rounded-md border-2 border-fabstir-gray">
                    <Input
                      type="text"
                      id="postal-code"
                      autoComplete="postal-code"
                      readOnly={inputReadOnly}
                      register={register('zipPostcode')}
                      className="block w-full rounded-md border-fabstir-gray bg-fabstir-dark-gray shadow-sm focus:border-fabstir-focus-colour1 focus:ring-fabstir-focus-colour1 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                    {errors.zipPostcode?.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-md border border-fabstir-gray bg-fabstir-dark-gray px-4 py-2 text-sm font-medium text-fabstir-light-gray shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-fabstir-focus-colour1 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-fabstir-action-colour1 px-4 py-2 text-sm font-medium text-fabstir-light-gray shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-fabstir-focus-colour1 focus:ring-offset-2"
              >
                {!userPub ? 'Sign Up' : submitText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// UserProfile.propTypes = {
//   setToken: PropTypes.func.isRequired,
// }
