# PDF Pattern Mining (LokAI interaction study)

_Mined 2026-09-22 for the LokAI interaction-design case study. Method: text was pre-extracted to .txt; patterns were read and mapped to LokAI concepts (7 typed response modes, 8-way stop taxonomy, claim ledger, verification gate, decision receipts, Decision Spine, ask-first composer, evidence companion column)._

## Sources read

**Readable (4 files, all fully read this session):**

| File | Document | Pages |
|---|---|---|
| `conv-patterns.txt` | "Conversational AI Design Patterns: A Guide for UX & Product Designers" (Sudhir Mishra, © 2026) | 6 |
| `playbook.txt` | "Conversational AI UX & Product Design Playbook" (Sudhir Mishra, © 2026) | 6 |
| `cuierа.txt` | "Conversational UI Design for the AI Era — From human intent to AI action" (Sudhir Mishra, © 2026; filename contains a Cyrillic 'а') | 23 (internal numbering "of 22") |
| `landscape.txt` | "Navigating the AI Landscape — layers, capabilities, and applications of modern AI" (Sudhir Mishra, © 2026) | 9 |

**Visual-only (image-based PDFs, no extractable text — NOT read this session, no OCR attempted):**
- `responsible.txt` — Responsible AI material (image-only)
- `system.txt` — System-related material (image-only)
- `agentic.txt` — Agentic material (image-only)

**LokAI concepts referenced below:** typed response cards (mode chip + risk chip + ledger footer + "Why this response?" receipt) · 7 response modes · 8-way stop taxonomy · claim ledger (never % confidence) · verification gate (user confirms facts) · Decision Spine (state→decision→action→verification, visible loop) · ask-first composer on ambiguity · desktop evidence companion column.

---

## Pattern findings

Format: **pattern** (PDF · page) — what it says → LokAI mapping: **SUPPORT / CHALLENGE / EXTEND** + design implication.

### Trust & Transparency

