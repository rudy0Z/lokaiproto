# Implementation evidence

- `src/app/data/demoScenarios.ts`: one shared consumer matter, seven guardrail scenes, four legal-term explanations.
- `src/app/context/DemoContext.tsx`: shared scenario, glossary, and audit state.
- `src/app/components/demo/`: guardrail gallery, disclosure, legal-term trigger, mobile dialog, and desktop panel.
- `src/app/services/api.ts`: deterministic compatibility adapters; no network requests.
- `src/app/pages/Chat.tsx`, `MobileConsumerCase.tsx`, `Notice.tsx`, and `MobileVoiceActive.tsx`: prepared text, notice, voice, source, and review interactions.
- `src/styles/index.css`: consolidated runtime tokens, accessible text colors, reduced motion, mobile bottom navigation, and tablet rail.
- `scripts/verify-demo.mjs`: zero-network/permission scan and scenario/glossary contract check.
- Removed duplicate mobile language chats, login/onboarding capability screens, and the unused tenancy document chat.

Verification:

- `npm run verify:demo` passes.
- `npm run build` passes with route-level code splitting.
- Desktop, tablet, mobile home, desktop chat, and mobile matter screenshots were inspected.
