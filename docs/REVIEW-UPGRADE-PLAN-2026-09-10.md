# Senior Product Design Review — LokAI Upgrade Implementation Plan

**Reviewed:** `c:\Users\rudra\.gemini\antigravity\brain\90a51cf4-ffde-4d42-9048-23b59d65c0b6\implementation_plan.md`
**Audited against:** current working tree + live render at 390×844
**Automated gates:** `verify:demo` ✅ (69 files), `typecheck` ✅, `build` ✅

---

## 1. Overall verdict

**Grade: B− (direction is right, verification claims are overstated).**

The upgrade moved LokAI in the correct direction: the mobile home is genuinely calmer, the copy diet landed, the composer has real materiality, and the thinking state is quieter. A recruiter opening the embed for the first time will perceive a more considered product than before.

However, the plan's status line — *"ALL 8 FIXES IMPLEMENTED & VERIFIED"* — is **not accurate**. Of the eight fixes, two landed cleanly (Fix 2, Fix 6), two landed with meaningful regressions (Fix 4, Fix 5), and four are only partially true (Fix 1, Fix 3, Fix 7, Fix 8). The automated gates pass because they test for *presence of rules*, not for the plan's stated *design targets* (e.g., they do not measure chip-surface contrast, rendered type-size count, or whether a radius literal still exists).

The most serious finding: **Fix 4 removed the only visible boundary of the suggestion chips and replaced it with a tonal fill that measures 1.06:1 against the ground in both light and dark themes.** In the live render the chips read as plain text, not tappable controls. That is a usability regression dressed as a craft improvement.

---

## 2. What actually landed well

1. **Copy diet (Fix 6).** Greeting + one supporting line + 3 pills + quiet notice door + composer. The home no longer reads as a landing page. This is the single strongest change in the upgrade.
2. **Three ink levels (Fix 2).** `--role-ink`, `--role-ink-quiet`, `--role-ink-faint` plus `ink-inverse` is a defensible ladder and the contrast gate holds in both themes.
3. **Thinking capsule (Fix 8).** `TurnStatus` now renders one ambient capsule with a pulsing dot, the active stage label, and a `Skip` control. The verbose checklist is gone from the UI.
4. **Material composer (part of Fix 5).** The composer is a floating pill with a layered low-alpha shadow and is detached from the viewport edges. Tactile presence improved.
5. **Breathing mark (Fix 7).** The mark breathes subtly at 4.5s and reduced-motion collapses it via the global rule. The mechanism is in place.

---

## 3. The eight claims vs. measured reality

