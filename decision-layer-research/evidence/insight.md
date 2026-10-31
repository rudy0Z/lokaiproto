# Insight — cross-dimensional synthesis (JEV × Legal-AI trust × LokAI repo audit)

Genre: product-strategy research report (strategic/executable insights first).

## I1 — The separation thesis (confidence: HIGH)
**Claim:** Jev Engineering's core contribution is not a model but an architectural separation: *an LLM creates the work; a typed decision layer decides what happens next; code executes it.* Each part exists separately (structured outputs, routers, guardrails — dive_02); Jev's move is making the decision layer a first-class, cheap, millisecond component.
**Cross-dims:** dive_01 (mechanics) × dive_02 (prior art) × lokai_audit (G2 decision/copy fusion).
**Boundary:** if the "non-autoregressive" claim is mostly marketing, the discipline still stands — the contract is the innovation.
**Implication:** LokAI can adopt the discipline with zero vendor dependency: any cheap classifier/router (or scripted rules today) behind a typed decision interface. That sidesteps the unverified vendor economics entirely.

## I2 — LokAI's paradox: scripted trust is the correct SPEC but the wrong IMPLEMENTATION (confidence: HIGH)
**Claim:** LokAI's design law ("never model confidence", claim-ratios, stop taxonomy, verification gate) is exactly the trust grammar a legal decision layer needs — but it is hand-authored per turn. The trust *vocabulary* is done; the *engine* that computes it is missing. JEV's loop is the missing engine's spec: state (DemoContext facts) → decision (mode + risk + stop kind) → action (turn payload) → verification (claim ledger recompute).
**Cross-dims:** lokai_audit G1-G6 × dive_01 loop × dive_03 TAR/ABA review duties.
**Boundary:** the engine must never show numeric confidence (G4, C2) — compute, don't display.
**Implication:** the case-study story upgrades from "we scripted trustworthy behavior" to "we specify trustworthy behavior as an executable decision contract" — stronger for recruiters, still 100% inside portfolio scope.

## I3 — Determinism and drift are opposely priced (confidence: HIGH)
**Claim:** Drift in legal AI comes from free-text decisions (the ChatGPT pattern: every answer is prose, so every answer can hallucinate scope). Typed decisions bound the failure space: a Choice over {explain, clarify, disclose, stop...} cannot "hallucinate" an answer mode. But typed layers are brittle to novel inputs (C4); the legal answer is three-tier risk routing — self_service / review_recommended / human_required — which LokAI already types (caseWorkflow.ts RiskLevel).
**Cross-dims:** dive_01 (typed decisions) × dive_03 (TAR gates, ABA supervision) × lokai_audit (G1 substring drift — the P0 bug was precisely a routing failure).
**Boundary:** typed layers need an explicit "none of the above → escalate" option or they hallucinate by silence.
**Implication:** LokAI's P0 drift bug becomes a feature story: "our decision layer's first job is refusing to decide" — the escalate path is the product.

## I4 — Confidence belongs to the engine; evidence belongs to the user (confidence: HIGH, design-resolved contradiction C2)
**Claim:** JEV's act/escalate thresholds ("confidence >= 0.85") are for software; claim-ratios ("6 of 7 claims grounded") are for humans. Legal UX research (verbal > numeric confidence) and LokAI's own gate converge: never show a user "0.92". Show what was grounded, what was checked, what is missing — then act or stop.
**Cross-dims:** dive_01 (calibrated confidence) × dive_03 (uxui-confidence, automation bias) × lokai_audit (TrustSignals).
**Boundary:** thresholds need published calibration to be defensible; without it, thresholds are policy choices, not math — document them as such.
**Implication:** the LokAI JEV-layer spec: decisions carry internal confidence driving thresholds; UI carries only inspectable claim ledgers. This resolves the contradiction instead of hiding it.

## I5 — The regulatory direction of travel rewards decision layers (confidence: MEDIUM-HIGH)
**Claim:** Every legal-AI trust signal in the wild is a decision-governance signal: verifiable citations (CoCounsel), supervised review (ABA 512), audit trails (EU AI Act high-risk obligations), measurable gate quality (TAR recall), deceptive-claim liability (FTC/DoNotPay). A product whose every AI action is a logged typed decision with shown sources is *pre-compliant by architecture* — the audit trail falls out of the JEV loop for free (state→decision→action→verification is inherently loggable).
**Cross-dims:** dive_03 (all) × dive_01 (loop, harness gate) × lokai_audit (AuditEvent type already exists).
**Boundary:** EU AI Act's justice scope may not cover consumer legal-info tools; claiming "compliance" would itself be a deceptive claim (FTC lesson). Frame as "alignment with the direction of regulation", not compliance.
**Implication:** for the portfolio: "auditability as architecture, not feature" — recruiters in legal-tech/fintech read that fluently.

## I6 — The chatbot-vs-decision-layer frame differentiates LokAI from ChatGPT/Gemini pattern (confidence: HIGH)
**Claim:** Generic chatbots sell prose; the JEV pattern sells *decisions with receipts*. LokAI's differentiation should not be "a better chatbot" but "a product that is mostly a decision layer with a chat interface bolted on": every turn is mode-typed, source-inspectable, stop-capable, and audit-logged; prose appears only inside explain/disclose payloads.
**Cross-dims:** dive_01 ("not a chatbot") × lokai_audit (7 response modes already exist) × dive_03 (CoCounsel positioning).
**Boundary:** prose still matters for explainability; the claim is about where authority sits, not eliminating language.
**Implication:** case-study headline candidate: "LokAI doesn't chat about your legal problem; it decides what may safely happen next — and shows its work."

## I7 — Economics: the defensible claim is latency+cost of decisions, not model superiority (confidence: MEDIUM)
**Claim:** Vendor numbers (193x/444x/238x) are category comparisons (decision call vs LLM call) and unreplicated (C3, C5). The safely claimable version: decision-layer calls are milliseconds and fractions of a cent regardless of provider; the architectural saving is not calling a frontier LLM to route, gate, or triage at all.
**Cross-dims:** dive_01 economics × dive_02 prior art (RouteLLM 95%@85% etc.) × lokai_audit (LokAI is offline prototype — economics N/A today but design-relevant).
**Boundary:** if Jev's calibration claims fail independent tests, the cost story still holds for ANY decision-layer implementation (scripted, classifier, or Jev).
**Implication:** the report recommends a provider-agnostic decision contract; Jev is the catalyst, not a dependency. For a portfolio prototype with zero live AI, this is the honest framing.

## I8 — What NOT to build (adversarial insight, confidence: MEDIUM)
**Claim:** The wrong move is bolting a live "confidence score" UI onto LokAI or claiming Jev integration LokAI doesn't have. That violates LokAI's own gates (no fabricated confidence; no capability beyond boundary; PORTFOLIO-DIRECTION scope rules) and the FTC's deceptive-claims lesson. The right deliverable is a decision-contract SPEC + a scripted decision-engine skeleton that computes the existing trust vocabulary from state — demonstrably deterministic, still zero-network.
**Cross-dims:** lokai_audit (gates, G4) × dive_03 (FTC) × dive_01 (typed decisions).
**Boundary:** if the user later wants live AI, the same contract accepts a real classifier without UI changes.
**Implication:** strategy section should ship a concrete phased plan: (1) extract decision policy from responseTurns.ts into an engine; (2) define DecisionRequest/DecisionResult types; (3) implement scripted evaluator with act/escalate thresholds; (4) document the JEV mapping; (5) leave provider adapter as the only live-AI seam.
