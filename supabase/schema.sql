-- Capo Clicks Photography — database schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "uuid-ossp";

-- Frame sizes & prices (editable from admin dashboard)
create table if not exists frame_sizes (
  id text primary key,
  label text not null,
  price integer not null,
  is_active boolean default true
);

-- Fixed photography packages (editable from admin dashboard)
create table if not exists packages (
  id text primary key,
  name text not null,
  price integer not null,
  badge text,
  includes text[] not null default '{}',
  is_active boolean default true
);

-- Quote-based services
create table if not exists quote_services (
  id text primary key,
  name text not null,
  description text,
  starting_price integer,
  is_active boolean default true
);

-- Orders (frames, collage frames, and photography bookings all live here,
-- differentiated by `order_type`)
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_code text unique not null, -- human readable e.g. CC-10457
  order_type text not null check (order_type in ('frame', 'collage_frame', 'photoshoot')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  item_summary jsonb not null default '{}', -- size, package id, uploaded image urls, notes, etc.
  status text not null default 'order_placed',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  total_amount integer not null,
  delivery_method text check (delivery_method in ('pickup', 'delivery')),
  delivery_address text,
  estimated_completion_date date,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_order_code on orders (order_code);
create index if not exists idx_orders_phone on orders (customer_phone);

-- Bookings for photography services (linked to orders for the deposit payment)
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders (id),
  service_id text, -- package id or quote_services id
  event_date date,
  event_location text,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security.
-- This app always reads/writes `orders` through the server using the
-- SUPABASE_SERVICE_ROLE_KEY (see lib/supabase.ts), which bypasses RLS
-- entirely — the browser never talks to this table directly with the
-- anon key. So the correct policy here is: no policies at all. With RLS
-- enabled and zero policies, any request using the public anon key is
-- denied by default, which is exactly what we want — customers can only
-- get their order data through /api/orders/[id], which enforces the
-- order_code + phone match in application code.
alter table orders enable row level security;

-- Seed data (matches lib/data.ts)
insert into frame_sizes (id, label, price) values
  ('6x4', '6 x 4 in', 149),
  ('7x5', '7 x 5 in', 199),
  ('9x6', '9 x 6 in', 299),
  ('10x8', '10 x 8 in', 349),
  ('12x8-a4', '12 x 8 in (A4)', 399),
  ('10x15', '10 x 15 in', 549),
  ('16x12-a3', '16 x 12 in (A3)', 749),
  ('12x18', '12 x 18 in', 799),
  ('16x20', '16 x 20 in', 1299),
  ('16x24', '16 x 24 in', 1499),
  ('18x24', '18 x 24 in', 1799),
  ('20x30', '20 x 30 in', 2249),
  ('24x36', '24 x 36 in', 3499),
  ('30x40', '30 x 40 in', 4199),
  ('30x48', '30 x 48 in', 5199),
  ('36x60', '36 x 60 in', 6299)
on conflict (id) do nothing;

insert into packages (id, name, price, badge, includes) values
  ('baby-shoot-special', 'Baby Shoot Special Offer', 11999, 'Limited slots available',
    array['30-page premium album', '2 photo frames', '10 edited photos', 'Cinematic reels', '1 wall calendar (12x18 inch)']),
  ('reception-photography', 'Reception Photography Package', 18800, 'Limited booking slots available',
    array['Traditional photography', 'Premium album — 1 no.', 'Family photo frame — 1 no.', 'Unlimited soft copies', 'Free e-invitation design', 'Complimentary pre-wedding / post-wedding shoot']),
  ('reception-photo-video', 'Reception Photography & Videography Package', 28800, 'Limited booking slots available',
    array['Traditional photography', 'Traditional videography', 'Premium album — 1 no. (40 pages)', 'Traditional long video', '64 GB pen drive', 'Family photo frame — 1 no.', 'Unlimited soft copies', 'Free e-invitation design', 'Complimentary pre-wedding / post-wedding shoot'])
on conflict (id) do nothing;

insert into quote_services (id, name, description) values
  ('wedding', 'Wedding Photography', 'Full-day wedding coverage, custom quotes based on events and locations.'),
  ('birthday-events', 'Birthday & Events', 'Birthdays, anniversaries, and celebrations of any size.'),
  ('outdoor', 'Outdoor Shoots', 'Location shoots — portraits, couples, pre-wedding.'),
  ('cinematic-reels', 'Cinematic Reels', 'Standalone cinematic video reels for any occasion.'),
  ('album-design', 'Album Design', 'Custom album layout and design service.'),
  ('photo-editing', 'Photo Editing', 'Professional retouching and color grading.'),
  ('flex-editing', 'Flex Editing', 'Large-format flex/banner design and editing.')
on conflict (id) do nothing;

-- Storage bucket for customer-uploaded photos (frames + collage orders).
-- Storage buckets can't be created via plain SQL in every Supabase version —
-- create this from the dashboard instead: Storage → New bucket → name it
-- "order-uploads" → set it to Public (so getPublicUrl() works for the
-- printed images), or private + signed URLs if you'd rather keep uploads
-- non-public.

-- Gallery — real portfolio photos managed from /admin, replacing the
-- hardcoded placeholder tiles in app/gallery/page.tsx.
create table if not exists gallery_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  image_url text not null,
  created_at timestamptz default now()
);

alter table gallery_items enable row level security;

-- Gallery images are meant to be publicly visible on the website, so (unlike
-- orders) anon SELECT is intentionally allowed here. Writes still only ever
-- happen through /api/admin/gallery using the service role key.
create policy "gallery_public_read"
  on gallery_items for select
  using (true);

-- Storage bucket for gallery photos.
-- Create from the dashboard: Storage → New bucket → name it "gallery" →
-- set it to Public (portfolio photos are meant to be publicly visible).
