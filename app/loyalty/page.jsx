"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { REWARDS, TIERS, tierForPoints } from "@/lib/menu";
import { hasSupabase } from "@/lib/supabaseClient";
import {
  loadMember,
  signUp,
  signIn,
  signOut,
  redeemReward,
} from "@/lib/loyalty";

export default function LoyaltyPage() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setMember(await loadMember());
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fn = mode === "signup" ? signUp : signIn;
    const res = await fn(form);
    setBusy(false);
    if (res.error) return setMsg(res.error);
    if (res.needsConfirm)
      return setMsg("Account created! Check your email to confirm, then sign in. (Tip: disable email confirmation in Supabase for instant demo access.)");
    refresh();
  }

  async function doRedeem(r) {
    setBusy(true);
    const res = await redeemReward(r);
    setBusy(false);
    setMsg(res.error ? res.error : `🎉 Redeemed: ${r.name}! Show this at the host stand.`);
    refresh();
  }

  return (
    <main className="bg-ember-field min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        {!hasSupabase && (
          <div className="mb-6 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold">
            Demo mode — running on sample data. Connect Supabase to go live.
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-cream/50">Loading…</div>
        ) : member ? (
          <Dashboard member={member} onRedeem={doRedeem} onSignOut={async () => { await signOut(); refresh(); }} busy={busy} msg={msg} />
        ) : (
          <div className="mx-auto max-w-md">
            <div className="text-center">
              <h1 className="display text-5xl text-cream">Join the Legend</h1>
              <p className="mt-3 text-cream/60">
                Earn points on every visit and every game. Unlock free beef, broth
                upgrades and skip-the-line passes.
              </p>
            </div>

            <div className="card mt-8 p-6">
              <div className="mb-5 flex rounded-full border border-white/10 p-1">
                {["signup", "login"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition ${
                      mode === m ? "bg-chili text-white" : "text-cream/60"
                    }`}
                  >
                    {m === "signup" ? "Sign up" : "Log in"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                )}
                <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
                <button disabled={busy} className="pill-red w-full !py-3 text-base disabled:opacity-60">
                  {busy ? "…" : mode === "signup" ? "Create my account" : "Log in"}
                </button>
              </form>
              {msg && <p className="mt-3 text-center text-sm text-gold">{msg}</p>}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-cream outline-none focus:border-chili"
      />
    </label>
  );
}

function Dashboard({ member, onRedeem, onSignOut, busy, msg }) {
  const tier = tierForPoints(member.points);
  const idx = TIERS.findIndex((t) => t.name === tier.name);
  const next = TIERS[idx + 1];
  const pct = next
    ? Math.min(100, ((member.points - tier.min) / (next.min - tier.min)) * 100)
    : 100;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-cream/50">Welcome back</div>
          <h1 className="display text-4xl text-cream">{member.name}</h1>
        </div>
        <button onClick={onSignOut} className="pill-ghost">Sign out</button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[1.2fr_1fr]">
        {/* points card */}
        <div className="card p-7">
          <div className="flex items-center gap-2">
            <span className="heat-dot" style={{ background: tier.color }} />
            <span className="font-bold text-cream">{tier.name} tier</span>
          </div>
          <div className="display mt-3 text-6xl text-flame">
            {member.points.toLocaleString()}
            <span className="ml-2 text-xl text-cream/50">pts</span>
          </div>
          {next ? (
            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-flame to-chili" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-sm text-cream/60">
                {next.min - member.points} pts to <span className="text-cream">{next.name}</span>
              </div>
            </div>
          ) : (
            <div className="mt-5 text-sm text-gold">You're a Legend. Top tier unlocked. 🔥</div>
          )}
          <Link href="/waitlist" className="pill-ghost mt-6">Play games to earn more →</Link>
        </div>

        {/* quick stats */}
        <div className="grid gap-5">
          <div className="card p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-flame">Visits</div>
            <div className="display mt-1 text-4xl text-cream">{member.visits ?? 0}</div>
          </div>
          <div className="card p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-flame">Member since</div>
            <div className="mt-1 text-lg text-cream">
              {member.created_at ? new Date(member.created_at).toLocaleDateString() : "Today"}
            </div>
          </div>
        </div>
      </div>

      {msg && <p className="mt-5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold">{msg}</p>}

      <h2 className="display mt-10 text-3xl text-cream">Rewards</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((r) => {
          const can = member.points >= r.points;
          return (
            <div key={r.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="font-bold text-cream">{r.name}</div>
                <div className="rounded-full bg-chili/20 px-2 py-0.5 text-xs font-bold text-chili">
                  {r.points}
                </div>
              </div>
              <p className="mt-2 flex-1 text-sm text-cream/55">{r.desc}</p>
              <button
                disabled={!can || busy}
                onClick={() => onRedeem(r)}
                className={`mt-4 rounded-full py-2.5 text-sm font-semibold transition ${
                  can ? "bg-chili text-white hover:bg-ember" : "cursor-not-allowed bg-white/5 text-cream/40"
                }`}
              >
                {can ? "Redeem" : `Need ${r.points - member.points} more`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
