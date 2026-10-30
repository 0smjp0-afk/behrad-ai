/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 10-voice
   صدای گوگل: STT/TTS/فهم ویس/فهم PDF
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v4.6: صدای گوگل (AI Studio) ═══════════════════
   Secret: GEMINI_API_KEY (aistudio.google.com/apikey).
   داک: ai.google.dev/gemini-api/docs/transcribe (مدل gemini-3.5-live-translate-preview،
   ۸۵+ زبان با تشخیص خودکار) و ai.google.dev/gemini-api/docs/speech-generation
   (مدل‌های TTS با ۳۰ وویس، فارسی fa پشتیبانی میشود). بدون کلید، خودکار به
   موتور کلادفلر برمیگردد. */
const GEM_TTS_MODELS = [
  { id: 'gemini-3.8-flash-tts', name: '3.8 Flash TTS (پیشنهادی)' },
  { id: 'gemini-3.5-live-translate-preview', name: 'Live TTS (سریع و طبیعی)' },
  { id: 'gemini-2.5-flash-preview-tts', name: 'Flash TTS (کلاسیک)' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Pro TTS (باکیفیت بالا)' },
];
const GEM_STT_MODELS = [
  { id: 'gemini-3.5-transcribe', name: 'Transcribe (پیشنهادی، تخصصی STT)' },
  { id: 'gemini-3.5-live-translate-preview', name: 'Live Translate (سریع، چندزبانه)' },
  { id: 'gemini-2.5-flash', name: 'Flash (فهم صوت عمومی)' },
];
// 🎨 مدل‌های تولید تصویر (اولی = پیش‌فرض SETTINGS_DEFAULT.imgModel)
const GEM_IMG_MODELS = [
  { id: 'gemini-3.1-flash-lite-image', name: 'Flash Lite Image (پیشنهادی، ارزان)' },
  { id: 'gemini-3.1-flash-image', name: 'Flash Image (کیفیت بالاتر)' },
];
/* مدل‌های خواندن سند (PDF) — فقط برای استخراج متن، نه چت. زنجیره‌ی فالبک دارد
   چون ممکن است مدلی روی کلید کاربر موجود یا مجاز نباشد. */
const GEM_DOC_MODELS = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
];
const GEM_VOICES = ['Zephyr','Puck','Charon','Kore','Fenrir','Leda','Orus','Aoede','Callirrhoe','Autonoe','Enceladus','Iapetus','Umbriel','Algieba','Despina','Erinome','Algenib','Rasalgethi','Laomedeia','Achernar','Alnilam','Schedar','Gacrux','Pulcherrima','Achird','Zubenelgenubi','Vindemiatrix','Sadachbia','Sadaltager','Sulafat'];
function gemKey(env) { return (env.GEMINI_API_KEY || '').trim(); }

/* ── ابزارهای اختیاریِ استقرار (رازِ FEATURES) ──
   ابزارهایی که مالکِ استقرار می‌تواند کامل خاموش کند تا خرج/سوءاستفاده کم شود.
   مثال: FEATURES="search,sum" فقط جستجو و خلاصه را روشن می‌گذارد؛
   FEATURES="none" همهٔ ابزارهای اختیاری را خاموش می‌کند؛ نبودنِ راز = همه روشن.
   کلیدهای تصویر/جستجو همچنان رازِ جدا می‌خواهند — این گیت مکملِ آن است. */
const FEATURE_KEYS = ['img', 'search', 'tts', 'stt', 'translate', 'sum', 'yt', 'crypto', 'weather'];
function featSet(env) {
  const raw = (env && env.FEATURES != null ? String(env.FEATURES) : '').trim().toLowerCase();
  if (!raw) return null;                        /* null = همه روشن */
  if (raw === 'none' || raw === 'off') return new Set();
  return new Set(raw.split(/[\s,;]+/).filter(Boolean));
}
function featOn(env, name) {
  const set = featSet(env);
  return !set || set.has(name);
}
/* آیا این ابزار برای این استقرار اصلاً هست؟ (کلید + گیت) */
function toolAvailable(env, name) {
  if (!featOn(env, name)) return false;
  if (name === 'img') return !!gemKey(env) || true;   /* تصویر با pollinations هم کار می‌کند */
  if (name === 'search') return !!(env.SEARCH_API_KEY || '').trim();
  if (name === 'tts' || name === 'stt' || name === 'translate') return !!gemKey(env);
  return true;
}
const GEM_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/* پرامپت فهم ویس: عمداً فارسی و با تأکید صریح روی «الفبای فارسی».
   دلیل فینگلیش‌شدن خروجی: پرامپت انگلیسی + مدلِ ترجمه (live-translate) باعث
   می‌شد متن فارسی را با حروف لاتین برگرداند. اینجا زبان خروجی قفل شده. */
