# LokAI — The Product Journey & Star Interaction (session record of record)

Date: 2026-09-23 · Author: design-engineering session · Status: **thesis + build + narrative in one document** ·
Supersedes: `design-reports/interaction-concepts/star-interaction.md` (kept as the interaction-level spec; this document owns the argument)

**What this is.** The full arc from product premise → research base → the unclaimed category → the
interaction design → what to build → how to say it in an interview. It exists so the reasoning survives
without re-deriving it, and so future work is checked against one thesis rather than five frameworks.

**How to read it.** Sections 1–3 are why. Sections 4–7 are what. Sections 8–11 are how you ship and
say it. If you only have 10 minutes, read §3 (the unclaimed category), §7 (timing law — the newest and
least obvious finding), and §11 (the interview script).

---

## 0. Executive summary — the five things that changed this session

1. **The unclaimed category is not "AI that refuses."** Claude refuses visibly; ChatGPT supports
   visibly. Both are occupied. The open space is the third state: **deliver the defensible part, name
   the boundary, hand off the rest — with the seam between them designed as a surface.** Nobody ships
   that. Claude ships a wall; ChatGPT ships no seam; LokAI ships a seam with a receipt.
2. **The refusal must be decided before it is rendered.** Microsoft's architecture guidance says
   "validate before you stream, not during." That single line converts LokAI's stop from a *generation
   failure* into a *designed decision* — and that is why it can be art-directed while a competitor's
   cannot. This is the strongest architectural argument in the case study and it is not in any of the
   older reports.
3. **LokAI's current timing is empirically in the worst-performing band.** CHI 2026 (Tan et al., NYU/NUS,
   n=240) found 2-second responses rated *less thoughtful* (M=5.76) than 9s (M=6.09) and 20s (M=6.11).
   LokAI's staged beat is 4 × 400ms ≈ 1.6s to first zone — **squarely in the penalized band.** But the fix
   is *not* "add 7 seconds": the same paper found 9s was the usefulness sweet spot and 20s triggered
   reliability concerns specifically on **Advice** tasks, which is LokAI's task class. The law that
   falls out is: **delay must be earned and narrated, never silent and never uniform.** And because
   LokAI is deterministic, it can make that delay *perfectly predictable* — which almost no LLM product
   can, and which the paper names as a trust prerequisite.
4. **The three-tier response upgrades from a layout decision to a typography decision to an *evidence*
   decision.** Law / applies / next-step is register separation. The next iteration declares each
   register's evidence type: law carries a citation, application carries a fact anchor, action carries a
   consequence. Three registers, three evidence types, three visual treatments.
5. **The demo script in the existing docs contains numbers that do not exist in the data.** A
   "6 of 7 sourced → 5/7 to 6/7" beat circulated in the concept drafts (the string lives in
   `design-reports/interaction-concepts/concepts-draft.md:22` — *not* the recruiter one-pager, which
   was re-checked 2026-09-27 and carries no claim numbers); it does not match `responseTurns.ts`, where the
   real figures are 4/5 (explain), 2/3 (clarify), 5/5 (confirm). **Fix before any live demo** — a
   recruiter who watches the ledger move to different numbers than you promised loses trust in
   everything else you said. See §11.1.

---

## 1. The product base (restated, not re-litigated)

**Priya.** Bought a damaged ₹8,999 mixer. Seller refused a replacement. No lawyer, no legal vocabulary,
on a 390px phone, possibly reading Hindi, Marathi, or Tamil. Ten minutes of attention left.

**The job to be done.** Not "explain consumer law." *"I got cheated, I want my money back before I give
up."* The interface is designed for the problem solved, not the reply written.

**The empathy principle, stated once:** in legal, **a wrong answer is not a bad experience — it is a
missed deadline.** Therefore restraint is a form of care, and the most caring thing the interface can do
is decline to guess. Every subsequent decision in this document descends from that sentence.

**The boundaries are the product, not a disclaimer.** `PRODUCT.md` licenses: no live AI, no network, no
OCR, no upload, no mic permission; every legal record labelled `Illustrative · expert review pending`;
information, not advice. The prototype is deterministic on purpose — and as §7 argues, determinism is
also an *advantage*, not only a constraint.

---

