/* ═══════════════════════════════════════════════════════════════
   scripts/split-worker.mjs — ابزارِ یک‌بارهٔ مهاجرت
   src/worker.js (تک‌فایلِ ۷۶۰۰خطی) را به ماژول‌های خوانا می‌شکند:
     src/modules/*.js          ← سورسِ انسانی (به‌ترتیب)
     src/generated/app-assets.js ← دارایی‌های وبِ بسته‌بندی‌شده
   مرزها = بنرهای بخشِ همان فایل (تکه‌های پیوسته؛ هیچ کدی جابه‌جا نمی‌شود).
   ═══════════════════════════════════════════════════════════════ */
import fs from 'fs';
import path from 'path';

const SRC = 'src/worker.js';
const MOD = 'src/modules';
const GEN = 'src/generated';

/* مرزهای ماژول = شمارهٔ خطِ بنر (۱-based) → نام فایل.
   همه پیوسته‌اند، پس ترتیبِ سراسریِ کد دست‌نخورده می‌ماند. */
const BOUNDS = [
  [1, '00-header.js', 'سرصفحهٔ راهنمای نصب (فقط کامنت)'],
  [132, '01-core-constants.js', 'VERSION + مدل‌های آشنا + رجکس‌های ویژن'],
  [199, '02-i18n-runtime.js', 'کاتالوگ CAT و زمان‌اجرای i18n: ownerName/fillOwn/effLang/L/pick'],
  [343, '03-settings.js', 'CFG + SETTINGS_DEFAULT + PERSONAS + پرامپت‌های سیستمی (fa/en)'],
  [510, '04-utils.js', 'ابزارهای عمومی: esc/num/time/بودجهٔ تلگرام/شبکه'],
  [679, '05-storage-d1.js', 'لایهٔ ذخیره‌سازی D1: ensureDb + kv* + حافظهٔ بلندمدت'],
  [901, '06-vision.js', 'عکس و مدل‌های عکس‌فهم (ویژن) 👁'],
  [1004, '07-telegram.js', 'لایهٔ تلگرام: tg/sendMsg/editMsg/answerCb/تایپینگ'],
  [1090, '08-llm.js', 'موتور مدل‌ها: Workers AI + سرویس سازگار با OpenAI + استریم/فالبک + تاریخچه'],
  [1560, '09-link-reader.js', 'خوانندهٔ لینک 🌐 (Jina/مستقیم + یوتیوب)'],
  [1761, '10-voice.js', 'صدای گوگل: STT/TTS/فهم ویس/فهم PDF'],
  [2153, '11-tools.js', 'ابزارها: سرچ Tavily، آب‌وهوا، کریپتو، ماشین‌حساب، خلاصه‌ساز'],
  [2361, '12-reminders.js', 'تودولیست ✅ + تسک‌های زمان‌بندی‌شده با AI ⏳'],
  [2408, '13-circuit-breaker.js', 'قطع‌کنندهٔ خودکار سرویس‌های خراب 🔌'],
  [2604, '14-users.js', 'دسترسی (allow-list) + سهمیه/نقش کاربران + آمار مصرف 👥'],
  [2714, '15-markdown-typing.js', 'تبدیل Markdown→HTML تلگرام + چرخهٔ تایپینگ ⌨️'],
  [2798, '16-chat-core.js', 'اجرای چت کامل — هستهٔ ربات 💬'],
  [3080, '17-menus.js', 'منوها: مدل 🤖 / اصلی 🏠 / تنظیمات ⚙️ / سلامت 🩺 / کاربران 👥'],
  [3720, '18-export-backup.js', 'خروجی گفتگو 📤 + بکاپ هفتگی 🗄'],
  [3990, '19-dashboard.js', 'وب‌داشبورد 🌐 + API پشت داشبورد'],
  [4137, '20-cron.js', 'خلاصهٔ صبحگاهی + Cron (یادآور/هشدار مدل جدید) ⏰'],
  [4362, '21-webapp-api.js', 'لایهٔ API اپ اندروید + دارایی‌های UI (APP_ASSETS در همین‌جاست)'],
  [5759, '22-handlers.js', 'نقطهٔ ورود Worker + dispatch + callback‌ها + پیام‌ها/دستورات'],
  [7090, '23-reminder-intent.js', 'تشخیص قصد یادآور از متن آزاد 🗣'],
  [7544, '24-inline-mode.js', 'حالت اینلاین 💬'],
];

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.replace(/\r\n/g, '\n').split('\n');
console.log('src/worker.js → ' + lines.length + ' خط');

