"use client";

import Link from "next/link";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function RiderHomePage() {
  const { t } = useI18n();
  const orders = useAbebaStore((s) =>
    s.orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),
  );
  const people = useAbebaStore((s) => s.people);
  const addresses = useAbebaStore((s) => s.addresses);

  return (
    <div className="px-5 pt-8">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Rider</p>
      <h1 className="font-display text-4xl">{t.rider.title}</h1>
      <div className="mt-6 space-y-3">
        {orders.length === 0 ? (
          <p className="text-muted">{t.rider.empty}</p>
        ) : (
          orders.map((order) => {
            const person = people.find((p) => p.id === order.personId);
            const address = addresses.find((a) => a.id === order.addressId);
            return (
              <Link key={order.id} href={`/rider/delivery/${order.id}`} className="block rounded-[24px] bg-paper p-4">
                <p className="text-xs text-rose">{t.rider.newDelivery}</p>
                <p className="font-medium">{person?.name ?? "Recipient"}</p>
                <p className="text-sm text-muted">{address?.line1}</p>
                <p className="mt-1 text-sm">{order.items[0]?.name}</p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
