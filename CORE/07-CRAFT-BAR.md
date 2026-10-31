# 07 · CRAFT-BAR — why the vault's components win, where LokAI falls short, how we close it

*The honest comparison, requested 2026-09-28. Evidence: code-level reads of ~30 vault components (`D:\Design Tools\Ui kits and components\library\repos\…`) vs code-level walkthroughs of this repo. No flattery, no defensiveness.*

---

## 1. What "high quality component" actually means (extracted from the vault)

The vault's best components are not better *drawn*. They are better **engineered as behavior**.
Ten properties, all observed in source:

1. **State machines, not booleans.** `scan-document`: idle → scanning → done with ref-managed
   timeouts, unmount cleanup, controlled-status lift. `confidential-folder`: a five-phase machine
   (tucked → extracting → landing → revealed…) in pure CSS, zero dependencies. Every state is
   reachable, none is a dead end.
2. **Reduced motion is a designed path, not a media query.** `scan-document`'s reduced cycle is a
   *different choreography* (900ms, collapsed keyframes, `motion-reduce:scale-100` on the button).
   `card-swipe-deck` replaces the throw with instant removal and keeps the buttons working.
3. **Accessibility as a contract.** `card-swipe-deck`: keyboard arrows commit, Enter flips,
   `aria-live` remaining count, `role="application"`. `ai-loader`: `role="status"` +
   `aria-live="polite"` + an sr-only duplicate. `ai-citation`: Escape closes, focus opens,
   `aria-describedby` wired.
4. **Derived data, never passed counts.** `ai-task-list`: header counts derived from the rows —
   "a 3/7 that drifted from the rows destroys trust." This is LokAI's own G9 law, present in
   someone else's component before it was present in ours.
5. **Physics, not durations.** Shared spring constants (`stiffness 260, damping 28, mass 0.75`),
   velocity-based commits (`>450px/s` throws the card), elastic snap-back, drag rotation via
   `useTransform` with a pivot below the card so tilt reads like a hand swing.
6. **One moving thing at a time.** `ai-task-list`: done rows settle to opacity 0.65; the running
   row gets the single travelling underline. `ai-tool-call`: ONE SVG ring morphs through the
   whole lifecycle (breathe → rotate → drawn check/cross) instead of icons popping in and out.
7. **Honesty coded in.** `ai-loader`: "Faking determinate progress for an unknown wait is the one
   thing a loader must never do." `ai-sources`: a neutral globe fallback "beats a fabricated
   one-letter badge pretending to be a logo." `ai-conversation`: follows bottom only within 48px,
   then shows "Jump to latest."
8. **Lifecycle morphing, not swap-on-state.** `ai-reasoning`: auto-opens while streaming, waits a
   beat, collapses ONCE, then the user latch overrides auto forever; shimmer exists only while
   working ("a permanently shimmering label is just decoration").
9. **Performance hygiene written into the component.** `transform-gpu`, `will-change` only while
   animating, `contain: paint`, `backface-visibility`, IntersectionObserver pauses, one shared
   cycle constant so mixed loaders stay in phase.
