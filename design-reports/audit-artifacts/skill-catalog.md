# LokAI Design Audit — Skill Catalog
Source library: `D:\Brain 2.0\design skills new` (v1.0.0, Sept 2026). Built for an audit of a single web app (React/TS) judged at 1440px desktop and 390px mobile screenshots plus code inspection. Every criterion below is verdict-able as PASS / PARTIAL / FAIL.

---

## 1. LIBRARY INVENTORY (10 files — count verified on disk)

| # | Path | Lines / Size | Contains | Role in library |
|---|------|--------------|----------|-----------------|
| 1 | `README.md` | 92 / 3.8KB | Overview, per-platform quick starts, "key differences" summary, source links | Entry point; orients reader, no unique rules |
| 2 | `SUMMARY.md` | 202 / 9.0KB | Package digest, capability matrix, workflows, decision trees, learning path, troubleshooting | Executive digest; duplicates PLAYBOOK rules in condensed form |
| 3 | `PLAYBOOK.md` | 1159 / 29.3KB | Full catalog of ~90 commands across 4 skill sets (Craft, Emil, Interface Cheatsheet, Android), decision flowchart, 5 usage scenarios, capability matrix, troubleshooting | **The core.** Authoritative source for nearly all criteria |
| 4 | `CHECKLIST.md` | 142 / 5.7KB | Package *completion* checklist: coverage verification, quality checks, cross-platform coverage, stats | Meta-QA of the library itself — NOT app audit criteria |
| 5 | `QUICK-REFERENCE.md` | 123 / 4.6KB | One-page card: platform matrix, touch targets, animation physics, pre-launch checklist, snippets, troubleshooting | Field card; fastest source of hard numbers |
| 6 | `PLATFORM-COMPARISONS.md` | 361 / 10.9KB | iOS vs Android vs Web tables: touch targets, animation physics/durations, color, typography, navigation, dark mode, accessibility + code per platform | Cross-platform rulebook; basis of §4 matrix |
| 7 | `examples/android-setup-template/.qoder-android-config.yaml` | 24 / 0.8KB | M3 starter config: Roboto, spring damping, 48dp targets, bottom-nav max 5, quality gates | Android template (confirms PLAYBOOK Android rules) |
| 8 | `examples/ios-setup-template/.qoder-ios-config.yaml` | 22 / 0.6KB | WWDC config: system fonts only, stiff spring, 44pt targets, separate dark palette, avoid-list | iOS template (confirms Emil/iOS rules) |
| 9 | `examples/web-patch-template/PATCH-CHECKLIST.md` | 38 / 1.9KB | 5-section pre-launch gates: typography, color, motion, accessibility, layout, performance | **Most directly applicable to LokAI web audit** |
| 10 | `examples/web-patch-template/sample-component.tsx` | 35 / 1.0KB | Before/after button showing hex→OKLCH, press scale, tracking, easing, 44px target | Worked example of the rules applied |

Note: README, PLAYBOOK and SUMMARY all reference a `DECISION-GUIDE.md` that does **not** exist on disk (see §3).

---

## 2. SKILL / PRINCIPLE CATALOG (35 entries, ordered by library importance)

Weight key: **H** = High 2026-portfolio impact, **M** = Medium, **L** = Low.

### Theme A — Accessibility (library flags this as "Core Priority" / ⭐ ESSENTIAL)

**C-01 · WCAG 2.1 AA baseline**
- Source: PLAYBOOK "Interface Cheat Sheet → Accessibility `/accessibility`"; PLATFORM-COMPARISONS "Accessibility Requirements"; QUICK-REFERENCE pre-launch.
- Demand: Native semantic elements, always-visible focus, labeled forms, validated contrast, screen-reader announcements.
- Criteria: real `<button>`/`<a>` everywhere (no div-buttons in code); `:focus-visible` styles defined and visible when tabbing (outline never removed); every input has an associated `<label>`/`aria-label` + visible error text; spot-check 3 text/bg pairs ≥4.5:1 contrast in both light and dark.
- Weight: **H**

