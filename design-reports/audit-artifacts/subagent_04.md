# LokAI Design Audit — DESKTOP (1440px) Scorecard

Auditor of record: AutoCoder mainline (completed after 2 desktop-auditor subagent runs failed to
provider instability). Method: identical to the mobile scorecard — deterministic code inspection +
pixel-quantized palettes of 6 live screenshots (vision model hard-down), against the 35-criteria
catalog. Desktop-specific evidence noted per criterion; mobile-only parts marked N-A-desktop.

## A. DESKTOP VERDICT MATRIX (35/35)

| C-ID | Skill | Verdict | Evidence | Conf | Reason |
|---|---|---|---|---|---|
| C-01 | WCAG 2.1 AA | **PASS** | Same system as mobile: aria-* ×80, real buttons, :focus-visible saffron 3.83:1 (index.css:287-295), tertiary ink restored to 5.40:1 (index.css:20-22), contrast gate parses both themes | H | Gated, not aspirational |
| C-02 | Desktop controls ≥40px | **PARTIAL** | Primary CTAs and rows pass; BUT `.icon-btn` is 32×32 (Chat.tsx:47-49) — under the 40px desktop minimum | H | Observed violation on a real control class |
| C-03 | Reduced motion | **PASS** | Global block index.css:304-313 + useReducedMotion pairing (19 hits) | H | Same as mobile |
| C-04 | Never block paste | **PASS** | onPaste ×0 | H | Clean |
| C-05 | Easing canon | **PARTIAL** | Single MOTION.ease token cubic-bezier(0.22,1,0.36,1); spring/bezier split documented; toast-exit ease-in (Chat.tsx:40); canonical 0.4,0,0.2,1 unused | H | One-line fix from canon |
| C-06 | Duration discipline | **PASS** | 120/180/220/280ms ladder; toasts 200/180; nothing >600ms | H | Ladder respected |
| C-07 | Explicit animated props | **PARTIAL** | transition:all ×0; one grid-template-rows expand (shared.tsx:521) | H | Otherwise named props only |
| C-08 | Motion restraint | **PASS** | "The entrance recipe is deliberately one"; loops only as progress semantics | H | Exemplary |
| C-09 | Interruptibility | **PASS** | CSS transitions/springs retarget natively | M | Architecture judgment |
| C-10 | Tactile press | **FAIL** | whileTap ×0; :active shifts bg/shadow only, no scale (shared.tsx L398-508) | H | Same gap as mobile — system-wide |
| C-11 | Trigger-origin | **PASS** | Sheet origins 'center bottom' (shared.tsx:841), CommandPalette/Menu origins set (primitives.tsx:787) | M | Anchored correctly |
| C-12 | Subtle exits | **PASS** | Toast exit 0.18s/-4px < enter 0.2s/+6px; FadeRise soft-fade exit | M | Compliant |
| C-13 | Stagger | **PARTIAL** | staggerDelay step 0.06 = 60ms > 30-50ms band (motion.tsx:113) | H | One-number fix |
| C-14 | Shared-layout | **N/A-desktop** | layoutId ×0; no filter/reorder grids or sliding segmented indicators on desktop screens | — | Pattern absent |
| C-15 | Icon morph | **PASS** | Animated icon set (ui/icons.tsx) for chrome; three-tier icon doctrine (AGENTS.md) | M | Tier discipline documented |
| C-16 | Semantic tokens | **PASS** | T.* role system, CSS-var resolved, call sites clean; raw hex found in only 3 non-system spots (LegalTerms.tsx:219 #FFF9F1 wash, Sidebar.tsx:317 #FFFFFF, Turn.tsx:64 comment-only) | H | Two one-off lapses, gate-documented otherwise |
| C-17 | Dark mode re-tuned | **FAIL (desktop)** | [data-theme=dark] role layer exists (index.css:197); contrast gate checks it; BUT application lives in MobileShell.tsx:19 ONLY — desktop routes never set data-theme, no desktop toggle exists (appearance UI is Profile/mobile-only) | H | Dark palette unreachable on desktop even with OS dark preference — baseline 2026 miss |
| C-18 | OKLCH | **FAIL** | oklch ×0; sRGB hex/rgba palette | H | Same as mobile |
| C-19 | Web typography | **PARTIAL** | @fontsource woff2 + font-display:swap ✓; tabular-nums on numeric Text primitives (primitives.tsx:131,181); text-wrap ×0; font-smoothing ×0; 5 families (script-necessity) | H | Two one-line gaps |
| C-20 | Tracking discipline | **PASS** | display -0.02em … micro +0.08em; "tighten big, loosen small" exact | H | — |
| C-21 | Platform font stacks | **PARTIAL** | Deliberate Hanken Grotesk anti-Inter choice, documented (fonts.css:9-16) | H | Contradiction §3.6 noted |
| C-22 | Nested radius | **PARTIAL** | panel 16 inside card 16 in places (Draft document panel pattern); outer=inner+padding not enforced | L | Frequency unverifiable without vision |
| C-23 | Group spacing 2× | **PASS** | S-scale consistent; sectionGapY S[9] vs cardGap S[4] (96 vs 16 = 6× at section level) | H | Hierarchy encoded |
| C-24 | Shadows not borders | **PARTIAL** | "border OR shadow, never both" contact-shadow doctrine (stronger than library); 5 elevation values vs ≤3 | H | Doctrine beats rule; count over |
| C-25 | Noise texture | **N/A-desktop** | heroCanvas 4-layer radial gradient (low alpha); no banding evidence at palette resolution; no noise layer | — | Monitor for banding on large monitors |
| C-26 | Image outlines | **N/A-desktop** | No photographic media by design | — | — |
| C-27 | Scroll margin | **FAIL** | scroll-margin ×0 while headerH 56px fixed (DesktopShell); dev catalog + documents are anchor-heavy | L | Real on Documents/Dev sections |
| C-28 | UI writing | **PASS** | Verb-first, specific labels sampled app-wide ("Add a document", "Not yet", "Reading the document…") | M | — |
| C-29 | Nav fidelity | **PASS** | Sidebar 240/64px collapse tokens (LAYOUT.sidebarOpen/Shut) = canonical web idiom; hash-router back native; drawer only on mobile | M | — |
| C-30 | Mobile-native fixes | **N-A-desktop** | Mobile-only criterion; desktop-side gaps (scroll-margin) counted at C-27 | — | — |
| C-31 | Gesture feedback | **PASS** | Hover/active/focus recipes on all interactive classes (shared.tsx:392-509) | M | — |
| C-32 | Performance is design | **PASS** | 15 lazy routes; zero images (CLS≈0); shimmer skeleton; swap fonts; deterministic demo | H | — |
| C-33 | Novelty budget | **PASS** | One signature flourish (heroCanvas washes) + paper metaphor; no trend-chasing | H | — |
| C-34 | Taste over trends | **PASS** | One anchor role, one elevation doctrine, one entrance recipe; anti-generic type rationale | H | Strongest suit |
| C-35 | Library selection | **PASS** | cmdk (CommandPalette), sonner toasts, motion/react; hand-rolled Switch properly ARIA'd | H | — |

**Tally: PASS 19 · PARTIAL 8 (C-02, C-05, C-07, C-13, C-19, C-21, C-22, C-24) · FAIL 4 (C-10, C-17, C-18, C-27) · N/A 4 (C-14, C-25, C-26, C-30) → 19+8+4+4 = 35. Coverage 35/35.**

## B. SCREEN-BY-SCREEN WEAKNESSES (desktop)

| Screen | Top issues | Severity |
|---|---|---|
| Dashboard (Home) | C-10 press physics on hero CTAs; C-19 no text-wrap balance on display headline; palette: rich two-tone (49% canvas + 17% cream + 15% navy sidebar) — restraint reads muted vs 2026 expressive baseline | Med |
| Chat | C-02 icon-btn 32px; C-05 toast ease-in exit; C-30-adjacent composer text 12px if reused responsively | High |
| Notice interpreter | C-24 nested-panel radius risk around document viewer; dark-red halt accent is semantic (fine) but single 0.2% pixel share — verify it reads at a glance | Low-Med |
| Draft | C-22 16px document panel inside 16px card radii; C-27 anchor jumps under fixed header | Med |
| Documents | C-27 scroll-margin ×0 with document lists; C-19 tabular-nums coverage on counts | Med |
| Dev (specimens) | 94.6% single neutral — tonally flat; internal tool so low weight, but it's the screen recruiters may see in process shots | Low |
| Shell-wide | C-17 no theme application/toggle on desktop — OS-dark users always get light; C-10 no press scale anywhere | High |

## C. TOP 5 THEMED DEEP DIVES

1. **Dark mode is architecturally complete but desktop-dead (C-17, FAIL).** The re-tuned role layer, the both-theme contrast gate — all built. Then `root.dataset.theme` is set only inside MobileShell's effect. A recruiter reviewing on a dark-OS laptop sees a light-only app; 2026 sources call dark mode a baseline (stan.vision, fuselabcreative.com). Fix is ~10 lines: move the appearance effect to a shared provider and add a sidebar-footer segmented control.
2. **The physical metaphor lacks its final cue (C-10, FAIL).** Contact shadows, "pressed into the page" micWell, paper tokens — the whole language says *physical desk*, then buttons don't compress under the pointer. One `:active` transform closes the loop between philosophy and feel.
3. **sRGB under a semantic-role story (C-18, FAIL).** The token architecture is the portfolio's headline; its values are 2021-grade. OKLCH migration is mechanical (25 CSS vars) and makes the app's multi-hue wash system equal-lightness by construction.
4. **Icon buttons under-size (C-02, PARTIAL).** 32px `.icon-btn` in Chat violates the 40px desktop floor; visible in the highest-traffic screen.
5. **Editorial typography missing its last 5% (C-19/C-27, PARTIAL/FAIL).** Variable Fraunces with tuned axes is genuinely 2026; but no `text-wrap: balance` on display roles, no antialiasing declaration, no scroll-margin under the fixed header — three one-liners.

## D. BEFORE→AFTER IMPROVEMENTS (desktop)

| # | Before (observed) | After (target) | How | Skill |
|---|---|---|---|---|
| 1 | Desktop routes never apply theme; no toggle | Theme applied app-wide + desktop toggle | Hoist appearance effect from MobileShell to a top-level provider; add segmented Light/Dark/System control in DesktopShell sidebar footer | C-17 |
| 2 | Preference resets on reload | Persisted | localStorage read in ConversationContext init, write in setAppearance | C-17 |
| 3 | `.icon-btn` 32×32 | 40×40 hit area | Chat.tsx:48 width/height → 40px (visual glyph can stay 20px) | C-02 |
| 4 | bg-only :active | Press scale 0.97 | Add transform to .lokai-btn-*:active and .lokai-pressable:active with MOTION.press 120ms | C-10 |
| 5 | sRGB hex roles | OKLCH roles + hex fallback | Convert --role-* block in index.css; verify:demo contrast gate stays the referee | C-18 |
| 6 | No text-wrap balance | balance on display/editorial roles | typeStyle() addition, display roles only | C-19 |
| 7 | No font smoothing | antialiased globally | -webkit-font-smoothing: antialiased on body | C-19 |
| 8 | toast-exit ease-in | MOTION.ease | Chat.tsx:40 one-line swap | C-05 |
| 9 | 60ms stagger | 40ms | motion.tsx:113 step 0.06→0.04 | C-13 |
| 10 | No scroll-margin | scroll-margin-top: 72px (56 header + 16) on anchored sections | index.css utility + apply to Documents/Dev section headings | C-27 |
| 11 | grid-template-rows expand | opacity/transform reveal | shared.tsx:521 recipe swap (or document as sanctioned exception) | C-07 |
| 12 | Tabular numerals only on primitives | Extend to every counter/stat context | Audit Draft/Documents counters; apply TYPE with tabular override | C-19 |

## E. DESKTOP RECRUITER VERDICT (2026)

On desktop, LokAI's first impression is **authorship**: a two-tone paper-desk world with a fixed navy sidebar, editorial Fraunces display over a warm grotesque, restrained washes, and an evidence-first workflow (verification gates, grounded claims, stop states). That maps directly onto the 2026 standout signals: visible systems thinking and design-system governance (thecrit.co; uxdesign.cc "AI-generated design systems need human strategy" — LokAI's is human-governed with enforcement scripts), AI-native trust surfaces that match the table-stakes bar (transparency, HITL approval, escalation), and legal-AI grounding discipline that answers the field's hallucination risk (factor.law; wiley.law). Shipped-and-traceable beats polished-mockup in 2026 hiring (thefountaininstitute.com), and this repo is aggressively traceable: every design law is a script.

