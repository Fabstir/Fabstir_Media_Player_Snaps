import TeamUserView from './TeamUserView';

/**
 * TeamsView component.
 *
 * This component displays a list of teams. This system is also used for displaying credits for media content.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.teams - An array of team objects to be displayed.
 * @returns {JSX.Element} The rendered TeamsView component.
 */
export default function TeamsView({ teams }) {
  return (
    <>
      {teams?.length > 0 && (
        <div className="mt-4">
          {teams.map((team, index) => {
            const allImagesUndefinedOrNull = team?.users?.every(
              (user) => user.image === undefined || user.image === null,
            );

            return (
              <div key={index}>
                {allImagesUndefinedOrNull ? (
                  <div className="">
                    <div className="pr-3 text-dark-gray">
                      {team.name}
                    </div>
                    {team?.users?.reduce((acc, user, index) => {
                      if (index > 0) {
                        acc.push(
                          <span key={`comma-${index}`} className="px-1">
                            ,
                          </span>,
                        );
                      }
                      acc.push(
                        <div key={user?.userPub} className="flex items-center">
                          <TeamUserView user={user} isReadOnly={true} />
                        </div>,
                      );
                      return acc;
                    }, [])}
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="pr-3 text-dark-gray">
                      {team.name}
                    </div>
                    <div className="flex flex-wrap space-x-4 space-y-2 mt-2">
                      {team.users?.map((user) => (
                        <div key={user?.userPub} className="m-2">
                          <TeamUserView user={user} isReadOnly={true} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
