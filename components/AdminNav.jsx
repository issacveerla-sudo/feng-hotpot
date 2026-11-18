"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminSignOut } from "@/lib/admin";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/waitlist", label: "Waitlist", icon: "⏳" },
  { href: "/admin/loyalty", label: "Loyalty", icon: "🎁" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "📣" },
  { href: "/admin/influencers", label: "Influencers", icon: "⭐" },
];

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-black/40 p-4">
      <Link href="/admin" className="flex items-center gap-2 px-2 py-2">
        <span className="display text-2xl text-chili">火</span>
        <div className="leading-tight">
          <div className="font-bold text-cream">Feng Hotpot</div>
          <div className="text-[10px] uppercase tracking-widest text-cream/40">Owner HQ</div>
        </div>
      </Link>

      <nav className="mt-6 space-y-1">
        {NAV.map((n) => {
          const active = path === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active ? "bg-chili text-white" : "text-cream/70 hover:bg-white/5 hover:text-cream"
              }`}
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/60 hover:bg-white/5">
          ↗ View live site
        </Link>
        <button
          onClick={async () => { await adminSignOut(); router.push("/admin/login"); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/60 hover:bg-white/5"
        >
          ⎋ Sign out
        </button>
      </div>
    </aside>
  );
}
