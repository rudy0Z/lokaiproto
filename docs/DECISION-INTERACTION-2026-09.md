# LokAI — The Decision Interaction (from computed decisions to consumer trust UX)

**Date:** 2026-09-27 · **Status:** design-of-record for the response/thinking pipeline ·
**Read with:** `PRODUCT-JOURNEY-2026-09.md` (thesis: the seam) · `REDESIGN-PLAN-2026-09.md` (P0–P8) ·
`star-interaction.md` (turn anatomy it refines) · `decision-layer-research/reports/` (gates G1–G9) ·
`MOBILE_AI_SYSTEM.md` (composition law L1–L8)

**What this document owns:** the conversion of the decision system into *consumer UX/UI* — what the
user sees while LokAI works, what the answer declares about its own evidence, how a stop is rendered,
and how the same pipeline behaves in voice and in four scripts. Everything below is grounded in
verified research (§2) and a live screen walkthrough (§9). Where an older doc disagrees with this one,
this one wins on interaction detail; the thesis documents keep ownership of the argument.

**Private scaffolding, stated once:** the decision-engine discipline was sharpened against the Jev
(TypeSafe AI) research — typed state in, typed decision out, decisions computed never authored. Per
the 2026-09-27 owner decision, **Jev is internal scaffolding only**: it appears in no case-study copy,
no code vocabulary, and no interview narrative. The shipped story is LokAI's own: *state → decision →
action → verification, with a receipt.*

---

## 1. The synthesis in one paragraph

