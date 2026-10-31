# The LokAI Decision Layer — System Blueprint & Case-Study Playbook

**Document type:** publish-ready design specification for the LokAI prototype (Lokaifm-main) and its portfolio case study
**Date:** 2026-09-21 · **Version:** v1.0 · **Repo state:** all file references verified against the 2026-09-21 repository audit

## What this document is

LokAI is a deterministic, zero-network prototype of an Indian legal-triage assistant — a portfolio case study about how an AI product earns trust in a market that can least afford a mistake. This blueprint completes the prototype's core move, from *scripted* trust to *executable* trust, in three layers: the decision engine that computes every response from matter state (Chapter Z), the layered guardrail stack that bounds what the product may say, draft, or file (Chapter X), and the case-study playbook that turns that system into a story a recruiter or senior engineer can verify in under a minute (Chapter Y).

## How to read it

| Part | Chapter | Audience | What it gives you |
|---|---|---|---|
| I | **Chapter Z — The Decision Engine** | the builder | core types, gate cascade G1–G9, wiring into the existing repo, build-gate extensions, five implementation phases, the model seam |
| II | **Chapter X — The Guardrail Stack** | the builder + reviewer | layers L1–L9 (1:1 with the gates), the refusal ladder, scenario traceability matrix, seven design invariants |
| III | **Chapter Y — The Case-Study Playbook** | the storyteller | story spine, one-trust-claim-per-section map, four sub-30-second embed demos, interview talking points, answers to the six hard questions, naming |

## Design commitments (read before anything else)

1. **The decision layer is LokAI's own product thinking.** This document deliberately names no external frameworks, vendors, or research artifacts. The system stands entirely on its own vocabulary: *decision receipts*, *the refusal ladder*, *why LokAI stopped*, *the escalation ladder*.
2. **Everything specified is implementable inside the prototype's enforced boundaries** — no network, no live model, no fabricated confidence — and every existing repo gate (determinism, contrast, no-fetch, status vocabulary) stays green.
3. **Nothing here overclaims.** The prototype generates no prose and says so once, plainly, in its boundaries panel. The contract specified here is exactly what would let a live model enter later — without changing a single user-facing promise.

---
