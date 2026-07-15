"use client";

import { useState } from "react";
import { ContextRail, Icon, tagMeta, tagDot } from "./recap-view";
import { Copy, CaretDown } from "@phosphor-icons/react";
import type { Account, PrepBrief } from "@/lib/data";

const roleLabel: Record<string, string> = { champion: "Champion", economic_buyer: "Economic buyer", blocker: "Blocker", influencer: "Influencer" };
const roleDot: Record<string, string> = {
  champion: "bg-positive", economic_buyer: "bg-accent", blocker: "bg-warn", influencer: "bg-faint",
};
const rsvpMeta: Record<string, { label: string; dot: string }> = {
  accepted: { label: "Accepted", dot: "bg-positive" },
  tentative: { label: "Tentative", dot: "bg-warn" },
  "no-response": { label: "No response", dot: "bg-faint" },
};
const flip = (set: Set<string>, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); return n; };

const CopyIcon = (p: { className?: string }) => <Copy className={p.className} />;
const Chevron = (p: { className?: string }) => <CaretDown className={p.className} />;

/* one checkable row — used by both the prep-actions and talking-points lists */
function ChecklistItem({ done, onToggle, text }: { done: boolean; onToggle: () => void; text: string }) {
  return (
    <li>
      <button type="button" onClick={onToggle} aria-pressed={done} className="w-full flex items-start gap-3 rounded-lg -mx-2 px-2 py-2 text-left hover:bg-canvas transition-colors cursor-pointer">
        <span aria-hidden className={`mt-0.5 grid place-items-center h-5 w-5 shrink-0 rounded-md border transition-colors ${done ? "bg-accent border-accent text-white" : "border-line text-transparent"}`}>
          <Icon.check className="h-3 w-3" />
        </span>
        <span className={`text-[15px] leading-snug ${done ? "text-faint line-through" : "text-ink"}`}>{text}</span>
      </button>
    </li>
  );
}

/* section header — small uppercase kicker + 18px title */
function Kick({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold tracking-[0.07em] uppercase text-accent shrink-0">{children}</span>;
}

/* collapsible section — lets the rep jump instead of reading everything */
function Section({ kicker, title, meta, defaultOpen = false, children }: { kicker: string; title: string; meta?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)] overflow-hidden">
      <button aria-expanded={open} onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-canvas/50 transition-colors">
        <span className="flex items-baseline gap-2 min-w-0">
          <Kick>{kicker}</Kick>
          <span className="text-[17px] font-medium text-ink leading-tight truncate">{title}</span>
        </span>
        <span className="flex items-center gap-2.5 text-muted shrink-0">
          {meta && <span className="text-xs tabular-nums">{meta}</span>}
          <Chevron className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div className="px-5 pb-5 -mt-1">{children}</div>}
    </div>
  );
}

