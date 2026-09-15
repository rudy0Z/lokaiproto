# LokAI — Next Goals & Roadmap (2026-09-15)

**Read with:** `docs/AUDIT-2026-09-14.md` (what the foundation sweep verified and
fixed), `PORTFOLIO-DIRECTION.md` (portfolio authority), `docs/UPGRADE-2026-09.md`
(Phase 1–8 decision log).

**Where this comes from:** every item below was re-verified against the current
working tree on 2026-09-15 (file:line evidence in §4). Nothing here is speculative —
each goal either closes a finding from the repo's own audits or unblocks the
portfolio case study.

**Sweep commits so far:** `230f0fd` (in-flight pass + governance docs) →
`f6f36b6` (P0s + visual regressions) → `ce29db8` (token single-source + DTCG) →
`d040882` (docs truth pass) → `032726f` (dependency prune) → `1d3cc94` (attic
renames). Gates green at every step.

---

## 1. Goal 0 — The visual walkthrough (do this first, before anything else)

**What:** the 390px light+dark pass the gates cannot do: home → drawer → clarify →
answer → verify gate → packet → high-risk stop → voice → notice reader, then the
desktop golden path (`/desktop/chat/consumer` cold start — the seed fix), the
boundary chat, and the stop composition. Grayscale + 60% zoom on the capture set.

**Why first:** the sweep fixed eight code-level defects, but their *rendered* result
has not been eyeballed. The clarify rows, the chip tint, the de-glassed composer, and
the dark-mode LogoMark all need one human pass before the case study captures
anything. Any finding here feeds Goal 1 directly.

**Done when:** every route walked in both themes with zero visual defects logged, and
the capture set is approved for the case study.

## 2. Goal 1 — Craft residuals (small, sequenced, machine-checked where possible)

| Item | Evidence today | Fix |
|---|---|---|
| `LAYOUT.radius.xs` (4px) retirement — or its promotion to a named role | 21 call sites (10 files) | Decide: keep as a named role (document it) or retire to 8px; then update `LLM_DESIGN_SYSTEM.md` |
| 4 × `fontWeight: 700` | Notice.tsx:261 (letterhead), CaptureLayout.tsx:48,101 (capture overlay), index.css .demo-disclosure | All three are meta contexts; either tokenize a `TYPE.display weight` or accept + document the exception |
| Composer control count (4: attach/voice/textarea/send) | Turn.tsx Composer | Product decision: keep 4 and document, or drop attach on mobile |
| Breathing mark is perpetual + animates box-shadow | index.css `.lokai-mark-breathe`, LogoMark `animated = true` | Bind the breath to the thinking state only (ChatGPT Emotive Point pattern); move to transform-only |
| Enter-to-send silent no-op while busy | Turn.tsx:904 `if (!canSend) return;` | One-line affordance: disabled placeholder or a quiet "working…" hint |
| Cross-shell identity drift | MatterDrawer:424 "Priya S. · Karnataka" vs Sidebar:329 "Priya Sharma · Mumbai" | One persona constant in `data/`; both shells read it |
| Entrance stagger >1.2s on slow machines | audit P2 | Cap total entrance at ~1s; verify on a throttled CPU |

## 3. Goal 2 — The Figma bridge (the build you said comes after the code is clean)

The code side is now clean enough to connect. Sequence:

1. **Import tokens.** `.design-os/tokens.dtcg.json` (regenerated 2026-09-14, labelled
   generated) → Figma Variables via the Tokens Studio / DTCG import path. Palette +
   role layer + dark overrides + dimension + duration are all in the file.
2. **Rebuild the Figma library to match reality**, not the April `.remember` state:
   components that exist today (`Text`, `Button`, `Card`, `HairlineList/Row`, `Badge`,
   `Amount`, `Screen`, `Sheet`, `Turn` anatomy) — not Citation Stamp / Response Card /
   Language Chip, which were retired.
3. **Name both sides identically.** Figma variable `role/anchor` ↔ `T.anchor` ↔
   `--role-anchor`. The audit's biggest lesson is that parallel names drift; one
   naming law, enforced by review.
4. **MCP round-trip test:** point Figma MCP at the file, generate one screen from the
   library, and diff it against the React render. That diff is your case-study proof
   that the system survives the hop.

**Done when:** a Figma file exists whose variables are 1:1 with `tokens.dtcg.json`,
and one MCP-generated screen matches the prototype within tolerance.

## 4. Goal 3 — Performance & build hygiene (half a day, big perceived win)

- **Vendor code-splitting:** `vite.config.ts` has no `manualChunks`; the index chunk is
  ~1.4MB (271KB gzip). Split `motion`, `react-router`, `cmdk`, `sonner` into a vendor
  chunk; consider splitting the Phosphor import to per-icon paths.
