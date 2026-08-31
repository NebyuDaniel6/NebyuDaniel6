"use client";

import { useState } from "react";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { formatMoney, slugify } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import type { Bouquet, FlowerType, InventoryStatus, Occasion } from "@/domain/types";
import { FLOWER_TYPES, SHOP_OCCASIONS } from "@/domain/types";

export default function AdminBouquetsPage() {
  const { t } = useI18n();
  const bouquets = useAbebaStore((s) => s.bouquets);
  const upsert = useAbebaStore((s) => s.upsertBouquet);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(1500);
  const [image, setImage] = useState("");
  const [type, setType] = useState<FlowerType>("roses");
  const [status, setStatus] = useState<InventoryStatus>("in_stock");

  function create() {
    if (!name.trim()) return;
    const bouquet: Bouquet = {
      id: crypto.randomUUID(),
      name: name.trim(),
      slug: slugify(name),
      description,
      priceEtb: price,
      flowerType: type,
      occasions: ["just_because"] as Occasion[],
      colors: ["pink"],
      imageUrl: image || "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&h=900&q=80",
      imageAlt: name,
      availableToday: true,
      deliveryMinutesMin: 60,
      deliveryMinutesMax: 90,
      inventoryStatus: status,
    };
    upsert(bouquet);
    setOpen(false);
    setName("");
    setDescription("");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">{t.admin.bouquets}</h1>
        <Button onClick={() => setOpen((v) => !v)}>{t.admin.createBouquet}</Button>
      </div>
      {open && (
        <div className="mt-6 grid gap-3 rounded-[24px] bg-paper p-5 md:grid-cols-2">
          <input className="rounded-xl bg-ivory px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded-xl bg-ivory px-3 py-2" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
          <textarea className="rounded-xl bg-ivory px-3 py-2 md:col-span-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="number" className="rounded-xl bg-ivory px-3 py-2" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          <select className="rounded-xl bg-ivory px-3 py-2" value={type} onChange={(e) => setType(e.target.value as FlowerType)}>
            {FLOWER_TYPES.map((item) => (
              <option key={item} value={item}>{t.flowers[item]}</option>
            ))}
          </select>
          <select className="rounded-xl bg-ivory px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as InventoryStatus)}>
            <option value="in_stock">In stock</option>
            <option value="low">Low</option>
            <option value="out">Out</option>
          </select>
          <Button onClick={create}>{t.common.save}</Button>
        </div>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {bouquets.map((bouquet) => (
          <div key={bouquet.id} className="overflow-hidden rounded-[24px] bg-paper">
            <img src={bouquet.imageUrl} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="flex justify-between">
                <h2 className="font-display text-xl">{bouquet.name}</h2>
                <p>{formatMoney(bouquet.priceEtb)}</p>
              </div>
              <p className="mt-1 text-sm text-muted">{bouquet.description}</p>
              <p className="mt-2 text-xs text-gold">
                {t.flowers[bouquet.flowerType]} · {bouquet.inventoryStatus} · {SHOP_OCCASIONS.filter((o) => bouquet.occasions.includes(o)).length} occasions
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