## 2. The research base (what each source actually established)

Nothing below is asserted from opinion. Each row is a source and the specific thing it earned.

| Source | What it established for this design |
|---|---|
| **JEV research + decision-layer blueprint** (`decision-layer-research/`) | Typed decisions (noul / choice / score) with calibrated probabilities and sub-500ms targets; a gate cascade where one layer owns each outcome; a receipt shape (`gate + rule + because[] + humanLine + policyVersion`) that is *computed from state*, never authored |
| **Skills audit, 35 criteria** (`design-reports/LokAI-Design-Audit-2026.html`) | Mobile 20 PASS / 8 PARTIAL / 4 FAIL; desktop 19 / 8 / 4. Named FAILs are craft debt (press physics, safe areas, 16px input, desktop dark mode, OKLCH) — none are conceptual |
| **Component study, 18 libraries** (`design-reports/LokAI-Component-Report-2026.html`) | Every surface in this design maps to an existing component pattern; nothing needs inventing. Copy-in, no npm deps (ownership doctrine) |
| **PDF corpus — Responsible AI** | 6 pillars; the Designer's 5 Questions; the 6-step Safe Action Path; the Human Control Spectrum. This is the case-study spine *verbatim* |
| **PDF corpus — conversational patterns** | 44 patterns across 5 groups. Canonical loop: clarify → plan → confirm → execute → feedback → recovery. **Every example keeps the loop implicit.** Making it permanently visible is the novelty. "Boundary & Fallback Map" is the recognized deliverable name for a stop taxonomy |
| **PDF corpus — system thinking** | Consequence rule: higher consequence → greater visibility + control. Friction scales with stakes. Intent vs JTBD framing |
| **Trust-calibration research** | The goal is *calibration*, not maximum trust. Over-trust on hard tasks; under-trust when hedging is bad. Countable provenance calibrates; scalar confidence inflates |
| **Stress-state UX (cognitive tunneling)** | Stressed readers take the first strong element and skip chrome. Answer-first, one focal move, at most two containers. This is already codified as L1–L8 in `MOBILE_AI_SYSTEM.md` |
| **Denial / refusal-style studies** | Users prefer **factual denials with reasons and a recovery path** over bare refusal or moralizing. A dead end is worse than a "no" |
| **Explainable-AI critique (NN/g et al.)** | Chain-of-thought style explanations are often **unfaithful** to what the system did; reading them does not fix calibration. Users rarely click citations — but the *presence* of inspectability does work. Therefore: receipts must be gate+rule+computed, and citations must link to the **exact clause**, not a generic "Sources" page |
| **CHI 2026 — response latency** (Tan, Messerschmidt, Yin, Nov · arXiv 2604.06183 · DOI 10.1145/3772318.3790716) | See §7. The timing law. n=240, 2×3 between-subjects, TTFT manipulation at 2/9/20s, Creation vs Advice |
| **Apple HIG — Generative AI** (updated 2026-06-08) | "Avoid using AI-generated content in situations where a possible hallucination could misinform and harm someone"; "acknowledge when their corrections take effect"; "minimize scoped or blocked output by coaching people to be more successful"; plain-language failure + clear next step |
| **Microsoft — AI App Architecture for Startups** (2026-05) | "**Validate before you stream, not during**"; "don't stream by default… for short responses or structured outputs"; "design guardrails as a pipeline, not a retry cycle"; "expect non-deterministic outputs — design validation to tolerate variability"; "fail visibly… route to human review" |

---

## 3. The unclaimed category (the thesis)

### 3.1 Why the obvious framings are occupied

The instinct was to make the stop the star: *the AI that refuses.* Then the obvious objection arrives —
Claude refuses visibly and ChatGPT supports visibly. Both poles of the market are occupied. A case study
that says "we refuse, like Claude, but prettier" is a *reskin argument*, and reskin arguments do not
win interviews.

But the objection, taken seriously, produces a better answer than the one it replaces.

### 3.2 Three products, three boundary models

