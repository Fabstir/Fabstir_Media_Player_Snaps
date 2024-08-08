import { AddressZero } from '@ethersproject/constants';
import { ChevronDoubleDownIcon } from 'heroiconsv1/solid';
import React, { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { saveAs } from 'file-saver';
import { FormProvider, useForm } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as yup from 'yup';
import { badgeattributesexpandstate } from '../atoms/badgeAttrributesExpandjs';
import { badgemetadataexpandstate } from '../atoms/badgeMetaDataExpand';
import { currentbadgemetadata } from '../atoms/badgeSlideOverAtom';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';
import { userpubstate } from '../atoms/userAtom';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useMintBadge from '../blockchain/useMintBadge';
import useDeleteBadge from '../hooks/useDeleteBadge';
import usePortal from '../hooks/usePortal';
import useUserProfile from '../hooks/useUserProfile';
import BadgeContextMenu from './BadgeContextMenu';
import DropFile from './DropFile';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const appendBadgeField = (old, field, value) => ({ ...old, [field]: value });

const badgeInformationDecorator = (information) => {
  if (!information) return null;

  let output = {};
  Object.keys(information)
    .filter(
      (key) => key !== 'name' && key !== 'summary' && key !== 'attributes',
    )
    .forEach((key) => {
      let val;
      if (key === 'created')
        val = new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'full',
          timeStyle: 'long',
        }).format(information[key]);
      else val = information[key];
      output = appendBadgeField(output, key, val);
    });

  console.log('output = ', output);
  return JSON.parse(JSON.stringify(output).trim());
};

const twStyle = 'ml-8 grid gap-y-6 grid-cols-6 gap-x-5';
const twTitleStyle = 'text-xs';
const twTextStyle = 'invisible';

