"use client";

import { useI18n } from "@/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.legal.privacyTitle}</h1>
      <p className="mt-4 leading-relaxed text-muted">{t.legal.privacy}</p>
    </div>
  );
}
