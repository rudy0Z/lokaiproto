# LokAI — The Star Interaction (research-backed proposal)

> **SUPERSEDED as the thesis document (2026-09-23).** The argument now lives in
> `docs/PRODUCT-JOURNEY-2026-09.md` — the unclaimed category (the *seam*, not the refusal), the CHI
> 2026 timing law, and the register upgrade to the three tiers. This file is retained as the
> **turn-level interaction spec** (390px + 1440px anatomy, densities, receipt surface mechanics).
> Where the two disagree, the journey document wins.

Date: 2026-09-23 · Status: **interaction spec** (thesis owned by `docs/PRODUCT-JOURNEY-2026-09.md`) ·
Build order: unchanged (`docs/REDESIGN-PLAN-2026-09.md` P1→P5; this document specifies
*what those phases compose into*, not new work).

Question this answers: what is THE interaction a recruiter remembers, grounded in
behavioral research and the Responsible-AI material, built on the vocabulary the repo
already enforces — not a chatbot comparison, not backend plumbing.

---

## 0. The choice, in one sentence

**Every turn is a typed decision that ships with a readable receipt — classified before
it is answered, paced for a stressed reader, and re-derived live from state you can
flip.**

Positioning line (unchanged, already validated): *ChatGPT answers. LokAI decides, shows
its work, and stops when it can't own the answer — every turn is a typed decision with
a receipt you can read.*

The star interaction is not one widget; it is a **four-beat turn** plus its extreme
case (the stop). Each beat answers one piece of behavioral research:

| Beat | What the user experiences | Research it answers |
|---|---|---|
| 1 · **Understood** | Composer echo: "Understood as: consumer refund ✓ · 2 facts confirmed, 1 missing" — morphs to inline confirm only when classification is ambiguous | Ambiguity as first-class input; friction only where stakes justify it (Variable Friction) |
| 2 · **Typed** | Mode chip names the decision (`Explanation` / `Needs one fact` / `Stopped`…), emotional craft paces the zones, risk chip only when tier ≠ self-service, ledger only when claims exist | Trust calibration (label the *kind* of answer before the content); stress-state design (one focal move, answer first) |
| 3 · **Receipt** | Quiet text-tap "Why this response?" → one shared surface: gate · rule · because-chips · humanLine · policy version. Collapsed by default | Inspectable reasoning without machinery-in-your-face; explanations must be *faithful* (gate+rule+because is computed, never prose rationale) |
| 4 · **Recompute** | Flip a confirmed fact → gate L6 clears → risk tier changes → receipt and Spine update in place | Accountability: decisions are derived from visible state, not vibes; control (undo/steer) |

Extreme case — **the stop** (the money shot): full-bleed tonal inversion, one plain
sentence why, what is preserved, still-available list, and `escalate` printed as a
first-class verb. Bare refusals score worst in denial-style research; every LokAI stop
is a *factual denial with reason + recovery path*.

---

## 1. Behavioral research → design moves

Inputs from this research round (trust calibration, stress-state UX, denial/refusal
styles, explainable-AI critique, access-to-justice design, Responsible-AI PDF).

### 1.1 Trust calibration — the goal, and why the ledger is the instrument

- Research: users **over-trust fluent AI** on hard tasks and **under-trust** it when it
  hedges badly; the product goal is *calibration*, not maximum trust (the playbook's own
  named UX metric, `playbook p.4`).
- Failure mode: percentage confidence invites over-reliance (uncalibrated self-report)
  **and** false precision ("87%" reads as verified).
- LokAI move: **claim ledger** — `N of M sourced` — replaces scalar confidence with
  per-claim verifiable status + citation chips. Mode chip calibrates *what kind* of
  answer this is before you read it. Receipt lets you audit without demanding you audit
  every turn.
- Case-study stance: **argue the substitution, don't hide the conflict** (pdf-patterns
  §C1). The corpus expects visible %; LokAI ships the same calibration goal through an
  honest mechanism.

### 1.2 Stress state — cognitive tunneling, answer-first, one focal move

- Research: stressed first-timers **tunnel** — they read the first strong element and
  skip chrome; dense multi-card layouts get read as threat, not help.
