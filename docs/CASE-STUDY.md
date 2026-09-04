# Writing the LokAI case study — sources, reasoning, and the decision inventory

**Status:** v3 content draft complete, awaiting the owner's section mix. Copy lives at `D:\Portfolio\case-study-copy\lokai-copy-v3.md`; this document records *how it was written and why* — every reasoning and point — so the final pass can be defended and the choices reversed deliberately if needed.
**Related:** `D:\Portfolio\CASE_STUDIES.md` (the contract) · `D:\Portfolio\PRODUCT.md` (voice/truth-first) · `app/projects/lokai/page.tsx` (the stale v1 implementation this will replace).

---

## 1. The deliverable chain

The case study is downstream of the prototype in a specific way: **the prototype is the evidence; the case study is the argument.** The contract (`CASE_STUDIES.md`) fixes the shape — three reading speeds stacked physically down the page (15s hero → 60s scan → full walkthrough), every deep section on the identical **Tension → Decision → Proof** skeleton, and the payoff slot rotating between three types because there are no metrics and faking them reads junior:

1. **Proof** — an embedded, running fragment of the real prototype (something the reference portfolios structurally cannot do)
2. **Failure state** — what the design does when things go wrong (juniors never show it; seniors check for it first)
3. **Trade-off receipt** — what was at stake, what I chose, **what I gave up** (the primary substitute for metrics as a signal of seniority)

The ≤2,500-word body budget forces the real work to happen before writing: deciding which of the ~50 decisions in the product earn sections. That triage is Appendix A of the v3 draft.

---

## 2. Source history — three versions and what each got right

| Source | State | What it contributed | What it got wrong |
|---|---|---|---|
| **Coded page** `app/projects/lokai/page.tsx` (545 lines) | Shipped; last touched before the rebuild | The component vocabulary — `CaseStudyShell/Hero/Scan/Scene/Comparison/DesktopShowcase`, `DecisionStoryCard`, `CaseCallout`, `ExpandablePrototype` — and the section rhythm | Documents the *pre-upgrade* product: "defective phone" (the mixer desync), 4-step wizard journey, failures framed as "When It Breaks", zero mention of the response modes, notice interpreter, voice, or dark mode |
| **v1** `case-study-copy/lokai-copy.md` | Draft, not implemented | Sentence-level tightening; honest boundary text; the research-boundary callout kept for making a *different* point than the hero disclaimer | Same skeleton as the coded page — a copy pass on a stale structure |
| **v2** `case-study-copy/lokai-copy-v2.md` | Draft, not implemented | The structural fix: founding thesis leads, the "accountability layer" section (ResponseMode + 8-way taxonomy), 4→8 stops, cut the boilerplate "How I Built It" | Written when the mobile rebuild was still open — its own "open questions" flagged that the mobile evidence didn't exist yet |
| **v3** `case-study-copy/lokai-copy-v3.md` | Current draft | Resolves every v2 open question with shipped evidence; adds the clarify middle, voice section, D-04 (dark/L8); component-level embeds via `/specimen/:id` | — |

The pattern across versions is the one `CASE_STUDIES.md` §12 names: **the prototype kept building faster than the case study claimed.** v1 underclaimed a flow; v2 underclaimed a system; v3 finally documents the shipped thing.

---

## 3. v3 — every change from v2, and the reasoning

### 3.1 All of v2's open questions resolved by the build

| v2 open question | Resolution |
|---|---|
| "NoticeInterpret in-chat is not built — the hero leans on it" | **Built** (Phases 2 + 5 of the screen work; see `components/mobile/NoticeInterpret.tsx`). The hero's framing is now backed by live evidence: `/mobile/notice?doc=bmc-property-tax&open=1` |
| "Voice specimens not built" | **Built**: `voice-capture` (loop) and `voice-unclear` in `dev/specimens.tsx` |
| "Onboarding not built" | **Built**: `/mobile/onboarding` with the coded hero |
| "Prototype readiness — partly legacy" | The seam closed in Phase 6; every mobile surface is on the primitives |

This is why the v3 hero can lean on the notice interpreter without softening — the founding-thesis scene ships.

### 3.2 The hero visual is the notice reader — reasoning

The opening frame has one job: make the founding thesis visible in a single static crop. Three candidates existed:

- **The verify gate** (v1/v2 hero) — the safety story, but it opens the page mid-confirmation, before the reader knows why confirmation matters.
- **The clarify turn** — most representative of the new conversation thesis, but a question mark is a weak static frame; it needs motion to land.
- **The notice reader** — *the founding scenario in one screen*: a Marathi BMC demand notice translated to plain words, with the amount/deadline/section surfaced and tappable back to the clause. Chosen. The thesis *is* the notice; everything else explains how the app earns trust after it.

### 3.3 The journey went 4 → 5 scenes — reasoning

v1/v2 told the journey as intake → verify → assess → act. The rebuilt product has a different arc, and the difference *is* a decision story:

1. **Describe** — the conversation has a middle: visible working stages, then the clarify question whose answer routes the next turn (in-window → explain; >2 years → statute stop; unsure → disclose). One question, three policy outcomes — the chat asks and *uses* the answer.
2. **Verify** — unchanged thesis, now with the mixer-not-phone facts and the conflict flag.
3. **Assess** — serif answer + one quiet provenance line → claim ledger.
4. **Act** — notice-as-paper + consent gate + Peak-End checklist.
5. **Evidence** — exhibits-not-files, the conflicting exhibit reachable. New scene: it shows the matter as a system of proof rather than a chat transcript.

Scene 5 is the most cuttable if length bites, but it earns the "structured as a matter" claim.

### 3.4 A new voice section — reasoning

