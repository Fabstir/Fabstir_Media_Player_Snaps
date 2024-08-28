import { PencilIcon, TrashIcon } from 'heroiconsv2/24/outline';
import React, { useEffect, useState } from 'react';
import TeamView from './TeamView';
import { Input } from '../ui-components/input';
import { v4 as uuidv4 } from 'uuid';
import { generateUsername } from 'unique-username-generator';
import usePortal from '../hooks/usePortal';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { Button } from '../ui-components/button';

const sortOptions = [
  { name: 'Most Popular', href: '#', current: true },
  { name: 'Best Rating', href: '#', current: false },
  { name: 'Newest', href: '#', current: false },
];

const activeFilters = [{ value: 'objects', label: 'Objects' }];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `Team` is a React functional component that renders the details and members of a team.
 * This component provides a user interface for viewing and managing team information,
 * including the ability to edit team details and manage team members.
 *
 * @component
 * @param {Object} props - The properties passed to the Team component.
 * @param {Object} props.team - The team object containing team details.
 * @param {boolean} props.isReadOnly - A flag indicating whether the view is read-only.
 * @param {Function} props.handleEditTeam - Callback function to handle editing the team details.
 * @param {Function} props.handleAddMember - Callback function to handle adding a new team member.
 * @param {Function} props.handleRemoveMember - Callback function to handle removing a team member.
 * @returns {JSX.Element} The rendered component displaying the team details and members.
 */
