# LokAI Redesign — Master Plan (mobile + desktop, quality upgrade to the 2026 bar)

**Status:** v1.0 draft, 2026-09-22 · **Target location:** `docs/REDESIGN-PLAN-2026-09.md` (LokAI repo)
**Read with:** `PRODUCT.md` (product contract) · `DESIGN.md` (design contract) · `AGENTS.md` (repo law + gates) · `docs/LLM_DESIGN_SYSTEM.md` (build sheet) · `docs/UPGRADE-2026-09.md` (Phases 1–8 decision log) · `docs/NEXT-GOALS-2026-09-15.md` (sweep goals) · `decision-layer-research/reports/` (JEV research + decision-layer blueprint) · `design-reports/` (skills audit, component study, interaction concepts)

---

## 0. What this plan is

This is the working plan for the **LokAI quality redesign**: the combined upgrade that takes the
prototype from "refined prototype" to "2026-market-competitive product artifact" on BOTH
platforms, by wiring the decision layer into the interface, adopting the selected external
components, and closing every visual-craft gap the audits found. It documents the reasoning, the
evidence, the decisions (with rejected alternatives), the phase order, the gates, and the
rollback path — so that any future session (human or agent) can execute without re-deriving.

**Two goals, one plan:**

1. **Product thinking made visible** — the decision layer (state → decision → action →
   verification) becomes an inspectable part of the interface: typed response cards, receipts,
   the Decision Spine, the ask-first composer. Not backend plumbing.
2. **Visual craft at the 2026 bar** — every FAIL and PARTIAL from the 35-criterion skills audit
   closes; OKLCH color pipeline; dark-mode parity on both platforms; press physics; the polish
   band (text-wrap, smoothing, scroll-margin, stagger cadence).

**Explicit non-goals** (decisions, not oversights): no live AI, no network, no new product
surface beyond what PRODUCT.md licenses; no Trust-Transit metaphor in the UI; no Matter-Trail
primary navigation; no branching/regenerate UI (determinism conflicts); no percentage confidence
anywhere (the ledger is the honest instrument — argued, not hidden).

---

## 1. Evidence base (why this plan, in one table)

| Input | What it proved | Where |
|---|---|---|
| Skills audit (35 criteria × 2 platforms) | Mobile 20 PASS / 8 PARTIAL / 4 FAIL · Desktop 19 / 8 / 4 / 4 N-A. The FAILs are concrete: C-10 press physics, C-17 desktop dark mode, C-18 OKLCH, C-27 scroll-margin, C-30 mobile-native hardening | `design-reports/LokAI-Design-Audit-2026.html` |
| 18-source component study | 14 components selected in 3 tiers; licenses verified (AI Elements Apache-2.0, BoardUI/interior.dev/Spell MIT, transitions.dev custom-free); copy-in model fits the ownership doctrine | `design-reports/LokAI-Component-Report-2026.html` |
| Interaction concepts + adversarial review | Flagship hybrid validated: typed response cards + ask-first composer + one shared receipt surface; kill list adopted | `design-reports/interaction-concepts/` |
| JEV research + decision-layer blueprint | The trust vocabulary exists (7 modes, 8 stops, ledger, gates); the blueprint (DecisionState/Outcome/Receipt, G1–G9/L1–L9) is the executable spec; preserved implementation + integration.patch exist | `decision-layer-research/` |
| 2026 market benchmark (40 sources) | Trust surfaces + visible decision governance = the differentiator; dark mode, a11y, motion-restraint are hygiene | `design-reports/audit-artifacts/subagent_02.md` |
| PDF pattern mining (44 patterns) | The Spine's loop is canonical-but-invisible everywhere else — permanent visibility is the defensible novelty; confirmation copy must state consequences; "Boundary & Fallback Map" is the industry term | `design-reports/interaction-concepts/pdf-patterns.md` |
| White-vs-cream study | Keep cream as brand; premium white as purpose surface (stop states, draft paper); rollback = one token re-point | `design-reports/component-research/` |

---

## 2. The plan in one paragraph

Wire the decision engine into the prototype first (P2), then make its outputs visible
(P3–P5), closing the audit's craft debt in parallel-first (P1) and the color-pipeline/craft
polish after (P6), importing components only where they beat hand-building (P7), and verifying +
capturing for the case study last (P8). Craft debt lands FIRST because new interaction must not
ship on broken affordances (14px composer — under the 16px iOS anti-zoom floor, 32px icon buttons, no press physics). The engine lands
BEFORE the cards because receipts must be computed, never authored — shipping cards without the
engine would be trust theater, the one failure this product cannot survive.

