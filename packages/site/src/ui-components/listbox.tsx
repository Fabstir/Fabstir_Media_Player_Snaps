import React, { Fragment, forwardRef } from 'react';
import { Listbox as HeadlessListbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';

export interface ListboxOption {
  value: string;
  label: string;
}

interface ListboxProps {
  options: ListboxOption[];
  value: ListboxOption;
  onChange: (value: ListboxOption) => void;
  label?: string;
  register?: UseFormRegisterReturn;
  name?: string;
  className?: string;
}

export const Listbox = forwardRef<HTMLSelectElement, ListboxProps>(
  ({ options, value, onChange, label, register, name, className }, ref) => {
    return (
      <HeadlessListbox
        as="div"
        value={value}
        onChange={onChange}
        className={clsx('relative', className)}
      >
        {({ open }) => (
          <>
            {label && (
              <HeadlessListbox.Label className="block text-sm font-medium text-copy dark:text-dark-copy mb-1">
                {label}
              </HeadlessListbox.Label>
            )}
            <div className="relative mt-1">
              <HeadlessListbox.Button className="relative w-full cursor-default rounded-md bg-foreground dark:bg-dark-foreground py-2 pl-3 pr-10 text-left border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary sm:text-sm">
                <span className="block truncate text-copy dark:text-dark-copy">
                  {value.label}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-copy-light dark:text-dark-copy-light"
                    aria-hidden="true"
                  />
                </span>
              </HeadlessListbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <HeadlessListbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-foreground dark:bg-dark-foreground py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <HeadlessListbox.Option
                      key={option.value}
                      className={({ active }) =>
                        clsx(
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                          active
                            ? 'bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary'
                            : 'text-copy dark:text-dark-copy',
                        )
                      }
                      value={option}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={clsx(
                              'block truncate',
                              selected ? 'font-semibold' : 'font-normal',
                            )}
                          >
                            {option.label}
                          </span>

                          {selected ? (
                            <span
                              className={clsx(
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                active
                                  ? 'text-primary dark:text-dark-primary'
                                  : 'text-primary dark:text-dark-primary',
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </HeadlessListbox.Option>
                  ))}
                </HeadlessListbox.Options>
              </Transition>
            </div>
          </>
        )}
      </HeadlessListbox>
    );
  },
);

Listbox.displayName = 'Listbox';
