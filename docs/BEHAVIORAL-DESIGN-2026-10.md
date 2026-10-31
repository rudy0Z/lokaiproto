# LokAI — Behavioral Design for Informed Abstention

Date: 2026-10-06 · Status: **design thesis + case-study argument** ·
Read with: `PRODUCT-JOURNEY-2026-09.md` (the seam) · `DECISION-INTERACTION-2026-09.md` (the pipeline) ·
`BEHAVIORAL-AUDIT-2026-09-28.md` (implementation defects — this document does not restate them) ·
`PRODUCT.md` (boundaries)

**What this owns:** the *why* behind the product's restraint, and the case-study problem statement it
argues for. It does not restate the interaction spec or the build order.

---

## 0. The pushback first, because it's the most important thing here

Someone at the conference said: *the market wants something unique.* That instinct is right for
consumer products and **dangerous for legal aid.**

In most domains, a designer's job is to move a metric — conversion, retention, session length. Novelty
is instrumental. In a domain where a wrong answer costs someone money they cannot spare, "unique" is not
a goal. A novel legal-AI interaction that persuades more people to act is not a triumph; it may be a
well-designed harm.

So this document does something slightly unfashionable: it argues that LokAI's most defensible and most
novel design contribution is **helping a user correctly decide *not* to act** — and that the whole
"accountability" architecture is really the behavioral case, restated.

That is still novel. It is just novelty aimed at the actual problem instead of at the portfolio.

---

## 1. The finding that reframes everything

Sandefur's *Accessing Justice in the Contemporary USA* (American Bar Foundation; n=668, in-person survey,
Midwestern city) found something that inverts the standard assumption about why people don't use legal
help:

- Only **22%** of people who experienced a civil justice situation sought help from any third party.
- **46%** dealt with it alone. **16%** did nothing. **16%** asked only family or friends.
- **Cost was not the reason.** Participants rarely cited cost as a factor. Sandefur's conclusion: people
  "think about these problems in a way that channels them away from attorneys."
- **47%** of those situations produced a significant negative consequence — most commonly an impact on
  mental or physical health (27%).

The mechanism is **legal consciousness**: most people do not experience a bad outcome as a *legal*
problem. It registers as bad luck, a bad product, a bad day, something you cope with.

**What this does to LokAI's problem statement.**

LokAI currently assumes a user who already knows she has a consumer-protection problem and has arrived
to ask about it. The behavioral evidence says the *majority* of people with a redressable harm never
reach that frame — they never type the question the product is built to answer.

| Old problem statement | New one |
|---|---|
| "How do we make AI trustworthy for a person who needs legal help?" | "How does an AI help a person **decide whether this is something with a remedy at all** — and then decide whether pursuing it is worth it?" |
| Assumes legal framing already exists | Legal framing is the thing to be built |
| Success = a correct answer | Success = a correct *decision*, including "leave it" |
| Optimizes the answer | Optimizes the judgement |

This is the first genuinely new interaction problem in the whole project, and it is upstream of
everything already designed. The seam (§3 of `PRODUCT-JOURNEY`) is the *engine room*. This is the
question the engine room is in service of.

---

## 2. The bias register — auditing the conference's list against this product

Behavioral design is only useful if you name the specific mechanism and its direction. The standard
catalogue (nineteen effects, in the form they were presented) is worth taking seriously — and worth
auditing, because **at least four of them are things a legal-aid product must never use**, and two don't
apply at all.

### 2.0 Before the list: the inversion trap

The instinct from a talk like this is *invert every bias toward the user.* That is wrong here, and
getting it wrong is how a legal product becomes a dark pattern.

Most of this literature studies biases **relative to a rational agent maximizing monetary payoff.** Priya
is not that agent. She is minimizing **regret, time cost, and stress**, subject to a real constraint she
cannot articulate. Under *her* utility function, ignoring a ₹8,999 claim may be perfectly rational —
which is exactly what **probability neglect** recommends.

So the rule is not "combat every bias." It is:

> For each mechanism, ask whether it is an error relative to *this user's* actual objective. Where it is
> an error, correct it. Where it is correct, do not exploit it — and do not "fix" it.

That test is what separates behavioral *design* from behavioral *nudging*, and it is the whole
ethical argument of this document in one sentence.

