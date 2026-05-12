export interface TimeWindow {
  label: string
  start: Date
  end: Date
}

const ARABIC_INDIC_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  واحد: 1,
  شهر: 1,
  شهرين: 2,
  اتنين: 2,
  اثنين: 2,
  تلاتة: 3,
  تلاته: 3,
  ثلاثة: 3,
  ثلاثه: 3,
  اربعة: 4,
  اربعه: 4,
  أربعة: 4,
  خمسة: 5,
  خمسه: 5,
  ستة: 6,
  سته: 6,
}

const MONTHS: Array<{ value: number; names: string[] }> = [
  { value: 0, names: ["january", "jan", "يناير"] },
  { value: 1, names: ["february", "feb", "فبراير"] },
  { value: 2, names: ["march", "mar", "مارس"] },
  { value: 3, names: ["april", "apr", "ابريل", "أبريل"] },
  { value: 4, names: ["may", "مايو"] },
  { value: 5, names: ["june", "jun", "يونيو"] },
  { value: 6, names: ["july", "jul", "يوليو"] },
  { value: 7, names: ["august", "aug", "اغسطس", "أغسطس"] },
  { value: 8, names: ["september", "sep", "سبتمبر"] },
  { value: 9, names: ["october", "oct", "اكتوبر", "أكتوبر"] },
  { value: 10, names: ["november", "nov", "نوفمبر"] },
  { value: 11, names: ["december", "dec", "ديسمبر"] },
]

export function normalizeQueryText(message: string): string {
  return message
    .replace(/[٠-٩۰-۹]/g, (digit) => ARABIC_INDIC_DIGITS[digit] || digit)
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
}

function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
}

function endOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
}

function startOfYear(year: number): Date {
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
}

function endOfYear(year: number): Date {
  return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function clampEndToNow(end: Date, now: Date): Date {
  return end.getTime() > now.getTime() ? now : end
}

function parseCount(value: string | undefined): number | null {
  if (!value) return null
  if (/^\d+$/.test(value)) return Number(value)
  return NUMBER_WORDS[value] || null
}

function findMonthName(normalized: string): number | null {
  for (const month of MONTHS) {
    if (month.names.some((name) => normalized.includes(name))) {
      return month.value
    }
  }
  return null
}

function buildWindow(label: string, start: Date, end: Date): TimeWindow {
  return {
    label: `${label} (${formatDate(start)} to ${formatDate(end)})`,
    start,
    end,
  }
}

export function parseTimeIntent(message: string, now = new Date()): TimeWindow | null {
  const normalized = normalizeQueryText(message)
  const yearMatch = normalized.match(/\b(20\d{2})\b/)
  const explicitYear = yearMatch ? Number(yearMatch[1]) : null
  const explicitMonth = findMonthName(normalized)

  if (explicitYear && explicitMonth !== null) {
    const start = startOfMonth(explicitYear, explicitMonth)
    const end = clampEndToNow(endOfMonth(explicitYear, explicitMonth), now)
    return buildWindow(`calendar month ${explicitYear}-${String(explicitMonth + 1).padStart(2, "0")}`, start, end)
  }

  if (explicitYear) {
    const start = startOfYear(explicitYear)
    const end = clampEndToNow(endOfYear(explicitYear), now)
    return buildWindow(`calendar year ${explicitYear}`, start, end)
  }

  const twoPartMonthAgo = normalized.match(
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+months?\s+ago\b/
  )
  const arabicMonthAgo = normalized.match(/(?:من|قبل)\s+(\d+|شهرين|شهر|واحد|اتنين|اثنين|تلاته|ثلاثه|اربعه|خمسه|سته)\s*ش?h?ر?/)
  const monthAgoCount = parseCount(twoPartMonthAgo?.[1] || arabicMonthAgo?.[1])

  if (monthAgoCount) {
    const target = new Date(now)
    target.setUTCMonth(target.getUTCMonth() - monthAgoCount)
    const start = startOfMonth(target.getUTCFullYear(), target.getUTCMonth())
    const end = endOfMonth(target.getUTCFullYear(), target.getUTCMonth())
    return buildWindow(`${monthAgoCount} month${monthAgoCount === 1 ? "" : "s"} ago`, start, end)
  }

  const rollingMonths = normalized.match(
    /\b(?:last|past|recent|latest)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+months?\b/
  )
  const arabicRollingMonths = normalized.match(/(?:اخر|اخر|الفتره الاخيره|خلال)\s+(\d+|شهرين|شهر|واحد|اتنين|اثنين|تلاته|ثلاثه|اربعه|خمسه|سته)\s*ش?h?ر?/)
  const rollingCount = parseCount(rollingMonths?.[1] || arabicRollingMonths?.[1])

  if (rollingCount) {
    const start = new Date(now)
    start.setUTCMonth(start.getUTCMonth() - rollingCount)
    return buildWindow(`last ${rollingCount} month${rollingCount === 1 ? "" : "s"}`, start, now)
  }

  if (/\b(last|previous)\s+month\b/.test(normalized) || /(الشهر|شهر)\s+(اللي\s+فات|الفات|الماضي|السابق)/.test(normalized)) {
    const target = new Date(now)
    target.setUTCMonth(target.getUTCMonth() - 1)
    const start = startOfMonth(target.getUTCFullYear(), target.getUTCMonth())
    const end = endOfMonth(target.getUTCFullYear(), target.getUTCMonth())
    return buildWindow("previous calendar month", start, end)
  }

  if (/\b(this|current)\s+month\b/.test(normalized) || /(الشهر\s+(ده|هذا|الحالي)|شهر\s+(ده|هذا|الحالي))/.test(normalized)) {
    const start = startOfMonth(now.getUTCFullYear(), now.getUTCMonth())
    return buildWindow("current calendar month", start, now)
  }

  if (
    /\b(latest|recent|past)\s+(month|30\s*days?)\b/.test(normalized) ||
    /\b(month|30\s*days?)\b/.test(normalized) ||
    /(الفتره الاخيره|اخر شهر|اخر شهر|الشهر الاخير)/.test(normalized)
  ) {
    const start = new Date(now)
    start.setDate(start.getDate() - 31)
    return buildWindow("last 31 days", start, now)
  }

  return null
}
