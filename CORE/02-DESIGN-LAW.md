# 02 · DESIGN-LAW — the rules every pixel obeys

*Source of truth. Supersedes `DESIGN.md`, `docs/MOBILE_AI_SYSTEM.md` §1 (L1–L8), and `docs/VISUAL-DIRECTION-2026-09.md`. Archive kept for reasoning.*

The law has two books: the **composition law** (L1–L8, what goes where) and the **material law**
(V1–V6, what things are made of). Both are enforced — by gate scripts where possible, by review
where not. If a decision isn't covered, the default is **do the quieter thing.**

---

## Book one — composition (L1–L8)

**L1 — Ground, not boxes.** Body content sits on the page. A container must earn itself: a card
is only for a discrete object the user could pick up — a source, an exhibit, a matter, a receipt.
Prose, steps, disclaimers, stage restatements: never cards. Budget: **two cards visible, maximum.**

**L2 — One focal move per screen.** Exactly one element is the biggest / darkest / first. If two
things compete, one is wrong.

**L3 — Answer first, chrome after.** The thing the user came for is the first content below the
header. Disclaimers and glossary hints are quiet lines and footers, never cards ahead of content.

**L4 — Type carries hierarchy; borders don't.** Weight, size, and color contrast do the work. The
register change — the law speaking — needs no eyebrow label to announce itself.

**L5 — One anchor.** Navy appears in exactly three roles: the composer, the single primary CTA,
and the stop ground. One primary action per screen; the second action is `quiet`. Nowhere else.

**L6 — Stops are the most designed screens, not the least.** The safe action is the primary
button. "Continue anyway" is a text link, or absent where the refusal is absolute.

**L7 — Say it once.** One eyebrow label per screen, maximum. If two elements state the same
thing, one is deleted — as an IA pass, not component-by-component.

**L8 — A stop is the tonal opposite of its surroundings.** Light theme: full-bleed dark. Dark
theme: warm luminous. The contrast relationship is the constant; the direction flips. *(Verified
both themes 2026-09-28 — the walkthrough's "not inverted" finding was a theme misread.)*

## Book two — material (Vellum, V1–V6)

**V1 — The ground is material, not paint.** Grain + mesh as ONE token stack (`--role-ground-image`),
consumed by `<Screen>`. Static, GPU-safe, deterministic. No screen composes its own ground.

**V2 — Familiar anatomy, honest content.** Keep the 2026 convergent shape (status line →
collapsible panel → collapsed summary). Fill it with computed truth: the collapsed line is the
**gate trail**, not a timer. Serif is rare on purpose — it only speaks when the law speaks.

**V3 — Decide before you render.** All blocking checks resolve before first visible output. The
stop is therefore the first thing the system says, and can be art-directed (L6/L8) instead of
being a retraction.

**V4 — Provenance, never confidence.** No numbers standing in for judgment. Apple HIG anchors
this: "If you're not sure how your confidence values correlate with the quality of your results,
it's not a good idea to convey confidence to people." The ledger is countable, source-linked,
falsifiable.

**V5 — Counts derived, one mover, quiet completions.** Ledger numbers recompute from state, never
authored literals. In any multi-step state exactly one element moves; completed elements settle to
quiet. A count that drifts from the rows destroys trust.

**V6 — Chrome scales with consequence.** Echo silent when clear; risk chip only when tier ≠
self-service; receipts collapsed by default; the working beat longest for the turns that most
need deliberation and fastest for stops. Variable friction — never uniform.

## The receipts (how the law is enforced)

| Law | Enforced by |
|---|---|
| Tokens (no raw color/family/leading) | `scripts/ui-debt.mjs` ratchet — budgets only fall |
| Determinism, no network/mic/file, vocabulary, contrast AA both themes | `scripts/verify-demo.mjs` |
| L1/L2/L3/L7 | review + the `<Screen>` five-slot grammar |
| L5 | one-CTA law in review |
| V1/V3 | token architecture + the engine contract (P2) |

**Precedent when laws conflict:** safety outranks scope; the trust thesis outranks delight;
L6/L8 outrank L1 (a stop may break the container budget — it is the one screen allowed to).
