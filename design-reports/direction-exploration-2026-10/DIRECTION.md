# DIRECTION — LokAI direction exploration, October 2026

Run with the **App Designer** skill (redesign protocol). The question this
exploration answers: **is there a better visual direction for LokAI than
Vellum?** Not a rebuild — a test. Vellum is treated as the current look, a
history row, and the benchmark the three candidates must beat.

Brief is **self-authored** (owner said "see if we can find a better
direction"); everything derived from `CORE/` (the source of truth), the
live app on :5174, and session memory.

---

## The brief

1. **What is the app, and who is it for?** LokAI — a deterministic,
   zero-network prototype of an Indian legal-AI guide. One user: Priya,
   who bought a damaged ₹8,999 mixer grinder and the seller refused a
   replacement. No lawyer, no legal vocabulary, a 390px phone, possibly
   Hindi/Marathi/Tamil, ~10 minutes of attention. Portfolio flagship case
   study, not a product.
2. **The core action, first ten seconds:** describe what happened in her
   own words; LokAI organises her facts, explains the law in plain
   registers with sources, and prepares a demand notice she reviews line
   by line. Home IS the chat.
3. **Three words for how it should feel:** *steadfast* (it will not guess),
   *legible* (plain registers, receipts for every claim), *of-her-world*
   (everyday Indian, not court costume). Outside-app references: the
   India Post counter (stamped proofs, counterfoils), a night-school
   blackboard (the patient teacher), the painted rangoli route (a path
   you can follow).
4. **What exists already:** name LokAI; logo concepts pending pick
   (`logos/concepts`, product+people brief); Vellum material system
   (paper ground + grain/mesh, navy anchor, saffron, Hanken Grotesk +
   rare Instrument Serif, machined double-bezel objects); a full
   deterministic demo codebase (Vite/React/TS, 4 language packs,
   8 guardrail states).
5. **What they need:** a three-direction exploration on the real core
   screen, an honest pick, and a verdict against Vellum. If no candidate
   beats Vellum, the answer is "Vellum stands" — recorded with evidence.
6. **Image generation:** none available; all richness must be drawn
   (SVG/shape/colour) — which matches the deterministic product anyway.

## Current app (redesign protocol)

### Audit

Before shots: `shots/before/` (live app on :5174, 390×844 @3x —
home empty, home mid-use clarify, case intake, verify/evidence locker,
packet, stop state).

What slop.md catches in the current app — honestly stated:

- Vellum is **not** either of the two named faces (Calm Wellness /
  Dark Fintech) and not the dashboard skeleton. It is, however, adjacent
  to this skill's own overcorrection rut: **warm paper ground + one accent
  + serif register + ruled/formed objects**. It sits in the
  *printed-matter/material* source family, light ground, orange accent,
  material richness. As a history row: `printed/object · light ·
  grotesque+serif · orange · colour-material`.
- The front door ("What can I help you sort out?" + three grey chips) is
  the closest thing to a category default on screen — a competent
  AI-chat greeting that any assistant could wear.
- The strongest, least repeatable thing in Vellum: **the receipt system**
  ("2 of 3 sourced", "5 OF 7 GATHERED", the stop states as full-bleed
  inversions). Any winner must keep all of it.

### Inventory — keep / lose / unknown

**Keep (contract — every candidate must carry these on the core screen):**
- The user's message verbatim (Priya's own words).
- The three-zone answer: what the rule means → how it applies here → next
  steps, with the channel metaphors intact (registered post AD, e-Daakhil,
  National Consumer Helpline 1915).
- The computed receipt: "4 of 5 sourced" + section citations (S.2(10)
  defect in goods; S.35 complaint before commission) + "Example — verify
  with a lawyer". Never authored confidence.
- "Prepare demand notice" as the one primary CTA.
- The notice door ("Read a notice you can't understand") — the founding
  feature's second entry.
- Composer with attach + mic + send (bespoke glyphs).
- Matter context line (Mumbai Suburban, Maharashtra) — jurisdiction is a
  founding pillar.
- Multilingual reality: Indic scripts must have a family path (en/hi/mr/ta).

**Lose (allowed to change):** cream/paper ground, mesh+grain material,
Hanken Grotesk display, Instrument Serif law register, navy anchor as
THE trust colour, machined double-bezel object treatment, glass composer.
(Vellum's *laws* — L1–L8, V1–V6 — are interaction law, not material law;
candidates must satisfy the composition law or say why not.)

**Unknown (owner decisions, out of this exploration's scope):** user-bubble
saturation (O1), desktop parity restyling.

### Decisions for the user (after the pick)

1. Adopt / reject the winning direction as `03-SYSTEM.md` Book three.
2. If adopted: whether the migration is a re-point of the role layer
   (cheap) or a full material rebuild (M-scale).
3. Logo implications: current concepts were drawn against Vellum
   (navy/vellum/saffron). A new direction may invalidate them.

---

## Content (written before layout — the same content carries all three
explorations; this is the keep-list made concrete)

**Screen:** home-as-chat, mid-use state. Priya has asked; the answer has
landed; the receipt is on the table.

