"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { FLOWER_TYPES, type FlowerType, type SubscriptionFrequency } from "@/domain/types";
import { formatMoney } from "@/lib/format";

export default function SubscriptionsPage() {
  const { t } = useI18n();
  const people = useAbebaStore((s) => s.people);
  const addresses = useAbebaStore((s) => s.addresses);
  const subscriptions = useAbebaStore((s) => s.subscriptions);
  const addSubscription = useAbebaStore((s) => s.addSubscription);
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("monthly");
  const [budget, setBudget] = useState(1800);
  const [pref, setPref] = useState<FlowerType | "surprise">("surprise");
  const [day, setDay] = useState(6);
  const [surprise, setSurprise] = useState(true);

  return (
    <div className="safe-bottom px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.subscriptions.title}</h1>
      <p className="mt-1 text-muted">{t.subscriptions.subtitle}</p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {(["weekly", "biweekly", "monthly"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFrequency(item)}
            className={`rounded-2xl py-3 text-sm ${frequency === item ? "bg-ink text-cream" : "bg-paper"}`}
          >
            {t.subscriptions[item]}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-sm">
        <span className="text-muted">{t.subscriptions.recipient}</span>
        <select
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          className="mt-2 w-full rounded-2xl bg-paper px-4 py-3"
        >
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm">
        <span className="text-muted">{t.subscriptions.budget}</span>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-2 w-full rounded-2xl bg-paper px-4 py-3"
        />
      </label>

      <div className="mt-4">
        <p className="text-sm text-muted">{t.subscriptions.preference}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setPref("surprise");
              setSurprise(true);
            }}
            className={`rounded-full px-3 py-1.5 text-sm ${pref === "surprise" ? "bg-ink text-cream" : "bg-paper"}`}
          >
            {t.subscriptions.surprise}
          </button>
          {FLOWER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setPref(type);
                setSurprise(false);
              }}
              className={`rounded-full px-3 py-1.5 text-sm ${pref === type ? "bg-ink text-cream" : "bg-paper"}`}
            >
              {t.flowers[type]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{t.subscriptions.surpriseHint}</p>
      </div>

      <label className="mt-4 block text-sm">
        <span className="text-muted">{t.subscriptions.day}</span>
        <input
          type="number"
          min={1}
          max={28}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="mt-2 w-full rounded-2xl bg-paper px-4 py-3"
        />
      </label>

      <Button
        className="mt-6 w-full"
        onClick={() => {
          const person = people.find((p) => p.id === personId);
          addSubscription({
            personId,
            addressId: person?.addressId ?? addresses[0]?.id ?? "",
            frequency,
            budgetEtb: budget,
            flowerPreference: pref,
            deliveryDay: day,
            surpriseMe: surprise,
            nextDeliveryDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
          });
        }}
      >
        {t.subscriptions.start}
      </Button>

      <div className="mt-8 space-y-3">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted">{t.subscriptions.empty}</p>
        ) : (
          subscriptions.map((sub) => (
            <div key={sub.id} className="rounded-[24px] bg-paper p-4">
              <p className="font-medium">{people.find((p) => p.id === sub.personId)?.name}</p>
              <p className="text-sm text-muted">
                {t.subscriptions[sub.frequency]} · {formatMoney(sub.budgetEtb)} · {t.subscriptions.next}{" "}
                {sub.nextDeliveryDate}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
