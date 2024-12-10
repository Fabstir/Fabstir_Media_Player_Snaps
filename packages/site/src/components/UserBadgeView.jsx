// UserBadgeView.js
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { currentbadgemetadata } from '../atoms/badgeSlideOverAtom';
import useMintBadge from '../blockchain/useMintBadge';
import usePortal from '../hooks/usePortal';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserBadgeView({
  badge,
  userPub,
  twTitleStyle,
  twTextStyle,
  setOpenBadge,
  handleBadgeOnClick,
}) {
  const setCurrentBadge = useSetRecoilState(currentbadgemetadata);
  const [badgeImage, setBadgeImage] = useState();
  const [balance, setBalance] = useState();

  const { getBlobUrl } = usePortal();
  const { balanceOf } = useMintBadge();

  useEffect(() => {
    (async () => {
      if (badge?.image) {
        console.log('UserBadgeView: badge.image = ', badge.image);
        const linkUrl = await getBlobUrl(badge.image);
        console.log('UserBadgeView: linkUrl = ', linkUrl);
        setBadgeImage(linkUrl);
      }

      if (userPub) {
        let balanceBN = await balanceOf(userPub, badge);
        setBalance(balanceBN.toString());
      }
    })();
  }, [badge, userPub]);

  return (
    <div className="flex transform flex-col space-y-4 rounded-lg shadow-md transition duration-100 ease-in hover:scale-105">
      <div className="group">
        <div
          className="relative cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setCurrentBadge(badge);

            if (setOpenBadge) setOpenBadge(true);
            if (handleBadgeOnClick) {
              (async () => {
                await handleBadgeOnClick(badge);
              })();
            }
          }}
        >
          <img
            className="aspect-[10/7] w-48 rounded-md border-2 border-dashed border-fabstir-medium-light-gray object-cover"
            src={badgeImage}
            alt=""
            crossOrigin="anonymous"
          />
          {balance > 1 && (
            <p className="absolute left-2 top-2 rounded-full bg-fabstir-pink px-2 py-1 text-sm">
              {balance}
            </p>
          )}
        </div>
        {twTitleStyle && (
          <div
            className={classNames(
              'mt-2 block break-words text-left font-medium text-fabstir-light-gray',
              twTitleStyle,
            )}
          >
            <p>{badge.name}</p>
            {badge?.category && <p>{`(${badge.category})`}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
