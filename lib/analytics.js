"use client";

import { supabase, hasSupabase } from "@/lib/supabaseClient";
import {
  DEMO_KPIS, DEMO_MEMBERS, DEMO_WAITLIST, DEMO_CAMPAIGNS, DEMO_INFLUENCERS,
} from "@/lib/demo";
import { tierForPoints } from "@/lib/menu";

export async function getMembers() {
  if (!hasSupabase) return DEMO_MEMBERS;
  const { data } = await supabase
    .from("loyalty_members")
    .select("name,email,points,visits,created_at")
    .order("points", { ascending: false })
    .limit(100);
  if (!data || !data.length) return DEMO_MEMBERS;
  return data.map((m) => ({ ...m, tier: tierForPoints(m.points).name, joined: m.created_at }));
}

export async function getWaitlist() {
  if (!hasSupabase) return DEMO_WAITLIST;
  const { data } = await supabase
    .from("waitlist_entries")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(100);
  if (!data || !data.length) return DEMO_WAITLIST;
  return data.map((e, i) => ({
    id: e.id,
    name: e.name,
    party: e.party,
    phone: e.phone,
    status: e.status,
    quoted: e.quoted_min,
    pos: e.status === "waiting" ? i + 1 : 0,
    joinedMin: Math.round((Date.now() - new Date(e.created_at).getTime()) / 60000),
  }));
}

// Persist a new manual order (array of row ids, top = first).
export async function saveWaitlistOrder(ids) {
  if (!hasSupabase) return;
  await Promise.all(
    ids.map((id, i) =>
      id ? supabase.from("waitlist_entries").update({ sort_order: i + 1 }).eq("id", id) : null
    )
  );
}

export async function getCampaigns() {
  if (!hasSupabase) return DEMO_CAMPAIGNS;
  const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (!data || !data.length) return DEMO_CAMPAIGNS;
  return data;
}

export async function saveCampaign(c) {
  if (!hasSupabase) return { ...c, id: "local-" + Date.now() };
  const { data } = await supabase.from("campaigns").insert(c).select().single();
  return data;
}

export async function getInfluencers() {
  if (!hasSupabase) return DEMO_INFLUENCERS;
  const { data } = await supabase.from("influencers").select("*").order("fit", { ascending: false });
  if (!data || !data.length) return DEMO_INFLUENCERS;
  return data;
}

export async function getKpis() {
  const k = { ...DEMO_KPIS };
  if (hasSupabase) {
    const [{ count: members }, { count: waitToday }] = await Promise.all([
      supabase.from("loyalty_members").select("*", { count: "exact", head: true }),
      supabase.from("waitlist_entries").select("*", { count: "exact", head: true }),
    ]);
    if (members) k.members = members;
    if (waitToday) k.waitlistToday = waitToday;
  }
  return k;
}
