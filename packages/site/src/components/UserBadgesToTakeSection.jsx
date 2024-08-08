import {
  ViewGridIcon as ViewGridIconSolid,
  ViewListIcon,
} from 'heroiconsv1/solid';
import React, { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import UserBadgesView from './UserBadgesView';

import { badgetotakeslideoverstate } from '../atoms/badgeDetailsSlideOverFunctions';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useBadgesToGive from '../hooks/useBadgesToGive';
import useBadgesToTake from '../hooks/useBadgesToTake';
import { Button } from '../ui-components/button';

const tabs = [
  { name: 'Recently Added', href: '#', current: true },
  { name: 'Most Popular', href: '#', current: false },
  { name: 'Favourited', href: '#', current: false },
];

export default function UserBadgesToTakeSection({
  userPub,
  theTitle,
  twStyle,
  twTitleStyle,
  twTextStyle,
  handleBadgeOnClick,
}) {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const [badgesFiltered, setBadgesFiltered] = useState();
  const setOpenBadgeToTake = useSetRecoilState(badgetotakeslideoverstate);

  const badgesToTake = useBadgesToTake(userPub);
  const badgesToGive = useBadgesToGive(userAuthPub);
  console.log('UserBadgesToTakeSection: inside');

  useEffect(() => {
    console.log('UserBadgesToTakeSection: useEffect');
    if (badgesToTake.isSuccess) {
      console.log('UserBadgesToTakeSection: inside loop');
      //      badges.data.forEach((e) => badgeAddresses.add(e.address))

      if (badgesToTake.data) {
        // let theBadges = badgesToTake.data.filter(
        //   (x) => !badgeAddresses.has(x.address)
        // )
        let theBadges = badgesToTake.data;
        console.log(
          'UserBadgesToTakeSection: badgesToTake.data = ',
          badgesToTake.data,
        );
        console.log('UserBadgesToTakeSection: theBadges = ', theBadges);

        if (userPub !== userAuthPub && badgesToGive?.data) {
          const badgeToGiveAddresses = new Set(
            badgesToGive.data.map((e) => e.address),
          );
          theBadges = theBadges.filter((x) =>
            badgeToGiveAddresses.has(x.address),
          );
        }
        console.log('UserBadgesToTakeSection: after theBadges = ', theBadges);
        setBadgesFiltered(theBadges);
      } else setBadgesFiltered([]);
    }
  }, [
    badgesToTake.data,
    badgesToTake.isLoading,
    badgesToTake.isSuccess,
    badgesToGive.data,
    badgesToGive.isSuccess,
    userPub,
    userAuthPub,
  ]);

  return (
    <>
      {badgesFiltered?.length > 0 && (
        <div>
          <main className="flex-1 rounded-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex pt-6">
                <h1 className="flex-1 text-xl font-bold text-fabstir-dark-gray">
                  {theTitle}
                </h1>

                <div className="ml-6 flex items-center rounded-lg p-0.5 sm:hidden">
                  <Button
                    variant="primary"
                    size="medium"
                    className="rounded-md p-1.5"
                  >
                    <ViewListIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Use list view</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="medium"
                    className="ml-0.5 rounded-md p-1.5"
                  >
                    <ViewGridIconSolid className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Use grid view</span>
                  </Button>
                </div>
              </div>

              {/* Gallery */}
              <section className="pb-8" aria-labelledby="gallery-heading">
                <h1 id="gallery-heading" className="sr-only">
                  {theTitle}
                </h1>
                <ul>
                  <UserBadgesView
                    badges={badgesFiltered}
                    twStyle={twStyle}
                    twTitleStyle={twTitleStyle}
                    twTextStyle={twTextStyle}
                    setOpenBadgeDetails={setOpenBadgeToTake}
                    handleBadgeOnClick={handleBadgeOnClick}
                  />
                </ul>
              </section>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
