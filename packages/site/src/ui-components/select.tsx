import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

type SelectProps = {
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
  error?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
} & Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'multiple'
> & {
    register?: UseFormRegisterReturn;
  };

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  className,
  error,
  register,
  value,
  onChange,
  multiple = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    { value: string; label: string }[]
  >(
    multiple
      ? options.filter(
          (option) => Array.isArray(value) && value.includes(option.value),
        )
      : options.filter((option) => option.value === value),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: { value: string; label: string }) => {
    let newSelectedOptions;
    if (multiple) {
      newSelectedOptions = selectedOptions.some((o) => o.value === option.value)
        ? selectedOptions.filter((o) => o.value !== option.value)
        : [...selectedOptions, option];
    } else {
      newSelectedOptions = [option];
      setIsOpen(false);
    }
    setSelectedOptions(newSelectedOptions);

    if (onChange) {
      onChange(
        multiple
          ? newSelectedOptions.map((o) => o.value)
          : newSelectedOptions[0].value,
      );
    }
    if (register && register.onChange) {
      const event = {
        target: {
          name: register.name,
          value: multiple
            ? newSelectedOptions.map((o) => o.value)
            : newSelectedOptions[0].value,
        },
      } as React.ChangeEvent<HTMLSelectElement>;
      register.onChange(event);
    }
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-copy dark:text-dark-copy mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full rounded-md',
            'bg-foreground dark:bg-dark-foreground',
            'text-copy dark:text-dark-copy text-left',
            'border border-border dark:border-dark-border',
            'focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary',
            'disabled:bg-background disabled:dark:bg-dark-background disabled:cursor-not-allowed disabled:opacity-75',
            error
              ? 'border-error dark:border-dark-error'
              : 'hover:border-primary dark:hover:border-dark-primary',
            'transition-colors duration-200',
            'px-4 py-2 pr-8 sm:text-sm',
          )}
        >
          {selectedOptions.length > 0
            ? selectedOptions.map((o) => o.label).join(', ')
            : 'Select...'}
          <ChevronDownIcon
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-copy-light dark:text-dark-copy-light pointer-events-none"
            aria-hidden="true"
          />
        </button>
        {isOpen && (
          <ul
            className={clsx(
              'absolute z-10 mt-1 w-full rounded-md shadow-lg',
              'bg-foreground dark:bg-dark-foreground',
              'border border-border dark:border-dark-border',
              'max-h-60 overflow-auto',
            )}
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className={clsx(
                  'cursor-pointer select-none relative py-2 pl-3 pr-9',
                  'hover:bg-primary/10 dark:hover:bg-dark-primary/10',
                  'text-copy dark:text-dark-copy',
                  selectedOptions.some((o) => o.value === option.value) &&
                    'bg-primary/20 dark:bg-dark-primary/20',
                )}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error dark:text-dark-error">{error}</p>
      )}
      <select {...register} {...props} multiple={multiple} className="sr-only">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
