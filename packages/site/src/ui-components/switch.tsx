import React, { forwardRef } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { clsx } from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';

interface SwitchProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  register?: UseFormRegisterReturn;
  name?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      className,
      register,
      name,
      ...props
    },
    ref,
  ) => {
    const id = name || props.id;

    return (
      <HeadlessSwitch.Group
        as="div"
        className={clsx('flex items-center justify-between', className)}
      >
        {(label || description) && (
          <span className="flex flex-grow flex-col">
            {label && (
              <HeadlessSwitch.Label
                as="span"
                className="text-sm font-medium text-copy dark:text-dark-copy"
                passive
              >
                {label}
              </HeadlessSwitch.Label>
            )}
            {description && (
              <span className="text-sm text-copy dark:text-dark-copy">
                {description}
              </span>
            )}
          </span>
        )}
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          className="relative inline-flex items-center h-6 rounded-full w-11"
          {...props}
          ref={ref}
        >
          <span
            className={clsx(
              checked ? 'translate-x-6' : 'translate-x-1',
              'inline-block w-4 h-4 transform bg-white rounded-full transition-transform',
            )}
          />
        </HeadlessSwitch>
      </HeadlessSwitch.Group>
    );
  },
);

Switch.displayName = 'Switch';
