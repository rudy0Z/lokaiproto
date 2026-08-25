/**
 * Dev catalog — the single enumeration of every screen and state in LokAI.
 *
 * Both the /dev index (a clickable harness for testing every state) and the
 * specimen system read from here, so there is one place that answers "what
 * can this app show", and adding a state is one entry rather than a hunt
 * through routes and deep-links.
 *
 * These are real in-app routes (hash-router deep links), not mock data —
 * clicking one lands on the actual screen in the actual state.
 */

export interface CatalogEntry {
  label: string;
  path: string;
  /** One line on what state this captures — shown in the dev index. */
  note?: string;
}

export interface CatalogGroup {
  title: string;
  note?: string;
  entries: CatalogEntry[];
}

export const DEV_CATALOG: CatalogGroup[] = [
  {
    title: 'Mobile · core journey',
    note: 'The built consumer-refund flow, stage by stage.',
    entries: [
      { label: 'Home · empty state', path: '/mobile/home', note: 'No active matter — onboarding surface' },
      { label: 'Intake', path: '/mobile/case/consumer?stage=intake', note: 'Text / voice / notice entry' },
      { label: 'Clarify', path: '/mobile/case/consumer?stage=clarify', note: 'One missing question, draft blocked' },
      { label: 'Verify', path: '/mobile/case/consumer?stage=verify', note: 'Confirm-or-fix facts before assessment' },
      { label: 'Assess', path: '/mobile/case/consumer?stage=assess', note: 'Three-zone answer + source coverage' },
      { label: 'Plan', path: '/mobile/case/consumer?stage=plan', note: 'Living action plan' },
      { label: 'Packet', path: '/mobile/case/consumer?stage=packet', note: 'Intent-preview gate before draft' },
      { label: 'Packet · reviewed', path: '/mobile/case/consumer?stage=packet&approved=1', note: 'Review-gated demand notice' },
      { label: 'Audit trail', path: '/mobile/case/consumer?stage=audit', note: 'What the AI did and why' },
      { label: 'Human review', path: '/mobile/case/consumer?stage=escalation', note: 'Escalation summary' },
    ],
  },
  {
    title: 'Mobile · refusal taxonomy',
    note: 'Eight distinct structural reasons the product stops. The trust core.',
    entries: [
      { label: 'OCR unreadable', path: '/mobile/case/consumer?failure=ocr_unreadable', note: 'Pre-triage input-quality gate' },
      { label: 'High risk', path: '/mobile/case/consumer?failure=high_risk', note: 'Leaves self-service entirely' },
      { label: 'Conflicting rules', path: '/mobile/case/consumer?stage=assessment&scene=conflicting_rules', note: 'Two forums may apply — will not pick' },
      { label: 'Statute expiry', path: '/mobile/case/consumer?stage=assessment&scene=statute_expiry', note: 'Outside the illustrated window' },
      { label: 'Source gap', path: '/mobile/case/consumer?stage=assessment&scene=source_gap', note: 'No official record to check' },
      { label: 'Missing fact', path: '/mobile/case/consumer?stage=assessment&scene=missing_fact', note: 'Locks until one date is given' },
      { label: 'Temporary failure', path: '/mobile/case/consumer?stage=assessment&scene=temporary_failure', note: 'Recover with retry, nothing lost' },
      { label: 'Out of scope', path: '/mobile/case/out-of-scope', note: 'Non-consumer matter boundary' },
    ],
  },
  {
    title: 'Mobile · language',
    note: 'Same matter, prepared packs. EN / HI / MR / TA are built.',
    entries: [
      { label: 'Hindi · intake', path: '/mobile/case/consumer?stage=intake&lang=hi' },
      { label: 'Marathi · intake', path: '/mobile/case/consumer?stage=intake&lang=mr' },
      { label: 'Tamil · intake', path: '/mobile/case/consumer?stage=intake&lang=ta' },
      { label: 'Hindi · assess', path: '/mobile/case/consumer?stage=assess&lang=hi', note: 'Three-zone answer in Devanagari' },
      { label: 'Tamil · assess', path: '/mobile/case/consumer?stage=assess&lang=ta', note: 'Three-zone answer in Tamil' },
    ],
  },
  {
    title: 'Mobile · other surfaces',
    entries: [
      { label: 'Voice', path: '/mobile/voice', note: 'Prepared listening → editable transcript' },
      { label: 'Files', path: '/mobile/files' },
      { label: 'Profile', path: '/mobile/profile' },
    ],
  },
  {
    title: 'Desktop',
    note: 'Kept at parity; the source trail is the one job a wide surface earns.',
    entries: [
      { label: 'Dashboard', path: '/desktop/dashboard' },
      { label: 'Chat · consumer', path: '/desktop/chat/consumer', note: 'Source trail with room to inspect' },
      { label: 'Chat · boundary', path: '/desktop/chat/out-of-scope' },
      { label: 'Notice interpreter', path: '/desktop/notice-interpreter', note: 'OCR + clause highlighting' },
      { label: 'Document draft', path: '/desktop/document-draft' },
      { label: 'Documents', path: '/desktop/documents' },
    ],
  },
];

/** Flat list — used by the specimen index and for quick lookups. */
export const DEV_CATALOG_FLAT: CatalogEntry[] = DEV_CATALOG.flatMap((g) => g.entries);
