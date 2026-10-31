# 04 · INTERACTION — the decision pipeline

*Source of truth. Condenses and supersedes `docs/DECISION-INTERACTION-2026-09.md`, `design-reports/interaction-concepts/star-interaction.md`, and `decision-layer-research/reports/lokai-decision-layer-blueprint.md` (archive).*

---

## The one sentence

Every turn is a **typed decision that ships with a readable receipt** — classified before it is
answered, paced for a stressed reader, and re-derived live from state you can flip.

## The visible pipeline (five states, every turn)

| State | The user sees | Law it obeys |
|---|---|---|
| **S0 · Echo** (G1) | "Understood as: consumer refund ✓ · 2 facts confirmed · 1 missing" — silent when clear, inline confirm only on ambiguity | V6, D8 |
| **S1 · Working** (G2–G6) | Gate-labeled stage line ("Checking what your question covers → Matching the law to your facts") + skip; collapses to the **gate trail**: `Scope ✓ · Grounding ✓ · Facts ✓ — 4 of 5 sourced ▸` | V2, V5, V6 |
| **S2 · Answered** (G7) | Three zones — *what the rule means* (serif + citation chips) / *how it applies here* (fact anchor) / *what you can do next* (consequence line). Optional 4th zone "What this doesn't cover" appears only when the ledger is short | L3, L4, V4 |
| **S3 · Seamed** (stop / disclose / recover) | One plain sentence · **what is preserved** · what is still available · the human path as primary · tonal inversion | L6, L8 |
| **S4 · Receipt** | "Why this response?" (quiet text-tap) → gate · rule · because-chips (tap = fact/source) · humanLine · policy version. Collapsed by default; user-latch after first manual toggle | V4, V6 |

Plus **S5 · The Spine** (P5): receipt history across turns — desktop panel / mobile sheet, one
component, live recompute when a fact flips.

## The engine contract (P2 — the one open build dependency)

`decide(state) → DecisionOutcome + DecisionReceipt`. Gates G1–G9, ordered, first-fail-wins:
intent → scope → high-risk → jurisdiction → source coverage → fact completeness → risk tier →
draft gate → output verification. Total (no "no match" path — the fallback is a designed stop),
pure (byte-identical replay), separable (a model can fill the same contract later).

**The drift bug is live until P2 ships:** the substring router (`responseTurns.ts:569`) answered
an out-of-scope rent question with the confident consumer explanation — demonstrated on camera
2026-09-27. That demo pair (before/after) is the case study's origin story.

## The timing law (CHI '26, n=240 — verified from full text)

Identical answers at ~2s read less thoughtful than 9s (M=5.76 vs 6.09, p=.008); 20s adds nothing
and triggers reliability doubt. The law: **delay must be earned, narrated, consequence-scaled,
and predictable** — and skippable, per the paper's own ethics prescription. LokAI's determinism
makes the rhythm identical every time, which almost no LLM product can promise.

## The receipt is falsifiable; prose is not

Chain-of-thought explanations are often unfaithful and don't calibrate. A receipt names the gate
that fired — the user can check it. **Provenance, never confidence:** no percentage anywhere.
`4 of 5 sourced` is checkable; `80%` is theater.

## Voice (same pipeline, tighter clock)

~1s voice tolerance → narrated spoken backchannels at stage boundaries; the transcript is the
echo (partial vs committed, editable before commit); voice enters at S0 like typing; the unclear
path refuses to guess and always offers the text escape. Waveform renders from scripted data —
never `getUserMedia`.

## Multilingual (the pipeline is a language surface)

Stage labels, gate trail, receipt labels, stop copies, echo — all four packs (EN/HI/MR/TA).
No gradient-clip shimmer on Indic (opacity only). The gate-trail chips are visual, not lexical,
so the compact line survives every script. CHI's sample is US-only — admit it in the case study.
