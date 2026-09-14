# Mobile Frame Confinement Audit — 2026-09-10

Scope: is the mobile design confined to a real, usable phone geometry — and does the whole phone fit a 13″ MacBook recruiter's browser without scrolling? Live-tested in a real browser (dev server, both standalone and `?embed=1` portfolio-embed modes) at 320/360/375/390/393/430 widths and 568/667/720/750/780/844/900 heights, plus a researched fact-base on frame standards, recruiter viewport math, and touch-target law.

Companion to `AUDIT-2026-09-10.md` (whole-app audit). This doc covers the mobile frame only.

---

## 1 · Verdict

**The mobile design is already properly confined to a real phone.** The "goes way out of an actual usable mobile design" feeling is not a layout failure — it is the *standalone dev presentation* (a 390×844 device bezel floating on a cream canvas, intentionally a mockup view), not the app itself. Tested as an app — embed mode, iframe-is-the-phone — it behaves like a real phone at every size from a 320×568 budget phone to a 430×956 Pro Max: **43 layout tests, 0 horizontal overflow, the page itself never scrolls, the composer is always visible.**

The two things that actually need fixing are touch-target sizes (all icon buttons are 31–35px, below the 44pt/48dp platform minimums) and one 19px control on Profile. One architecture decision to *keep*: the portfolio embed at **390×780** — it is mathematically the right height for the recruiter no-scroll requirement (§3).

---

## 2 · What the universal frame size actually is (researched)

**Base width: 390×844 — the repo's current choice is correct.**

