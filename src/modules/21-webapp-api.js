/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 21-webapp-api
   لایهٔ API اپ اندروید + دارایی‌های UI (APP_ASSETS در همین‌جاست)
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ اپ اندروید — لایه API و دارایی‌های UI (v4.7) ═══════════════════
   ورود با رمز داشبورد → توکن ۳۰ روزه در D1 (atk:) · scope همان تلگرام:
   c<ADMIN_ID>:<threadId> یعنی تاریخچه مشترک با ربات. */
/* APP_ASSETS → src/generated/app-assets.js (در build برمی‌گردد) */

function appB64Bytes(s) {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

function appAsset(env, url) {
  if (url.pathname === '/app') return new Response('', { status: 302, headers: { 'Location': '/app/' } });
  let name = url.pathname.slice('/app/'.length);
  if (!name) name = 'index.html';
  /* mock.js فقط روی localhost/wrangler dev سرو میشود — روی دامنه واقعی خالی است
     (کامنت داخل mock.js همین را می‌گوید؛ قبلاً فایل کامل در پروداکشن هم می‌رفت) */
  if (name === 'mock.js') {
    const host = String(url.hostname || '');
    if (!/^localhost$/i.test(host) && !/^127\.0\.0\.1$/i.test(host)) {
      return new Response(L(env, 'm0zxccnz'),
        { headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' } });
    }
  }
  /* 🔒 v5.4: فقط کلیدهای واقعی خودِ آبجکت — «constructor» یا «__proto__»
     در مسیر نباید از زنجیرهٔ prototype جواب بگیرد. */
  const a = Object.prototype.hasOwnProperty.call(APP_ASSETS, name) ? APP_ASSETS[name] : null;
  if (!a) return new Response('not found', { status: 404 });
  const body = a.b64 ? appB64Bytes(a.b) : a.b;
  return new Response(body, { headers: { 'Content-Type': a.t, 'Cache-Control': 'no-cache' } });
}

/* CORS: فقط همان دامنه‌ی خود ورکر مجاز است.
   قبلاً '*' بود → هر سایتی می‌توانست از مرورگر کاربر پاسخ‌ها را بخواند و
   روی /login هم brute-force بزند. حالا Origin خارجی اصلاً هدر CORS نمی‌گیرد.

   نکته: مقایسه باید با آدرس «درخواست» باشد، نه پاسخ — Responseهایی که خودمان
   می‌سازیم url خالی دارند و `new URL('')` خطا می‌دهد؛ قبلاً همین باعث میشد
   سمتِ «مجاز» هرگز کار نکند (هدر ACAO فقط برای دامنه‌ی بیگانه می‌رفت). */
function appCors(r, origin, selfOrigin) {
  try {
    const o = String(origin || '');
    if (o && /^https?:\/\//.test(o)) {
      let same = false;
      const self = String(selfOrigin || r.url || '');
      if (self) { try { same = new URL(o).host === new URL(self).host; } catch {} }
      if (same) r.headers.set('Access-Control-Allow-Origin', o);
    }
    r.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    r.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    r.headers.set('Vary', 'Origin');
  } catch {}
  return r;
}

async function appAuth(env, request) {
  try {
    const h = request.headers.get('Authorization') || '';
    const tk = h.replace(/^Bearer\s+/i, '').trim();
    if (!tk) return null;
    const v = await kvGet(env, 'atk:' + tk, null);
    if (!v || !v.uid || String(v.uid) !== String(env.ADMIN_ID)) return null;
    return { token: tk, uid: String(env.ADMIN_ID) };
  } catch { return null; }
}

function appThreadOk(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
}

const APP_HELP_MD = [
  '**راهنمای {{brand}}** 🤖',
  '',
  'دستورات:',
  '',
  '- `/web جستجو` — جستجوی وب با Tavily',
  '- `/image توصیف` — تولید تصویر 🎨 با GEMINI_API_KEY',
  '- `/tts متن` — تبدیل متن به صدا 🔊 (تا ۴۰۰ نویسه؛ متن‌های بلند: روی حباب 🔊 بزن)',
  '- `/translate متن` — ترجمهٔ فوری 🌐 فارسی↔انگلیسی',
  '- `/weather` — هوای نیشابور',
  '- `/crypto` — قیمت بیت‌کوین و اتریوم',
  '- `/remember متن` — سپردن به حافظه بلندمدت',
  '- `/memory` — دیدن حافظه · `/forget 2` · `/forget all`',
  '- `/remind 18:30 چای` — یادآور (روزانه 08:00 / 45m هم می‌شود)',
  '- `/new` — گفتگوی تازه',
  '- `/brief` — خلاصه صبح ' + CFG.BRIEF_HOUR + ':۰۰ روشن/خاموش',
  '- `/export` — خروجی تاریخچه',
  '- `/find عبارت` — جستجو در همهٔ گفتگوها 🔎',
  '- `/gallery` — گالری عکس‌ها · `/gallery 2` ارسال مجدد 🖼',
  '- `/sum متن` — خلاصهٔ هوشمند 📝 (روی ریپلای و متن بلند هم)',
  '- `/todo ...` — تودولیست ✅ · `/task هر روز 08:00 ...` — تسک زمان‌بندی‌شده با AI ⏳',
  '- `/memfind عبارت` — جستجو در حافظه 🧠',
  '- عکس با کپشن `ویرایش: ...` یا `/edit` روی ریپلای — ویرایش عکس 🖌',
  '',
  'وگرنه هر چی بپرسی همان جواب را می‌گیری؛ عکس 🖼، فایل 📄، PDF (تا ۶ مگابایت)، ماشین‌حساب 🧮 و لینک 🔗 هم بلدم.',
].join('\n');

/* EN */
const APP_HELP_MD_EN = [
  '**{{brand}} — Help** 🤖',
  '',
  'Commands:',
  '',
  '- `/web query` — web search with Tavily',
  '- `/image description` — generate an image 🎨 with GEMINI_API_KEY',
  '- `/tts text` — text to speech 🔊 (up to 400 chars; for longer text tap the 🔊 bubble)',
  '- `/translate text` — instant translation 🌐 Persian↔English',
  '- `/weather` — current weather',
  '- `/crypto` — Bitcoin and Ethereum prices',
  '- `/remember text` — save to long-term memory',
  '- `/memory` — view memory · `/forget 2` · `/forget all`',
  '- `/remind 18:30 tea` — reminder (daily 08:00 / 45m also work)',
  '- `/new` — new chat',
  '- `/brief` — morning briefing ' + CFG.BRIEF_HOUR + ':00 on/off',
  '- `/export` — export history',
  '- `/find term` — search all chats 🔎',
  '- `/gallery` — image gallery · `/gallery 2` resend 🖼',
  '- `/sum text` — smart summary 📝 (also on a reply and long text)',
  '- `/todo ...` — to-do list ✅ · `/task every day 08:00 ...` — AI scheduled task ⏳',
  '- `/memfind term` — search memory 🧠',
  '- photo with the caption `edit: ...` or `/edit` on a reply — edit an image 🖌',
  '',
  'Otherwise ask me anything; I also handle images 🖼, files 📄, PDFs (up to 6 MB), math 🧮 and links 🔗.',
].join('\n');

async function appApiHandler(env, request) {
  const url = new URL(request.url);
  const p = url.pathname;
  const method = (request.method || 'GET').toUpperCase();
  const origin = request.headers.get('Origin') || '';
  if (method === 'OPTIONS') return appCors(new Response(null, { status: 204 }), origin, url.origin);
  try {
    return appCors(await appRoute(env, request, url, p, method), origin, url.origin);
  } catch (e) {
    await logErr(env, 'app_api', e);
    return appCors(jsonRes({ error: String((e && e.message) || L(env, 'm1mjercl')) }, 500), origin, url.origin);
  }
}

async function appRoute(env, request, url, p, method) {

  /* ── ورود: رمز داشبورد → توکن ۳۰ روزه (با محدودیت تلاش) ── */
  if (p === '/api/v1/login' && method === 'POST') {
    const pw = env.DASHBOARD_PASSWORD || '';
    if (!pw) return jsonRes({ error: L(env, 'm1b0wm64') }, 503);
    const ip = String(request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'na')
      .split(',')[0].trim().slice(0, 64) || 'na';
    const lk = 'lg:' + hash32(ip);
    const W = CFG.LOGIN_WINDOW_S * 1000;
    const now = Date.now();
    const cnt = await kvGet(env, lk, { n: 0, ts: 0 });
    const fresh = cnt.ts && (now - cnt.ts) < W;
    if (cnt.n >= CFG.LOGIN_MAX_TRY && fresh) {
      return jsonRes({ error: L(env, 'm1la1lui', Math.ceil((W - (now - cnt.ts)) / 60000)) }, 429);
    }
    let body = {};
    try { body = await request.json(); } catch {}
    if (!safeEq(String(body.password || ''), pw)) {
      await kvPut(env, lk, { n: (fresh ? cnt.n : 0) + 1, ts: fresh ? cnt.ts : now }, CFG.LOGIN_WINDOW_S);
      return jsonRes({ error: L(env, 'm0o7tsjn') }, 401);
    }
    await kvDel(env, lk);
    const b = new Uint8Array(24);
    crypto.getRandomValues(b);
    let tk = '';
    for (let i = 0; i < b.length; i++) tk += b[i].toString(16).padStart(2, '0');
    await kvPut(env, 'atk:' + tk, { uid: String(env.ADMIN_ID) }, 30 * 86400);
    return jsonRes({ token: tk, uid: String(env.ADMIN_ID), expiresInDays: 30 });
  }

  const auth = await appAuth(env, request);
  if (!auth) return jsonRes({ error: 'unauthorized' }, 401);
  const uid = auth.uid;

  if (p === '/api/v1/ping') return jsonRes({ ok: true, version: VERSION });
  if (p === '/api/v1/logout' && method === 'POST') {
    await kvDel(env, 'atk:' + auth.token);
    return jsonRes({ ok: true });
  }

  const u = await getUser(env, uid);

  /* ── وضعیت کامل اپ ── */
  if (p === '/api/v1/state') {
    const entries = await getAllModelEntries(env);
    const cur = await resolveModel(env, u.st.model);
    const us = await kvGet(env, 'us:' + uid, {});
    const t0 = tehran();
    const mem = await memGet(env, uid);
    return jsonRes({
      version: VERSION,
      uid: uid,
      settings: u.st,
      thread: u.thread,
      threads: u.threads,
      models: entries.map((m) => ({
        key: m.key, name: m.name, ctx: Math.round(m.ctx / 1000),
        prov: m.prov === 'cf' ? 'cf' : 'p', provName: m.provName, vision: hasVision(m),
      })),
      currentModel: {
        key: cur.key,
        label: await entryLabel(env, cur.key),
        ctx: Math.round(cur.ctx / 1000),
        prov: cur.prov, provName: cur.provName, vision: hasVision(cur),
      },
      personas: PERSONAS.map((x, i) => ({ i: i, icon: x.icon, name: x.name })),
      providers: (await provAll(env)).map((r) => ({ name: r.name, n: (r.models || []).length, base: r.base, keyMask: maskKey(r.key) })),
      usage: {
        msgs: us.d === t0.ymd ? us.msgs || 0 : 0,
        tin: us.d === t0.ymd ? us.tin || 0 : 0,
        tout: us.d === t0.ymd ? us.tout || 0 : 0,
      },
      flags: {
        hasAi: !!(env.AI && typeof env.AI.run === 'function'),
        hasDb: !!env.DB,
        search: !!(env.SEARCH_API_KEY || '').trim(),
        gemini: !!(env.GEMINI_API_KEY || '').trim(),
      },
      gemModels: {
        tts: GEM_TTS_MODELS,
        stt: GEM_STT_MODELS,
        img: GEM_IMG_MODELS,
      },
      memCount: mem.length,
      memMax: CFG.MEM_MAX,
      briefHour: CFG.BRIEF_HOUR,
    });
  }

  /* ── تاریخچه (مشترک با تلگرام) ── */
  if (p === '/api/v1/history') {
    let th = url.searchParams.get('thread') || u.thread;
    if (!appThreadOk(th)) th = u.thread;
    const h = await histGet(env, 'c' + uid + ':' + th);
    return jsonRes({ thread: th, msgs: h.msgs });
  }

  /* ── چت جریانی: SSE روی POST ── */
  if (p === '/api/v1/chat' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    let th = body.thread || u.thread;
    if (!appThreadOk(th)) th = u.thread;
    const scope = 'c' + uid + ':' + th;
    const enc = new TextEncoder();
    let ctrl = null;
    const rs = new ReadableStream({ start(c) { ctrl = c; } });
    const send = (ev) => { try { ctrl.enqueue(enc.encode('data: ' + JSON.stringify(ev) + '\n\n')); } catch {} };
    const end = () => { try { ctrl.close(); } catch {} };
    const res = new Response(rs, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
    (async () => {
      try {
        await appChatFlow(env, uid, u, scope, body, send);
      } catch (e) {
        await logErr(env, 'app_chat', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm1x7wkws')) });
      } finally { end(); }
    })();
    return res;
  }

  /* ── تنظیمات (همان کلیدهای ربات) ── */
  if (p === '/api/v1/settings' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    const st = u.st;
    if (typeof body.temperature === 'number') st.temperature = Math.min(2, Math.max(0, body.temperature));
    if (typeof body.maxTokens === 'number') st.maxTokens = Math.min(8192, Math.max(256, Math.round(body.maxTokens)));
    if (typeof body.dailyLimit === 'number') st.dailyLimit = Math.min(100000, Math.max(0, Math.round(body.dailyLimit)));
    if (typeof body.model === 'string' && body.model) {
      const cm = await canonModel(env, body.model);
      if (cm.changed && !String(body.model).startsWith('@cf/')) return jsonRes({ error: L(env, 'm0w2eptl') }, 400);
      st.model = cm.key;
    }
    if (typeof body.persona === 'number' && body.persona >= 0 && body.persona < PERSONAS.length) st.persona = Math.round(body.persona);
    if (typeof body.sysCustom === 'string') st.sysCustom = body.sysCustom.slice(0, CFG.SYS_CUSTOM_MAX);
    const bools = ['autoFallback', 'liveStream', 'readLinks', 'autoVision', 'voiceReply', 'briefing', 'searchAuto', 'imgGen', 'imgFree', 'imgEdit', 'nlRemind', 'memAuto', 'weeklyBackup', 'cbBreaker', 'ytSum'];
    for (let i = 0; i < bools.length; i++) {
      const k = bools[i];
      if (typeof body[k] === 'boolean') st[k] = body[k];
    }
    if (body.voiceProv === 'cf' || body.voiceProv === 'google') st.voiceProv = body.voiceProv;
    if (typeof body.ttsModel === 'string' && GEM_TTS_MODELS.some((m) => m.id === body.ttsModel)) st.ttsModel = body.ttsModel;
    if (typeof body.sttModel === 'string' && GEM_STT_MODELS.some((m) => m.id === body.sttModel)) st.sttModel = body.sttModel;
    if (typeof body.imgModel === 'string' && GEM_IMG_MODELS.some((m) => m.id === body.imgModel)) st.imgModel = body.imgModel;
    if (typeof body.voiceName === 'string' && GEM_VOICES.indexOf(body.voiceName) >= 0) st.voiceName = body.voiceName;
    await putUser(env, uid, u);
    return jsonRes({ ok: true, settings: st });
  }

  /* ── گفتگوها (تردها) — همان منطق دکمه‌های ربات ── */
  if (p === '/api/v1/thread' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    const op = String(body.op || '');
    if (op === 'new') {
      const n = L(env, 'm1erlebc', u.threads.length + 1);
      u.threads.push({ id: 't' + Date.now().toString(36), name: n, ts: Date.now() });
      if (u.threads.length > CFG.THREAD_MAX) u.threads.shift();
      u.thread = u.threads[u.threads.length - 1].id;
    } else if (op === 'select') {
      if (!appThreadOk(body.id)) return jsonRes({ error: L(env, 'm0l3fmoi') }, 400);
      if (!u.threads.some((x) => x.id === body.id)) return jsonRes({ error: L(env, 'm0ix2zhp') }, 404);
      u.thread = body.id;
    } else if (op === 'delete') {
      if (u.threads.length <= 1) return jsonRes({ error: L(env, 'm1amitkh') }, 400);
      if (!u.threads.some((x) => x.id === body.id)) return jsonRes({ error: L(env, 'm0ix2zhp') }, 404);
      u.threads = u.threads.filter((x) => x.id !== body.id);
      if (u.thread === body.id) u.thread = u.threads[u.threads.length - 1].id;
    } else if (op === 'rename') {
      const t = u.threads.find((x) => x.id === body.id);
      if (!t) return jsonRes({ error: L(env, 'm0ix2zhp') }, 404);
      const nm = String(body.name || '').trim().slice(0, 40);
      if (nm) { t.name = nm; delete t.auto; } // تغییر دستی = عنوان دیگر خودکار عوض نمیشود
    } else if (op === 'clear') {
      const th = appThreadOk(body.id) && u.threads.some((x) => x.id === body.id) ? body.id : u.thread;
      await histPut(env, 'c' + uid + ':' + th, { msgs: [], used: 0 });
    } else {
      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
    await putUser(env, uid, u);
    return jsonRes({ ok: true, threads: u.threads, thread: u.thread });
  }

  /* ── حافظه بلندمدت ── */
  if (p === '/api/v1/memory') {
    if (method === 'GET') {
      const arr = await memGet(env, uid);
      return jsonRes({ items: arr, max: CFG.MEM_MAX });
    }
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      if (body.op === 'add') {
        const ok = await memAdd(env, uid, String(body.text || ''));
        return jsonRes({ ok: true, added: ok });
      }
      if (body.op === 'del') {
        await memDel(env, uid, body.id);
        return jsonRes({ ok: true });
      }
      if (body.op === 'clear') {
        await memPut(env, uid, []);
        return jsonRes({ ok: true });
      }
      if (body.op === 'edit') {
        const t = String(body.newText || '').trim().slice(0, 300);
        if (!t) return jsonRes({ error: L(env, 'm06c2j1v') }, 400);
        const arr = await memGet(env, uid);
        const it = arr.find((x) => x.id === body.id);
        if (!it) return jsonRes({ error: L(env, 'm084jnlc') }, 404);
        it.t = t;
        await memPut(env, uid, arr);
        return jsonRes({ ok: true });
      }
      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
  }

  /* ── یادآورها (همان کلیدهای rm: ربات — اجرا با کرون همان ورکر) ── */
  if (p === '/api/v1/reminders') {
    if (method === 'GET') {
      const keys = await kvList(env, 'rm:');
      const items = [];
      for (let i = 0; i < keys.length; i++) {
        const v = await kvGet(env, keys[i], null);
        if (!v || String(v.uid) !== uid) continue;
        items.push({ key: keys[i], at: v.at, txt: v.txt, repeat: v.repeat || 'none' });
      }
      return jsonRes({ items: items });
    }
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      if (body.op === 'del') {
        const k = String(body.key || '');
        if (k.indexOf('rm:') !== 0) return jsonRes({ error: L(env, 'm0pty8cf') }, 400);
        const v = await kvGet(env, k, null);
        if (v && String(v.uid) === uid) await kvDel(env, k);
        return jsonRes({ ok: true });
      }
      if (body.op === 'add') {
        const r = parseRemind(String(body.text || ''));
        if (!r) return jsonRes({ error: L(env, 'm1nnjo5o') }, 400);
        const k = 'rm:' + hash32(uid + r.at + Math.random());
        await kvPut(env, k, { uid: uid, chat: u.lastChat || env.ADMIN_ID, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') },
          Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
        const d = new Date(r.at + 210 * 60000); // +۳:۳۰ = تهران
        const label = d.getUTCHours() + ':' + String(d.getUTCMinutes()).padStart(2, '0');
        return jsonRes({ ok: true, at: r.at, atLabel: label, repeat: r.repeat || 'none' });
      }
      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
  }

  /* ── فهم ویس ── */
  if (p === '/api/v1/stt' && method === 'POST') {
    let fd = null;
    try { fd = await request.formData(); } catch { return jsonRes({ error: L(env, 'm14oov0j') }, 400); }
    const f = fd.get('file');
    if (!f || typeof f.arrayBuffer !== 'function') return jsonRes({ error: L(env, 'm1kw1dvu') }, 400);
    const buf = await f.arrayBuffer();
    if (!buf.byteLength) return jsonRes({ error: L(env, 'm09ybhe9') }, 400);
    if (buf.byteLength > CFG.VOICE_MAX_BYTES) return jsonRes({ error: L(env, 'm0obeb7t') }, 413);
    const text = await transcribeVoice(env, buf, u.st, String(f.type || ''));
    return jsonRes({ text: text });
  }

  /* ── تولید صدا ── */
  if (p === '/api/v1/tts' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    const text = String(body.text || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 900);
    if (!text) return jsonRes({ error: L(env, 'm00vb6we') }, 400);
    if (u.st.voiceProv !== 'cf' && gemKey(env)) {
      try {
        const pcm = await geminiTTS(env, text, u.st.voiceName || 'Kore', u.st.ttsModel);
        const wav = pcmToWavBytes(pcm, 24000);
        return appCors(new Response(wav, { headers: { 'Content-Type': 'audio/wav' } }));
      } catch (e) {
        await logErr(env, 'app_tts_gem', e);
        if (/GEMINI_API_KEY|429/.test(String((e && e.message) || e))) return jsonRes({ error: L(env, 'm0bt2k9o', String(e.message || '')) }, 502);
      }
    }
    if (/[؀-ۿ]/.test(text)) return jsonRes({ error: L(env, 'm0lkdita') }, 503);
    if (env.AI && typeof env.AI.run === 'function') {
      try {
        const out = await env.AI.run(CFG.TTS_MODEL, { prompt: text, lang: 'en' });
        let bytes = null;
        if (out instanceof ArrayBuffer) bytes = out;
        else if (out && out.byteLength) bytes = out;
        else if (typeof out === 'string' && out.length > 100) bytes = appB64Bytes(out);
        if (!bytes) return jsonRes({ error: L(env, 'm1292qjs') }, 502);
        return appCors(new Response(bytes, { headers: { 'Content-Type': 'audio/mpeg' } }));
      } catch (e) {
        await logErr(env, 'app_tts', e);
        return jsonRes({ error: L(env, 'm07nuekz') }, 502);
      }
    }
    return jsonRes({ error: L(env, 'm0izy80o') }, 503);
  }

  /* ── 🎨 تولید تصویر (GEMINI_API_KEY + مدل imgModel) ── */
  if (p === '/api/v1/image' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    if (u.st.imgGen === false) return jsonRes({ error: L(env, 'm19wixy6') }, 403);
    if (!gemKey(env) && u.st.imgFree === false) return jsonRes({ error: L(env, 'm1mkkwk3') }, 503);
    const lim = await checkDailyLimit(env, uid, u.st);
    if (lim) return jsonRes({ error: lim }, 429);
    const qlim = await quotaTake(env, uid, 'img');
    if (qlim) return jsonRes({ error: qlim }, 429);
    try {
      /* 🖌 اگر body.images داشت → ویرایش عکس، وگرنه تولید جدید */
      const imgs = Array.isArray(body.images) ? body.images.filter((x) => x && x.b64).slice(0, CFG.IMG_EDIT_MAX_N) : [];
      const img = imgs.length
        ? await geminiImageEdit(env, body.prompt, imgs, u.st.imgModel || CFG.IMG_MODEL_DEFAULT)
        : await geminiImage(env, body.prompt, u.st.imgModel || CFG.IMG_MODEL_DEFAULT, { free: u.st.imgFree !== false });
      await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: (imgs.length ? '✏️ ' : '') + body.prompt });
      await quotaBump(env, uid, 'img');
      await bumpUsage(env, uid, est(String(body.prompt || '')) + 600, 0);
      return jsonRes({ ok: true, mime: img.mime, b64: img.b64, via: img.via || '', model: u.st.imgModel || CFG.IMG_MODEL_DEFAULT });
    } catch (e) {
      await logErr(env, 'app_image', e);
      return jsonRes({ error: String((e && e.message) || L(env, 'm0uqywig')) }, 502);
    }
  }

  /* ── v5.4: گالری تصاویر ── */
  if (p === '/api/v1/gallery') {
    if (method === 'GET') {
      const list = await imgGalleryList(env, uid);
      return jsonRes({ ok: true, items: list.map((x) => ({ id: x.id, prompt: x.prompt, ts: x.ts })) });
    }
    let gb = {};
    try { gb = await request.json(); } catch {}
    const gid = String(gb.id || '');
    const item = await imgGalleryGet(env, uid, gid);
    if (!item) return jsonRes({ error: L(env, 'm0uziz0m') }, 404);
    return jsonRes({ ok: true, mime: item.mime, b64: item.b64, prompt: item.prompt || '' });
  }

  /* ── v5.4: جستجوی تاریخچه ── */
  if (p === '/api/v1/find') {
    const q = url.searchParams.get('q') || '';
    const found = await histFind(env, uid, 'c' + uid + ':' + (u.thread || 'main'), q);
    if (found.error) return jsonRes({ error: found.error }, 400);
    return jsonRes({ ok: true, hits: found.hits, total: found.total });
  }

  /* ── v5.4: تودولیست ── */
  if (p === '/api/v1/todo') {
    if (method === 'GET') {
      const arr = await todoGet(env, uid);
      return jsonRes({ ok: true, items: arr });
    }
    let tb = {};
    try { tb = await request.json(); } catch {}
    const op = String(tb.op || '');
    const arr = await todoGet(env, uid);
    if (op === 'add') {
      const it = await todoAdd(env, uid, tb.text);
      if (!it) return jsonRes({ error: L(env, 'm06c2j1v') }, 400);
      return jsonRes({ ok: true, item: it, items: await todoGet(env, uid) });
    }
    if (op === 'toggle') {
      const i = arr.findIndex((x) => x.id === tb.id);
      if (i < 0) return jsonRes({ error: L(env, 'm1gchinh') }, 404);
      arr[i].done = !arr[i].done;
      await todoPut(env, uid, arr);
      return jsonRes({ ok: true, items: arr });
    }
    if (op === 'del') {
      await todoPut(env, uid, arr.filter((x) => x.id !== tb.id));
      return jsonRes({ ok: true, items: await todoGet(env, uid) });
    }
    if (op === 'clear') {
      await todoPut(env, uid, []);
      return jsonRes({ ok: true, items: [] });
    }
    return jsonRes({ error: L(env, 'm1uj91hd') }, 400);
  }

  /* ── v5.4: تسک‌های زمان‌بندی‌شده با AI ── */
  if (p === '/api/v1/tasks') {
    if (method === 'GET') {
      const list = await taskList(env, uid);
      return jsonRes({ ok: true, items: list.map((t) => ({ id: t.id, prompt: t.prompt, repeat: t.repeat, at: t.at })) });
    }
    let kb = {};
    try { kb = await request.json(); } catch {}
    const kop = String(kb.op || '');
    if (kop === 'add') {
      const pr = parseRemind(String(kb.text || '').trim());
      if (!pr) return jsonRes({ error: L(env, 'm0xi2loh') }, 400);
      const list = await taskList(env, uid);
      if (list.length >= CFG.TASK_MAX) return jsonRes({ error: L(env, 'm0uvfha0') }, 429);
      const tt = { uid, chat: u.lastChat || String(env.ADMIN_ID), id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: String(pr.txt || '').slice(0, CFG.TASK_PROMPT_MAX), repeat: pr.repeat || 'none', step: pr.step, day: pr.day, at: pr.at, ts: Date.now() };
      if (!tt.prompt) return jsonRes({ error: L(env, 'm1lsps31') }, 400);
      await taskSave(env, tt);
      return jsonRes({ ok: true, id: tt.id });
    }
    if (kop === 'del') {
      await taskDel(env, uid, String(kb.id || ''));
      return jsonRes({ ok: true });
    }
    return jsonRes({ error: L(env, 'm1uj91hd') }, 400);
  }

  /* ── v5.4: جستجوی حافظه ── */
  if (p === '/api/v1/memfind') {
    const q = url.searchParams.get('q') || '';
    const res = await memSearch(env, uid, q);
    return jsonRes({ ok: true, items: res });
  }

  /* ── ابزارها ── */
  if (p === '/api/v1/tool') {
    const name = url.searchParams.get('name');
    try {
      if (name === 'weather') return jsonRes({ text: L(env, 'm0ojfxpv', await toolWeather(env)) });
      if (name === 'crypto') return jsonRes({ text: L(env, 'm0vh2r6b', await toolCrypto(env)) });
    } catch (e) { return jsonRes({ error: String(e.message || L(env, 'm11r1o8b')) }, 502); }
    return jsonRes({ error: L(env, 'm12ktwun') }, 400);
  }

  /* ── ویجت‌های هوشمند 🧩 (v4.8): برد شیشه‌ای اپ — spec با AI از پرامپت فارسی ── */
  if (p === '/api/v1/widgets') {
    if (method === 'GET') {
      const items = await wgGet(env, uid);
      return jsonRes({ items: items, max: WIDGET_MAX });
    }
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      const op = String(body.op || '');
      const items = await wgGet(env, uid);

      if (op === 'ai') {
        const prompt = String(body.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 300);
        if (!prompt) return jsonRes({ error: L(env, 'm1dmay17') }, 400);
        const id = body.id ? String(body.id) : '';
        const idx = id ? items.findIndex((x) => x.id === id) : -1;
        if (!id && items.length >= WIDGET_MAX) return jsonRes({ error: L(env, 'm0p1jj7b', num(WIDGET_MAX)) }, 400);
        if (id && idx < 0) return jsonRes({ error: L(env, 'm1tqgsds') }, 404);
        const lim = await checkDailyLimit(env, uid, u.st);
        if (lim) return jsonRes({ error: lim }, 429);
        const made = await widgetAiSpec(env, u, prompt);
        const spec = widgetSanitize(env, made.spec, id || wgNewId());
        spec.ts = idx >= 0 ? items[idx].ts : Date.now();
        spec.up = Date.now();
        spec.remKey = idx >= 0 ? (items[idx].remKey || '') : '';
        await wgSyncReminder(env, uid, u, spec, false);
        // ورودی و خروجی جدا شمارده شوند (قبلاً هر دو = est(prompt) بود و مصرف ~۵۰٪ کمتر ثبت می‌شد)
        try { await bumpUsage(env, uid, est(prompt), Math.max(60, Math.round(est(prompt) * 0.25))); } catch {}
        if (idx >= 0) items[idx] = spec; else items.push(spec);
        await wgPut(env, uid, items);
        return jsonRes({ ok: true, spec: spec, items: items, src: made.src, max: WIDGET_MAX });
      }

      if (op === 'put') {
        const raw = (body.spec && typeof body.spec === 'object') ? body.spec : {};
        const id = String(raw.id || '');
        const idx = items.findIndex((x) => x.id === id);
        if (idx < 0) return jsonRes({ error: L(env, 'm1tqgsds') }, 404);
        const spec = widgetSanitize(env, raw, id);
        spec.ts = items[idx].ts;
        spec.up = Date.now();
        spec.remKey = items[idx].remKey || '';
        await wgSyncReminder(env, uid, u, spec, false);
        items[idx] = spec;
        await wgPut(env, uid, items);
        return jsonRes({ ok: true, spec: spec, items: items });
      }

      if (op === 'del') {
        const id = String(body.id || '');
        const idx = items.findIndex((x) => x.id === id);
        if (idx < 0) return jsonRes({ error: L(env, 'm1tqgsds') }, 404);
        const spec = items[idx];
        await wgSyncReminder(env, uid, u, spec, true);
        items.splice(idx, 1);
        await wgPut(env, uid, items);
        return jsonRes({ ok: true, items: items });
      }

      if (op === 'reorder') {
        const order = Array.isArray(body.order) ? body.order.map(String).slice(0, WIDGET_MAX) : [];
        const map = {};
        items.forEach((x) => { map[x.id] = x; });
        const next = [];
        order.forEach((id) => {
          if (map[id]) { next.push(map[id]); delete map[id]; }
        });
        items.forEach((x) => { if (map[x.id]) next.push(x); });
        await wgPut(env, uid, next);
        return jsonRes({ ok: true, items: next });
      }

      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
    return jsonRes({ error: L(env, 'm15q1ctd') }, 405);
  }

  /* ── داده زنده ویجت‌ها: هوا (ساختاریافته) و آمار امروز ── */
  if (p === '/api/v1/wdata') {
    const what = url.searchParams.get('what');
    if (what === 'weather') {
      try { return jsonRes(await widgetWeather(env)); }
      catch (e) { return jsonRes({ error: String((e && e.message) || L(env, 'm17gr4fi')) }, 502); }
    }
    if (what === 'stats') {
      const us = await kvGet(env, 'us:' + uid, {});
      const t0 = tehran();
      const day = us && us.d === t0.ymd;
      return jsonRes({
        msgs: day ? (us.msgs || 0) : 0,
        tin: day ? (us.tin || 0) : 0,
        tout: day ? (us.tout || 0) : 0,
        dailyLimit: u.st.dailyLimit || 0,
        day: t0.ymd,
      });
    }
    return jsonRes({ error: L(env, 'm1rqy9fl') }, 400);
  }

  /* ── خروجی متنی گفتگو ── */
  if (p === '/api/v1/export') {
    let th = url.searchParams.get('thread') || u.thread;
    if (!appThreadOk(th)) th = u.thread;
    const t = u.threads.find((x) => x.id === th);
    const h = await histGet(env, 'c' + uid + ':' + th);
    const lines = h.msgs.map((m) => (m.role === 'user' ? L(env, 'm05g16ki') : L(env, 'm0m4g10r')) + m.content).join('\n\n──────────\n\n');
    const out = L(env, 'm1in2yd5', (t && t.name) || th, VERSION, new Date().toISOString(), lines || L(env, 'm1as29d3'));
    return new Response(out, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': 'attachment; filename="behraad-' + th + '.txt"' },
    });
  }

  return jsonRes({ error: L(env, 'm1lkb9pm') }, 404);
}

/* ── جریان یک پیام چت (فرمان/بازتولید/عادی) ── */
async function appChatFlow(env, uid, u, scope, body, send) {
  const settings = u.st;
  const raw = String(body.text || '');
  const trimmed = raw.trim();

  /* تولید مجدد: آخرین پیام کاربر و همه‌چیز بعدش بریده میشود — عین رفتار ربات */
  if (body.regen) {
    const h0 = await histGet(env, scope);
    let i = h0.msgs.length - 1;
    while (i >= 0 && h0.msgs[i].role !== 'user') i--;
    if (i < 0) { send({ t: 'err', msg: L(env, 'm0osdx2r') }); return; }
    const popped = h0.msgs[i];
    h0.msgs = h0.msgs.slice(0, i);
    await histPut(env, scope, h0);
    send({ t: 'regen', text: String(popped.content || '').slice(0, 200) });
    await appRunChat(env, uid, scope, settings, {
      text: String(popped.content || '').replace(/\s*📷 [0-9۰-۹]+ عکس پیوست شد/g, '').trim(),
      photos: [], file: null,
    }, send, {});
    return;
  }

  /* دستورات — عین handleCommand ربات ولی خروجی مارک‌داون برای اپ */
  if (trimmed.charAt(0) === '/') {
    const handled = await appApiCommand(env, uid, u, scope, trimmed, send);
    if (handled === 'web') {
      await appRunChat(env, uid, scope, settings, { text: raw, photos: body.photos, file: body.file }, send,
        { forceWeb: trimmed.split(/\s+/).slice(1).join(' ').trim() });
      return;
    }
    if (handled) return;
  }

  await appRunChat(env, uid, scope, settings, { text: raw, photos: body.photos, file: body.file }, send, {});
}

async function appApiCommand(env, uid, u, scope, text, send) {
  const parts = text.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');
  const done = (o) => { send(Object.assign({ t: 'done', cmd: true }, o)); };

  switch (cmd) {
    case '/start':
    case '/help':
      done({ text: pick(env, APP_HELP_MD, APP_HELP_MD_EN) });
      return true;

    case '/weather':
      send({ t: 'status', html: L(env, 'm0ei4a2j') });
      try { done({ text: L(env, 'm0ojfxpv', await toolWeather(env)) }); }
      catch (e) { send({ t: 'err', msg: String(e.message || L(env, 'm01jl3p0')) }); }
      return true;

    case '/crypto':
      send({ t: 'status', html: L(env, 'm031atyr') });
      try { done({ text: L(env, 'm0vh2r6b', await toolCrypto(env)) }); }
      catch (e) { send({ t: 'err', msg: String(e.message || L(env, 'm14lsjrb')) }); }
      return true;

    case '/image':
    case '/img': {
      if (!toolAvailable(env, 'img')) {
        return await sendMsg(env, budget, chatId, L(env, 'm0img_off'));
      }
      if (u.st.imgGen === false) { done({ text: L(env, 'm0x2yp3a') }); return true; }
      /* 🔧 v5.4: این مسیر مثل تلگرام باید فالبک رایگان را هم ببیند؛
         قبلاً بدون کلید گوگل همیشه خطا می‌داد و imgFree بی‌اثر بود. */
      if (!gemKey(env) && u.st.imgFree === false) { done({ text: L(env, 'm0o91y9t') }); return true; }
      const pr = arg.trim();
      if (!pr) { done({ text: L(env, 'm023cmhe', u.st.imgModel || CFG.IMG_MODEL_DEFAULT) }); return true; }
      /* سقف روزانه — مسیر اپ از /api/v1/image رد نمیشود، پس اینجا باید جدا بسته شود */
      const cmdLim = await checkDailyLimit(env, uid, u.st);
      if (cmdLim) { send({ t: 'err', msg: cmdLim.replace(/\n/g, ' ') }); return true; }
      const cmdQ = await quotaTake(env, uid, 'img');
      if (cmdQ) { send({ t: 'err', msg: cmdQ.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm1klk24e') });
      try {
        const img = await geminiImage(env, pr, u.st.imgModel || CFG.IMG_MODEL_DEFAULT, { free: u.st.imgFree !== false });
        await quotaBump(env, uid, 'img');
        await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: pr });
        await bumpUsage(env, uid, est(pr) + 600, 0);
        done({ text: '🎨 ' + pr, img: { b64: img.b64, mime: img.mime } });
      } catch (e) {
        await logErr(env, 'app_image_cmd', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm0uqywig')) });
      }
      return true;
    }

    case '/remember': {
      const t = arg.trim();
      if (!t) { done({ text: L(env, 'm0lr0o49') }); return true; }
      const ok = await memAdd(env, uid, t);
      const arr = await memGet(env, uid);
      done({
        text: ok
          ? L(env, 'm1p4fs19', t.slice(0, 200), arr.length, CFG.MEM_MAX)
          : L(env, 'm1nnv324', arr.length, CFG.MEM_MAX),
      });
      return true;
    }

    case '/forget': {
      const a = arg.trim();
      if (!a) { done({ text: L(env, 'm0jj8mb0') }); return true; }
      if (a.toLowerCase() === 'all') {
        await memPut(env, uid, []);
        done({ text: L(env, 'm0bruwal') });
        return true;
      }
      const idx = parseInt(a, 10);
      const arr = await memGet(env, uid);
      const it = arr[idx - 1];
      if (!it) { done({ text: L(env, 'm1t6zi84') }); return true; }
      await memDel(env, uid, it.id);
      done({ text: L(env, 'm1leppoo', String(it.t).slice(0, 200)) });
      return true;
    }

    case '/memory': {
      const arr = await memGet(env, uid);
      if (!arr.length) { done({ text: L(env, 'm14jqzm2') }); return true; }
      done({
        text: L(env, 'm0z2w8r4', arr.length, CFG.MEM_MAX, arr.map((x, i) => (i + 1) + '. ' + x.t).join('\n')),
      });
      return true;
    }

    case '/new':
      await histPut(env, scope, { msgs: [], used: 0 });
      done({ text: L(env, 'm0ysn1iy'), reset: true });
      return true;

    case '/brief':
      u.st.briefing = u.st.briefing === false;
      await putUser(env, uid, u);
      if (u.st.briefing === false) { done({ text: L(env, 'm0ajkdai') }); return true; }
      try { await sendMorningBriefing(env, uid, u.lastChat || env.ADMIN_ID); } catch (e) { await logErr(env, 'app_brief', e); }
      done({ text: L(env, 'm1sri6y8', CFG.BRIEF_HOUR) });
      return true;

    case '/remind': {
      const r = parseRemind(arg);
      if (!r) {
        done({ text: L(env, 'm096gedn') });
        return true;
      }
      const k = 'rm:' + hash32(uid + r.at + Math.random());
      await kvPut(env, k, { uid: uid, chat: u.lastChat || env.ADMIN_ID, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') },
        Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
      const d = new Date(r.at + 210 * 60000);
      done({
        text: L(env, 'm1c1xw8a', r.repeat === 'daily' ? L(env, 'm18eeume') : '', d.getUTCHours(), String(d.getUTCMinutes()).padStart(2, '0'), r.txt),
      });
      return true;
    }

    case '/export':
      done({ text: L(env, 'm0l450r2') });
      return true;

    case '/tts': {
      if (!toolAvailable(env, 'tts')) return await sendMsg(env, budget, chatId, L(env, 'm0tts_off'));
      /* سقف ۴۰۰ نویسه: صدا به‌صورت data-URI روی همان SSE برمی‌گردد، پس
         باید حجمش بسته بماند. متن بلندتر: روی حبابِ همان پیام 🔊 بزن. */
      const q = arg.trim().slice(0, 400);
      if (!q) { done({ text: L(env, 'm0dr5k87', u.st.voiceName || 'Kore') }); return true; }
      if (!gemKey(env)) { done({ text: L(env, 'm1emacaq') }); return true; }
      const ttsLim = await checkDailyLimit(env, uid, u.st);
      if (ttsLim) { send({ t: 'err', msg: ttsLim.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm1m3sg2c') });
      try {
        /* voiceProv گوگل اجباری است تا وقتی کاربر موتور را روی کلادفلر گذاشته،
           همچنان (مثل تلگرام) صدای فارسیِ سالم بگیرد. */
        const pcm = await geminiTTS(env, q, u.st.voiceName || 'Kore', u.st.ttsModel);
        const wav = pcmToWavBytes(pcm, 24000);
        await bumpUsage(env, uid, est(q) + 500, 0);
        done({ text: '🔊 ' + q.slice(0, 200), audio: 'data:audio/wav;base64,' + bufToB64(wav), cmd: true });
      } catch (e) {
        await logErr(env, 'app_tts_cmd', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm14186yy')) });
      }
      return true;
    }

    /* ── v5.4: جستجوی تاریخچه ── */
    case '/find': {
      const qf = arg.trim();
      if (!qf) { done({ text: L(env, 'm01jegfx') }); return true; }
      send({ t: 'status', html: L(env, 'm0ddnpuc') });
      const found = await histFind(env, uid, scope, qf);
      if (found.error) { send({ t: 'err', msg: found.error }); return true; }
      if (!found.hits.length) { done({ text: L(env, 'm14pjnho', qf) }); return true; }
      const linesF = found.hits.map((h, i) => (i + 1) + '. ' + h.thread + ' · ' + h.role + '\n   ' + h.snip);
      done({ text: L(env, 'm06nczjq', found.total, qf, linesF.join('\n')) });
      return true;
    }
    /* ── v5.4: گالری ── */
    case '/gallery': {
      const listG = await imgGalleryList(env, uid);
      if (!listG.length) { done({ text: L(env, 'm03sf4bw') }); return true; }
      const nG = parseInt(normDigits(arg).replace(/[^0-9]/g, ''), 10);
      if (nG >= 1 && nG <= listG.length) {
        const itemG = listG[nG - 1];
        const imgG = await imgGalleryGet(env, uid, itemG.id);
        if (!imgG) { send({ t: 'err', msg: L(env, 'm1v7div1') }); return true; }
        done({ text: '🖼 ' + (itemG.prompt || L(env, 'm02yw10f')), img: { b64: imgG.b64, mime: imgG.mime } });
        return true;
      }
      const rowsG = listG.map((x, i) => (i + 1) + '. ' + (x.prompt || L(env, 'm1if2w6h')).slice(0, 60));
      done({ text: L(env, 'm0kk51n1', listG.length, rowsG.join('\n')) });
      return true;
    }
    /* ── v5.4: خلاصه ── */
    case '/sum': {
      if (!toolAvailable(env, 'sum')) return await sendMsg(env, budget, chatId, L(env, 'm0sum_off'));
      const srcS = arg.trim();
      if (!srcS) { done({ text: L(env, 'm1l5ph9g') }); return true; }
      const limS = await checkDailyLimit(env, uid, u.st);
      if (limS) { send({ t: 'err', msg: limS.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm0t4ez9i') });
      try {
        const resS = await summarizeText(env, u.st.model, u.st, srcS, {});
        done({ text: L(env, 'm0d3swmp', resS.reduced ? ' (' + resS.parts + L(env, 'm0i35436') : '', resS.text || L(env, 'm0q7ytpb'), resS.cut ? L(env, 'm0cfmgf4') + (CFG.SUM_MAX_PARTS * CFG.SUM_CHUNK) + L(env, 'm1s7i8mq') : '') });
        await bumpUsage(env, uid, est(srcS), est(resS.text || ''));
      } catch (e) { send({ t: 'err', msg: String((e && e.message) || e).slice(0, 240) }); }
      return true;
    }
    /* ── v5.4: تودو ── */
    case '/todo': {
      const a2 = arg.trim();
      if (!a2 || /^(list|لیست)$/i.test(a2)) {
        const arrT = await todoGet(env, uid);
        if (!arrT.length) { done({ text: L(env, 'm1sk4va5') }); return true; }
        done({ text: L(env, 'm06ghlxp', arrT.map((x, i) => (x.done ? '✅ ' : '⬜ ') + (i + 1) + '. ' + x.t).join('\n')) });
        return true;
      }
      const mm2 = /^(done|انجام)\s+(\d+)$/i.exec(a2);
      if (mm2) {
        const arrT = await todoGet(env, uid);
        const i2 = +mm2[2] - 1;
        if (!arrT[i2]) { send({ t: 'err', msg: L(env, 'm1knzm87') }); return true; }
        arrT[i2].done = !arrT[i2].done;
        await todoPut(env, uid, arrT);
        done({ text: (arrT[i2].done ? '✅ ' : '⬜ ') + arrT[i2].t });
        return true;
      }
      const md2 = /^(del|حذف)\s+(\d+)$/i.exec(a2);
      if (md2) {
        const arrT = await todoGet(env, uid);
        const i2 = +md2[2] - 1;
        if (!arrT[i2]) { send({ t: 'err', msg: L(env, 'm1knzm87') }); return true; }
        const rmT = arrT.splice(i2, 1)[0];
        await todoPut(env, uid, arrT);
        done({ text: L(env, 'm02h4m74', rmT.t) });
        return true;
      }
      const it2 = await todoAdd(env, uid, a2);
      if (!it2) { send({ t: 'err', msg: L(env, 'm06c2j1v') }); return true; }
      done({ text: L(env, 'm1wpozgv', it2.t) });
      return true;
    }
    /* ── v5.4: تسک زمان‌بندی‌شده ── */
    case '/task': {
      const a3 = arg.trim();
      if (!a3 || /^(list|لیست)$/i.test(a3)) {
        const listK = await taskList(env, uid);
        if (!listK.length) { done({ text: L(env, 'm03xtq24') }); return true; }
        done({ text: L(env, 'm0uopnzg', listK.map((t, i) => (i + 1) + '. ' + repeatLabel(env, t.repeat) + ' — ' + String(t.prompt).slice(0, 60)).join('\n')) });
        return true;
      }
      const md3 = /^(del|حذف)\s+(\d+)$/i.exec(a3);
      if (md3) {
        const listK = await taskList(env, uid);
        const t3 = listK[+md3[2] - 1];
        if (!t3) { send({ t: 'err', msg: L(env, 'm1knzm87') }); return true; }
        await taskDel(env, uid, t3.id);
        done({ text: L(env, 'm1nwlaw0') });
        return true;
      }
      const pr3 = parseRemind(a3);
      if (!pr3) { done({ text: L(env, 'm0vjpbwb') }); return true; }
      const listK2 = await taskList(env, uid);
      if (listK2.length >= CFG.TASK_MAX) { send({ t: 'err', msg: L(env, 'm0uvfha0') }); return true; }
      const tt3 = { uid, chat: u.lastChat || String(env.ADMIN_ID), id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: String(pr3.txt || a3).slice(0, CFG.TASK_PROMPT_MAX), repeat: pr3.repeat || 'none', step: pr3.step, day: pr3.day, at: pr3.at, ts: Date.now() };
      await taskSave(env, tt3);
      done({ text: L(env, 'm14221jq', repeatLabel(env, tt3.repeat), tt3.prompt.slice(0, 120)) });
      return true;
    }
    /* ── v5.4: جستجوی حافظه ── */
    case '/memfind': {
      const qm = arg.trim();
      if (!qm) { done({ text: L(env, 'm1j27vq4') }); return true; }
      const resM = await memSearch(env, uid, qm);
      if (!resM.length) { done({ text: L(env, 'm0kt28mc', qm) }); return true; }
      done({ text: L(env, 'm1xhf763', resM.map((x, i) => (i + 1) + '. ' + (x.tag ? '[' + x.tag + '] ' : '') + x.t).join('\n')) });
      return true;
    }

    case '/translate': {
      if (!toolAvailable(env, 'translate')) return await sendMsg(env, budget, chatId, L(env, 'm0tr_off'));
      if (!q) { done({ text: L(env, 'm0c7cgc4') }); return true; }
      const trLim = await checkDailyLimit(env, uid, u.st);
      if (trLim) { send({ t: 'err', msg: trLim.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm0anxs2n') });
      try {
        const { msgs } = await buildMessages(env, u.st, scope, null, pick(env, TRANSLATE_SYS, TRANSLATE_SYS_EN), knownCtx(u.st.model), uid);
        msgs.push({ role: 'user', content: q });
        const r = await aiChat(env, u.st.model, msgs, { temperature: 0.2, maxTokens: u.st.maxTokens, ...cbOff(u.st) });
        await bumpUsage(env, uid, est(q) + 800, (r.usage && r.usage.completion_tokens) || est(r.text));
        done({ text: '🌐 ' + r.text, cmd: true });
      } catch (e) {
        await logErr(env, 'app_translate', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm08csxgs')) });
      }
      return true;
    }

    case '/web': {
      const q = arg.trim();
      if (!q) { done({ text: L(env, 'm1dojn9x') }); return true; }
      if (!(env.SEARCH_API_KEY || '').trim()) {
        done({ text: L(env, 'm15g3aah') });
        return true;
      }
      return 'web';
    }
  }

  /* دستورات مخصوص منوی تلگرام — داخل اپ جای دیگری دارند */
  if (['/model', '/settings', '/stats', '/persona', '/prompts', '/providers'].indexOf(cmd) >= 0) {
    done({ text: L(env, 'm089z4rj') });
    return true;
  }
  return false;
}

/* ── هسته چت: عین runChatReply بدون تلگرام؛ خروجی روی SSE ── */
async function appRunChat(env, uid, scope, settings, input, send, opts) {
  const setStatus = (html) => { if (html) send({ t: 'status', html: String(html) }); };
  const fail = (msg) => send({ t: 'err', msg: String(msg) });

  const userText = String(input.text || '');
  const photos = Array.isArray(input.photos)
    ? input.photos.slice(0, CFG.VISION_MAX_N)
        .filter((x) => x && typeof x.b64 === 'string' && typeof x.mime === 'string')
        .map((x) => ({ mime: String(x.mime).slice(0, 40), b64: String(x.b64).slice(0, 4000000) }))
    : [];
  const filePart = input.file && input.file.text
    ? L(env, 'm115nlgh', String(input.file.name || L(env, 'm0abc4ft')).slice(0, 80), String(input.file.text).slice(0, CFG.USER_FILE_INLINE))
    : '';

  setStatus(L(env, 'm1qhftot'));

  /* پیوستن محتوای وب و فایل */
  let content = userText;
  const linkPart = await maybeAttachLinks(env, settings, userText, setStatus);
  if (linkPart) content += linkPart;
  if (filePart) content += filePart;
  try {
    const toolPart = await runPreTools(env, settings, userText, setStatus);
    if (toolPart) content += toolPart;
  } catch (e) { await logErr(env, 'app_pretools', e); }

  if (!content.trim() && !photos.length) { fail(L(env, 'm08zbpvl')); return; }

  const lim = await checkDailyLimit(env, uid, settings);
  if (lim) { fail(lim); return; }

  /* سرچ اجباری /web — عین دستور /web ربات */
  let extraSys = null;
  if (opts.forceWeb) {
    if (!(env.SEARCH_API_KEY || '').trim()) { fail(L(env, 'm0t7ebbc')); return; }
    setStatus(L(env, 'm1yucpp6'));
    try {
      const ans = await tavilySearch(env, opts.forceWeb, CFG.SEARCH_MAX_RESULTS);
      extraSys = L(env, 'm0x828qa', opts.forceWeb.slice(0, 200), ans);
    } catch (e) { await logErr(env, 'app_web', e); fail(L(env, 'm1gq3vo8')); return; }
  }

  /* مدل فعال + سوییچ خودکار به مدل عکس‌فهم */
  let entry = await resolveModel(env, settings.model);
  let visionNote = '';
  if (photos.length && !hasVision(entry)) {
    if (!settings.autoVision) {
      fail(L(env, 'm04i2bvf'));
      return;
    }
    const ve = await pickVisionModel(env, settings.model);
    if (!ve || ve.key === entry.key) { fail(L(env, 'm1s8u5h4')); return; }
    visionNote = L(env, 'm0qan5wf', ve.name);
    entry = ve;
  }

  if (!content.trim() && photos.length) content = L(env, 'm1fqc776');

  const uContent = photos.length ? imgContent(env, content, photos) : content;
  const { msgs } = await buildMessages(env, settings, scope, null, extraSys, entry.ctx, uid);
  msgs.push({ role: 'user', content: uContent });

  /* فراخوانی مدل + استریم زنده + فالبک خودکار — عین ربات */
  let lastDL = 0, lastDT = 0;
  const onDelta = settings.liveStream
    ? (acc) => {
        const now = Date.now();
        if (now - lastDT < 70 && acc.length - lastDL < 60) return;
        lastDT = now; lastDL = acc.length;
        send({ t: 'delta', text: acc });
      }
    : null;

  let r = null;
  try {
    r = await aiChat(env, entry.key, msgs,
      { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) }, onDelta);
  } catch (e) {
    const msg = String((e && e.message) || L(env, 'm1sreiq9'));
    if (!settings.autoFallback || /binding/i.test(msg) ||
        e.code === 'context' || e.code === 'auth' || e.code === 'nomodel') { fail(msg); return; }
    const alt = entry.prov !== 'p'
      ? (CF_FALLBACK_MODEL !== settings.model
          ? CF_FALLBACK_MODEL
          : (((await getModels(env)).find((m) => m.id !== settings.model) || {}).id || null))
      : CF_FALLBACK_MODEL;
    if (!alt) { fail(msg); return; }
    setStatus(L(env, 'm1ioz4gs', esc(msg), esc(modelName(env, alt))));
    try {
      r = await aiChat(env, alt,
        [{ role: 'system', content: buildSystemPrompt(env, settings) }, ...msgs.slice(1)],
        { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) });
      r._alt = alt;
    } catch (e2) { fail(String((e2 && e2.message) || L(env, 'm1sreiq9'))); return; }
  }
  if (!r || typeof r.text !== 'string') { fail(L(env, 'm1f7ihn9')); return; }

  /* ذخیره تاریخچه با همان قالب ربات (متن + نشانه عکس) */
  const h = await histGet(env, scope);
  const noteParts = [];
  if (photos.length) noteParts.push(L(env, 'm0hwj8vq', num(photos.length)));
  const histUser = userText || (input.file && input.file.name ? '📎 ' + String(input.file.name).slice(0, 60) : '') || L(env, 'm05xy4it');
  h.msgs.push({ role: 'user', content: [histUser, ...noteParts].filter(Boolean).join(' ') });
  h.msgs.push({ role: 'assistant', content: r.text });
  await histPut(env, scope, h);
  try { await maybeExtractMemory(env, uid, scope, settings); } catch {}
  try { await bumpUsage(env, uid, est(content), (r.usage && r.usage.completion_tokens) || est(r.text)); } catch {}

  const label = (await entryLabel(env, r._alt || entry.key)) + visionNote;
  send({
    t: 'done',
    text: r.text,
    footer: { label: label, tokens: (r.usage && r.usage.completion_tokens) || est(r.text) },
  });
}

/* ═══════════ ویجت‌های هوشمند 🧩 (v4.8) ═══════════
   پرامپت فارسی ← spec JSON (AI با مدل فعال کاربر، وگرنه فالبک کیوردی)
   ← ذخیره در kv wg:<uid> (سقف ۱۲) ← برد شیشه‌ای اپ.
   یادآورها به همان کلیدهای rm: وصل‌اند — کرون همین ورکر به تلگرام هم می‌فرستد. */
const WIDGET_MAX = 12;
const WG_TYPES = ['reminder', 'weather', 'clock', 'countdown', 'note', 'stats', 'list', 'date'];
const WG_SIZES = ['1x1', '2x1', '1x2', '2x2'];
const WG_ACCENTS = ['blue', 'green', 'red'];

const WG_SYS = [
  'تو «مولد ویجت» اپ {{brand}} هستی. خروجی فقط و فقط یک شیء JSON معتبر است — بدون متن اضافه، بدون توضیح، بدون ```.',
  'ساختار دقیق:',
  '{"type":"reminder|weather|clock|countdown|note|stats|list|date","size":"1x1|2x1|1x2|2x2","title":"...","text":"...","at":0,"repeat":"none|daily","refresh":60,"accent":"blue|green|red","items":[]}',
  'قوانین:',
  '- عنوان حداکثر ۳۰ و متن حداکثر ۱۵۰ کاراکتر فارسی؛ اعداد داخل متن‌ها فارسی باشند.',
  '- at فقط برای reminder و countdown: میلی‌ثانیه epoch. اکنون دقیقاً {{NOW}} است (به وقت تهران UTC+3:30). «فردا ساعت ۹» یعنی فردای همین حالا ساعت ۹:۰۰ به وقت تهران.',
  '- یادآوری/هشدار/«یادم بنداز» ← type=reminder؛ تکرار روزانه فقط اگر «هر روز/روزانه» گفتند ← repeat:daily. جشن/سفر/پایان کار ← countdown.',
  '- آب‌وهوا، هوا، دما، نیشابور ← type=weather با refresh:900. ساعت/زمان/ساعت چنده ← clock. تقویم/تاریخ ← date. آمار/مصرف ← stats.',
  '- متن/یادداشت/نقل‌قول ← note. لیست/کارها/چک‌لیست ← list با items حداکثر ۶ تا.',
  '- size: پیش‌فرض 1x1؛ متن بلند یا دو بخشی ← 2x1؛ فهرست بلند ← 1x2؛ مهم و بزرگ ← 2x2.',
  '- accent فقط blue یا green یا red؛ رنگ دیگری نیاور.',
  'نمونه (پرامپت: «فردا ساعت ۹ قرص بخورم»): {"type":"reminder","size":"1x1","title":"یادآور فردا","text":"قرص بخور ⚕️","at":1769137800000,"repeat":"none","refresh":60,"accent":"blue","items":[]}',
  'نمونه («آب و هوا رو نشون بده»): {"type":"weather","size":"2x1","title":"هوای نیشابور","refresh":900,"accent":"green","items":[]}',
  'نمونه («لیست خرید هفته»): {"type":"list","size":"1x2","title":"خرید هفته","items":["شیر","نان","تخم‌مرغ"],"accent":"blue","items":[]}',
].join('\n');

/* EN */
const WG_SYS_EN = [
  'You are the widget generator of the {{brand}} app. The output is exactly one valid JSON object — no extra text, no explanation, no ```.',
  'Exact structure:',
  '{"type":"reminder|weather|clock|countdown|note|stats|list|date","size":"1x1|2x1|1x2|2x2","title":"...","text":"...","at":0,"repeat":"none|daily","refresh":60,"accent":"blue|green|red","items":[]}',
  'Rules:',
  '- Title at most 30 and text at most 150 characters; write in the language of the user prompt.',
  '- at is only for reminder and countdown: epoch milliseconds. Right now is exactly {{NOW}} (Tehran time UTC+3:30). “Tomorrow at 9” means tomorrow at 09:00 Tehran time.',
  '- Reminder/alert/“remind me” ← type=reminder; daily repeat only if they say “every day/daily” ← repeat:daily. Celebration/trip/finish ← countdown.',
  '- Weather/temperature ← type=weather with refresh:900. Clock/time/what time is it ← clock. Calendar/date ← date. Stats/usage ← stats.',
  '- Note/memo/quote ← note. List/tasks/checklist ← list with at most 6 items.',
  '- size: default 1x1; long or two-part text ← 2x1; long list ← 1x2; important and big ← 2x2.',
  '- accent only blue, green or red; no other color.',
  'Example (prompt: “take my pill tomorrow at 9”): {"type":"reminder","size":"1x1","title":"Tomorrow reminder","text":"Take your pill ⚕️","at":1769137800000,"repeat":"none","refresh":60,"accent":"blue","items":[]}',
  'Example (“show the weather”): {"type":"weather","size":"2x1","title":"Weather","refresh":900,"accent":"green","items":[]}',
  'Example (“this week shopping list”): {"type":"list","size":"1x2","title":"This week","items":["Milk","Bread","Eggs"],"accent":"blue"}',
].join('\n');

function wgNewId() {
  return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function wgGet(env, uid) {
  const v = await kvGet(env, 'wg:' + uid, null);
  const items = v && Array.isArray(v.items) ? v.items : [];
  return items.slice(0, WIDGET_MAX);
}

async function wgPut(env, uid, items) {
  await kvPut(env, 'wg:' + uid, { items: items.slice(0, WIDGET_MAX) });
}

/* ── استخراج JSON از خروجی مدل (کد-فنس، متن دور، آرایه‌ها) ── */
function widgetExtractJson(text) {
  let s = String(text == null ? '' : text).trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```\s*$/i, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try {
    const o = JSON.parse(s.slice(a, b + 1));
    return o && typeof o === 'object' && !Array.isArray(o) ? o : null;
  } catch (e) { return null; }
}

/* ── سانیتایزر سمت سرور: انوم‌ها، کلمپ رشته‌ها، ساعت‌ها ── */
function widgetSanitize(env, raw, id) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const type = WG_TYPES.indexOf(String(o.type)) >= 0 ? String(o.type) : 'note';
  const size = WG_SIZES.indexOf(String(o.size)) >= 0 ? String(o.size) : '1x1';
  const accent = WG_ACCENTS.indexOf(String(o.accent)) >= 0 ? String(o.accent) : 'blue';
  const clean = (v, n) => String(v == null ? '' : v)
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, n);
  const timed = type === 'reminder' || type === 'countdown';
  let at = 0;
  if (timed && typeof o.at === 'number' && isFinite(o.at) && Math.abs(o.at - Date.now()) < 10 * 365 * 86400000) {
    at = Math.round(o.at);
  }
  if (timed && !at) at = Date.now() + (type === 'countdown' ? 7 * 86400000 : 3600000);
  let refresh = 60;
  if (typeof o.refresh === 'number' && isFinite(o.refresh)) {
    refresh = Math.min(3600, Math.max(15, Math.round(o.refresh)));
  } else if (type === 'weather') {
    refresh = 900;
  }
  const items = Array.isArray(o.items)
    ? o.items.slice(0, 6).map((x) => clean(x, 60)).filter(Boolean)
    : [];
  return {
    id: String(id || wgNewId()).slice(0, 24),
    type: type,
    size: size,
    accent: accent,
    title: clean(o.title, 30) || L(env, 'm1f8p06f'),
    text: clean(o.text, 150),
    at: at,
    repeat: o.repeat === 'daily' ? 'daily' : 'none',
    refresh: refresh,
    items: items,
    remKey: '',
    ts: 0,
    up: 0,
  };
}

/* ── پیوند یادآور ویجت با کلیدهای rm: همان ربات (کرون + تلگرام) ── */
async function wgSyncReminder(env, uid, u, spec, remove) {
  const old = String(spec.remKey || '');
  const drop = async () => {
    if (!old) { spec.remKey = ''; return; }
    const v = await kvGet(env, old, null);
    if (v && String(v.uid) === uid) await kvDel(env, old);
    spec.remKey = '';
  };
  if (remove) { await drop(); return; }
  if (spec.type !== 'reminder' || !spec.at) {
    if (old) await drop();
    return;
  }
  // یادآور یک‌باره خیلی گذشته ← کلید نساز (ویجت حالت «رسید» را خودش نشان می‌دهد)
  if (spec.repeat !== 'daily' && spec.at < Date.now() - 60000) {
    if (old) await drop();
    return;
  }
  const txt = (((spec.title || '') + (spec.text ? ' — ' + spec.text : ''))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)) || L(env, 'm011jgxy');
  let at = spec.at;
  if (spec.repeat === 'daily' && at <= Date.now()) at += 86400000; // امروز گذشته ← فردا همین ساعت
  const k = old || ('rm:' + hash32(uid + spec.at + Math.random()));
  const ttl = Math.max(60, Math.ceil((at - Date.now()) / 1000) + 120);
  await kvPut(env, k, {
    uid: uid,
    chat: u.lastChat || env.ADMIN_ID,
    at: at,
    txt: txt,
    repeat: spec.repeat === 'daily' ? 'daily' : 'none',
  }, ttl);
  spec.remKey = k;
}

/* ── داده آب‌وهوا به‌صورت ساختاریافته (برای رندرر ویجت) ── */
async function widgetWeather(env) {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + CFG.WEATHER_LAT + '&longitude=' + CFG.WEATHER_LON + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTehran&forecast_days=2';
  const res = await fetchT(url, {}, 15000);
  if (!res.ok) throw new Error(L(env, 'm0snzrp4'));
  const js = await res.json();
  const c = js.current || {};
  const d = js.daily || {};
  return {
    t: c.temperature_2m,
    hum: c.relative_humidity_2m,
    code: c.weather_code,
    wind: c.wind_speed_10m,
    hi: (d.temperature_2m_max || [])[0],
    lo: (d.temperature_2m_min || [])[0],
    pop: (d.precipitation_probability_max || [])[0],
    hi2: (d.temperature_2m_max || [])[1],
    lo2: (d.temperature_2m_min || [])[1],
    pop2: (d.precipitation_probability_max || [])[1],
    city: L(env, 'm03g58op'),
    at: Date.now(),
  };
}

/* ── فالبک بدون AI: از روی کیورد/regex همان spec را می‌سازد ── */
function widgetFallbackSpec(env, prompt, nowMs) {
  const base = { type: 'note', size: '1x1', title: '', text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [] };
  const s = String(prompt || '').replace(/\s+/g, ' ').trim();
  if (!s) { base.title = L(env, 'm0172fa1'); return base; }
  if (/آب\s*و\s*هوا|هوای|هواشناس|دمای/.test(s)) {
    return Object.assign(base, { type: 'weather', size: '2x1', title: L(env, 'm1m4c883'), accent: 'green', refresh: 900 });
  }
  if (/آمار|مصرف|توکن/.test(s)) {
    return Object.assign(base, { type: 'stats', size: '1x1', title: L(env, 'm0zl2rxs'), accent: 'red' });
  }
  const n = s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const remind = /یادآور|یادم|یاد\s*بده|یادآوری|هشدار|remind/i.test(n);
  const tmatch = /(^|\s)(ساعت|فردا|امروز|\d{1,2}:\d{2})/.test(n) && /\d/.test(n);
  if (remind || tmatch) {
    const daily = /روزانه|هر\s*روز|هرروز/.test(n);
    const tomorrow = /فردا/.test(n);
    const rest = n
      .replace(/روزانه|هر\s*روز|هرروز|فردا|امروز|ساعت|به\s*من|به\s*منم|یادآوری?\s*(?:کن|بکن)?|یادم\s*بند?از|یاد\s*بده|هشدار\s*(?:بده|کن)?/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const hm = rest.match(/^(\d{1,2})(?::(\d{2}))?\s*(صبح|عصر|شب)?\s*(.*)$/);
    if (hm) {
      let h = +hm[1];
      const min = hm[2] != null ? +hm[2] : 0;
      const part = hm[3] || '';
      if (part === 'عصر' && h < 12) h += 12;
      if (part === 'شب' && h < 12) h += 12;
      if (h <= 23 && min <= 59) {
        const txt = (hm[4] || '').replace(/\s+/g, ' ').trim() || s;
        const t = tehran();
        let at = tehranToEpoch(t.y, t.m, t.d + (tomorrow ? 1 : 0), h, min);
        if (!tomorrow && at <= nowMs && remind) at += 86400000;
        return Object.assign(base, {
          type: 'reminder',
          size: '1x1',
          title: daily ? L(env, 'm0cfn323') : L(env, 'm011jgxy'),
          text: txt.slice(0, 150),
          at: at,
          repeat: daily ? 'daily' : 'none',
          accent: 'blue',
        });
      }
    }
  }
  if (/لیست|چک.?لیست|کارهای/.test(s)) {
    return Object.assign(base, { size: '1x2', title: L(env, 'm0mk6fps'), text: s.replace(/^لیست\s*/i, '').slice(0, 150) });
  }
  if (/^ساعت|^زمان|ساعت چنده|الانچند|چند ساعت/.test(n)) {
    return Object.assign(base, { type: 'clock', size: '1x1', title: L(env, 'm03bydy7'), accent: 'blue' });
  }
  if (/تقویم|تاریخ|روز چند/.test(n)) {
    return Object.assign(base, { type: 'date', size: '2x1', title: L(env, 'm06bt1d9'), accent: 'green' });
  }
  return Object.assign(base, { title: L(env, 'm0172fa1'), text: s.slice(0, 150) });
}

/* ── مسیر اصلی: AI با مدل فعال کاربر ← در نبود/خطا، فالبک کیوردی ── */
async function widgetAiSpec(env, u, prompt) {
  const nowMs = Date.now();
  try {
    if (env.AI && typeof env.AI.run === 'function') {
      const t = tehran();
      const sys = pick(env, WG_SYS, WG_SYS_EN).replace('{{NOW}}',
        t.h + ':' + String(t.min).padStart(2, '0') + ' ' + pick(env, WD_FA, WD_EN)[t.w] + ' ' +
        t.y + '/' + t.m + '/' + t.d + ' (epoch ' + nowMs + ')');
      const r = await aiChat(env, u.st.model || CF_FALLBACK_MODEL, [
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ], { temperature: 0.15, maxTokens: 700, ...cbOff(u.st) });
      const js = widgetExtractJson(r && r.text);
      if (js) return { spec: js, src: 'ai' };
    }
  } catch (e) { await logErr(env, 'widget_ai', e); }
  return { spec: widgetFallbackSpec(env, prompt, nowMs), src: 'fast' };
}
