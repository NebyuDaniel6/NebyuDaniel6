"use client";

import { createContext, useContext, useMemo } from "react";
import { am } from "./am";
import { en, type Messages } from "./en";
import type { Locale } from "@/domain/types";
import { useAbebaStore } from "@/data/store";

const dictionaries: Record<Locale, Messages> = { en, am };

const I18nContext = createContext<{
  locale: Locale;
  t: Messages;
  interpolate: (template: string, values: Record<string, string | number>) => string;
}>({
  locale: "en",
  t: en,
  interpolate: (template) => template,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useAbebaStore((s) => s.locale);
  const value = useMemo(() => {
    return {
      locale,
      t: dictionaries[locale],
      interpolate: (template: string, values: Record<string, string | number>) =>
        template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? "")),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
