# LokAI — P2 Explainer, Market Position, and End-to-End Completeness Audit
Date: 2026-09-28 · Scope: P1/P2 mechanics, designer-craft assessment, market comparison, P2–P5 risk register, full-screen completeness audit, edge/failure-state matrix. Evidence basis: live repo inspection (2026-09-28, gates re-run: verify:demo PASS, typecheck 0, build 0), 4 web searches (refusal UX, DoNotPay/legal-AI market, India legal-aid chatbots, Claude constitution), plus the repo's own research corpus.

## 1. P2 — what the decision engine is, and who sees it

**How it works (spec of record: `decision-layer-research/reports/lokai-decision-layer-blueprint.md` Ch. Z):**
- `DecisionState` (matter facts + their confirm status, source support levels, classified intent, scene tier, policy version) is the ONLY thing the engine reads. "Evidence, not vibes."
- `decide(state)` runs an ordered gate cascade G1→G9, first resolution wins: G1 scene primary → G2 scope boundary → G3 high-risk → G4 contested record/conflict → G5 source coverage → G6 fact completeness → G7 content routing → G8 draft permission (computed) → G9 ledger verification (recomputed).
- Output: `DecisionOutcome` = which prepared turn renders + `Rationale` (gate, rule, machine-checkable because-list, one honest human line) + `DecisionReceipt` (deterministic hash id, policy version, outcome kind).

**Who sees it — both, in different registers:**
- **Backend:** the engine replaces substring routing in `DemoContext.runPreparedInput`; every input resolves through the cascade; receipts go into the audit trail (context `lastReceipt` + `addAuditEvent`).
- **User-visible (P3–P5):** "Why this response?" accordion on cards (receipt: what was read, which rule, what would change the outcome), the Decision Spine (receipt history panel/Sheet), risk chips (only when tier ≠ self_service), "why LokAI stopped" upgraded with the receipt. Design law (DECISION-INTERACTION): the user may see the pipeline working, its inputs, and its verdict — never a number standing in for any of them.
- **Current status: NOT wired.** `src/app/decision/` does not exist in the working tree; routing is still the committed substring matcher; no receipts are computed at runtime. This is the P2 gap — the docs are ahead of the code by design, but nothing in P3–P5 can ship honestly until this lands.

## 2. P1 — what actually changed (verified from diffs)
- Timing law in `responseEngine.ts`: flat 400ms → `STAGE_MS_BY_CLASS` (stop 240 / confirm+progress 300 / recover 700 / clarify 450 / explain+disclose 1050 ms per stage). Consequence-scaled, narrated, skippable, deterministic. Stops land fast ("a refusal that stalls reads as struggling to say no"); advice-class carries the full beat the CHI '26 data rewards.
- Visual direction "Vellum": display type → tight Hanken 800/700; Instrument Serif introduced as the LAW register (zone 1 + refusal sentence only); cream deepened to #F6F4EF; vellum mesh + grain background layer; glass chrome (floating chrome only) + double-bezel classes.
- New mobile components: FlashcardDeck (swipe/flip recap), MatterFolder (tap-driven 3D folder, real exhibits), ScanDocument (controlled scan beat) — copy-in MIT adaptations, provenance recorded in-file, reduced-motion handled.
- Chat cleanup: user bubble de-saturated, ambient thinking capsule, input-bar restyle. Deps: clsx + tailwind-merge + cn(), Instrument Serif. All gates green after changes.

