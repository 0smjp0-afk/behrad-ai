/* ═══════════════════════════════════════════════════════════════
   test/run.mjs — کلِ آزمون‌های مخزن
   اجرا: node test/run.mjs
   شامل: نحوِ ورکر · کاتالوگ i18n · زمان‌اجرای L · ثابت‌های دوزبانه · بستهٔ وب
   ═══════════════════════════════════════════════════════════════ */
import fs from 'fs';
import path from 'path';
import vm from 'node:vm';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const acorn = require('acorn');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FA = /[؀-ۿ]/;

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? '✔' : '✘') + ' ' + name + (cond || !extra ? '' : '  — ' + extra));
};
const section = (t) => console.log('\n─── ' + t + ' ───');

/* ─── کمکی: خواندن سورسِ ورکر با APP_ASSETS خالی ─── */
function stripAssets(s) {
  const i = s.indexOf('const APP_ASSETS = ');
  if (i < 0) return s;
  let j = s.indexOf('=', i) + 1, d = 0, dbr = 0;
  for (; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'") { const q = c; j++; while (j < s.length) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === q) break; j++; } continue; }
    if (c === '{') d++; else if (c === '}') d--;
    else if (c === '[') dbr++; else if (c === ']') dbr--;
    else if (c === ';' && d === 0 && dbr === 0) break;
  }
  return s.slice(0, i) + 'const APP_ASSETS = {};' + s.slice(j + 1);
}
/* کمکی: استخراجِ مقدارِ یک دستورِ top-level (const NAME = …;) */
function extractDecl(src, name) {
  const start = src.indexOf('const ' + name + ' =');
  if (start < 0) return null;
  let j = src.indexOf('=', start) + 1, d = 0, dbr = 0;
  for (; j < src.length; j++) {
    const c = src[j];
    if (c === "'" || c === '"' || c === '`') { const q = c; j++; while (j < src.length) { if (src[j] === '\\') { j += 2; continue; } if (src[j] === q) break; j++; } continue; }
    if (c === '{') d++; else if (c === '}') d--;
    else if (c === '[') dbr++; else if (c === ']') dbr--;
    else if (c === ';' && d === 0 && dbr === 0) break;
  }
  return src.slice(src.indexOf('=', start) + 1, j);
}
const WORKER = stripAssets(fs.readFileSync(path.join(ROOT, 'src/worker.js'), 'utf8').replace(/\r\n/g, '\n'));

/* ═══════════════ ۱) نحو ═══════════════ */
section('worker.js syntax');
try {
  acorn.parse(WORKER, { ecmaVersion: 2022, sourceType: 'module' });
  ok('parses as ES module', true);
} catch (e) {
  ok('parses as ES module', false, e.message);
}
ok('no Codespaces trace', !WORKER.includes('codespace') && !WORKER.includes('Codespace') && !WORKER.includes('GITHUB_TOKEN'));

/* ═══════════════ ۲) کاتالوگ i18n ═══════════════ */
section('i18n catalog (CAT)');
const catJson = extractDecl(WORKER, 'CAT');
ok('CAT present', !!catJson);
const CAT = catJson ? JSON.parse(catJson) : {};
const ids = Object.keys(CAT);
ok('CAT has 840+ entries', ids.length >= 840, String(ids.length));
let emptyFa = 0, emptyEn = 0;
for (const v of Object.values(CAT)) { if (!v.fa) emptyFa++; if (!v.en) emptyEn++; }
ok('no empty fa', emptyFa === 0, String(emptyFa));
ok('no empty en', emptyEn === 0, String(emptyEn));
const PH = /\%(\d+)/;
let phBad = 0;
for (const [id, v] of Object.entries(CAT)) {
  const faN = (v.fa.match(/%\d+/g) || []).sort().join();
  const enN = (v.en.match(/%\d+/g) || []).sort().join();
  if (faN !== enN) phBad++;
}
ok('fa/en placeholder parity', phBad === 0, phBad + ' mismatches');

