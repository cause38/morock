// CSV → TS 시드 변환 (docs/seed/*.csv → src/data/*.ts)
const fs = require('fs');
const path = require('path');

const root = process.cwd();

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((f) => f !== '')) rows.push(row); }
  return rows;
}

const splitList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

// ingredients
const ing = parseCsv(fs.readFileSync(path.join(root, 'docs/seed/ingredients.csv'), 'utf8'));
const ingRows = ing.slice(1).map(([id, name, category, unit, shelf, storage, notes]) => ({
  id, name, category, defaultUnit: unit, shelfLifeDays: Number(shelf), storage, notes: notes || undefined,
}));

// menus
const men = parseCsv(fs.readFileSync(path.join(root, 'docs/seed/menus.csv'), 'utf8'));
const menRows = men.slice(1).map(([id, name, category, time, diff, req, opt, tags, desc]) => ({
  id, name, category, cookingTime: Number(time), difficulty: diff,
  required: splitList(req), optional: splitList(opt), tags: splitList(tags), description: desc,
}));

const header = (src) => `// AUTO-GENERATED from docs/seed/${src} — 수정은 CSV에서 하고 scripts/gen-seed.js 재실행\n`;

fs.writeFileSync(
  path.join(root, 'src/data/ingredients.ts'),
  header('ingredients.csv') +
  `import type { IngredientMaster } from './types';\n\n` +
  `export const INGREDIENT_MASTER: IngredientMaster[] = ${JSON.stringify(ingRows, null, 2)};\n`,
);
fs.writeFileSync(
  path.join(root, 'src/data/menus.ts'),
  header('menus.csv') +
  `import type { Menu } from './types';\n\n` +
  `export const MENUS: Menu[] = ${JSON.stringify(menRows, null, 2)};\n`,
);
console.log('ingredients:', ingRows.length, '/ menus:', menRows.length);
