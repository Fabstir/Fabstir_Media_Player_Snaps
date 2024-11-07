import React, { forwardRef } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { clsx } from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';

interface SwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
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
              <HeadlessSwitch.Description
                as="span"
                className="text-sm text-copy-light dark:text-dark-copy-light"
              >
                {description}
              </HeadlessSwitch.Description>
            )}
          </span>
        )}
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          className={clsx(
            checked
              ? 'bg-primary dark:bg-dark-primary'
              : 'bg-copy-lighter dark:bg-dark-copy-lighter',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2',
          )}
          ref={ref}
          {...props}
        >
          <span
            aria-hidden="true"
            className={clsx(
              checked ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-foreground dark:bg-dark-foreground shadow ring-0 transition duration-200 ease-in-out',
            )}
          />
        </HeadlessSwitch>
        {register && (
          <input
            type="checkbox"
            className="sr-only"
            id={id}
            name={name}
            ref={register.ref}
            onChange={(e) => {
              register.onChange(e);
              onChange(e.target.checked);
            }}
            onBlur={register.onBlur}
            checked={checked}
          />
        )}
      </HeadlessSwitch.Group>
    );
  },
);

Switch.displayName = 'Switch';
