/* ═══════════════════════════════════════════════════════════════
   build.mjs — web/ → APP_ASSETS داخلِ src/worker.js
   ─────────────────────────────────────────────────────────────
   فایل‌های web/ در یک شیء JSON فشرده بسته‌بندی می‌شوند و روی خطِ
   `const APP_ASSETS = …;` در worker.js نوشته می‌شوند. این‌طوری استقرار
   فقط یک فایل است و فایل‌های وب با نسخهٔ ورکر همیشه هم‌خوان می‌مانند.

   اجرا:  node tools/build.mjs            (نوشتن)
          node tools/build.mjs --check    (فقط بررسی هم‌خوانی؛ ۱ = ناهم‌خوان)
   ═══════════════════════════════════════════════════════════════ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = path.join(ROOT, 'web');
const WORKER = path.join(ROOT, 'src', 'worker.js');
const CHECK = process.argv.includes('--check');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

/* فایل‌هایی که در بسته نمی‌روند */
const SKIP = new Set(['.DS_Store', 'Thumbs.db']);

function walk(dir, base = '') {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const rel = base ? base + '/' + ent.name : ent.name;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(abs, rel));
    else if (ent.isFile()) out.push({ rel, abs, ext: path.extname(ent.name).toLowerCase() });
  }
  return out;
}

const files = walk(WEB).sort((a, b) => a.rel.localeCompare(b.rel));
if (!files.length) { console.error('no files in web/'); process.exit(1); }

/* فونت‌ها base64 می‌شوند (متن نیستند)؛ بقیه UTF-8 */
const assets = {};
let total = 0;
for (const f of files) {
  const type = MIME[f.ext] || 'application/octet-stream';
  if (f.ext === '.woff2' || f.ext === '.png' || f.ext === '.jpg' || f.ext === '.webp' || f.ext === '.ico') {
    const b64 = fs.readFileSync(f.abs).toString('base64');
    assets[f.rel] = { t: type, b: b64, e: 'b64' };
    total += b64.length;
  } else {
    const txt = fs.readFileSync(f.abs, 'utf8');
    assets[f.rel] = { t: type, b: txt };
    total += txt.length;
  }
}

const NEW = 'const APP_ASSETS = ' + JSON.stringify(assets) + ';';
const src = fs.readFileSync(WORKER, 'utf8');

/* پیدا کردنِ بازهٔ دستورِ APP_ASSETS (با در نظر گرفتنِ رشته‌ها) */
const start = src.indexOf('const APP_ASSETS = ');
if (start < 0) { console.error('APP_ASSETS not found in src/worker.js'); process.exit(1); }
let j = src.indexOf('=', start) + 1;
let d = 0, dbr = 0;
for (; j < src.length; j++) {
  const c = src[j];
  if (c === '"' || c === "'") { const q = c; j++; while (j < src.length) { if (src[j] === '\\') { j += 2; continue; } if (src[j] === q) break; j++; } continue; }
  if (c === '{') d++; else if (c === '}') d--;
  else if (c === '[') dbr++; else if (c === ']') dbr--;
  else if (c === ';' && d === 0 && dbr === 0) break;
}
const OLD = src.slice(start, j + 1);
const same = OLD === NEW;

if (CHECK) {
  if (same) { console.log('✔ APP_ASSETS up to date (' + files.length + ' files, ' + total + ' chars)'); process.exit(0); }
  console.error('✘ APP_ASSETS is stale — run: node tools/build.mjs');
  process.exit(1);
}
if (same) { console.log('✓ already up to date (' + files.length + ' files)'); process.exit(0); }

fs.writeFileSync(WORKER, src.slice(0, start) + NEW + src.slice(j + 1), 'utf8');
console.log('✔ APP_ASSETS rebuilt: ' + files.length + ' files, ' + total + ' chars');
for (const f of files) console.log('   ' + f.rel.padEnd(20) + ' ' + String(assets[f.rel].b.length).padStart(9) + '  ' + assets[f.rel].t);