const STT_SYS = 'تو فقط یک تبدیل‌کننده‌ی گفتار به متن هستی.\n' +
  '۱) زبان گفتار را تشخیص بده و عیناً با همان الفبا بنویس. اگر فارسی بود حتماً با ' +
  'حروف فارسی بنویس — هرگز فینگلیش/لاتین ننویس.\n' +
  '۲) فقط متن خالص گفتار را برگردان: بدون ترجمه، بدون توضیح، بدون نقل‌قول، ' +
  'بدون علامت‌گذاری اضافه.\n' +
  '۳) اعداد و اسامی را همان‌طور که شنیده می‌شوند بنویس.';

/* EN */
const STT_SYS_EN = 'You are only a speech-to-text transcriber.\n' +
  '1) Detect the spoken language and write it in exactly that script. If it is Persian, write it in Persian letters — never transliterate into Latin script.\n' +
  '2) Return only the plain spoken text: no translation, no explanation, no quotation marks, no extra punctuation.\n' +
  '3) Write numbers and names exactly as they are heard.';

// فهم ویس با گوگل: inline base64 (زیر ۲۰MB) روی generateContent — بدون Files API
async function geminiTranscribe(env, audioBytes, models, mime) {
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1mkkwk3'));
  const b64 = bufToB64(audioBytes);
  const chain = [];
  for (const m of [].concat(models || [])) if (m && chain.indexOf(m) < 0) chain.push(m);
  if (chain.indexOf(CFG.GEM_STT_FALLBACK) < 0) chain.push(CFG.GEM_STT_FALLBACK);
  const mt = (mime && /^audio\//.test(mime)) ? mime.split(';')[0].trim() : 'audio/ogg';
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [
        { inline_data: { mime_type: mt, data: b64 } },
        { text: L(env, 'm0v3kc92') },
      ] }],
      systemInstruction: { parts: [{ text: pick(env, STT_SYS, STT_SYS_EN) }] },
      generationConfig: { temperature: 0, maxOutputTokens: 2048 },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) throw new Error(L(env, 'm0z2h7di'));
    if (res.status === 400 || res.status === 404) { // مدل/فرمت قبول نکرد → بعدی
      lastErr = L(env, 'm0ibw2xu', m, res.status);
      continue;
    }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 140))); }
    const js = await res.json().catch(() => null);
    const cand = js && js.candidates && js.candidates[0];
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) { lastErr = L(env, 'm1r518my', blocked); continue; }
    const parts = cand && cand.content && cand.content.parts;
    const txt = Array.isArray(parts) ? parts.map((p) => p.text || '').join(' ').trim() : '';
    if (txt) return txt;
    lastErr = L(env, 'm0iirtmi', m);
  }
  throw new Error(lastErr || L(env, 'm0xu2xv6'));
}

/* پرامپت ترجمهٔ فوری (/translate): جهت را خودِ مدل تشخیص میدهد —
   فارسی ← انگلیسی، هر زبان دیگر ← فارسی. خروجی باید فقط متن ترجمه باشد
   تا بتوان آن را مستقیم فرستاد یا روی آن ریپلای زد. */
const TRANSLATE_SYS = 'تو یک مترجم حرفه‌ای هستی.\n' +
  '۱) زبان متن کاربر را تشخیص بده.\n' +
  '۲) اگر فارسی بود به انگلیسی روان ترجمه کن؛ اگر غیرفارسی بود به فارسی روان ترجمه کن.\n' +
  '۳) فقط متن ترجمه‌شده را بده — بدون «ترجمه:»، بدون توضیح، بدون نکته، بدون علامت نقل‌قول.\n' +
  '۴) لحن، اعداد، اسامی خاص و قالب‌بندی ساده (لیست/خط جدید) را حفظ کن.';