**C-02 · Touch / hit targets**
- Source: PLAYBOOK "Craft → Layout `/hit-areas`" (desktop 40×40, touch 44×44); PLATFORM-COMPARISONS "Touch Target Sizes" (iOS 44pt, Android 48dp, Web 44px, "use 48 universally"); PATCH-CHECKLIST "Hit areas minimum 44×44px".
- Demand: Every interactive element is large enough to hit reliably; mobile is the stricter test.
- Criteria: at 390px, primary CTAs and icon-only buttons ≥44×44px (48px = PASS-with-distinction); nav/tab items ≥44px tall; desktop controls ≥40px; spacing between adjacent targets prevents mis-taps.
- Weight: **H**

**C-03 · Reduced motion respected**
- Source: PLAYBOOK `/accessibility` coverage; PATCH-CHECKLIST "Reduced motion support"; QUICK-REFERENCE pre-launch.
- Demand: `prefers-reduced-motion` must disable/simplify all non-essential animation.
- Criteria: `@media (prefers-reduced-motion: reduce)` block exists in code; entrance/stagger/parallax disabled under it; no autoplaying looping animation; carousals/progress effects become static.
- Weight: **H**

**C-04 · Never block paste**
- Source: PLAYBOOK Accessibility ("People paste passwords, OTP codes everywhere!"); PATCH-CHECKLIST "Paste enabled on input fields".
- Demand: Inputs accept pasted content — no `onPaste` interception anywhere.
- Criteria: no `preventDefault` on paste in code; OTP/password/invite-code fields accept paste (test manually).
- Weight: **M**

### Theme B — Motion & Animation (Emil = "production-grade", ⭐ MOST USED)

**C-05 · Easing canon — never ease-in**
- Source: PLAYBOOK "Emil `/animate` Golden Rules"; PLATFORM-COMPARISONS "Animation Physics"; QUICK-REFERENCE physics table; PATCH-CHECKLIST "Never use ease-in easing (stiff spring default)".
- Demand: User-triggered motion uses platform easing: stiff spring (iOS), MediumBouncy spring (Android), `cubic-bezier(0.4, 0, 0.2, 1)` (web). `ease-in` is banned for user-triggered actions.
- Criteria: zero `ease-in` in CSS/code on user-triggered transitions; web transitions use the canonical cubic-bezier or a spring lib; easing is consistent across the app (one system, not per-component improvisation).
- Weight: **H**

**C-06 · Duration discipline**
- Source: PLAYBOOK `/animate` (150–300ms feedback, 300–400ms reveals); PLATFORM-COMPARISONS duration table (press 150 / modal 300 / page 400 / complex 600 — identical across platforms).
- Demand: Motion timing scales with the change it communicates.
- Criteria: press/hover feedback ≤200ms; modals/sheets/menus 250–400ms; page transitions ≤400ms; nothing exceeds 600ms; durations consistent for the same event type.
- Weight: **H**

**C-07 · Explicit animated properties**
- Source: PLAYBOOK `/explicit-properties` ("NEVER USE `transition: all`"); Emil `/animate` mistakes (animating width/height, non-specific transitions).
- Demand: Animate only compositor-friendly, named properties.
- Criteria: no `transition: all` in code; animated set limited to `transform`/`opacity` (+color where needed); no width/height/top/left animations; `transition-property` lists named props.
- Weight: **H**

**C-08 · Motion restraint & opportunity mapping**
- Source: Emil `/find-animation-opportunities` ("'Don't animate' is often more important"); PLAYBOOK `/novelty-budget`.
- Demand: Motion only where it aids understanding of a state change; decoration is budgeted.
- Criteria: animations map 1:1 to a state change (open/close, add/remove, route change); no idle/looping decoration on data-dense screens; majority of interactive elements are static on hover; one signature motion pattern reused, not many.
- Weight: **H**

