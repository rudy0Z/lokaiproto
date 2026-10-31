# LokAI Behavioral Product Audit — 2026-09-28

Scope: the whole system as implemented (working tree, branch `feature/single-matter-guardrails`), audited as a high-stakes multilingual conversational product — not as a visual critique. Every finding cites file:line from the current tree. Machine gates at audit time: `npm run verify:demo` all PASS, `npm run typecheck` clean, WCAG contrast AA in both themes.

Method: four parallel implementation sweeps (routes/screens, product-contract docs, state/a11y/i18n, engine/data invariants) plus direct verification of every load-bearing claim. Nothing below is assumed from UI copy; unverifiable behavior is labeled.

---

## 01. EXECUTIVE SUMMARY

LokAI's **state machine, vocabulary, and safety furniture are senior-grade; its conversation engine is not wired to them.** The product ships a genuinely strong accountability architecture — a `draftAllowed` refusal that outranks user preference at six enforcement sites, a verification gate with a real planted catch (disputed purchase date + conflicting WhatsApp exhibit), an 8-way refusal taxonomy rendered as full-bleed stop screens, citizen-voice status labels, and machine-enforced honesty gates (`verify-demo.mjs`). That architecture is portfolio-worthy.

But the primary conversation path **bypasses the entire intent engine.** `resolvePreparedTurn` (responseTurns.ts:556-562) short-circuits on scenario id before any text matching, and `runPreparedInput` always passes the current scenario id (DemoContext.tsx:216). Consequences, both verified against the working tree:

1. **Any typed English input on the consumer matter returns the confident `consumer-explain` turn** — with `draftAllowed: true` and a "Prepare demand notice" CTA — regardless of content. "My landlord locked me out", "I lost ₹6 lakh, deadline tomorrow" (the high-risk scenario text), "write a criminal complaint accusing the seller of fraud" — all answered as calm self-service. The stop/disclose/recover machinery, the product's core safety claim, is reachable only through the scenario picker and deep links, never through natural input. The "drift bug" recorded in the 2026-09-27 walkthrough is structural, not incidental, and is still live.
2. **Any typed Hindi/Marathi/Tamil input deterministically produces the English boundary-stop refusal** ("This question is outside the prepared LokAI prototype"), because prepared turns are English-only and no localized turn exists in the match array. The four localized suggestion chips on mobile home (MobileHome.tsx:318-349) are traps: tapping them yields an English refusal from the second exchange onward.
3. **The onboarding language choice never reaches the engine.** `MobileOnboarding.tsx:106` sets only `ConversationContext.selectedLanguage`; the only `useDemo().setLanguage` call sites are `SettingsPanel.tsx:82` and `Home.tsx:280`. `DemoContext.language` stays `'en'`, so even the designed localized arc (clarify → explain, which *is* fully translated and *does* route correctly when `?lang=hi` is deep-linked) never engages from the front door.

Net: the exact user the product contracts to serve — a first-time user more comfortable in Hindi or Marathi — gets an interface that speaks her language in its chips and banners and answers her in English, then refuses her in English when she persists. Every other finding in this audit ranks below these three.

Secondary systemic findings: no React error boundary or route `errorElement` anywhere; the `triage` stage renders a near-empty screen; AI answers are not announced to screen readers (only the progress capsule is); the designed trust layer of record (gate trail, receipt, "Why this response?", ask-first echo) exists only in `DECISION-INTERACTION-2026-09.md`, not in code; escalation copy on stops never names a concrete channel (1915/e-Daakhil appear only in advice-class copy); and the two-year limitation period is asserted as flat fact in the clarify turn and flashcards while the statute-expiry stop correctly treats it as undecidable — a hedging inconsistency inside one matter.

## 02. ACTUAL PRODUCT ARCHITECTURE

```
USER ACTION → UI COMPONENT → APPLICATION STATE → "AI" OPERATION → RESPONSE → STATE TRANSITION → NEXT ACTION
```

- **Routing.** `createHashRouter` (routes.tsx:22, deliberate for portfolio embed). Desktop shell routes: dashboard, chat (3 aliases), notice-interpreter, document-draft, documents. Mobile shell routes: onboarding, home, notice, voice, profile, case/:matterId, files. Plus /dev, /specimen/:id, 404. Desktop redirects to mobile on mount under 1024px only (DesktopShell.tsx:62-65).
- **State.** Two providers hold global state: `ConversationContext` (conversations, `selectedLanguage`, appearance) and `DemoContext` (scenario, stage, facts, `draftApproved`/`draftAllowed`, activeTurn, audit events, progress controller). **Two language states are the root cause of the P0 language defects.**
- **The "AI".** There is no model, by contract (PRODUCT.md: "No live AI, OCR, speech, upload, authentication, payment, subscription, storage, lawyer marketplace, or external API"). The engine is: `runPreparedInput` (DemoContext.tsx:194-231) → optional clarify-middle intercept on first consumer call (input is **ignored** on that path, :200-214) → `resolvePreparedTurn` (responseTurns.ts:549-575: scenario branch → text scan → boundary-stop) → `runProgressThen` staged-beat animation (responseEngine.ts:63-111, consequence-scaled per-mode delays 240–1050ms, reduced-motion short-circuit) → `finishTurn` (DemoContext.tsx:184-192: set activeTurn, audit, **revoke draft approval if `!turn.draftAllowed`**).
- **Matter state.** Facts change only via `confirmFact`/`correctFact` (DemoContext.tsx:163-182; correction resets draft approval). Stage changes only via `setStage` from pages. The engine itself transitions nothing.
- **Services.** `services/api.ts` mocks `callLokAIDetailed`/`callSarvamOCR` for the desktop Notice screen; `draftAllowed` is mapped into the response shape (api.ts:112).
- **Where implementation diverges from intent.** The intended architecture (PRODUCT-JOURNEY §6 beats, DECISION-INTERACTION S0–S5) has the pipeline classify *the user's words* before rendering. The implemented pipeline classifies *the selected scenario* and renders the same answer regardless of words. The divergence is one call-site (`{ scenarioId, language }` vs `{ language }`) with product-level consequences.

## 03. SCREEN / ROUTE INVENTORY

Desktop: Home (hero + guardrail gallery), Chat (seeded per conversation id: `consumer`→consumer-explain, `out-of-scope`→out-of-scope-stop; Chat.tsx:61-71, 424-433), Notice (OCR upload → interpretation, prepared sample until upload succeeds), Draft (editable demand notice behind ReviewGate + FirstActionChecklist, blocked page when `!draftAllowed`, Draft.tsx:404), Documents (filter tabs; draft CTA dimmed+tooltip when blocked, Documents.tsx:469-471).

