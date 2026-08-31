"use client";

import { use } from "react";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/Button";

export default function RiderDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();
  const order = useAbebaStore((s) => s.orders.find((o) => o.id === id));
  const person = useAbebaStore((s) => s.people.find((p) => p.id === order?.personId));
  const address = useAbebaStore((s) => s.addresses.find((a) => a.id === order?.addressId));
  const riderAdvance = useAbebaStore((s) => s.riderAdvance);

  if (!order) return <p className="p-8">{t.rider.empty}</p>;

  const maps = address
    ? `https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`
    : "#";

  return (
    <div className="px-5 pt-8">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{t.rider.newDelivery}</p>
      <h1 className="mt-2 font-display text-4xl">{person?.name ?? "Recipient"}</h1>
      <p className="mt-3 text-muted">
        {address?.line1}, {address?.city}
      </p>
      <p className="mt-4 font-medium">{order.items[0]?.name}</p>
      {address?.instructions && (
        <p className="mt-3 rounded-2xl bg-paper p-4 text-sm">
          <span className="block text-muted">{t.rider.instructions}</span>
          {address.instructions}
        </p>
      )}

      <div className="mt-8 space-y-3">
        <Button className="w-full" onClick={() => riderAdvance(order.id, "ready")}>
          {t.rider.accept}
        </Button>
        <a href={maps} target="_blank" rel="noreferrer" className="block">
          <Button variant="soft" className="w-full">
            {t.rider.navigate}
          </Button>
        </a>
        <Button variant="dark" className="w-full" onClick={() => riderAdvance(order.id, "out_for_delivery")}>
          {t.rider.pickedUp}
        </Button>
        <Button
          className="w-full"
          onClick={() =>
            riderAdvance(
              order.id,
              "delivered",
              "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=60",
            )
          }
        >
          {t.rider.delivered}
        </Button>
        <p className="text-center text-xs text-muted">{t.rider.upload}</p>
      </div>
    </div>
  );
}
