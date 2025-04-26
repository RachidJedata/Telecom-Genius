import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// import slugify from 'slugify'
import { remove as removeDiacritics } from 'diacritics';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export function turnToUrl(value: string): string {
    // Step 1: Remove accents (equivalent to PostgreSQL unaccent)
    const unaccented = removeDiacritics(value);

    // Step 2: Replace all non-alphanumeric characters with hyphens
    const slugified = unaccented.replace(/[^a-zA-Z0-9]+/g, '-');
  
    // Step 3: Convert to lowercase
    return slugified.toLowerCase();
}

export type FormState = {
  message?: string;
  errors?: Record<string, string>;
  fields?: Record<string, string>;
};