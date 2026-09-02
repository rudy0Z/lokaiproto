# LokAI — the five mobile screens

**Written 2026-08-26.** The whole mobile shape in one place, so screens can be built
one at a time without re-deciding the system each time. Read `LLM_DESIGN_SYSTEM.md`
(the build sheet) and `MOBILE_AI_SYSTEM.md` §1 (composition law L1–L8) first — this
applies them, it does not restate them.

## Navigation model — drawer, not tabs (2026-08-27)

The mobile app follows the established AI-chat pattern (ChatGPT / Gemini / Claude,
and the Wkeel legal-AI reference): **a minimal chat canvas with a left drawer of
history — no bottom tab bar, no persistent header chrome.** Confirmed against 2025
industry practice ("a centered input field with streaming responses and a sidebar of
history"). What this means concretely:

- **No bottom nav.** It's gone from every screen. Navigation is the drawer.
- **Minimal top bar** (`MobileTopBar`): hamburger (opens the drawer) · wordmark ·
  new-chat. No language chip — language is set in onboarding and changed in Settings.
  Modal flows (voice, a stop state) swap the hamburger for a back arrow.
- **The drawer (`MatterDrawer`) is the whole navigation surface AND the personal
  surface.** It carries: the greeting, search, My documents, the active matter (its
  live status + what's waiting), New chat, past matters, Language, Appearance, and
  the account/settings rail. Home used to hold the greeting / active-case card / past
  matters; those all moved here.
- **Home is a chat canvas**: a centred mark + prompt + quick-start pills, composer
  pinned. Nothing else.
- **Wiring:** `DrawerProvider` (in `MobileShell`) holds the open state; `AppScreen`
  (wraps `<Screen>`) injects the top bar as chrome and mounts the drawer in the footer
  slot (which keeps it contained inside the phone artboard). Every screen uses
  `AppScreen`, so the nav is defined once.

Reference read: the **Wkeel layout** was adopted (drawer with Documents + chats +
Language/Appearance at the bottom; chat-first home) — its dark palette was not, because
dark is LokAI's stop-state tone, not its theme.

---

Every screen is the five-slot grammar from `ui/layout.tsx` `<Screen>`:

```
chrome    StatusBar · TopNav · (per-screen header)      — fixed
context   one quiet line: matter · stage · language      — never a card
children  the focal content, on the ground               — scrolls
action    ONE primary CTA                                 — pinned
footer    Composer (chat) and/or BottomNav                — fixed
```

Container budget is **two cards visible, maximum** (L1). A card is only for a
discrete object the user could pick up — a source, an exhibit, a matter. Prose,
steps, disclaimers, and "current step" restatements are never cards.

Status of each screen is marked: ✅ on the system · 🟡 partly · ⬜ not started.

---

## Cross-cutting, already landed

- **Device frame** — `components/mobile/DeviceFrame.tsx`, wired once in
  `MobileRouteCanvas`, so all screens render inside a phone in dev/standalone and are
  untouched in the portfolio embed (`IS_EMBED`).
- **Answer vs greeting type** — 22px `answer` for the law speaking; 28px `pronounce`
  reserved for the refusal sentence and the home greeting. Two roles, never on one screen.
- **Verification gate has a real catch** — one flagged fact, one conflicting exhibit,
  one date-disagreement story across verify and Documents.
- **One canonical fact store (2026-08-27)** — the consumer scenario's `facts` is the
  single source; `getVerificationFacts` derives from it; `VerificationScratchpad` is
  controlled and writes through `DemoContext`, so confirming a fact settles it
  everywhere. The old 5-vs-6 divergence is gone.
- **Touch feedback (2026-08-27)** — `HairlineRow` now depresses on `:active`. It had
  `background:'none'` inline, which beat the `.lokai-pressable` class, so the press
  never painted. Fixed with `.lokai-row` / `.lokai-row-flag` classes (no inline bg).

### Migration status (2026-08-27)

`Files` ✅ · `Profile` ✅ · `Voice` ✅ · `Home` ✅ — screen bodies fully on the system.
Case: `assess` ✅, `packet` ✅ (de-boxed — notice as paper), `failure`/stop ✅
(full-bleed `tone="stop"`). Remaining legacy: the shared chrome exports in MobileHome
(`StatusBar`/`TopNav`/`BottomNav`/`HomeIndicator` — used by 6 files, left raw on purpose),
the smaller case stages (`intake`/`clarify`/`plan`/`audit`/`escalation`), and the shared
`LokAIWorkflow` internals (`EvidenceLocker`, `VerificationScratchpad` body — controlled
and correct, not yet on primitives). Debt: 823 → 696 raw-style lines.

---

## 1 · `/mobile/home` — the front door ✅ (migrated 2026-08-27)

**Job:** one sentence — *where a person starts, and where their one live matter is.*

**Now:** two states (empty / active-matter). Active runs greeting → `ActiveCaseCard`
→ `PastMattersList` (≈3 blocks, one heavy card). Empty runs 5 stacked blocks incl. a
gradient `LegalSignalBand` with a grid-line overlay — the only grid texture on mobile,
and it fights the paper metaphor. A large dead zone sits mid-screen between the last
content and the composer.

**Target:**
- context: jurisdiction · language, one line (already close).
- focal: `pronounce` greeting (done). Then the composer is the real hero of the empty
  state — pull it up out of the dead zone, or fill the zone with the jurisdiction
  signal as a quiet line, not a gradient card.
- `ActiveCaseCard` → the one card, reusing the `ActiveMatter` treatment already built
  in `MatterDrawer` (flat leading edge, tint not navy, a real "what's waiting" line
  from workflow state — not "Step 2 of 6", which the rail already says).
- Kill `LegalSignalBand`'s gradient+grid; the band's message becomes a quiet line.
- `SuggestionChips` stay but jurisdiction-scoped.
- **Delete:** the mid-screen dead zone (its cause is the two-state branch leaving the
  active state short); the grid overlay; `ConsumerCaseStart` as a separate card when an
  active matter already exists.
- Migrate onto `<Screen>`/`<Text>`; it currently carries 66 raw-style lines.

**Focal move:** the greeting (empty) or the active matter card (returning). One or the
other — never both loud.

---

## 2 · `/mobile/case/:matterId` — the case journey 🟡

The densest surface: 11 stages, 8 failure kinds, 2 notice states, one file. `assess`
migrated 2026-08-26; the rest are hand-composed. **Do not rebuild all at once** —
migrate stage by stage, screenshot each.

**Job per stage:** one thing. The header already names the stage (L7), so no stage
restates its own name in the body.

Stage-by-stage target (all on `<Screen>`, the answer/decision as the focal move):

| Stage | Focal move | Cut |
|---|---|---|
| `intake` | the composer + 3 modality tiles | the disclaimer card → footer line |
| `clarify` | the one question (`answer`) + answer buttons | — |
| `verify` | `VerificationScratchpad` (the catch) | second progress bar; box-per-fact → hairline rows |
| `assess` ✅ | the answer (22px) | done — one container, on demand |
| `plan` | the action plan | glossary card → inline `LegalText` |
| `packet` | **the heaviest — ~9 blocks today.** `AutonomyDial` as ONE decision, then the packet, then `ReviewGate` | collapse `WorkflowActionPlan` + `FirstActionChecklist` + `TrackingBanner` into the gate flow |
| `audit` | the trail | — |
| `escalation` | `HumanReviewCard` as continuity, not failure | — |
| `failure` (×8) | **`pronounce` refusal + safe action as the primary** — full-bleed `tone="stop"` | "Continue anyway" → text link; kind detail → sheet |

**Notice states (`?notice=`)** are the §3.8a `NoticeInterpret` surface — the notice
interpreter pass, not this one. The exhibit sheet's `In plain words` / `Original`
toggle (built in Documents) is the pattern it will share.

**Focal move:** the stage's own answer or decision. If two things compete, one is wrong.

---

## 3 · `/mobile/files` — Documents / exhibits ✅ (done)

**Done 2026-08-26.** Exhibits, not files: mono reference, paper thumbnail by kind,
what it proves, provenance, grouped by matter. Conflicting exhibit is the one filled
row and is reachable for the first time. Detail sheet has the `In plain words` /
`Original` toggle (clause-linking pending the notice pass). Zero raw-style lines.

**Remaining:** the `Original` view is a shell (a big paper + a line pointing at the
notice reader); wiring it to real clause-linking is the notice-interpreter pass. The
"Add a document" affordance is a prepared route, not an upload (the demo forbids
`type=file`).

---

## 4 · `/mobile/profile` — Help / account ✅ (done 2026-08-27)

**Job:** *who you are, what language, and how to reach a human.* The name in the nav is
"Help" — lead with help, not settings.

**Now:** 7 containers, 5 of them cards, incl. three subscription plan cards (one a dark
navy gradient — spends the stop-state tone on a pricing card). Two dead links to routes
that do not exist (`/mobile/onboarding/2`, `/mobile/login`). Hardcodes `390×844` instead
of `ARTBOARD`, so it clips in the embed.

**Target:**
- context: name · language · jurisdiction (the drawer's account rail already models this).
- focal: the human-help path — legal aid / talk to a person — as the one primary.
- language + appearance as two rows (the drawer already has this pattern), not cards.
- Subscription: at most one card, and NOT the navy gradient — navy is the anchor and the
  stop ground, never decoration (L5). If plans must show, they are a quiet list.
- **Delete:** the dead links; the extra plan cards; the hardcoded artboard → use `ARTBOARD`.

**Focal move:** reaching a human.

---

## 5 · `/mobile/voice` — voice capture ✅ (migrated 2026-08-27; specimens pending)

**Job:** *speak instead of type, and see it caught before it commits.* The lightest
screen, and one of the most differentiating — the `confirm` phase shows the transcript
editable before it commits, and the `unclear` phase refuses to guess.

**Now:** demo scaffolding ("No microphone permission is requested…") occupies the hero.
The `voiceBarListen` waveform keyframes are written and never referenced — listening is a
single pulsing circle. Showcase timings (900/650ms) are too fast to register. Near-
duplicate of the intake voice path (`IntakeView` runs the same `useVoiceCapture` machine
inline).

**Target:**
- Demote the honesty line to a quiet disclosure; let the interaction lead.
- Wire the waveform; slow the timings.
- `VoiceOrb` (already the shared crossfading component) is the focal move.
- Build the two specimens flagged long ago and never shipped: `voice-capture`
  (listening → transcribing → editable confirm → done) and `voice-unclear` (refuses to
  guess, always offers the text escape). These are the case-study voice beats.

**Focal move:** the orb while listening; the editable transcript at confirm.

---

## Suggested build order

1. **Home** — highest-traffic, closest to done, and the greeting migration is already
   in. One card, kill the dead zone and the gradient band.
2. **Case stages** — `verify` (the catch is the D-01 money shot), then the `failure`
   stop states (full-bleed `tone="stop"` — the case-study money shot), then `packet`.
3. **Profile** — small, and it removes two broken links and an embed clip.
4. **Voice** — the two specimens, for the case study's voice section.
5. **Notice interpreter** (`NoticeInterpret`, §3.8a) — the founding feature, its own pass.

Each screen: screenshot at 390px, confirm the container count dropped, and
`node scripts/ui-debt.mjs --update` once it is on the system.
