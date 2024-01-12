import { twMerge } from 'tailwind-merge'
import { clsx, classValue } from 'clsx'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
