import React, { useCallback, useEffect, useState } from 'react';
import { MinusIcon as MinusIconOutline } from 'heroiconsv1/outline';
import { Input } from '../ui-components/input';
import { Button } from '../ui-components/button';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, PencilIcon } from 'heroiconsv2/24/outline';
import { useDropzone } from 'react-dropzone';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import usePortal from '../hooks/usePortal';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `TeamUserView` is a React functional component that displays the details of a user within a team.
 * This component provides a user interface for viewing and managing individual team member details.
 *
 * @component
 * @param {Object} props - The properties passed to the TeamUserView component.
 * @param {Object} props.user - The user object containing user details.
 * @param {Object} props.team - The team object containing team details.
 * @param {boolean} props.isReadOnly - A flag indicating whether the view is read-only.
 * @param {Function} props.handleEditUser - Callback function to handle editing the user's details.
 * @param {Function} props.handleRemoveUser - Callback function to handle removing the user from the team.
 * @returns {JSX.Element} The rendered component displaying the user's details within the team.
 */
export default function TeamUserView({
  user,
  userAuthPub,
  isReadOnly = true,
  handleEditMember,
  handleSubmit_SaveTeamMember,
  handleSubmit_RemoveTeamMember,
  showEditButton,
}) {
  const [isEditable, setIsEditable] = useState(!isReadOnly);
  const [imageUrl, setImageUrl] = useState();
  const { uploadFile, getBlobUrl } = usePortal();

  const firstNameMax = 20;
  const lastNameMax = 20;
  const altNameMax = 30;
  const aliasMax = 30;
  const roleMax = 30;
  const imageMax = 120;

  const defaultUser = {
    userName: '',
    firstName: '',
    lastName: '',
    altName: '',
    alias: '',
    role: '',
    altRole: '',
    image: '',
  };

  const userSchema = yup.object().shape({
    firstName: yup
      .string()
      .max(firstNameMax, `Must be less than ${firstNameMax} characters`)
      .required('First name required'),
    lastName: yup
      .string()
      .max(lastNameMax, `Must be less than ${lastNameMax} characters`)
      .required('Last name required'),

    altName: yup
      .string()
      .max(altNameMax, `Must be less than ${altNameMax} characters`)
      .notRequired(),

    alias: yup
      .string()
      .max(aliasMax, `Must be less than ${aliasMax} characters`)
      .notRequired(),

    role: yup
      .string()
      .max(roleMax, `Must be less than ${roleMax} characters`)
      .notRequired(),

    altRole: yup
      .string()
      .max(roleMax, `Must be less than ${roleMax} characters`)
      .notRequired(),

    imageMax: yup
      .string()
      .max(imageMax, `Must be less than ${imageMax} characters`)
      .notRequired(),
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    setValue,
    getValues,
    watch,
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

    if (!handleEditMember) {
      reset(defaultUser);
      setImageUrl(null);
    } else setIsEditable(false);
  }

  function handleCancel() {
    setIsEditable(false);
    reset(user || defaultUser);
  }

  useEffect(() => {
    if (watch('image')) {
      (async () => {
        const linkUrl = await getBlobUrl(watch('image'));
        setImageUrl(linkUrl);
      })();
    }
  }, [watch('image')]);

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
        setImageUrl(linkUrl);
      })();
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="">
      <div className="border-t border-fabstir-divide-color1" />

      <form onSubmit={handleSubmit(handleSave)}>
        <>
          {isEditable ? (
            <>
              {imageUrl && (
                <div className="mb-2">
                  <img
                    className="h-20 w-20 rounded-full shadow-md lg:h-24 lg:w-24"
                    src={imageUrl}
                    alt=""
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              <div
                {...getRootProps()}
                className="mt-1 flex justify-center rounded-md border-2 border-dashed border-fabstir-gray bg-fabstir-light-gray px-2 pb-6 pt-5"
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
                      <span>Upload or drag and drop</span>
                      <Input
                        inputProps={getInputProps()}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        // readOnly={inputReadOnly}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="relative group flex justify-center items-center">
              {imageUrl && (
                <img
                  className="h-20 w-20 rounded-full shadow-md lg:h-24 lg:w-24"
                  src={imageUrl}
                  alt=""
                  crossOrigin="anonymous"
                />
              )}
              {showEditButton &&
                user?.userPub !== userAuthPub &&
                handleSubmit_RemoveTeamMember && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit_RemoveTeamMember(user?.userPub);
                    }}
                    className={classNames(
                      imageUrl
                        ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 duration-300 opacity-0 group-hover:opacity-100'
                        : 'mb-2',
                      'text-md z-10 flex w-fit rounded-full border-none bg-fabstir-gray bg-opacity-75 font-semibold text-fabstir-gray',
                    )}
                  >
                    <MinusIconOutline
                      className="h-6 w-6 font-bold text-fabstir-white lg:h-8 lg:w-8"
                      aria-hidden="true"
                    />
                  </div>
                )}
            </div>
          )}

          {(isEditable ||
            (typeof watch('firstName') === 'string' &&
              watch('firstName').trim() !== '')) && (
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-fabstir-gray"
              >
                First name
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="firstName"
                  {...register('firstName')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.firstName?.message}
              </p>
            </div>
          )}

          {(isEditable ||
            (typeof watch('lastName') === 'string' &&
              watch('lastName').trim() !== '')) && (
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-fabstir-gray"
              >
                Last name
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="lastName"
                  {...register('lastName')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.lastName?.message}
              </p>
            </div>
          )}

          {(isEditable ||
            (typeof watch('altName') === 'string' &&
              watch('altName').trim() !== '')) && (
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="altName"
                className="block text-sm font-medium text-fabstir-gray"
              >
                altName
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="altName"
                  {...register('altName')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.altName?.message}
              </p>
            </div>
          )}

          {(isEditable ||
            (typeof watch('alias') === 'string' &&
              watch('alias').trim() !== '')) && (
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="alias"
                className="block text-sm font-medium text-fabstir-gray"
              >
                alias
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="alias"
                  {...register('alias')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.alias?.message}
              </p>
            </div>
          )}

          {(isEditable ||
            (typeof watch('role') === 'string' &&
              watch('role').trim() !== '')) && (
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-fabstir-gray"
              >
                role
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="role"
                  {...register('role')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.role?.message}
              </p>
            </div>
          )}

          {(isEditable ||
            (typeof watch('altRole') === 'string' &&
              watch('altRole').trim() !== '')) && (
            <div className="col-span-3 sm:col-span-4">
              <label
                htmlFor="altRole"
                className="block text-sm font-medium text-fabstir-gray"
              >
                altRole
              </label>
              <div className="mt-1 rounded-lg border-2 border-fabstir-white">
                <input
                  type="text"
                  name="altRole"
                  {...register('altRole')}
                  className="block w-full bg-fabstir-white"
                  readOnly={!isEditable}
                />
              </div>
              <p className="mt-2 text-fabstir-light-pink">
                {errors.altRole?.message}
              </p>
            </div>
          )}
        </>

        {isEditable ? (
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="primary"
              size="medium"
              onClick={handleCancel}
              className="w-full rounded-md border border-transparent px-4 py-2 text-sm shadow-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              className="w-full rounded-md border border-transparent px-4 py-2 text-sm shadow-md"
            >
              Save Member
            </Button>
          </div>
        ) : showEditButton ? (
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={handleEdit}
            className="w-full rounded-md border border-transparent px-4 py-2 text-sm shadow-sm flex items-center justify-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Edit
          </Button>
        ) : (
          <></>
        )}
      </form>
    </div>
  );
}
