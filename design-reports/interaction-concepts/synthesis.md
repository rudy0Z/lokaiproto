# LokAI — Is the Direction Real? Synthesis & Concept Report

Date: 2026-09-22 · Question: are we actually moving forward in a newer direction of AI-chatbot
trust-builder? Inputs: JEV research + decision-layer blueprint (3 chapters), design-skills audit,
18-source component study, 4 readable PDFs (Sudhir Mishra pattern playbooks), adversarial concept
review. Honest verdict first, then the validated interaction direction.

## 1. Verdict — yes, and it is verifiable, not vibes

You are not "moving toward" a newer direction; you are already sitting on one of the few
*genuinely* differentiated trust architectures in the consumer-AI portfolio space. The evidence,
layered:

| Layer | What it establishes | Status |
|---|---|---|
| Market (2026 benchmark, 40 sources) | Trust surfaces are the AI bar: transparency, HITL, escalation; agentic-workflow visualization is the differentiator | Sourced |
| Domain (legal-AI research) | Hallucinated-citation sanctions, FTC enforcement, ABA review duties, TAR gates — the profession already rewards decision-governance UX | Sourced |
| Your repo (audit + blueprint) | 7 response modes, 8-way stop taxonomy, claim ledger, verification gate — the trust vocabulary exists; the blueprint turns it into an executable decision layer with receipts | File-evidenced |
| Pattern canon (PDFs, this session) | The same patterns (boundary disclosure, inspectable reasoning, HITL confirmation, split-view artifacts) are what the design canon teaches — LokAI implements them as computed decisions instead of intentions | Cross-validated |
| Competitive frame (JEV research I6) | ChatGPT/Gemini sell prose; a decision layer sells typed decisions with receipts — categorical, not incremental differentiation | Research-graded |

