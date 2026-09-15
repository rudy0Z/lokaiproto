# The LokAI Upgrade — progress report & decision log (Phases 1–8)

**Status:** Phases 1–8 complete. Mobile finalized 2026-09-04. Commits `d2a074f → f4405bc` (+ `91adc1f` follow-up) on `feature/single-matter-guardrails`.
**Read with:** `HANDOFF.md` (terse log, latest first) · `DESIGN_AUDIT.md` (the audit that started this) · `LLM_DESIGN_SYSTEM.md` (the build sheet that resulted).
**This document owns:** *why* the upgrade did what it did — the reasoning, the rejected alternatives, and the validation. `HANDOFF.md` owns the terse "what landed."

---

## 0. TL;DR

Between 2026-09-03 and 2026-09-04 the mobile app was rebuilt across eight phases, driven by the three findings in `DESIGN_AUDIT.md` (2026-08-28): **no motion, no conversational middle, two visual dialects.** All three are closed, plus dark mode, a voice pass, and a flow audit that caught three product-logic bugs. Every claim is machine-enforced where possible: a WCAG contrast gate (both themes), a UI-debt ratchet that only falls (686 → 572 raw-style lines), zero left-stripes, zero border+shadow pairs, zero raw hex literals in mobile screens. Desktop is explicitly deferred as its own stage.

---

## 1. Where it started

The 2026-08-28 audit asked one question: *why do Gemini/ChatGPT read as refined while LokAI reads as barely refined?* The answer was three things, not one:

1. **Motion** — the mobile chat mounted instantly; the three-tier answer popped in via conditional render; `MOTION` tokens existed but were barely used.
2. **The conversation had no middle** — one user message jumped straight to a complete three-tier answer. The clarify mode existed in the engine but was never sequenced into the chat.
3. **Two visual dialects** — migrated primitives (home, notice, files) versus legacy stage internals (`LokAIWorkflow.tsx` — bordered boxes, twin buttons, "Step 4 of 6").

The audit's own conclusion holds: none of this was a rewrite; all of it was finishing. But the finishing had to be *organized*, or it would drift again — which is why Phase 1 built enforcement before beauty.

The strategic frame, set by the product owner: **mobile users are the majority; ship a complete mobile app first.** Desktop became a separate stage (Phase 7) with its own detail+QA layer, explicitly out of scope until mobile is fully done and the case study is written from mobile evidence.

---

## 2. Phase-by-phase — what shipped and why

### Phase 1 — Foundations: enforcement before beauty (`d2a074f`)

**What:** `src/app/ui/motion.tsx` (FadeRise/Stagger/WorkingDots/ShimmerLine/Skeleton/StageTransition/NumberTicker/useHaptic); a WCAG contrast gate inside `verify-demo.mjs`; `data/statusVocabulary.ts`; dead code deleted.

**Why enforcement first:** the audit found that drift landed "wherever the build guard was not looking" — `verify-demo.mjs` guarded radius/type/shadow but never color, so 215 raw hex literals accumulated while everything else held. The contrast gate parses the `--role-*` layer from `index.css` for **both themes**, resolves `var()` chains, composites alpha colors, and fails the build below 4.5:1 (text) / 3:1 (UI). A partial dark theme fails as incomplete — a partial theme must not half-pass. The ratchet (`ui-debt.mjs`) gives every file a raw-style budget that may only fall.

**Why this matters beyond hygiene:** it makes design claims mechanical. The claim "WCAG AA in both themes" is not aspirational documentation — it is a build step. That became a Tier-2 decision story in the case study.

**Dead code deleted:** WorkflowTrustPanel, FilingPacketPreview, GuidancePreferences, InlineLinkButton, the shadowed FailureStateCard render, and later CitationStamp — each removed with a note pointing to its successor, so the repo's first impression (`git status`, `git log`) reads maintained.

### Phase 2 — the chat-first spine (`a0d7f0b`)

**What:** the clarify middle; the working card and its collapse-to-audit-line; tool sheets; stream motion; "Step N of 6" killed.

**The reasoning that shaped it:**

