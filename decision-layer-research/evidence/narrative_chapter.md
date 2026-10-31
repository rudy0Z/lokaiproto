# Chapter Y — Case Study Narrative: LokAI, the Trust Study

*Chapter purpose: the narrative spine for LokAI's flagship portfolio case study. Everything below stays inside the prototype's verified boundaries — no live AI, no network, prepared content, honest labels ("Illustrative · expert review pending", "Legal information, not legal advice"). One trust claim per case-study section; no capability the prototype cannot demonstrate. The system design must read as LokAI's own product thinking.*

---

## Y.1 The story spine

**The arc in one sentence:** a first-time user with a small legal emergency meets a chatbot whose most impressive behavior is refusing to improvise — and the case study is about why that refusal is the product.

**Act 1 — Ten minutes and no lawyer.** Priya's mixer grinder arrived damaged. It cost ₹8,999. The seller refused a replacement. She has no lawyer, no legal vocabulary, and roughly ten minutes of attention before she gives up or gets talked into something. This is the moment LokAI is built for: the first ten minutes of a legal problem in India, on a phone, in the user's own language. Most legal tech designs for the lawyer's desk. LokAI designs for the person standing in front of a locked shop wondering if the law is even on her side.

**Act 2 — The assistant that won't guess.** Priya opens a chat. She types her problem. And the thing on the other end does something no consumer chatbot does: it stops and asks her to confirm the facts before it will say anything useful. When it finally explains her options under the Consumer Protection Act, 2019, every claim sits on a visible ledger — "6 of 7 claims grounded" — with source lines she can open and citations honestly labeled "Example — verify with a lawyer." When it reaches the edge of what it can safely say, it stops, names why it stopped, and tells her what would unblock it. Nothing drafts without her reading it. Nothing files without her owning it. The chatbot's defining behavior is not fluency. It is restraint.

**Act 3 — From scripted trust to executable trust.** Here is the honest engineering story, and the case study should tell it plainly. The first build *scripted* every trustworthy moment by hand: each reply was an authored object carrying its mode, its citations, its claim counts, its stop conditions. The trust vocabulary was right — verifiable facts, inspectable sources, named refusals, human-owned drafting. But the enforcement was screenwriting. The self-audit caught the proof: an out-of-scope question (a rent dispute) got answered as if it were the consumer-refund scenario, because nothing *computed* the decision — the script simply ran. So the design moved from scripted trust to executable trust: a **decision layer** that computes every response mode, every risk tier, and every stop decision from the matter's actual state, with a layered guardrail stack above it and a receipt under it. Same grammar, now enforced by construction. The drift bug isn't hidden in the case study; it is the origin story of the centerpiece.

**The thesis the chapter carries.** Determinism-by-design is the honesty feature, not a limitation. In a market that can least afford a mistake — first-time users, small amounts, no legal literacy, no second chance at a wrong filing — a legal product earns trust not by being impressive but by being *checkable*. Typed decisions bound what can go wrong: a choice over {clarify, explain, disclose, stop, confirm, progress, recover} cannot hallucinate a response mode. Refusing to decide is itself a decision the engine is allowed to make — and when nothing matches, escalation is the correct output, not an error. LokAI doesn't chat about your legal problem; it decides what may safely happen next, and shows its work. That is the sentence the whole case study exists to earn.

---

## Y.2 Section map

Rule enforced across the map: **one trust claim per section.** If a section needs two claims, it is two sections. Each claim is proven by an artifact that already exists in the prototype, and each section ends in a feeling — because trust is a felt judgment backed by evidence, not the reverse.

