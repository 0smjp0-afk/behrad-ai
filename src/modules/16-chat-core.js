/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 16-chat-core
   اجرای چت کامل — هستهٔ ربات 💬
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ اجرای چت کامل (هسته ربات) ═══════════════════ */
// خروجی پاسخ + ذخیره تاریخچه + آمار؛ برای چت عادی، مقایسه و regenerate استفاده میشود
async function runChatReply(env, budget, chatId, uid, scope, settings, userText, opts = {}) {
  const tMsg = Date.now(); // v4.10: شروع زمان پاسخ‌دهی (از لحظهٔ دریافت پیام)
  const typing = startTyping(env, chatId);
  let ph = null;
  try {
    ph = await sendMsg(env, budget, chatId, L(env, 'm1atr754', EMOJI.think));
  } catch {}

  const setStatus = async (html) => {
    if (ph) { try { await editMsg(env, budget, chatId, ph.message_id, html); } catch {} }
  };

  try {
    /* پیوستن محتوای وب و فایل */
    let content = userText;
    const linkPart = await maybeAttachLinks(env, settings, userText, setStatus);
    if (linkPart) content += linkPart;
    if (opts.filePart) content += (linkPart ? '' : '\n\n') + opts.filePart;
    try {
      const toolPart = await runPreTools(env, settings, userText, setStatus);
      if (toolPart) content += toolPart;
    } catch (e) { await logErr(env, 'pretools', e); }
    const photos = opts.photos || [];

    /* حالت مقایسه دو مدل */
    const cp = !opts.noCompare ? await kvGet(env, 'cp:' + uid, null) : null;
    if (cp && cp.on) {
      const [ea, eb] = await upgradeCpPair(env, uid, cp);
      const { msgs } = await buildMessages(env, settings, scope, null, opts.extraSys, Math.min(ea.ctx, eb.ctx), uid);
      const mkMsgs = (sys) => [{ role: 'system', content: sys }, ...msgs.slice(1), { role: 'user', content: uContent }];
      const uContent = photos.length ? imgContent(env, userText, photos) : content;
      await setStatus(L(env, 'm0ylbfz3'));
      const cmp = (ent, tag) => (photos.length && !hasVision(ent))
        ? Promise.resolve({ err: { message: L(env, 'm1hbrg4g', tag) } })
        : aiChat(env, ent.key, mkMsgs(buildSystemPrompt(env, settings)), { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) });
      const [resA, resB] = await Promise.all([
        cmp(ea, L(env, 'm12tkrii')).catch((e) => ({ err: e })),
        cmp(eb, L(env, 'm0fh2tgl')).catch((e) => ({ err: e })),
      ]);
      const fmt = (tag, ent, r) => {
        if (r.err) return tag + ' <b>' + esc(ent.name) + ' · ' + esc(ent.provName) + '</b>\n❌ ' + esc(r.err.message || L(env, 'm0opv2xb'));
        return tag + ' <b>' + esc(ent.name) + ' · ' + esc(ent.provName) + '</b>\n' + mdToHtml(r.text);
      };
      const body = fmt('🅰️', ea, resA) + '\n\n───────────\n\n' + fmt('🅱️', eb, resB);
      if (photos.length) {
        await sendMsg(env, budget, chatId, L(env, 'm09qlg2a', num(photos.length)));
      }
      const parts = chunkText(body);
      await editMsg(env, budget, chatId, ph.message_id, parts[0], [
        [{ text: L(env, 'm147xw31'), callback_data: 'cmpoff' }],
      ]);
      for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
      if (resA.text && resB.text) {
        const h = await histGet(env, scope);
        h.msgs.push({ role: 'user', content });
        h.msgs.push({ role: 'assistant', content: L(env, 'm1hlllrf', resA.text.slice(0, 1500)) });
        await histPut(env, scope, h);
      }
      await bumpUsage(env, uid, est(content) * 2, ((resA.usage && resA.usage.completion_tokens) || est(resA.text)) + ((resB.usage && resB.usage.completion_tokens) || est(resB.text)));
      return;
    }

    /* چت عادی */
    const lim = await checkDailyLimit(env, uid, settings);
    if (lim) { await setStatus(EMOJI.err + ' ' + lim); return; }

    let entry = await resolveModel(env, settings.model);
    let visionNote = ''; // اگر مدل نهایی عوض شد، در فوتر توضیح داده می‌شود
    if (photos.length && !hasVision(entry)) {
      if (!settings.autoVision) {
        await setStatus(L(env, 'm0w9mkno'));
        return;
      }
      const ve = await pickVisionModel(env, settings.model);
      if (!ve || ve.key === entry.key) {
        await setStatus(L(env, 'm131yarz'));
        return;
      }
      visionNote = L(env, 'm0xly8zo', ve.name);
      entry = ve;
    }
    const uContent = photos.length ? imgContent(env, content, photos) : content;
    const { msgs } = await buildMessages(env, settings, scope, null, opts.extraSys, entry.ctx, uid);
    msgs.push({ role: 'user', content: uContent });

    let finalText = '';
    let usage = {};
    const tModel0 = Date.now(); // زمان‌سنجی دقیق مدل (v4.10): از شروع فراخوانی تا پایان
    const useStream = settings.liveStream;
    const r = await aiChat(env, entry.key, msgs,
      { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) },
      useStream
        ? async (acc) => {
            const t = mdToHtml(acc.slice(-3800));
            try { await editMsg(env, budget, chatId, ph.message_id, t + ' ✍️'); } catch {}
          }
        : null
    ).catch(async (e) => {
      /* فالبک خودکار به مدل مطمئن دیگر — همیشه داخل استخر رایگان کلادفلر */
      if (!settings.autoFallback) throw e;
      if (/binding/i.test(String(e.message || ''))) throw e;
      // این خطاها با عوض‌کردن مدل کلادفلر درست نمیشوند (net نه — سرویس قطع باشد فالبک مفید است)
      if (e.code === 'context' || e.code === 'auth' || e.code === 'nomodel') throw e;
      const alt = entry.prov !== 'p'
        ? (CF_FALLBACK_MODEL !== settings.model ? CF_FALLBACK_MODEL : (((await getModels(env)).find((m) => m.id !== settings.model) || {}).id || null))
        : CF_FALLBACK_MODEL; // سرویس کاستوم → فقط به lane رایگان کلادفلر، نه به یک سرویس پولی دیگر
      if (!alt) throw e;
      await setStatus(L(env, 'm0hvve17', esc(e.message || L(env, 'm0opv2xb')), esc(modelName(env, alt))));
      const r2 = await aiChat(env, alt,
        [{ role: 'system', content: buildSystemPrompt(env, settings) }, ...msgs.slice(1)],
        { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) });
      r2._alt = alt;
      return r2;
    });

    finalText = r.text;
    usage = r.usage || {};

    /* ذخیره تاریخچه */
    // تاریخچه: متن + نشانهٔ عکس (خود عکس ذخیره نمی‌شود)
    const h = await histGet(env, scope);
    const noteParts = [];
    if (photos.length) noteParts.push(L(env, 'm0hwj8vq', num(photos.length)));
    h.msgs.push({ role: 'user', content: [userText, ...noteParts].filter(Boolean).join(' ') });
    h.msgs.push({ role: 'assistant', content: finalText });
    await histPut(env, scope, h);
    try { await maybeExtractMemory(env, uid, scope, settings); } catch {}

    /* نمایش نهایی */
    const shownModel = r._alt || entry.key;
    /* فوتر آماری (v4.10): مدل · سرویس · زمان پاسخ‌دهی · توکن.
       «مدت پاسخ» = از لحظهٔ ارسال پیام تا آماده شدن جواب — شامل زمان فکر مدل،
       خواندن لینک/ابزارها و هر فالبک خودکار. */
    const respMs = Date.now() - tMsg;
    const respSec = (respMs / 1000).toFixed(respMs < 10000 ? 1 : 0);
    const foot = L(env, 'm0306yaz', esc(await entryLabel(env, shownModel)), esc(visionNote), num(respSec), usage.completion_tokens ? ' · ' + num(usage.completion_tokens) + L(env, 'm1rriwiu') : '');
    const kb = [
      [
        { text: L(env, 'm1ivrg4n'), callback_data: 'regen' },
        { text: L(env, 'm04607zy'), callback_data: 'save' },
      ],
      [
        { text: L(env, 'm1rq6ppp'), callback_data: 'threset' },
        { text: L(env, 'm0giln1r'), callback_data: 'set' },
      ],
    ];
    /* دکمه‌ی «تلاش مجدد rt:» حذف شد: هیچ‌جا payloadHash تولید نمی‌شد یعنی دکمه
       هرگز ساخته نمیشد، ولی اگر ساخته میشد هیچ هندلری برایش نبود و تلگرام
       فقط «؟» برمی‌گرداند. برای تکرار همان «♻️ تولید مجدد» (regen) کافی است. */

    const parts = chunkText(mdToHtml(finalText) + foot);
    /* دکمه‌های ناوبری روی پیام چت هم هست — متن + کلید همان لحظه در پشته ثبت
       میشود تا «🔙 بازگشت» از یک منو بتواند دقیقاً همین پیام را بازگرداند. */
    const chatKb = kb.concat([navBar(env, chatId, 'chat')]);
    navPush(chatId, { s: 'chat', txt: parts[0], kb: chatKb });
    await editMsg(env, budget, chatId, ph.message_id, parts[0], chatKb);
    for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i], i === parts.length - 1 ? chatKb : null);

    await bumpUsage(env, uid, usage.prompt_tokens || (est(content) + photos.length * CFG.VISION_TOK_EST), usage.completion_tokens || est(finalText));
    if (opts.fromVoice && settings.voiceReply && finalText) {
      try { await sendVoiceReply(env, budget, chatId, finalText, settings); } catch {}
    }
  } catch (e) {
    const msg = (e && e.message) || L(env, 'm1nnd31k');
    const kb = [[{ text: L(env, 'm0yxhz1s'), callback_data: 'threset' }]];
    if (ph) {
      try { await editMsg(env, budget, chatId, ph.message_id, L(env, 'm0h5v7yd', EMOJI.err, esc(msg)), kb); } catch {}
    } else {
      try { await sendMsg(env, budget, chatId, L(env, 'm0h5v7yd', EMOJI.err, esc(msg)), kb); } catch {}
    }
  } finally {
    typing.stop = true;
  }
}

