// 마스터 데이터(재료 100 · 메뉴 50 · 메뉴-재료 매핑)를 Supabase에 적재
// 사용: .env.local에 SUPABASE_SERVICE_ROLE_KEY 준비 후 `node scripts/seed-supabase.js`
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const root = process.cwd();

const readEnv = (file) => {
  const out = {};
  try {
    for (const line of fs.readFileSync(path.join(root, file), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
  } catch {}
  return out;
};

const env = { ...readEnv('.env'), ...readEnv('.env.local') };
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('EXPO_PUBLIC_SUPABASE_URL(.env) / SUPABASE_SERVICE_ROLE_KEY(.env.local)가 필요합니다.');
  process.exit(1);
}

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

async function main() {
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

  const ing = parseCsv(fs.readFileSync(path.join(root, 'docs/seed/ingredients.csv'), 'utf8'))
    .slice(1)
    .map(([id, name, category, default_unit, shelf, storage, notes]) => ({
      id, name, category, default_unit,
      shelf_life_days: Number(shelf), storage, notes: notes || null,
    }));

  const menuRows = parseCsv(fs.readFileSync(path.join(root, 'docs/seed/menus.csv'), 'utf8')).slice(1);
  const menus = menuRows.map(([id, name, category, time, difficulty, _req, _opt, tags, description]) => ({
    id, name, category,
    cooking_time: Number(time), difficulty, tags: splitList(tags), description,
  }));
  const menuIngredients = menuRows.flatMap(([id, , , , , req, opt]) => [
    ...splitList(req).map((n) => ({ menu_id: id, ingredient_name: n, is_optional: false })),
    ...splitList(opt).map((n) => ({ menu_id: id, ingredient_name: n, is_optional: true })),
  ]);

  let res = await sb.from('ingredient_master').upsert(ing);
  if (res.error) throw new Error('ingredient_master: ' + res.error.message);
  console.log('ingredient_master:', ing.length);

  res = await sb.from('menu').upsert(menus);
  if (res.error) throw new Error('menu: ' + res.error.message);
  console.log('menu:', menus.length);

  // menu_ingredient는 id가 bigserial이라 upsert 대신 재적재
  res = await sb.from('menu_ingredient').delete().neq('id', 0);
  if (res.error) throw new Error('menu_ingredient delete: ' + res.error.message);
  res = await sb.from('menu_ingredient').insert(menuIngredients);
  if (res.error) throw new Error('menu_ingredient insert: ' + res.error.message);
  console.log('menu_ingredient:', menuIngredients.length);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