| | **Claude** | **ChatGPT** | **LokAI** |
|---|---|---|---|
| Boundary model | A **wall** | **No seam** | A **seam** |
| When the boundary appears | Before answering — it declines | Never visibly — it proceeds anyway | Mid-answer — it completes what it can defend, names the rest |
| What the user receives | A refusal, often with a lecture | A confident answer, uncalibrated | What was checked · what wasn't · what is preserved · who to take the rest to |
| Primary failure mode | **Abandonment** — refusing when it could have helped | **Over-reliance** — proceeding when it should not have | — |
| Where the boundary lives in the code | Policy layer, evaluated late | — | **Gate cascade, first-fail-wins, decided before render** |

Neither incumbent has a *designed boundary*. Claude's boundary is total and early; ChatGPT's is invisible
and late. LokAI's is **partial, mid-flow, and inspectable** — and that is the interaction nobody has built.

### 3.3 The thesis, stated in one sentence

> **Everyone is building AI that answers or AI that refuses. LokAI builds the third thing: an AI that
> completes the part of your problem it can defend, names the exact edge of what it will not guess at,
> and hands you the remainder with the work already done — and shows you the receipt for that decision.**

The star is not the refusal. **The star is the seam** — the designed surface where supported meets
unsupported. On a 390px phone, for someone who cannot afford to be wrong, that seam is where trust is
actually won or lost, and it is empty ground in every AI product shipping today.

### 3.4 Why the seam is designable here and not elsewhere

This is the argument that makes the thesis structural rather than aspirational:

- Microsoft's guidance is explicit — **"validate before you stream, not during."** Perform blocking
  checks *before* output begins, because a partially-emitted answer that must be withdrawn is a trust
  catastrophe.
- LokAI's decision layer is a **first-fail-wins gate cascade** that resolves the turn *before* the turn
  renders. The stop is not a retraction of a drafted answer. **It is the first thing the system says.**
- Consequence: a refusal that was never going to be drafted can be *art-directed* — full-bleed tonal
  inversion, one plain sentence, the safe action as the primary button, the preserved state, the human
  path. A competitor who starts generating and *then* declines cannot do this, because their refusal is
  a scar over their own output.
- This is also why `Turn.tsx`'s existing three-zone answer, the stop card, and the receipt are the same
  system: they are three renderings of one decided outcome.

**Interview line:** *"Most products treat a refusal as a failure to be handled gracefully. We treat it as
a decision to be designed — because we decide before we speak, not after."*

---

## 4. What the seam actually looks like (mobile-first spec)

The seam is three surfaces, not one. Ordered by when the user meets them.

### 4.1 Before the seam — the verification gate ("it won't guess about me")

Not a KYC form. A list of the facts the system is about to reason *from*, in hairline rows: **value
strong, label quiet beneath**. Exactly one fact is flagged `needs_review` with a warm tint and no
border (the exception is flagged, not boxed). The user confirms or corrects **before** the AI proceeds.

- Form-chat bi-directionality: editing the mini-form updates the matter store; the claim ledger
  recomputes without re-asking in prose.
- Confirmation copy states the **consequence**: *"If you file this reply, the fee is ₹X and the deadline
  is Y"* — never "confirm these facts."
- This is the emotional signature beat. Everyone else's intake is a wall you clear. This one is the first
  moment the product demonstrates that it will not invent things about you.

### 4.2 At the seam — three forms, one shape

| Seam form | When | Copy register | Primary action |
|---|---|---|---|
| **Partial delivery** (`disclose`) | Some of the answer is supportable, some is not | "What we can say" · "What is missing" · "What you can still do" | Do the part that is safe |
| **Protective stop** (`stop`) | The next step is unsafe, out of scope, contested, or time-barred | "Why LokAI stopped" · "What is preserved" · "Still available" | **The human path** (legal aid / lawyer / 1915) |
| **Pause + recover** (`recover`) | A temporary failure, nothing lost | "Paused" · "Your data" · retry | Retry, or read offline |

All three follow the same contract, so the seam is learnable after one encounter:

1. **One sentence, plain language, editorial size** — why this is the edge.
2. **What is preserved** — the user's work is never discarded by a refusal. This is the single most
   important line on the screen, and the one every competitor omits.
3. **What is still available** — 1–2 concrete actions, never a dead end. Apple's HIG: *"minimize scoped
   or blocked output by coaching people how to be more successful next time."*
4. **The receipt** — gate, rule, because-chips, human line, policy version. Tapping it is a quiet text
   affordance, never a button (one-primary-CTA law).
