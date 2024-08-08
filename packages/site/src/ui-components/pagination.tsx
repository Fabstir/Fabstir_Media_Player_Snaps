import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import Link from 'next/link';

export function Pagination({
  href,
  page,
  pageCount,
  count,
}: {
  href: string;
  page: number;
  pageCount: number;
  count: number;
}) {
  return (
    <nav className="flex items-center justify-between border-t border-border dark:border-dark-border px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        {page > 1 && (
          <Link
            href={`${href}${page - 1}`}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-copy-light dark:text-dark-copy-light hover:border-border dark:hover:border-dark-border hover:text-copy dark:hover:text-dark-copy"
          >
            <ArrowLongLeftIcon
              className="mr-3 h-5 w-5 text-copy-light dark:text-dark-copy-light"
              aria-hidden="true"
            />
            Previous
          </Link>
        )}
      </div>
      <div className="hidden md:-mt-px md:flex">
        {[...Array(pageCount)].map((_, i) => (
          <Link
            key={i}
            href={`${href}${i + 1}`}
            className={clsx(
              i + 1 === page
                ? 'border-primary dark:border-dark-primary text-primary dark:text-dark-primary'
                : 'border-transparent text-copy-light dark:text-dark-copy-light hover:text-copy dark:hover:text-dark-copy hover:border-border dark:hover:border-dark-border',
              'inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium',
            )}
          >
            {i + 1}
          </Link>
        ))}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        {page < pageCount && (
          <Link
            href={`${href}${page + 1}`}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-copy-light dark:text-dark-copy-light hover:border-border dark:hover:border-dark-border hover:text-copy dark:hover:text-dark-copy"
          >
            Next
            <ArrowLongRightIcon
              className="ml-3 h-5 w-5 text-copy-light dark:text-dark-copy-light"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
