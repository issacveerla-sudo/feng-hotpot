"use client";

import { useEffect, useState } from "react";
import { Stat, LineChart, BarChart, Donut, HBars } from "@/components/Charts";
import { DEMO_VISITS, DEMO_HOURLY, DEMO_TIER_SPLIT, DEMO_TOP_REWARDS } from "@/lib/demo";
import { getKpis } from "@/lib/analytics";
import { hasSupabase } from "@/lib/supabaseClient";

export default function AdminOverview() {
  const [k, setK] = useState(null);
  useEffect(() => { getKpis().then(setK); }, []);

  return (
    <div>
      <Header title="Overview" subtitle="How Feng Hotpot is doing, at a glance." />

      {!k ? (
        <div className="py-20 text-center text-cream/40">Loading analytics…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Loyalty members" value={k.members.toLocaleString()} delta={k.membersDelta} />
            <Stat label="Visits this month" value={k.visitsThisMonth.toLocaleString()} delta={k.visitsDelta} />
            <Stat label="Avg wait" value={k.avgWaitMin} suffix="min" delta={k.avgWaitDelta} />
            <Stat label="Points issued" value={(k.pointsIssued / 1000).toFixed(1) + "k"} delta={k.pointsDelta} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="card p-6">
              <ChartHead title="Visits & waitlist" legend={[["Visits", "#F2792B"], ["Waitlist joins", "#E23B2E"]]} />
              <LineChart data={DEMO_VISITS} keys={["visits", "waitlist"]} colors={["#F2792B", "#E23B2E"]} />
            </div>
            <div className="card p-6">
              <ChartHead title="Members by tier" />
              <div className="mt-3">
                <Donut data={DEMO_TIER_SPLIT} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <ChartHead title="Busiest hours (today)" />
              <BarChart data={DEMO_HOURLY} color="#E23B2E" />
            </div>
            <div className="card p-6">
              <ChartHead title="Top reward redemptions" />
              <div className="mt-3"><HBars data={DEMO_TOP_REWARDS} /></div>
            </div>
          </div>

          {!hasSupabase && (
            <p className="mt-6 text-center text-xs text-cream/35">
              Showing seeded demo analytics. Connect Supabase and live data flows in automatically.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function Header({ title, subtitle, right }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="display text-3xl text-cream">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-cream/55">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function ChartHead({ title, legend }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-widest text-flame">{title}</h3>
      {legend && (
        <div className="flex gap-3">
          {legend.map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5 text-xs text-cream/60">
              <span className="h-2 w-2 rounded-full" style={{ background: c }} /> {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
