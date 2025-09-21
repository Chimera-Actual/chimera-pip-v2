// scripts/fix-testing-library-imports.mjs
import fs from 'node:fs';
import path from 'node:path';
import glob from 'fast-glob';

const TEST_GLOBS = [
  'src/**/*.{test,spec}.{ts,tsx}',
  'src/**/__tests__/**/*.{ts,tsx}',
  'test/**/*.{ts,tsx}',
  'tests/**/*.{ts,tsx}',
];

const domNames = new Set(['screen', 'fireEvent', 'waitFor']);
const reactNames = new Set(['render', 'renderHook', 'cleanup', 'act']);

function parseImport(line) {
  const m = line.match(/^import\s*\{\s*([^}]+)\}\s*from\s*['"]@testing-library\/react['"];?/);
  if (!m) return null;
  const names = m[1].split(',').map(s => s.trim()).filter(Boolean);
  return names;
}

function formatImport(names, pkg) {
  return names.size ? `import { ${[...names].sort().join(', ')} } from '${pkg}';` : '';
}

function upsertDomImport(lines, idxAfter, namesToAdd) {
  // find existing DOM import
  let foundIdx = -1;
  let existing = new Set();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^import\s*\{\s*([^}]+)\}\s*from\s*['"]@testing-library\/dom['"];?/);
    if (m) {
      foundIdx = i;
      m[1].split(',').map(s => s.trim()).forEach(n => existing.add(n));
      break;
    }
  }
  const merged = new Set([...existing, ...namesToAdd]);
  if (foundIdx >= 0) {
    lines[foundIdx] = formatImport(merged, '@testing-library/dom');
    return;
  }
  // insert after the @testing-library/react import line
  lines.splice(idxAfter + 1, 0, formatImport(merged, '@testing-library/dom'));
}

async function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const names = parseImport(lines[i]);
    if (!names) continue;

    const reactKeep = new Set();
    const domKeep = new Set();
    const otherKeep = new Set(); // unexpected names—keep with react by default

    names.forEach((n) => {
      if (reactNames.has(n)) reactKeep.add(n);
      else if (domNames.has(n)) domKeep.add(n);
      else otherKeep.add(n);
    });

    // If nothing to move, continue
    if (domKeep.size === 0) continue;

    // Rebuild the @testing-library/react import
    const reactFinal = new Set([...reactKeep, ...otherKeep]);
    lines[i] = formatImport(reactFinal, '@testing-library/react') || '';

    // Insert or merge the DOM import
    upsertDomImport(lines, i, domKeep);

    changed = true;
  }

  if (changed) {
    const out = lines.filter(Boolean).join('\n');
    fs.writeFileSync(file, out, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  const files = await glob(TEST_GLOBS, { absolute: true });
  let modified = 0;
  for (const f of files) {
    const ok = await processFile(f);
    if (ok) {
      console.log('Fixed:', path.relative(process.cwd(), f));
      modified++;
    }
  }
  console.log(`Done. Modified ${modified} file(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});