"use client";

import { useState } from "react";
import { sampleCallNotes, type Account, type RecapResult, type SummaryPoint, type Activity } from "@/lib/data";
import { LinkSimple, Check, ArrowRight, Sparkle, PencilSimple, X, ArrowsClockwise, Phone, Envelope, Note, Clock } from "@phosphor-icons/react";

/* — shared icon set (Phosphor; regular weight, fill for emphasis) — */
export const Icon = {
  link: (p: { className?: string }) => <LinkSimple className={p.className} />,
  check: (p: { className?: string }) => <Check weight="bold" className={p.className} />,
  arrow: (p: { className?: string }) => <ArrowRight className={p.className} />,
  spark: (p: { className?: string }) => <Sparkle weight="fill" className={p.className} />,
  edit: (p: { className?: string }) => <PencilSimple className={p.className} />,
  x: (p: { className?: string }) => <X className={p.className} />,
  refresh: (p: { className?: string }) => <ArrowsClockwise className={p.className} />,
  phone: (p: { className?: string }) => <Phone className={p.className} />,
  mail: (p: { className?: string }) => <Envelope className={p.className} />,
  note: (p: { className?: string }) => <Note className={p.className} />,
  clock: (p: { className?: string }) => <Clock className={p.className} />,
};

const activityIcon: Record<string, (p: { className?: string }) => React.ReactElement> = {
  call: Icon.phone, email: Icon.mail, note: Icon.note, meeting: Icon.phone,
};

const roleLabel: Record<string, string> = {
  champion: "Champion", economic_buyer: "Economic buyer", blocker: "Blocker", influencer: "Influencer",
};
const roleTone: Record<string, string> = {
  champion: "bg-positive-soft text-positive", economic_buyer: "bg-accent-soft text-accent",
  blocker: "bg-warn-soft text-warn", influencer: "bg-line-soft text-muted",
};

// sales-intelligence signal tags (adapted from Sales Copilot's mention surfacing)
// quiet dot + label — consistent with the Prep screen
const tagMeta: Record<string, { label: string }> = {
  risk: { label: "Risk" }, competitor: { label: "Competitor" }, signal: { label: "Buying signal" },
};
const tagDot: Record<string, string> = { risk: "bg-warn", competitor: "bg-red-500", signal: "bg-positive" };

const ownerInitials = (name: string) => (name === "You" ? "AE" : name.split(" ").map((n) => n[0]).join(""));

export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-muted mb-2.5">{children}</p>;
}
export function SectionHead({ kicker, title, right }: { kicker: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] font-semibold tracking-[0.07em] uppercase text-accent">{kicker}</span>
        <span className="text-[17px] font-medium text-ink">{title}</span>
      </div>
      {right}
    </div>
  );
}
function IconBtn({ label, onClick, children, busy }: { label: string; onClick: () => void; children: React.ReactNode; busy?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      className="grid place-items-center h-7 w-7 rounded-md text-faint hover:text-accent hover:bg-accent-soft transition-colors">
      {busy ? <span className="h-3.5 w-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin" /> : children}
    </button>
  );
}

