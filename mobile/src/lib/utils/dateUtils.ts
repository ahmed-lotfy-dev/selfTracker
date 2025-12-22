import { isValid, parseISO, format } from "date-fns";

/**
 * Safely parses any date input into a valid Date object.
 * Handles ISO strings, timestamps (numbers), and existing Date objects.
 * Returns a fallback date (defaults to now) if the input is invalid.
 */
export const safeParseDate = (dateIn: any, fallback: Date = new Date()): Date => {
  if (!dateIn) return fallback;

  let parsed: Date;

  if (dateIn instanceof Date) {
    parsed = dateIn;
  } else if (typeof dateIn === "number") {
    parsed = new Date(dateIn);
  } else if (typeof dateIn === "string") {
    parsed = parseISO(dateIn);
  } else {
    return fallback;
  }

  return isValid(parsed) ? parsed : fallback;
};

/**
 * Formats a UTC date for display in the user's local time.
 */
export const formatLocal = (date: any, formatStr: string = "MMM d, yyyy"): string => {
  const parsed = safeParseDate(date);
  return format(parsed, formatStr);
};

/**
 * Converts a date to a strict UTC ISO string for storage.
 */
export const formatUTC = (date: any): string => {
  return safeParseDate(date).toISOString();
};

/**
 * Returns the start of today in UTC.
 */
export const getStartOfTodayUTC = (): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
};
