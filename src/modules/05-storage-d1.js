/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 05-storage-d1
   لایهٔ ذخیره‌سازی D1: ensureDb + kv* + حافظهٔ بلندمدت
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ لایه حافظه (D1) ═══════════════════
   ساختار کلیدهای حافظه (برای درک/عیب‌یابی؛ دستی‌کاری‌شان لازم نیست):
   u:<id> تنظیمات کاربر · h:<scope> تاریخچه گفتگو · us:/ua: آمار روز/کل
   al لیست کاربران مجاز · aln اسم‌ها · cp:<id> حالت مقایسه · sv:<id>:<h> آرشیو
   rm:<h> یادآورها · pv:<pid> سرویس‌های کاستوم · pvr:<pid> نتیجه کاوش
   mc کش مدل‌های کلادفلر · mh:<h> نگاشت هش دکمه←مدل · lg خطاهای آخر · bi اطلاعات بات

   چرا D1؟ در پلن رایگان کلادفلر سقف نوشتن روزانهٔ KV فقط ۱٬۰۰۰ است و زود
   پر میشود؛ D1 در همان پلن ۱۰۰٬۰۰۰ سطر نوشتن در روز میدهد. جدول یکی است:
   kv(k TEXT PRIMARY KEY, v TEXT NOT NULL, exp INTEGER). Binding «DB»
   ضروری است — بدون آن ربات کار نمیکند. */
const DB_DDL = 'CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL, exp INTEGER)';
let _dbState = 0;     // ۰ = نامعلوم، ۱ = آماده، ۱- = خراب (بعد از DB_RETRY_MS دوباره تلاش میشود)
let _dbRetryAt = 0;   // چه زمانی بعد از آخرین خطا مجاز به تلاش دوباره هستیم

// آماده‌سازی یکبارهٔ جدول
async function ensureDb(env) {
  if (!env.DB) throw new Error(L(env, 'm139f00c'));
  if (_dbState === 1) return;
  /* قبلاً اولین خطا برای همیشه قفل بود («تا ری‌استارت ایزوله»)؛ یک خطای گذرا
     باعث میشد ربات تا چند دقیقه حالت بی‌حافظه بگیرد: پیام‌ها جواب میدادند ولی
     هیچ‌چیز ذخیره نمیشد. حالا بعد از چند ثانیه دوباره تلاش میکنیم. */
  if (_dbState === -1 && Date.now() < _dbRetryAt) throw new Error(L(env, 'm0tu90xp'));
  try {
    await env.DB.prepare(DB_DDL).run();
    _dbState = 1;
  } catch (e) {
    _dbState = -1;
    _dbRetryAt = Date.now() + CFG.DB_RETRY_MS;
    console.error('[db_init] ' + ((e && e.message) || e));
    throw e;
  }
}

async function kvGet(env, key, def = null) {
  try {
    await ensureDb(env);
    const r = await env.DB.prepare('SELECT v, exp FROM kv WHERE k = ?').bind(key).first();
    if (!r) return def;
    if (r.exp > 0 && r.exp < Date.now()) { // D1 انقضای خودکار ندارد؛ همین‌جا پاکش می‌کنیم
      await env.DB.prepare('DELETE FROM kv WHERE k = ?').bind(key).run();
      return def;
    }
    return JSON.parse(r.v);
  } catch { return def; }
}

async function kvPut(env, key, val, ttlSec = 0) {
  try {
    await ensureDb(env);
    const text = J(val);
    const exp = ttlSec ? Date.now() + Math.max(60, ttlSec) * 1000 : 0;
    await env.DB.prepare('INSERT INTO kv (k,v,exp) VALUES (?,?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v, exp=excluded.exp')
      .bind(key, text, exp).run();
  } catch (e) { await logErr(env, 'db_put:' + key, e); }
}

async function kvDel(env, key) {
  try {
    await ensureDb(env);
    await env.DB.prepare('DELETE FROM kv WHERE k = ?').bind(key).run();
  } catch (e) {
    // قبلاً بی‌صدا بلعیده میشد؛ باطل‌شدن توکن/یادآور/سرویس اگر شکست بخورد باید دیده شود
    await logErr(env, 'db_del:' + key, e);
  }
}