/* EN */
const TRANSLATE_SYS_EN = 'You are a professional translator.\n' +
  '1) Detect the language of the user text.\n' +
  '2) If it is Persian, translate it into fluent English; if it is not Persian, translate it into fluent Persian.\n' +
  '3) Output only the translated text — no "Translation:", no explanation, no notes, no extra markup.\n' +
  '4) Preserve meaning, tone and proper nouns; keep line breaks and list structure.';

/* خواندن PDF: متن را خودِ گوگل استخراج میکند (inline_data با mime application/pdf).
   دلیل انتخاب این مسیر: استخراج متن خالص از PDF داخل ورکر بدون کتابخانه‌ی
   رمزگشایی FlateDecode شدنی نیست، و فونت‌های CID فارسی هم بدون جدول کدگذاری
   بی‌معنی برمی‌گردند — یعنی راه‌حل خانگی عملاً برای PDF فارسی خراب است. */
async function geminiPdfText(env, bytes) {
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1mkkwk3'));
  const b64 = bufToB64(bytes);
  const chain = [];
  for (const m of [].concat(GEM_DOC_MODELS)) if (m && chain.indexOf(m) < 0) chain.push(m);
  const instr = L(env, 'm1300qjh');
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [
        { inline_data: { mime_type: 'application/pdf', data: b64 } },
        { text: instr },
      ] }],
      generationConfig: { temperature: 0, maxOutputTokens: CFG.PDF_OUT_TOKENS },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) throw new Error(L(env, 'm1tvgg96'));
    if (res.status === 400 || res.status === 404) { lastErr = L(env, 'm1f8675x', m, res.status); continue; }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 140))); }
    const js = await res.json().catch(() => null);
    const cand = js && js.candidates && js.candidates[0];
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) { lastErr = L(env, 'm1r518my', blocked); continue; }
    const parts = cand && cand.content && cand.content.parts;
    const txt = Array.isArray(parts) ? parts.map((p) => p.text || '').join('\n').trim() : '';
    if (txt) return txt;
    lastErr = L(env, 'm0iirtmi', m);
  }
  throw new Error(lastErr || L(env, 'm1dncruw'));
}

/* تولید صدا با گوگل — generateContent + responseModalities AUDIO.
   (نسخه‌ی قبلی روی /v1beta/interactions می‌رفت که endpoint درست نیست و
    همیشه خطا می‌داد؛ به همین دلیل «تولید صوت کار نمی‌کرد».) */
async function geminiTTS(env, text, voice, model) {
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1mkkwk3'));
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').slice(0, 900);
  if (!clean.trim()) throw new Error(L(env, 'm1mmplej'));
  const chain = [];
  for (const m of [model, CFG.GEM_TTS_FALLBACK].concat(GEM_TTS_MODELS.map((x) => x.id))) {
    if (m && chain.indexOf(m) < 0) chain.push(m);
  }
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [{ text: L(env, 'm0kpcin1', clean) }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Kore' } } },
        temperature: 0.7,
      },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) throw new Error(L(env, 'm19k19o9'));
    if (res.status === 400 || res.status === 404) { lastErr = L(env, 'm1jr3y73', m, res.status); continue; }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm1il87ot', res.status, t.slice(0, 140))); }
    const js = await res.json().catch(() => null);
    const parts = js && js.candidates && js.candidates[0] && js.candidates[0].content && js.candidates[0].content.parts;
    if (Array.isArray(parts)) {
      for (const p of parts) {
        const d = (p.inlineData && p.inlineData.data) || (p.inline_data && p.inline_data.data);
        if (d) return d; // base64 PCM 16-bit mono 24kHz
      }
    }
    lastErr = L(env, 'm0nfs8zg', m);
  }
  throw new Error(lastErr || L(env, 'm0k4zmrk'));
}

/* 🎨 تولید تصویر با گوگل — generateContent + responseModalities IMAGE.
   خروجی: base64 + mimeType (معمولاً image/png). */
/* 🎨 تولید تصویر رایگان — pollinations.ai (بدون کلید و بدون حساب).
   لایهٔ فالبک آخر: وقتی GEMINI_API_KEY نیست یا سقف ۴۲۹ گوگل خورده باشد،
   اینجا تصویر ساخته میشود. سمت‌سرور رندر میکند و PNG/JPEG برمی‌گرداند.
   خروجی: { b64, mime, via } — همان ساختار geminiImage تا فراخواننده‌ها
   بدون تغییر کار کنند. */
