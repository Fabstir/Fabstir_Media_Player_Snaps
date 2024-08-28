import { PlusSmIcon as PlusSmIconOutline } from 'heroiconsv1/outline';
import {
  ViewGridIcon as ViewGridIconSolid,
  ViewListIcon,
} from 'heroiconsv1/solid';
import React, { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import UserBadgesView from './UserBadgesView';

import { badgetogiveslideoverstate } from '../atoms/badgeDetailsSlideOverFunctions';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useBadgesToGive from '../hooks/useBadgesToGive';
import { Button } from '../ui-components/button';

const appendBadgeField = (old, field, value) => ({ ...old, [field]: value });

const tabs = [
  { name: 'Recently Added', href: '#', current: true },
  { name: 'Most Popular', href: '#', current: false },
  { name: 'Favourited', href: '#', current: false },
];

export default function UserBadgesToGiveSection({
  userPub,
  theTitle,
  twStyle,
  twTitleStyle,
  twTextStyle,
  handleBadgeOnClick,
  openBadge,
  setOpenBadge,
}) {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const setOpenBadgeToGive = useSetRecoilState(badgetogiveslideoverstate);

  const [theBadges, setTheBadges] = useState();
  const badges = useBadgesToGive(userPub);

  useEffect(() => {
    setTheBadges(badges);
    console.log('UserBadgesToGiveSection: badges = ', badges);
    console.log('UserBadgesToGiveSection: openBadge = ', openBadge);
  }, [openBadge, setOpenBadge, badges?.data]);

  return (
    <div className="relative">
      <main className="flex-1 rounded-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <h1 className="flex-1 text-xl font-bold text-dark-gray">
              {theTitle}
            </h1>

            {userPub === userAuthPub && (
              <Button
                variant=""
                size="medium"
                onClick={() => setOpenBadge(true)}
                className="f-full m-3 flex items-center justify-center rounded-full p-1 px-2 bg-button"
              >
                <PlusSmIconOutline
                  className="h-6 w-6 focus:ring-0"
                  aria-hidden="true"
                />
                <span className="sr-only">Create badge</span>
              </Button>
            )}

            <div className="ml-6 flex items-center rounded-lg p-0.5 sm:hidden">
              <Button
                variant=""
                size="medium"
                className="rounded-md p-1.5 bg-button"
              >
                <ViewListIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Use list view</span>
              </Button>
              <Button
                variant=""
                size="medium"
                className="ml-0.5 rounded-md p-1.5 bg-button"
              >
                <ViewGridIconSolid className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Use grid view</span>
              </Button>
            </div>
          </div>

          {/* Gallery */}
          <section className="pb-8" aria-labelledby="gallery-heading">
            <h1 id="gallery-heading" className="sr-only">
              Badges to Give
            </h1>
            <ul>
              <UserBadgesView
                badges={theBadges?.data}
                twStyle={twStyle}
                twTitleStyle={twTitleStyle}
                twTextStyle={twTextStyle}
                setOpenBadgeDetails={setOpenBadgeToGive}
                handleBadgeOnClick={handleBadgeOnClick}
              />
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