- Repo law already encodes the fix: **L3 answer-first, L2 one focal move, L1 ground not
  boxes, L6/L8 stops are the most designed screens**.
- Turn craft operationalizes it per mode (`EMOTION_CRAFT` in `Turn.tsx:35`):
  - `protective_stop` → fastest reveal (160ms), dense, primary-first, oxblood status —
    act now, read less.
  - `relief_without_certainty` → slowest reveal (280ms), airy — absorb, don't rush.
  - `cared_friction` → primary-first so the missing-fact CTA is unavoidable.
  - `honest_gap` → amber (7.16:1 AA), never red — a gap is not an alarm.
- Design rule for the star interaction: **chrome scales with content** — clarify/confirm
  turns stay near-bare; only explain/stop/disclose carry ledger + receipt affordance at
  full weight. No always-on risk chip (alarm fatigue).

### 1.3 Denial & refusal styles — stops as factual denials with reasons

- Research: among refusal styles, users prefer **factual denials with reasons** over
  bare "I can't" or moralizing; recoverability in the same turn preserves trust.
- Repo move: the **8-way stop taxonomy** (Boundary & Fallback Map — use the industry
  term in the case study) already ships `reason` + `preservedSummary` + `stillAvailable`
  + optional `systemsNote`. Emotional intent is always `protective_stop`.
- The star interaction's job is *delivery*: stop cards get the full-bleed inversion
  (L5/L6/L8), the **safe action is primary** ("Find legal aid" filled; "continue"
  demoted/removed), and the receipt line makes the stop auditable — *"Gate G2 · rule
  SCOPE_CRIMINAL · because: input matched out-of-scope markers."*
- Escalate is never implicit: every terminal stop offers the human path (lawyer /
  legal-aid / 1915) as the standard action — pattern 20, Design Q3/Q5.

### 1.4 Explainable-AI critique — why receipts, not prose "thought process"

- Research: chain-of-thought-style explanations are often **unfaithful** to what the
  system actually did; users who read them still miscalibrate.
- LokAI move: the receipt is **gate + rule + because[] + humanLine** — a fixed,
  machine-checkable shape (`decision/types.ts DecisionReceipt`), bounded by policy
  version. It explains *the decision*, not invented reasoning. `humanLine` is "the one
  plain sentence a receipt may show the user. No numbers."
- The "How we checked" accordion already in `Turn.tsx` stays as the *verification*
  trace (what was read); the receipt is the *decision* trace (why this mode/stop).
  Both collapsed; neither is a button (one-primary-CTA law).

### 1.5 Access-to-justice design — plain language, consequential confirmations, handoff

- Research (ODR / legal-design canon): legalese loses first-timers; confirmations must
  **state the consequence**; every dead end must show the next door.
