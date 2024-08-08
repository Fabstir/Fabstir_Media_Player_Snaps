import {
  ViewGridIcon as ViewGridIconSolid,
  ViewListIcon,
} from 'heroiconsv1/solid';
import React, { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import UserBadgesView from './UserBadgesView';

import { badgecreateslideoverstate } from '../atoms/badgeDetailsSlideOverFunctions';
import { currentbadgerequestedslideovertate } from '../atoms/badgeRequestSelectSlideOverAtom';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useBadgesRequested from '../hooks/useBadgesRequested';
import useBadgesRequestedCompleted from '../hooks/useBadgesRequestedCompleted';
import { Button } from '../ui-components/button';

const appendBadgeField = (old, field, value) => ({ ...old, [field]: value });

const tabs = [
  { name: 'Recently Added', href: '#', current: true },
  { name: 'Most Popular', href: '#', current: false },
  { name: 'Favourited', href: '#', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserBadgesRequestedSection({
  userPub,
  theTitle,
  twStyle,
  twTitleStyle,
  twTextStyle,
  handleBadgeOnClick,
  rerender,
}) {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const [openBadgeCreate, setOpenBadgeCreate] = useRecoilState(
    badgecreateslideoverstate,
  );

  const [openBadgeRequested, setOpenBadgeRequested] = useRecoilState(
    currentbadgerequestedslideovertate,
  );

  const badgesRequested = useBadgesRequested(userPub);
  const badgesRequestedCompleted = useBadgesRequestedCompleted();

  const [badgesFiltered, setBadgesFiltered] = useState();
  const [rerenderState, setRerenderState] = useState(0);

  useEffect(() => {
    setRerenderState((prev) => prev + 1);
  }, [rerender]);

  useEffect(() => {
    console.log('UserBadgesRequestedSection: useEffect');
    if (badgesRequested.isSuccess && badgesRequestedCompleted.isSuccess) {
      console.log('UserBadgesRequestedSection: inside loop');
      const badgeAddresses = new Set(
        badgesRequestedCompleted?.data?.map((e) => e.address),
      );
      //      badgesRequested.data.forEach((e) => badgeAddresses.add(e.address))

      if (badgesRequested?.data) {
        let theBadges = badgesRequested.data.filter(
          (x) => !badgeAddresses.has(x.address),
        );
        console.log(
          'UserBadgesRequestedSection: badgesRequested.data = ',
          badgesRequested.data,
        );
        console.log(
          'UserBadgesRequestedSection: badgesRequestedCompleted.data = ',
          badgesRequestedCompleted.data,
        );

        console.log('UserBadgesRequestedSection: theBadges = ', theBadges);

        setBadgesFiltered(theBadges);
      } else setBadgesFiltered([]);
    }
  }, [
    badgesRequested.data,
    badgesRequested.isLoading,
    badgesRequested.isSuccess,
    badgesRequestedCompleted.data,
    badgesRequestedCompleted.isLoading,
    badgesRequestedCompleted.isSuccess,
    userPub,
    userAuthPub,
    rerenderState,
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
                  <Button type="button" className="ml-0.5 rounded-md p-1.5">
                    <ViewGridIconSolid className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Use grid view</span>
                  </Button>
                </div>
              </div>

              {/* Gallery */}
              <section className="pb-8" aria-labelledby="gallery-heading">
                <h1 id="gallery-heading" className="sr-only">
                  Badges Requested
                </h1>
                <ul>
                  <UserBadgesView
                    badges={badgesFiltered}
                    twStyle={twStyle}
                    twTitleStyle={twTitleStyle}
                    twTextStyle={twTextStyle}
                    setOpenBadgeDetails={setOpenBadgeRequested}
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
