"use client";

import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { MENU, REWARDS } from "@/lib/menu";

// Category blurbs (items live in the DB; these short lines stay in code).
export const CATEGORY_BLURBS = {
  Broth: "Pick your base — the soul of the pot.",
  "Special Meat Dishes": "Hand-cut, marbled, made for the boil.",
  "Handmade Dishes": "Made in-house, every morning.",
  "Garden Vegetables": "Fresh greens to balance the fire.",
  "Chef's Recommend": "Don't leave without these.",
  Others: "Noodles, sides & cool-downs.",
};

// ── Menu (grouped by category, in sort order) ────────────────
export async function getMenu({ includeUnavailable = false } = {}) {
  if (!hasSupabase) return MENU;
  let q = supabase.from("menu_items").select("*").order("sort_order", { ascending: true });
  if (!includeUnavailable) q = q.eq("available", true);
  const { data } = await q;
  if (!data || !data.length) return MENU;

  const groups = [];
  const index = {};
  for (const it of data) {
    if (!(it.category in index)) {
      index[it.category] = groups.length;
      groups.push({ category: it.category, blurb: CATEGORY_BLURBS[it.category] || "", items: [] });
    }
    groups[index[it.category]].items.push({
      id: it.id,
      name: it.name,
      desc: it.description,
      price: it.price,
      heat: it.heat,
      tag: it.tag,
      available: it.available,
      sort_order: it.sort_order,
    });
  }
  return groups;
}

// Flat list for the admin editor
export async function getMenuItems() {
  if (!hasSupabase) {
    // flatten static menu into editable-looking rows
    let n = 0;
    return MENU.flatMap((c) =>
      c.items.map((it) => ({
        id: `demo-${n++}`,
        category: c.category,
        name: it.name,
        description: it.desc,
        price: it.price,
        heat: it.heat || 0,
        tag: it.tag || "",
        available: true,
        sort_order: n,
      }))
    );
  }
  const { data } = await supabase.from("menu_items").select("*").order("sort_order", { ascending: true });
  return data || [];
}

export async function saveMenuItem(item) {
  if (!hasSupabase) return { ...item };
  const row = {
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    heat: Number(item.heat) || 0,
    tag: item.tag || null,
    available: item.available !== false,
    sort_order: item.sort_order ?? 0,
  };
  if (item.id && !String(item.id).startsWith("demo-")) {
    const { data } = await supabase.from("menu_items").update(row).eq("id", item.id).select().single();
    return data;
  }
  const { data } = await supabase.from("menu_items").insert(row).select().single();
  return data;
}

export async function deleteMenuItem(id) {
  if (!hasSupabase) return;
  await supabase.from("menu_items").delete().eq("id", id);
}

// ── Rewards ──────────────────────────────────────────────────
export async function getRewards({ activeOnly = true } = {}) {
  if (!hasSupabase) return REWARDS;
  let q = supabase.from("rewards").select("*").order("sort_order", { ascending: true });
  if (activeOnly) q = q.eq("active", true);
  const { data } = await q;
  if (!data || !data.length) return REWARDS;
  return data;
}

export async function saveReward(reward) {
  if (!hasSupabase) return { ...reward };
  const row = {
    id: reward.id,
    name: reward.name,
    description: reward.description,
    points: Number(reward.points) || 0,
    sort_order: reward.sort_order ?? 0,
    active: reward.active !== false,
  };
  const { data } = await supabase.from("rewards").upsert(row).select().single();
  return data;
}
