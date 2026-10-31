# 05 · SCREENS — job, anatomy, status

*Source of truth. Supersedes `docs/MOBILE_SCREENS.md`. Archive kept.*

**Scope law: mobile is the product.** Desktop carries chat + notice as parity evidence — one
component, two docks, not two visual dialects. Every screen uses the five-slot grammar:
`context · children · action · footer` on `<Screen>`, chrome injected by `AppScreen`.

Status: ✅ on the new system · 🟡 partly · ⬜ pending · 🔴 defect open.

---

## `/mobile/home` — the front door · ✅
**Job:** where a person starts, and where their one live matter is. Home IS the chat.
**Anatomy:** empty = logo + sans-tight greeting + suggestion chips + the notice door.
Active = the conversation itself (turns, working beat, clarify options, tool sheets).
**Vellum:** glass composer island, mesh ground, 44px targets, 16px input. Three-dots →
Quick Recap once the conversation has something to recall.
**🔴 open:** user-bubble saturation (navy fill vs quiet surface — owner decision logged, not drift).

## `/mobile/case/:matterId` — the case journey · 🟡
**Job:** eleven stages, eight failure kinds — one thing per stage (L7).
**Built:** verify (evidence locker + scratchpad), assess (three-zone answer), packet
(autonomy dial → intent preview → notice paper → review gate), audit, escalation.
**M2 shipped:** Quick Recap deck · consequence-scaled working beat · `?stage=failure` deep link.
**🔴 open:** ghost header contrast on stage titles (walkthrough defect #6); remaining legacy
stages on the old system (ui-debt heavy).

## Stop states (`?failure=` ×8) · ✅
**Job:** the most designed screens in the app. Full-bleed `tone="stop"`, safe action primary,
preserved-state line, quiet continue (or none when absolute). **Verified both themes 2026-09-28**
(light → full-bleed navy; dark → warm luminous).

## `/mobile/files` — exhibits, not files · ✅ (hero) · 🟡 (list)
**Job:** a document exists because it proves something. **MatterFolder hero** (M3): tap swings
the flap, first three exhibits fan out, tappable into the sheet. Machined exhibit rows beneath
(mono reference · what it proves · state; only the exception gets a fill).
**⬜ pending:** EmptyDocuments state (adapted from empty-testimonial) — deferred; the demo matter
always carries 7 exhibits, so the state is unreachable today.

## `/mobile/notice` — the founding feature · ✅
**Job:** a person receiving a legal notice they can't read drops it into chat; the response IS
the interpretation. **M4 shipped:** ScanDocumentCard beat (1.7s narrated, saffron bar) →
interpretation turn (translated summary + surfaced amount/deadline/section with clause stamps) →
**persistent "in plain words ↗" strip** above the composer for the whole conversation. Reader
sheet: In plain words / Original, tap a field → the original scrolls to the exact clause.
**The interaction law:** one feature, two doors (chat attach; the notice screen) — depth decided
by the document, never by the user.

## `/mobile/voice` — speak, and see it caught · 🟡
**Job:** voice-first access without surrendering control. Transcript editable before commit;
unclear refuses to guess, always offers text. Honesty line demoted to quiet disclosure. ✅.
**🔴 open:** mid-screen dead zone; waveform unwired; `voice-capture` + `voice-unclear` specimens
unshipped → **M5**.

## `/mobile/profile` — help first, not settings · ✅
Human-help path as the one primary; language + appearance as rows. Carries the appearance switch
(light/dark/system).

## `MatterDrawer` — the whole navigation · ✅
No bottom tab bar. Greeting, search, documents, the active matter's live status + what's
waiting, new chat, past matters, language, appearance, account rail.

## Specimen + `/dev` — the craft gallery
Every component states its name, source, and states; the gallery is the portfolio artifact.
New components enter with a specimen in the same commit.
