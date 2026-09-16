# LokAI — Information Architecture

> Repo: `D:\portfolio porjects\Lokaifm-main` (branch `feature/single-matter-guardrails`) · Documented 2026-09-16 from latest code.
> Evidence basis: `src/app/routes.tsx`, `captureRoutes.ts`, `context/DemoContext.tsx`, `data/demoScenarios.ts`, `data/caseWorkflow.ts`, `data/statusVocabulary.ts`, `data/responseTurns.ts`, `components/mobile/*`, `pages/mobile/*`, `PRODUCT.md`, `docs/MOBILE_SCREENS.md`, `docs/MOBILE_AI_SYSTEM.md`, `docs/CASE-STUDY.md`, `docs/SWEEP-REPORT-2026-09-15.md`.
> Companion docs: [02-user-flows](02-user-flows.md) · [05-state-path-catalog](05-state-path-catalog.md) · [01-user-journey-map](01-user-journey-map.md) · [03-empathy-maps](03-empathy-maps.md)

## 1. What this app is

LokAI is a **fully visual, deterministic prototype of an AI legal guide** for a first-time user (Priya) navigating a consumer-refund problem (damaged mixer grinder, ₹8,999, seller refused replacement). It organizes facts, explains the consumer-protection basis, prepares a complaint draft, exposes its sources, and reviews every claim — **stopping or requesting human review whenever evidence does not support a safe next step**. This is the portfolio's "trust study": every section = one trust claim + the artifact that proves it.

**Hard boundaries (from `PRODUCT.md`):** no live AI, OCR, speech, upload, auth, payment, storage, lawyer marketplace, or external API. Legal records labelled `Illustrative · expert review pending`. Legal **information, not advice**. Zero network or device-permission requests — audited in-session (audit event: "No network or device permission requested").

**Stack (observed):** React + Vite + react-router **hash router** (deliberate — portfolio embeds use `#<route>` deep links + `embed=1`; browser router would drop the hash), prepared-data contexts (`DemoContext`, `ConversationContext`, `DrawerContext`, `SidebarContext`), language packs EN/HI/MR/TA.

## 2. Top-level structure

```
LokAI (one CaptureLayout wrapper: LegalTermDialog + DemoDisclosure + Toaster)
├── Desktop shell (/desktop · sidebar + central workspace + contextual right panel)
│   ├── Dashboard (Home) … LOK-D1
│   ├── Chat: /chat (fallback) · /chat/consumer · /chat/:chatId … LOK-D2
│   ├── Notice Interpreter … LOK-D3
│   ├── Document Draft … LOK-D4
│   └── Documents … LOK-D5
├── Mobile shell (/mobile · 390px frame; THE DRAWER IS THE WHOLE NAV — no tabs)
│   ├── Onboarding (purpose + language + prepared sign-in) … LOK-M0
│   ├── Home (chat canvas: mark + prompt + quick-start pills) … LOK-M1
│   ├── Case /:matterId — consumer fully built; other ids → unsupported-matter boundary … LOK-M2..M9
│   ├── Notice Interpreter in chat (founding feature) … LOK-M10
│   ├── Voice (modal flow) … LOK-M11
│   ├── Profile … LOK-M12
│   └── Files (exhibits in a matter, not files in folders) … LOK-M13
├── Dev harness: /dev (screen+state+specimen index) · /specimen/:id (bare-canvas case-study embeds) … LOK-X1..X2
└── Fallbacks: / → dashboard · chat/:language → case/consumer · * → NotFound
```

