"use client";

import { supabase, hasSupabase } from "@/lib/supabaseClient";

const LS_KEY = "fh_wait";
const BASE_AHEAD = 7; // seeded parties already waiting (demo mode)

// ── Quote formula ────────────────────────────────────────────
// No-rush baseline is 10 min, always +5 min buffer, then it grows with
// how many parties are already waiting (rush). We use average dining
// time per table (30 min for a 2-top, 45 for a 4-top) spread across the
// tables that turn over in parallel. Tweak TABLES to match the floor.
const TABLES = 6;
function diningTime(party) {
  return party <= 2 ? 30 : party <= 4 ? 45 : 60;
}
export function quoteWait(party, partiesAhead) {
  const base = 10;
  const buffer = 5;
  const rush = Math.round((partiesAhead * diningTime(party)) / TABLES);
  const minutes = base + buffer + rush;
  return Math.max(10, Math.round(minutes / 5) * 5); // round to nearest 5 min
}

function lsRead() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; }
}
function lsWrite(e) { if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(e)); }
function lsClear() { if (typeof window !== "undefined") localStorage.removeItem(LS_KEY); }

export async function getMyEntry() {
  if (!hasSupabase) {
    const e = lsRead();
    if (!e || e.status === "seated" || e.status === "left") return null;
    return e;
  }
  const saved = lsRead(); // we keep the id locally to find our row
  if (!saved?.id) return null;
  const { data } = await supabase.from("waitlist_entries").select("*").eq("id", saved.id).single();
  if (!data || data.status === "seated" || data.status === "left") return null;
  const { count } = await supabase
    .from("waitlist_entries")
    .select("*", { count: "exact", head: true })
    .eq("status", "waiting")
    .lt("created_at", data.created_at);
  return { ...data, quoted: data.quoted_min, pos: (count || 0) + 1 };
}

export async function joinWaitlist({ name, party, phone }) {
  const partiesAhead = await queueLength();
  const quoted = quoteWait(party, partiesAhead);

  if (!hasSupabase) {
    const entry = {
      id: "demo",
      name, party, phone, quoted,
      status: "waiting",
      pos: BASE_AHEAD + 1,
      created_at: new Date().toISOString(),
    };
    lsWrite(entry);
    return entry;
  }

  const { data, error } = await supabase
    .from("waitlist_entries")
    .insert({ name, party, phone, quoted_min: quoted, status: "waiting" })
    .select()
    .single();
  if (error) return { error: error.message };
  lsWrite({ id: data.id });
  return { ...data, quoted, pos: partiesAhead + 1 };
}

export async function leaveWaitlist() {
  const saved = lsRead();
  if (hasSupabase && saved?.id) {
    await supabase.from("waitlist_entries").update({ status: "left" }).eq("id", saved.id);
  }
  lsClear();
}

export async function queueLength() {
  if (!hasSupabase) return BASE_AHEAD;
  const { count } = await supabase
    .from("waitlist_entries")
    .select("*", { count: "exact", head: true })
    .eq("status", "waiting");
  return count || 0;
}
