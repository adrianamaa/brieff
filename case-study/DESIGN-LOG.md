# Relay — Design Log

A running record of the decisions, tradeoffs, and dead-ends behind Relay (an AI post-call
copilot for sales reps). Kept *while* building, not reconstructed after — the messy middle is
the point. This is the raw material for the portfolio case study.

Format follows my Subby case study: problem → insight → decision → tradeoff → reflection.

---

## 1 · Picking the wedge (2026-06-25)

**Problem.** "AI copilot" is a vague brief. Most AI demos fail because they're a chatbot
bolted onto a product nobody asked to chat with.

**Decision.** Narrow hard. Not a generic office assistant — a **copilot for one job, one
user**: a mid-market B2B SaaS Account Executive, doing **post-call follow-up**. That user
has a repetitive, revenue-linked, measurable workflow and *visible, documented* trust
complaints about AI that's slower or wrong than their old workflow.

**Why post-call first (not pre-call prep).** The biggest time-saving moment is right after
the meeting — that's when notes, next steps, and CRM updates either get done or slip. It's
also the highest-friction, highest-value part of the loop. Build the hardest, most valuable
screen first; the rest is easier.

**The four principles I committed to up front** (every later decision traces back to these):
- **Fast** — one screen, no chat ping-pong. Must beat the rep's current shortcut.
- **Transparent** — every AI claim cites the record it came from.
- **Editable** — everything is a draft; the human approves before anything is sent or saved.
- **Optional** — never blocks the rep's existing fast path.

**Tradeoff.** Narrowing to one user/one workflow means the demo can't show breadth. I chose
depth — a believable, complete loop for one persona beats a shallow everything-tool.

---

## 2 · Build it live, and the model choice (2026-06-25)

**Decision.** Build a real, deployed Next.js app (like Subby), not Figma mockups. Most
designers only mock up; shipping a clickable product is the differentiator.

**Model.** The copilot's *output quality is the product* — vague summaries kill trust. Picked
**Google Gemini 2.5 Flash (free tier)**: the best quality I can get for $0 on a hosted
endpoint, and since the app runs on mock CRM data, the free-tier "data may be used for
training" caveat is moot. Rejected Groq (quality step down) and Claude/GPT (not free).

**Demo-resilience trick.** Pre-generate and cache the recap outputs in code; call the live
model only on "Regenerate." Result: zero runtime cost, instant load, and it *never fails in
front of a recruiter* — while still demonstrating real AI on demand. (AI wiring deferred until
all screens exist — finish the UI on cached data first.)

---

## 3 · The hero screen: review-and-approve, not a chatbot (2026-06-25)

**Insight.** The trust problem isn't solved by making the AI "nicer." It's solved by giving
the rep **control** — the AI drafts everything, the human inspects, edits, and approves, and
*nothing* is written or sent until they say so. That's human-in-the-loop, and for anything
touching customer comms or CRM records it's non-negotiable.

**What I built.** One screen: paste call notes → Generate → Summary (each bullet cites its
source) → Action items → suggested CRM updates (a before→after diff with confidence) →
editable follow-up email → Approve & send. Then a **"⏱ Saved ~14 min"** chip — the
time-saved metric surfaced *inside the product*, not just claimed in the case study.

**Per-item control.** Every output is independently controllable: inline edit, remove,
regenerate, approve/reject. Used **hover-to-reveal** for the edit/remove/regenerate actions
so the screen stays calm at rest but gives full control on demand. Decision worth defending:
control without clutter.

---

## 4 · "The UI feels off" — the honest one (2026-06-25)

**Problem.** First visual pass was *wrong*, and I called it myself. It was a single centered
column of five near-identical white cards: monotone, low density, weak hierarchy. It read
like a **form**, not a product. The most valuable output (the follow-up email) sat at the
bottom with the same weight as everything else.

**Root cause.** I'd designed from my own taste instead of grounding it in real references
first. That's the exact mistake the research-first method exists to prevent.

