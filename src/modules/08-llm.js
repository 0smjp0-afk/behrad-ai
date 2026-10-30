/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 08-llm
   موتور مدل‌ها: Workers AI + سرویس سازگار با OpenAI + استریم/فالبک + تاریخچه
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ موتور کلادفلر (Workers AI) ═══════════════════ */
function knownCtx(id) {
  const f = CF_KNOWN.find((m) => m.id === id);
  return f ? f.ctx : 32000;
}
function modelName(env, id) {
  if (!id) return L(env, 'm0782kha');
  const f = CF_KNOWN.find((m) => m.id === id);
  if (f) return f.name;
  // «@cf/meta/llama-3.1-8b-instruct» ← «llama-3.1-8b-instruct»
  return String(id).split('/').pop();
}

// استخراج زنده مدل‌های متنی چت از binding کلادفلر (با صفحه‌بندی کامل)
async function fetchCfChatModels(env) {
  const out = [];
  const pages = [1, 2, 3, 4]; // تا ۴ صفحه × ۱۰۰ = ۴۰۰ مدل، کافی است
  for (const page of pages) {
    let items = [];
    try {
      const ms = await env.AI.models({ page, per_page: 100 });
      items = Array.isArray(ms) ? ms : ((ms && (ms.result || ms.data)) || []);
    } catch { break; }
    if (!items.length) break;
    for (const m of items) {
      const id = String((m && (m.name || m.id)) || '');
      if (!id) continue;
      // task گاهی رشته است گاهی آبجکت {name: ...}
      const t = (m && (m.task || m.taskType)) || '';
      const task = typeof t === 'string' ? t : String((t && t.name) || '');
      const isChat = task.includes('Text Generation') || task === 'Any-to-Any' || task === 'Image-to-Text' || (!task && !out.length);
      // مدل‌های ویژن (vl/vision) دیگر «آشغال» نیستند — از v4.2 عکس می‌فهمند
      const isJunk = /embed|whisper|flux|sd-|stable-|bge|img2text|faster-|tts|melotts|m2t|uer|unmask|rerank|trans/i.test(id);
      if (isChat && !isJunk) out.push(id);
    }
    if (items.length < 100) break;
  }
  return [...new Set(out)];
}

// لیست مدل‌ها با کش ۳۰ دقیقه‌ای؛ در خرابی، لیست داخلی
async function getModels(env) {
  const cached = await kvGet(env, 'mc');
  if (cached && Date.now() - cached.t < 1800000) return cached.list;
  let list = null;
  try {
    if (!env.AI || typeof env.AI.models !== 'function') throw new Error(L(env, 'm0b4m9n9'));
    const ids = await fetchCfChatModels(env);
    if (ids.length) {
      ids.sort((a, b) => a.localeCompare(b));
      // مدل‌های مهم کاربر اول نمایش داده شوند
      const star = ids.filter((x) => /glm-4\.7-flash|gpt-oss-120b/.test(x));
      const rest = ids.filter((x) => !/glm-4\.7-flash|gpt-oss-120b/.test(x));
      list = [...star, ...rest].map((id) => ({ id, ctx: knownCtx(id), free: true }));
    }
  } catch (e) { await logErr(env, 'models_cf', e); }
  if (!list) list = CF_KNOWN.map((m) => ({ id: m.id, ctx: m.ctx, free: true }));
  await kvPut(env, 'mc', { t: Date.now(), list }, 1800);
  return list;
}

/* ═══════════════════ موتور هوش مصنوعی (استریم + ریترای + فالبک) ═══════════════════ */

// ساخت پرامپت سیستمی نهایی بر اساس تنظیمات و شخصیت
function buildSystemPrompt(env, settings) {
  const PA = pick(env, PERSONAS, PERSONAS_EN);
  const p = PA[settings.persona] || PA[0];
  let sys = pick(env, CORE_SYSTEM_PROMPT, CORE_SYSTEM_PROMPT_EN) + '\n\n' + p.sys;
  if (settings.sysCustom && settings.sysCustom.trim()) {
    sys += L(env, 'm1vcg84s', settings.sysCustom.trim().slice(0, CFG.SYS_CUSTOM_MAX));
  }
  return sys + pick(env, FORMAT_RULES, FORMAT_RULES_EN);
}

