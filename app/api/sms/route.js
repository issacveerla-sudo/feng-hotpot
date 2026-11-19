// Server route that sends an SMS via Twilio.
// Configure these in Vercel (Server-side, NOT NEXT_PUBLIC):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (e.g. +14085550123)
// If they're missing, it no-ops and reports { simulated: true } so the
// app keeps working without a texting provider wired up.

// Normalize a US phone number to E.164 (+1XXXXXXXXXX), which Twilio requires.
function toE164(raw) {
  const s = String(raw).trim();
  if (s.startsWith("+")) return s;
  const d = s.replace(/\D/g, "");
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d.startsWith("1")) return "+" + d;
  return d ? "+" + d : "";
}

export async function POST(req) {
  let to, message;
  try {
    ({ to, message } = await req.json());
  } catch {
    return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!to || !message) {
    return Response.json({ ok: false, error: "Missing 'to' or 'message'" }, { status: 400 });
  }
  to = toE164(to);

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  // No provider configured → simulate success so the UI flow still works.
  if (!sid || !token || !from) {
    return Response.json({ ok: true, simulated: true });
  }

  try {
    const body = new URLSearchParams({ To: to, From: from, Body: message });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return Response.json({ ok: false, error: data.message || "Send failed" }, { status: 400 });
    }
    return Response.json({ ok: true, sid: data.sid });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
