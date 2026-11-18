"use client";

import { useEffect, useState } from "react";
import { Header } from "@/app/admin/page";
import { Stat, BarChart } from "@/components/Charts";
import { getWaitlist } from "@/lib/analytics";
import { DEMO_HOURLY } from "@/lib/demo";

const STATUS_STYLE = {
  waiting: "bg-flame/20 text-flame",
  notified: "bg-gold/20 text-gold",
  seated: "bg-green-500/20 text-green-400",
  left: "bg-white/10 text-cream/50",
};

export default function AdminWaitlist() {
  const [rows, setRows] = useState([]);
  useEffect(() => { getWaitlist().then(setRows); }, []);

  function setStatus(i, status) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, status } : row)));
  }

  const waiting = rows.filter((r) => r.status === "waiting").length;
  const seated = rows.filter((r) => r.status === "seated").length;
  const avgQuoted = rows.length ? Math.round(rows.reduce((s, r) => s + (r.quoted || 0), 0) / rows.length) : 0;

  return (
    <div>
      <Header title="Waitlist" subtitle="Live queue and today's flow." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Currently waiting" value={waiting} />
        <Stat label="Seated today" value={seated} />
        <Stat label="Avg quoted wait" value={avgQuoted} suffix="min" />
      </div>

      <div className="mt-5 card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-flame">Join volume by hour</h3>
        <BarChart data={DEMO_HOURLY} color="#F2792B" />
      </div>

      <div className="mt-5 card overflow-hidden">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-cream/45">
              <tr>
                <th className="p-4">Party</th>
                <th className="p-4">Size</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Waiting</th>
                <th className="p-4">Quoted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="p-4 font-medium text-cream">{r.name}</td>
                  <td className="p-4 text-cream/70">{r.party}</td>
                  <td className="p-4 text-cream/60">{r.phone}</td>
                  <td className="p-4 text-cream/60">{r.joinedMin}m</td>
                  <td className="p-4 text-cream/60">{r.quoted}m</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {r.status === "waiting" && (
                      <button onClick={() => setStatus(i, "notified")} className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold hover:bg-gold/30">
                        Text "ready"
                      </button>
                    )}
                    {r.status === "notified" && (
                      <button onClick={() => setStatus(i, "seated")} className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400 hover:bg-green-500/30">
                        Seat
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
