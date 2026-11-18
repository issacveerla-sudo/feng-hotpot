import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// `hasSupabase` tells the app whether real credentials are present.
// When false, the whole prototype falls back to seeded demo data so the
// Vercel deployment looks great before you finish wiring up Supabase.
export const hasSupabase = Boolean(url && anonKey);

// Only create a client when configured — createClient throws on empty values.
export const supabase = hasSupabase
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "owner@fenghotpot.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const ORDER_URL =
  process.env.NEXT_PUBLIC_ORDER_URL ||
  "https://www.ubereats.com/store/feng-hotpot-%E5%86%AF%E6%A0%A1%E9%95%BF%E8%80%81%E7%81%AB%E9%94%85-1669-hollenbeck-ave-a/07Y14L2GU8Sp8p-55mhtcw";

export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