// تبدیل خطای خام Workers AI به پیام فارسی مفهوم
async function aiErrorText(env, e, model) {
  const raw = String((e && (e.message || e)) || e || '?');
  if (/binding/i.test(raw))
    return L(env, 'm05capdd');
  if (/5016|submit the prompt/i.test(raw))
    return L(env, 'm0yh8z4o');
  if (/model (not found|does not exist|is not found)|no such model|404/i.test(raw))
    return L(env, 'm0ijnyp9');
  if (/limit|429|rate|quota|exceed|neuron/i.test(raw))
    return L(env, 'm1pw5tdo');
  if (/context|maximum|too long|too many tokens/i.test(raw))
    return L(env, 'm19dgteb');
  if (/timeout|abort|timed? out/i.test(raw))
    return L(env, 'm0k7yabp');
  await logErr(env, 'ai_cf:' + model, e instanceof Error ? e : new Error(raw));
  return L(env, 'm0geupfq', esc(raw.slice(0, 150)));
}

// فراخوانی مدل با binding کلادفلر (env.AI.run)؛ onDelta(text_so_far) برای ویرایش زنده.
// خروجی: { text, usage:{prompt_tokens, completion_tokens} } یا throw {status, code, message}
async function aiChatCf(env, model, messages, opts = {}, onDelta = null) {
  if (!env.AI) throw { status: 0, code: 'binding', message: await aiErrorText(env, new Error(L(env, 'm0b4m9n9')), model) };

  const base = {
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.maxTokens ?? 2048,
    stream: !!onDelta,
    ...(opts.extra || {}),
  };
  // پیام عکس دارد؟ → قالب ویژن Workers AI (content رشته‌ای + image آرایه‌ای)
  const input = messages.some((m) => Array.isArray(m.content))
    ? { messages: cfVisionMessages(messages), ...base }
    : { messages, ...base };

  // تا ۳ تلاش برای خطاهای موقتی
  for (let attempt = 1; attempt <= CFG.RETRY_MAX; attempt++) {
    let res;
    try {
      res = await env.AI.run(model, input);
    } catch (e) {
      const raw = String((e && (e.message || e)) || e);
      // دروازهٔ مجوز لاما (خطای ۵۰۱۶): اولین استفاده باید پرامپت «agree» بگیرد —
      // ربات خودکار میپذیرد و همان درخواست را دوباره میفرستد
      if (/5016|submit the prompt/i.test(raw)) {
        try { await env.AI.run(model, { prompt: 'agree', max_tokens: 1 }); } catch {}
        try { res = await env.AI.run(model, input); }
        catch (e2) { throw { status: 0, code: 'ai', message: await aiErrorText(env, e2, model) }; }
      } else if (/503|504|529|overload|busy|temporar/i.test(raw) && attempt < 3) {
        await sleep(CFG.RETRY_BASE_MS * attempt);
        continue;
      } else {
        throw { status: 0, code: 'ai', message: await aiErrorText(env, e, model) };
      }
    }

    if (!onDelta) {
      return {
        text: (res && res.response) || '',
        usage: (res && res.usage) || {},
      };
    }

    /* ── حالت استریم: خواندن SSE با فیلد response ── */
    let acc = '';
    let lastEdit = Date.now();
    let usage = {};
    try {
      const rd = res.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await rd.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const js = JSON.parse(payload);
            if (js.response) {
              acc += js.response;
              if (Date.now() - lastEdit > CFG.STREAM_EDIT_MS && acc.length > CFG.STREAM_EDIT_MIN) {
                lastEdit = Date.now();
                try { await onDelta(acc); } catch {} // ویرایش زنده؛ خطایش مهم نیست
              }
            }
            if (js.usage) usage = js.usage;
          } catch {}
        }
      }
    } catch (e) {
      if (!acc) throw { status: 0, code: 'stream', message: L(env, 'm0t8bfm5') };
      // اگر بخشی آمده بود، همان کافی است
    }
    if (!acc.trim()) throw { status: 0, code: 'empty', message: L(env, 'm1trjnig') };
    return { text: acc, usage };
  }
  throw { status: 0, code: 'retries', message: L(env, 'm0bo17ie') };
}

