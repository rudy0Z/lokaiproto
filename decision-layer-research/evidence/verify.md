# Verify — 4-tier confidence grading + contradictions (orchestrator cross-check, 2026-09-21)

Inputs: dive_01.md (JEV mechanics), dive_02.md (prior art/skepticism), dive_03.md (legal trust), lokai_audit.md (repo audit). All claims graded on: source count × independence × verbatim availability.

## High confidence (multi-source, consistent, primary or verbatim-captured)
1. Jev launched Sept 15, 2026, by TypeSafe AI as "System One" decision model; positions itself opposite chat LLMs. [typesafe-home, flaviocopes, ricker-x]
2. Contract: structured state in → typed answers out (noul/choice/score) with confidence/probabilities. [flaviocopes verbatim schemas; ricker-article; typesafe-home "Decisions, Not Strings"]
3. Canonical loop: state → decision → action → verification → next state; LLM generates, Jev decides, code executes. [ricker-x verbatim; ricker-article]
4. Harness pattern: model router + gate, neither generates text. [ricker-article verbatim]
5. LokAI repo has zero runtime decision engine; all decisions hand-scripted; substring trigger matching is the intent router. [lokai_audit, file evidence responseTurns.ts L567, services/api.ts]
6. LokAI already owns a rich typed trust vocabulary: 7 response modes, 8-way FailureKind, 3-tier RiskLevel, groundedClaims/totalClaims with explicit "never model confidence" rule (AGENTS.md gate). [lokai_audit, file evidence]
7. Legal-AI failure precedents: Mata v. Avianca sanctions (2023, $5k, fabricated citations); FTC v DoNotPay order (2025-02, $193k, deceptive "AI lawyer" claims). [mata-avianca multi-source; ftc.gov primary]
8. ABA Formal Opinion 512 establishes competence/confidentiality/supervision duties for GenAI in law practice (2024). [aba-512 multi-source]
9. EU AI Act Annex III includes administration of justice as high-risk; Annex III compliance lands Dec 2, 2027. [euaiact-annex3 multi-source]
10. TAR/e-discovery = court-validated precedent for statistically-gated machine decisions (recall targets + elusion sampling). [tar-guidelines Duke/EDRM]
11. Prior art for every Jev primitive exists: routing (RouteLLM/FrugalGPT 50-98% savings), classifier gates (Llama Guard safe/unsafe + category), structured-output validators (Guardrails AI 50-200ms). [dive_02 sources]

## Medium confidence (single strong source or snippet-verbatim)
12. Jev API surface: POST api.typesafe.ai/v1/systemone; Node/Python/Vercel SDKs; model ids jev-latest/jev-1.13.0. [flaviocopes browser capture]
13. LangChain published a Jev integration guide (ecosystem traction is real). [langchain-jev snippet]
14. CoCounsel "Fiduciary-Grade AI" positioning + citation-verification workflow. [thomsonreuters snippets]
15. Verbal confidence ("Very Likely" not "87%") outperforms numeric confidence for trust in UX research. [uxui-confidence, single secondary source]
16. India has no settled AI-legal-tech regulatory regime; CPA 2019 not AI-specific; DPDP 2023 shapes data practices. [india-cpa-ai, dpdp snippets — academic/secondary]

## Low confidence / vendor-claimed (carry as claims, never as facts)
17. "193.6x faster, 444.6x cheaper" — vendor tests, scoped to "System One Tasks"; Ricker's "in our tests" repeats it. No independent benchmark found.
18. "$42 per billion input tokens; 238x lower input price than Claude Fable 5.1" — vendor homepage. Note internal tension: homepage FAQ shows Jev $0.042/M (same number, different unit framing: $42/B = $0.042/M — consistent, just ambiguous).
19. "Zero Hallucinations" — marketing headline; same site FAQ asks "Can Jev Still Get Things Wrong?" — treat as "typed outputs with confidence estimates", not an accuracy guarantee.
20. "Calibrated Confidence" via RLVR/RLCD — plausible (RLVR literature) but no published calibration data found.
21. Codila's "Internet moment"/"stack for 2028" — promoter hyperbole, zero evidentiary weight.

## Contradictions & tensions (preserved, not flattened)
- C1: "Zero Hallucinations" (typesafe-home) vs "Can Jev Still Get Things Wrong?" (same FAQ list) — vendor self-tension; report must use the careful framing.
- C2: JEV's confidence scores vs LokAI's gate "no fabricated confidence — no groundingScore, no percentage-confidence strings" (AGENTS.md). A naive Jev port would violate LokAI's own enforced design law. Resolution path (insight): keep confidence in the ENGINE (thresholds), show claim-ratios to the USER.
- C3: Vendor economics (238x vs Claude) compare different job categories (decision call vs LLM call) — category advantage, not model-vs-model superiority; deep-report must state this.
- C4: Deterministic decision layer (trust) vs long-tail legal fact patterns (novelty) — the brittleness trade-off; TAR precedent + escalation tiers is the reconciliation.
- C5: Ricker claims "193x/444x" while homepage demo pair shows ~121x/~75x — different workloads; both vendor-side; cite ranges with scope, not single numbers.
- C6: Portfolio direction says AI-plumbing depth is out of LokAI scope ("that is Sentinel's job") while user wants decision-layer storytelling — must be resolved in strategy: frame as TRUST architecture (in scope), not AI architecture.

## Evidence gaps
- G1: No independent benchmark of Jev speed/cost/calibration (searched; none surfaced yet — product is 6 days old).
- G2: TypeSafe AI company details (founders, funding) not verified this run.
- G3: FAQ answer bodies (determinism question, limitations) not captured (collapsed on homepage).
- G4: flaviocopes "Where Jev breaks" full body not captured (outline only).
- G5: No India-specific UPL/AI enforcement case found (regime may simply not exist yet — absence noted, not proven).