**Fix — reference lock.** Studied how real sales/CRM tools actually solve this and
synthesized (did *not* copy one):
- **Attio** → command-surface density, hairline-structured rows, restrained monochrome.
- **HubSpot / Gong** → a persistent **left context rail** (deal-at-a-glance + stakeholders +
  the source records the AI read). This rail *is* the "Transparent" principle made spatial.
- **Linear** → small uppercase section labels + divider rhythm instead of heavy nested cards.
- **Gong** → color-coded deal health; revenue-tool violet is on-brand (Gong is purple), so
  the accent stays — but disciplined, primary-actions only.

**The move.** Two-pane layout: sticky context rail + a denser work column where outputs are
flat divided sections, and the follow-up email is **elevated** (subtle accent shadow) as the
clear primary action. A deal-stage stepper and "Relay read · 4 records" list give the rail
weight and reinforce trust.

**Tradeoff.** Two panes need more horizontal space and a real responsive plan (rail stacks
above the work column below the lg breakpoint). Worth it — the single column never read as a
product.

**Reflection.** The lesson isn't "use a sidebar." It's that **catching your own generic
output and grounding the fix in evidence is the job.** Designing from vibe memory is how you
get AI-slop; references are how you escape it. (Free-tooling note: did this with native web
research over real product sites + bundled craft references — no paid reference library
needed.)

**Before / after:** `case-study/screens/v1-cardstack/` (the original card-stack) vs.
`case-study/screens/v2-twopane/` (the redesign). That pairing is the centerpiece of this
section in the case study.

---

---

## 5 · Second design pass: hierarchy, alignment, and a real WCAG failure (2026-06-25)

The two-pane redesign was structurally right but still felt off on a closer look. Three
specific issues, each fixed with a concrete reason — not vibes.

**Alignment (an actual bug).** The top bar was constrained to `max-w-3xl` while the two-pane
content was `max-w-5xl`. So the logo/avatar literally couldn't line up with the rail and
cards — they were on different grids. Unified both to `max-w-5xl`. Lesson: "feels misaligned"
is often a real measurement, not a matter of taste — check the values first.

**Hierarchy.** Everything sat at roughly one size (13–15px), so nothing anchored the eye and
the screen read as a form. Added a true top-level **H1** ("Demo follow-up · {Account}") with
an accent eyebrow and a one-line value subtitle, then committed to a stepped type scale:
**H1 20 → section 15 → body 14 → meta 12.** Hierarchy now comes from size + weight, not from
an ever-lighter grey.

