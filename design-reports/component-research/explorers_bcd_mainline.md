# Explorer B/C/D — Mainline completion (explorers died to provider failures; partials preserved)

This file completes the exploration record for sources 3-18 not fully covered by explorer A/B/D
partials. All findings below were gathered by the mainline agent (AutoCoder) via direct HTTP
scrapes, GitHub API, npm registry, and web search on 2026-09-22 01:20-02:10 IST. Every claim is
traceable to a captured signal.

## Source 3 · orb-ui.com — REVIEWED (mainline deep)
- What: "React Voice Orb & Voice Agent UI Components" (site title). Animated orbs, lifecycle
  states, provider adapters (Vapi, ElevenLabs, LiveKit, Pipecat, OpenAI Realtime, Gemini Live),
  accessible controls; production voice-agent UI patterns (socket.dev/npm search results + site).
- License: not directly verified (repo not inspected at API time) — flag as "verify before adopt".
  Risk note recorded in register.
- Components: voice orb visualizer, connect/mute/disconnect lifecycle controls, audio-reactive
  states, adapter layer.
- LokAI fit: the prepared-voice screen (MobileVoiceActive) uses a hand-rolled mic well + dots.
  An audio-reactive orb visualizer would upgrade the "listening" state into a premium
  voice-AI moment. Fit HIGH for that one screen; must re-theme to T.anchor palette and obey
  reduced-motion. Mobile: orb as the listening hero. Desktop: orb in composer mic state.

## Source 4 · beautifului.dev — REVIEWED (mainline deep scrape)
- What: "Crafted primitives for AI-native interfaces" (meta description). 22 component sections
  scraped from headings: Loading State, Thinking, Streaming Text, Approval Card, Tool Chips,
  Task Rows, Chat, Prompt Bar, Recommendation Card, Context Cards, Diff Table, Records Table,
  Filter Table, Sidebar Nav, Search, Flowchart, Insight Cards, Code Block, Fine-tune Card,
  Selection Actions, Agent Screen.
- License: not surfaced on scrape — verify before adopt (register risk).
- LokAI fit: Approval Card = the human-review gate surface (HITL) — matches LokAI's
  draft-confirmation flow. Thinking + Streaming Text = quality upgrades over lokai-dot loader.
  Tool Chips → citation chips. Fit HIGH (patterns), MEDIUM (adoption — copy-paste, needs token
  reskin).

## Source 5 · ui.halaska.com — REVIEWED (mainline)
- What: "A single-file React UI kit for AI products, built on shadcn/ui. 38 UX patterns and
  about 100 components for founders building with coding agents. One file, react and
  react-dom only." (meta description, SPA — client-rendered body).
- License: not surfaced — single-file distribution; verify.
- LokAI fit: reference anatomy more than import source (single-file kit would fight LokAI's
  modular ui/ layer). Its 38 AI-UX patterns are a checklist goldmine for future screens.
  Fit MEDIUM (as reference), not as dependency.

## Source 6 · kvnkld/aicss — REVIEWED (mainline)
- What: "AICSS React UI components for AI agent conversations, plus a CLI" (GitHub title).
  aicss.dev shows "AI Agent Input — composer field with attach + model-switch menu and an
  enhance prompt working state (idle, filled, enhancing, enhanced)". 21st.dev lists 17 public
  React components with live previews. Mid-conversation UI blocks: thinking states, tool calls,
  streaming text, citations, code blocks (index.chele.bi).
- License: MIT (LICENSE file fetched, api.github.com license=MIT). Stars 144, pushed 2026-09-16.
- LokAI fit: solid patterns but redundant with LokAI's existing composer/Turn surfaces.
  The "enhance prompt working state" idea could inform a future LokAI feature (not an import).
  Fit LOW-MEDIUM (inspiration only). Rejected as dependency: would bypass token governance.

