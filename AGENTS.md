# AGENTS.md — LokAI prototype

LokAI is a fully visual, **deterministic** prototype of an Indian legal-AI guide (consumer-refund demo journey). It is a portfolio flagship case study, not a product: no live AI, no network, no OCR, no microphone — by design and by enforced gate. Vite + React + TypeScript strict, Tailwind 4, hash-routed.

## Commands

```bash
npm run dev          # local dev at '/' — ALWAYS use this
npm run typecheck    # tsc --noEmit (strict)
npm run verify:demo  # demo-integrity + design-law gates (see below)
npm run build        # vite build
```

Validate before every commit: `npm run verify:demo && npm run typecheck && npm run build`. There is no test suite or linter — these three are the gates.

**Gotcha:** `npm run preview` shows a blank page. Build `base` is `/embed/lokai/` (for the portfolio iframe), so preview 404s its own assets. Not a regression.

## Routing & shells

`src/app/routes.tsx` — `createHashRouter` **deliberately**: the portfolio embeds this as `<base>/index.html#<route>` and `embed.ts` reads `embed=1` from the hash. Never swap for a browser router.

- `/desktop/*` → `shells/DesktopShell.tsx` (sidebar + workspace)
- `/mobile/*` → `shells/MobileShell.tsx` (390px frame; drawer is the whole nav — no bottom tab bar)
- `/specimen/:id` + `/dev` → specimen gallery / catalog (`src/app/dev/`)

Related repo `D:\Portfolio` (Next.js case-study + embed site) is **out of scope** for this workspace.

## Design-system layers — import downward only

```
src/app/ui/index.ts   ← the one import line for screens: Screen, Stack, Text, Button, T, M…
1 tokens        ui/theme.ts + src/styles/index.css (role layer) + components/shared.tsx
2 primitives    ui/primitives.tsx, ui/layout.tsx, ui/motion.tsx, ui/icons.tsx
3+ domain       components/, pages/ — where you work
```

A screen never reaches past the barrel into raw hex, raw px, `C.*`, `fontFamily`, or `lineHeight`. Read `docs/LLM_DESIGN_SYSTEM.md` (the build sheet) **before writing any screen or component**.

### Enforced rules (`scripts/verify-demo.mjs` + `scripts/ui-debt.mjs`)

- **No raw** color / `fontFamily` / `fontSize` / `borderRadius` / `boxShadow` / `lineHeight` outside the system definition files: `components/shared.tsx`, `ui/theme.ts`, `ui/script.ts`, `ui/primitives.tsx`, `ui/layout.tsx`, `ui/motion.tsx` (must stay identical to `SYSTEM_FILES` in `ui-debt.mjs`). Use `T.*`, `typeStyle()`/`TYPE.*`, `LAYOUT.radius.*`, `SHADOW.*`.
- **Ratchet** (`scripts/ui-debt.json`): raw-style line count per file may only fall, never rise.
- **Icons:** import `IconXxx` from `ui/icons.tsx` (aliased `@animateicons/react`). Lucide/Phosphor are retired repo-wide — don't reintroduce them. Composer send/attach/mic stay bespoke in `Turn.tsx`.
- **One primary button per screen**; the second action is `variant="quiet"`.
- **Multilingual:** `<Text role>` picks the script-appropriate family and line-height per active language (en/hi/mr/ta via `data/languagePacks.ts`). Hand-written `fontFamily: SERIF` renders tofu in Devanagari; set `lang` attributes for Indic content.
- **WCAG contrast gate** parses both light and dark themes (`[data-theme="dark"]`) — new tokens must pass in both.
- Status labels come from `data/statusVocabulary.ts` — never hand-write a status string.

### Demo-integrity gates (also `verify-demo.mjs`)

- Forbidden in `src/`: `fetch(`, `getUserMedia`, `new MediaRecorder`, file inputs, `VITE_(NVIDIA|SARVAM)_API_KEY`.
- No fabricated confidence: no `groundingScore`, no percentage-confidence strings — use `groundedClaims`/`totalClaims`.
- Scripted invariants must exist: the 8 scenarios + glossary in `data/demoScenarios.ts`, all response modes + prepared turn ids in `data/responseTurns.ts`, 4 language packs, staged-progress `skip` in `demo/responseEngine.ts`, DemoContext matter-store API.
- Prepared copy must keep the Indian channel metaphors: `1915`, `e-Daakhil`, `registered post`.
- No capability claims beyond the consumer-only boundary (see `PRODUCT.md`).
- `src/styles/theme.css` and `src/app/components/ui/` are a dead design system that must **stay deleted**.

## Architecture notes

- `src/app/context/DemoContext.tsx` is the matter store (facts, confirmFact/correctFact, runPreparedInput, draftAllowed); `data/caseWorkflow.ts` holds the canonical fact stores — `getVerificationFacts()`/`getEvidenceLocker()` derive from them. Keep the stores consistent; the verification gate must have a real catch.
- `data/responseTurns.ts` response modes: clarify, explain (three-zone), disclose, stop, confirm, progress, recover. Stop tiers carry `draftAllowed: false`.
- Vite dev proxies `/api/nvidia` and `/api/sarvam` exist, but the demo itself never calls them.
- `tsconfig.json` is **typecheck-only** (`noEmit`); Vite owns the build. Typecheck exists because a deleted token once shipped as a silent `undefined` — run it, it's not optional.

## Docs to read before sensitive work

- `docs/HANDOFF.md` — session log, what's done/remaining, known gaps (read first)
- `docs/LLM_DESIGN_SYSTEM.md` — the how: copy-pasteable patterns, four layers, six bans
- `docs/MOBILE_AI_SYSTEM.md` — the why: composition law and the accountability-surface bet
- `docs/MOBILE_SCREENS.md` — per-screen mobile shape and status
- `PRODUCT.md` / `DESIGN.md` — product and design contracts (boundaries, response modes, type)
- `docs/UPGRADE-2026-09.md` — decision log for the current upgrade phases
