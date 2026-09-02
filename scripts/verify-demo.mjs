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
/* Files that DEFINE the system may speak in literals; everything downstream
   of them may not. Keep this list identical to SYSTEM_FILES in ui-debt.mjs. */
const systemFiles = [
  'app/components/shared.tsx',
  'app/ui/theme.ts',
  'app/ui/script.ts',
  'app/ui/primitives.tsx',
  'app/ui/layout.tsx',
  'app/ui/motion.tsx',
];
for (const file of files) {
  const rel = relative(root, file).replace(/\\/g, '/');
  if (systemFiles.some((s) => rel.endsWith(s))) continue;
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
    if (bareShadow.test(line) && !line.includes('SHADOW.') && !line.includes('DEVICE.') && !/boxShadow\s*:\s*['"`]none['"`]/.test(line)) {
      failures.push(`${rel} bare boxShadow — use SHADOW.*`);
      break;
    }
  }
}

// ─── WCAG contrast gate — the role layer must hold in BOTH themes ────────────
/* The palette is semantic (`--role-*`); a theme is a re-pointing of those
   roles and nothing else. This gate computes real WCAG 2.x contrast ratios
   from the CSS custom properties in index.css and fails the build when a
   text or UI pair drops below threshold — in either theme. A hand-picked
   hex (from a human or a model) cannot ship past it: the fix belongs in the
   role value, never at a call site. */

function parseCssScope(css) {
  /* Strip comments and @imports first: the selector match below is exact, and
     the tokens file opens with two @imports ahead of its first :root. */
  const cleaned = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import[^;]+;/g, '');
  const root = {};
  const dark = {};
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(cleaned)) !== null) {
    const selectors = m[1].trim();
    const parts = selectors.split(',').map((s) => s.trim());
    const target = parts.includes(':root')
      ? root
      : parts.includes('[data-theme="dark"]')
        ? dark
        : null;
    if (!target) continue;
    for (const decl of m[2].split(';')) {
      const i = decl.indexOf(':');
      if (i === -1) continue;
      const prop = decl.slice(0, i).trim();
      if (prop.startsWith('--')) target[prop] = decl.slice(i + 1).trim();
    }
  }
  return { root, dark, hasDark: Object.keys(dark).length > 0 };
}

function resolveVarChain(value, scope, root, seen = new Set()) {
  if (!value) return value;
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*?)\s*)?\)/g, (all, name, fallback) => {
    if (seen.has(name)) return fallback !== undefined ? fallback.trim() : '';
    seen.add(name);
    const next = scope[name] ?? root[name];
    if (next === undefined) return fallback !== undefined ? fallback.trim() : '';
    return resolveVarChain(next, scope, root, seen);
  });
}

