# LokAI AI-First Product Elevation Plan

Date: 2026-06-01

Role target: Product Designer, AI-first Product Experiences, EY CTO Office

Working positioning:

> LokAI is the calm, step-by-step navigator for first-time legal encounters in India.

This document converts the current LokAI audit, portfolio review notes, upgrade plans, and recent product discussions into a disciplined product direction. It is not a visual redesign brief. It is a product decision document for deciding what should be implemented, simplified, deferred, or removed before updating the 2026 case study.

## 0. Context Used for This Plan

This plan is based on the full current-state audit of the LokAI codebase and documentation, not only on the Gemini discussion notes.

Inputs considered:

- Current React/Vite application structure.
- Existing desktop and mobile routes.
- Existing AI service hooks for NVIDIA and Sarvam.
- Current chat, dashboard, notice interpreter, draft, document, and mobile flows.
- Existing case study HTML.
- Existing design changelog and imported product/design prompts.
- LokAI AI upgrade strategy documents.
- Portfolio review extraction notes.
- 2026 AI Product Designer case study blueprint.
- Gemini discussion notes around calm UX, legal triage, action planning, scanner scope, form-filler scope, and criminal/legal boundaries.
- EY Product Designer, AI-first Product Experiences role expectations.

The core interpretation:

LokAI already has strong raw material: structured legal responses, multilingual direction, voice/OCR hooks, notice interpretation, drafts, desktop/mobile surfaces, and an ethical AI-restraint thesis. The work now is not to invent a totally new product. The work is to prune, connect, and harden what exists into one coherent AI-first product story.

## 1. Role Calibration

The EY role is looking for evidence that a designer can:

- Frame ambiguous, complex problems.
- Translate domain complexity into simple workflows.
- Design AI-first, automation, ML, and agentic AI interactions.
- Work across product, engineering, AI/ML, and domain experts.
- Show systems thinking, not just polished screens.
- Explain trade-offs clearly.
- Prototype and support implementation.
- Use AI as part of the design process.
- Create high-clarity product experiences for serious workflows.

LokAI should therefore not present itself as "a pretty legal chatbot." It should present itself as a bounded AI product system for anxious citizens navigating high-stakes civic/legal decisions.

The case study needs to prove four things:

1. The problem is specific and high-stakes.
2. The scope is intentionally narrow.
3. The AI behavior is governed, explainable, and recoverable.
4. The final workflow turns uncertainty into action without creating false authority.

## 2. Current Product Baseline

### What LokAI currently is

LokAI is currently a high-fidelity prototype for Indian legal guidance. It is best described as a bounded legal/civic assistant, not a production legal system.

The product currently helps users:

- Ask legal/civic questions.
- Receive structured legal assessment cards.
- See citations and a context panel.
- Interpret a sample legal notice.
- Generate or preview legal drafts.
- Browse a small document library.
- Use mobile onboarding and multilingual demo flows.
- Use voice and document parsing hooks when API keys are available.

### Current information architecture

Desktop is currently broader than mobile:

- Dashboard.
- Ask a question/chat.
- Notice interpreter.
- Document draft.
- My documents.
- Settings/language preferences.

Mobile currently includes:

- Login.
- Onboarding.
- Home.
- Hindi, Tamil, Marathi chat demos.
- Out-of-scope boundary chat.
- Voice screen.
- Profile.

This is a useful base, but the case study should not present every surface as equally important. The strongest story is mobile-first citizen triage plus action planning, with desktop as secondary support.

### Current AI implementation

The current service layer includes:

- NVIDIA chat completion proxy.
- Sarvam speech-to-text.
- Sarvam text-to-speech.
- Sarvam OCR/document parse.
- Hardcoded structured demo responses when API keys are missing or API calls fail.
- Keyword-based out-of-scope detection.
- Prompted JSON output for response cards.

This is enough to claim an AI-enabled prototype. It is not enough to claim production-grade legal retrieval, verified citations, legal auditability, or full source-grounded reasoning.

### Current UX strengths

- The three-zone response card is a strong foundation: law, user situation, next step.
- Citation stamps and context panels create an early trust pattern.
- Voice, OCR, and multilingual support align well with India-specific access needs.
- The out-of-scope concept already demonstrates AI restraint.
- Draft and document screens show a path from answer to action.
- Mobile onboarding and language flows give the product a citizen-facing shape.

### Current UX gaps

- The product still behaves mostly like a structured chatbot rather than a living legal workflow.
- The action plan is implied through response steps, but not implemented as an interactive stateful timeline.
- Citations are not backed by a visible source system.
- Failure states are underbuilt despite being central to high-stakes AI.
- Human escalation is not implemented.
- OCR upload exists, but extracted text is not yet driving the visible notice interpretation flow.
- Document export claims are stronger than the implementation.
- Some routes and documentation refer to planned screens that are not implemented.