async function pollinationsImage(env, prompt) {
  const p = String(prompt || '').trim().slice(0, CFG.IMG_PROMPT_MAX);
  if (!p) throw new Error(L(env, 'm0ag5krm'));
  /* نسبت تصویر: نسبت‌های گوگل → عرض/ارتفاع pollinations */
  const AR = { '1:1': 1, '3:4': 0.75, '4:3': 1.333, '16:9': 1.777, '9:16': 0.5625 };
  const ratio = AR[CFG.IMG_ASPECT] || 1;
  const S = CFG.IMG_FREE_SIZE;
  /* سمت بلندتر همیشه S می‌ماند تا مساحت (و هزینهٔ رندر) ثابت بماند */
  const w = Math.round(ratio >= 1 ? S * ratio : S);
  const h = Math.round(ratio >= 1 ? S : S / ratio);
  const seed = Math.floor(Math.random() * 999999);
  /* nologo تا واترمارک pollinations پاک شود — نیاز به حساب ندارد */
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(p) +
    '?width=' + w + '&height=' + h + '&seed=' + seed + '&nologo=true&model=flux&enhance=false';
  const res = await fetchT(url, {}, CFG.IMG_FREE_TIMEOUT_MS);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(L(env, 'm0q8y2ht', res.status, t.slice(0, 120)));
  }
  const buf = await res.arrayBuffer();
  if (!buf || buf.byteLength < 3000) throw new Error(L(env, 'm0gjmbaj'));
  if (buf.byteLength > CFG.IMG_B64_MAX * 0.7) throw new Error(L(env, 'm12tsv4m'));
  const ct = String(res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
  if (!/^image\//.test(ct)) throw new Error(L(env, 'm0txxoug', ct));
  return { b64: bufToB64(buf), mime: ct, via: L(env, 'm0tt8pbw') };
}

/* 🖌 ویرایش عکس با گوگل — همان generateContent تصویر، ولی با قطعهٔ تصویر
   ورودی (inline_data) به‌علاوهٔ دستور ویرایش. مدل‌های تصویر Gemini این را
   پشتیبانی می‌کنند؛ برای هر مدل زنجیره، ورودی عکس دوباره فرستاده میشود.
   images: [{ b64, mime }] — خروجی: { b64, mime, via } */
async function geminiImageEdit(env, prompt, images, model) {
  const p = String(prompt || '').trim().slice(0, CFG.IMG_EDIT_PROMPT_MAX);
  if (!p) throw new Error(L(env, 'm0n09w9i'));
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1uy9uyh'));
  const list = (Array.isArray(images) ? images : []).filter((x) => x && x.b64).slice(0, CFG.IMG_EDIT_MAX_N);
  if (!list.length) throw new Error(L(env, 'm09kujhd'));
  const chain = [];
  for (const m of [model, CFG.IMG_MODEL_DEFAULT].concat(GEM_IMG_MODELS.map((x) => x.id))) {
    if (m && chain.indexOf(m) < 0) chain.push(m);
  }
  let lastErr = '';
  for (const m of chain) {
    /* قطعه‌ها: اول همهٔ عکس‌ها، بعد دستور متنی (ترتیب مطابق مستند گوگل) */
    const parts = list.map((im) => ({ inline_data: { mime_type: im.mime || 'image/png', data: im.b64 } }));
    parts.push({ text: p });
    const body = {
      contents: [{ role: 'user', parts }],
      generationConfig: { responseModalities: ['IMAGE'], temperature: 0.6 },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) {
      /* یک کلید برای همهٔ مدل‌ها → زدن بقیه فقط وقت تلف میکند */
      throw new Error(L(env, 'm1jguqm2'));
    }
    if (res.status === 400 || res.status === 404) {
      lastErr = L(env, 'm1hqu7fu', m, res.status);
      continue;
    }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 160))); }
    const js = await res.json().catch(() => null);
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) throw new Error(L(env, 'm1oja2mt', blocked));
    const rparts = js && js.candidates && js.candidates[0] && js.candidates[0].content && js.candidates[0].content.parts;
    if (Array.isArray(rparts)) {
      for (const pt of rparts) {
        const d = (pt.inlineData && pt.inlineData.data) || (pt.inline_data && pt.inline_data.data);
        if (!d) continue;
        if (d.length > CFG.IMG_B64_MAX) throw new Error(L(env, 'm07sawkt'));
        const mt = (pt.inlineData && pt.inlineData.mimeType) || (pt.inline_data && pt.inline_data.mime_type) || 'image/png';
        return { b64: d, mime: mt, via: m };
      }
    }
    lastErr = L(env, 'm0etycr3', m);
  }
  throw new Error(lastErr || L(env, 'm1f5guho'));
}