| Fix | Plan claim | Measured reality | Verdict |
|---|---|---|---|
| **1. Type scale ≤ 4 steps** | 12/14/16/24 only; 700 struck repo-wide | Rendered home shows **5** sizes: 10px, 14px, 16px, 24px, 31px. `TYPE` still defines h3=18px, display1=3.5rem, display2=2.25rem. `Btn` ships raw 13px/14px/15px; `InputField` uses 15px. **700 still exists** in `CaptureLayout.tsx`, `Notice.tsx`, and `.demo-disclosure` (index.css:440). | **Partial** — mobile home subset is restrained, but the repo-wide claim is false and the 10px floor violation remains. |
| **2. Three ink levels** | 3 semantic levels | `ink` / `inkQuiet` / `inkFaint` (+ `inkInverse` for dark surfaces) holds. | **Landed** |
| **3. Exactly 3 radii** | Retire 4/6/10/12/18/22px; sm 8, card 16, pill 999 | **`--radius-xs: 4px` is still live** and used (VoiceOrb bars, `MobileHome.tsx:95,252`, focus-visible). The chat bubble uses a literal `border-radius: 18px 18px 4px 18px` (index.css:392). `LAYOUT.radius.full = 50%` is a fourth value. Rendered home shows 8px, 15px, 999px, 50%. | **Failed** — the plan explicitly said to retire these values and none were retired. |
| **4. Tonal chips, no borders** | Strip borders; fill = `var(--role-sunken)` | Borders stripped on home chips, but **chip fill vs ground = 1.06:1 in both themes** (light: #FFFFFF on #FAF8F5; dark: #0A1422 on #0E1A2B). In the live render chips read as plain text with no affordance. In-chat suggestion chips in `Turn.tsx:897` still carry `border: 1px solid ${C.border}`. `.lokai-chip:hover` re-adds a navy border. | **Regressed** — the only perceivable boundary was removed and the replacement is below the 3:1 UI contrast floor. |
| **5. Material composer** | Pill + Comeau shadow + 3 controls | Pill + shadow landed, but composer has **4 controls** (attach, voice, textarea, send), not 3. It uses `backdrop-filter: blur(24px)` + `rgba(255,255,255,0.88)` — **glassmorphism**, which the repo's own direction docs and this plan's do-not-add list reject. It also has both a border *and* a shadow, contradicting the separation ladder in `shared.tsx:278-282`. | **Partial + new debt** |
| **6. Home declutter** | Greeting + lead + 2–3 pills + composer | Greeting + 1 line + 3 pills + quiet notice door + composer. Element count dropped from ~12 to ~6 blocks. | **Landed** |
| **7. Living brand mark** | 4.5s ambient breath, scale 1→1.025 | Breath exists at scale 1→1.035, but it animates **box-shadow** (paint-heavy, not compositor-only) and runs perpetually on chrome. ChatGPT's Emotive Point pulses only *during generation*, not as a permanent ambient state. | **Implemented, but misread the reference pattern** |
| **8. Ambient thinking** | Single capsule replacing tick list | Capsule landed. The `stages` array is still passed (for `aria-live` sequencing) but only the active label renders. | **Landed** |

---

## 4. Findings the plan missed entirely

### 4.1 The chip affordance regression is the real P0

`src/app/pages/mobile/MobileHome.tsx:363` sets `background: T.sunken` and `border: 'none'`. But `--role-sunken` resolves to `var(--surface-raised)` = `#FFFFFF` in light theme and `#0A1422` in dark — both ~1.06:1 against their grounds. The WCAG gate passes because it parses *role pairs*, and chip-surface-vs-ground is not one of them.

**Consequence:** the three primary entry points on the home screen are visually indistinguishable from body text. A first-time user has no signal that they are tappable. This is exactly the kind of regression a visual review catches that a token gate cannot.

### 4.2 The plan's "diagnosis" numbers do not match the code's actual scale

The plan's table says the old scale was `10, 12, 13, 14, 16, 22, 31px`. The actual `TYPE` object in `shared.tsx` defines `12, 14, 16, 18, 24, 36, 56px` plus raw literals at 13/15px in `Btn` and 15px in `InputField`. The plan audited a different scale than the one that exists, so its "before" baseline is fabricated and its "after" claim cannot be trusted.

### 4.3 The composer contradicts the repo's own separation ladder

`src/app/components/shared.tsx:278-282` states: *"a surface gets a border OR a shadow, never both."* The new composer (index.css:362-369) has both `border: 1px solid var(--role-hairline)` and `box-shadow: var(--elevation-float)`. The plan's own Fix 4 thesis (spacing → tone → shadow → border) is violated by Fix 5.

### 4.4 The breathing mark is a perpetual-motion distraction

`src/app/components/shared.tsx:569-595` defaults `LogoMark` to `animated = true`, and `src/styles/index.css:400-412` runs a 4.5s infinite `scale` + `box-shadow` loop on every instance (home 52px, notice interpretation 44px). Two issues:
- Animating `box-shadow` forces repaint on every frame; a compositor-only approach would use a pseudo-element or transform on a wrapper.
- Permanent ambient motion on chrome competes with the composer, which should be the single focal object. The reference pattern (ChatGPT Emotive Point) is state-bound to *thinking*, not decorative.

### 4.5 The plan's verification section overclaims

The verification plan says gates confirm *"0 bare font sizes, radii, or shadows"* and *"WCAG 2.2 AA contrast for all role pairs."* Both are true of the gate, but the gate does **not** verify the plan's stated targets: rendered type-size count, chip-surface contrast, radius retirement, or control count. Passing the gate is necessary but not sufficient, and the plan presents it as sufficient.

---

## 5. Priority fixes

**P0 — Restore chip affordance.** Keep the borderless direction, but make the fill perceptible: use a dedicated tonal token with ≥3:1 contrast against ground in both themes (e.g., a 6–8% tint, or a hairline only in the unselected state). Re-measure, don't eyeball.

**P1 — Retire the leftover radii and weights.** Remove `--radius-xs: 4px` / `LAYOUT.radius.xs` (replace with 8px or 16px), convert the chat bubble literal to `LAYOUT.radius.card` (16px), and eliminate the three remaining `fontWeight: 700` call sites.

**P1 — Decide the composer's real shape.** Either (a) keep 3 controls and drop voice from the composer, or (b) accept 4 controls and update the plan. Remove the border *or* the shadow, not both. Drop `backdrop-filter` glassmorphism in favor of a solid tonal surface to stay consistent with the paper metaphor.

**P2 — Make the mark state-bound.** Only animate the mark during a working state, or switch to a compositor-only pulse (opacity/transform on a pseudo-element) with no `box-shadow` keyframes.

**P2 — Fix the verification story.** Extend the gate (or add a small scripted check) to assert: rendered type-size count ≤ 4 on mobile home, chip fill vs ground ≥ 3:1 in both themes, and zero `fontWeight: 700`. The plan's current "10/10 gate checks" is a false sense of security.

---

## 6. What to keep

- The greeting + single supporting line + 3-pill home. Do not re-add explainer paragraphs.
- The three-level ink ladder and the warm-cream paper palette.
- The single-anchor discipline (one dark, saturated role per screen).
- The quiet, skip-able thinking capsule.
- The reduced-motion handling.

---

## 7. Final recommendation

**Do not ship the plan as "complete."** The direction is correct and the home screen is materially better, but Fix 4 is a genuine usability regression and the plan's verification claims are overstated. Fix the P0/P1 items above, then re-run `verify:demo && npm run typecheck && npm run build` and re-measure the chip contrast before calling the upgrade finished.

The gap between this build and a truly senior-craft result is now small — but it is the difference between *looking* minimal and *being* minimal. The remaining work is subtraction and measurement, not new features.
