# Embed Composition + Craft Gap Analysis — 2026-09-10

Two questions answered: **(1)** how to confine the phone in the portfolio so a recruiter sees it whole, without scrolling, with composed side-content; **(2)** what is actually missing in LokAI's visual craft next to ChatGPT / Gemini / Claude, and whether the React prototype's look survives a port to React Native / Flutter.

Companion docs: `MOBILE-FRAME-AUDIT-2026-09-10.md` (device confinement), `AUDIT-2026-09-10.md` (whole app).

---

# PART 1 — The embed composition problem

## 1.1 What is actually happening today (measured)

I inspected the real Portfolio side, not just LokAI.

**LokAI side** (`src/app/embed.ts`, `components/mobile/DeviceFrame.tsx`): in embed mode the iframe *is* the phone at `width:100%; maxWidth:430; height:100dvh` — no bezel, portfolio supplies chrome.

**Portfolio side** (`D:\Portfolio`):

| Fact | Value | Source |
|---|---|---|
| Phone render size | 390 × 780 | `app/projects/lokai/page.tsx:18–20` |
| Inline max width | `maxWidth: 330` | same |
| Phone bezel added by frame | top 34 + bottom 20 + side 10×2 | `components/PrototypeFrame.tsx:45` |
| Scale rule inline | `min(scaleByWidth, scaleByHeight)`; `maxHeight` only supplied in the **expanded modal** | `PrototypeFrame.tsx:122–132` |
| Portfolio nav | `fixed inset-0` overlay — **takes no flow space** | `components/frame/HUD.tsx:123` |
| Hero padding | `clamp(128px, 14vw, 190px)` top, `clamp(72px, 8vw, 118px)` bottom | `app/globals.css:417` |
| Hero grid | `0.86fr / minmax(420px,1fr)`, `align-items:center` | `globals.css:421` |
| Scene grid (Steps 1–4) | `1.2fr / 1fr`, `align-items:center`, visual `max-w-[360px]` | `globals.css:656`, `CaseStudyScene.tsx:33` |

**The computed consequence.** Inline, `maxHeight` is `undefined`, so `scaleByHeight = Infinity` and the phone scales purely by width:

```
scale = (330 − 20) / 390 = 310/390 = 0.795
contentHeight = 780 × 0.795 = 620px
visibleHeight = 620 + 54 (bezel) = 674px
phone top = 190px (hero top padding at ≥1357px wide)
phone bottom = 190 + 674 = 864px
```

**A 13″ MacBook gives ~780px of viewport height. The phone's bottom edge lands at 864px — the recruiter must scroll ~84px to see the bottom of the phone.** That is exactly the "bad sign" you described, and it's real, not imagined.

Two separate causes, both cheap to fix:
1. **The hero's top padding (190px) is budgeted for a tall desktop, not for the phone section's job of fitting the device on screen.**
2. **The phone is width-driven**, so its height is whatever falls out — nobody ever asserted "the phone must fit the viewport."

## 1.2 The fix — three tiers, cheapest first

### Tier 1 — Height-aware hero padding (one media query, immediate)

The phone already computes to a good size (674px). The only thing pushing it below the fold is the 190px of air above it. Cap that air when vertical space is scarce:

```css
/* app/globals.css */
@media (max-height: 900px) {
  .case-hero { padding-top: clamp(88px, 9vh, 128px); }
}
@media (max-height: 800px) {
  .case-hero { padding-top: 88px; padding-bottom: 56px; }
}
```

At 88px top: phone bottom = 88 + 674 = **762px ≤ 780** — fits with 18px to spare, nav floats clear above. This alone solves the recruiter scenario with no layout change and no risk.

### Tier 2 — Height-driven device sizing (the durable spec)

Stop deriving height from the width cap; derive width from the height budget. This makes "fits on screen" a property of the layout rather than a coincidence:

```css
.phone-sticky {
  position: sticky;
  top: calc(24px + 12px);                 /* clears the floating HUD */
  height: min(calc(100dvh - 96px), 674px); /* never taller than the viewport */
  aspect-ratio: 390 / 844;                 /* width derives from height */
  max-width: 330px;                        /* never exceed the inline cap */
}
```