10. **Laws stated at the point of use.** The comments carry the design reasoning ("completed
    rows go quiet so the running row is the only thing asking for attention"). The next
    contributor inherits the *judgment*, not just the code.

## 2. Where LokAI falls short — with evidence

**The honest split first:** LokAI's *core system* — `ui/` primitives, `<Screen>`, the role-layer
tokens, the Sheet, and everything built in M0–M4 (FlashcardDeck, MatterFolder, ScanDocument) —
**already meets this bar**, because it was built against it deliberately. The gap is concentrated
in named legacy files. "LokAI is bad" is not true; "LokAI has ~10 files of pre-bar debt" is.

| Gap | Evidence | Why it matters |
|---|---|---|
| **Raw-style debt** | `scripts/ui-debt.json`: 471→385 raw lines; heaviest `LokAIWorkflow.tsx` (59 family / 31 leading), `Notice.tsx` (32/10), `MobileConsumerCase.tsx`, `MobileHome.tsx` chrome | The ratchet enforces "only falls" but the floors are still above zero; every raw line is a theme-switch bug waiting |
| **Monoliths** | `Turn.tsx` ~1100 lines (composer + turns + EMOTION_CRAFT + icons + status); `MobileConsumerCase.tsx` ~1260 lines | Vault components are 100–450 lines with one job; monoliths can't be specimen'd, tested, or reused |
| **Authored trust signals** | Ledger + "How we checked" are literals in `responseTurns.ts`; the substring router (`:569`) answered an out-of-scope rent question with the confident consumer answer (demonstrated on camera 2026-09-27) | The one failure the product cannot survive — trust theater. **P2 engine is the fix and the origin story** |
| **Mixed animation idioms** | CSS keyframes (toast, thinkAccent, voiceBarListen — written and never referenced) + motion/react + animateicons, three dialects, no phase discipline | The vault has ONE motion system with shared constants; mixed idioms drift out of phase and read as unmanaged |
| **Happy-path-only surfaces** | Voice: waveform keyframes written, never referenced; the two trust specimens (editable confirm / unclear refusal) unshipped | The accountability surfaces are the differentiation — a half-built trust beat is worse than none |
| **`EMOTION_CRAFT` undocumented as law** | Lives inside `Turn.tsx` with a comment, but is not in the design law, not specimen'd | The most sophisticated thing in the codebase is invisible to the case study and unprotected from regression |
| **Sheets had no drag physics** | `Sheet.tsx` shipped without drag-to-dismiss until M0 added it | Vaults ship sheets with velocity dismissal as the default |
| **Ghost chrome** | Stage-title watermarks at near-invisible contrast (verify/assess walkthrough) | Quiet ≠ illegible; the vault never ships text that fails its own contrast gate |

## 3. Why the gap exists (say it honestly, once)

LokAI's system layer was rebuilt to a high bar in August 2026, but the sweep stopped at the
domain files: the audit's own words were "screens hand-composing every element… the codebase had
layer 1 (tokens) and layer 4 (domain components) and nothing in between" — the middle was built,
the legacy domain files were scheduled but not all reached. The vault, by contrast, contains
components *curated* for craft — that's what the folder is. So the comparison isn't talent; it's
**completion**. The bar is now written down (this file), the ratchet enforces the floor, and the
remaining distance is a named list of files, not a feeling.

## 4. The closure plan — to zero, file by file

| Move | What | When |
|---|---|---|
| **C1 · Legacy sweep** | `LokAIWorkflow.tsx`, `Notice.tsx`, `MobileConsumerCase.tsx` legacy stages, `MobileHome.tsx` chrome → primitives + tokens; ratchet floors → 0; split `Turn.tsx` (Composer / Turn / EMOTION_CRAFT as named modules, each specimen'd) | Next sessions, screen-by-screen with 390px checkpoints |
| **C2 · One motion system** | Retire stray CSS keyframes into MOTION tokens or `index.css` system classes; wire the voice waveform; delete `voiceBarListen` dead keyframes | With C1 |
| **C3 · Computed truth (P2)** | Engine in `src/app/decision/` — receipts, gate trail, G9 recomputed ledger; the drift bug becomes unreachable; verify-demo grows the conformance suite | Prerequisite for the case study's centerpiece |
| **C4 · EMOTION_CRAFT as law** | Promote to `02-DESIGN-LAW.md` appendix + specimen; every mode's pacing documented with its research line | With C1's Turn split |
| **C5 · Trust specimens** | `voice-capture` + `voice-unclear`; EmptyDocuments; packet reveal (M6) | M5–M6 |
| **C6 · Zero floor** | When every file reads 0, `ui-debt.mjs` stays as a guard; the audit re-run shows before/after per criterion | M7 |

**The craft law to adopt from the vault, stated once:** *a component is not done when it looks
right; it is done when its states are machines, its counts are derived, its motion has physics,
its reduced path is designed, its a11y is a contract, and its comments teach the next person the
law — at the point of use.*
