# LokAI — Design Audit & Rebuild Brief

**Written 2026-08-28.** A full-app design audit written after the shell/flow overhaul,
prompted by a direct question from the product owner: *why do Gemini / ChatGPT read as
refined and premium while LokAI reads as barely refined?* This document answers that,
records everything built so far, and lists — bluntly — what a product designer would
reject on sight, with a rebuild direction.

Read alongside `HANDOFF.md` (status), `MOBILE_AI_SYSTEM.md` (the component system spec),
and `PRODUCT.md` (voice/boundaries). This supersedes the ad-hoc audit notes from the
earlier "ultrareview"-style pass.

---

## 0. The core question: why Gemini/ChatGPT feel premium and we don't (yet)

It is not one thing. It is ~200 small things executed consistently. Broken down, and
grounded in our actual code:

**1. Motion is continuous and physical.** Every state change on those products animates —
messages fade-and-rise in, text streams token by token, typing dots breathe, buttons
depress, sheets spring. Nothing *pops*. Our mobile chat (`pages/mobile/MobileHome.tsx`)
imports **no motion library at all**: the user message, the "working" status, and the
three-tiered answer each mount instantly via `setState`. A static layout that jumps reads
as a mockup, not a product. **This is the single biggest gap.** (Note: the desktop
`pages/Chat.tsx` already has fade-up entrances, typing dots, and shimmer — the patterns
exist in-repo and were simply never wired into the mobile stream.)

**2. One visual language, everywhere.** Their whole surface is one system. We run **two
dialects**: the migrated primitives (home, notice reader, case hub, documents, onboarding)
and the legacy stage internals (`LokAIWorkflow.tsx` — `Step 4 of 6`, bordered boxes,
two-button rows). The seam is exactly what reads as "unfinished," and it is precisely what
the owner hit: a clean chip that opens a `?stage=plan` screen from the old world.

**3. Conversational rhythm.** They ask, confirm, then answer. Ours jumps from one message
straight to a complete three-tiered answer with no middle — no clarifying beats, no "let me
check a couple of things." It feels like a form that returns a document, not a conversation.

**4. Detail obsession.** Optical icon alignment, hairlines, contact shadows, and *every*
state (hover, press, focus, empty, loading, error) designed. Our legacy screens have
undesigned loading/empty states and mixed detail quality.

**5. Perceived performance.** Optimistic UI, skeletons, streaming — the product feels alive
and instantaneous. Ours resolves a prepared turn behind a fixed 400ms×N progress and then
dumps the whole answer.

We have the bones the generic clones lack — a real token system, honest accountability
surfaces, a distinctive palette. What we are missing is **(1) motion, (2) consistency across
the seam, and (3) the conversation's middle.** Those three are the entire distance between
"barely refined" and "premium." None of them is a rewrite; all three are finishing.

---

## 1. What has been built (project history)

The 7-day push, in order:

- **Design-system base** — 4 layers (tokens → primitives → layout → domain), build-guarded
  (`verify-demo.mjs`, `ui-debt.mjs`): no raw colour/radius/type at call sites; per-script
  typography (Fraunces + Hanken + Noto); `<Screen tone="stop">` inversion.
- **Notice Interpreter** (founding feature) — in-chat document turn, depth-by-document,
  original↔plain reader with clause correspondence, multilingual interpretation.
- **This session's shell/flow overhaul:**
  - Responsive frame (scale-to-fit, device tokens 360/390/430).
  - Composer rebuilt (bespoke mic/send glyphs, integrated).
  - New "L" tile logo; Home debranded; em-dashes removed; **Fraunces softened** (variable
    font, SOFT/opsz axes).
  - **Chat-first Home** — types render the three-tiered `Turn` inline; steps become chips.
  - **Case workspace** hub replacing the intake modality picker.
  - **Onboarding** — coded hero, language pick, prepared Google sign-in.
  - **Animated icon set** (`@animateicons/react`) across the primary surfaces.
  - Notice reader, drawer, documents cleanups.

The result is a strong *foundation* and several genuinely premium screens (onboarding,
notice reader, case hub, stop states). The weak spots are all at the seams and in motion.

---

## 2. Owner-flagged issues (2026-08-28)

1. **Chat animations are janky/instant** — no smoothness, content pops in.
2. **The conversation is missing its middle** — it should be: *state the problem → a few
   follow-up questions → the process (the "5 steps") → the three-tiered answer → then act.*
3. **Actions open the old world** — tapping Verify/Evidence opens `?stage=` screens that
   are not design-consistent, and **`Step 4 of 6`** is the wrong interaction model for a
   chat-first product.

All three are correct and are the spine of the rebuild direction (§4).

---

## 3. Full audit — what a product designer would reject

Severity: **REJECT** (a reviewer stops here) · **FLAG** (visible, fix soon) · **POLISH**.

### 3A · Motion — the biggest gap

| # | Finding | Sev |
|---|---|---|
| M1 | Chat messages/status/answer **mount instantly** — no enter/exit transition anywhere in the mobile stream. | REJECT |
| M2 | The three-tiered `Turn` **zones pop** (conditional render on `revealed>=n`), they do not fade/slide — so even the "staged reveal" is abrupt. | REJECT |
| M3 | **Status → answer is a hard swap** (filter out, push in) with no crossfade. | FLAG |
| M4 | **No streaming/typing feel** — the answer appears whole. No token reveal, no typing dots on mobile. | REJECT |
| M5 | The new **animated icons only fire on hover** — on a touch phone they are static; nothing calls `startAnimation()` on press. The library adds weight and pays nothing back on the target platform. | FLAG |
| M6 | **Press feedback is a CSS class only** (`.lokai-pressable`) — no scale, no haptic, no spring. | POLISH |
| M7 | Reduced-motion path exists, but the **default path has almost no motion to reduce** — the inverse of the intended relationship. | FLAG |
| M8 | `MOTION` tokens exist (durations + one ease) but are **barely used**; there is no shared motion helper/standard for entrances. | FLAG |

