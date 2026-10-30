/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 04-utils
   ابزارهای عمومی: esc/num/time/بودجهٔ تلگرام/شبکه
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ ابزارهای عمومی ═══════════════════ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const J = (o) => JSON.stringify(o);

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function num(n) {
  return Number(n || 0).toLocaleString('en-US');
}

// تخمین تعداد توکن (ترکیب فارسی/انگلیسی — تقریب محافظه‌کارانه)
// فرمول: طول متن ÷ CFG.TOK_DIV + CFG.TOK_PAD — برای فارسی حدود ۳ کاراکتر هر توکن
// متن قابل‌شمارش یک پیام (محتوای چندبخشی عکس ← فقط بخش متنی شمرده می‌شود)
function msgText(c) {
  if (Array.isArray(c)) return c.map((p) => String((p && p.text) || '')).join(' ');
  return String(c ?? '');
}
function est(s) {
  return Math.ceil(msgText(s).length / CFG.TOK_DIV) + CFG.TOK_PAD;
}

function hash32(str) {
  let h = 5381;
  const s = String(str);
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/* 🔒 v5.4: مقایسهٔ ثابت‌زمان رمز/سکرت. «!==» معمولی در نخستین بایت
   متفاوت برمی‌گردد و از اختلاف زمان پاسخ می‌توان بایت‌به‌بایت حدس زد؛
   این تابع همیشه روی کل طول رشته کار می‌کند. طول‌های متفاوت هم پوشش
   داده می‌شوند تا «طول حدس» لو نرود. */
function safeEq(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  if (x.length > 4096 || y.length > 4096) return false; // سقف: ورودی چندمگابایتی حلقه را کند نکند
  let d = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) d |= (x.charCodeAt(i % (x.length || 1)) || 0) ^ (y.charCodeAt(i % (y.length || 1)) || 0);
  return d === 0;
}