// ── CRUD سرویس‌ها ──
// افزودن مدل‌ها به‌صورت اجتماع: ورودی‌های موجود (دستی یا کاوش‌شده) هرگز
// تغییر/حذف نمیشوند؛ فقط شناسه‌های جدید اضافه میشوند. (max 50 مدل)
async function mergeModels(env, rec, items) {
  const have = new Set((rec.models || []).map((m) => m.id));
  let added = 0;
  if (!Array.isArray(rec.models)) rec.models = [];
  for (const it of items) {
    const id = String(it.id || '').trim();
    if (!id || have.has(id) || rec.models.length >= CFG.MAX_MODELS_PER_PROVIDER) continue;
    // پرچم عکسفهم: مقدار صریح، وگرنه حدس از آیدی (با 👁 در صفحه سرویس قابل تغییر)
    const vis = it.vision !== undefined ? !!it.vision : VISION_RE.test(id);
    rec.models.push({ id, ctx: it.ctx || null, name: it.name || '', src: it.src || 'disc', ts: Date.now(), vision: vis });
    have.add(id);
    added++;
    await kvPut(env, 'mh:' + hash32(rec.pid + ':' + id), rec.pid + ':' + id, CFG.HASH_TTL);
  }
  if (added) await provPut(env, rec);
  return added;
}
async function removeModel(env, rec, modelId) {
  rec.models = (rec.models || []).filter((m) => m.id !== modelId);
  await kvDel(env, 'mh:' + hash32(rec.pid + ':' + modelId));
  await provPut(env, rec);
}
// حذف سرویس + جاروب کاربران/مقایسه‌ها (علاوه بر فالبک تنبل در getUser)
async function deleteProvider(env, pid) {
  const rec = await provGet(env, pid);
  if (!rec) return 0;
  for (const m of rec.models || []) await kvDel(env, 'mh:' + hash32(pid + ':' + m.id));
  const draft = await kvGet(env, 'pvr:' + pid, null); // نگاشت‌های پیش‌نویس کاوش هم پاک شوند
  if (draft) for (const it of draft.items || []) { const id = it.id || it; await kvDel(env, 'mh:' + hash32(pid + ':' + id)); }
  await kvDel(env, 'pvr:' + pid);
  await kvDel(env, 'pv:' + pid);
  _pv.delete(pid);
  let fixed = 0;
  for (const k of await kvList(env, 'u:')) {
    const v = await kvGet(env, k, null);
    if (v && v.st && CK_RE.test(String(v.st.model || '')) && String(v.st.model).slice(0, 9) === pid) {
      v.st.model = SETTINGS_DEFAULT.model;
      delete v.st.provider;
      await kvPut(env, k, v);
      fixed++;
    }
  }
  for (const k of await kvList(env, 'cp:')) {
    const v = await kvGet(env, k, null);
    if (v && Array.isArray(v.pair)) {
      let dirty = false;
      v.pair = v.pair.map((s, i) => {
        if (String(s || '').startsWith(pid + ':')) { dirty = true; return (CF_KNOWN[i] || CF_KNOWN[0]).id; }
        return s;
      });
      if (dirty) await kvPut(env, k, v);
    }
  }
  return fixed;
}

