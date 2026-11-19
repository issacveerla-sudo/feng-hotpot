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
