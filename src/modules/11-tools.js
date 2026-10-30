/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 11-tools
   ابزارها: سرچ Tavily، آب‌وهوا، کریپتو، ماشین‌حساب، خلاصه‌ساز
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v4.5: حافظه بلندمدت، سرچ Tavily، ابزارها، ویس ═══════════════════
   Secret جدید: SEARCH_API_KEY (کلید Tavily، از نوع Secret).
   داک مرجع: Tavily POST https://api.tavily.com/search با هدر Authorization: Bearer <key>،
   Whisper ورودی {audio:[bytes]}، MeloTTS ورودی {prompt, lang}،
   Open-Meteo GET بدون کلید https://api.open-meteo.com/v1/forecast. */

// ── حافظه بلندمدت mem:<uid> = [{id, t, ts}] ──
async function memGet(env, uid) {
  return await kvGet(env, 'mem:' + uid, []);
}
async function memPut(env, uid, arr) {
  if (arr.length > CFG.MEM_MAX) arr = arr.slice(-CFG.MEM_MAX);
  await kvPut(env, 'mem:' + uid, arr);
}
async function memAdd(env, uid, text, tag) {
  const t = String(text || '').trim().slice(0, 300);
  if (!t) return false;
  const tg = String(tag || '').trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, CFG.MEM_TAG_MAX);
  const arr = await memGet(env, uid);
  if (arr.some((x) => x.t === t || (t.length > 12 && String(x.t || '').includes(t)) || (String(x.t || '').length > 12 && t.includes(String(x.t))))) return false;
  const item = { id: hash32(t + Date.now()), t, ts: Date.now() };
  if (tg) item.tag = tg;
  arr.push(item);
  await memPut(env, uid, arr);
  return true;
}
async function memDel(env, uid, id) {
  const arr = (await memGet(env, uid)).filter((x) => x.id !== id);
  await memPut(env, uid, arr);
}
/* ویرایش متن/برچسب یک خاطره با شناسه — برای منوی مدیریت */
async function memEdit(env, uid, id, text, tag) {
  const arr = await memGet(env, uid);
  const it = arr.find((x) => x.id === id);
  if (!it) return false;
  const t = String(text || '').trim().slice(0, 300);
  if (!t) return false;
  it.t = t;
  const tg = String(tag || '').trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, CFG.MEM_TAG_MAX);
  if (tg) it.tag = tg; else delete it.tag;
  it.ts = Date.now();
  await memPut(env, uid, arr);
  return true;
}
async function memText(env, uid) {
  const arr = await memGet(env, uid);
  if (!arr.length) return '';
  return arr.map((x) => '- ' + (x.tag ? '[' + x.tag + '] ' : '') + x.t).join('\n');
}

/* 🔎 جستجوی حافظه — رتبه‌بندی سادهٔ کلمه‌ای (بدون embedding).
   چرا این و نه حافظهٔ برداری: با سقف ۵۰ خاطره، تطبیق کلمه‌ای + وزن تازگی
   دقیق‌تر و بی‌هزینه‌تر از یک پایگاه برداری است و هیچ کلید/سرویس اضافه نمیخواهد. */
function memScore(item, words, now) {
  const t = String((item && item.t) || '').toLowerCase();
  const tg = String((item && item.tag) || '').toLowerCase();
  let s = 0;
  for (const w of words) {
    if (!w) continue;
    if (tg.indexOf(w) >= 0) s += 3;
    if (t.indexOf(w) >= 0) s += 2;
  }
  /* تازگی: ۳۰ روز = بدون امتیاز، تازه‌تر کمی بیشتر */
  const age = now - (item && item.ts ? item.ts : 0);
  if (age < 30 * 86400000) s += 1 - age / (30 * 86400000);
  return s;
}

/* کلمات قابل جستجو از متن فارسی/انگلیسی — علائم حذف، کوتاه‌ها رد */
function memWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 40);
}

