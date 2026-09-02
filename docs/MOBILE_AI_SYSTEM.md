# LokAI — Mobile-First AI Component System

**Status:** active build spec, written 2026-08-25 (day 4 of the 7-day push).
Supersedes the vague "component-level visual-craft audit" framing of Phase 1d in
`~/.claude/plans/gleaming-imagining-minsky.md` — that phase said *what question to
ask*; this document answers it and turns it into a work list.

Read alongside `HANDOFF.md` (status) and `PRODUCT.md` (voice/boundaries).

---

## 0. The bet

Every existing AI-chat component library is **web-first and happy-path-first**:
Vercel AI Elements, assistant-ui, prompt-kit, LlamaIndex chat-ui. They all ship
essentially the same set — message list, streaming markdown, code block, composer,
suggestions, sources, loader.

Two gaps, and LokAI already has product answers to both:

1. **Nobody has designed the mobile surface.** These are desktop chat panels.
2. **Nobody has designed the accountability surface** — what an AI shows when it
   *won't* answer, when evidence is missing, when the user must verify a fact
   before the model proceeds, when it hands off to a human, when jurisdiction
   changes the answer.

So the system being built here is: **mobile-first components for AI that has to be
accountable.** That is the case-study claim, and it is currently unclaimed. It is
not being published as a library this week (see `HANDOFF.md` — a four-component
public repo is a negative signal on a job hunt); it is being built inside LokAI and
presented as a documented system via the existing `/specimen` + `/dev` gallery.

---

## 1. Composition law

These seven rules are the whole redesign. Every screen-level task below is an
application of them. If a decision isn't covered here, it defaults to "do the
quieter thing."

**L1 — Ground, not boxes.**
Body content sits directly on the page. A container must *earn* itself: something
is a card only if it is a discrete object the user could pick up and move — a
source, a piece of evidence, a saved matter. Explanatory prose is never a card.
Target: **at most two containers visible per screen.** Current mobile screens run
five to seven.

**L2 — One focal move per screen.**
Exactly one element is the biggest / darkest / first. Everything else is
subordinate. If two things compete, one is wrong.

**L3 — Answer first, chrome after.**
The thing the user came for is the first content below the header. Disclaimers,
step restatements, and glossary hints are persistent but quiet — a line, a rule, a
footer — never a card ahead of the content. (Today the actual legal answer is the
*fourth* card on `?stage=assess`, below the fold on a 390px screen.)

**L4 — Type carries hierarchy; borders don't.**
Weight, size, and color contrast do the work that 1px rules and tinted fills do
now. The Fraunces serif is the register change for "this is the law speaking" —
it needs no eyebrow label above it to say so.

**L5 — Mobile earns a dark anchor.**
Desktop reads as designed largely because the navy sidebar gives the eye somewhere
to land; mobile is cream-on-white end to end and reads unfinished. Navy appears on
mobile in exactly three roles: the composer, the single primary CTA, and the stop
states (L6). Nowhere else.

**L6 — Stop states are the most designed screens in the app, not the least.**
The product's thesis is that it knows when to stop. Today the refusal screens are
Bootstrap alerts — a pink box with a red left border — and the highest-affordance
element on the `high_risk` screen is a navy **"Continue"** button directly under
text saying *do not rely on AI-generated strategy*. Stop states go full-bleed dark,
the safe action becomes the primary action, and "continue anyway" is demoted to a
text link or removed entirely.

**L8 — A stop is always the tonal opposite of its surroundings.**
The generalized form of L6, and the rule that makes dark mode coherent rather than a
second skin. In the light theme a stop state goes full-bleed dark. In the dark theme it
goes warm and luminous. The *contrast relationship* is the constant; the direction
flips. This means the refusal never blends into its own app, in either theme, and it
gives the case study a genuinely systemic thing to show rather than "here's a dark
toggle."

**L7 — Say it once.**
Redundancy is this codebase's most systemic visual bug, not a one-off:
- header "Verify the facts / Step 3 of 6 · Confirming facts" + a `CURRENT STEP`
  card restating it
- `GroundingMeter` "4 of 4" + a second bar "4 of 4 confirmed" directly beneath
- `high_risk`: `CURRENT STEP` and the card below it repeat the same sentence verbatim
- "View source notes" and "View source trail" as two adjacent buttons

Fix as one IA pass across the flow, not component by component — otherwise each
fix invents its own answer. **One eyebrow label per screen, maximum.**

---

## 2. The component set

Left column is what the web libraries ship. Right column is what LokAI ships and
why it is different. The right column is the portfolio artifact.

### Inherited, but re-formed for mobile

| Component | Web-library form | LokAI mobile form |
|---|---|---|
| `Composer` | Bottom-anchored textarea, send button, desktop-width | Already correct and voice-wired (`Turn.tsx:774`). Keep. Add: notice/upload branch preserved (risk 8 in the plan). Navy surface per L5. |
| `Answer` | Streaming markdown blob | **Three named zones** — what the rule means / how it applies here / what you can do next. Structured, not prose-dumped. Serif for zone 1. No card. |
| `Sources` | Desktop side drawer | **Bottom sheet**, capped ~85vh so the answer stays visible behind it (1b-2 fixed the takeover bug; keep it a sheet, never a full-screen route). |
| `Suggestions` | Prompt chips | Kept, but jurisdiction-scoped rather than generic. |
| `Loader` | Spinner / shimmer | Stage-aware: the app says *which* step it is on, never a bare spinner. |

