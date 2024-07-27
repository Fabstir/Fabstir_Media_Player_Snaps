import React, { useEffect, useState } from 'react';
import { Input } from '../ui-components/input';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from 'heroiconsv2/24/outline';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `TeamNewUserView` is a React functional component that renders a view for adding a new user to a team. This component
 * provides a user interface for inputting new user details and submitting them to be added to the team. It receives various
 * props to customize its behavior and appearance.
 *
 * @component
 * @param {Object} props - The properties passed to the TeamNewUserView component.
 * @param {Function} props.onSubmit - Callback function to handle the submission of the new user details.
 * @param {Function} props.onCancel - Callback function to handle the cancellation of adding a new user.
 * @param {Object} props.userDetails - An object containing the details of the new user to be added.
 * @param {Function} props.setUserDetails - Function to update the user details state.
 * @returns {JSX.Element} The rendered component for adding a new user to a team.
 */
export default function TeamNewUserView({
  user,
  setUser,
  handleSubmit_AddTeamMember,
}) {
  const [rerenderCount, setRerenderCount] = useState(0);

  const firstNameMax = 20;
  const lastNameMax = 20;
  const altNameMax = 30;
  const aliasMax = 30;
  const roleMax = 30;

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
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm({
    defaultValues: defaultUser,
    resolver: yupResolver(userSchema),
  });

  function handleSubmit_User(data) {
    console.log('handleSubmit_User: data = ', data);

    const user = { ...data, userPub: uuidv4() };
    setUser(user);
    handleSubmit_AddTeamMember(user);

    reset(defaultUser);
  }

  return (
    <div>
      <div className="space-y-1">
        {/* Membership administration actions dropdown */}
        <div className="w-full border-t border-fabstir-divide-color1" />

        <form onSubmit={handleSubmit((data) => handleSubmit_User(data))}>
          <>
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
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.firstName?.message}
              </p>
            </div>

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
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.lastName?.message}
              </p>
            </div>

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
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.altName?.message}
              </p>
            </div>

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
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.alias?.message}
              </p>
            </div>

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
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.role?.message}
              </p>
            </div>

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
                />
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                {errors.altRole?.message}
              </p>
            </div>
          </>

          <div className="flex-col-1 flex transform transition duration-100 ease-in hover:scale-120">
            <div className="group relative mx-auto">
              {handleSubmit_AddTeamMember && (
                <>
                  <button
                    type="submit"
                    className="w-full rounded-md border border-transparent bg-fabstir-light-purple px-2 py-2 text-sm text-fabstir-dark-gray shadow-sm hover:bg-fabstir-dark-purple focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:mr-6 flex items-center justify-center bg-fabstir-light-gray font-semibold"
                  >
                    <PlusIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                      stroke="currentColor"
                      strokeWidth={2}
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6"></div>
    </div>
  );
}
