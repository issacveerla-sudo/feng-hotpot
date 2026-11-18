# 🔥 Feng Hotpot — Website + Loyalty + Waitlist + Owner Dashboard

A full prototype for **Feng Hotpot** (冯校长老火锅, Sunnyvale):

- **Customer site** — landing page ("Taste the Legend at Feng Hotpot"), menu, loyalty signup, virtual waitlist with hotpot mini-games.
- **Loyalty program** — points, tiers (Spark → Ember → Blaze → Legend), rewards you can redeem.
- **Waitlist + games** — join from your phone, watch your spot live, play *Catch the Ingredients*, *Spice Trivia* and *Memory Match* to earn points while you wait.
- **Owner dashboard** (`/admin`) — analytics, waitlist & loyalty reports, a marketing campaign composer, and an **influencer CRM with a discovery agent** that finds, scores and drafts outreach to creators.

Built with **Next.js + Tailwind + Supabase**, ready to deploy on **Vercel**.

> 💡 **Important:** the app works on **seeded demo data out of the box**, even with no database connected. So your Vercel URL looks great the moment it deploys. Connect Supabase (Part A below) to make it store real signups, waitlist entries, and campaigns.

---

## 🚀 The 3-step version (what you actually have to do)

1. **Create a Supabase project** and run one SQL file → *Part A*
2. **Push this folder to GitHub** and **import it into Vercel** → *Part B*
3. **Paste 2 keys** into Vercel's settings → done.

Total time: ~15 minutes. Detailed walkthrough below.

---

## Part A — Set up Supabase (the free database)

1. Go to **https://supabase.com** → sign up (free) → **New project**.
   - Give it a name (e.g. `feng-hotpot`), set a database password (save it somewhere), pick a region near California, and create it. Wait ~2 min for it to spin up.

2. In the left sidebar open **SQL Editor** → **New query**.
   - Open the file **`supabase/schema.sql`** from this project, copy **everything**, paste it in, and click **Run**.
   - This creates all the tables, security rules, and some demo data. You should see "Success".

3. Get your two keys. Left sidebar → **Project Settings** (gear) → **API**:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Keep this tab open — you'll paste these into Vercel in Part B.