- **The clarify question is not decoration.** The first consumer exchange asks the purchase date because the answer *routes the next turn*: inside the two-year window → the full explanation; outside it → the statute-expiry stop; unsure → the honest partial answer. One question, three policy outcomes. That is the difference between a chat that performs thoughtfulness and one that uses the answer.
- **The working card names what the model does — and never says "checking the facts."** Facts are the *user's* job in this product (the verification gate); a progress card claiming to check facts would quietly contradict the ownership thesis. Stages read "Reading what you shared · Checking the Consumer Protection Act, 2019 · Matching the law to your facts."
- **No duration badges, no fake streaming.** Prepared turns are staged for comprehension, not latency theatre. Industry guidance is blunt — don't fake latency on real streaming — and the same principle applied to a demo: the pacing is *staging*, labeled as such. When probed in a review, this is a defensible decision, not an oversight.
- **The audit line.** When the answer lands, the working card collapses *in place* (same key — no scroll jump) to "Checked the Consumer Protection Act, 2019 · 4 of 5 claims trace to a source," tappable through to the full audit trail. The answer keeps its provenance marker above it permanently.
- **Tool sheets, not routes.** Verify/plan/packet/audit/escalation open as contained bottom sheets from response chips. The `?stage=` routes remain as the deep-link state gallery (the portfolio tour depends on them), but nothing in the chat navigates to them — "Step N of 6" was a linear-wizard signal inside a non-linear product.
- **Auto-scroll guard:** the scroll viewport ref is threaded through `Screen → AppScreen` so auto-scroll only follows when the user is already at the bottom.

### Phase 3 — composer + primitives (`4c28a87`)

**What:** `CitationChip` (section-first, Perplexity-pattern, `+N` overflow, non-interactive mode for rows), `AttachmentChip` tray, `Textarea`/`Switch` promotions, the "Jump to latest" pill, CitationStamp deleted.

**Reasoning:** citations render `S.2(10)` — section-first, the way a legal reader scans — with the full authority in the tooltip; repeating "Example — verify with a lawyer" on every chip was the disclaimer as noise (L7). The notice composer gained a **pending attachment tray**: pick → chip → send, so documents follow the same review-before-commit contract as voice transcripts and the demand notice. `Textarea` forwardRefs so a fact chip can select its own words in the transcript (used in Phase 4).

### Phase 4 — voice (`1458073`)

**What:** `extractEntities()` → fact chips at the confirm phase (voice screen + case intake); the orb's live amplitude envelope; desktop mic timing parity; the two specimens (`voice-capture`, `voice-unclear`).

**Reasoning:**

- **The chips are derived by pattern, honestly.** No model runs in the demo, so chips come from regexes over the user's actual words — a chip appears only for something the transcript genuinely contains. Tapping a chip selects those exact words in the editable transcript: the fact points back at the user's own sentence instead of asserting itself.
- **The orb breathes.** Listening bars follow a gentle simulated envelope (spring-smoothed, reduced-motion aware) instead of a uniform CSS loop — real speech breathes; a metronome doesn't. The demo requests no microphone, and the honesty line on the voice screen says so.
- **Desktop mic timing 650 → 1100ms** so the transcribing beat is legible on both surfaces.

### Phase 5 — dark theme (`21c4bf5`)

**What:** the measured dark palette in `[data-theme="dark"]`; the C palette re-pointed to `var(--role-*)`; theme state (light/dark/system) in ConversationContext; MobileShell applies `data-theme`; the Profile Appearance row cycles.

**The reasoning, stated as the system it is:**

- **"The cream becomes the ink."** Light is paper in daylight; dark is paper under a desk lamp. The warm cream moves from ground to figure — it becomes the text *and* the single accent — while navy becomes the ground. Built from brand colors, not a borrowed neutral ramp.
- **The anchor inverts; L5 survives.** In light, navy is the one dark element (composer + primary CTA + stop ground). In dark, cream is the one light element. The single-anchor discipline is preserved; only the direction flips.
- **L8 holds by construction.** `--role-stop-ground` re-points to cream in dark, so the refusal is warm and luminous — still the tonal opposite, direction flipped. Inverting the palette naively would have made the refusal disappear into a dark app; this way the contrast *relationship* is the constant.
- **Paper stays paper.** `--role-paper` is `#FBF9F3` in both themes — a notice under a desk lamp at night is still a white page. The one deliberate exception, and it is the metaphor made literal.
- **The C-bridge move.** Every semantic entry in `shared.tsx`'s `C` object became `var(--role-*)` instead of a hex — so dark mode was a role re-point, zero call-site edits, instead of a hundred-component migration. The one exception: surfaces *animated* by motion/react (the orb's crossfade) resolve their literal at animation time, because `var()` does not interpolate through the JS bridge.
- **Scope: mobile only.** Desktop never sets `data-theme` and resolves the light `:root` values unchanged.

