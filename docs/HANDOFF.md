# LokAI Session Handoff

**Last updated:** 2026-08-25. **Read this first**, then the plan file below for implementation-level detail. Re-read at the start of every new session on this repo — expected to change often while the rework is in progress.

## The top priority — a real scope gap, now fully diagnosed, not yet fixed

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
