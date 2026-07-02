"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ClipboardText, FileText, type Icon as PhosphorIcon } from "@phosphor-icons/react";

const nav: { href: string; label: string; icon: PhosphorIcon }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/prep", label: "Prep", icon: ClipboardText },
  { href: "/recap", label: "Recap", icon: FileText },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="flex min-h-screen">
      {/* sidebar — desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col sticky top-0 h-screen border-r border-line bg-surface">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-line">
          <img src="/brieff-wordmark.svg" alt="Brieff" className="h-6 w-auto" />
        </div>
        <nav className="flex-1 p-3">
          <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-faint">Workspace</p>
          <div className="space-y-0.5">
            {nav.map((n) => {
              const active = isActive(n.href);
              return (
                <Link key={n.href} href={n.href}
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-[15px] font-medium transition-colors ${active ? "bg-accent-soft text-accent" : "text-muted hover:text-ink hover:bg-line-soft"}`}>
                  <n.icon weight={active ? "fill" : "regular"} className="h-5 w-5" /> {n.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="grid place-items-center h-8 w-8 rounded-full bg-accent-soft text-accent text-xs font-semibold shrink-0">AE</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink truncate">Account Exec</span>
              <span className="block text-xs text-muted truncate">Northwind &amp; 11 more</span>
            </span>
          </div>
        </div>
      </aside>

      {/* main column */}
      <div className="flex-1 min-w-0">
        {/* mobile top bar */}
        <header className="md:hidden sticky top-0 z-10 h-14 flex items-center justify-between px-4 border-b border-line bg-canvas/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <img src="/brieff-wordmark.svg" alt="Brieff" className="h-6 w-auto" />
          </div>
          <nav className="flex items-center gap-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium ${isActive(n.href) ? "bg-accent-soft text-accent" : "text-muted"}`}>{n.label}</Link>
            ))}
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