- iPhone logical viewports in 2026: SE 3rd gen **375×667** · iPhone 12/13/14 **and 16e 390×844** · 14 Pro/15/16 **393×852** · 16 Pro 402×874 · 16 Pro Max 440×956 (yesviz.com, Apple panel math).
- StatCounter mobile worldwide (Aug 2026, top rows): 414×896 13.6% · 360×800 9.3% · **390×844 6.8%** · 393×873 5.3% · 384×832 4.4% · 360×780 3.2%. Among iPhone-class widths, 390 leads 393.
- Figma Community device-mockup assets still standardize on "iPhone: 375×812, 390×844; Android: 360×640, 360×800" — 375×812 persists only as a legacy template size; 375 survives on real devices solely as the SE (375×667).
- No authoritative survey of which base designers actually pick exists (Figma's docs list preset groups, not pixels). **Synthesis:** 390×844 is the safest single iOS base for 2025–26 — it covers iPhone 12–14 + 16e, leads iPhone widths in usage share, and is 3px narrower than 393 (which reflows trivially). Pair with 360 for Android QA. This is exactly what `embed.ts` implements (`DEVICE_WIDTHS = { compact: 360, base: 390, large: 430 }`).

So: **design at 390, QA at 320–430, never design at 375.**

---

## 3 · The recruiter's 13″ MacBook viewport (the no-scroll requirement)

**A 13″ Mac shows roughly 780–870 CSS px of browser viewport height.** Verified screen "looks-like" resolutions (EveryMac, Apple Support):

| Machine | Default "looks like" | Chrome viewport (≈UI 88px) | Safari (≈UI 75px) |
|---|---|---|---|
| 13″ MacBook Pro M1/M2, Air 13.3″ | 1440×900 | ≈1440×**812** (782 w/ bookmarks bar) | ≈1440×826 (798 w/ favorites) |
| MacBook Air 13.6″ M2/M3 | 1470×956 | ≈1470×866 (838 w/ bar) | ≈1470×882 (854 w/ bar) |

(Browser-chrome subtraction is arithmetic, not a sourced constant — no authoritative source publishes exact macOS Chrome/Safari UI heights. The floor case is **≈782px**: 1440×900 machine, Chrome, bookmarks bar on.)

**Consequences:**

- The **portfolio embed at 390×780** (what `embed.ts` says PrototypeFrame renders) fits *every* one of those viewports without scrolling — 780 ≤ 782 floor. **This is the load-bearing number: keep the embed at ≤780 height.** If the case study ever iframes the full 844 artboard instead, it breaks the floor case (844 > 782) and the recruiter scrolls.
- The embed height is not arbitrary — it is the artboard minus device chrome: 844 − 44 (mock status bar) − 20 (home indicator) = 780. `StatusBar` and `HomeIndicator` both `return null` when `IS_EMBED`, and the portfolio supplies its own chrome. The architecture is already exactly right; it just was never written down as a *requirement*.
- The standalone dev view needs no change: `FrameScaler` scales the framed device down to fit any window (never up), so even at a 720px-tall browser the phone renders at ~80% and fits fully. Verified on fresh load at 1280×720: `scale(0.8018)`, artboard 22→698px, no page scroll.
- Remaining recruiter-side risk lives in the **Portfolio repo (out of scope here)**: the PrototypeFrame section must *start high enough on the page* that iframe top + 780 ≤ viewport height. If the phone sits below a paragraph of case-study prose, even a 780px frame lands below the fold. Anchor the phone at the top of its section, or cap the rendered frame at ~720px and center it.

---

## 4 · Responsive test matrix (all live, `?embed=1` unless noted)

| Test | Sizes | Result |
|---|---|---|
| Every screen, overflow sweep | onboarding, home, case, notice, voice, files, profile × 320/360/375/393/430 | **35/35 clean** — 0 elements past viewport, `scrollWidth === innerWidth` everywhere |
| Short-phone floor | home, case, notice, files × 375×667 (SE) and 320×568 | **8/8 clean** — 0 overflow, page never scrolls, composer visible; content region scrolls internally where content exceeds it (correct) |
| Scroll model | all screens at 390×780 | Page (documentElement) never scrolls. Internal scroll region: case clips 79px, files clips 318px → both scroll internally; home/notice/voice/profile content fits (642/614/614/589px regions) |
| Drawer containment | home → open drawer | Panel 347×680 absolute inside the 390×780 artboard; `scrollWidth` stays 390; rows 232×35, matter card 156px tall. Contained, does not escape the frame |
| Standalone device QA | `?device=compact/large` + reload | Artboard reflows to 360/430 correctly. **Gotcha:** detection reads the hash query once at module load, so in-app navigation ignores `?device=` — only takes effect on a full page reload. QA tooling note only |
| Stop state | `#/specimen/turn-stop` | Full tone-inverted refusal renders correctly at phone size |
| Prior-audit P3 re-check | specimens at 390 and 360 | **Fixed** — 0 overflowing elements at both widths |

**What the sweep proves:** the app is width-fluid because type/spacing are rem-based and `ARTBOARD` embed-mode is `width: 100%, maxWidth: 430` — a real 320–430px phone gets its own width, not a letterboxed 390. Content reflows rather than clips at every tested size. The phone metaphor is intact down to the smallest device still in use.

---

## 5 · Usability audit (touch targets, thumb zones)

Standards (all verified): **Apple HIG 44×44pt minimum** hit region · **Material 48×48dp** (icon may render 24dp inside a 48dp padded target; 48dp ≈ 9mm) · **WCAG 2.2 SC 2.5.8 (AA) 24×24px** with a spacing exception (undersized target passes if a 24px circle around it touches no other target) · WCAG 2.5.5 (AAA) 44×44px. Thumb research (Hoober 2017): ~75% of users touch the screen with one thumb; center targets ~7mm work, corners need ~12mm — disregard old corner-reach diagrams.

### Measured at 390×780 (embed), every interactive element:

| Element | Measured | HIG 44pt | Material 48dp | WCAG AA 24px |
|---|---|---|---|---|
| Primary CTAs ("Talk to a person", "See full assessment") | 314×40–42 | ✗ (3px short) | ✗ | ✓ |
| Case-journey rows (verify/plan/notice/docs/audit) | 314×54 | ✓ | ✓ | ✓ |
| Evidence cards (Files) | 302×75–106 | ✓ | ✓ | ✓ |
| Drawer rows, matter card | 232×35 / 232×156 | ✗ rows | ✗ | ✓ |
| Home suggestion chips | 124–166×**30** | ✗ | ✗ | ✓ (spacing) |
| Onboarding language buttons | 53–66×**33** | ✗ | ✗ | ✓ |
| Composer icon buttons (send / attach / mic) | **31×31** | ✗ | ✗ | ✓ (spacing) |
| Top-bar icon buttons (menu / new-chat / back) | **35×35** | ✗ | ✗ | ✓ (spacing) |
| **Profile "Notifications" control** | 35×**19** | ✗ | ✗ | **✗ likely fails even AA** — below the 24px floor; spacing exception doubtful (sits in a dense row) |
| Composer textarea | 233×19 (input) | — container taller | — | ✓ |

### Thumb-zone placement (bottom 40% = comfort zone):
- Composer + send/attach: 79–89px from bottom — **excellent**, the primary input is in the deepest thumb zone.
- Drawer "New chat" at 357 from bottom (on a 780 frame ≈ 46% depth) — good; account rail at the very bottom — excellent.
- Case CTAs at 109–257px from bottom — good; the whole action zone lives in the lower half.
- Top-corner controls (menu/new-chat at ~127px from top) are the only stretch reaches — standard trade-off, matches ChatGPT/Gemini.

### Findings, ranked:

1. **P1 — Profile "Notifications" 19px control.** Below every minimum including likely WCAG AA. Fix: pad the hit area to ≥44px (visual size can stay).
2. **P2 — Systemic sub-44pt targets.** All icon buttons (31–35px), chips (30px), onboarding buttons (33px) pass WCAG 2.5.8 AA via spacing but miss Apple/Material minimums. On a real phone this is the difference between "works" and "feels native." Fix without redesign: invisible hit-area padding (`::before` expansion or padded flex wrappers) to 44×44pt while keeping the visual glyphs at current size. Composer buttons are bespoke in `Turn.tsx` — pad there; chips/rows via the primitives.
3. **P2 — Primary CTAs at 40–42px.** 2–4px short of 44pt. Cheap: raise `Button` primary height token to 44.
4. **P3 — QA tooling:** `?device=` needs a full reload (one-line doc note in MOBILE_SCREENS.md).

### What passed outright:
One-primary-per-screen holds everywhere; the five-slot grammar keeps chrome fixed and content scrolling; drawer never escapes the artboard; zero horizontal overflow at any width; composer always reachable; status bar/home indicator correctly vanish in embed (portfolio supplies chrome); staged progress + Skip affordance present on long turns.

---

## 6 · The confinement spec (what to keep, what to change)

**Keep — these are already correct and now documented as requirements:**

1. **Artboard: 390×844** (`ARTBOARD`, standalone). Correct 2025–26 base; do not move to 375 or 393.
2. **Portfolio embed: 390×780, never taller.** It is the artboard minus device chrome and is the maximum height that fits every 13″ Mac browser scenario. If the Portfolio side ever wants more headroom, scale the whole iframe (e.g. 0.92 × 780) rather than growing it.
3. **Embed fluid width `100% / maxWidth 430`** — real phones get their own width.
4. **`FrameScaler` scale-to-fit** in standalone — never scales up, 24px margin, resize-aware. Verified at 720–900px viewports.
5. **QA widths 320/360/390/430** via `?device=` (note the reload requirement).

**Change:**

6. **Touch targets to 44pt** — invisible padding, no visual change (#1–3 above). This is the single highest-leverage fix for "feels like a real app."
7. **Portfolio side (out of scope):** keep the PrototypeFrame section anchored high; iframe top + 780 must fit ~782px of viewport.

**Do not do:**

8. Don't add a bottom tab bar, don't shrink the artboard to 375, don't put scroll on the page body, don't scale the embed above 780. The current confinement architecture is the correct one — it just needed proof.

---

### Test log (reproducible)

Dev server on 5174; embed tests at `#/mobile/<screen>?embed=1`; standalone at `#/mobile/<screen>[?device=compact|base|large]` (reload after changing `device`). Measurements via DOM audit in a live browser: per-element `getBoundingClientRect` overflow sweep, artboard/frame geometry, drawer panel containment, touch-target sizes and distances-from-bottom on every interactive element across 7 screens.
