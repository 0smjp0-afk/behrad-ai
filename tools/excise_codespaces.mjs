#!/usr/bin/env node
/* ═══ حذف کامل قابلیت «کد اسپیس» (GitHub Codespaces) از سورس ربات ═══
   ورودی : worker-v5.4.0.js  (نسخهٔ ۵.۴ کامل)
   خروجی: src/worker.js      (نسخهٔ عمومی، بدون هیچ اثری از کد اسپیس)
   هر ناحیه با «امضا» چک می‌شود؛ اگر امضا نبود کار متوقف می‌شود.          */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.argv[3] || '.');
const SRC = path.join(ROOT, process.argv[2] || 'worker-v5.4.0.js');
const OUT = path.join(ROOT, process.argv[4] || 'src/worker.js');

const raw = fs.readFileSync(SRC, 'utf8');
/* نرمال‌سازی پایان خط: ورودی CRLF است، برای پردازش به LF تبدیل می‌شود
   و در پایان دوباره CRLF برگردانده می‌شود تا قالب سورس حفظ شود. */
const crlf = /\r\n/.test(raw);
const lines = raw.replace(/\r\n/g, '\n').split('\n');

/* ── ناحیه‌های حذف: [from, to, امضای لازم] (شمارهٔ خط ۱-پایه) ── */
const CUTS = [
  [7938, 7953, "case '/cs': {"],            // handleCommand: دستور /cs
  [7990, 8000, "case '/video': {"],         // handleCommand: دستور /video
  [7106, 7106, "'/video لینک"],              // راهنمای تلگرام: خط /video
  [7097, 7097, "'/cs — 💻"],                 // راهنمای تلگرام: خط /cs
  [6444, 6444, "env._pubUrl"],              // نشانی عمومی برای ایجنت کد اسپیس
  [5922, 5950, "case '/video': {"],         // اپ: دستور /video
  [5853, 5892, "case '/cs': {"],            // اپ: دستور /cs
  [5115, 5116, "/api/v1/agent/"],           // مسیر API ایجنت کد اسپیس
  [5091, 5091, "'- `/video <url>`"],         // راهنمای اپ: خط /video
  [5078, 5080, "'- `/cs download"],          // راهنمای اپ: سه خط /cs
  [3655, 4256, "کد اسپیس 💻 (GitHub Codespaces)"],  // کل بلوک کد اسپیس
  [372, 375, "دانلود ویدیو 🎬 /video"],     // تنظیمات VID_MAX_MB / VID_TIMEOUT_S
  [291, 306, "کد اسپیس (GitHub Codespaces) v5"],  // تنظیمات CS_*
  [55, 56, "GITHUB_TOKEN → فقط دستور"],     // توضیح GITHUB_TOKEN در راهنما
  [50, 50, "GITHUB_TOKEN"],                 // سطر GITHUB_TOKEN در جدول
];

/* ── بازگردانی‌های متنی (جایگزینی دقیق) ── */
const REPL = [
  /* خط خلاصهٔ راهنمای اپ: بخش «کد اسپیس» حذف می‌شود */
  [
    "  'وگرنه هر چی بپرسی همان جواب را می‌گیری؛ عکس 🖼، فایل 📄، PDF (تا ۶ مگابایت)، **کد اسپیس** 💻 (دانلود/نوشتن فایل و اجرای دستور لینوکس)، ماشین‌حساب 🧮 و لینک 🔗 هم بلدم.',",
    "  'وگرنه هر چی بپرسی همان جواب را می‌گیری؛ عکس 🖼، فایل 📄، PDF (تا ۶ مگابایت)، ماشین‌حساب 🧮 و لینک 🔗 هم بلدم.',",
  ],
  /* حذف اشارهٔ «yt-dlp» از کامنت‌ها (هیچ رشتهٔ مرتبطی در سورس نماند) */
  [
    "زیرنویس خودکار از timedtext گرفته می‌شود؛ بدون کلید و بدون yt-dlp. */",
    "زیرنویس خودکار از timedtext گرفته می‌شود؛ بدون کلید و بدون ابزار جانبی. */",
  ],
  [
    "/* 🎬 خواندن زیرنویس یوتیوب (بدون کلید و بدون yt-dlp).",
    "/* 🎬 خواندن زیرنویس یوتیوب (بدون کلید و بدون ابزار جانبی).",
  ],
];

/* ── ۱) اعتبارسنجی ناحیه‌ها ── */
let bad = 0;
for (const [a, b, sig] of CUTS) {
  const seg = lines.slice(a - 1, b).join('\n');
  if (!seg.includes(sig)) {
    console.error('✗ ناحیهٔ ' + a + '-' + b + ' امضای «' + sig + '» را ندارد:\n' + seg.slice(0, 220));
    bad++;
  }
}
if (bad) { console.error('\n⛔ ' + bad + ' ناحیه اعتبارسنجی نشد — کار متوقف شد.'); process.exit(1); }

/* ── ۲) حذف ناحیه‌ها (از انتها به ابتدا تا شمارهٔ خط‌ها جابه‌جا نشود) ── */
const kill = new Set();
for (const [a, b] of CUTS) for (let i = a; i <= b; i++) kill.add(i);

const out = [];
for (let i = 1; i <= lines.length; i++) {
  if (kill.has(i)) continue;
  out.push(lines[i - 1]);
}

/* ── ۳) جایگزینی‌های متنی ── */
let text = out.join('\n');
for (const [from, to] of REPL) {
  if (!text.includes(from)) { console.error('✗ الگوی جایگزینی پیدا نشد:\n' + from.slice(0, 180)); process.exit(1); }
  text = text.split(from).join(to);
}

/* ── ۴) کمک‌توابع یتیم: fmtBytes / fmtSize / mpName ── */
/* این‌ها داخل بلوک کد اسپیس تعریف شده بودند و با حذف آن بلوک از بین رفته‌اند؛
   فقط بررسی می‌کنیم که واقعاً نمانده باشند. */
for (const o of ['function fmtBytes(', 'const fmtSize = fmtBytes;', 'function mpName(']) {
  if (text.includes(o)) { console.error('✗ تابع یتیم باقی مانده: ' + o); process.exit(1); }
}

/* ── ۵) ناوردای قالب: خط خالیِ پشت‌سرهم نباید بماند ── */
text = text.replace(/\n{3,}/g, '\n\n');
const oLines = text.split('\n');
for (let i = 0; i < oLines.length - 1; i++) {
  if (oLines[i].trim() === '' && oLines[i + 1].trim() === '') {
    console.error('✗ خط خالیِ پشت‌سرهم در خط ' + (i + 1) + ' — قالب به هم خورده.');
    process.exit(1);
  }
}
/* خط آخر باید خالی نباشد و فایل باید با پایان‌خط تمام شود */
if (!text.endsWith('\n')) text += '\n';
if (crlf) text = text.replace(/\n/g, '\r\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, text, 'utf8');

const inCount = lines.length, outCount = text.replace(/\r\n/g, '\n').split('\n').length;
console.log('✔ سورس نوشته شد: ' + OUT);
console.log('  خطوط: ' + inCount + ' → ' + outCount + '  (−' + (inCount - outCount) + ')');
console.log('  حجم:  ' + (raw.length / 1024).toFixed(1) + 'KB → ' + (text.length / 1024).toFixed(1) + 'KB');
