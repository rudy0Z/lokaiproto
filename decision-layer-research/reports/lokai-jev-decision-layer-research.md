# JEV × LokAI — The Decision Layer Research & Strategy Report

**Prepared:** 2026-09-21 · **Scope:** Jev (TypeSafe AI) deep research + LokAI decision-architecture audit + product strategy for a trust-first legal AI
**Sources:** your three X posts (captured directly), typesafe.ai (browser capture), flaviocopes deep dive (browser capture), plus ~20 web searches across legal-AI regulation, prior art, and product precedents. Confidence grading throughout; vendor claims are never presented as verified facts.

---

## 1. Executive summary

You found something real, and your instinct about *why* it matters is correct — but the interesting part is not the model. **Jev** (TypeSafe AI, launched Sept 15, 2026) is a "System One" model that doesn't write prose at all: you hand it structured **state** and typed **questions**, it returns typed **decisions** (yes/no, pick-one, scale-position) with confidence estimates, in milliseconds at near-zero cost. The viral framing from your sources — *"state → decision → action → verification → next state"* — is an engineering discipline called **Jev Engineering**: an LLM creates the work, a cheap typed decision layer decides what happens next, code executes it.

What this means for LokAI is stronger than an integration story:

1. **LokAI already invented its own version of this — on paper.** Your repo contains a complete typed trust vocabulary (7 response modes, an 8-way stop taxonomy, 3-tier risk routing, claim-ratios instead of confidence scores) — but it's hand-scripted per screen. There is no decision engine; the intent router is a substring match (`includes()`), which already caused your documented P0 drift bug ("out-of-scope conversations answering as the consumer scenario").
2. **Jev's loop is the missing engine's spec.** Mapping it onto LokAI yields a concrete, buildable architecture — a *decision contract* — that computes the trust vocabulary you already designed from the state you already store.
3. **One hard contradiction must be resolved, not skipped:** Jev sells confidence scores; LokAI's own enforced design law bans fabricated confidence ("no groundingScore, no percentage-confidence strings" — AGENTS.md gates). The resolution (confidence drives *engine thresholds*, claim-ratios drive *user-visible truth*) is itself your best case-study material.
4. **The differentiation vs ChatGPT/Gemini is categorical, not incremental:** chatbots sell prose and drift by construction; a decision-layer product *decides what may safely happen next, shows its work, and stops when it can't own the answer*. Every legal-AI trust precedent (sanctioned lawyers, FTC enforcement, EU AI Act audit duties, court-validated TAR gates) rewards exactly this architecture.

**Headline recommendation:** build the **LokAI Decision Layer** as a provider-agnostic typed decision contract (Jev-shaped, Jev-optional), extract it from your scripted turns into a real engine, and tell the portfolio story as *"from scripted trust to executable trust."* Jev is the catalyst for the thinking — not a dependency in the build.

---

## 2. What Jev actually is (mechanics, verified)

**Identity.** Jev is TypeSafe AI's "first public System One model" — announced Sept 15, 2026, after two years in stealth (typesafe.ai, captured directly). The vendor's own positioning: *"System One Models are a new class of AI model built for decisions inside software"*; *"Decisions, Not Strings"*; *"LLMs produce words for people. Jev produces typed decisions."* An independent deep dive (flaviocopes.com/jev, updated Sept 21, 2026) opens with the sharpest one-liner: *"Jev is not a chatbot like ChatGPT... It does not write replies, explanations, or code."*

**The contract.** You send JSON state + a list of typed questions; you get one typed answer per question:

| Type | Semantics | Request shape | Response shape |
|---|---|---|---|
| **Noul** | yes/no gate | `{"refund_requested": {"type": "noul", "instructions": "Does the customer ask for money back?"}}` | `{"refund_requested": {"type": "noul", "noul": 0.93}}` |
| **Choice** | pick one option (routes) | `{"department": {"type": "choice", "instructions": "Which team should handle this?"}}` | `{"choice": "billing", "probabilities": {"billing": 0.84, "technical": 0.15, ...}}` (up to 255 options) |
| **Score** | position on a described scale (ranks) | `{"bug_severity": {"type": "score", "instructions": "How severe?", "criteria": [...]}}` | `{"score": 1.3, "confidence": 0.54, "legend": {...}}` |

Every answer carries a confidence/probability, and the canonical consumption pattern is a threshold: `if (decision.confidence >= 0.85) act() else escalate()`.

