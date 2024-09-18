import { MinusIcon } from 'heroiconsv1/solid';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';
import SimpleToggle from './SimpleToggle';
import TeamUserView from './TeamUserView';

/**
 * `TeamView` is a React functional component that renders a detailed view of a team. This component provides a user interface
 * for viewing and managing team details, including the ability to edit team information, manage team members, and toggle
 * the team's public visibility. It receives various props to customize its behavior and appearance.
 *
 * @component
 * @param {Object} props - The properties passed to the TeamView component.
 * @param {Object} props.team - The team object containing team details.
 * @param {Array} props.isReadOnlyArray - An array indicating which parts of the team view are read-only.
 * @param {Function} props.handleEditMember - Callback function to handle editing a team member.
 * @param {boolean} props.isPublic - A flag indicating whether the team is public.
 * @param {Function} props.setIsPublic - Callback function to toggle the team's public visibility.
 * @param {JSX.Element} props.TeamUserView - The component used to display individual team members.
 * @param {Function} props.handleSubmit_SaveTeamMember - Callback function to handle saving a team member.
 * @param {Function} props.handleSubmit_RemoveTeamMember - Callback function to handle removing a team member.
 * @param {boolean} props.isTeamReadOnly - A flag indicating whether the entire team view is read-only.
 * @returns {JSX.Element} The rendered component displaying the team view.
 */
export default function TeamView({
  team,
  isReadOnlyArray,
  handleEditMember,
  isPublic,
  setIsPublic,
  TeamUserView,
  handleSubmit_SaveTeamMember,
  handleSubmit_RemoveTeamMember,
  isTeamReadOnly,
}) {
  const userAuthPub = useRecoilValue(userauthpubstate);

  return (
    <div>
      {team?.users?.length > 0 && (
        <div className="relative flex justify-between space-y-8 pb-5 sm:space-y-12">
          <div className="relative flex flex-col space-y-8 pb-5 sm:space-y-12">
            <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-10 xl:gap-12">
              {team?.users?.map((user, index) => (
                <div key={user?.userPub} className="flex-shrink-0">
                  <TeamUserView
                    user={user}
                    userAuthPub={userAuthPub}
                    isReadOnly={isReadOnlyArray[index]}
                    handleEditMember={() => handleEditMember(index)}
                    handleSubmit_SaveTeamMember={(newUser) =>
                      handleSubmit_SaveTeamMember(newUser, index)
                    }
                    handleSubmit_RemoveTeamMember={
                      handleSubmit_RemoveTeamMember
                    }
                    showEditButton={!isTeamReadOnly}
                  />
                </div>
              ))}
            </div>
            {/* <div className="order-2 flex-shrink-0 -translate-y-1/4 pt-4 sm:order-3 sm:ml-3">
            <SimpleToggle enabled={isPublic} setEnabled={setIsPublic} />
          </div> */}
          </div>

          <div className="order-2 flex-shrink-0 -translate-y-1/4 pt-4 sm:order-3 sm:ml-3">
            <SimpleToggle enabled={isPublic} setEnabled={setIsPublic} />
          </div>
        </div>
      )}
      {(!team?.users || !team?.users.length) && (
        <div>
          <MinusIcon
            className="h-8 w-8 pb-4 text-fabstir-light-gray"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
