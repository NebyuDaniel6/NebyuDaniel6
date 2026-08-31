"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";

export default function BouquetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const bouquet = useAbebaStore((s) => s.bouquets.find((item) => item.id === id));
  const people = useAbebaStore((s) => s.people);
  const [personId, setPersonId] = useState(people[0]?.id ?? "person-sara");
  const [message, setMessage] = useState("");

  if (!bouquet) {
    return <p className="p-8 text-muted">{t.shop.empty}</p>;
  }

  const checkoutHref = `/checkout?bouquet=${bouquet.id}&person=${personId}&message=${encodeURIComponent(message)}`;

  return (
    <div className="pb-10">
      <div className="relative">
        <img src={bouquet.imageUrl} alt={bouquet.imageAlt} className="h-[420px] w-full object-cover" />
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-paper/90"
        >
          <ArrowLeft size={18} />
        </button>
      </div>
      <div className="space-y-6 px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">{bouquet.name}</h1>
            <p className="mt-2 leading-relaxed text-muted">{bouquet.description}</p>
          </div>
          <p className="font-display text-2xl text-rose">{formatMoney(bouquet.priceEtb)}</p>
        </div>
        <div className="flex gap-2 text-sm">
          {bouquet.availableToday && (
            <span className="rounded-full bg-blush px-3 py-1 text-rose-deep">
              {t.bouquet.availableToday}
            </span>
          )}
          <span className="rounded-full bg-paper px-3 py-1 text-muted">
            {t.bouquet.deliveryFrom.replace("{min}", String(bouquet.deliveryMinutesMin))}
          </span>
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl">{t.bouquet.chooseRecipient}</h2>
          <div className="flex flex-wrap gap-2">
            {people.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => setPersonId(person.id)}
                className={`rounded-full px-4 py-2 text-sm ${
                  personId === person.id ? "bg-ink text-cream" : "bg-paper"
                }`}
              >
                {person.emoji} {person.name}
              </button>
            ))}
            <Link href="/people/new" className="rounded-full bg-paper px-4 py-2 text-sm">
              {t.bouquet.someoneElse}
            </Link>
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-display text-xl">{t.bouquet.addMessage}</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.bouquet.messagePlaceholder}
            rows={3}
            className="w-full resize-none rounded-[20px] bg-paper px-4 py-3 outline-none"
          />
        </div>
        <div className="h-16" />
      </div>
      <div className="sticky bottom-0 bg-cream/95 px-5 py-4 backdrop-blur">
        <Link
          href={checkoutHref}
          className="flex w-full items-center justify-center rounded-full bg-rose px-5 py-3.5 text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(139,61,74,0.28)]"
        >
          {t.bouquet.sendFlowers}
        </Link>
      </div>
    </div>
  );
}
