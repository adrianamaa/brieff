"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const path = usePathname();
  const tabs = [
    { href: "/", label: "Home" },
    { href: "/prep", label: "Prep" },
    { href: "/recap", label: "Recap" },
  ];
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2">
            <img src="/brieff-wordmark.svg" alt="Brieff" className="h-6 w-auto" />
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = path === t.href;
              return (
                <Link key={t.href} href={t.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${active ? "bg-accent-soft text-accent" : "text-muted hover:text-ink hover:bg-line-soft"}`}>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <span className="grid place-items-center h-8 w-8 rounded-full bg-accent-soft text-accent text-xs font-semibold">AE</span>
      </div>
    </header>
  );
}