## 3. Is this what product/UX designers actually do?
Yes — this corpus is senior product-designer practice beyond UI: opportunity framing (the unclaimed "seam" category), research-grounded interaction decisions (CHI '26 → timing law), design-of-record documents with rejected alternatives (D1–D10), explicit scope governance (non-goals), risk/rollback planning, gate-defined quality. Two honest gaps vs. real-world design leadership: (1) **primary user research** — everything so far is secondary research + self-audit; 3–5 moderated think-aloud sessions on the prepared scenario would add the one credibility layer the portfolio lacks; (2) **doc-code parity** — the portfolio claim is only as strong as P2 landing; until then the strongest docs describe a system the repo doesn't run yet.

## 4. Market comparison (web-verified 2026-09-28)
- **ChatGPT / Gemini / Claude:** refusals are polite prose with no path forward (arXiv 2506.06391: "a minimal response offers no context"); no typed stop states, no per-claim evidence ledgers, no receipts; citations (where present) are links, not an evidence class with review labels. Claude's constitution publicly frames refusals ("conscientious objector") but ships them as prose. None render a computed decision trail.
- **Legal-AI market:** DoNotPay ("world's first robot lawyer") = FTC order ($193k, deceptive AI-lawyer claims), Trustpilot 1.8 — the lawyer-substitution positioning is regulatory poison. Indian legal tech is lawyer-facing (Nyayanidhi etc.) or court-facing (Delhi HC WhatsApp bot); NALSA legal aid exists but has no consumer-grade triage UX.
- **What LokAI does differently in the legal space:** (1) info-not-advice as an architectural boundary, not a disclaimer; (2) the seam — deliver the defensible part, name the boundary, hand off (1915 / legal aid / lawyer) with the seam designed as a surface; (3) claim ledger over confidence scores; (4) deterministic predictable beats (a trust asset stochastic LLM products structurally cannot match); (5) refusal taxonomy as designed states (8 kinds, light+dark); (6) four-language honesty (packs, not translation claims). This is a defensible white space: consumer-first, trust-first, India-first legal triage.

## 5. P2–P5 risks & housekeeping
- **R1 (highest): P2 integration drift.** The preserved implementation must adapt to the CURRENT tree (Chat.tsx/DemoContext changed since the patch was made). Mitigation: apply `integration.patch` as reference, re-derive anchors; fixtures must assert the eight scenes byte-identically. Rollback: delete `src/app/decision/`, revert DemoContext — scripted turns still render.
- **R2: receipts without UI.** P2 alone changes no visible behavior — sequence P2→P3 quickly or the work looks invisible in review.
- **R3: card/Spine crowding.** Collapsed-by-default receipt accordions; risk chips only when tier ≠ self_service (alarm-fatigue rule already in the plan).
- **R4: contrast/ratchet regressions** from Vellum layering — the gates are the referee; run after every phase.
- **Housekeeping:** 4 `temp_ocr_*.png` + `ocr_worker.ps1` + `.zcode/` at repo root (move to attic/ or gitignore); ~482 uncommitted insertions across 23 files should land as phase commits while gates are green; demo-script ledger numbers (6/7→5/7) flagged in PRODUCT-JOURNEY §0.5 still need the fix before any live demo (real: 4/5, 2/3, 5/5).

## 6. End-to-end completeness audit (A→Z, all routes walked)
**Covered:** desktop dashboard/chat/notice/draft/documents; mobile onboarding/home/notice/voice/profile/case/:matterId/files; unsupported-matter boundary card (UNSUPPORTED_MATTERS); NotFound fallback (new); /dev + /specimen harness; 8 guardrail scenes; 4 language packs; Draft missing-facts panel with who-to-ask line; voice refuse-to-guess + text escape; clarify middle; recover scene.
**Gaps found (ranked):**
1. **No route-level error boundary:** zero `errorElement`/ErrorBoundary in the tree — any render throw = blank screen. One errorElement on the router root (LokAI-styled, with the recover message pattern) closes the last silent-failure class.
2. **`ocr_unreadable` and `language_uncertain` exist in the FailureKind taxonomy but render nowhere.** Notice has a single generic "paused" error; no unreadable-document state. Either render them (Notice: a designed "can't read this scan" card) or demote them in the taxonomy — dead vocabulary is drift in the opposite direction.
3. **Desktop has no language switcher** — the 4 packs are mobile-only in practice; desktop is EN-only. Either a compact switcher or an honest EN-only label on desktop.
4. **No desktop appearance/theme toggle** (P1 item, pending) — desktop dark mode exists in tokens but no user-facing switch.
5. **No help/"what LokAI is" surface** on desktop (boundary labels are inline only). A small "About this prototype" sheet would carry the honesty claims one place where reviewers look for them.
6. Minor: no conversation-rename/delete management (Sidebar lists only); profile is a static persona card (by design).

## 7. Edge & failure-state matrix (thinking + response + app)
| Failure | Taxonomy kind | Where rendered | Verdict |
|---|---|---|---|
| Missing/disputed fact blocks draft | missing_facts | Draft missing-facts panel; chat clarify; verify gate | Covered |
| Source gap | source_gap | chat disclose + scene | Covered |
| Conflicting rules/record | conflicting_jurisdiction | chat stop + scene + G4 | Covered |
| High-risk request | high_risk | dark stop + scene | Covered |
| Out of scope | out_of_scope | chat stop + unsupported-matter card + boundary-stop | Covered |
| Temporary failure | model_timeout | recover scene + chat recover | Covered |
| OCR unreadable | ocr_unreadable | — | **Not rendered** (gap #2) |
| Language uncertain | language_uncertain | — | **Not rendered** (gap #2) |
| Render crash | — | — | **No boundary** (gap #1) |
| Voice unclear | — | unclear phase + refuse-to-guess + text escape | Covered |
| Mic/permission request | — | never requested; honest label | Covered (by design) |
| Offline | — | prototype is fully offline | Non-state (strength) |
| Empty states (files/docs) | — | "nothing to read from it" lines | Covered |
| Rapid double-send / progress race | — | runPreparedInput guards via isProgressing; skip/replay deterministic | Covered |
| Determinism regression | — | verify-decision fixtures (when P2 lands) | Planned |

## 8. Next actions (ordered)
1. Land P2 (adapt preserved implementation to current tree; fixtures + receipt assertions in verify chain).
2. Add router-level errorElement (closes the blank-screen class).
3. Render or demote ocr_unreadable + language_uncertain.
4. Fix demo-script ledger numbers before any recording.
5. Desktop language switcher or EN-only label; desktop theme toggle.
6. Phase commits while gates are green; move dev artifacts to attic/.
7. 3–5 moderated usability sessions (the missing primary-research layer).