// کاوش مدل‌ها: GET {base}/models روی [base, base+'/v1'] — پاسخ قالب آزاد
// (آرایه خالص | .data | .models | .result) و ctx از فیلدهای رایج گرفته میشود
async function discoverModels(env, base, key) {
  const bases = [base];
  if (!/\/v1$/.test(base)) bases.push(base + '/v1');
  let lastCode = 'net';
  for (const b of bases) {
    let res;
    try {
      res = await fetchT(b.replace(/\/+$/, '') + '/models', { headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' } }, CFG.DISCO_TIMEOUT_MS);
    } catch (e) {
      lastCode = 'net';
      await logErr(env, 'prov_disco', new Error(scrubSecret(String((e && e.message) || e), key)));
      continue;
    }
    if (res.status === 401 || res.status === 403) return { ok: false, code: 'auth' };
    if (!res.ok) { lastCode = res.status === 404 ? 'notfound' : 'http'; continue; }
    let js;
    try { js = JSON.parse((await res.text()).slice(0, 1000000)); } catch { lastCode = 'badjson'; continue; }
    const arr = Array.isArray(js) ? js : ((js && (js.data || js.models || js.result)) || []);
    const items = [];
    const seen = new Set();
    for (const o of arr) {
      const id = String(typeof o === 'string' ? o : ((o && (o.id || o.model || o.name)) || '')).trim();
      if (!id || id.length > CFG.MODEL_ID_MAX || !/^[ -~]+$/.test(id) || seen.has(id)) continue;
      seen.add(id);
      const ctx = Number((o && (o.context_length || o.max_model_len || o.max_context_length || o.supported_total_tokens)) || 0) || null;
      items.push({ id, ctx });
      if (items.length >= CFG.DISCOVER_CAP) break;
    }
    if (!items.length) { lastCode = 'empty'; continue; }
    return { ok: true, base: b, items };
  }
  return { ok: false, code: lastCode };
}
const DISCO_FAIL_TEXT = {
  auth: 'کلید API رد شد (کلید را اصلاح کن)', notfound: 'مسیر /models وجود ندارد', net: 'ارتباط برقرار نشد',
  http: 'سرور خطا داد', badjson: 'پاسخ نامفهوم بود', empty: 'هیچ مدلی گزارش نشد',
};

/* EN */
const DISCO_FAIL_TEXT_EN = {
  auth: 'API key rejected (fix the key)', notfound: 'No /models endpoint', net: 'Could not connect',
  http: 'Server returned an error', badjson: 'Unreadable response', empty: 'No models reported',
};
