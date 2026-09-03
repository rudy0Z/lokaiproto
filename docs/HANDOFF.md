# LokAI Session Handoff

**Last updated:** 2026-09-04. **Read this first**, then `MOBILE_AI_SYSTEM.md` (the design spec), `MOBILE_SCREENS.md` (the whole mobile shape, screen by screen), and `LLM_DESIGN_SYSTEM.md` (the build sheet) before writing any screen.

## Upgrade Phases 1–6 COMPLETE — 2026-09-03/04 (ZCode sessions, commits d2a074f → 91adc1f)

The three DESIGN_AUDIT findings are closed on mobile. What landed, per phase:

- **P1 Foundations** — `src/app/ui/motion.tsx` (FadeRise/Stagger/WorkingDots/ShimmerLine/Skeleton/StageTransition/NumberTicker/useHaptic); WCAG contrast gate in verify-demo.mjs (parses `--role-*` from BOTH themes, fails <4.5:1 text / <3:1 UI); `data/statusVocabulary.ts` (one source for all state labels + Badge tones — never hand-write a status string); dead exports deleted (WorkflowTrustPanel, FilingPacketPreview, GuidancePreferences, InlineLinkButton, FailureStateCard render, CitationStamp).
- **P2 Chat-first spine** — clarify middle (first consumer exchange asks purchase date; the ANSWER ROUTES the next turn: in-window → explain, >2yr → statute-expiry stop, unsure → disclose; localized EN/HI/MR/TA); working card in action-voice + Skip, collapsing in place to an audit line that opens the audit sheet; response chips open TOOL SHEETS (verify/plan/packet/audit/escalation, contained); 'Step N of 6' killed; stream motion + guarded auto-scroll (scrollViewportRef through Screen→AppScreen).
- **P3 Composer + primitives** — CitationChip (section-first "S.2(10)", +N overflow, non-interactive mode for rows) in TurnCitations + notice fields; dead CitationStamp deleted; Composer attach affordance + AttachmentChip tray (canSend counts attachments); Textarea/Switch promoted (Textarea forwardRefs); 'Jump to latest' scroll pill.
- **P4 Voice** — extractEntities → VoiceFactChips at confirm on /mobile/voice AND case intake (tap chip selects its words in the editable transcript — Textarea forwardRef); VoiceOrb live amplitude envelope (simulated, reduced-motion aware); desktop mic 650→1100ms; specimens voice-capture (loop) + voice-unclear.
- **P5 Dark theme (mobile only)** — `[data-theme="dark"]` in index.css: navy ground #0E1A2B, cream becomes ink AND anchor (L5 flips), stop ground warm-luminous (L8), paper stays #FBF9F3 both themes. C palette re-pointed to var(--role-*) (theme = role re-point, zero call-site edits); VoiceOrb resolves literals at animation time (motion can't interpolate var()); Turn mode tints on --turn-bg-* vars; theme state (light/dark/system) in ConversationContext, MobileShell applies data-theme, Profile row cycles. Contrast gate enforces BOTH themes.
- **P6 Seam closed** — LokAIWorkflow fully on the law: GroundingMeter/ProgressList/ActionPlan/Checklist ground-level; ALL twin buttons → primary+quiet; all left stripes dead; CoveragePill → Badge; ReviewGate border-only, Copy primary + Print quiet; Scratchpad gated CTA on Button (behavior unchanged) + its input focus ring fixed (was 2.46:1 saffron); Turn border-only + zone-1 serif Fraunces 22 (Indic: sans w500) + zone-1 caps label deleted; Clarify options → HairlineRows; Unsupported twins → primary+quiet; retired BottomNav deleted; last 11 mobile hex literals → roles (incl. StatusBar/HomeIndicator stop-ground bug in dark).

**Validation 2026-09-04:** verify:demo 10/10 (contrast both themes), typecheck clean, build green, ratchet **686 → 573**. Zero mobile left-stripes / border+shadow pairs / raw hex in screens. Catalog deep links all resolve. Reduced-motion verified per primitive.

