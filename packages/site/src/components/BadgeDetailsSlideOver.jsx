import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import BadgeDetailsSidebar from './BadgeDetailsSidebar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const BadgeDetailsSlideOver = ({
  open,
  setOpen,
  badgeDetailsFunction1,
  badgeDetailsFunction1Name,
  badgeDetailsFunction2,
  badgeDetailsFunction2Name,
  badgeDetailsFilterAccountAddresses,
  width1,
  setRerender1,
  setRerender2,
  isFileDrop,
}) => {
  console.log('BadgeDetailsSlideOver: open = ', open);
  console.log(
    'BadgeDetailsSlideOver: badgeDetailsFunction1Name = ',
    badgeDetailsFunction1Name,
  );
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={setOpen}
      >
        <div className="inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed bottom-0 left-1/2 flex max-w-full -translate-x-1/2 transform pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <div>
                <BadgeDetailsSidebar
                  setOpen={setOpen}
                  badgeDetailsFunction1={badgeDetailsFunction1}
                  badgeDetailsFunction1Name={badgeDetailsFunction1Name}
                  badgeDetailsFunction2={badgeDetailsFunction2}
                  badgeDetailsFunction2Name={badgeDetailsFunction2Name}
                  badgeDetailsFilterAccountAddresses={
                    badgeDetailsFilterAccountAddresses
                  }
                  width1={width1}
                  setRerender1={setRerender1}
                  setRerender2={setRerender2}
                  isFileDrop={isFileDrop}
                />
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default BadgeDetailsSlideOver;
