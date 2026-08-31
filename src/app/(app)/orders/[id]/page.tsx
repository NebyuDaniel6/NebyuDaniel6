"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { formatTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import type { OrderStatus } from "@/domain/types";

const STEPS: OrderStatus[] = [
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="px-5 pt-16 text-muted">…</div>}>
      <OrderTrackingInner params={params} />
    </Suspense>
  );
}

function OrderTrackingInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const success = search.get("success") === "1";
  const [bloom, setBloom] = useState(success);
  const order = useAbebaStore((s) => s.orders.find((o) => o.id === id));
  const delivery = useAbebaStore((s) => s.deliveries.find((d) => d.orderId === id));
  const rider = useAbebaStore((s) => s.riders.find((r) => r.id === delivery?.riderId));
  const person = useAbebaStore((s) => s.people.find((p) => p.id === order?.personId));
  const markSurprise = useAbebaStore((s) => s.markSurprise);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setBloom(false), 2200);
    return () => clearTimeout(timer);
  }, [success]);

  if (!order) return <p className="p-8">{t.orders.empty}</p>;

  const stepIndex = STEPS.indexOf(order.status === "pending" ? "confirmed" : order.status);

  return (
    <div className="px-5 pb-10 pt-8">
      {bloom && (
        <div className="bloom mb-8 text-center">
          <p className="text-5xl">🌸</p>
          <p className="mt-3 font-display text-3xl">{t.checkout.confirmed}</p>
        </div>
      )}

      <p className="text-sm text-muted">{person?.name}</p>
      <h1 className="font-display text-3xl">{order.items[0]?.name}</h1>
      <p className="mt-1 text-rose">{t.orders.statuses[order.status]}</p>

      <ol className="mt-8 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span
              className={`mt-1 h-3 w-3 rounded-full ${index <= stepIndex ? "bg-rose" : "bg-line"}`}
            />
            <div>
              <p className={index <= stepIndex ? "font-medium" : "text-muted"}>
                {t.orders.statuses[step]}
              </p>
              {step === "out_for_delivery" && delivery?.estimatedArrival && index <= stepIndex && (
                <p className="text-sm text-muted">
                  {t.orders.eta}: {formatTime(delivery.estimatedArrival)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {rider && order.status === "out_for_delivery" && (
        <div className="mt-6 flex items-center gap-3 rounded-[24px] bg-paper p-4">
          <img src={rider.photoUrl} alt={rider.firstName} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-xs text-muted">{t.orders.rider}</p>
            <p className="font-medium">{rider.firstName}</p>
          </div>
        </div>
      )}

      {order.status === "delivered" && (
        <div className="mt-8 rounded-[24px] bg-paper p-5">
          <p className="text-3xl">🌸</p>
          <p className="mt-2 font-display text-2xl">{t.orders.deliveredAt}</p>
          <p className="text-muted">{formatTime(order.deliveredAt)}</p>
          <p className="mt-2 text-sm">{t.orders.hope}</p>
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={order.isSurprise}
              onChange={(e) => markSurprise(order.id, e.target.checked)}
            />
            <span>
              <span className="block font-medium">{t.delivery.surprise}</span>
              <span className="text-muted">{t.delivery.surpriseHint}</span>
            </span>
          </label>
        </div>
      )}

      <Button variant="ghost" className="mt-8 w-full" onClick={() => router.push("/home")}>
        {t.checkout.backHome}
      </Button>
    </div>
  );
}
