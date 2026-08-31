"use client";

import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function PaymentsPage() {
  const { t } = useI18n();
  const methods = useAbebaStore((s) => s.paymentMethods);

  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.profile.payments}</h1>
      <p className="mt-2 text-sm text-muted">
        Providers can be added without changing this screen. Telebirr, Chapa, cards, and future
        international rails share the same PaymentService.
      </p>
      <div className="mt-6 space-y-3">
        {methods.map((method) => (
          <div key={method.id} className="rounded-[24px] bg-paper px-4 py-4">
            <p className="font-medium">{method.label}</p>
            {method.isDefault && <p className="text-xs text-gold">Default</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
