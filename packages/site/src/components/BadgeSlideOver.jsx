import { Dialog, Transition } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { Fragment, useContext, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as yup from 'yup';

import { currentbadgemetadata } from '../atoms/badgeSlideOverAtom';
import { userpubstate } from '../atoms/userAtom';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useMintBadge from '../blockchain/useMintBadge';
import useCreateBadgeToGive from '../hooks/useCreateBadgeToGive';
import useUserProfile from '../hooks/useUserProfile';
import BadgeSlideOverLeft from './BadgeSlideOverLeft';
import BadgeSlideOverRight from './BadgeSlideOverRight';
import BlockchainContext from '../../state/BlockchainContext';
import useContractUtils from '../blockchain/useContractUtils';

const defaultFormValues = {
  name: '',
  address: '',
  symbol: '',
  description: '',
  type: '',
  category: '',
  attributes: '',
  genres: '',
  image: '',
  deployed: false,
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const BadgeSlideOver = ({
  open,
  setOpen,
  initialValues = defaultFormValues,
  submitText,
  setSubmitText,
  clearOnSubmit,
}) => {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const { getChainIdAddressFromContractAddresses } = useContractUtils();

  const summaryMax = 250;
  const descriptionMax = 4000;
  const symbolMax = 10;
  const nameMax = 120;
  const categoryMax = 50;

  const badgeSchema = yup.object().shape({
    name: yup
      .string()
      .max(nameMax, `Name length is up to ${nameMax} characters`)
      .required('Name required'),
    symbol: yup
      .string()
      .max(symbolMax, `Symbol length is up to ${symbolMax} characters`)
      .required('Symbol required'),
    summary: yup
      .string()
      .max(summaryMax, `Summary length is up to ${summaryMax} characters`)
      .required('Summary required'),

    description: yup
      .string()
      .max(
        descriptionMax,
        `Description length is up to ${descriptionMax} characters`,
      )
      .required('Description required'),

    category: yup
      .string()
      .max(categoryMax, `Category length is up to ${categoryMax} characters`)
      .required('Category required'),

    image: yup.string().required('Badge image required'),

    fileUrls: yup.array().notRequired(),
    deployed: yup.boolean().notRequired(),
  });

  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(badgeSchema),
  });

  const { mutate: createBadge, ...createBadgeInfo } = useCreateBadgeToGive();
  const { deployBadge } = useMintBadge();

  const [getUserProfile] = useUserProfile();

  // console.log('slide-over:genres = ', result?.genre_ids);
  //  const [open, setOpen] = useState(true);
  const userAuthPub = useRecoilValue(userauthpubstate);
  const userPub = useRecoilValue(userpubstate);

  const [currentBadge, setCurrentBadge] = useRecoilState(currentbadgemetadata);

  const badge = useRef({});

  console.log('BadgeSlideOver open = ', open);

  useEffect(() => {
    setSubmitText('Create Badge');
  }, [open, setSubmitText]);

  async function handleSubmit_Badge(data) {
    console.log('BadgeSlideOver: inside');

    setSubmitText('Creating...');

    const userAuthProfile = await getUserProfile(userAuthPub);

    badge.current = { ...data, type: 'other' };
    delete badge.current.fileNames;

    try {
      let address;
      if (badge.current.deployed) {
        const result = await deployBadge(userAuthPub, badge.current);
        address = result.address;
      } else {
        address = getChainIdAddressFromContractAddresses(
          connectedChainId,
          'NEXT_PUBLIC_ABTTOKEN_ADDRESS',
        );
      }

      badge.current = {
        ...badge.current,
        from: `${connectedChainId}:${userAuthProfile.accountAddress}`,
        giver: userAuthPub,
        address,
      };

      createBadge(badge.current);
      setCurrentBadge(badge.current);

      setTimeout(() => {
        methods.reset();
        setOpen(false);
      }, process.env.NEXT_PUBLIC_SLIDEOVER_CLOSE_DELAY);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <FormProvider {...methods}>
      <Transition.Root show={open} as={Fragment}>
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="inset-0">
            {/* <Dialog.Overlay className="absolute inset-0" /> */}

            <div className="fixed inset-y-0 right-0 flex max-w-full transform border-2 border-gray">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="-translate-x-full"
                enterTo="left-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="left-0"
                leaveTo="-translate-x-full"
              >
                <div
                  className="bg-background dark:bg-dark-background text-copy dark:text-dark-copy"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Background color split screen for large screens */}
                  <div
                    className="fixed left-0 top-0 hidden h-full w-1/2 bg-background dark:bg-dark-background text-copy dark:text-dark-copy lg:block"
                    aria-hidden="true"
                  />
                  <div
                    className="fixed right-0 top-0 hidden h-full w-1/2  lg:block"
                    aria-hidden="true"
                  />

                  <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 gap-x-16 overflow-y-auto lg:grid-cols-2 lg:px-8">
                    <h1 className="sr-only">Badge information</h1>

                    <BadgeSlideOverRight />
                    <BadgeSlideOverLeft
                      submitText={
                        submitText
                          ? submitText
                          : createBadgeInfo.isLoading
                            ? 'Creating...'
                            : createBadgeInfo.isError
                              ? 'Error!'
                              : createBadgeInfo.isSuccess
                                ? 'Created!'
                                : 'Create Badge'
                      }
                      userPub={userPub}
                      badge={badge.current}
                      clearOnSubmit={clearOnSubmit}
                      handleSubmit_Badge={handleSubmit_Badge}
                      badgeSchema={badgeSchema}
                      summaryMax={summaryMax}
                      descriptionMax={descriptionMax}
                    />
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Transition.Root>
    </FormProvider>
  );
};

export default BadgeSlideOver;
