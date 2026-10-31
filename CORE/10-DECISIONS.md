# 10 · DECISIONS — the ledger

*One dated line per final call. Changing a frozen decision = a new row here, never an edit of
the old one. This table is why the drift stops: every "why" resolves to a row, and every row
resolves to a file in this folder.*

---

| Date | Decision | Notes / supersedes |
|---|---|---|
| 2026-08-25 | **Mobile is the product.** Desktop carries chat + notice as parity evidence — one component, two docks, not two apps | `05-SCREENS.md`; overrides earlier "desktop-exclusive notice" |
| 2026-08-25 | **NoticeInterpret is mobile-first, in chat** — not a separate route or desktop tool | §3.8 owner override, recorded in MOBILE_AI_SYSTEM |
| 2026-08-27 | **Drawer is the whole navigation** — no bottom tab bar; chat-first home | `05-SCREENS.md` |
| 2026-09-06 → 09-14 | **Token single-source + debt ratchet** — role layer is the only color truth; budgets only fall | `03-SYSTEM.md`; `scripts/ui-debt.mjs` |
| 2026-09-14 | **Glass composer removed** (flat-paper register) | *Superseded 2026-09-28 by Vellum V1* |
| 2026-09-21 | **JEV research → decision-layer blueprint** (gates G1–G9, receipt shape) | `decision-layer-research/` = archive |
| 2026-09-22 | **REDESIGN-PLAN P0–P8 approved with changes** (composer items → P4; receipt assertions = resolve-not-prose) | `docs/REDESIGN-PLAN-2026-09.md` = archive; plan law absorbed into CORE |
| 2026-09-23 | **The thesis is the seam** — complete-then-bound, not refuse; decided before it speaks | `04-INTERACTION.md`; kills the "AI that refuses" framing |
| 2026-09-23 | **No branching/regenerate UI; no percentage confidence, ever** | determinism + V4 |
| 2026-09-27 | **Jev is private scaffolding** — never in the case study, never in code vocabulary | owner call; `04-INTERACTION.md` states it once |
| 2026-09-27 | **Decision-interaction design-of-record** — five-state pipeline, gate trail, timing law; walkthrough defects logged | `docs/DECISION-INTERACTION-2026-09.md` = archive; content lives in `04` |
| 2026-09-27 | **Record corrections**: "6 of 7" misattribution re-pointed to concepts-draft; composer is 14px not 12px; EMOTION_CRAFT lives in Turn.tsx | PRODUCT-JOURNEY corrections applied |
| 2026-09-28 | **Vellum adopted** — mesh+grain ground, sans-tight display, machined objects; supersedes "cream is the brand ground" (white-vs-cream study) and the 2023 editorial register | `02-DESIGN-LAW.md` Book two; `03-SYSTEM.md` |
| 2026-09-28 | **Serif demoted to the law register** — Instrument Serif (`LAW`), rare on purpose; Fraunces retired from chrome | `03-SYSTEM.md` type table |
| 2026-09-28 | **Glass reinstated for floating chrome only** (composer, sheets, drawer — never scrolling content) | supersedes 2026-09-14 de-glassing; `.lokai-glass` |
| 2026-09-28 | **New deps approved**: `clsx`, `tailwind-merge`, `@fontsource/instrument-serif` — deviation from no-new-deps, owner-approved for the component program | `06-COMPONENTS.md` adoption law |
| 2026-09-28 | **Flashcards = swipe deck + flip** (SmoothUI physics + kokonutui flip), three-dots entry; **not** a graded quiz | owner pick from two options |
| 2026-09-28 | **Documents hero = rare-ui 3D folder**, tap-driven, real exhibit refs; uselayouts `card-folder` rejected (hover-only, no tap) | owner pick; supersedes the 2026-08-26 "glossy folder rejected" (that rejection was about the glossy register; Vellum's paper-toned version is the descendant) |
| 2026-09-28 | **scan-document adopted** as the read beat; **empty-testimonial** pattern approved for EmptyDocuments (pending); `confidential-folder` approved for the packet reveal (M6) | owner-named components |
| 2026-09-28 | **Licensing constraint lifted for personal use** — vault kits usable freely; Commons-Clause kits still never redistributed as a kit | owner call; vault AGENTS.md |
| 2026-09-28 | **Walkthrough findings #5 and #10 retracted** — stop-state inversion and notice-navy were dark-theme renders, correct L8 behavior in both themes | `04`/`09-STATE.md`; verified live |
| 2026-09-28 | **CORE/ is the source of truth; `docs/` is the archive.** A→Z: product → law → system → interaction → screens → components → craft bar → case study → state → decisions | this folder; the anti-drift rule |

## Open decisions (need an owner call)

| # | Question | Options |
|---|---|---|
| O1 | User bubble saturation — filled navy (current tree) vs quiet surface (audit §3.7's call) | Either is defensible; pick one so it stops oscillating |
| O2 | Desktop short-answer dead zone — min-height content vs tighter composer gap | Fold into C1 |
| O3 | Whether the latency recommendation ships before the seam work in the demo order | Current rec: timing law already shipped (M2); seam work = P2 next |
