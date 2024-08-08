import React, { useState } from 'react';
import { PlusIcon, PencilIcon } from 'heroiconsv2/24/outline';
import { useRecoilState, useRecoilValue } from 'recoil';
import Team from '../../src/components/Team';
import { isupdateteamsstate, teamsstate } from '../../src/atoms/teamsAtom';
import { useRouter } from 'next/router';
import TeamUserView from '../../src/components/TeamUserView';
import { Button } from '../../src/ui-components/button';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `Teams` is a React functional component that renders a list teams. This component is designed to display
 * information about various teams, including details such as team names, members, and other relevant data.
 * It is this teams system that is used for media content credits listing.
 *
 * @component
 * @returns {JSX.Element} The rendered list or grid of teams.
 */
export default function Teams() {
  const router = useRouter();
  //  navigate(-1)
  const [teams, setTeams] = useRecoilState(teamsstate);
  const [isUpdateTeams, setIsUpdateTeams] = useRecoilState(isupdateteamsstate);

  const [isReadOnly, setIsReadOnly] = useState(true);

  const toggleReadOnly = () => {
    setIsReadOnly(!isReadOnly);
  };

  /**
   * Updates a specific team in the list of teams at the given index. This function creates a new state object with the updated team
   * and sets it using the `setTeams` function. It ensures immutability by creating a new array with the updated team inserted at the
   * correct position.
   *
   * @function
   * @param {Object} team - The updated team object.
   * @param {number} index - The index of the team to be updated in the teams array.
   */
  function handleUpdateTeam(team, index) {
    setTeams({
      ...teams,
      teams: [
        ...teams.teams.slice(0, index),
        team,
        ...teams.teams.slice(index + 1),
      ],
    });
  }

  /**
   * Deletes a specific team from the list of teams at the given index. This function creates a new state object with the team
   * removed and sets it using the `setTeams` function. It ensures immutability by creating a new array without the team at the
   * specified index.
   *
   * @function
   * @param {number} index - The index of the team to be deleted from the teams array.
   */
  function handleDeleteTeam(index) {
    setTeams({
      ...teams,
      teams: [...teams.teams.slice(0, index), ...teams.teams.slice(index + 1)],
    });
  }

  /**
   * Handles the creation of a new team. This function is typically triggered by an event, such as a form submission.
   * It processes the event, extracts the necessary data to create a new team, and updates the state with the new team.
   *
   * @function
   * @param {Event} e - The event object that triggered the creation of a new team, usually a form submission event.
   */
  function handleNewTeam(e) {
    e.preventDefault();

    setTeams({
      ...teams,
      teams: [
        ...(teams.teams || []),
        { name: 'Team Members', users: undefined },
      ],
    });
  }

  const handleInputChange = (event) => {
    setTeams({
      ...teams,
      teamsName: event.target.value,
    });
  };

  const handleExitTeams = (e) => {
    setIsUpdateTeams(true);
    router.push(`/gallery/userNFTs`);
  };

  return (
    <div className="mx-auto max-w-7xl pl-6 pr-2 pt-12">
      <div className="bg-fabstir-dark-purple">
        <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-7xl">
          <div>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-fabstir-dark-gray sm:text-4xl">
              {teams.teamsName}
            </h2>
            <div className="flex items-center mt-4 w-full">
              <input
                type="text"
                value={teams.teamsName}
                onChange={handleInputChange}
                className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm text-fabstir-dark-gray placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Edit team name"
                readOnly={isReadOnly}
              />
              <PencilIcon
                className="ml-2 h-5 w-5 text-gray-500 cursor-pointer"
                onClick={toggleReadOnly}
              />
            </div>
          </div>
          <p className="text-center text-xl text-fabstir-dark-gray">
            Risus velit condimentum vitae tincidunt tincidunt. Mauris ridiculus
            fusce amet urna nunc. Ut nisl ornare diam in.
          </p>
        </div>

        <div className="mt-4 flex flex-1 justify-center">
          <Button
            type="submit"
            variant="primary"
            size="medium"
            onClick={(e) => handleExitTeams(e)}
            className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md p-4 font-bold tracking-wide"
          >
            Back to My Page
          </Button>
        </div>

        {teams?.teams?.map((team, index) => (
          <Team
            theTeam={team}
            index={index}
            TeamUserView={TeamUserView}
            initialIsReadOnly={team.users !== undefined}
            handleUpdateTeam={handleUpdateTeam}
            handleDeleteTeam={handleDeleteTeam}
          />
        ))}

        <a onClick={(e) => handleNewTeam(e)}>
          <div className="flex flex-1 flex-row items-center mt-4">
            <PlusIcon
              className="hover:text-gray ml-8 h-10 w-10 transition duration-100 hover:scale-125 mr-4 text-fabstir-dark-gray"
              aria-hidden="true"
            />
            <div className="text-lg font-semibold text-fabstir-gray">
              New Team
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
