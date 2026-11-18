"use client";

import Link from "next/link";
import { useState } from "react";
import { ORDER_URL } from "@/lib/supabaseClient";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/waitlist", label: "Waitlist" },
  { href: "/loyalty", label: "Loyalty" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* left */}
        <nav className="hidden items-center gap-2 md:flex">
          {LINKS.slice(0, 2).map((l) => (
            <Link key={l.href} href={l.href} className="pill-ghost">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* center logo */}
        <Link href="/" className="flex select-none flex-col items-center leading-none">
          <span className="display text-3xl text-chili drop-shadow">火</span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.3em] text-cream/70">
            Feng Hotpot
          </span>
        </Link>

        {/* right */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/loyalty" className="pill-ghost">
            Loyalty
          </Link>
          <a href={ORDER_URL} target="_blank" rel="noreferrer" className="pill-red">
            Order Now
          </a>
        </nav>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="pill-ghost md:hidden"
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="mx-4 mb-3 flex flex-col gap-2 rounded-2xl border border-white/10 bg-charcoal/95 p-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="pill-ghost w-full"
            >
              {l.label}
            </Link>
          ))}
          <a href={ORDER_URL} target="_blank" rel="noreferrer" className="pill-red w-full">
            Order Now
          </a>
        </div>
      )}
    </header>
  );
}