**C-09 · Interruptibility**
- Source: PLAYBOOK `/animate` mistakes ("missing interruptibility").
- Demand: In-flight animations retarget smoothly when the user acts again.
- Criteria: rapid hover/unhover doesn't snap or queue; re-click mid-transition retargets (CSS transitions or spring, not one-shot keyframes for state changes).
- Weight: **M**

**C-10 · Tactile press feedback**
- Source: PLAYBOOK `/button-press` (scale 0.96, 200ms); PATCH-CHECKLIST "scales to 0.95–0.98"; sample-component.tsx.
- Demand: Primary controls visibly respond to press.
- Criteria: buttons have `:active` transform (scale 0.95–0.98); ~150–200ms ease-out; applied to press (`:active`), not hover alone.
- Weight: **M**

**C-11 · Trigger-origin continuity**
- Source: PLAYBOOK "Interface → `/trigger-origin`".
- Demand: Overlays emanate from the control that spawned them.
- Criteria: menus/popovers set `transform-origin` at the trigger (or open anchored to it); dialogs scale/fade from a sensible origin rather than center-pop everywhere.
- Weight: **M**

**C-12 · Subtle exits**
- Source: PLAYBOOK `/subtle-exit` ("leave faster than you came, shorter distance").
- Demand: Disappearance is quieter and faster than appearance.
- Criteria: toasts/menus/overlays exit faster (≈half duration) and travel less distance than entry; no exit at all = acceptable, a louder exit = FAIL.
- Weight: **M**

**C-13 · Staggered list entrances**
- Source: PLAYBOOK `/stagger` (50ms/item).
- Demand: Cascading entrance for multi-item reveals, tightly capped.
- Criteria: list/grid entrance staggers ≈30–50ms per item; stagger caps (~10 items or total <800ms); disabled under reduced motion.
- Weight: **M**

**C-14 · Shared-layout transitions**
- Source: PLAYBOOK `/shared-layout` (filtering, reordering, modal expansion).
- Demand: Elements keep visual identity across layout changes.
- Criteria: filtering/reordering morphs rather than unmounts/remounts; tab/segment indicators slide between positions; expanded cards grow from their grid position where implemented.
- Weight: **M**

**C-15 · Icon morphing**
- Source: PATCH-CHECKLIST "Icon swaps have explicit path morphing"; CHECKLIST craft coverage (`icon-morph`).
- Demand: State-toggle icons morph instead of hard-swapping.
- Criteria: play/pause, menu/close, expand/collapse crossfade or path-morph; no visible "flash" on swap.
- Weight: **L**

### Theme C — Color System

**C-16 · Semantic token architecture**
- Source: PLAYBOOK "Interface → `/color-tokens`" (purpose-based naming, "always define foreground + container roles"); PATCH-CHECKLIST "Semantic token naming".
- Demand: Colors named by role, never by primitive value; every surface token has a paired foreground.
- Criteria: CSS custom properties named by purpose (`--color-primary`, `--color-on-primary`, container roles) — no `--blue-500`-style names; components consume tokens, not raw hex; each background role has an explicit on-color.
- Weight: **H**

**C-17 · Dark mode = separate palette, never inverted**
- Source: PLAYBOOK `/color-tokens` dark-mode rule; PATCH-CHECKLIST; PLATFORM-COMPARISONS "Dark Mode Strategies".
- Demand: Dark theme is a re-tuned palette (hue/elevation shifts), not lightness inversion.
- Criteria: dark palette re-selected (not `#FFF→#000` swap); contrast re-holds in dark; system `prefers-color-scheme` respected plus a manual toggle on web; screenshots of both modes show balanced saturation.
- Weight: **H**

**C-18 · OKLCH perceptual color**
- Source: PLAYBOOK "Craft → `/oklch-colors`"; PATCH-CHECKLIST "OKLCH color space used instead of hex/RGB"; PLAYBOOK troubleshooting (hex fallback for Safari).
- Demand: Palette built in a perceptually uniform space so hues feel equal-lightness.
- Criteria: `oklch()` declarations present with hex fallback line; accent steps read as equal brightness across hues; large gradients band-free.
- Weight: **M**

