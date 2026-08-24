# LokAI prototype contract

LokAI is a fully visual, deterministic prototype showing how an AI legal guide can help a first-time user understand a consumer-refund issue without pretending to replace professional advice.

## Demonstrated story

Priya bought a damaged mixer grinder for ₹8,999. The seller refused a replacement. LokAI helps her organise the facts, understand the general consumer-protection basis, prepare a complaint draft, inspect its sources, and review every claim before use.

The same prepared matter appears on desktop and mobile. Additional selectable scenes deliberately demonstrate missing facts, a source gap, conflicting rules, a high-risk stop, an out-of-scope request, and recovery from a temporary failure.

## Product boundaries

- No live AI, OCR, speech, upload, authentication, payment, subscription, storage, lawyer marketplace, or external API.
- Sample notice and voice interactions are animations backed by prepared data.
- No capability claims beyond the scripted examples.
- Legal records are labelled `Illustrative · expert review pending` until qualified review.
- The interface provides legal information, not legal advice.

## Navigation

- Compact mobile: bottom navigation.
- Tablet: navigation rail.
- Desktop: sidebar, central matter workspace, contextual right panel.

## Content principles

- Plain language before legal terminology.
- Explain unfamiliar legal terms where they appear.
- State what is known, missing, disputed, and source-supported.
- Use hybrid response modes: clarify, explain (three-zone), disclose, stop, confirm, progress, recover — never force every turn into three zones.
- Stop or request review when the evidence does not support a safe next step.
- Keep the user in control of every prepared draft or action.
- Prepared multilingual packs (EN / HI / MR / TA) for the consumer matter; no live translation claims.

## Success criteria

The prototype succeeds when a reviewer can complete the consumer-refund story, trigger every guardrail state, understand why LokAI stopped or proceeded, inspect simple legal-term explanations, and observe zero network or device-permission requests.
