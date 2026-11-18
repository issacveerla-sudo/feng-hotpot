"use client";

import { supabase, hasSupabase } from "@/lib/supabaseClient";

const LS_KEY = "fh_wait";
const BASE_AHEAD = 7; // seeded parties already waiting (demo mode)

function lsRead() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; }
}
function lsWrite(e) { if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(e)); }
function lsClear() { if (typeof window !== "undefined") localStorage.removeItem(LS_KEY); }

export async function getMyEntry() {
  if (!hasSupabase) return lsRead();
  const saved = lsRead(); // we store the id locally to find our row
  if (!saved?.id) return null;
  const { data } = await supabase.from("waitlist_entries").select("*").eq("id", saved.id).single();
  if (!data || data.status === "seated") return null;
  // recompute position
  const { count } = await supabase
    .from("waitlist_entries")
    .select("*", { count: "exact", head: true })
    .eq("status", "waiting")
    .lt("created_at", data.created_at);
  return { ...data, pos: (count || 0) + 1 };
}

export async function joinWaitlist({ name, party, phone }) {
  const quoted = Math.max(10, party * 8 + 6); // rough quote in minutes
  if (!hasSupabase) {
    const pos = BASE_AHEAD + 1;
    const entry = { id: "demo", name, party, phone, quoted, status: "waiting", pos, created_at: new Date().toISOString() };
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
  const { count } = await supabase
    .from("waitlist_entries")
    .select("*", { count: "exact", head: true })
    .eq("status", "waiting");
  return { ...data, quoted, pos: count || 1 };
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
