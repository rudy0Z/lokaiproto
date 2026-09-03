# LokAI build sheet

**Read this before writing any screen or component in this repo.** It is the
whole system in one page. `MOBILE_AI_SYSTEM.md` explains *why*; this says *how*.

Everything comes from one import:

```tsx
import { Screen, Stack, Row, Rule, Card, HairlineList, HairlineRow,
         Text, Label, Amount, Button, IconButton, Badge, Field,
         T, M, ICON } from '../../ui';
```

---

## The four layers

| Layer | Lives in | You may edit it |
|---|---|---|
| 1 · Tokens | `src/app/ui/theme.ts`, `styles/index.css` roles, `shared.tsx` | rarely, with a reason in a docstring |
| 2 · Primitives | `src/app/ui/primitives.tsx` | when the system is missing a decision |
| 3 · Layout kit | `src/app/ui/layout.tsx` | same |
| 4 · Domain | `Turn`, `VerificationGate`, `StopState`, `NoticeInterpret`, screens | this is where you work |

**A layer may only import downward.** A screen never reaches past layer 2/3 into
raw hex, raw px, `C.*`, `fontFamily`, or `lineHeight`.

---

## Six bans

These are enforced by `npm run verify:demo`. The last three are a ratchet
(`scripts/ui-debt.json`): the count per file may fall, never rise.

1. **No raw colour.** `#102A4C` / `rgba(...)` → `T.anchor`. A literal cannot
   survive a theme change, which is why dark mode has been blocked for weeks.
2. **No raw `fontSize` / `borderRadius` / `boxShadow`.** Already enforced.
3. **No raw `fontFamily`.** `<Text role="answer">` picks the family — and in
   Hindi or Tamil it picks a *different* one, which is the entire multilingual
   claim. Writing `fontFamily: SERIF` renders tofu in Devanagari.
4. **No raw `lineHeight`.** Indic scripts need 1.85–1.9; Latin needs the type
   role's own value. `<Text>` resolves it from the active language.
5. **No `<div style={{...}}>` for spacing.** `<Stack gap>` / `<Row gap>`.
6. **No second primary button.** One filled CTA per screen; the second action
   is `variant="quiet"` (a text link). Two same-shaped buttons is what made
   "Continue" as loud as "Find legal aid" on the high-risk stop.

---

## A screen, complete

```tsx
export function AssessScreen({ onOpenSources, onNext }: Props) {
  return (
    <Screen
      chrome={<><StatusBar /><TopNav /><HeaderBar /></>}
      context={<Text role="meta" tone="faint">Consumer refund · Karnataka · English</Text>}
      action={<Button onClick={onNext}>See action plan</Button>}
      footer={<BottomNav active="chat" />}
    >
      {/* Slot 2 — the focal move. Serif IS the label; no eyebrow above it. */}
      <Text role="answer">
        The prepared source notes support asking for a refund.
      </Text>

      {/* Slot 2b — supporting prose, on the ground, one hairline between */}
      <Stack gap={4}>
        <Rule />
        <Label>How it applies</Label>
        <Text tone="quiet">The invoice and the technician report confirm the defect.</Text>
      </Stack>

      {/* Slot 3 — grounding as one tappable line, never a card or a table */}
      <Button variant="quiet" size="sm" onClick={onOpenSources}>
        4 of 4 claims trace to a source →
      </Button>
    </Screen>
  );
}
```

That is the target shape: **zero inline styles, one container (the source
sheet, on demand), one caps label, one primary CTA.**

---

## Type roles

Pick by job, never by size.

| Role | Size | Use for |
|---|---|---|
| `pronounce` | 28px serif | **Only** the refusal sentence and the home greeting. At most one per screen; most screens have none. |
| `answer` | 22px serif | Zone 1 of a response — the law speaking. |
| `lead` | 18px | A sub-answer, a document's plain-language summary. |
| `title` | 15px | A card's own name. |
| `body` / `bodyStrong` | 14px | Prose. The floor for anything a user must read. |
| `quiet` | 13px | Supporting detail. |
| `caption` / `captionStrong` | 12px | Metadata, source lines. |
| `label` | 12px caps | **One per screen.** |
| `meta` | 12px caps | The context strip only. |

`<Amount>` for anything numeric that carries legal weight — ₹ figures,
deadlines, section references, claim counts. Mono, tabular, always aligned.

**Why 28px is not the answer size:** on a 390px viewport a two-sentence finding
at 28px eats ~45% of the fold and pushes the actionable guidance below it.
Reserving the largest type in the app for the moment it *refuses* is L2 and L6
expressed as a number — and it is a decision worth naming in the case study.

---

## Colour roles

| Token | Job |
|---|---|
| `T.ground` | the page. Content sits on it. |
| `T.raised` | a discrete object only — a source, an exhibit, a matter |
| `T.ink` / `T.inkQuiet` / `T.inkFaint` | primary prose / supporting / metadata |
| `T.hairline` | the 1px that replaces borders |
| `T.anchor` | composer, the ONE primary CTA, stop ground — **nowhere else** |
| `T.flag` / `T.flagFill` | needs-review. The exception gets the fill; the rule does not. |
| `T.attest` | citations, source trails, provenance |
| `T.focus` | focus ring (the only saffron that clears 3:1) |
| `T.stopGround` / `T.stopInk` | handled by `<Screen tone="stop">`, not by hand |