### Current audit evidence

The recommendations in this document are grounded in the following current app evidence:

| Area | Current evidence | Product implication |
| --- | --- | --- |
| Route structure | `src/app/routes.tsx` defines desktop dashboard/chat/notice/draft/documents and mobile login/onboarding/home/chat/voice/profile. | The app already has broad IA, so the upgrade should prune and connect, not add random surfaces. |
| AI service layer | `src/app/services/api.ts` includes NVIDIA chat, Sarvam STT/TTS/OCR, demo fallback responses, and keyword out-of-scope detection. | The prototype can credibly show AI-enabled flows, but source-grounded legal claims need more infrastructure. |
| Conversation model | `src/app/context/ConversationContext.tsx` seeds RTI, deposit, consumer, notice, and boundary cases. | These scenarios should become the core portfolio journey rather than remaining disconnected demos. |
| Chat experience | `src/app/pages/Chat.tsx` includes response cards, thinking states, context panel, voice input, TTS, retry, and copy interactions. | The strongest current screen should be evolved into triage, source transparency, and living action planning. |
| Notice interpreter | `src/app/pages/Notice.tsx` wires OCR upload but still displays mostly static interpretation content. | This should become an OCR confirmation and document-lines flow. |
| Draft/documents | `src/app/pages/Draft.tsx` and `src/app/pages/Documents.tsx` show draft/document outputs, but downloads are not true PDFs. | Keep the action-output concept, but fix export honesty. |
| Shared components | `src/app/components/shared.tsx` contains citation, voice, button, card, and typography primitives. | Reuse the existing system where possible; do not redesign from scratch before product behavior is fixed. |
| Mobile screens | `src/app/pages/mobile/*` includes home, multilingual chat, out-of-scope, voice, and profile. | Mobile should become the main case-study journey, but current screens need to converge into one core flow. |
| Stale/planned surfaces | `src/app/pages/MobileCanvas.tsx`, `src/app/captureRoutes.ts`, and `docs/design-changelog.md` reference some unimplemented or deferred surfaces. | Remove these from case-study claims until repaired or intentionally scoped as future work. |

### Current case study risk

The current HTML case study is strong in product thesis but risky in evidence discipline.

It claims or implies:

- Retrieved citations from curated legal databases.
- Tappable/source-backed citations.
- Broad multilingual capability.
- Production-like legal confidence.
- Human legal aid pathways.
- Full failure-state handling.
- Real document generation.

Some of these are aspirations, not current product behavior. The upgraded case study should label them correctly as prototype, designed system behavior, or future roadmap.

## 3. Product Thesis

LokAI should be narrowed to one core product track:

> A mobile-first AI guide that triages a citizen's legal/civic issue, explains the relevant law in plain language, and converts the situation into a living action plan.

The product should focus on first-time legal encounters where the user is anxious, under-informed, and unsure what to do next.

Recommended v1 scope:

- Tenancy deposit disputes.
- Consumer refund or defective product issues.
- RTI delay or public authority non-response.
- Civic or municipal notices.
- Simple document or notice interpretation inside the guidance flow.

Recommended v1 boundary:

- LokAI does not handle criminal defense.
- LokAI does not replace a lawyer.
- LokAI does not file forms directly into government portals.
- LokAI does not claim legal certainty when source coverage is incomplete.
- LokAI does not show alarmist emergency UI for already-stressed users.

## 4. Product Principles

### Principle 1: Calm over panic

Users may be dealing with eviction, scams, withheld money, or official notices. The interface should reduce panic, not amplify it.

Design implications:

- Avoid bright red emergency states as the default.
- Use calm hierarchy, progressive disclosure, and one clear next action.
- Use alert colors only when the user needs to stop before making a risky action.
- Prefer "needs review" over "danger" when the issue is legally complex.

### Principle 2: Action over explanation

Legal explanation matters only if it helps the user act.

Design implications:

- Every answer should end in a practical next step.
- Use a living checklist or timeline, not a block of legal prose.
- Separate "what this means" from "what to do now."
- Hide future complexity until it becomes relevant.

### Principle 3: Bounded AI over general AI

The product should gain trust by being narrow.

Design implications:

- Start with supported issue categories.
- Ask clarifying questions when facts are missing.
- Show boundaries when the issue is outside scope.
- Escalate instead of improvising on high-risk matters.

### Principle 4: Source-backed guidance over confidence theater

Raw confidence percentages are not enough in legal guidance. A high confidence number can create false certainty.

Design implications:

- Show source coverage, missing facts, jurisdiction assumptions, and source dates.
- Use citation drawers with excerpts and plain-language relevance.
- Mark "AI interpretation" separately from "source text."
- If no source supports a claim, do not present it as legal guidance.

### Principle 5: Human-in-the-loop where risk rises

