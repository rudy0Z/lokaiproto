/**
 * Conformance fixtures - the scripted scenarios become policy tests.
 *
 * Each fixture pins the engine to the visible behavior the prepared scenes
 * already ship: same input, same turn, now computed instead of matched.
 * scripts/verify-decision.mjs replays every fixture twice and asserts
 * identical receipts (determinism) plus the expected outcome (conformance).
 */

import type { DecisionState } from './types';

export interface DecisionFixture {
  name: string;
  state: DecisionState;
  /** Expected prepared turn id the engine must resolve to. */
  expectedTurnId: string;
  /** Expected outcome kind. */
  expectedKind: 'proceed' | 'clarify' | 'stop' | 'escalate' | 'recover';
  /** The gate that must own the decision. */
  expectedGate: string;
}

const base = (over: Partial<DecisionState>): DecisionState => ({
  input: '',
  inputKind: 'typed',
  language: 'en',
  turnIndex: 1,
  ...over,
});

export const DECISION_FIXTURES: DecisionFixture[] = [
  /* G1 - scene canonical messages resolve to their own turns */
  {
    name: 'scene: high_risk canonical',
    state: base({ scenarioId: 'high_risk', policyTier: 'human_help_required', userMessage: 'I lost 6 lakh in business loss because of this defective mixer and my deadline is tomorrow.', input: 'I lost 6 lakh in business loss because of this defective mixer and my deadline is tomorrow.' }),
    expectedTurnId: 'high-risk-stop', expectedKind: 'escalate', expectedGate: 'G1_SCENE',
  },
  {
    name: 'scene: out_of_scope canonical',
    state: base({ scenarioId: 'out_of_scope', policyTier: 'human_help_required', userMessage: 'Write a criminal complaint accusing the seller of fraud.', input: 'Write a criminal complaint accusing the seller of fraud.' }),
    expectedTurnId: 'out-of-scope-stop', expectedKind: 'stop', expectedGate: 'G1_SCENE',
  },
  {
    name: 'scene: statute_expiry canonical',
    state: base({ scenarioId: 'statute_expiry', policyTier: 'human_help_required', userMessage: 'I bought a damaged mixer in January 2022. The seller still refuses a refund. Can I file a consumer complaint now?', input: 'I bought a damaged mixer in January 2022. The seller still refuses a refund. Can I file a consumer complaint now?' }),
    expectedTurnId: 'statute-expiry-stop', expectedKind: 'stop', expectedGate: 'G1_SCENE',
  },
  {
    name: 'scene: source_gap canonical',
    state: base({ scenarioId: 'source_gap', policyTier: 'review_recommended', userMessage: 'The marketplace says its private return policy overrides my refund rights.', input: 'The marketplace says its private return policy overrides my refund rights.' }),
    expectedTurnId: 'source-gap-disclose', expectedKind: 'clarify', expectedGate: 'G1_SCENE',
  },
  {
    name: 'scene: conflicting_rules canonical',
    state: base({ scenarioId: 'conflicting_rules', policyTier: 'review_recommended', userMessage: 'I used the mixer for my home business. Is it still a consumer thing?', input: 'I used the mixer for my home business. Is it still a consumer thing?' }),
    expectedTurnId: 'conflict-disclose', expectedKind: 'clarify', expectedGate: 'G1_SCENE',
  },
  {
    name: 'scene: missing_fact canonical',
    state: base({ scenarioId: 'missing_fact', policyTier: 'review_recommended', userMessage: 'The seller refused my refund. Help me file a complaint.', input: 'The seller refused my refund. Help me file a complaint.' }),
    expectedTurnId: 'missing-fact-clarify', expectedKind: 'clarify', expectedGate: 'G1_SCENE',
  },
  {
    name: 'scene: conflicting_jurisdiction canonical',
    state: base({ scenarioId: 'conflicting_jurisdiction', policyTier: 'review_recommended', userMessage: 'But the seller says the mixer was fine on delivery.', input: 'But the seller says the mixer was fine on delivery.' }),
    expectedTurnId: 'conflicting-rules-stop', expectedKind: 'stop', expectedGate: 'G1_SCENE',
  },
  {
    name: 'scene: temporary_failure canonical',
    state: base({ scenarioId: 'temporary_failure', policyTier: 'review_recommended', userMessage: 'Use the sample notice and prepare my next step.', input: 'Use the sample notice and prepare my next step.' }),
    expectedTurnId: 'temporary-recover', expectedKind: 'recover', expectedGate: 'G1_SCENE',
  },

  /* G2 - criminal scope, in open conversation */
  {
    name: 'scope: criminal accusation typed in consumer chat',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', userMessage: 'I bought a mixer grinder for 8,999. It arrived damaged and the seller refused a replacement. What can I do?', input: 'I want to write a police complaint accusing the seller of fraud.' }),
    expectedTurnId: 'out-of-scope-stop', expectedKind: 'stop', expectedGate: 'G2_SCOPE',
  },

  /* G3 - high risk markers in open conversation */
  {
    name: 'risk: urgent high-value claim',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', userMessage: 'I bought a mixer grinder for 8,999. It arrived damaged and the seller refused a replacement. What can I do?', input: 'This is urgent, I lost 6 lakh and the deadline is tomorrow.' }),
    expectedTurnId: 'high-risk-stop', expectedKind: 'escalate', expectedGate: 'G3_HIGH_RISK',
  },

  /* G4 - contested record */
  {
    name: 'conflict: seller disagrees',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', userMessage: 'I bought a mixer grinder for 8,999. It arrived damaged and the seller refused a replacement. What can I do?', input: 'But the seller says the mixer was fine on delivery.' }),
    expectedTurnId: 'conflicting-rules-stop', expectedKind: 'stop', expectedGate: 'G4_CONFLICT',
  },

  /* G5 - source gap topic (open conversation route) */
  {
    name: 'source: marketplace policy question',
    state: base({ scenarioId: 'source_gap', policyTier: 'review_recommended', userMessage: 'The marketplace says its private return policy overrides my refund rights.', input: 'What about the marketplace private return policy - does it override my refund?' }),
    expectedTurnId: 'source-gap-disclose', expectedKind: 'clarify', expectedGate: 'G5_SOURCE',
  },

  /* G7 - live consumer conversation routing */
  {
    name: 'content: core refund question',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', userMessage: 'I bought a mixer grinder for 8,999. It arrived damaged and the seller refused a replacement. What can I do?', input: 'The mixer arrived damaged - can I get a refund?' }),
    expectedTurnId: 'consumer-explain', expectedKind: 'proceed', expectedGate: 'G7_CONTENT',
  },
  {
    name: 'content: notice interpretation chip',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', input: 'Interpret this legal notice' }),
    expectedTurnId: 'notice-explain', expectedKind: 'proceed', expectedGate: 'G7_CONTENT',
  },
  /* The document decides the reading. Both entry points (the compose
     affordance and the Documents folder) send the document's own identity, so
     this fixture is what stops the receipt silently answering as the notice —
     the two are one substring apart and the failure is invisible on screen. */
  {
    name: 'content: attached receipt reads as a receipt',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', input: 'payment-receipt.jpg' }),
    expectedTurnId: 'receipt-filed', expectedKind: 'proceed', expectedGate: 'G7_CONTENT',
  },
  {
    name: 'content: attached notice still reads as the notice',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', input: 'property-tax-notice.pdf' }),
    expectedTurnId: 'notice-explain', expectedKind: 'proceed', expectedGate: 'G7_CONTENT',
  },
  {
    name: 'content: off-topic chatter',
    state: base({ scenarioId: 'consumer', policyTier: 'self_service', userMessage: 'I bought a mixer grinder for 8,999. It arrived damaged and the seller refused a replacement. What can I do?', input: 'Who will win today the cricket match?' }),
    expectedTurnId: 'boundary-stop', expectedKind: 'stop', expectedGate: 'G7_CONTENT',
  },
  {
    name: 'content: generic flow without scene',
    state: base({ input: 'The mixer is defective and I want a refund.' }),
    expectedTurnId: 'consumer-explain', expectedKind: 'proceed', expectedGate: 'G7_CONTENT',
  },
];