| # | Case-study section | The ONE trust claim it carries | Prototype artifact / embed that proves it | What the reviewer should feel |
|---|---|---|---|---|
| 1 | **The first ten minutes** (hero + Priya scenario) | It knows what it is — and says what it isn't. | Hero embed with the boundaries panel: "prototype · no live AI · no network", "Legal information, not legal advice" visible without scrolling. | Honesty *before* capability. This builder defines success as restraint. |
| 2 | **The verification gate** | It asks before it advises. | Chat embed: the engine catches a fact Priya hasn't confirmed (or corrects) and won't proceed to advice until she does. | It knows what it doesn't know — and that is the most trustworthy thing it says. |
| 3 | **Grounded answers (claim ledger + source lines)** | Every claim is countable — evidence, never a confidence score. | An explain turn showing "6 of 7 claims grounded", source lines that open, citations labeled "Example — verify with a lawyer". | I could check this myself. That's the point. |
| 4 | **The refusal taxonomy (light + dark stop screens)** | When it stops, it stops on purpose — and tells you why. | Guardrail gallery: stop screens naming the failure in plain words (missing facts, source gap, out of scope…) with an exit path on each. | Refusals got as much design care as answers. Nobody ships eight kinds of "no" by accident. |
| 5 | **The Decision Layer (centerpiece)** | Every response is a computed decision with a receipt — not a generated guess. | Decision-receipt embed: open any turn's "Why this response?"; a why-LokAI-stopped moment; the escalation ladder recomputing live. | This is engineering discipline I can trust, not chatbot magic. |
| 6 | **The review-gated filing packet** | Nothing files without a human reading it. | Packet flow with visible draft states: ai_draft → user_reviewed → ready_to_use; the filing path (e-Daakhil, 1915 helpline, registered post) stays inert until the user owns the draft. | The machine drafts; the human owns. The liability line is drawn in the product, not the footer. |
| 7 | **NoticeInterpret** | It reads official documents with you, clause by clause — never instead of you. | Property-tax notice demo: plain-language reading mapped clause-by-clause to the source text. | Comprehension without an authority grab. It translates; it doesn't advise. |
| 8 | **Voice, before commit** | You can speak to it — but nothing commits from your voice. | VoiceActive screen: transcript is editable and reviewable before it becomes input. | Accessibility without surrendering control. |
| 9 | **The audit line** | Every decision leaves an inspectable receipt. | The audit-line provenance strip on turns and actions: what was decided, from what state, with which sources. | This would survive scrutiny. Someone could audit this product. |
| 10 | **Four languages** | Trust speaks the user's language. | Live EN / HI / MR / TA switcher over the same embeds — the trust surfaces (ledger, stops, receipts) translate too. | Built for India, not ported to it. |

---

## Y.3 The decision layer as the centerpiece

This section must land one idea and refuse to wander: **every answer is a computed decision, not a generated guess.** Present it as trust formalization, not architecture flex — no state-machine diagrams, no plumbing vocabulary, no "here is my engine" bravado. Show receipts, not machinery. The reader should finish the section thinking *"of course a legal product works this way"* — which is the strongest reaction a design choice can get: inevitability.

**The loop, in product language.** The decision layer reads the matter's state (confirmed facts, matter type, jurisdiction, risk signals), applies the guardrails, and outputs three typed things: a response mode (clarify, explain, disclose, stop, confirm, progress, recover), a risk tier (self-service → review recommended → human required), and — when it can't proceed safely — a named stop. Then the action runs, and the claim ledger is recomputed from state, not carried over as a literal. State → decision → action → verification. Every cycle. The case study should show this as four plain-English steps, one sentence each, with the embed demonstrating it rather than a diagram asserting it.

**Device 1 — Decision receipts.** Every turn can be opened: *Why this response?* The receipt shows the facts the decision read, the guardrail that matched, the mode selected, and what would have changed the outcome. Critically, the receipt carries **provenance, not confidence** — no numbers, no percentages, no "0.92 sure". A number asks the user to *believe* the system; a receipt asks them to *read* it. This is the anti-"trust me" device, and it doubles as the section's honesty anchor: the receipt is trivially honest because it is computed, not authored.

**Device 2 — Why-LokAI-stopped moments.** Most products treat failure as embarrassment and hide it. LokAI treats it as its most rehearsed behavior: eight named failure kinds, each with a light and dark stop screen, each screen saying what's missing and what would unblock it. The case study should present one stop in full — e.g. the source-gap stop ("this question touches a law this guide hasn't prepared; here is where a lawyer fits") — and let the gallery carry the rest. The line to write: *the system's first job is refusing to decide; the "none of the above" branch is a designed outcome, not a crash.*

**Device 3 — The escalation ladder.** Risk tiers are computed from state, never vibes: self-service, review recommended, human required. Show one recompute live — a fact flips the tier, the stop screen names the human path. The ladder's most important property for the narrative: it mirrors how real legal services triage, so the product's boundaries feel inherited from the profession, not invented by the software.