// فهرست کلیدها با یک پیشوند؛ منقضی‌ها رد میشوند. مقایسهٔ بازه‌ای
// (k ≥ prefix و k < prefix+U+FFFF) جای LIKE را میگیرد تا کاراکترهای ویژهٔ
// LIKE (٪ و _) دردسر نسازند.
async function kvList(env, prefix) {
  const out = [];
  const p = prefix || '';
  try {
    await ensureDb(env);
    const r = await env.DB.prepare('SELECT k FROM kv WHERE k >= ? AND k < ? AND (exp = 0 OR exp > ?)')
      .bind(p, p + '\uFFFF', Date.now()).all();
    for (const row of (r.results || [])) out.push(row.k);
  } catch {}
  return out;
}

/* ── لاگ خطا (حلقه‌ای، آخرین ۴۰ مورد) ──
   عمداً از kvPut استفاده نمیکند تا اگر خودِ نوشتن خطا داد حلقهٔ بی‌پایان نسازد. */
async function logErr(env, place, e) {
  const msg = String((e && (e.message || e)) || '?').slice(0, 300);
  console.error('[' + place + '] ' + msg);
  try {
    const logs = await kvGet(env, 'lg', []);
    logs.unshift({ t: Date.now(), p: String(place).slice(0, 60), m: msg });
    const text = J(logs.slice(0, CFG.ERR_LOG_MAX));
    await ensureDb(env);
    await env.DB.prepare('INSERT INTO kv (k,v,exp) VALUES (?,?,0) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind('lg', text).run();
  } catch {}
}

/* ═══════════ مخزن سرویس‌های کاستوم (OpenAI-compatible) ═══════════
   هر سرویس یک کلید 'pv:<pid>' با رکورد کامل؛ بدون ایندکس (افزودن‌های
   همزمان با شناسه مستقل مسابقه ندارند). کش ۶۰ ثانیه‌ای درون-ایزوله‌ای
   فقط برای مقادیر موجود؛ رکورد تازه‌ساخته‌شده همیشه تازه خوانده میشود. */
const _pv = new Map(); // pid → { rec, ts }
const _pvKi = new Map(); // pid → شمارنده چرخش کلید (v4.10 — چند کلید برای هر سرویس)
// همه کلیدهای معتبر یک رکورد سرویس: آرایهٔ keys (جدید) + کلید تک‌رشته‌ای key (قدیم)
function provKeysOf(rec) {
  if (!rec) return [];
  const out = [];
  if (Array.isArray(rec.keys)) for (const k of rec.keys) if (typeof k === 'string' && k.trim()) out.push(k.trim());
  if (typeof rec.key === 'string' && rec.key.trim() && out.indexOf(rec.key.trim()) < 0) out.push(rec.key.trim());
  return out;
}
// نمایش فشرده و ماسک‌شدهٔ کلیدها — هرگز کلید کامل نمایش/لاگ نمیشود
function pKeysTxt(env, keys) {
  if (!keys.length) return '—';
  if (keys.length === 1) return '<code>' + esc(maskKey(keys[0])) + '</code>';
  return L(env, 'm0k4q31x', esc(maskKey(keys[0])), num(keys.length - 1));
}

async function provGet(env, pid) {
  if (!PID_RE.test(String(pid || ''))) return null;
  const c = _pv.get(pid);
  if (c && Date.now() - c.ts < CFG.PROV_CACHE_MS) return c.rec;
  const rec = await kvGet(env, 'pv:' + pid, null);
  if (rec) _pv.set(pid, { rec, ts: Date.now() });
  return rec;
}
async function provPut(env, rec) {
  rec.ut = Date.now();
  await kvPut(env, 'pv:' + rec.pid, rec);
  _pv.delete(rec.pid);
}
async function provAll(env) {
  const out = [];
  for (const k of await kvList(env, 'pv:')) {
    if (!/^pv:p[0-9a-z]{8}$/.test(k)) continue; // 'pvr:' پیشوند ندارد ولی احتیاطاً
    const rec = await provGet(env, k.slice(3));
    if (rec) out.push(rec);
  }
  out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return out;
}

// نرمال‌سازی کلید مدل روی هر خوانش (مهاجرت تنبل): مقدار معتبر برگردانده
// میشود؛ هر چیز ناشناخته/حذف‌شده → مدل پیش‌فرض کلادفلر
async function canonModel(env, v) {
  const p = parseModelKey(v);
  if (p.prov === 'cf') return { key: p.id, changed: false };
  if (p.prov === 'p') {
    const rec = await provGet(env, p.pid);
    if (rec && (rec.models || []).some((m) => m.id === p.id)) return { key: v, changed: false };
  }
  return { key: SETTINGS_DEFAULT.model, changed: true };
}

// تبدیل یک‌جا: کلید canonical ← شیء کامل مدل (برای فراخوانی، نمایش و کانتکست).
// اگر سرویس یا مدل حذف شده باشد، همان‌جا به مدل پیش‌فرض کلادفلر می‌افتد.
async function resolveModel(env, key) {
  const p = parseModelKey(key);
  if (p.prov !== 'p') {
    const id = p.prov === 'cf' ? p.id : SETTINGS_DEFAULT.model;
    const f = CF_KNOWN.find((m) => m.id === id);
    return { key: id, prov: 'cf', pid: null, id, name: modelName(env, id), ctx: f ? f.ctx : 32000, free: true, provName: 'Workers AI', vision: VISION_RE.test(id) };
  }
  const rec = await provGet(env, p.pid);
  if (!rec) return await resolveModel(env, SETTINGS_DEFAULT.model);
  const me = (rec.models || []).find((m) => m.id === p.id);
  // کنترل عضویت: مدل حذف‌شده هم مثل سرویس حذف‌شده به پیش‌فرض می‌افتد
  // (تا دکمه‌های قدیمی نتوانند مدل مرده را فعال کنند)
  if (!me) return await resolveModel(env, SETTINGS_DEFAULT.model);
  // اگر خود مدل عکس‌فهم نباشد ولی خواهرش (x-vl) باشد، برای پیام عکس همان فرستاده می‌شود
  const mine = String(me.id).replace(VISION_ID_SUFFIX, '');
  const sib = (rec.models || []).find((x) => x.id !== me.id && String(x.id).replace(VISION_ID_SUFFIX, '') === mine);
  const vision = !!(me.vision || (sib && sib.vision));
  /* انتخاب کلید این درخواست: سرویس می‌تواند تا CFG.KEYS_PER_PROVIDER کلید داشته باشد
     (v4.10). چرخش با شمارندهٔ درون‌حافظه‌ای انجام میشود — سقف نرخ یک کلیدِ
     تنها را می‌شکند و چند کلید روی هم سرویس را نرم می‌کنند. کلید قدیمیِ
     تک‌رشته‌ای (rec.key) سر جای خودش می‌ماند و همه‌چیز بدون مهاجرت کار میکند. */
  const keys = provKeysOf(rec);
  const ki = keys.length ? (_pvKi.get(p.pid) || 0) % keys.length : 0;
  if (keys.length) _pvKi.set(p.pid, (_pvKi.get(p.pid) || 0) + 1);
  return {
    key: p.pid + ':' + p.id, prov: 'p', pid: p.pid, id: p.id,
    name: me.name || p.id.split('/').pop(), ctx: me.ctx || CFG.DEFAULT_CTX, free: false,
    provName: rec.name, baseUrl: rec.base, apiKey: keys[ki] || rec.key || '',
    keyCount: keys.length,
    vision,
    visionId: (vision && !me.vision && sib) ? sib.id : null,
  };
}

// لیست ادغامی انتخاب مدل: کلادفلر (کش mc) + مدل‌های همه سرویس‌ها
async function getAllModelEntries(env) {
  const cfs = (await getModels(env)).map((m) => ({
    key: m.id, prov: 'cf', pid: null, id: m.id, name: modelName(env, m.id), ctx: m.ctx, free: true, provName: 'Workers AI',
    vision: VISION_RE.test(m.id),
  }));
  const custom = [];
  for (const rec of await provAll(env)) {
    const fam = new Set();
    for (const me of rec.models || []) {
      // مدلهای همخانواده («x-vl» و «x») در منو یکی میشوند؛ آیدی خواهرِ ویژن
      // جدا نگه داشته میشود تا هنگام پیام عکس همان فرستاده شود.
      const base = String(me.id).replace(VISION_ID_SUFFIX, '');
      if (fam.has(base)) continue;
      fam.add(base);
      const sib = (rec.models || []).find((x) => x.id !== me.id && String(x.id).replace(VISION_ID_SUFFIX, '') === base);
      const vision = !!(me.vision || (sib && sib.vision));
      custom.push({
        key: rec.pid + ':' + me.id, prov: 'p', pid: rec.pid, id: me.id,
        name: me.name || me.id.split('/').pop(), ctx: me.ctx || CFG.DEFAULT_CTX, free: false, provName: rec.name,
        vision, visionId: (vision && !me.vision && sib) ? sib.id : null,
      });
    }
  }
  return [...cfs, ...custom];
}

// برچسب نمایشی «مدل · سرویس» برای فوتر و پنل‌ها
async function entryLabel(env, key) {
  const e = await resolveModel(env, key);
  return e.name + ' · ' + (e.prov === 'cf' ? '☁️ Workers AI' : '🔌 ' + e.provName);
}