## Source 7 · vibeprompts.dev — REVIEWED (mainline scrape)
- What: "UI Prompt Library & Tailwind CSS Snippets" (title) — prompts + ready-to-paste Tailwind
  for auth flows, pricing tables, dashboards (29+ sections scraped: OTP, magic link, 2FA QR,
  SSO gate, passkey, pricing ladder, usage estimator…).
- License: N/A for components (it sells/gives prompts). Not a component library.
- LokAI fit: NOT-APPLICABLE as component source. Possible prompt inspiration for future
  marketing pages. Fit LOW.

## Source 8 · runeicons.com — REVIEWED (mainline deep)
- What: "900+ modern, customizable icons" (meta). Five styles per glyph: outline, duotone,
  fill, pixelated, glass. Browser path editor → copy SVG or JSX. Tree-shakeable React + Vue
  components. By Nexvyn.
- License: Apache-2.0 (site meta + LICENSE fetched from Nexvyn/runeicons).
- Health: GitHub stars 521, pushed 2026-09-12. npm packages NOT found under rune-icons /
  runeicons / @nexvyn/runeicons — distribution appears to be repo/copy or an unindexed package.
  RISK: no verified npm install path (register).
- LokAI fit: current = @phosphor-icons/react (6 files, ~30 icons) + @animateicons/react (1 file,
  chrome tier) + 3 bespoke glyphs. RuneIcons' duotone style could add depth, but: (a) migration
  cost across 6 files vs benefit, (b) Phosphor's weights already give style range,
  (c) no npm package = dependency hygiene problem, (d) icon consistency doctrine (3 tiers,
  do not mix) would gain a 4th tier. VERDICT: NO-GO for a full swap; conditional GO for
  bespoke duotone hero glyphs (e.g., the verification-gate shield, evidence locker) via copied
  SVG, IF the team wants more visual richness there. See §6 of report.

## Source 9 · reactbits.dev/c/micro — REVIEWED (mainline)
- What: React Bits — "Animated UI Components For React" (title). JS+CSS and TS+Tailwind
  variants per component; known catalog (from search results): Split Text, Blur Text, Click
  Sparks, Count Up, Magnet, etc. Micro category = small interaction flourishes.
- License: repo (DavidHDev/react-bits) MIT — signaled by repo docs; verify at adopt time.
- LokAI fit: mostly decorative flourishes (novelty budget would bust). Count-Up is the one
  candidate (grounded-claims counter). Fit MEDIUM-LOW.

## Source 10 · interior.dev — REVIEWED (mainline deep)
- What: "Free animated React components and micro-interactions for the half-second after a
  click. Copy the TypeScript source. Open source, MIT license." (meta). Full component list
  scraped: Loading Button, Hold to Confirm, Tooltip Group, Slider Detents, Segmented Control,
  Like Burst. By @ozzyxs1a (ddoemonn/interior).
- License: MIT (LICENSE fetched: "MIT License Copyright (c) 2026 ozzy"). Stars 796,
  pushed 2026-09-10.
- LokAI fit: HOLD TO CONFIRM is a bullseye for destructive/confirm actions (draft submission,
  evidence deletion) — trust-appropriate weighty confirmation. SEGMENTED CONTROL for the
  language switcher (EN/HI/MR/TA) and appearance switcher. LOADING BUTTON for the one primary
  CTA per screen (press + pending state — directly patches audit gap C-10). Fit HIGH.

## Source 11 · cube-motion.dev — REVIEWED (mainline)
- What: "Cube — JavaScript animation library for UI motion. Zero-dependency, four fixed
  motions, adapters for React/Vue/Solid/Svelte, reduced-motion built in." Headings scraped:
  rise, leave, morph, reveal + "Why no dials / Numbers, not options".