**Remaining:** mobile Phase 8 (skeletons on tool sheets, focus craft, icon-era unification — case file + MobileHome still import Lucide, haptics on gate-unlock/stop-ack, specimen refresh) after the owner's 390px both-themes eyeball pass. **Desktop Phase 7 is a SEPARATE STAGE** (owner's call): rail → live document canvas, desktop stop composition, Notice/Draft/Documents tokenization, own detail+QA. Cut list holds: no library imports, no regenerate/branch, no streaming theater, no duration badges, no RN, no real OCR/network.

## Consistency sweep + readiness — 2026-08-27 (pre-upgrade, historical)

Swept the remaining visible mobile surfaces to the premium system:
- **Lucide → Phosphor** in `MobileConsumerCase` and `ai/Turn` (the last two visible
  mobile files on Lucide). Only `MobileHome`'s dead chrome exports (`TopNav`/`BottomNav`,
  unrendered) still import Lucide. Desktop (12 files) is deliberately out of scope.
- **Removed the last mobile left-stripes** (`MobileConsumerCase` guardrail + unsupported
  cards, `Turn` mode card).
- **Fixed the shared case CTA row** — was a navy primary + an outlined "Review" twin on
  every stage (the double-button tell). Now one primary `Button` + a quiet "Ask for human
  review" text link. Lifts every case stage at once.
- **De-carded `IntakeView` and `ClarifyView`** — removed the big bordered outer card; the
  serif question/heading is the focal move on the ground.

Debt: 695 → **686**. All gates green.

### Readiness — every mobile route walked 2026-08-27

**Fully built + premium-migrated:** Home (chat canvas), Drawer, Files/exhibits, Profile,
Voice, and case `assess` / `verify` / `packet` (notice-as-paper) / `failure`×8 (full-bleed
stop). Clarify + the shared CTA now on the system.

**Built + functional, on the system's chrome but internals still legacy-ish:** case
`intake` (voice state machine inline), `plan` (`WorkflowActionPlan`), `audit`
(`AuditTrailList`), `escalation` (`HumanReviewCard`), the `packet` intent-preview gate,
and the `?notice=` assessment card. They render correctly with the new top bar/drawer/
fonts/icons/CTA, but their inner components (in `LokAIWorkflow.tsx`) are hand-composed,
not on primitives.

**Stubs / not built (known):** drawer search is decorative; the in-chat `NoticeInterpret`
(§3.8a founding feature) is not built — `?notice=` shows the older assessment card, not
the paper-with-clause-linking flow; voice's two specimens (`voice-capture`,
`voice-unclear`) unbuilt; the two fact stores are consistent but not unified; the
`Original` view in the exhibit sheet is a shell.

**Every route renders without error** — all 11 stages, 8 failures, EN/HI/MR/TA, and the
four standalone surfaces. The consumer journey is walkable end to end.

## Premium pass — fonts, icons, shadows, the stripe — landed 2026-08-27 (latest)

Audited the design against a "vibecoded tells" checklist. Root cause of the generic
feel: LokAI leaned on the four most generic UI signals (Lucide, Inter, borders-on-
everything, soft drop shadows) plus the colored left stripe, where premium refs (Wkeel/
Gemini) separate with space + tone and spend decoration on one confident thing. Fixes:

- **Font: Inter → Hanken Grotesk** (self-hosted `@fontsource`, warm high-legibility
  grotesque). Multilingual architecture untouched — Indic still renders in Noto Sans
  Devanagari/Tamil per `ui/script.ts`; verified a Hindi screen renders and harmonizes.
- **Icons: Lucide → Phosphor** (`@phosphor-icons/react`, `weight={ICON_WEIGHT}`='regular').
  Swapped across the migrated surfaces (top bar, drawer, files, profile, voice, stop).
  Legacy files (MobileConsumerCase internals, dead MobileHome chrome, desktop) still on
  Lucide — a later sweep; `ICON_STROKE` kept deprecated for them.
