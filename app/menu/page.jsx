import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { MENU } from "@/lib/menu";
import { ORDER_URL } from "@/lib/supabaseClient";

function Heat({ level }) {
  if (!level) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-0.5 align-middle">
      {Array.from({ length: level }).map((_, i) => (
        <span key={i} className="heat-dot" style={{ background: "#E23B2E" }} />
      ))}
    </span>
  );
}

export const metadata = { title: "Menu · Feng Hotpot" };

export default function MenuPage() {
  return (
    <main className="bg-ember-field min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-5xl px-4 pb-6 pt-8 text-center">
        <h1 className="display text-5xl text-cream md:text-6xl">The Menu</h1>
        <p className="mx-auto mt-3 max-w-xl text-cream/60">
          Build your pot — choose a broth, pile in premium meats, handmade bites and
          garden-fresh veg. Heat dots show the spice level.
        </p>
        <a href={ORDER_URL} target="_blank" rel="noreferrer" className="pill-red mt-6">
          Order online →
        </a>
      </section>

      <section className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        {MENU.map((cat) => (
          <div key={cat.category} className="card p-6 md:p-8">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <h2 className="display text-2xl text-flame">{cat.category}</h2>
              <span className="text-sm text-cream/50">{cat.blurb}</span>
            </div>
            <div className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
              {cat.items.map((it) => (
                <div key={it.name} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-cream">
                      {it.name}
                      <Heat level={it.heat} />
                      {it.tag && (
                        <span className="ml-2 rounded-full bg-chili/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-chili">
                          {it.tag}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-cream/55">{it.desc}</div>
                  </div>
                  <div className="shrink-0 font-bold text-gold">{it.price}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}
