# 09 · STATE — what is built, what remains, how to verify

*Snapshot: 2026-09-28, end of the M-phase session. All three gates green on the working tree.*

---

## Gates (the verification, always current)

```bash
npm run verify:demo   # demo integrity + design law (10 PASS lines, includes contrast + ratchet)
npm run typecheck     # tsc --noEmit strict
npm run build         # vite build (exit 127 on Windows = known libuv flake; check for "built in")
```

Gotcha: `npm run preview` shows blank (build base is `/embed/lokai/`). Not a regression.

## Built and verified ✅

- **System layer** — role-layer tokens, `<Screen>` five-slot grammar, primitives, Sheet
  (+ M0: drag handle + velocity dismissal), icons three tiers.
- **Vellum material (M0)** — grain+mesh ground token, machined SHADOW, `.lokai-glass`,
  `.lokai-bezel`, Instrument Serif law register, sans-tight display, body 15px, composer 16px
  (`TYPE.input`), MOTION curves.
- **Quick Recap (M2)** — `FlashcardDeck` + `data/flashcards.ts` (8 cards × 4 languages), three-dots
  entry on Home (non-empty) + case screens; swipe/flip/stamps/keyboard/reduced-motion verified live.
- **MatterFolder (M3)** — 3D flap + exhibit fan on Files, real EX references, headroom fix verified.
- **Scan flow (M4)** — `ScanDocumentCard` (1.7s narrated beat) → interpretation turn → persistent
  "in plain words ↗" strip; deep links (`?doc=&open=1&clause=`) live.
- **Timing law** — `STAGE_MS_BY_CLASS` consequence scaling (stop 240ms … explain/disclose 1050ms).
- **Deep-link fix** — `?stage=failure` → high-risk stop (was an empty screen).
- **Stop states** — full-bleed inversion verified in BOTH themes (2026-09-28); the earlier
  "not inverted" walkthrough finding was retracted (theme misread, same for notice-navy).

## Remaining 🔴 (in build order)

| Item | What | Phase |
|---|---|---|
| **P2 decision engine** | `src/app/decision/` from the preserved implementation; receipts computed; drift bug unreachable; verify-demo conformance suite. **Prerequisite for the case-study centerpiece** | next session, critical path |
| **C1 legacy sweep** | `LokAIWorkflow.tsx`, `Notice.tsx`, legacy case stages, MobileHome chrome → tokens/primitives; ratchet floors → 0; split `Turn.tsx` | with P2 |
| **C4 EMOTION_CRAFT as law** | Promote to `02-DESIGN-LAW.md` + specimen | with C1 |
| **M5 voice pass** | Waveform from scripted data, orb focus, `voice-capture` + `voice-unclear` specimens | after P2 |
| **M6 packet reveal** | `confidential-folder` adaptation + Hold-to-Confirm + draft-state chips | after M5 |
| **M7 capture** | Fresh 13-screenshot set (both platforms/themes), 4-language sweep of new strings, audit re-run with per-criterion before/after | last |
| Small opens | Ghost stage-header contrast (#6); user-bubble saturation decision (#7); desktop short-answer dead zone (#8) | folded into C1 |

## Uncommitted work

The working tree holds M0–M4 + doc corrections, all gate-green. Commit plan (when asked):
`tokens: vellum material layer` → `type: register split + composer floor` → `feat: quick recap deck` →
`feat: matter folder + scan flow` → `docs: CORE + retracted findings`.

## How to verify any of this in 5 minutes

`npm run dev` → `/mobile/home` (mesh + glass composer) → send a chip → three-dots → flip a card →
`/mobile/files` tap the folder → `/mobile/notice` attach + watch the scan + the strip →
`/mobile/case/consumer?stage=failure` (light = navy full-bleed; dark = warm luminous) →
`/dev` specimen gallery. Every step renders on the new system.
