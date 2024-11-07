import React from 'react';
import { clsx } from 'clsx';
import { UseFormRegister, FieldValues } from 'react-hook-form';

type TextareaProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
  error?: string;
  name: string;
  register?: UseFormRegister<FieldValues>;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>;

export const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  className,
  rows = 4,
  error,
  name,
  register,
  ...props
}) => {
  return (
    <div className={clsx('relative', className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-copy dark:text-dark-copy mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        {...register}
        rows={rows}
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
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-error dark:text-dark-error">{error}</p>
      )}
    </div>
  );
};