- **Tailwind decision:** the pipeline now serves only as preflight/reset. Either strip
  `tailwindcss` + `@tailwindcss/vite` + `postcss.config.mjs` (needs one visual QA pass)
  or document it as the reset layer. Half a day either way.
- **Route-level bundle audit:** after splitting, re-measure and record the numbers in
  this doc so the case study can quote honest figures.

## 5. Goal 4 — Content & language residuals (the honesty edges)

- **Clarify follow-ups in hi/mr/ta are already shipped** (`FOLLOWUP_I18N` covers all
  three, `localizeConsumerFollowUp` resolves them) — `UPGRADE-2026-09.md` §4 lists this
  as open; it is not. Update that doc.
- **The dead `TopNav` note is stale too** — MobileHome's comment says TopNav was
  deleted outright (2026-09-06); no `TopNav` export remains. `UPGRADE-2026-09.md` §4's
  "retired TopNav export" item is done. Update that doc.
- **Glossary packs** exist for hi/mr (3 terms) and ta (2 terms) — the ta pack is missing
  `districtCommission`. Small content task; keeps the Indic screens symmetric.
- **`Notice.tsx` letterhead weight 700** — see Goal 1; bundle with any Notice copy pass.

## 6. Goal 5 — Portfolio case study (the point of all of this)

1. Reconcile `PORTFOLIO-DIRECTION.md` §4's artifact list against the post-sweep app
   (the trust artifacts are all reachable; the embed map in the copy draft needs the
   two fixed desktop routes re-checked).
2. Capture the embed set from Goal 0's approved walkthrough (light + dark, 390×780).
3. Write the v4 case study from `D:\Portfolio\case-study-copy\lokai-copy-v4.md`,
   quoting the honest build numbers (ratchet totals, contrast gates, the DTCG bridge).
4. Refresh the portfolio embed (`node scripts/sync-embeds.mjs lokai` from
   `D:\Portfolio`).

---

## 7. Why this order

Goal 0 gates everything: screenshots feed the case study, and any visual defect found
feeds Goal 1's list. Goal 1 is small enough to finish in one sitting and removes every
known craft dent. Goal 2 (Figma) is the strategic unlock you asked for and is only safe
now that tokens are single-sourced. Goal 3 is independent and cheap. Goal 4 is
bookkeeping. Goal 5 is the payoff — it needs 0–4 done, and nothing else.

## 8. Evidence appendix — verified 2026-09-15

| Item | State | Evidence |
|---|---|---|
| Desktop chat cold-start seed | **Fixed** | Chat.tsx:466 effect calls `seedTurnForConversation` |
| Scenario sync from URL | **Fixed** | same effect, `selectScenario(wanted)` |
| Desktop clarify options | **Fixed** | Turn.tsx:737 `onClarifyAnswer && turn.mode === 'clarify'` |
| LogoMark dark mode | **Fixed** | shared.tsx:575 glyph = `var(--role-on-anchor)` |
| Chip affordance (1.06:1) | **Fixed** | MobileHome.tsx:365 `background: T.anchorTint` |
| Composer glass + border&shadow | **Fixed** | index.css: no `backdrop-filter`; shadow-only |
| Token single-source | **Fixed** | index.css dead blocks deleted; C literals synced; DTCG regenerated + spot-checked |
| Deps pruned | **Fixed** | 13 runtime deps remain; 164 packages removed from tree |
| Dead code + logs | **Parked** | `attic/` (16 renames, provenance kept) |
| `radius.xs` usage | Open | 21 call sites / 10 files |
| `fontWeight: 700` | Open | 4 sites (Notice:261, CaptureLayout:48,101, index.css:408) |
| Breathing mark perpetual | Open | index.css `.lokai-mark-breathe` + LogoMark `animated = true` |
| Enter-to-send silent no-op | Open | Turn.tsx:904 |
| Persona drift across shells | Open | MatterDrawer:424 vs Sidebar:329 |
| `manualChunks` | Open | absent from vite.config.ts |
| Follow-up packs hi/mr/ta | **Already done** | languagePacks.ts `FOLLOWUP_I18N` (hi/mr/ta all present) |
| Dead `TopNav` export | **Already done** | MobileHome.tsx:80–85 comment; no export remains |
| Glossary ta pack | Open (small) | GLOSSARY_I18N ta missing `districtCommission` |
| Specimen 390px overflow | Likely fixed | Specimen.tsx:59 `maxWidth: specimen.width ?? 420` |
| Settings '?' trigger | Not reproduced | no `?` keybinding found in Sidebar/SettingsPanel |
| DTCG values match live CSS | Verified | canvas 0.98/0.973/0.961 = #FAF8F5; anchor 0.043/0.106/0.196 = #0B1B32; dark ground #0E1A2B |