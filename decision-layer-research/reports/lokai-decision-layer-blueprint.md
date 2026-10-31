# The LokAI Decision Layer — System Blueprint & Case-Study Playbook

**Document type:** publish-ready design specification for the LokAI prototype (Lokaifm-main) and its portfolio case study
**Date:** 2026-09-21 · **Version:** v1.0 · **Repo state:** all file references verified against the 2026-09-21 repository audit

## What this document is

LokAI is a deterministic, zero-network prototype of an Indian legal-triage assistant — a portfolio case study about how an AI product earns trust in a market that can least afford a mistake. This blueprint completes the prototype's core move, from *scripted* trust to *executable* trust, in three layers: the decision engine that computes every response from matter state (Chapter Z), the layered guardrail stack that bounds what the product may say, draft, or file (Chapter X), and the case-study playbook that turns that system into a story a recruiter or senior engineer can verify in under a minute (Chapter Y).

## How to read it

| Part | Chapter | Audience | What it gives you |
|---|---|---|---|
| I | **Chapter Z — The Decision Engine** | the builder | core types, gate cascade G1–G9, wiring into the existing repo, build-gate extensions, five implementation phases, the model seam |
| II | **Chapter X — The Guardrail Stack** | the builder + reviewer | layers L1–L9 (1:1 with the gates), the refusal ladder, scenario traceability matrix, seven design invariants |
| III | **Chapter Y — The Case-Study Playbook** | the storyteller | story spine, one-trust-claim-per-section map, four sub-30-second embed demos, interview talking points, answers to the six hard questions, naming |

## Design commitments (read before anything else)

1. **The decision layer is LokAI's own product thinking.** This document deliberately names no external frameworks, vendors, or research artifacts. The system stands entirely on its own vocabulary: *decision receipts*, *the refusal ladder*, *why LokAI stopped*, *the escalation ladder*.
2. **Everything specified is implementable inside the prototype's enforced boundaries** — no network, no live model, no fabricated confidence — and every existing repo gate (determinism, contrast, no-fetch, status vocabulary) stays green.
3. **Nothing here overclaims.** The prototype generates no prose and says so once, plainly, in its boundaries panel. The contract specified here is exactly what would let a live model enter later — without changing a single user-facing promise.

---

---

# Chapter Z — The LokAI Decision Engine: system blueprint (orchestrator-drafted, repo-grounded)

Publish-ready. Lokai-native naming only. All file references verified in the 2026-09-21 repo audit.

## Z.1 From scripted decisions to computed decisions

Today, every LokAI "decision" is an authoring artifact: the mode, the stop reason, the risk tier, and the claim counts are literals inside hand-written turn objects (`src/app/data/responseTurns.ts`), and the only thing that chooses between them is a substring match (`text.toLowerCase().includes(turn.trigger.toLowerCase())`, ~L567). The trust *vocabulary* is finished; the trust *engine* is missing. The blueprint's single move: **lift every decision out of the content layer into a pure, deterministic policy engine that computes a typed decision from matter state — and turn the scripted turns into renders of those decisions.**

Three properties define the engine:

1. **Total** — every possible input state maps to exactly one decision. There is no "no match" path; the fallback is an explicit decision (a stop with a reason), never silence and never improv.
2. **Pure** — same DecisionState in, same DecisionOutcome out, always. No clock, no randomness, no network, no hidden context. This is what makes the decision layer *auditable*: a decision can be replayed months later against the same state and must reproduce byte-identically.
3. **Separable** — the engine decides; the UI renders; the policy documents. The same engine that runs the prototype today accepts a real classifier tomorrow through one interface, without the contract, the gates, or the screens changing.

## Z.2 Core types (added to `src/app/decision/types.ts`)

```ts
// ---------- State: everything the engine may see. Nothing else exists. ----------
export interface DecisionState {
  matter: {
    matterId: string;                      // e.g. 'consumer'
    stage: WorkflowStage;                  // intake…audit (from caseWorkflow.ts)
    facts: FactSnapshot[];                 // { id, label, value, status: 'confirmed' | 'needs_review', hint? }
    jurisdiction: { clarity: JurisdictionClarity; conflicts: string[] };
    evidence: { items: EvidenceItem[] };   // what the user has actually provided
  };
  sources: SourceLedger;                   // per-source: coverage 'direct'|'related'|'missing'|'conflicting', lastReviewed
  userTurn: {
    inputKind: 'chip' | 'typed' | 'voice';
    intent: IntentClass;                   // see Z.3 gate G1 — classified, not free text
    inScope: boolean;                      // scope classifier output (deterministic keyword+pattern set in v1)
    language: DemoLanguage;
  };
  draft: { status: DraftStatus; groundedClaims: number; totalClaims: number };
  policyVersion: string;                   // semantic version of the policy that will judge this state
}

// ---------- Outcome: typed, rationale-carrying, loggable. ----------
export type DecisionOutcome =
  | { kind: 'proceed'; mode: ResponseMode; risk: RiskLevel;
      rationale: Rationale; conditions: ProceedCondition[] }   // e.g. draftAllowed only if claims fully grounded
  | { kind: 'stop';    reason: FailureKind; risk: RiskLevel;
      rationale: Rationale; preserve: PreservedProgress }
  | { kind: 'escalate'; to: 'human_review'; reason: FailureKind;
      rationale: Rationale; preserve: PreservedProgress };

export interface Rationale {
  gate: GateId;                // which gate decided (G1..G9 below)
  rule: string;                // the exact rule id, e.g. 'FACT-01'
  because: string[];           // machine-checkable reasons: fact ids, source ids, coverage values
  humanLine: string;           // the one honest sentence the UI may show ("The rent law for your city isn't in LokAI's reviewed sources yet.")
}

export interface DecisionReceipt {
  id: string;                  // deterministic id: hash(state + policyVersion + turnIndex)
  at: string;                  // logical turn index (NOT wall clock — determinism)
  stateHash: string;           // hash of the exact DecisionState judged
  policyVersion: string;
  outcome: DecisionOutcome;
}
```

