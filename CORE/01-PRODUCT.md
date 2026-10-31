# 01 · PRODUCT — who this is for, what it is, what it will never be

*Source of truth. Supersedes `PRODUCT.md`, `docs/PRODUCT-JOURNEY-2026-09.md` §1, and the blueprint's Chapter Y. Archive kept for reasoning.*

---

## The user (one person, not a persona)

**Priya.** Bought a damaged ₹8,999 mixer grinder. The seller refused a replacement. She has:

- no lawyer, no legal vocabulary, no second chance at a wrong filing
- a 390px phone, possibly Hindi / Marathi / Tamil, low confidence with text
- roughly **ten minutes of attention** before she gives up or gets talked into something
- a stress state that tunnels: she reads the first strong element and skips chrome

In legal, **a wrong answer is not a bad experience — it is a missed deadline.** Therefore
restraint is a form of care, and the most caring thing the interface can do is decline to guess.
Every decision in CORE descends from that sentence.

## The job to be done

Not "explain consumer law." *"I got cheated, I want my money back before I give up."*
Design the problem being solved, not the reply being written.

## What LokAI is

A **deterministic, zero-network prototype** — a portfolio flagship case study, not a product.
The demo journey is the consumer-refund matter; eight scripted scenes deliberately demonstrate
the guardrails (missing facts, source gap, conflicting rules, high-risk stop, out-of-scope,
recovery, limitation expiry, notice interpretation).

The interaction thesis: **the seam.** Everyone builds AI that answers (ChatGPT — no visible
boundary) or AI that refuses (Claude — a wall, often when it could help). LokAI builds the third
thing: **complete the defensible part, name the exact edge, hand over the rest with the paperwork
intact — and show the receipt.** The seam is decided *before* the answer renders (first-fail-wins
gate cascade), which is why it can be art-directed instead of apologising.

## The boundaries (enforced by build gate, not by promise)

`scripts/verify-demo.mjs` fails the build on violations. Banned in `src/`:
`fetch(`, `getUserMedia`, `new MediaRecorder`, file inputs, API keys in code.

- **No live AI, no network, no OCR, no upload, no microphone permission.** Voice and notice
  flows are animations over prepared data.
- **No fabricated confidence:** no `groundingScore`, no percentage-confidence strings — ever.
  The claim ledger (`4 of 5 sourced`) is the honest instrument.
- **No capability claims** beyond the prepared examples. Legal records are labelled
  `Illustrative · expert review pending` until qualified review.
- **Legal information, not legal advice.** Stated plainly, once, in the boundaries panel.
- **Prepared multilingual packs** for EN / HI / MR / TA only; the other 8 registry languages
  render as honestly-not-prepared, never silently falling back to English.
- Voice: the transcript is editable before it commits; nothing commits from voice.
- Drafts: nothing is usable until a human has read it (`ai_draft → user_reviewed → ready_to_use`).

## Success criteria

A reviewer can: complete the consumer-refund story · trigger every guardrail state · understand
**why** LokAI stopped or proceeded (the receipt) · inspect claim sources · switch all four
languages · dictate by voice and correct the transcript · observe **zero** network or
device-permission requests. All of it, on both platforms, in both themes.

## What LokAI is not (state these before anyone asks)

Not a chatbot (optimises for trust calibration, not fluency) · not a lawyer (escalation is the
product's most rehearsed behaviour) · not a live system (determinism is the honesty feature) ·
not a design-system library (the `/specimen` gallery is the artifact, publishing is cut).
