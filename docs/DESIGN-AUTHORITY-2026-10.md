# LokAI — Why this design beats the ChatGPT/Gemini mobile pattern (2026)

**Date:** 2026-10-14 · **Purpose:** the design-authority section of the LokAI case study
**Scope:** what the 2026 market actually ships, what LokAI deliberately keeps, what it refuses, and why each refusal is a defensible product decision rather than a missing feature.

---

## 1. The 2026 baseline (what every mainstream AI app ships)

Surveyed across ChatGPT, Claude, Gemini, DeepSeek, Copilot, Perplexity, Grok, Le Chat, Meta AI, Notion — 13 products. The convergent anatomy:

| # | Pattern | Present in |
|---|---|---|
| 1 | Composer + streaming prose | all 13 |
| 2 | Collapsible "thinking" panel that collapses to **"Thought for N seconds"** | ChatGPT, Claude, DeepSeek, Gemini (as "Thoughts"), Cursor, Devin |
| 3 | Numbered inline citations → source panel | Perplexity (invented it), Copilot, ChatGPT browse, Claude search |
| 4 | Refusals as plain prose | all 13 |
| 5 | Model picker / mode switcher | ChatGPT, Claude, Gemini, Copilot, Le Chat |
| 6 | Regenerate / branch controls | ChatGPT, Claude, Gemini, Perplexity |
| 7 | Voice mode as a separate surface | all consumer apps |
| 8 | Projects / memory / chat history | ChatGPT, Claude, Gemini |
| 9 | Empty state with suggestion chips | all 13 |
| 10 | Upgrade / limits paywall surface | ChatGPT, Claude, Gemini, Copilot, Le Chat |

**These are the familiarity floor.** Deviating from 1, 2, 3, 9 reads as broken. Deviating from 4–8, 10 reads as *opinionated*, which is where a product can be judged.

---

## 2. LokAI: keeps 5, refuses 5 — and the refusals are the argument

### Kept (familiarity, deliberately)

| Pattern | LokAI's version |
|---|---|
| Composer-first chat canvas | Drawer nav, chat canvas, composer pinned. `MobileHome.tsx` |
| **Asymmetric message stream** | The assistant is bare prose on the ground; the user is a filled right-aligned object. `.lokai-chat-bubble-user` / `ui/motion.tsx` `UserBubble` |
| **Streaming answer reveal** | Zone 1 streams word-by-word with a solid→blink caret. `ui/motion.tsx` `StreamText` |
| Status line while working | Named stages, not a spinner, plus a content-shaped skeleton and a live sweep on the composer itself. `responseEngine.ts` `DEMO_PROGRESS_STAGES` |
| Collapsible reasoning | "Why this response?" receipt, collapsed by default. `Turn.tsx` `DecisionReceiptView` |
| Citations | Section-first chips (`S.2(10)`), tap opens the source. `TurnCitations` |
| Suggestion chips | Jurisdiction-scoped, not generic. `MobileHome.tsx` |

**Note on the first two rows (honest correction, 2026-10-15).** An earlier
version of this document claimed the familiarity floor was already shipped. It
was not: the mobile flagship rendered the user's own words as a caps-labelled
grey box with a 3px left border — the "file tab" pattern `LLM_DESIGN_SYSTEM.md`
names as the most generic pattern in the app — and the whole stream was one
left-aligned column of blocks. It read as a case log, not as a conversation.
That was a deliberate product decision ("de-chatbot the skeleton"), and it was
wrong: the familiarity floor is not negotiable, because a medium you can't read
as a conversation can't carry the trust argument either. The fix restores the
grammar and keeps the *content* of the matter log — the decision spine, the
audit trail, the receipt — which is where the differentiation actually was.

The reference anatomy is not a matter of taste. The best kit in the surveyed
component vault (`ai-elements`, 5★) ships exactly this split, and it agrees with
this repo's own L1 law:

```jsx
Message:        from === "user" ? "is-user ml-auto justify-end" : "is-assistant"
MessageContent: user      → "ml-auto rounded-lg bg-secondary px-4 py-3"   // 16/12, on the 4pt ladder
                assistant → text only. NO background. NO bubble.
```

