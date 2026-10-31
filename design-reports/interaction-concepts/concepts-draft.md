# LokAI Interaction Concepts — Decision Layer Showcase

Task: propose interaction/output styles that make the decision layer (JEV research + blueprint)
VISIBLE to users, keep chatbot familiarity, and stand out for a first-job recruiter case study.
Inputs read: jev research report, blueprint Ch-Z/X/Y, insight I1-I8, design-audit artifacts,
component shortlist (AI Elements / BoardUI / transitions.dev / interior.dev).

## Constraint frame (every concept must obey)

- Repo law: no raw hex, T.* tokens only, one primary CTA/screen, 4-script type system,
  claim ledger not confidence scores, 3-zone Turn layout, deterministic demo (no network).
- Familiarity: ChatGPT-shaped chat is the incumbent mental model; LokAI differentiates
  the OUTPUT grammar, not the input metaphor. The composer stays a composer.
- The receipt is the star: state → decision → action → verification, provenance not numbers.
- Everything must be implementable as renders of DecisionOutcome (blueprint Z.2), i.e. the
  interaction layer and the engine are the same story, not two stories.

## Concept A — "Response Cards, not bubbles" (evolution of the 3-tier design)

The chat stream keeps composer + chronological flow (familiar), but every turn is a TYPED CARD:
mode label chip ("Explanation" / "Clarify" / "Stopped"), risk tier chip when ≠ self-service,
the content zone, then a standard card footer: claim ledger ("6 of 7 claims grounded") +
"Why this response?" affordance opening the DecisionReceipt inline (gate, rule, because-lines,
what-would-change-the-answer). Prose lives INSIDE explain cards only — never as loose bubbles.
- Familiarity: high — still a chat; only the turn anatomy changes.
- Decision-layer visibility: every turn shows its type + its receipt without leaving the stream.
- Implementation: Turn.tsx already has 3 zones; this formalizes zone-0 (header) and adds the
  receipt sheet to zone-3. Maps 1:1 to DecisionOutcome.kind/mode/risk.
- Recruiter read: "the AI's grammar is inspectable" — instantly legible in a 20s embed.
- Risk: card chrome on EVERY turn could feel bureaucratic for casual clarifies. Fix: two card
  densities (compact for clarify/confirm, full for explain/stop).

## Concept B — "The Decision Spine" (rail on desktop, sheet on mobile)

A persistent companion surface: desktop = right rail inside DesktopShell; mobile = swipe-up
bottom sheet ("The decision log"). It renders the LIVE loop for the current matter:
state chips (facts confirmed/missing, sources coverage) → the engine's current decision
(mode + gate + rule) → the action (this turn) → verification (ledger recompute). Each past
turn is a row; tap = jump to that turn. Live recompute demo: flip a fact → watch gate L6 fire
and the tier change on the rail in real time.
- Familiarity: chat stays untouched on the left/main; the spine is additive (like a receipt
  printer next to a conversation).
- Decision-layer visibility: total — this is the engine made visible, I5's auditability as UX.
- Implementation: consumes DecisionReceipt[]; DemoContext already holds matter state;
  MobileShell drawer pattern fits the mobile variant. No new tokens needed.
- Recruiter read: strongest "systems thinking made visible" artifact; the live-recompute demo
  is the 15-second portfolio embed (Y.3 Device 3 already scripts it).
- Risk: reads as "devtools for users" if styled cold. Fix: paper-desk styling (T.raised,
  contact shadow), humanLine first, machinery second.

## Concept C — "Matter Trail first, chat as annotation"

Navigation inverts: the primary screen is the matter map — stages intake→verify→assess→plan→
filing as a vertical trail with per-stage status (done/blocked/needs-you), each node showing
its gate outcome; the chat becomes an annotation layer you open FROM a stage ("Ask about this
step"). The composer lives inside the trail header, not as a tab.
- Familiarity: LOWER — departs from chat-first, closer to a task/tracker app (Linear-like).
- Decision-layer visibility: structural — the trail IS the state machine rendered.
- Implementation: LokAIWorkflow + caseWorkflow stages already exist; Demoshell nav needs a
  new primary surface. Biggest build of the three.
- Recruiter read: novel and demoable, but risks reading as "productivity app with a chat
  sticker"; the trust story (receipts) gets less screen time.
- Verdict: powerful as the DESKTOP case-study overview, wrong as the default interaction.

## Concept D — "Ask-First Composer"

Before submitting, the composer shows what the engine understood: classified intent chip +
scope check ("This is about a consumer refund ✓") + what's missing that would change the
answer. Submit confirms; edit re-classifies live. Maps to L1/L2 gates + receipt before the
answer exists.
- Familiarity: high (composer unchanged on the surface; one confirmation strip above it).
- Visibility: shows the decision layer BEFORE answering — "it read me correctly" moment.
- Risk: adds friction to every typed turn; chips already do intent selection. Fix: strip only
  appears when classification is ambiguous (L1 unmatched → clarify card), invisible otherwise.

## Concept E — "Trust Transit" (journey metaphor)

Full metaphor: matter as a train journey, stages as stations, engine decisions as the signal
system, stops as station boards ("LokAI will not proceed: source gap"), escalation as the
platform change to a human. Playful, memorable, very Indian-railway.
- Familiarity: low as an interface; high as an illustration layer.
- Verdict: use as ILLUSTRATION inside stop screens and the case-study narrative (one hero
  illustration), NOT as the interaction grammar. Recruiters remember it; users would drown
  in metaphor. Metaphor tax on every screen violates the restraint doctrine.

## Concept F — "Split-Surface Verdicts" (desktop centerpiece)

Desktop: answers on a 720px reading column; a permanent evidence companion column (the
receipt/ledger/sources) beside it, synchronized to the current turn — never scroll-locked.
Mobile: the same as swipe-between tabs on the Turn card (Answer ↔ Evidence).
- Familiarity: high on desktop (side panel like Copilot/Docs comments).
- Visibility: evidence is always on screen — the anti-"trust me" default.
- Implementation: DesktopShell workspace split; Turn.tsx zone-3 promoted to persistent panel.
- Risk: on 1440px with sidebar, two content columns crowd the canvas. Fix: companion column
  collapsible; auto-open on explain/stop turns only.

## Recommended hybrid — the flagship demo

A (typed response cards with receipt affordance) + B (Decision Spine as the live loop demo,
desktop rail / mobile sheet) + D (ask-first strip only on ambiguity) + F (desktop evidence
companion, collapsible). C's trail becomes the matter overview screen (already exists as
LokAIWorkflow), E becomes one illustration in the stop gallery.

Positioning line for the case study: "ChatGPT answers. LokAI decides, shows its work,
and stops when it can't own the answer — every turn is a typed decision with a receipt."
