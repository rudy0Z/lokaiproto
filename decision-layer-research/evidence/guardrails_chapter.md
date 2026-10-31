# X · The Guardrail Stack

## X.1 Why guardrails are the product

The risk landscape for consumer-facing legal AI is defined by three documented failure classes. First, professional-conduct guidance for lawyers (ABA-style opinions on generative AI) is unambiguous about where judgment lives: the lawyer owns competence, supervision, and candor, and a tool's job is to make review possible — not to replace it. Second, courts have sanctioned counsel for filing fabricated citations; the failure mode there was never "a wrong answer" but *confident prose with no verifiable source* — precisely the failure a chat interface makes effortless, because every reply is fluent regardless of what stands behind it. Third, consumer-protection regulators have fined an "AI lawyer" service for deceptive claims about what the product could do — establishing that *overclaiming capability is itself the violation*, independent of output quality. In India the regulatory regime for consumer legal AI is not yet settled, which flips the burden: a product in this space must self-constrain ahead of regulation, because there is no external gatekeeper to catch it.

The consequence for product design is direct. For a consumer legal-triage product, guardrails are not a safety accessory bolted around the real product — the guardrail stack *is* the product. A general chatbot sells prose. LokAI sells something else: a typed decision about what may safely happen next, what cannot happen, and why — with the evidence attached. Every capability the user experiences (a grounded explanation, a clarifying question, a refusal, a capped draft) is the output of a gate with a deterministic rule behind it. The trust grammar — claim ledgers instead of confidence scores, a refusal taxonomy instead of apologetic prose, an escalation ladder instead of silent risk absorption, decision receipts instead of invisible judgment — is the deliverable. Five of the eight demo scenarios are refusals by design; that ratio is the thesis.

Architecturally, this means guardrails here are not post-hoc filters scanning finished output. They are the decision pipeline itself: input classification, scope boundary, fact completeness, source coverage, jurisdiction conflict, risk tier, authorship, output verification, and audit logging run *in front of and around* anything the user sees. The same stack that protects the user also produces the audit trail and defines the demo scenarios — safety, explainability, and testability are one artifact, not three features. This ordering also matches the direction of regulation: audit-trail obligations for high-risk AI systems and court-accepted statistical gates in e-discovery both reward products whose safety is structural. And the stack is generator-agnostic: turn payloads are prepared templates today; if a generative composer is ever introduced, it composes *inside* the same gates and nothing outside the composition seam changes. The gates do not know or care what wrote the first draft — only whether it survives verification.

## X.2 The guardrail stack

### The shared contract

Every gate reads from one typed structure and returns one typed verdict. No gate authors prose; gates select a mode and a failure kind, and prose lives in payload templates chosen by that selection. This is the decision/copy separation: adding behavior means adding a rule, not hand-writing a turn.

```ts
type LayerId =
  | 'L0_intent' | 'L1_scope' | 'L2_facts' | 'L3_sources' | 'L4_jurisdiction'
  | 'L5_risk' | 'L6_authorship' | 'L7_output' | 'L8_audit';

interface DecisionState {
  userInput: { normalized: string; locale: Locale; noticePayload: string | null };
  intent: { topicId: TopicId | null; unrecognized: boolean };
  requiredFacts: RequiredFact[];     // { id, label, status: 'unconfirmed' | 'pending' | 'confirmed' | 'corrected' }
  jurisdiction: { state: StateCode; forum: Forum } | null;
  coveredSources: SourceRef[];       // the reviewed excerpt library — the only citable material
  conflicts: ConflictEntry[];        // static rule-conflict table (issue × state × forum)
  riskFactors: RiskFactor[];         // static trigger table (hard / soft), reviewed like code
  riskTier: RiskLevel;               // computed at L5, never authored
  draft: { status: DraftStatus; reviewedSections: SectionId[] } | null;
  claimLedger: ClaimLedger;          // recomputed at L7, never authored
  progress: { completedStages: StageId[]; preservedOnStop: true };
  audit: AuditEvent[];
}

type LayerVerdict =
  | { layer: LayerId; verdict: 'pass'; rules: RuleId[] }
  | { layer: LayerId; verdict: 'route'; rule: RuleId; failure: FailureKind; mode: ResponseMode };

// decide() is pure: identical DecisionState in → identical verdicts and receipt out.
function decide(state: DecisionState): {
  verdicts: LayerVerdict[]; route: TurnPlan | null; receipt: DecisionReceipt;
};
```

