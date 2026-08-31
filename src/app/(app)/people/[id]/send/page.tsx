"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { recommendForPerson } from "@/domain/recommendations";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export default function OneTapSendPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, interpolate } = useI18n();
  const router = useRouter();
  const person = useAbebaStore((s) => s.people.find((p) => p.id === id));
  const session = useAbebaStore((s) => s.session);
  const bouquets = useAbebaStore((s) => s.bouquets);
  const setCheckout = useAbebaStore((s) => s.setCheckout);

  if (!person) return null;

  const picks = recommendForPerson(bouquets, person, session?.typicalBudgetEtb);
  const bouquet = bouquets.find((b) => b.id === picks[0]?.bouquetId) ?? bouquets[0];

  function sendNow() {
    if (!bouquet || !person) return;
    setCheckout({
      bouquetId: bouquet.id,
      personId: person.id,
      addressId: person.addressId,
      message: "",
      deliveryType: "send_now",
      isSurprise: false,
      paymentProvider: "telebirr",
    });
    router.push("/checkout");
  }

  return (
    <div className="px-5 pb-10 pt-8">
      <p className="text-sm text-muted">{person.relationship}</p>
      <h1 className="font-display text-4xl">{person.name}</h1>
      <p className="mt-2 text-muted">{interpolate(t.oneTap.recommended, { name: person.name })}</p>

      {bouquet && (
        <div className="mt-6 overflow-hidden rounded-[28px] bg-paper">
          <img src={bouquet.imageUrl} alt={bouquet.imageAlt} className="h-64 w-full object-cover" />
          <div className="space-y-1 p-5">
            <h2 className="font-display text-2xl">{bouquet.name}</h2>
            <p className="text-sm text-muted">{picks[0]?.reason}</p>
            <p className="text-rose">{formatMoney(bouquet.priceEtb)}</p>
            <p className="text-xs text-gold">
              {t.common.today} · {bouquet.deliveryMinutesMin}–{bouquet.deliveryMinutesMax} min
            </p>
          </div>
        </div>
      )}

      <Button className="mt-6 w-full" onClick={sendNow}>
        {t.oneTap.sendNow}
      </Button>
      <button
        type="button"
        className="mt-3 w-full py-3 text-sm text-muted"
        onClick={() => router.push(`/shop?person=${person.id}`)}
      >
        {t.oneTap.change}
      </button>
    </div>
  );
}
