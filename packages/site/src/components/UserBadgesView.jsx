// UserBadgesView.js
import React, { useEffect, useState } from 'react';
import UserBadgeView from './UserBadgeView';

const appendBadgeField = (old, field, value) => ({ ...old, [field]: value });

const tabs = [
  { name: 'Recently Added', href: '#', current: true },
  { name: 'Most Popular', href: '#', current: false },
  { name: 'Favourited', href: '#', current: false },
];

export default function UserBadgesView({
  badges,
  userPub,
  twStyle,
  twTitleStyle,
  twTextStyle,
  setOpenBadgeDetails,
  handleBadgeOnClick,
}) {
  console.log('UserNFTView: inside UserBadgesView');

  const [theBadges, setTheBadges] = useState();

  useEffect(() => {
    setTheBadges(badges);
  }, [badges, handleBadgeOnClick]);

  return (
    <div className={`flex flex-row flex-wrap gap-4 ${twStyle}`}>
      {theBadges
        ?.filter((badge) => badge !== null)
        .map((badge, index) => (
          <div key={index} className="flex-shrink-0">
            <UserBadgeView
              badge={badge}
              userPub={userPub}
              twTitleStyle={twTitleStyle}
              twTextStyle={twTextStyle}
              setOpenBadge={setOpenBadgeDetails}
              handleBadgeOnClick={handleBadgeOnClick}
            />
          </div>
        ))}
    </div>
  );
}
