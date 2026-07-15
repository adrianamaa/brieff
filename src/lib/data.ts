// Brieff — seeded mock CRM data.
// We seed ONE deep account end-to-end so the copilot has real history to
// summarize and *cite* (the transparency principle needs something to point at).

export type ContactRole = "champion" | "economic_buyer" | "blocker" | "influencer";

// Canonical tag vocabulary — single source of truth for the type union, the
// API sanitizer's allowlist, and the UI maps. Add a tag HERE and everything
// stays in sync.
export const SUMMARY_TAGS = ["risk", "competitor", "signal"] as const;
export type SummaryTag = (typeof SUMMARY_TAGS)[number];

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  role: ContactRole;
}

export type ActivityType = "call" | "email" | "note" | "meeting";

export interface Activity {
  id: string;
  type: ActivityType;
  date: string; // ISO
  subject: string;
  body: string;
}

export interface Opportunity {
  id: string;
  name: string;
  stage: "Discovery" | "Demo" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
  amount: number;
  closeDate: string; // ISO
  health: "green" | "yellow" | "red";
  nextStep: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  size: string;
  region: string;
  owner: string;
  contacts: Contact[];
  opportunity: Opportunity;
  activities: Activity[];
}

export const northwind: Account = {
  id: "northwind",
  name: "Northwind Logistics",
  industry: "Freight & Logistics",
  size: "1,200 employees",
  region: "Midwest US",
  owner: "You (AE)",
  contacts: [
    { id: "c1", name: "Dana Reyes", title: "VP Operations", email: "dana@northwind.com", role: "champion" },
    { id: "c2", name: "Marcus Hale", title: "CFO", email: "marcus@northwind.com", role: "economic_buyer" },
    { id: "c3", name: "Priya Shah", title: "IT Security Lead", email: "priya@northwind.com", role: "blocker" },
  ],
  opportunity: {
    id: "opp1",
    name: "Northwind — Platform Rollout",
    stage: "Demo",
    amount: 48000,
    closeDate: "2026-07-31",
    health: "yellow",
    nextStep: "Send recap + pricing after demo",
  },
  activities: [
    {
      id: "a1", type: "call", date: "2026-05-28",
      subject: "Intro call with Dana (VP Ops)",
      body: "Dana described 14 hrs/week lost to manual dispatch reconciliation. Strong champion. Wants a fast rollout before Q3 peak season.",
    },
    {
      id: "a2", type: "email", date: "2026-06-04",
      subject: "Demo scheduling + attendee list",
      body: "Confirmed demo. Marcus (CFO) joining — will care about ROI and payback period. Priya (IT) joining for security.",
    },
    {
      id: "a3", type: "email", date: "2026-06-12",
      subject: "Security questionnaire from Priya",
      body: "Priya asked whether we support SSO/SAML and where data is hosted. Flagged this is a hard requirement for IT sign-off.",
    },
    {
      id: "a4", type: "note", date: "2026-06-18",
      subject: "Pre-demo prep note",
      body: "Marcus is cost-sensitive — competitor (FreightIQ) quoted them ~$40k. Need an ROI angle, not just features.",
    },
  ],
};

// Registry of live seeded accounts. The API route resolves accountId against
// this, so a new account only needs to be added here to work end-to-end.
export const accounts: Record<string, Account> = { [northwind.id]: northwind };

// --- The "AI" recap output, pre-generated for demo resilience. ---
// In production this comes from Gemini 2.5 Flash over the activities + call notes.
// Each claim carries the activity id it was derived from → the source chip.

export interface SummaryPoint {
  id: string;
  text: string;
  sourceActivityId: string;
  sourceLabel: string;
  tag?: SummaryTag; // sales-intelligence signal (à la Sales Copilot)
}

export interface ActionItem {
  id: string;
  text: string;
  alt: string; // alternate phrasing surfaced by "regenerate"
  owner: string; // inferred assignee (à la M365 Copilot) — reassignable
  due: string; // suggested timing
}

export interface CrmUpdate {
  id: string;
  field: string;
  from: string;
  to: string;
  confidence: "high" | "medium";
  sourceLabel: string;
}

export interface RecapResult {
  summary: SummaryPoint[];
  actionItems: ActionItem[];
  crmUpdates: CrmUpdate[];
  followUpEmail: { subject: string; body: string; altBody: string };
  minutesSaved: number;
}

