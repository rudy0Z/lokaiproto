export type DemoPolicyTier = 'self_service' | 'review_recommended' | 'human_help_required';
export type EvidenceState = 'confirmed' | 'missing' | 'disputed';
export type SourceSupport = 'supports' | 'conflicts' | 'unavailable';

export interface GlossaryEntry {
  id: string;
  term: string;
  simpleMeaning: string;
  example: string;
  sourceNote: string;
}

export interface DemoFact {
  id: string;
  label: string;
  value: string;
  state: EvidenceState;
  /**
   * Why LokAI flagged this fact for the citizen to check. Only meaningful on a
   * `disputed` fact — it is the "why" the verification gate shows above the
   * confirm/fix choice. This is now the single source of that text; the verify
   * screen derives its VerificationFact list from these scenario facts (see
   * getVerificationFacts in caseWorkflow.ts), so the fact content lives in
   * exactly one place.
   */
  hint?: string;
}

export interface DemoSource {
  id: string;
  title: string;
  reference: string;
  jurisdiction: string;
  support: SourceSupport;
  supportsClaim: string;
  reviewLabel: 'Example — verify with a lawyer';
}

export interface DemoScenario {
  id: string;
  label: string;
  matterTitle: string;
  userMessage: string;
  policyTier: DemoPolicyTier;
  statusTitle: string;
  statusBody: string;
  allowedActions: string[];
  facts: DemoFact[];
  sources: DemoSource[];
  glossaryIds: string[];
}

export const DEMO_PROGRESS = [
  'Understanding your issue',
  'Checking the facts',
  'Reviewing the source',
  'Preparing a clear answer',
] as const;

export const LEGAL_GLOSSARY: Record<string, GlossaryEntry> = {
  deficiency: {
    id: 'deficiency',
    term: 'deficiency',
    simpleMeaning: 'A fault or shortcoming in a product or service that the seller was expected to provide properly.',
    example: 'A mixer that does not work as promised may be treated as a defective product.',
    sourceNote: 'Consumer Protection Act, 2019 · terminology shown for demonstration',
  },
  districtCommission: {
    id: 'districtCommission',
    term: 'District Consumer Commission',
    simpleMeaning: 'A local consumer-dispute body that hears eligible complaints about goods and services.',
    example: 'A buyer may approach it when a seller does not resolve a fair complaint.',
    sourceNote: 'Consumer Protection Act, 2019 · process must be checked for the user’s location',
  },
  legalNotice: {
    id: 'legalNotice',
    term: 'legal notice',
    simpleMeaning: 'A formal written message explaining a complaint and what the sender wants the other person to do.',
    example: 'A buyer can send a written demand asking a seller to refund or replace a defective product.',
    sourceNote: 'General legal term · not a court order',
  },
  jurisdiction: {
    id: 'jurisdiction',
    term: 'jurisdiction',
    simpleMeaning: 'The place and authority that has the power to hear a dispute.',
    example: 'Where the buyer lives, where the seller operates, or where the purchase happened can affect where a complaint is filed.',
    sourceNote: 'General legal term · exact rule depends on the matter',
  },
};

/**
 * Prepared jurisdiction for the demo matter.
 *
 * Jurisdiction is a founding pillar of LokAI, not decoration: the product
 * exists for people facing state/local rules they have never encountered,
 * so which forum's rules are being applied has to be legible before the
 * user asks a question the product cannot answer for their state.
 *
 * `district` is what actually determines the consumer forum; `state` and
 * `country` frame which statute applies at all.
 */
export const DEMO_JURISDICTION = {
  district: 'Mumbai Suburban',
  state: 'Maharashtra',
  country: 'India',
  /** Shown where space is tight. */
  short: 'Mumbai Suburban, Maharashtra',
} as const;