/* ── حات‌کننده: کلید canonical را میخواند و به موتور مناسب میفرستد ── */
async function aiChat(env, model, messages, opts = {}, onDelta = null) {
  if (parseModelKey(model).prov !== 'p') return aiChatCf(env, model, messages, opts, onDelta);
  const e = await resolveModel(env, model);
  if (e.prov !== 'p') return aiChatCf(env, e.key, messages, opts, onDelta); // سرویس/مدل حذف شده ← پیش‌فرض کلادفلر
  return aiChatOpenAi(env, e, messages, opts, onDelta);
}

/* ── موتور OpenAI-compatible: POST {base}/chat/completions با Bearer ──
   اگر آدرس پایه /v1 لازم داشته باشد و کاربر نزده باشد، خودکار امتحان و
   ذخیره میشود. فقط پیام‌های فارسی از پیش نوشته‌شده throw میشوند؛ کلید
   API هرگز به چت یا لاگ نمیرود (scrubSecret روی همه مسیرها). */
async function aiChatOpenAi(env, e, messages, opts, onDelta) {
  const bases = [e.baseUrl];
  if (!/\/v1$/.test(e.baseUrl)) bases.push(e.baseUrl + '/v1');
  const pName = esc(e.provName);
  const maxTry = opts.quick ? 1 : CFG.RETRY_MAX;
  /* circuit breaker: سرویس خراب موقتاً کنار گذاشته میشود تا هر پیام
     معطل تست‌های تکراری نشود؛ خودکار بعد از CB_OPEN_MS برمیگردد. */
  if (!opts.noBreaker && cbBlocked(e.pid)) {
    throw { status: 0, code: 'breaker', message: L(env, 'm0cd8thb', pName) };
  }

  for (let bi = 0; bi < bases.length; bi++) {
    const url = bases[bi].replace(/\/+$/, '') + '/chat/completions';
    const body = {
      model: e.id, messages,
      temperature: opts.temperature ?? 0.8,
      max_tokens: opts.maxTokens ?? 2048,
      stream: !!onDelta,
      ...(opts.extra || {}),
    };
    if (onDelta) body.stream_options = { include_usage: true };
    const hdr = {
      'Content-Type': 'application/json',
      Accept: onDelta ? 'text/event-stream' : 'application/json',
      Authorization: 'Bearer ' + e.apiKey,
    };

    for (let attempt = 1; attempt <= maxTry; attempt++) {
      let res;
      try {
        res = await fetchT(url, { method: 'POST', headers: hdr, body: J(body) }, CFG.PROV_TIMEOUT_MS);
      } catch (er) {
        if (attempt < maxTry) { await sleep(CFG.RETRY_BASE_MS * attempt); continue; }
        await logErr(env, 'ai_p:' + e.pid, new Error(scrubSecret('net: ' + ((er && er.message) || er), e.apiKey)));
        cbFail(e.pid, false);
        throw { status: 0, code: 'net', message: L(env, 'm0xbyneb', pName) };
      }

      if (res.status === 401 || res.status === 403) {
        await logErr(env, 'ai_p:' + e.pid, new Error('auth http=' + res.status));
        cbFail(e.pid, true);
        throw { status: res.status, code: 'auth', message: L(env, 'm1m6a063', pName) };
      }
      if (res.status === 404) {
        if (bi < bases.length - 1) break; // پایگاه بعدی (مثلاً +/v1) را امتحان کن
        throw { status: 404, code: 'nomodel', message: L(env, 'm0hoqsmy', pName) };
      }
      if (res.status === 429) {
        if (attempt === 1) { await sleep(2500); continue; } // یک تلاش مجدد — سقف نرخ گاهی لحظه‌ای است
        throw { status: 429, code: 'rate', message: L(env, 'm1hzo9wt', pName) };
      }
      if (res.status >= 500) {
        if (attempt < maxTry) { await sleep(CFG.RETRY_BASE_MS * attempt); continue; }
        await logErr(env, 'ai_p:' + e.pid, new Error('upstream http=' + res.status));
        throw { status: res.status, code: 'upstream', message: L(env, 'm0pzr5p7', pName, res.status) };
      }
      if (!res.ok) {
        const raw = scrubSecret((await res.text().catch(() => '')) || '', e.apiKey);
        await logErr(env, 'ai_p:' + e.pid, new Error('http ' + res.status + ' body=' + raw));
        if (res.status === 400 && body.stream_options && /stream_options/i.test(raw)) {
          delete body.stream_options; // سرورهای سخت‌گیر این فیلد را رد میکنند
          attempt--;
          continue;
        }
        if (/context|maximum|too long|too many tokens/i.test(raw)) {
          throw { status: res.status, code: 'context', message: L(env, 'm0ywwp7s', pName) };
        }
        throw { status: res.status, code: 'http', message: L(env, 'm0zcl66u', pName, res.status) };
      }

      /* پاسخ موفق — برنده را اگر حدس /v1 بود ذخیره کن */
      cbOk(e.pid);
      const saveWinner = async () => {
        if (bi > 0) {
          const rec = await provGet(env, e.pid);
          if (rec) { rec.base = bases[bi]; await provPut(env, rec); }
        }
      };
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (onDelta && ct.includes('event-stream')) {
        const out = await sseCollectOm(env, res, e, onDelta);
        await saveWinner();
        return out;
      }
      // JSON (یا سروری که stream=true را نادیده گرفته)
      let js;
      try { js = JSON.parse((await res.text()).slice(0, CFG.JSON_RESP_CAP)); } catch {
        throw { status: 0, code: 'badresp', message: L(env, 'm0wzvs2h', pName, res.status) };
      }
      const choice = (js.choices || [])[0] || {};
      const txt = (choice.message && choice.message.content) || choice.text || '';
      if (!String(txt).trim()) throw { status: 0, code: 'empty', message: L(env, 'm1trjnig') };
      if (onDelta) { try { await onDelta(String(txt)); } catch {} }
      await saveWinner();
      return { text: String(txt), usage: normUsage(js.usage) };
    }
  }
  throw { status: 0, code: 'retries', message: L(env, 'm0oilrtb', pName) };
}

