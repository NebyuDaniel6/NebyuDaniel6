"use client";

import { addDays } from "date-fns";
import { useAbebaStore } from "@/data/store";
import { demandForDay } from "@/domain/dates";
import { useI18n } from "@/i18n";

export default function AdminDemandPage() {
  const { t } = useI18n();
  const dates = useAbebaStore((s) => [...s.dates, ...s.demandDates]);
  const tomorrow = demandForDay(dates, addDays(new Date(2026, 7, 31), 1));
  const week = Array.from({ length: 7 }, (_, i) =>
    demandForDay(dates, addDays(new Date(2026, 7, 31), i)),
  ).reduce(
    (acc, day) => ({
      birthday: acc.birthday + day.birthday,
      anniversary: acc.anniversary + day.anniversary,
      other: acc.other + day.other,
    }),
    { birthday: 0, anniversary: 0, other: 0 },
  );

  return (
    <div>
      <h1 className="font-display text-4xl">{t.admin.demand}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Stat
          title={t.admin.tomorrow}
          items={[
            `${tomorrow.birthday} ${t.admin.birthdays}`,
            `${tomorrow.anniversary} ${t.admin.anniversaries}`,
            `${tomorrow.other} ${t.admin.other}`,
          ]}
        />
        <Stat
          title={t.admin.thisWeek}
          items={[
            `${week.birthday} ${t.admin.birthdays}`,
            `${week.anniversary} ${t.admin.anniversaries}`,
            `${week.other} ${t.admin.other}`,
          ]}
        />
      </div>
    </div>
  );
}

function Stat({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[28px] bg-paper p-6 shadow-[0_12px_40px_rgba(28,20,18,0.06)]">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{title}</p>
      <ul className="mt-4 space-y-2 font-display text-2xl">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
