import React from 'react';
import { PlusIcon, PencilIcon } from 'heroiconsv2/24/outline';
import { useRecoilState, useRecoilValue } from 'recoil';
import Team from '../../src/components/Team';
import { isupdateteamsstate, teamsstate } from '../../src/atoms/teamsAtom';
import { useRouter } from 'next/router';

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
export default function Teams() {
  const router = useRouter();

  const handleExitTeams = (e) => {
    setIsUpdateTeamsState(true);
    router.push(`/gallery/userNFTs`);
  };

  return (
    <div className="mx-auto max-w-7xl pl-6 pr-2 pt-12">
      <div className="bg-fabstir-dark-purple">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-fabstir-dark-gray sm:text-4xl">
          NFT Permissions
        </h2>

        <div className="mt-4 flex flex-1 justify-center">
          <button
            type="submit"
            onClick={(e) => handleExitTeams(e)}
            className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md bg-fabstir-action-colour1 p-4 font-bold tracking-wide text-fabstir-dark-gray shadow-md shadow-fabstir-action-colour1 hover:bg-fabstir-hover-colour1 focus:bg-fabstir-focus-colour1"
          >
            Back to My Page
          </button>
        </div>

        <Team
          theTeam={nftsPermissions.data}
          index={index}
          handleUpdateTeam={handleUpdateTeam}
          handleDeleteTeam={handleDeleteTeam}
          handleUpdateSaleTake={handleSaleRoyaltyRatio}
          handleUpdateSubscriptionTake={handleSubscriptionRoyaltyRatio}
        />
      </div>
    </div>
  );
}