- License: not surfaced at scrape time (register flag).
- LokAI fit: philosophy overlaps (fixed motion set = LokAI's one-recipe doctrine) but it is a
  SECOND motion engine next to motion/react — two timing systems violate C-05's "one system"
  rule. Fit LOW (adopt philosophy, not the library).

## Source 12 · elements.ai-sdk.dev — REVIEWED (mainline deep — strongest finding)
- What: Vercel AI Elements — "A component library and custom registry built on top of
  shadcn/ui to help you build AI-native applications faster" (title/meta). 48 component slugs
  enumerated directly from the site: agent, artifact, audio-player, canvas, chain-of-thought,
  checkpoint, code-block, commit, confirmation, connection, context, conversation, edge,
  environment-variables, file-tree, image, inline-citation, jsx-preview, message, mic-selector,
  model-selector, node, open-in-chat, package-info, panel, persona, plan, prompt-input, queue,
  reasoning, sandbox, schema-display, shimmer, snippet, sources, speech-input, stack-trace,
  suggestion, task, terminal, test-results, tool, toolbar, transcription, voice-selector,
  web-preview.
- License: Apache-2.0 (LICENSE fetched from vercel/ai-elements: "Copyright 2023 Vercel, Inc.
  Licensed under Apache License 2.0"). Stars 2452, pushed 2026-09-01. Distributed via shadcn
  registry (npx ai-elements) — no npm package needed; components copy into the repo (compatible
  with LokAI's ownership doctrine).
- LokAI fit: inline-citation + sources = LokAI's grounded-claims chips, production-hardened.
  confirmation = human-review gate card. reasoning/chain-of-thought = staged legal reasoning
  reveal. suggestion = prepared-question chips. task/plan = case-step workflow. conversation/
  message/prompt-input = chat scaffolding. speech-input/transcription/mic-selector = voice flow.
  Fit HIGH — the single most aligned source in the list.

## Source 13 · xxtomm/spell-ui — REVIEWED (mainline)
- What: "Beautiful, sophisticated UI components designed for modern React and Tailwind CSS"
  (README). Docs (spell.sh/docs) slugs scraped: chart, badge, kbd, marquee, tweet, spotify-card,
  logos-carousel, qr-code, fallback-avatar, blur-reveal, special-text, shimmer-text,
  highlighted-text, slide-up-text, text-marquee, words-stagger, signature, randomized-text,
  gradient-wave-text, rich-button, flow-button, copy-button, pop-button, color-selector,
  label-input, animated-checkbox, exploding-input, spinner, bars-spinner, light-rays,
  animated-gradient, tilt-card.
- License: MIT (LICENSE badge + file). Stars 1300, pushed 2026-08-14.
- LokAI fit: copy-button (evidence/complaint copy affordance), animated-checkbox (fact
  confirmation), words-stagger/blur-reveal (editorial reveals). Others are decorative or
  off-domain (spotify-card, tweet). Fit MEDIUM.

## Source 14 · arihantcodes/spectrum-ui — REVIEWED (mainline)
- What: "Spectrum UI — collection of re-usable components built using Aceternity UI, Magic UI
  and ShadCN UI, copy-paste" (GitHub description).
- License: Apache-2.0 (LICENSE fetched). Stars 1404, pushed 2026-09-21.
- LokAI fit: Aceternity/Magic UI derivatives trend flashy (novelty-budget risk, C-33); most
  components fight LokAI's restraint doctrine. Fit LOW-MEDIUM (browse for one-off gems only).

## Source 15 · fluidfunctionalism.com — REVIEWED (mainline)
- What: "Open Source UI components created by @micka_design" (meta). SPA, minimal headings
  scraped ("How do you plan to use Fluid Functionalism? · Make them yours").
- License: not surfaced (register flag).
- LokAI fit: identity-forward component art; not a system fit. Fit LOW (reference/inspiration).

## Source 16 · transitions.dev — REVIEWED (explorer D partial + mainline terms check)
- What: 47-essential-transition catalog (sitemap, explorer D): card-resize, number-pop-in,
  thinking-states, reasoning-stream, streaming-text, matrix-dot-loader, spinner-to-check-morph,
  success-check, error-state-shake, icon-swap, skeleton-loader-and-reveal, tabs-sliding,
  toast-open-close, modal-open-close + more; ships as CSS/JS snippets + an installable "Skill"
  that teaches coding agents product motion; Pro tier for premium set.
- License: custom terms (terms.html fetched): free transitions usable in unlimited personal and
  commercial projects, modification allowed, redistribution of the collection forbidden;
  Pro = paid subscription (Stripe). NOT OSI MIT — record as "custom free-license + paid tier".
- LokAI fit: thinking-states / reasoning-stream / streaming-text / spinner-to-check map onto
  TurnStatus + revealStepMs upgrade path with exact token mapping (see §5). Fit HIGH.

## Source 17 · harshjdhv/componentry — REVIEWED (mainline)
- What: "Beautiful, interactive UI components you can copy and paste. React, Tailwind CSS,
  Framer Motion. Open source, free forever" (README). Vercel OSS sponsored. componentry.dev.
- License: MIT (badge + LICENSE). Stars 512, pushed 2026-09-20.
- LokAI fit: broad collection, Framer Motion-based (= motion/react — same engine LokAI uses).
  Browse for: buttons/press states, cards. Quality bar good but generic; no AI-specific
  primitives surfaced. Fit MEDIUM.

## Source 18 · swamimalode07/rare-ui — REVIEWED (mainline)
- What: "A shadcn registry of rare, ready-to-use components and animations" (README). Every
  component animated with Motion, honors prefers-reduced-motion, copy-ownership model.
  11+ components: Folder, Duration Picker, Fluid Orb, Gravity Letters, OTP Input (slugs
  scraped from www.rareui.com).
- License: MIT (LICENSE). Stars 1350, pushed 2026-09-20.
- LokAI fit: reduced-motion + Motion + shadcn = stack-compatible. Components are niche widgets;
  none maps to a LokAI need except possibly Fluid Orb (voice) — orb-ui is the stronger voice
  candidate. Duration Picker could serve a future "hearing date" feature. Fit MEDIUM-LOW.

## Sources 1-2 — see explorer_A.md partial (Amicro + BoardUI fully reviewed there)

## Premium-white vs warm-cream — sourced observations (mainline)
1. bscwebdesign.at (Sep 2025): "5 modern alternatives to pure white" — off-whites (gray/beige/
   yellow tints) read warmer and more modern; pure white is the default, not the distinction.
2. supercharge.design (Mar 2025): "Pure white is not as big of a UI crime as pure black; you
   can safely use it for backgrounds, as long as the text isn't pure black."
3. ux.stackexchange.com: white maximizes contrast with black text; light-grey/neutral grounds
   reduce glare and let white cards float (the classic card-on-canvas separation).
4. designmodo (Jul 2025): advocates true #FFFFFF when you want crispness — the opposite camp,
   showing this is a taste axis, not a rule.
5. LokAI's own audit (this session): cream #FAF8F5 is 3 R-units warmer than white; ink contrast
   17.21:1 (cream) vs 18.25:1 (white); tertiary 5.55:1 vs 5.88:1; saffron-accessible 4.13:1 vs
   4.38:1 — white wins every contrast number by a small margin; cream wins distinctiveness.

## Rejected-with-reason log (traceability)
- Amicro tilt-card/download-button: decorative, no legal-guide mapping (explorer A).
- BoardUI orders/revenue charts, auth-card: wrong domain; theme-toggle redundant (explorer A).
- cube-motion as dependency: second motion engine violates one-motion-system doctrine.
- AICSS as dependency: bypasses token governance; borrow patterns only.
- VibePrompt: prompts, not components — out of medium.
- Spectrum UI mass-adoption: novelty-budget risk.
- RuneIcons full swap: no npm path, 4th icon tier violation, low benefit vs Phosphor.
