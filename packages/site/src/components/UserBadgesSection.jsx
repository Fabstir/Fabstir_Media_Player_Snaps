import React, { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { badgetoburnslideoverstate } from '../atoms/badgeDetailsSlideOverFunctions';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useBadges from '../hooks/useBadges';
import UserBadgesView from './UserBadgesView';

const tabs = [
  { name: 'Recently Added', href: '#', current: true },
  { name: 'Most Popular', href: '#', current: false },
  { name: 'Favourited', href: '#', current: false },
];

export default function UserBadgesSection({
  userPub,
  theTitle,
  twStyle,
  twTitleStyle,
  twTextStyle,
  handleBadgeOnClick,
}) {
  console.log('UserBadgesSection: userPub = ', userPub);
  const badges = useBadges(userPub);

  const setOpenBadgeToBurn = useSetRecoilState(badgetoburnslideoverstate);

  if (badges) console.log('MainBadges: badges.data = ', badges.data);

  return (
    <div>
      {badges?.data?.length > 0 && (
        <main className="flex-1 rounded-sm">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="flex-1 text-2xl font-bold ">
              {theTitle}
            </h1>
            {/* Gallery */}
            <section className="" aria-labelledby="gallery-heading">
              <ul>
                <UserBadgesView
                  badges={badges.data}
                  userPub={userPub}
                  twStyle={twStyle}
                  twTitleStyle={twTitleStyle}
                  twTextStyle={twTextStyle}
                  setOpenBadgeDetails={setOpenBadgeToBurn}
                  handleBadgeOnClick={handleBadgeOnClick}
                />
              </ul>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