/* خاطره‌های مرتبط با متن کاربر — برای تزریق هوشمند به پرامپت.
   اگر هیچ‌کدام مرتبط نبود، خروجی خالی است تا توکن بی‌دلیل سوزانده نشود. */
async function memRelevant(env, uid, query) {
  try {
    const arr = await memGet(env, uid);
    if (!arr.length) return [];
    const words = memWords(query);
    if (!words.length) return [];
    const now = Date.now();
    const scored = arr
      .map((x) => ({ x, s: memScore(x, words, now) }))
      .filter((o) => o.s > 1)
      .sort((a, b) => b.s - a.s)
      .slice(0, CFG.MEM_INJECT_N)
      .map((o) => o.x);
    return scored;
  } catch { return []; }
}

/* جستجوی دستی حافظه (/memfind) — همان رتبه‌بندی، نمایش با شماره */
async function memSearch(env, uid, query) {
  const arr = await memGet(env, uid);
  const words = memWords(query);
  if (!words.length) return [];
  const now = Date.now();
  return arr
    .map((x) => ({ x, s: memScore(x, words, now) }))
    .filter((o) => o.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, CFG.MEM_SEARCH_N)
    .map((o) => o.x);
}
// استخراج خودکار: هر MEM_EXTRACT_EVERY پیام کاربر، با مدل ارزان CF
async function maybeExtractMemory(env, uid, scope, settings) {
  try {
    if (settings && settings.memAuto === false) return;
    const h = await histGet(env, scope);
    const userCount = h.msgs.filter((m) => m.role === 'user').length;
    if (!userCount || userCount % CFG.MEM_EXTRACT_EVERY !== 0) return;
    const recent = h.msgs.slice(-10).map((m) => (m.role === 'user' ? L(env, 'm1g0tw8h') : L(env, 'm1phc68b')) + String(m.content || '').slice(0, 600)).join('\n');
    if (!recent.trim()) return;
    const prompt = [
      { role: 'system', content: L(env, 'm14uzdrv') },
      { role: 'user', content: recent },
    ];
    let out = '';
    try {
      const r = await aiChatCf(env, CF_FALLBACK_MODEL, prompt, { temperature: 0.2, maxTokens: 400 });
      out = String((r && r.text) || '');
    } catch { return; }
    if (!out.trim() || /^\s*NONE\s*$/i.test(out.trim())) return;
    for (const line of out.split('\n').map((x) => x.replace(/^[-•\d.)\s]+/, '').trim()).filter(Boolean).slice(0, 10)) {
      if (/^none$/i.test(line)) continue;
      await memAdd(env, uid, line);
    }
  } catch (e) { await logErr(env, 'mem_extract', e); }
}

/* ═══════════════════ v5.4: خلاصه‌ساز هوشمند 📝 ═══════════════════
   /sum روی ریپلای، روی متن ارسالی، یا روی خروجی خواندن لینک/PDF.
   متن کوتاه = یک فراخوانی؛ متن بلند = map-reduce (تکه‌تکه خلاصه، بعد جمع‌بندی)
   تا از سقف کانتکست مدل رد نشود. */

const SUM_SYS =
  'تو یک خلاصه‌ساز حرفه‌ای فارسی هستی. متن را دقیق بخوان و فقط نکات مهم را ' +
  'با ساختار روشن بده: یک خلاصهٔ سه‌خطی، بعد فهرست نکته‌های کلیدی (حداکثر ۸ مورد)، ' +
  'بعد اگر بود «عددها و تاریخ‌ها» و «کارهای قابل‌اقدام». از حاشیه‌روی پرهیز کن؛ ' +
  'اگر متن بی‌ربط یا خالی بود همان را صادقانه بگو.';

