export type CaptureRouteItem = {
  label: string;
  path: string;
};

export type CaptureRouteGroup = {
  title: string;
  items: CaptureRouteItem[];
};

export const CAPTURE_ROUTE_GROUPS: CaptureRouteGroup[] = [
  {
    title: 'Capture Tools',
    items: [
      { label: 'Capture Hub', path: '/capture' },
      { label: 'Export Overview', path: '/export' },
      { label: 'System Design', path: '/system-design' },
    ],
  },
  {
    title: 'Desktop',
    items: [
      { label: 'Dashboard', path: '/desktop/dashboard' },
      { label: 'Chat · Deposit', path: '/desktop/chat/deposit' },
      { label: 'Chat · RTI', path: '/desktop/chat/rti' },
      { label: 'Chat · Boundary', path: '/desktop/chat/boundary' },
      { label: 'Notice Interpreter', path: '/desktop/notice-interpreter' },
      { label: 'Document Draft', path: '/desktop/document-draft' },
      { label: 'Documents', path: '/desktop/documents' },
      { label: 'Empty State', path: '/desktop/empty-state' },
    ],
  },
  {
    title: 'Mobile',
    items: [
      { label: 'Login', path: '/mobile/login' },
      { label: 'Onboarding 1', path: '/mobile/onboarding/1' },
      { label: 'Onboarding 2', path: '/mobile/onboarding/2' },
      { label: 'Onboarding 3', path: '/mobile/onboarding/3' },
      { label: 'Onboarding 4', path: '/mobile/onboarding/4' },
      { label: 'Home', path: '/mobile/home' },
      { label: 'Chat · Hindi', path: '/mobile/chat/hindi' },
      { label: 'Chat · Tamil', path: '/mobile/chat/tamil' },
      { label: 'Chat · Marathi', path: '/mobile/chat/marathi' },
      { label: 'Pricing', path: '/mobile/pricing' },
      { label: 'Verdict', path: '/mobile/verdict' },
      { label: 'Rights', path: '/mobile/rights' },
      { label: 'Voice', path: '/mobile/voice' },
      { label: 'Language Palette', path: '/mobile/language-palette' },
      { label: 'Profile', path: '/mobile/profile' },
      { label: 'Errors', path: '/mobile/errors' },
    ],
  },
];