LokAI should know when to stop.

Design implications:

- Add human escalation for low-confidence, high-stakes, criminal, or ambiguous issues.
- Summarize the user's facts for a legal aid worker or lawyer.
- Preserve an audit trail of what the AI said and why.
- Make the handoff feel like continuity, not failure.

## 5. Keep, Simplify, Drop, Defer

### Keep as core

| Feature | Decision | Reasoning | Case study value |
| --- | --- | --- | --- |
| Intelligent legal triage | Keep | This is the product's core difference from ChatGPT. Users do not know whether they need a landlord notice, consumer complaint, RTI appeal, municipal response, police help, or lawyer. | Shows problem framing, AI classification, and domain complexity. |
| Living action plan | Keep | This turns legal guidance into a manageable path. It is more useful than a long AI answer. | Shows interaction design, state management, and action-oriented AI. |
| Structured assessment card | Keep | The current three-zone pattern is strong: law, situation, next step. | Shows clarity and information architecture. |
| Citation/source explanation | Keep and strengthen | Citations are central to trust, but they must become source-backed rather than decorative. | Shows AI transparency and legal-risk design. |
| Out-of-scope boundary | Keep and strengthen | Restraint is a major part of AI maturity. | Shows ethical AI and guardrail thinking. |
| Voice input and read-aloud | Keep as accessibility support | Voice is important for low-literacy and multilingual use, but it should support the action plan rather than become a separate app. | Shows multimodal AI and India-specific UX. |
| Notice interpretation | Keep, but simplify | Document understanding is valuable, but it should live inside the guided flow. | Shows OCR and multimodal AI without creating a second product. |
| Draft generation | Keep as a reviewed output | Users need something to send or carry. Drafts must be clearly labeled as review-needed. | Shows transition from AI guidance to user action. |
| Desktop dashboard and documents | Keep as supporting surfaces | These already exist and help show product breadth, but should not drive the main case-study story. | Shows implementation depth without bloating the central narrative. |
| Mobile onboarding and profile | Keep lightly | These exist and help frame the citizen product, but should be used only when they clarify activation or language preferences. | Shows end-to-end product thinking. |

### Simplify

| Feature | Simplified direction | Reasoning |
| --- | --- | --- |
| Split-screen document scanner | Replace with an in-flow "critical lines extracted" card. | A full document workspace changes the product into a desktop legal audit tool. For this case study, the calmer citizen-facing flow is stronger. |
| Auto-form filler | Replace with a "filing cheat sheet" and copy-ready field packet. | Government portals are inconsistent. A guided copy packet is more realistic and easier to defend. |
| Criminal/police flow | Convert to boundary plus procedural rights and human escalation. | Criminal matters are high-risk. LokAI should not generate strategy. It can explain basic procedural rights and route to human help. |
| Desktop dashboard | Keep as secondary, not the main story. | The mobile citizen journey should carry the case study. Desktop can support evidence of system thinking. |
| Multilingual support | Show 3-4 deeply designed language moments instead of claiming 12 full languages. | Depth is more credible than unsupported breadth. |
| Current chat responses | Convert from static response steps into living plan states. | The current response structure is good, but it needs state and recovery to feel AI-first. |
| Current notice interpreter | Make uploaded OCR text visible and confirmable. | The OCR hook is valuable, but the user needs to see and validate what the system extracted. |
| Current draft/download flow | Convert from text download to review-ready export or rename honestly. | The current label creates a credibility gap because "PDF" downloads are not real PDFs. |

### Drop from the 2026 case study core

| Feature | Decision | Reasoning |
| --- | --- | --- |
| Heavy split-screen clause inspector | Drop from main flow | Too enterprise-heavy for the citizen product thesis. It creates scope creep and weakens the calm-anchor positioning. |
| Full government portal automation | Drop | This introduces operational complexity the prototype cannot support. |
| Print engine as a flagship feature | Drop as flagship | Useful later, but not the core AI-product story. Real PDF output can remain a supporting feature. |
| Subscription/pricing profile | Drop from case study | It distracts from legal access and trust. Monetization is not the portfolio story. |
| Advocate workspace | Defer | Valuable as an enterprise extension, but it becomes a second product. |
| Language showcase page | Drop from product scope | Language should be proven through flows, not a standalone gallery. |
| "Police takeover" mode | Drop from v1 | The phrase and interaction model can create panic. Use calm escalation instead. |
| Subscription/pricing screens | Drop from case study | Current profile/pricing ideas distract from trust, access, and legal action. |
| Capture-only or stale screens | Drop until repaired | Unimplemented routes and missing imports should not appear in portfolio evidence. |

### Defer as future strategy