5. **Tonal inversion** — the stop is the tonal opposite of its surroundings (light: full-bleed dark;
   dark: warm luminous). The refusal is the most designed screen in the product.

### 4.3 After the seam — handoff as continuity

The receipt trail doubles as the **lawyer-handoff packet**. A stop is not a failure state; it is a change
of venue with the paperwork intact. "Take these notes to a qualified professional" is a *feature*, and it
is the moment a scared first-timer decides whether this product was honest with them.

---

## 5. The register upgrade to the three-tier response

### 5.1 What the three tiers already were (and why that was prescient)

The three-tier response — *what the law means · how it applies here · what you can do next* — is a
**typography decision wearing a layout costume.** Zone 1 is set in the display serif because it is the
law speaking; zones 2–3 are sans because they are LokAI reasoning and LokAI suggesting. That register
separation is the insight, and in 2026 every generic chatbot collapses all three into one confident
paragraph — which is exactly the mechanism by which legal hallucination becomes dangerous. The three
tiers were ahead of the market's thinking, not behind it.

### 5.2 The next iteration: each register declares its evidence type

If the tiers are registers, then the upgrade is to make each register **carry its own proof**, so the
visual treatment and the epistemic status are the same decision:

| Zone | Register | Declares | Visual treatment |
|---|---|---|---|
| **1 · The rule means** | The law speaking | **Citation** — `S.2(10)`, `S.35` | Display serif + inline citation chips (Indian channels preserved: e-Daakhil, 1915, registered post) |
| **2 · How it applies here** | LokAI reasoning on *your* facts | **Fact anchor** — which confirmed fact this rests on | Sans + a quiet fact chip that jumps to the verification gate |
| **3 · What you can do next** | LokAI suggesting an action | **Consequence** — cost, deadline, irreversibility | Sans + a consequence line: *"Registered post with AD — ₹X · 30-day window"* |

This satisfies the explainable-AI critique directly: the explanation is not a prose rationalization, it is
a **structural claim about the evidence class of each sentence**. A user can audit register by register
without reading a single "thought process."

### 5.3 The optional fourth register (conditional only)

A fourth zone — **"What this doesn't cover"** — appears *only* when the claim ledger reports
`groundedClaims < totalClaims`. It is not a separate mode; it is a register that materializes when, and
only when, the evidence is short. Chrome scales with content. This is the "honest gap" turned from a
fallback screen into a structural guarantee.

---

## 6. Composing it: the star interaction, final form

The interaction is one turn, decomposed into the beats that produce the feeling, each beat earning its
place against a named failure mode.

```
USER INPUT
   │
   ├─▶ [ BEAT 0 · Classified ]  Ask-first echo, ambiguity-gated.
   │       "Understood as: consumer refund ✓ · 2 facts confirmed · 1 missing"
   │       Fights: misread intent. Silent when clear; inline morph when ambiguous.
   │
   ├─▶ [ BEAT 1 · Verified ]    Verification gate. User owns the facts.
   │       Fights: the AI inventing things about you.
   │
   ├─▶ [ BEAT 2 · Worked ]      Named, skippable deliberation beat. §7.
   │       Fights: "instant = superficial." Delay is earned and narrated.
   │
   ├─▶ [ BEAT 3 · Answered ]    Register-separated answer, evidence per register. §5.
   │       Fights: law/advice/action collapsed into one confident blob.
   │
   ├─▶ [ BEAT 4 · Seamed ]      Partial delivery / stop / recover. §4.
   │       Fights: the invisible boundary. The seam is designed.
   │
   └─▶ [ RECEIPT ]              gate · rule · because · humanLine · policyVersion.
           Live-recompute: flip a fact → gates re-fire → the seam moves in place.
```

**The signature moment — the 15-second embed.** One fact is missing. The user confirms it. The receipt
row rewrites itself: the `because` chip for the missing fact disappears, the gate changes, the risk tier
changes, the claim ledger recomputes. Nothing is narrated; it simply is different, correctly, in front
of you. That is the whole thesis in one gesture: **the decision is derived from state you can see and
edit, not asserted by a model you cannot.**

