-- Abeba schema. Apply with the Supabase CLI.
-- Never expose the service-role key to a client.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin', 'rider');
create type public.locale_code as enum ('en', 'am');
create type public.date_type as enum ('birthday', 'anniversary', 'first_date', 'wedding', 'graduation', 'custom');
create type public.flower_type as enum ('roses', 'lilies', 'tulips', 'sunflowers', 'mixed', 'seasonal');
create type public.inventory_status as enum ('in_stock', 'low', 'out');
create type public.order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
create type public.delivery_type as enum ('send_now', 'today', 'scheduled');
create type public.subscription_frequency as enum ('weekly', 'biweekly', 'monthly');
create type public.subscription_status as enum ('active', 'paused', 'cancelled');
create type public.payment_provider as enum ('telebirr', 'chapa', 'card', 'international');
create type public.payment_status as enum ('pending', 'processing', 'succeeded', 'failed', 'refunded');
create type public.notification_type as enum ('important_date', 'order_update', 'delivery_update', 'subscription', 'promotional');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  preferred_language public.locale_code not null default 'en',
  favorite_flowers public.flower_type[] not null default '{}',
  favorite_colors text[] not null default '{}',
  typical_budget_etb integer,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  relationship text,
  emoji text,
  favorite_flowers public.flower_type[] not null default '{}',
  favorite_colors text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  person_id uuid references public.people (id) on delete set null,
  label text,
  line1 text not null,
  line2 text,
  city text not null,
  region text,
  country text not null default 'Ethiopia',
  lat double precision,
  lng double precision,
  place_id text,
  instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people
  add column address_id uuid references public.addresses (id) on delete set null;

create table public.important_dates (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  date_type public.date_type not null,
  custom_label text,
  month smallint not null check (month between 1 and 12),
  day smallint not null check (day between 1 and 31),
  year smallint,
  repeats_annually boolean not null default true,
  reminder_offsets smallint[] not null default '{7}',
  created_at timestamptz not null default now()
);

create table public.bouquets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null,
  price_etb integer not null check (price_etb > 0),
  flower_type public.flower_type not null,
  occasions text[] not null default '{}',
  colors text[] not null default '{}',
  available_today boolean not null default true,
  delivery_minutes_min integer not null default 60,
  delivery_minutes_max integer not null default 90,
  inventory_status public.inventory_status not null default 'in_stock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bouquet_images (
  id uuid primary key default gen_random_uuid(),
  bouquet_id uuid not null references public.bouquets (id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0
);

create table public.flower_inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stem_count integer not null default 0,
  unit text not null default 'stems',
  color text,
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  person_id uuid references public.people (id),
  address_id uuid not null references public.addresses (id),
  message text,
  is_surprise boolean not null default false,
  delivery_type public.delivery_type not null default 'send_now',
  scheduled_for date,
  delivery_window text,
  status public.order_status not null default 'pending',
  flowers_total_etb integer not null,
  delivery_fee_etb integer not null default 80,
  total_etb integer not null,
  currency text not null default 'ETB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  bouquet_id uuid not null references public.bouquets (id),
  name_snapshot text not null,
  quantity integer not null default 1,
  unit_price_etb integer not null
);

create table public.riders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  first_name text not null,
  photo_url text,
  is_available boolean not null default true,
  vehicle_type text not null default 'scooter',
  created_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  rider_id uuid references public.riders (id),
  status public.order_status not null default 'confirmed',
  estimated_arrival timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  confirmation_photo_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  person_id uuid not null references public.people (id),
  address_id uuid not null references public.addresses (id),
  frequency public.subscription_frequency not null,
  budget_etb integer not null,
  flower_preference text,
  delivery_day smallint not null,
  surprise_me boolean not null default false,
  status public.subscription_status not null default 'active',
  next_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid primary key references public.users (id) on delete cascade,
  important_dates boolean not null default true,
  order_updates boolean not null default true,
  delivery_updates boolean not null default true,
  subscription_reminders boolean not null default true,
  promotional boolean not null default false
);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  provider public.payment_provider not null,
  provider_ref text not null,
  amount_etb integer not null,
  currency text not null default 'ETB',
  status public.payment_status not null default 'pending',
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.people enable row level security;
alter table public.important_dates enable row level security;
alter table public.addresses enable row level security;
alter table public.bouquets enable row level security;
alter table public.bouquet_images enable row level security;
alter table public.flower_inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.deliveries enable row level security;
alter table public.riders enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.payment_transactions enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_rider()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'rider'
  );
$$;

create policy "users read self" on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy "users update self" on public.users
  for update using (id = auth.uid());

create policy "people own" on public.people
  for all using (user_id = auth.uid() or public.is_admin());
create policy "dates own" on public.important_dates
  for all using (user_id = auth.uid() or public.is_admin());
create policy "addresses own" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin());

create policy "bouquets public read" on public.bouquets
  for select using (true);
create policy "bouquets admin write" on public.bouquets
  for all using (public.is_admin());
create policy "bouquet images public read" on public.bouquet_images
  for select using (true);
create policy "inventory admin" on public.flower_inventory
  for all using (public.is_admin());
create policy "inventory read staff" on public.flower_inventory
  for select using (public.is_admin() or public.is_rider());

create policy "orders own" on public.orders
  for select using (user_id = auth.uid() or public.is_admin() or public.is_rider());
create policy "orders insert own" on public.orders
  for insert with check (user_id = auth.uid());
create policy "orders staff update" on public.orders
  for update using (public.is_admin() or public.is_rider());

create policy "order items via order" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin() or public.is_rider()))
  );

create policy "deliveries staff" on public.deliveries
  for all using (public.is_admin() or public.is_rider());
create policy "deliveries read owner" on public.deliveries
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "riders self" on public.riders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "subscriptions own" on public.subscriptions
  for all using (user_id = auth.uid() or public.is_admin());
create policy "notifications own" on public.notifications
  for all using (user_id = auth.uid() or public.is_admin());
create policy "prefs own" on public.notification_preferences
  for all using (user_id = auth.uid());

create policy "payments owner read" on public.payment_transactions
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

revoke insert, update, delete on public.payment_transactions from anon, authenticated;
grant select on public.payment_transactions to authenticated;
grant insert, update on public.payment_transactions to service_role;
