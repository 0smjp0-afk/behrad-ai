/* ═══ scripts/check-split.mjs — آیا bundle ساختاری با اصل یکسان است؟ ═══
   کامنت‌ها و خط‌های خالی نباید مانع شوند؛ پس AST را (با مکان‌ها) می‌سازیم و
   همهٔ گره‌های «کد» را بدون موقعیت مقایسه می‌کنیم. */
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const acorn = require('acorn');

const norm = (s) => s.replace(/\r\n/g, '\n');
function stub(s) { return norm(s).split('\n').map((l) => l.startsWith('const APP_ASSETS = ') ? 'const APP_ASSETS = {};' : l).join('\n'); }
function nodes(src) {
  const ast = acorn.parse(stub(src), { ecmaVersion: 2022, sourceType: 'module' });
  const out = [];
  (function w(n) {
    if (!n || typeof n.type !== 'string') return;
    const o = { t: n.type };
    for (const k of Object.keys(n)) {
      if (k === 'loc' || k === 'start' || k === 'end' || k === 'type') continue;
      const v = n[k];
      if (v == null) continue;
      if (Array.isArray(v)) o[k] = v.map((c) => (c && typeof c.type === 'string') ? '<node>' : c);
      else if (typeof v.type === 'string') o[k] = '<node>';
      else o[k] = v;
    }
    out.push(JSON.stringify(o));
    for (const k of Object.keys(n)) {
      if (k === 'loc' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') w(c); });
      else if (v && typeof v.type === 'string') w(v);
    }
  })(ast);
  return out;
}
const [aPath, bPath] = process.argv.slice(2);
const A = nodes(fs.readFileSync(aPath, 'utf8'));
const B = nodes(fs.readFileSync(bPath, 'utf8'));
console.log('AST nodes — orig: ' + A.length + ' | built: ' + B.length);
if (A.length !== B.length) {
  let i = 0; while (i < A.length && i < B.length && A[i] === B[i]) i++;
  console.log('✘ اولی تفاوت در گرهٔ ' + i + ':');
  console.log('   orig: ' + (A[i] || '').slice(0, 160));
  console.log('   new : ' + (B[i] || '').slice(0, 160));
  process.exit(1);
}
let d = 0;
for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) { d++; if (d <= 3) console.log('  گرهٔ ' + i + '\n   orig: ' + A[i].slice(0, 140) + '\n   new : ' + B[i].slice(0, 140)); }
console.log(d === 0 ? '✔ AST یکسان است — هیچ تغییری در کد نیست' : '✘ ' + d + ' گره متفاوت');
process.exit(d ? 1 : 0);
