"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { OCCASIONS } from "@/domain/types";
import { upcomingDates, daysUntil } from "@/domain/dates";
import { greetingKey, relativeDays } from "@/lib/format";
import { BouquetCard } from "@/components/customer/BouquetCard";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  const { t } = useI18n();
  const session = useAbebaStore((s) => s.session);
  const people = useAbebaStore((s) => s.people);
  const dates = useAbebaStore((s) => s.dates);
  const bouquets = useAbebaStore((s) => s.bouquets);
  const unread = useAbebaStore((s) => s.notifications.filter((n) => !n.readAt).length);

  const upcoming = upcomingDates(dates, 21);
  const featured = upcoming[0];
  const featuredPerson = people.find((p) => p.id === featured?.date.personId);
  const forYou = bouquets.filter((b) => b.inventoryStatus !== "out").slice(0, 4);
  const greeting = t.greeting[greetingKey()];

  return (
    <div className="safe-bottom px-5 pt-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{greeting},</p>
          <h1 className="font-display text-[34px] leading-tight">{session?.fullName ?? "there"}</h1>
        </div>
        <Link href="/notifications" className="relative mt-1 rounded-full bg-paper p-2.5">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose" />
          )}
        </Link>
      </header>

      {featured && featuredPerson && (
        <Link href={`/shop?person=${featuredPerson.id}&occasion=birthday`}>
          <Card className="mb-8 overflow-hidden">
            <div className="bg-rose px-5 py-5 text-white">
              <p className="text-lg font-medium">
                ❤️ {featuredPerson.name}&apos;s {t.dates[featured.date.type]}{" "}
                {relativeDays(daysUntil(featured.date), t.common)}
              </p>
              <p className="mt-2 text-sm text-white/80">{t.home.reminderBody}</p>
              <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-rose">
                {t.home.seeFlowers}
              </span>
            </div>
          </Card>
        </Link>
      )}

      <section className="mb-8">
        <h2 className="mb-3 font-display text-2xl">{t.home.sendFlowers}</h2>
        <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion}
              href={`/shop?occasion=${occasion}`}
              className="shrink-0 rounded-full bg-paper px-4 py-2.5 text-sm shadow-[0_6px_20px_rgba(28,20,18,0.04)]"
            >
              {t.occasionEmoji[occasion]} {t.occasions[occasion]}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl">{t.home.people}</h2>
          <Link href="/people" className="text-sm text-rose">
            {t.people.title}
          </Link>
        </div>
        <div className="hide-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/people/${person.id}/send`}
              className="w-28 shrink-0 rounded-[24px] bg-paper p-4 text-center"
            >
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-blush text-xl">
                {person.emoji}
              </div>
              <p className="text-sm font-medium">{person.name}</p>
              <p className="text-[11px] text-muted">{person.relationship}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl">{t.home.forYou}</h2>
        <div className="space-y-4">
          {forYou.map((bouquet) => (
            <BouquetCard key={bouquet.id} bouquet={bouquet} />
          ))}
        </div>
      </section>
    </div>
  );
}
