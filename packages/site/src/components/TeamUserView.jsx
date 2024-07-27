import React, { useEffect, useState } from 'react';
import { PlusIcon } from 'heroiconsv2/24/outline';
import { MinusIcon as MinusIconOutline } from 'heroiconsv1/outline';
import usePortal from '../hooks/usePortal';
import { Input } from '../ui-components/input';
import { process_env } from '../utils/process_env';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `TeamUserView` is a React functional component that renders a view for displaying and managing team users. This component
 * provides a user interface for viewing user details, editing user information, adding new users, and removing users from the team.
 * It receives various props to customize its behavior and appearance.
 *
 * @component
 * @param {Object} props - The properties passed to the TeamUserView component.
 * @param {Array<Object>} props.users - An array of objects representing the team users.
 * @param {Function} props.onEditUser - Callback function to handle editing a user's information.
 * @param {Function} props.onRemoveUser - Callback function to handle removing a user from the team.
 * @param {Function} props.handleSubmit_RemoveTeamMember - Callback function to handle removing a team member.
 * @param {Function} props.handleSubmit_AddTeamMember - Callback function to handle adding a new team member.
 * @returns {JSX.Element} The rendered component for displaying and managing team users.
 */
export default function TeamUserView({
  user,
  userAuthPub,
  handleAltName,
  handleAltRole,
  handleAlias,
  handleSubmit_AddTeamMember,
  handleSubmit_RemoveTeamMember,
  isReadOnly,
}) {
  const [userImage, setUserImage] = useState();
  const { getBlobUrl } = usePortal();
  const [rerenderCount, setRerenderCount] = useState(0);

  const nameMax = 30;
  const roleMax = 30;

  useEffect(() => {
    (async () => {
      if (user?.image) {
        const linkUrl = await getBlobUrl(user.image);
        setUserImage(linkUrl);
      }
    })();
  }, [user]);

  useEffect(() => {
    setRerenderCount((prev) => prev + 1);
  }, [isReadOnly]);

  return (
    <div>
      <div className="">
        {/* Membership administration actions dropdown */}
        <div className="flex-col-1 flex transform space-y-2 transition duration-100 ease-in hover:scale-120">
          <div className="group relative">
            {userImage && (
              <img
                className="h-20 w-20 rounded-full shadow-md lg:h-24 lg:w-24"
                src={userImage || process_env.NO_AVATAR_IMAGE}
                alt=""
                crossOrigin="anonymous"
              />
            )}
            {!isReadOnly &&
              user?.userPub !== userAuthPub &&
              handleSubmit_RemoveTeamMember && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit_RemoveTeamMember(user?.userPub);
                  }}
                  className={classNames(
                    userImage
                      ? 'absolute left-[28px] top-[28px] lg:left-[32px] lg:top-[32px] opacity-0 duration-300 group-hover:opacity-100'
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
            <div>
              {user.firstName} {user.lastName}
            </div>
            <div className="text-fabstir-gray">{user.altName}</div>
            <div className="text-fabstir-gray">{user.alias}</div>
            <div className="text-fabstir-gray">{user.role}</div>
            <div className="text-fabstir-gray">{user.altRole}</div>

            {handleSubmit_AddTeamMember && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit_AddTeamMember(person?.userPub);
                }}
                className={`text-md  absolute left-[28px] top-[28px] z-10 flex w-fit rounded-full border-none bg-fabstir-gray bg-opacity-75 font-semibold text-fabstir-gray opacity-0 duration-300 group-hover:opacity-100 lg:left-[32px] lg:top-[32px]`}
              >
                <PlusIcon
                  className="h-8 w-8 font-bold text-fabstir-white lg:h-10 lg:w-10"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>

        <div className="w-full border-t border-fabstir-divide-color1" />

        <form>
          {handleAltName && (
            <>
              <div className="flex flex-1 justify-between">
                <label
                  htmlFor="altName"
                  className="block text-sm font-medium text-fabstir-gray"
                >
                  Name
                </label>
                <label
                  htmlFor="altName"
                  className="block text-sm font-medium text-fabstir-gray"
                >
                  Optional
                </label>
              </div>

              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs">
                  {/* <span className="text-gray-500 sm:text-sm">$</span> */}
                </div>
                <Input
                  key={`altName${rerenderCount}`}
                  type="text"
                  name="altName"
                  id="altName"
                  defaultValue={!user.altName ? user.userName : user.altName}
                  value={user?.altName}
                  onChange={(e) => handleAltName(e, user?.userPub)}
                  readOnly={isReadOnly}
                  maxLength={nameMax}
                  className={classNames(
                    isReadOnly
                      ? ''
                      : 'shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.25),inset_0_1px_1px_hsla(0,0%,0%,0.15)]',
                    'block w-full rounded-md border-2 border-fabstir-gray border-gray-300 bg-fabstir-gray-700 p-2 text-xs text-fabstir-gray focus:border-indigo-500 focus:ring-indigo-500',
                  )}
                  placeholder=""
                  aria-describedby="altName"
                />
                {/* <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                  {errors.altName?.message}
                </p> */}
              </div>
            </>
          )}

          {handleAltRole && (
            <>
              <div className="mt-4 flex flex-1 justify-between">
                <label
                  htmlFor="altRole"
                  className="block text-sm font-medium text-fabstir-gray"
                >
                  Role(s)
                </label>
                <label
                  htmlFor="altRoleOptional"
                  className="block text-sm font-medium text-fabstir-gray"
                >
                  Optional
                </label>
              </div>

              <div className="relative mt-1 rounded-md shadow-sm">
                <Input
                  key={`altRole${rerenderCount}`}
                  type="text"
                  name="altRole"
                  id="altRole"
                  defaultValue={!user.altRole ? user.role : user.altRole}
                  value={user?.altRole}
                  onChange={(e) => handleAltRole(e, user?.userPub)}
                  readOnly={isReadOnly}
                  maxLength={roleMax}
                  className={classNames(
                    isReadOnly
                      ? ''
                      : 'shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.25),inset_0_1px_1px_hsla(0,0%,0%,0.15)]',
                    'block w-full rounded-md border-2 border-fabstir-gray bg-fabstir-gray-700 p-2 text-xs text-fabstir-gray focus:border-indigo-500 focus:ring-indigo-500',
                  )}
                  placeholder=""
                  aria-describedby="altRole"
                />
                {/* <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                  {errors.altRole?.message}
                </p> */}
              </div>
            </>
          )}

          {handleAlias && (
            <>
              <div className="mt-4 flex flex-1 justify-between">
                <label
                  htmlFor="altRole"
                  className="block text-sm font-medium text-fabstir-gray"
                >
                  Alias/Part
                </label>
                <label
                  htmlFor="altRoleOptional"
                  className="block text-sm font-medium text-fabstir-gray"
                >
                  Optional
                </label>
              </div>

              <div className="relative mt-1 rounded-md shadow-sm">
                <Input
                  key={`alias${rerenderCount}`}
                  type="text"
                  name="alias"
                  id="alias"
                  defaultValue={!user.alias ? '' : user.alias}
                  value={user?.alias}
                  onChange={(e) => handleAlias(e, user?.userPub)}
                  readOnly={isReadOnly}
                  maxLength={roleMax}
                  className={classNames(
                    isReadOnly
                      ? ''
                      : 'shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.25),inset_0_1px_1px_hsla(0,0%,0%,0.15)]',
                    'block w-full rounded-md border-2 border-fabstir-gray border-gray-300 bg-fabstir-gray-700 p-2 text-xs text-fabstir-gray focus:border-indigo-500 focus:ring-indigo-500',
                  )}
                  placeholder=""
                  aria-describedby="alias"
                />
                {/* <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                  {errors.alias?.message}
                </p> */}
              </div>
            </>
          )}
        </form>
      </div>
      <div className="ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6"></div>
    </div>
  );
}
