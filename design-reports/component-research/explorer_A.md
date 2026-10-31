# Explorer A — Sources 1-5

## Coverage
| # | URL | Status (REVIEWED/UNREACHABLE/NOT-APPLICABLE) | Error if any |
|---|-----|----------------------------------------------|--------------|
| 1 | https://github.com/Subhan-code/Amicro--Micro-transitions- | REVIEWED | |
| 2 | https://github.com/BoardUI/boardui | REVIEWED | |
| 3 | https://orb-ui.com | PENDING | |
| 4 | https://www.beautifului.dev | PENDING | |
| 5 | https://ui.halaska.com | PENDING | |

## Per-source findings

### 1. Amicro — Micro-transitions (https://github.com/Subhan-code/Amicro--Micro-transitions-)
- What it is: npm package `@subhanhq/amicro` — curated premium React micro-interactions, transition components, and card layouts powered by Motion (Framer Motion). CLI-based copy-into-project distribution, also a shadcn/ui registry (`@amicro/fade-in` etc.). Layout attribution to transition.dev.
- Components (names): fade-in, fade-up, zoom-in, tilt-card, download-button, card-arc-5 (card interactions), motion primitives, custom hooks, spring presets. Registry-style single-purpose motion primitives.
- License: MIT (LICENSE file verified, (c) 2026 Syed Subhan Uddin)
- Framework: React (React/Next.js/Vite), Motion (framer-motion), shadcn-compatible CLI. Tailwind not explicitly required by README excerpt but shadcn-registry style implies it.
- Maintenance: Active — npm package published, was on GitHub trending (trendshift.io), an unofficial SvelteKit port exists (Aug 2026 mention). Recent activity signals good.
- Visual quality: Premium positioning; micro-interaction focus (entrance fades, zooms, tilt hover cards). No dashboard-grade components; aesthetic is motion-first, boutique.
- Candidate components for LokAI:
  - fade-in / fade-up / zoom-in — page-entrance choreography for the legal-guide answer reveal and section transitions (mobile+desktop) — fit M — matches LokAI motion tokens (easing curves, 120-280ms), but we likely already hand-roll these on cubic-bezier(0.22,1,0.36,1).
  - tilt-card — hover tilt on desktop document/case-card previews — fit L — hover-only effect, no mobile value, decorative for a serious legal tone.
- Rejected: download-button, card-arc variants — demo-oriented, not aligned to legal-guide flows; amicro is a motion garnish library, not a system (no tokens, no type scale, no governance).

### 2. BoardUI (https://github.com/BoardUI/boardui)
- What it is: "React design system for agentic interfaces" — the parts an AI product needs (chat, thinking indicator, agent log, composer) plus dashboard parts (tables, cards, forms), 62 free components as source files copied into your project via `npx boardui add`. Figma-first, 400+ semantic tokens, light+dark, React Aria underneath, Tailwind CSS v4, MCP server + AGENTS.md rules for agent-native builds. Free tier = this repo; BoardUI Pro exists (paid, e.g. Radial Chart Card Pro).
- Components (names): Application blocks: agent-chat (agent chat), agent-log, agent-thinking, app-shell, auth-card, composer-loader, data-table, important-alerts-card, notification-center, orders-chart-card, patient-info-card, revenue-chart-card, settings-modal, sidebar, stat-cards, theme-toggle. Base: announcement, avatar, badge, breadcrumb, button, button-group, carousel, checkbox, checkbox-card, chip, close-button, date-picker, date-range-picker, divider, dropdown, file-upload, icon-button, input, input-otp, kbd, link-button, meeting-scheduler, notification, pagination, radio, radio-card, segmented-control, select, slider (cut off — more exist).
- License: MIT (LICENSE verified, (c) 2026 Mertcan Dundar Esmergul / BoardUI); repo is generated, takes no PRs. Pro tier is paid.
- Framework: React + Tailwind CSS v4 + React Aria Components, Next.js-oriented, no runtime CSS. Tailwind 4 = exact match for LokAI stack.
- Maintenance: Active — npm package, npm/d18m downloads badge, X account, Discord, Aug 2026 tweets about responsive react templates.
- Visual quality: High — coherent design system with semantic tokens (aligns with LokAI no-raw-hex governance), dark-mode ready via tokens, accessibility-first (React Aria). Dashboard/pro aesthetic.
- Candidate components for LokAI:
  - agent-thinking — thinking indicator (dot wave/spin/stars/infinity + shimmer label + elapsed timer) for the AI answer loading state in the guide flow — fit H — directly reusable, token-driven, perfect for an AI legal-guide UX.
  - agent-log — streaming-log machinery (reveal ticker, blur-in, curved tree guide) for showing step-by-step legal reasoning / source-citation walk-through — fit H — deterministic staged reveal matches LokAI's deterministic guide philosophy.
  - chat-starter / agent-chat — full chat app shell with sidebar, streaming replies, composer pill with stop control, history rail — fit H — could scaffold the whole LokAI ask-a-question screen.
  - data-table + stat-cards — rights/deadline tables and case KPI row on desktop dashboard — fit M — useful for structured legal info (filing deadlines, documents checklist) but needs LokAI reskin.
  - input + file-upload + segmented-control — composer with document upload and language switcher (EN/HI/MR/TA) — fit M — segmented control maps neatly to the 4-script typography switcher.
  - notification / notification-center — alerts for case updates or guide follow-ups — fit L-M — plausible but not core to prototype.
- Rejected: orders-chart-card / revenue-chart-card (e-commerce metrics, wrong domain), auth-card (no auth in prototype), theme-toggle (LokAI has fixed warm paper theme), composer-loader (overlaps agent-thinking, fancier than needed).

### 3. Orb UI (https://orb-ui.com)
- What it is: TBD
- Components (names): TBD
- License: TBD
- Framework: TBD
- Maintenance: TBD
- Visual quality: TBD
- Candidate components for LokAI: TBD
- Rejected: TBD

### 4. BeautifulUI (https://www.beautifului.dev)
- What it is: TBD
- Components (names): TBD
- License: TBD
- Framework: TBD
- Maintenance: TBD
- Visual quality: TBD
- Candidate components for LokAI: TBD
- Rejected: TBD

### 5. Halaska UI (https://ui.halaska.com)
- What it is: TBD
- Components (names): TBD
- License: TBD
- Framework: TBD
- Maintenance: TBD
- Visual quality: TBD
- Candidate components for LokAI: TBD
- Rejected: TBD

## Verdict summary
TBD
