/**
 * Decision conformance runner - the decision layer's build gate.
 *
 * Runs the engine against every fixture twice:
 *   1. conformance  - outcome matches the scripted behavior (same turn the
 *     prepared flows always produced for that input);
 *   2. determinism  - two runs produce byte-identical receipts.
 *
 * Modules load through Vite's SSR loader so src/ imports resolve exactly as
 * in the app. Exit 0 = all green; exit 1 = any failure printed.
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

async function ssrModule(path) {
  const server = await createServer({
    root,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    return await server.ssrLoadModule(path);
  } finally {
    await server.close();
  }
}

const { decide, computeDraftAllowed } = await ssrModule('/src/app/decision/engine.ts');
const { DECISION_FIXTURES } = await ssrModule('/src/app/decision/fixtures.ts');

let failures = 0;

for (const fixture of DECISION_FIXTURES) {
  const a = decide(fixture.state);
  const b = decide(fixture.state);

  if (JSON.stringify(a.receipt) !== JSON.stringify(b.receipt)) {
    failures++;
    console.error(`[determinism] ${fixture.name}: receipts differ`);
    console.error('  a:', JSON.stringify(a.receipt));
    console.error('  b:', JSON.stringify(b.receipt));
    continue;
  }

  if (a.turnId !== fixture.expectedTurnId) {
    failures++;
    console.error(`[conformance] ${fixture.name}: expected turn ${fixture.expectedTurnId}, got ${a.turnId}`);
    continue;
  }
  if (a.kind !== fixture.expectedKind) {
    failures++;
    console.error(`[conformance] ${fixture.name}: expected kind ${fixture.expectedKind}, got ${a.kind}`);
    continue;
  }
  if (a.rationale.gate !== fixture.expectedGate) {
    failures++;
    console.error(`[conformance] ${fixture.name}: expected gate ${fixture.expectedGate}, got ${a.rationale.gate}`);
    continue;
  }

  console.log(`ok  ${fixture.name}  ->  ${a.turnId}  (${a.rationale.gate}/${a.rationale.rule})`);
}

/* G8 smoke: draft permission is computed, not asserted. */
const draftDenied = computeDraftAllowed({
  scenarioId: 'consumer',
  policyTier: 'self_service',
  input: '',
  inputKind: 'chip',
  facts: [{ id: 'purchase-date', state: 'disputed', confirmedByUser: false }],
});
if (draftDenied !== false) {
  failures++;
  console.error('[draft] disputed fact must block computed draft permission');
} else {
  console.log('ok  draft gate: disputed fact blocks draft');
}

const draftAllowed = computeDraftAllowed({
  scenarioId: 'consumer',
  policyTier: 'self_service',
  input: '',
  inputKind: 'chip',
  facts: [{ id: 'purchase-date', state: 'confirmed', confirmedByUser: true }],
  sources: [{ id: 'consumer-act', support: 'supports' }],
});
if (draftAllowed !== true) {
  failures++;
  console.error('[draft] confirmed facts + supporting sources must allow draft');
} else {
  console.log('ok  draft gate: confirmed facts + supporting sources allow draft');
}

if (failures > 0) {
  console.error(`\n${failures} decision check(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${DECISION_FIXTURES.length} decision fixtures green (conformance + determinism + draft gate).`);