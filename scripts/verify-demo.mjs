import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(root, 'src');
const allowedExtensions = new Set(['.ts', '.tsx']);
const forbidden = [
  ['network request', /\bfetch\s*\(/],
  ['microphone permission', /getUserMedia\s*\(/],
  ['media recorder', /\bnew\s+MediaRecorder\b/],
  ['file input', /type\s*=\s*["']file["']/],
  ['live service environment variable', /VITE_(?:NVIDIA|SARVAM)_API_KEY/],
];

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collect(path) : [path];
  }));
  return files.flat();
}

const files = (await collect(sourceRoot)).filter((file) => allowedExtensions.has(extname(file)));
const failures = [];

for (const file of files) {
  const content = await readFile(file, 'utf8');
  for (const [label, pattern] of forbidden) {
    if (pattern.test(content)) failures.push(`${relative(root, file)} contains ${label}`);
  }
}

const scenarios = await readFile(join(sourceRoot, 'app', 'data', 'demoScenarios.ts'), 'utf8');
for (const id of ['consumer', 'missing_fact', 'source_gap', 'conflicting_rules', 'high_risk', 'out_of_scope', 'temporary_failure', 'statute_expiry']) {
  if (!scenarios.includes(`${id}: {`)) failures.push(`Missing scripted scenario: ${id}`);
}
for (const id of ['deficiency', 'districtCommission', 'legalNotice', 'jurisdiction']) {
  if (!scenarios.includes(`${id}: {`)) failures.push(`Missing glossary entry: ${id}`);
}

const turns = await readFile(join(sourceRoot, 'app', 'data', 'responseTurns.ts'), 'utf8');
for (const mode of ['clarify', 'explain', 'disclose', 'stop', 'confirm', 'progress', 'recover']) {
  if (!turns.includes(`'${mode}'`) && !turns.includes(`"${mode}"`)) {
    failures.push(`Missing response mode: ${mode}`);
  }
}
for (const id of [
  'consumer-explain',
  'missing-fact-clarify',
  'source-gap-disclose',
  'conflict-disclose',
  'high-risk-stop',
  'out-of-scope-stop',
  'temporary-recover',
  'progress-default',
  'boundary-stop',
  'notice-explain',
  'statute-expiry-stop',
]) {
  if (!turns.includes(`id: '${id}'`)) failures.push(`Missing prepared turn: ${id}`);
}

if (!turns.includes('draftAllowed: false') || !turns.includes("mode: 'stop'")) {
  failures.push('Stop tiers must include draftAllowed: false');
}

const packs = await readFile(join(sourceRoot, 'app', 'data', 'languagePacks.ts'), 'utf8');
for (const lang of ['en', 'hi', 'mr', 'ta']) {
  if (!packs.includes(`${lang}:`)) failures.push(`Missing language pack: ${lang}`);
}

const engine = await readFile(join(sourceRoot, 'app', 'demo', 'responseEngine.ts'), 'utf8');
if (!engine.includes('runProgressThen') || !engine.includes('skip')) {
  failures.push('responseEngine must expose staged progress with skip');
}

const demoCtx = await readFile(join(sourceRoot, 'app', 'context', 'DemoContext.tsx'), 'utf8');
for (const key of ['confirmFact', 'correctFact', 'runPreparedInput', 'draftAllowed', 'facts']) {
  if (!demoCtx.includes(key)) failures.push(`DemoContext missing matter-store API: ${key}`);
}