---

## 3. Phases (the plan of record)

### P0 — Contract baseline ✅ (already done)
Evidence exists: the 13-screenshot capture set, both audit scorecards, the component study, the
concept review. **No work remains**; this phase is the reference point for "before."

### P1 — Craft debt pass (the audit FAILs) · ~1.5 days
Order inside the phase: composer 16px (kills iOS focus-zoom) → icon-btn 40px (desktop Chat) →
`:active` press scale 0.97 with MOTION.press → safe-area insets + tap-highlight removal → 100vh→dvh
→ toast ease-in fix (Chat.tsx:40) → stagger 60→40ms → scroll-margin-top → localStorage theme
persist + desktop theme toggle (hoist appearance out of MobileShell).
**Why first:** new interaction (P3–P5) must not ship on failing affordances; the ask-first composer
otherwise ships new UX on a 14px textarea (`Turn.tsx:1051` uses `TYPE.body.size` = 0.875rem; corrected 2026-09-27 from an earlier "12px" figure — the 16px fix target is unchanged).
**Gate traps:** press-scale must live in shared.tsx system classes (ratchet-safe); theme hoist must
not break MobileShell behavior (verify dark gate still parses both themes).

### P2 — Decision engine wiring · ~2 days
Integrate the preserved implementation (`decision-layer-research/implementation/`: types.ts,
engine.ts, fixtures.ts, receipts.ts) into `src/app/decision/`, apply `integration.patch` as the
starting point, adapt to current file layout. Every scripted turn in `responseTurns.ts` gains a
computed DecisionReceipt (gate, rule, because-lines) — the engine is the source; the scripted turns
become renders. `verify-demo.mjs` extension: **every turn must carry a receipt whose gate/rule
resolve against the G1–G9 cascade**; drift fixture (out-of-scope input) must produce
stop(out_of_scope), proving the P0 bug class is dead by construction.
**Why before P3:** receipts are the content of the new cards; authoring them by hand would
rebuild the scripted-trust problem the blueprint exists to kill.
**Rejected alternative:** build cards first with mock receipts "to see it" — rejected because
mock receipts are exactly the trust theater the JEV research (I8) forbids.

### P3 — Typed response cards · ~2 days
`Turn.tsx` gains a formal zone-0 header: mode chip (all turns, typeStyle micro), risk chip
(only when tier ≠ self_service), and a gated ledger footer (only when groundedClaims > 0 —
no dead chrome on clarify/stop turns). "Why this response?" is a quiet text-tap opening the
receipt accordion (collapsed by default — the PDFs' inspectable-reasoning pattern; AI Elements
`reasoning` is the reference anatomy, re-implemented with LokAI tokens, not imported wholesale).
Card densities: compact (clarify/confirm/progress) vs full (explain/disclose/stop).
**Gate traps:** one-primary-CTA law — receipt tap is a text affordance, never a button style;
ratchet — header/footer styles go through system components only.

