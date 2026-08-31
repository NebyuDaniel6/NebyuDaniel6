"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { PAYMENT_PROVIDERS } from "@/domain/payments";
import { Button } from "@/components/ui/Button";
import type { CheckoutDraft, DeliveryType, PaymentProviderId } from "@/domain/types";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="px-5 pt-16 text-muted">…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const stored = useAbebaStore((s) => s.checkout);
  const setCheckout = useAbebaStore((s) => s.setCheckout);
  const placeOrder = useAbebaStore((s) => s.placeOrder);
  const bouquets = useAbebaStore((s) => s.bouquets);
  const people = useAbebaStore((s) => s.people);
  const addresses = useAbebaStore((s) => s.addresses);

  const draft: CheckoutDraft | null = useMemo(() => {
    const bouquetId = params.get("bouquet") ?? stored?.bouquetId;
    if (!bouquetId) return stored;
    return {
      bouquetId,
      personId: params.get("person") ?? stored?.personId,
      addressId: stored?.addressId,
      message: params.get("message") ?? stored?.message ?? "",
      deliveryType: stored?.deliveryType ?? "send_now",
      scheduledFor: stored?.scheduledFor,
      deliveryWindow: stored?.deliveryWindow,
      isSurprise: stored?.isSurprise ?? false,
      paymentProvider: stored?.paymentProvider ?? "telebirr",
    };
  }, [params, stored]);

  useEffect(() => {
    if (draft && draft.bouquetId !== stored?.bouquetId) {
      setCheckout(draft);
    }
  }, [draft, stored?.bouquetId, setCheckout]);

  const checkout = draft;
  const bouquet = bouquets.find((b) => b.id === checkout?.bouquetId);
  const person = people.find((p) => p.id === checkout?.personId);
  const address =
    addresses.find((a) => a.id === checkout?.addressId) ??
    addresses.find((a) => a.personId === checkout?.personId) ??
    addresses[0];

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checkoutRef = useRef(checkout);
  checkoutRef.current = checkout;

  async function pay() {
    const current = checkoutRef.current;
    if (!current) {
      setError("Nothing to send.");
      return;
    }
    setCheckout(current);
    setBusy(true);
    setError("");
    try {
      const order = await placeOrder();
      window.location.assign(`/orders/${order.id}?success=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be verified.");
    } finally {
      setBusy(false);
    }
  }

  if (!checkout || !bouquet) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-muted">{t.shop.empty}</p>
        <Button className="mt-4" onClick={() => router.push("/shop")}>
          {t.shop.title}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 pb-10 pt-8">
      <h1 className="font-display text-[34px]">{t.checkout.title}</h1>
      <div className="mt-6 space-y-3 text-sm">
        <Row label={t.checkout.recipient} value={person?.name ?? "—"} />
        <Row label={t.checkout.bouquet} value={`${bouquet.name} · ${formatMoney(bouquet.priceEtb)}`} />
        <Row label={t.checkout.message} value={checkout.message || "—"} />
        <Row label={t.checkout.address} value={address ? `${address.line1}, ${address.city}` : "—"} />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm text-muted">{t.checkout.time}</p>
        <div className="grid grid-cols-3 gap-2">
          {(["send_now", "today", "scheduled"] as DeliveryType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setCheckout({
                  ...checkout,
                  deliveryType: type,
                  scheduledFor: type === "scheduled" ? checkout.scheduledFor ?? "2026-09-06" : undefined,
                  deliveryWindow: type === "today" ? "16:00–18:00" : checkout.deliveryWindow,
                })
              }
              className={`rounded-2xl px-3 py-3 text-sm ${
                checkout.deliveryType === type ? "bg-ink text-cream" : "bg-paper"
              }`}
            >
              {type === "send_now" ? t.delivery.sendNow : type === "today" ? t.delivery.today : t.delivery.schedule}
            </button>
          ))}
        </div>
        {checkout.deliveryType === "scheduled" && (
          <input
            type="date"
            className="mt-3 w-full rounded-2xl bg-paper px-4 py-3"
            value={checkout.scheduledFor ?? "2026-09-06"}
            onChange={(e) => setCheckout({ ...checkout, scheduledFor: e.target.value })}
          />
        )}
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-2xl bg-paper p-4 text-sm">
        <input
          type="checkbox"
          checked={checkout.isSurprise}
          onChange={(e) => setCheckout({ ...checkout, isSurprise: e.target.checked })}
        />
        <span>
          <span className="block font-medium">{t.delivery.surprise}</span>
          <span className="text-muted">{t.delivery.surpriseHint}</span>
        </span>
      </label>

      <div className="mt-6">
        <p className="mb-2 text-sm text-muted">{t.checkout.payment}</p>
        <div className="space-y-2">
          {PAYMENT_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() =>
                setCheckout({ ...checkout, paymentProvider: provider.id as PaymentProviderId })
              }
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left ${
                checkout.paymentProvider === provider.id ? "bg-ink text-cream" : "bg-paper"
              }`}
            >
              <span>{provider.name}</span>
              <span className="text-xs opacity-70">{provider.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2 rounded-[24px] bg-paper p-4 text-sm">
        <div className="flex justify-between">
          <span>{t.checkout.flowers}</span>
          <span>{formatMoney(bouquet.priceEtb)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t.checkout.deliveryFee}</span>
          <span>{formatMoney(80)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-2 font-medium">
          <span>{t.checkout.total}</span>
          <span>{formatMoney(bouquet.priceEtb + 80)}</span>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose">{error}</p>}
      <div className="h-24" />
      <div className="sticky bottom-0 -mx-5 bg-cream/95 px-5 py-4 backdrop-blur">
        <Button id="pay-and-send" className="w-full" disabled={busy} type="button" onClick={() => void pay()}>
          {busy ? "…" : t.checkout.pay}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl bg-paper px-4 py-3">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
