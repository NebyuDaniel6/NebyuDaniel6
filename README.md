# አበባ — Abeba

A flower-delivery app. Think of someone. Send them flowers.

Abeba is a dedicated florist product — not a general gift marketplace. V1 is flowers only: curated bouquets, saved people, important-date reminders, one-tap repeat orders, same-day and scheduled delivery, subscriptions, and live tracking.

## Surfaces

- **Customer app** (`/home`) — mobile-first, Android-first, structured so iOS can ship later via Capacitor
- **Admin** (`/admin`) — orders, bouquets, inventory, customers, recipients, riders, subscriptions, upcoming demand
- **Rider** (`/rider`) — accept, navigate, pick up, deliver, confirmation photo
- **Demo mode** works without credentials. Connect Supabase when you are ready.

## The loop

Add a person → add a date → get a reminder → see recommended flowers → one-tap send → delivery → she loved them.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind v4
- Domain logic in `src/domain` (recommendations, currency, payments, maps, dates)
- Localization in `src/i18n` (English + Amharic)
- Supabase schema + RLS in `supabase/migrations`
- PaymentService abstraction: Telebirr, Chapa, Card, future international
- Maps abstraction: neighborhood search now, Google Maps when a key is present
- FCM-shaped notification adapter (server-side only)

## Local

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Send flowers** — Nebyu, Sara’s birthday in 6 days, shop, checkout
- **Admin** — demand, orders, inventory
- **Rider** — assigned deliveries

Copy `.env.example` and fill Supabase / Maps / FCM / payment keys for production. Never put a service-role key in `NEXT_PUBLIC_*`.

## Native

`capacitor.config.ts` is ready. The customer UI is a phone shell; wrap `out` / the Next host when you cut Android and iOS binaries. Recommendation, payment, and currency code stay platform-agnostic.

## Brand

Warm ivory, deep rose, restrained gold. Large type, generous space, real flower photography. Ethiopian-rooted, internationally quiet.
