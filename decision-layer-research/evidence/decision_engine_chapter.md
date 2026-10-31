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
