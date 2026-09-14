# Build Audit — LokAI, 2026-09-14

**Scope:** independent re-audit of the current working tree (the "Senior-Craft Restraint" upgrade applied), mobile + desktop, code + live render. Supersedes nothing; complements `REVIEW-UPGRADE-PLAN-2026-09-10.md`.
**Infra note:** the product-designer subagent failed (600s idle timeout, then provider errors on retry); the audit was executed directly. Same methodology.

## Gates (current tree)

| Gate | Result |
|---|---|
| `npm run verify:demo` | PASS — 10/10 (incl. WCAG AA both themes, ratchet) |
| `npm run typecheck` | PASS — 0 errors |
| `npm run build` | PASS — 1m48s. Warning: main chunk 1,447 kB (gzip 272 kB) |

## Live measurements

**Mobile home, empty state (390×844, embed):**
- Rendered text: 3 sizes (14/24/31 — the 31 is the LogoMark glyph), 2 weights (400/500), 3 colours. **The empty state is now genuinely restrained.**
- Radii in view: 8px, 15px (LogoMark's `size×0.28` — off-scale, why 15px appears), 999px, 50%.
- **Chips: `background: var(--role-sunken)`, border 0px.** Light: sunken = `#FFFFFF` on ground `#FAF8F5` = **1.06:1**. Dark: sunken `#0A1422` on ground `#0E1A2B` = **1.06:1**. In both themes the home's three primary entry points have no perceptible boundary. **P0 persists.**
- Touch targets: chips 39px high; composer buttons 38×38. `M.tap = 44px` is defined in the system but not enforced on either.

**Desktop dashboard (1280×720):**
- Rendered: **11 font sizes** (10, 11, 12, 14, 16, 18, 20, 23, 24, 26, 76px), **7 weights** (300, 400, 500, 560, 650, **700**), **9 text colours**.
- No horizontal overflow, no page scroll. Layout is sound; the density is exactly what the upgrade removed from mobile.

## Findings

### P0 — Chip affordance (unchanged from 09-10 review)
`MobileHome.tsx:365` (`background: T.sunken`, border none). 1.06:1 fill in both themes; the chips' text is `inkQuiet`, so there is no weight/underline signal either. Fix: a dedicated `--role-chip` tint (≈5–8% ink over ground in light, lifted navy in dark) at ≥1.2:1 perceptible + a firm hairline fallback, or restore the hairline. Re-measure, don't eyeball.

### P1 — The upgrade never touched desktop
The plan's own claim was *repo-wide*: "Strike 700 repo-wide", radii consolidated, scale ≤4 steps. Desktop still carries 11 sizes / 7 weights / 9 colours; `fontWeight: 700` remains in `CaptureLayout.tsx:48,101`, `Notice.tsx:261`, `.demo-disclosure` (`index.css:440`). `--radius-xs: 4px` and `LAYOUT.radius.xs` are still live (used at `MobileHome.tsx:95,252`, `VoiceOrb`, `:focus-visible`), and the chat bubble is still `border-radius: 18px 18px 4px 18px` (`index.css:392`). The system is now **two-tier**: restrained mobile, unrestrained desktop. A recruiter who expands the embed to desktop (the modal exists) sees the contradiction immediately.

### P1 — Composer still contradicts the repo's own laws
`index.css:362-369`: border **and** float shadow **and** `backdrop-filter: blur(24px)` — against `shared.tsx`'s "a surface gets a border OR a shadow, never both" and against the do-not-add-glassmorphism list. Control count is attach + voice + send (plan said attach + send). In-chat suggestion chips (`Turn.tsx:897`) still use the old `1px solid C.border` + white fill, so chips look different inside chat vs on home.

### P2 — Motion budget
`lokaiMarkBreathe` animates `box-shadow` (repaint) and runs permanently on every LogoMark instance. Should be state-bound (generation only) or compositor-only (opacity/transform).

### P2 — Raw 404
Unknown routes (e.g. `#/desktop/home`) render React Router's default "Unexpected Application Error!" page. For a portfolio piece whose whole pitch is craft, the error route should carry the design system.

### P2 — Build chunk warning
1.45 MB main chunk. Harmless for the demo, but the console warning is visible to anyone who opens devtools, and devtools is where senior reviewers look.

## What's genuinely good

- The empty-state composition (mark + 24px greeting + 1 quiet line + 3 pills + one quiet door + composer) is now at senior density on mobile.
- Ink ladder holds in both themes; contrast gate enforces it.
- Thinking capsule replaced the checklist correctly; `stages` remains only as `aria-live` sequencing.
- Composer geometry (pill, detached, layered shadow) reads as a hero object.
- Attach-sheet flow added to mobile home without violating the no-file-input gate.
- Layout integrity on desktop: no overflow, no forced scroll at 1280.

## Verdict

**B / ship-ready for the mobile embed, not ready for the desktop story.** The mobile hero screen now does what the plan claimed. But the plan's claims were scoped "repo-wide" and delivered mobile-only: desktop is the same over-specified build it was before, the P0 chip regression stands, and the composer violates two of the repo's own laws. The gap between the plan's status line and the tree is now itself a credibility risk if anyone opens devtools or clicks the desktop demo.

**Minimum to close:** chip fill ≥ perceptible (P0) → strike desktop's 700s and 10px floor + collapse its scale (P1) → composer: drop the glass, pick border-or-shadow (P1). ~1–2 hours of work, all measured, not felt.
