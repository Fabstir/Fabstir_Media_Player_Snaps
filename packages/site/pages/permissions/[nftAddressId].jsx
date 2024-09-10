import React, { useEffect, useState } from 'react';
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
import useCreateNFTPermissions from '../../src/hooks/useCreateNFTPermissions';
import useNFTPermissions from '../../src/hooks/useNFTPermissions';
import { fetchNFT } from '../../src/hooks/useNFT';
import { userauthpubstate } from '../../src/atoms/userAuthAtom';
import DeleteMarketNFT from '../../src/components/DeleteMarketNFT';
import {
  currentmarketitemidstate,
  currentmarketitemmarketaddressstate,
  marketitemdeleteslideoverstate,
} from '../../src/atoms/MarketItemPendingSlideOverAtom';
import usePortal from '../../src/hooks/usePortal';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `PermissionsTeams` is a React functional component that displays the permissions given to marketplaces
 * associated with a specific NFT address ID.
 *
 * This component retrieves the NFT address ID from the URL parameters using the Next.js `useRouter` hook
 * and displays relevant information about the permissions given to marketplaces for that NFT.
 *
 * @component
 * @returns {JSX.Element} The rendered component displaying the permissions and teams for the NFT.
 */
export default function PermissionsTeams() {
  const router = useRouter();
  const { nftAddressId } = router.query;

  const userAuthPub = useRecoilValue(userauthpubstate);

  const nftPermissions = useNFTPermissions(nftAddressId);
  const [nft, setNFT] = useState();

  const [permissions, setPermissions] = useState({ users: [] });
  const [isUpdatePermissions, setIsUpdatePermissions] = useRecoilState(
    isupdatepermissionsstate,
  );
  const { mutate: createNFTPermissions, ...createNFTPermissionsInfo } =
    useCreateNFTPermissions();
  const currentMarketItemMarketAddress = useRecoilValue(
    currentmarketitemmarketaddressstate,
  );
  const currentMarketItemId = useRecoilValue(currentmarketitemidstate);

  const [openDeleteNFTSliderOver, setOpenDeleteNFTSliderOver] = useRecoilState(
    marketitemdeleteslideoverstate,
  );

  const [currentNFTImage, setCurrentNFTImage] = useState();
  const { getBlobUrl } = usePortal();

  /**
   * Updates a specific permission in the list of permissions at the given index. This function creates a new state object with the updated permission
   * and sets it using the `setPermissions` function. It ensures immutability by creating a new array with the updated permission inserted at the
   * correct position.
   *
   * @function
   * @param {Object} permission - The updated permission object.
   * @param {number} index - The index of the permission to be updated in the permissions array.
   */
  function handleUpdatePermissions(permissions, index) {
    setPermissions(permissions);
    createNFTPermissions({ nftAddressId, permissions });
  }

  /**
   * Deletes a specific permission from the list of permissions at the given index. This function creates a new state object with the permission
   * removed and sets it using the `setPermissions` function. It ensures immutability by creating a new array without the permission at the
   * specified index.
   *
   * @function
   * @param {number} index - The index of the permission to be deleted from the permissions array.
   */
  function handleDeletePermissions(index) {
    setPermissions(null);
  }

  const handleExitTeams = (e) => {
    e.preventDefault();
    //    handleUpdateTeams()

    router.push(`/gallery/userNFTs`);
  };

  useEffect(() => {
    (async () => {
      const nft = await fetchNFT(userAuthPub, nftAddressId);
      setNFT(nft);
    })();
  }, [userAuthPub, nftAddressId]);

  useEffect(() => {
    if (nftPermissions.isSuccess) setPermissions(nftPermissions.data);
  }, [nftPermissions, nftPermissions.data]);

  useEffect(() => {
    (async () => {
      if (nft?.image) {
        const linkUrl = await getBlobUrl(nft.image);
        setCurrentNFTImage(linkUrl);
      }
    })();
  }, [nft]);

  return (
    <div className="mx-auto max-w-7xl pl-6 pr-2 pt-12">
      <div className="bg-fabstir-dark-purple">
        <h2 className="pt-10 text-center text-3xl font-extrabold tracking-tight text-fabstir-white sm:text-4xl">
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

        {/* NFT image */}
        {nft && (
          <div className="relative mx-auto mb-8 mt-12 w-1/3">
            <svg
              className="absolute right-0 top-0 -mr-14 -mt-10 hidden transform stroke-fabstir-light-purple lg:block"
              width={400}
              height={300}
              fill="none"
              viewBox="0 0 400 300"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="de316486-4a29-4312-bdfc-fbce2132a2c1"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)"
              />
            </svg>

            <div className="aspect-h-7 aspect-w-10 mt-16 block w-full overflow-hidden rounded-lg shadow-2xl shadow-fabstir-black/50">
              <img
                src={currentNFTImage}
                alt=""
                className="object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <div className="flex justify-between">
                  <h2 className="text-lg font-medium text-fabstir-white">
                    <span className="sr-only">Details for </span>
                    {nft?.name}
                  </h2>
                  <p className="text-sm font-medium text-fabstir-light-gray">
                    {nft?.price}
                  </p>
                </div>
                <p className="mt-2 text-sm font-medium text-fabstir-light-gray/80">
                  {nft?.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        <Team
          theTeam={permissions}
          theTeamName={'Permissions'}
          TeamUserView={PermissionUserView}
          initialIsReadOnly={permissions?.length > 0}
          handleUpdateTeam={handleUpdatePermissions}
          handleDeleteTeam={handleDeletePermissions}
          showTeamEditButtons={false}
          isEnableDeleteTeam={false}
          isAlwaysShowNewMember={true}
        />
      </div>

      {/* Pop-up window to reject NFT from marketplace pending */}
      {nft && (
        <DeleteMarketNFT
          nft={nft}
          marketAddress={currentMarketItemMarketAddress}
          marketItemId={currentMarketItemId}
          open={openDeleteNFTSliderOver}
          setOpen={setOpenDeleteNFTSliderOver}
        />
      )}
    </div>
  );
}