/* ── خوانش SSE استاندارد OpenAI (delta.content) با همان آهنگ نسخه CF ── */
async function sseCollectOm(env, res, e, onDelta) {
  let acc = '';
  let usage = {};
  let lastEdit = Date.now();
  try {
    const rd = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (acc.length <= CFG.STREAM_CAP) {
      const { done, value } = await rd.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith('data:')) continue; // کامنت‌های SSE (:) و فیلدهای دیگر رد میشوند
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') { buf = ''; break; }
        try {
          const js = JSON.parse(payload);
          const d = ((js.choices || [])[0] || {}).delta || {};
          if (typeof d.content === 'string' && d.content) {
            acc += d.content;
            if (Date.now() - lastEdit > CFG.STREAM_EDIT_MS && acc.length > CFG.STREAM_EDIT_MIN) {
              lastEdit = Date.now();
              try { await onDelta(acc); } catch {} // ویرایش زنده؛ خطایش مهم نیست
            }
          }
          if (js.usage) usage = normUsage(js.usage);
        } catch {}
      }
    }
  } catch (er) {
    await logErr(env, 'ai_p:' + (e && e.pid), new Error(scrubSecret('stream: ' + ((er && er.message) || er), e && e.apiKey)));
    if (!acc) throw { status: 0, code: 'stream', message: L(env, 'm0t8bfm5') };
    // اگر بخشی آمده بود، همان کافی است
  }
  if (!acc.trim()) throw { status: 0, code: 'empty', message: L(env, 'm1trjnig') };
  return { text: acc, usage };
}