/* ── سرویس‌های کاستوم (OpenAI-compatible): شناسه‌ها و ابزارها ── */
const PID_RE = /^p[0-9a-z]{8}$/;          // شناسه پروایدر: p + ۸ حرف base36
const CK_RE = /^p[0-9a-z]{8}:/;           // کلید مدل کاستوم: «pid:modelId»
function newPid(name, uid) {
  // هش تکی ممکن است کوتاه‌تر از ۸ کاراکتر باشد → دو نسخه را به هم میچسبانیم
  const raw = name + '|' + uid + '|' + Date.now() + '|' + Math.random();
  return 'p' + (hash32(raw) + hash32(raw + '#2')).slice(0, 8);
}
// کلید canonical مدل: مدل‌های کلادفلر = همان رشته '@cf/...' (بدون تغییر)،
// مدل‌های کاستوم = «pid:modelId» (modelId خودش ممکن است ':' یا '/' داشته باشد؛
// پیشوند pid ثابت‌طول است پس برش با slice(10) همیشه درست است)
function parseModelKey(k) {
  const s = String(k || '');
  if (s.startsWith('@cf/')) return { prov: 'cf', pid: null, id: s };
  if (CK_RE.test(s)) return { prov: 'p', pid: s.slice(0, 9), id: s.slice(10) };
  return { prov: 'legacy', pid: null, id: s };
}
// ماسک کلید API برای همه سطوح نمایشی
function maskKey(k) {
  const s = String(k || '');
  return s.length > 12 ? s.slice(0, 4) + '…' + s.slice(-4) + ' (' + s.length + ')' : '••••••';
}
// پاک‌سازی هر رشته از کلید قبل از ورود به چت/لاگ
function scrubSecret(s, key) {
  let o = String(s ?? '');
  if (key && key.length > 3) o = o.split(key).join('•••');
  o = o.replace(/Bearer\s+\S+/gi, 'Bearer •••');
  return o.slice(0, 300);
}
// نرمال‌سازی آدرس پایه: فقط طرح/برش‌های زائد؛ '/v1' بعداً اکتشاف میشود.
// دقت: به pathname آبجکت URL مقدار ندهید — خودش '/' بازمی‌گرداند؛ اینجا
// مسیر را رشته‌ای می‌بریم و با origin (که اسلش پایان ندارد) می‌چسبانیم.
function normBaseUrl(raw) {
  let s = String(raw || '').trim().replace(/^["'`]+|["'`]+$/g, '');
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || !u.hostname) return null;
  //charset واقعی میزبان: سرور محلی/IPv4/IPv6/DNS — هر چیز عجیب (مثل '!!') رد میشود
  const hostTest = u.hostname.replace(/^\[|\]$/g, '');
  if (!/^[a-zA-Z0-9.:_\-]+$/.test(hostTest)) return null;
  let path = u.pathname.replace(/\/+$/, '');
  path = path.replace(/\/(chat\/completions|completions|models)$/i, '');
  if (path.length > CFG.BASE_URL_MAX || /\s/.test(path)) return null;
  return u.origin + path; // هرگز با اسلش پایان
}
// یکسان‌سازی usage بین ارائه‌دهنده‌ها
function normUsage(u) {
  if (!u) return {};
  return {
    prompt_tokens: Number(u.prompt_tokens ?? u.input_tokens ?? 0) || 0,
    completion_tokens: Number(u.completion_tokens ?? u.output_tokens ?? 0) || 0,
  };
}

// تبدیل ارقام فارسی/عربی به انگلیسی
function normDigits(s) {
  return String(s || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

// تاریخ به وقت تهران (ایران ساعت تابستانی ندارد → ‎+03:30 ثابت)
/* یکسان‌سازی متن کامند: کاراکترهای نامرئی ابتدای پیام (RTL/LTR mark، BOM، ZWNJ)
   حذف می‌شوند و اسلش‌های غیرمعمول کیبوردهای فارسی/موبایل (／  ∕) به اسلش
   معمولی تبدیل می‌شوند — تا «/new» از هر کیبوردی به‌عنوان کامند شناخته شود. */
const CMD_LEAD_INVIS = /^[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF\s]+/;
function normCmd(s) {
  return String(s || '').replace(CMD_LEAD_INVIS, '').replace(/^[\uFF0F\u2044\u2215]/, '/');
}

function tehran(offsetMin = 0) {
  const d = new Date(Date.now() + offsetMin * 60000 + 210 * 60000);
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
    h: d.getUTCHours(), min: d.getUTCMinutes(), w: d.getUTCDay(),
    ymd: d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'),
  };
}

// تبدیل زمان تهران (y,m,d,h,min) به epoch میلی‌ثانیه
function tehranToEpoch(y, m, d, h, min) {
  return Date.UTC(y, m - 1, d, h, min, 0) - 210 * 60000;
}

async function fetchT(url, opt = {}, ms = 30000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...opt, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

/* 🔒 v5.4: خواندن پاسخ تا سقف بایت — از حافظهٔ ورکر محافظت می‌کند.
   اگر بدنه از سقف بزرگ‌تر بود null برمی‌گرداند (فراخوان «too_large» می‌دهد). */
async function readCapped(res, maxBytes) {
  const len = Number(res.headers.get('content-length') || 0);
  if (len && len > maxBytes) return null;
  if (!res.body || !res.body.getReader) {
    const t = await res.text();
    return t.length > maxBytes ? null : t;
  }
  const rd = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const r = await rd.read();
    if (r.done) break;
    got += r.value.length;
    if (got > maxBytes) { try { await rd.cancel(); } catch {} return null; }
    chunks.push(r.value);
  }
  const all = new Uint8Array(got);
  let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.length; }
  return new TextDecoder('utf-8').decode(all);
}

/* ── بودجه فراخوانی: سقف تعداد درخواست‌های تلگرام در پردازش هر آپدیت ── */
function newBudget(max = CFG.TG_BUDGET) {
  return { n: 0, max, ok() { return this.n < this.max; }, take() { this.n++; } };
}