Chat products (ChatGPT, Claude, Gemini, Perplexity) have converged on one familiar anatomy: a live
status line while working, a collapsible thinking panel that collapses to "Thought for N seconds",
numbered citations, and prose refusals. That anatomy is now the **familiarity baseline** — deviating
from it reads as broken, not novel. Latency research (CHI '26, n=240) says the *wait itself* changes
how the identical answer is judged — 2-second answers read as less thoughtful than 9-second answers —
and Apple's HIG says the wait must be narrated with specific, honest stage feedback. Microsoft's
architecture guidance says the pipeline (validate → retrieve → decide → verify) should be *designed
as stages with budgets*, and that blocking checks happen **before** output starts. LokAI's move:
**keep the familiar anatomy, but make every stage of it true.** The wait is consequence-scaled real
work; the collapsed "thinking" line is not a timer but the **computed gate trail**; the answer's
registers each carry their evidence class; refusals are typed stops with receipts. No shipped product
renders a computed decision trail — that is the open space this design occupies (§3.4).

> **The one-line law: the user may see the pipeline working, the pipeline's inputs, and the
> pipeline's verdict — never a number standing in for any of them.**

---

## 2. The research base (what each source actually established — verified)

### 2.1 CHI 2026 latency paper — Tan, Messerschmidt, **Wen** Yin & Nov (NYU Tandon)

arXiv 2604.06183 (verified; DOI 10.1145/3772318.3790716 corroborated, ACM DL bot-blocked). n=240,
2 (Creation/Advice) × 3 (TTFT 2/9/20s) fully between-subjects, GPT-4o, streaming fixed at 25 tok/s
after onset. *(Note: the third author is **Wen** Yin per arXiv — earlier repo docs implying "Wendy"
should not be quoted.)*

- **Thoughtfulness:** 2s **M=5.76** < 9s **M=6.09** (p=.008) < 20s **M=6.11** (p=.040). Identical
  content, judged less thoughtful when fast. Mechanism: the **effort heuristic** — "latency can bias
  evaluations of depth independently of content."
- **Usefulness:** 9s (**M=6.44**) beat 2s (p=.021); **20s added nothing** and qualitatively triggered
  reliability doubt ("made me question if my internet cut off", P100, 20s Advice). Reliability
  concerns were "most prevalent in the longest waits and Advice tasks" — the *qualitative* asymmetry
  is real; **quantitatively the latency×task interaction was ns** (do not overstate this in the case
  study).
- **31% attributed the delay to AI deliberation** (43/140 who noticed a delay). ~14% raised
  reliability concern. Delay-noticing rose with latency (23–29% → 73–83%).
- **Temporal predictability** (via Riemer et al. 2023): *deviations* from expected timing erode
  confidence — not the delay itself. LokAI is deterministic: same input → same beat, every time. A
  stable rhythm is a trust asset almost no LLM product can offer.
- **Ethics (the paper's own):** deliberate slowdown "sits uneasily between positive friction and
  potential deception" (Adar et al. benevolent-deception framing); **novices over-trust slow outputs**,
  so latency can widen calibration disparities. The paper's prescription: *"offering users insight
  into this behavior, or control over it, helps preserve agency."* → This is exactly why the LokAI
  beat must be **skippable and inspectable** (Skip control + gate trail), not just long.
- Four design implications (verbatim headings): "Instantaneous output need not be the priority" ·
  "Mid-length pauses can be leveraged strategically" (pair with micro-prompts) · "Mitigate the costs
  of long delays" · "Calibrate latency to task orientation."

### 2.2 Apple HIG — Generative AI (2026-06-08 update) + Machine learning

Quotes verbatim from Apple's canonical pages (fetched via Apple's docs JSON endpoints):

- **While generating:** "Consider giving specific, reassuring feedback during generation… instead of
  'Processing…', say 'Finding substitutions for ingredients'… Specific feedback reduces uncertainty
  and makes waiting feel purposeful. If something goes wrong, describe what happened in plain language
  and offer a clear next step."
- **Corrections take effect:** "acknowledge when their corrections take effect… This kind of feedback
  helps people build an accurate mental model of your feature and fosters trust over time." → the
  live-recompute beat is not decoration; Apple names it as the trust mechanism.
- **Blocked output:** "Minimize scoped or blocked output by coaching people how to be more successful
  next time." → the stop's *still-available* actions.
- **Confidence — the load-bearing quote for LokAI's no-percentage law** (ML page, Confidence):
  *"If you're not sure how your confidence values correlate with the quality of your results, it's not
  a good idea to convey confidence to people."* And Attribution: *"In most situations, using
  percentages, statistics, and other technical jargon doesn't help people assess the results you
  provide."* And Attribution's alternative: name the *behavior* ("Because you listen to pop music"),
  not a score. → **Apple independently validates the claim-ledger substitution.** LokAI's case study
  can cite Apple, not just its own argument.
- **Hallucinations:** "Avoid using AI-generated content in situations where a possible hallucination
  could misinform **and harm someone**" (exact wording — the circulating "or" version is a paraphrase).
- **Refine/revert:** surface Edit/Undo/Retry/Adjust near generated content; "Never rely on corrections
  to make up for low-quality results."

### 2.3 Microsoft — AI App Architecture for Startups (2026-05) + Azure latency guidance

- **Latency anatomy:** TTFT, TBT, TTLT (`TTLT = TTFT + TBT × tokens`); "end-to-end latency typically
  depends more on the request pipeline than on raw model inference speed"; set **latency budgets per
  step** (retrieval, tools, validation, model). No absolute ms budgets are published — cite the
  method, not invented numbers.
- **"Validate before you stream, not during":** perform blocking checks *before* output begins —
  "partial responses that must be withdrawn" are the named catastrophe. **This is the architecture
  argument for LokAI's first-fail-wins gate cascade: the stop is decided before the turn renders,
  which is why the stop can be art-directed (L6/L8) while a competitor's mid-stream refusal is a
  scar over its own output.**
- **"Don't stream by default"** for short/structured outputs — LokAI's structured response cards are
  the structured case; zone *reveals* are paced comprehension, not fake streaming (this distinction
  must be stated in the case study — MOBILE_AI_SYSTEM §2 already flags it).
- **Guardrails as a pipeline, not a retry cycle:** "Validate early, before expensive work… Verify
  once, not repeatedly." → the gate cascade is the pipeline; each gate runs once, first-fail-wins.
- **Fail visibly:** "If automated strategies cannot produce a reliable result, return a clear error or
  route the request to human review. Avoid silent failures." → the stop taxonomy + escalation ladder.
- **Progress UI:** "show progress states during retrieval or tool execution… 'Searching…,' 'Fetching
  data…' so users understand where time is being spent," and allow cancellation.

### 2.4 The 2026 shipped-product survey (13 products) — what "familiar" means

Convergent baseline every mainstream product ships:

1. **Live status line** with honest verb-phrases ("Searching the web…") — never a bare spinner.
2. **Collapsible thinking panel:** auto-opens while streaming, auto-collapses on completion to
   **"Thought for N seconds"** (ChatGPT, Claude, DeepSeek; Gemini "Thoughts" summaries; the pattern is
   codified in AI Elements `Reasoning` / Nexus UI `Reasoning`). Thinking text is summarized, never
   raw, for OpenAI/Google consumers; DeepSeek and Grok stream raw.
3. **Numbered inline citations → source panel** (Perplexity's pattern; Copilot added publisher names
   Nov 2025).
4. **Refusals are plain prose everywhere.** No shipped product has structured refusal UI, and the
   pattern libraries have no refusal pattern at all.
5. **Timers:** retrospective ("Thought for Xs") in chat; live elapsed only in terminal tools (Claude
   Code `(13s · ↑ 135 tokens · esc to interrupt)`); no consumer product shows per-step durations.
6. **Perplexity decomposes the wait** ("Searching → Reading → Writing") and keeps the steps as a tab;
   Copilot's Deep Search shows an "activity block" of named steps with `completed/inProgress` status.
7. **Voice:** ~750ms–1s is the tolerance band before a voice gap reads as broken; the standard
   gap-filler is the backchannel ("let me think…"); ChatGPT Advanced Voice is duplex (~230–320ms
   reported) and largely avoids the silent gap rather than designing for it.

**The verified open space — nothing ships any of these:**

- **Computed decision receipts** (a shown derivation where the answer is visibly the deterministic
  output of stated inputs — all shipped citations point to *external* sources, never to the
  computation over the user's own facts);
- **Gate/rule stop explanations** ("why the pipeline stopped" as rule evaluation, not prose);
- **Visible verification of the user's own facts** (products confirm *their* sources; none re-display
  the user's stated facts as checked inputs);
- **Preserved-progress refusals** (shipped refusals discard the accumulated work; Setproduct's
  stopped-state rule — preserve partial output, offer Continue — is the nearest shipped pattern and
  stops at text).

Every one of the four is already specified in this repo (receipts, gates, verification gate,
`preservedSummary`). The survey confirms it is unclaimed ground, and names the familiar anatomy the
design must wear while claiming it.

### 2.5 Component anatomy sources (vault pass, 2026-09-27)

Read as code, not screenshots. Paths under `D:\Design Tools\Ui kits and components\library\content\`
(licensing irrelevant for this personal build):

| Need | Best anatomy | What to steal |
|---|---|---|
| Working indicator | `aicss/thinking-state` + `componentry-smooth/ai-loader` | hold-then-sweep shimmer (2.25s, holds 0–18%/82–100% — calmer than linear loops); one shared cycle constant; `role="status"` + `aria-live="polite"`; **never fake determinate progress** |
| Reasoning panel | `componentry-smooth/ai-reasoning` + `spectrum-ui/reasoning-trace` | state machine: auto-open while working → 600ms beat → auto-collapse **once** → user-latch overrides auto forever; `grid-template-rows: 0fr↔1fr` CSS collapse (no JS measurement); shimmer only while working ("a permanently shimmering label is just decoration") |
| Step list | `componentry-smooth/ai-task-list` + `spectrum-ui/agent-steps` | **derived counts, never passed** ("a 3/7 that drifted from the rows destroys trust"); drawn check via `stroke-dashoffset`; completed rows settle to 0.65 opacity ("completed things go quiet"); one travelling underline ("one moving thing at a time"); connector line + expandable results |
| Citation chips | `spectrum-ui/citation-sources` + `componentry-smooth/ai-citation` | `[n]` marker parsing → mono chips; CSS-only tooltip (keyboard-safe); preview card grows out of the pill (`transformOrigin: bottom center`); Escape/focus close. **Avoid anything fetching favicons (network gate)** |
| Voice | `elevenlabs-ui/speech-input` + `live-waveform` + `voice-button` | **partial vs committed transcript split** (the transcript-editing model); waveform renders from a *data array* → feed scripted deterministic data, never `getUserMedia`; 5-state mic machine (idle/recording/processing/success/error) |
| Turn shell | `componentry-smooth/ai-message` + `ai-tool-call` | bubble-less assistant stacks ("a bubble around a stack of cards reads as a box inside a box"); always-mounted action row revealed on hover/focus (no layout jump); **one SVG ring morphs through the whole lifecycle** (breathe → rotate → drawn check/cross) — the eye tracks one object instead of icons popping |
| Conversation | `componentry-smooth/ai-conversation` | follow-bottom only within 48px; "Jump to latest" pill |

**Vault trust laws to embed as design-system comments** (they generalize beyond one component):
never fake determinate progress · counts are derived, never passed · one moving thing at a time ·
shimmer means working · one object morphs through its lifecycle rather than swapping icons ·
completed things go quiet · a beat before anything auto-collapses · once the user takes manual
control, the system never overrides them again.

---

## 3. The design law (derived rules, each traceable)

**R1 — The wait is a designed surface, and LokAI's wait is *true*.**
Consequence-scaled (CHI implication 4 + System Thinking's friction law), narrated (Apple's specific
feedback + Zhang framing cues), skippable (CHI ethics: insight or control), predictable (Riemer —
determinism is the asset). Never padded: every stage names work the decision actually performs.

**R2 — Familiar anatomy, honest content.**
Keep the convergent 2026 shape (status line → collapsible panel → collapsed summary line). Fill it
with things no competitor can: the collapsed line is the **gate trail**, not a timer; the panel is the
**receipt**, not summarized vibes.

**R3 — Decide before you render (Microsoft's law, LokAI's architectural edge).**
All blocking checks (G1–G6) resolve before the first visible output token. The stop is therefore the
first thing the system says and can be art-directed (L6/L8), never a retraction.

**R4 — Provenance, never confidence.**
Apple's Confidence section is the external anchor; the ledger (`N of M sourced`) is the instrument;
percentages remain banned repo-wide. The internal/external split (thresholds are engine policy;
evidence is user-facing) is stated in the case study as an argued substitution, per `pdf-patterns` C1.

**R5 — Counts derived, one mover, quiet completions.**
Ledger numbers recompute from state (G9) — never authored literals (the vault's "derived counts"
law is the same law as the blueprint's G9). During any multi-step state, exactly one element moves;
completed elements settle. This becomes ratchet-enforceable style guidance in `LLM_DESIGN_SYSTEM.md`
(follow-up).

**R6 — Chrome scales with consequence (alarm-fatigue guard).**
Echo silent when clear; risk chip only when tier ≠ self_service; receipt collapsed by default;
compact cards for clarify/confirm/progress. Variable Friction (pdf corpus) + D8/D10 hold.

---

## 4. The pipeline, state by state (the consumer UX)

Five visible states per turn. Each names what is on screen, what it says, and why. Mode chip
vocabulary, densities, and the stop inversion come from `star-interaction.md` §3 and EMOTION_CRAFT —
they hold. What follows adds the **working beat** (the missing design) and refines the rest against
the research.

### S0 · Input & echo (G1) — unchanged, confirmed
Ask-first echo strip: "Understood as: consumer refund ✓ · 2 facts confirmed · 1 missing." Silent when
clear; inline confirm morph only on ambiguity (D8). Chips/voice/attachments bypass. **Familiarity
check:** this is the one place LokAI may exceed the baseline (no shipped product shows an echo) —
allowed because it appears only when it has something to say.

### S1 · The working beat (G2→G5/G6 firing) — **the big upgrade**

**Current build (walkthrough evidence):** one quiet capsule, 4 × 400ms ≈ 1.6s, generic labels,
skip + replay present. It flashes past in the band CHI penalized, and nothing in it is
consequence-scaled.

**Target anatomy (mobile 390 / desktop both):**

```
┌──────────────────────────────────────────────┐
│ ◐ Checking what your question covers      ✓  │   stage line · verb + object (Apple's law)
│ ◐ Matching the law to your facts             │   one active stage, completed settle quiet
│                                              │   (ai-task-list anatomy, 2-row max visible)
│                                    Skip · ⏱  │   escape hatch stays; elapsed counter
└──────────────────────────────────────────────┘   is tabular-nums, mono, quiet
```

- **Stage labels = the gates firing.** "Checking what your question covers" (G1/G2 scope) →
  "Checking the Consumer Protection Act, 2019" (G5 grounding) → "Matching the law to your facts"
  (G6 verification) → "Preparing your answer" (G7/G9). The waiting state and the failure state become
  the *same pipeline viewed from two outcomes* — if a gate fails, the stop card names the stage that
  failed. This is the thinking pipeline made visible without inventing "thoughts."
- **Consequence-scaled duration** (the timing law, now with exact targets):

| Turn class | Beat | Rationale |
|---|---|---|
| Factual self-service (notice reading, section lookup) | ~2.5–3s total, stages compressed | "the user wants the number, not theater" (journey §7.3); still outside the 2s penalized band |
| Advice-class (assessment, limitation, disclosure — LokAI's core) | **6–9s narrated**, skippable | the 9s usefulness sweet spot (M=6.44); Advice tolerated deliberation *when narrated* |
| Protective stop | **≤1.2s to the stop card** | "a refusal that takes 9 seconds reads as the system struggling to say no" |
| Confirm/progress beats | near-instant (<1s) | variable-friction floor |

  Implementation: per-class `STAGE_MS` table in `responseEngine.ts` keyed by the engine's outcome
  class (P2 ships the classifier; the timing table rides with it). Same input → same beat, every
  time (Riemer's predictability dividend — say this in interviews).
- **The retrospective line (the familiarity hook, made honest).** When the answer lands, the working
  beat collapses to one quiet line above the card — the ChatGPT "Thought for 9 seconds" slot — but
  LokAI's line is the **computed gate trail**:
  `Scope ✓ · Grounding ✓ · Facts ✓ — 4 of 5 claims sourced ▸`
  Tap → the receipt (S4). No timer, no fake deliberation; it summarizes what actually ran. This one
  element carries the whole thesis in the familiar anatomy: *the same slot competitors use for an
  opaque timer, LokAI fills with an inspectable derivation.*
- **Shimmer means working:** the hold-then-sweep shimmer (`aicss` anatomy, re-tokened) applies to the
  active stage label only while it is active. For Indic scripts the shimmer is **opacity-based, not
  background-clip** — gradient text-clipping smears Devanagari matras and breaks the `<Text>` script
  contract (§6).
- **Reduced motion:** stage changes cross-fade; shimmer static; elapsed counter still counts (it is
  information, not decoration).

### S2 · The answer (G7) — the register upgrade, now grounded

The three zones are not a layout preference — **they are IRAC.** Legal analysis is taught and
reviewed as separated registers: Issue → Rule → Application → Conclusion; collapsing rule, client
application, and action into one fluent paragraph is precisely the register-collapse that makes
hallucinated law dangerous (a confident blob cannot be audited register-by-register). The case study
should name IRAC/CREAC explicitly: LokAI's zones 1–3 are the consumer-legible form of
Rule/Application/Conclusion, and **each register now declares its evidence class** (journey §5.2):

| Zone | Register | Declares | Visual |
|---|---|---|---|
| 1 · What the rule means | the law speaking | **Citation** — `S.2(10)`, `S.35` chips | display serif (Latin) / script sans for Indic |
| 2 · How it applies here | LokAI reasoning on your facts | **Fact anchor** — chip naming the confirmed fact, jumps to the verification gate | sans + quiet fact chip |
| 3 · What you can do next | LokAI suggesting | **Consequence** — cost, deadline, channel | sans + consequence line ("Registered post with AD — ₹X · 30-day window") |
| 4 · What this doesn't cover | the honest gap | **materializes only when** `groundedClaims < totalClaims` | amber, never red (honest_gap) |

Zone 4 is the "explicit non-hallucination admission" the pattern corpus asks for, turned into a
structural guarantee. The ledger stays a gated footer (only when claims > 0); "How we checked" stays
as the verification trace; the new gate-trail line (S1) sits above the card as its decision summary.

### S3 · The seam (stop / disclose / recover) — structure confirmed, one L6 violation to fix

Contract (unchanged, all three seam forms): one plain sentence · **what is preserved** (the line every
competitor omits) · what is still available · the receipt · tonal inversion (light: full-bleed dark;
dark: warm luminous). Escalate is a first-class verb; the human path (lawyer / legal aid / 1915 /
e-Daakhil / registered post) is the primary button.

**Walkthrough finding:** the `?failure=high_risk` stop renders on cream with a navy CTA — correct
*structure* ("STOPPED · YOUR CASE IS SAFE", one sentence, safe action primary, quiet
"Ask a different question") but **not tonally inverted** — an L6/L8 violation on this route. The
full-bleed treatment exists for the stage-flow stop; the `failure=` param route needs the same
`tone="stop"` wrapper. This is the case-study money shot; it must invert in both themes.

### S4 · The receipt (the differentiator) — anatomy

Collapsed by default (D7). Two entry points: the gate-trail line (S1) and the quiet text-tap
"Why this response?" (never a button — one-CTA law). Open state:

```
Why this response?  ▾   (text affordance)
┌────────────────────────────────────────────┐
│ DECIDED  Explanation · risk: self-service   │   outcome + tier (typed, from engine)
│ BECAUSE                                     │
│  [fact: purchase date confirmed]            │   because-chips → tap = fact row
│  [source: CPA 2019 · S.2(10) — direct]      │   because-chips → tap = source sheet
│ GATE G7_CONTENT · rule CONTENT_MATCH        │   mono/meta register, not prose
│ "Matched your refund question to the        │   humanLine — the one honest sentence,
│  prepared consumer explanation."            │   no numbers
│ Policy dl-1.0.0                             │   policyVersion stamp
└────────────────────────────────────────────┘
```

Behavioral spec (from the vault state machine, re-tokened): auto-open **never**; opens on tap; a
600ms settle beat before any content reflow; once the user has toggled it manually, it never
auto-behaves again (user-latch). `aria-live="polite"` announcement on open (review-addition #1).
No numbers anywhere in the receipt (R4). The receipt is the *decision* trace; "How we checked" stays
the *verification* trace; both collapse, neither is a button.

### S5 · The Spine — cross-turn continuity (P5, unchanged)
One component, two docks (desktop collapsible panel / mobile Sheet, composer clearance respected).
Rows = `DecisionReceipt[]` from DemoContext — single source of truth. Live recompute beat: flip a
fact → gates re-fire → gate-trail lines, risk chips, and ledgers rewrite **in place** (Apple's
"acknowledge when corrections take effect" as a system property). Failure and Recovery render as
Spine states, never skipped.

---

## 5. Voice — the same pipeline under a tighter clock

Voice exists to serve the stressed, possibly low-literacy, voice-first user (typing legal terms in
Devanagari or Tamil on a phone is genuinely hard). The pipeline is identical; three adaptations:

1. **The clock tightens.** Conversational voice tolerance is ~750ms–1s before a gap reads as broken
   (vs. CHI's 2s+ for chat). The narrated beat survives as a **spoken backchannel** at stage
   boundaries — "Let me check what applies…" — while the visual stage line runs. The scripted engine
   makes the rhythm deterministic; the backchannel is honest (it names the stage that is running).
2. **The transcript is the echo.** S0's ask-first echo becomes the **read-back confirm**: partial
   transcript streams into an editable field (partial vs committed split, `speech-input` anatomy),
   and nothing is classified until the user commits it. Voice never bypasses the gates — it enters
   at S0 like typing. The `unclear` path refuses to guess and always offers the text escape
   (the existing `voice-unclear` specimen contract).
3. **Waveform from data, not microphones.** The waveform renders from a deterministic scripted array
   (`live-waveform` renders from a data array — feed it prepared data; `getUserMedia` stays banned).
   The mic button adopts the 5-state machine (idle/recording/processing/success/error) with the
   icon-crossfade anatomy.

Case-study voice beats (already targeted in MOBILE_SCREENS §5): `voice-capture` (listen →
transcribe → **editable confirm** → same pipeline) and `voice-unclear` (refuses to guess). The trust
claim is unchanged from PRODUCT.md: nothing commits from voice.

---

## 6. Multilingual — the pipeline is a language surface, not a translated screen

The four prepared packs (EN/HI/MR/TA) must carry the **pipeline strings**, not just the answer
bodies. New translatable surface inventory (each lands in all 4 packs or the language gate breaks —
review addition #3): stage labels (S1), the gate-trail summary line, receipt labels (DECIDED /
BECAUSE / GATE / humanLine templates), risk-tier chips (via `statusVocabulary.ts` — never
hand-written), stop copies (already packed), echo strip.

Craft rules specific to the pipeline:

- **No gradient-clip shimmer on Indic runs** — opacity shimmer only (S1). Background-clip text
  effects assume Latin stroke density; on Devanagari/Tamil they band and smear matras.
- **Stage-line length budget:** Hindi/Marathi/Tamil stage labels run ~15–30% longer; the two-row
  visible cap (S1) must not clip at 390px — labels wrap to the object line, never truncate mid-word
  (Devanagari has no hyphenation).
- **The gate-trail chips (`Scope ✓ · Grounding ✓`) are visual, not lexical** — they read as
  checkmarks + short tokens; their tap-in receipt carries the localized sentence. Keeps the familiar
  line compact across scripts.
- **Per-script line-height and the `calc(1em + 1px)` rule** apply inside stage lines and receipts as
  everywhere else (`<Text role>` owns it; MOBILE_AI_SYSTEM §2.1's open check still applies).
- CHI's sample is US-only — the case study must admit the latency finding is not validated across
  cultures or scripts (journey §10.6 already carries the honest-limits pattern; extend it).

---

## 7. The worried human — stress-state alignment

Every pipeline decision above re-checks against cognitive tunneling (stressed readers take the first
strong element and skip chrome):

- **Answer first holds under the new beat:** the working beat is *one* line + one mover; when the
  answer lands it is the focal move; the gate-trail line is quieter than the answer (R5).
- **The beat must never become a barrier for the distressed:** Skip is always visible during the
  beat, and stops arrive fastest of all (≤1.2s) — the system gets *out of the way* precisely when the
  news is bad.
- **Consequence copy at the confirmation gates** ("If you file this reply, the fee is ₹X and the
  deadline is Y") is the stressed reader's decision format — the cost of being wrong, stated where
  the finger is, not in a policy footer.
- **Preserved-state lines** answer the terrified question the refusal always triggers: *did I just
  lose my work?* — "Your case is safe" first, explanation second.
- **Two containers max (L1)** survives: the working beat is a list on the ground, the answer is
  zones on the ground, only sources/receipts are surfaces on demand.

---

## 8. Component sourcing (the build kit, condensed)

All paths `…\library\content\`; all re-implemented through LokAI tokens (T.*/LAYOUT./MOTION.), no new
runtime deps, copy-in per P7 — licensing noted as irrelevant for this personal build (owner decision
2026-09-27), but Commons-Clause kits still must not be redistributed as a kit.

| Pipeline element | Build from |
|---|---|
| S1 stage line + shimmer | `aicss/thinking-state` (timing) + `componentry-smooth/ai-task-list` (statuses, derived counts, drawn checks, quiet rows) |
| S1 elapsed counter | `componentry-smooth/ai-loader` (tenth-of-second render gate; mono tabular-nums) |
| S1→S2 collapse (gate-trail line) | `componentry-smooth/ai-reasoning` (state machine, user-latch) + `spectrum-ui/reasoning-trace` (`grid-template-rows` collapse) |
| S2 citation chips | `spectrum-ui/citation-sources` + `componentry-smooth/ai-citation` (grow-from-pill; **strip favicon fetching**) |
| S3 stop | existing StopState + L6/L8 fix on the `failure=` route |
| S4 receipt | `componentry-smooth/ai-reasoning` shell + existing "How we checked" pattern; gate/rule in mono register |
| Voice | `elevenlabs-ui/speech-input` (state model) + `live-waveform` (data-driven, scripted feed) + `voice-button` (5-state) |
| Turn shell polish | `componentry-smooth/ai-message` (always-mounted action row) + `ai-tool-call` (one morphing ring for evidence/gate chips) |

---

## 9. Quality gap — live walkthrough (2026-09-27, dev build, gates green)

Verified by driving the running app (desktop 1440 + mobile 390). Findings in priority order:

| # | Finding | Evidence | Fix / phase |
|---|---|---|---|
| 1 | **Drift bug is live:** "What about my rent agreement dispute?" rendered the confident consumer EXPLANATION card ("4 of 5 sourced") — the fallback turn answers out-of-scope input | desktop chat walkthrough | **P2 engine** — G2 makes `out_of_scope` unreachable-by-fallback; this walkthrough is the before/after demo pair |
| 2 | **No receipt anywhere** — no "Why this response?", no gate trail; trust signals are literals on the card | walkthrough + `verify-demo.mjs` has no receipt assertions | P2 (compute) → P3 (render) |
| 3 | **Working beat is in the penalized band:** 4×400ms ≈ 1.6s, uniform, generic labels, tiny capsule; skip exists (good) | walkthrough + `responseEngine.ts:17` | §4-S1 timing table + gate-labeled stages (P2/P4) |
| 4 | **`?stage=failure` deep link renders an empty screen** (header + nothing) | mobile walkthrough | fix the broken deep link (the `?failure=` class the audit warned about — re-verify the whole catalog) |
| 5 | ~~**High-risk stop is not tonally inverted**~~ **RETRACTED 2026-09-28** — the 2026-09-27 walkthrough captured the stop in the *dark* theme, where the cream ground IS the correct L8 luminous inversion. Verified in both themes 2026-09-28: light → full-bleed navy; dark → warm luminous. The route was always correct. | mobile walkthrough, both themes | none — finding was a theme misread |
| 6 | **Mobile case header contrast:** stage title renders as a near-invisible ghost line above the real heading ("Verify the facts" barely legible on cream) | verify/assess walkthrough screenshots | contrast pass; if it is a deliberate watermark, it fails WCAG and must go |
| 7 | **User bubble re-saturated to navy** (working tree, `lokai-chat-bubble-user`) — reverses audit §3.7's quieting decision | desktop walkthrough + git diff | **open decision** — pick one: filled navy (current tree) or quiet surface (audit's call). If kept, it must be logged as a superseding decision, not drift |
| 8 | Desktop dead zone between short answers and the composer | walkthrough | spacing law: content min-height or top-anchored composer gap (P6 polish) |
| 9 | Voice screen: honesty line correctly demoted, but mid-screen dead zone; waveform unwired; the two specimens unshipped | voice walkthrough | §5 voice pass (P7-adjacent) |
| 10 | ~~Notice reader empty state is full navy~~ **RETRACTED 2026-09-28** — same cause as #5: that capture was the dark theme; the empty state sits on the paper ground in light. No L5 violation. | walkthrough, both themes | none — finding was a theme misread |

None of these contradict the plan — 1–3 are exactly P2–P4; 4–6 are new named defects this walkthrough
adds to the P1/P3 lists; 7–10 are decisions, not oversights, and need one-line entries in
REDESIGN-PLAN §4 if the current tree's choices stand.

---

## 10. Build order (maps onto REDESIGN-PLAN — no new phases)

| Step | Work | Phase |
|---|---|---|
| 1 | Engine wiring: G1–G9 computed; drift fixture asserts `stop(out_of_scope)` — kills finding #1 structurally | P2 |
| 2 | **Timing table** (per-class STAGE_MS) + gate-labeled stage strings (4 packs) | P2/P4 boundary — small, ships with the engine |
| 3 | Gate-trail collapse line + receipt accordion + "Why this response?" (S1→S4 render) | P3 |
| 4 | Echo strip + Hold-to-Confirm (unchanged from plan) | P4 |
| 5 | Spine + live recompute (unchanged) | P5 |
| 6 | L6 fix on `failure=` route, deep-link catalog repair, header contrast | folds into P1 remainder/P3 |
| 7 | Voice pass (waveform from data, specimens, backchannel beat) | §5 above, after P5 |
| 8 | Verification: receipt assertions in `verify-demo.mjs`; fresh screenshot set including the drift before/after pair | P8 |

**Dependency law unchanged:** receipts before cards (P2 → P3). Authored receipts are trust theater.

## 11. What this licenses the case study to claim (and what it must not)

**Claimable, with evidence in repo:** the familiar 2026 thinking anatomy filled with computed truth
(gate trail vs "Thought for Ns") — unclaimed per the 13-product survey; the consequence-scaled,
narrated, skippable, *deterministic* wait, calibrated to a published n=240 study; the no-confidence
substitution now anchored to Apple's own HIG wording; decide-before-render as the reason the refusal
is art-directable (Microsoft's law); receipts/gates/preserved-progress as the four verified open
spaces, all shipped.

**Not claimable:** that latency findings extend to Indian or Indic-script users (CHI sample is
US-only); that the beat is "validated with users" (it is research-applied, uninstrumented — say so);
any Jev mention; any live-AI capability. The staged reveal must keep being described as *pacing over
real work*, never faked latency (CHI's ethics section + MOBILE_AI_SYSTEM §2 both require it).

## 12. Source register

- Tan, F. F.-Y., Messerschmidt, M. A., **Yin, W.**, Nov, O. — *The Impact of Response Latency and
  Task Type on Human-LLM Interaction and Perception*, CHI '26. arXiv:2604.06183 · DOI
  10.1145/3772318.3790716 (corroborated). Related-work anchors: Zhang et al. 2024 (framing cues —
  in-text characterization only, full entry unverified), Riemer et al. 2023 (MUC '23 workshop,
  DOI 10.18420/muc2023-mci-ws05-106), Stackpole 2024 (MIT Sloan), Park et al. 2019 (CSCW,
  DOI 10.1145/3359204), Shi et al. 2025 (performative deliberation, arXiv:2509.10830).
- Apple — Human Interface Guidelines: *Generative AI* (2026-06-08 update) + *Machine learning*
  (Confidence/Attribution/Mistakes sections). developer.apple.com/design/human-interface-guidelines.
- Microsoft — *AI App Architecture for Startups* (learn.microsoft.com/en-us/startups/build/ai/
  ai-app-architecture, 2026-05) · *Azure OpenAI performance & latency* · *Application Design for AI
  Workloads (Well-Architected)*.
- Shipped-product survey (2026-09-27): ChatGPT, Claude (+ Claude Code), Gemini, DeepSeek, MS Copilot
  (Rankly Deep-Search payload analysis), Grok, Perplexity, Cursor, Devin, Le Chat, Meta AI, Notion,
  + voice (Advanced Voice, Hume EVI 2, Siri; CHI 2025 backchannel taxonomy,
  DOI 10.1145/3742413.3789091). Pattern references: Shape of AI (Stream of Thought, Citations),
  Setproduct AI-chat anatomy, AI Elements `Reasoning`.
- Component vault pass (2026-09-27): kit/paths listed in §8.
- Live walkthrough (2026-09-27): desktop + mobile dev build, screenshots, gates green
  (`verify:demo` · `typecheck` · `build`).
