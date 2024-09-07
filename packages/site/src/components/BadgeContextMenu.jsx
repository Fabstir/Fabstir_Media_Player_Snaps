import { Menu, Transition } from '@headlessui/react';
import {
  DotsVerticalIcon,
  FlagIcon,
  HeartIcon,
  UserIcon,
} from 'heroiconsv1/solid';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function BadgeContextMenu({ badge, onDelete, setOpen }) {
  return (
    <div className="z-40 flex flex-shrink-0 self-center">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="-m-2 flex items-center rounded-full p-2 text-light-gray hover:text-white">
            <span className="sr-only">Open options</span>
            <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border-2 border-gray bg-dark-gray shadow-lg ring-1 ring-black ring-opacity-5 hover:text-white focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active
                        ? 'bg-gray text-light-gray'
                        : 'text-light-gray',
                      'flex px-4 py-2 text-sm',
                    )}
                  >
                    <HeartIcon
                      className="mr-3 h-5 w-5 text-light-gray"
                      aria-hidden="true"
                    />
                    <span>Add to favourites</span>
                  </a>
                )}
              </Menu.Item>

              {badge?.giver && (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={`/users/${badge.giver}`}
                      onClick={() => setOpen(false)}
                      className={classNames(
                        active
                          ? 'bg-gray text-light-gray'
                          : 'text-light-gray',
                        'flex px-4 py-2 text-sm',
                      )}
                    >
                      <UserIcon
                        className="mr-3 h-5 w-5 text-light-gray"
                        aria-hidden="true"
                      />
                      <span>Giver</span>
                    </Link>
                  )}
                </Menu.Item>
              )}

              {badge?.taker && (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={`/users/${badge.taker}`}
                      onClick={() => setOpen(false)}
                      className={classNames(
                        active
                          ? 'bg-gray text-light-gray'
                          : 'text-light-gray',
                        'flex px-4 py-2 text-sm',
                      )}
                    >
                      <UserIcon
                        className="mr-3 h-5 w-5 text-light-gray"
                        aria-hidden="true"
                      />
                      <span>Taker</span>
                    </Link>
                  )}
                </Menu.Item>
              )}

              {/* <Menu.Item onClick={() => onDelete(badge)}>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active
                        ? 'bg-gray text-light-gray'
                        : 'text-light-gray',
                      'flex px-4 py-2 text-sm'
                    )}
                  >
                    <CodeIcon
                      className="mr-3 h-5 w-5 text-light-gray"
                      aria-hidden="true"
                    />
                    <span>Delete</span>
                  </a>
                )}
              </Menu.Item> */}
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active
                        ? 'bg-gray text-light-gray'
                        : 'text-light-gray',
                      'flex px-4 py-2 text-sm',
                    )}
                  >
                    <FlagIcon
                      className="mr-3 h-5 w-5 text-light-gray"
                      aria-hidden="true"
                    />
                    <span>Report content</span>
                  </a>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