// Honest evidence: no fabricated confidence percentages or groundingScore fields
for (const file of files) {
  const content = await readFile(file, 'utf8');
  const rel = relative(root, file);
  if (/\bgroundingScore\b/.test(content)) {
    failures.push(`${rel} still references groundingScore — use groundedClaims/totalClaims`);
  }
  if (/\b(confidence|certainty)\s*[:=]\s*['"`]?\d+\s*%/.test(content)) {
    failures.push(`${rel} contains a percentage confidence string`);
  }
  if (/Math\.round\(\s*74\s*\+/.test(content)) {
    failures.push(`${rel} still invents a liveScore confidence formula`);
  }
}

// Indian craft polish: no drifted palette hexes outside token definitions
const tokenFiles = new Set([
  join(sourceRoot, 'styles', 'index.css').replace(/\\/g, '/'),
  join(sourceRoot, 'app', 'components', 'shared.tsx').replace(/\\/g, '/'),
]);
const driftedHex = /#(?:1A1916|132846|E8832A|8A8880|F5F2EC)\b/i;
for (const file of files) {
  const norm = file.replace(/\\/g, '/');
  if ([...tokenFiles].some((t) => norm.endsWith(t.slice(t.indexOf('/src/') >= 0 ? t.indexOf('/src/') : 0)) || norm.includes('shared.tsx') || norm.includes('index.css'))) {
    // Allow token definition files only for terracotta (canonical); drifted hexes must still be absent
  }
  const content = await readFile(file, 'utf8');
  const rel = relative(root, file);
  // shared.tsx / index.css may define terracotta (#A94F2D) — drifted list excludes it
  if (driftedHex.test(content) && !rel.replace(/\\/g, '/').endsWith('styles/index.css') && !rel.replace(/\\/g, '/').endsWith('app/components/shared.tsx')) {
    // Comments may still mention old hexes — only fail on style-value-like usage
    if (/['"`].*#(?:1A1916|132846|E8832A|8A8880|F5F2EC)/i.test(content) || /:\s*#(?:1A1916|132846|E8832A|8A8880|F5F2EC)/i.test(content)) {
      failures.push(`${rel} still uses drifted palette hex — use C.* / CSS tokens`);
    }
  }
}

// Scope honesty: no positive multi-matter capability claims
for (const file of files) {
  const content = await readFile(file, 'utf8');
  const rel = relative(root, file);
  if (/LokAI supports[\s\S]{0,80}RTI/i.test(content) || /supports Indian legal rights[\s\S]{0,40}tenancy/i.test(content)) {
    failures.push(`${rel} still claims RTI/tenancy support — rewrite as consumer-only boundary`);
  }
}

// Indian channel metaphors must be present in prepared content
const channelSources = [
  await readFile(join(sourceRoot, 'app', 'data', 'responseTurns.ts'), 'utf8'),
  await readFile(join(sourceRoot, 'app', 'data', 'caseWorkflow.ts'), 'utf8'),
  await readFile(join(sourceRoot, 'app', 'data', 'languagePacks.ts'), 'utf8'),
].join('\n');
for (const needle of ['1915', 'e-Daakhil', 'registered post']) {
  if (!channelSources.includes(needle)) {
    failures.push(`Prepared copy missing Indian channel metaphor: ${needle}`);
  }
}

// Dead design system must stay deleted
try {
  await readFile(join(sourceRoot, 'styles', 'theme.css'), 'utf8');
  failures.push('src/styles/theme.css still exists — dead design system must stay deleted');
} catch {
  // expected missing
}
try {
  await readdir(join(sourceRoot, 'app', 'components', 'ui'));
  failures.push('src/app/components/ui/ still exists — dead design system must stay deleted');
} catch {
  // expected missing
}

// Design-token enforcement — layout / hierarchy / typography
const sharedSrc = await readFile(join(sourceRoot, 'app', 'components', 'shared.tsx'), 'utf8');
if (!sharedSrc.includes('typeStyle') || !sharedSrc.includes('caption:') || !sharedSrc.includes('panel:')) {
  failures.push('shared.tsx missing industrial TYPE/LAYOUT roles (typeStyle, caption, panel)');
}

const bareRadius = /borderRadius\s*:\s*(?:['"]?\d+(?:px)?['"]?)/;
const bareFont = /fontSize\s*:\s*['"]?\d+/;
const bareShadow = /boxShadow\s*:\s*['"`](?!none)/;
for (const file of files) {
  const rel = relative(root, file).replace(/\\/g, '/');
  if (rel.endsWith('app/components/shared.tsx')) continue;
  const content = await readFile(file, 'utf8');
  for (const line of content.split('\n')) {
    if (bareRadius.test(line) && !line.includes('LAYOUT.radius')) {
      failures.push(`${rel} bare borderRadius — use LAYOUT.radius.*`);
      break;
    }
  }
  for (const line of content.split('\n')) {
    if (bareFont.test(line) && !line.includes('TYPE.') && !line.includes('typeStyle')) {
      if (!/fontSize\s*:\s*[`'"].*\$\{/.test(line) && !/fontSize\s*:\s*calc\(/.test(line)) {
        failures.push(`${rel} bare fontSize — use TYPE.*.size or typeStyle()`);
        break;
      }
    }
  }
  for (const line of content.split('\n')) {
    if (bareShadow.test(line) && !line.includes('SHADOW.') && !/boxShadow\s*:\s*['"`]none['"`]/.test(line)) {
      failures.push(`${rel} bare boxShadow — use SHADOW.*`);
      break;
    }
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`PASS ${files.length} source files checked: deterministic demo has no network, microphone, recorder, or file-input path.`);
console.log('PASS 8 scripted guardrail scenarios and 4 plain-language legal terms are present.');
console.log('PASS hybrid response modes, prepared turns, language packs, and matter-store APIs are present.');
console.log('PASS stop tiers lock drafting (draftAllowed: false on stop modes).');
console.log('PASS no groundingScore or fabricated confidence percentages remain.');
console.log('PASS Indian channels (1915, e-Daakhil, registered post) and consumer-only scope honesty hold.');
console.log('PASS dead theme.css / components/ui stay deleted; drifted palette hexes absent from live pages.');
console.log('PASS layout/hierarchy/typography tokens enforced (no bare radius, fontSize, or boxShadow).');
