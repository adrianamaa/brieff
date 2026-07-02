# Relay — AI Sales Copilot (CRM)

Portfolio case study #2 (after Subby). A **live, deployable** AI copilot for Account Executives, inside a CRM, running on **seeded/mock CRM data** (no real Salesforce). Built to prove the user *ships* real products, and to anchor a design case study that shows THINKING (decisions, tradeoffs, the messy middle), not just polished screens.

## User, workflow, goal (locked)
- **User:** Account Executive — mid-market B2B SaaS, ~25–40 live opps, 5–8 calls/day, loses ~1–2 hrs/day to prep + admin; non-technical, skeptical of slow/wrong AI.
- **Workflow:** pre-meeting prep + post-meeting follow-up.
- **Goal:** help the rep walk into calls prepared and leave calls with next steps already done.

## The product (one core loop — keep scope here)
1. **Before a call →** one-tap pre-call **prep brief**: account summary, key contacts, deal status, last touchpoints, open risks, suggested talking points + next actions.
2. **After a call →** capture notes once → copilot proposes **next steps + CRM field updates** (reviewable diff).
3. **Follow-up →** **drafted** email + **one-click** CRM update — rep **edits & approves**, never auto-sent.

**North-star metric:** active selling time reclaimed per rep/week. Supporting: CRM field-completion ↑, follow-up-within-2hrs ↑, meetings prepped ↑.

## The 4 design principles (the trust wedge — every decision must honor these)
- **Fast** — one step, no chat ping-pong. Must beat the old search/shortcut, never be slower.
- **Transparent** — every AI claim cites its source record ("from last call on Jun 12").
- **Editable** — everything is a draft; the human approves before anything is written or sent.
- **Optional** — never blocks the rep's existing fast path. AI is a shortcut, not a tollbooth.

## Stack
- Next.js (App Router, TS) + Vercel (mirror Subby for speed)
- Turso (seeded mock CRM: accounts, contacts, opportunities, activities, meetings)
- Tailwind + shadcn/ui
- **LLM: Google Gemini 2.5 Flash (AI Studio free tier)** — best quality-for-free on a hosted endpoint; mock data so the free-tier training caveat is moot.
- **Demo resilience:** pre-generate + cache prep briefs / draft emails for seeded accounts (zero runtime cost, instant, never fails in a demo); live Gemini call only for "regenerate"/freeform actions so it still demonstrates real AI.

## Screens (IA)
1. **Today** — the rep's day: upcoming calls (each with a Prep button), pending follow-ups, pipeline glance. Command center.
2. **Prep Brief** (hero) — per upcoming meeting: account summary, contacts, deal status, cited last touchpoints, open risks, talking points, suggested next actions.
3. **Account/Opportunity detail** — the CRM record + activity timeline = the source records the AI cites (transparency lives here).
4. **Post-call → Follow-up** — paste notes → proposed CRM field updates (editable diff) + drafted follow-up email (editable, approve to "send").

## V1 build order (post-meeting hero first)
1. Scaffold (Next.js/TS/Tailwind/shadcn) + seed rich mock CRM data (1–2 accounts with real-feeling call/email history).
2. **Post-call recap → follow-up draft → CRM update diff → approve** — the HERO, built first (clearest patterns + value).
3. Today / inbox entry view (upcoming meetings + pending follow-ups) to navigate from.
4. Pre-meeting prep card.
5. Wire Gemini 2.5 Flash (cached outputs for demo resilience; live call on regenerate/freeform).
6. Polish all states (loading/empty/error/edited) → ship-it gated deploy.

**Primary metric, surfaced IN the UI:** time saved per meeting + follow-up completion rate (e.g. a "saved you ~12 min" chip after each approved follow-up — also a portfolio screenshot).

## Skills for this project
- **refero-design** — research-first; ground every screen in real CRM/copilot references, no generic UI
- **ui-ux-pro-max** — dense data patterns (tables, cards, prep-brief layout, all states)
- **design-taste-frontend** / **frontend-design** — distinctive look, avoid "another shadcn dashboard"
- **shadcn MCP** — component scaffolding (tables, dialogs, forms)
- **claude-api** — reference for wiring the LLM (provider here is Gemini, but the integration patterns/tradeoffs apply)
- **web-design-guidelines** — accessibility/UX audit before a screen is "done"
- **vercel-react-best-practices** + **vercel:** skills — Next.js perf + deploy
- **ship-it** + **/security-review** + **/code-review high** — gated deploy before any production push (the user's standard)

## Case-study capture (do this WHILE building, not after)
Keep a running log of design decisions, things tried & rejected, and tradeoffs — that messy middle is the senior-vs-junior signal the portfolio needs. Screenshot key states as we go.