The assistant turn carries no container because an answer is not an object you
can pick up; only the user's turn is. LokAI had it backwards in code while being
right in the design law.

### Refused (differentiation, each with a reason)

| Refused | Why — the defensible answer |
|---|---|
| **Percentage confidence** | Apple's own HIG: *"If you're not sure how your confidence values correlate with the quality of your results, it's not a good idea to convey confidence to people."* LLM self-reported percentages are uncalibrated and invite over-reliance — the exact miscalibration the 2026 trust research warns about. LokAI replaces it with a **claim ledger**: "6 of 7 claims grounded", each claim tappable to its source line. Countable and falsifiable beats flattering. A number asks the user to *believe*; a ledger asks them to *read*. |
| **Regenerate / branch** | Determinism is the trust feature. In a legal context "give me another answer" means *"guess again"* — the product refuses to offer a slot machine on someone's filing deadline. Same input → same receipt, always. |
| **Model picker** | There is no model. Saying so is the honesty claim. A model picker in a trust product implies the user is responsible for choosing competence level, which is the developer's job. |
| **Upgrade / limits paywall** | A person with a ₹8,999 dispute and ten minutes of attention must never hit a wall that money would remove. Monetisation is B2B/referral (`HumanReviewCard`), designed-not-built, labelled as such. |
| **Prose refusals** | The 8-way stop taxonomy with **named failure kinds**, full-bleed tonal inversion, preserved progress, a handover packet, and concrete human channels (1915 / legal aid / e-Daakhil / registered post). No shipped product has structured refusal UI. The pattern libraries have no refusal pattern at all — this is verified open space. |

---

## 3. The four surfaces no competitor ships

**1 · Computed decision receipts.** Every turn carries a gate-trail line — the slot competitors fill with "Thought for 9 seconds". LokAI's says `Scope ✓ · Grounding ✓ · Facts ✓ — 4 of 5 sourced ▸`. Tapping opens the decision: which gate fired, which rule, which facts and sources it read, and the one plain sentence explaining why. Provenance, never a number.

**2 · The stop trigger — a refusal that quotes you.** Every competitor renders a refusal as prose, so the user learns only *what* was refused. LokAI's engine is a substring classifier (`decision/engine.ts:76`), which is a real weakness for a legal product: "I was defrauded by a seller" matches `fraud` and stops as a criminal matter. What redeems it is that the receipt names the exact marker — so the refusal opens with `Stopped at the scope check — your message matched "fraud".` The brittleness becomes the demonstration: an inspectable rule beats an unexplainable one, and no learned classifier can offer it. Localized into all four scripts, with the marker quoted verbatim.

**3 · "What would change this answer."** No product tells you what *would* have changed the outcome. This engine is a real gate ladder (G2–G6), so it can: each answer carries the three gates that could still fire — confirm the purchase date and I can check the two-year window; if the seller disputes the record I stop instead of drafting from it; if this becomes criminal or urgent I stop and point you to a person. That reframes the product from *an AI that sometimes refuses* into *an AI that tells you exactly what it needs*.

**4 · Verification of the user's own facts, in the stream.** Products confirm *their* sources. LokAI re-displays *your* facts as checked inputs and asks you to confirm or correct them before it will advise — and it does so **in the conversation, directly under the answer that depends on it**, not in a form behind a chip. One quiet line (`3 of 4 facts confirmed — check the rest and I can prepare the notice ▾`) expands to a hairline list, value in the strong position, only the flagged row filled. Correcting a fact clears draft approval and re-opens the answer. The product decision is unchanged (`computeDraftAllowed`, engine.ts:329); only the chrome moved out of the form.

**5 · One document stream, not two surfaces.** The founding feature and the main conversation are the same conversation. Dropping a notice into the composer produces a response turn *in the matter's own stream* — no separate route, no second place to look. The standalone reader still exists for when you want the original side by side, and the Documents folder's primary action is now "Ask about this in chat". One interpretation, two entry points, never two answers (`verify-decision.mjs` asserts it resolves identically).

---

## 4. The wait is calibrated, not padded

