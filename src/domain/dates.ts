import { addDays, differenceInCalendarDays, setYear, isBefore, startOfDay } from "date-fns";
import type { ImportantDate, ReminderOffset } from "./types";

export function nextOccurrence(date: ImportantDate, from = new Date()): Date {
  const year = from.getFullYear();
  let next = new Date(year, date.month - 1, date.day);

  if (!date.repeatsAnnually && date.year) {
    return new Date(date.year, date.month - 1, date.day);
  }

  if (isBefore(startOfDay(next), startOfDay(from))) {
    next = setYear(next, year + 1);
  }
  return next;
}

export function daysUntil(date: ImportantDate, from = new Date()): number {
  return differenceInCalendarDays(nextOccurrence(date, from), from);
}

export function reminderDue(
  date: ImportantDate,
  offset: ReminderOffset,
  from = new Date(),
): boolean {
  return daysUntil(date, from) === offset;
}

export function upcomingDates(
  dates: ImportantDate[],
  withinDays = 30,
  from = new Date(),
) {
  return dates
    .map((date) => ({ date, days: daysUntil(date, from) }))
    .filter((item) => item.days >= 0 && item.days <= withinDays)
    .sort((a, b) => a.days - b.days);
}

export function demandForDay(dates: ImportantDate[], day: Date) {
  const counts = {
    birthday: 0,
    anniversary: 0,
    other: 0,
  };

  for (const date of dates) {
    const next = nextOccurrence(date, day);
    if (differenceInCalendarDays(next, day) !== 0) continue;
    if (date.type === "birthday") counts.birthday += 1;
    else if (date.type === "anniversary") counts.anniversary += 1;
    else counts.other += 1;
  }

  return counts;
}

export function monthDayLabel(month: number, day: number, locale = "en") {
  const date = new Date(2026, month - 1, day);
  return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-US", {
    month: "long",
    day: "numeric",
  }).format(date);
}

export function addOffset(date: Date, offset: ReminderOffset) {
  return addDays(date, -offset);
}