- **Shadows → contact shadows + "border OR shadow, never both".** `SHADOW.sm/md`
  reworked from `0 8px 24px` glows to tight warm two-layer contact shadows. `Card` and
  `ExhibitPaper` dropped their borders (the shadow lifts them); stop-theme cards use a
  raised fill instead (shadows are invisible on dark).
- **Killed the colored left stripe** on the active-matter card — the single most generic
  pattern. "Live" now reads from a small filled status dot + the progress rail, not a
  decorative edge. (~14 more `borderLeft` stripes remain in legacy/desktop files.)

Two new deps installed (`@phosphor-icons/react`, `@fontsource/hanken-grotesk`). Gates
green; debt rebaselined. Build sheet updated (`LLM_DESIGN_SYSTEM.md` → "Typography, icons
& elevation"). Still-generic tells remaining are copy em-dashes (#9) and the legacy
Lucide/stripe holdouts.

## Navigation redesign — drawer, not tabs — landed 2026-08-27 (latest)

Product-owner directive: adopt the modern AI-chat mobile pattern (ChatGPT / Gemini /
Claude, and the Wkeel legal-AI reference). **The bottom tab bar is gone; the left drawer
is the whole navigation surface.** Grounded against 2025 industry practice (see
`MOBILE_SCREENS.md` "Navigation model").

New infrastructure: `DrawerProvider` (`context/DrawerContext.tsx`, in `MobileShell`),
`MobileTopBar` (hamburger · wordmark · new-chat — no language chip), and `AppScreen`
(wraps `<Screen>`, injects the top bar + drawer, drops the bottom nav). Every mobile
screen now uses `AppScreen`.

- **Home is a minimal chat canvas** — centred mark + "What can I help you sort out?" +
  quick-start pills + pinned composer. The greeting, active-case card, and past-matters
  list were **removed from home and moved into the drawer** (`MatterDrawer` now opens
  with a greeting header; it already carried the active matter and past matters). ~180
  lines of now-dead home components deleted.
- **`MobileTopBar` replaces the `TopNav` language-chip header** everywhere. Language is
  set in onboarding / Settings; the drawer's Language row routes to Profile.
- **Screens migrated to `AppScreen`:** Home, Files, Profile, Voice. `MobileConsumerCase`
  (manual artboard) had its `TopNav`→`MobileTopBar` and `BottomNav`→drawer swapped in
  place; it keeps its own `HeaderBar` (stage rail) below the top bar.
- The old `TopNav` / `BottomNav` exports still exist in MobileHome but are now unused by
  any screen — safe to delete in a later sweep.

Debt: 696 → **695** (the deleted home components were already on primitives, so the win
here is dead-code removal, not raw-color reduction). Gates green.

Known rough edge: the case screen shows `MobileTopBar` (hamburger) *and* `HeaderBar`
(back arrow + stage) — two bars. Works, slightly heavy; a later pass could fold the stage
into the top bar's context line.

## Home migration — landed 2026-08-27 (later)

`MobileHome`'s screen body is now on the system. The shared chrome exports
(`StatusBar`/`TopNav`/`BottomNav`/`HomeIndicator`/`MobileRouteCanvas`/`LanguageBottomSheet`),
imported by 6 files, were **left untouched on purpose** — rewriting them risks every
screen and is its own pass.

- `HomeArtboard` → `<Screen>`; the floating composer moved from `position:absolute` into
  the pinned `action` slot, which removes the mid-screen dead zone as a structural
  consequence (content flows from top, composer+nav anchored at bottom).
- `LegalSignalBand` **deleted** — the triple-gradient card with the 38px grid overlay (the
  only grid texture on mobile) is gone; its one line survives as a quiet lead in the empty
  state, and the language pills it carried duplicated the top-nav language chip.
- `ActiveCaseCard` de-gradient'd — clean `Card` with a token step-timeline, no saffron
  radial or navy border. `GreetingSection` → `pronounce`. `SuggestionChips`,
  `ConsumerCaseStart`, `PastMattersList` (→ `HairlineList`), `SectionHead` all on primitives.

Debt: 744 → **696 raw-style lines**. Gates green. Remaining legacy is now just the shared
chrome exports, the smaller case stages, and the `LokAIWorkflow` internals.

## Screen migration pass — landed 2026-08-27

Executed the four external critiques plus a screen-by-screen migration.

- **Fact stores unified (Critique 2).** The consumer scenario's `facts` is now the one
  canonical source; `getVerificationFacts` derives from it via `factToVerification`;
  `VerificationScratchpad` is **controlled** (reads live props, writes through
  `DemoContext`) — which also fixes the old copy-to-local-state no-sync bug. Confirming a
  fact on verify now settles it everywhere. The 5-vs-6 divergence is gone.
- **Touch feedback (Critique 4).** `HairlineRow` had `background:'none'` inline, which
  beat `.lokai-pressable`, so the press never painted. New `.lokai-row` / `.lokai-row-flag`
  classes (no inline bg) give every interactive row a real `:active` depress.
- **Packet de-boxed (Critique 3).** New `DemandNoticePaper` — the demand notice rendered
  as a physical page (ruled texture, letterhead, clause-highlighted amount + basis). The
  packet went from ~9 stacked containers to: autonomy decision → the notice → consent
  gate → follow-ups gated behind approval. Glossary card + disclaimer suppressed on packet
  so the document leads.
- **Stop states full-bleed (Critique 1, money shot).** New `MobileStopScreen` uses
  `Screen tone="stop"` — the whole artboard goes dark (L6/L8), refusal in 28px serif, the
  safe action is the one bright button, "continue anyway" absent for absolute (human-
  required) stops. Early-returned for the failure stage before any lit chrome renders.
- **Profile rebuilt** — leads with "Need a human?", settings as hairline rows, dropped two
  dead links (`/mobile/onboarding/2`, `/mobile/login`), the three plan cards, the navy
  gradient, and the hardcoded artboard (was clipping in embed). 5 cards → 0.
- **Voice rebuilt** — on `Screen`, phase-driven, the two trust moments (editable transcript
  at `confirm`, refuse-to-guess at `unclear`) intact; shared `VoiceOrb` for listening.

Debt: 806 → **744 raw-style lines, 21 files** (Voice + Profile fully off; the five new
components — DeviceFrame, ExhibitPaper, MatterDrawer, DemandNoticePaper, MobileStopScreen —
are all at 0). `paper` role token added. Gates green (`verify:demo` + `typecheck` + `build`).

**Still legacy / next:** `Home` full migration (greeting done, 970-line chrome file not —
its own pass, highest traffic), the smaller case stages (`intake`/`clarify`/`plan`/`audit`/
`escalation`), and the `LokAIWorkflow` shared internals (`EvidenceLocker`,
`VerificationScratchpad` body — controlled and correct, but hand-composed, not on
primitives). Voice's two specimens (`voice-capture`, `voice-unclear`) still unbuilt.
`MOBILE_SCREENS.md` has the per-screen plan and current status markers.

## Foundation pass + Documents — landed 2026-08-26 (later)

Second session of the day. Plan: `~/.claude/plans/fix-the-verification-facts-sorted-hummingbird.md`.

1. **The verification gate has a real catch again.** `getVerificationFacts()` flags
   `purchaseDate` (`needs_review`) and `getEvidenceLocker()` marks the WhatsApp chat
   `conflicting` — one story: invoice reads 6 June, seller chat reads 8 June, the user
   decides. Three docstrings had claimed this for weeks while all data shipped
   `confirmed`; the CTA opened before the user touched it. `demoScenarios` `purchase-date`
   set `disputed` to keep the two fact stores from contradicting each other in one scroll.
   Also dropped `setDraftApproved(true)` from verify's `onConfirmed` — it was pre-approving
   the draft and bypassing `ReviewGate`.
2. **Answers are 22px (`answer`), not 28px.** `AssessmentView` migrated onto the system
   (fixes its Hindi rendering as a side effect). 28px `pronounce` now reserved for the
   refusal sentence and the home greeting — audited the other serif call sites to match.
3. **Device frame.** `components/mobile/DeviceFrame.tsx`, wired once in `MobileRouteCanvas`,
   `DEVICE` token in `shared.tsx`. Frames all five screens in dev/standalone; `IS_EMBED`
   short-circuits so the portfolio never double-frames. The artboard was always a correct
   19.5:9 iPhone ratio — it just had no chrome to read as a phone. Specimen page takes a
   `frame` flag (off on the chrome-less system-proof specimens).
4. **Documents = exhibits.** `MobileFiles.tsx` fully rebuilt on the system (0 raw-style
   lines, was 66): mono reference, paper thumbnail by kind (`components/mobile/ExhibitPaper.tsx`,
   adapted from the desktop `DocThumbnail` craft, theme-safe), what-it-proves, provenance,
   grouped by matter, the conflicting exhibit the one filled row. Detail sheet has the
   `In plain words` / `Original` toggle (§3.8a) — clause-linking is the notice pass. Added
   `proves` + `kind` to `EvidenceItem`.
5. **`MOBILE_SCREENS.md`** — the whole mobile shape, all five screens, with build order.

Debt ratchet: 823 → 806 raw-style lines, 23 → 22 files (MobileFiles fully migrated).
`verify:demo` shadow guard now also allows the `DEVICE.` token. **Not committed** —
clean-gated, awaiting review.

**Flagged, not fixed** (each its own decision, listed in the plan file): the two
disconnected fact stores should be unified; `VerificationScratchpad` copies props to
local state with no sync (`LokAIWorkflow.tsx:855`); `MobileFiles` no longer routes to the
invalid `?stage=answer`, but that dead stage handling still exists elsewhere. Detail
sheet's `Original` view is a shell (verified by structure + typecheck, not screenshot —
Chrome MCP was down). Next screens, in order: Home, then case `verify`/`failure`/`packet`,
Profile, Voice, then the notice interpreter (`MOBILE_SCREENS.md` has the per-screen plan).