| Feature | Future role |
| --- | --- |
| Legal aid worker dashboard | Phase 3 extension for human review queues. |
| Advocate workspace | Phase 3 enterprise/workflow extension. |
| Agent configuration or AI admin panel | Phase 4 if positioning expands toward enterprise AI operations. |
| Full source corpus and RAG pipeline | Needed before production claims, but can be represented as a designed system architecture in the portfolio. |
| Physical filing instructions | Useful after draft generation is stable. |
| Push reminders and wait-period tracking | Strong medium-term upgrade once action plan state exists. |

## 6. Current-to-Future Traceability

This table connects the product direction to the current implementation audit.

| Current product element | Current status | Decision | Upgrade required |
| --- | --- | --- | --- |
| Desktop dashboard | Implemented | Keep as secondary | Use as system context, not case-study hero. |
| Desktop chat | Implemented | Keep and evolve | Add clarifying states, source drawer, failure states, and action-plan handoff. |
| Three-zone AI response card | Implemented | Keep | Add uncertainty, source coverage, and fact checklist. |
| Context panel | Implemented | Keep and strengthen | Turn static citations into traceable source evidence. |
| NVIDIA/Sarvam API hooks | Implemented | Keep | Add schema validation, recoverable errors, and transparent fallback states. |
| Demo fallback responses | Implemented | Keep for prototype | Label clearly and avoid presenting demo responses as live retrieval. |
| Out-of-scope flow | Implemented as concept | Strengthen | Add human/procedural redirects and calmer recovery options. |
| Notice interpreter | Implemented but mostly static | Simplify and improve | Make OCR extraction visible, editable, and connected to the assessment. |
| Draft generation | Implemented as prototype | Keep | Add review gate and real export or honest naming. |
| Documents library | Implemented | Keep lightly | Use as evidence of product continuity, not a central feature. |
| Mobile home and chat demos | Implemented | Keep as primary direction | Rework around triage and action plan rather than separate demo chats. |
| Mobile voice screen | Implemented | Keep | Connect voice input to the core triage flow. |
| Mobile profile/pricing | Implemented | De-emphasize | Remove from main case study unless needed for language/access preferences. |
| Missing mobile failure screens | Not implemented | Add | Required for 2026 AI case-study credibility. |
| Advocate workspace/language showcase | Planned/stale | Defer/drop | Do not claim as current product. |
| Legal source/RAG layer | Not implemented | Add as roadmap/system design | Required before claiming retrieved citations. |
| Human escalation | Not implemented | Add as designed workflow | Critical for high-stakes AI trust. |
| Audit trail | Not implemented | Add lightweight version | Strong EY alignment: governance, reviewability, accountability. |

## 7. Recommended Product Shape

The strongest portfolio version of LokAI should center on one end-to-end journey:

> A tenant receives a confusing legal notice or has a deposit withheld. LokAI calmly triages the issue, asks only the missing questions, explains the law with cited sources, creates a living action plan, and prepares a review-ready demand notice or filing packet.

This journey is narrow enough to implement and broad enough to demonstrate AI-first product thinking.

Target flow:

1. User opens LokAI in a stressed state.
2. LokAI asks for the issue in text, voice, or photo.
3. AI detects category, language, jurisdiction, and risk level.
4. If facts are missing, LokAI asks one question at a time.
5. LokAI shows a structured assessment:
   - What this appears to be.
   - What law or rule may apply.
   - What facts matter.
   - What is uncertain.
6. User opens source details if they want proof.
7. LokAI generates a living action plan.
8. User marks progress or reports a blocker.
9. LokAI updates the plan.
10. If risk rises, LokAI escalates to human help or tells the user what official channel to use.
11. LokAI creates a review-ready cheat sheet, letter, or complaint draft.

## 8. Feature Specification

### Feature A: Intelligent Legal Triage

Status: must implement.

Purpose:

Classify the user's situation into a supported legal/civic route while detecting risk, missing facts, language, and jurisdiction.

What it should do:

- Identify supported category: tenancy, consumer, RTI, civic notice, document explanation.
- Detect unsupported category: criminal defense, medical, finance, entertainment, general advice.
- Detect high-risk terms: eviction, police, assault, fraud, threat, arrest, court summons.
- Ask clarifying questions before giving guidance when facts are missing.
- Show the user a calm "I need one more detail" state instead of pretending certainty.

UX pattern:

- One question at a time.
- "Why we ask" microcopy hidden behind a small info affordance.
- User can answer by tapping choices, typing, speaking, or uploading proof.

AI-first value:

This demonstrates classification, uncertainty handling, and workflow routing.

Do not:

- Show a complex taxonomy to the user.
- Ask a long intake form at the start.
- Present criminal matters as normal self-service workflows.

Current app connection:

- Builds on the existing chat flow and out-of-scope detection.
- Needs to move beyond keyword-only classification.
- Needs a visible "missing facts" state before assessment.

### Feature B: Living Action Plan

Status: must implement.

Purpose:

