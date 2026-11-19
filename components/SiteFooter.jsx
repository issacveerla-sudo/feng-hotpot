import Link from "next/link";

// Update this to Feng Hotpot's real Instagram URL.
const INSTAGRAM_URL = "https://www.instagram.com/fenghotpot/";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-chili/20 bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="display text-2xl text-cream">
            <span className="text-chili">火</span> Feng Hotpot
          </div>
          <p className="mt-3 max-w-sm text-sm text-cream/60">
            Authentic Sichuan Hot Pot.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-chili text-white transition hover:bg-ember"
          >
            <InstagramIcon />
          </a>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-chili">Visit</div>
          <p className="mt-3 text-sm text-cream/70">
            1669 Hollenbeck Ave
            <br />
            Sunnyvale, CA
          </p>
          <div className="mt-4 text-xs font-bold uppercase tracking-widest text-chili">Hours</div>
          <p className="mt-2 text-sm text-cream/70">
            Lunch · Mon–Fri 11:30am–2pm
            <br />
            Lunch · Sat–Sun 11:30am–2:30pm
            <br />
            Dinner · Daily 5pm–9:30pm
          </p>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-chili">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-cream/70">
            <li><Link href="/menu" className="hover:text-white">Menu</Link></li>
            <li><Link href="/waitlist" className="hover:text-white">Join waitlist</Link></li>
            <li><Link href="/loyalty" className="hover:text-white">Loyalty program</Link></li>
            <li><Link href="/admin" className="hover:text-white">Owner login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Feng Hotpot · Taste the Legend
      </div>
    </footer>
  );
}