**Pipeline order.** Every user input traverses L0 → L1 → L2 → L3 → L4 → L5 in fixed order. The first failing gate owns the route and later gates are not evaluated (short-circuit), so every stop names exactly one decisive rule — never a pile of warnings. L6 fires on draft events; L7 verifies every composed turn before display; L8 runs always, including on stops and routes. Two route classes exist:

- **Content routes** (user-facing, honest): `missing_facts`, `source_gap`, `conflicting_jurisdiction`, `ocr_unreadable`, `language_uncertain`, `out_of_scope`, `high_risk`.
- **The integrity route**: `model_timeout` — reserved for the engine failing its *own* checks (used deliberately as the one overloaded kind so the failure vocabulary stays fixed at eight; an engine-integrity stop tells the user "I couldn't complete my safety checks," which is true and honest).

All user-visible labels (modes, failure kinds, risk tiers, draft statuses) come from the fixed typed vocabulary. A gate can never invent a label.

---

### L0 · Input intent classification

**Purpose.** Convert free text into a typed intent — or admit it cannot. This is the layer that replaces substring routing (the prototype's known brittleness: `text.includes(trigger)` answered an out-of-scope question as if it were the consumer scenario). L0's contract: classify by exact match against a reviewed topic table, and classify *legibility* separately from *topicality*. An unreadable document fails here; an unknown but legible topic passes through to be refused at L1; a covered topic with missing law fails at L3. Each concern gets its own gate.

**Reads from DecisionState.** `userInput.normalized`, `userInput.locale`, `userInput.noticePayload`, the active language packs, the topic trigger table.

**Decision rules.**

- **L0.R1** — Normalize (trim, collapse whitespace, apply the active language pack's folding). IF the normalized input is empty THEN the cycle is a no-op: no decision, no turn, state unchanged.
- **L0.R2** — IF a document payload is present AND the legibility test fails (readable-token count below floor, or character-confusion markers above threshold) THEN route `stop(ocr_unreadable)`. Legibility is structural, not semantic: L0 never guesses what a garbled notice "probably says."
- **L0.R3** — IF the input's script has no matching active language pack THEN route `stop(language_uncertain)`.
- **L0.R4** — Match normalized tokens/phrases against the topic trigger table (exact and whole-phrase forms only; substring matching is forbidden). IF a topic matches THEN set `intent = { topicId }`. IF none matches THEN set `intent = { unrecognized: true }` and pass to L1 — an unmatched input is passed *forward to be refused*, never answered from the nearest-looking turn.

**On failure.** `ocr_unreadable → stop` · `language_uncertain → stop`.

**What the user sees.** For `language_uncertain`: *"I couldn't read that reliably — it may be in a language I don't have active. You can switch language in Settings; everything you've confirmed so far is saved."* For `ocr_unreadable`: *"That document didn't come through legibly. Retake the photo or type the key lines — your matter is unchanged."* In both cases the matter state is untouched; L0 failures never cost the user progress.

---

### L1 · Scope boundary gate

**Purpose.** Refuse, before anything else happens, whatever LokAI does not cover. Scope is a *domain* question — do we do this kind of thing at all — deliberately separated from coverage (do we hold the law, L3) and risk (is this matter too dangerous to automate, L5). The refusal is first-class product surface: it states what the product is, what it is not, and what to do instead. This gate is also the structural answer to the prototype's documented drift bug: the out-of-scope conversation that got answered in-character.

**Reads from DecisionState.** `intent.topicId`, `intent.unrecognized`, the topic registry's scope tags (domain, `requiresProfessional` flag).

**Decision rules.**

- **L1.R1** — IF `intent.unrecognized` THEN route `stop(out_of_scope)`. No match is not an invitation to improvise from vocabulary.
- **L1.R2** — IF `topic.domain ∉ {consumer_refund, notice_interpretation}` THEN route `stop(out_of_scope)`.
- **L1.R3** — IF `topic.requiresProfessional == true` (criminal, family, immigration, taxation matters) THEN route `stop(out_of_scope)` — with the "this needs a professional" payload variant, because the honest reason is different: not "we don't cover this topic class" but "this class must not be automated for you."

**On failure.** `out_of_scope → stop`.

**What the user sees.** A scope statement, not an apology: *"I only help with the first steps of consumer-refund and notice problems in India. This question is outside that. What I can do: [covered topics]. For the rest, here's your nearest free legal-aid route."* The in-progress matter stays fully preserved — a scope refusal ends a turn, never a matter.

---

### L2 · Fact-completeness gate

**Purpose.** No assessment runs until every fact the assessment depends on has been *confirmed by the user*. Facts are the user's to confirm, never the system's to infer — this is the engine-level enforcement of the prototype's own rule that the working card "must not imply the model verified them." The gate also owns the clarify loop: asking is a mode of proceeding, and only a *budgeted* failure to clarify becomes a stop.

**Reads from DecisionState.** `requiredFacts` (derived from the topic's fact template), the topic's clarify-round counter.

**Decision rules.**

- **L2.R1** — IF any `RequiredFact.status != 'confirmed'` THEN route `clarify(missing_facts)` listing the exact missing fact labels — and only those. Round counter increments.
- **L2.R2** — IF the clarify budget is exhausted (`clarifyRound > MAX_CLARIFY_ROUNDS`, set to 2) AND required facts remain unconfirmed THEN route `stop(missing_facts)`. The stop names precisely which facts ended it.
- **L2.R3** — IF the user supplies a value for a pending fact THEN route `confirm` — the value is restated back for explicit confirmation (*"You bought it on 12 May for ₹8,999 — confirm?"*). The engine never promotes a supplied value to `confirmed` by inference; confirmation is a user action, always.

**On failure.** `missing_facts → clarify` (first failure), `→ stop` (budget exhausted).

**What the user sees.** In clarify: the named missing facts and the reason — *"To check your refund rights I still need: proof of purchase, what exactly is wrong with it, and what the seller said. I don't guess facts about your matter."* Confirmed facts are displayed as locked. In stop: the same list plus what stays saved. Both preserve all prior confirmations by construction — L2 never mutates `requiredFacts` it hasn't been given a value for.

---

### L3 · Source-coverage gate

**Purpose.** LokAI only speaks from the reviewed excerpt library. A gap in the library is a stop, not a paraphrase — the anti-fabrication rule stated as architecture. Where a general chatbot fills a knowledge hole with plausible prose, this gate fills it with a refusal that names the hole. This is the single most important guardrail against the documented sanction pattern (counsel cited authorities that did not exist): the system structurally cannot cite what it does not hold, because citations resolve against `coveredSources` and nothing else.

**Reads from DecisionState.** The topic's assessment template and its required citation set; `coveredSources`.

**Decision rules.**

- **L3.R1** — Let C be the citation set the topic's assessment template requires. IF ∃ c ∈ C such that c ∉ `coveredSources` THEN route `stop(source_gap)`, naming the missing authority *class* generically ("rent-control eviction notice periods") — never inventing an excerpt, a section number, or a summary.
- **L3.R2** — IF the topic's template requires no citations (pure procedure or navigation) THEN pass with the note `no_citations_required`; every claim in such a turn must be labeled *indicative* at L7 and none may be load-bearing.

**On failure.** `source_gap → stop`.

**What the user sees.** *"I don't have reviewed material on rent-control eviction notices. I won't paraphrase law I can't show you. What I do hold: the Consumer Protection Act, 2019 (defective goods, refunds) and the RTI Act, 2005. For this one, a lawyer or a legal-aid clinic is the right stop."* The receipt records which authority class was missing, so the gap is product data, not a silent dead end.

---

### L4 · Jurisdiction & conflict gate

**Purpose.** Refuse when the applicable rules conflict and the conflict cannot be resolved — or resolve it transparently when a reviewed tie-break exists. Jurisdiction itself is treated as a *fact* (it is clarified, not stopped), while conflicts between covered rules are treated as a *gap class of their own* (they are stopped, not papered over with an average of the two rules).

**Reads from DecisionState.** `jurisdiction`, the topic's `jurisdictionSensitive` flag, the static conflict table (`conflicts`), and its tie-break entries.

**Decision rules.**

- **L4.R1** — IF `topic.jurisdictionSensitive == true` AND `jurisdiction == null` THEN route `clarify(missing_facts)` with fact label "state / forum". Which state you are in is a question, not an obstacle.
- **L4.R2** — IF the conflict table contains an unresolved entry for (`topic`, `jurisdiction`) — the same issue governed differently by two authorities the library holds — AND no tie-break rule exists THEN route `stop(conflicting_jurisdiction)`, presenting *both* rule statements with their citations.
- **L4.R3** — IF a reviewed tie-break exists (e.g., a central statute governs the point) THEN pass; the tie-break rule id is recorded in the receipt and surfaced to the user as a disclosure line, so a resolved conflict is visible rather than silently absorbed.

**On failure.** `conflicting_jurisdiction → stop` (unresolved conflict); `missing_facts → clarify` (unknown jurisdiction).

**What the user sees.** For the stop: *"The sources I hold differ on [point] between Maharashtra and Karnataka, and I can't tell which applies to you from what you've confirmed. Tell me your state — or take this to a local legal-aid clinic. Both versions are shown below."* For the clarify: the jurisdiction question joins the normal fact-confirmation flow with the user's progress intact.

---

### L5 · Risk-tier gate

**Purpose.** Compute the matter's risk tier from its *shape*, using a reviewed trigger table — never a score, never a vibe. Some matters are `human_required` no matter how complete the facts are; the gate's job is to find them deterministically and hand them to a person, with the trigger named. This is the escalation ladder's runtime: `self_service` proceeds, `review_recommended` proceeds with visible review labels, `human_required` stops with a referral.

**Reads from DecisionState.** `requiredFacts` (confirmed values only), the topic's context, the static trigger table (`riskFactors`: hard and soft factors).

**Decision rules.**

- **L5.R1** — IF any **hard trigger** is present in the confirmed facts (illustratively: an irreversible act requested — filing, appeal, complaint against an official; a statutory deadline or coercive date within 7 days; a safety threat; threatened self-help action like a lock-out) THEN `riskTier = human_required` and route `stop(high_risk)`. The receipt names the triggering factor verbatim.
- **L5.R2** — ELSE IF any **soft trigger** is present (illustratively: matter already in litigation; multiple adverse parties; an authority already involved) THEN `riskTier = review_recommended` and pass. Every downstream turn is stamped with a visible "show this to a lawyer" label, and L6 caps any draft at `user_reviewed`.
- **L5.R3** — ELSE `riskTier = self_service` and pass.

A factor fires or it does not; there are no weights, no sums, no thresholds over continuous values. The trigger table is static, versioned data reviewed like code — a policy choice documented as such, not math pretending to be measurement.

**On failure.** `high_risk → stop` (with referral payload).

**What the user sees.** For the stop: *"This situation needs a person. You mentioned a lock-out date within the week — that's something I won't guide on my own. Here's what to do now [covered immediate steps] and here's your free legal-aid route. Everything you've entered is saved."* For `review_recommended`: the same grounded help as `self_service`, with the review label present on every relevant turn — the user always knows a human read is recommended before acting.

---

### L6 · Draft & authorship gate (review-gated authorship)

**Purpose.** Nothing reaches `ready_to_use` without a human pass, and no draft can shortcut a stop. The draft flow is not a separate pipeline — a draft request *is* a decision, and it re-enters the same stack. Authorship is gated exactly like assessment, which is what makes the gate real rather than a label on the button.

**Reads from DecisionState.** `draft.status`, `draft.reviewedSections`, `riskTier` (as computed at L5), `claimLedger` (as recomputed at L7), and the verdicts of the L2–L5 pass for the current cycle.

**Decision rules.**

- **L6.R1** — A draft request re-traverses L2 → L5. The first failing gate routes exactly as it would for any decision (`missing_facts`, `source_gap`, `conflicting_jurisdiction`, `high_risk`). A draft can therefore never exist for a matter that could not be assessed.
- **L6.R2** — IF all gates pass THEN compose the draft from the topic's template and set `DraftStatus = ai_draft`.
- **L6.R3** — `ai_draft → user_reviewed` ONLY on explicit per-section user review actions, and only when all sections have been reviewed.
- **L6.R4** — `user_reviewed → ready_to_use` ONLY IF `riskTier == self_service` AND every claim in the draft is grounded per the recomputed ledger AND no review label is uncleared. IF `riskTier == review_recommended` THEN the status is capped at `user_reviewed` and the cap is explained (`disclose`). No path exists from a machine-composed draft to a ready-to-use artifact that a human has not passed section by section.

**On failure.** Re-enters the stack at L2 and inherits that gate's routing; the status cap routes `disclose`.

**What the user sees.** Status chips from the fixed vocabulary, and the standing statement: *"AI draft — nothing is filed until you review it."* Section-by-section review with explicit confirm actions. When a cap applies, the reason is shown and recorded: *"Capped at 'you reviewed it' — this matter type should get a professional read before you act on it."* The receipt shows which rule produced the cap.

---

### L7 · Output verification (claim-ledger recompute)

**Purpose.** Every composed turn is verified before display by *recomputing* the claim ledger from state — grounded counts are computed, never authored. This closes the prototype's largest honesty gap (static trust signals that did not react to fact changes) and is the layer that makes the `groundedClaims / totalClaims` grammar trustworthy: the ratio on screen is an invariant of the state, not a string someone wrote.

**Reads from DecisionState.** The composed turn's claims (each with citation references and fact dependencies), `coveredSources`, `requiredFacts`, `jurisdiction` — all from the *same immutable state snapshot* the turn was composed against, which removes composition/verification races by construction.

**Decision rules.** For each claim in the turn:

- **L7.R1** — Recompute: `grounded := claim.citations ⊆ coveredSources ∧ claim.factDependencies ⊆ confirmedFacts ∧ claim.jurisdictionMatches`. Claims labeled *indicative* (general guidance, no statutory basis) count in `totalClaims` and never in `groundedClaims`.
- **L7.R2** — IF an ungrounded claim is template-marked **droppable** THEN strip it, recompose, and recompute the ledger. The turn may ship smaller, never wronger.
- **L7.R3** — IF an ungrounded claim is template-marked **load-bearing** THEN withhold the entire turn and route `stop(source_gap)`. An answer with a hole in a load-bearing claim is not an answer; it is the failure mode this whole stack exists to prevent.
- **L7.R4** — IF a claim depends on a non-confirmed fact THEN this is an engine-integrity violation (composition may only use confirmed facts — a correct engine cannot produce this state): raise a developer-visible assertion and route the integrity stop (`model_timeout`, *"I couldn't complete my safety checks"*). This rule should never fire; its firing is a bug report, which is exactly what defense-in-depth is for.
- **L7.R5** — Emit the ledger as counts plus per-claim inspectability — every statement resolves to a citation or carries the *indicative* label. No numeric confidence, no scores, no percentages anywhere in the output. Confidence belongs to the engine's thresholds; evidence belongs to the user.

**On failure.** Content failure: `source_gap → stop` (turn withheld). Integrity failure: `model_timeout → stop` (turn withheld, assertion raised).

**What the user sees.** The ledger chip: *"6 of 7 statements cite the law directly · 1 is general guidance."* Every statement is tappable to its citation or its "general guidance" label. A withheld turn shows the honest stop instead of a fluent answer with a concealed gap.

---

### L8 · Audit logging (decision receipt)

**Purpose.** Every decision — pass, route, or stop, at every layer — is logged, and the log's user-facing projection is the **decision receipt**. Auditability is architecture, not a feature: because every decision is a typed verdict from a named rule over a snapshot, the audit trail falls out of the pipeline for free, and the user can read it. The receipt converts "the system refused me" into "here is exactly why, and exactly what would change it."

**Reads from DecisionState.** All layer verdicts, the state snapshot id, the cycle id.

**Decision rules.**

- **L8.R1** — Each layer verdict appends exactly one `AuditEvent { cycleId, layer, rule, verdict, failureKind?, snapshotId, ts }`. Passes are logged too — the trail shows what was *checked*, not only what failed.
- **L8.R2** — IF any expected event is missing or malformed at cycle end THEN the decision is invalid: the turn is withheld and the integrity stop routes (`model_timeout`). An incomplete receipt means the safety checks did not verifiably run — fail closed.
- **L8.R3** — Every stop composes a user-facing decision receipt: the layers passed, the decisive rule id, the plain-language reason, the exact state change that would flip the outcome (*"confirming your purchase date and adding what the seller said would let me assess this"*), and the preserved-progress inventory.
- **L8.R4** — Recovery flows link the new receipt to the prior stop receipt, so a resumed matter carries a readable chain: stopped at L2 (missing facts) → fact confirmed → resumed at L2 → passed. The chain is the demo's recovery scenario made inspectable.

**On failure.** Integrity: `model_timeout → stop`.

**What the user sees.** A "Why this answer / Why this stop" panel: the decisive rule in plain language, what was checked before it, the one thing that would change the outcome, and what is kept. Copyable/printable in the prototype. The staged progress labels the UI shows during work ("Checking the Consumer Protection Act, 2019") are projections of these same events — the label and the receipt can no longer disagree, because they are the same data.

---

## X.3 Traceability matrix

How each demo scenario traverses the stack. Legend: **✓** pass · **C** clarify route · **S** stop route · **—** not reached (short-circuit) · **℞** receipt appended (L8 runs on every outcome, including stops).

| # | Scenario | L0 | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | Expected decision outcome |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | **Core journey** — consumer-refund intake completed, covered sources, no triggers | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ `self_service` | ✓ `ai_draft` | ✓ ledger 6/7 | ℞ | Grounded `explain` turn (6 of 7 statements cited, 1 labeled indicative) → draft allowed → `user_reviewed` after section review |
| S2 | **Missing facts** — outcome requested with unconfirmed required facts | ✓ | ✓ | C | — | — | — | — | — | ℞ | `clarify(missing_facts)` naming the exact facts; after 2 unanswered rounds → `stop(missing_facts)`; confirmed facts stay locked |
| S3 | **Source gap** — rent-control eviction notice (authority not in library) | ✓ | ✓ | ✓ | S | — | — | — | — | ℞ | `stop(source_gap)` naming the missing authority class; covered materials listed; referral; gap recorded as product data |
| S4 | **Conflicting jurisdiction** — same issue, differing state rules | ✓ | ✓ | ✓ | ✓ | C → S | — | — | — | ℞ | State unknown → `clarify` (jurisdiction as a fact); state given but conflict unreconciled → `stop(conflicting_jurisdiction)` with both cited versions shown |
| S5 | **High-risk stop** — hard trigger in confirmed facts (coercive date within 7 days) | ✓ | ✓ | ✓ | ✓ | ✓ | S `high_risk` | — | — | ℞ | `riskTier = human_required`; `stop(high_risk)` with the trigger named verbatim, immediate covered steps, legal-aid referral |
| S6 | **Out of scope** — unrelated legal domain ("help me with my divorce") | ✓ | S | — | — | — | — | — | — | ℞ | `stop(out_of_scope)` with scope statement, covered topics, professional/legal-aid pointer; matter untouched |
| S7 | **Recovery** — user returns to a prior stop and supplies the missing fact | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ `self_service` | — | ✓ | ℞ | Re-entry passes; route `recover`; resume at last completed stage; new receipt chained to the prior stop receipt |
| S8 | **Unreadable notice** — document payload fails the legibility test | S | — | — | — | — | — | — | — | ℞ | `stop(ocr_unreadable)`; retake/retype affordance; no facts lost; matter unchanged |

**Reading notes.**

- Every scenario logs a full or partial receipt (℞) — there is no outcome, including refusals, that leaves no trace. S2–S6 and S8 — six of eight scenarios — are refusals or gates, not answers.
- Short-circuiting is visible in the dashes: S6 dies at L1 without ever consulting the fact store; S8 dies at L0 without touching scope. Each stop names one decisive rule because later gates genuinely never ran.
- S7 exists to prove the invariant that stops are terminal for the *turn*, not the *matter*: the L2 stop receipt in S2 and the recover receipt in S7 are the same matter's continuous history.
- S1's ledger (6/7) demonstrates that a *passing* turn still discloses its one indicative statement — verification transparency applies to successes, not just failures.

## X.4 Design invariants

**I1 · Determinism.** `decide(state)` is a pure function: identical `DecisionState` in, identical verdicts and receipt out. No randomness, no wall-clock inputs to rules (timestamps live in receipts, never in decision logic), no model calls anywhere in the gate path. *Enforced by:* the pure `decide()` contract; snapshot ids make any two receipts byte-comparable; a determinism test runs every scenario twice per build. *Violation looks like:* the same matter routing differently across reloads — an immediate, reproducible test failure.

**I2 · Refusal as first-class outcome.** A stop is a designed, typed, quality-barred product response — the refusal taxonomy (8 failure kinds) gets the same craft budget as the best `explain`. The escalation ladder is not the system failing; it is the system succeeding at the thing a chat product structurally cannot do: declining cleanly. *Enforced by:* typed `FailureKind` enum (no free-text stop reasons); dedicated stop payload families per kind; refusal scenarios occupying six of eight demo slots. *Violation looks like:* an apologetic paragraph where a named rule and a next step belong.

**I3 · No confidence display.** Thresholds and trigger tables live in policy data inside the engine; the user sees counts, citations, and named factors — never a score. "6 of 7 statements cited" is inspectable arithmetic; "92% confident" is an invitation to over-rely. *Enforced by:* L7.R5; the repo's own gate against numeric-confidence strings; the fixed vocabulary containing no confidence type at all. *Violation looks like:* any percentage, score, or star rating in any surface.

**I4 · Evidence, not vibes.** Every displayed statement traces to a citation or carries the *indicative* label; every route names the rule that produced it; every risk trigger is quoted verbatim in the receipt. Nothing the user reads is untraceable to either the library or a labeled general statement. *Enforced by:* L7 recomputation over the same immutable snapshot as composition; rule ids in every verdict and receipt. *Violation looks like:* a fluent sentence in a turn that no claim in the ledger accounts for.

**I5 · Preserved progress on stop.** Stops end turns, never matters. Fact stores, confirmations, and completed stages are immutable across all stop routes; every stop receipt lists exactly what is kept; re-entry resumes at the last completed stage. *Enforced by:* `progress.preservedOnStop` as a typed property of the pipeline (stops structurally cannot truncate state); S7's chained receipts as the regression scenario. *Violation looks like:* any refusal that resets the workflow or asks the user to start over.

**I6 · Policy as documentation.** Every trigger table, clarify budget, tie-break rule, and rule id is static, versioned data a non-engineer can read — the entire guardrail policy can be printed in the case study, and a policy change is a data diff, not a code hunt. This is the honest alternative to pretend-quantification: where other products would hide a judgment call inside a model, LokAI publishes the judgment call as the policy it is. *Enforced by:* tables-as-data (`riskFactors`, `conflicts`, `MAX_CLARIFY_ROUNDS`); policies reviewed and versioned like code. *Violation looks like:* a decision rule whose rationale lives only in someone's head or a comment.

**I7 · Fail closed.** When the engine cannot verifiably complete its own checks — an incomplete receipt, a claim composed from an unconfirmed fact — the turn is withheld, not shown with a warning. The integrity route exists so that engine bugs degrade to silence-with-explanation, never to unverified output. *Enforced by:* L7.R4 and L8.R2; the deliberate, documented overloading of `model_timeout` as the integrity kind while the failure vocabulary stays fixed. *Violation looks like:* a rendered turn that outlived a failed verification.

**I8 · One vocabulary.** Every user-visible decision label — mode, failure kind, risk tier, draft status — comes from the fixed typed vocabulary. Prose lives only inside payload templates selected by that vocabulary; labels are never free text, and adding one is a deliberate, versioned vocabulary change rather than a string someone typed. *Enforced by:* the type system end to end; the demo gate that checks status labels against the fixed vocabulary. *Violation looks like:* a new stop reason appearing in the UI that no `FailureKind` accounts for.

---

Taken together, the invariants describe a product whose safety story and its product story are the same story. A user who reads a decision receipt is reading the guardrail stack; a recruiter or reviewer who reads the policy tables is reading the product's judgment, stated as data; a future engineer wiring a live composer into L6 inherits gates they cannot bypass, because the gates are the pipeline, not a lint pass on its output. That is the claim this stack makes against the documented failure modes of legal AI: not "our model is careful," but *no statement reaches the user except through nine named gates, and every gate hands the user the receipt.*