Convert guidance into a sequence of manageable actions.

What it should do:

- Show the current step first.
- Collapse later steps by default.
- Let the user mark a step as done, blocked, or not applicable.
- Update the plan based on the user's response.
- Track waiting periods such as "wait 15 days after written notice."
- Offer reminders as a design pattern, even if push notifications are not technically implemented yet.

UX pattern:

- Vertical timeline.
- Current step highlighted with a calm accent.
- Each card has:
  - Task title.
  - Why this matters.
  - What to prepare.
  - Expected time.
  - Primary action.
  - "I am blocked" secondary action.

AI-first value:

This shows AI as an adaptive workflow manager, not just a response generator.

Do not:

- Dump all legal process steps at once.
- Use urgent visual treatment for every step.
- Make the user feel they are failing if they cannot complete a step.

Current app connection:

- Builds on the existing "WHAT YOU CAN DO" steps in AI responses.
- Converts static bullets into interactive step states.
- Should become the centerpiece of the upgraded product.

### Feature C: Source-Backed Assessment

Status: must implement.

Purpose:

Make AI guidance auditable and trustworthy.

What it should do:

- Separate source text from AI interpretation.
- Show the legal section, source name, jurisdiction, source date, and plain-language relevance.
- Indicate whether the source directly supports the answer or is only related context.
- Show missing source coverage when the system cannot verify a claim.

UX pattern:

- Assessment card remains simple.
- Citation chip opens a source drawer.
- Drawer includes:
  - Source title.
  - Section reference.
  - Short excerpt.
  - "How LokAI used this."
  - Source confidence category: direct, related, missing, conflicting.

AI-first value:

This is central for EY-level trust, governance, and high-stakes AI design.

Do not:

- Use raw confidence percentages as the main trust signal.
- Claim legal certainty from an LLM-only response.
- Show citations that cannot be traced to a source.

Current app connection:

- Builds on the existing citation stamp and context panel.
- Requires a new source registry or mocked source dataset before case-study claims are upgraded.
- Should correct the current gap between case-study claims and actual code behavior.

### Feature D: Failure and Recovery States

Status: must implement.

Purpose:

Show that LokAI handles non-deterministic AI behavior responsibly.

Required states:

| Failure state | Trigger | User-facing recovery |
| --- | --- | --- |
| Missing facts | AI cannot classify or advise safely | Ask one clarifying question. |
| Source gap | No reliable citation found | Explain limitation and offer general next step or human help. |
| Conflicting sources | Two laws or jurisdictions may apply | Show uncertainty and ask location or document date. |
| OCR unreadable | Uploaded document is low quality | Ask user to retake photo or type the visible line. |
| Language uncertainty | System is unsure of language or mixed language | Ask user to confirm preferred language. |
| Network/model timeout | AI service fails | Preserve input and offer retry or offline checklist. |
| Out of scope | Issue is outside supported scope | Redirect to appropriate channel without shame or panic. |
| High-risk legal matter | Criminal, court, arrest, threat, violence | Stop self-service generation and route to human/procedural help. |

AI-first value:

Failure-state design is one of the clearest ways to show maturity in AI product work.

Do not:

- Hide failures behind generic errors.
- Use fear-based red warning screens.
- Keep the input box open when the product should stop self-service guidance.

Current app connection:

- Existing code has some loading and inline error behavior, but not a full AI failure-state system.
- Missing screens should be treated as must-build portfolio evidence.
- The product should show recovery paths, not just errors.

### Feature E: In-Flow Document Understanding

Status: implement as a support feature, not a separate workspace.

Purpose:

Help the user understand a notice or document without turning LokAI into a legal document review suite.

What it should do:

- Accept a photo or PDF.
- Extract the most important 2-3 lines.
- Explain what each line likely means.
- Ask the user to confirm if the OCR text is correct.
- Connect extracted facts to the action plan.

UX pattern:

- Inline "Document lines found" card.
- Each extracted line has:
  - Original text.
  - Plain-language meaning.
  - Why it matters.
  - Confirm/edit control.

AI-first value:

This demonstrates OCR, multimodal intake, and human verification.

Do not:

- Build a full split-screen document workspace for the core case study.
- Present OCR as infallible.
- Let the AI act on extracted text before user confirmation.

Current app connection:

- Builds directly on the existing Sarvam OCR hook and notice interpreter.
- The visible UI should stop being static once a user uploads a document.
- The user should confirm OCR text before the AI interprets it.

### Feature F: Filing Cheat Sheet

Status: implement instead of auto-form filler.

Purpose:

Bridge AI guidance with messy real-world legal and government processes.

What it should do:

- Summarize all fields the user will need for a portal, complaint, or office visit.
- Provide copy-ready field values.
- Explain where each value came from.
- Let the user edit before using.
- Export or copy as a simple packet.

