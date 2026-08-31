"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { DATE_TYPES, FLOWER_TYPES, type DateType, type FlowerType, type ReminderOffset } from "@/domain/types";
import { REMINDER_OFFSETS } from "@/domain/types";

const EMOJIS = ["❤️", "👩", "👧", "👨", "🧑", "💐"];

export default function NewPersonPage() {
  const { t } = useI18n();
  const router = useRouter();
  const addPerson = useAbebaStore((s) => s.addPerson);
  const addDate = useAbebaStore((s) => s.addDate);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Friend");
  const [emoji, setEmoji] = useState("❤️");
  const [flowers, setFlowers] = useState<FlowerType[]>([]);
  const [colors, setColors] = useState("");
  const [dateType, setDateType] = useState<DateType>("birthday");
  const [month, setMonth] = useState(3);
  const [day, setDay] = useState(14);
  const [offset, setOffset] = useState<ReminderOffset>(7);

  function save() {
    if (!name.trim()) return;
    const personId = addPerson({
      name: name.trim(),
      relationship,
      emoji,
      favoriteFlowers: flowers,
      favoriteColors: colors
        .split(/[/,]/)
        .map((c) => c.trim())
        .filter(Boolean),
    });
    addDate({
      personId,
      type: dateType,
      month,
      day,
      repeatsAnnually: true,
      reminderOffsets: [offset],
    });
    router.push(`/people/${personId}`);
  }

  return (
    <div className="px-5 pb-10 pt-8">
      <h1 className="font-display text-[34px]">{t.people.add}</h1>
      <div className="mt-6 space-y-5">
        <Field label={t.people.name}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.people.namePlaceholder}
            className="w-full rounded-2xl bg-paper px-4 py-3 outline-none"
          />
        </Field>
        <Field label={t.people.relationship}>
          <input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full rounded-2xl bg-paper px-4 py-3 outline-none"
          />
        </Field>
        <div className="flex gap-2">
          {EMOJIS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setEmoji(item)}
              className={`grid h-11 w-11 place-items-center rounded-full ${emoji === item ? "bg-blush" : "bg-paper"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div>
          <p className="mb-2 text-sm text-muted">{t.people.favoriteFlowers}</p>
          <div className="flex flex-wrap gap-2">
            {FLOWER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFlowers((current) =>
                    current.includes(type) ? current.filter((f) => f !== type) : [...current, type],
                  )
                }
                className={`rounded-full px-3 py-1.5 text-sm ${flowers.includes(type) ? "bg-ink text-cream" : "bg-paper"}`}
              >
                {t.flowers[type]}
              </button>
            ))}
          </div>
        </div>
        <Field label={t.people.favoriteColors}>
          <input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="Pink / White"
            className="w-full rounded-2xl bg-paper px-4 py-3 outline-none"
          />
        </Field>
        <Field label={t.people.addDate}>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={dateType}
              onChange={(e) => setDateType(e.target.value as DateType)}
              className="rounded-2xl bg-paper px-3 py-3"
            >
              {DATE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t.dates[type]}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-2xl bg-paper px-3 py-3"
              />
              <input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="rounded-2xl bg-paper px-3 py-3"
              />
            </div>
          </div>
        </Field>
        <div>
          <p className="mb-2 text-sm text-muted">{t.people.reminder}</p>
          <div className="flex flex-wrap gap-2">
            {REMINDER_OFFSETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOffset(item)}
                className={`rounded-full px-3 py-1.5 text-sm ${offset === item ? "bg-ink text-cream" : "bg-paper"}`}
              >
                {t.dates.offsets[item]}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full" onClick={save}>
          {t.people.save}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