The one honest caveat: this direction is only a "trust builder" if the receipts are REAL —
computed from state (the blueprint's total/pure/separable engine), never authored strings. That is
the difference between a trust product and trust theater, and it is exactly what your gates enforce.

## 2. The validated interaction direction (post-adversarial)

Six concepts were drafted; the challenger agent attacked all six (concept-review.md). Survivors:

**The flagship hybrid — "Every turn ships with its receipt."**
1. **Typed Response Cards** (A): chat stays chat; every turn is a typed card — mode chip
   (Explanation/Clarify/Stopped…), risk chip only when ≠ self-service, claim-ledger footer only
   when claims exist, and a quiet "Why this response?" text-tap. Chrome scales with content.
2. **Ask-First Composer** (D, ranked #1 by the challenger): on typed input, the composer shows
   what the engine understood ("Understood as: consumer refund ✓ — 2 facts confirmed, 1 missing")
   and confirms inline ONLY when classification is ambiguous; chips pass through untouched.
   Fix the composer's audit debt (16px, 44px targets, press physics) in the same pass.
3. **One shared receipt surface** (B+F merged): the Decision Spine as a docked panel at 1440px,
   bottom sheet at 390px — collapsed by default, badge-counted, plain-language, rendering from
   DemoContext as the single source of truth (the PDFs' form-chat bidirectionality rule: never
   mirror state). The live-recompute demo (flip a fact → gate fires → tier changes) is the
   15-second portfolio embed.

Kill list (from the challenger, adopted): Trust-Transit metaphor never enters the UI (case-study
language only); Matter-Trail demoted to a breadcrumb inside progress cards; no per-card receipt
buttons; no always-on risk chips; no branching/regenerate UI (determinism conflicts — replaced by
"replay the reasoning").

## 3. How the component library builds it (edit-don't-rebuild)

From the 18-source study, the build path with existing parts:
- **Response card anatomy** → AI Elements `message`/`inline-citation`/`sources` (Apache-2.0,
  copy-in) reskinned to T.* tokens: citation chips become T.attest, ledger footer becomes the
  claim counter; BoardUI `agent-thinking` upgrades TurnStatus internals behind its existing API.
- **Receipt surface** → AI Elements `reasoning` accordion (collapsed-by-default pattern straight
  from the PDFs) + BoardUI `agent-log` rows (blur-in 160ms, 40ms stagger — also fixes the C-13
  audit miss); dock at 1440px, Sheet at 390px (LokAI's own Sheet primitive already exists).
- **Ask-first composer** → interior.dev `Loading Button` + press physics (C-10 fix) inside the
  existing Composer; the ambiguity strip is a one-line echo above the textarea (16px fix included).
- **Hold-to-Confirm** (interior.dev) for draft submission — the PDFs' HITL guardrail pattern,
  mapped to L8's ai_draft → user_reviewed → ready_to_use states.
- **Motion** → transitions.dev free set re-mapped to MOTION tokens; toast ease-in fix rides along.

All adaptations obey the repo gates: tokens only, one primary CTA, 4-script type system,
deterministic content — everything renders from DecisionOutcome/DecisionReceipt types in the
blueprint, so interaction and engine stay one story.

## 4. Recruiter framing (first-job case study)

The sentence the case study must earn: **"ChatGPT answers. LokAI decides, shows its work, and
stops when it can't own the answer — every turn is a typed decision with a receipt you can read."**

Demo script (90 seconds): ① type an out-of-scope question → scope gate fires, stop card with
receipt (the drift-bug origin story); ② confirm the missing fact → watch gate L6 clear and the
risk tier change on the spine (live recompute); ③ open "Why this response?" → gate + rule +
because lines; ④ submit draft → Hold-to-Confirm → review-gated packet. Four beats, four receipts,
one thesis: trust as engineering discipline. Each beat maps to a case-study section in Chapter Y —
the blueprint's playbook already wrote the narrative; this interaction layer gives it hands.

## 5. Risks & honest unknowns

- The decision engine is still blueprint + preserved implementation (integration.patch) — the
  interaction concepts assume DecisionReceipts exist; build order: engine first (phases in Ch-Z),
  then cards, then spine. Shipping receipts that are hand-authored strings would be trust theater.
- PDF sources are one author's playbooks (Sudhir Mishra) — pattern validation is corroborating,
  not peer-reviewed. The full miner pass found **44 patterns** across 5 groups; the deepest finds
  beyond this synthesis: ① the Decision Spine's loop is canonical in 3 of 4 PDFs but always kept
  *implicit* — its permanent visibility is the defensible novelty; ② confirmation copy should
  state the consequence ("if you file this reply, the fee is ₹X and the deadline is Y"), not just
  "confirm these facts"; ③ the stop taxonomy should be *named* "Boundary & Fallback Map" in the
  case study — that's the industry term recruiters recognize; ④ ledger claims should
  cross-highlight their source in the evidence column (two-way chip linking); ⑤ "escalate" must
  be printed as a first-class decision verb on stop cards, with the receipt trail doubling as the
  lawyer-handoff packet.
- **One real conflict — argue it, don't hide it:** the PDFs explicitly endorse visible percentage
  confidence ("How confident are you?", Confidence Threshold Maps). LokAI's ledger bans it
  deliberately: self-reported LLM percentages are uncalibrated and invite over-reliance — the
  exact trust-miscalibration failure the same corpus warns about. The case study needs one
  explicit paragraph making this substitution argument; silent omission would read as a gap.
  Second flagged conflict: the corpus stigmatizes "deterministic" (pre-LLM dead-ends) — frame
  LokAI as *deterministic disclosure atop probabilistic reasoning*, never deterministic dialogue.
- Visual-only PDFs (Responsible AI, System Thinking, Agentic notes) unread this session — listed,
  not guessed; they may add design law nuance later.
- Composer fixes (16px, targets, physics) are prerequisites, not polish: the ask-first concept
  ships new interaction on a currently failing affordance otherwise.
