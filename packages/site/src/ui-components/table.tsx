import React from 'react';
import { clsx } from 'clsx';

type TableProps = {
  children: React.ReactNode;
  className?: string;
};

type TableHeadProps = {
  children: React.ReactNode;
  className?: string;
};

type TableBodyProps = {
  children: React.ReactNode;
  className?: string;
};

type TableRowProps = {
  children: React.ReactNode;
  className?: string;
};

type TableCellProps = {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
};

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-border dark:divide-dark-border">
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className,
}) => {
  return (
    <thead className={clsx('bg-background dark:bg-dark-background', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className,
}) => {
  return (
    <tbody
      className={clsx(
        'bg-foreground dark:bg-dark-foreground divide-y divide-border dark:divide-dark-border',
        className,
      )}
    >
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return (
    <tr
      className={clsx(
        'hover:bg-background/50 dark:hover:bg-dark-background/50 transition-colors duration-200',
        className,
      )}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  header = false,
}) => {
  const Component = header ? 'th' : 'td';
  return (
    <Component
      className={clsx(
        'px-6 py-4 whitespace-nowrap text-sm',
        header
          ? 'font-medium text-copy-light dark:text-dark-copy-light'
          : 'text-copy dark:text-dark-copy',
        className,
      )}
    >
      {children}
    </Component>
  );
};
