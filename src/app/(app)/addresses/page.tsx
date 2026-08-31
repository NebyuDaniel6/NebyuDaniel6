"use client";

import { useState } from "react";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { MAP_PLACES } from "@/domain/maps";
import { Button } from "@/components/ui/Button";

export default function AddressesPage() {
  const { t } = useI18n();
  const addresses = useAbebaStore((s) => s.addresses);
  const addAddress = useAbebaStore((s) => s.addAddress);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<(typeof MAP_PLACES)[number] | null>(null);
  const results = MAP_PLACES.filter((place) =>
    place.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="safe-bottom px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.addresses.title}</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.addresses.search}
        className="mt-5 w-full rounded-2xl bg-paper px-4 py-3 outline-none"
      />
      <div className="mt-3 space-y-2">
        {results.map((place) => (
          <button
            key={place.id}
            type="button"
            onClick={() => setPicked(place)}
            className={`w-full rounded-2xl px-4 py-3 text-left ${picked?.id === place.id ? "bg-ink text-cream" : "bg-paper"}`}
          >
            <p>{place.label}</p>
            <p className="text-xs opacity-70">{place.line1}</p>
          </button>
        ))}
      </div>
      {picked && (
        <Button
          className="mt-4 w-full"
          onClick={() => {
            addAddress({
              label: picked.label,
              line1: picked.line1,
              city: picked.city,
              region: picked.region,
              country: picked.country,
              lat: picked.lat,
              lng: picked.lng,
              placeId: picked.id,
              isDefault: addresses.length === 0,
            });
            setPicked(null);
            setQuery("");
          }}
        >
          {t.addresses.save}
        </Button>
      )}
      <div className="mt-8 space-y-3">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-[24px] bg-paper p-4">
            <p className="font-medium">{address.label}</p>
            <p className="text-sm text-muted">
              {address.line1}, {address.city}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