**The guardrail stack, one line per layer.** Scope gate (is this matter in range at all?) → verification gate (are the user's facts confirmed?) → grounding gate (is every claim backed by a prepared source?) → risk gate (does this cross the human-required line?). Four layers, each computable, each with its own stop kind and receipt. Present them as *the reasons LokAI can say no in eight different honest ways*.

**Four embed demos, each under 30 seconds:**

1. **"Open the receipt" (~20 s).** In the chat embed, tap *Why this response?* on any turn → the receipt card appears: mode decided, facts used, guardrail matched, what would change it. Caption: *"Every reply is a decision you can audit."*
2. **"Make it stop" (~25 s).** Tap the prepared out-of-scope prompt (a rent-deposit question) → no guardrail matches → a computed stop screen naming *out of scope*, with exits. Caption tells the truth: *"An earlier build answered this as the consumer case. The decision layer exists because of that audit finding."* The bug becomes the demo — this is the single most recruiter-memorable moment in the case study.
3. **"Flip the risk tier" (~30 s).** Toggle one fact to the high-risk option → the tier recomputes to *human required* → the stop screen shows the human path (lawyer, helpline). Caption: *"Risk is computed from your matter, not asserted by a script."*
4. **"Watch the ledger recompute" (~20 s).** Un-confirm the purchase-date fact → mode flips to *clarify* and the grounded-claims ratio drops live from 6/7 to 5/7. Caption: *"Trust signals are computed from state. Nothing on this screen is a hardcoded literal."*

**What this section must NOT do:** claim live intelligence, show numeric confidence, or drown the reader in internals. The prose generation side is honestly labeled — prepared content today, and the case study says so once, plainly, in the boundaries panel. The centerpiece claims governance of the decision, not generation. That restraint is what makes the section credible to senior engineers and legible to recruiters in under a minute.

---

## Y.4 Interview talking points

Seven points a fresher can defend from first principles, each with a quotable line.

1. **Why a deterministic prototype instead of a live LLM.** "You can't discover a trust contract while the generator improvises. I froze the decision contract first — what the product may say, refuse, and escalate — and kept generation out until the boundaries are proven. Zero-network is also a real design constraint for the first ten minutes of a legal problem: it must work on a weak phone with no data plan, and it must never fail in a way that costs the user their only claim." Defensibility: the no-network rules are enforced by build-time checks in the repo, not just stated.

2. **The contract accepts a real model later without changing the promise.** "The decision layer is a typed interface: state in, decision out. A rule evaluator fills it today; tomorrow a model with structured outputs can fill the same interface. The user-facing contract — modes, tiers, stops, receipts, claim ledgers — doesn't move. Prose would only ever appear inside explain/disclose payloads; stop and risk decisions stay machine-checkable." The senior-sounding summary: *the model becomes an implementation detail; the contract is the product.*

3. **What "confidence" means here, and why it is never a number.** "Confidence belongs to the engine; evidence belongs to the user. Internally, a decision layer can use thresholds — documented as policy choices, not math, because uncalibrated thresholds are opinions in costume. Externally, the user sees a claim ledger — '6 of 7 claims grounded, 1 needs your confirmation' — because numbers invite automation bias, and a countable, inspectable ratio beats a flattering decimal in a legal context." This answer doubles as product judgment, not just engineering taste.

4. **The drift bug as design evidence.** "My first build routed inputs by substring matching, and an out-of-scope question got answered as the consumer scenario. That audit finding is why the decision layer exists: the fix wasn't more copy, it was making 'no policy matches' a first-class, computed decision that escalates. I found it by auditing my own repo against my own claims." Recruiters read this as: self-critical, evidence-driven, ships the fix as the story.

5. **Refuse-to-guess mirrors real legal triage.** "Lawyers triage before they advise: handle, supervise, or refer. LokAI's three risk tiers encode the same ladder, and the escalation path is the product's most important feature — a legal tool that never hands off is a tool that never admits its limits." This frames the refusal taxonomy as inherited from the profession, which lands well with legal-tech interviewers.

6. **Economics of decisions.** "Computing a decision from state is milliseconds and works offline; calling a model to do it is slow, costs money per call, and can fail in ways a legal product can't absorb. The architecture spends model cost only where language genuinely matters — explanation and drafting — and never on the decision of what may safely happen next." Honest scope note to volunteer: the prototype has no live costs; this is the architectural claim, not a benchmark.

7. **What I'd build next — without overclaiming today.** "Three things: calibrated uncertainty behind the typed decision seam when a live model arrives; decision receipts exported as a user-owned audit trail; and policy tests as first-class artifacts — every stop kind gets a test that proves the engine refuses when it should." *(Interview ammunition — market context, not design lineage: courts have sanctioned lawyers for filing AI-fabricated citations — Mata v. Avianca, S.D.N.Y. 2023 — and US regulators issued a 2025 order against a consumer "AI-lawyer" app for deceptive claims. Cite these as the climate the design anticipates, never as inspiration.)*

---

## Y.5 Anticipated hard questions

Objections recruiters and senior engineers actually raise, with answers that stay inside the prototype's boundaries.

**"Isn't this just a flowchart?"**
A flowchart encodes drawn paths; this encodes an evaluable contract. Three differences the reviewer can test in the embed: decisions recompute when state changes (change a fact, the mode and tier move); every decision leaves a receipt naming the facts and guardrail that produced it; and the "none of the above" branch is a designed output — unmatched input escalates rather than falling through to the nearest-looking node. Flowcharts fail silently; this is built to fail loudly and in your favor.

**"Where's the AI?"**
Where it belongs, and honestly labeled: language work (explaining, drafting, reading notices) is where generation helps, and that content is prepared in this prototype — the boundaries panel says so in the first screen. The decisions — what mode, what risk tier, whether to stop — are deliberately separated from generation, because that separation is what makes the product auditable. The claim is not "no AI"; it is *AI where language is needed, typed decisions where accountability is needed.* Governance of AI is the harder and rarer contribution.

**"Would this survive novel inputs?"**
Split the question in two. The decision dimension: yes, by construction — anything the guardrails can't match becomes an escalation with a named reason; the failure space is bounded by the type system, so novelty produces a stop, never a confident wrong answer. The content dimension: no — prepared text is bounded, and a novel matter will outrun it. That gap is the documented seam where a live generator would enter later, behind the same typed contract, with grounding and review gates unchanged. Saying "the prototype is honest about its edge" is a stronger answer than pretending the edge doesn't exist.

**"How does this scale beyond one scenario?"**
The vocabulary scales; the content is the cost. Response modes, risk tiers, failure kinds, receipts, and the guardrail stack are scenario-independent — a new domain (rent disputes, RTI, workplace grievances) means adding policies, prepared payloads, and reviewed sources, not re-architecting. The honest bottleneck is content: every answer must be authored, sourced, and labeled, which is exactly the cost a trust-first legal product should have. The audit says this plainly, and saying it plainly is itself the trust claim.

**"If scenarios script the verification catch, isn't the gate just theater?"**
It was — and that's an audit finding, not a defense. In the first build, trust signals were literals attached to hand-written turns. The decision layer makes the gate computed: preconditions are evaluated from matter state, trust signals recompute when facts change, and the receipt shows what remains unverified. The case study deliberately shows the theater version and the computed version as before/after, because the difference between *saying* trust and *computing* trust is the entire thesis.

**"Why not show a confidence score? Users like certainty."**
Numbers invite the wrong kind of trust. A "92% confident" label can increase over-reliance as much as under-reliance, and in a legal context the user has no way to interrogate a decimal. A claim ledger is the opposite: countable, source-linked, and falsifiable — the user can see the one ungrounded claim and decide what to do about it. Certainty is a feeling; inspectability is a feature. LokAI ships the feature.

---

## Y.6 Naming

Candidates for the decision system, evaluated for a portfolio context (plain-English, maps to code nouns, no hype, no borrowed vocabulary):

| Candidate | Reads as | Strength | Risk |
|---|---|---|---|
| **LokAI Decision Layer** | The stratum of the product that decides | Already the working term; plain; scales from section title to code | Slightly generic as a headline |
| **LokAI Decision Core** | The heart of the product | Stronger centrality | "Core" implies capability, not trust — wrong emphasis |
| **LokAI Policy Engine** | Rules that compute decisions | Technically accurate (guardrails + policies) | "Policy engine" reads corporate-compliance; colder than the product feels |
| **Decision Receipts** | The artifact the user actually sees | Most memorable and most honest — names what the reviewer can touch | Too narrow to name the whole engine |
| **The Refusal Engine** | The thing that says no | Distinctive, bold | Defines the product by limitation; risky for skimming recruiters |

**Recommendation: keep "LokAI Decision Layer" as the system name**, and let a small named vocabulary carry the distinctiveness:

- **decision receipt** — the per-turn, openable proof of a computed decision (provenance, never confidence numbers);
- **why LokAI stopped** — the named stop moment, always with reason and exit path;
- **the escalation ladder** — the computed risk tiers, self-service → review recommended → human required.

Rationale: the system name should be boring and true, because the artifacts are the memorable part — a recruiter will forget "Policy Engine" but will remember tapping *Why this response?* and reading a receipt. The name maps 1:1 to code nouns (decision, receipt, stop, tier), so the write-up, the embed, and the interview answers all use the same words — and in a trust study, consistency between what you say and what the code does *is* the brand.
