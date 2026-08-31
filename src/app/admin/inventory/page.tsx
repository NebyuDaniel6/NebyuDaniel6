"use client";

import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function InventoryPage() {
  const { t } = useI18n();
  const inventory = useAbebaStore((s) => s.inventory);
  const setStemCount = useAbebaStore((s) => s.setStemCount);

  return (
    <div>
      <h1 className="font-display text-4xl">{t.admin.inventory}</h1>
      <div className="mt-6 space-y-3">
        {inventory.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-[24px] bg-paper px-5 py-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted">Available: {item.stemCount} {item.unit}</p>
            </div>
            <input
              type="number"
              value={item.stemCount}
              onChange={(e) => setStemCount(item.id, Number(e.target.value))}
              className="w-24 rounded-xl bg-ivory px-3 py-2 text-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
