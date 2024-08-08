import React from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';

type TextProps = {
  as?: 'p' | 'span' | 'div' | 'input';
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<
  HTMLParagraphElement | HTMLSpanElement | HTMLDivElement | HTMLInputElement
>;

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={clsx(
        'text-copy dark:text-dark-copy',
        Component === 'input' &&
          'bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-md',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

type StrongProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

export const Strong: React.FC<StrongProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <strong
      className={clsx(
        'font-semibold text-copy-dark dark:text-dark-copy-dark',
        className,
      )}
      {...props}
    >
      {children}
    </strong>
  );
};

type TextLinkProps = {
  children: React.ReactNode;
  href: string;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export const TextLink: React.FC<TextLinkProps> = ({
  children,
  href,
  className,
  ...props
}) => {
  return (
    <Link
      href={href}
      className={clsx(
        'text-primary hover:text-primary-dark dark:text-dark-primary dark:hover:text-dark-primary-light',
        'underline transition-colors duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

type CodeProps = React.ComponentPropsWithoutRef<'code'>;

export const Code: React.FC<CodeProps> = ({ className, ...props }) => {
  return (
    <code
      {...props}
      className={clsx(
        'rounded border px-0.5 text-sm font-medium sm:text-[0.8125rem]',
        'border-border bg-background text-copy',
        'dark:border-dark-border dark:bg-dark-background dark:text-dark-copy',
        className,
      )}
    />
  );
};