The receipt is the audit trail's atom. `AuditEvent[]` (already in `caseWorkflow.ts`) stops being a prop and becomes the rendered projection of receipts.

## Z.3 The gate cascade (ordered, first-fail-wins)

The engine evaluates gates in a fixed precedence order. Safety outranks scope; scope outranks jurisdiction; jurisdiction outranks sources; sources outrank facts; presentation outranks nothing. First gate that fails ends evaluation — which is what makes the outcome *explainable* (exactly one gate owns every decision) and *testable* (each gate is a pure function with its own truth table).

| # | Gate | Reads | Deterministic rule (v1) | Fail routes to |
|---|---|---|---|---|
| G1 | Input intent classification | `userTurn` | classify into IntentClass via fixed pattern set (chips map 1:1; typed text matched against declared intents; unmatched → `intent_unclassified`) | proceed with `clarify` (ask one question) — never guess |
| G2 | Scope boundary | `userTurn.inScope` | if input class outside matter scope → stop(`out_of_scope`) | stop(`out_of_scope`) with preserved summary |
| G3 | High-risk detector | matter + intent | request matches high-risk classes (criminal exposure, urgency+irreversibility, minor/medical, immigration) → escalate(`high_risk`) | escalate — dark stop screen, `draftAllowed:false` |
| G4 | Jurisdiction & conflict | `jurisdiction` | `clarity === 'unknown'` → clarify; `conflicts.length > 0` → stop(`conflicting_jurisdiction`) | clarify or stop |
| G5 | Source coverage | `sources` | required source for the next claim has `coverage: 'missing'` → stop(`source_gap`); `'conflicting'` → stop with disclose of the conflict | stop / disclose |
| G6 | Fact completeness | `facts` | any RequiredFact `status: 'needs_review'` → stop(`missing_facts`) with exactly the one question that unblocks (the "one question that changes the answer") | stop + clarify payload |
| G7 | Risk tier | outcome-so-far | all green so far → tier by content class: informational → `self_service`; drafting → `review_recommended`; filing/submission → `human_required` | risk attached to proceed |
| G8 | Draft authorship | `draft` | draft allowed only if `groundedClaims === totalClaims` AND every cited source `coverage: 'direct'` AND status is `user_reviewed` before `ready_to_use` | draft blocked (`locked` step with reason) |
| G9 | Output verification | rendered payload | recompute claim ledger against sources; if computed counts ≠ payload counts → block render (engine bug, fail loudly in dev, `recover` in demo) | recover / dev assertion |

G9 is the self-check that makes the ledger honest: **the UI may only display claim counts that the engine recomputed from state**, never counts authored in content. That single rule upgrades `TrustSignals` from static literals (audit gap G3) to computed truth.

**Escalation ladder (user-facing grammar):** clarify → disclose (answer what's answerable, name the gap) → stop (with preserved progress + what still works) → human review (the system's honest ceiling). Every rung is a *typed decision with a receipt*, so the case study can show "the refusal ladder" as a designed system, not a failure mode.

## Z.4 Wiring into the existing repo (nothing sacred, nothing discarded)

| Existing | Becomes |
|---|---|
| `data/responseTurns.ts` (mode+payload objects, trigger matching) | **render library**: turns keyed by `(scenario, mode)` and selected by the engine's outcome; trigger matching deleted — intent classification (G1) replaces it |
| `data/caseWorkflow.ts` types (RiskLevel, FailureKind, TrustSignals, AuditEvent) | **engine vocabulary** (imported, not duplicated); TrustSignals become computed (Z.3 G9) |
| `context/DemoContext.tsx` (facts, confirmFact/correctFact, runPreparedInput) | **DecisionState source**: fact confirmations flow straight into G6 |
| `services/api.ts` (compatibility adapter) | calls `decide(state)` then renders; the 280ms stage stays (honesty of the "working" beat is a UX decision, not a fake model call) |
| `demo/responseEngine.ts` (progress stages, skip/replay) | unchanged — it already behaves correctly for reduced-motion and skip |
| `scripts/verify-demo.mjs` gates | extended with engine invariants (Z.7) |
| `pages/` + `components/ai/Turn.tsx` | add the **decision receipt surface** (Z.6); no visual redesign required |

The 8 demo scenarios are preserved as **policy test fixtures**, not UI scripts: each scenario is a DecisionState fixture with an expected outcome (see the traceability matrix in the guardrails chapter).

