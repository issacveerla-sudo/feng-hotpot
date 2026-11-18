"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Games from "@/components/Games";
import { hasSupabase } from "@/lib/supabaseClient";
import { joinWaitlist, getMyEntry, leaveWaitlist, queueLength } from "@/lib/waitlist";
import { sendSms, joinMessage } from "@/lib/notify";

export default function WaitlistPage() {
  const [entry, setEntry] = useState(null);
  const [form, setForm] = useState({ name: "", party: 2, phone: "" });
  const [qlen, setQlen] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [e, q] = await Promise.all([getMyEntry(), queueLength()]);
    setEntry(e);
    setQlen(q);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function join(e) {
    e.preventDefault();
    setBusy(true);
    const res = await joinWaitlist(form);
    if (!res.error) {
      setEntry(res);
      // fire-and-forget confirmation text
      sendSms(res.phone, joinMessage(res.name, res.pos, res.quoted));
      refresh();
    }
    setBusy(false);
  }

  async function leave() {
    await leaveWaitlist();
    setEntry(null);
    refresh();
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
                your table gets ready.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-chili/30 bg-black/40 px-4 py-1.5 text-sm text-cream/70">
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
                  className="mt-1 w-full rounded-xl border border-chili/20 bg-black/50 px-4 py-3 text-cream outline-none focus:border-chili"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">Party size</span>
                  <select
                    value={form.party}
                    onChange={(e) => setForm({ ...form, party: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-chili/20 bg-black/50 px-4 py-3 text-cream outline-none focus:border-chili"
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
                    className="mt-1 w-full rounded-xl border border-chili/20 bg-black/50 px-4 py-3 text-cream outline-none focus:border-chili"
                  />
                </label>
              </div>
              <button disabled={busy} className="pill-red w-full !py-3 text-base disabled:opacity-60">
                {busy ? "Joining…" : "Join waitlist"}
              </button>
            </form>
          </div>
        ) : (
          <Status entry={entry} onLeave={leave} />
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

function Status({ entry, onLeave }) {
  // Timer is derived from the stored join time, so it keeps counting
  // correctly even if you navigate away and come back.
  const quotedMin = entry.quoted || entry.quoted_min || 15;
  const joinedAt = entry.created_at ? new Date(entry.created_at).getTime() : Date.now();
  const endAt = joinedAt + quotedMin * 60 * 1000;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingSec = Math.max(0, Math.floor((endAt - now) / 1000));
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");
  const ready = remainingSec === 0;

  return (
    <div>
      <div className="card p-7 text-center">
        <div className="text-sm text-cream/50">You're on the list, {entry.name.split(" ")[0]} 🔥</div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <div className="display text-5xl text-chili">#{entry.pos}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-cream/50">Your spot</div>
          </div>
          <div>
            <div className="display text-5xl text-cream">{ready ? "Ready!" : `${mm}:${ss}`}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-cream/50">{ready ? "Table up" : "Est. wait"}</div>
          </div>
          <div>
            <div className="display text-5xl text-cream">{entry.party}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-cream/50">Party</div>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-chili/20 bg-black/40 px-4 py-3 text-sm text-cream/70">
          {ready
            ? "🔔 Your table should be ready — please see the host stand."
            : <>📲 We'll text <span className="text-cream">{entry.phone}</span> when your table is ready.</>}
        </div>
        <button onClick={onLeave} className="pill-ghost mt-4">Leave waitlist</button>
      </div>

      <div className="mt-8">
        <Games />
      </div>
    </div>
  );
}