1. **Capability Boundary Disclosure** (conv-patterns p.3) — "Clearly state what the AI can and cannot do, data limitations, knowledge cut-offs, and when it may be uncertain." → **SUPPORT** mode chip + stop taxonomy. Implication: each mode chip gets a one-line "what this mode covers / doesn't" tooltip; onboarding states legal-jurisdiction scope and knowledge cut-off explicitly.
2. **Inspectable Reasoning / "Thinking" Accordions** (conv-patterns p.3) — optional reasoning steps or citations in accordions, inspectable without cluttering the flow. → **SUPPORT** the "Why this response?" receipt. Implication: render the receipt as a collapsed accordion per card — one tap to inspect, zero default clutter; this is the exact canonical pattern LokAI guessed at.
3. **Transparent automated decision disclosure** (conv-patterns p.2, competency #5 "Ethics, Explainability, Data Privacy") — provide transparent disclosure of automated decisions. → **SUPPORT** decision receipts. Implication: receipts should disclose *that* a mode decision was made, not just the legal content.
4. **The AI Trust Gap** (playbook p.3) — AI-product drop-off "stems from UX failures such as ambiguous system feedback, lost context, or lack of control. Transparent feedback loops are critical to building user trust." → **SUPPORT** ledger footer + always-legible mode/risk chips. Implication: no response may ship without a visible verification state — silence is the named failure mode.
5. **Trust-model artifact set** (cuierа p.19) — "show source, confidence where appropriate, reasoning or relevant evidence, preview, approval, undo, and audit trail." → **SUPPORT** receipts/ledger; **EXTEND** with undo + audit. Implication: persist every receipt per turn (audit trail) and add undo for executed actions (e.g., a drafted notice).
6. **Agent architecture: VERIFY stage + HUMAN APPROVAL block** (landscape p.8) — practical agent flow is receive→search→organize→**verify**→deliver, with "human oversight for important decisions." → **SUPPORT** verification gate as a pipeline stage, not an afterthought. Implication: position the gate *before* final delivery in the Spine, exactly as the VERIFY→DELIVER ordering.
7. **GenAI responsible-use checklist** (landscape p.6) — "Accuracy: verify facts and data," plus bias/privacy checks. → **SUPPORT** claim ledger. Implication: ledger can show a per-claim checked status ("verified against source / unverified") as the operational form of this checklist.
8. **Trust Calibration as a metric** (playbook p.4) — new UX metric that "prevents user over-reliance or skepticism." → **SUPPORT** the no-percentage law's *goal*. Implication: use trust calibration as the evaluation frame in the case study — the ledger is LokAI's calibration instrument.
9. **Confidence & Source Attribution** (conv-patterns p.4) — "Check the model's confidence and ask for sources. Cross-verify critical claims before acting" (example prompts: "How confident are you?", "Add citations"). → **SPLIT: SUPPORT the sources half, CHALLENGE the percentage half.** Implication: ship per-claim source links and a "verify this" affordance in the ledger footer; the cross-verify-before-acting behavior is literally the verification gate.
10. **"Display AI confidence when relevant" + Confidence Threshold Maps** (cuierа p.19; playbook p.4) — both PDFs assume a model confidence signal; the playbook's Confidence Threshold Map decides "when an AI acts autonomously versus requesting human authorization." → **CHALLENGE** (LokAI bans % confidence) but **ADAPTABLE**. Implication: keep the threshold concept, swap the mechanism — risk-chip tiers (procedural/informational/high-stakes) decide when the verification gate appears, replacing scalar confidence with verifiable claim status. Flagged in Conflicts §C1–C2.

### Control & Steering

11. **Human-in-the-Loop Confirmation (Guardrails)** (conv-patterns p.5) — "High-stakes actions require explicit, deliberate confirmation." → **SUPPORT** verification gate. Implication: gate fires on high-stakes modes only — textbook guardrail placement.
12. **Confirmation with stated consequences** (cuierа p.8–9) — "This will cancel your booking and you'll receive a ₹4,200 refund. Cancel?" — confirmation copy states the concrete consequence before acting. → **EXTEND** verification gate copy. Implication: gate should say the consequence ("If you file this reply, the fee is ₹X and the deadline is Y"), not just "confirm these facts."
13. **Cancellable Generation** (conv-patterns p.3) — users can "stop, regenerate, or refine outputs mid-stream to retain control." → **SUPPORT** stop taxonomy. Implication: a mid-generation stop is itself a *typed stop event* logged in the Spine (user-initiated stop ≠ system stop).
14. **Regenerate with Constraints** (conv-patterns p.4) — regenerate under constraints on length, tone, format, audience. → **EXTEND** typed modes. Implication: mode-aware regenerate — "same mode, simpler language" — keeps the mode contract while varying surface form.
15. **In-line Prompt Editing & Branching** (conv-patterns p.4) — edit earlier prompts or fork alternative versions. → **EXTEND**. Implication: branch alternative legal interpretations ("what if the agreement is silent on notice period?") as sibling threads from one receipt.
16. **Granular Feedback / Critique Tags** (conv-patterns p.4) — structured tags ("Too verbose," "Factually incorrect," "Wrong tone"). → **EXTEND** ledger. Implication: add legal-specific correction tags ("wrong statute," "outdated," "wrong forum") that write back to the claim ledger.
17. **Variable Friction + authorization triggers + instant undo** (playbook p.4) — routine tasks run silently; high-risk tasks get "deliberate friction, clear authorization triggers, and instant undo affordances." → **SUPPORT** risk chip gating the gate; **EXTEND** with undo. Implication: the risk chip *is* the friction dial — cite this pattern to justify why low-stakes answers skip the gate.
18. **Authorization gates in practice** (playbook p.5, enterprise example) — root-cause analysis presented "with risk-rated routing options" and "clear authorization gates for final approval." → **SUPPORT** risk chip + verification gate pairing. Implication: options inside a card can carry per-option risk labels, not just a card-level one.
19. **AI decision points taxonomy: answer / ask / infer / recommend / execute / escalate** (cuierа p.18–19) — designers must mark where AI answers, asks, infers, recommends, executes, or escalates. → **EXTEND** the 7 modes. Implication: map each LokAI mode onto these verbs and print the verb on the mode chip — the chip becomes a *declared decision point*, which is the pattern's core demand.
20. **Escalate as a first-class decision point** (cuierа p.19, p.9–10) — AI escalates to a human or another system. → **SUPPORT** stop taxonomy. Implication: every stop in the taxonomy must offer the human path (lawyer / legal-aid clinic) as the standard terminal action.

### Hybrid surfaces

21. **Chat-as-Sidekick (Co-pilot Pattern)** (conv-patterns p.5) — "AI references and manipulates the main artifact, not just the conversation" (chat panel ↔ canvas/artifact). → **SUPPORT** desktop evidence companion column. Implication: chat actions manipulate the evidence panel (highlighting the cited clause), and the panel is a work object, not a transcript mirror.
22. **Generative Artifacts / Split View** (conv-patterns p.5) — conversation generates "structured, editable assets (outlines, drafts, tables, visuals)." → **SUPPORT** typed response cards as artifacts. Implication: cards should be copyable/exportable objects (a checklist you can print), not ephemeral chat bubbles.
23. **Form-Chat Bi-directionality** (conv-patterns p.5) — "Forms and chat update in one hybrid, keeping context in sync." → **SUPPORT + strongest upgrade path for the verification gate.** Implication: confirmed facts render as an editable mini-form synced with chat; editing the form updates the ledger without re-asking in prose.
24. **Multimodal responses: conversation + cards, tables, plans** (cuierа p.9–10; playbook p.2 "editable cards, date pickers, interactive charts"; playbook p.6) → **SUPPORT** typed response cards. Implication: procedure modes should render as tables/timelines (deadline schedules), not prose — the PDFs name tables as first-class response types.
25. **Editable widgets inside the thread** (playbook p.2, p.5 — itinerary widget that "adapts in real time") → **SUPPORT** cards; mild tension with fixed typing (see Conflicts §C4). Implication: cards need sanctioned in-card edits (tick a checklist item) that don't mutate the mode.
26. **Evidence → draft → revise loop with EVIDENCE chips** (cuierà p.12, Salesforce Agentforce example) — agent shows evidence chips alongside drafts; user revises iteratively. → **SUPPORT** claim ledger; **EXTEND** cross-highlighting. Implication: clicking a ledger claim highlights the supporting source in the evidence column — two-way chip linking.
27. **Intent → reasoning → proposal → review → action** (cuierà p.13, GitHub Copilot frame) — the copilot chain from intent to reviewed action. → **SUPPORT** Decision Spine naming. Implication: use this industry-recognized chain in the case-study narrative to show the Spine is an established shape, made persistent.
28. **Continuous reasoning loop: understand→plan→confirm→execute→feedback→recovery** (cuierà p.17 flow framework; landscape p.7 agentic cycle; playbook p.4 "Dialogue State Trees") — multiple PDFs converge on the same loop, including an explicit CLARIFY? and CONFIRM? gate and a state tree. → **SUPPORT** Decision Spine (state→decision→action→verification). Implication: LokAI's Spine is a valid rendering of the field's canonical loop — but note every example keeps the loop *implicit*; making it permanently visible is the differentiator.
29. **Multimodal orchestration (voice/vision transitions)** (playbook p.3) — "seamless transitions between speaking, typing, reading, and tapping." → **CHALLENGE** (LokAI is text-only today). Implication: acknowledge in case study as a stated scope boundary; typing + tapping only, voice as future work.

### Recovery & Stops

30. **Actionable error recovery** (cuierà p.9–10) — "Replace generic errors with helpful, actionable recovery" ("I couldn't access your booking. I can retry, or you can give me the booking number"). → **SUPPORT** 8-way stop taxonomy. Implication: no stop may be a dead end — every stop ships with 1–2 concrete recovery actions inline.
31. **Graceful recovery & self-correction as the modern bar** (conv-patterns p.1) — modern systems get "graceful recovery, clarification, self-correction" while rule-based ones die in "I didn't get that." → **SUPPORT** stops-with-recovery design; also a framing warning (Conflicts §C2). Implication: the stop taxonomy must read as graceful recovery infrastructure, not as a system limitation list.
32. **Boundary & Fallback Maps as a design deliverable** (playbook p.4) — new deliverables replace screen mockups: "Boundary & Fallback Maps for handling model errors." → **SUPPORT** — the 8-way stop taxonomy *is* this artifact. Implication: name it "Boundary & Fallback Map" in the case study so recruiters recognize the industry term.
33. **State model with Failure & Recovery states** (cuierà p.18) — conversations have states: Initial, Clarifying, Processing, Success, **Failure, Recovery**. → **SUPPORT** Spine states. Implication: the Spine must visibly show Failure and Recovery as states, not skip from Processing to Success.
34. **Context carryover** (cuierà p.9–10) — "Only ones under €250" correctly refers to hotels from earlier turns. → **SUPPORT** stops. Implication: after a stop, follow-ups must resolve against preserved context; recovery never forces a restart from scratch.
35. **Human handoff pattern** (cuierà p.9–10) — "Route exceptions or complex requests to a human specialist." → **SUPPORT** referral-type stops. Implication: define the handoff card format (what to bring to the lawyer — the receipt trail doubles as the handoff packet).

### Input patterns

36. **Suggested actions** (cuierà p.9–10) — "Offer smart, relevant actions the user can tap to continue" (Book it / Compare / Change dates). → **SUPPORT/EXTEND** card footers. Implication: suggested actions must be mode-appropriate (a high-stakes mode suggests "verify facts first," not "draft notice").
37. **Proactive AI initiative (mixed-initiative)** (cuierà p.12 "Would you like me to summarize the latest customer interactions?"; cuierà p.18–19 "recommend"; conv-patterns p.1 "proactive suggestions") — AI proposes the next step unprompted. → **SUPPORT** ask-first composer's other half. Implication: after answering, the card may *propose* the next mode ("This depends on X — want me to check the limitation period?").
38. **Clarification + narrow-focus questions** (cuierà p.8 — "I found two flights… 8:30 or 10:15?"; "Which account do you want to update?") — resolve ambiguity with targeted micro-questions; "reduces cognitive load… especially in complex domains." → **SUPPORT** ask-first composer. Implication: ask the single missing fact with tappable options, never an open-ended "tell me more."
39. **Open-ended input for unknown intent** (cuierà p.8) — free-form input is right "at the start… for exploratory or unknown intent." → **SUPPORT** chat familiarity. Implication: keep the composer free-form; typing constraints (only chips/forms) would violate this pattern.
40. **Progressive disclosure** (cuierà p.9–10) — "Show the 3 best from 12 options, then let users reveal more." → **EXTEND** evidence column + receipts. Implication: evidence column shows top 3 authorities with "show more"; receipts collapse to one line with expand.
41. **Persona & tone calibration** (conv-patterns p.3) — "Let users tweak formality, detail level, and verbosity." → **CHALLENGE** fixed 7 modes / **EXTEND**. Implication: offer a global detail-level toggle (summary ↔ full) *within* a mode, rather than letting users redefine the mode itself.
42. **Natural intent expressions** (cuierà p.16, Alexa) — "Don't force users to memorize exact commands—understand what they want to achieve." → **SUPPORT** chat-first familiarity. Implication: mode chips must never become a command menu users must learn; modes label output, they don't gate input.
43. **Streaming & perceived latency reduction** (conv-patterns p.3) — stream tokens for instant feedback. → **EXTEND** with a pacing caveat. Implication: stream the card's prose immediately, but the ledger footer resolves *after* verification — deliberate delay is defensible under Variable Friction (playbook p.4).
44. **Ambiguity as a first-class context input** (cuierà p.5) — systems need goal, constraints, preferences, context, and "Ambiguity: gaps or unclear information" to respond well. → **SUPPORT** ask-first composer. Implication: the composer's ask-first trigger should be an explicit ambiguity check on (goal, facts, jurisdiction) before answering.

**Pattern count: 44 entries across 5 groups.**

---

## Conflicts with LokAI's approach

Honest flags — things the PDFs recommend that LokAI's determinism or no-confidence law contradicts:

- **C1 · Percentage confidence disclosure.** conv-patterns p.4 explicitly coaches users to ask "How confident are you?" and have the system answer; cuierà p.19 lists "display AI confidence when relevant" in the trust model. LokAI's claim ledger bans percentage confidence outright. This is a real, visible deviation from the corpus. Defense (for the case study): LLM self-reported percentages are uncalibrated and would violate the playbook's own trust-calibration goal (playbook p.4) by inviting over-reliance; claim-level verified/unverified status with sources achieves the same calibration honestly. Recommend LokAI *argue* this explicitly rather than silently omit confidence.
- **C2 · Determinism stigma.** conv-patterns p.1 frames the deterministic era negatively (rigid menus, dead-ends, "I didn't get that") and playbook p.2 contrasts conversational AI "unlike traditional UI where Button A strictly triggers Screen B." A recruiter steeped in these decks may read "deterministic legal-AI prototype" as regression. Defense: LokAI's determinism lives in *output typing and disclosure* (fixed modes, receipts, ledger), not in dialogue rigidity — it retains free-form input, clarification, and recovery, which the corpus says are what actually failed pre-LLM CUI. Frame as "deterministic disclosure atop probabilistic reasoning."
- **C3 · Confidence Threshold Maps assume confidence scores.** playbook p.4's autonomous-vs-authorization mapping is parameterized by model confidence; LokAI has no scalar to threshold. Adaptation: risk-tier thresholds (risk chip) reproduce the mechanism without fake numbers (see pattern 10).
- **C4 · Free real-time artifact adaptation vs typed modes.** playbook p.5 praises an itinerary widget that "adapts in real time as the user provides feedback"; cuierà p.14 shows free regeneration loops (touristy → food-focused → hidden gems). LokAI's typed modes constrain surface freedom. Mitigation: sanctioned in-card edits + mode-*transition* paths (pattern 14, 25) so structure doesn't feel like a straitjacket.
- **C5 · Tone/verbosity personalization.** conv-patterns p.3 recommends user-tweakable formality/detail; LokAI's fixed modes limit style steering (pattern 41). Minor; a global detail toggle closes most of the gap.
- **C6 · Streaming expectation vs gate friction.** conv-patterns p.3 sets an instant-feedback norm; the verification gate adds deliberate latency. Defended by playbook p.4's Variable Friction for high-risk tasks, but pacing must be designed (pattern 43), not accidental.

---

## Top 5 takeaways (ranked)

1. **The Decision Spine is canonical — and its visibility is the differentiator.** Three of four PDFs independently converge on the same loop (clarify→plan→confirm→execute→feedback→recovery: cuierà p.17; agentic understand→plan→act→observe: landscape p.7–8; Dialogue State Trees: playbook p.4), yet every product example keeps the loop *implicit in the thread*. LokAI's persistent, visible state→decision→action→verification rail is a genuine, defensible novel surface — lead the case study with this.
2. **The verification gate is textbook best practice — upgrade its copy.** Human-in-the-loop confirmation for high stakes is consensus (conv-patterns p.5; cuierà p.8–9; landscape p.8; playbook p.4–5). Adopt the consequence-stating confirmation format ("this will cancel… you'll receive ₹4,200") and form-chat bi-directionality (conv-patterns p.5) so confirmed facts become an editable synced mini-form rather than prose re-confirmation.
3. **Trust failures are UX failures — LokAI's chips answer the exact named causes.** Drop-off comes from "ambiguous system feedback, lost context, or lack of control" (playbook p.3). Mode chip + risk chip + ledger footer + receipts are direct countermeasures for each named cause; use this citation to frame the whole case study.
4. **Confidence disclosure is the one real conflict — argue it, don't hide it.** The corpus expects visible confidence and confidence-threshold behavior (conv-patterns p.4; cuierà p.19; playbook p.4). LokAI's claim ledger is a deliberate replacement, not an omission: same trust-calibration goal (playbook p.4), honest mechanism. Add one paragraph in the case study making this substitution argument explicitly.
5. **The hybrid-surface toolkit validates every planned LokAI surface and gives two cheap upgrades.** Chat-as-sidekick split view, editable artifacts, suggested actions, and progressive disclosure (conv-patterns p.5; cuierà p.9–10) match the evidence companion column and typed cards one-for-one; the highest-value additions are progressive disclosure for the evidence column (top-3 authorities, "show more") and evidence-chip cross-highlighting from ledger claims (cuierà p.12).

---

_Appendix note: `responsible.txt`, `system.txt`, `agentic.txt` were image-based with no extractable text; they are listed as VISUAL-ONLY and were not read or OCR'd this session. If their content matters later, they need a separate OCR pass._