If a screen wants a second saturated element, **delete one of them.**

The one exception: `motion/react` cannot interpolate `var(...)`. A component
that *animates* a colour imports the literal from `C` and says so in a comment.

---

## Containers

`<Card>` is the only box, and it has to pass one test:

> **Could the user pick this thing up and move it somewhere else?**

Yes → a source, an uploaded exhibit, a saved matter, a document.
No → explanatory prose, a step description, a disclaimer, a "current step"
restatement. Those go on the ground, or are deleted.

**At most two cards visible per screen.** Current screens run five to seven,
which is the loudest single reason they read as generated rather than designed.

A card that needs to look different from other cards is a **different component
with a name**, not a card with options. That is exactly how the folded-corner
treatment on `VerificationScratchpad` came to exist and mean nothing.

For a list of related facts use `<HairlineList>` / `<HairlineRow>` — the value
in the strong position, the label quiet beneath it, only the flagged row filled.

---

## Stop states

```tsx
<Screen tone="stop" chrome={<><StatusBar /><TopNav /></>} action={
  <Button onClick={onFindAid}>Find legal aid near you</Button>
}>
  <Text role="pronounce">
    This looks like a criminal matter. I've stopped here.
  </Text>
  <Text tone="quiet">…one sentence on why, in plain language.</Text>
  <Button variant="quiet" onClick={onContinue}>Continue anyway</Button>
</Screen>
```

`tone="stop"` inverts the **whole artboard** — ground, chrome, ink, rules, and
the primary button, via context. Do not pass a `light` prop down a tree, and do
not render a dark card on a cream page: that is the "uncanny sandwich" the
current `?failure=high_risk` screen has, where the status bar, top nav, header
and page ground all stay lit around a dark box.

**The safe action is always the filled button. "Continue anyway" is always a
text link, or absent.**

---

## Language

Never think about it. `<Text>` reads the active language, sets `lang`, and picks
the family and leading. Two things to know:

- **The display serif is Latin-only on purpose.** Fraunces has no Indic glyphs.
  In Devanagari and Tamil the serif roles fall back to the script's Noto sans at
  weight 500 — legibility over flourish for a stressed, mixed-literacy reader.
- `lang="…"` on `<Text>` overrides the active language for one element. Use it
  when two scripts share a screen — original vs. translation, side by side.

---

## Motion budget

- enter / stage change: 240ms, `MOTION.ease`
- sheet: spring, 0.8 damping / 0.3 response (`<Sheet>` already does this)
- press: surface change, never a hover-lift (sticks on touch)
- reduced motion: opacity fades survive, transforms and loops do not

---

## Before every commit

```bash
npm run verify:demo && npm run typecheck && npm run build
```

After migrating a file onto the system, drop its budget:

```bash
node scripts/ui-debt.mjs --update
```

Per component, before moving on: **screenshot at 390px, and confirm the
container count dropped.** `npm run dev` on `:5173` — `vite preview` serves a
blank page here because the build's `base` is `/embed/lokai/`.

---

## Typography, icons & elevation (2026-08-27 premium pass)

**Type.** Serif = **Fraunces** (the law speaking, `answer`/`pronounce`). Sans =
**Hanken Grotesk** — a warm, high-legibility grotesque, self-hosted via
`@fontsource`. It replaced Inter, which is the default AI-generated UI face and a
generic tell. Mono = **JetBrains Mono** (`Amount` — figures, references). Indic
scripts render in **Noto Sans Devanagari / Tamil**, selected per-script by
`ui/script.ts` — the multilingual thesis is a property of the type system, and the
Latin-sans swap did not touch it (Hanken handles Latin; Noto handles Indic).

**Icons.** Three tiers, each with a reason — do not mix within a tier:
1. **Bespoke SVG glyphs** for the three highest-touch controls (composer mic/send/attach): hand-drawn at one stroke weight, in `ai/Turn.tsx`. Stock glyphs read heavier beside them.
2. **`ui/icons.tsx`** (`@animateicons/react`, aliased to app-semantic names like `IconMenu`/`IconCheck`) for **chrome and system gestures** — nav, rows, drawer, sheet affordances. Animated on hover/focus via `motion/react`; props are `size`, `color`, `isAnimated`, `duration` (NO `strokeWidth` — the set ships one weight). All Lucide/Phosphor imports in mobile screens migrated here (Phase 8).
3. **Phosphor** (`regular` weight, `ICON_WEIGHT`) for **inline content icons** — state glyphs inside turns, evidence rows, status labels. Static on purpose: animation inside reading content competes with the words.

**Elevation — contact shadows, and "border OR shadow, never both".** A surface is
either a flat outlined plane (a hairline, no shadow) or a physical object resting on
the page (a tight contact shadow, no border). An outline *plus* a drop shadow is two
separators doing one job — the generic "Material float". `SHADOW.sm/md` are tight,
warm, two-layer contact shadows (≤12px ambient); `Card` and `ExhibitPaper` dropped
their borders. On the stop theme (dark) a shadow is invisible, so a subtle raised
fill carries the surface instead.

**No colored left stripe.** The `borderLeft: 3px solid <accent>` "file tab" was the
single most generic pattern in the app. A live/flagged state is now carried by a
small filled status dot or a fill — a signal that means something — not a decorative
edge. Do not reintroduce the stripe.
