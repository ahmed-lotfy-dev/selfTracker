import { isValid, parseISO } from "date-fns";

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
    // Check if it's a seconds timestamp or milliseconds
    // SQLite timestamps are usually milliseconds
    parsed = new Date(dateIn);
  } else if (typeof dateIn === "string") {
    parsed = parseISO(dateIn);
  } else {
    return fallback;
  }

  return isValid(parsed) ? parsed : fallback;
};