/* ═══════════════ ۳) زمان‌اجرای i18n (L) در vm ═══════════════ */
section('i18n runtime (L, owner secrets)');
{
  function extractFnAst(src, name) {
    const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'module' });
    let found = null;
    for (const st of ast.body) {
      if (st.type === 'FunctionDeclaration' && st.id && st.id.name === name) { found = src.slice(st.start, st.end); break; }
    }
    if (!found) throw new Error('fn not found: ' + name);
    return found;
  }
  const runtime = 'const CAT = ' + catJson + ';\n' +
    ['ownerName', 'ownerBrand', 'fillOwn', 'effLang', 'L'].map((n) => extractFnAst(WORKER, n)).join('\n') +
    '\nthis.__api = { L, ownerName, ownerBrand, fillOwn, effLang };';
  const ctx = vm.createContext({});
  vm.runInContext(runtime, ctx);
  const api = ctx.__api;

  ok('ownerName from secret', api.ownerName({ OWNER_NAME: 'رضا' }) === 'رضا');
  ok('ownerName default', api.ownerName({}) === 'Owner');
  ok('ownerBrand latin', api.ownerBrand({ OWNER_NAME: 'رضا', OWNER_NAME_EN: 'Reza' }) === 'Reza AI');
  ok('fillOwn escapes HTML', api.fillOwn({ OWNER_NAME: '<b>&x' }, '{{owner}}') === '&lt;b&gt;&amp;x');
  ok('fillOwn brand', api.fillOwn({ OWNER_NAME: 'Ali' }, '{{brand}}') === 'Ali AI');

  let noFa = 0, phLeft = 0, ownLeft = 0;
  for (const id of ids) {
    const fa = api.L({ _lang: 'fa', OWNER_NAME: 'Ali' }, id, ...Array(24).fill('X'));
    const en = api.L({ _lang: 'en', OWNER_NAME: 'Ali' }, id, ...Array(24).fill('X'));
    if (!fa) noFa++;
    if (/%\d/.test(fa) || /%\d/.test(en)) phLeft++;
    if (/\{\{(owner|brand)\}\}/.test(fa) || /\{\{(owner|brand)\}\}/.test(en)) phLeft++;
  }
  ok('every id renders in fa', noFa === 0, String(noFa));
  ok('no unresolved %N or {{…}} tokens', phLeft === 0, String(phLeft));

  const differing = ids.filter((id) => api.L({ _lang: 'fa' }, id) !== api.L({ _lang: 'en' }, id)).length;
  ok('majority of strings differ fa/en', differing > ids.length * 0.6, differing + '/' + ids.length);
}