UX pattern:

- "Ready for filing" sheet with sections:
  - Your details.
  - Opposite party details.
  - Issue summary.
  - Evidence list.
  - Legal basis.
  - Requested remedy.
  - Next place to submit.

AI-first value:

This shows practical automation without pretending to control external systems.

Do not:

- Claim LokAI submits to government portals.
- Automate legal filing without review.
- Hide editable fields.

Current app connection:

- Builds on current draft and documents screens.
- Replaces the unsupported auto-form filler idea.
- Fixes the current "PDF" credibility issue by making output reviewable and explicit.

### Feature G: Human Escalation

Status: implement as designed workflow, even if actual partner integration is mocked.

Purpose:

Create a responsible endpoint when AI should not continue alone.

What it should do:

- Trigger on high-risk, unsupported, low-source, or user-requested cases.
- Generate a concise case summary.
- List evidence already provided.
- Show what the human reviewer will see.
- Offer legal aid or lawyer handoff options.

UX pattern:

- "This needs human review" card.
- Calm explanation.
- Prepared summary preview.
- Clear next action.

AI-first value:

This demonstrates human-in-the-loop systems, governance, and trust design.

Do not:

- Frame escalation as failure.
- Keep giving legal strategy after the risk threshold is crossed.
- Make vague promises such as "a lawyer will solve this."

Current app connection:

- Extends the current out-of-scope and high-risk boundary concept.
- Can be mocked as a legal aid handoff summary without requiring real integration.
- Should be part of the case study because it proves AI restraint.

### Feature H: Governance and Audit Trail

Status: implement as a lightweight product layer.

Purpose:

Show the system can explain what happened after the fact.

What it should track:

- User input.
- AI classification.
- Missing facts requested.
- Sources used.
- Drafts generated.
- User confirmations.
- Boundary or escalation triggers.
- Model/source version labels.

UX pattern:

- User-facing "case history" timeline.
- Optional "export summary" for legal aid or personal record.

AI-first value:

This maps strongly to enterprise AI expectations: accountability, observability, and reviewability.

Do not:

- Build an internal admin dashboard yet.
- Overload the citizen with technical AI logs.

Current app connection:

- Builds on existing conversation history and document records.
- Should be user-facing first: "case history" rather than internal telemetry.
- Can later support enterprise/legal-aid review workflows.

## 9. Product IA After Pruning

### Mobile primary IA

- Home
- Start a case
- Current case/action plan
- Documents
- Help/profile

### Core case surfaces

- Triage conversation
- Assessment card
- Source drawer
- Action plan timeline
- Document extraction card
- Filing cheat sheet
- Human escalation card
- Case history

### Desktop secondary IA

Desktop should not be the main case-study hero unless the story shifts to legal aid workers.

Use desktop for:

- Reviewing longer drafts.
- Managing documents.
- Showing system depth.
- Optional case history.

Avoid making desktop the main citizen experience.

## 10. Screen and State Inventory to Build

The case study should have enough screens to prove depth without showing every app corner.

### Must-have screens

1. Mobile home with calm start state.
2. Issue intake with voice/text/photo options.
3. Clarifying question state.
4. Triage result state.
5. Structured assessment card.
6. Citation/source drawer.
7. Living action plan.
8. Action step completed state.
9. Blocked step state.
10. Document extraction confirmation.
11. Filing cheat sheet.
12. Human escalation card.
13. Case history/audit summary.

### Mandatory AI failure screens

1. OCR unreadable.
2. Missing facts.
3. Source gap.
4. Conflicting jurisdiction.
5. Language uncertainty.
6. Network/model timeout.
7. Out-of-scope issue.
8. High-risk criminal/safety boundary.

### Nice-to-have screens

- Voice listening.
- AI thinking with staged progress.
- Draft review.
- Reminder setup.
- Legal aid handoff summary.

### Screens to remove from the case-study narrative

- Pricing/subscription.
- Generic profile depth.
- Language gallery.
- Advocate workspace.
- Heavy desktop scanner.
- Full form-filling portal automation.

## 11. AI Interaction Model

LokAI should be described as a governed AI workflow with these stages:

1. Intake: captures user issue through text, voice, or document.
2. Triage: classifies issue type, risk, jurisdiction, and support level.
3. Clarification: asks for missing facts one at a time.
4. Retrieval: finds relevant legal/civic sources.
5. Assessment: separates law, user situation, uncertainty, and next step.
6. Planning: creates a living action plan.
7. Drafting: creates review-needed letters or filing packets.
8. Monitoring: tracks waiting periods and blocked steps.
9. Escalation: routes to human help when risk or uncertainty rises.
10. Audit: records sources, decisions, and user confirmations.

This lets the case study talk about agentic AI without overbuilding an autonomous agent platform.

Suggested language:

