"use client";

import { useEffect, useState } from "react";
import { Header } from "@/app/admin/page";
import { getCampaigns, saveCampaign, getMembers } from "@/lib/analytics";
import { generatePlan, GOALS } from "@/lib/campaigngen";

const AUDIENCES = ["All members", "Blaze + Legend", "Lapsed (60+ days)", "Spark tier", "Birthdays this month"];
const TEMPLATES = {
  "": "",
  "Málà Monday": "🌶️ It's Málà Monday at Feng Hotpot! Show this message for a FREE appetizer with any broth. Tonight only — taste the legend. Reply STOP to opt out.",
  "Wagyu drop": "🥩 Limited Wagyu short rib is back this weekend. Blaze & Legend members get first dibs + double points. Book your pot now.",
  "Win-back": "We miss you at Feng Hotpot! Here's 200 bonus points to welcome you back — redeem for a free appetizer on your next visit. 🔥",
};

export default function AdminCampaigns() {
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: "", channel: "SMS", audience: "All members", body: "" });
  const [flash, setFlash] = useState("");
  const [sending, setSending] = useState(false);
  const [designer, setDesigner] = useState(false);

  function useVariant(v, channel, audience) {
    setForm({ name: v.name, channel, audience, body: v.body });
    setDesigner(false);
    setFlash("✨ Draft loaded into the composer — review and send.");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    getCampaigns().then(setRows);
    getMembers().then(setMembers);
  }, []);

  function audienceCount(a) {
    if (a === "All members") return members.length;
    if (a === "Blaze + Legend") return members.filter((m) => ["Blaze", "Legend"].includes(m.tier)).length;
    if (a === "Spark tier") return members.filter((m) => m.tier === "Spark").length;
    if (a.startsWith("Lapsed")) return Math.round(members.length * 0.16);
    return Math.round(members.length * 0.08);
  }

  async function send(status) {
    if (!form.name || !form.body) { setFlash("Add a name and a message first."); return; }
    setSending(true);
    const reach = audienceCount(form.audience);
    const row = {
      name: form.name,
      channel: form.channel,
      audience: form.audience,
      sent: status === "Sent" ? reach : 0,
      opened: 0,
      redeemed: 0,
      status,
      date: status === "Sent" ? new Date().toISOString().slice(0, 10) : "—",
    };
    const saved = await saveCampaign(row);
    setRows((r) => [saved, ...r]);
    setSending(false);
    setFlash(status === "Sent" ? `✅ Sent to ${reach} members via ${form.channel}.` : "💾 Saved as draft.");
    setForm({ name: "", channel: "SMS", audience: "All members", body: "" });
  }

  return (
    <div>
      <Header
        title="Campaigns"
        subtitle="Reach loyalty members with targeted offers."
        right={
          <button onClick={() => setDesigner(true)} className="pill-red text-sm">
            ✨ Design a campaign
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* composer */}
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-flame">New campaign</h3>
          <div className="mt-4 space-y-3">
            <input
              placeholder="Campaign name (e.g. Lunar New Year)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-cream outline-none focus:border-chili"
            />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-cream outline-none focus:border-chili">
                <option>SMS</option>
                <option>Email</option>
                <option>Push</option>
              </select>
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-cream outline-none focus:border-chili">
                {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(TEMPLATES).filter(Boolean).map((t) => (
                <button key={t} onClick={() => setForm({ ...form, body: TEMPLATES[t] })}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-cream/60 hover:border-chili/50 hover:text-cream">
                  + {t}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              placeholder="Write your message…"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-cream outline-none focus:border-chili"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-cream/50">
                Reaches <span className="font-bold text-gold">{audienceCount(form.audience)}</span> members
              </span>
              <div className="flex gap-2">
                <button disabled={sending} onClick={() => send("Draft")} className="pill-ghost text-sm">Save draft</button>
                <button disabled={sending} onClick={() => send("Sent")} className="pill-red text-sm">
                  {sending ? "Sending…" : "Send now"}
                </button>
              </div>
            </div>
            {flash && <p className="text-center text-sm text-gold">{flash}</p>}
          </div>
        </div>

        {/* preview */}
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-flame">Preview</h3>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs text-cream/50">
              <span className="display text-chili">火</span> Feng Hotpot · {form.channel}
            </div>
            <p className="min-h-[120px] whitespace-pre-wrap text-sm text-cream/85">
              {form.body || "Your message preview appears here…"}
            </p>
          </div>
          <p className="mt-3 text-xs text-cream/40">
            Prototype: sending is simulated. Wire this to Twilio (SMS) or a mail provider to go live.
          </p>
        </div>
      </div>

      {/* history */}
      <div className="mt-6 card overflow-hidden">
        <div className="border-b border-white/10 p-4 text-sm font-bold uppercase tracking-widest text-flame">
          Campaign history
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-cream/45">
              <tr>
                <th className="p-4">Campaign</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Audience</th>
                <th className="p-4">Sent</th>
                <th className="p-4">Opened</th>
                <th className="p-4">Redeemed</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.id || i} className="border-t border-white/5">
                  <td className="p-4 font-medium text-cream">{c.name}</td>
                  <td className="p-4 text-cream/70">{c.channel}</td>
                  <td className="p-4 text-cream/60">{c.audience}</td>
                  <td className="p-4 text-cream/70">{c.sent || "—"}</td>
                  <td className="p-4 text-cream/70">{c.opened || "—"}</td>
                  <td className="p-4 text-gold">{c.redeemed || "—"}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.status === "Sent" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-cream/50"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {designer && (
        <CampaignDesigner
          audiences={AUDIENCES}
          sizeFor={audienceCount}
          onClose={() => setDesigner(false)}
          onUse={useVariant}
        />
      )}
    </div>
  );
}