### The organizing spine — `ResponseMode`

**This is the system, not a component.** `EMOTION_CRAFT` (`Turn.tsx`) defines seven
response modes — `explain / clarify / disclose / stop / confirm / progress / recover` —
each mapped to a named emotional intent with concrete craft deltas (`statusTone`,
`revealStepMs`, `denser`, `primaryFirst`, `statusLine`). It is the most sophisticated
thing in this codebase and no version of the case study has ever mentioned it.

Every component below is **an expression of one or more modes**, not an independent
invention. `StopState` (§3.4) is the `stop` mode. `VerificationGate` (§3.2) is `confirm`.
`GroundingMeter` (§3.3) is `disclose`. Designing them separately is exactly the mistake
that produced the current inconsistency — a folded corner here, a pink alert there.

**Rule: no component gets a visual decision that its mode doesn't justify.** If two
components share a mode they share a visual register; if they differ, the difference
must be traceable to the mode. This is what makes it a system rather than a set.

Also: justify the staged reveal explicitly in the case study. Industry guidance is
blunt — *don't artificially slow output to feel human*. `EMOTION_CRAFT` stages zone
reveals at 160–280ms. That's a different job (pre-written turns paced for legal
comprehension, not faked streaming latency), but it's the same family of question, and
unnamed it reads as an oversight when probed.

### Net-new — the accountability set

These have no equivalent in any shipped AI component library. This is the claim.

| Component | Mode | What it does | Notes |
|---|---|---|---|
| `NoticeInterpret` | `explain` / `disclose` | The founding feature. User drops a notice (photo/upload) **into chat**; the response *is* the interpretation — translated to their language, plain-language summary, amounts + legal sections + deadlines surfaced from the dense original. | Desktop `Notice.tsx` (770 lines: OCR, clause highlighting, `PaperTexture`) is the *logic and craft* source — bring it to mobile as an **in-chat response**, not a separate route. Mobile-first, per the product owner (§3.8). |
| `VerificationGate` | `confirm` | Confirm-or-fix extracted facts **before** the AI proceeds. The user owns the facts, not the model. | Currently `VerificationScratchpad` (`LokAIWorkflow.tsx:766`). The single most differentiating component in the app. Full redesign — §3.2. |
| `GroundingMeter` | `disclose` | Claim coverage as a **count** ("4 of 4 claims trace to a source"), never a fabricated confidence %. | Conceptually right, presentation is the problem — §3.3. |
| `CitationStamp` | `disclose` | Per-claim source attribution, domain-first with `+N` overflow. | `shared.tsx:447` calls it "the most important UI component" in its own comment. Phase 1 moved it to the domain-first format; verify it survived and reads at mobile size. |
| `StopState` | `stop` | The 8-way refusal taxonomy — one component, eight kinds. | Full redesign per L6 — §3.4. |
| `AuditTrail` | `disclose` | What the AI did, in order, and why. | `AuditTrailList`. A genuine accountability primitive no AI library ships. Currently underplayed as a minor stage. |
| `EscalationHandoff` | `stop` → continuity | Hand-off to a human/legal-aid partner, framed as continuity, not failure. | `HumanReviewCard`. Also the business-model surface (§4.6). |
| `AutonomyDial` | — | Guide-me vs. prepare-for-me. The user sets how much the AI is allowed to do. | Exists in `MobileConsumerCase`. One decision card in the case study, not its own section. |
| `VoiceCapture` | `confirm` / `recover` | 9-phase machine whose `confirm` phase renders the transcript **editable before it commits**, and whose `unclear` phase refuses to guess. | `useVoiceCapture.ts`. Architecturally right; the screen around it is scaffolding-first — §3.5. |
| `JurisdictionBar` | — | Sets scope before the user asks something unanswerable for their state. | On mobile home already. Founding-thesis pillar, not decoration. |
| `StageRail` | `progress` | Where you are in a multi-step legal process. | Currently a card; becomes a rail (L1). |
| `EvidenceLocker` | `disclose` | What the AI checked before trusting the facts, incl. document conflicts. | Genuinely discrete objects → legitimately cards (L1). |
| `GlossaryTerm` | `explain` | Inline plain-language definition of a legal term. | Exists, works. Keep; de-card it. |

### 2.1 Script & language — a system property, not a feature

LokAI's founding thesis is **people receiving legal notices in a language and
jurisdiction not their own.** Multilingual is the origin, not an addition — so it is a
property of every component above, not a separate one. It is also a second unclaimed
gap: no shipped AI component library handles code-switched non-Latin type either.

Three decisions already made in Phase 1-A2, to be *stated* in the case study rather
than left implicit:

