# LokAI — Indian legal-AI prototype

LokAI is a **deterministic, fully visual** prototype of an AI legal guide for a
first-time user with a consumer-refund matter. It is the flagship portfolio case
study — not a product. By design and by enforced gate there is **no live AI, no
network, no OCR, no microphone, no uploads**.

Priya bought a damaged mixer grinder for ₹8,999 and the seller refused a
replacement. LokAI helps her organise the facts, understand the general
consumer-protection basis, prepare a complaint, inspect its sources, and review
every claim before use — and it visibly stops when a safe next step is not
supported.

## Run it

```bash
npm install
npm run dev          # local dev at '/' — always use this one
npm run typecheck    # tsc --noEmit (strict)
npm run verify:demo  # determinism + contrast + token + ratchet gates
npm run build        # production build (base /embed/lokai/)
```

**Validate before every commit:** `npm run verify:demo && npm run typecheck && npm run build`

**Gotcha:** `npm run preview` shows a blank page. The build's `base` is
`/embed/lokai/` (the portfolio iframe), so preview 404s its own assets. Use `npm run dev`.

## Using the prototype

- `#/desktop/…` — dashboard, consumer conversation, notice interpreter, draft, documents
- `#/mobile/…` — the 390px mobile app (drawer navigation)
- `#/specimen/:id` and `#/dev` — the design-system specimen gallery and catalog

Pick a prepared question to run the scripted scenario. Additional scenes
demonstrate missing facts, a source gap, conflicting rules, a high-risk stop, an
out-of-scope request, and recovery.

## Where things live

| Path | What |
|---|---|
| `src/app/ui/` | The system: `theme.ts` (tokens), `primitives.tsx`, `layout.tsx`, `motion.tsx`, `icons.tsx` |
| `src/app/components/` | Domain components (chat `ai/Turn.tsx`, `LokAIWorkflow.tsx`, mobile kit) |
| `src/app/pages/` | Desktop + mobile screens |
| `src/app/data/` | Scripted scenarios, prepared turns, language packs |
| `scripts/` | The gates (`verify-demo.mjs`, `ui-debt.mjs`) |
| `docs/` | Build sheet, design system, audits — see the map in `AGENTS.md` |

**Read `AGENTS.md` before changing anything**, and `docs/LLM_DESIGN_SYSTEM.md`
before writing any screen. `.design-os/tokens.dtcg.json` is a generated export of
the live tokens for the Figma bridge.

## Honesty boundaries

Legal content is illustrative and labelled `Illustrative · expert review pending`.
The interface provides legal information, not legal advice. Capability claims stay
inside the prepared consumer-refund examples.