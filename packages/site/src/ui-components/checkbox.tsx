import React from 'react';
import { clsx } from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';
import { CheckIcon } from '@heroicons/react/20/solid';

type CheckboxProps = {
  label?: string;
  className?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement> & {
    register?: UseFormRegisterReturn;
  };

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  error,
  register,
  ...props
}) => {
  return (
    <div className={clsx('relative flex items-start mt-6', className)}>
      <div className="flex items-center h-5">
        <div className="relative">
          <input
            type="checkbox"
            {...register}
            {...props}
            className={clsx(
              'appearance-none mt-2 ml-3 h-6 w-6 rounded',
              'border-2 border-border dark:border-dark-border',
              'bg-gray dark:bg-dark-foreground',
              'checked:bg-gray dark:checked:bg-gray',
              'checked:border-gray dark:checked:border-gray',
              'focus:outline-none focus:ring-2 focus:ring-gray dark:focus:ring-gray',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-error dark:border-dark-error'
                : 'hover:border-gray dark:hover:border-gray',
              'transition duration-150 ease-in-out',
            )}
          />
          <CheckIcon
            className={clsx(
              'absolute top-2 left-3 h-6 w-6 text-white dark:text-white',
              'pointer-events-none opacity-0 transition-opacity duration-150 ease-in-out',
              props.checked ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label
            htmlFor={props.id}
            className={clsx(
              'font-medium text-copy dark:text-dark-copy',
              props.disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {label}
          </label>
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-error dark:text-dark-error absolute top-full left-0">
          {error}
        </p>
      )}
    </div>
  );
};
