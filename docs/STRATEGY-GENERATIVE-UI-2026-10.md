# LokAI — The Design Problem, and why generative UI is the wrong fix for it

**Date:** 2026-10-22 · **Status:** strategy discussion, pre-build
**Question answered:** "What is the design problem I am solving here now, and how does generative UI relate to it?"
**Sources read:** openui.com · thesysdev/open-intelligent-ui · CopilotKit/OpenIntelligentUI · unicodeveloper (Medium) · tambo-ai/tambo · vercel/ai-elements · CopilotKit/CopilotKit · openai.com/index/gpt-6-for-everyone · design.interfere.com · arXiv 2607.22928 (Design Theater) · arXiv 2609.23642 (Elicitive UIs) · arXiv 2604.25455 (GenUI a11y bridge) · DIS '25 · IUI '25 · Catalystic UI docs · Enterstellar · FDA Docket FDA-2026-N-7874 comment

---

## 1. The design problem, stated properly

The brief for LokAI has drifted. Let me restate it.

> **A person who has never read a legal notice cannot describe their problem in the vocabulary the law needs. Every interface that helps them does it by guessing: a template asks what it thought to ask; a chatbot asks nothing and answers everything.**

The legal question was never "how do we display the answer." It is:

> **Who decides what the assistant is allowed to ask, and how does the user know that?**

Three sub-problems, all of which the current build only half-solves:

| # | Sub-problem | Current state | Failure mode |
|---|---|---|---|
| A | **Vocabulary gap** — the user says "the mixer came broken"; the law needs *defect*, *written complaint*, *purchase date*, *limitation period* | Hand-authored clarify turn with 3 fixed chips | The question is a guess about what the user knows; if their situation doesn't fit the script, the script can't hold it |
| B | **Question ordering** — which single fact, asked *now*, changes the answer most? | The clarify middle asks purchase date because it was authored that way | No principle for "which question next" — it's sequence, not policy |
| C | **Provenance** — why was *that* question asked? | The receipt exists but the ask doesn't carry it | The user can't connect a question to a fact gap |

**The current failure is B+C, not A.** The vocabulary gap is real, but the deeper problem is that the *questions are authored per-screen* rather than *computed from a fact gap*. The `?stage=clarify` screen is a template; the templated-form criticism is correct, but the fix isn't generative UI — it's making the question a **policy output**.

---

## 2. What generative UI actually is (and what it isn't)

### 2.1 The 2026 state of the art

OpenAI shipped **Intelligent UI** on 2026-10-07 (GPT-6): the model composes responses from text + graphics + tappable buttons + forms + charts, with a native streamable component library and a compiler so the interface appears progressively. Gemini has shipped equivalents. Every major framework now has a "generative UI" story.

The shared architecture is:

```
user message → model → (a) a component program the client parses and renders
                          (b) a tool call the client renders via a `render` fn
```

### 2.2 The three implementations, and what each actually gives you