## Z.5 Why this shape (the engineering argument, pre-answering the skeptic)

- **"Isn't this a flowchart?"** A flowchart hardcodes paths; this is a *policy over state* with typed outcomes, precedence, receipts, and recomputed trust signals. The difference is testability: each gate has a truth table, the whole engine has a scenario→outcome conformance suite in the build gate, and every runtime decision ships with the rule and reasons that produced it. Flowcharts can't fail loudly; engines can.
- **"Where's the AI?"** The prototype's claim is decision *governance* — the part of an AI product that makes it trustworthy enough to ship in legal. The engine is the exact seam where a model plugs in later (Z.9): the contract (types), the gates (policy), the receipts (audit), and the screens (receipt surface) are model-agnostic. Designing the seam *before* the model is the senior move, not the consolation prize.
- **"Would it survive novel inputs?"** Better than the current substring router by construction: unmatched intent routes to clarify (G1), out-of-scope routes to stop (G2) — the two P0 drift bugs become unreachable states. Novel inputs get the two honest responses: one question, or a documented refusal.

## Z.6 Prototype surface changes (small, high-leverage)

1. **Decision receipt drawer** (desktop right panel / mobile sheet): gate id, rule id, the `because[]` reasons as chips linking to facts/sources, policy version. One embed-able artifact for the case study.
2. **"Why LokAI stopped" upgrade**: stop screens get a "See the decision" affordance opening the receipt — turning refusals from dead ends into the product's most inspectable moments.
3. **Policy inspector** (`/dev` route): live view of the gate cascade evaluating the current state — the "show your work" screen for reviewers of the case study. Deterministic, zero-network, pure theater-free.

## Z.7 Build-gate extension (`verify-demo.mjs`)

