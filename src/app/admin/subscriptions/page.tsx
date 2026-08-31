"use client";

import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";

export default function AdminSubscriptionsPage() {
  const { t } = useI18n();
  const subscriptions = useAbebaStore((s) => s.subscriptions);
  const people = useAbebaStore((s) => s.people);

  return (
    <div>
      <h1 className="font-display text-4xl">{t.admin.subscriptions}</h1>
      <div className="mt-6 space-y-3">
        {subscriptions.length === 0 ? (
          <p className="text-muted">{t.subscriptions.empty}</p>
        ) : (
          subscriptions.map((sub) => (
            <div key={sub.id} className="rounded-[24px] bg-paper p-4">
              <p className="font-medium">{people.find((p) => p.id === sub.personId)?.name}</p>
              <p className="text-sm text-muted">
                {t.subscriptions[sub.frequency]} · {formatMoney(sub.budgetEtb)} · {sub.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
