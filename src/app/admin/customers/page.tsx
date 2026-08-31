"use client";

import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function CustomersPage() {
  const { t } = useI18n();
  const session = useAbebaStore((s) => s.session);
  const orders = useAbebaStore((s) => s.orders);

  return (
    <div>
      <h1 className="font-display text-4xl">{t.admin.customers}</h1>
      <div className="mt-6 rounded-[24px] bg-paper p-5">
        <p className="font-display text-2xl">{session?.fullName}</p>
        <p className="text-sm text-muted">{session?.email}</p>
        <p className="mt-2 text-sm">{orders.length} orders</p>
      </div>
    </div>
  );
}
