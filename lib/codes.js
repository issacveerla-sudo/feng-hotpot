"use client";

import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { addPoints } from "@/lib/loyalty";

// Demo-mode codes (used when Supabase isn't connected).
const DEMO_CODES = { HOTPOT50: 50, WELCOME100: 100, MALA25: 25 };
const DEMO_USED_KEY = "fh_used_codes";

function demoUsed() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DEMO_USED_KEY) || "[]"); } catch { return []; }
}
function demoMarkUsed(code) {
  if (typeof window === "undefined") return;
  const u = demoUsed();
  u.push(code);
  localStorage.setItem(DEMO_USED_KEY, JSON.stringify(u));
}

// ── Member: claim a code for points ──────────────────────────
export async function claimCode(raw) {
  const code = String(raw || "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code" };

  if (!hasSupabase) {
    const pts = DEMO_CODES[code];
    if (!pts) return { ok: false, error: "That code is not valid" };
    if (demoUsed().includes(code)) return { ok: false, error: "That code has already been used" };
    const m = await addPoints(pts, "claim_code");
    if (!m) return { ok: false, error: "Please sign in first" };
    demoMarkUsed(code);
    return { ok: true, points: pts };
  }

  const { data, error } = await supabase.rpc("redeem_claim_code", { p_code: code });
  if (error) return { ok: false, error: error.message };
  return data; // { ok, points } or { ok:false, error }
}

// ── Admin: generate a batch of single-use codes ──────────────
function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let s = "FH-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function generateCodes(count, points, note) {
  const n = Math.max(1, Math.min(100, Number(count) || 1));
  const pts = Number(points) || 0;
  const rows = Array.from({ length: n }, () => ({ code: randomCode(), points: pts, note: note || null }));

  if (!hasSupabase) return rows.map((r) => ({ ...r, used: false, created_at: new Date().toISOString() }));

  const { data, error } = await supabase.from("claim_codes").insert(rows).select();
  if (error) return { error: error.message };
  return data;
}

export async function listCodes() {
  if (!hasSupabase) {
    return Object.entries(DEMO_CODES).map(([code, points]) => ({
      code, points, used: demoUsed().includes(code), note: "demo code", created_at: new Date().toISOString(),
    }));
  }
  const { data } = await supabase
    .from("claim_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}