## Where things stand — 2026-08-26 (earlier — the system build)

The component-craft gap below (diagnosed 2026-08-25) turned out to have a structural
cause, not a taste cause. Two external audits plus a code-level verification pass found
the same thing from different directions: **the codebase had a token layer and domain
components, and nothing in between.** No `<Text>`, no `<Screen>`, no `<Card>` with a
stated test. Every screen hand-composed every element, so every rule in
`MOBILE_AI_SYSTEM.md` §1 had to be re-implemented at every call site, and it drifted
wherever `verify-demo.mjs` was not looking.

Three things were silently wrong because of it, all verified in code:

1. **Per-script typography never applied outside the chat turn.** `[lang="hi"]` /
   `[lang="ta"]` rules exist in `index.css` and no component has ever set a `lang`
   attribute — a repo-wide grep returns one unrelated prop. `AssessmentView` renders
   zone 1 in Fraunces (no Indic glyphs) at `lineHeight: 1.28` in every language. The
   flagship screen could not prove the founding thesis.
2. **The stop state is a dark card in a lit sandwich.** `FailureStateCard` renders
   inside the scroll container; the status bar, top nav, header and cream ground stay
   lit around it. L6 says full-bleed, and it could not be, because nothing owned the
   chrome.
3. **The tokens contradict themselves.** `TYPE` is rem; `Btn` and `InputField` hardcode
   13/14/15px, opting every control out of Phase 1's Dynamic Type work.

