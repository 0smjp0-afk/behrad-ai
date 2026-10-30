/* ═══════════════════════════════════════════════════════════════
   scripts/build.mjs — بسته‌بندِ «تک‌فایلِ استقرار»
   ─────────────────────────────────────────────────────────────
   ورودی:  src/modules/*.js  (به‌ترتیبِ manifest.json)
           src/generated/app-assets.js  (از web/ ساخته می‌شود)
   خروجی:  worker.js  ← همان فایلِ تک‌فایلی که در کلادفلر Paste می‌شود
   حالت‌ها:
     node scripts/build.mjs             ساختِ worker.js
     node scripts/build.mjs --assets    فقط ساختِ src/generated/app-assets.js از web/
     node scripts/build.mjs --check      بررسیِ هم‌خوانی (۱ = ناهم‌خوان)
   ═══════════════════════════════════════════════════════════════ */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const acorn = require('acorn');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOD = path.join(ROOT, 'src', 'modules');
const GEN = path.join(ROOT, 'src', 'generated');
const WEB = path.join(ROOT, 'web');
const OUT = path.join(ROOT, 'src', 'worker.js');

const DO_ASSETS = process.argv.includes('--assets');
const CHECK = process.argv.includes('--check');

/* ── ۱) بسته‌بندیِ web/ → src/generated/app-assets.js ── */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
};
const BINARY = new Set(['.woff2', '.png', '.jpg', '.webp', '.ico']);
function walk(dir, base = '') {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.DS_Store' || ent.name === 'Thumbs.db') continue;
    const rel = base ? base + '/' + ent.name : ent.name;
    if (ent.isDirectory()) out.push(...walk(path.join(dir, ent.name), rel));
    else if (ent.isFile()) out.push({ rel, abs: path.join(dir, ent.name), ext: path.extname(ent.name).toLowerCase() });
  }
  return out;
}
function buildAssets() {
  const files = walk(WEB).sort((a, b) => a.rel.localeCompare(b.rel));
  const assets = {};
  let total = 0;
  for (const f of files) {
    const type = MIME[f.ext] || 'application/octet-stream';
    if (BINARY.has(f.ext)) {
      const b64 = fs.readFileSync(f.abs).toString('base64');
      assets[f.rel] = { t: type, b: b64, e: 'b64' };
      total += b64.length;
    } else {
      const txt = fs.readFileSync(f.abs, 'utf8');
      assets[f.rel] = { t: type, b: txt };
      total += txt.length;
    }
  }
  return { line: 'const APP_ASSETS = ' + JSON.stringify(assets) + ';', count: files.length, total, files };
}

/* دارایی‌های وب همیشه از web/ بازساخته می‌شوند — وگرنه تغییرِ web/ بی‌سروصدا
   هرگز به خروجی نمی‌رسد (باگِ قبلی: فقط وقتی فایل نبود ساخته می‌شد). */
const assetsOut = path.join(GEN, 'app-assets.js');
const a = buildAssets();
const nextAssets = '/* ═══ GENERATED — دستی ویرایش نکنید ═══\n' +
  '   ساخته‌شده از web/ توسط `npm run build`. این خط در build داخلِ worker.js\n' +
  '   قرار می‌گیرد. */\n' + a.line + '\n';
const prevAssets = fs.existsSync(assetsOut) ? fs.readFileSync(assetsOut, 'utf8') : '';
if (!CHECK && prevAssets !== nextAssets) {
  fs.mkdirSync(GEN, { recursive: true });
  fs.writeFileSync(assetsOut, nextAssets, 'utf8');
  console.log('app-assets: ' + a.count + ' فایل، ' + a.total + ' کاراکتر');
} else if (!CHECK) {
  console.log('app-assets: بدون تغییر (' + a.count + ' فایل)');
}
if (DO_ASSETS) process.exit(0);

/* ── ۲) خواندنِ ماژول‌ها به‌ترتیب ── */
const manifest = JSON.parse(fs.readFileSync(path.join(MOD, 'manifest.json'), 'utf8'));
const parts = [];
for (const name of manifest) {
  const p = path.join(MOD, name);
  if (!fs.existsSync(p)) throw new Error('ماژول نیست: ' + name);
  parts.push(fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, ''));
}

/* خطِ APP_ASSETS از فایلِ generated — جای نشانه در ماژول ۲۱ می‌نشیند
   (موقعیتِ اصلی‌اش در worker.js). */
const aaLine = a.line;
const MARK = '/* APP_ASSETS → src/generated/app-assets.js (در build برمی‌گردد) */';
const holderIdx = parts.findIndex((p) => p.includes(MARK));
if (holderIdx < 0) throw new Error('نشانهٔ APP_ASSETS در ماژول‌ها نیست');
parts[holderIdx] = parts[holderIdx].replace(MARK, aaLine);

const BANNER =
  '/* ═══════════════════════════════════════════════════════════════════════════\n' +
  '   ⚠️  این فایل ساخته‌شده است — مستقیماً ویرایش نکنید.\n' +
  '   منبع: src/modules/*.js  +  src/generated/app-assets.js (از web/)\n' +
  '   ساختِ دوباره:  npm run build        بررسیِ هم‌خوانی:  npm run build:check\n' +
  '═════════════════════════════════════════════════════════════════════════════ */\n';
const bundle = BANNER + parts.join('\n\n') + '\n';

/* ── ۳) اعتبارسنجیِ نحو (با خالی‌کردن APP_ASSETS برای سبکی) ── */
/* APP_ASSETS یک دستورِ تک‌خطی است؛ برای سبکیِ AST کلِ خط خالی می‌شود
   (نه با indexOf(';') که داخل رشتهٔ MIME گیر می‌کند). */
function stubAssets(s) {
  return s.split('\n').map((l) => l.startsWith('const APP_ASSETS = ') ? 'const APP_ASSETS = {};' : l).join('\n');
}
try {
  acorn.parse(stubAssets(bundle), { ecmaVersion: 2022, sourceType: 'module' });
} catch (e) {
  console.error('✘ نحوِ bundle خراب است: ' + e.message);
  process.exit(1);
}

/* ── ۴) نوشتن یا بررسی ── */
if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (cur !== bundle) {
    console.error('✘ worker.js کهنه است — اجرا کنید: npm run build');
    process.exit(1);
  }
  /* app-assets هم باید با web/ هم‌خوان باشد؛ اگر stale باشد، build بالا
     فقط در حافظه تازه‌اش کرده و نوشتنش نکرده. */
  if (fs.readFileSync(assetsOut, 'utf8') !== nextAssets) {
    console.error('✘ src/generated/app-assets.js کهنه است — اجرا کنید: npm run build');
    process.exit(1);
  }
  console.log('✔ worker.js و app-assets به‌روزند (' + manifest.length + ' ماژول)');
  process.exit(0);
}
fs.writeFileSync(OUT, bundle, 'utf8');
console.log('✔ worker.js ساخته شد: ' + manifest.length + ' ماژول، ' +
  Math.round(bundle.length / 1024) + 'KB، ' + bundle.split('\n').length + ' خط');