// The realistic call notes the rep would paste in (pre-filled in the demo).
export const sampleCallNotes = `Demo went well. Dana loved the live dispatch board. Marcus pushed hard on ROI - wants to see payback in under 6 months before he'll sign. Priya confirmed SSO/SAML is a hard requirement and asked for SOC 2. Agreed to send an ROI breakdown + security docs this week. Marcus mentioned FreightIQ quoted them around 40k.`;

export const northwindRecap: RecapResult = {
  summary: [
    { id: "s1", text: "CFO needs ROI proof — payback under 6 months — before signing.", sourceActivityId: "a4", sourceLabel: "this call + Jun 18 note", tag: "risk" },
    { id: "s2", text: "IT requires SSO/SAML and SOC 2 to sign off.", sourceActivityId: "a3", sourceLabel: "this call + Jun 12 email", tag: "risk" },
    { id: "s3", text: "Champion Dana is sold; internal momentum is strong.", sourceActivityId: "a1", sourceLabel: "this call + May 28 call", tag: "signal" },
    { id: "s4", text: "FreightIQ quoted ~$40k — expect price scrutiny.", sourceActivityId: "a4", sourceLabel: "this call + Jun 18 note", tag: "competitor" },
  ],
  actionItems: [
    { id: "ai1", text: "Send ROI breakdown showing <6 month payback to Marcus", alt: "Build a payback model (<6 mo) and send to Marcus, cc Dana", owner: "You", due: "Today" },
    { id: "ai2", text: "Send SOC 2 report + SSO/SAML overview to Priya", alt: "Forward SOC 2 + SSO/SAML one-pager to Priya for IT sign-off", owner: "You", due: "Today" },
    { id: "ai3", text: "Loop Dana in to champion ROI doc internally", alt: "Brief Dana so she can socialize the ROI doc with Marcus", owner: "Dana Reyes", due: "This week" },
  ],
  crmUpdates: [
    { id: "u1", field: "Stage", from: "Demo", to: "Negotiation", confidence: "high", sourceLabel: "pricing + payback discussed" },
    { id: "u2", field: "Next step", from: "Send recap + pricing after demo", to: "Send ROI breakdown + SOC 2 docs", confidence: "high", sourceLabel: "agreed on this call" },
    { id: "u3", field: "Health", from: "yellow", to: "yellow", confidence: "medium", sourceLabel: "champion strong, but CFO + IT unresolved" },
  ],
  followUpEmail: {
    subject: "Northwind rollout — ROI breakdown + security docs",
    body: `Hi Dana,

Great session today — thanks for walking the team through your dispatch workflow.

To keep us moving, here's what I'll get over this week:

1. ROI breakdown — modeling payback under 6 months, for Marcus.
2. Security pack — our SOC 2 report and SSO/SAML setup overview, for Priya.

Once Marcus and Priya have what they need, I'd suggest a 30-min working session to align on rollout timing ahead of your Q3 peak.

Does Thursday or Friday work for that?

Best,
[You]`,
    altBody: `Hi Dana,

Thanks for the time today. Two things headed your way this week:

• ROI breakdown (payback under 6 months) — for Marcus
• SOC 2 + SSO/SAML overview — for Priya

Once they've had a look, could we grab 30 minutes to lock rollout timing before your Q3 peak?

Best,
[You]`,
  },
  minutesSaved: 14,
};

// --- Workspace home: today's agenda + week stats (orients the AE before they dive in). ---

export interface AgendaItem {
  id: string;
  account: string;
  accountId: string | null; // key into `accounts` (null = not a live seeded deal)
  type: string;
  time: string;
  status: "upcoming" | "completed";
  attendees: number;
  amount: number;
  stage: string;
  needs: "prep" | "recap" | "done";
  href: string | null; // where the action routes (only the seeded Northwind deal is live)
  focus?: string; // one-line meeting focus, shown on the home "Next up" card
}

export const todayAgenda: AgendaItem[] = [
  { id: "m3", account: "Cedar Supply Co.", accountId: null, type: "Pricing review", time: "9:30 AM", status: "completed", attendees: 4, amount: 71000, stage: "Negotiation", needs: "done", href: null },
  { id: "m2", account: "Atlas Freightways", accountId: null, type: "Discovery call", time: "11:00 AM", status: "completed", attendees: 2, amount: 32000, stage: "Discovery", needs: "recap", href: null },
  { id: "m1", account: "Northwind Logistics", accountId: "northwind", type: "Demo follow-up", time: "2:00 PM", status: "upcoming", attendees: 3, amount: 48000, stage: "Demo", needs: "prep", href: "/prep", focus: "unblock ROI + security" },
];

