# LokAI Repository Audit — AutoCoder verified (direct file inspection, 2026-09-21)

Repo: D:\portfolio porjects\Lokaifm-main (lokai-prototype v0.0.1). Evidence: file paths cited inline; all read this turn.

## 1. Product snapshot
Indian legal-AI **prototype** — "deterministic, fully visual prototype of an AI legal guide for a first-time user with a consumer-refund matter" (README.md). Portfolio flagship case study, explicitly "not a product". Scenario: Priya, damaged mixer grinder ₹8,999, seller refused replacement. Identity (PORTFOLIO-DIRECTION.md §1): "mobile-first legal-triage prototype for the first ten minutes of a legal problem in India… stops before advice it cannot safely own. …the trust study." Explicit honesty boundaries: **no live AI, no network, no OCR, no mic, no uploads** (README, PRODUCT.md, enforced by scripts/verify-demo.mjs).

## 2. Tech stack
Vite 6 + React 18 + TypeScript strict; Tailwind 4; react-router (hash router — required by portfolio iframe embed); motion; cmdk; sonner; phosphor-icons; Indic font packs (EN/HI/MR/TA). **No LLM SDK, no backend, no database.** package.json name: "lokai-prototype".

## 3. LLM integration map
- src/app/services/api.ts — "Deterministic compatibility adapter — routes through the prepared-turn library." `callLokAIDetailed()` = 280ms `setTimeout` → returns hand-authored ResponseTurn. Sarvam STT/TTS/OCR are stubs returning canned strings (DEMO_OCR_TEXT = BMC property-tax notice).
- AGENTS.md demo-integrity gates forbid in src/: `fetch(`, `getUserMedia`, `new MediaRecorder`, file inputs, `VITE_(NVIDIA|SARVAM)_API_KEY`. Vite dev proxies `/api/nvidia`, `/api/sarvam` exist but demo never calls them.
- Decision-relevant prompt fragments: none exist — there are no prompts.

## 4. Decision architecture today
**Fully scripted. Zero runtime decision engine.**
- src/app/data/responseTurns.ts (680 lines): 7 typed response modes (`clarify | explain | disclose | stop | confirm | progress | recover`); each turn is a hand-authored object with mode, emotionalIntent, citations, groundedClaims/totalClaims, draftAllowed, payload. Input routing (line ~567): `text.toLowerCase().includes(turn.trigger.toLowerCase())` or RegExp match — **substring matching is the intent router**.
- src/app/data/caseWorkflow.ts: 11-stage workflow (`intake→clarify→verify→triage→retrieve→assess→plan→packet→escalation→failure→audit`); typed trust vocabulary: TrustSignals{sourceCoverage, factCompleteness, jurisdictionClarity, riskLevel, draftStatus, groundedClaims, totalClaims} with comment "Inspectable claim coverage — never model confidence"; RiskLevel 3-tier (`self_service | review_recommended | human_required`); FailureKind 8-way taxonomy (`missing_facts, source_gap, conflicting_jurisdiction, ocr_unreadable, language_uncertain, model_timeout, out_of_scope, high_risk`); DraftStatus (`ai_draft | user_reviewed | ready_to_use`).
- Decision = typed enum selection whose preconditions are hand-authored per scenario. Structure: complete. Runtime intelligence: zero (by design).

## 5. State & persistence
In-memory React context only: src/app/context/DemoContext.tsx (matter store: facts, confirmFact/correctFact, runPreparedInput, draftAllowed). Canonical fact stores in data/caseWorkflow.ts (`getVerificationFacts()` / `getEvidenceLocker()` derive from them). 8 scenarios in data/demoScenarios.ts. No DB, no storage.

## 6. Product surface
Desktop: Home, Chat, Draft, Notice, Documents. Mobile (390px): Home, ConsumerCase, Files, NoticeInterpret, Onboarding, Profile, VoiceActive. Plus specimen gallery (/specimen/:id), dev catalog (/dev), GuardrailGallery, LegalTerms glossary, CommandPalette, SettingsPanel. 4 language packs.

## 7. Legal-domain specifics
Indian law, prepared excerpts: Consumer Protection Act 2019 (S 2(10) defect, S 35 complaint filing), RTI Act 2005 (S 7(1) 30-day, S 19(1) first appeal), Maharashtra Rent Control Act 1999 (deliberate source-gap example), Mumbai Municipal Corporation Act 1888 S 203 (OCR demo notice). Channel metaphors: 1915 helpline, e-Daakhil, registered post. Labels: "Illustrative · expert review pending"; citations carry `reviewLabel: 'Example — verify with a lawyer'`. "Legal information, not legal advice."

## 8. Drift & trust gaps (file-evidenced)
- **G1 Brittle intent routing:** substring `includes()` matching in responseTurns.ts (~L567). Repo's own audit P0 (PORTFOLIO-DIRECTION.md §3): "out-of-scope conversations answering as the consumer scenario" — i.e., drift already happened in practice. No fallback decision policy beyond hand-authored stops.
- **G2 Decision/copy fusion:** the decision (mode, stop reason, draftAllowed) is baked inside content objects. Adding one behavior = hand-writing full turn payload. No separable policy layer that computes mode from state.
- **G3 Static trust signals:** groundedClaims/totalClaims, riskLevel, sourceCoverage are literals per turn; nothing recomputes them from DemoContext fact changes. Verification gate "catch" exists only because scenarios script it.
- **G4 No uncertainty schema for runtime:** gate rightly forbids fabricated confidence ("no groundingScore, no percentage-confidence strings" — AGENTS.md), but no calibrated-uncertainty representation exists for when live AI arrives — except the claim-ratio pattern.
- **G5 Failure taxonomy is presentational:** 8 FailureKinds exist but no runtime classifier decides which applies to novel input; each stop is a prepared payload.
- **G6 Progress theater:** staged labels ("Checking the Consumer Protection Act, 2019") simulate work a live system would have to actually do; responseTurns.ts comment admits facts are "the USER's to confirm" — the working card "must not imply the model verified them".

## 9. Uncertainties
None material. Small repo, fully read (dist/, node_modules, attic/, .design-os skipped as non-decision-relevant).

## Bonus context — portfolio tension to respect
PORTFOLIO-DIRECTION.md §2: LokAI is deliberately NOT about "AI-depth flexing — that is Sentinel's job"; §3 out of scope: "Depth expansion into AI-plumbing storytelling (state machines, model contracts)". Case study needs: verification gates, "inspectable sources over confidence scores", refusal taxonomy, review-gated authorship. → The JEV layer must be framed as the *decision/trust* formalization, not AI theatre, to stay inside the portfolio's own rules.