/* ═══════════════ ۴) ثابت‌های دوزبانهٔ ماژول ═══════════════ */
section('bilingual module constants');
{
  const pairs = [
    ['PERSONAS', 'PERSONAS_EN'], ['CORE_SYSTEM_PROMPT', 'CORE_SYSTEM_PROMPT_EN'],
    ['FORMAT_RULES', 'FORMAT_RULES_EN'], ['STT_SYS', 'STT_SYS_EN'],
    ['TRANSLATE_SYS', 'TRANSLATE_SYS_EN'], ['SUM_SYS', 'SUM_SYS_EN'],
    ['DISCO_FAIL_TEXT', 'DISCO_FAIL_TEXT_EN'], ['HELP_TEXT', 'HELP_TEXT_EN'],
    ['APP_HELP_MD', 'APP_HELP_MD_EN'], ['WG_SYS', 'WG_SYS_EN'],
  ];
  const names = [];
  let code = '';
  for (const [fa, en] of pairs) {
    const a = extractDecl(WORKER, fa);
    const b = extractDecl(WORKER, en);
    ok(fa + ' + ' + en + ' defined', !!(a && b));
    if (a) { code += 'const ' + fa + ' = ' + a + ';\n'; names.push(fa); }
    if (b) { code += 'const ' + en + ' = ' + b + ';\n'; names.push(en); }
  }
  code += extractDecl(WORKER, 'WD_EN') ? 'const WD_EN = ' + extractDecl(WORKER, 'WD_EN') + ';\nthis.__WD_EN = WD_EN;\n' : '';
  const ctx = vm.createContext({ CFG: { BRIEF_HOUR: 10 } });
  vm.runInContext(code + '\nthis.__OUT = { ' + pairs.flatMap(([a, b]) => [a, b]).filter((n) => n && n !== 'WD_EN').join(',') + ' };', ctx);
  const M = ctx.__OUT;
  for (const [fa, en] of pairs) {
    if (!M[fa] || !M[en]) continue;
    ok(en + ' has no Persian', !FA.test(JSON.stringify(M[en])));
    ok(fa + '/' + en + ' differ', JSON.stringify(M[fa]) !== JSON.stringify(M[en]));
  }
  ok('CORE_EN uses {{owner}}', M.CORE_SYSTEM_PROMPT_EN.includes('{{owner}}'));
  ok('CORE_EN uses {{brand}}', M.CORE_SYSTEM_PROMPT_EN.includes('{{brand}}'));
  ok('HELP_EN uses {{brand}}', M.HELP_TEXT_EN.includes('{{brand}}'));
  ok('FA core has no raw owner name', !M.CORE_SYSTEM_PROMPT.includes('بهراد'));
  ok('FA help has no raw owner name', !M.HELP_TEXT.includes('بهراد'));
  ok('WD_EN is English', Array.isArray(ctx.__WD_EN) && !FA.test(ctx.__WD_EN.join()));
  void M;
}

/* ═══════════════ ۵) بستهٔ وب ═══════════════ */
section('web bundle + i18n');
{
  const appSrc = fs.readFileSync(path.join(ROOT, 'web/app-i18n.js'), 'utf8');
  const c2 = vm.createContext({ document: { documentElement: { setAttribute() {} } } });
  vm.runInContext(appSrc + '\n;this.__OUT = { keys: Object.keys(WEB_I18N), map: WEB_I18N };', c2);
  const { keys, map } = c2.__OUT;
  ok('WEB_I18N has 400+ keys', keys.length >= 400, String(keys.length));
  let faInEn = 0;
  for (const [fa, en] of Object.entries(map)) {
    if (FA.test(en) && en !== 'فارسی' && !/^\d+$/.test(en)) faInEn++;
  }
  ok('no Persian in EN translations', faInEn === 0, String(faInEn));
  /* هر W("…") در فایل‌های وب باید کلید داشته باشد */
  let total = 0, missing = 0;
  for (const f of ['app-core.js', 'app-screens.js', 'mock.js']) {
    const src = fs.readFileSync(path.join(ROOT, 'web', f), 'utf8');
    acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script' });
    const re = /W\("((?:[^"\\]|\\.)*)"\)/g;
    let mm;
    while ((mm = re.exec(src))) {
      total++;
      if (!(JSON.parse('"' + mm[1] + '"') in map)) missing++;
    }
  }
  ok('all W() strings keyed (' + total + ')', missing === 0, missing + ' missing');
  for (const f of ['app-core.js', 'app-screens.js', 'app-i18n.js', 'mock.js']) {
    try { acorn.parse(fs.readFileSync(path.join(ROOT, 'web', f), 'utf8'), { ecmaVersion: 2022, sourceType: 'script' }); ok('web/' + f + ' syntax', true); }
    catch (e) { ok('web/' + f + ' syntax', false, e.message); }
  }
}

/* ═══════════════ نتیجه ═══════════════ */
console.log('\n════════════════════════════════');
console.log('PASS ' + pass + ' | FAIL ' + fail);
process.exit(fail ? 1 : 0);