/* one supporting insight — bold 16px lead visible, rationale + source collapsed */
function MustKnowItem({ index, item }: { index: number; item: PrepBrief["mustKnow"][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center gap-3 py-3 text-left">
        <span className="grid place-items-center h-6 w-6 shrink-0 rounded-full bg-accent-soft text-accent text-xs font-semibold">{index}</span>
        <span className="flex-1 text-base font-medium text-ink leading-snug">{item.lead}</span>
        {item.tag && <span className="inline-flex items-center gap-1.5 text-[11px] text-faint shrink-0"><span className={`h-1.5 w-1.5 rounded-full ${tagDot[item.tag]}`} /> {tagMeta[item.tag].label}</span>}
        <Chevron className={`h-4 w-4 text-faint shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pl-9 pb-3 -mt-1">
          <p className="text-[15px] text-muted leading-relaxed">{item.detail}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-faint"><Icon.link className="h-3 w-3" /> {item.sourceLabel}</span>
        </div>
      )}
    </li>
  );
}

export default function PrepView({ account, prep }: { account: Account; prep: PrepBrief }) {
  const [covered, setCovered] = useState<Set<string>>(new Set());
  const [doneActions, setDoneActions] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  function copy(id: string, text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200);
  }

  return (
    <div className="max-w-[1800px] px-6 lg:px-10 py-7">
      {/* full-width header */}
      <header className="flex items-start justify-between gap-4 px-0.5 mb-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-accent">Pre-call prep</p>
          <h1 className="text-[23px] font-semibold text-ink tracking-tight leading-[1.2] mt-1.5">{prep.meeting.title} · {account.name}</h1>
          <p className="text-[15px] text-muted mt-1.5">{prep.meeting.when} · {prep.attendees.length} attendees</p>
          <p className="text-[13px] text-faint mt-1"><span className="font-medium text-muted">Goal</span> · {prep.meeting.purpose}</p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[15px] font-medium text-white hover:bg-accent-ink transition-colors">
          <Icon.phone className="h-4 w-4" /> Start call
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[260px_minmax(0,1fr)]">
        <ContextRail account={account} />

        {/* content distributes into a balanced 2-up grid — comfortable, not stretched */}
        <div className="min-w-0 grid gap-5 xl:grid-cols-2 items-start">
          {/* hero: 1 primary message + 3 supporting leads (detail collapsed) */}
          <div className="bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)] p-5">
            <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-accent mb-2.5">Walk in knowing</p>
            <p className="text-lg font-semibold text-ink leading-snug">{prep.primaryInsight}</p>
            <p className="text-[15px] text-muted leading-relaxed mt-1.5">{prep.primarySupport}</p>
            <ul className="mt-4 border-t border-line-soft divide-y divide-line-soft">
              {prep.mustKnow.map((k, i) => <MustKnowItem key={k.id} index={i + 1} item={k} />)}
            </ul>
          </div>

          {/* who's in the room — readable but calm */}
          <div className="bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)] p-5">
            <div className="flex items-baseline gap-2 mb-3.5">
              <Kick>In the room</Kick>
              <span className="text-[17px] font-medium text-ink leading-tight">Attendees</span>
            </div>
            <ul className="divide-y divide-line-soft">
              {prep.attendees.map((a) => (
                <li key={a.id} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                  <span className="grid place-items-center h-9 w-9 rounded-full bg-canvas border border-line text-xs font-semibold text-muted shrink-0">{a.name.split(" ").map((n) => n[0]).join("")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-medium text-ink leading-snug">{a.name}</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted"><span className={`h-1.5 w-1.5 rounded-full ${roleDot[a.role]}`} /> {roleLabel[a.role]}</span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-faint shrink-0"><span className={`h-1.5 w-1.5 rounded-full ${rsvpMeta[a.rsvp].dot}`} /> {rsvpMeta[a.rsvp].label}</span>
                    </div>
                    <p className="text-[13px] text-faint mt-0.5">{a.title}</p>
                    <p className="text-[15px] text-muted mt-1.5 leading-relaxed">{a.angle}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* layered, collapsible — jump instead of read-all */}
          <Section kicker="Before you join" title="Prep actions" meta={`${doneActions.size}/${prep.prepActions.length} ready`}>
            <ul className="space-y-1">
              {prep.prepActions.map((p) => (
                <ChecklistItem key={p.id} done={doneActions.has(p.id)} onToggle={() => setDoneActions((s) => flip(s, p.id))} text={p.text} />
              ))}
            </ul>
          </Section>

          <Section kicker="On the call" title="Talking points" meta={`${covered.size}/${prep.talkingPoints.length} covered`}>
            <ul className="space-y-1">
              {prep.talkingPoints.map((t) => (
                <ChecklistItem key={t.id} done={covered.has(t.id)} onToggle={() => setCovered((s) => flip(s, t.id))} text={t.text} />
              ))}
            </ul>
          </Section>

          <Section kicker="Be ready for" title="Likely objections" meta={`${prep.objections.length}`}>
            <ul className="divide-y divide-line-soft">
              {prep.objections.map((o) => (
                <li key={o.id} className="py-3.5 first:pt-1 last:pb-0">
                  <p className="flex gap-2 text-[15px] font-medium text-ink leading-snug">
                    <span className="text-faint shrink-0" aria-hidden>“</span>
                    <span>{o.objection.replace(/^“|”$/g, "")}</span>
                  </p>
                  <p className="mt-1.5 pl-4 flex gap-2 text-[15px] text-muted leading-relaxed">
                    <span className="text-accent font-medium shrink-0">Counter</span>
                    <Icon.arrow className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{o.response}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section kicker="Discovery" title="Smart questions to ask" meta={`${prep.questions.length}`}>
            <ul className="space-y-1">
              {prep.questions.map((q) => (
                <li key={q.id} className="group flex items-start gap-3 rounded-lg -mx-2 px-2 py-2 hover:bg-canvas transition-colors">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="flex-1 text-[15px] text-ink leading-snug">{q.text}</span>
                  <button onClick={() => copy(q.id, q.text)} title="Copy question"
                    className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-accent hover:bg-accent-soft opacity-0 group-hover:opacity-100 transition-all">
                    {copied === q.id ? <><Icon.check className="h-3 w-3" /> Copied</> : <><CopyIcon className="h-3 w-3" /> Copy</>}
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <p className="flex items-center gap-1.5 text-xs text-faint px-1 pt-1">
            <Icon.spark className="h-3 w-3 shrink-0" />
            Prepared by Brieff AI from {account.activities.length} records. Skim it, trust your read of the room.
          </p>
        </div>
      </div>
    </div>
  );
}
