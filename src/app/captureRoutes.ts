export type CaptureRouteItem = {
  label: string;
  path: string;
};

export type CaptureRouteGroup = {
  title: string;
  items: CaptureRouteItem[];
};

/*
 * Pruned 2026-08-25 (rework Phase 0d) — removed entries with no matching
 * route in routes.tsx (capture hub/export/system-design, empty-state,
 * login, onboarding 1-4, pricing, verdict, rights, language-palette,
 * errors — all deleted screens or never-built pages). The three
 * chat/:language entries now point at the real consumer-case route with
 * `?lang=` (see DemoContext's detectInitialLanguage) instead of the old
 * `/mobile/chat/:language` redirect, which dropped the language entirely.
 */
export const CAPTURE_ROUTE_GROUPS: CaptureRouteGroup[] = [
  {
    title: 'Desktop',
    items: [
      { label: 'Dashboard', path: '/desktop/dashboard' },
      { label: 'Chat · Consumer', path: '/desktop/chat/consumer' },
      { label: 'Chat · Boundary', path: '/desktop/chat/out-of-scope' },
      { label: 'Notice Interpreter', path: '/desktop/notice-interpreter' },
      { label: 'Document Draft', path: '/desktop/document-draft' },
      { label: 'Documents', path: '/desktop/documents' },
    ],
  },
  {
    title: 'Mobile',
    items: [
      { label: 'Home', path: '/mobile/home' },
      { label: 'Case · Consumer', path: '/mobile/case/consumer' },
      { label: 'Case · Hindi', path: '/mobile/case/consumer?stage=intake&lang=hi' },
      { label: 'Case · Tamil', path: '/mobile/case/consumer?stage=intake&lang=ta' },
      { label: 'Case · Marathi', path: '/mobile/case/consumer?stage=intake&lang=mr' },
      { label: 'Case · Boundary', path: '/mobile/case/out-of-scope' },
      { label: 'Voice', path: '/mobile/voice' },
      { label: 'Profile', path: '/mobile/profile' },
      { label: 'Files', path: '/mobile/files' },
    ],
  },
];