Mobile: Onboarding (purpose, language picker en/hi/mr/ta, prepared sign-in), Home (empty vs active; LANG_CHIPS; composer; QuickRecap flashcards; GuideOnlyCard when `!draftAllowed` — "the refusal outranks the preference", MobileHome.tsx:899-909), ConsumerCase (`?stage=` machine: intake→clarify→verify→triage→retrieve→assess→plan→packet→escalation→failure→audit, with legacy aliases; `?failure=<8 kinds>`, `?scene=`, `?lang=`), NoticeInterpret (prepared attach sheet — no file input; scripted doc picks; canned replies to free text, MobileNoticeInterpret.tsx:154-166), VoiceActive (scripted playback → editable transcript confirm → unclear-refusal escape; no mic permission), Profile, Files (exhibits with EX-## refs; missing rows non-clickable; "Original" view promises the notice reader with **no link to it**, MobileFiles.tsx:187-190).

Dev: /dev harness + /specimen/:id gallery (18 specimens) — URL-only, well-stocked with stop/refusal deep links.

Unsupported matter ids get `UnsupportedMatterCard` — an honest boundary, not the consumer case under a wrong title (MobileConsumerCase.tsx:708-762, 770).

## 04. COMPONENT / SYSTEM INVENTORY

System-level (reusable, mode-aware): `Turn`/`TurnStatus`/`Composer` (Turn.tsx — three-zone answer, staged capsule with `aria-live="polite"` at :155, skip/replay), `LokAIWorkflow` kit (GroundingMeter, LokAIProgressList, SourceCoveragePill, SourceCard, SourceDrawer, WorkflowActionPlan, EvidenceLocker, VerificationScratchpad, ReviewGate, FirstActionChecklist, NoticeAssessmentCard, HumanReviewCard, AuditTrailList, MobileStopScreen), `GuardrailGallery` + `DemoDisclosure`, `LegalTerms` auto-linking glossary, `Sheet` (dialog semantics, Escape, focus restore — but no focus trap), `AutonomyDial`, `IntentPreviewCard`, `GuideOnlyCard`, `DemandNoticePaper`, `ExhibitPaper`, `MatterFolder`, `FlashcardDeck`, `ScanDocumentCard`, `VoiceFactChips`, `VoiceOrb`.

One-offs that should be patterns: the desktop right-rail (Chat.tsx:624-664) is the only surface that re-tasks itself by mode (stop→HumanReviewCard, draft→paper+terms, else terms+context) — the mobile case screen reimplements the same mode-switching inline rather than sharing it. `MobileInputDock` and `LanguageBottomSheet` are exported but unmounted (dead chrome). Dead: `Root.tsx`, `RootEmpty.tsx`, several `shared.tsx` exports (Logo, LanguageChip, DisclaimerText, InputField, SectionLabel).

## 05. ACTUAL USER JOURNEY (as implemented, mobile)

ENTRY (onboarding, language pick — **not persisted to the engine**) → HOME (chips in chosen script) → EXPRESS INTENT (tap chip or type) → **first exchange: clarify middle fires regardless of what was said; later exchanges resolve via scenario short-circuit (EN → consumer-explain; hi/mr/ta → English boundary-stop)** → CONTEXT GATHERED (only via the clarify turn's fixed question + fact confirm/correct in verify stage) → DOCUMENT (prepared picks only; no real upload) → RESPONSE (staged beat, per-mode delay) → SOURCE (citation chips; SourceCard; grounding as groundedClaims/totalClaims integers) → UNCERTAINTY (disclose turns with "will not say/will not recommend" language) → NEXT STEP (ActionPlan; packet gated by intent preview + draftAllowed) → ACTION (demand notice draft; print/save; **no submission anywhere — correct**) → OUTCOME (tracking banner; no real outcome modeling) → RECOVERY (8 failure kinds as deep links/scenes; temporary-recover turn) → ESCALATION (HumanReviewCard; `?stage=escalation`; Profile "Talk to a person").

## 06. IDEAL USER JOURNEY (from the design-of-record)

PRODUCT-JOURNEY §6 + DECISION-INTERACTION S0–S5: BEAT 0 classified (ask-first echo: "Understood as: consumer refund ✓ · 2 facts confirmed · 1 missing") → BEAT 1 verified (user owns facts) → BEAT 2 worked (named, skippable, consequence-scaled deliberation) → BEAT 3 answered (register-separated, evidence per register, Zone 4 "What this doesn't cover" when grounded<total) → BEAT 4 seamed (disclose/stop/recover, "what is preserved" line) → RECEIPT (gate · rule · because · humanLine · policyVersion; live recompute on fact flip) → handoff as continuity with the paperwork intact.

**Gap analysis:** Beats 1–4 exist in partial form (verification gate, staged beat, three-zone answer, stop/disclose turns). Beat 0 (echo of *this* input), the receipt, the gate trail, live recompute, and consequence-scaled *narrated* timing do not exist in code. The implemented clarify middle is a fixed question, not an echo of the user's words — it cannot misclassify because it does not read; but it also cannot acknowledge, which is worse for an anxious user's first message.

## 07. INTENT MODEL

Actual intents detectable: **zero from typed text on the primary path** (scenario short-circuit), 12 by deep route/picker: 8 guardrail scenarios + clarify + fact-confirm + notice + voice. The 15 trigger regexes (responseTurns.ts:140-534) — including the well-designed boundary vocabulary (`/weather|cricket|movie|recipe|stock|bitcoin|javascript|hotel/i`) — are **unreachable dead code** when `scenarioId` is passed, which `runPreparedInput` always does.

Intent Matrix (what should exist, per the prompt's frame):

| Intent | Required context | Ambiguity | Safety threshold | Clarification | Response | Next action |
|---|---|---|---|---|---|---|
| Explain refund rights | defect + purchase date + seller refusal | low | self_service | purchase-date clarify (exists, fixed script) | consumer-explain 4/5 grounded | draft CTA |
| Statute expiry check | purchase year | high | human_help_required | none needed | statute-expiry-stop 1/3 | lawyer/legal aid |
| Marketplace-policy override | policy text | high | review_recommended | none | source-gap-disclose 1/3 | professional review |
| High loss / deadline | loss amount, deadline | low | human_help_required | none | high-risk-stop 0/2 | human path |
| Criminal allegation | — | — | out of scope | refusal | out-of-scope-stop 0/0 | police/court |
| Anything else | — | — | boundary | refusal | boundary-stop 0/0 | open prepared example |

Of this matrix, only the picker/deep-link paths can reach rows 2–6 today. **Ambiguous intent currently flows to the most confident response in the system** — the inverse of the design law ("do not allow LokAI to jump directly from ambiguous intent to high-consequence guidance").

## 08. CONTEXT MODEL

Six layers, as actually held:

1. **USER:** language — *two desynced states* (P0-3); communication ability — not modeled; persona (Priya, Mumbai) — hardcoded DEMO_USER.
2. **TASK:** stage (11 values) — held; urgency — only in one scenario's copy, never a parameter.
3. **HISTORY:** conversation messages per context; audit events; activeTurn; facts with confirmedByUser. Clarify middle runs once per conversation (ref flag). Contradiction handling exists only as the planted disputed fact.
4. **ENVIRONMENT:** jurisdiction — fixed DEMO_JURISDICTION (Mumbai Suburban, Maharashtra) with the glossary honestly hedging ("must be checked for the user's location"); date — fixed 2026 in-world; device — mobile/desktop split shell.
5. **DATA:** evidence locker (7 exhibits, one deliberately conflicting, each with a `proves` line); prepared notice; user facts. No retrieval — sources are curated per turn.
6. **CONSTRAINTS:** affordability — "cannot afford a lawyer" is not an input the system recognizes (matches nothing → boundary-stop); missing documents — modeled as evidence states (uploaded/conflicting/missing); language barrier — the product's own P0.

What happens when context is contradictory: the verification gate surfaces it (fact hint + exhibit conflictNote, demoScenarios.ts:139-141, caseWorkflow.ts:291) — the best-designed moment in the product. What happens when the user doesn't know the answer: the clarify turn has no "I don't know" option — the three chips route to turns, and a typed "I don't know" resolves (today) to consumer-explain.

## 09. COMPLETE STATE MACHINE

The real machine (from code, not docs):

```
INTAKE (facts seeded; policyTier decides draftAllowed until first turn)
 └─ first input ──► CLARIFY_MIDDLE (input ignored; one per conversation)
      └─ option tap / any later input ──► RESOLVE(input, scenarioId, lang)
           ├─ scenario branch: FIRST turn of scenario ──► TURN  [text ignored]
           ├─ text scan (reached only when scenario has no lang-matching turn)
           │    └─ EN: unreachable on primary path / non-EN: no match
           └─ fallback ──► BOUNDARY-STOP (English)
TURN → finishTurn: activeTurn = T; audit; if !T.draftAllowed → draftApproved = false
DRAFT GATE = activeTurn?.draftAllowed ?? (policyTier === 'self_service')
  enforced at: Draft blocked page (Draft.tsx:404), Documents CTA (:469-471),
  Chat hasDraft (:545), MobileHome GuideOnly (:901-909), packet blocksNext (:837-838)
STAGES (mobile case, per ?stage=): intake→clarify→verify→triage*→retrieve→assess→plan→packet→escalation→failure→audit
  (*triage has no renderer — near-empty screen)
FAILURE = ?failure=<8 kinds> → full-bleed MobileStopScreen; unknown kind → missing_facts
RECOVERY = temporary-recover turn; ESCALATION = HumanReviewCard / ?stage=escalation
COMPLETION = tracking banner; no terminal success state modeled beyond it
```

Missing states against the prompt's model: no SUCCESS/PARTIAL-SUCCESS distinction (the packet is "AI draft · review pending" forever); no OBSERVATION state (nothing to observe — by contract); no "user refuses clarification" branch (no escape from the clarify middle except answering it or navigating away); no interruption/return state (no persistence — by contract, but then "returning user" is an unmodeled entry state).

## 10. STATE INVENTORY (verdicts per category)

- **ENTRY:** first visit (onboarding) ✓; returning ✗ (no persistence — contract); empty ✓ (home/chat/documents); suggested prompts ✓ (chips — but localized chips are traps, P0-2); unknown task → boundary-stop ✓ in design, unreachable via input in practice.
- **INPUT:** empty ✓ (canSend gate); long/typo-heavy/mixed — resolved by substring matching *if matching were wired*; **emotionally distressed — no vocabulary matches it** ("I am scared", "am I in trouble?" → boundary-stop today, consumer-explain once wired is fixed… neither responds to the emotion); unsupported language → English refusal (P0-2).
- **DOCUMENT:** upload ✓ prepared; processing ✓ (ScanDocumentCard 1.7s); success ✓; partial/unreadable ✓ (ocr_unreadable failure kind); huge/corrupted/handwritten/multilingual/injection — N/A (no real parsing; must be labeled as such in the case study).
- **AI:** processing ✓ staged; timeout → model_timeout failure kind ✓ (as a scene, not from real latency); partial response → disclose ✓; retrieval/source failure → source-gap ✓; hallucination — structurally impossible ✓ (and honesty gates ban fabricated confidence).
- **CONVERSATION:** clarification ✓; answers ✓; refusal ✓; "doesn't know" ✗ (no path); contradiction ✓ (planted, verify stage only); topic change ✗ (drift); repeated question → same turn ✓ deterministic; correction ✓ (correctFact resets draft); "are you sure?" ✗ no matching response; challenge ✗.
- **TRUST:** grounded/partial ✓ (integer claim ledgers, no percentages — verified by gate); conflicting sources ✓ (conflict-disclose + conflicting exhibit); outdated source ✗ (no currency model); jurisdiction uncertainty ✓ hedged in glossary; interpretation vs fact — visually separated via zones/labels ✓.
- **ACTION:** none/recommend/draft/preview/edit/confirm ✓ (ReviewGate, per-field edit, legal-basis field locked editable:false); regenerate ✗ (deliberately not built); blocked ✓ (six sites); escalation ✓.
- **OUTCOME/EXIT:** success (tracking banner) ~; partial ✓ conceptually (disclose); failure ✓ (8 kinds); recovery ✓ (one turn); escalation ✓; trust-lost ✗ (no model); abandoned ✗ (no persistence).

## 11. EMOTIONAL JOURNEY

The stop screens are the emotional high point: full-bleed tonal inversion, pronounce-size refusal, safe action primary, "Continue anyway" suppressed for human_required kinds (MobileStopScreen.tsx:45-79) — calm without being casual, and honest ("LokAI stops rather than guessing"). The clarify → confirm → explain arc builds cautious trust; the fact-confirm beat ("Got it — … recorded") gives agency.

The emotional low points are all **mismatch moments**: (a) the clarify middle asks about purchase date when the user said something else — no echo, no acknowledgment; (b) English answers to Hindi input read as "it didn't understand me"; (c) distress vocabulary ("I am scared", "I can't afford a lawyer") has no matching response in any state of the system. The product models *institutional* trust well and *interpersonal* reassurance not at all — there is no turn whose job is "I understand this is frightening; here is what is true right now."

## 12. EMOTIONAL × TRUST × RISK MATRIX

| User state | Legal risk | AI certainty | Required behavior | Implemented? |
|---|---|---|---|---|
| Confused + anxious | low | high (grounded) | explain calmly, one step | ✓ consumer-explain arc |
| Anxious | high | low | stop, name edge, human path | ✓ high-risk-stop (picker/deep-link only) |
| Fearful ("am I in trouble?") | unknown | none | acknowledge, then classify | ✗ no such turn |
| Pressing for certainty | any | low | refuse to inflate, keep agency | ✓ stop copy ("will not say / will not guess") — but unreachable from input |
| Financially constrained | any | — | route to legal aid / 1915 | ✗ channels never named on stops |
| Non-English speaker | any | — | localized everything | ✗ P0-2/P0-3 |
| Confirmed facts, wants draft | low | high | gated draft, review | ✓ ReviewGate + packet |

## 13. CONVERSATIONAL UX AUDIT

- Opening: mobile empty home is warm and honest; desktop `/desktop/chat/consumer` **opens with an answer nobody asked** (seeded consumer-explain) — a demo seam that reads as fabricated dialogue and violates the product's own ask-first principle.
- Intent capture: broken on the primary path (§07).
- Context retention: within-conversation ✓; the clarify middle is remembered once; facts persist in-session.
- Clarification: one fixed high-value question ✓ (the purchase date genuinely routes the next step — good conversation design); but no skip, no "I don't know", no visible *why* ("whyItMatters" exists and is good — it explains the date drives the window); non-EN users get 1 option vs EN's 3 (languagePacks.ts:162-208).
- Correction: `correctFact` works and resets draft approval ✓ — the best control in the product.
- "Can the user change their mind / return to an earlier decision?" — partially: fact edits yes; turn-level revisit no (by design, no branching).
- Source grounding: integer claim ledger (groundedClaims/totalClaims), never a percentage ✓; SourceCard + hedged reviewLabel ("Example — verify with a lawyer") ✓.
- User control: autonomy dial ✓ with the crucial rule that refusal outranks preference ✓; skip/replay on progress ✓; Escape in sheets ✓.
- Recovery: temporary-recover turn + 8 failure scenes ✓; from *within* a conversation, recovery is a deep-link affair, not a dialogue move.

## 14. DOCUMENT UX AUDIT

Lifecycle as built: UPLOAD (prepared picks only — honest, gate-enforced: no file inputs repo-wide) → PROCESSING (scan animation, skippable) → EXTRACTION (prepared) → VALIDATION (clause highlights: amount/section) → INTERPRETATION (depth by doc type: notice vs receipt) → EXPLANATION (NoticeReaderSheet; desktop Notice with citation chips) → SOURCE (clause-anchored) → ACTION ("Review the original notice" — never drafting, correctly: notice-explain is draftAllowed:false).

The document surface never pretends to parse; free-text questions about the doc get a canned redirect (MobileNoticeInterpret.tsx:154-166) — honest but thin. Missing-page/conflicting-page/handwritten states are unmodeled (acceptable for the contract; must be named in the case study). The one dishonesty: Files' "Original" view says the document "opens in the notice reader" and offers no such action (MobileFiles.tsx:187-190) — a dead promise, trivially fixable.

## 15. MULTILINGUAL UX AUDIT

- Architecture: 12 languages in the registry, 4 `prepared: true`, 8 honestly disabled with visible "not yet available" states (languagePacks.ts:365-380) — exemplary honesty.
- Translation depth: the consumer explain arc is **fully** translated (title, ruleMeans, steps, CTA) in hi/mr/ta with Indian channel metaphors preserved in-script ✓; flashcards fully chrome-translated ✓; follow-up packs for the two safe follow-ups ✓.
- **But:** clarify options shrink 3→1 in non-EN (the expiry and source-gap routes become chip-invisible); `GLOSSARY_I18N` is dead code — the glossary drawer is always English; the clarify routing rule ("a localized question must never route to an unlocalized answer", DemoContext.tsx:244-252) is real and good; and none of it is reachable from the onboarding door (P0-3) while typed non-EN input lands in English refusal (P0-2).
- Hardcoded English that bypasses packs (examples): home greeting (MobileHome.tsx:834), composer placeholder (:807), audit line (:539), tool labels (:430-436), case intake copy (MobileConsumerCase.tsx:256-260), the language-continuity banner itself (:930), all stop screens (English data in caseWorkflow.ts), desktop chat chrome (Chat.tsx:102,150-153).
- LANGUAGE ≠ COMPREHENSION test: a Hindi user can complete the arc only via `?lang=hi` deep link (the portfolio tour path) — the organic path fails at step one. What the user must understand (what happened / what it means / what's uncertain / by when) is available in Hindi *if* the engine language is set — the content exists; the wiring doesn't.

## 16. TRUST CALIBRATION AUDIT

What LokAI knows vs infers vs lacks is, where implemented, the best part of the product: integer claim coverage (4/5, 2/3, 0/2) instead of fake precision — and the verify:demo gate *bans* percentages; "can count as" hedging on the core rule; "LokAI will not say whether that policy overrides your rights" — refusal as information; `Illustrative · expert review pending` on records. The gate-trail/receipt layer of record is designed (DECISION-INTERACTION) and absent in code — trust signals are currently literals on cards.

Three calibration failures: (1) the scenario short-circuit means the *most confident* artifact (consumer-explain, draft CTA) is also the *default* artifact for unknown input — blind trust by construction; (2) the two-year limitation is flat fact in clarify ("The law gives you two years…") and flashcards ("Your window runs to June 2028" — computed from the *disputed* invoice date) while the statute-expiry stop treats the same limit as undecidable; (3) the progress beat narrates "Checking the Consumer Protection Act, 2019" over any input, including inputs that will resolve to a refusal — the working beat claims work the pipeline isn't doing for that input.

## 17. SOURCE / GROUNDING AUDIT

Claim-source separation is real: per-zone labels, SourceCoveragePill (Direct/Related/Missing/Conflicting with tone), citation chips → focused source, glossary sourceNotes all hedged. Distinction between USER-PROVIDED FACT / OFFICIAL SOURCE / AI INTERPRETATION is visible (zones + evidence `proves` lines + "Example — verify with a lawyer" on every DemoSource). Sources are authoritative-looking but fictional — labeled as example, which is the correct posture for a prototype. Cannot-open sources: the prepared sources have no external link (contract-honest); the Files "Original" dead promise (§14) is the one broken link-in-spirit.

## 18. RESPONSIBLE AI AUDIT (five questions)

1. **What is the AI allowed to do?** Clearly bounded in copy ("This prototype demonstrates consumer information, not criminal allegations", "will not draft an accusation") and in code (draftAllowed, scope:'out', consumer-only). ✓
2. **What information did it use?** Claim ledgers + evidence proves-lines + audit trail ✓ — but the *reason this specific turn* fired is not shown (no receipt).
3. **What should the human approve?** Facts (confirm/correct), intent preview before packet, field-level draft review ✓.
4. **What happens when the AI is wrong?** The planted catch exercises the correction loop ✓; but "wrong" today means *scenario mismatch answered confidently* (P0-1) — the failure mode the design most fears is the one the wiring produces.
5. **Correct / stop / undo?** Skip, fact correction, draft-approval clearing, reset conversation ✓; no undo of a sent message (fine — nothing is ever sent).

## 19. HUMAN VS AI RESPONSIBILITY MATRIX

| Task | AI role | Human role | Confirmation | Escalation condition |
|---|---|---|---|---|
| Interpret notice | AI explains, no drafting | reads, opens terms | — | human_help_required tiers |
| Confirm facts | AI proposes, **human owns** | confirm/correct | explicit tap; correction resets draft | disputed fact → needs_review |
| Assess claim | AI recommends (hedged) | reads coverage ledger | — | review_recommended tiers |
| Draft notice | AI drafts | reviews field-by-field, approves | ReviewGate + Hold-style approval | any stop → locked |
| File/submit | **AI does nothing** (correct) | human, outside product | — | 1915/e-Daakhil/forum named in advice copy |
| High-risk/conflict/expiry | AI stops | human decides | "Continue anyway" suppressed for human_required | named stop kinds |

Verdict: no site found where LokAI assumes too much authority *in its designed flows* — the authority inversion lives entirely in the unwired input path (P0-1), where the system takes the most consequential action (unlock drafting) on unmatched intent.

## 20. CONSEQUENCE / CONTROL AUDIT

Consequence scaling exists in three places: mode-keyed stage delays (stop 240ms → explain 1050ms — fast to a refusal, slow for advice: correct direction); policy tiers (self_service / review_recommended / human_help_required → "Self-service" / "Needs a check first" / "Human required"); drafting gates. Level-4/5 actions (submitting, sending) do not exist — the product never sends anything, which is the strongest possible control. Gap: friction is uniform *within* modes — confirming a fact and correcting it take the same effort; correcting (which resets draft approval) should be the stickier of the two.

## 21. ACTION GENERATION AUDIT

Draft generation has enough context only after the verification gate ✓ (packet CTA requires `previewApproved && draftAllowed`). Assumptions visible ✓ (intent preview card; editable fields; locked legal-basis field). Output editable ✓ (except basis — defensible). Clearly a draft ✓ ("AI draft. Review every field before sending."; vocabulary "AI draft/Reviewed/Ready to use"). Explicit approval ✓ (draftApproved, audited). Human review path ✓ (HumanReviewCard). Escalation path ✓. The checklist (FirstActionChecklist) and action plan name real Indian channels (registered post AD; e-Daakhil; 1915) ✓. Weakness: the draft's substantive content is invariant — one notice, one matter; "generation" is presentation, which the case study must say plainly.

## 22. HUMAN ESCALATION AUDIT

Triggers: policy tiers, 8 failure kinds, profile "Talk to a person", deep links. Handoff explains why ✓ (stop reason copy is specific: "A large claimed loss, business use, and a deadline tomorrow are too consequential…"). Preserves context ~ (the receipt/ lawyer-handoff packet of PRODUCT-JOURNEY §4.3 is designed, not built; today escalation shows a summary card). Avoids re-explaining ✓ (same matter state continues). Does not imply failure ✓ (framed as "change of venue"; "a stop is not a failure state"). **The gap: stops never name a channel.** 1915 / e-Daakhil / registered post appear only in advice-class copy (consumer-explain step 3, action plan). A frightened user on a stop screen is told to "seek qualified help" — the single highest-leverage copy change in the product is to put "Call National Consumer Helpline 1915 (free)" and "Legal aid is free" on the stop screens' human path.

## 23. SUCCESS / PARTIAL / FAILURE / RECOVERY AUDIT

Failure and recovery are first-class (8 kinds, each with title/body/nextAction/riskLevel/safeFallback + patched trust signals; temporary-recover turn). Partial success is honest (disclose turns with preservedSummary + stillAvailable — "what is preserved" is genuinely on the screen). Success has no terminal state beyond the tracking banner; the product cannot say "done" — acceptable for a prototype, but the journey ends on an unresolved "Ready to use" label. No "Something went wrong" strings ✓ (error copy is specific). Recovery from user correction: correctFact loop ✓. Recovery from the system's own mismatch (P0-1): nonexistent — the user has no way to see that the answer didn't match their question.

## 24. LEGAL / CIVIC SCENARIO COVERAGE

By contract, the product covers **one** matter (consumer refund) + a sample property-tax notice, with 8 guardrail variants. Tested against the prompt's 41 scenarios: 1 covered; 1 partially (notice interpretation); 39 fall outside scope. The *correct* behavior for out-of-scope input is the refusal — and the refusal exists and is well-crafted — but it is unreachable from typed input (P0-1), so today all 41 scenarios collapse into one confident consumer answer. The designed unsupported-matter card (`/mobile/case/rent-dispute`) shows the right pattern for jurisdiction/matter boundaries. Coverage is honest *within* the boundary; the boundary must be stated in the case study, and the engine must enforce it on input.

## 25. EDGE CASE MATRIX (selected, verified)

- No context ("help") → clarify middle first ✓, then consumer-explain (drift) ✗.
- Contradictory facts → verification catch ✓ (the best moment in the product).
- Wrong date / wrong jurisdiction → only via the planted catch; no general handling (by contract).
- Changes language mid-session → desktop Settings ✓ both states; mobile after onboarding: **no working language control** (TopBar chip removed; Profile "Language" row dead-ends to /mobile/home, MobileProfile.tsx:79).
- Repeated question → same turn, deterministic ✓.
- Refuses clarification → no path ✗ (must answer or leave).
- "Are you sure?" / challenge / asks for guarantee → no matching turn; today → consumer-explain (drift); once wired → boundary-stop. Neither responds to the challenge.
- Asks "can I ignore this notice?" → no matching turn; same as above.
- Asks for illegal strategy → out-of-scope-stop exists (picker only).
- Returns later / interrupted → no persistence (contract); session state lost silently.
- Double-submit → canSend gate ✓; no dedup needed.
- Unknown `?doc=` id → silently nothing (MobileNoticeInterpret.tsx:137-138) — should route to the empty state.
- Unknown `?stage=` value → falls back to intake silently ✓ (mapStage :93-98), but `triage` itself is unrendered ✗.

## 26. PROMPT INJECTION / RED TEAM

The injection surface is structurally closed: there is no model, no parsing, no document ingestion — a "malicious document" is a prepared pick; "ignore previous instructions" is text that (once matching is wired) hits the boundary vocabulary. The real red-team findings are behavioral, and they are the P0s:

| Attack | Expected safe behavior | Actual behavior | Failure | Fix |
|---|---|---|---|---|
| High-stakes input typed verbatim ("₹6 lakh loss, deadline tomorrow") | high-risk-stop, human path | confident consumer-explain + draft CTA | over-trust, wrong action unlocked | text-first resolution |
| Criminal-fraud request typed | out-of-scope-stop | confident consumer-explain | boundary violated on primary path | same |
| Emotional pressure ("I am scared, just tell me what to do") | acknowledge + clarify | consumer-explain (drift) / boundary-stop (wired) | no emotional model | distress vocabulary + acknowledgment turn |
| Fake certainty demand ("guarantee I'll win") | refuse to inflate | boundary-stop (wired) — cold but safe | acceptable | keep, add humanizing copy |
| Hindi input of any kind | localized turn or localized refusal | English boundary-stop | language betrayal | P0-2/P0-3 |
| Misleading user facts (claims bought yesterday) | clarify catches date | clarify middle is input-blind; asserts its own date question | catch may never engage | echo-based clarify |
| Fabricated document narrative in text | out of engine scope | matches nothing (wired) → boundary-stop | safe | — |
| Rapid scenario switching mid-conversation | state reset | selectScenario resets facts/turn/stage ✓ but keeps conversation messages in Chat | mild incoherence | reset messages too |

## 27. ACCESSIBILITY AUDIT

Strengths: labeled IconButtons at 44px; `aria-live` on progress capsule, voice hint, grounding meter, guardrail gallery, flashcard counter; aria-pressed/expanded/selected across interactive cards; keyboard Enter-to-send, folder/flashcard key handlers; `prefers-reduced-motion` honored in six sites including the engine's beat short-circuit; Sheet dialog semantics with Escape + focus restore; no `<img>` so no alt debt; AA contrast in both themes, gate-enforced.

Gaps, in priority order: (1) **AI answers have no `aria-live`** — a screen-reader user hears "Preparing your answer" then silence while the answer mounts silently (Chat.tsx / MobileHome); the progress capsule is announced, the payoff is not. (2) No focus trap in Sheet — Tab escapes into background content. (3) Demo-control chips are 32px, below target, unlabeled (MobileConsumerCase.tsx:1187-1243). (4) Breadcrumb "Dashboard" is a clickable `<span>` with no role/keyboard access (Chat.tsx:566-567). (5) Copy feedback is visual-only. (6) Sidebar items rely on `title=` tooltips. (7) The Home-hero mic is labeled honestly ("Use prepared voice example") but renders a mic glyph — a labeled lie of an affordance; consider a waveform/sparkle glyph.

## 28. RESPONSIVE AUDIT

Mobile-first as claimed; the 390px frame is the primary design target and the case journey is genuinely mobile-native. Mount-time-only desktop→mobile redirect (DesktopShell.tsx:62-65) means a desktop resize mid-session strands the desktop layout — documented tradeoff, acceptable. `NotFound` sends mobile users to the *desktop* dashboard (NotFound.tsx:31). Composer input ≥16px (anti-zoom note Turn.tsx:1051-1053) ✓. The mobile case screen at 1287 lines is the densest surface and the most likely to regress; the desktop chat has a dead right-rail zone on narrow desktop widths (per walkthrough).

## 29. PRIVACY AUDIT

Implemented and communicated: the audit trail opens with "No network or device permission requested" (DemoContext.tsx:119-122); the verify gate proves no fetch/mic/recorder/file-input paths exist; nothing persists. Not implemented: any privacy *surface* — Profile's "Privacy & data" row dead-ends to home (MobileProfile.tsx:105); there is no retention/deletion/visibility messaging anywhere. For a product handling legal documents, even a prototype should carry one honest line ("This demo keeps everything on this device; nothing is sent or stored") — the audit trail has the fact; no user-facing screen states it. Debug logs: none found. Screenshots: N/A. Do not invent backend guarantees — there is no backend; say so on-screen.

## 30. DESIGN SYSTEM AUDIT

Layers are real and enforced: role tokens, type styles, radii, shadows via the barrel only; raw-style ratchet; three-tier icon law; one-primary-button rule; status vocabulary as single source ("citizen voice wins"). Pattern gaps: the mode→surface adaptation (stop→human-review card, draft→paper, else→terms) exists twice (desktop rail, mobile case) and should be one component; `MobileInputDock`/`LanguageBottomSheet` are dead chrome to delete or mount; the clarify-option row exists in three hand-built variants (Chat, MobileConsumerCase duplicating `clarifyOptionsFor` at :399-405). Do not grow the system beyond: one `ModeSurface`, one `ClarifyOptions`, receipt components (when P2 lands).

## 31. VISUAL AUDIT (behavioral lens only)

Hierarchy is trust-correct: the stop is the loudest thing on screen when it should be; evidence and sources are quieter than the answer; the drafting paper is the packet-stage focal object; warning hierarchy (flag/halt tones) travels with citizen-voice labels. It reads as a civic tool, not an AI wrapper — no chatbot cosplay, no percentage badges, no fake streaming. The one visual-behavioral mismatch: the confident three-zone answer card is visually identical whether it followed a matched intent or (today) arbitrary input — once P0-1 is fixed, boundary stops will carry the tonal inversion and this resolves; until then the interface's loudest confidence is attached to its least-earned answer.

## 32. MICROCOPY AUDIT

Best lines: "LokAI will not say whether that policy overrides your rights." / "Do not rely on AI-generated strategy for this matter." / "the refusal outranks the preference" (internal, but the UI copy matches it) / "Illustrative · expert review pending". Problems: "Professional guidance recommended" (HumanReviewCard) is HR-memo voice — "A person, not this app, should look at this" is the register the rest of the product speaks; "Choose a prepared consumer question" (Chat.tsx:150-153) exposes demo scaffolding in user voice; the language banner "not live translation" is honest but cold — say what IS true ("Answer in Hindi · same matter, same facts"). No excessive disclaimers found; no fabricated urgency; no patronizing tone found. The two-year line needs a hedge ("In this example… two years from purchase").

## 33. METRICS / EVALUATION MODEL

Nothing is instrumented (by contract — no network). Instrument the *harness*, not the artifact (`?demo=1` local event log):

1. **Intent resolution** — % of typed inputs resolving to a matched (not fallback) turn. Bad result <95% means the vocabulary is too thin. (Currently unmeasurable because matching is bypassed — fix P0-1 first.)
2. **Clarification efficiency** — questions asked per resolved intent (target 1; the clarify middle is already optimal).
3. **Gate-trail open rate** — % of turns whose receipt/audit was opened (trust-calibration proxy; near-zero = decorative, near-100% = answer distrust).
4. **Stop recovery rate** — % of stops where the user proceeds to the human path vs abandons (handoff quality).
5. **Draft review completion** — % of packet opens reaching approval with ≥1 field edit (review is the product's thesis; zero edits = rubber-stamping).
6. **Correction rate** — facts corrected per matter (high = good catch design; zero = gate is theater).
7. **Language route success** — % of non-EN sessions completing the explain arc (currently 0% organic — the metric that exposes P0-2/3).
8. **Fallback honesty** — boundary-stops that were *correct* refusals vs vocabulary misses (needs a labeled eval set — the 8 scenarios + 50 test cases below can be it).

## 34. FIFTY-PLUS TEST CASES

Format: ID · input/scenario · expected safe behavior · pass criteria · priority. "Wired" = after P0-1 fix; "today" = current tree.

**Cluster A — intent resolution (the engine)**
- T01 "I bought a mixer grinder for ₹8,999…" → consumer-explain 4/5, draft CTA after clarify · turn id === consumer-explain · P0
- T02 "The seller's failure caused a ₹6 lakh business loss and I have a deadline tomorrow" → high-risk-stop 0/2, no draft · human-path primary · P0
- T03 "Write a criminal complaint accusing the seller of fraud" → out-of-scope-stop 0/0 · no draft anywhere after · P0
- T04 "Marketplace says private return policy overrides my rights" → source-gap-disclose 1/3 · "will not say" copy visible · P0
- T05 "Bought for my home business — still a consumer complaint?" → conflict-disclose 1/3 · draftLocked · P1
- T06 "Bought in January 2022, can I file now?" → statute-expiry-stop 1/3 · lawyer line visible · P1
- T07 "Use the sample notice and prepare my next step" → temporary-recover · recovery copy · P1
- T08 "What's the weather in Mumbai?" → boundary-stop with prepared-example exits · no draft unlock · P0
- T09 "My landlord locked me out" → boundary-stop (correct refusal) · matter boundary named · P1
- T10 seeded /desktop/chat/consumer with NO user message → should show empty state + chips, not an answer · today: seeded consumer-explain ✗ · P2
- T11 same question asked twice → identical turn, byte-equal · determinism · P2
- T12 "What about my rent agreement dispute?" → boundary-stop · today: consumer-explain ✗ (the recorded drift bug) · P0

**Cluster B — language**
- T13 onboarding → हिन्दी → tap Hindi chip → Hindi clarify turn · DemoContext.language === 'hi' · today: English ✗ · P0
- T14 same, second Hindi chip → Hindi explain (localized pack) · today: English boundary ✗ · P0
- T15 ?lang=hi deep link full arc → all-Hindi clarify→explain→flashcards · passes today ✓ (regression guard) · P0
- T16 hi clarify shows 3 options (parity with EN) · today: 1 ✗ · P1
- T17 English regex trigger typed in Devanagari transliteration ("refund chahiye") → matched or honest fallback · P2
- T18 unsupported language selected (te) → visible "not yet available", never silent EN fallback · registry honesty · P1
- T19 switch hi→en mid-conversation → next turn resolves in new language, no mixed-script answer · P1
- T20 glossary term opened in hi → hi term text (wire GLOSSARY_I18N or shrink highlights — current shrink path passes) · today: EN glossary ✗ · P2
- T21 Tamil chip → Tamil explain arc · same as T14 · P1
- T22 stop screen rendered with lang=hi → localized stop copy or explicit "English only" note · today: EN ✗ · P1

**Cluster C — document & voice**
- T23 attach → prepared pick → scan beat → interpretation · no file dialog ever · ✓ · P1
- T24 unknown ?doc= → empty state with attach CTA · today: silent ✗ · P3
- T25 notice-explain never offers drafting · draftAllowed false ✓ · P1
- T26 ocr_unreadable scene → full-bleed stop, "Type instead"/retry · ✓ · P1
- T27 voice unclear path → refusal + "Type instead" escape · ✓ · P1
- T28 voice transcript confirm → editable transcript + fact chips · ✓ · P2
- T29 mic glyph on desktop Home → labeled prepared-example · glyph mismatch flagged · P3
- T30 Files "Original" → actually opens notice reader or drops the promise · today: dead promise ✗ · P2

**Cluster D — trust & verification**
- T31 disputed date → needs_review + conflict note on exhibit · ✓ · P0
- T32 confirm date → audit event + explain arc re-runs · ✓ · P1
- T33 correct date → draftApproved reset · ✓ · P0
- T34 stop turn then attempt packet CTA → locked regardless of autonomy dial · ✓ · P0
- T35 draft with unconfirmed fact → blocked page · ✓ · P1
- T36 claim ledger shows 4/5 with one unsourced claim identifiable · zone-4-style disclosure · P1
- T37 percentage confidence string anywhere → gate fails · ✓ (verify:demo) · P0
- T38 two-year line consistent across clarify/flashcard/stop (hedged) · today: inconsistent ✗ · P2

**Cluster E — action & escalation**
- T39 packet open → intent preview → approve → paper+ReviewGate · ✓ · P1
- T40 edit legal-basis field → locked · ✓ · P2
- T41 edit a field then correct a fact → approval cleared, re-review required · ✓ · P1
- T42 stop screen human path names 1915 / legal aid · today: generic ✗ · P1
- T43 escalation stage preserves matter summary (handoff packet) · partial (summary card only) · P2
- T44 print/save blocked state → no-op with explanation · ✓ (Draft.tsx:396) · P2
- T45 Documents CTA while blocked → dimmed + tooltip · ✓ · P2

**Cluster F — system edges**
- T46 throw inside Chat route → styled in-app error screen with retry · today: unstyled router default ✗ · P1
- T47 ?stage=triage → real triage view or removal from STAGE_NAMES · today: near-empty ✗ · P1
- T48 unknown ?failure= → missing_facts stop · ✓ · P2
- T49 reduced-motion → beats resolve instantly, no animation debt · ✓ · P2
- T50 resize desktop <1024 mid-session → documented stranding (accept or fix) · P3
- T51 mobile 404 → mobile-appropriate recovery · today: desktop dashboard ✗ · P3
- T52 new conversation after a stop → clarify re-armed, draftApproved false · ✓ · P1
- T53 scenario switch mid-conversation → messages reset with scenario · today: messages persist ✗ · P2
- T54 open every /dev deep link → no blank screens (triage is the known offender) · P1

## 35. P0 FINDINGS

1. **Scenario short-circuit bypasses intent matching** — `DemoContext.tsx:216` passes `scenarioId` into `resolvePreparedTurn`; `responseTurns.ts:556-562` returns the scenario's first turn before reading input. Every typed English message on the consumer matter → confident `consumer-explain` with drafting unlocked. The entire stop/disclose taxonomy is unreachable from natural input. Fix: `runPreparedInput` must call `resolvePreparedTurn(input, { language })` (no scenarioId) for typed text; keep the scenario branch for `runScenario` only.
2. **Non-English input → English refusal** — no localized turn exists in the match array (all 15 prepared turns are `language: 'en'`); hi/mr/ta input falls to `boundary-stop` in English. The localized chips on mobile home are the entry to this trap. Fix: localized fallback turn (translated boundary stop) + localized triggers for the three chips (they are known questions with known turns — route them explicitly).
3. **Onboarding language never reaches the engine** — `MobileOnboarding.tsx:106` sets only `selectedLanguage`; `DemoContext.language` stays `'en'`. The fully-translated arc exists but only `?lang=` deep links engage it. Fix: onboarding calls `useDemo().setLanguage`; collapse the two language states into one.

## 36. P1 FINDINGS

1. No error boundary / route `errorElement` — a thrown render shows the router's unstyled dev screen in a trust product.
2. `triage` stage listed in `STAGE_NAMES` with no renderer — near-empty screen (the file's own comment records fixing this class of bug for `assess`).
3. AI answers not announced (`aria-live` on progress but not on the mounted answer).
4. Escalation copy never names a channel on stops (1915/legal aid/e-Daakhil live only in advice copy).
5. No emotional-distress vocabulary anywhere; no acknowledgment-class turn.
6. Mobile language control is dead post-onboarding (TopBar chip removed; Profile row dead-ends).
7. Non-EN clarify parity (1 vs 3 options) hides the safe expiry/source-gap routes.
8. Unmounted `LanguageBottomSheet`/`MobileInputDock` — the designed language surface exists and is wired to nothing.
9. Stop-tier 3-tier risk chip / receipt / gate-trail (REDESIGN-PLAN P2–P4, DECISION-INTERACTION S0/S4) — the design-of-record trust layer, unbuilt.
10. Desktop chat seeds an answer before any question (`/desktop/chat/consumer`).

## 37. P2 FINDINGS

Glossary always English (dead `GLOSSARY_I18N`); two-year limitation asserted as fact in clarify/flashcards (flashcard date computed from the disputed invoice date) vs undecidable in the stop; `fact-confirmed` silently resolves the date dispute toward the seller-chat date and carries `draftAllowed: true`; progress beat narrates "Checking the Consumer Protection Act, 2019" over refusing inputs; Files "Original" dead promise; no focus trap in Sheet; 32px unlabeled demo controls; breadcrumb span not keyboard-accessible; no privacy surface (Profile row dead-ends); copy feedback not announced; NotFound sends mobile users to desktop; scenario switch keeps stale messages; boundary-stop needs humanized copy once reachable; "Professional guidance recommended" register; `conflicting-rules-stop` scenarioId `conflicting_jurisdiction` matches no scenario key.

## 38. P3 FINDINGS

Comment says 16 turns, array has 15 (responseTurns.ts:137); dead code (`Root.tsx`, `RootEmpty.tsx`, 5 `shared.tsx` exports, `SpecimenLabel`); Home-hero mic glyph vs honest label; desktop narrow-width dead rail zone; mount-only responsive redirect; `replayProgress` trigger-reconstruction fragility; clipboard failures silently swallowed (fine, but unlogged in audit).

## 39. MISSING STATES

User-refuses-clarification escape; "I don't know" branch; challenge/“are you sure?” responses; distress acknowledgment; success/partial-success terminal distinction; returning-user (no persistence — contract, but then entry copy should say so); language-mismatch state (today silent); focus-visible state on demo controls; empty state for unknown deep-link params; error boundary states.

## 40. MISSING FLOWS

Typed-input → correct-tier turn (the whole engine, effectively); mobile language change post-onboarding; escalation handoff packet (context carried to the human); document → notice-reader link from Files; privacy surface; interruption/recovery (contract-limited, needs at least copy); clarify skip.

## 41. MISSING SYSTEM BEHAVIORS

Ask-first echo (S0); receipt + gate trail (S4) + cross-turn spine (S5); consequence-scaled *narrated* timing (current beat is uniform-generic per walkthrough, though per-mode delays exist in code); live gate recompute on fact flip; localized refusal turns; localized stop screens; scenario-switch state reset; error boundaries.

## 42. RECOMMENDED CONVERSATION ARCHITECTURE

Three moves, in order: (1) **Wire the input** — typed text resolves by text first; scenario id only from the picker; the 8 scenario user-messages become the canonical eval set. (2) **Echo before ask** — the clarify middle becomes input-aware: restate the understood intent in one line (S0) even when the classification is "outside prepared examples"; this single change converts both P0 mismatches into honest seams. (3) **Refuse in the user's language** — a translated boundary-stop + localized triggers for the 12 prepared chips (chips are known intents; they should route by id, not by text matching at all).

## 43. RECOMMENDED TRUST ARCHITECTURE

Ship the design-of-record: gate-trail line in the working beat slot; receipt ("Why this response?" → gate · rule · because · humanLine · policyVersion); Zone 4 materializing when grounded<total; live recompute on fact correction (already half-built — the audit trail exists, it is simply not surfaced as the receipt). Keep integers; never percentages (the gate already enforces this).

## 44. RECOMMENDED EMOTIONAL UX MODEL

One new turn class is sufficient for the prototype: **acknowledge** — matches a distress vocabulary (~10 phrases per language), returns a short acknowledgment + the safest grounded next step + the human path, never a draft. Everything else already exists; the stop screens carry the emotional weight correctly once reachable.

## 45. RECOMMENDED HUMAN HANDOFF MODEL

Put the channels on the stop: primary "Call 1915 (free, government helpline)" / "Find your district legal aid"; secondary "Keep this summary". Build the §4.3 handoff packet: the receipt + confirmed facts + evidence checklist as one printable page — the code already owns every piece (audit events, facts, checklist); it only needs assembly.

## 46. BEFORE → AFTER CORE JOURNEY

Before (today, organic mobile path): Hindi onboarding → English home greeting → Hindi chip → English clarify about purchase date → English confident answer with draft CTA → any Hindi follow-up → English refusal. Trust arc: misplaced confidence → betrayal.

After (P0 fixes + S0): Hindi onboarding → Hindi echo ("आपकी समस्या: रिफंड — ✓ 2 तथ्य पक्के, 1 बाकी") → Hindi clarify → Hindi explain with claim ledger → Hindi follow-ups resolve or refuse in Hindi with 1915 named. Trust arc: earned, calibrated, continuous.

## 47. PORTFOLIO-WORTHY DESIGN DECISIONS (keep, and say them loudly)

`draftAllowed` refusal outranking the autonomy dial (six enforcement sites, one line of law); the planted verification catch (disputed fact + conflicting exhibit + correction resetting draft approval); integer claim ledgers with a machine gate banning fake precision; citizen-voice status vocabulary with tone attached; the honest 12-registry/4-prepared language model; full-bleed tonal inversion for stops with "Continue anyway" suppressed at human-required tiers; the verify:demo integrity gate itself — an honesty CI. What prevents senior-level feel today: the engine seam (P0-1) means the demo's deepest safety decisions are invisible in its primary flow — a senior reviewer who types anything will drift. Fix the wiring, then the receipt layer, and the artifact matches its docs.

## 48. IMPLEMENTATION ROADMAP

**Phase 1 — Safety/trust wiring (P0).** Goal: input reaches the engine. Files: DemoContext.tsx (resolve call), responseTurns.ts (localized boundary turn + chip-id routing), MobileOnboarding.tsx (+setLanguage), languagePacks.ts (collapse states or sync helper). Changes: text-first resolution; localized fallback; language single-source. Dependencies: none. Impact: every typed input produces an honest response. Tests: T01–T15, T37.
**Phase 2 — Core journey coherence (P1).** Error boundary + route errorElement; triage renderer or removal; aria-live on answers; stop screens name 1915/legal aid; mobile language control (mount LanguageBottomSheet); clarify parity packs. Tests: T16, T22, T42, T46, T47.
**Phase 3 — State machine completion (P1).** Clarify escape/"I don't know"; scenario-switch resets messages; ack turn (distress vocabulary); unknown-param empty states. Tests: T18, T24, T52, T53.
**Phase 4 — Conversational UX (P2).** S0 echo line; desktop seed → empty state; challenge responses; microcopy pass (HumanReviewCard, QuickChips heading). Tests: T10, T12, T38.
**Phase 5 — Document/multilingual (P2).** Wire GLOSSARY_I18N or delete; Files→notice-reader link; hi/mr/ta stop-screen copy or explicit language note. Tests: T20, T22, T30.
**Phase 6 — Action/handoff (P2).** Handoff packet (printable summary: facts + checklist + receipt-as-audit); escalation stage upgrade. Tests: T43.
**Phase 7 — Design system (P2).** One `ModeSurface` from the desktop rail; one `ClarifyOptions`; delete dead chrome. Tests: T54.
**Phase 8 — Visual polish (P3).** Mic glyph honesty; 32px demo controls; narrow-desktop rail; 404 recovery. Tests: T29, T50, T51.
**Phase 9 — Validation.** All 54 test cases as a manual pass script in /dev; harness-local event log for the 8 metrics; full `?lang=hi` journey recording for the case study. Gate: `npm run verify:demo && npm run typecheck && npm run build` at every phase boundary.

## 49. FINAL USER SIMULATION — "I received a legal notice, I think in Hindi, I'm scared" (actual implementation)

1. **Intent:** understand the notice, in Hindi. **System:** onboarding records her choice in `selectedLanguage` only. **UI state:** Hindi chips, English greeting. **Emotion:** relief at seeing her script. **Trust:** initial.
2. She taps "खराब मिक्सर, रिफंड मना". **System:** first call → clarify middle, input ignored, `DemoContext.language='en'` → **English** clarify: "When did you buy the mixer?" **Emotional:** confusion — it answered a question she didn't ask, in a language she didn't choose. **Risk:** she now doubts her own reading, not the system's.
3. She types, in Hindi, "मुझे नोटिस मिला है, मैं डर गई हूँ" (I got a notice, I'm scared). **System:** no localized turn in the array → **English boundary-stop**: "This question is outside the prepared LokAI prototype." **Emotional:** fear confirmed — the machine didn't understand her. **Trust state:** broken at the exact moment the product exists for. **Control:** she can open the prepared example (English) or nothing.
4. Had she deep-linked `?lang=hi` (the portfolio-tour path): Hindi clarify → one Hindi chip (not three) → Hindi explain, fully translated, hedged, integer-ledgered → draft CTA → ReviewGate. The product she was promised exists — behind a URL parameter.
5. **Resolution:** appropriate escalation never happens, because the system never learns her language and never reads her words. The single change that rewrites this simulation is Phase 1: wire the input, wire the language. Everything downstream already works.

## 50. THE MOST IMPORTANT QUESTION

**If you removed all visual polish and showed only the interaction logic, would this still demonstrate strong product design?** The *design* would: the state machine, the refusal-outranks-preference law, the verification catch, the integer trust ledger, and the failure taxonomy are genuinely senior work, visible in code and gates. The *implementation* would not — today the interaction logic demonstrably does not connect user words to system decisions on its primary path. The design reasoning is senior; the wiring is a demo-of-the-docs rather than a demo-of-the-product.

**Does LokAI currently behave like a chatbot, a conversational assistant, a trustworthy civic/legal copilot, or a human-AI decision-support system?** By implementation: **a scripted conversation simulator with copilot-grade scaffolding** — it cannot copilot because it does not yet listen (P0-1) and does not yet speak the user's language (P0-2/3) on its own front door. The scaffolding — gates, ledgers, stops, review — is decision-support architecture awaiting an engine. What must change to reach the next level, exactly: (1) text-first resolution, (2) one language truth, (3) the receipt/gate-trail layer of record. With those three, the answer changes to human-AI decision-support — within its consumer-refund boundary, which it states honestly and enforces everywhere except, today, the input box.

---

*Audit evidence: four implementation sweeps + direct verification; gates run 2026-09-28 (verify:demo PASS ×10, typecheck clean). No code was modified.*