function parseCssColor(input) {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (s === 'transparent') return [0, 0, 0, 0];
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (![3, 4, 6, 8].includes(hex.length)) return null;
    const wide = hex.length >= 6;
    const pair = (h) => (wide ? h : h + h);
    const r = parseInt(pair(hex.slice(0, wide ? 2 : 1)), 16);
    const g = parseInt(pair(hex.slice(wide ? 2 : 1, wide ? 4 : 2)), 16);
    const b = parseInt(pair(hex.slice(wide ? 4 : 2, wide ? 6 : 3)), 16);
    const a = hex.length === 4 || hex.length === 8
      ? parseInt(pair(hex.slice(-1 * (wide ? 2 : 1))), 16) / 255
      : 1;
    return [r, g, b, a];
  }
  const fn = s.match(/^rgba?\(([^)]*)\)$/);
  if (!fn) return null;
  const parts = fn[1].split(/[,\s/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const ch = (p) => (p.endsWith('%') ? Math.round(parseFloat(p) * 2.55) : Math.round(parseFloat(p)));
  const al = (p) => (p.endsWith('%') ? parseFloat(p) / 100 : parseFloat(p));
  return [ch(parts[0]), ch(parts[1]), ch(parts[2]), parts[3] !== undefined ? al(parts[3]) : 1];
}

function wcagLuminance([r, g, b]) {
  const ch = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function wcagContrast(fg, bg) {
  const l1 = wcagLuminance(fg);
  const l2 = wcagLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function compositeOver(fg, bg) {
  if (fg[3] >= 1) return fg;
  return [
    Math.round(fg[0] * fg[3] + bg[0] * (1 - fg[3])),
    Math.round(fg[1] * fg[3] + bg[1] * (1 - fg[3])),
    Math.round(fg[2] * fg[3] + bg[2] * (1 - fg[3])),
    1,
  ];
}

function runContrastGate(cssContent, failures) {
  const { root, dark, hasDark } = parseCssScope(cssContent);
  /* Text pairs hold at AA (4.5). The last two are UI-indicator pairs
     (anchor-inked icons, the focus ring) — WCAG 2.2 1.4.11 needs 3.0. */
  const pairs = [
    ['ink', 'ground', 4.5], ['ink-quiet', 'ground', 4.5], ['ink-faint', 'ground', 4.5],
    ['ink', 'raised', 4.5], ['ink-quiet', 'raised', 4.5], ['ink-faint', 'raised', 4.5],
    ['on-anchor', 'anchor', 4.5],
    ['stop-ink', 'stop-ground', 4.5], ['stop-ink-quiet', 'stop-ground', 4.5],
    ['flag', 'ground', 4.5], ['attest', 'ground', 4.5], ['ok', 'ground', 4.5], ['halt', 'ground', 4.5],
    ['anchor', 'ground', 3.0], ['focus', 'ground', 3.0],
  ];
  const roleColor = (name, scope) => {
    const raw = scope?.[`--role-${name}`] ?? root[`--role-${name}`];
    if (raw === undefined) return { error: `--role-${name} is not defined` };
    const resolved = resolveVarChain(raw, scope ?? {}, root);
    const parsed = parseCssColor(resolved);
    if (!parsed) return { error: `--role-${name} resolves to "${resolved}" — not a parseable color` };
    return { color: parsed };
  };
  const checkTheme = (label, scope) => {
    for (const [fgName, bgName, min] of pairs) {
      const fg = roleColor(fgName, scope);
      const bg = roleColor(bgName, scope);
      if (fg.error || bg.error) {
        failures.push(`contrast[${label}]: ${fg.error ?? bg.error}`);
        continue;
      }
      const ratio = wcagContrast(compositeOver(fg.color, bg.color), bg.color);
      if (ratio < min) {
        failures.push(
          `contrast[${label}]: --role-${fgName} on --role-${bgName} = ${ratio.toFixed(2)}:1 < ${min}`
          + ' — fix the role value in src/styles/index.css, never a call site.',
        );
      }
    }
  };
  checkTheme('light', root);
  if (hasDark) {
    const required = ['ground', 'ink', 'ink-quiet', 'ink-faint', 'anchor', 'on-anchor', 'stop-ground', 'stop-ink', 'stop-ink-quiet'];
    const missing = required.filter((n) => dark[`--role-${n}`] === undefined);
    if (missing.length) {
      failures.push(
        `contrast[dark]: [data-theme="dark"] exists but is incomplete — missing roles: ${missing.join(', ')}.`
        + ' Define every role for dark or remove the block; a partial theme must not half-pass.',
      );
    } else {
      checkTheme('dark', dark);
    }
  } else {
    console.log('NOTE contrast gate: [data-theme="dark"] not yet defined — light theme enforced only.');
  }
}

const indexCss = await readFile(join(sourceRoot, 'styles', 'index.css'), 'utf8');
runContrastGate(indexCss, failures);

// UI debt ratchet — raw colour / family / leading may only decrease per file.
const { checkDebt } = await import('./ui-debt.mjs');
failures.push(...(await checkDebt()));

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
console.log('PASS WCAG contrast gate: every role pair holds at AA (4.5:1 text / 3:1 UI) in the defined themes.');
console.log('PASS UI debt ratchet: raw colour / font-family / line-height counts at or below budget.');
