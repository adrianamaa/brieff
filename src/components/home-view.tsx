"use client";

import Link from "next/link";
import { Kicker, SectionHead } from "./recap-view";
import { Check, Sparkle, ArrowRight, Phone, NotePencil } from "@phosphor-icons/react";
import { todayAgenda, weekStats, accounts, type AgendaItem } from "@/lib/data";

const nextUp = todayAgenda.find((m) => m.status === "upcoming");
// resolve the meeting's account so the card never shows another deal's people
const nextAccount = nextUp?.accountId ? accounts[nextUp.accountId] : undefined;
const hoursSaved = Math.round((weekStats.minutesSaved / 60) * 10) / 10;
const pipelineValue = todayAgenda.reduce((sum, m) => sum + m.amount, 0);

const card = "bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)]";

/* a meeting as a vertical card — these sit side-by-side to fill width */
function MeetingCard({ m }: { m: AgendaItem }) {
  const done = m.needs === "done";
  return (
    <div className={`${card} p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm text-muted tabular-nums">
          <span className={`h-1.5 w-1.5 rounded-full ${m.status === "upcoming" ? "bg-accent" : "bg-line"}`} /> {m.time}
        </span>
        {done && <span className="inline-flex items-center gap-1 text-xs text-faint"><Check weight="bold" className="h-3.5 w-3.5" /> Done</span>}
      </div>
      <div className="min-w-0">
        <p className={`text-base font-medium leading-snug ${done ? "text-muted" : "text-ink"}`}>{m.account}</p>
        <p className="text-[13px] text-muted mt-0.5">{m.type} · {m.attendees} attendees</p>
        <p className="text-[13px] text-muted">${m.amount.toLocaleString()} · {m.stage}</p>
      </div>
      {m.needs === "prep" && m.href && (
        <Link href={m.href} className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-ink transition-colors">
          <Sparkle weight="fill" className="h-3.5 w-3.5" /> Prep for this call
        </Link>
      )}
      {m.needs === "recap" && m.href && (
        <Link href={m.href} className="mt-auto inline-flex items-center justify-center rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-canvas transition-colors">Write recap</Link>
      )}
      {m.needs === "recap" && !m.href && (
        <div className="mt-auto rounded-lg bg-canvas py-2 text-center text-sm font-medium text-faint">Recap pending</div>
      )}
      {done && <div className="mt-auto rounded-lg bg-canvas py-2 text-center text-sm font-medium text-faint">Recap sent</div>}
    </div>
  );
}

function QuickLink({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link href={href} className={`${card} group flex items-center gap-3 p-4 transition-colors hover:border-accent/40`}>
      <span className="grid place-items-center h-10 w-10 rounded-lg bg-accent-soft text-accent shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-faint group-hover:text-accent transition-colors" />
    </Link>
  );
}

export default function HomeView() {
  return (
    <div className="max-w-[1800px] px-6 lg:px-10 py-8 space-y-7">
      {/* header */}
      <header className="px-0.5">
        <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-accent">Workspace</p>
        <h1 className="text-[28px] font-semibold text-ink tracking-tight leading-[1.15] mt-1.5">Good afternoon</h1>
        <p className="text-[15px] text-muted mt-1.5 max-w-xl">Brieff preps your calls and drafts your follow-ups — so you walk in ready and leave with the admin already done. Here&apos;s your day.</p>
      </header>

      {/* top row: next up (wide) + this-week stat — side by side on large screens */}
      <div className="grid gap-5 xl:grid-cols-3 items-start">
        {nextUp && (
        <div className="xl:col-span-2 rounded-xl border border-accent/25 bg-surface p-5 shadow-[0_1px_2px_rgba(24,18,31,0.04),0_8px_24px_-12px_rgba(124,58,237,0.18)]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-accent">Next up · {nextUp.time}</p>
              <h2 className="text-lg font-semibold text-ink mt-1.5">{nextUp.type} · {nextUp.account}</h2>
              <p className="text-[13px] text-muted mt-1">{nextUp.attendees} attendees · ${nextUp.amount.toLocaleString()} · {nextUp.stage} stage</p>
            </div>
            {nextUp.href && (
              <Link href={nextUp.href} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-ink transition-colors">
                <Sparkle weight="fill" className="h-3.5 w-3.5" /> Prep for this call
              </Link>
            )}
          </div>
          {nextAccount && (
            <div className="mt-4 pt-4 border-t border-line-soft flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  {nextAccount.contacts.map((c) => (
                    <span key={c.id} className="grid place-items-center h-7 w-7 rounded-full bg-canvas border border-line text-[10px] font-semibold text-muted ring-2 ring-surface">{c.name.split(" ").map((n) => n[0]).join("")}</span>
                  ))}
                </div>
                <span className="text-[13px] text-muted">{nextAccount.contacts.map((c) => c.name.split(" ")[0]).join(", ")}</span>
              </div>
              {nextUp.focus && <span className="inline-flex items-center gap-1.5 text-[13px] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-warn" /> Focus: {nextUp.focus}</span>}
            </div>
          )}
        </div>
        )}

        <div className={`${card} p-5`}>
          <Kicker>This week</Kicker>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-semibold text-ink tracking-tight">{hoursSaved}h</span>
            <span className="text-[13px] text-muted">of admin saved</span>
          </div>
          <ul className="mt-4 pt-4 border-t border-line-soft space-y-2.5">
            <li className="flex items-baseline justify-between"><span className="text-[13px] text-muted">Follow-ups sent</span><span className="text-sm font-medium text-ink tabular-nums">{weekStats.followUpsSent}</span></li>
            <li className="flex items-baseline justify-between"><span className="text-[13px] text-muted">Meetings prepped</span><span className="text-sm font-medium text-ink tabular-nums">{weekStats.meetingsPrepped}</span></li>
            <li className="flex items-baseline justify-between"><span className="text-[13px] text-muted">Pipeline in play</span><span className="text-sm font-medium text-ink tabular-nums">${(pipelineValue / 1000).toFixed(0)}k</span></li>
          </ul>
        </div>
      </div>

      {/* today's meetings — cards laid side by side */}
      <section>
        <SectionHead kicker="Today" title="Your meetings" right={<span className="text-xs text-muted">{todayAgenda.length} scheduled</span>} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {todayAgenda.map((m) => <MeetingCard key={m.id} m={m} />)}
        </div>
      </section>

      {/* jump in — action cards across the width */}
      <section>
        <SectionHead kicker="Jump in" title="Quick actions" />
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickLink href="/prep" icon={<Phone className="h-4 w-4" />} label="Prep a call" sub="Walk in ready" />
          <QuickLink href="/recap" icon={<NotePencil className="h-4 w-4" />} label="Write a recap" sub="Close out fast" />
        </div>
      </section>
    </div>
  );
}