### Theme D — Typography

**C-19 · Web typography standards**
- Source: PLAYBOOK "Interface → `/typography-web`"; PATCH-CHECKLIST "Typography Polish"; PLATFORM-COMPARISONS "Typography Standards (Web)".
- Demand: Performance-loaded fonts, aligned numerals, balanced wrapping.
- Criteria: `.woff2` files with `font-display: swap`; `font-variant-numeric: tabular-nums` on prices/counters/timers; `text-wrap: balance`/`pretty` on headings/paragraphs; antialiased font smoothing; ≤2 type families total.
- Weight: **H**

**C-20 · Tracking discipline**
- Source: PLAYBOOK "Craft → `/letter-spacing`" (tighten big, loosen small); PATCH-CHECKLIST ("-0.01em to -0.05em on headings").
- Demand: Letter-spacing scales inversely with text size.
- Criteria: large headings carry negative tracking (-0.01 to -0.05em); small/caption text not tightened; body text left at normal tracking; one tracking scale reused.
- Weight: **M**

**C-21 · Platform-appropriate font stacks**
- Source: PLATFORM-COMPARISONS typography table (iOS system-only, Android Roboto, web Inter/system-ui); iOS YAML `system_fonts_only`.
- Demand: Each platform's native type convention is honored.
- Criteria (web audit): font stack starts `Inter`/`system-ui`; mobile web doesn't fake SF Pro/Roboto by loading lookalikes; headings/body use the same family system.
- Weight: **L**

### Theme E — Layout & Visual Polish

**C-22 · Nested border-radius formula**
- Source: PLAYBOOK "Craft → `/nested-border-radius`" (outer = inner + padding); PATCH-CHECKLIST; QUICK-REFERENCE troubleshooting.
- Demand: Concentric rounded corners stay optically parallel.
- Criteria: card-inside-card radii follow outer = inner + padding (e.g., 20 = 12 + 8); no nested corners with equal or inverted radii.
- Weight: **M**

**C-23 · Group spacing ratio (2× rule)**
- Source: PLAYBOOK "Interface → `/group-spacing-ratio`"; PATCH-CHECKLIST "Group spacing follows 2x rule".
- Demand: Whitespace encodes hierarchy — gaps between groups ≈ 2× gaps within groups.
- Criteria: section-to-section spacing ≈2× item-to-item spacing; consistent spacing scale (8pt-ish); related controls visibly cluster.
- Weight: **M**

**C-24 · Shadows, not borders (layered, ≤3 levels)**
- Source: PLAYBOOK "Craft → `/shadows-not-borders`"; PATCH-CHECKLIST "Shadows follow layered approach (3 levels max)".
- Demand: Depth is expressed with soft layered shadows; borders are not fake elevation.
- Criteria: cards/modals use layered box-shadows; hairline borders only for separation, not depth; ≤3 distinct elevation levels app-wide.
- Weight: **M**

**C-25 · Noise texture on large surfaces**
- Source: PLAYBOOK "Craft → `/noise-textures`"; PATCH-CHECKLIST "Noise textures on large gradients (<3% opacity)".
- Demand: Big flat/gradient areas get subtle grain to prevent banding.
- Criteria: hero/gradient areas show ≤3% grain or clean non-banding gradient; texture never reads as dirt at mobile width.
- Weight: **L**

**C-26 · Image outlines**
- Source: PLAYBOOK "Craft → `/image-outlines`" (offset inner frame, ~8% opacity).
- Demand: Media gets a subtle inner frame for polish.
- Criteria: avatars/thumbnails have a faint inset ring/outline; frame works on both light and dark backgrounds.
- Weight: **L**