const consumerSource: DemoSource = {
  id: 'consumer-act',
  title: 'Consumer Protection Act, 2019',
  reference: 'Complaint and consumer-remedy provisions',
  jurisdiction: 'India',
  support: 'supports',
  supportsClaim: 'A consumer can seek a remedy for a defective product through the applicable complaint process.',
  reviewLabel: 'Example — verify with a lawyer',
};

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  consumer: {
    id: 'consumer',
    label: 'Complete consumer matter',
    matterTitle: 'Refund for a damaged mixer',
    userMessage: 'I bought a mixer grinder for ₹8,999. It arrived damaged and the seller refused a replacement. What can I do?',
    policyTier: 'self_service',
    statusTitle: 'Enough information to prepare the next step',
    statusBody: 'The purchase, defect, and seller response are clear. LokAI can explain the general route and prepare a draft for Priya to review.',
    allowedActions: ['Explain the general rule', 'Prepare a complaint draft', 'Show the source basis'],
    facts: [
      /* The canonical facts for the consumer matter — the ONE source (unified
         2026-08-27). The verify screen's VerificationFact list derives from
         here (getVerificationFacts maps state→status), DemoContext seeds its
         live `facts` from here, and confirming a fact on ?stage=verify now
         flows back through DemoContext to every screen reading it. Previously a
         second 5-fact list lived in caseWorkflow with different ids, so the two
         disagreed. `disputed` is the flagged one and carries its own `hint`. */
      {
        id: 'purchase-date', label: 'Purchase date', value: '6 June 2026', state: 'disputed',
        hint: 'The invoice reads 6 June 2026, but the seller chat refers to an 8 June order. Confirm which is right — the reply window is counted from this date.',
      },
      { id: 'amount', label: 'Amount paid', value: '₹8,999', state: 'confirmed' },
      { id: 'defect', label: 'Problem', value: 'Mixer arrived damaged', state: 'confirmed' },
      { id: 'seller-response', label: 'Seller response', value: 'Replacement refused in writing', state: 'confirmed' },
      { id: 'order-id', label: 'Platform order / ticket ID', value: 'HK-48291', state: 'confirmed' },
      { id: 'seller-chat', label: 'WhatsApp / seller chat screenshots', value: 'Refusal thread saved', state: 'confirmed' },
    ],
    sources: [consumerSource],
    glossaryIds: ['deficiency', 'districtCommission', 'legalNotice', 'jurisdiction'],
  },
  missing_fact: {
    id: 'missing_fact',
    label: 'Missing fact',
    matterTitle: 'Refund request needs one date',
    userMessage: 'The seller refused my refund. Help me file a complaint.',
    policyTier: 'review_recommended',
    statusTitle: 'One detail changes the next step',
    statusBody: 'When did you first tell the seller about the damage? LokAI will not prepare the draft until that date is confirmed.',
    allowedActions: ['Add the first complaint date', 'Review the facts already captured'],
    facts: [
      { id: 'first-report', label: 'First complaint to seller', value: 'Not provided', state: 'missing' },
      { id: 'seller-response', label: 'Seller response', value: 'Refund refused', state: 'confirmed' },
    ],
    sources: [consumerSource],
    glossaryIds: ['deficiency'],
  },
  source_gap: {
    id: 'source_gap',
    label: 'Official source unavailable',
    matterTitle: 'Marketplace policy could not be checked',
    userMessage: 'The marketplace says its private return policy overrides my rights.',
    policyTier: 'review_recommended',
    statusTitle: 'The exact policy could not be checked',
    statusBody: 'The general consumer route is available, but this prepared demo has no official record for the marketplace policy. LokAI will not state a firm conclusion.',
    allowedActions: ['Show the general information', 'Add the marketplace policy'],
    facts: [{ id: 'policy', label: 'Marketplace policy', value: 'Not available', state: 'missing' }],
    sources: [{ ...consumerSource, support: 'unavailable', supportsClaim: 'The exact marketplace-policy claim is not supported by an available source.' }],
    glossaryIds: ['deficiency'],
  },
  conflicting_rules: {
    id: 'conflicting_rules',
    label: 'Rules may conflict',
    matterTitle: 'Two routes may apply',
    userMessage: 'The purchase was made for my home business. Is this still a consumer complaint?',
    policyTier: 'review_recommended',
    statusTitle: 'Two rules may point to different routes',
    statusBody: 'Personal and commercial use can be treated differently. The prepared facts do not establish which rule applies, so LokAI will not recommend a filing route.',
    allowedActions: ['Clarify how the mixer was used', 'Compare the two source notes'],
    facts: [{ id: 'use', label: 'How the product was used', value: 'Disputed', state: 'disputed' }],
    sources: [{ ...consumerSource, support: 'conflicts', supportsClaim: 'Consumer status depends on facts that are currently disputed.' }],
    glossaryIds: ['jurisdiction'],
  },
  high_risk: {
    id: 'high_risk',
    label: 'Professional help required',
    matterTitle: 'Large loss and urgent deadline',
    userMessage: 'The seller’s failure caused a ₹6 lakh business loss and I have a deadline tomorrow.',
    policyTier: 'human_help_required',
    statusTitle: 'This needs qualified professional help',
    statusBody: 'The amount, business use, and urgent deadline create consequences this prototype should not assess. LokAI will preserve the summary but will not prepare a filing.',
    allowedActions: ['Review the matter summary', 'Export the evidence checklist'],
    facts: [
      { id: 'loss', label: 'Claimed loss', value: '₹6,00,000', state: 'confirmed' },
      { id: 'deadline', label: 'Possible deadline', value: 'Tomorrow', state: 'disputed' },
    ],
    sources: [{ ...consumerSource, support: 'unavailable', supportsClaim: 'No source in this demo supports an urgent high-value recommendation.' }],
    glossaryIds: ['jurisdiction'],
  },
  out_of_scope: {
    id: 'out_of_scope',
    label: 'Outside supported examples',
    matterTitle: 'Criminal allegation',
    userMessage: 'Write a criminal complaint accusing the seller of fraud.',
    policyTier: 'human_help_required',
    statusTitle: 'LokAI cannot prepare this request',
    statusBody: 'This prototype demonstrates consumer information, not criminal allegations. It can keep the purchase summary and show the supported consumer example.',
    allowedActions: ['Keep the purchase summary', 'Return to the consumer example'],
    facts: [{ id: 'allegation', label: 'Criminal allegation', value: 'Not assessed', state: 'disputed' }],
    sources: [],
    glossaryIds: [],
  },
  temporary_failure: {
    id: 'temporary_failure',
    label: 'Temporary pause',
    matterTitle: 'Prepared answer paused',
    userMessage: 'Use the sample notice and prepare my next step.',
    policyTier: 'review_recommended',
    statusTitle: 'The demo paused before preparing the answer',
    statusBody: 'Your selected sample is still here. Retry to replay the prepared result; no data was uploaded or sent.',
    allowedActions: ['Retry the prepared demo', 'Review the sample details'],
    facts: [{ id: 'sample', label: 'Sample notice', value: 'Saved in this demo', state: 'confirmed' }],
    sources: [],
    glossaryIds: ['legalNotice'],
  },
  statute_expiry: {
    id: 'statute_expiry',
    label: 'Limitation may bar filing',
    matterTitle: 'Purchase too old for this demo route',
    userMessage: 'I bought a damaged mixer in January 2022. The seller still refuses a refund. Can I file a consumer complaint now?',
    policyTier: 'human_help_required',
    statusTitle: 'LokAI will not prepare a filing for this date',
    statusBody: 'This purchase is from too long ago for the time limit this example covers. LokAI will keep your summary, but it will not draft a notice or suggest filing — the deadline rules are something a lawyer should check for your exact dates.',
    allowedActions: [
      'Keep the purchase and evidence summary',
      'Ask a lawyer about limitation',
      'Return to a current consumer example',
    ],
    facts: [
      { id: 'purchase-date', label: 'Purchase date', value: 'January 2022', state: 'confirmed' },
      { id: 'amount', label: 'Amount paid', value: '₹8,999', state: 'confirmed' },
      { id: 'defect', label: 'Problem', value: 'Mixer arrived damaged', state: 'confirmed' },
      { id: 'seller-response', label: 'Seller response', value: 'Refund still refused', state: 'confirmed' },
    ],
    sources: [{
      ...consumerSource,
      support: 'unavailable',
      supportsClaim: 'This demo does not assert a live limitation calculation; the date is treated as outside the illustrated complaint window.',
    }],
    glossaryIds: ['districtCommission', 'legalNotice'],
  },
};

export const DEFAULT_SCENARIO_ID = 'consumer';

export function getDemoScenario(id?: string | null): DemoScenario {
  return DEMO_SCENARIOS[id ?? ''] ?? DEMO_SCENARIOS[DEFAULT_SCENARIO_ID];
}