1. **The display serif is Latin-only on purpose.** Fraunces has no Indic glyphs. Rather
   than bolting on an ornate Indic display face, Indic scripts lead with the sans, sized
   and weighted up to hold the display role — legibility beats flourish for a stressed,
   mixed-literacy reader.
2. **Noto because the content is code-switched, not because it's available.** The Tamil
   pack already mixes Latin inline (`"சேதமடைந்த மிக்சர் — refund"`, `"ticket ID"`,
   `"e-Daakhil"`). Latin and Indic faces must share baseline and x-height or every line
   looks broken. Noto is a harmonized superfamily; that's the reason.
3. **The multilingual scale and the accessibility scale are one system.** Per-script
   line-heights are unitless multipliers, so they scale correctly when body type is
   `rem` and the user raises their OS text size. Say this — it's the craft story.

Carried constraints: adding a language stays a 3-file change (`fonts.css` +
`languagePacks.ts` + `SCRIPT_RAIL`); `LANGUAGE_REGISTRY`'s `prepared` flag keeps
unsupported languages honest instead of silently falling back to English mid-conversation.
**Check during the redesign:** the `[lang="ta"]` rule applies `calc(1em + 1px)` to the
whole element, so inline Latin words get the +1px too — verify that still reads right
once components are re-composed.

---

## 2.2 Dark mode — mobile only, a complement not an inversion

**Scope: mobile only.** Desktop stays light for now (explicit decision, 2026-08-25) —
it keeps the surface count honest on the runway, and desktop's navy sidebar already
gives it the tonal anchor mobile lacks.

### The blocker, and why it's actually good news

**Color is not tokenized. 235 raw hex literals across 17 files, 79 distinct values,
against a token palette of ~40.** Worst offenders: `LokAIWorkflow.tsx` (49),
`Notice.tsx` (44), `MobileConsumerCase.tsx` (36), `MobileHome.tsx` (21).
`verify-demo.mjs` enforces tokens for radius, type and shadow — but never for color, so
color drifted freely while everything else held.

A theme cannot be swapped under 79 hardcoded values. **But the redesign has to touch
every one of those components anyway.** So this is not additional work bolted onto the
plan — it is the same work, done once:

> **Rule for every component touched from here on: no raw color. Semantic token names,
> not literal ones** — `surface.raised`, `text.secondary`, `border.hairline`,
> `stop.ground` — so the same component reads correctly under either palette without a
> single conditional. Extend `verify-demo.mjs`'s existing hex guard to fail the build on
> raw color the way it already does for radius, so this cannot regress.

Sequencing follows directly: **dark mode is not a phase after the redesign, it is a
constraint during it.** Theming components that are about to be rebuilt is wasted work;
rebuilding them without semantic tokens means doing them twice.

### The palette direction

The wrong move is inverting cream to charcoal — the paper metaphor dies and it becomes
generic dark SaaS. Light mode is **paper in daylight**; dark mode is **paper under a
desk lamp at night.** Same material, different light source.

The mechanism: **the cream becomes the ink.** In light mode `#F8F5EE` is the ground and
`#181713` is the type. In dark mode that warm cream moves from ground to figure — it
becomes the text — and navy, already the darkest brand color, becomes the ground. So
dark mode is *navy-grounded and warm-inked*, which is the exact complement of a
warm-ground/dark-ink light theme, and it is built from brand colors rather than a
borrowed neutral ramp.

Direction (values to be tuned against real contrast measurement, not adopted as-is):

| Role | Light | Dark — direction |
|---|---|---|
| ground | `#F8F5EE` warm cream | deep navy-black, desaturated from `navyDark` |
| surface / raised | `#FFFFFF` | navy lifted one step, never pure black |
| text primary | `#181713` ink | warm off-white — the cream, promoted to figure |
| text secondary | `#48453D` | warm grey, re-measured for AA on the new ground |
| border | `#E7E0D4` | low-contrast navy hairline, not grey |
| saffron | `#E9852B` | lightened; the current value fails on dark as it does on light |
| stop state | full-bleed dark | **warm and luminous** (L8) |

**Every semantic color must be re-measured for contrast in dark — do not assume the
light-theme ratios carry.** Phase 1 did real WCAG work (`--text-tertiary`, the focus
ring, `EMOTION_CRAFT.honest_gap.statusTone`); dark mode reopens every one of those
measurements. This is the part most likely to be underestimated.

**Also re-check per script.** The Devanagari and Tamil faces have different apparent
weight than Inter at the same size; on a dark ground, light-on-dark makes strokes bloom
optically. Verify Hindi/Marathi/Tamil in dark specifically — this is the kind of detail
that makes the multilingual claim (§2.1) credible rather than asserted.

### Case-study value

A light/dark pair shown side by side is a strong craft artifact — but only if it says
something. The defensible line here is **"the cream becomes the ink"** plus L8's tonal
inversion of the stop state. That is a systems argument. A toggle is not.

---

## 2.3 The system layer — built 2026-08-26, why it was the blocker

Everything above was written as *rules*. Rules that live only in a document get
re-derived by hand at every call site, and they drift wherever the build guard is not
watching. That is not a hypothesis — it is what measurably happened:

