import React from 'react';
import { PlusIcon, PencilIcon } from 'heroiconsv2/24/outline';
import { useRecoilState, useRecoilValue } from 'recoil';
import Team from '../../src/components/Team';
import { isupdateteamsstate, teamsstate } from '../../src/atoms/teamsAtom';
import { useRouter } from 'next/router';
import {
  isupdatepermissionsstate,
  permissionsstate,
} from '../../src/atoms/permissionsAtom';
import PermissionUserView from '../../src/components/PermissionUserView';
import { Button } from '../../src/ui-components/button';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `Teams` is a React functional component that renders a list teams. This component is designed to display
 * information about various teams, including details such as team names, members, and other relevant data.
 *
 * @component
 * @returns {JSX.Element} The rendered list or grid of teams.
 */
export default function PermissionsTeams() {
  const router = useRouter();

  const [permissions, setPermissions] = useRecoilState(permissionsstate);
  const [isUpdatePermissions, setIsUpdatePermissions] = useRecoilState(
    isupdatepermissionsstate,
  );

  /**
   * Updates a specific permission in the list of permissions at the given index. This function creates a new state object with the updated permission
   * and sets it using the `setPermissions` function. It ensures immutability by creating a new array with the updated permission inserted at the
   * correct position.
   *
   * @function
   * @param {Object} permission - The updated permission object.
   * @param {number} index - The index of the permission to be updated in the permissions array.
   */
  function handleUpdatePermission(permission, index) {
    setPermissions({
      ...permissions,
      permissions: [
        ...permissions.permissions.slice(0, index),
        permission,
        ...permissions.permissions.slice(index + 1),
      ],
    });
  }

  /**
   * Deletes a specific permission from the list of permissions at the given index. This function creates a new state object with the permission
   * removed and sets it using the `setPermissions` function. It ensures immutability by creating a new array without the permission at the
   * specified index.
   *
   * @function
   * @param {number} index - The index of the permission to be deleted from the permissions array.
   */
  function handleDeletePermission(index) {
    setPermissions({
      ...permissions,
      permissions: [
        ...permissions.permissions.slice(0, index),
        ...permissions.permissions.slice(index + 1),
      ],
    });
  }

  /**
   * Handles the creation of a new Permission. This function is typically triggered by an event, such as a form submission.
   * It processes the event, extracts the necessary data to create a new Permission, and updates the state with the new Permission.
   *
   * @function
   * @param {Event} e - The event object that triggered the creation of a new Permission, usually a form submission event.
   */
  function handleNewPermission(e) {
    e.preventDefault();

    setPermissions({
      ...Permissions,
      permissions: [
        ...(Permissions.Permissions || []),
        { name: 'Permission Members', users: undefined },
      ],
    });
  }

  const handleExitTeams = (e) => {
    setIsUpdatePermissions(true);
    router.push(`/gallery/userNFTs`);
  };

  return (
    <div className="mx-auto max-w-7xl pl-6 pr-2 pt-12">
      <div className="bg-fabstir-dark-purple">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-fabstir-dark-gray sm:text-4xl">
          NFT Permissions
        </h2>

        <div className="mt-4 flex flex-1 justify-center">
          <Button
            variant="primary"
            size="medium"
            onClick={(e) => handleExitTeams(e)}
            className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md p-4 font-bold tracking-wide"
          >
            Back to My Page
          </Button>
        </div>

        {permissions?.permissions?.map((team, index) => (
          <Team
            theTeam={team}
            index={index}
            TeamUserView={PermissionUserView}
            initialIsReadOnly={team.users !== undefined}
            handleUpdateTeam={handleUpdatePermission}
            handleDeleteTeam={handleDeletePermission}
          />
        ))}

        <a onClick={(e) => handleNewPermission(e)}>
          <div className="flex flex-1 flex-row items-center mt-4">
            <PlusIcon
              className="hover:text-gray ml-8 h-10 w-10 transition duration-100 hover:scale-125 mr-4 text-fabstir-dark-gray"
              aria-hidden="true"
            />
            <div className="text-lg font-semibold text-fabstir-gray">
              New Permission
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