/* ═══════════════════ مدیریت کانتکست و تاریخچه ═══════════════════ */
// کلید تاریخچه: h:<scope>   |   scope برای چت خصوصی «c<chatId>:<threadId>»

async function histGet(env, scope) {
  return await kvGet(env, 'h:' + scope, { msgs: [], used: 0 });
}
async function histPut(env, scope, h) {
  // نگه‌داشتن حداکثر ۶۰ پیام اخیر (کانتکست واقعی پایین‌تر هم بریده میشود)
  if (h.msgs.length > CFG.HIST_MAX_MSGS) h.msgs = h.msgs.slice(-CFG.HIST_MAX_MSGS);
  // سقف هر سطر D1 دو مگابایت است؛ اگر تاریخچه به آن نزدیک شد، قدیمیترها حذف میشوند
  while (h.msgs.length > 1 && J(h).length > CFG.HIST_MAX_BYTES) h.msgs.shift();
  await kvPut(env, 'h:' + scope, h);
}

// بریدن هوشمند: اگر مجموع تخمین از سقف گذشت، قدیمی‌ها حذف میشوند؛
// شروعِ نگه‌داشت همیشه روی پیام «user» است تا جفت‌های گفتگو سالم بمانند
/* 🔎 جستجوی متنی در تاریخچهٔ همهٔ گفتگوهای کاربر (/find).
   عمداً بدون مدل: رشته‌یابی ساده است چون مدل برای یافتن یک جملهٔ
   قدیمی هم کند است هم توکن می‌سوزاند.
   چه چیزهایی جستجو میشود:
     • همهٔ تردهای خصوصی کاربر (u.threads) — کلیدهای h:c<uid>:<tid>
     • همین گفتگوی جاری (scope) که گروهی باشد h:g<chatId>
   سایر گروه‌ها عمداً جستجو نمیشوند: کلید گروه بین همهٔ اعضا مشترک است
   و نباید پیام کسی را به کاربر دیگر نشان دهد. */
async function histFind(env, uid, scope, query) {
  const q = String(query || '').trim().slice(0, CFG.FIND_MAX);
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').toLowerCase();
  const nq = norm(q);
  if (nq.length < CFG.FIND_MIN) return { error: L(env, 'm0docj9h', num(CFG.FIND_MIN)) };

  const scopes = [];
  const u = await getUser(env, uid);
  for (const t of (u.threads || [])) if (t && t.id) scopes.push('c' + uid + ':' + t.id);
  if (scope && scopes.indexOf(scope) < 0) scopes.push(scope);

  const hits = [];
  for (const sc of scopes) {
    const h = await histGet(env, sc);
    if (!h || !h.msgs || !h.msgs.length) continue;
    const th = (u.threads || []).find((x) => 'c' + uid + ':' + x.id === sc);
    const thName = th ? th.name : (sc.charAt(0) === 'g' ? L(env, 'm1krzef8') : sc);
    for (let i = 0; i < h.msgs.length; i++) {
      const m = h.msgs[i];
      const txt = msgText(m.content || m.text || '');
      const at = norm(txt).indexOf(nq);
      if (at < 0) continue;
      /* برش دور محل تطبیق؛ همیشه از ابتدای رشته کم میکنیم نه از وسط */
      const pad = 40, from = Math.max(0, Math.min(at, txt.length) - pad);
      const role = m.role === 'user' ? L(env, 'm0y549rx') : L(env, 'm0rmapm3');
      hits.push({
        thread: String(thName || '').slice(0, 40),
        role,
        snip: (from > 0 ? '…' : '') + String(txt).slice(from, from + CFG.FIND_SNIP) +
          (from + CFG.FIND_SNIP < txt.length ? '…' : ''),
      });
      if (hits.length >= CFG.FIND_N) break;
    }
    if (hits.length >= CFG.FIND_N) break;
  }
  return { hits, total: hits.length, q };
}