### Phase 6 — the seam closes (`6a6f7a5` + `91adc1f`)

**What:** every legacy component in `LokAIWorkflow.tsx` migrated onto the composition law; Turn reformed; the case views cleaned; the retired tab bar deleted.

**The reasoning per pattern:**

- **Ground-level over boxes (L1).** GroundingMeter, LokAIProgressList, WorkflowActionPlan, FirstActionChecklist lost their outer boxes — a meter is a reading, not an object. The Card test ("could the user pick this up and move it?") is what separates a source card (keeps a container) from a progress reading (doesn't).
- **Every twin-button pair died.** "Mark done / I'm blocked", "It's correct / Fix it", "Save / Cancel", ReviewGate's 1fr-1fr grid, UnsupportedMatterCard's side-by-side — all became one primary + one quiet text link. Two same-shaped buttons was the form-wizard tell, and on the high-risk stop it was what made "Continue" as loud as "Find legal aid."
- **All left stripes died.** The colored file-tab border was the single most generic pattern in the app. Coverage and risk now travel in `Badge`s whose label *and* tone come from `statusVocabulary.ts` — the same state can never ship under two names again (audit V4: "Conflicts a fact" vs "Needs a check").
- **ReviewGate kept its behavior, lost its costume.** The 3px oxblood top border, the asymmetric radius, and the border+shadow pair went; the consent gate — nothing leaves unread — is untouched, because it is the product decision.
- **Turn zone-1 became serif.** The chat answer now speaks in the same register as the assess screen: Fraunces 22px, no caps eyebrow above it (L4 — the type *is* the label). Indic scripts take the script sans at weight 500, per the Latin-only-display-serif decision. This landed on desktop for free — the shared-component dividend.
- **The clarify options became hairline rows.** The old options had a fake pre-selection (one was highlighted but all did the same thing). Rows with a chevron: the tap *is* the answer.

### Phase 8 — flow audit, skeletons, haptics, icon era (`f4405bc`)

**The flow audit found three product-logic bugs before the case study could ship them:**

1. **Double-send.** The composer wasn't disabled while a working beat ran — a second send would fork the progress controller and duplicate the stream. Fixed: `disabled={isProgressing}`.
2. **New chat didn't re-arm the clarify.** The clarify gate was a module-level ref; "New conversation" arrived already satisfied and silently skipped the question. `resetConversation()` re-arms it.
3. **The stop-state packet guard.** After a stop (`draftAllowed=false`), the packet tool sheet still fell through to the normal flow. Now it shows GuideOnly with a one-line explanation regardless of the autonomy dial: **the refusal outranks the preference.** This is the kind of consistency a product reviewer probes — does the refusal actually bind everywhere?

**Also landed:** a content-shaped skeleton on the notice screen's staged read (the placeholder is page-shaped, because what's arriving is a document — not a spinner); the composer's focus ring moved to the role tint so it re-tints; the icon era unified (MobileHome + LokAIWorkflow off Lucide onto the aliased `ui/icons` set; three tiers documented in the build sheet — bespoke composer glyphs, animated aliases for chrome, static Phosphor in reading content); haptics at the four trust moments, each firing **on the state change** — the settle (fact confirmed), the unlock (gate consent), the stop (refusal acknowledged), the commit (voice words become the matter input); the `living-action-plan` specimen.

---

## 3. Validation — what is machine-enforced vs what needs eyes

**Machine-enforced (runs in `verify:demo` on every commit):**
- WCAG contrast ≥4.5:1 text / ≥3:1 UI, parsed from the role layer, **both themes**
- UI-debt ratchet: raw colour/family/leading budgets per file, falling only (686 → 572)
- Deterministic-demo bans: no network, no microphone, no MediaRecorder, no file inputs
- No fabricated confidence percentages or `groundingScore` anywhere
- Token enforcement: no bare radius/fontSize/boxShadow below the system layer

