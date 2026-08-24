# Verify — staff-audit remediation pass

## Scored gates

- Product truthfulness: 9.5/10 — every surface identifies prepared examples; live APIs, file input, microphone permission, login, pricing, and lawyer access are absent. Dead multi-matter scaffolding (RTI/tenancy seeds, Home Matters/Notices) removed.
- Shared state: 9.5/10 — `DemoContext` is authoritative across Chat, Home, Documents, Draft, Notice, MobileFiles, MobileConsumerCase, and MobileVoiceActive. Fact confirm/correct and draft approval write audit events. `draftAllowed` gates the Draft surface.
- Guardrails: 9.5/10 — seven deterministic scenes; hybrid modes; selected guardrail scene changes the assess/answer beat via `runScenario` / `activeTurn`. Intake modalities are selectable (text / voice / notice).
- Content clarity: 9.5/10 — plain-language modes; claim counts only (`groundedClaims` / `totalClaims`); `groundingScore` and fabricated liveScore formula deleted; verify script fails if they reappear.
- Accessibility: 8.5/10 — bottom-sheet legal terms with focus trap, Skip/Replay on progress, reduced-motion progressive reveal, 44 px targets, sonner toasts.
- Visual consistency: 9/10 — unified CSS tokens; `PLANE` reading atmosphere on workspace; role radius + terracotta citizen accent; `EMOTION_CRAFT` on Turn.
- Performance/security: 9/10 — route-level splitting; zero-network verify; no live keys; one Composer + one `useVoiceCapture` hook for desktop and mobile.

## Findings

- `npm run verify:demo` checks network/device APIs, seven scenarios, glossary, seven response modes, prepared turns, language packs, matter-store APIs, and absence of `groundingScore` / confidence percentages / liveScore formulas.
- Hybrid `Turn` components under `src/app/components/ai/Turn.tsx` with Composer (voice-aware), ScopedAsk, and `EMOTION_CRAFT`.
- Voice: shared `useVoiceCapture` drives Composer mic and `MobileVoiceActive`.
- Documents / Notice / Draft / MobileFiles read `useDemo()`; Draft shows a designed refusal when `draftAllowed` is false.
- Seeded conversations hydrate into prepared turns — no legacy `AICard` path.
- Continuity: guardrail scene selection persists in the store and alters the turn at the answer beat.

## Taste and drift

Preserved warm parchment, navy, saffron, Fraunces. Emotional intent is rendered behaviour, not a doc-only aspiration (see `.design-os/10-journey-emotion.md` implementation referent).

## Blockers

Legal source wording remains illustrative and must stay labelled `expert review pending`.

## Verdict

SHIP — for presentation as a clearly labelled visual prototype after `npm run verify:demo` and `npm run build` pass.

## Peak-End + guardrail polish (follow-on)

- **Peak-End checklist** on mobile packet and desktop Draft after ReviewGate (save → send yourself → remind); audit event on completion.
- **Statute-expiry stop** (`statute_expiry` / `statute-expiry-stop`) — limitation-aware protective refusal; gallery + `?scene=` deep-link.
- **Step N of M rail** and stage action verbs on mobile journey; progressive “Inspect original legal text” on SourceCard.
- Case study `#decisions` cites Tesler + Governors; `#failures` promotes rules conflict and limitation stops.

## Indian context + visual craft polish (follow-on)

- **Dead system deleted:** `theme.css` + `components/ui/*` removed; live tokens are `shared.tsx` + `index.css` only. `CARD` / `ResponseCard` stripped.
- **Composition language:** `PLANE.hero` / `PLANE.reading` / `PLANE.flat`; Chat, Draft, Docs, Notice, mobile canvases share parchment reading atmosphere. Role radius (`control` / `card` / `plane` / `turn`); Turn is the special elevation. Terracotta = citizen voice (user bubble, confirmed facts, FirstActionChecklist).
- **Indian lived channels:** registered post with AD, National Consumer Helpline (1915), e-Daakhil, WhatsApp/seller-chat + platform order ID as evidence. HI/MR/TA rewritten as spoken register (no engineering calques).
- **Scope honesty:** RTI/landlord suggestion chips replaced with consumer seeds; capability claims rewritten as consumer-only boundary. `verify:demo` enforces channels, no RTI/tenancy support claims, no drifted palette hexes, dead UI stays deleted.
- Portfolio embed refreshed at `public/embed/lokai`.

## Layout / hierarchy / typography enforcement (follow-on)

- **Industrial role scales** in `shared.tsx` + `index.css`: `TYPE` (label→display1 + editorial), `LAYOUT.radius` (none/xs/sm/control/panel/card/turn/plane/pill/full), `SHADOW` ladder + specialty (inset, navy, overlay).
- **`typeStyle()` helper** for hierarchy spreads; `SectionLabel` / `DisclaimerText` use it.
- **~600 bare radius/fontSize/shadow call sites** migrated onto tokens across live `src/app` surfaces.
- **`verify:demo`** fails on bare `borderRadius` / `fontSize` / `boxShadow` outside `shared.tsx`.

## AI evaluation and red-team evidence

- Missing fact → clarify mode; drafting blocked on Draft page.
- Source gap / conflict → disclose mode; no firm filing recommendation.
- High-risk / out-of-scope / statute expiry → stop mode with preserved summary.
- Temporary pause → recover mode with retry.
- Unsupported free text → boundary stop (no RTI/tenancy invention).
- Claim coverage shown as N of M, never model confidence.
- Guardrail gallery scene → assess stage renders that scene's prepared turn.
