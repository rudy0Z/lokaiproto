export type MatterType = 'tenancy' | 'rti' | 'consumer' | 'notice' | 'boundary';

export type TrustLevel = 'clear' | 'needs_fact' | 'source_limited' | 'human_review';

export type SourceCoverage = 'direct' | 'related' | 'missing' | 'conflicting';

export interface LegalSource {
  id: string;
  title: string;
  section: string;
  jurisdiction: string;
  excerpt: string;
  coverage: SourceCoverage;
  howUsed: string;
}

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'current' | 'done' | 'waiting' | 'blocked';
}

export interface MatterIntelligence {
  matterId: string;
  matterType: MatterType;
  trustLevel: TrustLevel;
  plainSummary: string;
  missingFacts: string[];
  sources: LegalSource[];
  nextSteps: ActionStep[];
  dailyUpdate: {
    title: string;
    body: string;
    timestampLabel: string;
  };
}

export const MATTER_INTELLIGENCE: Record<string, MatterIntelligence> = {
  deposit: {
    matterId: 'deposit',
    matterType: 'tenancy',
    trustLevel: 'clear',
    plainSummary: 'The landlord is past the return window and has not shown a written damage claim.',
    missingFacts: ['Confirm whether the demand notice has already been sent.'],
    sources: [
      {
        id: 'mrc-24',
        title: 'Maharashtra Rent Control Act, 1999',
        section: 'Section 24',
        jurisdiction: 'Maharashtra',
        excerpt: 'Protects tenants from unlawful withholding and harassment in tenancy disputes.',
        coverage: 'direct',
        howUsed: 'Used to explain why a deposit cannot be held without a documented reason.',
      },
      {
        id: 'cpa-35',
        title: 'Consumer Protection Act, 2019',
        section: 'Section 35',
        jurisdiction: 'India',
        excerpt: 'Allows a consumer to file a complaint before the appropriate commission.',
        coverage: 'related',
        howUsed: 'Used as a possible escalation route if the demand notice is ignored.',
      },
    ],
    nextSteps: [
      { id: 'deposit-step-1', title: 'Keep evidence together', description: 'Agreement, payment proof, move-out messages, and any inspection photos.', status: 'done' },
      { id: 'deposit-step-2', title: 'Wait for written response', description: 'Give the landlord the notice period before escalating.', status: 'current' },
      { id: 'deposit-step-3', title: 'Prepare formal complaint', description: 'Use court templates and notice proof if landlord ignores this.', status: 'waiting' },
    ],
    dailyUpdate: {
      title: 'No new action needed today',
      body: 'Keep the demand notice proof and deposit payment record ready. If there is no reply after the notice window, LokAI can help prepare the formal court complaint.',
      timestampLabel: 'Today · 9:30 AM',
    },
  },
  rti: {
    matterId: 'rti',
    matterType: 'rti',
    trustLevel: 'needs_fact',
    plainSummary: 'The appeal path is strong, but the exact RTI submission date should be confirmed.',
    missingFacts: ['Exact RTI filing date', 'PIO or department acknowledgement number'],
    sources: [
      {
        id: 'rti-7-1',
        title: 'Right to Information Act, 2005',
        section: 'Section 7(1)',
        jurisdiction: 'India',
        excerpt: 'Information is normally required within thirty days.',
        coverage: 'direct',
        howUsed: 'Used to identify the missed response period.',
      },
      {
        id: 'rti-19-1',
        title: 'Right to Information Act, 2005',
        section: 'Section 19(1)',
        jurisdiction: 'India',
        excerpt: 'A first appeal may be filed when information is refused or delayed.',
        coverage: 'direct',
        howUsed: 'Used to recommend the First Appeal route.',
      },
    ],
    nextSteps: [
      { id: 'rti-step-1', title: 'Confirm filing date', description: 'Check the receipt or online acknowledgement.', status: 'current' },
      { id: 'rti-step-2', title: 'Draft First Appeal', description: 'Cite the missed thirty-day response window.', status: 'waiting' },
      { id: 'rti-step-3', title: 'Submit to FAA', description: 'Keep an acknowledgement copy after submission.', status: 'waiting' },
    ],
    dailyUpdate: {
      title: 'One detail needed',
      body: 'Add the RTI filing date before generating the final First Appeal draft.',
      timestampLabel: 'Today · 9:10 AM',
    },
  },
  consumer: {
    matterId: 'consumer',
    matterType: 'consumer',
    trustLevel: 'clear',
    plainSummary: 'A defective product with seller refusal has a clear consumer complaint path.',
    missingFacts: ['Purchase date or invoice date'],
    sources: [
      {
        id: 'cpa-2-10',
        title: 'Consumer Protection Act, 2019',
        section: 'Section 2(10)',
        jurisdiction: 'India',
        excerpt: 'Defines defect in goods.',
        coverage: 'direct',
        howUsed: 'Used to classify the defective phone issue.',
      },
      {
        id: 'cpa-2-11',
        title: 'Consumer Protection Act, 2019',
        section: 'Section 2(11)',
        jurisdiction: 'India',
        excerpt: 'Defines deficiency in service.',
        coverage: 'direct',
        howUsed: 'Used to explain the seller refusal as a service issue.',
      },
      {
        id: 'ecom-2020',
        title: 'Consumer Protection (E-Commerce) Rules, 2020',
        section: 'Marketplace duties',
        jurisdiction: 'India',
        excerpt: 'Applies where the purchase was made through an online marketplace.',
        coverage: 'related',
        howUsed: 'Used only if the purchase was online.',
      },
    ],
    nextSteps: [
      { id: 'consumer-step-1', title: 'Send written complaint', description: 'Ask seller or manufacturer for repair, replacement, or refund.', status: 'current' },
      { id: 'consumer-step-2', title: 'Save proof', description: 'Keep invoice, warranty, defect photos, and seller replies.', status: 'waiting' },
      { id: 'consumer-step-3', title: 'File if ignored', description: 'Use NCH or District Consumer Commission if no response arrives.', status: 'waiting' },
    ],
    dailyUpdate: {
      title: 'Draft ready after one detail',
      body: 'Add the purchase date and LokAI can prepare a clean complaint summary with evidence checklist.',
      timestampLabel: 'Today · 8:55 AM',
    },
  },
  notice: {
    matterId: 'notice',
    matterType: 'notice',
    trustLevel: 'source_limited',
    plainSummary: 'The notice can be summarized, but the exact reply depends on the claim and deadline.',
    missingFacts: ['Notice date', 'Response deadline', 'Claim amount if any'],
    sources: [
      {
        id: 'evidence-doc',
        title: 'Indian Evidence Act, 1872',
        section: 'Documentary proof principles',
        jurisdiction: 'India',
        excerpt: 'Written records matter when claims are disputed.',
        coverage: 'related',
        howUsed: 'Used to explain why receipts, notices, and replies should be preserved.',
      },
    ],
    nextSteps: [
      { id: 'notice-step-1', title: 'Read deadline', description: 'Identify the last day to reply.', status: 'current' },
      { id: 'notice-step-2', title: 'Extract claims', description: 'List the amount, demand, and facts being alleged.', status: 'waiting' },
      { id: 'notice-step-3', title: 'Draft reply', description: 'Respond calmly and ask for proof where needed.', status: 'waiting' },
    ],
    dailyUpdate: {
      title: 'Check the reply date',
      body: 'Before drafting a response, confirm the notice date and deadline so LokAI does not understate urgency.',
      timestampLabel: 'Today · 8:40 AM',
    },
  },
  boundary: {
    matterId: 'boundary',
    matterType: 'boundary',
    trustLevel: 'human_review',
    plainSummary: 'This is outside LokAI’s legal guidance scope.',
    missingFacts: [],
    sources: [
      {
        id: 'lokai-boundary',
        title: 'LokAI Knowledge Boundary',
        section: 'Supported scope',
        jurisdiction: 'System',
        excerpt: 'LokAI supports Indian legal rights, notices, complaints, tenancy, RTI, and documents.',
        coverage: 'direct',
        howUsed: 'Used to redirect non-legal questions back to supported legal workflows.',
      },
    ],
    nextSteps: [
      { id: 'boundary-step-1', title: 'Ask a legal question', description: 'Describe a notice, tenancy, RTI, consumer, or document issue.', status: 'current' },
    ],
    dailyUpdate: {
      title: 'No legal matter detected',
      body: 'Start with a legal issue or upload a notice to continue.',
      timestampLabel: 'Demo',
    },
  },
};

export function getMatterIntelligence(idOrType?: string | null): MatterIntelligence | null {
  if (!idOrType) return null;
  const key = idOrType.toLowerCase();
  if (MATTER_INTELLIGENCE[key]) return MATTER_INTELLIGENCE[key];
  if (key.includes('deposit') || key.includes('tenancy') || key.includes('landlord')) return MATTER_INTELLIGENCE.deposit;
  if (key.includes('rti') || key.includes('bmc') || key.includes('information')) return MATTER_INTELLIGENCE.rti;
  if (key.includes('consumer') || key.includes('refund') || key.includes('defective') || key.includes('phone')) return MATTER_INTELLIGENCE.consumer;
  if (key.includes('notice')) return MATTER_INTELLIGENCE.notice;
  if (key.includes('boundary') || key.includes('scope')) return MATTER_INTELLIGENCE.boundary;
  return null;
}