**Why receipt beats prose as the explanation layer.** The CHI and XAI literature agree that users
rationalize whatever they read. A receipt is falsifiable — you can check whether the cited gate actually
fired. Prose is not. A design that shows its work in a *verifiable* format is doing something no amount
of "here's my thinking" copy can.

---

## 7. The timing law (the newest finding, and the one to lead with in interviews)

### 7.1 What the CHI 2026 paper found

Tan, Messerschmidt, Yin & Nov (NYU Tandon / NUS Augmented Human Lab), *The Impact of Response Latency and
Task Type on Human-LLM Interaction and Perception*, CHI '26, Barcelona. n=240. 2 (Creation / Advice) × 3
(TTFT 2s / 9s / 20s) between-subjects, GPT-4o, streaming held constant at 25 tok/s after onset — so the
manipulation is cleanly **time-to-first-token**, not total generation.

- **2s answers were rated less thoughtful** (M=5.76, SD=1.18) than 9s (M=6.09, p=.008) and 20s (M=6.11,
  p=.040). Fast read as superficial.
- **9s was the usefulness sweet spot**; 20s did not add thoughtfulness and, on **Advice** tasks,
  triggered reliability doubt ("made me question if my internet cut off").
- **Behavior was robust to latency** — prompting, copy, paste rates held even at 20s. A longer beat is
  low-cost behaviorally.
- **~31% explicitly anthropomorphized the wait as thinking**, raising expectations of quality.
- Related-work anchors used by the authors: framing cues during a pause increase perceived transparency
  (Zhang et al. 2024); **temporal predictability matters** — once expectations form, deviations erode
  confidence (Riemer et al. 2023); color-coded highlights act as "cognitive speed bumps" in an
  **inverted-U** (Stackpole 2024) — too little friction means skimming, too much means burden.

### 7.2 What LokAI currently does — and why it is in the penalized band

`responseEngine.ts`: `STAGE_MS = 400`, four stages, then the zone reveal. Time to first visible output
≈ **1.6s**, plus a 160–280ms first zone reveal. Measured against the paper's conditions, LokAI is
sitting essentially *at* 2s — the condition rated least thoughtful. This is not a subtle nuance; it is
the single most actionable finding of the session, and it is a *design* problem, not a performance
problem.

### 7.3 The synthesis: four rules

**Rule 1 — Delay must be earned.** A wait is justified only by work that actually happened. LokAI's
stages are named real work (*"Checking the Consumer Protection Act, 2019"*), so the beat is honest. What
must never happen: padding a delay with nothing behind it. The paper's own ethics section warns about
latency manipulation; the case study should state that the beat is *staging over real work*, not faked
human latency.

**Rule 2 — Delay must be narrated.** A silent pause is read as failure; a named pause is read as
deliberation (Zhang et al. 2024). LokAI's `TurnStatus` capsule already names each stage. It must remain
legible — the stage label is the entire mechanism, so it must not be the thing that gets optimized away.

**Rule 3 — Delay must scale with consequence, never uniformly.** The paper's central moderator is task
type: a 10s pause is fine while "coming up with ideas" and absurd for a binary recommendation. LokAI's
`EMOTION_CRAFT` (in `Turn.tsx:35-94` — zone-*reveal* pacing, not the working beat) already encodes
per-mode cadence (`protective_stop` fastest at 160ms, `relief_without_certainty` slowest at 280ms) —
but the *working* beat before the turn (`responseEngine.ts` `STAGE_MS`) is currently uniform. The
upgrade: **the deliberation beat is longest for the turns that most need deliberation and shortest for
the ones that don't** — keyed off the working beat, not EMOTION_CRAFT. (Attribution corrected
2026-09-27; see DECISION-INTERACTION-2026-09 §4-S1 for the exact per-class timing table.)

- Self-service factual turn (notice interpretation) → short beat. The user wants the number, not theater.
- Consequential assessment (the ₹8,999 assessment, the limitation question) → the full narrated beat.
  This is precisely the Advice-task case the paper found tolerates — and rewards — deliberation.
- A stop is *fast*: a refusal that takes 9 seconds to arrive reads as the system struggling to say no.
  Protective stops should arrive sooner and land harder.