**Built 2026-08-26 — `src/app/ui/` (layers 2 and 3):**
`theme.ts` (semantic role tokens over a new role layer in `index.css`), `script.ts`
(script typography promoted out of `Turn.tsx`), `primitives.tsx`
(Text/Label/Amount/Button/IconButton/Badge/Field + the screen-tone context),
`layout.tsx` (Screen/Stack/Row/Rule/Card/HairlineList/HairlineRow). Theme safety,
script safety and tone safety now come free and cannot be forgotten.

Enforcement widened: `scripts/ui-debt.mjs` is a per-file **ratchet** on raw colour,
font-family and line-height. Baseline **823 raw-style lines across 23 files**; budgets
may only fall. Wired into `npm run verify:demo`.

Proof specimens at `/#/specimen/system-answer`, `system-script`, `system-stop` —
an answer screen with one container / one label / one CTA, the same screen in Hindi,
and the same system refusing. Zero inline styles in all three.

**First component on the system — `MatterDrawer`** (`components/mobile/MatterDrawer.tsx`),
built against the product owner's references (ChatGPT / Gemini mobile drawers + the Wkeel
legal-AI concept). Zero raw colour, family or leading; specimen at `/#/specimen/nav-drawer`.
Structure and the reference read (what was taken, what was rejected, and the one
deliberate departure — the active matter anchors the drawer, not "New chat") are in the
file's own docstring.