/* 🎨 تولید تصویر با گوگل — generateContent + responseModalities IMAGE.
   اگر کلید نباشد یا همهٔ مدل‌ها شکست بخورند و فالبک رایگان روشن باشد،
   خودکار به pollinations می‌رود. خروجی: { b64, mime, via }. */
async function geminiImage(env, prompt, model, opts = {}) {
  const p = String(prompt || '').trim().slice(0, CFG.IMG_PROMPT_MAX);
  if (!p) throw new Error(L(env, 'm0ag5krm'));
  /* کلید کاربر یا کلید پیش‌فرض؛ imgFree از تنظیمات کاربر هم پشتیبانی میشود */
  const freeOk = opts.free !== undefined ? !!opts.free : true;
  const key = gemKey(env);
  if (!key) {
    if (freeOk) return await pollinationsImage(env, p);
    throw new Error(L(env, 'm0e6n638'));
  }
  const chain = [];
  for (const m of [model, CFG.IMG_MODEL_DEFAULT].concat(GEM_IMG_MODELS.map((x) => x.id))) {
    if (m && chain.indexOf(m) < 0) chain.push(m);
  }
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [{ text: p }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: CFG.IMG_ASPECT },
        temperature: 0.8,
      },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    /* ۴۲۹ = سقف روزانهٔ کلید → نباید بقیهٔ مدل‌ها را هم زد (همه روی همان
       کلیدند)؛ ولی نباید throw هم کرد تا از فالبک رایگان رد شود. */
    if (res.status === 429) { lastErr = L(env, 'm18fhtg6'); break; }
    if (res.status === 400 && body.generationConfig.imageConfig) {
      // imageConfig توسط این مدل پشتیبانی نمیشود → همان مدل را بدون آن دوباره بزن
      delete body.generationConfig.imageConfig;
      try {
        res = await fetchT(GEM_BASE + m + ':generateContent',
          { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
      } catch (e2) { lastErr = String((e2 && e2.message) || e2); continue; }
      if (res.status === 429) { lastErr = L(env, 'm18fhtg6'); break; }
    }
    if (res.status === 400 || res.status === 404) {
      lastErr = L(env, 'm0ibw2xu', m, res.status);
      continue;
    }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 160))); }
    const js = await res.json().catch(() => null);
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) throw new Error(L(env, 'm059mjt5', blocked));
    const parts = js && js.candidates && js.candidates[0] && js.candidates[0].content && js.candidates[0].content.parts;
    if (Array.isArray(parts)) {
      for (const pt of parts) {
        const d = (pt.inlineData && pt.inlineData.data) || (pt.inline_data && pt.inline_data.data);
        if (!d) continue;
        if (d.length > CFG.IMG_B64_MAX) throw new Error(L(env, 'm07sawkt'));
        const mt = (pt.inlineData && pt.inlineData.mimeType) || (pt.inline_data && pt.inline_data.mime_type) || 'image/png';
        return { b64: d, mime: mt, via: m };
      }
    }
    lastErr = L(env, 'm0etycr3', m);
  }
  /* همهٔ مدل‌های گوگل شکست خوردند → فالبک رایگان (اگر روشن باشد).
     فیلد via در کپشن دروغ نمی‌گوید: اگر رایگان باشد اسم Gemini نمی‌آید. */
  if (freeOk) {
    try { return await pollinationsImage(env, p); }
    catch (e2) {
      throw new Error(L(env, 'm1407yf8', lastErr, String((e2 && e2.message) || e2).slice(0, 140)));
    }
  }
  throw new Error(lastErr || L(env, 'm07h72dx'));
}
function pcmToWavBytes(pcmB64, rate) {
  const bin = atob(String(pcmB64 || ''));
  const n = bin.length;
  const buf = new Uint8Array(44 + n);
  const v = new DataView(buf.buffer);
  const ws = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + n, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate || 24000, true); v.setUint32(28, (rate || 24000) * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) buf[44 + i] = bin.charCodeAt(i) & 255;
  return buf;
}