**The loop.** From Ricker's article (your source): state → decision → action → verification → next state. *"An LLM creates the work. Something else should decide what happens next."* (Treat the loop and harness as the promoters' engineering philosophy — captured verbatim, not independently validated.) The **harness** adds two more Jev layers that never generate text: a **model router** (picks the cheapest model per request) and a **gate** (checks every tool call before execution — blocks risky actions, approves safe ones). Compaction becomes a *relevance filter* (score every context entry, drop the irrelevant) instead of a summarization pass. One structural constraint matters for legal workflows: batched questions "cannot read one another's answers" — legal claim triage is often question-interdependent, which can disqualify naive batching in the core decision path.

**State discipline — the part everyone undersells.** *"Jev is only as good as the state you hand it. It does not go looking for context. It decides on exactly what you give it... Give it evidence, not vibes"* (Ricker). The decider is only as trustworthy as the state builder that feeds it — which is precisely where legal products live or die.

**API/SDK surface.** `POST api.typesafe.ai/v1/systemone`; Node `@typesafe-ai/sdk` (`choice, noul, score, TypeSafeClient`), Python `typesafe-sdk`, Vercel AI SDK adapter; model ids `jev-latest` / `jev-1.13.0`; coding-agent skill (`npx skills add typesafe-ai/skills`); LangChain has published an integration guide. Ecosystem traction is real.

**Performance & price claims — read carefully.** Everything below is **vendor-measured, no independent benchmark exists as of today** (product is 6 days old; my searches found zero third-party replication — confirmed again by an adversarial spot-check). Worse, third-party retellings already disagree wildly: MindStudio says "~100x faster and 100x cheaper", LangChain's guide says "up to 200x faster and 400x lower cost", DataCamp says "40–200x faster and 40–400x cheaper". That claim drift through launch-week amplifiers is itself evidence nobody outside the vendor has measured anything. The Register is so far the only independent tech-press treatment found (architecture/Demo coverage, no benchmark — per the review pass).

