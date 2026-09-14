import { createHashRouter, Navigate } from 'react-router';
import type { ComponentType } from 'react';
import CaptureLayout             from './CaptureLayout';

// Shells
import DesktopShell              from './shells/DesktopShell';
import MobileShell               from './shells/MobileShell';

const lazyPage = (importer: () => Promise<{ default: ComponentType }>) => async () => {
  const module = await importer();
  return { Component: module.default };
};

/*
 * Hash router, not browser router — deliberately.
 * The portfolio embeds every prototype as `<base>/index.html#<route>` (see
 * getPrototypeSrc in the portfolio's lib/prototypes.ts), and embed.ts reads
 * `embed=1` off that same hash. A browser router ignores the hash entirely,
 * so every embedded deep link fell through to the `/` fallback. Sentinel
 * already uses createHashRouter for this reason; LokAI now matches it.
 */
export const router = createHashRouter([
  {
    Component: CaptureLayout,
    children: [
      // ── Desktop shell (sidebar + content) ───────────────────────────────
      {
        path: '/desktop',
        Component: DesktopShell,
        children: [
          { index: true, element: <Navigate to="/desktop/dashboard" replace /> },

          // Dashboard
          { path: 'dashboard',          lazy: lazyPage(() => import('./pages/Home')) },

          // Focused consumer conversation
          { path: 'chat',               lazy: lazyPage(() => import('./pages/Chat')) }, // Active/new conversation fallback
          { path: 'chat/consumer',      lazy: lazyPage(() => import('./pages/Chat')) }, // Consumer demo
          { path: 'chat/:chatId',       lazy: lazyPage(() => import('./pages/Chat')) }, // Dynamic conversations

          // Tools
          { path: 'notice-interpreter', lazy: lazyPage(() => import('./pages/Notice')) },
          { path: 'document-draft',     lazy: lazyPage(() => import('./pages/Draft')) },
          { path: 'documents',          lazy: lazyPage(() => import('./pages/Documents')) },
        ],
      },

      // ── Mobile shell (390px frame; the drawer is the whole nav) ────────────────
      {
        path: '/mobile',
        Component: MobileShell,
        children: [
          { index: true, element: <Navigate to="/mobile/onboarding" replace /> },

          // Onboarding — the first screen: purpose + language + prepared sign-in
          { path: 'onboarding',         lazy: lazyPage(() => import('./pages/mobile/MobileOnboarding')) },

          // Main screens
          { path: 'home',               lazy: lazyPage(() => import('./pages/mobile/MobileHome')) },
          { path: 'chat/:language',      element: <Navigate to="/mobile/case/consumer" replace /> },
          // Notice Interpreter — the founding feature, in-chat (§3.8a)
          { path: 'notice',             lazy: lazyPage(() => import('./pages/mobile/MobileNoticeInterpret')) },
          { path: 'voice',              lazy: lazyPage(() => import('./pages/mobile/MobileVoiceActive')) },
          { path: 'profile',            lazy: lazyPage(() => import('./pages/mobile/MobileProfile')) },
          { path: 'case',               element: <Navigate to="/mobile/case/consumer" replace /> },
          // :matterId — 'consumer' is the fully built journey; every other id
          // renders the designed unsupported-matter boundary rather than
          // silently showing the consumer case under someone else's title.
          { path: 'case/:matterId',     lazy: lazyPage(() => import('./pages/mobile/MobileConsumerCase')) },
          { path: 'files',              lazy: lazyPage(() => import('./pages/mobile/MobileFiles')) },
        ],
      },

      // ── Dev harness + specimens (URL-only, not in any nav) ──────────────
      // /dev indexes every screen, state, and specimen. /specimen/:id renders
      // one component alone on a bare canvas for case-study embeds.
      { path: 'dev',              lazy: lazyPage(() => import('./pages/DevIndex')) },
      { path: 'specimen/:specimenId', lazy: lazyPage(() => import('./pages/Specimen')) },

      // Fallback
      { path: '/', element: <Navigate to="/desktop/dashboard" replace /> }
    ],
  },
]);