CHI '26 (Tan et al., n=240): identical answers after ~2s were rated **less thoughtful and less useful** than after 9s. But 20s added nothing and triggered reliability doubt. LokAI's beat is consequence-scaled against that curve:

| Turn class | Beat | Reason |
|---|---|---|
| Protective stop | **≤1.2s** | "a refusal that takes 9 seconds reads as the system struggling to say no" |
| Confirm / progress | <1s | variable-friction floor |
| Clarify | ~1.8s | one question, short beat |
| Advice-class (explain / disclose) | **~4.2s narrated** | the class the research found *rewards* deliberation |

Every stage names work the pipeline actually performs. The beat is always skippable. Same input → same beat, every time: determinism is a trust asset almost no LLM product can offer.

---

## 5. The material layer (Vellum) — what it refuses too

The 2026 premium surface is layered translucency with light. LokAI takes the parts that survive a legal context:

- **Static mesh + grain** — two radial "breathes" under 2.5% SVG grain, as one role token. Static: no animation, no GPU, no battery cost, fully contrast-gate verifiable. (A WebGPU shader ground was evaluated and rejected — see `VISUAL-DIRECTION-2026-09.md` §4.)
- **Serif demoted to a register** — Fraunces no longer titles screens; **Instrument Serif** appears only where the law speaks (answer zone 1, the refusal sentence). Rare on purpose, so when it appears it means something.
- **Glass on floating chrome only** — composer, sheets, drawer. Never on scrolling content (mobile GPU repaint rule).
- **Contact shadows, one separator per surface** — border *or* shadow, never both. "Machined" objects get concentric bezels; ordinary prose sits on the ground.

### What the 2026-10-15 pass added

Audited against the vault's own premium checklist (`Ui kits and components/docs/03-what-makes-premium.md`). The system passed most of it — tinted warm neutrals, layered two-layer contact shadows, a radius ladder, WCAG contrast gated in both themes. What it failed was off-ladder values: `Turn.tsx` alone shipped `3px 10px`, `6px 10px`, `10px 12px`, `14px 18px`, `5px 8px` paddings beside the token scale, `.lokai-thinking-capsule` was `8px 16px 8px 14px`, the user bubble's radius was 18px (not on the 6/8/12/16 ladder), and `body` sat at 15px — off the 12/14/16/18/20/24/30/36 type scale. All now on-scale; prose reads at a dedicated 16px/1.7 `reading` role.

**And the checklist's own limit, stated honestly:** it never mentions the chat medium at all. It is a surface-craft checklist, and scoring 100% on it would still not have made this read like ChatGPT. That was the actual gap — grammar, not polish. Which is the more useful finding for a portfolio: the system was already enforcing the right law and the code had drifted out of it.

**The same pass found the prototype lying.** Chasing a layout bug — a dead "Preparing your answer" row that stayed on screen under a finished answer — turned up two real defects under it. `AnimatePresence` never completed the exit for the removed working row, so the ghost sat above the answer forever; the row now morphs in place instead (same key, nothing to exit). And downstream of that, `draftAllowed` turned out to be a static `true` written into the prepared turn data, not the engine's `computeDraftAllowed` — so the packet would draft while the header on the same screen said "5 of 6 facts confirmed". The gate now runs the live fact store through the engine's own function, and it has a real catch: the disputed purchase date holds the draft until you confirm it in the conversation. Verified end to end — locked at 5/6 with copy that says *waiting on you*, unlocked to the review preview at 6/6.

**And the document path was disconnected in both directions.** Two separate faults, both invisible without opening the app and looking:

1. The Documents folder's primary action — the door that is supposed to prove "documents, folders and chats connected" — navigated to `?doc=<exhibit id>`. The exhibit namespace (`invoice`, `whatsapp-chat`, `defect-evidence`) and the prepared-document namespace (`bmc-property-tax`, `payment-receipt`) were never the same set, so the deep link resolved to nothing and the reader landed on the empty state. A primary button that silently does nothing is worse than no button; there is now one documented bridge between the two namespaces, and where no prepared reading exists the sheet says so instead of offering a door it cannot open.
2. The compose affordance sent the fixed sentence `'interpret this legal notice'` for *every* attachment, so the engine matched the notice intent and a payment receipt came back with the property-tax notice's answer — its ₹32,480, its deadline, its ward office, under a `payment-receipt.jpg` chip. The paper on screen and the paper being answered were different documents. The document now supplies its own input, which means one document has one reading however it arrived, and the routing is pinned by two decision fixtures rather than by a call-site branch (the two documents are one substring apart, and the failure is invisible on screen).