| Symptom | Measured |
|---|---|
| Screens hand-composing every element | 172 inline style objects in `LokAIWorkflow.tsx` alone |
| Raw colour, unguarded | 215 hex literals; 823 raw-style lines counting `rgba()`, `fontFamily`, `lineHeight` |
| Per-script typography never applied | `[lang="hi"]` / `[lang="ta"]` rules in `index.css` have **never matched an element** — nothing in the app sets a `lang` attribute. Only `Turn.tsx` did it, privately, in JS |
| Stop state not full-bleed | `FailureStateCard` renders inside the scroll container; status bar, top nav, header and cream ground all stay lit |
| Contradictory tokens | `TYPE` is rem; `Btn` and `InputField` in `shared.tsx` hardcode 13/14/15px, silently opting every control out of the Dynamic Type work |

Every one of these has the same root cause: **the codebase had layer 1 (tokens) and layer
4 (domain components) and nothing in between.** There was no `<Text>`, so script handling
had nowhere to live and only one component remembered it. There was no `<Screen>`, so the
stop state could not own its chrome. There was no `<Card>` with a stated test, so the
folded corner on `VerificationScratchpad` was as legitimate as anything else.

The missing layers now exist:

```
1 TOKENS      ui/theme.ts + styles/index.css role layer + shared.tsx
2 PRIMITIVES  ui/primitives.tsx   Text Label Amount Button IconButton Badge Field
3 LAYOUT KIT  ui/layout.tsx       Screen Stack Row Rule Card HairlineList HairlineRow
4 DOMAIN      Turn VerificationGate StopState NoticeInterpret + screens
```