- Header context: *Refund for a damaged mixer* · Mumbai Suburban,
  Maharashtra · menu (3 dots)
- User message: "I bought a mixer grinder for ₹8,999. It arrived damaged
  and the seller refused a refund. What can I do?"
- Answer, zone 1 (what the rule means): "When a product arrives damaged,
  that can count as a consumer issue. You can ask the seller for repair,
  replacement, or a refund. If they ignore a fair written ask, you can
  follow up with a legal notice."
- Zone 2 (how it applies here): "Your mixer arrived damaged and the seller
  refused a replacement. The invoice, damage photos, and written refusal
  give you a solid next step."
- Zone 3 (next steps):
  1. "Send a written demand notice by registered post with acknowledgement
     due (AD), and keep the postal receipt."
  2. "Save the invoice, WhatsApp or seller-chat screenshots, platform order
     or ticket ID, defect photos or videos, and warranty details together."
  3. "If the seller ignores the notice, prepare a consumer complaint — you
     can use e-Daakhil, or call National Consumer Helpline (1915), or
     approach the District Consumer Commission."
- Receipt: **4 of 5 sourced** · Consumer Protection Act, 2019 · Section
  2(10) — defect in goods · Section 35 — complaint before commission ·
  "Example — verify with a lawyer"
- CTA: **Prepare demand notice** (the screen's one primary action)
- Secondary: "Read a notice you can't understand →" (the notice door)
- Composer: "Describe what happened…" · attach · mic · send

---

## The category default being refused

Indian legal-tech / AI-assistant defaults, named so none of the three
candidates can quietly become them: trust-blue or government-portal white
with grey form cards; ChatGPT-style grey chat with a ✨ sparkle; dark-navy
"fintech justice" with an electric lime; scales-of-justice or peacock
emblem costume (already banned in the logo brief). Also refused: this
skill's own overcorrection (grey paper, black ink, one red, mono, ruled
rows — at most one printed-form concept per exploration).

## The exploration (three concepts, three source families)

Rendered on the real core screen with the content above — `explore.html`,
shot in `shots/explore/`. One concept per family, at most one printed form:

| # | Concept | Family | Ground | Type | Accent hue | Richness |
|---|---|---|---|---|---|---|
| A | **Registered Post, AD** — the letter and its counterfoil | printed (India Post) | light (post-paper) | grotesque, width-axis display + mono | red (postal) | stamp/postmark/perforation shape language |
| B | **The Evening Class** — the patient teacher's board | place (night-school classroom) | dark (chalkboard) | rounded, Indian foundry (Baloo 2) | yellow (chalk) | chalk diagrams, one hand |
| C | **The Painted Path** — the route on the floor | play (board game / rangoli route) | colour-field (marigold) | characterful grotesque, expanded (Bricolage) | blue (Jodhpur cobalt) | painted path + token, shape language |

