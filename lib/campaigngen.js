// On-brand campaign content generator for Feng Hotpot.
// Produces ready-to-send marketing copy (name, subject, body) tuned to a
// goal, audience and channel — no external service required.

export const GOALS = [
  { id: "newdish", label: "New dish launch", detail: "Dish name (e.g. Wagyu Short Rib)" },
  { id: "winback", label: "Win back lapsed diners", detail: "" },
  { id: "weekend", label: "Fill the weekend rush", detail: "" },
  { id: "weekday", label: "Boost a slow weekday", detail: "Which day (e.g. Tuesday)" },
  { id: "holiday", label: "Holiday / Lunar New Year", detail: "Occasion (e.g. Lunar New Year)" },
  { id: "points", label: "Loyalty points boost", detail: "Bonus points (e.g. 2x)" },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const OPT = "Reply STOP to opt out.";

function build(goal, detail, audience) {
  const d = (detail || "").trim();
  switch (goal) {
    case "newdish": {
      const dish = d || "our new chef's special";
      return {
        names: [`${dish} Launch`, `New Drop: ${dish}`],
        subjects: [
          `🔥 ${dish} just hit the pot`,
          `New at Feng Hotpot: ${dish}`,
          `${dish} is here — be the first to try it`,
        ],
        hooks: [
          `We just added ${dish} to the menu and it's already turning heads.`,
          `Say hello to ${dish} — the newest reason to gather around the pot.`,
          `${dish} is officially on the menu at Feng Hotpot.`,
        ],
        cta: ["Come taste it this week.", "Swing by and swish it in the málà broth.", "First visit's calling."],
      };
    }
    case "winback":
      return {
        names: ["Win-back: We miss you", "Come back to the pot"],
        subjects: [
          "We saved you a seat at the pot 🔥",
          "It's been a while — here's a welcome-back treat",
          "Your málà broth is getting lonely",
        ],
        hooks: [
          "It's been too long since your last visit to Feng Hotpot.",
          "We miss you at the table — and the pot isn't the same without you.",
          "Life got busy, we get it. But the broth is still legendary.",
        ],
        cta: [
          "Come back this week and we'll add 200 bonus points to your account.",
          "Here's 200 bonus points to welcome you home.",
          "Show this message for a free appetizer on your next visit.",
        ],
      };
    case "weekend":
      return {
        names: ["Weekend Rush", "Weekend at Feng"],
        subjects: [
          "Weekend plans? Taste the legend 🔥",
          "Gather the crew — hotpot weekend is on",
          "Make it a hotpot weekend",
        ],
        hooks: [
          "Nothing beats a bubbling pot with your people on a weekend.",
          "Round up the crew — the weekend's made for hotpot.",
          "Fiery broth, fresh ingredients, good company. That's a Feng Hotpot weekend.",
        ],
        cta: [
          "Join the waitlist from your phone so you're seated faster.",
          "Reserve your spot and skip the line.",
          "Beat the rush — join the virtual waitlist before you arrive.",
        ],
      };
    case "weekday": {
      const day = d || "midweek";
      return {
        names: [`${day} Special`, `${day} Pick-me-up`],
        subjects: [
          `Make ${day} a málà ${day} 🌶️`,
          `${day} just got a lot more delicious`,
          `Beat the ${day} slump at Feng Hotpot`,
        ],
        hooks: [
          `Why wait for the weekend? ${day} is the perfect night for hotpot.`,
          `Turn an ordinary ${day} into a legendary one.`,
          `${day} nights are made for a fiery pot and good company.`,
        ],
        cta: [
          "Show this message for a free broth upgrade, this week only.",
          "Come in tonight and earn double points.",
          "Treat yourself — the pot's waiting.",
        ],
      };
    }
    case "holiday": {
      const occ = d || "the holidays";
      return {
        names: [`${occ} Feast`, `${occ} at Feng`],
        subjects: [
          `Celebrate ${occ} around the pot 🏮`,
          `${occ} feasting starts at Feng Hotpot`,
          `Gather for ${occ} — hotpot style`,
        ],
        hooks: [
          `There's no better way to celebrate ${occ} than a shared, bubbling pot.`,
          `${occ} is all about family, flavor and the table. We've got all three.`,
          `Bring everyone together for ${occ} at Feng Hotpot.`,
        ],
        cta: [
          "Book your table early — these nights fill up fast.",
          "Reserve now and join the waitlist to skip the line.",
          "Gather the family and taste the legend.",
        ],
      };
    }
    case "points": {
      const bonus = d || "2x";
      return {
        names: [`${bonus} Points Weekend`, `${bonus} Points Drop`],
        subjects: [
          `Earn ${bonus} points at Feng Hotpot 🔥`,
          `${bonus} the points, same legendary pot`,
          `Your points just got hotter`,
        ],
        hooks: [
          `For a limited time, every visit earns you ${bonus} loyalty points.`,
          `Stack rewards faster — ${bonus} points on every dollar this week.`,
          `Your next pot is worth ${bonus} the points.`,
        ],
        cta: [
          "Come in this week and watch your points climb toward free beef.",
          "Dine in, stack points, redeem for free hotpot.",
          "More visits, more points, more free hotpot.",
        ],
      };
    }
    default:
      return { names: ["Feng Hotpot"], subjects: ["Taste the legend"], hooks: [""], cta: [""] };
  }
}

// ── Full strategy plan (objective, audience, offer, cadence, KPIs) ──
const OBJECTIVES = {
  newdish: "Drive trial of a new menu item and generate social buzz in week one.",
  winback: "Re-activate lapsed members who haven't visited in 60+ days.",
  weekend: "Maximize covers during peak weekend service and reduce walk-away waits.",
  weekday: "Lift traffic on a historically slow weekday.",
  holiday: "Capture group and family bookings around a key occasion.",
  points: "Increase visit frequency by accelerating loyalty earn.",
};

const OFFERS = {
  newdish: "Early-access tasting + double points on the new dish, week one only.",
  winback: "200 bonus points + a free appetizer on the next visit.",
  weekend: "Priority waitlist + a free broth upgrade for parties of 4+.",
  weekday: "Free broth upgrade or double points, that day only.",
  holiday: "Reserved seating + a complimentary plum juice round for the table.",
  points: "Limited-time bonus points on every visit.",
};

function cadence(goal, channel) {
  const c = channel === "Email" ? "Email" : channel;
  if (goal === "winback")
    return [
      { when: "Day 0", channel: c, purpose: "“We miss you” + bonus points offer" },
      { when: "Day 4", channel: "SMS", purpose: "Reminder: points expiring soon" },
      { when: "Day 8", channel: c, purpose: "Last call before the offer ends" },
    ];
  if (goal === "weekend")
    return [
      { when: "Thursday", channel: c, purpose: "Weekend teaser + join-waitlist link" },
      { when: "Friday PM", channel: "SMS", purpose: "Tonight/tomorrow reminder" },
      { when: "Saturday AM", channel: "Push", purpose: "Day-of nudge to beat the rush" },
    ];
  return [
    { when: "Day 0", channel: c, purpose: "Announce the offer" },
    { when: "Day 3", channel: "SMS", purpose: "Mid-flight reminder" },
    { when: "Day 6", channel: c, purpose: "Last-call before it ends" },
  ];
}

function kpis(channel) {
  if (channel === "Email")
    return [
      { metric: "Open rate", target: "35–45%" },
      { metric: "Click-through", target: "6–10%" },
      { metric: "Redemption", target: "4–8%" },
    ];
  return [
    { metric: "Delivery rate", target: "97%+" },
    { metric: "Click-through", target: "8–14%" },
    { metric: "Redemption", target: "5–10%" },
  ];
}

export function generatePlan({ goal, detail, channel = "SMS", audience = "All members", audienceSize = 0 }) {
  const variants = generateCampaign({ goal, detail, channel, audience });
  const goalMeta = GOALS.find((g) => g.id === goal);
  const estRedemption = Math.max(1, Math.round(audienceSize * 0.07));
  return {
    title: goalMeta ? goalMeta.label : "Campaign",
    objective: OBJECTIVES[goal] || "Drive visits and engagement.",
    audience: {
      segment: audience,
      size: audienceSize,
      why:
        audience === "All members"
          ? "Broadest reach for a time-sensitive offer."
          : `Focused on ${audience.toLowerCase()} — higher relevance and response.`,
    },
    offer: OFFERS[goal] || "A limited-time perk to drive a visit.",
    channels: cadence(goal, channel),
    kpis: kpis(channel),
    projection: `~${estRedemption} redemptions at a 7% rate across ${audienceSize || "your"} members.`,
    variants,
  };
}

export function generateCampaign({ goal, detail, channel = "SMS", audience = "All members" }) {
  const t = build(goal, detail, audience);
  const audienceLine =
    audience && audience !== "All members" ? ` (${audience.toLowerCase()})` : "";

  // Two distinct variants: punchy vs. warm
  const variants = [0, 1].map((k) => {
    const name = t.names[k % t.names.length];
    const subject = t.subjects[(k) % t.subjects.length];
    const hook = pick(t.hooks);
    const cta = pick(t.cta);

    let body;
    if (channel === "SMS") {
      body = `Feng Hotpot: ${hook} ${cta} ${OPT}`;
    } else if (channel === "Email") {
      body = `Hi there,

${hook}

${cta}

See you around the pot,
The Feng Hotpot Team
1669 Hollenbeck Ave, Sunnyvale, CA
${OPT}`;
    } else {
      body = `${hook} ${cta}`;
    }
    return { name: name + audienceLine, subject, body };
  });

  return variants;
}
