"use client";

// Thin client helper that calls the /api/sms route.
// Returns { ok, simulated?, error? }. Never throws.
export async function sendSms(to, message) {
  try {
    const res = await fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export function joinMessage(name, pos, quoted) {
  return `Feng Hotpot: Hi ${name.split(" ")[0]}, you're #${pos} on the waitlist (~${quoted} min). We'll text you when your table is ready. Reply STOP to opt out.`;
}

export function readyMessage(name) {
  return `Feng Hotpot: ${name.split(" ")[0]}, your table is ready! Please head to the host stand in the next 10 minutes. 🔥`;
}