export const weekStats = { followUpsSent: 7, minutesSaved: 96, meetingsPrepped: 11 };

// --- Pre-meeting PREP brief (the other half of the loop). ---
// Read-optimized: the 3 things to walk in knowing, talking points, likely
// objections + responses, and smart questions. Grounded in the same activities.

export interface PrepBrief {
  meeting: { title: string; when: string; purpose: string };
  primaryInsight: string; // punchy main line — the one thing to register in 5 seconds
  primarySupport: string; // lighter secondary explanation
  mustKnow: { id: string; lead: string; detail: string; sourceLabel: string; tag?: SummaryTag }[];
  attendees: { id: string; name: string; title: string; role: ContactRole; rsvp: "accepted" | "tentative" | "no-response"; angle: string }[];
  talkingPoints: { id: string; text: string }[];
  objections: { id: string; objection: string; response: string }[];
  questions: { id: string; text: string }[];
  prepActions: { id: string; text: string }[];
  minutesSaved: number;
}

export const northwindPrep: PrepBrief = {
  meeting: {
    title: "Demo follow-up call",
    when: "Today · 2:00 PM · 30 min",
    purpose: "Unblock ROI + security to reach a proposal",
  },
  primaryInsight: "Two blockers stand between you and a proposal.",
  primarySupport: "The CFO needs ROI proof, and IT needs security sign-off.",
  mustKnow: [
    { id: "k1", lead: "Lead with ROI for the CFO", detail: "Marcus judges on payback under 6 months — make the business case before any feature talk.", sourceLabel: "Jun 4 email + Jun 18 note", tag: "risk" },
    { id: "k2", lead: "Security is the gate", detail: "Priya won't sign off until SSO/SAML and SOC 2 are confirmed. Have those answers ready up front.", sourceLabel: "Jun 12 email", tag: "risk" },
    { id: "k3", lead: "Use Dana's urgency", detail: "Your champion wants a fast rollout before Q3 peak — let her drive the timeline.", sourceLabel: "May 28 call", tag: "signal" },
  ],
  attendees: [
    { id: "c1", name: "Dana Reyes", title: "VP Operations", role: "champion", rsvp: "accepted", angle: "Your champion — let her carry urgency on rollout timing. Lean on the Q3 deadline." },
    { id: "c2", name: "Marcus Hale", title: "CFO", role: "economic_buyer", rsvp: "accepted", angle: "Holds the budget. Open with ROI + payback under 6 months; skip the feature tour." },
    { id: "c3", name: "Priya Shah", title: "IT Security Lead", role: "blocker", rsvp: "tentative", angle: "Will gate on security. Have SOC 2 + SSO/SAML answers ready to unblock her fast." },
  ],
  talkingPoints: [
    { id: "t1", text: "Open with the 14 hrs/week Dana's team loses to manual dispatch reconciliation — quantify the pain." },
    { id: "t2", text: "Walk Marcus through a payback-under-6-months ROI model before touching price." },
    { id: "t3", text: "Proactively confirm SSO/SAML support and SOC 2 to defuse Priya's blocker early." },
  ],
  objections: [
    { id: "o1", objection: "“FreightIQ quoted us around $40k — you're more expensive.”", response: "Reframe on payback and the 14 hrs/week reclaimed, not sticker price. Cost-per-reconciliation, not license cost." },
    { id: "o2", objection: "“Can we really be live before Q3 peak season?”", response: "Share the 2-week rollout plan and offer hands-on onboarding. Dana's urgency is your ally here." },
    { id: "o3", objection: "“How do we know our data is secure?”", response: "SOC 2 report and SSO/SAML overview are ready to send to Priya today — turn the blocker into a checkbox." },
  ],
  questions: [
    { id: "q1", text: "Marcus — what payback period would make this an easy yes for finance?" },
    { id: "q2", text: "Priya — beyond SSO and SOC 2, are there other security gates for sign-off?" },
    { id: "q3", text: "Dana — who else needs to be on board before we can move to a proposal?" },
  ],
  prepActions: [
    { id: "p1", text: "Have the ROI one-pager open and ready for Marcus" },
    { id: "p2", text: "Pull up the SOC 2 report + SSO/SAML overview for Priya" },
    { id: "p3", text: "Confirm the 2-week rollout timeline so you can commit to Q3" },
  ],
  minutesSaved: 9,
};
