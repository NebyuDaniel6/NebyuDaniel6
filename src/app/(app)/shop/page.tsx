"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { BouquetCard } from "@/components/customer/BouquetCard";
import { recommendBouquets } from "@/domain/recommendations";
import {
  FLOWER_TYPES,
  PRICE_BANDS,
  SHOP_OCCASIONS,
  type FlowerType,
  type Occasion,
} from "@/domain/types";
import { Button } from "@/components/ui/Button";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="px-5 pt-16 text-muted">…</div>}>
      <ShopInner />
    </Suspense>
  );
}

function ShopInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const bouquets = useAbebaStore((s) => s.bouquets);
  const people = useAbebaStore((s) => s.people);
  const [occasion, setOccasion] = useState<Occasion | "all">(
    (params.get("occasion") as Occasion) || "all",
  );
  const [flower, setFlower] = useState<FlowerType | "all">("all");
  const [band, setBand] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");

  const person = people.find((p) => p.id === params.get("person"));

  const recommended = useMemo(() => {
    if (!asked && !person) return [];
    return recommendBouquets(bouquets, {
      query: asked || undefined,
      person,
      occasion: occasion === "all" ? undefined : occasion,
      budgetEtb: person ? 2000 : undefined,
    });
  }, [asked, person, bouquets, occasion]);

  const filtered = bouquets.filter((bouquet) => {
    if (bouquet.inventoryStatus === "out") return false;
    if (occasion !== "all" && !bouquet.occasions.includes(occasion)) return false;
    if (flower !== "all" && bouquet.flowerType !== flower) return false;
    if (band !== "all") {
      const range = PRICE_BANDS.find((item) => item.id === band);
      if (range && (bouquet.priceEtb < range.min || bouquet.priceEtb > range.max)) {
        return false;
      }
    }
    if (query && !`${bouquet.name} ${bouquet.description}`.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    return true;
  });

  const chips = recommended
    .map((item) => bouquets.find((b) => b.id === item.bouquetId))
    .filter(Boolean);

  return (
    <div className="safe-bottom px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.shop.title}</h1>
      <p className="mt-1 text-sm text-muted">{t.shop.subtitle}</p>

      <form
        className="mt-5 rounded-[24px] bg-paper p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setAsked(query);
        }}
      >
        <p className="mb-2 text-sm font-medium">{t.shop.ask}</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.shop.askPlaceholder}
          className="w-full rounded-2xl bg-ivory px-4 py-3 text-sm outline-none"
        />
        <Button type="submit" className="mt-3 w-full">
          {t.shop.askCta}
        </Button>
      </form>

      <FilterRow
        label={t.shop.occasions}
        value={occasion}
        onChange={(v) => setOccasion(v as Occasion | "all")}
        options={[
          { id: "all", label: t.shop.all },
          ...SHOP_OCCASIONS.map((id) => ({ id, label: `${t.occasionEmoji[id]} ${t.occasions[id]}` })),
        ]}
      />
      <FilterRow
        label={t.shop.flowerTypes}
        value={flower}
        onChange={(v) => setFlower(v as FlowerType | "all")}
        options={[
          { id: "all", label: t.shop.all },
          ...FLOWER_TYPES.map((id) => ({ id, label: t.flowers[id] })),
        ]}
      />
      <FilterRow
        label={t.shop.price}
        value={band}
        onChange={setBand}
        options={[
          { id: "all", label: t.shop.all },
          ...PRICE_BANDS.map((item) => ({ id: item.id, label: t.priceBands[item.id] })),
        ]}
      />

      {chips.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-display text-2xl">{t.shop.weThink}</h2>
          {chips.map((bouquet) =>
            bouquet ? (
              <div key={bouquet.id}>
                <p className="mb-2 text-xs text-gold">
                  {recommended.find((r) => r.bouquetId === bouquet.id)?.reason}
                </p>
                <BouquetCard bouquet={bouquet} />
              </div>
            ) : null,
          )}
        </section>
      )}

      <div className="mt-8 space-y-4">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted">{t.shop.empty}</p>
        ) : (
          filtered.map((bouquet) => <BouquetCard key={bouquet.id} bouquet={bouquet} />)
        )}
      </div>
    </div>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; label: string }>;
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm ${
              value === option.id ? "bg-ink text-cream" : "bg-paper text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
