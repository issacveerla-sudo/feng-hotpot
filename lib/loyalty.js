"use client";

import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { tierForPoints } from "@/lib/menu";

// Local-demo storage key (used when Supabase isn't configured)
const LS_KEY = "fh_member";

function lsRead() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
}
function lsWrite(m) {
  if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(m));
}
function lsClear() {
  if (typeof window !== "undefined") localStorage.removeItem(LS_KEY);
}

// ── Current member ───────────────────────────────────────────
export async function loadMember() {
  if (!hasSupabase) return lsRead();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("loyalty_members")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!data) {
    // auth user exists but no member row yet — create one
    const row = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split("@")[0],
      points: 0,
      visits: 0,
    };
    await supabase.from("loyalty_members").insert(row);
    return { ...row, tier: tierForPoints(0).name };
  }
  return { ...data, tier: tierForPoints(data.points).name };
}

// ── Auth ─────────────────────────────────────────────────────
export async function signUp({ name, email, password }) {
  if (!hasSupabase) {
    const m = { email, name, points: 50, visits: 1, tier: tierForPoints(50).name, demo: true };
    lsWrite(m);
    return { member: m };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) return { error: error.message };
  const user = data.user;
  if (user) {
    await supabase.from("loyalty_members").upsert({
      id: user.id,
      email,
      name,
      points: 50,
      visits: 1,
    });
  }
  if (!data.session) {
    return { needsConfirm: true };
  }
  return { member: await loadMember() };
}

export async function signIn({ email, password }) {
  if (!hasSupabase) {
    const existing = lsRead();
    const m = existing && existing.email === email
      ? existing
      : { email, name: email.split("@")[0], points: 50, visits: 1, tier: tierForPoints(50).name, demo: true };
    lsWrite(m);
    return { member: m };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { member: await loadMember() };
}

export async function signOut() {
  if (!hasSupabase) return lsClear();
  await supabase.auth.signOut();
}

// ── Points ───────────────────────────────────────────────────
export async function addPoints(amount, reason = "activity") {
  if (!hasSupabase) {
    const m = lsRead();
    if (!m) return null;
    m.points = (m.points || 0) + amount;
    m.tier = tierForPoints(m.points).name;
    lsWrite(m);
    return m;
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("loyalty_members")
    .select("points")
    .eq("id", user.id)
    .single();
  const next = (data?.points || 0) + amount;
  await supabase.from("loyalty_members").update({ points: next }).eq("id", user.id);
  await supabase.from("point_events").insert({
    member_id: user.id,
    amount,
    reason,
  });
  return { points: next, tier: tierForPoints(next).name };
}

export async function redeemReward(reward) {
  const m = await loadMember();
  if (!m) return { error: "Not signed in" };
  if (m.points < reward.points) return { error: "Not enough points yet" };
  await addPoints(-reward.points, `redeem:${reward.id}`);
  if (hasSupabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("redemptions").insert({
        member_id: user.id,
        reward_id: reward.id,
        reward_name: reward.name,
        points: reward.points,
      });
    }
  }
  return { ok: true };
}
