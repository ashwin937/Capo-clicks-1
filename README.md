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
4. Also create a bucket named `site-content` (private is fine — it's only
   ever read/written through server routes using the service key, never
   fetched directly by the browser). This stores the homepage offer banner
   and footer tagline strip as a single JSON file — no database table
   involved, so `supabase/schema.sql` doesn't need to change for this.
5. Copy your Project URL, anon key, and service role key into `.env.local`.
6. Restart the dev server.

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

## Database backups (download + Telegram)

From `/admin` you can:

- **Download DB Backup** — instantly downloads a `.sql` file with `INSERT`
  statements for every row in every table (frame_sizes, packages,
  quote_services, orders, bookings, gallery_items). Data-only, not a schema
  dump — restore onto a database that already has `supabase/schema.sql`
  applied.
- **Send Backup to Telegram Now** — sends that same file straight to a
  Telegram chat via a bot, so you get an on-demand copy in your pocket.

### One-time Telegram setup

1. **Create the bot** — message [@BotFather](https://t.me/BotFather) on
   Telegram, send `/newbot`, follow the prompts. It'll give you a token like
   `123456789:AAExampleTokenxxxxxxxxxxxxxxxxxxxxx`. Put that in
   `TELEGRAM_BOT_TOKEN`.
2. **Get your chat ID** — send any message to your new bot first (bots can't
   message you until you've messaged them), then open in a browser:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`. Find
   `"chat":{"id":...}` in the response — that number is `TELEGRAM_CHAT_ID`.
   (Works the same for a group chat: add the bot to the group, send a
   message there, and read the group's chat id instead — group ids are
   negative numbers.)
3. **Set `CRON_SECRET`** — any long random string, e.g.
   `openssl rand -hex 32`. This stops randoms from hitting the cron endpoint
   directly.
4. Add all three (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `CRON_SECRET`)
   to your Vercel project's environment variables and redeploy.

### Automatic periodic backups

`vercel.json` defines a Vercel Cron Job that hits
`/api/cron/telegram-backup` once a day at 2:30 AM IST and pushes the backup
file to your Telegram chat automatically — no server or extra hosting
needed, Vercel's own scheduler triggers it. Change the `schedule` field
(standard cron syntax, in UTC) if you want a different time or frequency.
Cron Jobs run automatically once the project is deployed on Vercel; they
don't run in local dev.

> Note: Vercel's free (Hobby) plan limits cron jobs to once a day. If you're
> on Hobby and want more frequent backups, either upgrade to Pro or trigger
> `/api/cron/telegram-backup` from a free external scheduler (e.g.
> cron-job.org) that sends the same `Authorization: Bearer <CRON_SECRET>`
> header.

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
