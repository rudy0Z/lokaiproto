# LokAI Design Audit — MOBILE (390px) Scorecard

Auditor of record: AutoCoder mainline (completed after 3 mobile-auditor subagent runs failed to
provider instability; their write-first skeleton was completed by mainline). Method: deterministic
code inspection (PowerShell greps + file reads over `D:\portfolio porjects\Lokaifm-main\src`),
pixel-quantized palettes of 7 live screenshots (vision model hard-down all session — noted per
criterion), against the 35-criteria catalog in `skill-catalog.md`. Verdicts use the catalog's
weighting/caps guidance; confidence H/M/L marks evidence strength.

## A. MOBILE VERDICT MATRIX (35/35)

| C-ID | Skill | Verdict | Evidence | Conf | Reason |
|---|---|---|---|---|---|
| C-01 | WCAG 2.1 AA | **PASS** | aria-* ×80; real `<button>`s (primitives.tsx L300/331/514/608); :focus-visible saffron 3.83:1 (index.css:287); --text-tertiary fixed to 5.40:1 (index.css:20-22 comment); verify-demo contrast gate parses BOTH themes | H | Semantic elements + gated contrast + visible focus. 44px-target attribution error noted (catalog §3.9) |
| C-02 | Touch targets ≥44 | **PASS** | theme.ts M.tap='44px', ctaHeight 50px ("the one thing a stressed user must hit"); LAYOUT.touchTarget 44px; CTA is 50px tall | M | Token-enforced. Pixel-verification of every icon button not possible without vision; icon-btn 32px variant exists on desktop Chat only |
| C-03 | Reduced motion | **PASS** | Global block index.css:304-313 (kills transforms/loops, keeps 150ms color/opacity); useReducedMotion pairing in motion.tsx (18 hits app-wide) | H | Philosophy documented: "gentler equivalent, not zero feedback" |
| C-04 | Never block paste | **PASS** | onPaste hits: 0 | H | Trivially clean |
| C-05 | Easing canon | **PARTIAL** | MOTION.ease = cubic-bezier(0.22,1,0.36,1) single token (shared.tsx:153); springs reserved for summoned surfaces (motion.tsx header rule 3); ONE ease-in: Chat.tsx:40 toast-exit 0.18s | H | Consistent system + spring/bezier split is coherent; canonical 0.4,0,0.2,1 not used; ease-in on a user-dismissed exit violates the strict reading (catalog contradiction §3.4) |
| C-06 | Duration discipline | **PASS** | MOTION ladder 120/180/220/280ms; FadeRise 240ms; toast 200/180ms; nothing >600ms | H | All bands respected |
| C-07 | Explicit animated props | **PARTIAL** | transition:all ×0; named props everywhere; ONE layout animation: grid-template-rows expand (shared.tsx:521) | H | grid-template-rows is a height-class layout animation the library bans; everything else compositor-friendly |
| C-08 | Motion restraint | **PASS** | "The entrance recipe is deliberately one" (motion.tsx header); loops only as progress semantics (shimmer 1.6s, dots 1.3s); springs damped 0 on product-driven state ("overshoot on a refusal would be unearned") | H | Exemplary restraint mapping |
| C-09 | Interruptibility | **PASS** | CSS transitions + motion/react springs retarget natively; one-shot keyframes only on toasts | M | Code-architecture judgment; not runtime-tested |
| C-10 | Tactile press | **FAIL** | whileTap ×0; :active blocks (shared.tsx L398-508) shift background/shadow only; no scale 0.95-0.98 anywhere | H | Library demands visible press transform; bg-shift alone is under the 2026 bar (catalog contradiction §3.2 — but even the loosest reading wants scale) |
| C-11 | Trigger-origin | **PASS** | transformOrigin: 'center bottom' (Sheet, shared.tsx:841), 'left center' (primitives.tsx:787); bottom sheets scale from edge | M | Origin tokens set at the right anchors |
| C-12 | Subtle exits | **PASS** | toast exit 0.18s/-4px vs enter 0.2s/+6px (Chat.tsx:39-41); FadeRise exit = soft fade | M | Exit quieter + shorter than entrance ✓ |
| C-13 | Stagger | **PARTIAL** | staggerDelay step=0.06 = 60ms (motion.tsx:113); reduced-motion-safe via FadeRise | H | 60ms exceeds the 30-50ms band; caps not evidenced |
| C-14 | Shared-layout | **N/A-mobile** | layoutId ×0; no filtering/reordering grids or segmented controls on mobile journey | — | No qualifying pattern exists to judge |
| C-15 | Icon morph | **PASS** | @animateicons animated set in ui/icons.tsx (chrome/gestures) per AGENTS.md icon tiers; no flash-swap pattern found | M | Tiered icon system documented; morph quality unverifiable without vision |
| C-16 | Semantic tokens | **PASS** | T.* "named by job, never by hue" (theme.ts:27); every value a CSS var; call sites never touch raw values; C.* is palette-definition-only, documented | H | Exemplary — gate-enforced repo-wide |
| C-17 | Dark mode = re-tuned | **PARTIAL (mobile 2/3)** | [data-theme=dark] role layer (index.css:197); appearance light/dark/system in Profile (ConversationContext.tsx:32,150) applied by MobileShell.tsx:19; contrast gate parses dark | H | Re-tuned role layer ✓ + mobile toggle ✓; BUT preference not persisted (no localStorage) and system-only default resets each load |
| C-18 | OKLCH | **FAIL** | oklch ×0; palette is hex/rgba sRGB (index.css:7-56) | H | Library gate demands OKLCH with hex fallback; contradiction §3.5 noted (hex also appears in the library's own examples) |
| C-19 | Web typography | **PARTIAL** | @fontsource woff2 + font-display:swap ✓; tabular-nums ×2 (primitives.tsx:131,181); text-wrap ×0; font-smoothing ×0; families: Fraunces+Hanken+JBMono+NotoDeva+NotoTamil = 5 (>2, script-necessity) | H | Swap+subset ✓; balance/pretty and smoothing missing; family count over letter-of-law but justified by EN/HI/MR/TA scope (market-lens: a strength) |
| C-20 | Tracking discipline | **PASS** | TYPE: display -0.02em → editorial -0.01em; micro/label +0.08/+0.09em uppercase (shared.tsx:38-60) | H | "Tighten big, loosen small" followed exactly |
| C-21 | Platform font stacks | **PARTIAL** | Deliberate Hanken Grotesk (not Inter/system-ui) with documented anti-generic rationale (fonts.css:9-16) | H | Violates letter of "stack starts Inter/system-ui"; defensible taste decision (contradiction §3.6) |
| C-22 | Nested radius | **PARTIAL** | Radius roles exist (control 8 / panel 16 / card 16); card-inside-card at equal 16px violates outer=inner+padding where it occurs | L | Formula risk visible in tokens; actual nesting frequency unverifiable without vision |
| C-23 | Group spacing 2× | **PASS** | M.slotGap 32 vs M.zoneGap 16 = exactly 2× (theme.ts:99-105); S-scale 4→128px consistent | H | The mobile grammar bakes the ratio in |
| C-24 | Shadows not borders | **PARTIAL** | Layered 2-layer contact shadows, "border OR shadow, never both" doctrine (shared.tsx:269-285); but 5 elevation values (xs/sm/md/lg/float) vs ≤3 guidance | H | Doctrine is stronger than the library's; count slightly over |
| C-25 | Noise texture | **N/A-mobile** | heroCanvas radial gradients low-alpha; no noise layer; banding unverifiable without vision | — | No evidence of banding; no noise either |
| C-26 | Image outlines | **N/A-mobile** | No photographic media in the deterministic app (by design: no uploads); documents are rendered paper | — | Nothing to frame |
| C-27 | Scroll margin | **FAIL** | scroll-margin ×0; headerH 56px fixed | L | No in-page anchors found (nav is hash-routed screens), so impact ≈ zero today — technical miss only |
| C-28 | UI writing | **PASS** | "Add a document", "Edit the transcript before submitting", "Not yet", "Choose language", "Reading the document…" — verb-first, specific, sentence case | M | Sampled across MobileConsumerCase/Files/NoticeInterpret |
| C-29 | Nav fidelity | **PASS** | Drawer-as-primary-nav (documented: "drawer is the whole nav — no bottom tab bar"); hash-router back behavior native; sheets for modals | M | Drawer is a platform-idiomatic primary nav; ≤5-item tab bar rule not triggered |
| C-30 | Mobile-native web fixes | **FAIL** | tap-highlight ×0; env(safe-area-inset) ×0; 100vh ×17 vs dvh ×4 (MobileHome still 100vh×1); composer textarea 12px (Turn.tsx:933 TYPE.caption 0.75rem) < 16px → iOS focus-zoom | H | The single hardest mobile FAIL: 3 of 4 sub-criteria unaddressed |
| C-31 | Gesture feedback | **PASS** | All interactive elements carry hover/active recipes (shared.tsx:392-509); no scroll/gesture hijack found | M | Web ripple N/A |
| C-32 | Performance is design | **PASS** | Shimmer skeleton (motion.tsx MOTION_CSS); zero images (CLS≈0); lazy routes (dynamic imports ×15); self-hosted swap fonts; deterministic no-network demo | H | Designed loading states + ratchet-gated repo |
| C-33 | Novelty budget | **PASS** | Signature set = FadeRise entrance + paper/device-frame metaphor; no glassmorphism/trend effects | H | Budget respected |
| C-34 | Taste over trends | **PASS** | One anchor role ("the single dark, saturated role" theme.ts), one elevation doctrine, one entrance; anti-generic font rationale documented | H | The app's strongest suit — coherent authored language |
| C-35 | Library selection | **PASS** | cmdk + sonner (both on the library's recommended list); motion/react; hand-rolled Switch has role="switch" + aria-checked (primitives.tsx:514-518) | H | Primitives from proven sources where it matters |

**Tally: PASS 20 · PARTIAL 8 (C-05, C-07, C-13, C-17, C-19, C-21, C-22, C-24) · FAIL 4 (C-10, C-18, C-27, C-30) · N/A 3 (C-14, C-25, C-26) → 20+8+4+3 = 35. Coverage 35/35.**

## B. SCREEN-BY-SCREEN WEAKNESSES (mobile)

| Screen | Top issues | Severity |
|---|---|---|
| Onboarding | C-30 no safe-area/tap-highlight handling; C-10 no press scale on the primary CTA (50px tall but bg-only feedback) | Med |
| Home | C-30 100vh still used (×1) — keyboard/viewport jump risk; C-19 no text-wrap balance on editorial headline; palette confirms single-accent restraint (trend gap vs 2026 "expressive accents" — see recruiter verdict) | Med |
| Notice (interpret) | C-30 composer text 12px → iOS zoom on focus; C-13 60ms stagger slightly hot | High (composer is the core interaction) |
| Voice | C-10 mic well is the one animated anchor — press scale absent makes it feel flat vs its "pressed into the page" intent (micWell token exists; transform doesn't) | Med |
| Case | C-17 appearance resets (no persistence) — dark mode users re-choose every session; C-24 nested 16px panels inside 16px cards on workflow rows | Med |
| Files | Palette anomaly: renders DARK (#001020 56.8%) while all other mobile screens are light — reads as either the stop/evidence motif (stopGround token, "tonal opposite" doctrine theme.ts L8) or a consistency bug; **intent must be verified with the author**; if deliberate, document it in the case study — it's a good story either way | High (flag) |
| Profile | C-30 no safe-area under home-indicator zone; Switch has correct aria (PASS note) | Low-Med |

## C. TOP 5 THEMED DEEP DIVES

1. **Mobile-native hardening is missing (C-30, FAIL, High).** No `env(safe-area-inset-*)`, no tap-highlight removal, 12px composer text zooms on iOS focus, 100vh in 10 files. This is the gap a recruiter FEELS in 30 seconds on a real phone — and the fix is a one-afternoon patch.
2. **Press feedback lacks the physical cue (C-10, FAIL, High).** The whole system is built on a "paper on desk" physical metaphor (contact shadows, micWell "reads as pressed into the page") — but controls don't scale on press, so the one metaphor that would sell the design is under-expressed. `:active { transform: scale(0.97) }` + 120ms MOTION.press on `.lokai-pressable`/buttons closes it.
3. **Color pipeline is 2021-grade under a 2026-grade token system (C-18, FAIL).** Semantic roles are exemplary, but they resolve to sRGB hex. The library's OKLCH gate exists precisely for equal-lightness accents across the 4 scripts/washes LokAI already juggles. Migrating `--role-*` values to oklch() (with hex fallback lines) is mechanical and would future-proof the contrast gate.
4. **Dark mode is architecturally ready but UX-fragile (C-17, PARTIAL).** Role-layer re-theming is the right architecture and the contrast gate already checks dark; but the preference evaporates on reload (no persistence) and desktop has no toggle at all. One `localStorage` read + a desktop switch finishes the job.
5. **Micro-motion polish is 80% there (C-05/C-07/C-13 PARTIALs).** One ease-in exit, one grid-template-rows animation, 60ms stagger — three single-line fixes away from a fully canonical motion system.

## D. BEFORE→AFTER IMPROVEMENTS (mobile)

| # | Before (observed) | After (target) | How | Skill |
|---|---|---|---|---|
| 1 | No safe-area handling; content can sit under notch/home-indicator | All fixed bars pad with `env(safe-area-inset-top/bottom)` | Add to AppScreen header/footer shells + composer clearance calc | C-30 |
| 2 | Tap highlight flashes on Android/old iOS | `-webkit-tap-highlight-color: transparent` globally + :active states carry feedback | One line in index.css reset (feedback already exists) | C-30 |
| 3 | Composer text 12px → iOS zooms input on focus | Composer textarea ≥16px | Turn.tsx:933 → `TYPE.body.size` (0.875rem=14px still zooms; use 1rem) or set `font-size:16px` on focus | C-30 |
| 4 | 100vh in 10 files (17 uses) | `100dvh` with `100vh` fallback everywhere | sed-level swap; MobileHome + shells first | C-30 |
| 5 | :active changes bg only | Press scale 0.97 + bg shift | Add `transform: scale(0.97)` to `.lokai-btn-*:active` and `.lokai-pressable:active` with existing MOTION.press | C-10 |
| 6 | toast-exit uses ease-in | Exit uses MOTION.ease | Chat.tsx:40 → `cubic-bezier(0.22,1,0.36,1)` | C-05 |
| 7 | grid-template-rows expand animation | opacity+transform reveal (or keep, documented as the one sanctioned layout animation) | shared.tsx:521 — wrap content in FadeRise-style reveal instead | C-07 |
| 8 | 60ms stagger | 40ms stagger, cap 10 items | motion.tsx:113 default step 0.06→0.04 | C-13 |
| 9 | Appearance resets every load | Persisted theme (localStorage + system default) | Read localStorage in ConversationContext initializer; write in setAppearance | C-17 |
| 10 | sRGB hex role values | OKLCH role values + hex fallback | Convert 25 --role-* values in index.css; keep verify:demo contrast gate as the referee | C-18 |
| 11 | No text-wrap balance on editorial headings | `text-wrap: balance` on display/editorial roles | One addition to typeStyle() for display roles | C-19 |
| 12 | Files-screen dark canvas unexplained | Either document as "evidence locker = tonal opposite" motif or normalize to light | Verify intent; if deliberate, add a caption in the case study + specimen entry | C-34 |

## E. MOBILE RECRUITER VERDICT (2026)

LokAI mobile reads as **systems-thinking evidence, not a dribbble shot — and that is exactly the 2026 differentiator**. Recruiters skim in 2-3 minutes with ~78% AI-assisted pre-screening (thefountaininstitute.com), and what survives that skim here is rare: a governed token system with enforcement gates, bilingual EN/HI/MR/TA typography with script-aware line-heights, transparency-first AI surfaces (grounded claims, stop states, human-review gates) that map one-to-one onto the 2026 AI-native bar (radical transparency, HITL approval, escalation paths — smashingmagazine.com, aiuxplayground.com). Legal-tech grounding with citations answers the field's #1 trust demand (factor.law; hallucinated-case-law risk). Outcome framing in the case study must lead with that hierarchy (muz.li) or the craft evidence stays invisible.

What keeps it from a clean "hire" signal on first touch: the mobile experience **feels less physical than its own design philosophy** (no press-scale on a paper-metaphor UI), **misses the phone-native basics** a senior reviewer checks in seconds (safe areas, tap highlight, 16px inputs), and its restraint can read as *timidity* next to 2026's expressive-accent baseline unless the case study explicitly frames restraint as the trust design choice. Top 5 standout gaps: (1) no safe-area/input-zoom hardening, (2) no press physics, (3) dark mode fragility, (4) sRGB pipeline under a modern token story, (5) unexplained Files-screen darkness. Five quickest wins: press-scale one-liner, safe-area padding, 16px composer, toast ease swap, localStorage persistence — roughly one focused day, all gate-verifiable via the repo's own `verify:demo`.

## F. EVIDENCE LOG

- Screenshots (7, 390×844, light): mobile-onboarding/home/notice/voice/case/files/profile.png — palette-quantized (vision model down all session; 6+ attempts with backoff). Structure findings from palette data only.
- Code inspected: ui/theme.ts, ui/motion.tsx, ui/primitives.tsx, components/shared.tsx, styles/index.css, styles/fonts.css, shells/MobileShell.tsx, context/ConversationContext.tsx, pages/Chat.tsx, components/ai/Turn.tsx, pages/mobile/* (grep-level), scripts referenced via AGENTS.md.
- Greps: whileTap 0; :active 10; transition:all 0; oklch 0; text-wrap 0; font-smoothing 0; scroll-margin 0; tap-highlight 0; safe-area 0; env( 0; onPaste 0; aria-* 80; focus-visible 10; prefers-reduced-motion/useReducedMotion 19; layoutId 0; 100vh 17 / dvh 4; tabular-nums 2 (primitives.tsx:131,181).
- Lower confidence: C-09 (not runtime-tested), C-15 (morph quality needs eyes), C-22 (nesting frequency needs eyes), C-29 (back-stack behavior assumed native hash routing).
- Palette data: palette-analysis.txt (deterministic, reproducible).
