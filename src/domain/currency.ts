import type { CurrencyCode } from "./types";

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  minorUnits: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  ETB: { code: "ETB", symbol: "ETB", locale: "en-ET", minorUnits: 0 },
  USD: { code: "USD", symbol: "$", locale: "en-US", minorUnits: 2 },
  KES: { code: "KES", symbol: "KES", locale: "en-KE", minorUnits: 0 },
  AED: { code: "AED", symbol: "AED", locale: "en-AE", minorUnits: 2 },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", minorUnits: 2 },
};

export const DEFAULT_CURRENCY: CurrencyCode = "ETB";

export function formatMoney(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  const config = CURRENCIES[currency];
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.minorUnits,
    maximumFractionDigits: config.minorUnits,
  }).format(amount);

  if (config.symbol === currency) {
    return `${formatted} ${currency}`;
  }
  return `${config.symbol}${formatted}`;
}

export function money(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): Money {
  return { amount, currency };
}
