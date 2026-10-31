# Run Plan — JEV × Lokai Trust & Decision-Making Research

Task: Heavy research on TypeSafe AI's "Jev" (System One decision model) + audit of Lokai repo
(D:\portfolio porjects\Lokaifm-main) → produce a strategy report: how Jev-style decision
engineering can give Lokai (legal space) a non-drifting, trust-building decision layer, and how
that differentiates Lokai from generic LLM chatbots (ChatGPT/Gemini pattern) as a portfolio piece.

Primary user sources:
- https://x.com/0xRicker/status/2101343432929059319 (loop: state → decision → action → verification; 193x faster, 444x cheaper claim)
- https://x.com/0xRicker/status/2101292455391809670 (article: "Jev Engineering: The 10-Step Guide to Giving Your Agents a Decision Brain"; 3 question types; harness router+gate; compaction as relevance filter; $0.042/M input; 255 options)
- https://x.com/0xCodila/status/2100984487802708306 (article: "Jev Engineering: Full 10-Step Roadmap"; SDK typesafe-sdk; Playground; Browser Use menu rebuild; saved handoffs)

Run dir: C:\Users\rudra\.openclaw-autoclaw\agents\auto-coder\workspace\.cluster\jev-lokai\

## Subtasks (dependency graph)
1. [dive_01] JEV mechanics researcher — how Jev actually works: question types, state design,
   confidence, batching, harness, pricing/perf claims, SDK, official docs. ≥10 searches. → dive_01.md
2. [dive_02] JEV ecosystem & skepticism researcher — independent coverage, criticism, prior art
   (routers, structured outputs, DSPy, cascades), what's novel vs rebranding. ≥10 searches. → dive_02.md
3. [dive_03] Legal AI trust researcher — how legal AI products (Harvey, Spellbook, Luminance,
   CoCounsel, Lexis/Westlaw) build determinism/auditability; UPL/ABA/EU AI Act constraints;
   guardrail & drift patterns. ≥10 searches. → dive_03.md
4. [lokai_audit] Lokai repo audit (ZCode, read-only) — product snapshot, LLM call map, decision
   architecture, state, drift/trust gaps. → lokai_audit.md (saved by orchestrator)
5. [round B] Cross-checker (verify JEV numbers/claims across ≥2 sources) + Red-team
   (attack the JEV→legal mapping; when would it fail/harm). → verify notes
6. [orchestrator] verify.md (4-tier confidence + contradictions) + insight.md (≥5 cross-dimensional insights)
7. [round C] Chapter writers (1 writer per chapter, N≥5) → final.md assembled under DELIVERY/.
   Format: markdown report (docx/GLM-Office unavailable in this env — state downgrade at delivery).

Dependencies: 1-4 parallel → 5 after 1-4 → 6 after 5 → 7 after 6.

## Review items
- RESOLVED 2026-09-21 (updated after adversarial reviewer returned): review_agent.md produced; its repairs were applied to the
  final report — arithmetic fix (demo pair ~171x not ~121x), multiplier-drift caveats (40x–400x third-party spread) on every
  economics claim, The Register added as lone independent press source, EU AI Act dual-timeline fix (original Aug 2 2026 vs
  Digital Omnibus Dec 2 2027), Mata "first" hedged to "landmark/most-cited", new §6.6 case-against-adoption (provenance/
  defensibility, state-payload confidentiality vs ABA512/DPDP, per-matter calibration gap vs TAR, UPL/auto-execution
  interaction, self-hosted-contract default, org-level automation bias), explicit reconciliation: adopt the gate-and-escalate
  contract, never surface raw probabilities to users, never market hallucination-freedom.
- JEV perf/pricing claims cross-checked: CONFIRMED — no independent benchmark exists; all economics graded Low-Medium/vendor-claimed.
- Lokai audit claims cite file paths: done (lokai_audit.md).
- Disagreements preserved: C1–C6; promoter hyperbole (Codila) explicitly discounted.
- Evidence states separated: observed (browser-captured verbatim) vs candidate (snippet-level) vs vendor-claimed.
- Residual gaps (accepted, documented): flaviocopes "Where Jev breaks" body only partially captured; output-token pricing
  uncaptured; TypeSafe company details unverified; single-capturer bias on browser captures (noted by reviewer).

## Round 2 (2026-09-21, user redirect)
User goal clarified: do NOT integrate Jev or mention it in Lokai's story. Adopt the *decision-engineering pattern* as
Lokai's own product thinking; deepen the case study with a real decision system + guardrails, demonstrable in the
prototype. Deliverable: publish-ready system-design blueprint (case-study facing, vendor-free).
Subtasks:
7. [guardrails_chapter] Guardrail system designer (subagent) → guardrails_chapter.md (L0..L8 stack, traceability, invariants)
8. [narrative_chapter] Case-study narrative designer (subagent) → narrative_chapter.md (story spine, section map, talking points, naming)
9. [decision_engine_chapter] Orchestrator → decision_engine_chapter.md (types, gate cascade G1..G9, repo wiring, gates, phases) — DONE
10. [assemble] Orchestrator reviews both chapters, repairs, assembles DELIVERY/lokai-decision-layer-blueprint.md
Review: vendor-name leak check (no Jev/TypeSafe/System One), rule precision check, one-trust-claim-per-section check,
file-path truthfulness check against audit.