- **Conformance suite:** for each of the 8 scenarios (now state fixtures), assert the engine's outcome equals the documented expected outcome (kind, mode/reason, gate). This replaces "scripted invariants must exist" with "scripted invariants must be *computed and match*".
- **Determinism check:** run `decide()` 50× per fixture; assert identical receipts (id, stateHash, outcome).
- **Totality check:** property test — for N mutated states (dropped facts, flipped coverages, injected out-of-scope intents), engine always returns a well-formed outcome; the `out_of_scope` and `missing_facts` stops must be reachable, and *no path* may produce a proceed with ungrounded claims.
- **Lint extension:** the no-confidence-string rule now also scans `src/app/decision/` (engine may compute thresholds internally; no numeric confidence may cross into payload/UI types — enforced structurally: UI-facing types don't carry the field).
- Existing gates untouched: no fetch, no mic, contrast, ratchet, status vocabulary.

## Z.8 Implementation plan (each phase ships with gates green)

| Phase | Scope | Files | Gate effect |
|---|---|---|---|
| 1 | Types + engine skeleton + G1/G2 (kills drift P0 structurally) | `src/app/decision/{types.ts,engine.ts,gates/scope.ts}` | conformance suite v1 added |
| 2 | G3–G6 (risk, jurisdiction, sources, facts) — scenarios become state fixtures | `gates/*.ts`, `data/demoScenarios.ts` (fixtures), `DemoContext` wiring | conformance suite v2; determinism check |
| 3 | G7–G9 + computed TrustSignals + receipts + audit projection | `gates/*.ts`, `caseWorkflow.ts` (computed signals), `AuditEvent` from receipts | totality check; lint extension |
| 4 | UI: receipt drawer, why-stopped upgrade, policy inspector | `components/`, `pages/`, `/dev` | contrast + ratchet as usual |
| 5 | Case-study embeds: 30-second demos (receipt, refusal ladder, policy inspector) | embed map in copy doc updated same session (portfolio rule) | verify:demo + typecheck + build |

## Z.9 The model seam (one paragraph, by design)

The engine interface is the whole story: `decide(state, backend)` where v1's backend is the scripted gate cascade. When — and only when — a live model is ever introduced, it implements the same `DecisionBackend` (classify intent, score fact completeness, flag conflicts) and its outputs flow through the *same* gates, the *same* precedence, the *same* receipts. The gates become model-checkers instead of decision-makers where appropriate (e.g., a classifier proposes; gate G2+G3 still dispose). Nothing in the UI, the types, the tests, or the audit trail changes. That is the case study's quiet thesis: **the trustworthy part of an AI product is the part that doesn't have to regenerate when the model changes.**

---

# Chapter X — The Guardrail Stack: how LokAI earns the right to answer

*Scope: the layered guardrail system above the decision engine — each layer's job, its deterministic rule, where failures route, and what the user sees. Pairs with Chapter Z (engine internals: gates G1–G9 map 1:1 to layers L1–L9) and Chapter Y (how this reads in the case study).*

## X.1 Why guardrails are the product

Legal AI has a trust asymmetry no other consumer domain has: a wrong answer isn't a bad experience, it's a missed filing deadline, a forfeited claim, or a liability exposure. The documented failure record — lawyers sanctioned for filing AI-fabricated citations, regulators acting against consumer "AI lawyer" products for deceptive claims, professional bodies issuing competence-and-supervision guidance for generative AI — converges on one design conclusion: **the answers are not the product; the reasons are.** A legal product earns adoption exactly to the degree that every response is bounded, sourced, reviewable, and refusal-capable.

Consumer chatbots are built to maximize answer coverage: any input should produce some output. For the first ten minutes of a legal problem, that objective is precisely wrong. The valuable system is the one that **bounds its own authority** — that knows when it may explain, when it must ask, when it may draft, and when the only honest output is a stop with a reason and a human path. That is what the guardrail stack implements: not a safety afterthought wrapped around a generator, but the decision system itself, expressed as layered, independently testable gates.

The stack has a second, quieter job: **making the boundaries legible.** Every refusal names its failure kind in plain language, preserves the user's progress, and shows the exit path. Every answer carries a receipt of what was read and what grounded it. A user who can see why the system said no will believe it when it says yes.

## X.2 The stack, layer by layer

Foundation — **L0: Policy & receipts.** Every layer evaluates against a versioned policy (`policyVersion`), and every outcome — proceed, stop, or escalate — emits a `DecisionReceipt`: which gate decided, which rule fired, which facts and sources were read (state hash), and the one human-readable "because" line. The receipt is the audit atom; layers L1–L9 are where decisions get made, L0 is where they become accountable.

| Layer | Purpose | Reads (from DecisionState) | Deterministic rule (v1) | On failure routes to | User sees |
|---|---|---|---|---|---|
| **L1 Intent classification** | Understand *what kind of thing* the user said — never free-text improv | `userTurn` (chip / typed / voice, language) | Classify into a fixed intent set (chip selections map 1:1; typed text matched against declared intent patterns). Unmatched → `intent_unclassified` | proceed with `clarify` (one question) | "Before I answer — is this about [X]?" (the clarify card) |
| **L2 Scope boundary** | Keep the product inside its claimed competence | `userTurn.inScope`, matter type | Input classified outside the matter scope → no answer path exists | stop(`out_of_scope`) | Out-of-scope stop: what LokAI handles, why this isn't it, progress preserved |
| **L3 High-risk detector** | Refuse irreversible/high-stakes territory before any other logic | matter class + intent classes | Matches a declared high-risk class set (criminal exposure, urgency + irreversibility, protected categories) → escalate | escalate(`high_risk`), `draftAllowed:false` | Dark stop screen: why this is beyond the guide, human paths (lawyer, helpline) |
| **L4 Jurisdiction & conflict** | No answer that depends on law LokAI can't pin down | `jurisdiction.clarity`, `conflicts` | `clarity = unknown` → clarify; conflicts present → no single-rule answer permitted | clarify, or stop(`conflicting_jurisdiction`) | "The rules differ by [city/state] — I need one detail" / conflict disclosure |
| **L5 Source coverage (grounding)** | Only speak on reviewed sources | `sources[].coverage` | Required source `coverage: missing` → stop; `conflicting` → partial answer with disclosure only | stop(`source_gap`) or `disclose` | Source-gap stop naming the missing law; disclose shows what *is* covered |
| **L6 Fact completeness (verification gate)** | The user's facts drive the answer — so they must be confirmed | `facts[].status` | Any required fact `status: needs_review` → stop(`missing_facts`) with exactly the one question that unblocks | stop + clarify payload | Verification card: what's confirmed, what's missing, why it changes the answer |
| **L7 Risk tier** | Match autonomy to stakes: self-service → review → human | outcome of L1–L6 + content class | Informational → `self_service`; drafting → `review_recommended`; filing/submission → `human_required` | risk attaches to proceed / escalate | Tier label on the response; human path surfaced whenever tier ≠ self_service |
| **L8 Draft authorship gate** | Nothing is usable until a human has read it | `draft.status`, `groundedClaims`, `totalClaims`, source coverage | Draft usable only if `groundedClaims = totalClaims` AND every citation `coverage: direct` AND status = `user_reviewed` before `ready_to_use` | draft step `locked` with reason | Locked step with the reason; review-before-use flow (ai_draft → user_reviewed → ready_to_use) |
| **L9 Output verification (claim ledger)** | The rendered answer can only claim what state supports | rendered payload vs recomputed ledger | Recompute grounded/total claims from sources; mismatch → block render (fail loudly; `recover` in demo) | dev assertion / `recover` | Claim ledger on every explain turn: "6 of 7 claims grounded — 1 needs your confirmation" |

**Precedence:** L1 → L2 → L3 → L4 → L5 → L6 → L7 → L8 → L9, first-fail-wins. Safety outranks scope; scope outranks jurisdiction; grounding outranks completeness. Exactly one layer owns every outcome — that is what makes each answer explainable ("gate + rule + because") and each layer independently testable.

**The refusal ladder (user-facing grammar of the stack):** clarify → disclose → stop → human review. Four rungs, each a typed decision with a receipt. The stack's most important design property is that the ladder is *reachable from every layer*: any gate can route to it, so refusing is never a dead end — it is the product's most rehearsed behavior.

## X.3 Traceability matrix — demo scenarios × layers

The eight prepared scenarios in `data/demoScenarios.ts` (as named in the repo: core journey, missing facts, source gap, conflicting rules, high-risk stop, out-of-scope, recovery, notice interpretation) double as the policy test fixtures. Expected outcomes below are the conformance assertions added to `verify-demo.mjs` (Chapter Z.7). Exact scenario ids: map at implementation time from `demoScenarios.ts`.

| Scenario (repo) | Layers exercised | Expected decision outcome |
|---|---|---|
| **Core consumer journey** (Priya, damaged mixer grinder) | L1, L6 → confirmations, L5, L7 (`self_service`→`review_recommended` at draft), L8, L9 | proceed: clarify → explain (ledger 6/7) → confirm → packet flow; draft locked until `user_reviewed` |
| **Missing facts** | L6 | stop(`missing_facts`) + clarify: the one question that changes the answer; progress preserved |
| **Source gap** (deposit matter, unreviewed local rule) | L5 | stop(`source_gap`): names the unreviewed law; related source disclosed as escalation context |
| **Conflicting rules** | L4 (+L5) | stop(`conflicting_jurisdiction`) or disclose-only with the conflict named |
| **High-risk stop** | L3 (first) | escalate(`high_risk`): dark stop, no draft path, human paths shown |
| **Out-of-scope request** (rent question in consumer matter) | L1→L2 | stop(`out_of_scope`): what LokAI handles vs what it doesn't; earlier build's wrong answer becomes unreachable |
| **Recovery** (service failure) | L0 receipt trail (+`recover` mode) | recover: retry affordance, preserved state, receipt shows the failure was handled, not hidden |
| **Notice interpretation** (property-tax notice) | L5 (clause-level sources), L9, L7 (`self_service` reading, no advice) | proceed: explain-mode clause correspondence, ledger recomputed, explicit "information not advice" |

Read as a test suite: each row is an invariant the build gate asserts on every commit — the guardrails cannot silently regress, because the scenarios that exercise them are fixtures, not screenshots.

## X.4 Design invariants

1. **Determinism.** Same state + same policy version → byte-identical receipt, always. No clock, no randomness, no network. Verified by the 50× replay check in the build gate.
2. **Refusal is first-class.** Every layer can route to the refusal ladder; the "none of the above" branch is a designed outcome with a receipt — never silence, never the nearest-looking answer.
3. **Provenance, never confidence.** The engine may use internal thresholds; no numeric confidence crosses into any user-facing type or string (enforced structurally and by lint). Users read receipts and claim ledgers, not decimals — numbers ask for belief; receipts ask for reading.
4. **Evidence, not vibes.** Decisions read only DecisionState. Whatever isn't in state (an unconfirmed fact, an unreviewed source) functions, from the engine's perspective, as if it didn't exist — which is exactly why missing things produce named stops instead of plausible guesses.
5. **Preserved progress.** Every stop carries what the user already achieved (confirmed facts, prepared draft state, next unblock). Refusal costs the user nothing they already did.
6. **Fail loudly.** If the engine and the render disagree (L9), or a state falls through all layers (impossible by totality, asserted anyway), the system stops visibly in demo and asserts in dev. Silent drift is the one unacceptable failure mode.
7. **Policy as documentation.** The policy version in every receipt means the case study, the code, and the audit trail quote the same rule numbers. When the policy changes, receipts say which version decided — history stays explainable.

---

# Chapter Y — Case Study Narrative: LokAI, the Trust Study

*Chapter purpose: the narrative spine for LokAI's flagship portfolio case study. Everything below stays inside the prototype's verified boundaries — no live AI, no network, prepared content, honest labels ("Illustrative · expert review pending", "Legal information, not legal advice"). One trust claim per case-study section; no capability the prototype cannot demonstrate. The system design must read as LokAI's own product thinking.*

---

## Y.1 The story spine

**The arc in one sentence:** a first-time user with a small legal emergency meets a chatbot whose most impressive behavior is refusing to improvise — and the case study is about why that refusal is the product.

**Act 1 — Ten minutes and no lawyer.** Priya's mixer grinder arrived damaged. It cost ₹8,999. The seller refused a replacement. She has no lawyer, no legal vocabulary, and roughly ten minutes of attention before she gives up or gets talked into something. This is the moment LokAI is built for: the first ten minutes of a legal problem in India, on a phone, in the user's own language. Most legal tech designs for the lawyer's desk. LokAI designs for the person standing in front of a locked shop wondering if the law is even on her side.

**Act 2 — The assistant that won't guess.** Priya opens a chat. She types her problem. And the thing on the other end does something no consumer chatbot does: it stops and asks her to confirm the facts before it will say anything useful. When it finally explains her options under the Consumer Protection Act, 2019, every claim sits on a visible ledger — "6 of 7 claims grounded" — with source lines she can open and citations honestly labeled "Example — verify with a lawyer." When it reaches the edge of what it can safely say, it stops, names why it stopped, and tells her what would unblock it. Nothing drafts without her reading it. Nothing files without her owning it. The chatbot's defining behavior is not fluency. It is restraint.

**Act 3 — From scripted trust to executable trust.** Here is the honest engineering story, and the case study should tell it plainly. The first build *scripted* every trustworthy moment by hand: each reply was an authored object carrying its mode, its citations, its claim counts, its stop conditions. The trust vocabulary was right — verifiable facts, inspectable sources, named refusals, human-owned drafting. But the enforcement was screenwriting. The self-audit caught the proof: an out-of-scope question (a rent dispute) got answered as if it were the consumer-refund scenario, because nothing *computed* the decision — the script simply ran. So the design moved from scripted trust to executable trust: a **decision layer** that computes every response mode, every risk tier, and every stop decision from the matter's actual state, with a layered guardrail stack above it and a receipt under it. Same grammar, now enforced by construction. The drift bug isn't hidden in the case study; it is the origin story of the centerpiece.

**The thesis the chapter carries.** Determinism-by-design is the honesty feature, not a limitation. In a market that can least afford a mistake — first-time users, small amounts, no legal literacy, no second chance at a wrong filing — a legal product earns trust not by being impressive but by being *checkable*. Typed decisions bound what can go wrong: a choice over {clarify, explain, disclose, stop, confirm, progress, recover} cannot hallucinate a response mode. Refusing to decide is itself a decision the engine is allowed to make — and when nothing matches, escalation is the correct output, not an error. LokAI doesn't chat about your legal problem; it decides what may safely happen next, and shows its work. That is the sentence the whole case study exists to earn.

---

## Y.2 Section map

Rule enforced across the map: **one trust claim per section.** If a section needs two claims, it is two sections. Each claim is proven by an artifact that already exists in the prototype, and each section ends in a feeling — because trust is a felt judgment backed by evidence, not the reverse.

| # | Case-study section | The ONE trust claim it carries | Prototype artifact / embed that proves it | What the reviewer should feel |
|---|---|---|---|---|
| 1 | **The first ten minutes** (hero + Priya scenario) | It knows what it is — and says what it isn't. | Hero embed with the boundaries panel: "prototype · no live AI · no network", "Legal information, not legal advice" visible without scrolling. | Honesty *before* capability. This builder defines success as restraint. |
| 2 | **The verification gate** | It asks before it advises. | Chat embed: the engine catches a fact Priya hasn't confirmed (or corrects) and won't proceed to advice until she does. | It knows what it doesn't know — and that is the most trustworthy thing it says. |
| 3 | **Grounded answers (claim ledger + source lines)** | Every claim is countable — evidence, never a confidence score. | An explain turn showing "6 of 7 claims grounded", source lines that open, citations labeled "Example — verify with a lawyer". | I could check this myself. That's the point. |
| 4 | **The refusal taxonomy (light + dark stop screens)** | When it stops, it stops on purpose — and tells you why. | Guardrail gallery: stop screens naming the failure in plain words (missing facts, source gap, out of scope…) with an exit path on each. | Refusals got as much design care as answers. Nobody ships eight kinds of "no" by accident. |
| 5 | **The Decision Layer (centerpiece)** | Every response is a computed decision with a receipt — not a generated guess. | Decision-receipt embed: open any turn's "Why this response?"; a why-LokAI-stopped moment; the escalation ladder recomputing live. | This is engineering discipline I can trust, not chatbot magic. |
| 6 | **The review-gated filing packet** | Nothing files without a human reading it. | Packet flow with visible draft states: ai_draft → user_reviewed → ready_to_use; the filing path (e-Daakhil, 1915 helpline, registered post) stays inert until the user owns the draft. | The machine drafts; the human owns. The liability line is drawn in the product, not the footer. |
| 7 | **NoticeInterpret** | It reads official documents with you, clause by clause — never instead of you. | Property-tax notice demo: plain-language reading mapped clause-by-clause to the source text. | Comprehension without an authority grab. It translates; it doesn't advise. |
| 8 | **Voice, before commit** | You can speak to it — but nothing commits from your voice. | VoiceActive screen: transcript is editable and reviewable before it becomes input. | Accessibility without surrendering control. |
| 9 | **The audit line** | Every decision leaves an inspectable receipt. | The audit-line provenance strip on turns and actions: what was decided, from what state, with which sources. | This would survive scrutiny. Someone could audit this product. |
| 10 | **Four languages** | Trust speaks the user's language. | Live EN / HI / MR / TA switcher over the same embeds — the trust surfaces (ledger, stops, receipts) translate too. | Built for India, not ported to it. |

---

## Y.3 The decision layer as the centerpiece

This section must land one idea and refuse to wander: **every answer is a computed decision, not a generated guess.** Present it as trust formalization, not architecture flex — no state-machine diagrams, no plumbing vocabulary, no "here is my engine" bravado. Show receipts, not machinery. The reader should finish the section thinking *"of course a legal product works this way"* — which is the strongest reaction a design choice can get: inevitability.

**The loop, in product language.** The decision layer reads the matter's state (confirmed facts, matter type, jurisdiction, risk signals), applies the guardrails, and outputs three typed things: a response mode (clarify, explain, disclose, stop, confirm, progress, recover), a risk tier (self-service → review recommended → human required), and — when it can't proceed safely — a named stop. Then the action runs, and the claim ledger is recomputed from state, not carried over as a literal. State → decision → action → verification. Every cycle. The case study should show this as four plain-English steps, one sentence each, with the embed demonstrating it rather than a diagram asserting it.

**Device 1 — Decision receipts.** Every turn can be opened: *Why this response?* The receipt shows the facts the decision read, the guardrail that matched, the mode selected, and what would have changed the outcome. Critically, the receipt carries **provenance, not confidence** — no numbers, no percentages, no "0.92 sure". A number asks the user to *believe* the system; a receipt asks them to *read* it. This is the anti-"trust me" device, and it doubles as the section's honesty anchor: the receipt is trivially honest because it is computed, not authored.

**Device 2 — Why-LokAI-stopped moments.** Most products treat failure as embarrassment and hide it. LokAI treats it as its most rehearsed behavior: eight named failure kinds, each with a light and dark stop screen, each screen saying what's missing and what would unblock it. The case study should present one stop in full — e.g. the source-gap stop ("this question touches a law this guide hasn't prepared; here is where a lawyer fits") — and let the gallery carry the rest. The line to write: *the system's first job is refusing to decide; the "none of the above" branch is a designed outcome, not a crash.*

**Device 3 — The escalation ladder.** Risk tiers are computed from state, never vibes: self-service, review recommended, human required. Show one recompute live — a fact flips the tier, the stop screen names the human path. The ladder's most important property for the narrative: it mirrors how real legal services triage, so the product's boundaries feel inherited from the profession, not invented by the software.

**The guardrail stack, one line per layer.** Scope gate (is this matter in range at all?) → verification gate (are the user's facts confirmed?) → grounding gate (is every claim backed by a prepared source?) → risk gate (does this cross the human-required line?). Four layers, each computable, each with its own stop kind and receipt. Present them as *the reasons LokAI can say no in eight different honest ways*.

**Four embed demos, each under 30 seconds:**

1. **"Open the receipt" (~20 s).** In the chat embed, tap *Why this response?* on any turn → the receipt card appears: mode decided, facts used, guardrail matched, what would change it. Caption: *"Every reply is a decision you can audit."*
2. **"Make it stop" (~25 s).** Tap the prepared out-of-scope prompt (a rent-deposit question) → no guardrail matches → a computed stop screen naming *out of scope*, with exits. Caption tells the truth: *"An earlier build answered this as the consumer case. The decision layer exists because of that audit finding."* The bug becomes the demo — this is the single most recruiter-memorable moment in the case study.
3. **"Flip the risk tier" (~30 s).** Toggle one fact to the high-risk option → the tier recomputes to *human required* → the stop screen shows the human path (lawyer, helpline). Caption: *"Risk is computed from your matter, not asserted by a script."*
4. **"Watch the ledger recompute" (~20 s).** Un-confirm the purchase-date fact → mode flips to *clarify* and the grounded-claims ratio drops live from 6/7 to 5/7. Caption: *"Trust signals are computed from state. Nothing on this screen is a hardcoded literal."*

**What this section must NOT do:** claim live intelligence, show numeric confidence, or drown the reader in internals. The prose generation side is honestly labeled — prepared content today, and the case study says so once, plainly, in the boundaries panel. The centerpiece claims governance of the decision, not generation. That restraint is what makes the section credible to senior engineers and legible to recruiters in under a minute.

---

## Y.4 Interview talking points

Seven points a fresher can defend from first principles, each with a quotable line.

1. **Why a deterministic prototype instead of a live LLM.** "You can't discover a trust contract while the generator improvises. I froze the decision contract first — what the product may say, refuse, and escalate — and kept generation out until the boundaries are proven. Zero-network is also a real design constraint for the first ten minutes of a legal problem: it must work on a weak phone with no data plan, and it must never fail in a way that costs the user their only claim." Defensibility: the no-network rules are enforced by build-time checks in the repo, not just stated.

2. **The contract accepts a real model later without changing the promise.** "The decision layer is a typed interface: state in, decision out. A rule evaluator fills it today; tomorrow a model with structured outputs can fill the same interface. The user-facing contract — modes, tiers, stops, receipts, claim ledgers — doesn't move. Prose would only ever appear inside explain/disclose payloads; stop and risk decisions stay machine-checkable." The senior-sounding summary: *the model becomes an implementation detail; the contract is the product.*

3. **What "confidence" means here, and why it is never a number.** "Confidence belongs to the engine; evidence belongs to the user. Internally, a decision layer can use thresholds — documented as policy choices, not math, because uncalibrated thresholds are opinions in costume. Externally, the user sees a claim ledger — '6 of 7 claims grounded, 1 needs your confirmation' — because numbers invite automation bias, and a countable, inspectable ratio beats a flattering decimal in a legal context." This answer doubles as product judgment, not just engineering taste.

4. **The drift bug as design evidence.** "My first build routed inputs by substring matching, and an out-of-scope question got answered as the consumer scenario. That audit finding is why the decision layer exists: the fix wasn't more copy, it was making 'no policy matches' a first-class, computed decision that escalates. I found it by auditing my own repo against my own claims." Recruiters read this as: self-critical, evidence-driven, ships the fix as the story.

5. **Refuse-to-guess mirrors real legal triage.** "Lawyers triage before they advise: handle, supervise, or refer. LokAI's three risk tiers encode the same ladder, and the escalation path is the product's most important feature — a legal tool that never hands off is a tool that never admits its limits." This frames the refusal taxonomy as inherited from the profession, which lands well with legal-tech interviewers.

6. **Economics of decisions.** "Computing a decision from state is milliseconds and works offline; calling a model to do it is slow, costs money per call, and can fail in ways a legal product can't absorb. The architecture spends model cost only where language genuinely matters — explanation and drafting — and never on the decision of what may safely happen next." Honest scope note to volunteer: the prototype has no live costs; this is the architectural claim, not a benchmark.

7. **What I'd build next — without overclaiming today.** "Three things: calibrated uncertainty behind the typed decision seam when a live model arrives; decision receipts exported as a user-owned audit trail; and policy tests as first-class artifacts — every stop kind gets a test that proves the engine refuses when it should." *(Interview ammunition — market context, not design lineage: courts have sanctioned lawyers for filing AI-fabricated citations — Mata v. Avianca, S.D.N.Y. 2023 — and US regulators issued a 2025 order against a consumer "AI-lawyer" app for deceptive claims. Cite these as the climate the design anticipates, never as inspiration.)*

---

## Y.5 Anticipated hard questions

Objections recruiters and senior engineers actually raise, with answers that stay inside the prototype's boundaries.

**"Isn't this just a flowchart?"**
A flowchart encodes drawn paths; this encodes an evaluable contract. Three differences the reviewer can test in the embed: decisions recompute when state changes (change a fact, the mode and tier move); every decision leaves a receipt naming the facts and guardrail that produced it; and the "none of the above" branch is a designed output — unmatched input escalates rather than falling through to the nearest-looking node. Flowcharts fail silently; this is built to fail loudly and in your favor.

**"Where's the AI?"**
Where it belongs, and honestly labeled: language work (explaining, drafting, reading notices) is where generation helps, and that content is prepared in this prototype — the boundaries panel says so in the first screen. The decisions — what mode, what risk tier, whether to stop — are deliberately separated from generation, because that separation is what makes the product auditable. The claim is not "no AI"; it is *AI where language is needed, typed decisions where accountability is needed.* Governance of AI is the harder and rarer contribution.

**"Would this survive novel inputs?"**
Split the question in two. The decision dimension: yes, by construction — anything the guardrails can't match becomes an escalation with a named reason; the failure space is bounded by the type system, so novelty produces a stop, never a confident wrong answer. The content dimension: no — prepared text is bounded, and a novel matter will outrun it. That gap is the documented seam where a live generator would enter later, behind the same typed contract, with grounding and review gates unchanged. Saying "the prototype is honest about its edge" is a stronger answer than pretending the edge doesn't exist.

**"How does this scale beyond one scenario?"**
The vocabulary scales; the content is the cost. Response modes, risk tiers, failure kinds, receipts, and the guardrail stack are scenario-independent — a new domain (rent disputes, RTI, workplace grievances) means adding policies, prepared payloads, and reviewed sources, not re-architecting. The honest bottleneck is content: every answer must be authored, sourced, and labeled, which is exactly the cost a trust-first legal product should have. The audit says this plainly, and saying it plainly is itself the trust claim.

**"If scenarios script the verification catch, isn't the gate just theater?"**
It was — and that's an audit finding, not a defense. In the first build, trust signals were literals attached to hand-written turns. The decision layer makes the gate computed: preconditions are evaluated from matter state, trust signals recompute when facts change, and the receipt shows what remains unverified. The case study deliberately shows the theater version and the computed version as before/after, because the difference between *saying* trust and *computing* trust is the entire thesis.

**"Why not show a confidence score? Users like certainty."**
Numbers invite the wrong kind of trust. A "92% confident" label can increase over-reliance as much as under-reliance, and in a legal context the user has no way to interrogate a decimal. A claim ledger is the opposite: countable, source-linked, and falsifiable — the user can see the one ungrounded claim and decide what to do about it. Certainty is a feeling; inspectability is a feature. LokAI ships the feature.

---

## Y.6 Naming

Candidates for the decision system, evaluated for a portfolio context (plain-English, maps to code nouns, no hype, no borrowed vocabulary):

| Candidate | Reads as | Strength | Risk |
|---|---|---|---|
| **LokAI Decision Layer** | The stratum of the product that decides | Already the working term; plain; scales from section title to code | Slightly generic as a headline |
| **LokAI Decision Core** | The heart of the product | Stronger centrality | "Core" implies capability, not trust — wrong emphasis |
| **LokAI Policy Engine** | Rules that compute decisions | Technically accurate (guardrails + policies) | "Policy engine" reads corporate-compliance; colder than the product feels |
| **Decision Receipts** | The artifact the user actually sees | Most memorable and most honest — names what the reviewer can touch | Too narrow to name the whole engine |
| **The Refusal Engine** | The thing that says no | Distinctive, bold | Defines the product by limitation; risky for skimming recruiters |

**Recommendation: keep "LokAI Decision Layer" as the system name**, and let a small named vocabulary carry the distinctiveness:

- **decision receipt** — the per-turn, openable proof of a computed decision (provenance, never confidence numbers);
- **why LokAI stopped** — the named stop moment, always with reason and exit path;
- **the escalation ladder** — the computed risk tiers, self-service → review recommended → human required.

Rationale: the system name should be boring and true, because the artifacts are the memorable part — a recruiter will forget "Policy Engine" but will remember tapping *Why this response?* and reading a receipt. The name maps 1:1 to code nouns (decision, receipt, stop, tier), so the write-up, the embed, and the interview answers all use the same words — and in a trust study, consistency between what you say and what the code does *is* the brand.