| Claim | Value | Source | Caveat |
|---|---|---|---|
| Headline | 193.6x faster, 444.6x cheaper | typesafe.ai blog | asterisked: *"Based On Workflows For System One Tasks"* — scoped, vendor's own tests |
| Input price | $42 per billion tokens ($0.042/M); "238x lower input price than Claude Fable 5.1" | typesafe.ai homepage | category comparison: decision call vs LLM call |
| Live demo pair | Jev: $0.000081 / 0.114s vs GPT: $0.013880 / 8.566s | typesafe.ai homepage | ~171x cheaper / ~75x faster in that demo — same category caveat; input-price only (output pricing uncaptured, so total-cost multipliers can't be replicated from public data) |
| "Zero Hallucinations" | marketing headline | typesafe.ai homepage | same FAQ list asks "Can Jev Still Get Things Wrong?" — typed outputs ≠ zero errors |

**Where it breaks** (flaviocopes documents a dedicated section): fan-out beyond batch/option limits, and any decision needing generative world knowledge rather than classification over the provided state.

---

## 3. The skeptical read — what's actually novel here

Every primitive Jev packages already exists as open technology:

- **Routing:** RouteLLM-style routing claims "95% of frontier model quality while routing 85% of queries to cheaper models"; FrugalGPT-style cascades report 50–98% cost savings; a 2026 arXiv survey systematizes the field.
- **Gates:** Llama Guard 3 is "a fine-tuned classifier model that outputs a safe/unsafe label with a hazard category"; NeMo Guardrails orchestrates input/output checks; Guardrails AI validates structured outputs at 50–200ms.
- **Typed outputs:** schema-constrained decoding is table stakes in every major LLM API.

**So the honest assessment is:** Jev's differentiation is (a) possibly a genuinely non-autoregressive model trained for calibrated decisions (vendor claims RLVR/RLCD-based training; no published calibration data yet), and (b) unquestionably the *productization* — one API that makes "decide, don't generate" the easy path, with uniform confidence semantics and act/escalate thresholds. The discipline is adoptable today with zero vendor dependency; Jev just makes it mainstream and cheap. There's also an irony worth knowing: the name riffs on the **Jevons paradox** — cheaper decisions invite more decisions, so unit-cost savings can evaporate at the workflow level (Codila's "save 101% of your money" framing is promoter hyperbole; treat it as such).

**Why this matters for LokAI:** you should *not* couple your architecture story to an unverified vendor. Couple it to the pattern — which the prior art fully validates — and cite Jev as the catalyst.

---

## 4. What the legal space demands (the trust research)

This is the vocabulary your decision layer must satisfy, and it's stricter than general agent-land:

- **The hallucination precedents are existential.** *Mata v. Avianca* (SDNY 2023): $5,000 Rule 11 sanctions; six ChatGPT-fabricated cases — the landmark, most-cited precedent (widely reported as the first such sanction) for AI-fabricated citations. Since then, courts increasingly require certification that filings are AI-checked. *FTC v. DoNotPay* (final order Feb 11, 2025): $193,000 and an order prohibiting "deceptive 'AI lawyer' claims" — the first federal enforcement against an AI-lawyer product. Lesson for LokAI: capability claims are regulated speech; "what the product may safely claim" is a design constraint, not marketing copy.
- **Professional norms define the review duty.** ABA Formal Opinion 512 (2024) frames GenAI duties: competence (Model Rule 1.1 — stay informed, use responsibly), confidentiality, communication (possible disclosure of AI use), supervision, candor. Translation to product architecture: the *human* owns judgment; the product must make review possible, cheap, and auditable.
- **Regulation is converging on auditability.** EU AI Act Annex III lists "administration of justice" AI as high-risk; the original Regulation applied Annex III obligations from **Aug 2, 2026**, while the Digital Omnibus amendment (still tracking toward finality as of Sept 2026) would move them to **Dec 2, 2027** — present both timelines and verify the amendment's final status before relying on either. High-risk regimes demand documentation, logging, and human oversight. Consumer legal-info tools likely sit adjacent to, not inside, the judicial-authority scope — but the direction of travel is unambiguous: every AI action should be a loggable, typed event.
- **The strongest domain precedent for decision gates is TAR.** Technology-Assisted Review in e-discovery won court acceptance because its machine decisions were *statistically validated* — recall targets, elusion samples, documented training rounds. That's the legal industry's existing mental model for "machines deciding what humans don't see": not vibes, measured gates.
- **Trust UX research:** verbal confidence ("Very Likely") outperforms numeric ("87%") for user trust and reduces automation bias (single-source UX finding, treat as indicative — but it independently matches LokAI's own "never model confidence" gate).

**Where consumer legal AI in India sits:** no settled UPL/AI regime yet; the CPA 2019 isn't AI-specific; DPDP 2023 will govern data practices. The window is real: a product that self-imposes strict info-vs-advice boundaries and auditability *ahead of regulation* turns compliance pressure into brand.

---

## 5. LokAI audit — the decision architecture today (file-evidenced)

What your repo actually is: **a deterministic, fully visual prototype** of an Indian legal-AI guide (consumer-refund matter: Priya, ₹8,999 mixer grinder), zero live AI by enforced gate — the "trust study" of your portfolio. The trust *design* is genuinely sophisticated:

| Asset | Where | What it gives you |
|---|---|---|
| 7 typed response modes | `src/app/data/responseTurns.ts` | clarify / explain / disclose / stop / confirm / progress / recover — already a "decision type" enum |
| 11-stage workflow | `src/app/data/caseWorkflow.ts` | intake→clarify→verify→triage→retrieve→assess→plan→packet→escalation→failure→audit |
| 3-tier risk routing | `caseWorkflow.ts` `RiskLevel` | self_service / review_recommended / human_required |
| 8-way stop taxonomy | `FailureKind` | missing_facts, source_gap, conflicting_jurisdiction, ocr_unreadable, language_uncertain, model_timeout, out_of_scope, high_risk |
| Claim ledger | `TrustSignals.groundedClaims/totalClaims` | "Inspectable claim coverage — never model confidence" (your own comment) |
| Verification gate | DemoContext fact store | the USER confirms facts — the working card "must not imply the model verified them" |
| Audit trail type | `AuditEvent[]` | already exists, presentational |

**The gaps (all file-evidenced):**

1. **Brittle intent routing (G1):** trigger matching is `text.toLowerCase().includes(turn.trigger.toLowerCase())` (responseTurns.ts ~L567). Your own audit doc records the consequence as a P0: "out-of-scope conversations answering as the consumer scenario." That is *drift* — the exact failure class you want LokAI immune to.
2. **Decision/copy fusion (G2):** the decision (mode, stop reason, draftAllowed) is baked inside hand-written content objects. There is no separable policy that *computes* the mode from state.
3. **Static trust signals (G3):** groundedClaims/totalClaims and riskLevel are literals per prepared turn; nothing recomputes them when facts change in DemoContext.
4. **No runtime uncertainty schema (G4):** the gate rightly bans fabricated confidence, but when live AI arrives, nothing defines what the system does with real model uncertainty.
5. **Failure taxonomy is presentational (G5):** the 8 FailureKinds exist, but no runtime classifier decides which one applies to novel input.
6. **Progress theater (G6):** staged labels ("Checking the Consumer Protection Act, 2019") simulate work a live system would have to actually do — your own code comment admits the facts are "the USER's to confirm."

**The one-line diagnosis:** LokAI's trust vocabulary is finished; its trust *engine* is missing. Every decision is a hand-authored artifact wearing the costume of a decision system.

---

## 6. The strategy — the LokAI Decision Layer

### 6.1 Core mapping: Jev loop → LokAI

| Jev concept | LokAI implementation | Status today |
|---|---|---|
| **State** ("evidence, not vibes") | DemoContext matter store: confirmed facts, sources, jurisdiction, claim ledger | exists as data; needs a formal `DecisionState` projection |
| **Questions (noul/choice/score)** | The decision set: *mode?* (7-way Choice), *risk tier?* (3-way Choice), *stop kind?* (8-way noul fan), *fact completeness?* (Score), *draft allowed?* (noul) | vocabulary exists; decisions are hand-authored |
| **Decision + confidence** | Typed `DecisionResult` with internal confidence driving thresholds | absent (G4) |
| **Action** | Render prepared turn payload for the decided mode | exists |
| **Verification** | Recompute claim ledger + fact status from state; log `AuditEvent` | partially (G3, G5) |
| **Harness gate** | Pre-execution check: does the decided action violate scope/risk policy? → force `stop` | implicit in scripts |
| **Escalate path** | `human_required` risk tier + your stop taxonomy | exists as vocabulary |

### 6.2 The contract (build this)

```ts
// DecisionRequest: everything the decider may see — nothing else.
interface DecisionRequest {
  matter: MatterState;          // confirmed/missing/disputed facts (DemoContext)
  sources: SourceLedger;        // coverage: direct | related | missing | conflicting
  userTurn: NormalizedTurn;     // classified intent, NOT raw free text
  policy: DecisionPolicy;       // thresholds, scope boundary, risk rules
}

// DecisionResult: typed, loggable, auditable.
type DecisionResult =
  | { kind: 'proceed'; mode: ResponseMode; risk: RiskLevel; rationale: Rationale }
  | { kind: 'stop'; reason: FailureKind; preservedSummary: string }
  | { kind: 'escalate'; to: 'human_review'; because: string };

// Engine: pure, deterministic, swappable backend.
function decide(req: DecisionRequest, backend: DecisionBackend): DecisionResult;
// DecisionBackend = scripted evaluator now | classifier later | Jev adapter if ever
```

Three properties make this the trust story: **(1) The decider sees only state, never vibes** — the substring router (G1) is replaced by a state-driven decision, which kills your P0 drift class by construction. **(2) Every result is a loggable event** — the audit trail stops being a prop and becomes the loop's exhaust. **(3) The backend is swappable** — scripted today (still zero-network, gate-clean), a real classifier tomorrow, a Jev adapter if the economics ever get independently verified. Jev-shaped, Jev-optional.

### 6.3 Resolving the confidence contradiction (your best material)

Jev: "act when confidence is high, escalate when low." LokAI's gate: "no fabricated confidence — no percentage-confidence strings." Both are right, because they address different audiences:

- **Confidence is for the engine.** Internal thresholds choose between proceed/stop/escalate. Whether the number comes from a classifier or a scripted rule, it's policy — document it as policy until it's published calibration.
- **Evidence is for the human.** The user sees the claim ledger — "6 of 7 claims grounded in sources you can open" — plus what's missing and disputed. Never a score. (This is also what the UX research and TAR's court-accepted framing both support.)

A naive Jev port would violate your repo's own enforced design law. *Catching that contradiction and resolving it in the architecture* is exactly the judgment recruiters are trying to detect in case studies.

### 6.4 Why this beats the ChatGPT/Gemini pattern (product thinking)

| Dimension | Generic chatbot pattern | LokAI decision-layer pattern |
|---|---|---|
| Unit of output | prose (unbounded failure space) | typed decision (bounded failure space) |
| Failure mode | confident wrong answer, invisible | wrong *routing*, visible and correctable; refusal is a first-class outcome |
| Trust surface | tone, verbosity, vibes | claim ledger, source coverage, stop reasons, audit trail |
| Scope control | system-prompt policing (soft) | gate on every action (hard): out-of-scope *cannot* route to an answer |
| Economics | frontier LLM called for every micro-decision | decisions at ~zero cost; LLM reserved for generating explain/disclose payloads |
| Auditability | chat log (forensics) | typed event log (governance) |
| Regulatory fit | claims discipline on the developer | architecture *is* the compliance story (logging, oversight, review gates) |

The chatbot asks "how do I answer this?" The decision layer asks "what may safely happen next — and who has to check it?" For a first-time user with a legal problem, the second question is the product.

### 6.5 Phased roadmap (keeps every repo gate green)

1. **Phase 1 — Extract:** lift the decision out of `responseTurns.ts` objects into a `decide(state)` engine; turns become *renders of decisions*, not decision+copy fusions. `verify:demo` invariants extend to the engine (all 8 scenarios must produce identical decisions). No UI change, no gate violations, drift P0 gets a structural fix.
2. **Phase 2 — Formalize:** ship `DecisionRequest/DecisionResult` types + the scripted backend with documented thresholds; recompute TrustSignals from DemoContext on fact change (fixes G3); make FailureKind classification a real function (fixes G5).
3. **Phase 3 — Instrument:** make the audit trail real — every decision logged with rationale, policy version, and state hash. The spec/doc artifact: `docs/DECISION_LAYER.md`, including the Jev mapping and the confidence/evidence split.
4. **Phase 4 — (Optional, later) Provider seam:** a `DecisionBackend` adapter interface where a live classifier or Jev could plug in *without touching UI, contract, or gates*. Until then, live AI stays out — which is what keeps the prototype honest.
5. **Case-study reframing:** "from scripted trust to executable trust — the decision contract that made LokAI's honesty computable." One trust claim per section, per your own copy rules.

### 6.6 The case against adopting JEV directly (what a court, regulator, or skeptical engineer would say)

The strategy above survives only if it wins these six arguments — which is why the recommendation is the *contract*, not the vendor:

1. **No provenance, no defensibility.** CoCounsel's entire market position is "sources and reasoning so you can verify and defend your work." A JEV-style decision is a bare typed answer over caller-assembled state — nothing to cross-examine: no citation, no chain, no rationale. For litigation-adjacent use, a citation-grounded LLM answer can be *more* defensible than a faster, cheaper opaque classification. LokAI's answer: the Rationale field and claim ledger are mandatory parts of every DecisionResult — a decision without shown work is not deliverable.
2. **The state payload is confidential client data.** JEV "decides on exactly what you give it" — for legal triage that means matter facts, messages, and policy text leaving the perimeter to a weeks-old startup API. That implicates exactly the duties catalogued above (ABA 512 confidentiality; India's DPDP Act data practices). No data-residency, SOC 2, or enterprise posture from TypeSafe was verifiable this run. LokAI's scripted/zero-network backend isn't a limitation here — it's the privacy answer.
3. **Calibration is population-level; legal harm is matter-level.** TAR earned court acceptance because recall targets and elusion samples were measured *on the actual collection at hand*. JEV offers no per-matter validation protocol; a model calibrated on aggregate traffic can be systematically wrong on the novel long-tail matter — precisely where legal risk concentrates. Read correctly, TAR is a requirement the vendor does not meet, not just a comforting analogy.
4. **Auto-execution thresholds interact with UPL and deception law.** High-confidence auto-execution of legal *determinations* (rather than triage/routing) edges toward practice-of-law territory — and toward the FTC's DoNotPay deception theory if marketed as autonomous. LokAI's design keeps every high-risk action behind the review gate by construction (`human_required` tier; `draftAllowed: false` on stop tiers).
5. **The self-hosted contract is the safe default.** Every JEV primitive exists as open tech (routing, gating, typed outputs). The default recommendation for a legal product is to implement the decision contract on self-hosted, auditable components: data stays in-house, calibration can be tested on the product's own matter distribution, and there's no dependency on a weeks-old API. Adopting Jev the API must justify itself against that default — not the other way round.
6. **Org-level automation bias.** If a team believes "zero hallucinations," verification gates get quietly dropped — the Mata pattern at the organizational layer. The vendor headline is safest read as a description of output format (typed decisions, no invented prose), never as a safety claim to route product decisions on.

---

## 7. Risks, limits, and what I could not verify

- **All Jev economics are vendor-measured** (193.6x/444.6x, $42/B, "238x vs Claude Fable 5.1"); no independent benchmark exists yet, third-party retellings already drift across 40x–400x (evidence nobody outside the vendor has measured), and the total-cost story is input-price-only (output pricing uncaptured — the multipliers cannot be replicated or falsified from public data). The strategy is deliberately provider-agnostic so the bet survives if the numbers don't replicate.
- **"Zero Hallucinations" is marketing shorthand** — the same site asks "Can Jev Still Get Things Wrong?"; typed outputs reduce *prose* failure, not decision error. Miscalibrated confidence on a wrong triage is the Mata failure in new clothing; that's why evidence, not scores, faces the user.
- **State-builder bias:** a decision layer is only as trustworthy as the `DecisionState` projection; omitting an adverse fact yields a confident wrong routing. Your verification gate (user confirms facts) is the mitigation — keep it load-bearing.
- **Assumptions made:** (1) "JEV" = Jev by TypeSafe AI — confirmed via your links; (2) "Lokai in the legal space" = the LokAI repo as bound — confirmed on inspection; (3) deliverable = this report (markdown; the docx/GLM-Office pipeline wasn't available in this environment); (4) repo audit was done read-only and natively because ZCode was capacity-blocked all session.
- **Process note (transparency):** four of five research subagents failed on provider capacity errors, so dimensions 1–3 were researched and written directly by the coordinator with captured primary sources (browser) and ~20 searches. The fifth dispatch — an adversarial reviewer — completed successfully, found a real arithmetic slip (demo pair is ~171x cheaper, not ~121x), confirmed the zero-independent-benchmark finding via its own spot-checks (third-party multipliers drift 100x–400x; The Register is the lone independent press source), and demanded the missing legal counter-arguments now in §6.6 plus precision fixes (EU AI Act dual timelines; Mata "first" hedged; confidence-thresholds-vs-automation-bias reconciliation made explicit). All repairs were applied to this report before final delivery. Working-file confidence grades in `verify.md` distinguish multi-source, single-source, and vendor-claimed claims throughout.

---

## 8. Source register (key sources)

**Captured directly (browser):** typesafe.ai homepage (launch date, claims, FAQ headers, demo pair) · flaviocopes.com/jev (question-type schemas, API/SDK, "Where Jev breaks"; updated 2026-09-21) · Ricker post 2101343432929059319 (loop + "193x/444x in our tests") · Ricker article 2101292455391809670 (10-step guide, harness, compaction) · Codila post 2100984487802708306 (roadmap, SDK, ecosystem links).
**Search-verified (multi-source):** Mata v. Avianca, 678 F.Supp.3d 443 (SDNY 2023) · FTC/DoNotPay final order (ftc.gov, 2025-02-11) · ABA Formal Opinion 512 (americanbar.org, 2024) · EU AI Act Annex III (artificialintelligenceact.eu; original Aug 2, 2026 application vs Digital Omnibus Dec 2, 2027 proposal — regulation-ai.eu) · TAR guidelines (Duke Law; EDRM) · RouteLLM/FrugalGPT routing & cascade results (2025–2026) · Llama Guard 3 / NeMo Guardrails / Guardrails AI specs · LangChain Jev guide · Vals Legal AI Report (Harvey benchmarks) · Thomson Reuters CoCounsel "Fiduciary-Grade AI" positioning · The Register (independent press coverage of Jev/TypeSafe — identified by the adversarial review pass) · third-party multiplier drift: MindStudio (~100x), LangChain ("up to 200x faster, 400x lower cost"), DataCamp ("40–200x / 40–400x").
**File-evidenced (LokAI repo):** README.md · PRODUCT.md · PORTFOLIO-DIRECTION.md · AGENTS.md · src/app/data/responseTurns.ts · src/app/data/caseWorkflow.ts · src/app/data/matterIntelligence.ts · src/app/services/api.ts · src/app/demo/responseEngine.ts · src/app/context/DemoContext.tsx.