**WCAG AA contrast — found a genuine failure.** Ran a scripted audit
(`scripts/contrast-check.mjs`, WCAG 2.1 relative-luminance math). The light grey I'd used for
all micro-labels and — worse — the **source citations** was `#a8a29e` = **2.52:1, which fails
AA** (needs 4.5:1). Citations are the literal expression of the "Transparent" principle, so
shipping them unreadable would have undercut the product's whole thesis. Fixed the palette to
two AA-passing greys (`muted` #5f5a55 = 6.82:1, `faint` #6f6962 = 5.42:1) and floored the
smallest text at 11px. The honest constraint I hit: on white you *cannot* have an
arbitrarily-light "tertiary" grey that still passes AA — so tertiary hierarchy has to come
from size/weight, not a lighter colour. That tradeoff is now baked into the type scale.

Audit output is reproducible: `node scripts/contrast-check.mjs`.

**See:** `case-study/screens/v2-twopane/` (current). The contrast audit table itself is a
worthwhile case-study figure — it shows accessibility was designed in, not bolted on.

---

---

## 6 · Studying M365 Copilot (Teams Intelligent Recap) — adopt & reject (2026-06-25)

Researched the most-shipped version of this exact screen — Microsoft's **Teams Intelligent
Recap** and the sales-specific **Sales Copilot recap** — to pressure-test our design against a
product used by millions. (Native web research over Microsoft Learn/Support docs.)

**Adopted (good practice, and on-thesis):**
- **Action items with an inferred, reassignable owner + due date.** Copilot's defining recap
  move is assigning ownership by context ("notes when names were mentioned") so follow-up has
  accountability. Ours were owner-less. Added an owner chip (click to reassign) + a due — which
  also turns each item into a real, assignable CRM task, serving our pipeline-hygiene goal.
- **A sales-signal layer.** Sales Copilot surfaces competitor/risk mentions as distinct
  signals. Our FreightIQ mention was buried in prose. Tagged summary bullets **Risk /
  Competitor / Buying signal** so the rep scans intelligence, not paragraphs.
- **Responsible-AI disclosure.** Microsoft always shows an "AI-generated, verify" note. Added
  a quiet one under the recap. Cheap, honest, reinforces the trust thesis.

**Rejected on purpose (the judgment call — not everything Microsoft does fits us):**
- **The Copilot Q&A chat panel** ("ask questions about the meeting"). It directly contradicts
  our Fast / Optional / *not-a-chatbot* thesis — the whole point of Relay is that the rep
  doesn't have to converse with it. Adopting it would dilute the core idea.
- **Video/audio recap, speaker timelines, chapters.** These depend on a meeting *recording*;
  Relay is deliberately notes-based and lightweight. Out of scope, not a gap.

**Reflection.** The value of studying a giant's product isn't to copy it — it's to find the
one or two patterns that genuinely serve *your* user (owners, signals) and to be able to
articulate why you left the rest. Knowing what to leave out is the senior move.

---

---

## 7 · Closing the loop: the Pre-meeting Prep card (2026-06-25)

Built the other half of the product — the pre-call brief — and added top-bar navigation
(Prep ↔ Recap), so it now reads as a real two-screen product, not a single demo screen.

**A deliberate interaction distinction.** Prep and Recap sit at opposite ends of the call, so
they get opposite postures:
- **Recap (after the call)** is **review-and-approve** — edit-heavy, because its output gets
  sent and written to CRM. Control is the whole point.
- **Prep (before the call)** is **read-optimized** — the rep is about to walk into a meeting and
  has seconds. So it's scan-first: a single elevated **"Walk in knowing — the 3 things that
  matter"** block, then talking points (checkable to track live), likely objections paired with
  a one-line counter, and copyable discovery questions. Minimal editing on purpose.

Same shell, tokens, type scale, signal tags, and source citations as the recap — consistency
makes two screens feel like one product. Reused the `ContextRail` component across both, so
the deal/stakeholders/source-records context is always present (the Transparent principle,
everywhere).

**Why this matters for the case study:** it shows I match the *interaction model to the
moment*, not a one-size-fits-all template. Same design system, two different jobs.

**See:** `case-study/screens/v2-twopane/prep.png`.

---

---

## 8 · Benchmarking Prep vs. Microsoft & Salesforce (2026-06-25)

Pressure-tested the Prep screen against the two market leaders for this exact surface:
**Microsoft 365 Copilot's meeting-prep card** and **Salesforce Einstein Meeting Digest**
(native web research on their own docs).

**The gap they exposed.** Both products *lead* pre-meeting prep with **the people**:
- Microsoft surfaces AI-enriched **"external attendees"** + role-tailored talking points + 3 highlights.
- Salesforce leads with an **attendee list (RSVP status + role/job-level)** + activity timeline + **recommended pre-meeting actions**.

Our v1 Prep had the 3 highlights and talking points, but said nothing about *who's in the
room and how to handle each person* — the single most-prioritized prep element in both tools.

**What I added (grounded in the refs):**
- **"Who's in the room"** — each attendee with role, **RSVP status**, and a one-line *angle*
  (how to handle them). = MS "external attendees" enrichment + SF attendee list, merged.
- **"Before you join"** — Salesforce-style recommended pre-meeting actions, as a checklist.

**What I kept that they don't emphasize (our edge):** likely **objections + counters** and
**smart discovery questions**. The references are catch-up/context tools; Relay is a coaching
tool. Keeping these is the differentiation, so I didn't trade them away to look more like the
incumbents.

**Reflection.** Benchmarking against incumbents isn't about converging on them — it's about
adopting the table-stakes they've proven (attendees, RSVP, recommended actions) while
protecting the one or two things that make your product *yours* (coaching: objections +
questions). Same lesson as the M365 recap pass, applied to Prep.

**See:** `case-study/screens/v2-twopane/prep.png`.

---

---

## 9 · Prep was conceptually right but visually overloaded — make it lighter & layered (2026-06-25)

Self-critique that held up: after adding attendees + prep actions, the Prep screen had too
many co-equal "primary" sections, all text-heavy, competing for attention. The fix isn't less
content — it's **progressive disclosure**: show the critical few, layer the rest.

**Changes:**
- **Compressed the header** — dropped the long goal subtitle (the screen already explains the
  goal); kept meeting · company · time · attendee count + one CTA.
- **Made "3 things" scannable** — restructured each into a **bold lead-in** + secondary detail,
  and shrank the source to a faint micro-label. The eye now scans the three bold leads, not
  three full sentences.
- **Tightened attendee blocks** to name · title / role + RSVP badge / one-line angle — two
  lines each.
- **Collapsed the lower four into jump-able sections.** *Before you join* and *Talking points*
  open by default (the act-now items); *Objections* and *Questions* collapse to a header + count
  + chevron. The rep jumps to what they need instead of reading a wall.

**Principle.** This is the "Fast" design principle applied to layout: a prep screen is read in
seconds before a call, so the information has to be *layered by urgency*, not dumped at one
altitude. Density is fine; flat density is not.

**Pushed further → strict progressive disclosure.** A first lighter pass still showed too much.
Final model follows a hard rule: **1 primary message → 3 supporting points → 80% collapsed.**
- A single synthesized **primary insight** leads ("Two blockers stand between you and a
  proposal…") — the one thing to register in 5 seconds.
- The 3 supporting insights show **only their bold leads**; rationale + source collapse behind a
  per-item expand.
- Attendees stay visible (you need to know who's in the room).
- Prep actions, talking points, objections, questions **all collapse by default** to header +
  count + chevron.

First scan = *what meeting → what matters most → who's here.* Everything else is one tap away.
The lesson: a prep tool shouldn't try to fully brief the rep in one glance — it should help
them orient fast, then drill in. Recognition → decision → detail, in that order.

**See:** `case-study/screens/v2-twopane/prep.png`.

---

---

## 10 · Typography & emphasis on Prep — four corrections to a settled scale (2026-06-25)

The Prep type took four passes to land. Worth recording because the *path* is the lesson.

**A — too small.** Adopted a dashboard scale on the main column: title ~23px, primary insight
& section headers 17–18px, body **16px**, secondary 13–15px, kickers/badges 11–12px; body
line-height ~1.5, headers ~1.15; padding p-5. Rule: secondary info goes quiet by **weight/colour,
never by shrinking** to unreadable.

**B — then too loud.** Big type + accent borders + filled colour pills + solid-violet number
badges read like a *warning banner*. Calmed it: title 28 → 23, filled Risk/Competitor pills →
small **dot + label**, softened number badges, lighter supporting-copy weight, more spacing,
dropped the hero's banner border/shadow so one element (the 18px insight) dominates alone.

**C — keep the brand.** Calming had greyed the section eyebrows; restored them to **accent
purple** ("Walk in knowing", "In the room"…) for consistency with Recap. Calm the *noise*
(tags, fills, weights), not the brand signature.

**D — structure the hero.** Split the one long insight into a clean three-part block:
purple label → **punchy main line** ("Two blockers stand between you and a proposal.") →
lighter secondary explanation ("The CFO needs ROI proof, and IT needs security sign-off.").
Headline → context → details.

**Principle.** Emphasis is a budget, not a default. Make one thing dominant (the key insight),
keep context + CTA + brand kickers strong, let everything else be readable-but-quiet. Prep
should feel confident, not intense. Overshoot small, overshoot loud, then settle — the settling
point is where hierarchy reads without strain.

**See:** `case-study/screens/v2-twopane/prep.png`.

---

## 11 · Propagating the scale to Recap for consistency (2026-06-25)

Two screens, one product — so Recap got the same 16px-baseline scale Prep settled on: header
~23px, section headers ~17px, body 16px, secondary 13–15px, p-5 padding. The shared
`ContextRail` already matched. Consistency across the two screens is what makes them read as one
product rather than two demos.

---

---

## 12 · Final recap polish — "review workspace, not a report" (2026-06-25)

Refined density rather than rebuilding — the page was close but had "everything is important" energy.

- **Separation:** one combined card → **three distinct cards** (Summary / Action items / CRM) with whitespace between.
- **Unified the rail:** three stacked sidebar cards → **one continuous context panel** with internal dividers (context beside the work, not a second dashboard).
- **Quieted the capture box:** bordered callout → light note input, so it stops competing with the recap.
- **Shortened summary bullets;** pushed source/date into small secondary text.
- **Calmer colour:** CRM confidence → quiet `• high` dot+label; signal tags → dots. One dominant section preserved (the elevated follow-up email).

### The action-item meta — three rounds to get it right
The owner + due-date row took real iteration, and the path is instructive:
1. **Vertical misalignment** — due date was `self-center` while the owner sat at the top; on a two-line item they floated at different heights. Grouped them and top-aligned.
2. **Ragged columns** — variable-width content ("You" vs "Dana", "Today" vs "This week") meant nothing lined up. Gave owner + date **fixed-width columns**.
3. **Clunky outline pills** — still didn't read clean. Researched **Microsoft Fluent 2**: assignees use a **Persona** (avatar + name, *no* outline pill) and metadata uses a **subtle filled Badge**, not an outlined one. Adopted the *pattern* but mapped it to **our** tokens — avatar in `accent-soft` / `canvas+border` (matching the rail), date in a `line-soft` badge.

**Principle.** Borrow a giant's *pattern* (Persona, filled badge, aligned columns), but express it in your own design tokens — don't import their literal styling and fracture your system. And alignment is not a nicety: ragged meta is the difference between "looks fine" and "feels designed."

**See:** `case-study/screens/v2-twopane/recap-full.png`.

---

---

## 13 · A workspace home — fixing the cold open (2026-06-26)

The app opened straight into a dense deal record (the recap), which felt like being dropped into
the middle of someone else's deal. Added a **workspace home** at `/` (recap moved to `/recap`).
Grounded in Attio's Home pattern; answers four orientation questions: *what is this* (header line),
*what do I do first* (an elevated "Next up" card + Prep CTA), *which deal matters most* (today's
meeting list with contextual Prep/Recap/Done actions), *where do I go next* (a "Jump in" panel + a
"this week — 1.6h saved" stat that surfaces the north-star metric on the landing surface). Built in
the existing design system.

## 14 · Workspace shell + depth (2026-06-26)

The UI was clean but read like a *web page with top tabs*. Elevated it to a real **app shell**: a
left sidebar (Attio/Linear/Notion pattern) with iconned nav, active state, and the user identity
pinned at the bottom — in the root layout, so all three screens upgraded at once. The recap now
reads as a proper CRM **3-pane** (app nav → deal context rail → record). Added a uniform subtle card
shadow for depth + hover-elevation on agenda rows. **Principle:** the shell *is* the product's first
impression — a persistent sidebar with identity does more for "this is a real tool" than any single
screen polish.

## 15 · Fill vs. distribute — the layout that actually scales (2026-06-26)

The hardest, most iterative problem of the session. On a wide monitor the content capped early and
left a dead zone; widening it just **stretched** single elements (a hero with a button floating at
the far edge, meeting rows with empty middles). The user's insight crystallised it: *don't stretch
to fill — distribute the content horizontally into columns at comfortable sizes.*

- **Dashboards (Home):** fill the width with a **multi-column card grid** — meeting cards laid
  side-by-side, stats + quick-actions across, each card a comfortable fraction of the width.
- **Record pages (Prep, Recap):** researched it (Zoho/Salesforce record layouts use 2–4 columns
  grouped by workflow; an LLM-recap study pairs summary+actions and treats the email as the
  *output*). Distributed the cards into a **multi-column flow** next to the context rail — comfortable
  column widths, no stretched text.

**Principle.** "Fill vs. cap" is a false binary. The answer is **distribution**: add *columns*, not
width, so the screen fills with content while every element keeps a comfortable size. Also a hard-won
debugging lesson — a stale browser HMR cache made changes "invisible"; verifying what the *server*
actually serves (vs. the browser) is part of the job.

## 16 · Density & balance — the last 15% (2026-06-26)

A critique pass (acting as a skeptical hiring reviewer) caught the things that still read as
"unfinished," and each got fixed:
- **Home "Next up" was empty air** — it was force-stretched tall with content only in the top third.
  Gave it natural height and real substance: attendee avatars + names + a "Focus" line.
- **Meeting cards were inconsistent** — the "Done" card had an empty slot where others had a button.
  Added a "Recap sent" footer so the set is uniform.
- **Recap idle state looked bare** — the *first impression* of the recap was a lone notes box in
  white space. Added a **ghosted preview** of what Generate produces (Summary / Action items / CRM /
  Email skeleton cards) — communicates value instead of looking broken.
- **Prep columns were lopsided** — masonry left a lonely short column. Switched to an explicit 2-up
  grid so cards pair into even rows.
- **Recap-generated action items were crushed** — three narrow columns squeezed the owner+due chips
  against the text, wrapping a line into five. Dropped to **two wider columns** so items read on
  1–2 lines.

**Principle.** The last 15% is density and balance — empty air, ragged columns, and crushed text are
what separate "good student project" from "looks like a real product." Critiquing your own work as a
hostile reviewer is how you find them.

## 17 · Naming the product — Relay → Brieff (2026-06-29)

"Relay" was a placeholder, and a weak one: a common dictionary word, impossible to own or trademark,
and already worn by other tools. Audited the obvious short names (Aide, Knack, Vantage, Pulse, Arc,
Lumen) — all taken or generic. Switched tactics to a **coined** name: **Brieff** — the
Workable/Airtable trick of doubling a letter to make a real word ownable. It also literally *names
the product* (a brief before and after every meeting), and the doubled **ff** becomes a place to live
a brand device.

**Principle.** A product name has two jobs: mean something, and be *ownable*. A coined word
(double-letter on a real word) buys you trademarkability and a logo hook without going abstract.

## 18 · The logo, and the square-mark question (2026-06-29)

Built the wordmark in **Halyard Display** (already the brand's display face — so logo and headlines
share one type voice) with a **hidden double-f**: it reads "Brief," but the second `f` is the brand
color, encoding "Brieff." First instinct was that the colored `f` read as a *drop shadow* — but seen
at full size in the real export it reads as a genuine second letter; I retracted the critique rather
than "fix" something that worked. Cleaned the export (it shipped with a baked-in background
rectangle → stripped it to transparent) and generated the variant set (ink, white-knockout).

Then the real question: **do we even need a separate square mark / icon?** Rather than default to
"yes," I researched it. The finding: the favicon/avatar *slot* is unavoidable, but a **bespoke
pictorial symbol is the wrong early investment** — Ehrenberg-Bass shows abstract symbols are harder
to encode in memory than a wordmark, a wordmark is easier to trademark, and the industry norm is
wordmark-led for the first few years with a *derived monogram* for the square slot. So: an **"ff"
monogram** for the favicon, and **no** hours sunk into a symbol the brand doesn't need yet.

**Principle.** Interrogate the deliverable before producing it. "Do we need this?" (a custom symbol)
is a more valuable question than "how do we make it?" — grounded in evidence, not taste.

## 19 · The color system — escaping the Facebook-blue trap (2026-06-29)

The longest thread. The logo started on a bright azure (`#0099FF`); the user sensed it looked like
Facebook. Rendered comparisons confirmed *why*: (1) it's not just the hue — a white letter on a dark
rounded tile **is** the Facebook/Messenger *form*, so even a deeper cobalt kept the echo; and (2)
blue is the **category default** — Salesforce, Apollo, Outreach, Gong, Clari are all blue, so a blue
Brieff blends into the crowd (the one everyone remembers, HubSpot, went orange). Recommended emerald
(already the landing accent, differentiated, kills the echo), but the user wanted *vibrant contrast
on the warm paper*. That's a color-theory question, not a taste one: the linen is yellow-warm, so its
**complementary is blue-violet** — violet pops hardest against it. Showed vivid violet / royal grape
/ magenta / iris in a real product context; landed on **vivid violet `#7C3AED`** (vibrant but still
credible for an enterprise-sales buyer). Rejected magenta (reads consumer) and iris (the exact
Stripe/Linear lane to avoid). Then nudged the near-black ink to **`#18121F`** — a faint violet tint
so the neutrals belong to the accent family; rejected a warm brown-black (muddy beside cool violet)
and pure black (harsh on warm paper).

Honest miss: on the first "recolor," I changed only the accent and **left the body text on the old
warm `#1c1917`** — the user caught that the text black wasn't the brand black. Fixed the ink token
and the shadow tints derived from it.

**Principle.** Defend color with reasoning, not vibes: differentiate by *category* (don't wear the
crowd's color), distrust a hue that carries a *form* association, and use complementary contrast to
earn "pop." And tint your neutrals toward the accent so the whole system reads as one family.

## 20 · Icons, and a near-free re-skin (2026-06-29)

The icons were hand-rolled inline SVGs with drifting stroke widths — and Feather/Lucide-style, i.e.
the default "shadcn dashboard" look the brief explicitly says to avoid. Researched the fix:
**Phosphor**, chosen over Lucide for its weight range (so icon weight can echo the bold wordmark) and
to read *designed* rather than default. Convention: **regular weight, fill for emphasis** (active nav,
sparkles, the "done" check). Implemented by redefining the **shared `Icon` object** as Phosphor
wrappers behind the same API — so Recap, Prep, and the activity timeline all updated from one change.
(Honest miss: I first dropped the *ff favicon tile* into the sidebar as the logo; the user rightly
wanted the actual *wordmark* there — the favicon is for tabs, not in-app branding.)

The whole re-skin — accent, ink, icons across three screens — was cheap because the design system is
**tokenized**: `--color-accent`/`--color-ink` as CSS variables consumed via Tailwind, so a few-line
change propagated everywhere with no per-component edits.

**Principle.** The payoff of a tokenized system shows up at *rebrand* time: a full re-skin should be a
few variable changes, not a hunt-and-replace. Build the tokens early; you cash them in later.

---

_Status: product is **final-ready and fully on the Brieff brand** — Home, Prep, Recap (idle /
generated / sent), cohesive shell, tokenized design system (violet `#7C3AED` / ink `#18121F` / linen),
Halyard type, consistent Phosphor icons, accessible, benchmarked against Attio / Gong / Salesforce /
M365 Copilot. Screens captured in `screens/v3-brieff/` (v1/v2 kept as before/after). Decided against a
full marketing landing (marketing design ≠ the product-designer story). Remaining build milestone:
wire live Gemini (Generate/Regenerate calls the model; cached outputs stay as the demo fallback)._
