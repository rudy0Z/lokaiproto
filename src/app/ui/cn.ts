import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Class merge helper for adopted components (clsx + tailwind-merge).
 *  Used only where multi-variant class strings need conflict resolution —
 *  system components keep explicit token styles. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