**C-27 · Scroll margin for anchored content**
- Source: PATCH-CHECKLIST "Scroll margin-top matches header height"; PLATFORM-COMPARISONS web nav snippet (`scroll-margin-top: 80px`).
- Demand: Anchor jumps never hide content under a fixed header.
- Criteria: sections have `scroll-margin-top` ≥ fixed-header height; deep-link/anchor navigation lands with heading visible.
- Weight: **L**

### Theme F — Microcopy

**C-28 · UI writing patterns**
- Source: PLAYBOOK "Interface → `/writing-patterns`" (4 rules); QUICK-REFERENCE daily commands.
- Demand: Buttons verb-first; confirmations specific; step labels consistent; toggles positively framed.
- Criteria: buttons state the action ("Save draft", not "OK"); destructive dialogs name the object ("Delete project", not "Delete"); ONE step-forward word app-wide ("Continue" OR "Next"); toggles phrased as the positive behavior ("Send read receipts", not "Disable read receipts"); sentence-case UI text consistent.
- Weight: **H**

### Theme G — Platform & Navigation Conventions

**C-29 · Navigation pattern fidelity**
- Source: PLAYBOOK "Android → `/android-navigation`" (bottom bar ≤5 items, labels required); PLATFORM-COMPARISONS "Navigation Patterns" table; android YAML `bottom_navigation_max_5_items`.
- Demand: Primary/secondary nav, modals, and back behavior follow platform idiom.
- Criteria: at 390px, if bottom tab bar exists it has ≤5 labeled items; web at 1440px shows navbar/sidebar appropriately; modal style matches idiom (sheet vs dialog); browser back never traps or loops the user.
- Weight: **M**

**C-30 · Mobile-native web fixes**
- Source: PLAYBOOK "Emil → `/mobile-native`" (tap highlight, safe areas, 100vh bug, keyboard); iOS YAML `tap_highlight_removal`, `safe_area_insets`.
- Demand: Web app must not feel broken on phones.
- Criteria: `-webkit-tap-highlight-color` handled; `env(safe-area-inset-*)` respected at 390px (no content under notch/home bar); no 100vh viewport jump with keyboard; inputs ≥16px so iOS doesn't zoom.
- Weight: **M**

**C-31 · Gesture & interaction feedback integrity**
- Source: PLAYBOOK "Android → `/android-gestures`" (ripple mandatory, never block back without alternative).
- Demand: Every clickable element acknowledges input; system navigation always works.
- Criteria: all clickable elements have hover/active/focus feedback (ripple-equivalent on touch); no custom gesture hijacks scroll/back; edges swipe back to previous view on mobile web.
- Weight: **L**

### Theme H — Design Philosophy & Engineering Judgment

**C-32 · Performance is design**
- Source: PLAYBOOK "Craft → `/performance-is-design`"; PLATFORM-COMPARISONS footer ("prioritizing performance over novelty").
- Demand: Speed and perceived speed treated as design features.
- Criteria: loading skeletons/spinners designed (not blank flash); interactions respond <100ms or optimistically; no layout shift on image/font load (CLS ≈ 0); heavy screens usable on slow devices.
- Weight: **H**

**C-33 · Novelty budget**
- Source: PLAYBOOK "Craft → `/novelty-budget`" ("save wow factors for rare moments"); PATCH-CHECKLIST "Novelty budget reviewed".
- Demand: Delight is rationed; the default experience stays utilitarian.
- Criteria: ≤2 signature/novel effects in the whole app; core flows (auth, data entry, lists) decoration-free; no trend-chasing effects (e.g., ubiquitous glassmorphism) without purpose.
- Weight: **M**

**C-34 · Taste / timelessness over trends**
- Source: PLAYBOOK "Craft → `/taste-is-trained`"; PATCH-CHECKLIST "Timelessness check (avoid trending effects)"; scenario 3/5 usage.
- Demand: Judged against durable quality, not this quarter's fashion.
- Criteria: coherent visual language across all screens (one accent system, one elevation system, one radius scale); pixel-clean alignment at both widths; survives comparison with benchmark 2026 products (Linear/Vercel-grade).
- Weight: **M**