/* 🖼 ذخیرهٔ تصویر تولیدشده در گالری — هر تصویر کلید جدا دارد تا سطر D1
   (سقف ~۲ مگابایت) سبک بماند؛ ایندکس فقط متن و معرف.
   عمداً بی‌صدا است: شکست اینجا نباید جلوی رسیدن عکس به کاربر را بگیرد. */
async function imgGallerySave(env, uid, img) {
  try {
    if (!img || !img.b64 || !img.mime) return;
    /* سقف سطر D1: اگر تصویر بزرگ باشد اصلاً ذخیره نمیکنیم تا سطر بشکند */
    if (img.b64.length > 1500000) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const ttl = CFG.IMG_STORE_TTL_S;
    await kvPut(env, 'ig:' + uid + ':' + id, { b64: img.b64, mime: img.mime, prompt: String(img.prompt || '').slice(0, 200) }, ttl);
    const idx = await kvGet(env, 'igs:' + uid, []);
    const list = Array.isArray(idx) ? idx : [];
    list.push({ id, prompt: String(img.prompt || '').slice(0, 120), ts: Date.now() });
    while (list.length > CFG.IMG_STORE_N) {
      const drop = list.shift();
      if (drop && drop.id) await kvDel(env, 'ig:' + uid + ':' + drop.id);
    }
    await kvPut(env, 'igs:' + uid, list, ttl);
  } catch (e) { await logErr(env, 'img_gallery', e); }
}

/* خواندن یک تصویر از گالری — اگر منقضی/حذف شده باشد null */
async function imgGalleryGet(env, uid, id) {
  if (!/^[a-z0-9]{6,20}$/.test(String(id || ''))) return null;
  return await kvGet(env, 'ig:' + uid + ':' + id, null);
}
async function imgGalleryList(env, uid) {
  const idx = await kvGet(env, 'igs:' + uid, []);
  return Array.isArray(idx) ? idx.slice(-CFG.IMG_STORE_N).reverse() : [];
}

function trimContext(sysPrompt, msgs, ctxLimit) {
  const budget = Math.floor(ctxLimit * CFG.CTX_RATIO);
  let total = est(sysPrompt);
  // از جدیدترین پیام به عقب جمع میکنیم تا سقف بودجه — هرچه جا نشد حذف می‌شود و
  // اگر همه جا شد همه می‌مانند (حالت نرمال). «from = msgs.length» یعنی حتی
  // جدیدترین پیام هم جا نشد → کانتکست خالی.
  let from = msgs.length;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const tk = est(msgs[i].content);
    if (total + tk > budget) break;
    total += tk;
    from = i;
  }
  while (from < msgs.length && msgs[from].role !== 'user') from++;
  return from >= msgs.length ? [] : msgs.slice(from);
}

async function buildMessages(env, settings, scope, userContent, extraSys = null, ctxLimit = null, uidForMem = null) {
  let memBlock = '';
  try {
    if (uidForMem) {
      /* تزریق هوشمند: اگر متن کاربر به خاطره‌ای مربوط باشد فقط همان‌ها می‌آیند
         (کمتر توکن، دقت بیشتر). اگر هیچ‌کدام مرتبط نبود، برای حفظ رفتار
         قبلی همهٔ حافظه می‌آید — مگر اینکه کاربر «حافظهٔ خودکار» را خاموش
         کرده باشد. */
      const rel = await memRelevant(env, uidForMem, userContent || '');
      let mt = '';
      if (rel.length) {
        mt = rel.map((x) => '- ' + (x.tag ? '[' + x.tag + '] ' : '') + x.t).join('\n');
      } else if (!settings || settings.memAuto !== false) {
        mt = await memText(env, uidForMem);
      }
      if (mt) memBlock = L(env, 'm0014jqj', mt);
    }
  } catch {}
  const sys = (extraSys ? extraSys + '\n\n' : '') + memBlock + buildSystemPrompt(env, settings);
  const h = await histGet(env, scope);
  const msgs = [{ role: 'system', content: sys }, ...trimContext(sys, h.msgs, ctxLimit || knownCtx(settings.model))];
  if (userContent !== null) msgs.push({ role: 'user', content: userContent });
  return { msgs, h };
}