**Verified by inspection this session:** zero left-stripe borders on mobile; zero border+shadow pairs in mobile pages; zero raw hex in mobile screens; all catalog deep links resolve; reduced-motion verified per primitive.

**Needs the owner's eyes (cannot be machine-checked):** the 390px both-themes walkthrough — whether the stop state *feels* like the most designed screen, whether the clarify middle lands as a conversation rather than a form. The protocol is in the Phase 6 handoff entry; roughly: home → clarify → answer (squint test on the serif), the stop state in light + dark (the poster frames), the voice confirm with chips, the notice reader with clause highlight, new-chat re-arm, then grayscale + 60%-zoom on the capture set.

---

## 4. What remains

### Mobile residuals (small, sequenced)
- ~~Language packs for the two non-explain clarify follow-up turns~~ **DONE (verified 2026-09-15):** `FOLLOWUP_I18N` in `languagePacks.ts` covers hi/mr/ta for both turns, resolved via `localizeConsumerFollowUp`.
- ~~The retired `TopNav` export in MobileHome~~ **DONE (verified 2026-09-15):** the export was deleted outright on 2026-09-06; no `TopNav` remains (MobileHome.tsx carries the retirement note).

### Phase 7 — desktop, a separate stage (~3–3.5 focused days)
Scoped and owned separately per the product owner (2026-09-04). In priority order:

| Item | What | Size |
|---|---|---|
| Rail → live document canvas | `ContextPanel` (four bordered caps groups) becomes a working surface: live `DemandNoticePaper` with editable fields, exhibits, LegalTermPanel as a section. Width ~300 → ~480. | ~1 day |
| Desktop stop composition | Conversation column takes the stop tone; rail swaps to the escalation path — the whole window changes job (L8 at window scale). | ~½ day |
| Notice.tsx rework | Tokenize ~44 raw hex; wire to `noticeInterpretation.ts` (the mobile data file is richer); share PaperTexture via ui. | ~½–¾ day |
| Draft.tsx + Documents.tsx tokenization | Hardcoded hex blocks → roles. | ~½ day |
| Chat.tsx motion promotion | Local ANIM keyframes → `ui/motion.tsx`; duplicates deleted. | ~2 hrs |
| Icon swap + SettingsPanel language collapse | ~12 files Lucide → aliased set; collapse the parallel `LanguageContext.uiLang`. | ~3 hrs |
| Desktop detail + QA (own pass) | Focus craft, empty/loading on rail + Documents, 1440px dead space, embed QA. | ~½ day |

Cut line if compressed: live canvas + Draft/Documents defer; minimal desktop (inherit + rail de-box + stop composition + Notice tokenization) ≈ 1.5 days. Note: Draft.tsx already renders the Phase-6 ReviewGate/Checklist via the shared imports — the seam is largely closed from the mobile side.

### Case study
The v3 content draft is written and awaiting the owner's section mix — see `CASE-STUDY.md` in this folder for the full reasoning and `D:\Portfolio\case-study-copy\lokai-copy-v3.md` for the copy. Then: implement into `app/projects/lokai/page.tsx`, capture the embed set, reconcile the guided tour.

---

## 5. Commit map (upgrade arc)

| Commit | Phase |
|---|---|
| `d2a074f` | P1 Foundations (motion layer, contrast gate, vocabulary, dead code) |
| `a0d7f0b` | P2 Chat-first spine (clarify middle, working card, tool sheets, stream motion) |
| `4c28a87` | P3 Composer + primitives (CitationChip, tray, Textarea/Switch, scroll pill) |
| `1458073` | P4 Voice (fact chips, live envelope, parity, specimens) |
| `21c4bf5` | P5 Dark theme (measured palette, C bridge, theme state) |
| `6a6f7a5` + `91adc1f` | P6 Seam closed (all legacy components + Turn + case views) |
| `39fe481` | HANDOFF updated with the phase record |
| `f4405bc` | P8 Flow bugs, skeletons, haptics, icon era |
| `91adc1f` predecessor context | P6 follow-up (PrimaryButton on-anchor) |

Pre-upgrade context (the original mobile build) lives in `HANDOFF.md`'s historical entries and `MOBILE_AI_SYSTEM.md` §4.

