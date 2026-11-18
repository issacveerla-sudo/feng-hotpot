// ─────────────────────────────────────────────────────────────
// Seeded demo data. Used as a fallback whenever Supabase isn't
// configured, so the deployed app always looks alive for a pitch.
// The same shapes are created in supabase/schema.sql.
// ─────────────────────────────────────────────────────────────

export const DEMO_KPIS = {
  members: 1284,
  membersDelta: 12.4,
  visitsThisMonth: 3960,
  visitsDelta: 8.1,
  avgWaitMin: 34,
  avgWaitDelta: -6.2,
  pointsIssued: 48200,
  pointsDelta: 15.0,
  redemptions: 212,
  redemptionsDelta: 9.3,
  waitlistToday: 86,
  seatedToday: 71,
};

// 12 weeks of trend data
export const DEMO_VISITS = [
  { label: "W1", visits: 720, waitlist: 210 },
  { label: "W2", visits: 760, waitlist: 230 },
  { label: "W3", visits: 810, waitlist: 245 },
  { label: "W4", visits: 790, waitlist: 240 },
  { label: "W5", visits: 860, waitlist: 270 },
  { label: "W6", visits: 900, waitlist: 290 },
  { label: "W7", visits: 880, waitlist: 285 },
  { label: "W8", visits: 950, waitlist: 310 },
  { label: "W9", visits: 1010, waitlist: 330 },
  { label: "W10", visits: 1060, waitlist: 355 },
  { label: "W11", visits: 1120, waitlist: 370 },
  { label: "W12", visits: 1190, waitlist: 402 },
];

export const DEMO_HOURLY = [
  { label: "11a", v: 22 }, { label: "12p", v: 48 }, { label: "1p", v: 61 },
  { label: "2p", v: 30 }, { label: "3p", v: 18 }, { label: "4p", v: 20 },
  { label: "5p", v: 52 }, { label: "6p", v: 88 }, { label: "7p", v: 96 },
  { label: "8p", v: 90 }, { label: "9p", v: 64 }, { label: "10p", v: 38 },
];

export const DEMO_TIER_SPLIT = [
  { label: "Spark", value: 612, color: "#E8B04B" },
  { label: "Ember", value: 398, color: "#F2792B" },
  { label: "Blaze", value: 198, color: "#E23B2E" },
  { label: "Legend", value: 76, color: "#B5121B" },
];

export const DEMO_TOP_REWARDS = [
  { label: "Free Appetizer", value: 92 },
  { label: "Broth Upgrade", value: 61 },
  { label: "Angus Beef Plate", value: 38 },
  { label: "$25 Off Platter", value: 15 },
  { label: "VIP Skip-Line", value: 6 },
];

export const DEMO_MEMBERS = [
  { name: "Grace Liu", email: "grace.l@gmail.com", points: 3820, tier: "Legend", visits: 41, joined: "2025-02-11" },
  { name: "Marcus Chen", email: "marcus.chen@outlook.com", points: 2110, tier: "Blaze", visits: 24, joined: "2025-04-02" },
  { name: "Priya Nair", email: "priya.nair@gmail.com", points: 1680, tier: "Blaze", visits: 19, joined: "2025-05-20" },
  { name: "Diego Alvarez", email: "diego.a@yahoo.com", points: 940, tier: "Ember", visits: 12, joined: "2025-06-14" },
  { name: "Sofia Rossi", email: "sofia.rossi@gmail.com", points: 720, tier: "Ember", visits: 9, joined: "2025-07-30" },
  { name: "Kevin Park", email: "kpark@gmail.com", points: 410, tier: "Spark", visits: 6, joined: "2025-08-19" },
  { name: "Aisha Khan", email: "aisha.k@gmail.com", points: 260, tier: "Spark", visits: 4, joined: "2025-09-05" },
  { name: "Tom Nguyen", email: "tom.nguyen@gmail.com", points: 120, tier: "Spark", visits: 2, joined: "2025-10-22" },
];

export const DEMO_WAITLIST = [
  { name: "Walk-in · Yang", party: 4, phone: "(408) 555-0112", status: "waiting", quoted: 35, joinedMin: 12, pos: 1 },
  { name: "Walk-in · Ortiz", party: 2, phone: "(408) 555-0190", status: "waiting", quoted: 25, joinedMin: 9, pos: 2 },
  { name: "Walk-in · Smith", party: 6, phone: "(408) 555-0145", status: "waiting", quoted: 50, joinedMin: 7, pos: 3 },
  { name: "Walk-in · Chen", party: 3, phone: "(408) 555-0178", status: "notified", quoted: 30, joinedMin: 28, pos: 0 },
  { name: "Walk-in · Patel", party: 2, phone: "(408) 555-0133", status: "seated", quoted: 20, joinedMin: 41, pos: 0 },
];

