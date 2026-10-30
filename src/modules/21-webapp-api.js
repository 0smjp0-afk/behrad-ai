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
      /* نامِ مالک فقط از راز می‌آید؛ کلاینت {{owner}}/{{brand}} را با همین پر می‌کند
         (هیچ نامی در سورسِ وب‌اپ نیست — قانونِ امنیتیِ پروژه). */
      owner: ownerName(env),
      brand: ownerBrand(env),
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