### 3B · Flow & interaction design

| # | Finding | Sev |
|---|---|---|
| F1 | **The conversation has no middle** — one user message → full answer. The `clarify` mode exists in the engine but is never sequenced into the chat. | REJECT |
| F2 | Action chips open **legacy `?stage=` wizard screens** — a different header, different layout, a different world. A reviewer sees two apps stitched together. | REJECT |
| F3 | **`Step 4 of 6`** is a linear-wizard signal inside a non-linear chat product — contradictory interaction model. | REJECT |
| F4 | The progress before the answer is a **fixed 400ms×N stage list**, not tied to anything the user did — reads as fake latency rather than real work. | FLAG |
| F5 | The "5 steps" the owner expects (intake→clarify→verify→assess→plan→packet) are **not surfaced as a legible arc** in the chat — they only exist as separate routes. | FLAG |

### 3C · Visual consistency

| # | Finding | Sev |
|---|---|---|
| V1 | **Two dialects.** Legacy stage internals (`LokAIWorkflow.tsx`, the packet/plan inline cards) use raw `SANS`/`SERIF`/`C.*`, bordered boxes (border **and** shadow), and hand-composed layout; the rest is on primitives. | REJECT |
| V2 | The three-tiered **`Turn` card itself is the legacy border+shadow card**, not the `Card` primitive — the centrepiece is in the old dialect. | FLAG |
| V3 | **Border+shadow boxes** on AutonomyDial / IntentPreview / GuideOnly / EvidenceLocker — the outlined-box look the `Card` docstring explicitly bans. | FLAG |
| V4 | **Two status vocabularies** for the same evidence (`Gathered/Needs a check` on Documents vs `Uploaded/Conflicts a fact` on Verify). | FLAG |
| V5 | **Filled + outlined two-button pairs** resurface (plan's "Mark done / I'm blocked"). | FLAG |
| V6 | Spacing rhythm differs between the clean hub and the dense legacy stage screens. | POLISH |

### 3D · Detail / craft

| # | Finding | Sev |
|---|---|---|
| D1 | **Undesigned empty/loading/error states** on legacy screens (no skeletons, no considered empties). | FLAG |
| D2 | Mixed icon eras still present in deep legacy (Phosphor holdouts in `LokAIWorkflow`, profile, voice, desktop). | POLISH |
| D3 | No optimistic UI / skeletons anywhere — everything waits then dumps. | FLAG |
| D4 | Focus states rely on a single global ring; no per-component focus craft. | POLISH |

---

## 4. Rebuild direction

The order is deliberate — motion first (biggest perceived-quality lever), then the
conversation model, then closing the seam, then detail.

### 4A · A motion system (build it, then use it everywhere)

- A single `Motion` helper over the existing `MOTION` tokens: an entrance recipe
  (**fade + 8px rise, spring bounce 0, ~240ms, staggered**), an exit recipe, and a press
  recipe (**scale 0.97 + optional `expo-haptics`-style hook**).
- **Chat message motion:** wrap the stream items in `AnimatePresence`; each message and the
  answer enters with the entrance recipe; the status → answer transition **crossfades**.
- **Streaming feel:** either progressively reveal the answer text, or fade each of the three
  zones in sequence with a *visible* opacity/position transition (not a conditional pop).
- **Typing indicator:** three breathing dots as the working state (the desktop `lokaiDot`
  keyframe already exists), then crossfade to the answer.
- **Icons:** fire `startAnimation()` on press (imperative handle) so the animation pays off
  on touch, not only on desktop hover.
- Reuse what's already in `pages/Chat.tsx` (fade-up, dots, shimmer) — port, don't reinvent.

### 4B · The conversation model (redesign the middle)

The arc the owner described, rendered entirely in chat:

1. **Problem** — user types (or attaches a notice).
2. **Clarify** — 1–2 short follow-up turns (the `clarify` mode already exists), each a
   quick tap-or-type, so the user feels *heard* before being answered.
3. **Working** — one honest progress turn ("reading your facts… checking the sections…"),
   the "5 steps" shown as a legible arc, not fake latency.
4. **Answer** — the three-tiered response, on the primitives, streamed/faded in.
5. **Act** — verify facts, evidence, action plan, demand notice open as **in-chat
   expansions or bottom sheets in the same visual language** — never a separate wizard
   route, and with **no `Step N of 6`**. The case-hub stays the persistent map of the
   matter; the steps are tools opened from it or from chat.

### 4C · Close the seam (migrate the legacy internals)

Rebuild `EvidenceLocker`, `VerificationScratchpad`, `WorkflowActionPlan`, `HumanReviewCard`,
and the packet/plan inline cards onto `Card`/`HairlineList`/`Text`/`Button`. Remove
step-counters, border+shadow boxes, two-button pairs; unify the status vocabulary; retire
Phosphor fully. This is the "one visual language" fix from §0.

### 4D · Detail pass

Skeletons + optimistic UI; designed empty/error states; press haptics; focus craft;
one caps-eyebrow token; the attest-on-paper contrast re-measure.

---

## 5. Priority order

1. **Motion system + chat message motion + streaming feel** — the biggest jump in perceived
   quality for the least structural change.
2. **Conversation model** — add the clarify middle; move actions in-chat; kill the wizard
   and the step-counter.
3. **Migrate legacy stage internals onto primitives** — erase the seam; retire Phosphor.
4. **Detail/polish pass** — skeletons, empties, haptics, focus.

Everything here is finishing work on a sound foundation. None of it is a rewrite.