**C-35 · Library selection quality**
- Source: PLAYBOOK "Emil → `/pick-ui-library`" (maintenance, TS support, bundle size, a11y score, community); recommendation list (Radix, Sonner, Headless UI).
- Demand: Don't reinvent accessible primitives; pick trusted, small, maintained libraries.
- Criteria: dialogs/toasts/tooltips come from proven primitives (Radix/Headless/Sonner or equivalent) rather than hand-rolled; dependencies actively maintained; no heavyweight UI kit where a primitive would do.
- Weight: **M**

---

## 3. CONTRADICTIONS & TENSIONS (listed explicitly, not resolved)

1. **Touch-target floor conflict (internal numbers disagree):** Craft `/hit-areas` says desktop 40×40 and touch 44×44; PLATFORM-COMPARISONS and README recommend "48×48 universal"; yet PATCH-CHECKLIST (the web gate actually used at audit time) says "minimum 44×44px". A web app at 44px is PASS by one rule and a "safe" FAIL by another.
2. **Press-scale ambiguity + wrong trigger in the worked example:** PLAYBOOK CSS uses scale 0.96; PLATFORM-COMPARISONS roadmap says 0.95–0.98; sample-component.tsx uses 0.98 — and applies it as `hover:scale-[0.98]`, while every other source defines press feedback on `:active`. The library's own example demonstrates the rule on hover, not press.
3. **Two competing authorities for web UI:** README/PLAYBOOK decision flowcharts say Web → Craft/Interface skills, but PLAYBOOK Scenario 1 ("New iOS App Setup") runs `/apple-design --platform=web --standards=wwdc` and Emil's apple-design explicitly applies iOS HIG to web apps. Which canon governs a web app (iOS feel vs web standards) is unresolved.
4. **Easing absolutism drift:** PLAYBOOK scopes the ban to "user-triggered actions" (`ease-in` for exit/decorative easing is not addressed); QUICK-REFERENCE pre-launch says "No ease-in anywhere". The stricter reading bans a broader set of motion.
5. **Color methodology triangulated, then both demanded:** PLAYBOOK presents OKLCH (math accuracy), semantic tokens (maintainability), and dynamic M3 (personalization) as competing "choose based on needs" systems; PATCH-CHECKLIST then requires OKLCH space AND semantic naming simultaneously. Meanwhile the Interface token examples themselves contain raw hex values (`#7C3AED`) inside an architecture whose stated rule is purpose-based naming (and PATCH-CHECKLIST says "instead of hex/RGB").
6. **Typography enforcement conflict:** PATCH-CHECKLIST demands "No system fallback fonts (.woff2 enforcement)" — reading literally, `system-ui` in a stack is a violation; PLATFORM-COMPARISONS' own recommended web stack is `'Inter', system-ui, -apple-system, sans-serif` (system fallbacks), and iOS guidance says "system fonts only". Whether system fonts are best practice or a checklist failure depends on which file you trust.
7. **Inventory/doc drift:** README, PLAYBOOK and SUMMARY file-structure diagrams all list `DECISION-GUIDE.md`, which does not exist on disk. SUMMARY.md says "Core Documentation (3 files)" while CHECKLIST.md says 4 core docs; SUMMARY claims "6 template files" (disk: 4) and sizes (~25KB playbook, ~1KB README, ~2KB quick-ref) that don't match disk (29.3KB / 3.8KB / 4.6KB). Auditor should trust disk, not the docs' self-description.
8. **Platform-uniform durations vs platform-specific physics:** The duration table is identical across platforms (150/300/400/600ms) while easing physics intentionally differ (stiff spring vs bouncy spring vs cubic-bezier). Cross-platform brand consistency vs platform-native feel is a standing tension the library never settles.
9. **Authority attribution inaccuracy:** The 44px web touch target is attributed to "WCAG 2.1 AA"; WCAG 2.1 AA does not define a 44px target (44px is AAA-level 2.5.5; 2.1 AA has no comparable minimum). The audit bar is stricter than the cited authority — keep the library's bar, note the citation is wrong.