| Project | License | Question card? | Round-trip protocol? | Bring-your-own design system? | Notes |
|---|---|---|---|---|---|
| **AI Elements** (Vercel) | Apache-2.0 | ✅ `<Question>` (single/multi + freeform, submit disabled until answered) | ❌ plumbing is yours | ✅ copy-in via shadcn CLI | ⚠️ **being deprecated end of Nov 2026** (folded into shadcn/ui) |
| **CopilotKit** | MIT | ✅ `useHumanInTheLoop` (model-initiated) + `useInterrupt` (`renderInChat: true`) | ✅ **the only complete round-trip** — answer comes back *as the tool result* | ✅ `useRenderTool({name, parameters: zod, render})` | ⚠️ issue #6571: the HITL gate can silently never run while the model reports it did |
| **Tambo** | MIT | ⚠️ partial — MCP **elicitation** is server-initiated, not model-initiated | ✅ | ✅ register components with Zod schemas | ⚠️ **cloud shuts down 31 Oct 2026** (9 days) — self-host only |
| **OpenUI** (Thesys) | MIT | ⚠️ structural — a question is just a `Form` the model emitted; no distinct "ask" verb | ✅ via `@ToAssistant(message, context)` | ✅ first-class (`defineComponent` + Zod, 45+ shadcn example) | Best *spec* (conformance fixtures, backwards-compatible prop-order rules); ⚠️ name collides with a W3C project (openui#353) |
| **A2UI** (Google) | Apache-2.0 | ✅ `ChoicePicker` / `TextField` | ✅ `actionResponse` | ✅ catalog of pre-approved components | The emerging cross-vendor standard; OpenUI and CopilotKit both bridge to it |

**No framework is a dependency you should take.** All are live-LLM-coupled or model-in-the-loop; LokAI is a deterministic prototype with a hard "no network" build gate. What they give you is **patterns**, and the patterns are worth taking.

### 2.3 The evidence against handing the model the interface

This is the part that should shape the design:

- **Accessibility.** IUI '25 tested 200 AI-generated UIs: **144 (72%) had at least one accessibility violation.** DIS '25 found models "approach accessibility as a technical problem rather than a design practice." AI Elements' own `Question` implementation (the market's best card) sets `role="radio"`/`"checkbox"` on `<button>`s with **no arrow-key radio-group navigation, no `<fieldset>/<legend>`, no `aria-required`, and no `aria-describedby` wiring**. Tambo's Elicitation primitives are the strictest in the set and are directly liftable.
- **Evaluation.** arXiv 2607.22928 ("Design Theater"): generative UI tools "create a false sense of expertise — users may feel confident that an interface satisfies their design needs, but only because they lack the training to recognize usability problems, missing requirements, or flawed design assumptions." The bottleneck is *evaluation*, and generative UI makes it worse, not better.
- **Security.** CopilotKit's `generateSandboxedUi` streams raw HTML/CSS/JS into an isolated iframe — the server controls the appearance. A2UI's counter-move: "declarative data format, not executable code… the agent can only request to render components from that catalog… no UI injection attacks."
- **Correctness.** CopilotKit #6571: the human-in-the-loop gate silently never fires while the model *reports it did*. In a legal tool that is an audit-integrity failure, not a UI bug.
- **Determinism.** Catalystic UI: *"Generative UI demos beautifully and ships almost nowhere… No bank, no store, no serious product team will let a language model freestyle a payment screen: one reworded 'Confirm,' one hallucinated field, one off brand component isn't a quirk, it's an incident."* Enterstellar: *"Without a compiler, LLMs invent hex codes, miss accessibility attributes, and violate your design system."*

---

## 3. The differentiation: the model may not author the interface

Every framework above has the same trust model:

```
model → interface → user
```

**LokAI's differentiator is the inverse:**

```
policy (deterministic) → interface  ← the model may only phrase the words
                     → receipt
```

This is not a new idea — it is a synthesis of four sources that have never been combined:

| Source | Contribution |
|---|---|
| **JEV / the decision layer** | typed decisions computed from state, never generated. A choice over `{clarify, ask, stop, disclose}` cannot hallucinate a response mode. |
| **OpenUI's allow-list discipline** (issues #698/#633) | restrict the model to exactly the components a legal assistant may use. LokAI's `statusVocabulary.ts` already applies the same discipline to *words* ("never hand-write a status string") — extend it to *components*. |
| **FDA Docket FDA-2026-N-7874** (Sept 2026) | *"Determinism → AI → Determinism. Deterministic, computed context goes in. The model reads and proposes. A deterministic engine verifies every proposal against fixed limits and decides. Nothing the model emits can reach a recorded value… the validated object is not the model — it is the evidence chain."* |
| **CopilotKit's `useHumanInTheLoop` round-trip** | the model asks via a *tool call*, the answer returns *as the tool result*, the agent resumes. Clean, model-initiated, in-chat. |

### The one-line position

> **A generative UI where the model cannot invent the interaction.**
> The policy decides *what* is asked and *what* may be shown. The model decides only *how the words read* — in the user's own language, in the user's own script. Every question carries the receipt that says why it was asked.

This is what GPT-6's Intelligent UI does not have. OpenAI's model composes the interface and evaluates its own design decisions; there is no gate between the model and the screen, and no receipt. LokAI's screen is a *render of a computed decision* — the same thesis as the decision layer, applied to the question instead of the answer.

**This survives the AI-improves-forever objection** — arguably better, because a fixed policy plus a better wording model is *strictly* better than a model that also invents the interaction. The thesis is about *where the model's authority stops*, not about model quality.

---

## 4. In-chat, but with a case sheet

The two existing patterns:

