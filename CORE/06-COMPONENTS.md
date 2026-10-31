# 06 · COMPONENTS — the inventory

*Source of truth. Supersedes the component tables in `docs/MOBILE_AI_SYSTEM.md` §2 and `docs/DECISION-INTERACTION-2026-09.md` §8. Archive kept.*

Every component lists: **mode it serves** (the system is `ResponseMode` + gates, not a set) ·
**provenance** (hand-built or adopted-from, so nothing looks copied) · **quality bar** (what
"done" means for it).

---

## The spine — the system, not a component

`ResponseMode` (7 modes: clarify / explain / disclose / stop / confirm / progress / recover) +
`EMOTION_CRAFT` (per-mode emotional pacing: protective_stop fastest at 160ms reveal, dense,
primary-first; relief slowest, airy; honest_gap amber never red). **Rule: no component gets a
visual decision its mode doesn't justify.** Components sharing a mode share a register.

## The accountability set (no shipped AI library has these)

| Component | Mode | Bar ("done" means) | Status |
|---|---|---|---|
| `VerificationScratchpad` / Gate | confirm | Double-bezel; facts as hairline rows (value strong, label quiet); one progress truth; gated CTA unchanged | ✅ restyled · 🟡 bezel pass |
| `StopState` / `MobileStopScreen` | stop | Full-bleed inversion both themes; safe action primary; preserved line; 8 kinds, one component | ✅ verified both themes |
| Claim ledger | disclose | `N of M sourced`, derived from state (G9), tabular mono; only when claims > 0 | 🟡 rendered; **computed at P2** |
| `TurnStatus` + gate trail | progress | Stage labels = gates firing; shimmer only while working; skip always; collapse line = computed trail | 🟡 timing shipped; **trail computed at P2** |
| `NoticeInterpret` (+ reader sheet) | explain/disclose | Scan beat → translated turn → clause correspondence (tap field → original clause) → persistent strip | ✅ M4 |
| `CitationStamp` / source sheet | disclose | Chips open the exact provision, "Example — verify with a lawyer" label; answer stays visible behind the sheet | ✅ |
| `AuditTrailList` | disclose | What LokAI did, in order, why — the Spine's data source | ✅ · Spine surface ⬜ P5 |
| `EscalationHandoff` | stop→continuity | Framed as change of venue with paperwork intact, never failure | ✅ |
| `MatterFolder` (M3) | — (Files hero) | Tap-open 3D flap, real exhibit refs, aria-expanded, reduced-motion snap | ✅ |
| `FlashcardDeck` (M2) | — (Quick Recap) | Swipe physics + flip, derived counts, stamps continuous with drag, keyboard + aria-live + reduced-motion | ✅ |
| `ScanDocumentCard` (M4) | progress | Controlled status; sweep timed to the actual staging; honest-beat law | ✅ |
| `VoiceCapture` | confirm/recover | 9-phase machine; partial vs committed transcript; waveform from scripted data | 🟡 machine ✅ · visuals ⬜ M5 |

## Inherited, re-formed for mobile

`Composer` (glass island, 16px input, 44px targets, press physics, notice/voice branches) ✅ ·
`Answer` three named zones, serif = law, no card ✅ · `Sources` bottom sheet capped 85vh ✅ ·
`Suggestions` jurisdiction-scoped ✅ · `StageRail` as dots, not a card ✅.

## Adoption law (how foreign anatomy lands)

1. Copy from the vault (`D:\Design Tools\Ui kits and components\library\repos\…`) — pinned,
   offline; never the shadcn CLI (no network, no components.json).
2. Re-skin through tokens **before landing** — zero raw hex/family/leading at the call site
   (ratchet). Foreign icon imports → Phosphor aliases. `cn()` allowed; no radix.
3. Keep the source's state machine, a11y, and reduced-motion paths — that IS the quality bar
   (see `07-CRAFT-BAR.md`).
4. Specimen entry in the same commit.
5. Provenance comment in the file header: anatomy-from + what LokAI changed and why.

**Adopted so far:** rare-ui `folder-component` → MatterFolder · SmoothUI `card-swipe-deck` +
kokonutui `card-flip` → FlashcardDeck · uselayouts `scan-document` → ScanDocumentCard ·
uselayouts `empty-testimonial` → ⬜ EmptyDocuments (pending) · uselayouts `confidential-folder`
→ ⬜ packet reveal (M6) · uselayouts `save-button` pattern → ⬜ draft-state chips (M6).