/* — LEFT CONTEXT RAIL — */
const STAGES = ["Discovery", "Demo", "Proposal", "Negotiation"];
export function ContextRail({ account }: { account: Account }) {
  const o = account.opportunity;
  const stageIdx = STAGES.indexOf(o.stage);
  const healthTone = { green: "bg-positive", yellow: "bg-warn", red: "bg-red-500" }[o.health];
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)] divide-y divide-line">
      <div className="p-4">
        <h2 className="text-[15px] font-semibold text-ink leading-tight">{account.name}</h2>
        <p className="text-xs text-muted mt-0.5">{account.industry} · {account.size}</p>

        <div className="flex items-baseline justify-between mt-3.5">
          <span className="text-lg font-semibold text-ink tracking-tight">${o.amount.toLocaleString()}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${healthTone}`} /> {o.health === "yellow" ? "At risk" : o.health}
          </span>
        </div>
        <div className="mt-3 flex gap-1">
          {STAGES.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= stageIdx ? "bg-accent" : "bg-line"}`} />
              <span className={`mt-1 block text-[11px] ${i === stageIdx ? "text-accent font-medium" : "text-faint"}`}>{s}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">Closes {new Date(o.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
      </div>

      <div className="p-4">
        <Kicker>Stakeholders</Kicker>
        <ul className="space-y-2.5">
          {account.contacts.map((c) => (
            <li key={c.id} className="flex items-center gap-2.5">
              <span className="grid place-items-center h-7 w-7 rounded-full bg-canvas border border-line text-[11px] font-semibold text-muted shrink-0">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink truncate">{c.name}</span>
                <span className="block text-xs text-muted truncate">{c.title}</span>
              </span>
              <span className={`ml-auto shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded ${roleTone[c.role]}`}>{roleLabel[c.role]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4">
        <Kicker>Brieff read · {account.activities.length} records</Kicker>
        <ul className="space-y-2.5">
          {account.activities.map((a: Activity) => {
            const I = activityIcon[a.type] ?? Icon.note;
            return (
              <li key={a.id} className="flex items-start gap-2.5 group">
                <span className="grid place-items-center h-6 w-6 rounded-md bg-canvas border border-line text-muted shrink-0 group-hover:text-accent group-hover:border-accent/30 transition-colors"><I className="h-3 w-3" /></span>
                <span className="min-w-0">
                  <span className="block text-xs text-ink leading-snug truncate">{a.subject}</span>
                  <span className="block text-[11px] text-muted">{new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {a.type}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      </div>
    </aside>
  );
}

/* — summary bullet — */
function SummaryItem({ point, onChange, onRemove }: { point: SummaryPoint; onChange: (t: string) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(point.text);
  if (editing) {
    return (
      <li className="rounded-lg border border-accent/30 bg-accent-soft/40 p-2.5">
        <textarea autoFocus value={val} onChange={(e) => setVal(e.target.value)} className="w-full resize-y min-h-[52px] bg-surface rounded-md border border-line p-2 text-sm text-ink outline-none focus:border-accent" />
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => { setVal(point.text); setEditing(false); }} className="text-xs text-muted hover:text-ink px-2 py-1">Cancel</button>
          <button onClick={() => { onChange(val); setEditing(false); }} className="text-xs font-medium text-white bg-accent hover:bg-accent-ink rounded-md px-2.5 py-1">Save</button>
        </div>
      </li>
    );
  }
  return (
    <li className="group flex gap-2.5 rounded-lg -mx-2 px-2 py-1.5 hover:bg-canvas transition-colors">
      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <div className="min-w-0 flex-1">
        <p className="text-base text-ink leading-relaxed">{point.text}</p>
        <span className="mt-1 flex items-center gap-1.5 flex-wrap">
          {point.tag && tagMeta[point.tag] && <span className="inline-flex items-center gap-1.5 text-[11px] text-faint"><span className={`h-1.5 w-1.5 rounded-full ${tagDot[point.tag]}`} /> {tagMeta[point.tag].label}</span>}
          <span className="inline-flex items-center gap-1 text-xs text-muted"><Icon.link className="h-3 w-3" /> {point.sourceLabel}</span>
        </span>
      </div>
      <div className="flex items-start gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconBtn label="Edit bullet" onClick={() => setEditing(true)}><Icon.edit className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn label="Remove bullet" onClick={onRemove}><Icon.x className="h-3.5 w-3.5" /></IconBtn>
      </div>
    </li>
  );
}

interface ActionState { id: string; base: string; alt: string; display: string; done: boolean; owner: string; due: string }
function ActionRow({ item, onUpdate, onRemove, onToggle, onReassign }: { item: ActionState; onUpdate: (t: string) => void; onRemove: () => void; onToggle: () => void; onReassign: () => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.display);
  const [busy, setBusy] = useState(false);
  function regenerate() { setBusy(true); setTimeout(() => { onUpdate(item.display === item.base ? item.alt : item.base); setBusy(false); }, 650); }
  return (
    <li className="group flex items-start gap-2.5 rounded-lg -mx-2 px-2 py-2.5 hover:bg-canvas transition-colors">
      <button onClick={onToggle} aria-label="Approve action" className={`mt-0.5 grid place-items-center h-[18px] w-[18px] shrink-0 rounded-md border transition-colors ${item.done ? "bg-accent border-accent text-white" : "border-line text-transparent hover:border-accent"}`}>
        <Icon.check className="h-3 w-3" />
      </button>
      {editing ? (
        <input autoFocus value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { onUpdate(val); setEditing(false); } if (e.key === "Escape") { setVal(item.display); setEditing(false); } }}
          onBlur={() => { onUpdate(val); setEditing(false); }}
          className="flex-1 bg-surface rounded-md border border-accent px-2 py-1 text-base text-ink outline-none" />
      ) : (
        <span className={`flex-1 text-base ${item.done ? "text-faint line-through" : "text-ink"}`}>{item.display}</span>
      )}
      {/* owner + due — assignable task, à la M365 Copilot. Grouped + top-aligned so they line up with the first text line. */}
      <div className="flex items-center gap-2 shrink-0 mt-px">
        {/* assignee — avatar + name, our avatar style (matches the rail), no outline pill */}
        <button onClick={onReassign} title="Reassign owner" className="w-[84px] inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 -ml-1 hover:bg-canvas transition-colors">
          <span className={`grid place-items-center h-5 w-5 rounded-full text-[10px] font-semibold shrink-0 ${item.owner === "You" ? "bg-accent-soft text-accent" : "bg-canvas border border-line text-muted"}`}>{ownerInitials(item.owner)}</span>
          <span className="text-[11px] font-medium text-muted truncate">{item.owner === "You" ? "You" : item.owner.split(" ")[0]}</span>
        </button>
        {/* due — soft neutral badge using our line-soft token, no border */}
        <span className="hidden sm:inline-flex w-[84px] items-center gap-1 rounded-md bg-line-soft px-2 py-1 text-[11px] font-medium text-muted"><Icon.clock className="h-3 w-3 text-faint shrink-0" /> {item.due}</span>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconBtn label="Regenerate" onClick={regenerate} busy={busy}><Icon.refresh className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn label="Edit" onClick={() => { setVal(item.display); setEditing(true); }}><Icon.edit className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn label="Remove" onClick={onRemove}><Icon.x className="h-3.5 w-3.5" /></IconBtn>
      </div>
    </li>
  );
}

/* AI-confidence — neutral signal bars (a level, never sentiment-colored) */
function Confidence({ level }: { level: "high" | "medium" | "low" }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1;
  const h = ["h-1.5", "h-2", "h-2.5"];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-faint" title={`AI confidence: ${level}`}>
      <span className="inline-flex items-end gap-[2px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`w-[3px] rounded-sm ${h[i]} ${i < filled ? "bg-muted" : "bg-line"}`} />
        ))}
      </span>
      {level} confidence
    </span>
  );
}

type CrmStatus = "pending" | "approved" | "rejected";
interface CrmState { id: string; field: string; from: string; to: string; confidence: "high" | "medium"; sourceLabel: string; status: CrmStatus }
function CrmRow({ u, onApprove, onReject, onReset, onEdit }: { u: CrmState; onApprove: () => void; onReject: () => void; onReset: () => void; onEdit: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(u.to);
  if (u.status === "rejected") {
    return (
      <div className="flex items-center justify-between gap-4 py-2.5 opacity-60">
        <span className="text-[13px] text-muted"><span className="font-medium mr-2">{u.field}</span><span className="line-through">{u.to}</span> · rejected</span>
        <button onClick={onReset} className="text-xs font-medium text-accent hover:text-accent-ink">Undo</button>
      </div>
    );
  }
  return (
    <div className="group flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted w-16 shrink-0">{u.field}</span>
          <span className="text-[15px] text-faint line-through">{u.from}</span>
          <Icon.arrow className="h-3.5 w-3.5 text-faint shrink-0" />
          {editing ? (
            <input autoFocus value={val} onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { onEdit(val); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
              onBlur={() => { onEdit(val); setEditing(false); }}
              className="bg-surface rounded-md border border-accent px-2 py-0.5 text-sm font-medium text-ink outline-none" />
          ) : (
            <span className="text-[15px] font-medium text-ink">{u.to}</span>
          )}
          <Confidence level={u.confidence} />
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        {u.status === "approved" ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-positive-soft px-2.5 py-1 text-xs font-medium text-positive"><Icon.check className="h-3 w-3" /> Approved</span>
        ) : (
          <>
            <IconBtn label="Edit value" onClick={() => { setVal(u.to); setEditing(true); }}><Icon.edit className="h-3.5 w-3.5" /></IconBtn>
            <button onClick={onReject} className="rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-ink hover:bg-canvas transition-colors">Reject</button>
            <button onClick={onApprove} className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-canvas transition-colors">Approve</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function RecapView({
  account, recap, initialStatus = "idle", initialSent = false,
}: { account: Account; recap: RecapResult; initialStatus?: "idle" | "done"; initialSent?: boolean }) {
  const [notes, setNotes] = useState(sampleCallNotes);
  const [status, setStatus] = useState<"idle" | "thinking" | "done">(initialStatus);
  const [summary, setSummary] = useState<SummaryPoint[]>(recap.summary);
  const [actions, setActions] = useState<ActionState[]>(recap.actionItems.map((a) => ({ id: a.id, base: a.text, alt: a.alt, display: a.text, done: false, owner: a.owner, due: a.due })));
  const owners = ["You", ...account.contacts.map((c) => c.name)];
  const [crm, setCrm] = useState<CrmState[]>(recap.crmUpdates.map((u) => ({ ...u, status: initialSent ? "approved" : "pending" })));
  const [email, setEmail] = useState({ subject: recap.followUpEmail.subject, body: recap.followUpEmail.body });
  const [emailSource, setEmailSource] = useState(recap.followUpEmail);
  const [emailEditingSubject, setEmailEditingSubject] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [usingAltEmail, setUsingAltEmail] = useState(false);
  const [sent, setSent] = useState(initialSent);
  const [minutesSaved, setMinutesSaved] = useState(recap.minutesSaved);
  const [fellBack, setFellBack] = useState(false);

  const approvedCount = crm.filter((u) => u.status === "approved").length;
  const pendingCount = crm.filter((u) => u.status === "pending").length;

  // Populate every section from a recap (live result or the cached fallback).
  function applyRecap(r: RecapResult) {
    setSummary(r.summary);
    setActions(r.actionItems.map((a) => ({ id: a.id, base: a.text, alt: a.alt, display: a.text, done: false, owner: a.owner, due: a.due })));
    setCrm(r.crmUpdates.map((u) => ({ ...u, status: "pending" as CrmStatus })));
    setEmail({ subject: r.followUpEmail.subject, body: r.followUpEmail.body });
    setEmailSource(r.followUpEmail);
    setUsingAltEmail(false);
    setMinutesSaved(r.minutesSaved);
    setSent(false); // a fresh recap means a fresh, unsent draft
  }

  // Live generation over the pasted notes + account history. Falls back to the
  // cached recap (already in state) if there's no key or the call errors —
  // and says so, so a fallback is never passed off as live output.
  async function generate() {
    setStatus("thinking");
    let usedLive = false;
    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, accountId: account.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.fallback && Array.isArray(data.summary)) {
          applyRecap(data as RecapResult);
          usedLive = true;
        }
      }
    } catch {
      /* network error — keep the cached recap already in state */
    }
    setFellBack(!usedLive);
    setStatus("done");
  }
  function regenerateEmail() {
    setEmailBusy(true);
    setTimeout(() => {
      setEmail((e) => ({ ...e, body: usingAltEmail ? emailSource.body : emailSource.altBody }));
      setUsingAltEmail((v) => !v); setEmailBusy(false);
    }, 700);
  }

  return (
    <div className="max-w-[1800px] px-6 lg:px-10 py-7">
      {/* full-width header */}
      <header className="px-0.5 mb-6 max-w-3xl">
        <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-accent">Post-call recap</p>
        <h1 className="text-[23px] font-semibold text-ink tracking-tight leading-[1.2] mt-1.5">Demo follow-up · {account.name}</h1>
        <p className="text-[15px] text-muted mt-1.5">From your notes + {account.activities.length} records · nothing sends until you approve.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[260px_minmax(0,1fr)]">
        <ContextRail account={account} />

        <div className="min-w-0">
          {/* capture — full content width so it aligns with the column block below */}
          <div className="rounded-xl border border-line bg-canvas/40 p-4">
            <p className="text-xs font-medium text-muted mb-2">Post-call notes</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your rough notes — Brieff turns them into a recap, follow-up, and CRM updates."
              className="w-full min-h-[104px] resize-y rounded-lg border border-line bg-surface p-3 text-[15px] text-ink placeholder:text-faint outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" />
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-faint">Cross-referenced with {account.activities.length} prior activities</span>
              <button onClick={generate} disabled={status === "thinking"} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-70">
                {status === "thinking" ? (<><span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Reading {account.name.split(" ")[0]}…</>) : (<><Icon.spark className="h-3.5 w-3.5" /> {status === "done" ? "Regenerate" : "Generate recap"}</>)}
              </button>
            </div>
          </div>

          {/* transparency: never pass the cached sample off as live output */}
          {status === "done" && fellBack && (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-canvas/60 px-3 py-2 text-xs text-muted animate-[fadeUp_.4s_ease]">
              <Icon.spark className="h-3 w-3 shrink-0 text-faint" />
              Live AI wasn&apos;t available for this run — the recap below isn&apos;t a fresh read of your notes.
            </p>
          )}

          {/* results distribute into 2 comfortable columns — wide enough that action items don't crush */}
          {status === "done" && (
            <div className="mt-5 [column-gap:1.25rem] xl:columns-2 [&>*]:mb-5 [&>*]:break-inside-avoid animate-[fadeUp_.4s_ease]">
              <div className="bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)] p-5">
                <SectionHead kicker="Summary" title="What happened" />
                {summary.length === 0 ? <p className="text-base text-muted italic">All bullets removed.</p> : (
                  <ul className="space-y-1">
                    {summary.map((s) => (
                      <SummaryItem key={s.id} point={s}
                        onChange={(t) => setSummary((prev) => prev.map((p) => (p.id === s.id ? { ...p, text: t } : p)))}
                        onRemove={() => setSummary((prev) => prev.filter((p) => p.id !== s.id))} />
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)] p-5">
                <SectionHead kicker="Next steps" title="Action items" />
                <ul className="space-y-1">
                  {actions.map((a) => (
                    <ActionRow key={a.id} item={a}
                      onUpdate={(t) => setActions((prev) => prev.map((x) => (x.id === a.id ? { ...x, display: t } : x)))}
                      onRemove={() => setActions((prev) => prev.filter((x) => x.id !== a.id))}
                      onToggle={() => setActions((prev) => prev.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)))}
                      onReassign={() => setActions((prev) => prev.map((x) => (x.id === a.id ? { ...x, owner: owners[(owners.indexOf(x.owner) + 1) % owners.length] } : x)))} />
                  ))}
                </ul>
              </div>

              <div className="bg-surface border border-line rounded-xl shadow-[0_1px_3px_rgba(24,18,31,0.04)] p-5">
                <SectionHead kicker="CRM" title="Suggested updates"
                  right={pendingCount > 0
                    ? <button onClick={() => setCrm((prev) => prev.map((u) => (u.status === "rejected" ? u : { ...u, status: "approved" })))} className="text-xs font-medium text-accent hover:text-accent-ink">Approve all</button>
                    : <span className="text-xs text-positive font-medium">{approvedCount} applied</span>} />
                <div className="divide-y divide-line-soft">
                  {crm.map((u) => (
                    <CrmRow key={u.id} u={u}
                      onApprove={() => setCrm((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "approved" } : x)))}
                      onReject={() => setCrm((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "rejected" } : x)))}
                      onReset={() => setCrm((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "pending" } : x)))}
                      onEdit={(v) => setCrm((prev) => prev.map((x) => (x.id === u.id ? { ...x, to: v } : x)))} />
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-accent/25 rounded-xl p-5 shadow-[0_1px_2px_rgba(24,18,31,0.04),0_8px_24px_-12px_rgba(124,58,237,0.18)]">
                <SectionHead kicker="Follow-up" title="Draft email"
                  right={!sent ? (
                    <button onClick={regenerateEmail} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-ink">
                      {emailBusy ? <span className="h-3 w-3 rounded-full border-2 border-accent/30 border-t-accent animate-spin" /> : <Icon.refresh className="h-3.5 w-3.5" />} Regenerate
                    </button>
                  ) : undefined} />
                {sent ? (
                  <div className="rounded-lg bg-positive-soft border border-positive/20 p-4 flex items-center gap-3">
                    <span className="grid place-items-center h-9 w-9 rounded-full bg-positive text-white shrink-0"><Icon.check className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">Follow-up sent to {account.contacts[0].name.split(" ")[0]}.</p>
                      <p className="text-xs text-muted mt-0.5">CRM updated · pipeline clean · on to the next call.</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface border border-positive/30 px-3 py-1.5 text-xs font-semibold text-positive whitespace-nowrap shrink-0">⏱ Saved ~{minutesSaved} min</span>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-line overflow-hidden">
                      <div className="px-3 py-2 border-b border-line-soft text-xs text-muted flex items-center gap-2">
                        <span className="shrink-0">To {account.contacts[0].name} · Subject:</span>
                        {emailEditingSubject ? (
                          <input autoFocus value={email.subject} onChange={(e) => setEmail((s) => ({ ...s, subject: e.target.value }))} onBlur={() => setEmailEditingSubject(false)} onKeyDown={(e) => { if (e.key === "Enter") setEmailEditingSubject(false); }} className="flex-1 bg-surface rounded border border-accent px-1.5 py-0.5 text-ink outline-none" />
                        ) : (
                          <button onClick={() => setEmailEditingSubject(true)} className="text-ink font-medium text-left hover:text-accent truncate">{email.subject}</button>
                        )}
                      </div>
                      <textarea value={email.body} onChange={(e) => setEmail((s) => ({ ...s, body: e.target.value }))} className="w-full min-h-[210px] resize-y p-3 text-[15px] text-ink leading-relaxed outline-none bg-surface" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted">Editable — nothing sends until you approve</span>
                      <button onClick={() => setSent(true)} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink transition-colors">Approve &amp; send</button>
                    </div>
                  </>
                )}
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-faint px-1">
                <Icon.spark className="h-3 w-3 shrink-0" />
                Drafted by Brieff AI from your notes and {account.activities.length} records. AI can make mistakes — review before you send or save.
              </p>
            </div>
          )}

          {/* idle empty-state — preview what Generate produces, so the screen isn't bare */}
          {status !== "done" && (
            <div className="mt-5 animate-[fadeUp_.4s_ease]">
              <p className="text-[13px] text-muted mb-3">Hit <span className="font-medium text-ink">Generate recap</span> and Brieff produces, ready to review:</p>
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {[
                  { k: "Summary", d: "Key points and risks, each cited to a record." },
                  { k: "Action items", d: "Next steps with an owner and a due date." },
                  { k: "CRM updates", d: "Stage, next step and health — ready to approve." },
                  { k: "Follow-up email", d: "A draft ready to edit and send." },
                ].map((g) => (
                  <div key={g.k} className="rounded-xl border border-dashed border-line bg-surface/40 p-5">
                    <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-faint">{g.k}</p>
                    <p className="text-[13px] text-faint mt-1.5">{g.d}</p>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 rounded bg-line-soft w-4/5" />
                      <div className="h-2 rounded bg-line-soft w-3/5" />
                      <div className="h-2 rounded bg-line-soft w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
