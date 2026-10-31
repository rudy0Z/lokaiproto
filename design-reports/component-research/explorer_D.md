# Explorer D — Sources 16-18 + background research

## Coverage
| # | URL | Status | Error if any |
|---|-----|--------|--------------|
| 16 | https://transitions.dev | OK (200) | - |
| 17 | https://github.com/harshjdhv/componentry | PENDING | - |
| 18 | https://github.com/swamimalode07/rare-ui | PENDING | - |
| BG | white vs cream research | PENDING | - |

## Per-source findings

### 16. Transitions.dev (https://transitions.dev)
- **What it is:** Curated collection of ~47 "essential UI transitions for web apps" by Jakub Antalik, explicitly positioned as "UI transitions for AI agents" — copy-paste snippets plus an installable **Skill** that teaches AI coding agents (Claude Code, Cursor, Copilot, Codex, Gemini CLI) product-motion patterns. Also ships a "Refine" tool for agents and a Pro tier.
- **Framework:** Plain HTML/CSS/JS demo cards (repo has `transitions/`, `skills/`, `cli/` dirs); snippets are framework-agnostic CSS/JS usable in React+Tailwind. Not an npm component library.
- **License:** Site copyright page = terms.html; repo exists (github.com/Jakubantalik/transitions.dev) — license verification pending (check README).
- **Maintenance:** Active site, sitemap fresh, CLI + skill pipeline in repo, tied to author's animations.dev ecosystem.
- **Visual quality:** High polish — micro-interactions marketed as production-ready motion with consistent easing; page runs on Inter/Roboto Mono.
- **Full transition catalog (sitemap):** card-resize, number-pop-in, notification-badge, text-states-swap, confetti-burst, menu-dropdown, modal-open-close, panel-reveal, gooey-plus-menu, page-side-by-side, card-stack-hover, icon-swap, success-check, avatar-group-hover, error-state-shake, organic-shimmer, input-clear-with-dissolve, skeleton-loader-and-reveal, texts-reveal, tabs-sliding, drag-drop-with-physics, image-open-tilt, shimmer-text, tooltip-open-close, 3d-tilt, dropdown-menu-morph, accordion, toast-open-close, like-button, learn-more-hover, checkbox-check, spinner-to-check-morph, spinning-counter, toggle, pro-gradient-text, delete-with-smoky-dissolve, **thinking-states, reasoning-stream, streaming-text, matrix-dot-loader**, banner-stacking, image-generation-placeholder, get-pro-button, + more.
- **LokAI fit note:** The AI-native transitions (thinking-states, reasoning-stream, streaming-text, matrix-dot-loader, image-generation-placeholder) map directly onto an AI legal-guide app's generation/streaming UX. Motion-token alignment (LokAI uses cubic-bezier(0.22,1,0.36,1) @ 120–280ms) needs per-snippet audit, but the library's philosophy (essential, consistent motion) matches.

## Premium-white vs warm-cream research
(to be appended)

## Verdict summary
(to be appended)
