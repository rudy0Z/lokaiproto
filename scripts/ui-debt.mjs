/**
 * UI debt ratchet.
 *
 * `verify-demo.mjs` enforces tokens for radius, fontSize and boxShadow — and
 * nothing else. Colour, family, leading and padding were never guarded, so
 * that is exactly where the drift went: 215 raw hex literals, 37 hand-written
 * `lineHeight` values in one file, and a per-script typography system that
 * never applied because no component set a `lang` attribute.
 *
 * The system got the enforcement it asked for and drifted everywhere else.
 * Widening the guard to fail on all of it would fail the build today at ~400
 * sites, so this is a RATCHET instead: every file has a budget, the budget is
 * today's count, and the count may only fall. A screen migrated to `src/app/ui`
 * drops its budget; a screen that adds a raw hex fails the build.
 *
 *   node scripts/ui-debt.mjs           check against the baseline
 *   node scripts/ui-debt.mjs --update  re-baseline (only ever downward)
 *
 * Run it from `npm run verify:demo`. When a file reaches 0 on every metric it
 * is fully on the system; when every file does, delete this script.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(root, 'src');
const baselinePath = join(root, 'scripts', 'ui-debt.json');

/** Files that DEFINE the system are allowed to speak in literals. */
const SYSTEM_FILES = [
  'src/app/components/shared.tsx',
  'src/app/ui/theme.ts',
  'src/app/ui/script.ts',
  'src/app/ui/primitives.tsx',
  'src/app/ui/layout.tsx',
  'src/app/ui/motion.tsx',
  'src/app/ui/index.ts',
];

const METRICS = {
  /** Raw colour. Should be `T.*` — a literal cannot survive a theme change. */
  rawColor: (line) => /(?:#[0-9A-Fa-f]{6}\b|rgba?\()/.test(line) && !/^\s*(?:\/\/|\*|\/\*)/.test(line),
  /** Raw font family. Should be a `<Text role>` — the role knows the script. */
  rawFamily: (line) => /fontFamily\s*:/.test(line),
  /** Raw leading. Should come from the type role, or from the active script. */
  rawLeading: (line) => /lineHeight\s*:/.test(line),
};

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collect(path) : Promise.resolve([path]);
    }),
  );
  return nested.flat();
}

function rel(file) {
  return relative(root, file).replace(/\\/g, '/');
}

export async function measure() {
  const files = (await collect(sourceRoot)).filter((f) => ['.ts', '.tsx'].includes(extname(f)));
  const counts = {};
  for (const file of files) {
    const name = rel(file);
    if (SYSTEM_FILES.includes(name)) continue;
    const lines = (await readFile(file, 'utf8')).split('\n');
    const entry = {};
    for (const [metric, test] of Object.entries(METRICS)) {
      const n = lines.filter(test).length;
      if (n > 0) entry[metric] = n;
    }
    if (Object.keys(entry).length > 0) counts[name] = entry;
  }
  return counts;
}

export async function checkDebt() {
  let baseline;
  try {
    baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
  } catch {
    return [`scripts/ui-debt.json missing — run \`node scripts/ui-debt.mjs --update\``];
  }

  const current = await measure();
  const failures = [];

  for (const [file, metrics] of Object.entries(current)) {
    for (const [metric, count] of Object.entries(metrics)) {
      const budget = baseline.files?.[file]?.[metric] ?? 0;
      if (count > budget) {
        failures.push(
          `${file} ${metric}: ${count} > budget ${budget}. ` +
          `Use src/app/ui primitives instead of raw ${metric.replace('raw', '').toLowerCase()}.`,
        );
      }
    }
  }
  return failures;
}

function total(counts) {
  return Object.values(counts).reduce(
    (sum, m) => sum + Object.values(m).reduce((a, b) => a + b, 0),
    0,
  );
}

if (process.argv[1] && process.argv[1].endsWith('ui-debt.mjs')) {
  if (process.argv.includes('--update')) {
    const current = await measure();
    let previous = { files: {} };
    try { previous = JSON.parse(await readFile(baselinePath, 'utf8')); } catch { /* first run */ }

    /* Ratchet: a budget may fall, never rise. Re-baselining after adding debt
       is the failure mode this guards against — the point is not to have a
       number, it is for the number to only go one way. */
    const merged = {};
    for (const [file, metrics] of Object.entries(current)) {
      merged[file] = {};
      for (const [metric, count] of Object.entries(metrics)) {
        const prior = previous.files?.[file]?.[metric];
        merged[file][metric] = prior === undefined ? count : Math.min(prior, count);
      }
    }
    const out = {
      note: 'Budgets may only decrease. See scripts/ui-debt.mjs. Migrate a file to src/app/ui and re-run with --update.',
      measuredAt: new Date().toISOString().slice(0, 10),
      totalDebt: total(merged),
      files: merged,
    };
    await writeFile(baselinePath, JSON.stringify(out, null, 2) + '\n');
    console.log(`Baseline written: ${out.totalDebt} raw-style lines across ${Object.keys(merged).length} files.`);
  } else {
    const failures = await checkDebt();
    if (failures.length) {
      console.error(failures.map((f) => `FAIL ${f}`).join('\n'));
      process.exit(1);
    }
    const current = await measure();
    console.log(`PASS UI debt ratchet: ${total(current)} raw-style lines, none above budget.`);
  }
}