export default function Team({
  theTeam,
  index,
  handleUpdateTeam,
  handleDeleteTeam,
  initialIsReadOnly = true,
  TeamUserView,
}) {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const [isTeamPublic, setIsTeamPublic] = useState([]);

  // const [theTeam, setTheTeam] = useRecoilState(teamstate)
  const [team, setTeam] = useState(theTeam);

  const [isReadOnly, setIsReadOnly] = useState(initialIsReadOnly);

  const [watchUrl, setWatchUrl] = useState();

  const [isReadOnlyArray, setIsReadOnlyArray] = useState([]);
  const [isAllReadOnly, setIsAllReadOnly] = useState(true);

  const [user, setUser] = useState({
    userPub: uuidv4(),
    userName: generateUsername('', 0, 15),
  });

  const { uploadFile, getBlobUrl } = usePortal();

  const nameMax = 30;

  useEffect(() => {
    if (team.users) {
      setIsReadOnlyArray(new Array(team.users.length).fill(true));
    }
  }, [team.users]);

  useEffect(() => {
    setIsAllReadOnly(isReadOnlyArray.every(Boolean));
  }, [isReadOnlyArray]);

  async function handleSubmit_SaveTeamMember(newUser, index) {
    if (team.users) {
      if (team.users.find((user) => user.userPub === newUser.userPub)) {
        const updatedUsers = team.users.map((user) =>
          user.userPub === newUser.userPub ? newUser : user,
        );

        setTeam({
          ...team,
          users: updatedUsers,
        });
      } else {
        setTeam({
          ...team,
          users: [...team.users, newUser],
        });
      }
    } else {
      // If team.users is undefined, create a new array with the new user
      setTeam({
        ...team,
        users: [newUser],
      });
    }

    setIsReadOnlyArray((prev) => {
      const newArray = [...(prev || [])];
      newArray[index] = true;
      return newArray;
    });
  }

  function handleEditMember(index) {
    setIsReadOnlyArray((prev) => {
      const newArray = [...prev];
      newArray[index] = false;
      return newArray;
    });
  }

  /**
   * Handles the submission and cancellation of the team form.
   * sets the team state with the current team data, and switches the form to read-only mode.
   *
   * @function
   * @param {Event} e - The event object that triggered the function, typically a form submission event.
   */
  function handleSubmit_Cancel(e) {
    e.preventDefault();

    setTeam(theTeam);
    setIsReadOnly(true);
  }

  /**
   * Handles the submission and confirmation of the team form.
   * sets the team state with the current team data, and switches the form to read-only mode.
   *
   * @function
   * @param {Event} e - The event object that triggered the function, typically a form submission event.
   */
  function handleSubmit_ConfirmTeam(e) {
    e.preventDefault();

    if (!team || !team.users || team.users.length === 0) {
      alert('Cannot confirm an empty team.');
      return;
    }

    handleUpdateTeam(team, index);
    setIsReadOnly(true);
  }

  /**
   * Handles the deletion of a team.
   * sets the team state to null or removes the team from the state, and switches the form to read-only mode.
   *
   * @function
   * @param {Event} e - The event object that triggered the function, typically a form submission event.
   */
  function handleSubmit_DeleteTeam(e) {
    e.preventDefault();

    if (!team || !team.users || index >= team.users.length) {
      alert('Error in deleting team.');
      return;
    }

    handleDeleteTeam(index);
    setIsReadOnly(true);
  }

  /**
   * Handles the removal of a team member.
   * updates the team state by filtering out the specified member, and performs any additional necessary cleanup.
   *
   * @function
   * @param {string} memberPub - The public identifier of the team member to be removed.
   */
  function handleSubmit_RemoveTeamMember(memberPub) {
    setTeam({
      name: team.name,
      users: team.users?.filter((user) => user.userPub !== memberPub),
    });
    console.log('TeamView: users left = ', team);
  }

  return (
    <div className="mx-auto mt-4 max-w-7xl pl-6 pr-2">
      <div>
        <div>
          <div className="relative z-0 mb-4 ml-2 mr-4 flex items-center justify-between pt-8">
            {/* <span className="justify-start whitespace-nowrap pr-4 text-lg font-semibold tracking-wide text-white">
              Team Members
            </span> */}

            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-nowrap pl-3 text-lg font-semibold">
                {/* <span className="text-gray-500 sm:text-sm">$</span> */}
              </div>
              <Input
                key={`teamName`}
                type="text"
                name="name"
                id="name"
                defaultValue={!team.name ? `Team Members` : team.name}
                value={team?.name}
                readOnly={isReadOnly}
                onChange={(e) => {
                  e.preventDefault();

                  setTeam({ ...team, name: e.target.value });
                }}
                size={Math.min(Math.max(team?.name?.length, 2), nameMax)}
                maxLength={nameMax}
                className={classNames(
                  isReadOnly
                    ? ''
                    : 'bg-gray-700 shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.25),inset_0_1px_1px_hsla(0,0%,0%,0.15)]',
                  'rounded-md border-2 border-gray p-2 text-lg font-semibold text-dark-gray focus:border-indigo-500 focus:ring-indigo-500 w-60',
                )}
                placeholder=""
                aria-describedby="altName"
              />
              {/* <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-light-pink">
                  {errors.altName?.message}
                </p> */}
            </div>

            <div className="w-full border-t " />

            <div className="ml-4 flex flex-row items-center">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setIsReadOnly(false);
                }}
              >
                <PencilIcon
                  className="mr-2 h-5 w-5 font-bold text-gray"
                  aria-hidden="true"
                />
              </a>
              <TrashIcon
                className="mr-6 h-5 w-5 font-bold text-gray"
                aria-hidden="true"
              />
              Public
            </div>
          </div>

          <div className="z-0 rounded-lg bg-light-gray p-4 pb-0 shadow-lg">
            <TeamView
              team={team}
              TeamUserView={TeamUserView}
              isReadOnlyArray={isReadOnlyArray}
              handleEditMember={handleEditMember}
              isPublic={isTeamPublic}
              setIsPublic={setIsTeamPublic}
              handleSubmit_SaveTeamMember={handleSubmit_SaveTeamMember}
              handleSubmit_RemoveTeamMember={handleSubmit_RemoveTeamMember}
              isTeamReadOnly={isReadOnly}
            />
          </div>

          {!isReadOnly && (
            <form>
              <div className="mt-4 flex flex-1 justify-center">
                <span className="flex flex-row space-x-4">
                  <Button
                    type="submit"
                    variant=""
                    size="medium"
                    onClick={(e) => handleSubmit_Cancel(e)}
                    className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md p-4 font-bold tracking-wide shadow-md"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant=""
                    size="medium"
                    onClick={(e) => handleSubmit_DeleteTeam(e)}
                    className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md p-4 font-bold tracking-wide shadow-md"
                  >
                    Delete Team
                  </Button>

                  <Button
                    type="submit"
                    variant=""
                    size="medium"
                    onClick={(e) => handleSubmit_ConfirmTeam(e)}
                    className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md p-4 font-bold tracking-wide shadow-md"
                  >
                    Confirm Team
                  </Button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
      {!isReadOnly && (
        <div className="mt-16">
          <TeamUserView
            userAuthPub={userAuthPub}
            isReadOnly={false}
            handleSubmit_SaveTeamMember={(newUser) =>
              handleSubmit_SaveTeamMember(
                newUser,
                team.users ? team.users.length : 0,
              )
            }
            showEditButton={true} // Add this prop
          />
        </div>
      )}{' '}
    </div>
  );
}
