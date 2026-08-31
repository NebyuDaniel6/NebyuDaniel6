"use client";

import Link from "next/link";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { monthDayLabel } from "@/domain/dates";

export default function PeoplePage() {
  const { t, locale } = useI18n();
  const people = useAbebaStore((s) => s.people);
  const dates = useAbebaStore((s) => s.dates);
  const addresses = useAbebaStore((s) => s.addresses);

  return (
    <div className="safe-bottom px-5 pt-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[34px]">{t.people.title}</h1>
          <p className="text-sm text-muted">{t.people.subtitle}</p>
        </div>
        <Link href="/people/new" className="text-sm text-rose">
          {t.people.add}
        </Link>
      </div>

      {people.length === 0 ? (
        <p className="py-16 text-center text-muted">{t.people.empty}</p>
      ) : (
        <div className="space-y-4">
          {people.map((person) => {
            const personDates = dates.filter((d) => d.personId === person.id);
            const address = addresses.find((a) => a.id === person.addressId);
            return (
              <Card key={person.id} className="p-5">
                <Link href={`/people/${person.id}`} className="block">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-blush text-xl">
                      {person.emoji}
                    </div>
                    <div>
                      <h2 className="text-lg font-medium">
                        {person.emoji} {person.name}
                      </h2>
                      <p className="text-sm text-muted">{person.relationship}</p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-1.5 text-sm">
                    {personDates.map((date) => (
                      <div key={date.id} className="flex justify-between">
                        <dt className="text-muted">{t.dates[date.type]}</dt>
                        <dd>{monthDayLabel(date.month, date.day, locale)}</dd>
                      </div>
                    ))}
                    {person.favoriteFlowers.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted">{t.people.favoriteFlowers}</dt>
                        <dd>{person.favoriteFlowers.map((f) => t.flowers[f]).join(", ")}</dd>
                      </div>
                    )}
                    {person.favoriteColors.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted">{t.people.favoriteColors}</dt>
                        <dd className="capitalize">{person.favoriteColors.join(" / ")}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted">{t.people.address}</dt>
                      <dd>{address ? t.people.saved : "—"}</dd>
                    </div>
                  </dl>
                </Link>
                <Link href={`/people/${person.id}/send`}>
                  <Button className="mt-4 w-full">{t.people.send}</Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
