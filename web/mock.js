/* ═══════════════════════════════════════════════════════════════
   mock.js — پیش‌نمایش محلی بدون ورکر (فقط روی localhost)
   در محیط واقعی Worker مسیر /app/mock.js را خالی سرو می‌کند.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const on = location.hostname === 'localhost' || location.hostname === '127.0.0.1' ||
    location.search.indexOf('mock=1') >= 0;
  if (!on) return;

  const DB = {
    threads: [
      { id: 'main', name: W("اصلی"), ts: Date.now() - 86400000 * 2 },
      { id: 'tq8x1', name: W("پروژه ربات"), ts: Date.now() - 3600000 * 5 },
      { id: 'tp9z2', name: W("ایده‌های نوشتن"), ts: Date.now() - 3600000 * 30 },
    ],
    hist: {
      main: [
        { role: 'user', content: W("سلام! کیستی؟") },
        { role: 'assistant', content: W("سلام بهراد جان! 👋 من دستیار شیشه‌ای تو هستم — همان مغز ورکر Cloudflare، فقط با ظاهر تازه.\n\n**بله:**\n- حافظه بلندمدت 🧠\n- سرچ وب با `/web`\n- ویس دوطرفه 🎙\n\n```js\nconsole.log(\"Liquid Glass ✨\");\n```\n\nبپرس تا جواب بدهم.") },
        { role: 'user', content: W("هوای نیشابور چطوره؟") },
        { role: 'assistant', content: W("🌤 **هوای نیشابور**\n\n- دما: ۲۴ درجه، نیمه‌ابری\n- باد: ۱۱ کیلومتر بر ساعت\n- رطوبت: ۳۸٪\n\n> برای پیش‌بینی ۲ روز آینده همین‌جا بپرس.") },
      ],
      tq8x1: [
        { role: 'user', content: W("یادآور روزانه ۸ صبح ورزش بذار") },
        { role: 'assistant', content: W("⏰ ثبت شد: **روزانه 08:00 ورزش** 🔁\n\nهر صبح ساعت ۸ به وقت تهران یادت می‌اندازم.") },
      ],
      tp9z2: [],
    },
    mem: [
      { id: 101, t: W("اسم من بهراد است و پروژه اصلی‌ام ربات تلگرام AI است."), ts: Date.now() },
      { id: 102, t: W("پروژه فعلی: اپ اندروید شیشه‌ای متصل به ورکر."), ts: Date.now() },
      { id: 103, t: W("زبان ترجیحی همیشه فارسی، جواب کوتاه و بی‌حاشیه."), ts: Date.now() },
    ],
    rm: [
      { key: 'rm:a1', at: Date.now() + 3600000 * 3, txt: W("چای دم کن"), repeat: null },
      { key: 'rm:a2', at: nextAt(8), txt: W("ورزش"), repeat: 'daily' },
      { key: 'rm:a3', at: Date.now() + 45 * 60000, txt: W("استراحت کن"), repeat: null },
    ],
    settings: {
      model: 'mock-cf-1',
      temperature: 0.8, maxTokens: 2048, dailyLimit: 0,
      autoFallback: true, liveStream: true, readLinks: true, autoVision: true,
      searchAuto: false, briefing: false, voiceReply: false,
      voiceProv: 'google', ttsModel: 'gemini-2.5-flash-preview-tts',
      sttModel: 'gemini-3.5-transcribe', voiceName: 'Kore', sysCustom: '',
    },
    thread: 'main',
    usage: { msgs: 24, tin: 18400, tout: 9120 },
    wg: [
      { id: 'wseed1', type: 'weather', size: '2x1', title: W("هوای نیشابور"), text: '', at: 0, repeat: 'none', refresh: 900, accent: 'green', items: [], remKey: '', ts: Date.now() - 60000, up: 0 },
      { id: 'wseed2', type: 'reminder', size: '1x1', title: W("یادآور عصر"), text: W("چای دم کن"), at: nextAt(18), repeat: 'none', refresh: 60, accent: 'blue', items: [], remKey: 'rm:mock2', ts: Date.now() - 30000, up: 0 },
      { id: 'wseed3', type: 'clock', size: '1x1', title: W("ساعت تهران"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'red', items: [], remKey: '', ts: Date.now() - 20000, up: 0 },
      { id: 'wseed4', type: 'list', size: '1x2', title: W("خرید هفته"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [W("شیر و ماست"), W("نان تازه"), W("میوه"), W("تخم‌مرغ")], remKey: '', ts: Date.now() - 10000, up: 0 },
    ],
  };
  function nextAt(h) {
    const d = new Date();
    d.setHours(h, 0, 0, 0);
    if (d < Date.now()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }

  const MODELS = [
    { key: 'mock-cf-1', name: 'Llama 3.3 70B', ctx: 128, prov: 'cf', provName: 'Workers AI', vision: false },
    { key: 'mock-cf-2', name: 'Gemma 3 27B', ctx: 128, prov: 'cf', provName: 'Workers AI', vision: true },
    { key: 'mock-cf-3', name: 'Qwen 2.5 Coder 32B', ctx: 32, prov: 'cf', provName: 'Workers AI', vision: false },
    { key: 'p1:gpt-4o-mini', name: 'GPT-4o mini', ctx: 128, prov: 'p', provName: W("آزادکلید"), vision: true },
    { key: 'p1:claude-sonnet', name: 'Claude Sonnet', ctx: 200, prov: 'p', provName: W("آزادکلید"), vision: true },
    { key: 'p2:deepseek-v3', name: 'DeepSeek V3', ctx: 64, prov: 'p', provName: W("سرویس دوم"), vision: false },
  ];
  const PERSONAS = [
    { i: 0, icon: '🙂', name: W("پیش‌فرض") },
    { i: 1, icon: '🎯', name: W("مختصر و فنی") },
    { i: 2, icon: '🧑‍🏫', name: W("معلم صبور") },
    { i: 3, icon: '🛠', name: W("مهندس برنامه") },
  ];

  const json = (o, status) => new Response(JSON.stringify(o), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function sse(events) {
    const enc = new TextEncoder();
    let i = 0;
    const stream = new ReadableStream({
      async start(ctrl) {
        for (const [delay, ev] of events) {
          await sleep(delay);
          try { ctrl.enqueue(enc.encode('data: ' + JSON.stringify(ev) + '\n\n')); } catch (e) { return; }
        }
        try { ctrl.close(); } catch (e) {}
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } });
  }

  function fakeAnswer(q) {
    return W("### جواب نمونه (حالت پیش‌نمایش)\n\n") +
      W("سؤال تو این بود: **") + q.slice(0, 80) + '**\n\n' +
      W("این پاسخ از *mock* می‌آید تا بدون ورکر هم بتوانی ظاهر و انیمیشن‌ها را ببینی:\n\n") +
      W("1. استریم زنده با مکان‌نما ✨\n") +
      W("2. کارت‌های شیشه‌ای با بلور\n") +
      W("3. چهار تم و سه چیدمان\n\n") +
      W("```python\n# نمونه کد\nprint(\"Behrad AI — Liquid Glass\")\n```\n\n") +
      W("برای اتصال واقعی، آدرس ورکر و رمز داشبورد را در صفحه ورود بزن.");
  }

  async function mockChat(body) {
    const q = (body.text || '').trim();
    const th = body.thread || DB.thread;
    // دستورات ساده
    if (q === '/weather') {
      return sse([[120, { t: 'status', html: W("🌤 در حال گرفتن هوا...") }],
        [500, { t: 'done', text: W("🌤 **هوای نیشابور**\n\n- دما: ۲۴° نیمه‌ابری\n- باد: ۱۱ km/h\n- رطوبت: ۳۸٪"), footer: { label: 'Open-Meteo' } }]]);
    }
    if (q === '/memory') {
      const txt = DB.mem.length ? DB.mem.map((m, i) => (i + 1) + '. ' + m.t).join('\n') : W("حافظه خالی است.");
      return sse([[150, { t: 'done', text: W("🧠 **حافظه بلندمدت (") + DB.mem.length + '/50)**\n\n' + txt, cmd: true }]]);
    }
    if (q === '/new') {
      DB.hist[th] = [];
      return sse([[150, { t: 'done', text: W("🧹 گفتگوی تازه شروع شد."), reset: true, cmd: true }]]);
    }
    if (q === '/help' || q === '/start') {
      return sse([[150, { t: 'done', cmd: true, text: W("راهنما:\n\n- `/web جستجو` — سرچ وب\n- `/weather` — هوای نیشابور\n- `/remember متن` — سپردن به حافظه\n- `/memory` — دیدن حافظه\n- `/remind 18:30 چای` — یادآور\n- `/brief` — خلاصه صبح\n- `/new` — گفتگوی تازه") }]]);
    }
    if (q.startsWith('/remember ')) {
      const t = q.slice(10).trim();
      if (t) DB.mem.push({ id: Date.now(), t: t, ts: Date.now() });
      return sse([[200, { t: 'done', cmd: true, text: W("🧠 ذخیره شد: **") + t + '** (' + DB.mem.length + '/50)' }]]);
    }

    const answer = fakeAnswer(q || W("عکس"));
    const events = [];
    events.push([150, { t: 'status', html: W("🔎 در حال جستجوی وب ...") }]);
    events.push([450, { t: 'status', html: W("⚡ دارم می‌نویسم...") }]);
    // استریم تکه‌تکه
    const words = answer.split(' ');
    let acc = '';
    const chunk = Math.max(2, Math.ceil(words.length / 26));
    for (let i = 0; i < words.length; i += chunk) {
      acc += (i ? ' ' : '') + words.slice(i, i + chunk).join(' ');
      events.push([90, { t: 'delta', text: acc }]);
    }
    events.push([140, {
      t: 'done', text: answer,
      footer: { label: 'Llama 3.3 70B · Workers AI', tokens: 142 },
    }]);
    return sse(events);
  }

  /* WAV کوتاه بی‌صدا برای تست TTS */
  function tinyWav() {
    const n = 12000, rate = 8000;
    const buf = new ArrayBuffer(44 + n * 2);
    const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true);
    v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      const t = i / rate;
      const s = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 4) * 0.5;
      v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 32767, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  const origFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('/api/v1/') < 0) return origFetch(input, init);
    const path = url.slice(url.indexOf('/api/v1/'));
    const p = path.split('?')[0];
    const method = ((init && init.method) || 'GET').toUpperCase();
    let body = {};
    if (init && init.body && typeof init.body === 'string') { try { body = JSON.parse(init.body); } catch (e) {} }

    await sleep(120);

    if (p === '/api/v1/ping') return json({ ok: true, version: 'mock' });
    if (p === '/api/v1/login') return json({ token: 'mock-token', uid: '1' });
    if (p === '/api/v1/state') {
      return json({
        version: '4.8.0-mock', uid: '1',
        settings: DB.settings,
        thread: DB.thread,
        threads: DB.threads.map((t) => Object.assign({}, t)),
        models: MODELS,
        currentModel: Object.assign({ label: 'Llama 3.3 70B · Workers AI' },
          MODELS.find((m) => m.key === DB.settings.model) || MODELS[0]),
        personas: PERSONAS,
        providers: [{ name: W("آزادکلید"), n: 2, base: 'https://api.example.com/v1', keyMask: 'sk-***abc' }],
        usage: DB.usage,
        flags: { hasAi: true, hasDb: true, search: true, gemini: true },
        memCount: DB.mem.length, memMax: 50,
        briefHour: 10,
        weather: { city: W("نیشابور") },
      });
    }
    if (p === '/api/v1/history') {
      const th = new URLSearchParams(path.split('?')[1] || '').get('thread') || DB.thread;
      return json({ thread: th, msgs: (DB.hist[th] || []) });
    }
    if (p === '/api/v1/chat') return mockChat(body);
    if (p === '/api/v1/settings') {
      Object.keys(body).forEach((k) => { DB.settings[k] = body[k]; });
      return json({ ok: true, settings: DB.settings });
    }
    if (p === '/api/v1/thread') {
      if (body.op === 'new') {
        const id = 't' + Date.now().toString(36);
        const n = DB.threads.length + 1;
        DB.threads.push({ id: id, name: W("گفتگو ") + n, ts: Date.now() });
        DB.hist[id] = [];
        DB.thread = id;
      } else if (body.op === 'select') { if (DB.threads.some((t) => t.id === body.id)) DB.thread = body.id; }
      else if (body.op === 'delete') {
        DB.threads = DB.threads.filter((t) => t.id !== body.id);
        delete DB.hist[body.id];
        if (DB.thread === body.id) DB.thread = DB.threads[DB.threads.length - 1].id;
      } else if (body.op === 'rename') {
        const t = DB.threads.find((x) => x.id === body.id);
        if (t) t.name = body.name;
      } else if (body.op === 'clear') { DB.hist[body.id || DB.thread] = []; }
      return json({ ok: true, threads: DB.threads.map((t) => Object.assign({}, t)), thread: DB.thread });
    }
    if (p === '/api/v1/memory') {
      if (method === 'GET') return json({ items: DB.mem, max: 50 });
      if (body.op === 'add') {
        const dup = DB.mem.some((m) => m.t === body.text);
        if (!dup) DB.mem.push({ id: Date.now(), t: body.text, ts: Date.now() });
        return json({ ok: true, added: !dup });
      }
      if (body.op === 'del') DB.mem = DB.mem.filter((m) => String(m.id) !== String(body.id));
      if (body.op === 'clear') DB.mem = [];
      if (body.op === 'edit') { const m = DB.mem.find((x) => String(x.id) === String(body.id)); if (m) m.t = body.newText; }
      return json({ ok: true });
    }
    if (p === '/api/v1/reminders') {
      if (method === 'GET') return json({ items: DB.rm });
      if (body.op === 'add') {
        const t = String(body.text || '');
        const daily = /روزانه|daily/i.test(t);
        const hm = t.match(/(\d{1,2}):(\d{2})/);
        const rel = t.match(/(\d+)\s*m\b/i);
        let at;
        if (hm) {
          const d = new Date();
          d.setHours(+hm[1], +hm[2], 0, 0);
          if (d < Date.now() && !daily) d.setDate(d.getDate() + 1);
          at = d.getTime();
        } else if (rel) at = Date.now() + (+rel[1]) * 60000;
        else at = Date.now() + 3600000;
        const txt = t.replace(/روزانه/i, '').replace(/\d{1,2}:\d{2}/, '').replace(/\d+\s*m\b/i, '').trim() || t;
        DB.rm.push({ key: 'rm:' + Date.now().toString(36), at: at, txt: txt, repeat: daily ? 'daily' : null });
        return json({ ok: true, at: at });
      }
      if (body.op === 'del') DB.rm = DB.rm.filter((x) => x.key !== body.key);
      return json({ ok: true });
    }
    if (p === '/api/v1/stt') return json({ text: W("این یک متن نمونه است که از ویس فهمیدم!") });
    if (p === '/api/v1/tts') return new Response(tinyWav(), { headers: { 'Content-Type': 'audio/wav' } });
    if (p === '/api/v1/tool') {
      const name = new URLSearchParams(path.split('?')[1] || '').get('name');
      if (name === 'weather') return json({ text: W("🌤 **هوای نیشابور**\n\n- دما: ۲۴° نیمه‌ابری\n- باد: ۱۱ km/h\n- رطوبت: ۳۸٪") });
      return json({ text: W("💰 بیت‌کوین: ۶۸٬۴۰۰ دلار (+۱.۲٪)") });
    }
    if (p === '/api/v1/export') {
      const th = new URLSearchParams(path.split('?')[1] || '').get('thread') || DB.thread;
      const lines = (DB.hist[th] || []).map((m) => (m.role === 'user' ? W(" تو: ") : '🤖: ') + m.content).join('\n\n');
      return new Response(W("خروجی گفتگو — Behrad AI\n\n") + lines, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    if (p === '/api/v1/widgets') {
      const WGM = 12;
      if (method === 'GET') return json({ items: DB.wg.map((w) => Object.assign({}, w)), max: WGM });
      if (body.op === 'ai') {
        const idm = body.id || ('w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
        const pr = String(body.prompt || '').replace(/\s+/g, ' ').trim();
        if (!pr) return json({ error: W("پرامپت خالی است.") }, 400);
        const ixOld = DB.wg.findIndex((w) => w.id === idm);
        if (ixOld < 0 && DB.wg.length >= WGM) return json({ error: W("سقف ۱۲ ویجت پر است.") }, 400);
        let spec;
        if (/هوا|آب/.test(pr)) {
          spec = { type: 'weather', size: '2x1', title: W("هوای نیشابور"), text: '', at: 0, repeat: 'none', refresh: 900, accent: 'green', items: [] };
        } else if (/ساعت|تقویم|تاریخ/.test(pr)) {
          spec = { type: 'clock', size: '1x1', title: W("ساعت تهران"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [] };
        } else if (/لیست|چک/.test(pr)) {
          spec = { type: 'list', size: '1x2', title: W("لیست"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [W("مورد اول"), W("مورد دوم"), W("مورد سوم")] };
        } else if (/یاد|یادآور|هشدار|ساعت \d|فردا/.test(pr) || /\d{1,2}:\d{2}/.test(pr)) {
          const hm2 = pr.match(/(\d{1,2})(?::(\d{2}))?/);
          let h = hm2 ? +hm2[1] : 9;
          const mi = hm2 && hm2[2] ? +hm2[2] : 0;
          const d2 = new Date();
          d2.setHours(h, mi, 0, 0);
          if (/فردا/.test(pr) || d2 < Date.now()) d2.setDate(d2.getDate() + 1);
          spec = {
            type: 'reminder', size: '1x1', title: /روزانه|هر روز/.test(pr) ? W("یادآور روزانه") : W("یادآور"),
            text: pr.slice(0, 150), at: d2.getTime(),
            repeat: /روزانه|هر روز/.test(pr) ? 'daily' : 'none',
            accent: 'blue', items: [], refresh: 60,
          };
        } else {
          spec = { type: 'note', size: '1x1', title: W("یادداشت"), text: pr.slice(0, 150), at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [] };
        }
        spec.id = idm;
        spec.remKey = spec.type === 'reminder' ? 'rm:mock' + Date.now().toString(36) : '';
        spec.ts = Date.now(); spec.up = spec.ts;
        if (ixOld >= 0) DB.wg[ixOld] = spec; else DB.wg.push(spec);
        return json({ ok: true, spec: spec, items: DB.wg.map((w) => Object.assign({}, w)), src: 'ai', max: WGM });
      }
      if (body.op === 'put') {
        const idp = String((body.spec || {}).id || '');
        const ix = DB.wg.findIndex((w) => w.id === idp);
        if (ix < 0) return json({ error: W("ویجت پیدا نشد.") }, 404);
        const keep = DB.wg[ix];
        const ns = Object.assign({}, keep, body.spec, { id: idp, ts: keep.ts, up: Date.now() });
        if (ns.type !== 'reminder') ns.remKey = '';
        DB.wg[ix] = ns;
        return json({ ok: true, spec: ns, items: DB.wg.map((w) => Object.assign({}, w)) });
      }
      if (body.op === 'del') {
        const ixd = DB.wg.findIndex((w) => w.id === String(body.id || ''));
        if (ixd < 0) return json({ error: W("ویجت پیدا نشد.") }, 404);
        DB.wg.splice(ixd, 1);
        return json({ ok: true, items: DB.wg.map((w) => Object.assign({}, w)) });
      }
      if (body.op === 'reorder') {
        const order = Array.isArray(body.order) ? body.order.map(String) : [];
        const map = {};
        DB.wg.forEach((w) => { map[w.id] = w; });
        const next = [];
        order.forEach((id) => { if (map[id]) { next.push(map[id]); delete map[id]; } });
        DB.wg.forEach((w) => { if (map[w.id]) next.push(w); });
        DB.wg = next;
        return json({ ok: true, items: DB.wg.map((w) => Object.assign({}, w)) });
      }
      return json({ error: W("عملیات نامشخص است.") }, 400);
    }
    if (p === '/api/v1/wdata') {
      const what = new URLSearchParams(path.split('?')[1] || '').get('what');
      if (what === 'weather') {
        return json({ t: 22, hum: 41, code: 1, wind: 9, hi: 27, lo: 14, pop: 5, hi2: 26, lo2: 13, pop2: 15, city: W("نیشابور"), at: Date.now() });
      }
      if (what === 'stats') {
        return json({ msgs: DB.usage.msgs, tin: DB.usage.tin, tout: DB.usage.tout, dailyLimit: DB.settings.dailyLimit || 0, day: 'mock' });
      }
      return json({ error: W("نام داده نامعتبر است.") }, 400);
    }
    return json({ error: W("mock: مسیر ناشناخته ") + p }, 404);
  };

  console.log(W("[mock] پیش‌نمایش محلی فعال است"));
})();
