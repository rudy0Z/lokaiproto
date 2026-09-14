# LokAI Audit Implementation Plan

A full audit was completed in the prior turn (mobile + desktop, UI/frontend, product/flows, pixel perfection, motion). This plan covers the **15 Tier 1 + Tier 2 items** the user approved, organized into 4 sequential waves. Each wave is independently shippable, ends with verification, and respects the design system rules in `MOBILE_AI_SYSTEM.md`.

---

## Wave A — Foundation fixes (low-risk)

**Goal:** Eliminate the smallest regression sources and unblock the structural work in later waves. No visible UI rewrites.

**A1.** Drop `transform: hover-lift` from `pages/Home.tsx`. Remove inline `onMouseEnter/Leave/MouseDown/Up` on the HeroInput mic + send buttons and the `.quick-chip:hover { transform: translateY(-1px) }` rule (lines 96–105). Apply `className="lokai-pressable"` so the system owns hover. **File:** `src/app/pages/Home.tsx`.

**A2.** Delete the blanket reduced-motion override at `Home.tsx:142-149`. The global `@media (prefers-reduced-motion: reduce)` in `src/styles/index.css:323-331` already handles this correctly. **File:** `src/app/pages/Home.tsx`.

**A3.** Replace the literal `rgba(255,255,255,0.07)` in `Card`'s stop variant (Tier2 #12). Add `--role-stop-raised` to `src/styles/index.css` light + dark blocks (`rgba(255,255,255,0.07)` / `rgba(248,245,238,0.06)`); add `T.stopRaised` to `src/app/ui/theme.ts`; update `src/app/ui/layout.tsx:357`. **Files:** `index.css`, `theme.ts`, `layout.tsx`.

**A4.** Replace hand-styled Skip/Retry buttons in `MobileVoiceActive.tsx:103-105` and `MobileConsumerCase.tsx:336-346, 391-399` with `<Button variant="quiet" size="sm">`.

**A5.** Inline `SidebarAura` (one-function-for-one-div anti-pattern) — `src/app/components/Sidebar.tsx:46-54`.

**A6.** Drop unused deps from `package.json`: `@mui/material`, `@mui/icons-material`, `@popperjs/core`, `react-popper`, `react-dnd`, `react-dnd-html5-backend`, `react-slick`, `@fontsource/fraunces` (keep `@fontsource-variable/fraunces`).

**Wave A exit gates:** `npm run verify:demo && npm run typecheck && npm run build` all green. No `transform:` in `Home.tsx`'s CSS. Zero `prefers-reduced-motion` matches in `Home.tsx`.

---

## Wave B — Seam closure (the legacy-dialect migration)

**Goal:** Migrate the two legacy dialects onto system primitives; bring desktop `Documents.tsx` into the system; kill the `Turn` border+shadow+bg triple; fix the verify-facts data lie.

**B1.** Fix `getVerificationFacts` so one fact ships `needs_review`. Flip `purchaseDate`'s `status` in `src/app/data/caseWorkflow.ts` (the field most likely to confuse a citizen). Confirm `EvidenceLocker`'s WhatsApp chat ships `conflicting`. **File:** `caseWorkflow.ts`.

