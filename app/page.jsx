import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import HeroBowl from "@/components/HeroBowl";
import { MENU, TIERS } from "@/lib/menu";
import { ORDER_URL } from "@/lib/supabaseClient";

export default function HomePage() {
  return (
    <main className="bg-ember-field min-h-screen">
      <SiteNav />

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
              🌶️ Sichuan Hot Pot · Sunnyvale
            </div>
            <h1 className="display hero-type text-6xl leading-[0.92] sm:text-7xl md:text-8xl">
              Taste the
              <br />
              Legend
            </h1>
            <p className="display mt-3 text-2xl text-chili sm:text-3xl">at Feng Hotpot</p>
            <p className="mt-6 max-w-md text-base text-cream/70">
              冯校长老火锅 brings the fierce soul of Chengdu to the Bay. Our signature
              red-oil málà broth burns brighter — and tastes deeper — than any pot you've known.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={ORDER_URL} target="_blank" rel="noreferrer" className="pill-red text-base">
                Order Now →
              </a>
              <Link href="/waitlist" className="pill-ghost text-base">
                Join the Waitlist
              </Link>
              <Link href="/loyalty" className="pill-ghost text-base">
                Join Loyalty
              </Link>
            </div>
          </div>

          <div className="relative">
            <HeroBowl />
          </div>
        </div>
      </section>

      {/* ───────────────────────── LEGEND STRIP ───────────────────────── */}
      <section className="border-y border-white/10 bg-black/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center md:grid-cols-4">
          {[
            ["15×", "tables turned daily at the original"],
            ["5 hrs", "legendary peak wait in Chengdu"],
            ["#1", "red-oil málà broth"],
            ["4.8★", "what guests say"],
          ].map(([big, small]) => (
            <div key={small}>
              <div className="display text-3xl text-flame">{big}</div>
              <div className="mt-1 text-xs text-cream/60">{small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── MENU PREVIEW ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="display text-4xl text-cream">The Pot</h2>
            <p className="mt-2 text-cream/60">Pick your broth. Build your feast.</p>
          </div>
          <Link href="/menu" className="pill-ghost">Full menu →</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MENU.slice(0, 3).map((cat) => (
            <Link
              key={cat.category}
              href="/menu"
              className="card group p-6 transition hover:border-chili/50"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-flame">
                {cat.category}
              </div>
              <p className="mt-2 text-sm text-cream/60">{cat.blurb}</p>
              <ul className="mt-4 space-y-2">
                {cat.items.slice(0, 3).map((it) => (
                  <li key={it.name} className="flex justify-between text-sm">
                    <span className="text-cream/90">{it.name}</span>
                    <span className="text-gold">{it.price}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-sm font-semibold text-chili opacity-0 transition group-hover:opacity-100">
                See all →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────────────────── LOYALTY TEASER ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="card overflow-hidden">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-flame">
                Rewards
              </div>
              <h2 className="display mt-2 text-4xl text-cream">Earn as you eat</h2>
              <p className="mt-3 max-w-md text-cream/70">
                Join the Feng Hotpot loyalty program — rack up points on every visit,
                every game you play while you wait, and unlock free beef, broth upgrades,
                and skip-the-line passes.
              </p>
              <Link href="/loyalty" className="pill-red mt-6">Join free →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TIERS.map((t) => (
                <div key={t.name} className="panel p-4">
                  <div className="flex items-center gap-2">
                    <span className="heat-dot" style={{ background: t.color }} />
                    <span className="font-bold text-cream">{t.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-cream/50">{t.min}+ pts</div>
                  <div className="mt-2 text-sm text-cream/70">{t.perk}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── WAITLIST TEASER ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="order-2 grid grid-cols-3 gap-3 md:order-1">
            {["🫕", "🌶️", "🧠", "🎯", "🀄", "🏆"].map((e, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-4xl"
              >
                {e}
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <div className="text-xs font-bold uppercase tracking-widest text-flame">
              No more boring waits
            </div>
            <h2 className="display mt-2 text-4xl text-cream">Play while the pot heats</h2>
            <p className="mt-3 max-w-md text-cream/70">
              Join the virtual waitlist from your phone, watch your spot in real time,
              and pass the time with hotpot mini-games — Catch the Ingredients, Spice
              Trivia, and Memory Match. Every game earns loyalty points.
            </p>
            <Link href="/waitlist" className="pill-red mt-6">Join the waitlist →</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