### P4 — Ask-first composer + Hold-to-Confirm · ~1.5 days
Composer: on typed input, one-line echo strip above the textarea ("Understood as: consumer
refund ✓ · 2 facts confirmed, 1 missing") — inline, not a modal; confirmation morph appears ONLY
when L1 classification is ambiguous (chips pass through untouched — the PDFs' free-form-input
pattern preserved). Composer text 16px, 44px targets, press physics ride along (closes P1's
composer debt inside the component that owns it). Hold-to-Confirm on draft submission: 900ms
hold, consequence-stating copy ("If you file this reply, the fee is ₹X and the deadline is Y" —
the PDF-mined pattern), spinner-to-check completion, keyboard hold fallback on desktop.
**Why merged into one phase:** both are composer-area interactions sharing the same fixed
affordances; doing them separately means touching the same file twice under gate review.

### P5 — The Decision Spine (receipt surface) · ~2 days
One component, two docks: desktop = collapsible right panel inside DesktopShell (auto-opens on
explain/stop turns); mobile = bottom Sheet via the existing Sheet primitive (drag handle,
collapsed by default, badge-counted receipts). Renders DecisionReceipt[] from DemoContext —
single source of truth, never mirrored state (the form-chat bidirectionality law). History view =
agent-log-style rows (blur-in 160ms, 40ms stagger). Live-recompute beat: flipping a fact re-runs
the engine; the Spine shows gate L6 clearing and the risk tier changing. Failure/Recovery are
visible states, never skipped.
**Gate traps:** contrast gate must pass for Spine surfaces in BOTH themes; collapsed-by-default
keeps the one-primary-CTA law intact on every screen.

### P6 — Visual craft to the 2026 bar · ~2 days
OKLCH migration of all `--role-*` values (with hex fallback lines; the contrast gate is the
referee — it must stay green unmodified). Dark-mode parity pass on BOTH platforms (desktop now
has a toggle from P1). `text-wrap: balance` on display roles + font smoothing. Premium-white
focus surfaces per the study recommendation: stop states and Draft paper adopt the white token
set (`--role-*` re-point per surface, cream stays the brand ground) — shadows strengthen one step
on white surfaces (the contact-shadow doctrine needs it). Entrance polish from the transitions.dev
free set re-mapped to MOTION tokens (thinking-states, spinner-to-check), ported into MOTION_CSS so
the system owns them.
**Gate traps:** OKLCH conversion must be verified per-token against the contrast gate's parsed
values (any drift = gate red = fix before commit); white surfaces must pass the same 4.5:1/3:1 bars.

### P7 — Component imports (only where they beat hand-building) · ~1 day
AI Elements `inline-citation` + `sources` reskinned to `T.attest`/`T.attestFill` for the ledger
chips (Apache-2.0 NOTICE preserved in-tree); BoardUI `agent-thinking` replaces TurnStatus
internals behind its existing API (call sites unchanged); Spell UI `copy-button` +
`animated-checkbox` behaviors re-implemented (mode-appropriate: copy on Draft, checkbox morph on
fact confirmations). Everything enters as copied source under `src/app/` — no new runtime
dependencies.
**Why last:** components decorate a working system; importing earlier would couple the phases to
external code structure before the engine contract settles.
**Rejected alternative:** npm dependencies for any of these — rejected by the ownership doctrine
and supply-chain rule in the component report §8.

### P8 — Verification + case-study capture · ~1 day
Full gate suite green (`verify:demo && typecheck && build`) with the new receipt assertions;
fresh 13-screenshot set (both platforms, both themes) replacing the P0 baseline; a dated
`docs/AUDIT-2026-09-XX.md` written (what changed, gate evidence, before/after metrics: ratchet
numbers, PASS counts); case-study sections drafted per blueprint Chapter Y §Y.2 with the
90-second demo script as the hero embed; capture set added to `design-reports/`.
**Done when:** every audit FAIL is closed with file:line evidence; the demo script runs end-to-end
on both platforms in both themes; the case-study sections survive the one-trust-claim-per-section rule.

---

## 4. Key decisions (made, with reasoning and alternatives)

| # | Decision | Reasoning | Rejected alternative |
|---|---|---|---|
| D1 | Engine before cards (P2→P3) | Receipts must be computed; authored receipts = trust theater (JEV I8) | Cards-first with mock receipts — faster demo, dishonest artifact |
| D2 | Craft debt first (P1) | New interaction on failing affordances fails review in 30 seconds | Interleave with P3 — splits composer work into two gate reviews |
| D3 | Copy-in components, no npm deps (P7) | Ownership doctrine + supply-chain rule + gates stay authoritative | npm packages — faster but locks upgrades, moves code outside gate reach |
| D4 | Spine reads DemoContext, one component two docks (P5) | Form-chat bidirectionality law: never mirror state | Separate desktop/mobile implementations — double maintenance, drift risk |
| D5 | Premium white as purpose surface only (P6) | Cream is the brand identity (C-34 PASS); white where clinical calm serves comprehension | Full white re-theme — kills differentiation, breaks contact-shadow logic |
| D6 | OKLCH with the existing gate as referee (P6) | Perceptual pipeline + mechanical verification already in place | sRGB forever — audit FAIL stands; or new color tooling — scope creep |
| D7 | Receipt accordion collapsed by default (P3) | Inspectable ≠ in-your-face; PDFs' canonical pattern | Always-open receipts — buries answers under machinery (challenger's attack) |
| D8 | Ask-first fires only on ambiguity (P4) | Unconditional confirmation taxes every turn (challenger) | Confirm-always — friction without trust payoff |
| D9 | Hold-to-Confirm with consequence copy (P4) | PDF-mined pattern; weighty irreversible actions get deliberate friction | Simple confirm button — under-weights the filing moment |
| D10 | Risk chip only when tier ≠ self_service (P3) | Alarm fatigue (challenger); 3-tier routing implies calm low-risk turns | Always-on chip — noise kills signal |

---

## 5. Verification plan (how we know it worked)

1. **Gates:** `npm run verify:demo && npm run typecheck && npm run build` after every phase;
   the receipt assertions (P2) and contrast gate are the hard referees.
