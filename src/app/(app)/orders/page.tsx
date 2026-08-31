"use client";

import Link from "next/link";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { formatMoney, formatShortDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";

export default function OrdersPage() {
  const { t } = useI18n();
  const orders = useAbebaStore((s) => s.orders);
  const people = useAbebaStore((s) => s.people);
  const current = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const previous = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  return (
    <div className="safe-bottom px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.orders.title}</h1>
      {orders.length === 0 ? (
        <p className="py-16 text-center text-muted">{t.orders.empty}</p>
      ) : (
        <>
          {current.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">{t.orders.current}</h2>
              <div className="space-y-3">
                {current.map((order) => (
                  <OrderRow
                    key={order.id}
                    href={`/orders/${order.id}`}
                    title={people.find((p) => p.id === order.personId)?.name ?? order.items[0]?.name}
                    status={t.orders.statuses[order.status]}
                    meta={`${formatMoney(order.totalEtb)} · ${formatShortDate(order.createdAt)}`}
                  />
                ))}
              </div>
            </section>
          )}
          {previous.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">{t.orders.previous}</h2>
              <div className="space-y-3">
                {previous.map((order) => (
                  <OrderRow
                    key={order.id}
                    href={`/orders/${order.id}`}
                    title={people.find((p) => p.id === order.personId)?.name ?? order.items[0]?.name}
                    status={t.orders.statuses[order.status]}
                    meta={`${formatMoney(order.totalEtb)} · ${formatShortDate(order.createdAt)}`}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function OrderRow({
  href,
  title,
  status,
  meta,
}: {
  href: string;
  title: string;
  status: string;
  meta: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-4">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-rose">{status}</p>
        <p className="text-xs text-muted">{meta}</p>
      </Card>
    </Link>
  );
}
