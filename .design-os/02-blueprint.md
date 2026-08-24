# Architect

## Sitemap

- Desktop: Matter overview, guided conversation, sample notice, reviewed draft, case files, settings.
- Mobile: Home, current case, files, help/settings.
- Shared demo states: clear consumer case, missing fact, source gap, conflicting rules, high risk, out of scope, temporary failure.
- Shared support surfaces: plain-language legal glossary, source details, audit history.

## Primary flows

1. Select a suggested prompt or sample input.
2. Show deterministic progress: understand issue → check facts → review sources → prepare answer.
3. Route through the policy tier:
   - Self-service: explain, plan, and prepare a review-gated draft.
   - Review recommended: ask for a fact or disclose a source/rule gap; withhold decisive drafting.
   - Human help required: preserve the summary and stop self-service action.
4. Allow corrections to invalidate and recompute dependent output.
5. Explain unfamiliar legal terms on demand.
6. Preserve the same matter facts, evidence, sources, and audit events across mobile and desktop.

## Navigation

- Compact mobile: four-item bottom navigation for Home, Case, Files, Help.
- Tablet/medium: navigation rail using the same destinations.
- Desktop: persistent sidebar with current matter continuity and case tools.
- Stateful scenes remain deep-linkable through scenario and stage query parameters.

## Screen hierarchy

- Primary: current user decision, current guardrail state, and one permitted next action.
- Secondary: plain-language legal explanation and source basis.
- Tertiary: evidence detail, audit trail, and demo metadata.
- Desktop right panel owns source details and selected legal-term explanations.
- Mobile legal terms open an accessible compact dialog; complex decisions use a bottom sheet only when more space is required.

## Scope

Build:
- One complete consumer-refund matter.
- Seven deterministic guardrail demonstrations.
- Sample voice and notice interactions with no device or network access.
- One shared scenario, matter, source, glossary, language, and event model.
- Plain-language copy, WCAG 2.2 AA foundations, and responsive navigation contracts.

Do not build:
- Authentication, subscriptions, payments, lawyer marketplace, production storage, live APIs, real OCR/STT/TTS, real uploads, or claims of supporting complete legal domains or 12 fully localized languages.
- Additional end-to-end matters.
- Automated legal certification.

## Build order

1. Define product/design context and shared typed scenario/glossary records.
2. Implement deterministic engine and provider.
3. Replace live chat, voice, and notice input adapters.
4. Unify mobile and desktop matter presenters.
5. Add legal-term explanation interactions.
6. Remove unsupported routes and claims.
7. Normalize tokens, fonts, copy, semantics, and responsive behavior.
8. Add deterministic guardrail and zero-network verification.

## Gate

PASS — The blueprint defines one source of truth, device-appropriate navigation, explicit build and non-build scope, and a sequenced deterministic demo flow.
