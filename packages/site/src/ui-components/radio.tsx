import React, { forwardRef } from 'react';
import { RadioGroup } from '@headlessui/react';
import { clsx } from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  register?: UseFormRegisterReturn;
  name?: string;
}

export const Radio = forwardRef<HTMLDivElement, RadioProps>(
  (
    { options, value, onChange, label, className, register, name, ...props },
    ref,
  ) => {
    return (
      <RadioGroup
        value={value}
        onChange={onChange}
        className={clsx('relative', className)}
        ref={ref}
        {...props}
      >
        {label && (
          <RadioGroup.Label className="text-sm font-medium text-copy dark:text-dark-copy">
            {label}
          </RadioGroup.Label>
        )}
        <div className="mt-2 space-y-2">
          {options.map((option) => (
            <RadioGroup.Option
              key={option.value}
              value={option.value}
              className={({ active, checked }) =>
                clsx(
                  'relative flex cursor-pointer rounded-lg px-5 py-4 focus:outline-none',
                  active &&
                    'ring-2 ring-primary dark:ring-dark-primary ring-offset-2',
                  checked
                    ? 'bg-primary/10 dark:bg-dark-primary/10 border-primary dark:border-dark-primary'
                    : 'border-border dark:border-dark-border bg-foreground dark:bg-dark-foreground',
                  'border',
                )
              }
            >
              {({ active, checked }) => (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={clsx(
                            'font-medium',
                            checked
                              ? 'text-primary dark:text-dark-primary'
                              : 'text-copy dark:text-dark-copy',
                          )}
                        >
                          {option.label}
                        </RadioGroup.Label>
                        {option.description && (
                          <RadioGroup.Description
                            as="span"
                            className={clsx(
                              'inline',
                              checked
                                ? 'text-primary-dark dark:text-dark-primary-light'
                                : 'text-copy-light dark:text-dark-copy-light',
                            )}
                          >
                            <span>{option.description}</span>
                          </RadioGroup.Description>
                        )}
                      </div>
                    </div>
                    <div
                      className={clsx(
                        'shrink-0 text-primary dark:text-dark-primary',
                        checked ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="12" cy="12" r="12" opacity="0.2" />
                        <path
                          d="M7 13l3 3 7-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
        {register && (
          <input
            type="radio"
            className="sr-only"
            name={name}
            ref={register.ref}
            onChange={(e) => {
              register.onChange(e);
              onChange(e.target.value);
            }}
            onBlur={register.onBlur}
            value={value}
          />
        )}
      </RadioGroup>
    );
  },
);

Radio.displayName = 'Radio';
