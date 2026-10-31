# 03 · SYSTEM — the build sheet as-built

*Source of truth for the token architecture. Supersedes `docs/LLM_DESIGN_SYSTEM.md` and `docs/VISUAL-DIRECTION-2026-09.md`'s implementation sections. Archive kept for reasoning.*

---

## Layers — import downward only

```
src/app/ui/index.ts     ← the one import line for screens: Screen, Stack, Text, Button, T, M…
1 TOKENS      ui/theme.ts (T, M, ROLE_TYPE) + styles/index.css (role layer + vellum classes) + components/shared.tsx (TYPE, S, LAYOUT, SHADOW, C, LAW, MOTION)
2 PRIMITIVES  ui/primitives.tsx (Text, Label, Amount, Button, IconButton, Badge, Field…) · ui/layout.tsx (Screen, Stack, Row, Rule, HairlineList, Card) · ui/motion.tsx · ui/icons.tsx
3 ADOPTED     components/mobile/ (FlashcardDeck, MatterFolder, ScanDocument — vault anatomy, tokenized) · ui/cn.ts
4 DOMAIN      components/ai/Turn.tsx, components/mobile/*, pages/* — where you work
```

## Color — the role layer is the only truth

Call sites touch **roles, never hues** (`T.ground`, `T.ink`, `T.anchor`…). Re-pointing
`src/styles/index.css` re-themes the app with zero call-site edits — that is the entire reason
Vellum was a cheap migration. Palette as-built (light): ground `#F6F4EF`, raised `#FFFFFF`,
ink `#161513`, anchor `#0B1B32`, saffron `#E27A24`, hairline `rgba(22,21,19,.08)`.
Dark: navy-black ground `#0E1A2B`, cream becomes the ink, anchor inverts to cream.
The contrast gate parses both themes and fails under AA (4.5:1 text / 3:1 UI).

**Exception (recorded):** colors animated by motion/react import literals from `C` — CSS vars
don't interpolate.

## Type — registers, not sizes

| Register | Face | Where | Role |
|---|---|---|---|
| Display | Hanken Grotesk 800/700, tracking −0.035em | page titles, greeting | `display1/display2` |
| **The law speaking** | **Instrument Serif** (`LAW`) | answer zone 1, refusal sentence | `editorial/editorialSm` |
| UI / body | Hanken Grotesk 400–600 | everything else | `body` 15px · `title` · `small` |
| Inputs | Hanken 1rem | composer, fields | `input` (iOS anti-zoom floor) |
| Evidence | JetBrains Mono, tabular-nums | references, ledgers, receipts, timers | `Amount`, mono chips |
| Indic | Noto Sans Devanagari / Tamil | `<Text role>` sets family + leading per script; code-switch-safe | automatic |

Serif is **rare on purpose** — when Instrument Serif appears, the law is talking.

## Material — Vellum as-built

- **Ground:** `--role-ground-image` = grain tile (inline SVG feTurbulence, desaturated, alpha
  baked in) + two radial breathes. Consumed by `<Screen>` as backgroundColor + image; stop tone
  stays flat. Static; no animation; GPU-paintable.
- **Glass** (`.lokai-glass`): floating chrome ONLY — composer, sheets, drawer. Never scrolling
  content.
- **Double bezel** (`.lokai-bezel` + `.lokai-bezel-core`): discrete objects — verification gate,
  evidence locker, notice paper, flashcards. Outer 28 / inner 22 concentric; inner top highlight
  does the premium work; shadows only anchor.
- **Shadows (SHADOW):** warm, three-layer, diffused. `inset` highlights are the craft; blur is
  never dark or harsh. Border OR shadow, never both.
- **Radii (LAYOUT.radius):** role-named; concentric nesting = outer − 6.

## Motion — Emil's book, LokAI's tempo

- Enter `cubic-bezier(0.23,1,0.32,1)`; sheets/drawer `(0.32,0.72,0,1)`; exits ~60% of enter.
- Press scale 0.97 on every pressable (`.lokai-pressable`); stagger 30–80ms; durations ≤300ms for
  UI; springs for gestures; transitions (not keyframes) for interruptible UI; hover gated behind
  `(hover:hover) and (pointer:fine)`; reduced-motion = fewer/gentler, never zero.
- **Consequence-scaled working beat** (`STAGE_MS_BY_CLASS`): stops 240ms/stage · confirm/progress
  300 · clarify 450 · explain/disclose 1050 (≈4.2s narrated). Skippable always. Same input → same
  beat, every time.

## Icons — three tiers, never mixed within a tier

1. **Bespoke SVG glyphs** — composer send/attach/mic (hand-drawn in `Turn.tsx`).
2. **Aliased animated set** (`ui/icons.tsx`, `@animateicons/react`, app-semantic names —
   `IconMenu`, `IconDots`) — chrome and system gestures.
3. **Phosphor static** (`ICON_WEIGHT`, Light for chrome) — inline content icons in reading surfaces.

Lucide is retired repo-wide. Do not reintroduce.

## Gates (run before every commit)

```bash
npm run verify:demo && npm run typecheck && npm run build
```

Ratchet law: `scripts/ui-debt.json` budgets only fall. Bare `fontSize` / `boxShadow` /
`borderRadius` outside system files fail the build — glows and raw values live in `index.css`
system classes (`.lokai-scan-bar`), never at call sites.
