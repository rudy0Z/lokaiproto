# LokAI — Empathy Maps

> Repo: `D:\portfolio porjects\Lokaifm-main` (branch `feature/single-matter-guardrails`) · Documented 2026-09-16.
> **Basis & honesty note:** no user interviews exist. Maps are **inferred** from the authored persona (Priya, `PRODUCT.md` demonstrated story), the status vocabulary's stated philosophy ("a badge is a word a stressed person reads in passing"), the stop-state design intents (`docs/MOBILE_AI_SYSTEM.md` §3.4 calls the 8 refusals "the case-study money shot"), and the clarify-middle rationale (audit F1). "Says" = the voice the design writes in, not field data. Companion: [01-user-journey-map](01-user-journey-map.md).

## Personas identified from the product design

| Persona | Role | Stake | Source |
|---|---|---|---|
| **P1 — Priya, the first-time user** (primary) | Consumer with a refund dispute; not legally literate; stressed | ₹8,999, fairness, not being cheated twice | `PRODUCT.md` demonstrated story |
| **P2 — The reviewer / evaluator** | Checks whether the system earns trust and knows when to stop | Professional judgment (also stands in for "lawyer who should check") | `PRODUCT.md` success criteria; demo guardrail scenes |
| **P3 — Priya's non-English self** | The same user in HI/MR/TA | Equal access to the same truth | language packs + localization integrity rule |

---

## P1 — Priya, the first-time user

**Context (inferred):** phone-first, mid-problem, seller has refused in writing, time-boxed patience, may share the phone with family, legal system = intimidation. She needs an outcome, not an education — but the design gives her both in citizen words.

### Says (the voice the design writes)
- "I bought a mixer grinder for ₹8,999. It arrived damaged and the seller refused a replacement. What can I do?" (her literal authored opening)
- "The marketplace says its private return policy overrides my rights." (the power-asymmetry worry)
- "Needs a check" · "Gathered" · "A lawyer should check" — the words she reads, never `review_recommended` (`statusVocabulary.ts`: "citizen voice wins")
- "This is outside LokAI's scope." — the sentence that, said honestly, buys trust

### Thinks
- *Is this thing a lawyer? Can it get me in trouble?* — the fear the boundary labels answer ("Illustrative · expert review pending").
- *Did I even buy it when I think I did?* — the disputed purchase-date fact makes her own memory part of the UI.
- *Why is it asking ME?* — the clarify middle flips the script: the AI asks one question because her answer routes the next step.
- *If I fix a fact, is the draft still valid?* — the system already answered: corrections clear approval, audited.
- *What happens when I'm wrong about the big stuff?* — the high-risk stop exists for exactly this thought.

### Does
- Photographs the official notice instead of deciphering it (founding-feature flow).
- Confirms/corrects fact chips; taps glossary terms where they appear (CPA 2019 explained in place).
- Follows the six-segment rail instead of a scroll of advice.
- Switches to Hindi mid-matter when the English fatigues her.
- Prints/copies the demand notice only after approving it.

### Feels
| High | Low |
|---|---|
| Control when her own facts sit in a table she can correct | Dread at official paper (the notice) — until interpreted |
| The trust peak at a respectful refusal (the stops) | Vulnerability reviewing a draft in her voice |
| Empowerment at filing with a tracking deadline | Guardedness at onboarding (designed away: zero permissions, audited) |

### Pains / Gains
- **Pains:** being cheated twice (seller + her own mistakes); legalese; AI overconfidence; systems that never say no; fake progress bars.
- **Gains:** one real question before the first answer; her words for every status; drafts that can't outlive their facts; refusals that carry paths.

---

## P2 — The reviewer / evaluator (and the lawyer behind her)

### Says
- "Complete the consumer-refund story, trigger every guardrail state, understand why LokAI stopped or proceeded." (the success criteria, verbatim)
- "Example — verify with a lawyer." (the review label carried on legal records)

### Thinks
- *Where are the edges?* — /dev indexes every screen, state, and specimen; guardrail scenes are one tap away.
- *Does it hold up in another language?* — ?lang=hi/ta/mr deep links; the coded rule "a localized question must never route to an unlocalized answer".
- *What does the system know about itself?* — the audit trail replays every mode switch and approval.

### Does / Feels
- Switches the six guardrail scenes from the drawer; inspects specimens on bare canvas (`/specimen/:id`); reads the audit list. Feels: professional respect for a system that displays its own limits — the disclosure is persistent, not buried.

---

## P3 — Priya's non-English self

### Says
- The same ₹8,999 story in Hindi, Marathi, or Tamil — prepared, not machine-translated on the fly.

### Thinks
- *Will it switch back to English when it matters?* — the integrity rule answers: no.
- *Are legal terms explained in MY language where they appear?* — that's the pack contract.

### Does / Feels
- Sets language at onboarding; changes it in Settings (drawer) or via deep link. Feels: the difference between an app that was translated *at* her and one that was written *for* her.

---

## Cross-persona insight (quotable)

The maps collapse into one sentence: **LokAI treats a stressed person's attention as the scarce resource** — one question before one answer, her words for every state, her corrections outranking its drafts, and refusals that respect her enough to explain themselves. Trust here is not a tone; it is a set of coded behaviors the reviewer can trigger one by one.