**Rule 4 — Delay must be predictable.** Riemer et al.: once users form an expectation, *deviations* erode
trust — not the delay itself. Every LLM product has variable, unpredictable latency and therefore pays
this cost continuously. **LokAI is deterministic and can promise a consistent rhythm the first time and
every time after.** This is a real, under-claimed advantage that comes directly out of the prototype
constraint, and it is worth saying out loud in an interview: *the same question always takes the same
time, because the same work always happens.*

### 7.4 The skippable beat (the escape hatch that makes a long beat safe)

The long beat is only safe because it is **narrated and skippable** — `TurnStatus` already ships a
`Skip` affordance and a replay. A delay the user can cut short is a delay that respects them; a delay
they cannot cut is a hostage. Apple: *"give specific, reassuring feedback during generation."* Microsoft:
*"show progress states during retrieval or tool execution, and allow users to cancel long-running
requests."* Both describe the affordance LokAI already has and had not recognized as load-bearing.

**The change to make:** hold `STAGE_MS` at 400ms for high-consequence turns; compress it for
self-service ones; keep the stage labels and the skip control exactly as they are. That is a ~20-line
change with a research paper behind it, and it is the single highest value-per-hour item in this document.

---

## 8. What to build (mobile-first, sequenced, honest about scope)

Scope decision accepted: **mobile is the product.** Desktop is not being redesigned; the chat response
and the notice interpreter are the two surfaces carried to desktop purely to demonstrate that the system
is one component in two docks, not two visual dialects. The case study's parity argument is *"one
component, two surfaces"* — not *"two complete apps."*

| # | Change | Why now | Size |
|---|---|---|---|
| **1** | **Consequence-scaled deliberation beat** (§7.4) | Directly answers the CHI finding; tiny; research-backed | ~0.5 d |
| **2** | **Verification-gate catch made real** | The flagship must contain an actual conflict the system catches, not a nominal one | 1–2 d |
| **3** | **The seam: full treatment on all 3 forms** | Tonal inversion, preserved-state line, still-available actions, safe action primary | 2 d |
| **4** | **Decision engine wired → computed receipts** (`REDESIGN-PLAN` P2) | Receipts must never be authored. *This is the credibility gate.* | 2 d |
| **5** | **Register upgrade to the three tiers** (§5) | Each zone carries its evidence type | 1.5 d |
| **6** | **Ask-first composer + composer craft debt** | New interaction must not ship on 14px text (under the 16px iOS floor); one file, one review | 1.5 d |
| **7** | **Receipt surface** (desktop dock / mobile sheet, one component) | The live-recompute beat needs somewhere to live | 2 d |
| **8** | **Notice interpreter: two-way claim↔clause link** | The only move that survives "users rarely click citations" | 1 d |

**Order is not negotiable on one point:** item 4 before items 5–7. Authored receipts are trust theater,
and trust theater is the single failure this product cannot survive. Everything else can be reordered.

**Not building, on purpose:** live AI · backend decision engine beyond the preserved local
implementation · branching/regenerate UI (conflicts with determinism) · percentage confidence anywhere ·
the Trust-Transit metaphor in the interface · full desktop redesign · any new product surface
`PRODUCT.md` does not license.

---

## 9. The visual taste showcase (because product thinking alone does not get hired)

The thesis is an argument; the portfolio needs to *be* looked at. Three exhibits, in priority order:

1. **The stop, in both themes.** The single most important screenshot in the project. It should be the
   first image in the case study — a pattern interrupt that proves judgment before any feature list.
   Light: full-bleed dark. Dark: warm luminous. One plain sentence, the preserved line, one filled
   button that is the human path.
2. **The three-tier answer with its evidence registers.** The typography thesis made visible. This is
   the "I can read this designer's eye" screenshot.
3. **The live-recompute beat.** Two frames of the receipt row before and after a fact flip. Proves the
   system is real.

Then, as supporting evidence: the design-system graph (`ui-debt` ratchet counts over time), the 4-script
typography specimens, and the enforcement scripts themselves.

**Figma is not the lever here.** The competitive artifact for a design-engineering role is a working
prototype whose *taste is mechanically enforced* — which is exactly what `scripts/ui-debt.json` and
`verify-demo.mjs` are. No Figma portfolio on earth can show a ratchet that only falls. Lean into the
repo-as-artifact; use Figma for the three exhibits above, not for system documentation.