Then feed that computed height into `PrototypeFrame` as `maxHeight` — **the prop already exists and already works** (`PrototypeFrame.tsx:127`); it simply isn't passed in the inline case. One-line change: pass `maxHeight={availableHeight}` from the hero.

### Tier 3 — Sticky phone + scrolling steps (the pattern strong case studies use)

This is the mainstream productised pattern (Framer's "Phone Scroll Pro", The Pudding's scrollytelling). It decouples phone visibility from page length entirely:

- Phone column: `position: sticky; top: …` — stays put while the page scrolls.
- Text column: normal scroll; each step's activation swaps the screen inside the phone via `IntersectionObserver` with `rootMargin: '-30% 0px -30% 0px'` (LokAI's Portfolio already uses exactly this rootMargin in `CaseStudyNav.tsx:36`).
- The phone is *always* fully visible; the reader never scrolls to "see the bottom of the phone."

**Two classic sticky bugs to avoid** (both documented): any ancestor with non-visible `overflow` kills sticky; flex/grid parents need `align-items: flex-start` or the child stretches and loses scroll room.

## 1.3 Answering the side-content worry directly

> "the content on the side written, the design decision, it needs to be reasonably filled as well — bigger screen means more content, which is hard."

**This is a false constraint.** The side column does not have to be as tall as the phone (674px of copy is a wall of text nobody reads). Use the sticky pattern instead: the phone pins, the copy scrolls. On a tall screen the copy can simply continue past the phone's height and the phone stays centred — the composition stays balanced without you having to invent more words.