export default function BadgeDetailsSidebar({
  setOpen,
  badgeDetailsFunction1,
  badgeDetailsFunction1Name,
  badgeDetailsFunction2,
  badgeDetailsFunction2Name,
  badgeDetailsFilterAccountAddresses,
  width1,
  setRerender1,
  setRerender2,
  isFileDrop = false,
}) {
  const [badge, setBadge] = useRecoilState(currentbadgemetadata);
  const [nft, setNFT] = useRecoilState(currentnftmetadata);
  const [
    rerenderBadgeDetailsSidebarState,
    setRerenderBadgeDetailsSidebarState,
  ] = useState(0);

  useEffect(() => {
    setRerenderBadgeDetailsSidebarState((prev) => prev + 1);
  }, [
    badgeDetailsFunction1,
    badgeDetailsFunction1Name,
    badgeDetailsFunction2,
    badgeDetailsFunction2Name,
  ]);

  console.log('BadgeDetailsSidebar: badge = ', badge);
  console.log('UserBadges: badge = ', badge);

  const userPub = useRecoilValue(userpubstate);
  const userAuthPub = useRecoilValue(userauthpubstate);

  const [openBadgeMetaData, setOpenBadgeMetaData] = useRecoilState(
    badgemetadataexpandstate,
  );

  const [openBadgeAttributes, setOpenBadgeAttributes] = useRecoilState(
    badgeattributesexpandstate,
  );

  const badgeInfoDecorated = badgeInformationDecorator(badge ? badge : null);

  const [userProfile, setUserProfile] = useState();
  const [getUserProfile] = useUserProfile();

  const { unequip } = useMintBadge();
  const { mutate: deleteBadge, deleteBadgeInfo } = useDeleteBadge();

  const onDelete = async (nft) => {
    console.log(`DetailsSidebar deleteBadge: nft=${badge?.address}`);

    if (badge?.tokenId) {
      try {
        await unequip(badge);

        await deleteBadge(badge);
        setBadge({});
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (userPub && !userProfile)
    (async () => {
      console.log('SearchBadges getUserProfile= ', getUserProfile);
      const currentUserProfile = await getUserProfile(userPub);
      setUserProfile((prevProfile) => currentUserProfile);
    })();

  const [badgeImage, setBadgeImage] = useState();
  const { getPortalLinkUrl, getBlobUrl } = usePortal();

  const [isPlay, setIsPlay] = useState(false);

  const badgeSchema = yup.object().shape({
    fileUrls: yup.array().notRequired(),
  });

  const defaultBadge = {
    fileUrls: [],
  };

  const methods = useForm({
    defaultValues: defaultBadge,
    resolver: yupResolver(badgeSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    (async () => {
      if (badge?.image) {
        const linkUrl = await getBlobUrl(badge.image);
        setBadgeImage(linkUrl);
      }
    })();
  }, [badge]);

  const [function1Name, setFunction1Name] = useState();

  useEffect(() => {
    setFunction1Name(badgeDetailsFunction1Name);
  }, [badgeDetailsFunction1Name]);

  const [minter, setMinter] = useState();
  const [owner, setOwner] = useState();
  const [userAuthPubAddress, setUserAuthPubAddress] = useState();

  const { minterOf, ownerOf } = useMintBadge();

  useEffect(() => {
    (async () => {
      console.log(
        'BadgeDetailsSidebar: badgeDetailsFilterAccountAddresses = ',
        badgeDetailsFilterAccountAddresses,
      );
      if (badgeDetailsFilterAccountAddresses) {
        const theMinter = await minterOf(badge);
        setMinter(theMinter);
        console.log('BadgeDetailsSidebar: theMinter = ', theMinter);

        if (badge.tokenId) {
          const theOwner = await ownerOf(badge);
          setOwner(theOwner);
          console.log('BadgeDetailsSidebar: theOwner = ', theOwner);
        }

        const currentUserAuthProfile = await getUserProfile(userAuthPub);
        setUserAuthPubAddress(currentUserAuthProfile.accountAddress);
      }
    })();
  }, []);

  async function handleSubmit_Badge(data) {
    let newBadge;
    if (data.fileUrls && data.fileUrls.length > 0) {
      if (badge.fileUrls && badge.fileUrls.length > 0)
        newBadge = { ...badge, fileUrls: badge.fileUrls.concat(data.fileUrls) };
      else newBadge = { ...badge, fileUrls: data.fileUrls };
    } else newBadge = badge;

    await badgeDetailsFunction1(newBadge, nft);
  }

  async function handle_DownloadFile(key, uri) {
    let fileName;
    if (key === 'uri') fileName = `${badge.symbol}_metadata.json`;
    else {
      const init = uri.indexOf('<<');
      const fin = uri.indexOf('>>');
      fileName = uri.substr(init + 2, fin - init - 2);

      uri = uri.substring(0, uri.lastIndexOf('<<'));
    }

    let linkUrl = await getPortalLinkUrl(uri);
    saveAs(linkUrl, fileName);

    console.log('DetailSidebar: handle_DownloadFile: linkUrl = ', linkUrl);
  }

  return (
    <FormProvider {...methods}>
      <aside
        className={classNames(
          'mx-auto w-full  flex-1 rounded-sm border-l border-fabstir-dark-gray bg-fabstir-gray-700 px-8 pb-8 pt-2 lg:block',
          width1,
        )}
      >
        {badge && (
          <div className="mb-2 flex justify-end">
            <BadgeContextMenu
              badge={badge}
              onDelete={onDelete}
              setOpen={setOpen}
            />
          </div>
        )}

        {badgeImage && (
          <div>
            <div className="aspect-h-7 aspect-w-10 mt-6 block w-full rounded-lg shadow-2xl shadow-fabstir-black/50">
              <img
                src={badgeImage}
                alt=""
                className="object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <div className="flex justify-between">
                  <h2 className="text-lg font-medium text-fabstir-light-gray">
                    <span className="w sr-only">Details for </span>
                    {badge?.name}
                  </h2>
                </div>
                <p className="mt-2 text-sm font-medium text-fabstir-light-gray/80">
                  {badge?.summary}
                </p>
              </div>
              {/* <ArrowCircleUpIcon className="h-6 w-6" aria-hidden="true" /> */}
            </div>
          </div>
        )}

        {isFileDrop && (
          <div className="pb-4">
            <DropFile
              field="fileUrls"
              fieldName="fileNames"
              twStyle="w-2/3 aspect-[1/1]"
              text="<file>"
              maxNumberOfFiles={10}
            />
          </div>
        )}

        <div className="group my-4">
          <div className="mt-4 flex justify-between">
            <h3 className="font-medium text-fabstir-light-gray">Information</h3>
            <ChevronDoubleDownIcon
              className={
                'h-6 w-6 transform text-fabstir-light-gray transition duration-200 ease-in ' +
                (openBadgeMetaData ? 'rotate-180' : 'rotate-0')
              }
              aria-hidden="true"
              onClick={() =>
                setOpenBadgeMetaData((openBadgeMetaData) => !openBadgeMetaData)
              }
            />
          </div>

          {/* {openBadgeMetaData && ( */}
          <div
            className={`"flex space-y-2" h-auto w-full flex-col justify-between sm:flex-row ${
              openBadgeMetaData === false && 'hidden'
            }`}
          >
            <div className="mt-6">
              <dl className="mt-2 divide-y divide-fabstir-divide-color1 border-b border-t border-fabstir-medium-light-gray">
                {badgeInfoDecorated &&
                  Object.keys(badgeInfoDecorated).map((key) => (
                    <div
                      key={key}
                      className="flex justify-between py-3 text-sm font-medium"
                    >
                      <dt className="text-gray-500">
                        {key}
                        {'\u00A0'}
                      </dt>
                      <dd className="truncate text-fabstir-light-gray">
                        <div>{badgeInfoDecorated[key]}</div>
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

            <div className="divide-y divide-fabstir-divide-color1">
              <div className="group my-4">
                <div className="mt-4 flex justify-between">
                  <h3 className="font-medium text-fabstir-light-gray">
                    Attributes
                  </h3>
                  <div className="flex flex-1 justify-end">
                    <ChevronDoubleDownIcon
                      className={
                        'h-6 w-6 transform text-fabstir-light-gray transition duration-200 ease-in ' +
                        (openBadgeAttributes ? 'rotate-180' : 'rotate-0')
                      }
                      aria-hidden="true"
                      onClick={() =>
                        setOpenBadgeAttributes(
                          (openBadgeAttributes) => !openBadgeAttributes,
                        )
                      }
                    />
                    <ChevronDoubleDownIcon
                      className={
                        'h-6 w-6 transform text-fabstir-light-gray transition duration-200 ease-in ' +
                        (openBadgeAttributes ? 'rotate-180' : 'rotate-0')
                      }
                      aria-hidden="true"
                      onClick={() =>
                        setOpenBadgeAttributes(
                          (openBadgeAttributes) => !openBadgeAttributes,
                        )
                      }
                    />
                  </div>
                </div>

                {/* {openBadgeAttributes && ( */}
                <div
                  className={`"flex space-y-2" h-auto w-full flex-col justify-between sm:flex-row ${
                    openBadgeAttributes === false && 'hidden sm:flex'
                  }`}
                >
                  {badge?.attributes &&
                    Object.entries(badge?.attributes).map(([key, value]) => {
                      return (
                        <div
                          key={key}
                          className="flex justify-between py-3 text-sm font-medium"
                        >
                          <dt className="text-fabstir-light-gray">
                            {key}
                            {'\u00A0'}
                          </dt>
                          <dd
                            className={
                              'text-fabstir-light-gray ' +
                              (openBadgeAttributes ? '' : 'line-clamp-1')
                            }
                          >
                            {value}
                          </dd>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="flex flex-1">
              {isFileDrop ? (
                <form
                  onSubmit={handleSubmit(handleSubmit_Badge)}
                  className="w-full"
                >
                  {badgeDetailsFunction1 &&
                    function1Name &&
                    (!badgeDetailsFilterAccountAddresses ||
                      (badgeDetailsFilterAccountAddresses &&
                        (userAuthPubAddress === owner ||
                          minter === AddressZero ||
                          userAuthPubAddress === minter))) && (
                      <Button
                        type="submit"
                        variant="primary"
                        size="medium"
                        className="w-full rounded-md border border-transparent px-4 py-2 text-sm font-medium tracking-wide"
                      >
                        {function1Name}
                      </Button>
                    )}
                </form>
              ) : (
                <>
                  {badgeDetailsFunction1 &&
                    function1Name &&
                    (!badgeDetailsFilterAccountAddresses ||
                      (badgeDetailsFilterAccountAddresses &&
                        (userAuthPubAddress === owner ||
                          minter === AddressZero ||
                          userAuthPubAddress === minter))) && (
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={() => {
                          (async () => {
                            await badgeDetailsFunction1(badge, nft);

                            if (setRerender1) setRerender1((prev) => prev + 1);
                            if (setRerender2) setRerender2((prev) => prev + 2);
                          })();
                        }}
                        className="w-full rounded-md border border-transparent px-4 py-2 text-sm font-medium tracking-wide"
                      >
                        {function1Name}
                      </Button>
                    )}
                </>
              )}

              {badgeDetailsFunction2 && badgeDetailsFunction2Name && (
                <Button
                  variant="primary"
                  size="medium"
                  onClick={() => {
                    (async () => {
                      await badgeDetailsFunction2(badge, nft);

                      if (setRerender1) setRerender1((prev) => prev + 1);
                      if (setRerender2) setRerender2((prev) => prev + 2);
                    })();
                  }}
                  className="ml-3 w-full rounded-md border border-transparent px-4 py-2 text-sm font-medium tracking-wide"
                >
                  {badgeDetailsFunction2Name}
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </FormProvider>
  );
}
