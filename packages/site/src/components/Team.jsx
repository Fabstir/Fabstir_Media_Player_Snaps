import { PencilIcon, TrashIcon } from 'heroiconsv2/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import TeamView from './TeamView';
import { Input } from '../ui-components/input';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import TeamNewUserView from './TeamNewUserView';
import { generateUsername } from 'unique-username-generator';
import usePortal from '../hooks/usePortal';

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
 * `Team` is a React functional component that renders information about a single team. This component is designed to display
 * details such as the team name, members, and other relevant data. It receives various props to customize its behavior and appearance.
 *
 * @component
 * @param {Object} props - The properties passed to the Team component.
 * @param {Object} props.theTeam - The team object containing team details.
 * @param {number} props.index - The index of the team in the list.
 * @param {Function} props.handleUpdateTeam - Callback function to handle updating the team.
 * @param {Function} props.handleDeleteTeam - Callback function to handle deleting the team.
 * @returns {JSX.Element} The rendered component displaying the team information.
 */
export default function Team({
  theTeam,
  index,
  handleUpdateTeam,
  handleDeleteTeam,
}) {
  const [isTeamPublic, setIsTeamPublic] = useState([]);

  // const [theTeam, setTheTeam] = useRecoilState(teamstate)
  const [team, setTeam] = useState(theTeam);

  const [userImage, setUserImage] = useState();

  const [isReadOnly, setIsReadOnly] = useState(
    theTeam.users && theTeam.users.length > 0,
  );

  const [watchUrl, setWatchUrl] = useState();

  const [user, setUser] = useState({
    userPub: uuidv4(),
    userName: generateUsername('', 0, 15),
  });

  const { uploadFile, getBlobUrl } = usePortal();

  const nameMax = 30;

  async function handleSubmit_AddTeamMember(newUser) {
    if (team.users?.find((user) => user.userPub === newUser.userPub)) return;

    const newUserWithImage = { ...newUser, image: userImage };

    setTeam({
      name: team.name,
      users: team.users
        ? [...team.users, newUserWithImage]
        : [newUserWithImage],
    });
    console.log('Team: team = ', team);
    console.log('Team: team?.length = ', team?.users?.length);

    setUserImage(null);
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

  function handleAltName(e, memberPub) {
    e.preventDefault();

    setTeam({
      ...team,
      users: team.users.map((user) =>
        e.target.value && user.userPub === memberPub
          ? { ...user, altName: e.target.value }
          : user,
      ),
    });
  }

  function handleAltRole(e, memberPub) {
    e.preventDefault();

    setTeam({
      ...team,
      users: team.users.map((user) =>
        e.target.value && user.userPub === memberPub
          ? { ...user, altRole: e.target.value }
          : user,
      ),
    });
  }

  function handleAlias(e, memberPub) {
    e.preventDefault();

    setTeam({
      ...team,
      users: team.users.map((user) =>
        e.target.value && user.userPub === memberPub
          ? { ...user, alias: e.target.value }
          : user,
      ),
    });
  }

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

      setUserImage(link);
      (async () => {
        const linkUrl = await getBlobUrl(link);
        setWatchUrl(linkUrl);
      })();
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    setUser({ ...user, image: userImage });
  }, [userImage]);

  return (
    <div className="mx-auto mt-4 max-w-7xl pl-6 pr-2">
      <div>
        <div>
          <div className="relative z-0 mb-4 ml-2 mr-4 flex items-center justify-between pt-8">
            {/* <span className="justify-start whitespace-nowrap pr-4 text-lg font-semibold tracking-wide text-fabstir-white">
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
                    ? 'bg-fabstir-dark-purple'
                    : 'bg-fabstir-gray-700 shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.25),inset_0_1px_1px_hsla(0,0%,0%,0.15)]',
                  'w-96 rounded-md border-2 border-fabstir-gray p-2 text-lg font-semibold text-fabstir-dark-gray focus:border-indigo-500 focus:ring-indigo-500',
                )}
                placeholder=""
                aria-describedby="altName"
              />
              {/* <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                  {errors.altName?.message}
                </p> */}
            </div>

            <div className="w-full border-t border-fabstir-divide-color1" />

            <div className="ml-4 flex flex-row items-center">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setIsReadOnly(false);
                }}
              >
                <PencilIcon
                  className="mr-2 h-5 w-5 font-bold text-fabstir-gray"
                  aria-hidden="true"
                />
              </a>
              <TrashIcon
                className="mr-6 h-5 w-5 font-bold text-fabstir-gray"
                aria-hidden="true"
              />
              Public
            </div>
          </div>

          <div className="z-0 rounded-lg bg-fabstir-light-gray p-4 pb-0 shadow-lg">
            <TeamView
              team={team}
              isReadOnly={isReadOnly}
              isPublic={isTeamPublic}
              setIsPublic={setIsTeamPublic}
              handleAltName={handleAltName}
              handleAltRole={handleAltRole}
              handleAlias={handleAlias}
              handleSubmit_RemoveTeamMember={handleSubmit_RemoveTeamMember}
            />
          </div>

          {!isReadOnly && (
            <form>
              <div className="mt-4 flex flex-1 justify-center">
                <span className="flex flex-row space-x-4">
                  <button
                    type="submit"
                    onClick={(e) => handleSubmit_Cancel(e)}
                    className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md bg-fabstir-action-colour1 p-4 font-bold tracking-wide text-fabstir-dark-gray shadow-md shadow-fabstir-action-colour1 hover:bg-fabstir-hover-colour1 focus:bg-fabstir-focus-colour1"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    onClick={(e) => handleSubmit_DeleteTeam(e)}
                    className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md bg-fabstir-action-colour1 p-4 font-bold tracking-wide text-fabstir-dark-gray shadow-md shadow-fabstir-action-colour1 hover:bg-fabstir-hover-colour1 focus:bg-fabstir-focus-colour1"
                  >
                    Delete Team
                  </button>

                  <button
                    type="submit"
                    onClick={(e) => handleSubmit_ConfirmTeam(e)}
                    className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md bg-fabstir-action-colour1 p-4 font-bold tracking-wide text-fabstir-dark-gray shadow-md shadow-fabstir-action-colour1 hover:bg-fabstir-hover-colour1 focus:bg-fabstir-focus-colour1"
                  >
                    Confirm Team
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="mt-16">
          <div
            {...getRootProps()}
            className="mt-1 flex justify-center rounded-md border-2 border-dashed border-fabstir-gray bg-fabstir-light-gray px-6 pb-6 pt-5"
          >
            {!watchUrl ? (
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
                      // readOnly={inputReadOnly}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>

                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            ) : (
              <div
                className={`mx-auto mt-8 flex flex-col rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm`}
              >
                <span className="">
                  <img
                    src={watchUrl}
                    alt=""
                    className="object-cover"
                    crossOrigin="anonymous"
                  />
                </span>
              </div>
            )}
          </div>

          <TeamNewUserView
            team={team}
            user={user}
            setUser={setUser}
            handleSubmit_AddTeamMember={handleSubmit_AddTeamMember}
          />
        </div>
      )}
    </div>
  );
}