**B2.** Migrate `Turn.tsx` onto primitives (Tier1 #1). The order of swaps:
1. **Caps eyebrow in `Zone()` (lines 449–459)** → drop; the serif `pronounce`/`answer` carries the register (L4). For non-large zones, use `<Label tone="faint">` only if still useful.
2. **Turn card root (lines 700–710)** → drop `border: \`1px solid ${C.border}\``. Keep tinted `meta.bg`. Result: tinted paper object, contact-shadow on paper / raised fill on stop via `useTone()`.
3. **`TurnHeader` (lines 711–762)** → badge becomes `<Badge>`, title becomes `<Text role="title">`, statusLine becomes `<Text role="meta" tone="quiet">`, claims count becomes `<Amount tone="faint">`.
4. **`TurnBody` (lines 483–652)** → inside each `Zone`, body div becomes `<Text role={large ? 'answer' : 'bodyStrong'}>`. Conditional `{revealed >= N && <Zone/>}` stays (Wave C handles continuous reveal).
5. **Top-level `<h3>` and `<p>` in Turn header** → `<Text role="title">` and `<Text role="meta">`.

Keep `EMOTION_CRAFT`, `MODE_META`, `scriptProps`, `Composer`, `ScopedAskButton/Sheet`, `TurnStatus`, `TurnCitations`, `TurnActions`, `VerificationTrace` signatures unchanged. **File:** `Turn.tsx`.

**B3.** Migrate `LokAIWorkflow.tsx` onto primitives (Tier1 #1). Five targeted swaps:
1. **`SmallLabel` (lines 95–109)** → delete the function. Replace 6 callsites with `<Label tone="faint">`.
2. **`GroundingMeter` (lines 55–89)** → inline `<span>`s become `<Text role="meta">` and `<Text role="captionStrong">`. Replace progress bar `<div>`s with a shared `Meter` primitive (new addition to `primitives.tsx`: `Meter({ value, total, tone })`).
3. **`LokAIProgressList` (lines 111–155)** → `<Label>` for the heading; rows become `<HairlineRow>` with dot as `leading`.
4. **`StepDot` (lines 362–388)** → inline into `WorkflowActionPlan` as `<span>` with `useInk()` for color.
5. **`ReviewGate`, `FirstActionChecklist`, `HumanReviewCard`, `AuditTrailList`, `NoticeAssessmentCard`, `VerificationScratchpad`** — replace inline `<p>`s/`<span>`s with `<Text>`/`<Label>`/`<Badge>`/`<Amount>`. `<Field>` for the edit input. `<HairlineList>` + `<HairlineRow>` for the fact list.

**Files:** `LokAIWorkflow.tsx`, `primitives.tsx`, `index.ts` (re-export `Meter`).

**B4.** Migrate `pages/Documents.tsx` off the legacy dialect (Tier1 #4). Five fixes:
1. Drop `.doc-card:hover { transform: translateY(-3px) }` (lines 25–28); use `lokai-pressable`.
2. Drop the 5px colored top stripe (lines 195–200) from `DocThumbnail`; replace with `<Badge>` in body.
3. Replace the two-button footer (lines 316–336) with one primary + one quiet `<Button>` (no outlined twin).
4. Replace the hand-drawn document SVG (lines 535–544) with `IconFile`.
5. Replace inline-styled status chip (lines 159–171) with `<Badge>`. **File:** `Documents.tsx`.

**B5.** Move `SHADOW.sm` into `LAYOUT.shadow.card` so a single token owns the call. Add `LAYOUT.shadow = { card: SHADOW.sm, panel: SHADOW.md, lift: SHADOW.lg, float: SHADOW.float }` in `shared.tsx`. Update `layout.tsx:367` to use `LAYOUT.shadow.card`. **Files:** `shared.tsx`, `layout.tsx`, `index.ts` (re-export).

**Wave B exit gates:** All three npm scripts green. `grep -rE "(fontSize|lineHeight|fontFamily)\s*:\s*['\"][0-9]" --include="*.tsx" LokAIWorkflow.tsx Turn.tsx Documents.tsx` returns zero matches. Open `/mobile/case/consumer?stage=verify` → one fact shows the saffron flag fill.

---

## Wave C — Motion, AI flow, and the chat/matter engine merge

**Goal:** Wire motion through the mobile chat stream; make citation chips open the source sheet; reach 3 refusal kinds from chat-first; unify the two engines.

**C1.** Wire motion through the mobile chat stream (Tier1 #3, M-1 to M-5).
1. **Working-dots during the await (M-2)** — between `send(text)` dispatching and the answer landing, replace `{role:'working'}` with an item that renders `<WorkingDots>` keyed by the same `id` so it morphs in place to the audit line (preserves the existing in-place morph).
2. **Continuous zone reveal in `TurnBody` (M-1)** — replace conditional `{revealed >= 1 && <Zone/>}` with each zone always mounted, animating opacity from 0→1 on reveal. Use `motion.div` with `animate={{ opacity: 1 }} initial={{ opacity: 0 }}` driven by a `revealed` prop. Inside `Turn.tsx:483-651`.
3. **Staggered fade-in on suggestion chips + clarify options (M-4, M-5)** — wrap `<Row>` children in `<Stagger>` from `motion.tsx`. Affects `MobileHome.tsx:357-383` and `534-561`.
4. **Tool-sheet body fade (M-3)** — `<Stack>` inside the Sheet gets `<FadeRise>` wrapping at `MobileHome.tsx:822`.

**Files:** `MobileHome.tsx`, `Turn.tsx`.

**C2.** Citation chip → source sheet on tap (AI-9).
- `TurnCitations` accepts an `onOpenSource?: (citation) => void` prop; on tap calls it (no clipboard call).
- `MobileHome.tsx` adds a new tool `'source-detail'` that opens a sheet with the citation's title, reference, how-it-was-used, and excerpt.
- Desktop mirror: `pages/Chat.tsx` passes `onOpenSource` to `<Turn>` that scrolls/highlights in the rail.

**Files:** `Turn.tsx`, `MobileHome.tsx`, `Chat.tsx`.

**C3.** Reach 3 refusal kinds from chat-first (Tier2 #8, AI-6).
- Add three chat triggers:
  - **statute_expiry** (already works on `>2yr` purchase) — confirm.
  - **conflicting_rules**: "the seller says it was fine" → `disclose` turn → stop with `getFailureState('conflicting_jurisdiction')` (`review_recommended`).
  - **high_risk**: "I'm filing a defamation case" → stop with `getFailureState('high_risk')` (`human_required`, full-bleed dark on mobile).
- New `ResponseTurn` entries in `responseTurns.ts`: `conflicting-rules-stop`, `high-risk-stop`.
- `nextStepChips` for `stop` adds a "See what stopped me" chip that opens the stop sheet inline (chat context; full-bleed dark needs `Screen tone="stop"`).

**Files:** `MobileHome.tsx`, `responseTurns.ts`, `caseWorkflow.ts` (prepared refusal data).

**C4.** Unify chat/matter engines (Tier2 #9, AI-10). Collapse `runPreparedConversation` into `runPreparedInput` in `DemoContext.tsx` (move the first-call-returns-clarify flag + `localizeConsumerClarify` branch). `MobileHome.tsx`'s `send()` calls `runPreparedInput`. Keep `runPreparedConversation` as a thin delegating wrapper for one release cycle if any caller still imports it.

**Files:** `DemoContext.tsx`, `MobileHome.tsx`.

**Wave C exit gates:** All three npm scripts green. Send "Damaged mixer" → typing dots → working card → audit line → three-zone answer (continuous reveal). Send "seller says it's fine" → `conflicting_jurisdiction` refusal in chat. Send "I'm filing a defamation case" → `high_risk` refusal in chat (warm + luminous in dark, full-bleed dark in light). Tap a citation chip → source detail sheet/rail opens.

---

## Wave D — Polish, accessibility, residual items

**D1.** Sample-answer preview under empty-state first chip (J-1). `MobileHome.tsx:779-787` — add `<Text role="meta" tone="faint">` line: "You'll see a plain-language answer with the law cited, then choose the next step."

**D2.** "You said X" confirmation under clarify options (AI-3). `MobileHome.tsx:718-724` — when `clarify` lands, render the chosen option's label as a `note` line under `ClarifyOptions`, fading in via `<FadeRise>`.

**D3.** Stage-conditional "Ask for human review" (CONTRACT-2). `MobileConsumerCase.tsx:1194-1201` — only render the quiet button on stages where it makes sense: `intake`, `clarify`, `verify`, `assess`. Suppress on `plan`/`packet`/`audit`/`escalation`.

**D4.** Home script rail respects prepared-set (J-9). `Home.tsx:401-413` — filter `SCRIPT_RAIL` to `s.prepared === true`.

**D5.** Active-matter expansion shows what's waiting (J-5). `MatterDrawer.tsx:131-197` — when `Action Required`, expand the card with one line per outstanding fact using a small `<HairlineList>`.

**D6.** Restart matter from stop state (J-7). `MobileStopScreen.tsx:63-71` — add a quiet `Button` "Ask a different question" navigating to `/mobile/home`.

**D7.** Accessibility fixes batch 1.
- `MatterDrawer.tsx:386-394` (A11Y-1): make the account row a button.
- `MobileTopBar.tsx:58,66` (A11Y-2): replace `<span style={{ width: 44 }} />` placeholders with `visibility: hidden` IconButtons.
- `AppScreen.tsx` (A11Y-3): add `aria-live="polite"` to the chat scroll container.
- `Turn.tsx:1028` (A11Y-7): add `aria-label` to the composer textarea.

**D8.** Icon-keyframe dedup.
- `Home.tsx:208-213, 654-657` — replace hand-drawn mic glyphs with the `MicGlyph` from `Turn.tsx`.
- `Home.tsx:13-150` — replace `@keyframes fadeUp` with `<FadeRise>`.
- `Notice.tsx:228-234, 355-361` — replace inline check SVGs with `IconCheck`.

**Wave D exit gates:** All three npm scripts green. Every interactive surface has at least one ARIA attribute. Mobile chat in dark theme shows the `conflicting_jurisdiction` stop rendered warm + luminous (L8).

---

## Estimated effort

| Wave | Items | Effort |
|---|---|---|
| A — Foundation | 6 | ~half day |
| B — Seam closure | 5 | ~3 days (migration is the heavy lift) |
| C — Motion + AI flow | 4 | ~2 days |
| D — Polish + a11y | 8 | ~half day |

**Total: ~6 working days** end-to-end. Each wave is independently demoable.

---

## File-level summary

| File | Wave | Changes |
|---|---|---|
| `package.json` | A | Drop 8 unused deps |
| `src/styles/index.css` | A | Add `--role-stop-raised` (light + dark) |
| `src/app/ui/theme.ts` | A | Add `T.stopRaised` |
| `src/app/ui/primitives.tsx` | A, B | Add `Meter` |
| `src/app/ui/index.ts` | A, B | Re-export `Meter`, `LAYOUT.shadow` |
| `src/app/ui/layout.tsx` | A, B | Use `T.stopRaised`, `LAYOUT.shadow.card` |
| `src/app/components/shared.tsx` | B | Add `LAYOUT.shadow` |
| `src/app/pages/Home.tsx` | A, D | Drop hover-lift, reduced-motion override, hand-drawn mic, fadeUp; filter script rail |
| `src/app/pages/Documents.tsx` | B | Drop transform stripe, double buttons, raw SVG |
| `src/app/pages/Notice.tsx` | D | Replace inline check SVGs |
| `src/app/components/Sidebar.tsx` | A | Inline `SidebarAura` |
| `src/app/components/ai/Turn.tsx` | B, C | Migrate to primitives; continuous reveal; citation chip onOpenSource |
| `src/app/components/LokAIWorkflow.tsx` | B | Delete `SmallLabel`; migrate to primitives |
| `src/app/components/mobile/AppScreen.tsx` | D | aria-live on chat scroll |
| `src/app/components/mobile/MatterDrawer.tsx` | D | Expand matter card; account row button |
| `src/app/components/mobile/MobileTopBar.tsx` | D | Replace span placeholders |
| `src/app/components/mobile/MobileStopScreen.tsx` | D | "Ask a different question" link |
| `src/app/pages/mobile/MobileVoiceActive.tsx` | A | `<Button variant="quiet">` for Skip/Retry |
| `src/app/pages/mobile/MobileConsumerCase.tsx` | A, D | `<Button>` for Skip/Retry; stage-conditional human-review link |
| `src/app/pages/mobile/MobileHome.tsx` | C, D | Stream motion; citation sheet; 3 refusal kinds; unified engine; preview line; "you said X" |
| `src/app/pages/Chat.tsx` | C | Citation onOpenSource → rail |
| `src/app/context/DemoContext.tsx` | C | Collapse `runPreparedConversation` into `runPreparedInput` |
| `src/app/data/caseWorkflow.ts` | B, C | One fact ships `needs_review`; 2 prepared refusal data entries |
| `src/app/data/responseTurns.ts` | C | Add `conflicting-rules-stop` and `high-risk-stop` |

---

## Risks and contingencies

- **Risk B2/B3 (legacy migration):** if a `<Text>`/`Rule`/`HairlineList` adoption breaks a public-API consumer, revert that component and log it. Screenshot before/after per the team's no-build-ahead rule.
- **Risk C1 (motion):** if continuous reveal in `TurnBody` regresses `EMOTION_CRAFT` staged timing, fall back to per-zone `<FadeRise>` with staggered delays.
- **Risk C3 (refusal taxonomy):** gate new triggers behind `?demo=1` first, then promote.
- **Risk C4 (engine merge):** keep `runPreparedConversation` as a thin delegating wrapper for one release cycle.

---

## Files for reference (read first when executing)

- `docs/MOBILE_AI_SYSTEM.md` §1 — composition law (L1–L8).
- `docs/HANDOFF.md` — current state.
- `docs/DESIGN_AUDIT.md` — original audit this plan operationalizes.
- `src/styles/index.css` — role layer.
- `src/app/ui/{theme,primitives,layout,motion}.tsx` — the four layers.
- `src/app/components/ai/Turn.tsx`, `src/app/components/LokAIWorkflow.tsx` — the two files Wave B migrates.

---

Ready to execute. Each wave is self-contained; pause after each for verification.