- Repo move: three-zone copy is already citizen-words ("What the rule means / How it
  applies here / What you can do next"); confirm copy adopts consequence form
  (*"If you file this reply, the fee is ₹X and the deadline is Y"* — pattern 12);
  the receipt trail doubles as the **lawyer-handoff packet** (pattern 35).

---

## 2. Responsible-AI material → mechanisms (the mapping you say in interviews)

### 2.1 The Designer's 5 Questions (Responsible AI PDF, p.3)

| # | Question | LokAI mechanism (already licensed by PRODUCT.md) |
|---|---|---|
| 1 | What is the AI allowed to do? | Scope gate **G2** + boundary stops; mode chips as *declared decision points* (pattern 19 verb on the chip); PRODUCT.md capability boundary stated in UI copy |
| 2 | What information did it use? | Citation chips (section-first) · claim ledger `N of M sourced` · receipt `because[]` chips linking facts/sources · evidence column |
| 3 | What should the human approve? | **Verification gate** (user confirms facts — facts are theirs) · G8 `draftComputed` never asserted · Hold-to-Confirm with consequence copy · ReviewGate "nothing leaves unread" |
| 4 | What happens when it is wrong? | `disclose` names the gap · `conflict` stop hands the choice back · `recover` guarantees nothing lost · 8-way taxonomy covers failure **and** recovery states on the Spine |
| 5 | How can the user correct / stop / undo? | Confirm → correctFact · chips re-steer without restart · stop `stillAvailable` · recover retry · composer free-form never traps (pattern 42) |

Human Control Spectrum (`suggests → reviews → executes → undo/escalate`): LokAI parks
deliberately at **suggests + reviews** — drafts are review-gated artifacts, never
executed actions. Stronger authorization gates for irreversible acts = Hold-to-Confirm
(P4), not a generic OK dialog.

### 2.2 Six pillars → where each lives in the star interaction

| Pillar | Evidence in the interaction |
|---|---|
| Fair & inclusive | 4-script system EN/HI/MR/TA with script-aware leading; status labels from `statusVocabulary.ts` (one state, one name); no hand-written legal status strings |
| Safe & reliable | Deterministic gate cascade first-fail-wins; 8 scripted guardrail scenes; staged progress that never fakes streaming; stop outranks preference (packet guard) |
| Private & secure | No network / upload / mic permission by enforced gate (`verify-demo.mjs` bans); honest microcopy on voice & attachments |
| Transparent | Mode chip · three-zone explain · ledger · receipt (gate+rule+because) · "How we checked" — explanations of *decisions*, not vibes |
| Accountable | `humanLine` ownership sentence · policy version on every receipt · `Illustrative · expert review pending` labels · escalate verb on stops |
| Controllable | Verification gate (user owns facts) · ask-first echo before classification commits · recover · one primary CTA so the safe path is never ambiguous |

### 2.3 Safe Action Path (p.4) → the turn pipeline

```
USER GOAL      typed/chip/voice input (chips pass untouched — free-form preserved)
RETRIEVE       DemoContext DecisionState: facts, sources, policyTier, turnIndex
REASON         G1→G9 first-fail-wins → DecisionOutcome + DecisionReceipt
PREVIEW        typed response card (mode · zones · ledger) — nothing "sent" yet
APPROVE        verification gate / Hold-to-Confirm / draft review gate
ACTION         prepared draft ready for the user — LokAI never executes externally
FALLBACK       correct (correctFact) · undo (recover) · escalate (stop taxonomy)
```

The star interaction is this path **made visible four times per conversation** — every
turn runs it; the receipt is the stamp at PREVIEW; the stop is the path exiting at
FALLBACK.

---

## 3. Interaction spec (the artifact to build / photograph)

### 3.1 Turn anatomy — mobile 390px

```
┌─────────────────────────────────────────────┐
│ [Explanation]  Clear next step · sources    │   zone-0 · Badge + craft statusLine
│                still illustrative    4 of 5 │   ledger Amount right, only if claims > 0
│                sourced                      │
├─────────────────────────────────────────────┤
│ What the rule means                         │   zone-1 · EDITORIAL serif 22px (Latin)
│ (Fraunces / script sans 500 for Indic)      │   the law speaks — no caps eyebrow (L4)
│                                             │
│ How it applies here                         │   zone-2 · SANS 14 · inkSoft
│ What you can do next → Prepare demand notice│   zone-3 · ordered steps + one navy CTA
│                                             │
│ [S.2(10)] [S.35]                            │   citation chips · tap = source sheet
│ ✓ How we checked ▾                          │   verification accordion · text style
│ Why this response?                          │   receipt tap · quiet text, NOT a button
└─────────────────────────────────────────────┘
        ▼ tap "Why this response?"
┌─────────────────────────────────────────────┐
│ Decision receipt                     (Sheet)│   existing Sheet · drag handle
│ ─────────────────────────────────────────── │   never covers composer (clearance law)
│ Because                                      │
│  · fact:purchase_date confirmed              │   because-chips → tap jumps to fact
│  · source:cpa-2-10 supports                  │   because-chips → tap opens source
│ Gate G7_CONTENT · rule CONTENT_MATCH         │   mono/meta register, not body prose
│ "Matched your refund question to the         │   humanLine · the one sentence
│  prepared consumer explanation."             │
│ Policy dl-1.0.0                              │   policyVersion · accountability stamp
│ ─────────────────────────────────────────── │
│ Decision log · 6 receipts ▸                  │   collapsed Spine entry (badge count)
└─────────────────────────────────────────────┘
```

Density rules (challenger fixes, adopted):
- **Ledger footer** only when `groundedClaims > 0` — clarify/confirm/progress never
  grow dead chrome.
- **Risk chip** only when `policyTier ≠ self_service`.
- **Receipt affordance** is text, never a filled control — one-primary-CTA law holds.
- Compact density for clarify/confirm/progress; full density for explain/disclose/stop.
- Stop turns: the card *is* the inversion (premium-white ground or full-bleed dark per
  L6/L8) — most designed screen, safe action primary.

### 3.2 Ask-first composer — mobile

```
┌─────────────────────────────────────────────┐
│ Understood as: consumer refund ✓             │   echo strip · 1 line · typeStyle small
│ · 2 facts confirmed · 1 missing              │   ambiguity-gated: invisible when clear
├─────────────────────────────────────────────┤
│ ( ◯ attach )  Ask about this prepared…  (▲) │   16px text · 44px targets · press 0.97
└─────────────────────────────────────────────┘
```

- Clear intent → echo only (cost ≈ free).
- Ambiguous (L1 unmatched) → strip morphs inline into confirm state with **one primary
  "Confirm send"** — no modal (D8).
- Chips/voice/attachments bypass the strip entirely (familiarity law).
- Ships inside P4 with the composer debt fix — never new interaction on 12px text.

### 3.3 Decision Spine — one component, two docks

| | 1440px desktop | 390px mobile |
|---|---|---|
| Dock | Collapsible right panel inside DesktopShell (existing context rail widens to receipt role) | Bottom Sheet via existing `Sheet` (drag handle, clearance above composer) |
| Default | Collapsed; **auto-opens on explain/stop only** (desktop-only auto-open) | Collapsed; badge-counted (`Decision log · 6`); manual open |
| Content | Rows = DecisionReceipt[] from DemoContext (single source of truth — never mirrored state): mode glyph · humanLine · gate·rule · because count | Same rows, sheet layout; tap row → scroll-to-turn |
| History motion | blur-in 160ms, 40ms stagger (BoardUI agent-log pattern) | identical |
| Live recompute | Edit a fact in evidence column → engine re-runs → row retitles, tier badge swaps, because-chips regroup — **in place, no modal** | Same beat from fact sheet |
| Empty state | "This step makes no factual claims — nothing to verify." (determinism, designed) | same |

Failure and Recovery are **visible Spine states**, never skipped (pattern 33).

### 3.4 The 15-second embed (portfolio loop)

1. Fact row shows `purchase date — missing` (amber exception tint, no border).
2. User taps → confirms 6 June 2026 → haptic settle → confirm card.
3. Spine row flips: `G6_FACTS · FACT_DATE_MISSING` → `G7_CONTENT · CONTENT_MATCH`;
   because-chip for the missing fact disappears; tier badge `review → self-service`.
4. Next explain card's ledger recomputes `2 of 3 → 4 of 5 sourced`.

Same story the case study tells in 90 seconds (four beats: scope-stop receipt →
fact confirm recompute → why-this-response open → Hold-to-Confirm draft) — the embed
is beat 2 isolated.

---

## 4. Interview narrative (the words)

**30 seconds (skim):**
"LokAI is a deterministic legal-guide prototype. Every reply is a *typed decision* —
explain, clarify, stop — with a claim ledger instead of a fake confidence percentage,
and a receipt showing which gate decided and why. Flip one fact and every downstream
decision recomputes on screen."

**90 seconds (demo script, unchanged beats):**
① out-of-scope input → scope gate fires → stop card + receipt (the drift-bug origin);
② confirm the missing fact → watch the gate clear and the tier change (live recompute);
③ open "Why this response?" → gate · rule · because lines;
④ draft submit → Hold-to-Confirm with consequence copy → review-gated packet.
Four beats, four receipts, one thesis: *trust as an engineering discipline.*

**Deep dive (when asked "why not just ChatGPT?"):**
"Chat optimizes for fluency; this optimizes for **trust calibration** — the research
metric for neither over- nor under-trust. Fluency without provenance is how people get
hurt in high-stakes domains; hallucinated-citation sanctions are the profession's own
evidence. My receipts are computed by a gate cascade, not authored prose — which also
answers the explainability critique that LLM 'thought processes' are often unfaithful.
And the Responsible-AI framing is literal: five designer questions, each with a
mechanism — scope gate, citation chips, verification gate, stop taxonomy, recover."

**When pressed on % confidence (the honest conflict):**
"The pattern corpus says show confidence; I replace it deliberately. Self-reported
percentages are uncalibrated and invite exactly the over-reliance the same corpus warns
about. `4 of 5 sourced` is checkable; `80%` is theater. I argue this in the case study
rather than omit it."

**Honest limits (say first if asked):**
Prototype, no live AI (PRODUCT.md), receipts currently rendered from prepared turns and
become fully computed at REDESIGN-PLAN P2; PDF pattern corpus is one author's playbooks
— corroborating, not peer-reviewed.

---

## 5. What is explicitly NOT the star (kill list, carried forward)

| Rejected | Survives as |
|---|---|
| Trust-Transit metaphor in UI | Case-study language + at most one hero illustration |
| Matter-Trail as primary nav | Stage breadcrumb inside progress cards only |
| Per-card receipt **buttons** | Quiet footer text-tap |
| Always-on risk chip | Chip only when tier ≠ self_service |
| Branching / regenerate UI | "Replay the reasoning" (determinism conflict) |
| Plain chat / plain text bubbles | The *contrast frame* in the write-up (what ChatGPT does) |
| Percentage confidence anywhere | Claim ledger + argued substitution paragraph |
| Unconditional ask-first confirm | Ambiguity-gated echo (D8) |
| New backend work | Out of scope — interaction renders `DecisionReceipt` only |

---

## 6. Build-order crosswalk (no new phases)

| Star beat | Phase | Primary files |
|---|---|---|
| Craft debt under the composer (16px, 44px, press) | P4 (absorbed) | `Turn.tsx` Composer |
| Computed receipts (gate/rule/because from engine) | **P2 — prerequisite** | `src/app/decision/`, `responseTurns.ts` |
| Typed card chrome (zone-0, gated ledger, receipt tap) | P3 | `Turn.tsx` |
| Ask-first echo + Hold-to-Confirm | P4 | `Turn.tsx` Composer |
| Receipt surface + Spine + live recompute | P5 | new panel component + `Sheet` + DesktopShell |
| Stop inversion / white purpose surfaces | P6 | role tokens |
| Gate proof: every turn carries resolving receipt | P2→P8 | `verify-demo.mjs` |

**Dependency law (unchanged):** receipts before cards (P2 → P3). Authored receipts are
trust theater — the one failure this product cannot survive.

---

## 7. File map (where each piece of this doc lives in code)

| Concept | File |
|---|---|
| Mode chips + densities + craft pacing | `src/app/components/ai/Turn.tsx` (`MODE_META`, `EMOTION_CRAFT`, `Turn`) |
| Seven modes, emotional intents, ledger fields | `src/app/data/responseTurns.ts` |
| Stop taxonomy payloads (reason/preserved/stillAvailable) | same, `StopPayload` turns |
| Receipt shape (gate·rule·because·humanLine·policy) | `decision-layer-research/implementation/decision/types.ts` |
| Matter store / fact confirm | `src/app/context/DemoContext.tsx` |
| Composition laws L1–L8 (answer-first, stop inversion) | `docs/MOBILE_AI_SYSTEM.md` |
| Phase order & gates | `docs/REDESIGN-PLAN-2026-09.md` |
| Product boundary (no live AI, labels) | `PRODUCT.md` |
| Prior concept validation + 44-pattern corpus | `design-reports/interaction-concepts/{synthesis,concept-review,pdf-patterns}.md` |
| Responsible-AI extraction (5 questions, 6 pillars, Safe Action Path) | `extracted_content.md` §7 |

---

## 8. Verdict

The star interaction is **settled**: the four-beat receipt turn (understood → typed →
receipt → recompute) with the stop as its extreme case. It is the unique intersection
of (a) behavioral research — calibration, tunneling, faithful explanation, denial
styles; (b) the Responsible-AI playbook — every pillar and all five designer questions
have a mechanism already licensed by PRODUCT.md; (c) repo law — tokens, one CTA,
ledger-not-percent, deterministic gates; and (d) the REDESIGN-PLAN phases already
sequenced. Nothing here invents scope; it names the thing those phases compose into
and gives the interview the language to defend it.