Three properties that were previously per-call-site now come free and cannot be
forgotten: **theme safety** (roles, not literals — §2.2's blocker is gone),
**script safety** (`<Text>` sets `lang` and resolves family + leading from the active
language), and **tone safety** (`<Screen tone="stop">` inverts the entire artboard).

Enforcement widened to match. `verify-demo.mjs` guarded radius, `fontSize` and
`boxShadow` — and nothing else — so drift went exactly where it wasn't looking.
`scripts/ui-debt.mjs` is a per-file **ratchet** on raw colour, family and leading:
today's counts are the budget and a budget may only fall. Migrating a screen drops its
budget; adding a raw hex fails the build. When every file reads 0, delete the script.

Build sheet: **`docs/LLM_DESIGN_SYSTEM.md`** — the copy-pasteable one-pager. Read it
before writing any screen.

---

## 3. Screen work list

Ordered by leverage. Each item is independently shippable and screenshot-checkpointed
before moving on (per the user's stated working style — no build-ahead passes).

### 3.1 `?stage=assess` — the answer screen · **do first**

Highest leverage: it is the core AI response, the centerpiece of the case study, and
it currently violates L1, L2, L3, and L7 simultaneously.

**Now:** header → `CURRENT STEP` card → disclaimer card → glossary card → answer card
→ "View source notes" → `TRUST CHECK` card (spec table) → "View source trail" → 2 buttons.
Seven stacked containers; the answer is fourth.

**Target:**
- Slim sticky header: back, matter title, `StageRail` as six dots — not a card.
- **The answer immediately**, on the ground, no container. Zone 1 in Fraunces at
  editorial size — the serif *is* the label, delete the `WHAT THE RULE MEANS` eyebrow.
  Zones 2 and 3 in sans, separated by whitespace and one hairline, not by boxes.
- Grounding as a **quiet tappable line** under the answer ("4 of 4 claims trace to a
  source →"), opening the source sheet. Not a card, not a spec table.
- All trust detail moves *into* the sheet. Nothing inline.
- Disclaimer: one quiet line above the CTA.
- **One** primary CTA: "See action plan." Kill the second button.

Net: seven containers → one (the sheet, on demand).

### 3.2 `VerificationGate` — the signature component · **do second**

**Now** (`LokAIWorkflow.tsx:766-985`): folded-corner card (one sharp corner, three
rounded, + a 3px navy top border) that represents nothing and appears nowhere else in
the app; two redundant progress indicators back to back; a fact list rendered as
bordered boxes with colored left borders and caps-label/value pairs — indistinguishable
from a KYC form.

**Target:**
- Drop the folded corner entirely. It is a one-off flourish, not a system.
- **One** progress indicator (L7). Recommend keeping `GroundingMeter` and deleting the
  second bar, since coverage-as-claim-count is the product idea and "N of M confirmed"
  is just a restatement.
- Facts become **a list, not a stack of cards** — hairline separators, generous row
  height, the value in the strong position and the label quiet beneath it (currently
  inverted: the caps label shouts, the actual fact whispers).
- The needs-review state is the only one that gets any fill, and it gets a warm tint
  with no border — flag the exception, don't box every row.
- Keep the gated CTA behaviour exactly as-is; it is the product decision. Restyle only.

### 3.3 The trust surface — `TRUST CHECK` → claim ledger

**Now:** a label/value table — *What the source supports → Direct. Facts needed →
Complete. Location rule → Confirmed. Draft stage → AI draft.* The most distinctive
thinking in the product, rendered as a phone settings list.

**Target:** a **claim ledger**. One sentence — "4 of 4 claims trace to a source" —
followed by the four claims themselves as tappable lines, each showing its source.
That makes "inspectable grounding instead of a confidence score" something the user
can *see and touch*, rather than a table describing that it happened. This is D-02,
the headline decision card in the case study, so it gets photographed — it has to
carry.

### 3.4 `StopState` — the 8 refusals · **the case-study money shot**

**Now:** pale pink box, red left border, bold heading, nested grey box — a Bootstrap
alert. And on `high_risk`, a navy **"Continue"** is the primary action beneath text
saying *do not rely on AI-generated strategy for this matter*.

**Target:**
- **Full-bleed dark treatment.** The one place mobile goes navy (L5/L6). Semantically
  right — a stop is a different kind of moment — and it makes the screenshot of "the
  AI refusing" read as deliberate design rather than an error state.
- **The safe action is the primary action.** "Find legal aid" / "Talk to a human" is
  the filled button. "Continue anyway" becomes a text link, or is removed where the
  refusal is absolute.
- One sentence explaining *why* it stopped, in plain language, at editorial size.
- Kind-specific detail sits below the fold or in a sheet — not competing with the stop.
- All 8 kinds share the component; only the reason line and the offered action change.

### 3.5 Voice — `MobileVoiceActive`

Demo scaffolding currently occupies the hero position ("No microphone permission is
requested. This plays a scripted sample…"). Keep the honesty (`PRODUCT.md` requires
it), demote it to a quiet disclosure line, let the interaction lead. Wire up
`voiceBarListen` — the waveform keyframes are written and never referenced
(`MobileVoiceActive.tsx:12-21`); the listening state is a single pulsing circle
instead. Slow the showcase timings (900ms/650ms is too fast to register).

Then build the two specimens Phase 2 flagged as most differentiating and never
shipped: **`voice-capture`** (listening → transcribing → editable confirm → done)
and **`voice-unclear`** (refuses to guess, always offers the text escape).

### 3.6 Sweep — remaining surfaces

Apply L1/L3/L7 to `intake`, `clarify`, `plan`, `packet`, `audit`, `escalation`,
`MobileHome`, `MobileFiles`, `MobileProfile`. Mostly deletion: kill the `CURRENT STEP`
card everywhere (the header already says it), kill the repeated disclaimer card
(becomes a footer line), de-card explanatory prose.

Mobile home is already the strongest screen — jurisdiction line, serif greeting, real
stepper, composer. Its only real problem is a large dead zone mid-screen. Do least here.

### 3.7 Desktop — a real surface, not a fallback

Correcting an earlier draft of this doc that scoped desktop to "inherit only." That is
the right call for *polish budget*, but not for a surface the positioning claims is at
full parity. (Desktop is **not** the sole home of notice interpretation — that was a
wrong call, corrected in §3.8; notice is mobile-first and in-chat.) Desktop still has to
hold up as a co-equal surface.

The good news: desktop's problem is genuinely different from mobile's. Structurally it
is the **strongest thing in the app** — three panes (navy sidebar / conversation /
legal-context rail), a real dark anchor, and a right rail that is properly
product-specific rather than generic chat furniture. It needs refinement, not rebuild.

**Free wins — desktop inherits these automatically.** The three-zone `Answer`,
`VerificationGate`, `StopState`, `GroundingMeter`, and the claim ledger are shared
components. Every §3.1–3.4 fix lands on desktop with no extra work. That is the parity
argument made real: one component, two surfaces.

**Desktop-specific work, in order:**

1. **The right rail has the same box-stack disease** (L1/L7). Four labeled groups —
   `LEGAL CONTEXT`, `KEY SECTIONS`, `KEY FACTS`, `RELATED LAWS` — each holding bordered
   cards. Same fix as mobile: statute sections are discrete objects and stay cards; key
   facts and related laws are lists and lose their boxes. One eyebrow label for the rail,
   not four.
2. **The user message bubble is filled oxblood** — the most saturated element on screen,
   pulling the eye to the *question* rather than the answer, and reading as an error
   color. Quiet it to a light surface with an ink border, or drop the fill entirely.
3. **The composer occludes content behind it** — "→ Prepare demand notice" sits cut off
   under the floating composer. Add bottom padding to the scroll container equal to
   composer height + gap.
4. **`StopState` needs a desktop form.** Full-bleed dark (L6) does not translate to a
   three-pane layout — blacking out the centre column while the sidebar and rail stay lit
   looks broken. Desktop keeps L8's *contrast relationship* but expresses it as the
   conversation column going dark **and the right rail switching to the escalation
   path**, so the whole window changes job rather than one panel going dark. This is a
   genuinely different composition, not a reflow — budget for it.
5. **Notice Interpreter — keep it strong, but it's no longer desktop-exclusive.** It has
   the strongest *material* in the app — `PaperTexture()`, real hairline rules,
   paper-toned surfaces — the direction everything else should move toward. It carries
   **44 raw hex literals** (second-worst file), so the §2.2 tokenization pass hits it
   hard. Keep the paper craft, tokenize the color, apply L1/L7 to the chrome. Its OCR +
   clause-highlighting logic is the source that §3.8 ports to the mobile in-chat form.
6. **Dead space bottom-right** at 1440px+. The rail runs out of content well before the
   viewport ends.

**Still deliberately excluded:** no dark mode on desktop (§2.2), and no desktop-only
components beyond the `StopState` composition in item 4.

### 3.8 `NoticeInterpret` — notice interpretation in mobile chat · the founding feature

**Product owner's spec (2026-08-25):** a person receiving a legal notice they can't read
is *the* origin user, and they're on a phone. So this is not a desktop tool and not a
separate route — it is a **chat capability**:

- The composer already has a notice/upload affordance (the `Sample notice` tile in
  `IntakeView`, and `?stage=packet&notice=offer`). Wire it to accept a notice as chat
  input on any mobile surface, not just the intake tiles.
- Dropping a notice produces a **response turn** whose body *is* the interpretation:
  1. **Translated** into the user's chosen language (§2.1 — this is where multilingual
     stops being a demo and becomes the point).
  2. **Plain-language summary** — "what this notice is actually telling you," one
     paragraph, `explain` mode.
  3. **Surfaced specifics** — amounts, legal sections, the deadline/response window —
     pulled from the dense original, each as a scannable line, `disclose` mode with
     `CitationStamp` back to the clause it came from.
- Reuse, do not rebuild: `Notice.tsx` already holds the OCR flow, `zonesFromInterpretation`,
  clause highlighting, and the paper craft. Port that logic into a mobile response turn;
  the desktop screen keeps its wide-canvas version for side-by-side original vs.
  interpretation, but mobile is now the primary surface.
- Deterministic-demo constraint holds (`verify-demo.mjs`): no real OCR/network — a
  prepared notice → prepared interpretation, same as every other scripted turn.

This is the highest-thesis-value screen in the whole app. It slots at **day 5**, not as
a stretch — it's the feature the founding story is *about*.

#### 3.8a The interaction model — one object, two depths (resolved 2026-08-26)

The open question was whether notice interpretation is *two* features — "upload any
document as chat context" and "the notice interpreter with its side-by-side view" — and
if so, how a user sees the interpretation while they are mid-chat.

**It is one feature.** Two features would force the user to classify their own document
before the app has read it, which is precisely the thing they came here unable to do.
Resolution:

**1 · Every document enters through the composer.** There is no separate upload route
and no mode picker. Attaching produces a `DocumentTurn` in the stream — a paper-toned
`Card` (a document is a discrete object, so it earns the container under L1) carrying:
document name · page count · detected language, then the plain-language summary, then
the surfaced fields as a `HairlineList` with a `CitationStamp` per field.

**2 · Depth is decided by the document, not by the user.** A notice or circular gets
fields extracted (amount claimed, reply-by, section invoked). A receipt or a photo is
filed as evidence and gets a one-line acknowledgement instead. The user never picks;
they find out what they had. *This is the founding thesis rendered as an interaction* —
the person who cannot read the notice also cannot categorise it.

**3 · Side-by-side becomes link, not layout.** Desktop shows original and interpretation
in two columns; 390px cannot, and stacking them is not a translation of the idea, it is
a loss of it. Tapping the document turn opens the existing `Sheet` at full height with
two views — `In plain words` / `Original` — and **tapping a surfaced field scrolls the
original to the exact clause it came from and highlights it.** The clause-highlighting
logic already exists in `Notice.tsx`. What desktop does with adjacency, mobile does with
correspondence — a stronger demonstration of grounding than the desktop version, and a
genuine case-study beat rather than a responsive fallback.

**4 · "See the summary while I'm chatting" is a persistent strip, not a screen.** Once a
document is attached to the matter, a single quiet line sits above the composer:
`notice_hindi.pdf · in plain words ↗`. One line, no card, always tappable, reopens the
sheet at whatever depth. That is the whole answer to the question, and it costs one
component.

**Copy note (product owner, 2026-08-26):** the UX copy drops government register. The
user's word is "document" — never "instrument", "communication", or "matter
correspondence". The one place formal language is allowed to survive is inside the
*original*, quoted, where its strangeness is the point.

**Constraint:** `verify-demo.mjs` forbids `type="file"`, so the attach affordance stays a
prepared pick from a scripted set. Keep it — it is the deterministic-demo rule, and it
also means the demo can never fail on a bad scan.

### 3.9 Documents — exhibits in a matter, not files in folders

Desktop `Documents.tsx` is a generic file manager: rows, coloured type-chips, a folder
metaphor borrowed from an operating system. It is the most replaceable screen in the app
and it currently reads that way.

**The reframe:** in a legal matter a document is not a file, it is an **exhibit** — it
exists because it proves something, and its value is its relationship to a claim. So the
IA is matter-first, not folder-first, and each document carries:

- a **mono reference** (`EX-03`) — how it will be cited in the notice or complaint
- **what it proves**, in one line ("that the seller refused a replacement")
- **where it is used** — which claim(s) in the current draft depend on it
- **provenance** — uploaded by the user, or extracted by LokAI from another document

That last pair is the accountability surface again: an exhibit whose claim was later
retracted should say so. No file manager ships that, which is the same argument as the
rest of §2's net-new set.

**Visual direction is open — references pending from the product owner.** Two
constraints regardless of what lands: a document renders as a **paper object** (the
`PaperTexture()` craft in `Notice.tsx` is the direction, not a coloured file-type chip),
and there is exactly one icon library — `lucide-react`, already the app's only icon
source. The two `@mui` packages in `package.json` have **zero imports** and should be
dropped in the same pass.

---

## 4. Sequence — 3 days left

Today is day 4 of 7. The case study is the deliverable; the app is evidence for it.
Anything that doesn't end up on the case-study page is cut.

### Scope reality — read this before starting

Dark mode (§2.2) and real desktop work (§3.7) were added on day 4. Honest cost: **about
+1.5 days** against a runway that had roughly half a day of slack. The tokenization pass
is *not* part of that overage — it folds into component work that has to happen anyway —
but the dark palette design, its contrast re-measurement across four scripts, and the six
desktop items are genuinely new.

That does not fit in three days at the quality bar this whole rework exists to hit.
Two honest ways to close the gap; **recommending the second**:

- **Accept a day 8.** Cleanest if the job-hunt deadline has any give.
- **Scope dark mode to the case-study screens, not the whole app.** Ship dark for the
  ~6 screens that actually appear in the case study — assess, verify, a stop state, voice,
  home, one multilingual pair — not all ~25 screen states. Nobody is auditing the
  audit-trail screen in dark mode. Because the tokens are semantic, the remaining screens
  follow later for free rather than needing rework. The case study shows a light/dark pair
  and the systems argument (§2.2) lands identically.

If the week compresses further, cut in this order: desktop `StopState` composition
(§3.7 item 4 — desktop falls back to the light stop state, which is still fine) → the
desktop partner-intake screen (§4 item 10) → the multilingual specimen set from four
scripts to two. **Never cut the component redesign itself** — that is the thing the user
called out, and shipping dark mode over generic components would be polishing the wrong
layer.

| Day | Work |
|---|---|
| **4 (today, rest of)** | §3.1 assess screen → §3.2 `VerificationGate` → §3.3 claim ledger. Semantic tokens from the first line (§2.2). Screenshot checkpoint after each. |
| **5 am** | §3.4 `StopState` (all 8, mobile) → §3.8 `NoticeInterpret` in-chat (founding feature) → §3.5 voice + the two voice specimens. |
| **5 pm** | §2.2 dark palette: define, apply to the case-study screens, re-measure contrast per script. |
| **5.5 / 6 am** | §3.7 desktop items 1–3 and 5 (rail, bubble, composer, Notice tokenization) → §3.6 sweep → refresh every specimen. |
| **6** | Phase 4: case-study page rewrite in `D:\Portfolio`. The hard sink — section map below. |
| **7** | `sync-embeds`, embed QA at 390px, buffer. |

### Day 6 in detail — the case-study section map

Not a black box. Full rewrite of `app/projects/lokai/page.tsx`. The copy draft's
*structure* is not a valid base (same skeleton as the outdated live version), but its
sentence-level tightening is worth harvesting.

1. **Hero** — tightened boundary/summary copy. Demote "Material+ Buildathon · Top 10"
   from kicker prominence to a meta-row mention; no cohort size or judge feedback exists
   in either repo to substantiate more.
2. **Counter-problem / wrong-first — reframed on the founding thesis.** Open with the
   real origin: people receiving legal notices in a language and jurisdiction not their
   own. The narrowing to consumer-refund becomes *"one defensible slice of that vision,
   built properly, with the multilingual and jurisdiction bones kept because they were
   the whole point"* — not "the chatbot was a mistake." (Mixer-not-phone fix already in
   the copy draft.)
3. **`CaseStudyScan`** — retuned toward system-first framing.
4. **Journey** — Phase 2 specimens at natural scale, replacing the four illegible 240px
   phone thumbnails. `AutonomyDial` folds in here as one card, not its own section.
5. **Response-mode section — the spine.** Organized around the seven `EMOTION_CRAFT`
   modes, each backed by a specimen. Priya's refund case becomes the walkthrough
   instance, not the frame. Name the staged-reveal decision here (§2).
6. **Voice-first section.** The positioning argument plus the two trust moments: the
   editable transcript before commit, and the refusal to guess on unclear audio. Frame
   *why* voice is right for this product specifically — typing legal terms in Devanagari
   or Tamil on a phone is genuinely hard, the target user may be low-confidence with
   text, a person under stress talks faster than they type, India is a voice-first
   internet market. Backed by the `voice-capture` specimen.
7. **Multilingual typography section.** One type system, two families, four scripts /
   three writing systems — optically tuned, code-switch-safe, OS-text-size-aware, and a
   fifth language is a 3-file change. Show the same turn rendered EN/HI/MR/TA at natural
   scale. Name the three decisions from §2.1.
8. **Decisions** — `DecisionStoryCard` ×3 + `CaseStudyDesktopShowcase`, specimens instead
   of 240px crops. **D-02 names Perplexity**: claim-count citations and an inspectable
   source drawer instead of a confidence score is structurally the pattern Perplexity
   built its product on — a one-line credibility anchor a recruiter clocks instantly, and
   currently unclaimed in every version. Frame desktop as deliberate surface allocation:
   mobile is the product and carries every feature (notice interpretation included, §3.8);
   desktop earns the wide-canvas *version* of the jobs that benefit from room — the source
   trail, and notice original-vs-interpretation side by side — without any feature being
   mobile-absent.
9. **8-way refusal taxonomy** — headline strip plus 2–3 deep dives (recommend
   `statute_expiry` and `conflicting_rules`; they show reasoning, not just refusal). Not
   all eight — that's just a longer version of the "when it breaks" framing this rework
   is moving away from.
10. **Business model / escalation-to-partner.** Escalation is the taxonomy's terminus and
    where the money is: the consumer product stays free; monetization is B2B/referral on
    the existing `HumanReviewCard` flow. Two screens, each labeled clearly as
    designed-not-built (same honesty convention as `"Illustrative · expert review
    pending"`): **partner-handoff (mobile)** and **partner intake (desktop)**. No payment
    gateway anywhere. **Scope call:** if day 6 runs long, cut the desktop partner-intake
    screen and keep the mobile handoff — the argument survives with one screen.
11. **Process / validation** — kept structurally, minor tightening.

**Check before starting day 6:** a parallel portfolio-shell redesign was in flight
(`DotGridCanvas` / `BadgeHeader` / architectural system, committed at `4c1ee87` in
`D:\Portfolio`) with "wrap case study views inside `<DotGridCanvas>`/`<BadgeHeader>`"
listed as pending on the *same* `CaseStudyShell` this rewrite depends on. Check that
thread's status first, not mid-build. Note `D:\Portfolio\CLAUDE.md` now describes a
newer "Field & Frame" direction — reconcile which is current before writing page chrome.

**Specimen regression to watch:** specimens self-label with their source screen/component
name by default (`?label=0` strips it). Opening one cold with no surrounding copy read as
"an unexplained form" — confirmed by the user. If day 6 embeds specimens without checking
this still reads right, that's a regression.

### Explicitly cut — state as deliberate, don't leave silent

- **Phase 3 decision-graph manifest.** Cut. If day 7 has slack, a static diagram; the
  generated-manifest infrastructure does not survive the runway.
- **Onboarding screen (1c-7).** Cut. Already have the stronger line for the case study:
  *we deliberately did not pre-segment users at onboarding; segmentation should be
  earned from real query data, not assumed.*
- **Saved-matters hub (1c-7).** Cut. Most users have one issue, once — the hub solves a
  retention problem this product doesn't have. Say that.
- **Notice interpretation on mobile (1c-6).** **Overturned 2026-08-25 by the product
  owner — it is a mobile-first feature, full stop.** The founding thesis is a person
  receiving a legal notice in a language they can't read; that person is on a phone, not
  at a desk. It is not a separate tool or route — it lives **in chat**: the user drops a
  notice (photo/upload) into the composer, and the response *is* an interpretation —
  translated, plain-language summarized, with amounts and legal sections surfaced. See
  the new `NoticeInterpret` component in §2 and screen work in §3.8. The prior
  "stays desktop" note was a plan-file option the assistant picked without authority;
  that was wrong.
- **Design-system library / npm publish.** Cut this week. The `/dev` + `/specimen`
  gallery is the artifact instead.

---

## 5. Verification

Per component, before moving on: screenshot at 390px, and confirm the container count
dropped.

Per commit:
```bash
npm run verify:demo && npm run typecheck && npm run build
```

End of each day, mobile at 390px:
- Walk the journey forward *and* backward — stage transitions flip direction.
- Every deep link in `src/app/dev/catalog.ts` lands on the screen it names.
  (`?stage=assess` silently rendered *intake* until 2026-08-25 — `mapStage` was a
  hand-written allowlist missing one entry. Re-check the whole catalog, not just that link.)
- Source sheet leaves the answer visible behind it.
- Reduced motion on: content cross-fades, nothing snaps.

Once §2.2 lands, add:
- Raw-color count is falling, not rising. Baseline **235 literals / 79 distinct across 17
  files** (2026-08-25). Re-run:
  ```bash
  grep -roE "#[0-9A-Fa-f]{6}\b" --include="*.tsx" --include="*.ts" src | grep -v shared.tsx | wc -l
  ```
- Every redesigned screen renders correctly in **both** themes with no conditional colors
  at the call site.
- Contrast re-measured in dark — not assumed to carry over from light.
- Hindi / Marathi / Tamil checked in dark specifically (light-on-dark blooms strokes
  optically; Indic faces carry different apparent weight than Inter at the same size).
- Desktop still light-only, and unaffected by the dark work.