**Data bug found while building it — not yet fixed, needs a decision.**
`getVerificationFacts()` in `caseWorkflow.ts` documents itself as "at least one is
intentionally flagged needs_review so the catch is visible", and **all five ship
`confirmed`**. `getEvidenceLocker()`'s `conflictNote` also claims the seller-chat
screenshot disagrees with the invoice date "which is what the purchaseDate fact above is
actually flagging" — but that fact says the dates agree. So the anti-hallucination gate,
which is D-01 and the headline decision card in the case study, currently demos with
nothing to catch. Fixing it changes what the verify screenshot shows, so it is the
product owner's call, not a silent edit.

**Open decision:** answer type size. `ROLE_TYPE` now separates `answer` (22px) from
`pronounce` (28px, reserved for the refusal sentence and the home greeting). The current
`AssessmentView` uses 28px for answers. Confirm before migrating that screen.

**Not done:** no production screen has been migrated yet. Documents/exhibits art
direction still pending. The interaction model for notice interpretation is resolved —
see `MOBILE_AI_SYSTEM.md` §3.8a.

---

## The original diagnosis (2026-08-25) — kept for context

The user looked at a live specimen (the fact-verification screen) and said, unprompted, that if the current UI is the final design it's **"pure AI slop."** Pushed for specifics with a real screenshot, then asked directly: *"the rework was supposed to be all components wise and token wise? you never though components wise?"*

**The honest answer, confirmed by re-reading my own plan: no, I never thought component-wise, and that's a real gap in the plan itself, not just execution.** Every phase in the plan file is scoped around *measurable* problems — contrast ratios, dead transitions, broken inputs, missing fonts, things a script can verify as fixed. Look at the phase titles: "Craft rebuild: **color, contrast, tokens**." "**Motion** & interaction craft." None of them ask "is this component's actual visual composition distinctive, or does it read as generic AI-generated boilerplate?" That question was never asked systematically this whole session — it only surfaced because the user put a screenshot in front of the model and forced it.

**This is now the top priority. Do not continue into Phase 3/4 (or treat this as optional/separate) until a real component-level visual-craft pass has happened** — not another token pass, a pass that asks of every component: does this specific visual decision serve the product, or is it a generic pattern that could belong to any SaaS form?

### Worked example — `VerificationScratchpad` (`LokAIWorkflow.tsx:766-985`), fully diagnosed, not yet fixed

Concrete findings, from the real code, not just the screenshot:

- **The folded-corner card treatment** (line 804): `borderRadius: '${xs} ${panel} ${panel} ${panel}'` (one sharp corner, three rounded) + `borderTop: 3px solid navy` (line 803). That's the entire "decoration" — an asymmetric corner cut with a colored top border. It represents nothing, and no other component in the app uses this shape language, so it doesn't read as a system, it reads as a one-off flourish.
- **Two redundant progress indicators, back to back.** `GroundingMeter` (lines 819-826) renders "Claims checked against sources — N of M" with its own bar. Four lines later (829-840), a second bar renders "N of M confirmed" — same number, restated, directly underneath.
- **The fact-row list** (843-963): a plain bordered box per fact, colored left border, caps-label/value pair, check+pencil icons. Functionally sound, visually the most generic "editable review list" pattern that exists — indistinguishable from a checkout flow or a KYC form. Nothing ties it to legal, India, voice, or trust.