**Navigation model (mobile, per `MOBILE_SCREENS.md`):** chat-first — minimal top bar (hamburger · wordmark · new-chat), `MatterDrawer` carries greeting, search, My documents, **the active matter's live status + what's waiting**, new chat, past matters, Language, Appearance, account rail. Home is a canvas, nothing else. Modal flows (voice, stop states) swap the hamburger for back. Reference adopted: Wkeel layout (its dark palette rejected — **dark is LokAI's stop-state tone, not a theme**).

**Five-slot screen grammar** (`ui/layout.tsx` `<Screen>`, every mobile screen): `chrome` (status+topnav) · `context` (one quiet line: matter · stage · language — never a card) · `children` (focal content) · `action` (ONE primary CTA, pinned) · `footer` (composer and/or nav).

## 3. Screen inventory (complete, code-traced)

### Mobile (the primary study surface)
| ID | Screen | Route / source | Purpose |
|---|---|---|---|
| LOK-M0 | Onboarding | `/mobile/onboarding` · `MobileOnboarding.tsx` | Purpose + language + prepared sign-in; the coded hero |
| LOK-M1 | Home (chat canvas) | `/mobile/home` · `MobileHome.tsx` (46.6 KB) | Centred mark + prompt + quick-start pills; composer pinned; notice entry + tracking banner (`?notice=offer`) |
| LOK-M2 | Case — intake | `/mobile/case/consumer?stage=intake` · `MobileConsumerCase.tsx` (55.6 KB) | Issue submitted; journey begins |
| LOK-M3 | Case — clarify | `?stage=clarify` | "LokAI needs one detail" — confirm/correct facts (purchase date disputed) |
| LOK-M4 | Case — verify | `?stage=verify` | Verification gate: facts with `Needs a check` flags; source coverage |
| LOK-M5 | Case — assess | `?stage=assess` | Assessment: claim ledger, risk tier in citizen words |
| LOK-M6 | Case — plan | `?stage=plan` | Action plan: ordered steps with `locked/current/done/blocked/waiting` states |
| LOK-M7 | Case — packet | `?stage=packet` | Demand notice draft (AI draft → user reviewed → ready to use); approve to unlock |
| LOK-M8 | Case — escalation/failure/audit | `?stage=escalation|failure|audit` | The 8 stop states + audit trail |
| LOK-M9 | Unsupported matter boundary | `/mobile/case/:anyOtherId` | Designed boundary, not a silent wrong-case render ("rather than silently showing the consumer case under someone else's title") |
| LOK-M10 | Notice Interpreter (in-chat) | `/mobile/notice` · `MobileNoticeInterpret.tsx` + `NoticeInterpret.tsx` | **The founding feature**: photo of a notice → interpreted in chat; deep link `?doc=bmc-property-tax&open=1`; `DemandNoticePaper`/`ExhibitPaper` artifacts |
| LOK-M11 | Voice | `/mobile/voice` · `MobileVoiceActive.tsx` + `useVoiceCapture` | Sampled voice interaction (animation, prepared data) |
| LOK-M12 | Profile | `/mobile/profile` · `MobileProfile.tsx` | Account, language, appearance |
| LOK-M13 | Files / Documents | `/mobile/files` · `MobileFiles.tsx` | Exhibits of the matter with evidence status (Gathered / Needs a check / Optional) |

### Desktop
| ID | Screen | Route | Purpose |
|---|---|---|---|
| LOK-D1 | Dashboard | `/desktop/dashboard` · `pages/Home.tsx` | Matter overview, entry to the demo |
| LOK-D2 | Chat (consumer + any) | `/desktop/chat/consumer`, `/chat/:chatId` · `pages/Chat.tsx` | Focused consumer conversation; clarify rows in empty state; guardrail scenes selectable |
| LOK-D3 | Notice Interpreter | `/desktop/notice-interpreter` · `pages/Notice.tsx` | Desktop notice flow |
| LOK-D4 | Document Draft | `/desktop/document-draft` · `pages/Draft.tsx` | Draft workspace with approval state |
| LOK-D5 | Documents | `/desktop/documents` · `pages/Documents.tsx` | Exhibit shelf |

### Shared surfaces & dev
| ID | Surface | Source | Purpose |
|---|---|---|---|
| LOK-S1 | MatterDrawer | `components/mobile/MatterDrawer.tsx` | The whole mobile nav + personal surface; stage rail: **six segments, not a percentage** ("The product never…" fakes progress) |
| LOK-S2 | Turn renderer | `components/ai/Turn.tsx` (38 KB) | Renders the 7 response modes incl. three-zone explain, stops, citations |
| LOK-S3 | LegalTermDialog | `demo/LegalTerms.tsx` | In-place glossary (CPA 2019 §2-10, §35, E-Commerce Rules 2020…) |
| LOK-S4 | DemoDisclosure | `demo/GuardrailGallery.tsx` | Persistent scripted-prototype disclosure |
| LOK-S5 | Command palette | `CommandPalette.tsx` | Desktop quick nav |
| LOK-S6 | Settings panel | `SettingsPanel.tsx` | Language/appearance |
| LOK-X1 | Dev index | `/dev` · `DevIndex.tsx` + `dev/catalog.ts` | Every screen, state, specimen in one index |
| LOK-X2 | Specimen embeds | `/specimen/:id` · `dev/specimens.tsx` | Single components on bare canvas for case-study embeds (incl. `voice-capture`, `voice-unclear`) |

## 4. The data model that *is* the IA

- **DemoScenario** (`demoScenarios.ts`): 6 authored guardrail scenes — `consumer` (self_service), `missing_fact`, `source_gap`, `conflicting_rules` (review_recommended), `high_risk`, `out_of_scope` (human_help_required). Each = user message + facts (state: confirmed/disputed/missing) + policy tier.
- **WorkflowStage** (`caseWorkflow.ts`): `intake → clarify → verify → triage → retrieve → assess → plan → packet → escalation | failure → audit`; the **journey rail shows six**: intake, clarify, verify, assess, plan, packet (escalation/failure/audit are states off the rail).
- **ResponseMode** (`responseTurns.ts`): `explain` (three-zone) · `clarify` · `disclose` · `stop` · `confirm` · `progress` · `recover` — "hybrid response modes… never force every turn into three zones" (`PRODUCT.md`). `draftAllowed` travels per turn.
- **FailureKind (the 8 stops):** `missing_facts` · `source_gap` · `conflicting_jurisdiction` · `ocr_unreadable` · `language_uncertain` · `model_timeout` · `out_of_scope` · `high_risk`.
- **statusVocabulary.ts — "the ONE place a workflow state becomes words":** citizen voice wins ("Needs a check", never "review_recommended"; "Gathered", not "Uploaded"); tone travels WITH the label so a state can't be renamed in one surface and recolored in another.
- **AutonomyLevel:** `guide` / `prepare` / `track` (how much LokAI drives the matter).

## 5. Navigation rules worth quoting in a case study

1. **The drawer replaced the tab bar (2026-08-27)** — chat-first pattern with the active matter's live status inside the nav; navigation and personal surface are one thing.
2. **Six segments, not a percentage** — the stage rail refuses fake progress numbers.
3. **Unsupported ≠ hidden** — unknown matter IDs get a designed boundary screen, never the consumer case under the wrong title.
4. **Hash router for embed honesty** — every portfolio deep link (`#route`, `embed=1`, `?lang=hi`) survives because of this choice; documented in code comments.
5. **One clarify per conversation** — the "clarify middle" (audit F1) makes the chat ask one real question before answering, once; then routes straight. Reset on new conversation.
6. **Localization integrity rule (from code):** "a localized question must never route to an unlocalized answer" — enforced in `resolveClarify`.

*Everything above is observed in code; nothing invented.*