| Pattern | Metaphor | Strength | Weakness |
|---|---|---|---|
| **Claude Code desktop** | a console beside the work | dense, power-user, keyboard-first | the console metaphor is wrong for a first-timer; a phone user will not read a terminal panel |
| **ChatGPT in-chat card** | the conversation is the document | stays in the flow, keeps the record visible in the stream | variable-height cards jitter under scroll (CopilotKit #6089); the record fragments if you scroll away |

**Recommendation: in-chat as the asking surface, plus a persistent "Case sheet" as the record.**

- **In-chat** because Priya is on a 390px phone in a legal flow. Screen navigation disorients and loses scroll position mid-case. The verification gate is a *dialogue* — she is being asked to confirm facts, not fill a form. And the questions-and-answers *are* the audit trail, so they should live in the transcript.
- **Case sheet** because of CopilotKit #6089 and because "what is preserved" needs somewhere to live. The sheet is the projection: facts + status, every question asked, every answer given, sources, receipts, the audit trail. It is also the **lawyer-handoff artifact** and the **handover packet** you already designed.
- Split of concerns: **the conversation is where you are asked. The sheet is what is true.**

---

## 5. Rebuild? No. But the interaction layer, yes.

### 5.1 Why not a new repo

| Reason | Detail |
|---|---|
| **The gates are the artifact** | `verify-demo.mjs` + `verify-decision.mjs` + the `ui-debt` ratchet + the WCAG contrast gate are what make this a portfolio piece instead of a mockup. A new repo starts them at zero. |
| **A new design system is self-defeating** | The case study's claim is "I built a system whose law is enforced by code." Adopting a generic system makes you commodity. |
| **Migration is invisible work** | A recruiter sees screenshots. Two weeks of token migration looks like "the app looks slightly different." |
| **You are 70% built, not 0% built** | The engine, the modes, the stops, the scripts, the receipts, the gates all exist. The problem is concentrated in the *question-asking flow*, which is a small slice. |

### 5.2 Why not `design.interfere.com`

It is a clean, modern, opinionated system — light/dark, ~32 primitives, good radius/shadow scale. But adopting it means **replacing** your layer-1/2/3 system, and it does not have the three things that make LokAI's system LokAI's:

1. **The register typography** — serif as a *register* ("the law speaking"), not an ambient tone. This is the thesis.
2. **The role layer** (`--role-*`) that the contrast gate parses in both themes. Interfere's tokens would be invisible to your own gate.
3. **Script-aware `<Text>`** with per-language leading (Devanagari 1.85, Tamil 1.9) and the `+1px` Tamil rule. A design system that ships one type scale cannot carry the multilingual claim.

**Verdict: do not adopt. Look at it for the radius/shadow scale and its type ratios, and steal those two things if you like.**

### 5.3 What to do instead

**A new surface in the same repo, on the same tokens, under the same gates.** Call it the v2 chat: `/mobile/chat` becomes the product path; the `?stage=` screens stay in the `/dev` gallery and as deep links for the case study. A/B without a rewrite, and the old screens never break.

---

## 6. The plan — 6.5 days, one interaction, one demo

### Phase A · The `Ask` primitive (2 days)

**New response mode `ask`** (a sibling of `clarify`, not a replacement):

```ts
AskPayload = {
  question: string;          // localized
  whyItMatters: string;     // localized
  options: { label, value }[];  // localized chips
  allowFreeform: boolean;
  targetFactId: string;      // the fact slot this answer writes to
  gateId: GateId;            // WHY it was asked — the receipt
  unlocks: string;           // what changes once answered
}
```

**The rule that makes it a redesign, not a feature:** the question is **computed by the gate cascade from the missing fact**, not authored per turn. The engine already knows `facts[].state === 'needs_review'`; the `ask` payload is derived from that, so the gate that fired and the question asked are the same fact.

**New primitive `AskCard` in `ui/primitives.tsx`** (layer 2), built to:
- AI Elements' `Question` shape: single/multi + optional freeform, **submit disabled until answered**, response `{ selectedValues, text? }`
- Tambo's Elicitation a11y contract: `htmlFor`/`id`, `aria-invalid`, `aria-describedby`, `inputId`/`errorId`
- LokAI's `<Text role>` so the question and options are script-aware in EN/HI/MR/TA

**Gate:** `verify-demo` asserts every `ask` turn names a `targetFactId` that exists in the fact store, and that the receipt's gate matches the ask's `gateId`. An ask that doesn't trace to a fact gap is a build failure.

### Phase B · The case sheet (1.5 days)

New mobile surface: facts + status, every question asked with its answer, sources, receipts, live audit trail. This is where "what is preserved" lives, and it is the handoff artifact.

### Phase C · Cut the screen flow from the product path (1 day)

Chat becomes: describe → **ask (in chat)** → ask (only if it changes the answer) → answer → plan → packet. The `?stage=` screens remain as gallery entries and deep links.

### Phase D · Receipt hardening (1 day)

Every ask carries its receipt inline. "Why this response?" works on asks, not just answers. The sheet links a receipt to the fact it read.

### Phase E · The 90-second capture (1 day)

One continuous story at 390px, both themes. No more documents.

### Explicitly not doing

No new repo · no new design system · no runtime generative model (keep the deterministic demo + the spec'd model seam) · no desktop rebuild yet · no second matter yet · no shader work · no more design docs before the demo ships.

---

## 7. Business worthiness

**Why would anyone not use ChatGPT for this?** Honest answer: they might. ChatGPT's Intelligent UI is free, general, and multilingual.

The defensible answer is not "our AI is better." It is:

| Layer | What LokAI has that a general assistant does not |
|---|---|
| **Corpus** | One jurisdiction, reviewed sources, the CPA 2019 and its sections — a legal aid organisation can audit *which* sources |
| **Policy** | A refusal taxonomy that knows when to stop (8 kinds) and when to escalate — a general assistant improvises refusal |
| **Record** | A receipt per decision, a live audit trail, a case sheet — the artifact a lawyer or a consumer-commission clerk can actually read |
| **Language** | 4 scripts, one type system, per-script leading, code-switched notices |
| **Boundary** | A consumer-only scope, stated in-product, with the illegal paths refused by construction |

**Who pays.** Not the consumer — a person with a ₹8,999 dispute will not subscribe. The plausible model is **B2B2C / pro-bono**: legal aid clinics, District Consumer Commission help desks, employer legal desks, or a CSR-funded consumer-protection partner, who bring the user in and who are the real customer because *the record is the deliverable to them*. That is a business model the decision layer actually supports — you can hand an institution a defensible, auditable file.

**For the case study, this is one section, not the spine.** The spine is the interaction design.

---

## 8. The personal-assistant pivot: no

- "Personal assistant" is the most generic positioning available. Zero differentiation, and it invites the "why not just use ChatGPT" question with no answer.
- A legal assistant for first-timers in India **is** the differentiated thing. Broadening it dilutes the one claim you can defend.
- The *expansion* story is real and belongs in one sentence: the **matter system** (one matter, exhibits, questions, receipts, a handoff packet) generalises to rent disputes, RTI, workplace grievances, or any document-heavy domain. That is a roadmap paragraph, not a redesign.

---

## 9. The "nobility" worry

OpenAI shipped Intelligent UI on **2026-10-07** — two weeks ago. Being late to generative UI is not disqualifying. Being late to *the trust boundary around generative UI* is not disqualifying either, because nobody has built it yet.

What **is** disqualifying is arriving with documents instead of a demo. The current repo has 11 stages, 7 modes, 8 stops, 4 scripts, a decision engine, receipts, a spine, a gate suite — and no single screen a reviewer can watch for 20 seconds and think "I haven't seen that before."

**So: stop planning, ship the one interaction.** Six and a half days. One `AskCard` primitive. One case sheet. One 90-second capture. Then the case study writes itself around a thing that exists, not a thing that was described.

---

## 10. Source register

- OpenAI, *GPT-6 and Intelligent UI for everyone*, 2026-10-07 — openai.com/index/gpt-6-for-everyone
- Thesys, OpenUI — openui.com · github.com/thesysdev/openui (MIT) · spec/language.md, spec/prompt.md, spec/fixtures/1.0/ · issues #353, #582, #633, #698, #728, #751
- Thesys, open-intelligent-ui — github.com/thesysdev/open-intelligent-ui (MIT, 764★)
- CopilotKit, OpenIntelligentUI — github.com/CopilotKit/OpenIntelligentUI (MIT) · CopilotKit/CopilotKit (MIT, 38.2k★) · docs.copilotkit.ai/human-in-the-loop · issues #6571, #6089, #6526
- unicodeveloper, *I rebuilt the ChatGPT Intelligent UI experience with open-source generative UI* — Medium, 2026-10 · github.com/unicodeveloper/openuitutorial
- Tambo — github.com/tambo-ai/tambo (MIT) · Tambo Cloud shutdown announcement 2026-10-01 · docs.tambo.co/reference/react-ui-base/elicitation
- Vercel AI Elements — github.com/vercel/ai-elements (Apache-2.0) · `packages/elements/src/question.tsx` · deprecation notice (Nov 2026)
- A2UI — a2ui-project/a2ui (Apache-2.0) · Google A2UI announcement
- arXiv 2607.22928 *Design Theater: A Benchmark for Generative UI* · arXiv 2609.23642 *Elicitive User Interfaces* · arXiv 2604.25455 *Generative UI as an Accessibility Bridge* · arXiv 2604.09577 *Generative UI: LLMs are Effective UI Generators*
- ACM DIS '25 *Good Accessibility, Handcuffed Creativity* · ACM IUI '25 *Understanding and Improving Accessibility in AI-Generated Interfaces*
- Catalystic UI docs (determinism thesis) · Enterstellar (compiler + Replay Mode)
- FDA Docket FDA-2026-N-7874, Attachment 1 (Sept 2026) — "Determinism → AI → Determinism"
- `design.interfere.com` — Foundations, Typography, Primitives (light/dark)