This is a **template for what to look for elsewhere**, not an isolated bug. The same shared vocabulary (`shared.tsx`'s card/badge/button/chip patterns) almost certainly repeats this — `ReviewGate` (same file, right after `VerificationScratchpad`), `Turn.tsx`'s zones, `FailureStateCard`, `NoticeAssessmentCard`, the mobile screens' own inline card styles. None of them have been audited with this lens yet. Only the tokens they use (color, type size) have been touched.

### How to run this pass

- **Treat it as in-scope by default.** The user has said, repeatedly and across multiple turns, that visual craft and not looking generic is non-negotiable. Don't ask "is this in scope" when a component is plainly generic — that question already got a direct correction this session. Fix it.
- Go component by component through `shared.tsx`'s shared vocabulary first (it's the multiplier — one fix there touches every consumer), then `LokAIWorkflow.tsx`, then page-level inline styles (`MobileConsumerCase.tsx`, `MobileHome.tsx`, etc.).
- For each one, ask: does this specific decision (a corner treatment, a redundant element, an icon choice, a spacing pattern) serve *this product*, or would it look identical on a checkout page? If it's the latter, that's the thing to change.
- Checkpoint with a screenshot after each component, not after the whole pass — this matches the user's own stated working style (see `feedback_scope_narrowed_to_case_studies` memory: a prior build-ahead-then-review pass was judged "lifeless, 0 pixel perfection").
- This is additive to the plan file, not a replacement — the plan's phases (contrast, motion, architecture) are still correct and still needed. This is a new, missing dimension on top of them.

## What this project is

Full-depth rework of LokAI (Indian legal-AI prototype) as the flagship case study of a 1-week portfolio push for a job-hunting fresher. Two repos:
- `D:\portfolio porjects\Lokaifm-main` — the real prototype (Vite/React, hash-routed). **This session's repo.**
- `D:\Portfolio` — the Next.js portfolio + case study + embed pipeline. **Explicitly out of scope right now** — the user said not to worry about the embed/case-study page until this rework lands; a separate session handles portfolio work per this project's own session-split convention.

## The plan file — authoritative implementation detail

**`C:\Users\rudra\.claude\plans\gleaming-imagining-minsky.md`**

This handoff is the summary; that file is the source of truth — phase-by-phase reasoning, exact file:line references, the founding-thesis/positioning/business-model decisions log, risk list, and verification steps. Read it before touching Phase 3 or 4. Don't duplicate its content here; if something here and there disagree, the plan file wins unless this doc is newer.

## State: what's actually done vs. not

7 commits since the pre-session checkpoint (`339d9f8`), clean working tree:

```
34accd1 Specimens: self-label + correct native width
5d80bdb Phase 2: specimen system + dev harness
42d0285 Audit fixes: sheet containment, plain-language copy, voice artboard
014c573 Phase 1c: voice becomes an input mode, jurisdiction leads, real composers
2249ee2 Phase 1b: shared sheet primitive, real stage transitions, typecheck gate
b110ef6 Phase 0+1: routing fixes, WCAG contrast, Dynamic Type, and real Noto loading
339d9f8 Checkpoint: full working tree (pre-session)
```

**Done:** Phase 0 (reconcile, routing, hygiene), Phase 1 (contrast, Dynamic Type, real Noto font loading, plain-language copy), Phase 1b (shared animated `Sheet` primitive, direction-aware stage transitions, `VoiceOrb` crossfade, sane reduced-motion), Phase 1c (voice promoted from destination to input mode, jurisdiction surfaced on home, real composers replacing inert mock inputs), Phase 2 (specimen system at `/specimen/:id` + dev harness at `/dev`).