export const DEMO_CAMPAIGNS = [
  { id: "c1", name: "Málà Mondays", channel: "SMS", audience: "All members", sent: 1284, opened: 712, redeemed: 143, status: "Sent", date: "2025-11-03" },
  { id: "c2", name: "Wagyu Weekend Drop", channel: "Email", audience: "Blaze + Legend", sent: 274, opened: 198, redeemed: 61, status: "Sent", date: "2025-11-07" },
  { id: "c3", name: "Win-back: 60 days away", channel: "SMS", audience: "Lapsed", sent: 206, opened: 88, redeemed: 22, status: "Sent", date: "2025-11-12" },
  { id: "c4", name: "Lunar New Year Teaser", channel: "Email", audience: "All members", sent: 0, opened: 0, redeemed: 0, status: "Draft", date: "—" },
];

// ── Influencer CRM seed ──────────────────────────────────────
export const DEMO_INFLUENCERS = [
  { handle: "@bayareaeats", name: "Jenna Wu", platform: "Instagram", followers: 128000, niche: "Bay Area food", er: 4.8, city: "San Jose", fit: 94, status: "new", notes: "Posts hotpot & Sichuan often. High local overlap." },
  { handle: "@spicyszechuan", name: "Leo Tran", platform: "TikTok", followers: 342000, niche: "Spicy food challenges", er: 7.1, city: "San Francisco", fit: 91, status: "new", notes: "Spice challenges = perfect for málà pot." },
  { handle: "@siliconvalleyfoodie", name: "Mei Zhang", platform: "Instagram", followers: 76000, niche: "SV restaurants", er: 5.6, city: "Sunnyvale", fit: 97, status: "new", notes: "Literally covers Sunnyvale. Top fit." },
  { handle: "@noodlenomad", name: "Carlos Diaz", platform: "YouTube", followers: 210000, niche: "Asian cuisine reviews", er: 3.9, city: "Fremont", fit: 83, status: "new", notes: "Long-form reviews, loyal audience." },
  { handle: "@hotpotholic", name: "Amy Sato", platform: "TikTok", followers: 95000, niche: "Hotpot only", er: 8.3, city: "Santa Clara", fit: 96, status: "new", notes: "Niche is literally hotpot. Huge ER." },
  { handle: "@foodiecouplesf", name: "Dan & Rin", platform: "Instagram", followers: 154000, niche: "Date-night dining", er: 4.2, city: "San Francisco", fit: 79, status: "new", notes: "Great for couples / group dining angle." },
  { handle: "@collegeeatsSJSU", name: "Tyler Brooks", platform: "TikTok", followers: 58000, niche: "Student budget eats", er: 9.1, city: "San Jose", fit: 74, status: "new", notes: "Student audience, budget combos." },
  { handle: "@themichelinwannabe", name: "Olivia Park", platform: "Instagram", followers: 410000, niche: "Fine dining", er: 2.1, city: "San Francisco", fit: 58, status: "new", notes: "Big reach but low fit + low ER." },
];

export const AGENT_STEPS = [
  { label: "Connecting to discovery sources (Instagram, TikTok, YouTube)…", ms: 900 },
  { label: "Searching: 'hotpot', 'Sichuan', 'Bay Area food', 'Sunnyvale eats'…", ms: 1100 },
  { label: "Found 214 candidate creators within 30 mi of Sunnyvale", ms: 900 },
  { label: "Enriching profiles: follower count, engagement rate, recent posts…", ms: 1200 },
  { label: "Filtering out: fake-follower risk, <3% engagement, off-topic niche…", ms: 1000 },
  { label: "Scoring fit: locality + niche match + engagement + brand safety…", ms: 1100 },
  { label: "Ranked top 8 best-fit creators for the málà campaign", ms: 700 },
];

export function draftOutreachEmail(inf) {
  const first = inf.name.split(" ")[0];
  return `Subject: ${first}, come taste the legend at Feng Hotpot 🔥

Hi ${first},

I'm reaching out from Feng Hotpot (冯校长老火锅) in Sunnyvale — authentic Sichuan hot pot built around our signature red-oil málà broth. We love how you cover ${inf.niche.toLowerCase()} for your ${(inf.followers / 1000).toFixed(0)}K community, and your audience feels like a perfect match for us.

We'd love to host you and a guest for a complimentary tasting. If it's a fit, we can set you up on our Influencer Partner Program:
• A unique code that gives your followers a perk (and earns you a commission per visit)
• Priority skip-the-line waitlist passes
• A revenue share as you bring diners in

No strings on the first visit — just come eat and see if you love it. Would next week work for a tasting?

Warmly,
The Feng Hotpot Team
1669 Hollenbeck Ave, Sunnyvale, CA`;
}