/* ── ۱) APP_ASSETS: باید تک‌خطی باشد ── */
const aaIdx = lines.findIndex((l) => l.startsWith('const APP_ASSETS = '));
if (aaIdx < 0) throw new Error('APP_ASSETS پیدا نشد');
if (!lines[aaIdx].trimEnd().endsWith(';')) throw new Error('APP_ASSETS تک‌خطی نیست');
const appAssetsLine = lines[aaIdx];
console.log('APP_ASSETS خط ' + (aaIdx + 1) + ' — ' + appAssetsLine.length + ' کاراکتر');

/* ── ۲) اعتبارسنجیِ بنرها (به‌جز ماژول ۰۰ که سرصفحه است) ── */
for (const [ln, name, desc] of BOUNDS) {
  if (name === '00-header.js') { const t0 = (lines[ln - 1] || '').trim(); if (!t0.startsWith('/*')) throw new Error('سرصفحهٔ فایل در خط ' + ln + ' نیست'); continue; }
  const t = (lines[ln - 1] || '').trim();
  if (!/^\/\*\s*═/.test(t)) throw new Error('بنر در خط ' + ln + ' نیست (' + name + '): ' + t.slice(0, 50));
}
void 0;

/* ── ۳) نوشتنِ دارایی‌های وب ── */
fs.mkdirSync(GEN, { recursive: true });
fs.writeFileSync(path.join(GEN, 'app-assets.js'),
  '/* ═══ GENERATED — دستی ویرایش نکنید ═══\n' +
  '   ساخته‌شده از web/ توسط `npm run build:assets`.\n' +
  '   این خط در build داخلِ worker.js قرار می‌گیرد. */\n' +
  appAssetsLine + '\n', 'utf8');

/* ── ۴) جای‌گذاریِ نشانه (شمارهٔ خط‌ها دست‌نخورده می‌ماند) ── */
lines[aaIdx] = '/* APP_ASSETS → src/generated/app-assets.js (در build برمی‌گردد) */';

/* ── ۵) برشِ ماژول‌ها ── */
fs.mkdirSync(MOD, { recursive: true });
const manifest = [];
for (let i = 0; i < BOUNDS.length; i++) {
  const start = BOUNDS[i][0];
  const end = i + 1 < BOUNDS.length ? BOUNDS[i + 1][0] - 1 : lines.length;
  const body = lines.slice(start - 1, end).join('\n').replace(/\s+$/, '\n');
  /* ماژول ۰۰ سرصفحهٔ خودِ فایل است — هدر تازه نمی‌گیرد */
  const header = BOUNDS[i][1] === '00-header.js' ? '' :
    '/* ═══════════════════════════════════════════════════════════════\n' +
    '   behrad-ai — ' + BOUNDS[i][1].replace(/\.js$/, '') + '\n' +
    '   ' + BOUNDS[i][2] + '\n' +
    '   ─────────────────────────────────────────────────────────────\n' +
    '   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ\n' +
    '   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ\n' +
    '   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.\n' +
    '   ═══════════════════════════════════════════════════════════════ */\n';
  fs.writeFileSync(path.join(MOD, BOUNDS[i][1]), header + body, 'utf8');
  manifest.push(BOUNDS[i][1]);
  console.log('  ' + BOUNDS[i][1].padEnd(26) + ' خط ' + start + '..' + end + '  (' + (end - start + 1) + ')');
}
fs.writeFileSync(path.join(MOD, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('ماژول‌ها: ' + manifest.length);
