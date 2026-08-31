import { format } from "date-fns";
import { formatMoney } from "@/domain/currency";
import type { Locale } from "@/domain/types";

export { formatMoney };

export function greetingKey(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "morning" as const;
  if (hour < 17) return "afternoon" as const;
  return "evening" as const;
}

export function relativeDays(days: number, t: { tomorrow: string; todayWord: string; inDays: string }) {
  if (days === 0) return t.todayWord;
  if (days === 1) return t.tomorrow;
  return t.inDays.replace("{n}", String(days));
}

export function formatTime(iso?: string, locale: Locale = "en") {
  if (!iso) return "";
  return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatShortDate(iso: string) {
  return format(new Date(iso), "MMM d");
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
