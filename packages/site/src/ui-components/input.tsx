import React from 'react';
import { clsx } from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';

type InputProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  icon?: React.ReactNode;
  register: UseFormRegisterReturn; // Make register prop required
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  className,
  error,
  type = 'text',
  icon,
  register,
  ...props
}) => {
  return (
    <div className={clsx('relative', className)}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-copy dark:text-dark-copy mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          {...register}
          type={type}
          placeholder={placeholder}
          className={clsx(
            'w-full rounded-md',
            'bg-foreground dark:bg-dark-foreground',
            'text-copy dark:text-dark-copy',
            'placeholder-copy-lighter dark:placeholder-dark-copy-lighter',
            'border border-border dark:border-dark-border',
            'focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary',
            'disabled:bg-background disabled:dark:bg-dark-background disabled:cursor-not-allowed disabled:opacity-75',
            error
              ? 'border-error dark:border-dark-error'
              : 'hover:border-primary dark:hover:border-dark-primary',
            'transition-colors duration-200',
            'px-4 py-2 sm:text-sm',
            icon && 'pl-10',
          )}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error dark:text-dark-error">{error}</p>
      )}
    </div>
  );
};
