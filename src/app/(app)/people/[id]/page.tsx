"use client";

import { use } from "react";
import Link from "next/link";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { monthDayLabel } from "@/domain/dates";
import { Button } from "@/components/ui/Button";

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const person = useAbebaStore((s) => s.people.find((p) => p.id === id));
  const dates = useAbebaStore((s) => s.dates.filter((d) => d.personId === id));
  const address = useAbebaStore((s) => s.addresses.find((a) => a.id === person?.addressId));

  if (!person) return <p className="p-8">{t.people.empty}</p>;

  return (
    <div className="px-5 pb-10 pt-8">
      <p className="text-5xl">{person.emoji}</p>
      <h1 className="mt-2 font-display text-4xl">{person.name}</h1>
      <p className="text-muted">{person.relationship}</p>
      <dl className="mt-6 space-y-3 text-sm">
        {dates.map((date) => (
          <div key={date.id} className="flex justify-between rounded-2xl bg-paper px-4 py-3">
            <dt>{t.dates[date.type]}</dt>
            <dd>
              {monthDayLabel(date.month, date.day, locale)} · {t.dates.offsets[date.reminderOffsets[0] ?? 7]}
            </dd>
          </div>
        ))}
        <div className="flex justify-between rounded-2xl bg-paper px-4 py-3">
          <dt>{t.people.favoriteFlowers}</dt>
          <dd>{person.favoriteFlowers.map((f) => t.flowers[f]).join(", ") || "—"}</dd>
        </div>
        <div className="flex justify-between rounded-2xl bg-paper px-4 py-3">
          <dt>{t.people.favoriteColors}</dt>
          <dd className="capitalize">{person.favoriteColors.join(" / ") || "—"}</dd>
        </div>
        <div className="flex justify-between rounded-2xl bg-paper px-4 py-3">
          <dt>{t.people.address}</dt>
          <dd>{address ? address.line1 : "—"}</dd>
        </div>
      </dl>
      <Link href={`/people/${person.id}/send`}>
        <Button className="mt-8 w-full">{t.people.sendHer}</Button>
      </Link>
    </div>
  );
}