2. **Ratchet:** `ui-debt.mjs` raw-style counts must fall or hold per phase — never rise.
3. **Audit re-run:** the 35-criterion matrix re-scored at P8; every prior FAIL must show file:line
   evidence of closure; PASS counts target ≥ 25/35 per platform with zero FAILs.
4. **Visual set:** 13 fresh screenshots (7 mobile + 6 desktop, light+dark for the surfaces that
   have dark) compared against the P0 baseline; the Spine and cards captured in the live-recompute
   moment.
5. **Demo script:** the 90-second four-beat run executed manually on both platforms; every beat
   produces its receipt on screen.
6. **Case-study conformance:** one trust claim per section (Y.2 rule); no capability beyond
   PRODUCT.md; every claim backed by a repo artifact.

## 6. Risks & rollback

| Risk | Likelihood | Mitigation | Rollback |
|---|---|---|---|
| Engine integration breaks scripted invariants | Med | P2 keeps turns as renders; verify-demo assertions added before UI work | Revert `src/app/decision/` + patch; scripted turns still render |
| OKLCH drift fails contrast gate | Med | Convert one token at a time; gate run after each | Per-token revert (values are independent CSS vars) |
| Spine crowds mobile screens | Med | Collapsed default + Sheet; auto-open only on explain/stop | Disable auto-open; Sheet stays manual |
| Component reskin looks imported | Low | All styling through T.*/LAYOUT./MOTION.; specimen entry per component | Delete copied source; hand-built fallbacks already exist (P3–P5 ship first) |
| Press-scale fights reduced-motion | Low | Scale is transform — collapses under the global reduced-motion block by design | None needed (correct behavior) |
| Scope creep into full redesign | Med | This document is the scope; additions require a D-decision row here | n/a (process control) |

**Rollback philosophy:** every phase lands as an independent commit; `git revert` of one phase
must not break another (engine decoupled from cards via the receipt contract; components decoupled
by copy-in ownership).

## 7. Effort summary

| Phase | Effort | Cumulative |
|---|---|---|
| P0 baseline | done | 0 |
| P1 craft debt | ~1.5 d | 1.5 d |
| P2 engine wiring | ~2 d | 3.5 d |
| P3 response cards | ~2 d | 5.5 d |
| P4 composer + hold | ~1.5 d | 7 d |
| P5 Decision Spine | ~2 d | 9 d |
| P6 craft to 2026 bar | ~2 d | 11 d |
| P7 component imports | ~1 d | 12 d |
| P8 verify + capture | ~1 d | 13 d |

**Weekend-cut** (if only 2 days): P1 + P3 (cards read existing receipts — temporarily labeled as
scripted in the specimen gallery only, never in the demo flow) + P8-lite.
**Two-week-cut:** the full plan as sequenced.

### Review incorporation (adversarial pass, 2026-09-22)

The plan-review pass (full verdict: `docs/REDESIGN-PLAN-REVIEW.md`) approved with changes, all
adopted into the phases above:

1. **P1 re-scoped** — composer items (16px / targets / press) moved into P4 so Turn.tsx gets ONE
   gate-review cycle, not two. P1 = non-composer debt.
2. **Receipt assertions specified** (P2) — they check gate/rule RESOLVE against G1–G9 with
   non-empty because-lines, never prose equality (too strict fails scripted turns; too loose lets
   authored receipts pass).
3. **P3 additions** — aria-live announcement contract for receipts (extend the existing aria
   pattern, 80 hits); card densities may ship full-first with compact as a follow-up.
4. **P4 absorbs the composer debt** — one file, one review; Hold-to-Confirm REPLACES the primary
   submit (one-CTA law preserved) and must be documented in LLM_DESIGN_SYSTEM.md.
5. **P5 constraint** — auto-open desktop-only; the mobile Sheet never covers the composer
   (composerClearance token respected).
6. **P6 ordering fixed** — OKLCH → white surfaces → transitions.dev port (port is first cut if
   pressed); white-surface shadow strengthening is part of the phase, not an afterthought.
7. **P7 hard cap** — copy-button + inline-citation + agent-thinking only; animated-checkbox cut
   (LokAI Switch already ARIA-correct).
8. **Definition of done, every phase** — new UI strings land in all 4 language packs; P8 requires
   before/after per-criterion numbers with file:line evidence, not a checklist.

Effort after review: **90–98 h (~12 working days)**; weekend cut P1 + P4 + P8-lite (~30 h).
The review also added three missing items now tracked here: aria-live receipt contract (P3),
touch-hold fallback audit on real mobile (P8 manual pass), 4-language DoD (all phases).
