"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Bouquet } from "@/domain/types";
import { useI18n } from "@/i18n";

export function BouquetCard({
  bouquet,
  compact = false,
}: {
  bouquet: Bouquet;
  compact?: boolean;
}) {
  const { t } = useI18n();

  return (
    <Link
      href={`/shop/${bouquet.id}`}
      className="block overflow-hidden rounded-[28px] bg-paper shadow-[0_12px_40px_rgba(28,20,18,0.06)]"
    >
      <div className={compact ? "aspect-[4/3] overflow-hidden" : "aspect-[5/4] overflow-hidden"}>
        <img
          src={bouquet.imageUrl}
          alt={bouquet.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="space-y-1.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight">{bouquet.name}</h3>
          <p className="shrink-0 text-sm font-medium text-rose">{formatMoney(bouquet.priceEtb)}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{bouquet.description}</p>
        <p className="pt-1 text-xs tracking-wide text-gold">
          {t.common.today} · {bouquet.deliveryMinutesMin}–{bouquet.deliveryMinutesMax} min
        </p>
      </div>
    </Link>
  );
}
