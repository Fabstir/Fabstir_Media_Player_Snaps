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
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/solid';

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
import { Button } from '../../src/ui-components/button';
import { Text, Code, TextLink } from '../../src/ui-components/text';

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

        const linkUrl = await getBlobUrl(profile?.image);
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

    // accountAddress: yup.string().test({
    //   name: 'isAddress',
    //   exclusive: false,
    //   params: {},
    //   message: 'Must be valid Ethereum address',
    //   test: function (value) {
    //     return isAddress(value);
    //   },
    // }),

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
    return (
      <div className="relative inline-block w-full">
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) => (
            <Select
              {...field}
              options={options.map((option) => ({
                value: option,
                label: option,
              }))}
              multiple={true}
              value={field.value || []}
              onChange={(value) => {
                field.onChange(value);
              }}
              className="block w-full bg-white py-2 pl-2 pr-8 text-text dark:text-dark-text"
            />
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

  function handleBackToRoot() {
    router.push('/');
  }

  return (
    <div className="h-screen">
      <div className="flex justify-start ml-4">
        <TextLink
          className="mt-6"
          href="/"
          // onClick={handleBackToRoot}
        >
          <div className="flex items-center">
            <ChevronDoubleLeftIcon
              className="h-6 w-6 font-bold text-gray-500 lg:h-8 lg:w-8 mr-2"
              aria-hidden="true"
            />
            <span className="text-text dark:text-dark-text">Back to Root</span>
          </div>
        </TextLink>
      </div>
      <div className="mx-auto grid max-w-3xl grid-cols-1 bg-gray-700">
        <form
          onSubmit={handleSubmit(handlesubmit_save)}
          className="space-y-8 divide-y divide-gray"
        >
          <div className="space-y-8 divide-y divide-gray">
            <div>
              <div>
                <h3 className="text-2xl font-medium leading-6 text-text dark:text-dark-text">
                  Profile
                </h3>
                <p className="mt-1 text-sm text-text dark:text-dark-text">
                  This information will be displayed publicly so be careful what
                  you share.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                <div className="mt-4 sm:col-span-4">
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Username
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray shadow-sm">
                    <Input
                      type="text"
                      id="userName"
                      autoComplete="given-name"
                      readOnly={inputReadOnly}
                      register={register('userName')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.userName?.message}
                  </p>
                </div>

                <div className=" col-span-6 border-b-1 border-gray"></div>

                <div className="mt-4 sm:col-span-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-text dark:text-dark-text">
                      About
                    </h3>
                    <p className="mt-1 text-sm text-text dark:text-dark-text">
                      Write a few sentences about yourself.
                    </p>
                  </div>

                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Textarea
                      id="about"
                      name="about"
                      rows={3}
                      readOnly={inputReadOnly}
                      register={register('about')}
                      className="block w-full rounded-md border border-gray bg-white shadow-sm sm:text-sm text-text dark:text-dark-text"
                      defaultValue={''}
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.about?.message}
                  </p>
                </div>

                <div className=" col-span-6 border-b-1 border-gray"></div>

                <div className="flex justify-between sm:col-span-6">
                  <div className="">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium text-text dark:text-dark-text"
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
                      <Button
                        variant=""
                        size="medium"
                        className="ml-5 rounded-md border px-3 py-2 text-sm font-medium leading-4 "
                      >
                        Change
                      </Button>
                    </div>
                    <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                      {errors.image?.message}
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-text dark:text-dark-text"
                    >
                      Role(s)
                    </label>
                    <div className="mt-1 rounded-md border-2 border-gray">
                      <CustomDropdown
                        options={role}
                        name="role"
                        control={control}
                        defaultValue={getValues(`role`)}
                      />
                    </div>
                    <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                      {errors.role?.message}
                    </p>
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Cover photo
                  </label>
                  <div
                    {...getRootProps()}
                    className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray bg-white px-6 pb-6 pt-5"
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
                          className="relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2"
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
                <h3 className="text-lg font-medium leading-6 text-text dark:text-dark-text">
                  Personal Information
                </h3>
                <p className="mt-1 text-sm text-text dark:text-dark-text">
                  Use a permanent address where you can receive mail.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-7">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    First name
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Input
                      type="text"
                      id="firstName"
                      autoComplete="given-name"
                      readOnly={inputReadOnly}
                      register={register('firstName')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.firstName?.message}
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Last name
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray text-black">
                    <Input
                      type="text"
                      id="lastName"
                      autoComplete="family-name"
                      readOnly={inputReadOnly}
                      register={register('lastName')}
                      className="block w-full rounded-md bg-white shadow-sm sm:text-sm text-black"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.lastName?.message}
                  </p>
                </div>

                <div className="sm:col-span-5">
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Company
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Input
                      type="text"
                      id="company"
                      autoComplete="company"
                      readOnly={inputReadOnly}
                      register={register('company')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.company?.message}
                  </p>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="accountAddress"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Account
                  </label>

                  <div className="flex flex-1">
                    <Code className="p-2 text-md px-2">
                      {getValues(`accountAddress`)}
                    </Code>
                    {/* <div className="mr-4 w-full">
                      <div className="mt-1 rounded-md border-2 border-gray bg-white p-2 text-text dark:text-dark-text">
                        {getValues(`accountAddress`)}
                      </div>
                    </div> */}

                    {/* <div className="rounded-md border border-gray bg-white px-4 py-2 text-sm font-medium text-text dark:text-dark-text shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2">
                      Use Wallet Address
                    </div> */}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="userPub"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Public Key
                  </label>

                  <Code className="p-2 text-md px-2">{userPub}</Code>

                  {/* <div className="mr-4 mt-1 flex w-full flex-1 rounded-md border-2 border-gray">
                    <div
                      className="block w-full truncate rounded-md border-gray bg-white p-2 text-text dark:text-dark-text shadow-sm sm:text-sm"
                      title={userPub} // Tooltip added here
                    >
                      {userPub}
                    </div>
                  </div> */}
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Email address
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      readOnly={inputReadOnly}
                      register={register('emailAddress')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.emailAddress?.message}
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Country
                  </label>
                  <div className="mt-1 rounded-md border-2">
                    <Select
                      id="country"
                      options={countries.map((country) => ({
                        value: country,
                        label: country,
                      }))}
                      register={register('country')}
                      error={errors.country?.message}
                      className="block w-full rounded-md sm:text-sm"
                    />{' '}
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.country?.message}
                  </p>
                </div>

                <div className="col-start-1 sm:col-span-6">
                  <label
                    htmlFor="street-address"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    Street address
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Input
                      type="text"
                      id="street-address"
                      autoComplete="street-address"
                      readOnly={inputReadOnly}
                      register={register('streetAddress')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm  sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.streetAddress?.message}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    City
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      readOnly={inputReadOnly}
                      register={register('city')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm  sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.city?.message}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    State / Province
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Input
                      type="text"
                      id="region"
                      autoComplete="address-level1"
                      readOnly={inputReadOnly}
                      register={register('region')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm  sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.region?.message}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="postal-code"
                    className="block text-sm font-medium text-text dark:text-dark-text"
                  >
                    ZIP / Postal code
                  </label>
                  <div className="mt-1 rounded-md border-2 border-gray">
                    <Input
                      type="text"
                      id="postal-code"
                      autoComplete="postal-code"
                      readOnly={inputReadOnly}
                      register={register('zipPostcode')}
                      className="block w-full rounded-md border-gray bg-white shadow-sm  sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors.zipPostcode?.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <Button
                variant=""
                size="medium"
                onClick={handleBack}
                className="rounded-md px-4 py-2 text-sm font-medium "
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant=""
                size="medium"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium "
              >
                {!userPub ? 'Sign Up' : submitText}
              </Button>
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
