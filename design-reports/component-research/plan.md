# LokAI Component Exploration — Coverage & Plan

Goal: evaluate 18 supplied component/UI/icon sources, shortlist what fits LokAI (mobile +
desktop), adaptation guide per component, Runeicons icon decision, premium-white vs cream
verdict with mockups, license/risk register with fallbacks. Report = self-contained HTML
(Takram style) under DELIVERY/.

## Source coverage map (user supplied 18 links; goal brief says 19 — discrepancy flagged)

| # | URL | Explorer | Status |
|---|-----|----------|--------|
| 1 | github.com/Subhan-code/Amicro--Micro-transitions- | A | PENDING |
| 2 | github.com/BoardUI/boardui | A | PENDING |
| 3 | orb-ui.com | A | PENDING |
| 4 | beautifului.dev | A | PENDING |
| 5 | ui.halaska.com | A | PENDING |
| 6 | github.com/kvnkld/aicss | B | PENDING |
| 7 | vibeprompts.dev | B | PENDING |
| 8 | runeicons.com | B (icon deep-dive) | PENDING |
| 9 | reactbits.dev/c/micro | B | PENDING |
| 10 | interior.dev | B | PENDING |
| 11 | cube-motion.dev | C (motion deep-dive) | PENDING |
| 12 | elements.ai-sdk.dev | C (AI-surface deep-dive) | PENDING |
| 13 | github.com/xxtomm/spell-ui | C | PENDING |
| 14 | github.com/arihantcodes/spectrum-ui | C | PENDING |
| 15 | fluidfunctionalism.com | C | PENDING |
| 16 | transitions.dev | D (motion deep-dive) | PENDING |
| 17 | github.com/harshjdhv/componentry | D | PENDING |
| 18 | github.com/swamimalode07/rare-ui | D | PENDING |

## Workstreams

| # | Stream | Output | Status |
|---|--------|--------|--------|
| 1 | Explorer A (sources 1-5) | explorer_A.md | RUNNING |
| 2 | Explorer B (sources 6-10 + Runeicons) | explorer_B.md | RUNNING |
| 3 | Explorer C (sources 11-15 + AI Elements) | explorer_C.md | RUNNING |
| 4 | Explorer D (sources 16-18 + white-vs-cream research) | explorer_D.md | RUNNING |
| 5 | Premium-white mockups (mainline) | mockups.html fragment | RUNNING |
| 6 | Merge + shortlist + adaptation guide | report sections | PENDING |
| 7 | License/risk register + fallbacks | report section | PENDING |
| 8 | Final HTML report + verification | DELIVERY/LokAI-Component-Report-2026.html | PENDING |

## LokAI token baseline (from src/styles/index.css, verified)

- Cream ground: --surface-bg #FAF8F5, card/raised #FFFFFF, sunken raised-white, paper #FBF9F3
- Ink #161513, secondary #44413A, tertiary #68645D (5.40:1 fixed)
- Navy #0B1B32, saffron #E27A24 (accessible #C25B12), terracotta #A24625
- Semantic: success #196535, danger #B33218, caution #854000, oxblood #671D1D
- Hairlines rgba(22,21,19,0.08/0.16); washes #EEF4FF/#FFF2DC/#FAECE9
- Dark theme exists (role layer L199+: ground #0E1A2B, raised #16263C)

## Premium-white candidate palette (mainline proposal, to be stress-tested)

- ground #FFFFFF · sunken #F6F6F5 · hairline 0.08→0.11 (needs more separation on white)
- paper #FCFCFB · washes desaturated: #F2F5FA / #FAF6EC / #F9F1EF
- ink/navy/saffron/semantic: UNCHANGED (contrast on white only improves)
- Dark theme: untouched. Doctrine note: LokAI's "border OR shadow" contact-shadow system
  carries less lift on pure white — shadows must strengthen ~1 step or accept flat look.

## Mockup method (honest simulation, labeled)

Real captured screenshots (audit session, light theme) embedded twice: original + CSS-filter
simulation of premium white (desaturate warm cast, slight lift). Filter tuned on swatches.
Plus a real-value token board (cream swatches vs white swatches rendered with actual hex).
No repo mutation. Verdict + rollback conditions stated from evidence.
