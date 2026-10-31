# LokAI — Visual Direction 2026: "Vellum" (the premium material upgrade)

**Date:** 2026-09-28 · **Status:** working direction (owner-initiated 2026-09-28: "match the 2026
design level of the market") · **Companion artifact:** `design-reports/visual-direction-2026/specimen.html`
(live before/after, light+dark) · **Amends:** `REDESIGN-PLAN-2026-09.md` P6 direction; supersedes the
white-vs-cream study's "cream is the brand ground" conclusion by owner decision. Does NOT touch the
trust thesis — ledger, gates, stops, registers are meaning, this is material.

**What changed in the market:** flat warm-cream + editorial serif + hairline boxes read as the
2023 "tasteful startup" look. The 2026 premium product surface (Linear, Ramp, Mercury, Arc, Perplexity
mobile) is **layered translucency with light**: mesh-gradient grounds, fixed film grain, glass islands
on floating chrome only, double-bezel nesting on objects, diffused multi-layer elevation, tight
grotesk display, and serif demoted to a deliberate *register voice* rather than the ambient tone.

---

## 1. The diagnosis (why the current build reads dated)

1. **One flat ground.** `#FAF8F5` everywhere, no depth cues between ground and content — screens read
   as a document, not a place. Depth is the single biggest differentiator of the 2026 look.
2. **Fraunces carries too much surface.** The editorial serif is the *page voice* (titles, greeting,
   answer zone 1) when the thesis only needs it to be the *law voice*. Serif-as-ambient = editorial
   blog; serif-as-register = deliberate and modern.
3. **Boxes, not objects.** Hairline-bordered cards sit flat; nothing has machined depth (no inner
   highlights, no bezel nesting, no material difference between chrome and content).
4. **Ghost hierarchy.** Low-contrast caps headers (verified in the 2026-09-27 walkthrough) read as
   washed-out, not quiet.
5. **Motion is correct but generic.** Default ease-out everywhere; no custom curves, no asymmetric
   enter/exit, no stagger discipline.

## 2. The direction — three moves

### Move 1 · Ground becomes material: mesh + grain ("vellum")

The flat cream is replaced by a **layered ground**, expressed as ONE new token so no screen ever
touches it (ratchet-safe; call sites keep reading `T.ground`):

```css
/* added to the role layer — consumed via a fixed, pointer-events-none layer
   inside <Screen>; never on scrolling containers (GPU guardrail) */
--role-ground-mesh:
  radial-gradient(120% 90% at 85% -10%, rgba(226,122,36,0.07), transparent 55%),
  radial-gradient(100% 80% at -10% 110%, rgba(11,27,50,0.06), transparent 60%);
--role-ground-grain: url("data:image/svg+xml,…feTurbulence…"); /* 2.5% opacity */
```

- Light: warm off-white `#F6F4EF` base + saffron breath (top-right) + navy breath (bottom-left) +
  2.5% grain. Same brand hues, now with light *inside* them.
- Dark (`data-theme="dark"`): the existing navy-black `#0E1A2B` keeps its hue, gains an indigo/saffron
  glow pair at 6–8% + 3.5% grain — "paper under a desk lamp" becomes literal: light pools on the desk.
- Grain and mesh live on a **fixed pseudo-element inside the screen frame** — never on scrolling
  content (mobile GPU repaint guardrail), static, no animation (determinism + battery + reduced-motion).
- OKLCH re-point (P6) applies to the new values with hex fallbacks; the WCAG gate referees both themes.

### Move 2 · Type: display goes grotesk-tight; serif becomes the law register

| Role | Current | 2026 direction |
|---|---|---|
| Screen/page titles, greeting | Fraunces (editorial) | **UI sans at 700, tracking −0.02em, leading 1.1** — confident product voice |
| Answer zone 1 · refusal sentence (the law speaking) | Fraunces | **Instrument Serif** (self-hostable via @fontsource; modern high-contrast, documentary-italic energy) at 22–26px — the serif becomes *rare on purpose*, so when it appears it means "the law is speaking" |
| Body / UI | Hanken Grotesk 400–700 | **stays** (already non-generic, warm, harmonizes with Noto; swapping body fonts is churn without gain). Composer/body moves 14 → **15px**, composer input → **16px** (closes the iOS zoom debt) |
| Indic display | Indic leads with sans, sized up | **unchanged and now stronger**: with titles on sans, Latin and Indic share ONE display treatment — the code-switch harmony argument (§2.1) gets simpler, not harder |
| Mono | JetBrains Mono | stays (evidence metadata) |
| Numerals | mixed | **tabular-nums on ledger, receipt, timers** (the pipeline surfaces are numeric) |

The "editorial vibe" the owner flagged lives almost entirely in Fraunces-as-title + flat cream.
Demoting the serif to one register (and swapping its cut) kills the vibe while *keeping* the
typography thesis that wins the case study: registers you can hear.

### Move 3 · Objects get machined depth (the component material)

- **Double-bezel nesting** for discrete objects (VerificationGate, EvidenceLocker, DemandNoticePaper,
  source cards): outer shell = 4% tint fill + hairline + `p:6px` + radius 28; inner core = surface +
  `inset 0 1px 0 rgba(255,255,255,0.65)` top highlight + radius 22 (concentric). Reads as hardware,
  not boxes.
- **Glass islands** for floating chrome only — composer, bottom sheets, drawer, top bar:
  `rgba(253,252,250,0.78)` + `backdrop-blur(24px)` + hairline. **Never** on scrolling content (GPU
  repaint rule). Dark: `rgba(255,255,255,0.06)` + blur.
- **Elevation re-tuned** (three layers, warm): `0 1px 2px rgba(20,18,12,.05), 0 4px 12px rgba(20,18,12,.04),
  0 16px 40px rgba(20,18,12,.07)` — diffused, never dark/harsh. Inner highlights do the "premium" work,
  shadows only anchor.
- **Hairlines** stay translucent (already `rgba(22,21,19,.08)`) but gain a warm tint variant for
  hairlines-on-tint. Ghost caps headers (walkthrough finding #6) are re-pointed to `--role-ink-faint`
  minimums that pass AA.
- **Icons:** chrome/system icons move to Phosphor **Light** weight at ≥20px (Regular below) —
  ultra-light strokes are the 2026 tell; `ICON_WEIGHT` is already a token, so this is a one-line
  re-point with a size rule.
- **Primary CTA:** navy pill with `inset 0 1px 0 rgba(255,255,255,0.12)` highlight + soft layered
  shadow; press scale 0.97 (already shipped). Trailing icon lives in a nested circular chip
  (button-in-button) on the two hero CTAs ("Prepare demand notice →").

### Motion (Emil layer — applies to everything above)

- Custom curves repo-wide via MOTION tokens: enter `cubic-bezier(0.23,1,0.32,1)`; sheet/drawer
  `cubic-bezier(0.32,0.72,0,1)`; exits at ~60% of enter duration (asymmetric: fast release).
- Stagger 40ms (current 60→40 plan item confirmed); theme switch crossfades get a 2px blur bridge;
  hover animations gated behind `(hover:hover) and (pointer:fine)`.
- No new animated surfaces: mesh/grain static; springs only for drag/sheet physics.

## 3. The clean premium workflow (5 commits, gate-green at each)

| Step | Commit | What lands | Referee |
|---|---|---|---|
| 1 | `tokens: vellum material layer` | New `--role-ground-mesh/-grain`, re-pointed ground/hairline/elevation values, OKLCH pass, glass + double-bezel utility classes in `shared.tsx` (system files only) | contrast gate (both themes) · ratchet |
| 2 | `type: register split` | Instrument Serif loaded (self-hosted), display roles re-pointed to sans-tight, body 15px, composer 16px, tabular-nums on numeric surfaces | typecheck · specimen screenshots |
| 3 | `primitives: machined objects` | Card/HairlineRow/Button/Badge/Sheet reskin inside `ui/*` + shared classes; double-bezel variants | ratchet (must fall) · specimen |
| 4 | `screens: mobile sweep` | 5 mobile screens on the new material; fixes the walkthrough defects in the same pass (ghost headers, empty `?stage=failure`, L6 inversion on `?failure=` route, voice dead zone) | 390px screenshot checkpoints · container counts |
| 5 | `capture: dark parity + specimen refresh` | Per-script contrast in dark (Devanagari/Tamil), desktop inherits free (shared components), fresh 13-screenshot set | gate suite · audit re-run |

Desktop inherits steps 1–3 automatically (shared components). REDESIGN-PLAN P6's OKLCH and dark-parity
work is *absorbed* into steps 1 and 5 rather than being a separate later phase.

## 4. What this deliberately does not do

- No dark-glass-on-everything, no aurora animations, no neon — trust product; the mesh is breath, not
  light-show (and the stop state stays the most designed screen, L6/L8 untouched).
- No npm UI-kit adoption — the vault supplies anatomy (already harvested in DECISION-INTERACTION §8),
  the token system supplies skin. Copy-in, reskin, ratchet.
- No layout rearchitecture. L1–L8 composition law, five-slot Screen grammar, drawer nav: unchanged.
- No networked assets: new fonts vendored via @fontsource; grain is an inline SVG data-URI; determinism
  gate stays green.

## 5. Decision log

| # | Decision | Rejected alternative | Why |
|---|---|---|---|
| V1 | Mesh+grain ground as ONE role token, fixed layer | Per-screen gradients / animated aurora | ratchet-safe, GPU-safe, determinism-safe |
| V2 | Display → sans-tight; serif → law register only (Instrument Serif) | Keep Fraunces everywhere; or drop serif entirely | keeps the register thesis, kills the dated tone; serif-rare = serif-meaningful |
| V3 | Keep Hanken Grotesk body | Swap to Satoshi/Geist | already distinctive + Noto-harmonized; body swap is churn. Candidate display upgrades can be re-run via the specimen if the owner wants more edge |
| V4 | Glass on floating chrome only | Glass cards everywhere | mobile repaint cost + readability of legal text |
| V5 | Double-bezel on discrete objects only | Bezel everything | L1: containers must earn themselves; bezel is emphasis, not default |
| V6 | Grain 2.5% light / 3.5% dark, static | Animated shader | determinism + battery + reduced-motion law |