---

## 10. How to say it (interview-ready)

### 10.1 Thirty seconds — the pattern interrupt

> *"LokAI is a legal-guide prototype built around a question nobody else is asking: what should an AI do
> at the edge of what it knows? Not refuse — refuse when it can help is abandonment. Not comply — comply
> when it should hesitate is how people miss deadlines. It completes what it can defend, names the exact
> boundary, and hands you the rest with the paperwork intact. And because it decides before it speaks,
> the refusal is a designed surface, not a graceful failure."*

### 10.2 Ninety seconds — the demo (corrected numbers; see §11.3)

1. **Origin bug.** Type something out of scope → the scope gate fires → a stop card with its receipt.
   *"This is the bug that started the project: the answer came back anyway."*
2. **Live recompute.** A fact is missing and flagged. Confirm it → the receipt row rewrites, the gate
   changes, the risk tier changes, the claim ledger recomputes. Say the real numbers out loud as they
   appear.
3. **The seam.** Open a partial-delivery turn → "what we can say / what is missing / what you can still
   do." Tap the receipt: gate, rule, because-chips, policy version.
4. **Own and leave.** Draft submit → hold-to-confirm with the consequence stated → review-gated packet.

### 10.3 Deep dive — "why not just ChatGPT?"

> *"Chat optimizes for fluency. This optimizes for trust calibration — the metric for neither
> over-trusting nor abandoning. In a domain where a hallucinated citation is a sanctions matter, fluency
> without provenance is the hazard. So the provenance is countable — 'four of five claims trace to a
> source' — and the refusal is auditable, because a receipt is falsifiable in a way that prose
> explanation never is."*

### 10.4 The confidence question (argue it, never hide it)

> *"The pattern literature says show a confidence percentage. I deliberately don't. Self-reported model
> percentages are uncalibrated and invite precisely the over-reliance the same literature warns about.
> Four of five is checkable. 80% is theater. I argue the substitution in the case study rather than
> omit it."*

### 10.5 The latency question (the one that surprises people)

> *"A CHI 2026 paper with 240 participants found that identical answers delivered in 2 seconds were rated
> *less thoughtful* than the same answers at 9 or 20 seconds. My first build was sitting at 1.6 seconds —
> in the penalized band. But the useful part isn't 'be slower': 20 seconds triggered reliability doubt on
> advice tasks specifically, which is what this is. The law I landed on is that delay must be earned and
> narrated, never silent and never uniform — and because the prototype is deterministic, the rhythm is
> identical every time, which the same literature names as a trust prerequisite."*

### 10.6 Honest limits (say these before they ask)

- Prototype: no live AI, deterministic by contract (`PRODUCT.md`).
- Receipts are computed locally from the preserved engine, not from a production model.
- The PDF pattern corpus is one author's playbooks — corroborating design canon, not peer-reviewed.
- The latency finding is applied from research, not yet validated with LokAI users. *Say this. Proposing
  the instrument and admitting it is uninstrumented reads as maturity; claiming a number you don't have
  ends the conversation.*

---

## 11. Open items, risks, and the one bug to fix

### 11.1 The demo-script number mismatch — fix before any live demo

An earlier attribution error, corrected 2026-09-27: the recruiter one-pager is **clean** (no claim
numbers anywhere). The **"6 of 7 sourced"** / **"5/7 → 6/7"** beat originated as an example in the
concept drafts (`design-reports/interaction-concepts/concepts-draft.md:22`); any demo script that
picked it up must be corrected. The actual data in `responseTurns.ts` is:

| Turn | `groundedClaims / totalClaims` | Shows as |
|---|---|---|
| `consumer-explain` | 4 / 5 | "4 of 5 sourced" |
| `consumer-clarify` | 2 / 3 | "2 of 3 sourced" |
| `fact-confirmed` | 5 / 5 | "5 of 5 sourced" |

Either update the script to the real figures, or (better, and more honest) change the demo beat to the
one that is *true and stronger*: **clarify shows 2 of 3 because one claim is not yet grounded; after the
fact is confirmed, the explanation can ground four of five.** The recompute story is real — the numbers
in the script are not.

### 11.2 Risks

