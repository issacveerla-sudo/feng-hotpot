-- ════════════════════════════════════════════════════════════════
-- Feng Hotpot — Supabase schema + seed data
-- Paste this whole file into: Supabase → SQL Editor → New query → Run
-- Safe to run more than once.
-- ════════════════════════════════════════════════════════════════

-- ── Loyalty members (1 row per auth user) ───────────────────────
create table if not exists public.loyalty_members (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  name       text,
  points     int  not null default 0,
  visits     int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.point_events (
  id         bigserial primary key,
  member_id  uuid references auth.users on delete cascade,
  amount     int,
  reason     text,
  created_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  id          bigserial primary key,
  member_id   uuid references auth.users on delete cascade,
  reward_id   text,
  reward_name text,
  points      int,
  created_at  timestamptz not null default now()
);

-- ── Waitlist ────────────────────────────────────────────────────
create table if not exists public.waitlist_entries (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  party      int,
  phone      text,
  quoted_min int,
  status     text not null default 'waiting',  -- waiting | notified | seated | left
  created_at timestamptz not null default now()
);

-- ── Marketing campaigns ─────────────────────────────────────────
create table if not exists public.campaigns (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  channel    text,
  audience   text,
  body       text,
  sent       int default 0,
  opened     int default 0,
  redeemed   int default 0,
  status     text default 'Draft',
  date       text,
  created_at timestamptz not null default now()
);

-- ── Influencer CRM ──────────────────────────────────────────────
create table if not exists public.influencers (
  id         uuid primary key default gen_random_uuid(),
  handle     text,
  name       text,
  platform   text,
  followers  int,
  niche      text,
  er         numeric,
  city       text,
  fit        int,
  status     text default 'new',   -- new | contacted | replied | partnered
  notes      text,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- NOTE: these policies are intentionally simple for a prototype.
-- Tighten the admin tables (campaigns/influencers/waitlist) before a
-- real public launch — see the README "Going to production" section.
-- ════════════════════════════════════════════════════════════════
alter table public.loyalty_members  enable row level security;
alter table public.point_events     enable row level security;
alter table public.redemptions      enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.campaigns        enable row level security;
alter table public.influencers      enable row level security;

-- Members manage only their own row
drop policy if exists "own member" on public.loyalty_members;
create policy "own member" on public.loyalty_members
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own points" on public.point_events;
create policy "own points" on public.point_events
  for all using (auth.uid() = member_id) with check (auth.uid() = member_id);

drop policy if exists "own redemptions" on public.redemptions;
create policy "own redemptions" on public.redemptions
  for all using (auth.uid() = member_id) with check (auth.uid() = member_id);

-- Waitlist: guests can join (insert) and read the queue; staff update status
drop policy if exists "waitlist read"   on public.waitlist_entries;
drop policy if exists "waitlist insert" on public.waitlist_entries;
drop policy if exists "waitlist update" on public.waitlist_entries;
create policy "waitlist read"   on public.waitlist_entries for select using (true);
create policy "waitlist insert" on public.waitlist_entries for insert with check (true);
create policy "waitlist update" on public.waitlist_entries for update using (true);

-- Campaigns + influencers: any signed-in user (owner dashboard) can read/write
drop policy if exists "campaigns auth" on public.campaigns;
create policy "campaigns auth" on public.campaigns
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "influencers auth" on public.influencers;
create policy "influencers auth" on public.influencers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════
-- Base role grants
-- RLS policies sit ON TOP of table privileges. Supabase usually grants
-- these to anon/authenticated automatically, but if the project's default
-- grants were ever revoked, new tables have no privilege for the policies
-- to gate — and every live query fails with "permission denied". These
-- statements restore the standard grants; the RLS policies above still
-- decide what each role may actually read or write.
-- ════════════════════════════════════════════════════════════════
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- Seed data (so the owner dashboard looks alive immediately)
-- ════════════════════════════════════════════════════════════════
insert into public.influencers (handle, name, platform, followers, niche, er, city, fit, status, notes) values
 ('@bayareaeats','Jenna Wu','Instagram',128000,'Bay Area food',4.8,'San Jose',94,'new','Posts hotpot & Sichuan often. High local overlap.'),
 ('@spicyszechuan','Leo Tran','TikTok',342000,'Spicy food challenges',7.1,'San Francisco',91,'new','Spice challenges = perfect for the mala pot.'),
 ('@siliconvalleyfoodie','Mei Zhang','Instagram',76000,'SV restaurants',5.6,'Sunnyvale',97,'new','Covers Sunnyvale directly. Top fit.'),
 ('@noodlenomad','Carlos Diaz','YouTube',210000,'Asian cuisine reviews',3.9,'Fremont',83,'new','Long-form reviews, loyal audience.'),
 ('@hotpotholic','Amy Sato','TikTok',95000,'Hotpot only',8.3,'Santa Clara',96,'new','Niche is literally hotpot. Huge ER.'),
 ('@foodiecouplesf','Dan & Rin','Instagram',154000,'Date-night dining',4.2,'San Francisco',79,'new','Great for couples / group dining angle.'),
 ('@collegeeatsSJSU','Tyler Brooks','TikTok',58000,'Student budget eats',9.1,'San Jose',74,'new','Student audience, budget combos.'),
 ('@themichelinwannabe','Olivia Park','Instagram',410000,'Fine dining',2.1,'San Francisco',58,'new','Big reach but low fit + low ER.')
on conflict do nothing;

insert into public.campaigns (name, channel, audience, sent, opened, redeemed, status, date) values
 ('Mala Mondays','SMS','All members',1284,712,143,'Sent','2025-11-03'),
 ('Wagyu Weekend Drop','Email','Blaze + Legend',274,198,61,'Sent','2025-11-07'),
 ('Win-back: 60 days away','SMS','Lapsed',206,88,22,'Sent','2025-11-12')
on conflict do nothing;

insert into public.waitlist_entries (name, party, phone, quoted_min, status) values
 ('Walk-in - Yang',4,'(408) 555-0112',35,'waiting'),
 ('Walk-in - Ortiz',2,'(408) 555-0190',25,'waiting'),
 ('Walk-in - Smith',6,'(408) 555-0145',50,'waiting')
on conflict do nothing;