---

## 4. PLATFORM MATRIX (from PLATFORM-COMPARISONS.md + QUICK-REFERENCE.md; Web column governs the LokAI audit)

| Rule | iOS | Android | Web |
|------|-----|---------|-----|
| Touch target min | 44×44 pt | 48×48 dp | 44×44 px (lib recommends 48 universal) |
| Default motion | Stiff spring `.spring(response: 0.3)` | MediumBouncy spring `dampingRatio: 0.5` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Never use | ease-in | ease-in | ease-in |
| Durations (press/modal/page/complex) | 150 / 300 / 400 / 600 ms | same | same |
| Color system | Semantic tokens | M3 13+ tonal roles, wallpaper-dynamic | OKLCH and/or semantic tokens |
| Dark mode | Separate palette, auto-syncs | Separate palette, auto-adapts | Media query + manual override required for control |
| Typography | System fonts only (SF Pro) | Roboto (M3) | `.woff2` only + tabular-nums + text-wrap + smoothing |
| Primary nav | NavigationBar | TopAppBar | Navbar / Header |
| Secondary nav | TabView / Drawer | BottomBar (≤5, labeled) / Drawer | Sidebar / Drawer |
| Modal idiom | Sheet presentation | Modal bottom sheet | Dialog overlay |
| Back behavior | Swipe gesture | Back button + edge swipe + predictive | Browser history |
| Input feedback | Haptics | Ripple mandatory | Hover + focus-visible |
| A11y labels | `accessibilityLabel` | `contentDescription` | `aria-label` |
| Contrast min | 4.5:1 | 4.5:1 | 4.5:1 |
| Reduced motion | Respect | Respect | `@media (prefers-reduced-motion)` |
| Web-only fixes | — | — | `scroll-margin-top` = header height; `env(safe-area-inset-*)`; tap-highlight removal; 100vh fix |

---

## 5. AUDIT GUIDANCE (how to weight and combine for a single app)

- **Accessibility is a gate, not a theme.** A FAIL on any of C-01/C-02/C-03 caps the whole audit at PARTIAL regardless of polish — the library marks `/accessibility` "⭐ ESSENTIAL" and every checklist file treats it as must-pass.
- **Suggested theme weights:** Accessibility 25% · Motion 20% · Color 12% · Typography 12% · Layout/visual polish 10% · Microcopy 8% · Platform/nav conventions 8% · Philosophy & performance 5%. Within a theme, High-weight entries count double Medium, triple Low.
- **Verdict per criterion, both viewports.** Mobile-dependent criteria (C-02, C-29, C-30) can legitimately PASS at 1440px and FAIL at 390px — record per-viewport verdicts, overall verdict = worse of the two.
- **Screenshot first, code to confirm.** Radius/spacing/shadow/contrast verdicts come from screenshots; timing, easing, `transition: all`, paste-blocking, reduced-motion, and token naming must be confirmed in React/TS source — motion is unverifiable from stills alone.
- **Don't average away failures.** One FAIL in a High-weight criterion caps its theme at PARTIAL; report caps explicitly instead of blending them into a numeric score.
- **"PASS at 2026 market level" ≠ bare compliance.** Bare compliance = rules met. Market level = the app would not look out of place beside Linear/Vercel-grade products: real token architecture (no inline hex), one coherent easing system, re-tuned dark mode, specific microcopy, designed loading states, and restrained signature motion. A compliant-but-generic app earns PARTIAL on C-34.
- **Absence of motion can be a PASS.** C-08 rewards restraint; an app with no animations FAILs nothing motion-wise if what exists is correct. More animation is never more quality.
- **Use the right internal source of truth.** PATCH-CHECKLIST.md is the web gate spine; CHECKLIST.md is the library's own package-completion QA and must NOT be read as app criteria; where files disagree (§3), apply the stricter numeric value and note the conflict in the audit.