| Risk | Mitigation |
|---|---|
| The seam reads as bureaucracy, not care | The preserved-state line and the safe-action button are the two load-bearing elements; if either is missing it reads as a wall. Test on someone who does not know the product. |
| The long beat feels like a stall in a live demo | It is skippable by design. In an interview, *demonstrate the skip* — it proves the delay is respectful, not imposed. |
| "Everyone refuses" objection lands | §3.2's three-column table is the answer; it reframes from "we refuse" to "we complete-then-bound." |
| Scope creep back into a full desktop redesign | Mobile is the product (user decision, 2026-09-23). Desktop carries chat + notice only, as parity evidence. |
| Framework proliferation | One thesis, one demo, three exhibits. The five-beat and four-beat structures are *cut*; the beats inside §6 survive as implementation notes, not as branded frameworks. |

### 11.3 What is deliberately unresolved

- Whether the *latency* recommendation should ship before or after the *seam* work. Argument for seam
  first: it is the thesis. Argument for latency first: it is 0.5 days and answers the newest research
  immediately. **Current recommendation: latency first** — it is cheap, and it improves every demo you
  run while the seam work happens.
- Whether the desktop notice interpreter gets the two-way claim↔clause link or whether that stays
  mobile-only for now. Recommend mobile-only; carry the pattern to desktop when desktop is revisited.

---

## 12. Reference map

| Need | Go to |
|---|---|
| Product contract and boundaries | `PRODUCT.md` |
| Composition laws L1–L8 (answer-first, stop inversion) | `docs/MOBILE_AI_SYSTEM.md` |
| Build sheet, token rules, icon tiers | `docs/LLM_DESIGN_SYSTEM.md` |
| Sequenced engineering plan P0–P8 | `docs/REDESIGN-PLAN-2026-09.md` |
| Decision vocabulary, gates, receipt shape | `decision-layer-research/reports/lokai-decision-layer-blueprint.md` |
| **Decision interaction (working beat, gate trail, receipt UX, voice + multilingual pipeline, quality gaps)** | `docs/DECISION-INTERACTION-2026-09.md` |
| JEV mechanics and prior-art skepticism | `decision-layer-research/reports/lokai-jev-decision-layer-research.md` |
| 44-pattern corpus, conflicts C1–C6 | `design-reports/interaction-concepts/pdf-patterns.md` |
| Concept options and the adversarial review that killed most of them | `design-reports/interaction-concepts/{concepts-draft,concept-review,synthesis}.md` |
| Turn-level interaction spec (390 + 1440) | `design-reports/interaction-concepts/star-interaction.md` |
| 35-criteria audit scores and FAIL list | `design-reports/LokAI-Design-Audit-2026.html` |
| Responsible-AI extraction (5 questions, 6 pillars, Safe Action Path) | `extracted_content.md` §7 |
| Enforcement scripts (the systems proof) | `scripts/verify-demo.mjs`, `scripts/ui-debt.mjs`, `scripts/ui-debt.json` |

**External sources cited in this document**

- Tan, F. Y., Messerschmidt, M. A., Yin, W., & Nov, O. (2026). *The Impact of Response Latency and Task
  Type on Human-LLM Interaction and Perception.* CHI '26, Barcelona. DOI 10.1145/3772318.3790716 ·
  arXiv:2604.06183
- Apple Developer. *Human Interface Guidelines — Generative AI* (updated 2026-06-08)
- Microsoft for Startups. *AI App Architecture for Startups* (2026-05)
- Zhang et al. (2024) — transparency framing cues during latency, as cited in the CHI paper's related work
- Riemer et al. (2023) — temporal predictability, as cited in the CHI paper's related work
- Stackpole (2024) — highlights as cognitive speed bumps (inverted-U), as cited in the CHI paper

---

## 13. Verdict

The direction is real, and it is now stated in one sentence instead of five frameworks:

> **LokAI builds the seam — the designed boundary where a legal AI stops guessing and starts handing
> off — and it can only do that because it decides before it speaks.**

Everything else in this document is either the research that makes the seam defensible (§2, §7), the
design that makes it learnable (§4, §5), or the honesty that makes it credible (§10.6, §11). The build
list is eight items, the first of which is half a day and the fourth of which is the gate that keeps the
whole thing from being theater.