Both are the same species of bug as the draft gate: the interface asserting a relationship the system did not implement. That is the argument the case study is making, so the audited defects belong in it — stating them is what makes the remaining proofs worth reading.

---

## 6. The system argument (the part no screenshot proves)

The visual craft is table stakes in 2026. What isn't: **the design law is executable code.**

- `verify:demo.mjs` — bans `fetch`, `getUserMedia`, `MediaRecorder`, `type="file"`, live API keys; bans `groundingScore` and percentage-confidence strings; bans raw hex/fontSize/borderRadius/boxShadow outside the system files; enforces 8 guardrail scenarios, all 7 response modes, all 11 prepared turns, 4 language packs, the Indian channel metaphors, and the dead design system staying deleted.
- `verify-decision.mjs` — 16 fixtures: every prepared input must resolve to the documented decision, twice, byte-identical (conformance + determinism).
- **WCAG contrast gate parses both themes** and computes real 2.x ratios. A hand-picked hex cannot ship past it.
- **`ui-debt.mjs` ratchet** — raw colour / font-family / line-height counts per file may only fall, never rise.
- **Four scripts, one system** — per-script family and line-height resolved by `<Text role>` from the active language. Devanagari needs 1.85 leading, Tamil 1.9, Latin the role's own. Adding a language is a 3-file change with an honesty flag for unprepared scripts.

Every design decision has a doc, a token, and a gate. In a legal-AI case study, that's not process hygiene — it *is* the argument. The trust claims are enforced the same way the product's refusals are.

---

## 7. The one-sentence position

> ChatGPT and Gemini sell fluency and let you audit the wrapper. LokAI sells computable restraint: every turn is a typed decision with a receipt, every refusal is a named outcome with preserved work, and every claim is countably linked to a source you can open. The product doesn't ask to be trusted — it asks to be checked, and makes checking cheap.

---

## Honest limits (state these before a reviewer does)

- The latency finding is US-sample; it is not validated for Indian or Indic-script users. Research-applied, not user-tested.
- One matter is built to production depth (consumer refund), plus one notice interpreter and eight guardrail variants of that matter. The vocabulary generalises; the content is the real cost.
- No live AI, no network, no persistence — all by contract, and all stated in-product.
- The staged reveal is paced comprehension over real work, never simulated latency.
- **The classifier is substring matching, not semantics.** It errs in both directions: a consumer complaint containing the word "fraud" stops as a criminal matter, and a genuinely criminal phrasing that happens to miss every marker passes through to content. This is stated plainly because the stop trigger makes it *visible* rather than hidden — and visibility is the mitigation, not a fix. A learned classifier would be less brittle and far less inspectable; this is a trade, not an oversight.
- The four language packs are prepared content, not translation. A fifth language is a 3-file change plus an honesty flag, not a feature flag.
- **Localization covers the conversation, not the whole product.** Switching to Hindi resolves the answer, the stop trigger, the fact gate, the "what would change this answer" conditions and the gate labels through the packs and the script-appropriate face (verified: the fact gate renders in Noto Sans Devanagari at 17px, +1px optical). Still English on the same screen: the "How we checked" trace lines, the three next-step buttons, and the `DECISION LOG` / dev footer. Those predate this pass and are named here rather than quietly left — a product whose claim is "you can understand what the machine is telling you" has to say which sentences it has not yet translated.
- **The verification gate is now wired to the engine, and it was not before.** `draftAllowed` was read off a static field on the prepared turn, so the interface would draft while the same screen said "5 of 6 facts confirmed" — the central claim, unenforced in the shipped UI. It now runs the live fact store through `computeDraftAllowed` (engine.ts:329), the same function the conformance fixtures assert, so there is no second implementation to drift from it. Worth stating because it is the one place where the prototype's own audit found the prototype lying, and the fix is what makes the other proofs credible.
