import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from "date-fns"

/**
 * Parses any date format safely and returns a Date object.
 * Defaults to current date if parsing fails.
 */
export const safeParseDate = (date: any): Date => {
  if (!date) return new Date()
  if (date instanceof Date) return date
  if (typeof date === "number") return new Date(date)
  try {
    return parseISO(date)
  } catch (e) {
    return new Date()
  }
}

/**
 * Formats a UTC date for local user display.
 * Includes "Today", "Yesterday", and human-readable formats.
 */
export const formatLocal = (date: any, pattern: string = "MMM d, yyyy"): string => {
  const d = safeParseDate(date)
  if (isToday(d)) return "Today"
  if (isYesterday(d)) return "Yesterday"

  const daysAgo = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (daysAgo > 0 && daysAgo < 7) {
    return formatDistanceToNow(d, { addSuffix: true })
  }

  return format(d, pattern)
}

/**
 * Converts any date to a strict UTC ISO 8601 string.
 * Used for all data storage and transmission.
 */
export const formatUTC = (date: any = new Date()): string => {
  const d = safeParseDate(date)
  return d.toISOString() // toISOString is always UTC Z
}

/**
 * Returns the start of today in UTC.
 */
export const getStartOfTodayUTC = (): string => {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)
  return now.toISOString()
}
