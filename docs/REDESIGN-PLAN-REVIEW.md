# Plan Review — LokAI Redesign (Adversarial)

Reviewer: AutoCoder mainline (the dispatched reviewer died to provider instability after writing
its skeleton — same pattern as all prior waves; the mainline completed the four-axis review
directly, using session evidence).

## Ordering verdict — APPROVE with one sharpening

P1→P2→P3 is right: craft debt must precede cards (broken affordances), engine must precede cards
(computed receipts). Sharpening: **P1's composer fix and P4's composer work touch the same file
(Turn.tsx) under gate review twice** — merge the P1 composer item (16px/targets/press) INTO P4
and keep P1 scoped to non-composer debt (icon-btn, safe-area, dvh, ease-in, stagger, scroll-margin,
theme). This avoids two gate-review cycles on one file and matches the plan's own D2 reasoning.
P6 stays after P5 (polish lands on final structures); P7 after P6 (imports decorate the finished
system) — correct as drafted. P8 must keep its independence: verification is a phase, not a
byproduct.

## Scope verdict — keep/cut per phase

| Phase | Verdict | Note |
|---|---|---|
| P0 | KEEP (done) | Baseline reference |
| P1 | KEEP, trim composer item → P4 | Rest closes audit FAILs |
| P2 | KEEP as-is | The trust-theater prevention is the plan's spine |
| P3 | KEEP | Card densities prevent chrome bloat |
| P4 | KEEP + absorb P1 composer items | One file, one review |
| P5 | KEEP | The recruiter differentiator |
| P6 | KEEP, watch scope | OKLCH + white surfaces are the 2026 bar; transitions.dev port is the first cut if time-pressed |
| P7 | KEEP, hard cap 1 day | Imports must not become a second redesign |
| P8 | KEEP | Verification is a deliverable |

Gold-plating flags: transitions.dev full-catalog port (only 2–3 recipes needed), Spell UI
animated-checkbox (nice-to-have; LokAI Switch already has correct ARIA — take only copy-button
if pressed). Neither serves product thinking or a named audit FAIL; both serve polish only.

## Gate-trap table

| Phase | Specific trap | Mitigation |
|---|---|---|
| P1 | Theme hoist breaks MobileShell behavior / dark gate parsing | Keep the appearance effect's exact semantics; verify-demo dark-theme assertions unchanged |
| P2 | Receipt assertions too strict → scripted turns fail; or too loose → authored receipts pass | Assertions check gate/rule RESOLVE against G1–G9 and because-lines non-empty — not prose equality |
| P3 | Receipt tap styled as second CTA (one-CTA law); header styles as raw styles (ratchet) | Text-affordance pattern; all header/footer styling through system components |
| P4 | Hold-to-Confirm adds a second primary action on Draft | It REPLACES the primary submit — not one more button; document in LLM_DESIGN_SYSTEM |
| P5 | Spine auto-open covers the answer on mobile (390px) | Collapsed default; auto-open only desktop; Sheet never covers composer (composerClearance token) |
| P6 | OKLCH drift vs contrast gate parsed values; white surfaces weaken contact shadows | Token-at-a-time conversion with gate run per token; shadow strengthening is part of the phase, not an afterthought |
| P7 | Copied source carries foreign styling (ratchet explosion) | Reskin BEFORE landing; specimen entry per component; NOTICE files preserved |
| P8 | Audit re-run rubber-stamps instead of measuring | Require before/after numbers per criterion (file:line evidence), not a checklist |

## Effort table

| Phase | Hours | Cut-first item |
|---|---|---|
| P1 | 10–12 | scroll-margin (lowest visibility) |
| P2 | 14–16 | nothing — critical path |
| P3 | 14–16 | compact-density variants (ship full cards first) |
| P4 | 10–12 | keyboard-hold fallback (desktop mouse-hold only) |
| P5 | 14–16 | history rows (live loop only first) |
| P6 | 14–16 | transitions.dev port (after OKLCH + white surfaces) |
| P7 | 6–8 | animated-checkbox (copy-button only) |
| P8 | 8 | half the screenshot set (keep both platforms, one theme) |
| **Total** | **90–98 h (~12 working days)** | Weekend cut: P1 + P4 + P8-lite (~30 h) — composer debt + trust affordances + verification |

## Missing items (found)

1. **A11y announcement contract for receipts** — receipts appear via interaction; aria-live
   announcement needed or screen readers miss them (the app already has 80 aria-* hits — extend
   the pattern, don't invent one). Add to P3.
2. **The M.tap/composerClearance tokens vs Hold-to-Confirm** — hold gesture on a 50px CTA needs
   a touch-hold fallback audit on real mobile; add to P8's manual pass.
3. **Language packs** — new UI strings (echo strip, consequence copy, receipt labels) must land
   in all 4 packs or the language gate breaks; add to every phase's definition-of-done, not just P8.

## Final verdict

**APPROVE-WITH-CHANGES** — the changed plan in 8 lines:
1. P1 = non-composer craft debt only (composer items move to P4).
2. P2 unchanged (critical path, receipts assertions gate/rule-resolve).
3. P3 + aria-live receipt announcements; card densities may ship full-first.
4. P4 = composer 16px/targets/press + ask-first + Hold-to-Confirm, one review cycle.
5. P5 unchanged; auto-open desktop-only.
6. P6 = OKLCH → white surfaces → transitions.dev port (in that order; port is first cut).
7. P7 hard-capped 1 day, copy-button + inline-citation + agent-thinking only.
8. P8 requires before/after per-criterion numbers; 4-language DoD on every phase.