> LokAI behaves less like a chatbot and more like a governed workflow agent. It can classify, ask, retrieve, explain, plan, draft, and escalate, but it cannot act without user confirmation.

## 12. Trust and Transparency Model

Replace "confidence score" with a richer trust model.

### Trust signals

- Source coverage: direct, related, missing, conflicting.
- Fact completeness: complete, needs one detail, insufficient.
- Jurisdiction clarity: confirmed, assumed, unknown.
- Risk level: self-service, review recommended, human required.
- Draft status: AI draft, user reviewed, ready to send.

### Why this is better than raw confidence

Legal confidence is not only a model probability problem. A model can be linguistically confident while the source coverage is weak. LokAI should teach the user what makes the answer reliable or unreliable.

### Case study framing

Decision story:

- Option 1: show percentage confidence.
- Option 2: hide uncertainty.
- Option 3: show source coverage and missing facts.
- Chosen: source coverage and missing facts.
- Trade-off: more UI complexity, but safer user understanding.

## 13. Calm Anchor Visual Direction

This is not a full redesign spec, but the product direction should shape future UI decisions.

Recommended direction:

- Light, stable interface.
- Restrained color palette.
- Warm off-white or neutral surface only if contrast remains strong.
- Soft blue, muted clay, or restrained saffron as accents.
- No alarmist full-red states as the default.
- Use visual quiet for legal seriousness.
- Use motion only to show progress, recording, loading, or state transition.
- Make the current step visually obvious.

Avoid:

- Emergency siren UI.
- Over-decorated cards.
- Heavy shadows and nested cards.
- Too many competing feature panels.
- Visual systems that look like a marketing landing page instead of a tool.

## 14. Implementation Roadmap

### Phase 0: Credibility cleanup

Goal: remove portfolio credibility risks.

Tasks:

- Align case study claims with implemented product behavior.
- Remove unsupported 12-language claims unless evidence is shown.
- Remove or repair stale routes and missing imports.
- Rename fake PDF downloads or implement actual PDF export.
- Fix product naming consistency: Priya/Riya, current year, fonts, colors, citation behavior.
- Add clear "prototype" language for anything not production-backed.
- Reconcile documentation with current implementation before capturing final screens.

Outcome:

The current product stops overclaiming and becomes safer to present.

### Phase 1: Core citizen journey

Goal: build one strong flow from stress to action.

Tasks:

- Implement refined triage.
- Add clarifying question state.
- Add living action plan.
- Add action step states: current, done, blocked, waiting.
- Add filing cheat sheet.
- Add improved out-of-scope flow.
- Connect mobile voice and document upload to this same flow.

Outcome:

LokAI becomes a focused product, not a collection of demos.

### Phase 2: AI trust and failure system

Goal: prove AI-first maturity.

Tasks:

- Add source drawer.
- Add source coverage states.
- Add missing fact and conflicting jurisdiction states.
- Add OCR confirmation.
- Add model/network failure recovery.
- Add language uncertainty confirmation.
- Add high-risk legal boundary.
- Add visible latency stages: detecting language, extracting facts, retrieving source, checking scope, drafting plan.

Outcome:

The case study can show trust, uncertainty, and recovery with evidence.

### Phase 3: Human-in-the-loop and auditability

Goal: show enterprise-level AI governance thinking.

Tasks:

- Add human escalation card.
- Add legal aid handoff summary.
- Add case history timeline.
- Add exportable case summary.
- Add simple audit metadata: source version, model version, user confirmations.

Outcome:

LokAI becomes a serious governed AI workflow, not just an assistant.

### Phase 4: Strategic extensions

Goal: future depth after core story is strong.

Possible additions:

- Advocate/legal aid review queue.
- Reminder and waiting-period tracking.
- Source corpus management.
- Review dashboard for citation gaps and escalation reasons.
- Expanded languages after core flows are validated.

Outcome:

The product can scale toward enterprise and public-interest workflows without diluting the core case study.

## 15. Implementation Priority Matrix

### Build first

- Clarifying question state.
- Living action plan timeline.
- Source drawer with source coverage states.
- OCR confirmation card.
- Filing cheat sheet.
- Out-of-scope and high-risk escalation cards.
- Core failure states.

Reason:

These directly close the biggest gap between the current product and an EY-level AI-first case study.

### Refactor or repair

- Current chat response schema.
- Current citation/context panel.
- Current notice interpreter upload flow.
- Current document export labels.
- Stale route references and missing imports.
- Mobile route structure around the core journey.

Reason:

These already exist, so improving them is faster and more credible than adding new unrelated features.

### Document, but do not fully build

- Legal retrieval architecture.
- Human review operating model.
- Source governance model.
- Audit metadata model.
- Future legal aid dashboard.

Reason:

These show systems thinking and enterprise maturity, but the portfolio does not need every backend workflow fully implemented.