Balanced side-content for a phone embed (IxDF's guidance, plus what strong case studies actually do):
- **Numbered process steps** synced to the screens (this is what Steps 1–4 already are — good).
- **Type specimen / palette block** — cheap to add, reads as senior, and fills vertical space honestly.
- **One design-principle callout** per scene, in the mono "instrument" voice the portfolio already has.
- **Annotations** pointing at specific UI details (IxDF explicitly calls annotation the side-content glue).

**The bar is not "more words", it is "the column is composed."** Two or three honest blocks beat four paragraphs.

---

# PART 2 — Why LokAI reads as less crafted than ChatGPT / Gemini / Claude

## 2.1 The measured gap

I ran a density audit on the rendered screens. The senior-craft targets come from the research (NN/g's hard limits; Vercel Geist's token discipline):

| Signal | LokAI home | LokAI case | Senior-craft target | Verdict |
|---|---|---|---|---|
| Distinct font sizes | **7** (10,12,13,14,16,22,31) | **6** | ≤ 3 (NN/g); 10-step scale max | ✗ over budget |
| Font weights | 4 (400/500/600/700) | 4 | 2–3 | ✗ one too many |
| Text colours | **5** | **5** | ≤ 3 contrast levels (NN/g) | ✗ over budget |
| Border radii | 4 (6,10,12,15,999) | 4 | 2–3, mapped to elevation (Geist: exactly 3) | ✗ over budget |
| Border widths | 1 ✓ | 1 ✓ | 0–1 | ✓ |
| Shadow recipes | 2 | 1 | one system, one light source | ✓ |

**LokAI is not badly designed — it is over-specified.** Every individual element is defensible; the aggregate is noisy. That is precisely the "student-grade but competent → senior-grade" gap: not missing features, **missing restraint.**

## 2.2 What ChatGPT and Gemini actually do (verified, 2025–26)

| Dimension | ChatGPT | Gemini (Neural Expressive, I/O 2026) |
|---|---|---|
| Home | Greeting **"What's on your mind today?"** + composer. Nothing else. | Blue-white **animated gradient**, large centred greeting, logo above it, **suggestion chips removed entirely** |
| Composer | Pill, floating above keyboard; buttons reduced **5 → 4** | Pill **detached from the keyboard**; buttons reduced **5 → 3** (`+`, dictation, Live) |
| "Thinking" state | Coded pulsing blue **"Emotive Point"** (Studio Dumbar motion system) — replaced the spinner | Whole top half **glows through a cycling gradient** in the brand colours — replaced the spinner |
| Type | **OpenAI Sans** — bespoke, humanist-geometric, built with ABC Dinamo, deliberately imperfect counters. Brand values: *"simplify, space, imperfection, vivid"* | Roboto at **considerably thinner** weights; Material 3 now ships **30 type styles** (15 baseline + 15 emphasised) |
| Icons | Flat, minimal | Redrawn **thinner, more rounded, cleaner** |
| Restraint reflex | **Turned off ad-like suggestion cards** (Dec 2025) because they cheapened the surface | **Removed suggestion chips** in the redesign |

**The shared 2026 language:** centred greeting → pill composer with minimised controls → everything else behind a `+` menu → ambient colour as the thinking state → *fewer* elements, deliberately.

**LokAI's home screen, for contrast, currently contains:** a logo mark tile, a 31px greeting, **three paragraphs of explainer prose**, a "Quick start" label, **six bordered chips**, a composer, and (further down) three modality tiles. That is roughly 4× the element count of a ChatGPT/Gemini home.

## 2.3 The gap, named

1. **Too much on the first screen.** Three paragraphs of explainer + six chips is a landing page, not a chat home. ChatGPT and Gemini both reduced this to *greeting + composer*. **Cut the explainer to one line; cut chips to 2–3** (or make them a quiet single row).
2. **No materiality on the composer.** Both leaders ship a *floating pill* with subtle elevation. LokAI's composer is a flat bordered shell. The composer is the hero of a chat home — it should be the one object with real material presence.
3. **Borders on everything.** Every chip and row carries `1px solid hairline`. The craft ladder is **spacing → background tone shift → shadow → border**: borders are the last resort. Chips should be *tonal fills*, not outlined boxes.
4. **The type scale is a shopping list, not a system.** 7 sizes on one screen. Consolidate to a 3–4 step scale; let weight and colour carry hierarchy (NN/g: "size isn't everything").
5. **The brand mark is a placeholder.** A letter "L" in a rounded square, static. ChatGPT's Emotive Point and Gemini's gradient logo are *alive*. A static letter reads unfinished at first touch.
6. **No ambient "thinking" moment.** LokAI's staged progress with dots is honest and good — but visually it's a list of ticks. A restrained ambient state (a slow tonal breath on the mark) would match the 2026 language without faking AI.
7. **Five text colours.** Muted greys are fine; five *levels* of them is where hierarchy dissolves. Cap at three.

## 2.4 The fix list (ordered by craft-per-hour)

| # | Change | Impact |
|---|---|---|
| 1 | Collapse the type scale to ≤4 sizes; drop one weight | Highest — instantly calmer |
| 2 | Cut home explainer 3 paragraphs → 1 line; chips 6 → 3 | Highest — matches ChatGPT/Gemini |
| 3 | One material composer: pill radius, filled tone, layered low-alpha shadow (Comeau recipe) | High — the hero object |
| 4 | Replace chip borders with tonal fills | High — removes visual noise |
| 5 | Cap text colours at 3 | Medium |
| 6 | Radii → 3 values mapped to elevation | Medium |
| 7 | Make the mark breathe (slow ambient tonal shift) instead of a static letter | Medium — identity |
| 8 | One ambient "working" state replacing the tick list visually | Low-medium |

**Do NOT add:** gradients-for-decoration, 3D, glassmorphism, noise textures. The editorial restraint *is* the differentiation — the goal is fewer, better-considered elements, not more.

---

# PART 3 — Will this React prototype's look survive a port to React Native / Flutter?

**Short answer: the design ports; the code does not. And that is normal, expected, and fine.**

## 3.1 What ports cleanly

- **Tokens as values.** Colours, type sizes, spacing steps, radii — these are just numbers. They become a JS theme object in RN, or `ThemeData`/`TextTheme` in Flutter.
- **The composition law.** Slot order, one-primary-button, the stop-state inversion, the answer-first hierarchy — all platform-agnostic.
- **The typography system.** Fraunces/Hanken/Noto families ship on both platforms (bundled as font assets).
- **The layout arithmetic.** Flex column, fixed chrome, scrolling content, pinned action — RN is flexbox natively; Flutter's Column/Expanded maps 1:1.

## 3.2 What does NOT port (the honest list)

- **CSS custom properties** (`var(--role-ground)`, `var(--role-ink)`) — **RN has no CSS.** These become a theme context/hook. This is the single biggest mechanical cost.
- **`className` + `src/styles/index.css`** — the `.lokai-chip`, `.lokai-composer-shell`, `.lokai-row` classes have no RN equivalent; they become `Pressable`/`View` styles.
- **Inline `style={{}}` objects** mostly *look* like RN styles, but web-only properties (`boxShadow` string syntax, `background: linear-gradient(...)`, `transform` strings) must be rewritten. RN shadows need `elevation` (Android) + `shadowOffset/Opacity/Radius` (iOS) — different API, same intent.
- **`100dvh`, `clamp()`, `position: sticky`, media queries** — RN has `Dimensions`/`useWindowDimensions` and `SafeAreaView`, not media queries.
- **Resemblance of platform chrome.** Nav bars, back gestures, keyboard avoidance, and haptics are *platform* concerns. RN gives you `KeyboardAvoidingView`; Flutter gives you `resizeToAvoidBottomInset`. The visuals will differ here regardless of your design.

## 3.3 The reassuring part

Look at the leaders: **ChatGPT and Gemini render near-identical layouts on iOS and Android.** The divergence between platforms is *chrome and gesture*, not composition. So if the composition law is right — and LokAI's is — the ported app looks like the prototype. The parts that change (nav bar, transitions, keyboard) are precisely the parts a real product *should* change per platform.

**Practical implications for how you build today:**
1. **Keep tokens in one place.** They already are (`ui/theme.ts`) — good. When adding tokens, prefer plain JS values over CSS-only constructs, so a future RN/Flutter build can consume the same source of truth.
2. **Don't lean on CSS custom properties for anything semantically load-bearing** that you'd want to port — prefer the `T.*` JS tokens, which are already the system's idiom.
3. **Treat `src/styles/index.css` classes as web-only polish,** not as the design system. The design system is the token file + the composition law.
4. **Say this in the case study.** "Built as a web prototype; the token layer and composition law are platform-independent and were designed to port to React Native/Flutter" is a *senior* statement — it shows you understand the web/native boundary. It turns a perceived weakness into evidence of judgement.

---

## Sources

**Embed composition:** The Pudding, *Easier scrollytelling with position sticky*; Effect.Labs, *CSS Scrollytelling with Position Sticky*; MDN `aspect-ratio`, height media queries; Chrome Developers, *CSS scroll-driven animations*; Framer marketplace *Phone Scroll Pro*; IxDF, *UX/UI Design Case Studies That Get You Hired*; Awwwards Mobile & Apps category. Repo facts from `D:\Portfolio` (`PrototypeFrame.tsx`, `ExpandablePrototype.tsx`, `app/projects/lokai/page.tsx`, `app/globals.css`, `HUD.tsx`, `CaseStudyNav.tsx`).

**Craft principles:** Refactoring UI (Wathan & Schoger); Josh Comeau, *Designing Shadows*; NN/g (visual hierarchy, touch targets, animation duration, skeleton screens, placeholders); Rauno Freiberg, *Invisible Details of Interaction Design*; Vercel Geist (colors, materials, typography); Practical Typography; Material/Google accessibility (48dp/8dp); React Native KeyboardAvoidingView docs.

**ChatGPT / Gemini:** Wallpaper*, OpenAI rebrand interview (OpenAI Sans, Studio Dumbar, brand values); The Verge + Mashable + Lifehacker, Google I/O 2026 *Neural Expressive*; Android Authority hands-on (Gemini gradient home, chips removed, composer 5→3); 9to5Google, Gemini Mac redesign; App Store listing (ChatGPT composer 5→4); Hindustan Times (ChatGPT ad-like suggestions disabled); Android Authority teardown (Gemini overlay glow).

**Not verified this pass:** the Claude/Anthropic design-language research agent failed on an infrastructure error (`ECONNREFUSED`), so no fresh sourced teardown of Claude's typeface/hex values is included — I deliberately did not substitute recalled specifics. Mobbin was inaccessible, so all screenshot-level claims about ChatGPT/Gemini are from written hands-on coverage, not direct UI inspection.
