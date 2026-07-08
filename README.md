# Capo Clicks Photography — Website

Full-stack Next.js site for a photo studio + custom framing business.
Works locally with zero setup (using seed data in `lib/data.ts`); connect
Supabase and Razorpay to go live with real payments and persisted orders.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres) for orders/bookings — optional until you add keys
- Razorpay Checkout for payments — optional until you add keys

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3000. The site runs fully in "demo mode" without any
environment variables — cart/checkout will still create an order code and
route you to the tracking page, it just won't persist to a real database or
take real payment until you add Supabase + Razorpay keys.

## Connecting Supabase

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql` from this repo.
3. Go to Storage → New bucket → create one named `order-uploads`, set to
   Public (needed so printed photo URLs work) — this is what makes the
   photo upload on the Frames and Collage Frames pages actually store the
   image instead of just recording the file name.
4. Copy your Project URL, anon key, and service role key into `.env.local`.
5. Restart the dev server.

Order tracking, order creation, image uploads, and the admin dashboard will
now read/write real data.

## Connecting Razorpay

1. Sign up at razorpay.com and complete KYC.
2. Get your Key ID and Key Secret (test mode first) from Settings → API Keys.
3. Add them to `.env.local` as `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` /
   `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
4. For production, add a webhook in the Razorpay dashboard pointing to
   `https://yourdomain.com/api/webhooks/razorpay`, subscribed to
   `payment.captured` and `payment.failed`, and put its signing secret in
   `RAZORPAY_WEBHOOK_SECRET`.

## Admin dashboard

Visit `/admin` — you'll be redirected to `/admin/login`. Set `ADMIN_PASSWORD`
in your environment variables first; that's the password you'll use to log
in. This is a simple cookie-based gate, good enough for a single-owner
studio — swap in Supabase Auth with roles if you need multiple admin users.

## Editing prices and packages

Right now frame sizes, packages, and quote-based services live in
`lib/data.ts`. Edit that file and redeploy to change pricing quickly. The
Supabase schema (`supabase/schema.sql`) already has matching tables
(`frame_sizes`, `packages`, `quote_services`) if you want to move pricing
into the database and build an edit UI in `/admin` later — the data shapes
already match.

## Deploying

See the separate deployment guide for buying a domain, deploying to Vercel,
and connecting everything end to end.

## Project structure

```
app/
  page.tsx                 Home
  services/                Fixed packages + quote-based services
  frames/                  Frame price list + order flow
  collage-frames/          Custom collage frame order flow
  booking/                 Photography booking form
  cart/                    Cart + checkout (Razorpay)
  track/                   Guest order tracking
  gallery/                 Portfolio
  contact/, about/         Static pages
  admin/, admin/login/     Admin dashboard (password protected)
  api/orders/              Order creation + lookup
  api/webhooks/razorpay/   Payment webhook
  api/admin-login/         Admin auth cookie
components/                Nav, Footer, Cart context, Frame ledger UI
lib/                       Seed data, Supabase client, Razorpay client
supabase/schema.sql        Database schema + seed data
```