4. **Turn off email confirmation** (so loyalty signups work instantly for the demo).
   - Left sidebar → **Authentication** → **Sign In / Providers** (or **Providers → Email**) → turn **"Confirm email" OFF** → Save.
   - *(For a real launch you'd leave this on; it's just so your pitch demo doesn't make people check their inbox.)*

5. **Create your owner login** for the dashboard.
   - Left sidebar → **Authentication** → **Users** → **Add user** → enter the owner's email + a password.
   - Make sure that same email is in the `NEXT_PUBLIC_ADMIN_EMAILS` variable (Part B). Only allow-listed emails can open `/admin`.

✅ That's the database done.

---

## Part B — Deploy to Vercel

### Option 1 — GitHub + Vercel (recommended, no terminal needed)

1. **Put this project on GitHub.**
   - Easiest: at **https://github.com/new** create a repo (e.g. `feng-hotpot`).
   - On the new repo page click **"uploading an existing file"** and drag in **all the files in this folder** *except* the `node_modules` and `.next` folders (you don't need those — they rebuild automatically).

2. **Import into Vercel.**
   - Go to **https://vercel.com** → sign up with your GitHub account → **Add New… → Project** → pick your `feng-hotpot` repo → **Import**.
   - Vercel auto-detects Next.js. Don't change the build settings.

3. **Add your environment variables** (still on the import screen, under **Environment Variables**). Add these four:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | *(your Project URL from Part A)* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your anon public key from Part A)* |
   | `NEXT_PUBLIC_ADMIN_EMAILS` | *(owner email, e.g. `owner@fenghotpot.com`)* |
   | `NEXT_PUBLIC_ORDER_URL` | *(your Uber Eats / online-order link)* |

   **Optional — real SMS waitlist texts** (leave blank to keep texts simulated). These are **server-side**, so do **not** add the `NEXT_PUBLIC_` prefix:

   | Name | Value |
   |---|---|
   | `TWILIO_ACCOUNT_SID` | *(from twilio.com/console)* |
   | `TWILIO_AUTH_TOKEN` | *(from twilio.com/console)* |
   | `TWILIO_FROM` | *(your Twilio phone number, e.g. `+14085550123`)* |

4. Click **Deploy**. In ~1 minute you'll get a live URL like `feng-hotpot.vercel.app`. 🎉

> If you add or change env variables later: Vercel → your project → **Settings → Environment Variables**, then **Deployments → … → Redeploy**.

### Option 2 — Vercel CLI (if you prefer the terminal)

```bash
npm install -g vercel     # one-time
cd feng-hotpot
vercel                    # follow the prompts, links the project
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_ADMIN_EMAILS
vercel env add NEXT_PUBLIC_ORDER_URL
vercel --prod             # deploy to production
```

---

## Run it locally (optional)

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase values (or leave blank for demo mode)
npm run dev                         # open http://localhost:3000
```

---

## Getting into the owner dashboard

- Go to **`/admin`** on your site → you'll be sent to the login.
- Sign in with the owner email (must be in `NEXT_PUBLIC_ADMIN_EMAILS`) and the password you set in Supabase → Authentication → Users.
- **Demo mode (no Supabase connected):** sign in with the allow-listed email and *any* password.

---

## What's real vs. simulated (so you can speak to it in the pitch)

| Feature | In this prototype |
|---|---|
| Loyalty signup / login / points / redemptions | **Real** (Supabase Auth + database) |
| Waitlist join / position / status | **Real** (stored in Supabase) |
| Mini-games earning points | **Real** (points added to your member) |
| Analytics charts | Live counts where available, **seeded demo trends** for the rich history |
| Campaign "send" (SMS/Email) | **Simulated** — saves the campaign; hook up Twilio / a mail provider to actually send |
| Influencer discovery agent | **Simulated** — scripted "agent" + seeded, scored creators + auto-drafted emails |

### Wiring the simulated parts to real services later
- **SMS/email campaigns:** add a Twilio (SMS) or Resend/SendGrid (email) API route and call it from `app/admin/campaigns/page.jsx` where it currently simulates the send.
- **Influencer agent → real data:** the drafting lives in `lib/demo.js` (`draftOutreachEmail`) and the flow in `app/admin/influencers/page.jsx`. Swap the seeded list for a real creator-discovery source and route sends through your email tool. (Your setup already has connectors like Apollo and Gmail available for exactly this.)

---

## Going to production (security note)

For speed, the database security rules (in `supabase/schema.sql`) are **permissive** — e.g. the campaign and influencer tables are readable by any signed-in user, and the waitlist is open so guests can join. Before a real public launch:
- Restrict `campaigns` / `influencers` to owner accounts (e.g. an `admins` table + policies that check it).
- Lock down `waitlist_entries` updates to staff only.
- Turn email confirmation back **on**.

---

## Customizing it

- **Menu** → `lib/menu.js` (dishes, prices, rewards, tiers).
- **Brand colors** → `tailwind.config.js` (`ember`, `chili`, `flame`, `gold`, `cream`).
- **Hero** → `components/HeroBowl.jsx`. To use a real photo, drop an image at `public/hero.jpg` and replace the bowl markup with `<img src="/hero.jpg" />`.
- **Trivia questions / game ingredients** → `lib/games.js`.
- **Owner emails** → `NEXT_PUBLIC_ADMIN_EMAILS` env var.

---

## Project structure

```
feng-hotpot/
├─ app/
│  ├─ page.jsx              Landing page (hero, menu preview, loyalty + waitlist teasers)
│  ├─ menu/                 Full menu
│  ├─ loyalty/              Signup / login + member dashboard
│  ├─ waitlist/             Join waitlist + live status + games
│  └─ admin/                Owner dashboard (gated)
│     ├─ page.jsx           Analytics overview
│     ├─ waitlist/          Live queue report
│     ├─ loyalty/           Members & tiers report
│     ├─ campaigns/         Marketing composer + history
│     └─ influencers/       Influencer CRM + discovery agent
├─ components/              Nav, footer, hero, games, charts
├─ lib/                     Supabase client, data loaders, demo seed, game content
├─ supabase/schema.sql      ← paste into Supabase SQL editor
└─ .env.local.example       ← copy to .env.local
```

Taste the legend. 🌶️
