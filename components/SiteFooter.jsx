import Link from "next/link";

function Social({ label, children, href = "#" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-chili text-white transition hover:bg-ember"
    >
      {children}
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="display text-2xl text-cream">
            <span className="text-chili">火</span> Feng Hotpot
          </div>
          <p className="mt-3 max-w-sm text-sm text-cream/60">
            冯校长老火锅 · Authentic Sichuan hot pot. Signature red-oil málà broth,
            fresh ingredients, legendary heat.
          </p>
          <div className="mt-5 flex gap-3">
            <Social label="Instagram">◎</Social>
            <Social label="TikTok">♪</Social>
            <Social label="YouTube">▶</Social>
            <Social label="Facebook">f</Social>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-flame">Visit</div>
          <p className="mt-3 text-sm text-cream/70">
            1669 Hollenbeck Ave
            <br />
            Sunnyvale, CA
            <br />
            Open daily · 11am–11pm
          </p>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-flame">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-cream/70">
            <li><Link href="/menu" className="hover:text-white">Menu</Link></li>
            <li><Link href="/waitlist" className="hover:text-white">Join waitlist</Link></li>
            <li><Link href="/loyalty" className="hover:text-white">Loyalty program</Link></li>
            <li><Link href="/admin" className="hover:text-white">Owner login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Feng Hotpot · Taste the Legend · Prototype
      </div>
    </footer>
  );
}
