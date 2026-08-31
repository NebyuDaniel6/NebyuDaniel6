"use client";

import { useState } from "react";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { ORDER_STATUSES, type OrderStatus } from "@/domain/types";
import { formatMoney } from "@/lib/format";

export default function AdminOrdersPage() {
  const { t } = useI18n();
  const orders = useAbebaStore((s) => s.orders);
  const people = useAbebaStore((s) => s.people);
  const update = useAbebaStore((s) => s.updateOrderStatus);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const visible = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div>
      <h1 className="font-display text-4xl">{t.admin.orders}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} label={t.shop.all} />
        {ORDER_STATUSES.map((status) => (
          <Chip
            key={status}
            active={filter === status}
            onClick={() => setFilter(status)}
            label={t.orders.statuses[status]}
          />
        ))}
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2">ID</th>
              <th>Recipient</th>
              <th>Bouquet</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="py-3 font-mono text-xs">{order.id}</td>
                <td>{people.find((p) => p.id === order.personId)?.name ?? "—"}</td>
                <td>{order.items[0]?.name}</td>
                <td>{formatMoney(order.totalEtb)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => update(order.id, e.target.value as OrderStatus)}
                    className="rounded-xl bg-paper px-2 py-1"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t.orders.statuses[status]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-ink text-cream" : "bg-paper"}`}
    >
      {label}
    </button>
  );
}