What undercut it at review time: **dark mode unreachable on desktop** (a 2026 baseline miss that takes 30 seconds to notice), **no press physics** (the interface feels more static than its philosophy promises), 32px icon targets on the chat screen, and the sRGB pipeline. None are structural — all sit in the "last 5%" band, and four of the five are one-line or one-afternoon fixes. Top 5 standout gaps: desktop dark-mode dead path, press scale, icon-btn size, OKLCH, editorial text-wrap/smoothing. Five quickest wins: theme provider hoist + sidebar toggle, `:active` scale, icon-btn 40px, toast ease swap, text-wrap balance. With those applied, the desktop experience would sit credibly beside Linear/Vercel-grade 2026 products on *feel*, while its governance story already outranks most of them on *substance*.

## F. EVIDENCE LOG

- Screenshots (6, 1440×900, light): desktop-dashboard/chat/notice/draft/documents/dev.png — palette-quantized only (vision model down; 6+ attempts).
- Code inspected: shells/DesktopShell.tsx (grep: 4×100vh), pages/Chat.tsx (icon-btn, toasts), components/shared.tsx (TYPE/MOTION/LAYOUT/SHADOW/press recipes), ui/theme.ts, ui/motion.tsx, ui/primitives.tsx, styles/index.css (tokens, focus, reduced-motion, dark layer), styles/fonts.css, context/ConversationContext.tsx (appearance state), components/ai/Turn.tsx (composer).
- Distinctive desktop findings: MobileShell-only theme application (MobileShell.tsx:19); icon-btn 32px (Chat.tsx:47-49); raw hex lapses ×2 non-system (LegalTerms.tsx:219, Sidebar.tsx:317); scroll-margin 0; 5-family type system.
- Lower confidence: C-09 (not runtime-tested), C-15 (morph quality needs eyes), C-22 (nesting frequency needs eyes), C-25 (banding needs eyes on real monitors).
