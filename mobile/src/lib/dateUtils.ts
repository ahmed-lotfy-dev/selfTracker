/**
 * Date helper utilities for SelfTracker
 * Fixes timezone issues where dates were stored as UTC midnight
 * instead of local time, causing date shifts.
 */

/**
 * Get current timestamp in ISO format (UTC) — for true timestamps like updatedAt, deletedAt
 */
export function nowISO(): string {
  return new Date().toISOString()
}

/**
 * Get today's date as YYYY-MM-DD in LOCAL timezone
 * Use this for date-only fields like loggedAt, completedAt
 */
export function todayLocal(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convert a Date object to YYYY-MM-DD in LOCAL timezone
 */
export function toLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Create a full ISO timestamp from a local date string (YYYY-MM-DD)
 * Sets time to noon local time to avoid timezone edge cases
 * e.g. "2026-05-14" -> "2026-05-14T12:00:00.000Z" (approximately)
 */
export function localDateToISO(dateStr: string): string {
  // Parse as local date at noon to avoid midnight UTC shifting
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day, 12, 0, 0)
  return d.toISOString()
}