/* EN */
const SUM_SYS_EN = 'You are a professional summarizer. Read the text carefully and give only the important points ' +
  'in a clear structure: a three-line summary, then a list of key points (at most 8), ' +
  'then, if present, "Numbers and dates" and "Action items". Avoid rambling; ' +
  'if the text is irrelevant or empty, say so honestly.';

/* تکه‌کردن متن روی مرزهای طبیعی (پاراگراف، بعد جمله) تا معنا نشکند */
function sumChunks(text, size) {
  const s = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!s) return [];
  const out = [];
  let rest = s;
  while (rest && out.length < CFG.SUM_MAX_PARTS) {
    if (rest.length <= size) { out.push(rest); break; }
    let cut = rest.lastIndexOf('\n\n', size);
    if (cut < size * 0.5) cut = rest.lastIndexOf('\n', size);
    if (cut < size * 0.5) cut = rest.lastIndexOf('. ', size);
    if (cut < size * 0.5) cut = rest.lastIndexOf(' ', size);
    if (cut < size * 0.5) cut = size;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return out.filter(Boolean);
}

/* خلاصهٔ یک متن؛ modelKey = مدل فعال کاربر. خروجی: { text, reduced, parts } */
async function summarizeText(env, modelKey, settings, text, opts = {}) {
  const src = String(text || '').trim();
  if (src.length < 40) return { text: src, reduced: false, parts: 0 };
  const chunks = sumChunks(src, CFG.SUM_CHUNK);
  /* 🔧 v5.4: sumChunks حداکثر SUM_MAX_PARTS تکه می‌دهد؛ متن بلندتر بی‌صدا
     بریده می‌شد و کاربر فکر می‌کرد همهٔ متن خلاصه شده. حالا گزارش می‌شود. */
  const covered = chunks.reduce((a, c) => a + c.length, 0);
  const cut = chunks.length >= CFG.SUM_MAX_PARTS && src.length - covered > CFG.SUM_CHUNK;
  const st = settings || SETTINGS_DEFAULT;
  /* کوتاه: یک فراخوانی معمولی */
  if (chunks.length <= 1) {
    const r = await aiChat(env, modelKey, [
      { role: 'system', content: buildSystemPrompt(env, st) + '\n\n' + pick(env, SUM_SYS, SUM_SYS_EN) },
      { role: 'user', content: L(env, 'm1khkbmk', opts.title ? ' («' + String(opts.title).slice(0, 80) + '»)' : '', src) },
    ], { temperature: 0.3, maxTokens: CFG.SUM_TOKENS, ...cbOff(st) });
    return { text: String(r.text || '').trim(), reduced: false, parts: 1, cut };
  }
  /* بلند: هر تکه خلاصه می‌شود (موازی، سقف ۸ تکه) بعد جمع‌بندی */
  const partials = await Promise.all(chunks.map((c, i) =>
    aiChatCf(env, CF_FALLBACK_MODEL, [
      { role: 'system', content: L(env, 'm1rqktif', pick(env, SUM_SYS, SUM_SYS_EN), num(i + 1), num(chunks.length)) },
      { role: 'user', content: c },
    ], { temperature: 0.2, maxTokens: 400 })
      .then((r) => String(r && r.text || '').trim())
      .catch(() => '')
  ));
  const joined = partials.filter(Boolean).map((x, i) => L(env, 'm12f27gh', num(i + 1), x)).join('\n\n');
  if (!joined) throw new Error(L(env, 'm0jtj6so'));
  const r2 = await aiChat(env, modelKey, [
    { role: 'system', content: L(env, 'm1i8f55l', buildSystemPrompt(env, st), pick(env, SUM_SYS, SUM_SYS_EN)) },
    { role: 'user', content: (opts.title ? L(env, 'm012u9x3', String(opts.title).slice(0, 120)) : '') + joined },
  ], { temperature: 0.3, maxTokens: CFG.SUM_TOKENS, ...cbOff(st) });
  return { text: String(r2.text || '').trim(), reduced: true, parts: chunks.length, cut };
}
