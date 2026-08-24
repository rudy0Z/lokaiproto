# Interactions

## Components

`DemoInput`, `DemoProgress`, `GuardrailNotice`, `LegalTerm`, `LegalTermDialog`, `LegalTermPanel`, `SourceBasis`, `ReviewGate`, and `AuditTrail`.

## State transitions

- Idle → analysing when a sample is selected.
- Analysing advances through four fixed progress labels, then resolves to its scenario result.
- Self-service result may open explanation, draft preview, source detail, or legal term.
- Review-recommended result may collect the one scripted fact, switch to a safer scenario, or stop.
- Human-help-required result permits summary review only.
- Correcting a fact appends an audit event and recomputes affected claims, source links, and allowed actions.

## Triggers

- Sample prompt, sample notice, sample voice, quick scenario card, fact confirmation/correction, legal-term click, source click, review checkbox, retry.
- No hidden time-based transitions except deterministic progress; each has an announced status and can be skipped by reduced motion.

## Data

A shared `DemoScenario` record owns matter facts, user message, response sections, evidence, source mappings, policy tier, allowed actions, glossary keys, and timeline events. The active scenario ID, stage, selected legal term, language, and user confirmations live in `DemoContext`.

## Failure behavior

- Missing fact: ask one concrete question; block dependent draft.
- Official source unavailable: label the gap; show the general information used; block decisive action.
- Conflicting rules: show both source cards; remove the recommended action.
- High-risk signal: stop self-service drafting; preserve summary and evidence checklist.
- Out of scope: explain the boundary and offer supported examples.
- Temporary demo failure: preserve the selected sample and provide Retry.

## Motion

- 120 ms hover/press feedback, 220 ms state fades/slides, 280 ms dialog entry.
- Animate opacity and transform only.
- Progress does not exceed roughly 1.6 seconds total.
- `prefers-reduced-motion` resolves immediately and removes nonessential transitions.

## Edge cases

- Long translated strings wrap without clipping.
- Dialog works at 320 px width, with browser zoom, keyboard-only input, and screen-reader naming.
- A legal term occurring more than once maps to one glossary entry.
- Unknown scenario IDs safely resolve to the default consumer-refund scenario.
- Deep-linked stages cannot bypass a review gate.
- Refresh restores only non-sensitive demo identifiers, never user-entered legal content.

## Gate

PASS — Every trigger, transition, data dependency, policy outcome, failure, motion rule, and edge case is implementation-ready.

## Uncertainty, permissions, and fallback

The prototype requests no browser or OS permissions and performs no network calls. Uncertainty is represented with concrete missing/disputed facts and source support states, not model confidence. The fallback for every sample modality is the same prepared scenario record. Unsupported or high-risk outputs stop at a summary; no draft, filing, or legal recommendation is generated.
