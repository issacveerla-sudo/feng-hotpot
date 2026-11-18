"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Games from "@/components/Games";
import { hasSupabase } from "@/lib/supabaseClient";
import { joinWaitlist, getMyEntry, leaveWaitlist, queueLength } from "@/lib/waitlist";
import { loadMember, addPoints } from "@/lib/loyalty";

export default function WaitlistPage() {
  const [entry, setEntry] = useState(null);
  const [form, setForm] = useState({ name: "", party: 2, phone: "" });
  const [qlen, setQlen] = useState(0);
  const [member, setMember] = useState(null);
  const [earned, setEarned] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [e, q, m] = await Promise.all([getMyEntry(), queueLength(), loadMember()]);
    setEntry(e);
    setQlen(q);
    setMember(m);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function join(e) {
    e.preventDefault();
    setBusy(true);
    const res = await joinWaitlist(form);
    setBusy(false);
    if (!res.error) { setEntry(res); refresh(); }
  }

  async function leave() {
    await leaveWaitlist();
    setEntry(null);
    refresh();
  }

  async function onEarn(points) {
    setEarned((x) => x + points);
    if (member) await addPoints(points, "waitlist-game");
  }

  return (
    <main className="bg-ember-field min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-8">
        {!hasSupabase && (
          <div className="mb-6 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold">
            Demo mode — sample queue. Connect Supabase for live waitlist data.
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-cream/50">Loading…</div>
        ) : !entry ? (
          <div className="mx-auto max-w-md">
            <div className="text-center">
              <h1 className="display text-5xl text-cream">Join the Waitlist</h1>
              <p className="mt-3 text-cream/60">
                Skip the crowded host stand. Grab a spot, track it live, and play while
                the pot heats up.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm text-cream/70">
                🔥 {qlen} parties waiting now
              </div>
            </div>

            <form onSubmit={join} className="card mt-8 space-y-4 p-6">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-cream outline-none focus:border-chili"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">Party size</span>
                  <select
                    value={form.party}
                    onChange={(e) => setForm({ ...form, party: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-cream outline-none focus:border-chili"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">Phone</span>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(408) 555-0199"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-cream outline-none focus:border-chili"
                  />
                </label>
              </div>
              <button disabled={busy} className="pill-red w-full !py-3 text-base disabled:opacity-60">
                {busy ? "Joining…" : "Join waitlist"}
              </button>
            </form>
          </div>
        ) : (
          <Status entry={entry} qlen={qlen} member={member} earned={earned} onEarn={onEarn} onLeave={leave} />
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

function Status({ entry, member, earned, onEarn, onLeave }) {
  const [sec, setSec] = useState((entry.quoted || entry.quoted_min || 25) * 60);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <div>
      <div className="card p-7 text-center">
        <div className="text-sm text-cream/50">You're on the list, {entry.name.split(" ")[0]} 🔥</div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <div className="display text-5xl text-flame">#{entry.pos}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-cream/50">Your spot</div>
          </div>
          <div>
            <div className="display text-5xl text-cream">{mm}:{ss}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-cream/50">Est. wait</div>
          </div>
          <div>
            <div className="display text-5xl text-cream">{entry.party}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-cream/50">Party</div>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-cream/70">
          📲 We'll text <span className="text-cream">{entry.phone}</span> when your table is ready.
        </div>
        <button onClick={onLeave} className="pill-ghost mt-4">Leave waitlist</button>
      </div>

      {!member && (
        <div className="mt-6 rounded-xl border border-chili/30 bg-chili/10 px-4 py-3 text-center text-sm text-cream/80">
          You've earned <span className="font-bold text-gold">{earned} pts</span> playing —{" "}
          <Link href="/loyalty" className="font-semibold text-chili underline">sign up</Link>{" "}
          to keep them!
        </div>
      )}

      <div className="mt-8">
        <Games onEarn={onEarn} />
      </div>
    </div>
  );
}
