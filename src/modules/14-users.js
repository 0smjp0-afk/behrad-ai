/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 14-users
   دسترسی (allow-list) + سهمیه/نقش کاربران + آمار مصرف 👥
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ دسترسی و وضعیت کاربران ═══════════════════ */

/* زبانِ ذخیره‌شدهٔ یک کاربر (برای پیام‌های پیش از احرازِ کامل) */
async function _langOf(env, uid) {
  try { const u = await kvGet(env, 'u:' + uid, {}); return (u.st && u.st.lang) === 'en' ? 'en' : null; } catch { return null; }
}
async function isAllowed(env, uid) {
  uid = String(uid);
  if (!env.ADMIN_ID) return false;
  if (String(env.ADMIN_ID).trim() === uid) return true;
  const al = await kvGet(env, 'al', []);
  return al.includes(uid);
}
async function isAdmin(env, uid) {
  return env.ADMIN_ID && String(env.ADMIN_ID).trim() === String(uid);
}

/* ═══════════════════ v5.4: سهمیه و نقش کاربران 👥 ═══════════════════
   هر کاربر در `lim:<uid>` می‌تواند سهمیهٔ روزانهٔ تصویر خودش را داشته باشد؛
   صفر = پیش‌فرض QUOTA_IMG_DEFAULT. مدیر همیشه بی‌سقف است. شمارنده‌ها در
   `uq:<uid>:<ymd>` روزانه ری‌ست می‌شوند (کلید جدا برای هر روز). */
async function userQuota(env, uid) {
  const q = await kvGet(env, 'lim:' + uid, null);
  return {
    img: q && typeof q.img === 'number' ? q.img : CFG.QUOTA_IMG_DEFAULT,
    tok: q && typeof q.tok === 'number' ? q.tok : CFG.QUOTA_DEFAULT,
  };
}
async function quotaTake(env, uid, kind) {
  if (await isAdmin(env, uid)) return null; // مدیر بی‌سقف
  const q = await userQuota(env, uid);
  const cap = kind === 'img' ? q.img : q.tok;
  if (!cap) return null;
  const t = tehran();
  const s = await kvGet(env, 'uq:' + uid + ':' + t.ymd, { img: 0, tok: 0 });
  if (kind === 'img' && (s.img || 0) >= cap) {
    return L(env, 'm1mtscmq', num(cap));
  }
  return null;
}
async function quotaBump(env, uid, kind) {
  try {
    const t = tehran();
    const k = 'uq:' + uid + ':' + t.ymd;
    const s = await kvGet(env, k, { img: 0, tok: 0 });
    if (kind === 'img') s.img = (s.img || 0) + 1;
    await kvPut(env, k, s, 2 * 86400);
  } catch (e) { await logErr(env, 'quota', e); }
}

// تنظیمات هر کاربر (ادغام با پیش‌فرض‌ها برای سازگاری نسخه‌ها)
async function getUser(env, uid) {
  const u = await kvGet(env, 'u:' + uid, {});
  u.st = { ...SETTINGS_DEFAULT, ...(u.st || {}) };
  /* زبانِ مؤثرِ این درخواست: تنظیماتِ همین کاربر (پیش‌فرض fa) */
  env._lang = u.st.lang === 'en' ? 'en' : 'fa';
  env._langSet = true;
  // مهاجرت تنبل: کلید مدل canonical میشود (ناشناخته/حذف‌شده → پیش‌فرض کلادفلر)
  u.st.model = (await canonModel(env, u.st.model)).key;
  delete u.st.provider; // فیلد قدیمی رد شده — سرویس از خود کلید قابل استخراج است
  /* مهاجرت v4.9 (یکبار): کاربران قدیمی voiceProv='cf' داشتند یعنی همیشه به
     Whisper/MeloTTS می‌رفت (MeloTTS فارسی ندارد → «تولید صوت کار نمی‌کرد» و
     Whisper ویس کوتاه را فینگلیش می‌خواند). اگر کلید گوگل ست باشد، یکبار
     روی گوگل می‌نشیند؛ کاربر هر وقت بخواهد از منوی صدا برمی‌گرداند. */
  if (u.st._m49 !== 1 && gemKey(env)) {
    u.st._m49 = 1;
    if (u.st.voiceProv === 'cf') u.st.voiceProv = 'google';
    if (u.st.sttModel === 'gemini-3.5-live-translate-preview') u.st.sttModel = 'gemini-3.5-transcribe';
    if (u.st.ttsModel === 'gemini-2.5-flash-preview-tts') u.st.ttsModel = 'gemini-3.8-flash-tts';
    u.st.imgGen = u.st.imgGen !== false;
    u.st.imgModel = u.st.imgModel || SETTINGS_DEFAULT.imgModel;
    await kvPut(env, 'u:' + uid, u);
  }
  if (!u.thread) u.thread = 'main';
  if (!Array.isArray(u.threads)) u.threads = [{ id: 'main', name: L(env, 'm095kqe9'), ts: Date.now() }];
  return u;
}
async function putUser(env, uid, u) {
  await kvPut(env, 'u:' + uid, u);
}
function curThread(u) {
  let t = u.threads.find((x) => x.id === u.thread);
  if (!t) { t = u.threads[0]; u.thread = t.id; }
  return t;
}
function scopeOf(chatId, u, isGroup) {
  return isGroup ? 'g' + chatId : 'c' + chatId + ':' + u.thread;
}

/* ═══════════════════ آمار و مصرف ═══════════════════ */
async function bumpUsage(env, uid, tin, tout) {
  const t = tehran();
  const k = 'us:' + uid;
  const s = await kvGet(env, k, { d: t.ymd, msgs: 0, tin: 0, tout: 0 });
  if (s.d !== t.ymd) { s.d = t.ymd; s.msgs = 0; s.tin = 0; s.tout = 0; }
  s.msgs++; s.tin += tin || 0; s.tout += tout || 0;
  await kvPut(env, k, s, 2 * 86400);
  return s;
}
async function checkDailyLimit(env, uid, settings) {
  if (!settings.dailyLimit) return null;
  const t = tehran();
  const s = await kvGet(env, 'us:' + uid, { d: t.ymd });
  if (s.d !== t.ymd) return null;
  if (s.tin + s.tout >= settings.dailyLimit * 1000) {
    return L(env, 'm09y06ue', num(settings.dailyLimit));
  }
  return null;
}
