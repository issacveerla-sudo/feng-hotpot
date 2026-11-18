"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/app/admin/page";
import { getInfluencers } from "@/lib/analytics";
import { AGENT_STEPS, draftOutreachEmail } from "@/lib/demo";

const STATUS = {
  new: "bg-white/10 text-cream/60",
  contacted: "bg-gold/20 text-gold",
  replied: "bg-flame/20 text-flame",
  partnered: "bg-green-500/20 text-green-400",
};

function fmt(n) {
  return n >= 1000 ? (n / 1000).toFixed(0) + "K" : n;
}

export default function AdminInfluencers() {
  const [list, setList] = useState([]);
  const [agentOpen, setAgentOpen] = useState(false);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [platform, setPlatform] = useState("All");
  const [draft, setDraft] = useState(null); // {inf, body}
  const timers = useRef([]);

  useEffect(() => {
    getInfluencers().then((d) => setList(d.map((x) => ({ ...x, status: x.status || "new" }))));
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function runAgent() {
    setAgentOpen(true);
    setRunning(true);
    setRevealed(false);
    setLog([]);
    let t = 0;
    AGENT_STEPS.forEach((step) => {
      t += step.ms;
      timers.current.push(setTimeout(() => setLog((l) => [...l, step.label]), t));
    });
    timers.current.push(setTimeout(() => { setRunning(false); setRevealed(true); }, t + 500));
  }

  function setStatus(handle, status) {
    setList((l) => l.map((x) => (x.handle === handle ? { ...x, status } : x)));
  }

  const shown = list.filter((x) => platform === "All" || x.platform === platform);
  const counts = {
    new: list.filter((x) => x.status === "new").length,
    contacted: list.filter((x) => x.status === "contacted").length,
    replied: list.filter((x) => x.status === "replied").length,
    partnered: list.filter((x) => x.status === "partnered").length,
  };

  return (
    <div>
      <Header
        title="Influencer CRM"
        subtitle="Find creators, score fit, and run outreach — powered by the discovery agent."
        right={
          <button onClick={runAgent} className="pill-red text-sm">
            ✨ Run discovery agent
          </button>
        }
      />

      {/* pipeline */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-xs uppercase tracking-widest text-cream/45">{k}</div>
            <div className="display mt-1 text-2xl text-cream">{v}</div>
          </div>
        ))}
      </div>

      {/* agent panel */}
      {agentOpen && (
        <div className="mt-5 card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-flame">
              Discovery agent {running ? "· working…" : "· done"}
            </h3>
            <button onClick={() => setAgentOpen(false)} className="text-sm text-cream/40 hover:text-cream">✕</button>
          </div>
          <div className="mt-4 space-y-2 font-mono text-sm">
            {log.map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-cream/80">
                <span className="text-green-400">✓</span> {line}
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-2 text-cream/50">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-flame border-t-transparent" />
                analyzing…
              </div>
            )}
          </div>
          {revealed && (
            <p className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
              Ranked {list.length} best-fit creators below. Review and draft outreach with one click.
            </p>
          )}
        </div>
      )}

      {/* filter */}
      <div className="mt-5 flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-cream/40">Platform</span>
        {["All", "Instagram", "TikTok", "YouTube"].map((p) => (
          <button key={p} onClick={() => setPlatform(p)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${platform === p ? "bg-chili text-white" : "border border-white/10 text-cream/60 hover:text-cream"}`}>
            {p}
          </button>
        ))}
      </div>

      {/* table */}
      <div className="mt-3 card overflow-hidden">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-cream/45">
              <tr>
                <th className="p-4">Creator</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Followers</th>
                <th className="p-4">Engage</th>
                <th className="p-4">City</th>
                <th className="p-4">Fit</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Outreach</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((x) => (
                <tr key={x.handle} className="border-b border-white/5 align-top">
                  <td className="p-4">
                    <div className="font-semibold text-cream">{x.name}</div>
                    <div className="text-xs text-chili">{x.handle}</div>
                    <div className="mt-1 max-w-[220px] text-xs text-cream/45">{x.notes}</div>
                  </td>
                  <td className="p-4 text-cream/70">{x.platform}</td>
                  <td className="p-4 text-cream/70">{fmt(x.followers)}</td>
                  <td className="p-4 text-cream/70">{x.er}%</td>
                  <td className="p-4 text-cream/60">{x.city}</td>
                  <td className="p-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${x.fit >= 90 ? "bg-green-500/20 text-green-400" : x.fit >= 75 ? "bg-gold/20 text-gold" : "bg-white/10 text-cream/50"}`}>
                      {x.fit}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={x.status}
                      onChange={(e) => setStatus(x.handle, e.target.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize outline-none ${STATUS[x.status]}`}
                    >
                      {Object.keys(STATUS).map((s) => <option key={s} value={s} className="bg-charcoal text-cream">{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDraft({ inf: x, body: draftOutreachEmail(x) })}
                      className="rounded-full bg-chili/20 px-3 py-1 text-xs font-semibold text-chili hover:bg-chili/30"
                    >
                      Draft email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* draft modal */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDraft(null)}>
          <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-cream">Outreach to {draft.inf.name}</h3>
                <div className="text-xs text-chili">{draft.inf.handle} · fit {draft.inf.fit}</div>
              </div>
              <button onClick={() => setDraft(null)} className="text-cream/40 hover:text-cream">✕</button>
            </div>
            <textarea
              rows={14}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              className="mt-4 w-full rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-cream/90 outline-none focus:border-chili"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-cream/40">Agent-drafted · edit before sending</span>
              <div className="flex gap-2">
                <button onClick={() => setDraft(null)} className="pill-ghost text-sm">Cancel</button>
                <button
                  onClick={() => { setStatus(draft.inf.handle, "contacted"); setDraft(null); }}
                  className="pill-red text-sm"
                >
                  Send outreach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
