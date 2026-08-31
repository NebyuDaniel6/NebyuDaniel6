"use client";

import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function AdminDeliveryPage() {
  const { t } = useI18n();
  const orders = useAbebaStore((s) => s.orders.filter((o) => o.status !== "cancelled"));
  const deliveries = useAbebaStore((s) => s.deliveries);
  const riders = useAbebaStore((s) => s.riders);
  const assign = useAbebaStore((s) => s.assignRider);
  const update = useAbebaStore((s) => s.updateOrderStatus);

  return (
    <div>
      <h1 className="font-display text-4xl">{t.admin.delivery}</h1>
      <div className="mt-6 space-y-3">
        {orders.map((order) => {
          const delivery = deliveries.find((d) => d.orderId === order.id);
          return (
            <div key={order.id} className="rounded-[24px] bg-paper p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{order.items[0]?.name}</p>
                  <p className="text-sm text-muted">{t.orders.statuses[order.status]}</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={delivery?.riderId ?? ""}
                    onChange={(e) => assign(order.id, e.target.value)}
                    className="rounded-xl bg-ivory px-3 py-2 text-sm"
                  >
                    <option value="">{t.admin.assign}</option>
                    {riders.map((rider) => (
                      <option key={rider.id} value={rider.id}>
                        {rider.firstName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="rounded-full bg-ink px-3 py-2 text-sm text-cream"
                    onClick={() => update(order.id, "out_for_delivery")}
                  >
                    {t.orders.statuses.out_for_delivery}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