**Not started:** Phase 3 (decision-graph manifest + diagram — portfolio-side) and Phase 4 (the actual case-study page rewrite — portfolio-side, the thing that turns all of this into a case study).

**Loose ends inside phases marked "done" — real gaps, not covered elsewhere:**

| Item | Plan called for | Reality |
|---|---|---|
| 1c-6, notice interpretation on mobile | A deliberate decision either way | Never decided. `Notice.tsx` is still desktop-only, silently. |
| 1c-7, onboarding screen | Real, interactive (jurisdiction + language, no persona picker) | Not built — only the *decision* made it into the plan file. |
| 1c-7, saved-matters hub | One static populated screen | Not built. |
| Phase 2, `voice-capture` / `voice-unclear` specimens | Plan explicitly called these "arguably the single most differentiating specimen available" | Missing from the registry. 9 specimens exist; these two, the ones the plan flagged as most important, aren't among them. |
| 1b-6, haptics | Marked stretch | Correctly skipped, not a gap. |

## Things worth knowing that aren't in the plan file

- **`npm run typecheck` didn't exist before this session.** Added `typescript` + `tsconfig.json` because a deleted token (`SHADOW.saffronGlow`) shipped as a silent `undefined` at runtime — nothing caught it until this was added. It's clean now (0 errors) and should be run alongside `verify:demo` and `build` before every commit going forward, not treated as optional.
- **`vite preview` will show a blank page here — this is not a regression.** The build's `base` is `/embed/lokai/` (for the portfolio), so `npm run preview` 404s its own assets at the root. Use `npm run dev` (base `/`) for all local testing. Cost real time to diagnose once; shouldn't need to again.
- **Two mobile "composers" were pictures of inputs, not real ones**, discovered mid-session: `FloatingInput` was a `<button>` with a decorative mic and a decorative send arrow; `MobileInputDock` was an `<svg>` and a `<span>`. Neither had a working textarea. Both now render the real voice-wired `Composer`. Worth remembering because it means mobile text/voice input is genuinely new territory in this codebase, not a repeat of a proven pattern — watch for edge cases.
- **The language picker offered 12 languages when only 4 have content.** Built `LANGUAGE_REGISTRY` in `languagePacks.ts` (single place to add a language, `prepared` flag) — unsupported ones now show as designed-not-built instead of silently falling back to English mid-conversation.
- **Specimens self-label as of the last commit.** Opening one cold with no surrounding case-study copy read as "an unexplained form" — confirmed directly by the user. Every specimen now shows its source screen/component name above it by default; `?label=0` strips it for a clean capture. If Phase 4 embeds specimens without checking this still reads right, that's a regression.
- **Dev servers may or may not still be running** depending on whether the machine/session restarted: `npm run dev` on `:5173` is the one to use. Start it fresh if `curl localhost:5173` doesn't respond.

## Suggested next steps, in order

1. **Component-level visual-craft audit and fix pass** (see above) — start with `VerificationScratchpad`, already fully diagnosed above, ready to fix without further investigation. Then `ReviewGate`, then the rest of `LokAIWorkflow.tsx`, then `shared.tsx`'s shared vocabulary, then page-level components.
2. Decide 1c-6 (notice interpretation on mobile) explicitly — the plan gives two acceptable answers, pick one.
3. Build the `voice-capture` / `voice-unclear` specimens Phase 2 was supposed to include.
4. Onboarding screen + saved-matters hub (1c-7) — recommendations are in the plan file, not yet confirmed by the user.
5. Phase 3 (manifest + decision graph) — can run in parallel with anything above, portfolio-side.
6. Phase 4 (case-study page rewrite) — the hard sink; needs 1–3 done first, and now also needs the component-craft pass done first, since Phase 4 will be *showing off* these components.

## Verification, every time

```bash
npm run verify:demo && npm run typecheck && npm run build
```
Then, if the portfolio embed needs refreshing: `node scripts/sync-embeds.mjs lokai` from `D:\Portfolio`.
