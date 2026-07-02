import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import type { Account } from "@/lib/data";

export const runtime = "nodejs";

// Live recap generation. Takes the rep's pasted notes + the account's CRM
// history and returns a structured RecapResult.
//
// Provider order: Groq (works in-region, free — same stack as Subby) → Gemini
// (if its region ever unblocks) → cached fallback. If no key is set or the
// call errors, the route returns { fallback: true } and the client serves the
// pre-generated demo recap, so the demo never breaks.

const groqKey = process.env.GROQ_API_KEY;
const geminiKey = process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

const SYSTEM = `You are Brieff, an AI copilot for a B2B SaaS Account Executive. From the rep's raw post-call notes, cross-referenced with the account's CRM history, produce a concise, accurate post-call recap.

Rules (non-negotiable):
- Transparent: every summary point MUST cite a real source. Set sourceActivityId to one of the provided activity ids, and sourceLabel to a short human reference (e.g. "this call + Jun 12 email").
- Grounded: only assert what the notes or activities support. Do not invent facts, numbers, names, or commitments.
- Action items: each gets an owner (either "You" or the exact full name of one of the account contacts) and a due ("Today", "This week", or a short phrase), plus an "alt" that rephrases the same task differently.
- CRM updates: propose realistic changes to fields like Stage, Next step, and Health, each with confidence "high" or "medium" and a short sourceLabel. "from" = current CRM value, "to" = proposed value.
- Follow-up email: a ready-to-send draft addressed to the primary champion, plus an "altBody" that conveys the same content in a tighter style. Sign as "[You]". Nothing is auto-sent; the rep approves.
- minutesSaved: a realistic integer estimate of admin time saved (typically 8-20).
- Use stable ids: summary s1,s2,...; actionItems ai1,ai2,...; crmUpdates u1,u2,....
- Tags are optional and only from: risk, competitor, signal (a buying signal).`;

// Exact JSON shape — used to steer providers (Groq) that don't take a schema.
const JSON_SHAPE = `Return ONLY a JSON object with EXACTLY this shape (no markdown, no commentary):
{
  "summary": [{ "id": "s1", "text": "...", "sourceActivityId": "<one of the provided activity ids>", "sourceLabel": "e.g. this call + Jun 12 email", "tag": "risk|competitor|signal (optional — omit the key if none)" }],
  "actionItems": [{ "id": "ai1", "text": "...", "alt": "same task, different phrasing", "owner": "You or a contact's full name", "due": "Today | This week | ..." }],
  "crmUpdates": [{ "id": "u1", "field": "Stage | Next step | Health | ...", "from": "current value", "to": "proposed value", "confidence": "high | medium", "sourceLabel": "..." }],
  "followUpEmail": { "subject": "...", "body": "full draft, signed [You]", "altBody": "tighter version of the same email" },
  "minutesSaved": 14
}`;

// Gemini structured-output schema (enforced server-side by the model).
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          sourceActivityId: { type: Type.STRING },
          sourceLabel: { type: Type.STRING },
          tag: { type: Type.STRING, enum: ["risk", "competitor", "signal"], nullable: true },
        },
        required: ["id", "text", "sourceActivityId", "sourceLabel"],
      },
    },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          alt: { type: Type.STRING },
          owner: { type: Type.STRING },
          due: { type: Type.STRING },
        },
        required: ["id", "text", "alt", "owner", "due"],
      },
    },
    crmUpdates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          field: { type: Type.STRING },
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          confidence: { type: Type.STRING, enum: ["high", "medium"] },
          sourceLabel: { type: Type.STRING },
        },
        required: ["id", "field", "from", "to", "confidence", "sourceLabel"],
      },
    },
    followUpEmail: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        body: { type: Type.STRING },
        altBody: { type: Type.STRING },
      },
      required: ["subject", "body", "altBody"],
    },
    minutesSaved: { type: Type.INTEGER },
  },
  required: ["summary", "actionItems", "crmUpdates", "followUpEmail", "minutesSaved"],
};

function accountContext(a: Account): string {
  const lines: string[] = [];
  lines.push(`ACCOUNT: ${a.name} — ${a.industry}, ${a.size}, ${a.region}.`);
  const o = a.opportunity;
  lines.push(
    `OPPORTUNITY: "${o.name}" | current Stage=${o.stage} | Amount=$${o.amount.toLocaleString()} | Close=${o.closeDate} | current Health=${o.health} | current Next step="${o.nextStep}".`
  );
  lines.push("CONTACTS:");
  for (const c of a.contacts) lines.push(`  - ${c.name} (${c.title}) — role: ${c.role}`);
  lines.push("ACTIVITY HISTORY (use these ids for sourceActivityId):");
  for (const act of a.activities) {
    lines.push(`  - [${act.id}] ${act.date} ${act.type} — ${act.subject}: ${act.body}`);
  }
  return lines.join("\n");
}

async function generateWithGroq(notes: string, account: Account): Promise<unknown> {
  const prompt = `${accountContext(account)}\n\nREP'S POST-CALL NOTES:\n"""\n${notes.trim()}\n"""\n\n${JSON_SHAPE}\n\nProduce the recap now.`;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq: empty content");
  return JSON.parse(content);
}

async function generateWithGemini(notes: string, account: Account): Promise<unknown> {
  const ai = new GoogleGenAI({ apiKey: geminiKey });
  const prompt = `${accountContext(account)}\n\nREP'S POST-CALL NOTES:\n"""\n${notes.trim()}\n"""\n\nProduce the structured recap now.`;
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { systemInstruction: SYSTEM, responseMimeType: "application/json", responseSchema, temperature: 0.4 },
  });
  const text = result.text;
  if (!text) throw new Error("Gemini: empty response");
  return JSON.parse(text);
}

export async function POST(req: Request) {
  if (!groqKey && !geminiKey) {
    return NextResponse.json({ fallback: true, reason: "no_key" });
  }

  let notes = "";
  let account: Account | undefined;
  try {
    const body = await req.json();
    notes = typeof body?.notes === "string" ? body.notes : "";
    account = body?.account as Account | undefined;
  } catch {
    return NextResponse.json({ fallback: true, reason: "bad_request" }, { status: 400 });
  }
  if (!account || !notes.trim()) {
    return NextResponse.json({ fallback: true, reason: "missing_input" }, { status: 400 });
  }
  // Bound per-request cost — real call notes are short; the cap is generous.
  const MAX_NOTES = 8000;
  if (notes.length > MAX_NOTES) notes = notes.slice(0, MAX_NOTES);

  try {
    const parsed = groqKey
      ? await generateWithGroq(notes, account)
      : await generateWithGemini(notes, account);

    // minimal shape guard — if the model returned something off, fall back
    if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { summary?: unknown }).summary)) {
      return NextResponse.json({ fallback: true, reason: "bad_shape" });
    }
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/recap] generation failed:", err);
    return NextResponse.json({ fallback: true, reason: "error" });
  }
}
