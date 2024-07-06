import React, { useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { currentbadgemetadata } from '../atoms/badgeSlideOverAtom'
import useMintBadge from '../blockchain/useMintBadge'
import usePortal from '../hooks/usePortal'

const tabs = [
  { name: 'Recently Added', href: '#', current: true },
  { name: 'Most Popular', href: '#', current: false },
  { name: 'Favourited', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserBadgeView({
  badge,
  userPub,
  twTitleStyle,
  twTextStyle,
  setOpenBadge,
  handleBadgeOnClick,
}) {
  const setCurrentBadge = useSetRecoilState(currentbadgemetadata)
  const [badgeImage, setBadgeImage] = useState()
  const [balance, setBalance] = useState()

  const { getBlobUrl } = usePortal()

  const { balanceOf } = useMintBadge()

  useEffect(() => {
    ;(async () => {
      if (badge?.image) {
        console.log('UserBadgeView: badge.image = ', badge.image)
        const linkUrl = await getBlobUrl(badge.image)
        console.log('UserBadgeView: linkUrl = ', linkUrl)
        setBadgeImage(linkUrl)
      }

      if (userPub) {
        let balanceBN = await balanceOf(userPub, badge)
        setBalance(balanceBN.toString())
      }
    })()
  }, [badge, userPub])

  return (
    <div className="flex-col-1 flex transform space-y-4 shadow-md transition duration-100 ease-in hover:scale-115">
      <div className="group mx-auto">
        <div
          className="relative"
          onClick={(e) => {
            e.preventDefault()
            setCurrentBadge(badge)

            if (setOpenBadge) setOpenBadge(true)
            if (handleBadgeOnClick) {
              ;(async () => {
                await handleBadgeOnClick(badge)
              })()
            }
          }}
        >
          <img
            className="@3xl:w-15 @2xl:w-15 aspect-[10/7] rounded-md border-dashed border-fabstir-medium-light-gray object-cover @sm:w-6 @sm:border-[1px] @md:w-10 @md:border-[1px] @lg:w-12 @lg:border-[2px] @xl:w-12 @xl:border-[2px] @2xl:w-16 @2xl:border-[3px] @4xl:w-20 @4xl:border-[3px] @5xl:w-21 @7xl:w-24 @7xl:border-[4px]"
            src={badgeImage}
            alt=""
            crossOrigin="anonymous"
          />
          {balance > 1 && (
            <p className="absolute left-0 top-0 rounded-full bg-fabstir-pink p-2 text-sm">
              {balance}
            </p>
          )}
        </div>
        {twTitleStyle && (
          <div
            className={classNames(
              'pointer-events-none mt-2 block truncate text-left font-medium text-fabstir-light-gray',
              twTitleStyle
            )}
          >
            <p>{badge.name}</p>
            {badge?.category && <p>{`(${badge.category})`}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
