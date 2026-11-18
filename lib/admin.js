"use client";

import { supabase, hasSupabase, isAdminEmail } from "@/lib/supabaseClient";

const LS_KEY = "fh_admin";

export async function adminUser() {
  if (!hasSupabase) {
    if (typeof window === "undefined") return null;
    const email = localStorage.getItem(LS_KEY);
    return email && isAdminEmail(email) ? { email } : null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (user && isAdminEmail(user.email)) return user;
  return null;
}

export async function adminSignIn({ email, password }) {
  if (!isAdminEmail(email)) {
    return { error: "This email isn't on the owner allow-list." };
  }
  if (!hasSupabase) {
    // Demo mode: allow any password for an allow-listed owner email.
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, email.toLowerCase());
    return { ok: true };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function adminSignOut() {
  if (!hasSupabase) {
    if (typeof window !== "undefined") localStorage.removeItem(LS_KEY);
    return;
  }
  await supabase.auth.signOut();
}
