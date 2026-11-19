"use client";

import { useEffect, useState } from "react";
import { Header } from "@/app/admin/page";
import { Stat, Donut, HBars } from "@/components/Charts";
import { getMembers } from "@/lib/analytics";
import { getRewards, saveReward } from "@/lib/content";
import { DEMO_TIER_SPLIT, DEMO_TOP_REWARDS } from "@/lib/demo";

const TIER_COLOR = { Spark: "#E8B04B", Ember: "#F2792B", Blaze: "#E23B2E", Legend: "#B5121B" };

export default function AdminLoyalty() {
  const [members, setMembers] = useState([]);
  useEffect(() => { getMembers().then(setMembers); }, []);

  const totalPts = members.reduce((s, m) => s + (m.points || 0), 0);
  const avgVisits = members.length ? (members.reduce((s, m) => s + (m.visits || 0), 0) / members.length).toFixed(1) : 0;

  return (
    <div>
      <Header title="Loyalty" subtitle="Members, tiers and reward activity." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total members" value={members.length} />
        <Stat label="Points outstanding" value={(totalPts / 1000).toFixed(1) + "k"} />
        <Stat label="Avg visits / member" value={avgVisits} />
      </div>

      <RewardsEditor />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-flame">Members by tier</h3>
          <div className="mt-4"><Donut data={DEMO_TIER_SPLIT} /></div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-flame">Reward redemptions</h3>
          <div className="mt-4"><HBars data={DEMO_TOP_REWARDS} color="#E23B2E" /></div>
        </div>
      </div>

      <div className="mt-5 card overflow-hidden">
        <div className="border-b border-white/10 p-4 text-sm font-bold uppercase tracking-widest text-flame">
          Top members
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-cream/45">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Email</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Visits</th>
                <th className="p-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="p-4 font-medium text-cream">{m.name}</td>
                  <td className="p-4 text-cream/55">{m.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="heat-dot" style={{ background: TIER_COLOR[m.tier] || "#E8B04B" }} />
                      <span className="text-cream/80">{m.tier}</span>
                    </span>
                  </td>
                  <td className="p-4 text-cream/60">{m.visits}</td>
                  <td className="p-4 text-right font-bold text-gold">{(m.points || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RewardsEditor() {
  const [rewards, setRewards] = useState([]);
  const [flash, setFlash] = useState("");

  async function load() { setRewards(await getRewards({ activeOnly: false })); }
  useEffect(() => { load(); }, []);

  function update(i, patch) {
    setRewards((r) => r.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  async function save(i) {
    await saveReward(rewards[i]);
    setFlash(`Saved "${rewards[i].name}"`);
    setTimeout(() => setFlash(""), 2500);
  }

  return (
    <div className="mt-5 card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-flame">Reward point costs</h3>
        {flash && <span className="text-xs text-green-400">{flash} ✓</span>}
      </div>
      <p className="mt-1 text-sm text-cream/50">Change what each reward costs, or switch one off. Updates the Loyalty page instantly.</p>
      <div className="mt-4 space-y-2">
        {rewards.map((r, i) => (
          <div key={r.id} className="grid items-center gap-3 rounded-xl border border-chili/15 bg-black/40 p-3 md:grid-cols-[2fr_1fr_auto_auto]">
            <input value={r.name} onChange={(e) => update(i, { name: e.target.value })}
              className="rounded-lg border border-chili/20 bg-black/50 px-3 py-2 text-sm text-cream outline-none focus:border-chili" />
            <label className="flex items-center gap-2 text-xs text-cream/50">
              pts
              <input type="number" value={r.points} onChange={(e) => update(i, { points: Number(e.target.value) })}
                className="w-24 rounded-lg border border-chili/20 bg-black/50 px-3 py-2 text-sm text-gold outline-none focus:border-chili" />
            </label>
            <label className="flex items-center gap-2 text-xs text-cream/60">
              <input type="checkbox" checked={r.active !== false} onChange={(e) => update(i, { active: e.target.checked })} />
              Active
            </label>
            <button onClick={() => save(i)} className="pill-red text-xs">Save</button>
          </div>
        ))}
      </div>
    </div>
  );
}
