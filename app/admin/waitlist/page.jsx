"use client";

import { useEffect, useState } from "react";
import { Header } from "@/app/admin/page";
import { Stat, BarChart } from "@/components/Charts";
import { getWaitlist, saveWaitlistOrder } from "@/lib/analytics";
import { DEMO_HOURLY } from "@/lib/demo";
import { sendSms, readyMessage } from "@/lib/notify";

const STATUS_STYLE = {
  waiting: "bg-flame/20 text-flame",
  notified: "bg-gold/20 text-gold",
  seated: "bg-green-500/20 text-green-400",
  left: "bg-white/10 text-cream/50",
};

export default function AdminWaitlist() {
  const [rows, setRows] = useState([]);
  useEffect(() => { getWaitlist().then(setRows); }, []);

  const [toast, setToast] = useState("");

  function setStatus(i, status) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, status } : row)));
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    setRows((r) => {
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      const recomputed = next.map((row, idx) =>
        row.status === "waiting" ? { ...row, pos: next.slice(0, idx + 1).filter((x) => x.status === "waiting").length } : row
      );
      saveWaitlistOrder(recomputed.map((x) => x.id));
      return recomputed;
    });
  }

  async function notify(i) {
    const row = rows[i];
    setStatus(i, "notified");
    const res = await sendSms(row.phone, readyMessage(row.name));
    setToast(
      res.ok
        ? res.simulated
          ? `Simulated text to ${row.name} (${row.phone}). Add Twilio keys to send for real.`
          : `✅ Texted ${row.name} that their table is ready.`
        : `Couldn't text ${row.name}: ${res.error || "error"}`
    );
    setTimeout(() => setToast(""), 5000);
  }

  const waiting = rows.filter((r) => r.status === "waiting").length;
  const seated = rows.filter((r) => r.status === "seated").length;
  const avgQuoted = rows.length ? Math.round(rows.reduce((s, r) => s + (r.quoted || 0), 0) / rows.length) : 0;

  return (
    <div>
      <Header title="Waitlist" subtitle="Live queue and today's flow." />

      {toast && (
        <div className="mb-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          {toast}
        </div>
      )}

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
                    <span className="mr-2 inline-flex overflow-hidden rounded-full border border-chili/20 align-middle">
                      <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up"
                        className="px-2 py-1 text-xs text-cream/60 hover:bg-chili/10 hover:text-cream disabled:opacity-30">↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Move down"
                        className="border-l border-chili/20 px-2 py-1 text-xs text-cream/60 hover:bg-chili/10 hover:text-cream disabled:opacity-30">↓</button>
                    </span>
                    {r.status === "waiting" && (
                      <button onClick={() => notify(i)} className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold hover:bg-gold/30">
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
