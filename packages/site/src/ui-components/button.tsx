import React from 'react';
import { Button as HeadlessButton } from '@headlessui/react';
import { clsx } from 'clsx';

type ButtonProps = {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'warning'
    | 'error'
    | '';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof HeadlessButton>;

export const Button: React.FC<ButtonProps> = ({
  variant = '',
  size = 'medium',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

  const variantClasses = {
    primary: `
      bg-primary text-primary-content hover:bg-primary-light active:bg-primary-dark focus:ring-primary
      dark:bg-dark-primary dark:text-dark-primary-content dark:hover:bg-dark-primary-light dark:active:bg-dark-primary-dark dark:focus:ring-dark-primary
    `,
    secondary: `
      bg-secondary text-secondary-content hover:bg-secondary-light active:bg-secondary-dark focus:ring-secondary
      dark:bg-dark-secondary dark:text-dark-secondary-content dark:hover:bg-dark-secondary-light dark:active:bg-dark-secondary-dark dark:focus:ring-dark-secondary
    `,
    outline: `
      border border-primary text-primary hover:bg-primary hover:text-primary-content focus:ring-primary
      dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary dark:hover:text-dark-primary-content dark:focus:ring-dark-primary
    `,
    success: `
      bg-success text-success-content hover:bg-success/90 active:bg-success/80 focus:ring-success
      dark:bg-dark-success dark:text-dark-success-content dark:hover:bg-dark-success/90 dark:active:bg-dark-success/80 dark:focus:ring-dark-success
    `,
    warning: `
      bg-warning text-warning-content hover:bg-warning/90 active:bg-warning/80 focus:ring-warning
      dark:bg-dark-warning dark:text-dark-warning-content dark:hover:bg-dark-warning/90 dark:active:bg-dark-warning/80 dark:focus:ring-dark-warning
    `,
    error: `
      bg-error text-error-content hover:bg-error/90 active:bg-error/80 focus:ring-error
      dark:bg-dark-error dark:text-dark-error-content dark:hover:bg-dark-error/90 dark:active:bg-dark-error/80 dark:focus:ring-dark-error
    `,
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const disabledClasses =
    'opacity-50 cursor-not-allowed pointer-events-none bg-opacity-50 dark:bg-opacity-50';

  return (
    <HeadlessButton
      className={clsx(
        baseClasses,
        variant && variantClasses[variant],
        sizeClasses[size],
        disabled && disabledClasses,
        `${className} 
        bg-button-background dark:bg-dark-button-background
        text-button-text dark:text-dark-button-text 
        hover:bg-hover-background dark:hover:bg-dark-hover-background 
        hover:text-hover-text dark:hover:text-dark-hover-text 
        shadow-md shadow-buttonShadow dark:shadow-dark-buttonShadow`,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </HeadlessButton>
  );
};