**A note on evidence quality, because it matters for the case study.** The list is not uniformly
well-replicated. Present bias, loss aversion, anchoring, the default effect, and the IKEA effect are
robust and safe to rely on. Probability neglect is well-supported. Decoy, zero-price, placebo, and
"social norm → market norm" are narrower, more contested, and largely derived from marketplace or
labelling contexts. **Building the case study on the weak four would be a credibility risk** — a
knowledgeable interviewer will notice. Use the robust mechanisms as load-bearing; treat the rest as
hedges.

### 2.1 The full audit

**Legend:** ✅ applies · ⚠️ applies, needs care · ⛔ forbidden in a legal product · ○ doesn't apply

| # | Mechanism | Verdict | In this product |
|---|---|---|---|
| 1 | **Legal consciousness failure** *(not on the list — the actual mechanism)* | ✅ | The harm is never framed as a legal problem. §1. This is the primary finding. |
| 2 | **Peak–End Rule** | ✅✅ | **The strongest strategic argument in the document.** Experience is judged by its peak and its end, not its average or duration. LokAI's peak *is* the refusal and its end *is* the handoff. This is why the seam must be the most designed screen and why the handoff packet matters: they are not decoration, they are the memory structure of the product. |
| 3 | **Social Norm → Market Norm** | ⛔ | Manufactures a duty from a description ("most people file" → "you should file"). A user who decides not to pursue a claim has violated nothing. This is the single most corrosive item on the list for a legal product. → banned in the gate. |
| 4 | **Frequent Repetition Bias** | ⚠️ | Double-edged and *already present*. Repeated `Illustrative · expert review pending` is good — repetition builds accurate suspicion. Repeated reassurance ("your matter is protected") would build false confidence. **Rule: repeat the caveats, never the reassurances.** |
| 5 | **Mental Accounting / Sunk Cost** | ✅ | ₹8,999 is booked in a separate mental account, so it "costs more" than it is. Worse: after drafting, escalation is driven by invested effort rather than merit. Two consequences — put the **proportionality check before the draft, not after**; and the seam **preserves the work** so a stop doesn't punish sunk investment with loss. |
| 6 | **Overconfidence Bias** *(the user's)* | ✅ | The user is the overconfident party: "the seller said it's fine," "it's obviously expired." This is why the verification gate must catch *user* error, not only model error — and why the existing conflict-stop ("two stories disagree") is behaviorally load-bearing. Also a second argument against percentage confidence: it amplifies the user's overconfidence rather than damping it. |
| 7 | **IKEA Effect** | ✅✅ | **Upgrades the verification gate from good practice to structurally necessary.** Self-made things are valued — and, more usefully, **checked**. A fact Priya typed in her own words gets checked; a fact LokAI extracted gets accepted. This is the behavioral reason the gate must take the user's words, not the model's. |
| 8 | **Anchoring** | ⚠️ | **The biggest hazard for an AI that produces numbers.** Whatever appears first anchors everything after. So the first thing on screen must not be a figure or a conclusion — open with the remedy, not with ₹8,999. **Order of presentation is a behavioral lever, not a layout preference.** |
| 9 | **Scarcity Bias** | ⚠️ | The limitation window is **mandatory as fact, forbidden as lever.** State the date and the consequence; never inflate. The statute-expiry stop is the honest version — the exact screen where this could go wrong, and it currently leans on loss language. |
| 10 | **Placebo Effect** | ○ | No treatment, so no placebo. The legitimate cousin is **perceived control**: people who believe they can pause, correct, and escalate handle stress better. That is a real reason for the controls — but call it control, not placebo. |
| 11 | **Decoy Effect** | ⛔ | A decoy requires engineering a dominated option to steer a choice. Choosing whether to pursue a legal remedy is not a preference space to be shaped. Filing routes must not be arranged so one looks good by association. |
| 12 | **Present Bias** | ✅ | "Two years from purchase" is a future cost avoided against a future benefit. Make it concrete, not merely correct: **eleven months, not "two years."** Second consequence: the verification burden is an immediate cost for a deferred benefit — which is exactly why the missing "I don't know" escape causes abandonment. |
| 13 | **Loss Aversion** | ✅ | Under-claim by default; but the product feeling protective also drives over-claim. The proportionality check serves both directions. |
| 14 | **Probability Neglect** | ⚠️ **inverted** | Small-expected-value cases get ignored — which is *correct* under most framings. **Do not combat this.** This is the item that proves the §2.0 test is doing real work, and it is the sharpest thing available for an interview: the discipline is knowing which "bias" is not one. |
| 15 | **Zero Price Effect** | ⚠️ | LokAI is free, so trust and uptake are disproportionate to the evidence. The cost of being wrong falls on the user; the benefit of being believed accrues to the product. That asymmetry is the behavioral case for the seam. Note the consequence: `PRODUCT.md`'s no-subscription, no-payment stance is a *trust-positioning decision*, not only a demo constraint. |
| 16 | **Default Effect** | ✅ | Already a LokAI law. "One primary CTA" sets a default; `draftAllowed: false` makes the default in high-risk paths **refusal**. Default-to-safe is a behavioral win. The inverse — defaulting toward filing — would be a nudge. This should be *named* as a behavioral law, not left implicit. |
| 17 | **Zeigarnik Effect** | ⚠️ | Legitimate use: a small, bounded, resolvable open loop ("one fact missing") creates productive tension that drives checking. The trap is the unbounded loop — a stop that leaves nothing actionable is demotivating. **So: keep the verification gap open, close every other loop.** |
| 18 | **Endowment Effect** | ✅✅ | Once her invoice, screenshots and photos are *in the locker*, they are hers. "The receipt trail doubles as the handoff packet" works precisely because those are her artifacts. And `preservedSummary` is endowment protection: losing your case file is a loss, not a null. Preservation is emotional infrastructure, not data hygiene. |
| 19 | **Projection Bias** | ✅ | "The seller will respond." "I'll deal with it next month." "This will take five minutes." All three are projection bias, and all three are the reason consumer cases quietly die. **Design consequence: give honest time estimates in days.** No shipped legal-AI product does this, and it is nearly free to add. |

### 2.2 What the audit produced

Four items are outright forbidden (3, 11, plus social proof and urgency framing from §3), two don't
apply (10, and most of the decoy literature), one must be deliberately *preserved* because it is
correct reasoning (14), and four are unexploited opportunities (7, 18, 19, and 2).

The opportunities cluster in one direction: **make the user the author of the inputs, the owner of the
evidence, and the judge of whether pursuing the matter is worth it.** Every legal-claim mechanism in
this catalogue that is safe to use works *for* that posture rather than against it.

---

## 3. The ethical hazard, stated plainly

The moment you design for recognition, you are one refactor away from a dark pattern. This is not
hypothetical — the pattern catalogue for AI chatbots is now formal.

- **CDT, *Dark Patterns in AI Chatbots: A Taxonomy to Inform Better Design*** (Centre for Democracy &
  Technology, 2026-05) catalogues **37 dark patterns** across general-purpose systems (ChatGPT, Gemini,
  Claude) and companion platforms. Documented examples include chatbot *encouraging users to disclose
  more personal information*, and *promising confidentiality that does not hold*.
- **EU AI Act Article 5** prohibits, in force since 2 February 2025, AI systems using subliminal,
  manipulative or deceptive techniques that materially distort behaviour and impair informed
  decision-making. No risk mitigation, no exceptions.
- The behavioural-design literature's own term for the dark twin of a nudge is **sludge**: friction
  added to block a behaviour the user wants.

For a legal product, the specific harms are:

1. **Encouraging a claim the user should not bring.** Pressure to file because the tool exists to help
   you file.
2. **Escalating a user's distress to justify engagement.** A scared person with a ₹8,999 mixer is the
   ideal target for retention mechanics. Every mainstream legal-tech product is exposed here.
3. **Social proof and false consensus.** "Most consumers claim" is a fabricated fact that manufactures
   confidence.
4. **Urgency framing.** Deadlines are real, but invoking them emotionally to prompt action is
   manipulation even when the underlying fact is true.
5. **Disclosure harvesting.** Asking for more of a user's private matter than the task needs.

**The distinction that governs everything:**

> In consumer software, behavioral design means *increasing a metric*.
> In legal aid, it must mean *improving the quality of the user's decision* — including when that
> decision is to do nothing.

These point in opposite directions, and that opposition is the design problem. LokAI is on the right
side of it only by construction, which is why the following section is not optional polish.

---

## 4. The new design surface — informed abstention

This is the addition. It is upstream of the seam and it is not in the current build.

### 4.1 The recognition surface

The user arrives with a *story*, not a *legal question*. "The mixer arrived broken and the seller isn't
responding." The interface's job in the first exchange is to do what no generic chatbot does: name the
category of the problem and the existence of a remedy, without asserting a conclusion the facts don't
yet support.

Not: "Your refund rights under the Consumer Protection Act, 2019 are…" (assumes the frame and the facts)
But: "A product that arrives damaged and a seller who won't replace it is a kind of problem Indian law
does address — the Consumer Protection Act, 2019. There's a route, and it starts with a written
request. Let me check what's actually possible with your facts."

This is a **recognition** move, and it is also an accuracy move: the "recognition" line must be
conditional on the gate cascade, never asserted by a persona. That is the line between a recognition
surface and a persuasion surface.

### 4.2 The proportionality check — the abstention move

The single most novel and most defensible thing LokAI could ship. **Before the CTA, state what pursuing
this is actually worth.**

> "For a ₹8,999 mixer, a District Commission filing costs ₹200–500 in fees plus your time, and awards
> here are usually modest. A written demand notice by registered post with acknowledgement due is
> nearly free, usually gets a response, and is what you'd file first. This is probably worth a letter
> and probably not worth a case."

That single paragraph does things no competitor's UI does:

- It **reduces over-claiming** — the failure mode that wastes people's money and time.
- It **increases trust**, because a product that tells you *not* to do something has a credible reason
  to say the other things.
- It is **the honest inverse of engagement design**, which in this market is the differentiator no one
  has claimed, because nobody wants to build the anti-product.
- It is *behavioural design applied to the user's benefit against the platform's interest* — and that is
  the exact thing a case study can be about.

The research basis is the loss-aversion asymmetry and Sandefur's finding that people handle these alone
and often disastrously, not from cost. If the true barrier is *framing*, not *cost*, then a product
that helps with framing but ignores proportionality is helping people file more cases — which may be
worse than the status quo, not better.

### 4.3 The escapes (behavioral defects already in the audit)

`BEHAVIORAL-AUDIT-2026-09-28.md` found the clarify turn has **no "I don't know" option and no skip**.
That is a behavioral defect before it is a UX defect:

- A user who cannot find their purchase date has **no legitimate exit**. The only paths are to guess, or
  to abandon the flow. Both are forced; neither is informed.
- Because the flow is forced, the fact they eventually confirm is not really *theirs*. The verification
  gate is only as honest as the user was free.

Adding "I don't know" and "skip for now" is therefore not a nicety — it is the precondition for the
verification gate's consent claim to be true. **Small change, large honesty payoff.**

### 4.4 Calibration consistency

The audit found the two-year limitation period is asserted as **flat fact** in the clarify turn and the
flashcards, while the statute-expiry stop correctly treats it as **undecidable**. Inconsistent hedging
is not a copy bug; it is a calibration bug. Users read inconsistent confidence as *the system doesn't
know what it's talking about* and fall back on their prior — which is usually "nothing can be done."

### 4.5 Name the channel on every stop

Also from the audit: escalation copy never names a concrete channel. 1915 and e-Daakhil appear only in
advice-class copy. Behaviourally, an unnamed next step is a dead end — the user has to spend the
motivation they just spent the interaction building. Name it, every time.

---

## 5. The uncomfortable finding — aesthetics raise the risk

This is the part nobody in the repo has written down, and it should be.

The **authority effect / algorithm appreciation** is the dominant behavioral risk in this product: a
fluent, confident, well-presented answer is processed as expert advice largely independently of its
content. LokAI's current work has made it *more* credible — faster, more material, more premium
(Vellum), more polished — and every one of those things increases the bias.

**Design consequence:** the seam, the register separation, the receipt, and the refusal's tonal weight
are not only ethics. They are the **correct behavioral intervention against authority bias.** Aesthetic
confidence is a *liability* in a domain where the audience is stressed and non-expert; the design has to
spend that confidence deliberately rather than let it leak into the answer's credibility.

This inverts a normal portfolio instinct — normally, polish and honesty are separate tracks, and polish
wins because it is visible. Here they are the same track, pulling opposite ways. **Naming that tension
in the case study is stronger than either track alone.**

---

## 6. The enforceable version: a behavioural gate

The repo's strongest and most hireable idea is that **design law is executable code** — a raw-style
ratchet that only falls, a WCAG contrast gate that fails the build. Behavioral design currently has no
such gate anywhere in the industry.

`scripts/verify-behaviour.mjs` would make the restraint mechanically enforced:

- **Banned (build fails):** urgency or pressure language tied to a real deadline; social-proof or
  consensus claims about filing ("most consumers…", "thousands have claimed"); countdowns; any framing
  that inflates a loss; disclosure requests beyond the facts the decision needs; "continue anyway"
  styled as a primary action on any stop.
- **Required (build fails if absent):** every stop names a concrete human channel; every consequential
  CTA is preceded by a proportionality line; every claim-bearing surface carries the ledger.
- **Reported (warn only):** hedges that are inconsistent between surfaces — the §4.4 class of bug.

This answers *"how is this different from everyone else"* in a way that is not a screenshot, it is a
command that fails. It is also the one artifact here that no Figma portfolio and no competing product
has. It is the behavioural-design version of `ui-debt.json`.

---

## 7. The Indian context, specifically

Two things hold beyond the US evidence, and one of them is LokAI's real P0.

**Institutional friction is real and measurable.** The India Justice Report's *Consumer Justice Report
2026* (released March 2026) is the first data-driven assessment of India's three-tier District / State /
National Consumer Disputes Redressal Commissions under the CPA 2019, built largely from RTI inquiries
and parliamentary responses — budgets, infrastructure, human capacity. Multiple studies on rural consumer
awareness report persisting low awareness of the redressal mechanism. The routing advice LokAI already
prints (`1915`, e-Daakhil, District Commission) is therefore not a footnote; it is the highest-value,
least-known output the product gives.

**Language is the recognition barrier.** If the barrier to legal framing is cognitive (§1), then for a
user who does not read English legal vocabulary, the barrier is *linguistic* — and it is a hard gate, not
a friction. `BEHAVIORAL-AUDIT-2026-09-28.md` found the compounding defect: typed Hindi/Marathi/Tamil
input deterministically returns the **English** boundary-stop refusal, and the onboarding language choice
never reaches the engine. So the designed multilingual arc — which *is* fully translated and *does*
route correctly on deep-link — is unreachable from the front door.

This is worth stating plainly for the case study, because it is an uncomfortable and therefore
distinguishing claim: **in this domain the language barrier is not a localisation problem, it is a
recognition problem.** A user who cannot read the answer does not merely fail to get help — they
conclude they have no problem worth having. Localization is therefore part of the trust architecture,
not a polish layer. (Note honestly: this is an inference from combining Sandefur's recognition finding
with the verified language defects. It is not itself a studied finding, and should be presented that
way.)

---

## 8. The case-study problem statement, rewritten

The current one asks how to make AI trustworthy. That is an interface question. The behavioural framing
asks something upstream:

> **Most people never recognise that they have a legal problem, and most legal-AI products are built for
> the minority who walk in already knowing. This project asks what an AI for legal aid should do with
> the space between "something bad happened" and "this is something I can act on" — including, and
> especially, telling people when an action is not worth taking. The design constraint is that every
> behavioural technique used must improve the quality of the user's decision rather than the volume of
> the platform's engagement, and that distinction is enforced in the build, not asserted in the copy.**

Four beats, each with its own artifact:

1. **Recognition** — the interface names the problem category and the existence of a remedy, conditionally.
2. **Proportionality** — the interface says what pursuing this is actually worth, before asking.
3. **The seam** — when it can't own the answer, it says so with a receipt and hands off with the work intact.
4. **Enforcement** — a behavioural gate that fails the build on nudge patterns.

---

## 9a. Naming mechanisms without pointing at the mechanism

The bias labels are for the designer's reasoning, never for the user-facing copy. `"deficiency"`,
`"optimism bias"`, `"anchored on the invoice amount"` — none of these belong in an interface aimed at a
stressed, non-specialist user. They belong in `docs/`, in code comments, and in the interview.

The exception is the behavior itself: LokAI should *do* the useful thing those biases enable (help the
user build their own case, own their own evidence, notice the deadline) without *labelling* it. The user
experiences an interface that respects them, not a system that has read a paper about them.

This is also why §2.0's inversion trap is a live risk in the codebase: naming biases in comments is
exactly how a team starts "correcting" one and drifts into nudging. The gate in §6 is the check.

---

## 9. Build list (adds to, does not replace, the existing order)

P2 (the engine) is still the gate for everything — receipts must be computed, and the recognition and
proportionality lines are *also* gate output, not authored copy. In order:

| # | Change | Why | Size |
|---|---|---|---|
| 1 | **"I don't know" + skip escapes on the clarify turn** | Precondition for the verification gate's consent claim being true | ~0.5 d |
| 2 | **Concrete channel named on every stop** (1915 / e-Daakhil / legal aid) | An unnamed next step is a behavioural dead end | ~0.25 d |
| 3 | **Limitation hedging made consistent across surfaces** | Inconsistent confidence → fallback to prior → "nothing can be done" | ~0.25 d |
| 4 | **Proportionality line on consequential CTAs** | The abstention move — the most novel and most defensible thing here | 1 d |
| 5 | **Recognition line, gate-conditional** | The upstream design problem | 1.5 d (after P2) |
| 6 | **`scripts/verify-behaviour.mjs`** | Makes the restraint mechanical; the strongest interview artifact | 1 d |

Items 1–3 are small and can precede P2. Items 4–5 are gate output and must follow it. Item 6 can be
built any time and will *find* inconsistencies in the copy as soon as it runs.

---

## 10. Interview narrative

**If asked "what's your thesis?"**
> *"Most people never frame their problem as a legal one — that's the finding that reorganised this
> project. So the question isn't how to make AI trustworthy for someone who already knows they have a
> claim. It's what an AI should do in the gap between 'something bad happened' and 'I can act on this'.
> Including telling people when acting isn't worth it. In this domain the boring metric is engagement
> and the right one is decision quality, so I built a gate that fails the build on nudge patterns."*

**If asked "isn't behavioral design just manipulation?"**
> *"In most products, yes — behavioural design means moving a metric. In legal aid the whole question is
> whether the technique improves the user's decision or the platform's engagement, and those point in
> opposite directions. That's why the proportionality line exists: the product tells people when not to
> file. It's also why there's a build gate, because a stated ethical principle with no enforcement is
> just copy."*

**If pressed on the tension in your own work**
> *"The visual craft raises the risk. A more polished, more confident product reads as more expert, and
> in a stressed non-expert context that's an authority effect. So the restraint isn't decorative ethics —
> it's the actual countermeasure to the bias my own design work amplifies. I'd rather show that tension
> than hide it."*

---

## 11. Honest limits

- **Sandefur's research is US-based** (n=668, one Midwestern city, 2013 survey) and was not
  replicated for India. The recognition finding is a well-supported mechanism, not a measured Indian
  statistic. Do not present it as one.
- The recognition-beyond-language inference in §7 is an **inference**, not a studied finding.
- Nothing here has been validated with users. The proportionality line in particular is a **hypothesis
  derived from research**, and the honest move is to say so and propose the test — the same standard
  already applied to the latency work in `PRODUCT-JOURNEY` §7.
- `BEHAVIORAL-AUDIT-2026-09-28.md` remains the authority on implementation defects. This document does
  not supersede it; it explains why several of its findings are behavioural, not cosmetic.

---

## 12. Sources

- Sandefur, R. L. — *Accessing Justice in the Contemporary USA*, American Bar Foundation / Community
  Needs and Services Study (n=668, in-person survey; presented ABA 2014). Findings: 46% self-resolved,
  16% did nothing, 16% family/friends only, 22% third party; cost rarely cited; 47% significant
  negative consequence, 27% health impact.
- Sandefur, R. L. — *Civil Legal Needs and Public Legal Understanding*, American Bar Foundation (2023).
- Legal Services Corporation — *The Justice Gap Report* (2022, with NORC): 86% of reported civil legal
  problems among low-income Americans received inadequate or no help.
- Centre for Democracy & Technology — *Dark Patterns in AI Chatbots: A Taxonomy to Inform Better
  Design* (2026-05-29). 37 patterns; documented disclosure-encouragement and false-confidentiality
  examples.
- European Union — AI Act, Article 5 (prohibited manipulative / deceptive / exploit-vulnerability
  practices; in force 2025-02-02).
- India Justice Report — *Consumer Justice Report 2026* (March 2026); RTI-based assessment of the
  three-tier consumer dispute redressal system under the CPA 2019.
- National Consumer Helpline, Dept. of Consumer Affairs, GoI — grievance registration in 17 languages
  via toll-free 1915; e-Daakhil portal (e-filing for National/State/District Commissions).
- Thaler & Sunstein, *Nudge*; Evans & Sutherland, *Sludge* — the nudge/sludge distinction.
- Ellsberg, D. (1961) — ambiguity aversion; Kahneman & Tversky (1979) — framing and loss aversion.
- Automation bias in high-stakes domains: *Exploring automation bias in human–AI collaboration: a
  review*, Int J Soc Comput (Springer, 2025), which names law and public administration explicitly.

---

## 13. Verdict

Behavioural design does not replace the seam thesis. It **explains** it, and it supplies the one thing
the project was missing: an upstream problem statement and a falsifiable novel claim.

The claim is not *we designed a novel interaction.* It is: **we identified that the dominant failure in
this domain is a decision never made, we designed an interface for the gap before the decision, and we
wrote a build gate that fails the project if the interface starts pushing instead of informing.**

That is defensible in an interview, traceable to files in the repo, and — unlike most novelty claims —
does not depend on anybody believing that restraint is a cool look.