function CampaignDesigner({ audiences, sizeFor, onClose, onUse }) {
  const [goal, setGoal] = useState(GOALS[0].id);
  const [detail, setDetail] = useState("");
  const [channel, setChannel] = useState("SMS");
  const [audience, setAudience] = useState("All members");
  const [plan, setPlan] = useState(null);
  const [working, setWorking] = useState(false);

  const goalMeta = GOALS.find((g) => g.id === goal);

  function run() {
    setWorking(true);
    setPlan(null);
    setTimeout(() => {
      setPlan(generatePlan({ goal, detail, channel, audience, audienceSize: sizeFor(audience) }));
      setWorking(false);
    }, 700);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/70 p-4" onClick={onClose}>
      <div className="card my-8 w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="display text-xl text-cream">✨ Campaign strategist</h3>
            <p className="text-xs text-cream/50">Pick a goal — the assistant designs the full strategy and writes the copy.</p>
          </div>
          <button onClick={onClose} className="text-cream/40 hover:text-cream">✕</button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-cream/50">Goal</span>
            <select value={goal} onChange={(e) => { setGoal(e.target.value); setPlan(null); }}
              className="mt-1 w-full rounded-xl border border-chili/20 bg-black/50 px-4 py-2.5 text-sm text-cream outline-none focus:border-chili">
              {GOALS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </label>
          {goalMeta?.detail && (
            <label className="block">
              <span className="text-xs text-cream/50">{goalMeta.detail}</span>
              <input value={detail} onChange={(e) => setDetail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-chili/20 bg-black/50 px-4 py-2.5 text-sm text-cream outline-none focus:border-chili" />
            </label>
          )}
          <label className="block">
            <span className="text-xs text-cream/50">Primary channel</span>
            <select value={channel} onChange={(e) => setChannel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-chili/20 bg-black/50 px-4 py-2.5 text-sm text-cream outline-none focus:border-chili">
              <option>SMS</option><option>Email</option><option>Push</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-cream/50">Audience</span>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full rounded-xl border border-chili/20 bg-black/50 px-4 py-2.5 text-sm text-cream outline-none focus:border-chili">
              {audiences.map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
        </div>

        <button onClick={run} disabled={working} className="pill-red mt-4 w-full !py-3 disabled:opacity-60">
          {working ? "Designing strategy…" : plan ? "Regenerate plan" : "Design campaign"}
        </button>

        {plan && (
          <div className="mt-6 space-y-5">
            <Section label="Objective"><p className="text-sm text-cream/85">{plan.objective}</p></Section>

            <div className="grid gap-4 sm:grid-cols-2">
              <Section label="Audience">
                <p className="text-sm text-cream/85">{plan.audience.segment} · ~{plan.audience.size} members</p>
                <p className="mt-1 text-xs text-cream/55">{plan.audience.why}</p>
              </Section>
              <Section label="Offer">
                <p className="text-sm text-cream/85">{plan.offer}</p>
              </Section>
            </div>

            <Section label="Send schedule">
              <ol className="space-y-2">
                {plan.channels.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-20 shrink-0 font-semibold text-gold">{c.when}</span>
                    <span className="w-14 shrink-0 text-chili">{c.channel}</span>
                    <span className="text-cream/75">{c.purpose}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section label="Targets">
              <div className="flex flex-wrap gap-2">
                {plan.kpis.map((k) => (
                  <span key={k.metric} className="rounded-full border border-chili/20 bg-black/40 px-3 py-1 text-xs text-cream/80">
                    {k.metric}: <span className="text-gold">{k.target}</span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-cream/50">{plan.projection}</p>
            </Section>

            <Section label="Message drafts">
              <div className="space-y-3">
                {plan.variants.map((v, i) => (
                  <div key={i} className="panel p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-cream">{v.name}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href="https://framia.converge.ai/create/"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => navigator.clipboard?.writeText(v.body)}
                          className="pill-ghost text-xs"
                          title="Copies this script and opens Framia to generate a video"
                        >
                          🎬 Generate video ↗
                        </a>
                        <button onClick={() => onUse(v, channel, audience)} className="pill-red text-xs">Use this →</button>
                      </div>
                    </div>
                    {channel === "Email" && <div className="mt-2 text-sm text-gold">Subject: {v.subject}</div>}
                    <p className="mt-2 whitespace-pre-wrap text-sm text-cream/80">{v.body}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-flame">{label}</div>
      {children}
    </div>
  );
}
