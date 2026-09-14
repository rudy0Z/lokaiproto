# PORTFOLIO-DIRECTION.md — LokAI

> **What this doc is:** the portfolio-level direction for this product, written into the repo so every future session knows what LokAI *finally is*, what scope it serves, and what the portfolio case study needs from it.
> **Status:** v1 — 2026-09-14. Product authority inside this repo remains `PRODUCT.md` (contract, boundaries) and `AGENTS.md` ("portfolio flagship case study, not a product") for identity. Build state: `docs/UPGRADE-2026-09.md` (Phases 1–8 mobile complete 2026-09-04; desktop Phase 7 committed 2026-09-06) — note `docs/HANDOFF.md` is stale at 2026-09-04 and predates the desktop work. Strategy authority is `D:\Portfolio\POSITIONING.md`.
> **Reads with:** `D:\Portfolio\case-study-copy\lokai-copy-v4.md` (the copy this repo must be able to back) and this repo's own `docs/CASE-STUDY.md` (how the case study was written, v1→v3 reasoning + embed map).

---

## 1. What LokAI finally is

A **mobile-first legal-triage prototype for the first ten minutes of a legal problem in India**: it classifies the matter, asks the one question that changes the answer, verifies the facts, shows the law behind its findings, and **stops before advice it cannot safely own**. It is fully visual and deterministic — no live AI, OCR, speech, network, or payments — and that honesty is a feature, not a gap.

**The one-line portfolio identity:** *the trust study — how an AI product earns trust in a market that can least afford a mistake.*

## 2. Its role in the portfolio (POSITIONING.md §1)

| Question | Answer |
| --- | --- |
| Which layer of the AI-product problem? | **Trust.** |
| Role in the lineup | **The trust study** — straight points, strong visuals, ~2–3 min read. Deliberately the *sharpest*, not the *deepest*. |
| What it must prove | Judgment: verification gates, inspectable sources over confidence scores, refusal taxonomy, review-gated authorship, honest multilingual handling — safety design for a sensitive market. |
| What it is deliberately NOT about | AI-depth flexing (Sentinel's job) or business/market design (Feul's job). No new AI capability theatre, no economics features. |

## 3. Scope — what this repo is for now

**In scope (first-class):**
- **Close the open P0s from `docs/AUDIT-2026-09-10.md`** (desktop chat cold-start renders empty; out-of-scope conversations answering as the consumer scenario) and land the uncommitted in-flight pass (~35 files, gated green, uncommitted — commit-risk).
- **Specimen/embed integrity:** the case study's proof layer depends on stable specimen URLs (`/specimen/:id`, `?label=0`) and `/mobile/*` routes matching the embed map in the copy draft. Any route or behavior change must be reflected in the copy doc's embed map in the same session.
- Gates staying green: `verify:demo` (contrast, both themes), typecheck, build; the raw-style ratchet (now ~390 lines) only falls.
- **Desktop/mobile coherence:** desktop Phase 7 exists (committed 2026-09-06). The case-study copy v4 must make the mobile-first claim consciously — either show one desktop artifact deliberately (range) or keep the mobile-first framing and treat desktop as bonus chrome. No new desktop scope beyond what Phase 7 shipped.
- Chip affordance regression flagged in `docs/REVIEW-UPGRADE-PLAN-2026-09-10.md` (1.06:1) — fix under the contrast gate.

**Out of scope:**
- Depth expansion into AI-plumbing storytelling (state machines, model contracts) — that is Sentinel's territory.
- Business/market features, payments, lawyer-marketplace anything (also forbidden by `PRODUCT.md` boundaries).
- New languages beyond the four prepared packs; no live-translation claims.

## 4. What the portfolio case study needs from this repo

1. **The trust artifacts, reachable and labeled:** verification gate, claim ledger/source line, the 8-way stop taxonomy (light **and** dark for `high_risk`), review-gated packet, voice editable-before-commit + refuse-to-guess, NoticeInterpret in-chat with clause correspondence.
2. **Honest labels everywhere:** `Illustrative · expert review pending`, prepared-pack flags, no-mic-permission lines — the case study's boundary line quotes these behaviors.
3. **Captures match the copy:** the mixer-grinder scenario (not "defective phone"), EN/HI/MR/TA packs, the audit-line provenance receipt. If a screen's copy changes, check the case-study quotes against it (CASE_STUDIES §12.1 rule).

## 5. Alignment rules for future sessions

- On conflict: `PRODUCT.md` (boundaries) → `AGENTS.md` (identity/gates) → `docs/UPGRADE-2026-09.md` + `docs/MOBILE_AI_SYSTEM.md` (build truth; HANDOFF is stale) → this doc → everything else.
- The copy draft (`lokai-copy-v4.md`) holds this study to **one trust claim per section**; when adding or changing screens, ask "which trust claim does this carry?" — if none, it is out of portfolio scope.
- Keep the current voice: plain declarative lines over aphorisms; captions are concrete observations. The portfolio deliberately reads LokAI *straighter* than Sentinel.