### Do not prioritize

- Pricing/subscription.
- Language showcase.
- Full desktop scanner.
- Auto-government-portal filing.
- Advocate workspace.
- Broad dashboards.

Reason:

These add scope without strengthening the central product argument.

## 16. What Not to Build Now

Do not build these before the case study update:

- Full split-screen document workspace.
- Full government portal auto-filler.
- Criminal case workflow beyond boundary and escalation.
- Advocate workspace.
- Language showcase.
- Subscription/pricing system.
- Generic dashboard analytics.
- Complex admin settings.
- Decorative redesign work that does not improve the core flow.

Reason:

Each of these can be valuable later, but each one expands the product into a second or third system. For EY-style portfolio review, a sharply scoped, well-reasoned AI workflow is stronger than a broad product that cannot defend its claims.

## 17. Case Study Restructure

The current case study should be rebuilt around the 2026 AI Product Designer blueprint.

### Section 1: Title and hook

Lead with:

> LokAI: Designing AI That Knows Its Place in Indian Law

Subtitle:

> A calm, source-backed AI guide that helps first-time legal users understand what happened, what is uncertain, and what to do next.

Show one strong product visual: mobile triage plus action plan, not a generic cover.

### Section 2: Business and user context

Explain:

- Indian citizens often face legal/civic friction before they know whether they need a lawyer, a government portal, a police station, or a consumer forum.
- The problem is not only legal literacy. It is action paralysis under stress.
- LokAI focuses on first-time legal encounters in bounded civil/civic domains.

Add a validation table:

- What is researched.
- What is assumed.
- What is tested.
- What remains unproven.

Also add a "prototype truth" strip:

- Built today.
- Designed but not yet implemented.
- Future production requirement.

This prevents the case study from overstating the current product.

### Section 3: One solution journey

Use one complete journey:

1. User describes issue or uploads notice.
2. LokAI triages and asks one missing question.
3. LokAI explains law, user situation, and uncertainty.
4. User opens source drawer.
5. LokAI creates action plan.
6. User marks a step blocked.
7. LokAI reroutes.
8. User creates filing cheat sheet or draft.

### Section 4: Failure and recovery screens

Show 4-8 failure states, each with:

- Trigger.
- AI signal.
- User-facing message.
- Recovery path.
- Accountability mechanism.

Mandatory examples:

- Source gap.
- OCR failure.
- Conflicting jurisdiction.
- Out-of-scope issue.
- High-risk criminal/safety issue.
- Model timeout.

### Section 5: Decision stories

Use decision stories instead of generic process writing.

Recommended decision stories:

1. Assessment card over chatbot answer.
2. Living action plan over legal explanation.
3. Source coverage over confidence percentage.
4. In-flow document extraction over split-screen scanner.
5. Filing cheat sheet over auto-form filler.
6. Calm boundary over emergency warning UI.

Each story should show:

- The messy problem.
- Three options considered.
- The trade-off.
- The decision.
- The result.

### Section 6: Iteration archive

Show rejected ideas:

- Split-screen scanner.
- Full auto-filing.
- Panic-style warning screens.
- Confidence percentage badge.
- Broad 12-language claim.
- Advocate workspace as v1.
- Desktop-first case-study framing.
- Static legal answer without action state.

Explain why each was rejected.

### Section 7: UI system and AI behavior system

Show both:

- Visual design system: typography, spacing, color, components.
- AI behavior system: triage states, source states, risk states, escalation states.

This is important because AI product design is not only screen design. It is behavior design.

### Section 8: Outcome and reflection

Use honest outcomes:

- Prototype shipped.
- Core flow implemented.
- AI trust model designed.
- Legal source validation still needed.
- Human escalation partnership still needed.
- Future testing should measure action-plan completion, source comprehension, abandonment under stress, and escalation accuracy.

Avoid inflated impact claims unless there is evidence.

## 18. Portfolio Proof Checklist

Before publishing the case study, make sure it proves:

- Clear user problem.
- Narrow product scope.
- One complete user journey.
- AI behavior model.
- Failure states.
- Human-in-the-loop logic.
- Source transparency.
- Implementation awareness.
- Trade-off reasoning.
- Honest limitations.

If a feature does not help prove one of these, it should not be in the main case study.

## 19. Final Product Direction

LokAI should not become four products:

- Not a general legal chatbot.
- Not a desktop document audit suite.
- Not a government portal automation platform.
- Not a lawyer marketplace.

LokAI should become one excellent product:

> A calm AI legal navigator that helps Indian citizens understand a first legal encounter, verify the basis of the guidance, and move through a safe action plan one step at a time.

This direction is smaller, but it is stronger. It gives the case study the same qualities the EY role is looking for: complex problem framing, AI-first interaction design, systems thinking, enterprise-aware governance, and enough product restraint to be credible.
