# LokAI Interaction Concepts — Adversarial Review

Reviewer: Concept Challenger · 2026-09-22 · Evidence base: 7 response modes, 8-way stop taxonomy, 3-tier risk routing, claim ledger (groundedClaims/totalClaims), verification gate, 3-zone Turn layout, DecisionReceipts (gate+rule+because), repo law (token system, no raw hex, no fabricated confidence, one primary CTA, 390/1440, EN/HI+MR/TA), prior audit (composer 12px, small icon-btn, missing press-physics).

## A. Response Cards, not bubbles — SHIP-WITH-FIXES
**Attacks**
1. Chrome beats content at 390px: mode label + risk chip + ledger footer + receipt affordance × 3 scripts can outweigh a one-line answer. Clarify/stop turns carry no claims — their ledger footer is dead weight.
2. A receipt affordance on every card is a second CTA and directly fights the one-primary-CTA law.
3. Risk chip on every turn = alarm fatigue; 3-tier routing already implies low-risk turns should stay calm.
**Fixes** Chrome scales with content: ledger footer only when groundedClaims > 0; risk chip only at medium/high tier; receipt affordance is a quiet footer text-tap, never a button.

## B. Decision Layer as visible spine — SHIP-WITH-FIXES
**Attacks**
1. A persistent live "state→decision→action→verification" loop is engineer-speak; a stressed first-timer sees machinery watching them, not help — trust machinery can bury the answer.
2. Persistent right rail has no home at 390px; a bottom-sheet fights the composer and keyboard (composer already flagged at 12px).
3. A "live loop" invites a parallel state store; DecisionReceipts already exist in the blueprint — duplication is waste.
**Fixes** Collapsed by default with a receipt-count badge; plain-language bilingual stage labels; render from the single DemoContext DecisionState — desktop rail and mobile sheet are one component, two docks.

## C. Guided Matter Trail — WEAK
**Attacks**
1. Inverts the primary metaphor: the brief says keep chatbot familiarity, yet a stressed first-timer lands on a workflow map before any answer.
2. Highest lift, least payoff: chat-as-annotation inverts the DemoContext turn stream and needs turn→caseWorkflow anchoring — the biggest build of the six for skim-level differentiation.
3. PM-tool optics: a 2–3 min skim reads project tracker, not legal-AI guide.
**Fix** Demote to a numbered stage breadcrumb rendered only inside progress-mode cards (that mode already exists) — orientation value at ~5% of the cost.

## D. Ask-First Composer — STRONG
**Attacks**
1. Unconditional confirm-before-send doubles interaction cost — a friction tax on every message.
2. "What the engine understood" flirts with the no-fabricated-confidence law if it shows scores; the classifier is deterministic — show matched facts + classified mode, never a number.
3. Touching the composer without clearing audit debt (12px text, small icon-btn, missing press-physics) ships new interaction on broken affordances.
**Fixes** Ambiguity-gated: clear intents pass through with a one-line "understood as…" echo; confirm is an inline composer morph (not a modal) with one primary "Confirm send"; fix 16px text, 44px targets, press-physics in the same pass.

## E. Trust Transit — WEAK
**Attacks**
1. Tonal mismatch: the 8-way stop taxonomy includes grave stops (out-of-scope, needs-a-lawyer); rendering a refusal as a cute "station" trivializes the system's most serious moment.
2. Zero component mapping: nothing in Turn.tsx / responseTurns.ts / caseWorkflow.ts wants transit visuals — it's a reskin, and a thematic palette invites raw-hex violations outside system files, a direct repo-law fight.
3. Double learning burden (chatbot + metaphor) and skim reads "theme," not system — the classic gimmick signal.
**Fix** Kill the skin. Transit language survives only in the case-study write-up, never in UI.

## F. Split-Surface Verdicts — SHIP-WITH-FIXES
**Attacks**
1. "Permanent companion surface" is fiction at 390px — the enforced mobile reality must be designed first or the 1440px story is decoration.
2. Empty state: clarify/stop/progress turns carry no ledger; a permanently docked empty panel is apologetic dead weight.
3. "Never scroll-locked" = two scroll containers plus keyboard-aware mobile behavior — untested, and the audit already flagged composer-area problems.
**Fixes** Mobile = drag-handle bottom sheet (same receipt surface as B — build once); desktop = docked panel collapsed until a receipt opens; a designed empty state that reinforces determinism ("This step makes no factual claims — nothing to verify").

## RANKING
1. **D** — highest trust-per-interaction, keeps the most familiar frame (the composer), and extends the existing verification gate + DecisionReceipt types almost for free.
2. **A** — makes the 7-mode system legible at skim distance; nearly free inside the existing 3-zone Turn layout.
3. **B** — the one genuinely recruiter-differentiating systems story — but only collapsed-by-default and in plain language.

## KILL LIST
- E as UI entirely (keep as portfolio narrative only).
- C as primary navigation (keep only the progress-mode breadcrumb).
- B's "persistent/live" framing (collapsed on-demand instead).
- A's per-card receipt button and always-on risk chip.

## HYBRID SUGGESTION (flagship demo)
Typed Response Cards (A, chrome-gated) + ambiguity-gated Ask-First Composer (D) + one shared receipt surface (B+F): every card footer exposes its DecisionReceipt — docked panel at 1440px, bottom sheet at 390px, with the Decision Spine as that surface's history view. Demo thesis: "the AI never moves without a receipt you can read." C survives as a breadcrumb in progress cards; E survives only as story language.