(Vellum's own row, for the 3-of-5 rule: `object · light · grotesque+serif ·
orange · colour-material` — every candidate must differ on ≥3 columns.)

**The pick and the verdict** are recorded after the shots, in the next
section of this file.

---

## The pick — A, "Registered Post, AD"

**LokAI is the registered letter you send the seller — and the counterfoil
that proves you sent it.** Every answer arrives with its receipt as a
physical object: the postmark carries the computed count (4/5 SOURCED),
the citations are the letter's enclosure list, "Example — verify with a
lawyer" is the counter's disclaimer slip. The concept is born from the
product's own next step — Priya's demand notice travels by registered
post AD; the app speaks in the visual world of the thing it is preparing
her to do.

Why A won:
- **The receipt is the hero object.** No other candidate makes the
  "receipts are computed, never authored" thesis physical the way a
  counterfoil does. B's chalk diagram teaches; A's postmark *proves*.
- **Most *this app*:** the post office is where the demo's own copy
  already lives (registered post AD, acknowledgement due, keep the postal
  receipt). The direction needs no costume to be Indian and everyday.
- **An editor would remember the postmark.** One glyph that carries the
  whole trust model.

Why the others lost (kept as borrowable patterns, not merged):
- **B (Evening Class)** — the best plain-register *teaching* voice, and
  its chalk diagram is the strongest "explain" device of the three; lost
  on thesis (it dramatises the explaining, not the deciding) and on
  register risk for a legal-trust product. Its diagram pattern may be
  borrowed for explain turns in A's own type voice.
- **C (Painted Path)** — the boldest poster silhouette and the best
  progress metaphor (the token = the gate trail); lost on product law:
  restraint is care for a ten-minute stressed user, and a marigold field
  on every screen spends attention on the frame, plus it collides with
  the stop states' tonal-inversion law (L8).

**The overcorrection check (skill rule):** A is light paper + mono + one
red — the skill's own rut shape. Justified against B and C in writing:
the ground is post-stationery green-grey (not austere grey), Archivo
carries the body (mono is seasoning for citations and registration
numbers only), and the richness is objects — postmark, perforation,
airmail stripe, barcode — not ruled rows. The three-way exploration
satisfies the "at most one printed-form concept" rule.

**History rule:** against the Vellum row (`object · light · grotesque+serif
· orange · colour-material`), A is `printed · light · grotesque+mono ·
red · shape` — differs on family, type, hue, richness (4 of 5).

## Tokens (winner, light)

| Role | Value | Notes |
|---|---|---|
| `ground` | `#E6EAE4` | post-stationery paper, green-grey cast |
| `raised` | `#F8F9F5` | counterfoil paper (the one card surface) |
| `ink` | `#20272E` | blue-black postal ink |
| `ink-2` | `#55606B` | secondary, 4.9:1 on ground |
| `ink-3` | `#8A939C` | tertiary, only ≥3:1 uses |
| `rule` | `rgba(32,39,46,.18)` | hairlines, dashed for perforation |
| `accent` | `#A82C20` | postal red — text/stamps, 5.7:1 on ground |
| `accent-fill` | `#B5301F` | postal red — fills (CTA, send), white text 5.4:1 |
| `signal-blue` | `#2C4A78` | airmail stripe only, never UI |

Dark mode (second design, not inversion): ground `#171C22` ink-washed
night counter, raised `#232B34`, chalk-ivory ink `#E9E7DC`, ink-2
`#A4ADB5`, accent lifts to `#DC6053`, airmail stripe muted. Stop states keep L8: light theme →
full-bleed dark ink-blue with red stamp; dark theme → warm luminous
counter-paper.

**Type:** Archivo variable (width axis) — display 800 at 118% stretch,
caps, −1% tracking (form heading); UI/body Archivo 400–700; IBM Plex Mono
for registration numbers, citations, ledgers, timestamps (the instrument
voice). Two families. Indic path: Noto Sans Devanagari/Tamil via the
existing `<Text role>` mechanism (mockups are EN-only; script pairing is
a migration task, not an exploration blocker).

**Scale:** 11 / 12 / 14 / 15 / 24 / 28 (six steps). Side margin 18.
Radius family: near-square (3–4px, form objects) · 8–10 (fields) ·
counterfoil is square-cut with perforation. Spacing per layout.md scale.

## The richness source (art direction)

**Postal stationery objects, drawn as flat print.** One hand: everything
looks *printed or stamped*, never photographed — postmarks (ring + dashed date-arc,
ink), perforation tears (scallop/dash), airmail knife-stripes (red/blue),
registration barcodes, counterfoil paper slightly lighter than the
ground. Light: flat, shadowless print; depth comes from paper-on-paper
(elevated card + 1px rule), never cast shadows. Grade: ink on paper, two
inks (black-blue, red) plus the stripe blue.

## The verdict (2026-10-04)

**Yes — a better direction was found, tested, and it beat Vellum on the
critic's card: "Registered Post, AD", 56/65 + Fidelity 5, 12 of 12 rubric
lines at 4+, done by the stop rule in two rounds** (exploration r1 54/65;
full scores in `CRITIQUE.md`, renders in `shots/explore/`, `shots/a-r2/`,
`shots/a-r3/`).

Why it wins against Vellum, in one sentence: Vellum is a *generic premium
material* applied to the product (any serious app could wear it), while
Registered Post is *the product's own world* — the demand notice the app
is preparing literally travels by registered post AD, so the counterfoil
receipt, the frank, the barcode and the airmail stripe are the trust thesis
("receipts are computed, never authored") made physical. The critic's
round-1 finding was that Vellum's one winning line was craft discipline;
round 2 closed that gap (no clipping, believable data intact) while keeping
the concept advantage.

What this verdict is NOT: it is not a migration. It is one core screen
(the chat mid-use state, light + dark), tested against the keep-list. The
composition law (L1–L8) carries over unchanged; Vellum's material law
(V1–V6) is what would be replaced. The token architecture makes the
colour/type re-point cheap; the object treatment (counterfoil, frank,
stripe) is the real work, and the notice screen — the CTA's destination —
is the named next design task where the direction must prove it is a
system.

**Decisions now with the owner:**
1. Adopt "Registered Post, AD" as `03-SYSTEM.md` Book three, or keep
   Vellum (this file is the evidence either way).
2. If adopted: role-layer re-point + material class rebuild (M-scale);
   B's chalk-diagram pattern borrowable for explain turns in A's type voice;
   C's "you are here" band borrowable for the case journey.
3. Logo: the pending logo concepts were drawn against Vellum
   (navy/vellum/saffron) — a switch to postal red/ink invalidates their
   palette assumptions; the product+people brief itself still stands.

## The signature interaction (storyboard)

**The counterfoil tear.** When a turn's checks resolve and the receipt is
computed, the receipt detaches from the answer as a counterfoil: the
perforation animates (dashes march left→right, 240ms, spring-smooth), the
stub drops 8px with a settle bounce and a crisp `selection` haptic tick,
then the postmark stamps in (scale 1.15→1.0, 180ms, `impact(.light)`) —
"4 OF 5 SOURCED" lands like an ink strike. Reduced motion: the counterfoil
appears already torn, postmark at rest; the haptic stays. On the 100th
turn it stays under 500ms total and never blocks reading — the tear
happens at the receipt, below the answer, not on it.

