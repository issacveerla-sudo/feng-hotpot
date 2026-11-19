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


-- ════════════════════════════════════════════════════════════════
-- v3 additions (menu, rewards, claim codes, waitlist ordering)
-- Identical to supabase/migration_v3.sql — included here so a FRESH
-- project gets everything from this one file.
-- ════════════════════════════════════════════════════════════════
-- ════════════════════════════════════════════════════════════════
-- Feng Hotpot — v3 migration
-- Adds: editable menu, editable rewards, Subway-style claim codes,
-- and manual waitlist ordering.
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to run more than once.
-- ════════════════════════════════════════════════════════════════

-- ── Menu items (editable from the owner dashboard) ──────────────
create table if not exists public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  name        text not null,
  description text,
  price       text,
  heat        int  default 0,
  tag         text,
  sort_order  int  default 0,
  available   boolean default true,
  created_at  timestamptz not null default now()
);

-- ── Rewards (editable point costs) ──────────────────────────────
create table if not exists public.rewards (
  id          text primary key,
  name        text not null,
  description text,
  points      int  not null,
  sort_order  int  default 0,
  active      boolean default true,
  created_at  timestamptz not null default now()
);

-- ── Claim codes (earn points in-store without ordering online) ──
create table if not exists public.claim_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  points     int  not null,
  note       text,
  used       boolean default false,
  used_by    uuid references auth.users on delete set null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ── Manual waitlist ordering ────────────────────────────────────
alter table public.waitlist_entries add column if not exists sort_order int;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════
alter table public.menu_items  enable row level security;
alter table public.rewards     enable row level security;
alter table public.claim_codes enable row level security;

-- Menu + rewards: everyone can read; signed-in owner can write
drop policy if exists "menu read"   on public.menu_items;
drop policy if exists "menu write"  on public.menu_items;
create policy "menu read"  on public.menu_items for select using (true);
create policy "menu write" on public.menu_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "rewards read"  on public.rewards;
drop policy if exists "rewards write" on public.rewards;
create policy "rewards read"  on public.rewards for select using (true);
create policy "rewards write" on public.rewards for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Claim codes: signed-in owner manages them (members claim via the RPC below)
drop policy if exists "codes auth" on public.claim_codes;
create policy "codes auth" on public.claim_codes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════
-- Secure claim: credits the signed-in member atomically.
-- SECURITY DEFINER lets a member redeem a code without being able to
-- read or edit the codes table directly.
-- ════════════════════════════════════════════════════════════════
create or replace function public.redeem_claim_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_rec  claim_codes;
begin
  if v_user is null then
    return json_build_object('ok', false, 'error', 'Please sign in first');
  end if;

  select * into v_rec from claim_codes
    where upper(code) = upper(trim(p_code)) for update;

  if not found then
    return json_build_object('ok', false, 'error', 'That code is not valid');
  end if;
  if v_rec.used then
    return json_build_object('ok', false, 'error', 'That code has already been used');
  end if;

  update claim_codes set used = true, used_by = v_user, used_at = now()
    where id = v_rec.id;
  update loyalty_members set points = points + v_rec.points
    where id = v_user;
  insert into point_events(member_id, amount, reason)
    values (v_user, v_rec.points, 'claim_code');

  return json_build_object('ok', true, 'points', v_rec.points);
end;
$$;

grant execute on function public.redeem_claim_code(text) to anon, authenticated;

-- Grants for the new tables (RLS still gatekeeps)
grant select, insert, update, delete
  on public.menu_items, public.rewards, public.claim_codes
  to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- Seed menu items (only if the table is empty)
-- ════════════════════════════════════════════════════════════════
do $$
begin
  if (select count(*) from public.menu_items) = 0 then
    insert into public.menu_items (category, name, description, price, heat, tag, sort_order) values
     ('Broth','Signature Red Oil Spicy Soup','House málà broth, numbing & fiery.','$16',3,'Legend',1),
     ('Broth','Tomato Sweet & Sour','Bright, comforting, kid-friendly.','$14',0,null,2),
     ('Broth','Mushroom Umami Broth','Slow-simmered wild mushrooms.','$15',0,null,3),
     ('Broth','Half & Half Yin-Yang Pot','Spicy + mild in one pot.','$18',2,'Popular',4),
     ('Special Meat Dishes','Premium Angus Beef','Thin-sliced, 10-second swish.','$18',0,'Chef''s pick',5),
     ('Special Meat Dishes','Lamb Shoulder Roll','Tender, fragrant, melts fast.','$16',0,null,6),
     ('Special Meat Dishes','Wagyu Short Rib','Rich marbling, limited daily.','$28',0,'Limited',7),
     ('Special Meat Dishes','Spicy Beef Tripe','Classic crunch for the brave.','$13',2,null,8),
     ('Handmade Dishes','Handmade Shrimp Paste','Spooned straight into the pot.','$15',1,'Fresh',9),
     ('Handmade Dishes','Fish Tofu','Bouncy, soaks up the broth.','$9',0,null,10),
     ('Handmade Dishes','Beef Meatballs','Springy, house-rolled.','$10',0,null,11),
     ('Handmade Dishes','Cuttlefish Balls','Ocean-sweet bite.','$11',0,null,12),
     ('Garden Vegetables','Napa Cabbage','Sweet, crisp, essential.','$7',0,null,13),
     ('Garden Vegetables','Lotus Root','Crunchy, holds the broth.','$8',0,null,14),
     ('Garden Vegetables','Enoki Mushrooms','Silky golden threads.','$7',0,null,15),
     ('Garden Vegetables','Baby Bok Choy','Tender and green.','$6',0,null,16),
     ('Chef''s Recommend','Signature Platter for Two','Beef, lamb, handmade bites, veg.','$52',2,'Best value',17),
     ('Chef''s Recommend','Spicy Duck Blood','Silky, authentic Chengdu classic.','$9',3,null,18),
     ('Chef''s Recommend','Crispy Pork Intestine','For the true hotpot heads.','$12',2,null,19),
     ('Others','Hand-Pulled Noodles','Made to order, chewy.','$6',0,null,20),
     ('Others','Sweet Rice Cake','Soft, soaks up flavor.','$6',0,null,21),
     ('Others','House Plum Juice','Sweet-tart, cools the heat.','$5',0,'Cool-down',22);
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════
-- Seed rewards (id is the primary key, so re-runs are safe)
-- ════════════════════════════════════════════════════════════════
insert into public.rewards (id, name, description, points, sort_order, active) values
 ('app','Free Appetizer','Fish tofu, meatballs, or greens on us.',200,1,true),
 ('broth','Free Premium Broth Upgrade','Upgrade to Yin-Yang or Wagyu broth.',350,2,true),
 ('beef','Free Angus Beef Plate','A plate of premium beef, free.',500,3,true),
 ('platter','$25 Off Signature Platter','Our best-value feast for two.',800,4,true),
 ('vip','VIP Skip-the-Line Pass','Jump the waitlist on your next visit.',1200,5,true)
on conflict (id) do nothing;

-- Backfill sort_order for any existing waitlist rows
update public.waitlist_entries set sort_order = extract(epoch from created_at)::int
  where sort_order is null;
