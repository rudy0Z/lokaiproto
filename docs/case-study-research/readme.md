# LokAI — Case-Study Research Set

> Internal working documentation for building the portfolio case study (the "trust study"). Generated 2026-09-16 from the latest code in this repo (branch `feature/single-matter-guardrails`). Analysis only — no screens or code were changed.

## What's in this folder

| Doc | Contains |
|---|---|
| [01-user-journey-map.md](01-user-journey-map.md) | Priya's day-one journey (10 stages + emotional curve — the trust peak is a refusal), stress-case journey, notice-moment journey, reviewer's pass, pain→answer index |
| [02-user-flows.md](02-user-flows.md) | 7 flows as mermaid diagrams: clarify middle, six-stage matter journey, stop states, disclose states, notice interpretation, draft approval & audit, failure recovery |
| [03-empathy-maps.md](03-empathy-maps.md) | Says/Thinks/Does/Feels for Priya, the reviewer, the non-English self — **inferred, no user research exists** |
| [04-information-architecture.md](04-information-architecture.md) | Desktop + mobile shells, drawer-is-the-nav model, five-slot screen grammar, full screen inventory (LOK-*), the data model that *is* the IA |
| [05-state-path-catalog.md](05-state-path-catalog.md) | DemoContext global state, journey machine, the 8-stop guardrail machine, conversation machine, navigation paths, cross-reference |

## How to use the IDs

- **LOK-M*/D*/S*/X*** = canonical screen/surface IDs (defined in 04 §3, reused everywhere).
- **Stage IDs** (`intake…audit`) and **FailureKinds** (the 8 stops) are the state vocabulary — quote them as-is.
- Scenario IDs (`consumer`, `missing_fact`, `source_gap`, `conflicting_rules`, `high_risk`, `out_of_scope`) name the six authored guardrail scenes.

## Top case-study-ready insights (quotable)

1. **"Citizen voice wins"** — one file (`statusVocabulary.ts`) owns every state-to-word mapping, tone travels with the label, and the rule is written in its header: a badge "says the thing in their words, not the system's". `review_recommended` never renders; "A lawyer should check" does.
2. **The clarify middle (audit F1)** — the conversation's first beat is one real question ("LokAI needs one detail"), once per conversation, then straight routing; the code comments record it as a deliberate audit fix.
3. **The 8 refusals are the money shot** (named so in `MOBILE_AI_SYSTEM.md` §3.4): missing facts · source gap · conflicting rules · high risk · out of scope · unreadable document · uncertain language · model timeout — each with a reason and a path; `draftAllowed: false` exactly when it should be.
4. **Drafts cannot outlive their facts** — any fact correction clears draft approval, and every such event lands in an append-only audit trail (also: "No network or device permission requested", audited from minute zero).
5. **The drawer is the whole nav** (2026-08-27 call): chat-first, the active matter's live status lives inside navigation; the stage rail is "six segments, not a percentage — the product never fakes progress."
6. **Localization integrity is coded**: "a localized question must never route to an unlocalized answer" (`resolveClarify`), with prepared EN/HI/MR/TA packs — not live translation claims.
7. **Embed honesty by design**: hash router chosen so portfolio deep links (`#route`, `embed=1`, `?lang=`) survive; `/specimen/:id` renders single components for case-study embeds; `/dev` indexes every state.

## Positioning alignment (from latest copy draft)

- This is **the trust study**: straight points, strong visuals; every section = one trust claim + the artifact that proves it + the receipt. Deliberately the shortest, cleanest read of the three (~1,800–2,000 words).
- Draft to satisfy: `D:\Portfolio\case-study-copy\lokai-copy-v4.md` ("for audit before publishing"; supersedes v3 when approved).
- Product boundaries to keep (PRODUCT.md): no live AI/OCR/speech/upload/auth/payment; "legal information, not legal advice"; records labelled `Illustrative · expert review pending`.

## Open questions / flags for Rudraksh

1. **triage / retrieve stages** exist in the `WorkflowStage` type but have no dedicated observed mobile surface — confirm intended visibility before the case study names them.
2. **lokai-copy-v4 is awaiting your audit** — this doc set is aligned to v4's trust-in-a-sensitive-market frame; reconcile if v4 changes.
3. **`docs/CASE-STUDY.md` says copy lives at v3** while the portfolio repo has v4 — one of them is stale; the repo doc should be repointed at v4.
4. Voice (`MobileVoiceActive`, `voice-capture`/`voice-unclear` specimens) is an animation over prepared data — keep the PRODUCT.md boundary wording when showing it.
5. Empathy maps and journey emotions are inferred from authored design intent — reconcile if real user research exists.
6. Desktop chat clarify wiring was landed during the 09-14/15 sweep (commit f6f36b6) — spot-check the desktop clarify empty state if the case study shows desktop.