Voice was always positioned as the accessible door (typing legal terms in Devanagari on a phone is genuinely hard; India is a voice-first market), but v2 had no proof. The section now stands on two shipped trust moments — **editable-before-commit** (the transcript is a textarea with the facts as chips; tapping a chip selects the user's own words in it) and **refuse-to-guess** (unclear audio → retry or the typing door, never a confident wrong input). The simulated amplitude envelope is disclosed in the caption — a prototype that requests no microphone has no business pretending otherwise. That disclosure is a truth-first feature, not a hedge.

### 3.5 D-04 added — reasoning

Dark mode earned a decision card because it is a *systems* decision, not a palette swap: the refusal screen is defined by being the tonal opposite of its surroundings, and a naive inversion would have erased the refusal inside a dark app. The chosen mechanism ("the cream becomes the ink"; the stop re-points to warm cream, direction flipped, relationship constant) and the rejected one (charcoal inversion → generic dark SaaS) are both nameable, and the trade-off is real: two palettes to contrast-check across four scripts — paid once, mechanically, via the build gate. If four cards breaks the "three decisions" rhythm across the three case studies, the fallback placement (prose inside the accountability section) is noted in the draft.

### 3.6 The desktop showcase was cut — reasoning

v1/v2 kept one desktop embed (the source trail). With desktop now an explicit follow-on stage and the mobile app complete, that frame was the *lowest-quality* image on the page arguing against the *highest-quality* claim (mobile-first completeness). Cut, with a note to restore when the desktop stage lands. The "Surface" meta row now reads `Mobile-first · iOS-pattern chat + guided tools`.

### 3.7 Component-level embeds became the default proof — reasoning

The v1 page's `DecisionStoryCard` previews embedded **full screens at 240px**, which renders LokAI's 14px body at ~8.6px — the three most important decisions were illegible thumbnails. The prototype's `/specimen/:id` routes (with `?label=0` stripping the self-label for capture) render a single component at natural size. So every `uiPreview` in v3 points at a specimen — `verification-scratchpad`, `grounding-meter`, `review-gate` — giving recruiters the real component, legible, still live. Full-screen embeds remain for the journey scenes where context is the point. The full route→slot map is Appendix B of the draft.

### 3.8 Factual and structural corrections

- **Mixer, not phone.** The coded page reintroduced "defective phone"; the product, data, and every draft since say mixer grinder. v3 is consistent.
- **Routes refreshed**: `?stage=assessment` → `?stage=assess`; hero embed → the notice reader; added `/mobile/files`, `/mobile/onboarding`, `/mobile/voice`, `/mobile/home?ask=…`.
- **"How I Built It" stays cut** (per v2, per `CASE_STUDIES.md` §12.2 — identical across studies). Its *content* moved into the validation receipt, which gained the one genuinely differentiating build claim: **the design system is enforced in code** — a WCAG gate fails the build per theme; the debt ratchet only falls. That is a seniority signal the reference portfolios cannot match.
- **Word budget:** body ~2,430 of 2,500. The compression valve is named (the multilingual paragraph inside `#accountability`).

---

## 4. The decision inventory — why it is tiered, and how to use it

Appendix A of the draft catalogs **50 decisions** in three tiers. The tiering is not a quality ranking — it is a *reading-distance* ranking:

- **Tier 1 — product-defining (15).** The argument. These earn sections, decision cards, or scenes. If a reviewer only reads Tier 1 they should be able to reconstruct the product thesis: a governed first-action flow for the first ten minutes of a legal problem, multilingual at the origin, accountable by construction, mobile-first.
- **Tier 2 — structural (16).** The credibility layer. These prove Tier 1 wasn't luck: the stop outranks the dial, one status vocabulary, the composition law enforced in code, motion obeying ownership rules, the drawer's one deliberate departure from the ChatGPT pattern.
- **Tier 3 — craft (19).** The lean-in details: tabular numerals, the 28px `pronounce` reserved for refusals, the section-first citation chips, haptics on state change, the honest sample lines. Individually small; collectively they are what separates "designed" from "generated," and they are exactly what a senior reviewer zooms into.

**Uses:** (1) finalise the section mix — Tier 1 all ship; Tier 2 salt the deep sections; Tier 3 feeds captions, the guided tour, and interview answers; (2) interview prep — each entry has its one-line reasoning and its live evidence; (3) the guided tour (`/projects/lokai/p`) — the route map doubles as tour stops.

---

## 5. The truth-first boundaries — deliberately unchanged across all versions

These are the claims the case study refuses to make, and they are part of the design:

- Never shipped, never tested with affected citizens or legal-aid workers.
- Priya is a composite. Statutes, OCR, and outputs are scripted prototype content.
- This is not legal advice.
- The research boundary (no user interviews) stays as its own callout in the counter-problem — it makes a different point than the hero boundary and belongs where the assumption lives.
- Language honesty: four prepared packs work; the rest say *not yet*; the banner says "prepared pack, not live translation."
- The demo's simulated amplitude and prepared responses are disclosed in-product, not just in copy.

---

## 6. What remains for the case study (the owner's pass)

1. **Ratify the four judgments** in the v3 changelog: hero = notice reader; desktop showcase cut; D-04 added (with fallback); recognition line confirmed.
2. **Pick the section mix from Appendix A** (voice section in or folded; scene 5 in or cut).
3. **Implement v3 into `app/projects/lokai/page.tsx`** — every block maps to existing components; no new portfolio components required.
4. **Capture the embed set** per Appendix B (both themes where noted; specimens with `?label=0`).
5. **Reconcile the guided tour** (`/projects/lokai/p`) with the new routes.
6. Run the copy self-audit from the taste contract before publishing.
