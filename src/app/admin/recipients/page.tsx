"use client";

import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function RecipientsPage() {
  const { t } = useI18n();
  const people = useAbebaStore((s) => s.people);
  const addresses = useAbebaStore((s) => s.addresses);

  return (
    <div>
      <h1 className="font-display text-4xl">{t.admin.recipients}</h1>
      <div className="mt-6 space-y-3">
        {people.map((person) => {
          const address = addresses.find((a) => a.id === person.addressId);
          return (
            <div key={person.id} className="rounded-[24px] bg-paper p-4">
              <p className="font-medium">
                {person.emoji} {person.name} · {person.relationship}
              </p>
              <p className="text-sm text-muted">{address ? `${address.line1}, ${address.city}` : "No address"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
